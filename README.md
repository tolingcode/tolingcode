<p align="center">
  <img src="https://raw.githubusercontent.com/tolingcode/tolingcode/main/docs/logo.png" width="120" alt="TolingCode Logo">
</p>
<p align="center">
  <img src="https://raw.githubusercontent.com/tolingcode/tolingcode/main/docs/banner.png"  alt="TolingCode banner">
</p>
 
![npm](https://img.shields.io/npm/v/tolingcode)
![downloads](https://img.shields.io/npm/dm/tolingcode)
![license](https://img.shields.io/badge/license-MIT-green)

# TolingCode CLI

**跨境电商私人 AI 助手** - 基于 OpenClaw 的本地化 AI 自动化工具

TolingCode Skills 完全兼容 OpenClaw，为跨境卖家提供订单履约、库存管理、产品刊登、广告管理、数据分析等核心业务能力。

---

## 快速开始

### 1. 安装 TolingCode

```bash
# 安装最新版本
npm install -g tolingcode@latest
```

### 2. 安装 OpenClaw

```bash
# 通过 tolingcode 安装 OpenClaw（推荐）
tolingcode install openclaw

# 安装指定版本
tolingcode install openclaw -v 2026.3.7

# 强制重新安装
tolingcode install openclaw --force
```

### 3. 启动 OpenClaw Gateway

```bash
openclaw gateway start
```

### 4. 安装技能

```bash
# 安装大健云仓技能（跨境电商 B2B）
tolingcode install skills gigacloud-warehouse

# 安装订单履约管理技能
tolingcode install skills order-fulfillment

# 安装远程 Linux 运维技能
tolingcode install skills hbj-ai-shell
```

---

## 命令参考

### 安装命令

```bash
# 安装 OpenClaw
tolingcode install openclaw

# 安装技能
tolingcode install skills <skill-name>

# 安装应用
tolingcode install apps <app-name>

# 指定版本安装
tolingcode install skills <skill-name> -v 2026.3.8

# 全局安装应用
tolingcode install apps <app-name> -g

# 强制重新安装 OpenClaw
tolingcode install openclaw --force
```

### 查看和搜索

```bash
# 列出所有可用包
tolingcode list

# 只列出技能
tolingcode list skills

# 只列出应用
tolingcode list apps

# 搜索技能
tolingcode search 电商
tolingcode search gigacloud
tolingcode search order
```

### 发布技能（开发者）

```bash
tolingcode publish ./my-skill \
  --type skills \
  --name my-skill \
  --version 2026.3.9
```

### 其他命令

```bash
# 查看使用示例
tolingcode examples

# 查看版本
tolingcode --version

# 查看帮助
tolingcode --help
tolingcode install --help
```

---

## 核心能力

### 电商平台技能

| 功能 | 描述 |
|------|------|
| 订单履约 | 自动处理订单发货 |
| 智能备货 | AI 预测库存 |
| 产品上架 | 自动发布商品 |
| 价格管理 | 修改产品价格 |
| 广告管理 | 自动调整广告 |
| 数据分析 | 获取平台报告 |

### 海外仓技能

| 功能 | 描述 |
|------|------|
| 实时库存 | 获取仓库库存 |
| 出入库单 | 查询入库/出库 |
| 创建出库单 | 创建订单出库 |
| LTL 出运 | 创建 LTL 运输单 |
| 运费查询 | 获取物流费用 |

### 物流技能

- 物流报价、创建面单、物流跟踪
- 支持：FedEx、UPS、DHL、Amazon Logistics、ITTRACK

---

## 支持平台

**电商平台**: Amazon、eBay、AliExpress、Wish、Shopee、Lazada、Mercado Libre、Etsy、Wayfair、TikTok Shop 等

**独立站**: Shopify、WooCommerce、Magento、BigCommerce

**零售平台**: Walmart、Target、Costco、Best Buy 等

**海外仓**: 支持 100+ 海外仓系统 (中通国际、Walmart WFS、马士基、RMS 红鼠等)

---

## 版本规范

使用日期版本号：`YYYY.M.D`（无前导零）

示例：
- ✅ `2026.3.9`
- ❌ `2026.03.09`

---

## 私有 Registry

TolingCode 支持从私有 Registry 安装技能：

```bash
# 设置私有 Registry 地址
set TOLINGCODE_REGISTRY=http://your-registry.com/api/registry

# 安装技能
tolingcode install skills your-skill
```

### 部署私有 Registry

参考 `server/registry.js` 部署自己的技能注册中心。

---

## 环境变量

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `TOLINGCODE_REGISTRY` | `https://toling.me/api/registry` | Registry 服务器地址 |
| `OPENCLAW_WORKSPACE` | `~/.openclaw/workspace` | OpenClaw 工作目录 |

---

## 相关链接

- **Registry**: https://toling.me
- **GitHub**: https://github.com/tolingcode/tolingcode
- **OpenClaw**: https://github.com/openclaw/openclaw
- **OpenClaw 文档**: https://docs.openclaw.ai
- **问题反馈**: GitHub Issues

---

## 开发

```bash
# 克隆仓库
git clone https://github.com/tolingcode/tolingcode.git
cd tolingcode

# 安装依赖
npm install

# 本地测试
npm link

# 运行命令
tolingcode --help
```

---

## 更新日志

### 2026.3.21

- ✨ 新增：支持通过 `tolingcode install openclaw` 安装/更新 OpenClaw
- ✨ 新增：支持 `--force` 参数强制重装 OpenClaw
- ✨ 新增：支持 `-v` 参数指定 OpenClaw 版本
- 🎨 改进：统一命令入口，所有安装通过 `tolingcode` 管理
- 📝 改进：完善帮助信息和文档

---

**作者**: 韩宝军 (TolingCode)  
**License**: MIT
