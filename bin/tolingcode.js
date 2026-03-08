#!/usr/bin/env node

const { Command } = require('commander');
const chalk = require('chalk');
const ora = require('ora');
const axios = require('axios');
const tar = require('tar');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const pkg = require('../package.json');

const program = new Command();
const REGISTRY_URL = process.env.TOLINGCODE_REGISTRY || 'https://toling.me/api/registry';

program
  .name('tolingcode')
  .description('TolingCode CLI - Install skills and apps from toling.me')
  .version(pkg.version);

// install command
program
  .command('install <type> <name>')
  .description('Install a skill or app')
  .option('-v, --version <version>', 'Specify version (e.g., 2026.02.26 or latest)')
  .option('-g, --global', 'Install globally (for apps)')
  .action(async (type, name, options) => {
    const version = options.version || 'latest';
    
    console.log(chalk.blue(`\n🔍 Searching for ${type}: ${name}@${version}...`));
    
    try {
      // Fetch package info from registry
      const spinner = ora('Fetching package info...').start();
      const response = await axios.get(`${REGISTRY_URL}/${type}/${name}`, {
        params: { version }
      });
      spinner.stop();
      
      const pkg = response.data;
      console.log(chalk.green(`✓ Found: ${pkg.name}@${pkg.version}`));
      console.log(chalk.gray(`  Description: ${pkg.description}`));
      console.log(chalk.gray(`  Download URL: ${pkg.downloadUrl}`));
      
      // Determine install path
      let installPath;
      if (type === 'skills') {
        const workspace = process.env.OPENCLAW_WORKSPACE || path.join(process.env.HOME || process.env.USERPROFILE, '.openclaw', 'workspace');
        installPath = path.join(workspace, 'skills');
      } else if (type === 'apps') {
        if (options.global) {
          installPath = path.join(process.env.APPDATA || path.join(process.env.HOME || '', '.local'), 'tolingcode', 'apps');
        } else {
          installPath = path.join(process.cwd(), 'tolingcode-apps');
        }
      } else {
        console.log(chalk.red(`✗ Unknown type: ${type}`));
        process.exit(1);
      }
      
      // Create directory if not exists
      if (!fs.existsSync(installPath)) {
        fs.mkdirSync(installPath, { recursive: true });
      }
      
      // Download and extract
      const downloadSpinner = ora('Downloading...').start();
      const tarballResponse = await axios.get(pkg.downloadUrl, {
        responseType: 'stream'
      });
      downloadSpinner.stop();
      console.log(chalk.green('✓ Downloaded'));
      
      const extractSpinner = ora('Installing...').start();
      
      // Create package directory
      const pkgDir = path.join(installPath, name);
      if (!fs.existsSync(pkgDir)) {
        fs.mkdirSync(pkgDir, { recursive: true });
      }
      
      await new Promise((resolve, reject) => {
        tarballResponse.data
          .pipe(tar.x({ C: pkgDir, strip: 1 }))
          .on('end', () => {
            extractSpinner.stop();
            console.log(chalk.green(`✓ Installed to: ${pkgDir}`));
            resolve();
          })
          .on('error', (err) => {
            extractSpinner.stop();
            reject(err);
          });
      });
      
      console.log(chalk.green(`\n🎉 ${name} installed successfully!`));
      
      // Show next steps
      if (type === 'skills') {
        console.log(chalk.yellow('\n💡 Next steps:'));
        console.log('   Restart OpenClaw or reload skills to use the new skill.');
      }
      
    } catch (error) {
      console.log(chalk.red(`\n✗ Error: ${error.message}`));
      if (error.response?.status === 404) {
        console.log(chalk.yellow('   Package not found. Check the name and version.'));
      }
      process.exit(1);
    }
  });

// list command - list available skills/apps
program
  .command('list [type]')
  .description('List available skills or apps')
  .action(async (type) => {
    console.log(chalk.blue('\n📦 Available packages:\n'));
    
    try {
      const targetType = type || 'all';
      const response = await axios.get(`${REGISTRY_URL}/list`, {
        params: { type: targetType }
      });
      
      const packages = response.data;
      
      // Handle case where API returns error object or non-array
      if (!Array.isArray(packages)) {
        console.log(chalk.yellow('   Registry not available yet.'));
        console.log(chalk.gray('   The toling.me registry server is not deployed.'));
        console.log(chalk.gray('   See: QUICKSTART.md for deployment instructions.'));
        return;
      }
      
      if (packages.length === 0) {
        console.log(chalk.yellow('   No packages found.'));
        return;
      }
      
      packages.forEach(pkg => {
        console.log(chalk.green(`   ${pkg.type}/${pkg.name}`));
        console.log(chalk.gray(`      v${pkg.version} - ${pkg.description}`));
        console.log(chalk.gray(`      Latest: ${pkg.latestVersion}\n`));
      });
      
    } catch (error) {
      if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
        console.log(chalk.yellow('   Cannot connect to registry.'));
        console.log(chalk.gray('   The toling.me registry server is not deployed yet.'));
        console.log(chalk.gray('   See: QUICKSTART.md for deployment instructions.'));
      } else {
        console.log(chalk.red(`✗ Error: ${error.message}`));
      }
      process.exit(1);
    }
  });

// search command
program
  .command('search <query>')
  .description('Search for skills or apps')
  .action(async (query) => {
    console.log(chalk.blue(`\n🔍 Searching for: ${query}\n`));
    
    try {
      const response = await axios.get(`${REGISTRY_URL}/search`, {
        params: { q: query }
      });
      
      const results = response.data;
      if (results.length === 0) {
        console.log(chalk.yellow('   No results found.'));
        return;
      }
      
      results.forEach(pkg => {
        console.log(chalk.green(`   ${pkg.type}/${pkg.name}`));
        console.log(chalk.gray(`      v${pkg.version} - ${pkg.description}\n`));
      });
      
    } catch (error) {
      console.log(chalk.red(`✗ Error: ${error.message}`));
      process.exit(1);
    }
  });

// publish command - for publishing skills/apps to registry
program
  .command('publish <path>')
  .description('Publish a skill or app to the registry')
  .option('--type <type>', 'Package type (skills or apps)', 'skills')
  .option('--name <name>', 'Package name')
  .option('--version <version>', 'Package version')
  .action(async (pkgPath, options) => {
    const absPath = path.resolve(pkgPath);
    
    if (!fs.existsSync(absPath)) {
      console.log(chalk.red(`✗ Path not found: ${absPath}`));
      process.exit(1);
    }
    
    console.log(chalk.blue(`\n📤 Publishing ${options.type}: ${options.name || '(auto)'}...`));
    
    // Read package.json if exists
    let pkgInfo = {};
    const pkgJsonPath = path.join(absPath, 'package.json');
    if (fs.existsSync(pkgJsonPath)) {
      pkgInfo = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf-8'));
    }
    
    const name = options.name || pkgInfo.name || path.basename(absPath);
    const version = options.version || pkgInfo.version || new Date().toISOString().split('T')[0].replace(/-/g, '.');
    
    console.log(chalk.gray(`   Name: ${name}`));
    console.log(chalk.gray(`   Version: ${version}`));
    console.log(chalk.gray(`   Type: ${options.type}`));
    
    // TODO: Implement actual publish logic
    // This would:
    // 1. Create tarball
    // 2. Upload to toling.me server
    // 3. Update registry index
    
    console.log(chalk.yellow('\n⚠️  Publish endpoint not implemented yet.'));
    console.log(chalk.gray('   You need to implement the server-side API on toling.me'));
    console.log(chalk.gray('   See: docs/PUBLISH.md for details'));
  });

program.parse();
