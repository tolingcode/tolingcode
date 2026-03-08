# TolingCode Registry Server

这是在 `toling.me` 上需要部署的服务端代码，用于托管 skill 和 app 包。

## 目录结构

```
/var/www/toling.me/
├── api/
│   └── registry/          # Registry API
│       ├── index.php      # 或 node.js 入口
│       └── packages/      # 包存储目录
│           ├── skills/
│           └── apps/
├── packages/              # 下载的 tarball 存储
│   ├── skills/
│   └── apps/
└── registry.json          # 包索引（或用数据库）
```

## API 端点

### 1. 获取包信息
```
GET /api/registry/{type}/{name}?version=latest
```

响应:
```json
{
  "name": "weather",
  "type": "skills",
  "version": "2026.03.06",
  "description": "Get weather via wttr.in",
  "downloadUrl": "https://toling.me/packages/skills/weather-2026.03.06.tar.gz",
  "latestVersion": "2026.03.06",
  "versions": ["2026.03.06", "2026.03.01", "2026.02.26"]
}
```

### 2. 列出所有包
```
GET /api/registry/list?type=skills
```

响应:
```json
[
  {
    "name": "weather",
    "type": "skills",
    "version": "2026.03.06",
    "description": "Get weather via wttr.in",
    "latestVersion": "2026.03.06"
  }
]
```

### 3. 搜索
```
GET /api/registry/search?q=weather
```

### 4. 下载 tarball
```
GET /packages/skills/weather-2026.03.06.tar.gz
```

## 简单实现 (Node.js + Express)

```javascript
// api/registry/server.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

const REGISTRY_FILE = '/var/www/toling.me/registry.json';
const PACKAGES_DIR = '/var/www/toling.me/packages';

// 读取注册表
function getRegistry() {
  if (fs.existsSync(REGISTRY_FILE)) {
    return JSON.parse(fs.readFileSync(REGISTRY_FILE, 'utf-8'));
  }
  return { skills: {}, apps: {} };
}

// 获取包信息
app.get('/api/registry/:type/:name', (req, res) => {
  const { type, name } = req.params;
  const { version = 'latest' } = req.query;
  
  const registry = getRegistry();
  const pkg = registry[type]?.[name];
  
  if (!pkg) {
    return res.status(404).json({ error: 'Package not found' });
  }
  
  const ver = version === 'latest' ? pkg.latestVersion : version;
  const verInfo = pkg.versions?.[ver];
  
  if (!verInfo) {
    return res.status(404).json({ error: 'Version not found' });
  }
  
  res.json({
    name,
    type,
    version: ver,
    description: pkg.description,
    downloadUrl: `https://toling.me/packages/${type}/${name}-${ver}.tar.gz`,
    latestVersion: pkg.latestVersion,
    versions: Object.keys(pkg.versions || {})
  });
});

// 列出包
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
          description: pkg.description,
          latestVersion: pkg.latestVersion
        });
      });
    }
  });
  
  res.json(result);
});

// 搜索
app.get('/api/registry/search', (req, res) => {
  const { q } = req.query;
  const registry = getRegistry();
  const result = [];
  
  ['skills', 'apps'].forEach(type => {
    if (registry[type]) {
      Object.entries(registry[type]).forEach(([name, pkg]) => {
        if (name.toLowerCase().includes(q.toLowerCase()) ||
            pkg.description?.toLowerCase().includes(q.toLowerCase())) {
          result.push({
            name,
            type,
            version: pkg.latestVersion,
            description: pkg.description
          });
        }
      });
    }
  });
  
  res.json(result);
});

// 提供静态文件（tarball 下载）
app.use('/packages', express.static(PACKAGES_DIR));

app.listen(3000, () => {
  console.log('TolingCode Registry running on port 3000');
});
```

## 注册表格式 (registry.json)

```json
{
  "skills": {
    "weather": {
      "description": "Get weather via wttr.in",
      "latestVersion": "2026.03.06",
      "versions": {
        "2026.03.06": {
          "publishedAt": "2026-03-06T10:00:00Z",
          "hash": "sha256:abc123..."
        },
        "2026.03.01": {
          "publishedAt": "2026-03-01T10:00:00Z",
          "hash": "sha256:def456..."
        }
      }
    }
  },
  "apps": {}
}
```

## 发布脚本示例

```bash
#!/bin/bash
# publish.sh

SKILL_PATH=$1
NAME=$2
VERSION=${3:-$(date +%Y.%m.%d)}

# 创建 tarball
tar -czf ${NAME}-${VERSION}.tar.gz -C $(dirname $SKILL_PATH) $(basename $SKILL_PATH)

# 上传到服务器
scp ${NAME}-${VERSION}.tar.gz user@toling.me:/var/www/toling.me/packages/skills/

# 更新 registry.json (需要 API 或 SSH)
# 或者通过 API 发布
curl -X POST https://toling.me/api/registry/publish \
  -F "type=skills" \
  -F "name=${NAME}" \
  -F "version=${VERSION}" \
  -F "package=@${NAME}-${VERSION}.tar.gz"

echo "Published ${NAME}@${VERSION}"
```

## Nginx 配置

```nginx
server {
    listen 443 ssl;
    server_name toling.me;
    
    ssl_certificate /etc/letsencrypt/live/toling.me/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/toling.me/privkey.pem;
    
    root /var/www/toling.me;
    
    # API
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    # Packages
    location /packages/ {
        alias /var/www/toling.me/packages/;
        autoindex on;
    }
}
```
