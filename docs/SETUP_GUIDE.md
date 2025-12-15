# 详细配置指南

本文档提供了详细的配置说明，帮助你快速部署和使用旅行足迹地图。

## 快速开始

### 1. 前置准备
- Node.js 18+
- Git
- GitHub 账号

### 2. 获取高德地图 Key
1. 访问 https://lbs.amap.com/
2. 注册并创建应用
3. 添加 Web 端 JS API Key
4. 配置域名白名单

### 3. 配置 GitHub Token
1. GitHub Settings → Developer settings → Personal access tokens
2. 生成 Token（需要 repo 权限）
3. 配置到 .env 或 GitHub Secrets

### 4. 启动项目
```bash
npm install
npm run dev
```

详细步骤请参考主 README.md 文件。

## 常见问题

### 地图无法加载
- 检查 API Key 是否正确
- 检查域名白名单配置

### 数据无法保存
- 检查 GitHub Token 权限
- 确认 Token 未过期

更多问题请查看 Issues 或提交新的 Issue。
