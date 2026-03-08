# TolingCode 快速开始指南

## 🎯 目标

创建一个类似 `clawhub` 的 CLI 工具，通过 `toling.me` 托管和分发 skills 和 apps。

## 📦 使用流程

### 1. 用户安装 CLI

```bash
npm install -g tolingcode@latest
# 或指定版本
npm install -g tolingcode@2026.03.06
```

### 2. 用户安装 Skill

```bash
tolingcode install skills weather
tolingcode install skills weather -v 2026.03.06
```

### 3. 开发者发布 Skill

```bash
# 方法 1: 使用 publish 命令（需要 API 支持）
tolingcode publish ./my-skill --type skills --name my-skill --version 2026.03.06

# 方法 2: 手动上传
tar -czf my-skill-2026.03.06.tar.gz -C ./my-skill .
scp my-skill-2026.03.06.tar.gz user@toling.me:/var/www/toling.me/packages/skills/
# 然后更新 registry.json
```

## 🚀 部署步骤

### 第一步：准备 toling.me 服务器

```bash
# SSH 登录服务器
ssh user@toling.me

# 创建目录
sudo mkdir -p /var/www/toling.me/{packages/skills,packages/apps,api}
sudo chown -R $USER:$USER /var/www/toling.me

# 安装 Node.js (如果没有)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 安装依赖
cd /var/www/toling.me/api
npm init -y
npm install express multer
```

### 第二步：部署服务端代码

```bash
# 上传 registry.js 到服务器
scp registry.js user@toling.me:/var/www/toling.me/api/

# 创建 systemd 服务
sudo tee /etc/systemd/system/tolingcode-registry.service > /dev/null <<EOF
[Unit]
Description=TolingCode Registry Server
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/toling.me/api
ExecStart=/usr/bin/node registry.js
Restart=on-failure

[Install]
WantedBy=multi-user.target
EOF

# 启动服务
sudo systemctl daemon-reload
sudo systemctl enable tolingcode-registry
sudo systemctl start tolingcode-registry
sudo systemctl status tolingcode-registry
```

### 第三步：配置 Nginx

```bash
# 编辑 Nginx 配置
sudo nano /etc/nginx/sites-available/toling.me

# 添加以下内容：
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
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
    
    # Packages
    location /packages/ {
        alias /var/www/toling.me/packages/;
        autoindex on;
        add_header Content-Type application/octet-stream;
    }
}

# 测试并重载
sudo nginx -t
sudo systemctl reload nginx
```

### 第四步：发布 CLI 到 npm

```bash
# 在本地开发机器上
cd tolingcode

# 登录 npm
npm login

# 发布
npm version 1.0.0
npm publish

# 验证
npm view tolingcode
```

### 第五步：发布第一个 Skill

```bash
# 创建测试 skill
mkdir -p test-skill
echo '{"name": "test", "description": "Test skill"}' > test-skill/SKILL.md

# 发布
cd tolingcode
node bin/tolingcode.js publish ../test-skill --type skills --name test-skill --version 2026.03.06

# 或者手动上传
tar -czf test-skill-2026.03.06.tar.gz -C ../test-skill .
scp test-skill-2026.03.06.tar.gz user@toling.me:/var/www/toling.me/packages/skills/

# 更新 registry.json (SSH 到服务器编辑)
```

## ✅ 测试

```bash
# 安装 CLI
npm install -g tolingcode@latest

# 列出可用技能
tolingcode list skills

# 安装技能
tolingcode install skills test-skill

# 验证安装
ls ~/.openclaw/workspace/skills/
```

## 📝 注意事项

1. **版本命名**: 使用 `YYYY.MM.DD` 格式，便于追踪发布日期
2. **认证**: 生产环境需要添加 API 认证（API Key 或 JWT）
3. **HTTPS**: 确保 toling.me 配置了 SSL 证书
4. **备份**: 定期备份 registry.json 和 packages 目录
5. **监控**: 添加日志和监控，跟踪下载量和错误

## 🔧 后续扩展

- [ ] 添加用户认证系统
- [ ] 支持私有包（需要 token）
- [ ] 添加下载统计
- [ ] Web 管理界面
- [ ] 自动版本递增
- [ ] 依赖管理
- [ ] 包签名验证

---

有问题？查看 `docs/SERVER.md` 获取详细服务端文档。
