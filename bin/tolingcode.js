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
  .description(chalk.hex('#0de900')('TolingCode CLI - 鲸汇跨境电商 AI 助手技能管理工具'))
  .version(pkg.version, '-v, --version', chalk.hex('#FFFFFF')('显示版本号'))
  .addHelpText('after', `
${chalk.hex('#0de900').bold('快速开始:')}
  ${chalk.hex('#ff6319')('# 安装 OpenClaw')}
  ${chalk.hex('#0de900')('$ tolingcode install openclaw')}                  ${chalk.white('# 安装/更新 OpenClaw')}
  ${chalk.hex('#0de900')('$ tolingcode install openclaw -v 2026.3.7')}      ${chalk.white('# 安装指定版本')}
  
  ${chalk.hex('#ff6319')('# 安装技能')}
  ${chalk.hex('#0de900')('$ tolingcode install skills gigacloud-warehouse')}    ${chalk.white('# 大健云仓（跨境电商 B2B）')}
  ${chalk.hex('#0de900')('$ tolingcode install skills order-fulfillment')}      ${chalk.white('# 订单履约管理')}
  ${chalk.hex('#0de900')('$ tolingcode install skills hbj-ai-shell')}           ${chalk.white('# 远程 Linux 运维')}
  
  ${chalk.hex('#ff6319')('# 列出技能')}
  ${chalk.hex('#0de900')('$ tolingcode list skills')}
  
  ${chalk.hex('#ff6319')('# 搜索技能')}
  ${chalk.hex('#0de900')('$ tolingcode search 电商')}
  ${chalk.hex('#0de900')('$ tolingcode search gigacloud')}
  
  ${chalk.hex('#ff6319')('# 查看更多示例')}
  ${chalk.hex('#0de900')('$ tolingcode examples')}
`);

// Override help output colors - all orange
const originalHelpInformation = program.helpInformation.bind(program);
program.helpInformation = function() {
  const help = originalHelpInformation();
  return help
    .replace(/^(Options:)/gm, chalk.hex('#0de900').bold('$1'))
    .replace(/^(Commands:)/gm, chalk.hex('#0de900').bold('$1'))
    .replace(/^  (-v, --version)/gm, chalk.hex('#0de900')('$1'))
    .replace(/^  (-h, --help)/gm, chalk.hex('#0de900')('$1'))
    .replace(/^  (install)/gm, chalk.hex('#0de900')('$1'))
    .replace(/^  (list)/gm, chalk.hex('#0de900')('$1'))
    .replace(/^  (search)/gm, chalk.hex('#0de900')('$1'))
    .replace(/^  (publish)/gm, chalk.hex('#0de900')('$1'))
    .replace(/^  (examples)/gm, chalk.hex('#0de900')('$1'))
    .replace(/^  (help)/gm, chalk.hex('#0de900')('$1'));
};

/**
 * 安装/更新 OpenClaw
 */
async function installOpenClaw(name, version, force) {
  const versionStr = version === 'latest' ? 'latest' : version;
  
  console.log(chalk.blue(`\n📦 准备安装 OpenClaw@${versionStr}...\n`));
  
  // 检查当前版本
  let currentVersion = null;
  try {
    currentVersion = execSync('openclaw --version', { encoding: 'utf-8' }).trim();
    console.log(chalk.gray(`   当前版本：${currentVersion}`));
  } catch (e) {
    console.log(chalk.gray(`   当前版本：未安装`));
  }
  
  // 获取最新版本
  let latestVersion = null;
  try {
    latestVersion = execSync('npm view openclaw version', { encoding: 'utf-8' }).trim();
    console.log(chalk.gray(`   最新版本：${latestVersion}\n`));
  } catch (e) {
    // 忽略
  }
  
  // 检查是否需要更新
  if (!force && currentVersion && latestVersion && currentVersion === latestVersion) {
    console.log(chalk.green(`\n✅ 已是最新版本：${currentVersion}`));
    console.log(chalk.gray(`   如需强制重装，使用 --force 参数\n`));
    return;
  }
  
  // 开始安装
  const installVersion = version === 'latest' ? '' : `@${version}`;
  const spinner = ora(`安装 openclaw${installVersion}...`).start();
  
  try {
    execSync(`npm install -g openclaw${installVersion}`, { 
      encoding: 'utf-8', 
      stdio: 'pipe' 
    });
    
    spinner.stop();
    console.log(chalk.green('\n✅ 安装完成！\n'));
    
    // 验证安装
    const newVersion = execSync('openclaw --version', { encoding: 'utf-8' }).trim();
    console.log(chalk.green(`📦 已安装版本：${newVersion}\n`));
    
    // 检查 Gateway 状态
    console.log(chalk.gray('🔍 检查 Gateway 状态...'));
    try {
      const status = execSync('openclaw gateway status', { encoding: 'utf-8' });
      if (status.includes('Listening')) {
        console.log(chalk.green('✅ Gateway 运行正常\n'));
      } else {
        console.log(chalk.yellow('⚠️  Gateway 未运行\n'));
        console.log(chalk.gray('   启动命令：openclaw gateway start\n'));
      }
    } catch (e) {
      console.log(chalk.yellow('⚠️  Gateway 未运行\n'));
      console.log(chalk.gray('   启动命令：openclaw gateway start\n'));
    }
    
    console.log(chalk.cyan('💡 常用命令:'));
    console.log(chalk.gray('   openclaw --version     查看版本'));
    console.log(chalk.gray('   openclaw gateway start 启动 Gateway'));
    console.log(chalk.gray('   tolingcode list skills 查看可用技能\n'));
    
  } catch (e) {
    spinner.stop();
    console.log(chalk.red(`\n❌ 安装失败：${e.message}\n`));
    console.log(chalk.gray('请检查:'));
    console.log(chalk.gray('  1. 网络连接是否正常'));
    console.log(chalk.gray('  2. npm 是否已安装'));
    console.log(chalk.gray('  3. 是否有管理员权限\n'));
    process.exit(1);
  }
}

// install command - support both "install openclaw" and "install type name"
program
  .command('install <type> [name]')
  .description('安装技能、应用或 OpenClaw 本身')
  .option('-v, --version <version>', '指定版本 (默认：latest)')
  .option('-g, --global', '全局安装 (仅 apps)')
  .option('--force', '强制重新安装 (仅 openclaw)')
  .action(async (type, name, options) => {
    const version = options.version || 'latest';
    
    // 特殊处理：安装 OpenClaw 本身
    if (type === 'openclaw' || name === 'openclaw') {
      await installOpenClaw('openclaw', version, options.force || false);
      return;
    }
    
    // 需要 type 和 name
    if (!name) {
      console.log(chalk.red('\n✗ 错误：缺少参数 name'));
      console.log(chalk.gray('   用法：tolingcode install <type> <name>\n'));
      program.outputHelp();
      process.exit(1);
    }
    
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
  .description('列出可用的技能或应用 (skills | apps | all)')
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
  .description('搜索技能或应用')
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
  .description('发布技能或应用到 registry')
  .option('--type <type>', '包类型 (skills 或 apps)', 'skills')
  .option('--name <name>', '包名称')
  .option('--version <version>', '包版本号')
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

// examples command
program
  .command('examples')
  .description('显示使用示例')
  .action(() => {
    console.log(`
${chalk.bold('常用命令示例:')}

${chalk.green('1. 安装技能')}
  $ tolingcode install skills gigacloud-warehouse
  $ tolingcode install skills order-fulfillment
  $ tolingcode install skills weather -v 2026.3.8

${chalk.green('2. 列出技能')}
  $ tolingcode list skills
  $ tolingcode list apps
  $ tolingcode list

${chalk.green('3. 搜索技能')}
  $ tolingcode search 电商
  $ tolingcode search gigacloud
  $ tolingcode search order

${chalk.green('4. 发布技能')}
  $ tolingcode publish ./skills/gigacloud-warehouse --type skills --name gigacloud-warehouse --version 2026.3.8

${chalk.green('5. 查看帮助')}
  $ tolingcode --help
  $ tolingcode install --help
  $ tolingcode search --help

${chalk.green('6. 查看版本')}
  $ tolingcode -v
  $ tolingcode --version
`);
  });

program.parse();

