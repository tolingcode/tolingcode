<p align="center">
  <img src="https://raw.githubusercontent.com/tolingcode/tolingcode/main/docs/logo.png" alt="TolingCode Logo">
</p>
![TolingCode Banner](https://raw.githubusercontent.com/tolingcode/tolingcode/main/docs/banner.png)



![npm](https://img.shields.io/npm/v/tolingcode)
![downloads](https://img.shields.io/npm/dm/tolingcode)
![license](https://img.shields.io/badge/license-MIT-green)
![node](https://img.shields.io/badge/node-%3E=18-blue)
![platform](https://img.shields.io/badge/platform-cross--border-orange)

 

# TolingCode CLI

**TolingCode** 是一款可在个人设备上运行的 **跨境电商私人人工智能助手**。

它为跨境卖家和企业提供 **本地化 AI
自动化能力**，支持订单履约、库存管理、产品刊登、广告管理、数据分析等核心业务。

同时 **tolingcode skill 库** 可以兼容 **OpenClaw AI
Agent**，用于构建跨境企业 **AI 数字员工**。

------------------------------------------------------------------------

# 核心特点

| 特性 | 说明 |
|------|------|
| 本地运行 | AI 在个人设备运行，不依赖云端 |
| 永不离线 | 本地模型可持续运行 |
| 响应迅速 | 避免云端延迟 |
| 数据本地化 | API 数据可同步到本地数据库 |
| AI 员工 | 自动执行跨境电商任务 |
| Skill 生态 | 支持安装技能扩展能力 |

------------------------------------------------------------------------

# 安装
 
``` bash
当前最新版本:2026.03.08

安装最新版本
npm install -g tolingcode@latest

安装指定版本
npm install -g tolingcode@2026.03.06
```
------------------------------------------------------------------------

# 核心能力

## 电商平台技能

  功能       描述
  ---------- ------------------
  订单履约   自动处理订单发货
  智能备货   AI 预测库存
  发票确认   自动核对发票
  发货确认   同步物流信息
  订单获取   拉取平台订单
  库存编辑   修改库存
  产品上架   自动发布商品
  价格管理   修改产品价格
  广告管理   自动调整广告
  数据分析   获取平台报告

------------------------------------------------------------------------

## 海外仓技能

  功能         描述
  ------------ -----------------
  实时库存     获取仓库库存
  出库单       查询出库
  入库单       查询入库
  创建出库单   创建订单出库
  LTL 出运     创建 LTL 运输单
  运费查询     获取物流费用

------------------------------------------------------------------------

## 物流技能

  功能
  ----------
  物流报价
  创建面单
  物流跟踪

支持物流：

-   FedEx
-   UPS
-   DHL
-   Amazon Logistics
-   ITTRACK


------------------------------------------------------------------------

# 使用

## 安装技能 (Skill)

安装最新版本

``` bash
tolingcode install skills weather
```

安装指定版本

``` bash
tolingcode install skills weather -v 2026.03.06
```

------------------------------------------------------------------------

## 安装应用 (App)

安装到当前目录

``` bash
tolingcode install apps myapp
```

全局安装

``` bash
tolingcode install apps myapp -g
```

------------------------------------------------------------------------

## 查看可用包

列出所有包

``` bash
tolingcode list
```

只列出技能

``` bash
tolingcode list skills
```

只列出应用

``` bash
tolingcode list apps
```

------------------------------------------------------------------------

## 搜索技能

``` bash
tolingcode search weather
```

------------------------------------------------------------------------

# 发布技能（开发者）

``` bash
tolingcode publish ./my-skill \
--type skills \
--name my-skill \
--version 2026.03.06
```

------------------------------------------------------------------------

# 版本规范

推荐使用 **日期版本号**

    YYYY.MM.DD

示例

  版本         含义
  ------------ ------------------
  2026.03.06   2026年3月6日版本
  latest       最新版本

------------------------------------------------------------------------

# 环境变量

自定义 registry

``` bash
export TOLINGCODE_REGISTRY=https://toling.me/api/registry
```

自定义 workspace

``` bash
export OPENCLAW_WORKSPACE=/path/to/workspace
```

------------------------------------------------------------------------

# 开发

本地调试 CLI

``` bash
cd tolingcode
npm link
tolingcode --help
```

发布 npm

``` bash
npm version patch
npm publish
```

------------------------------------------------------------------------

# 项目结构

    tolingcode
    │
    ├── bin
    │   └── tolingcode.js
    │
    ├── docs
    │   └── SERVER.md
    │
    ├── server
    │   └── registry.js
    │
    ├── scripts
    │   └── publish-skill.ps1
    │
    ├── package.json
    └── README.md

------------------------------------------------------------------------

# 支持跨境平台

## 主流电商平台

  平台
  ---------------
  Amazon
  eBay
  AliExpress
  Wish
  Shopee
  Lazada
  Mercado Libre
  Etsy
  Wayfair
  Newegg
  Temu
  Shein
  TikTok Shop

------------------------------------------------------------------------

## 独立站平台

  平台
  -------------
  Shopify
  WooCommerce
  Magento
  BigCommerce

------------------------------------------------------------------------

## 大型零售平台

  平台
  ------------
  Walmart
  Target
  Costco
  Best Buy
  Home Depot
  Lowe's

------------------------------------------------------------------------

# 支持海外仓

支持 100+ 海外仓系统，例如：

  类型       示例
  ---------- -------------
  物流仓     中通国际
  电商仓     Walmart WFS
  货代仓     马士基
  第三方仓   RMS 红鼠

------------------------------------------------------------------------

# 相关链接

  项目       地址
  ---------- -------------------
  Registry   https://toling.me
  源代码     GitHub (待添加)
  问题反馈   GitHub Issues

------------------------------------------------------------------------

# 作者

**韩宝军 (TolingCode)**

------------------------------------------------------------------------

# License

MIT License
