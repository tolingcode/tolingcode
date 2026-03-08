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

**跨境电商私人 AI 助手** - 在个人设备上运行的本地化 AI 自动化工具 , tolingcode  Skills完全兼容openclaw。

为跨境卖家提供订单履约、库存管理、产品刊登、广告管理、数据分析等核心业务能力。

---

## 安装

```bash
# 安装最新版本
npm install -g tolingcode@latest

# 安装指定版本
npm install -g tolingcode@2026.03.09
```

**当前版本**: 2026.03.09

---

## 使用

### 安装技能 (Skill)

```bash
# 安装技能
tolingcode install skills weather

# 安装指定版本
tolingcode install skills weather -v 2026.03.08
```

### 安装应用 (App)

```bash
# 安装到当前目录
tolingcode install apps myapp

# 全局安装
tolingcode install apps myapp -g
```

### 查看和搜索

```bash
# 列出所有包
tolingcode list

# 只列出技能
tolingcode list skills

# 搜索技能
tolingcode search weather
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

## 发布技能 (开发者)

```bash
tolingcode publish ./my-skill \
  --type skills \
  --name my-skill \
  --version 2026.03.09
```

### 版本规范

使用日期版本号：`YYYY.MM.DD`

---

## 支持平台

**电商平台**: Amazon、eBay、AliExpress、Wish、Shopee、Lazada、Mercado Libre、Etsy、Wayfair、TikTok Shop 等

**独立站**: Shopify、WooCommerce、Magento、BigCommerce

**零售平台**: Walmart、Target、Costco、Best Buy 等

**海外仓**: 支持 100+ 海外仓系统 (中通国际、Walmart WFS、马士基、RMS 红鼠等)

---

## 相关链接

- **Registry**: https://toling.me
- **GitHub**: https://github.com/tolingcode/tolingcode
- **问题反馈**: GitHub Issues

---

**作者**: 韩宝军 (TolingCode)  
**License**: MIT
