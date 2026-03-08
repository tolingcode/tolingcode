<p align="center">
  <img src="https://raw.githubusercontent.com/tolingcode/tolingcode/main/docs/logo.png" width="120" alt="TolingCode Logo">
</p>

![npm](https://img.shields.io/npm/v/tolingcode)
![downloads](https://img.shields.io/npm/dm/tolingcode)
![license](https://img.shields.io/badge/license-MIT-green)

# TolingCode CLI

**跨境电商 AI 助手** - 在个人设备上运行的本地化 AI 自动化工具

支持订单履约、库存管理、产品刊登、广告管理等核心业务，兼容 OpenClaw AI Agent。

---

## 安装

```bash
# 最新版本
npm install -g tolingcode@latest

# 指定版本
npm install -g tolingcode@2026.03.08
```

---

## 快速使用

```bash
# 安装技能
tolingcode install skills weather

# 安装应用
tolingcode install apps myapp

# 查看可用包
tolingcode list

# 搜索技能
tolingcode search weather
```

---

## 核心能力

| 类型 | 功能 |
|------|------|
| **电商平台** | 订单履约、智能备货、产品上架、价格管理、广告管理 |
| **海外仓** | 实时库存、出入库单、LTL 出运、运费查询 |
| **物流** | 物流报价、创建面单、物流跟踪 (FedEx/UPS/DHL 等) |

---

## 发布技能 (开发者)

```bash
tolingcode publish ./my-skill --type skills --name my-skill --version 2026.03.08
```

---

## 相关链接

- **Registry**: https://toling.me
- **GitHub**: https://github.com/tolingcode/tolingcode

---

**作者**: 韩宝军 (TolingCode)  
**License**: MIT
