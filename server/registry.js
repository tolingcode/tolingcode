// TolingCode Registry Server - Simple Node.js Implementation
// Deploy this on toling.me

const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;

// Paths
const BASE_DIR = process.env.REGISTRY_BASE_DIR || path.join(__dirname, '..');
const DATA_DIR = path.join(BASE_DIR, 'registry', 'data');
const REGISTRY_FILE = path.join(DATA_DIR, 'registry.json');
const PACKAGES_DIR = path.join(BASE_DIR, 'registry', 'packages');

// Ensure directories exist
if (!fs.existsSync(PACKAGES_DIR)) {
  fs.mkdirSync(path.join(PACKAGES_DIR, 'skills'), { recursive: true });
  fs.mkdirSync(path.join(PACKAGES_DIR, 'apps'), { recursive: true });
}

// Initialize registry if not exists
if (!fs.existsSync(REGISTRY_FILE)) {
  fs.writeFileSync(REGISTRY_FILE, JSON.stringify({ skills: {}, apps: {} }, null, 2));
}

// Middleware
app.use(express.json());
app.use('/packages', express.static(PACKAGES_DIR));
const upload = multer({ dest: path.join(BASE_DIR, 'uploads') });

// Helper: Read registry
function getRegistry() {
  return JSON.parse(fs.readFileSync(REGISTRY_FILE, 'utf-8'));
}

// Helper: Write registry
function saveRegistry(data) {
  fs.writeFileSync(REGISTRY_FILE, JSON.stringify(data, null, 2));
}

// Helper: Calculate file hash
function hashFile(filePath) {
  const content = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(content).digest('hex');
}

// GET /api/registry/:type/:name - Get package info
app.get('/api/registry/:type/:name', (req, res) => {
  const { type, name } = req.params;
  const { version = 'latest' } = req.query;
  
  if (!['skills', 'apps'].includes(type)) {
    return res.status(400).json({ error: 'Invalid type. Use "skills" or "apps"' });
  }
  
  const registry = getRegistry();
  const pkg = registry[type]?.[name];
  
  if (!pkg) {
    return res.status(404).json({ error: `Package ${name} not found` });
  }
  
  const ver = version === 'latest' ? pkg.latestVersion : version;
  const verInfo = pkg.versions?.[ver];
  
  if (!verInfo) {
    return res.status(404).json({ error: `Version ${ver} not found` });
  }
  
  res.json({
    name,
    type,
    version: ver,
    description: pkg.description || '',
    downloadUrl: `http://localhost:3000/packages/${type}/${name}-${ver}.tar.gz`,
    latestVersion: pkg.latestVersion,
    versions: Object.keys(pkg.versions || {}).sort().reverse()
  });
});

// GET /api/registry/list - List all packages
app.get('/api/registry/list', (req, res) => {
  const { type = 'all' } = req.query;
  const registry = getRegistry();
  const result = [];
  
  const types = type === 'all' ? ['skills', 'apps'] : [type];
  
  types.forEach(t => {
    if (registry[t]) {
      Object.entries(registry[t]).forEach(([name, pkg]) => {
        result.push({
          name,
          type: t,
          version: pkg.latestVersion,
          description: pkg.description || '',
          latestVersion: pkg.latestVersion
        });
      });
    }
  });
  
  res.json(result);
});

// GET /api/registry/search - Search packages
app.get('/api/registry/search', (req, res) => {
  const { q } = req.query;
  if (!q) {
    return res.status(400).json({ error: 'Query parameter "q" is required' });
  }
  
  const registry = getRegistry();
  const result = [];
  const query = q.toLowerCase();
  
  ['skills', 'apps'].forEach(type => {
    if (registry[type]) {
      Object.entries(registry[type]).forEach(([name, pkg]) => {
        if (name.toLowerCase().includes(query) ||
            (pkg.description && pkg.description.toLowerCase().includes(query))) {
          result.push({
            name,
            type,
            version: pkg.latestVersion,
            description: pkg.description || ''
          });
        }
      });
    }
  });
  
  res.json(result);
});

// POST /api/registry/publish - Publish a package (requires auth)
app.post('/api/registry/publish', upload.single('package'), (req, res) => {
  // TODO: Add authentication (API key, JWT, etc.)
  const { type, name, version } = req.body;
  
  if (!type || !name || !version) {
    return res.status(400).json({ error: 'Missing required fields: type, name, version' });
  }
  
  if (!['skills', 'apps'].includes(type)) {
    return res.status(400).json({ error: 'Invalid type. Use "skills" or "apps"' });
  }
  
  if (!req.file) {
    return res.status(400).json({ error: 'No package file uploaded' });
  }
  
  const registry = getRegistry();
  
  // Initialize type if not exists
  if (!registry[type]) {
    registry[type] = {};
  }
  
  // Initialize package if not exists
  if (!registry[type][name]) {
    registry[type][name] = {
      description: req.body.description || '',
      latestVersion: version,
      versions: {}
    };
  }
  
  // Add version
  const fileHash = hashFile(req.file.path);
  registry[type][name].versions[version] = {
    publishedAt: new Date().toISOString(),
    hash: `sha256:${fileHash}`,
    size: req.file.size
  };
  
  // Update latest version
  registry[type][name].latestVersion = version;
  
  // Move file to packages directory
  const destDir = path.join(PACKAGES_DIR, type);
  const destFile = path.join(destDir, `${name}-${version}.tar.gz`);
  
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }
  
  fs.renameSync(req.file.path, destFile);
  
  // Save registry
  saveRegistry(registry);
  
  // Cleanup uploads dir
  try {
    fs.unlinkSync(req.file.path);
  } catch (e) {}
  
  res.json({
    success: true,
    name,
    type,
    version,
    downloadUrl: `https://toling.me/packages/${type}/${name}-${version}.tar.gz`
  });
});

// Serve static packages
app.use('/packages', express.static(path.join(BASE_DIR, 'packages')));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`TolingCode Registry Server running on port ${PORT}`);
  console.log(`Base directory: ${BASE_DIR}`);
});
