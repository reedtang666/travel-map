# 🗺️ 家庭旅行足迹地图

一个基于 Vue 3 和高德地图的家庭旅行足迹记录网站，所有数据存储在 GitHub，通过 GitHub Pages 部署。

![Vue 3](https://img.shields.io/badge/Vue-3.4-brightgreen.svg)
![Vite](https://img.shields.io/badge/Vite-5.2-646CFF.svg)
![License](https://img.shields.io/badge/License-MIT-blue.svg)

## ✨ 功能特性

### 🗺️ 地图功能
- 使用高德地图 JS API 显示中国地图
- 支持地图缩放、拖拽交互
- 在地图上显示已访问城市的标记点
- 自定义标记样式（📌、🦶、👆、❤️、⭐ 等）

### 📍 城市标记
- 点击地图或搜索选择城市
- 每个访问记录包含：
  - 城市名称和坐标
  - 访问日期
  - 文字记录/描述
  - 1张主图 + 最多3张副图（共4张）
  - 自定义图钉样式
- 同一城市可以有多次访问记录

### ⭐ 愿望清单
- 标记想去但还未去过的城市
- 使用灰色圆点样式区分
- 可添加备注说明
- 去过后可转换为已访问记录

### 🕐 旅行时间线
- 页面底部显示按时间排序的所有记录
- 从早到晚展示"旅行轨迹"
- 显示缩略图、城市名、日期
- 点击可跳转到地图对应位置

### 📷 照片功能
- 图片存储在 GitHub 仓库的 `images/` 目录
- 支持点击照片放大预览（lightbox效果）
- 支持在编辑时添加/删除照片
- 自动压缩图片，控制文件大小

### 🔄 自动化
- GitHub Actions 每日自动提交
- 自动部署到 GitHub Pages

## 🚀 快速开始

### 前置要求

- Node.js 18+ 
- npm 或 yarn
- Git
- GitHub 账号

### 1. 克隆仓库

```bash
git clone https://github.com/your-username/travel-map.git
cd travel-map
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

复制 `.env.example` 为 `.env` 并填写配置：

```bash
cp .env.example .env
```

编辑 `.env` 文件：

```env
# 高德地图 API Key (必需)
VITE_AMAP_KEY=your_amap_key_here

# GitHub 配置 (可选，用于数据同步)
VITE_GITHUB_TOKEN=your_github_token_here
VITE_GITHUB_OWNER=your_github_username
VITE_GITHUB_REPO=travel-map
VITE_GITHUB_BRANCH=main
```

#### 如何获取高德地图 API Key？

1. 访问 [高德开放平台](https://lbs.amap.com/)
2. 注册/登录账号
3. 进入控制台 → 应用管理 → 我的应用
4. 创建新应用，添加 Key
5. 选择 "Web端(JS API)"
6. 复制 Key 到 `.env` 文件

#### 如何获取 GitHub Personal Access Token？

1. 访问 GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. 点击 "Generate new token (classic)"
3. 设置权限：勾选 `repo` (Full control of private repositories)
4. 生成 token 并复制到 `.env` 文件

**注意**：Token 请妥善保管，不要提交到代码仓库！

### 4. 本地开发

```bash
npm run dev
```

访问 `http://localhost:3000` 查看应用。

### 5. 构建生产版本

```bash
npm run build
```

构建产物将输出到 `dist` 目录。

## 📦 部署到 GitHub Pages

### 1. 配置 GitHub Secrets

在 GitHub 仓库设置中添加以下 Secrets：

- `VITE_AMAP_KEY`: 高德地图 API Key
- `VITE_GITHUB_TOKEN`: GitHub Personal Access Token

路径：Settings → Secrets and variables → Actions → New repository secret

### 2. 启用 GitHub Pages

1. 进入仓库 Settings → Pages
2. Source 选择 "GitHub Actions"
3. 保存设置

### 3. 部署

推送代码到 `main` 分支即可自动触发部署：

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

部署完成后，访问 `https://your-username.github.io/travel-map/`

## 📁 项目结构

```
travel-map/
├── .github/
│   └── workflows/
│       ├── auto-commit.yml      # 自动提交工作流
│       └── deploy.yml           # GitHub Pages 部署
├── public/
│   └── favicon.ico
├── src/
│   ├── assets/
│   │   └── styles/
│   │       └── main.css         # 全局样式
│   ├── components/
│   │   ├── TravelMap.vue        # 地图主组件
│   │   ├── MarkerDetail.vue     # 标记详情弹窗
│   │   ├── AddEditForm.vue      # 新增/编辑表单
│   │   ├── Timeline.vue         # 时间线组件
│   │   ├── WishlistPanel.vue    # 愿望清单面板
│   │   ├── PhotoGallery.vue     # 照片画廊/预览
│   │   ├── MarkerStylePicker.vue # 图钉样式选择器
│   │   └── ImageUploader.vue    # 图片上传组件
│   ├── composables/
│   │   ├── useGithubApi.js      # GitHub API 封装
│   │   ├── useAmap.js           # 高德地图封装
│   │   └── useStorage.js        # 数据存储逻辑
│   ├── utils/
│   │   └── helpers.js           # 工具函数
│   ├── App.vue
│   └── main.js
├── data/
│   └── travels.json             # 旅行数据
├── images/                      # 图片存储目录
│   └── .gitkeep
├── .env.example                 # 环境变量示例
├── .gitignore
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## 💾 数据存储

所有数据存储在 `data/travels.json` 文件中：

```json
{
  "visits": [
    {
      "id": "visit_xxx",
      "cityName": "北京",
      "coordinates": [116.407526, 39.904030],
      "visitDate": "2024-05-01",
      "description": "游览长城和故宫",
      "mainImage": "images/beijing-main.jpg",
      "subImages": ["images/beijing-1.jpg"],
      "markerStyle": "📌",
      "createdAt": "2024-05-02T10:00:00Z",
      "updatedAt": "2024-05-02T10:00:00Z"
    }
  ],
  "wishlist": [
    {
      "id": "wish_xxx",
      "cityName": "西藏拉萨",
      "coordinates": [91.132212, 29.660361],
      "note": "想看布达拉宫",
      "createdAt": "2024-01-01T10:00:00Z"
    }
  ],
  "settings": {
    "defaultMarkerStyle": "📌",
    "homeLocation": [116.407526, 39.904030]
  }
}
```

## 🎨 自定义配置

### 修改默认地图中心

编辑 `data/travels.json` 中的 `settings.homeLocation`：

```json
{
  "settings": {
    "homeLocation": [你的经度, 你的纬度]
  }
}
```

### 修改默认标记样式

编辑 `data/travels.json` 中的 `settings.defaultMarkerStyle`：

```json
{
  "settings": {
    "defaultMarkerStyle": "🦶"
  }
}
```

### 添加更多标记样式

编辑 `src/components/MarkerStylePicker.vue`，在 `styles` 数组中添加新的 emoji：

```javascript
const styles = ['📌', '🦶', '👆', '❤️', '⭐', '你的emoji']
```

## 🔧 开发指南

### 技术栈

- **前端框架**: Vue 3 (Composition API)
- **构建工具**: Vite 5
- **地图服务**: 高德地图 JS API 2.0
- **数据存储**: GitHub API
- **部署**: GitHub Pages
- **CI/CD**: GitHub Actions

### 代码风格

- 使用 Vue 3 Composition API
- 使用 `<script setup>` 语法
- 组件使用 PascalCase 命名
- 文件使用 kebab-case 命名

### 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📝 使用说明

### 添加新的旅行记录

1. 点击右上角 "➕ 添加新记录" 按钮
2. 输入城市名称搜索（会自动定位）
3. 选择访问日期
4. 选择标记样式
5. 填写游记描述
6. 上传照片（最多4张）
7. 点击 "添加" 保存

### 编辑记录

1. 点击地图上的标记或时间线中的记录
2. 点击 "✏️ 编辑" 按钮
3. 修改信息
4. 点击 "保存" 保存更改

### 删除记录

1. 点击地图上的标记或时间线中的记录
2. 点击 "🗑️ 删除" 按钮
3. 确认删除

### 管理愿望清单

1. 点击右上角 "⭐ 愿望清单" 按钮
2. 点击 "➕ 添加愿望" 添加想去的城市
3. 去过后点击 "✅ 已去过" 转换为旅行记录

## ⚠️ 注意事项

1. **API Key 安全**：不要将 API Key 提交到公开仓库
2. **Token 权限**：GitHub Token 需要 `repo` 权限
3. **图片大小**：上传的图片会自动压缩，建议单张不超过 5MB
4. **数据备份**：定期备份 `data/travels.json` 文件
5. **浏览器兼容**：建议使用最新版 Chrome、Firefox、Safari 或 Edge

## 🐛 常见问题

### 地图无法加载？

- 检查高德地图 API Key 是否正确
- 检查控制台是否有错误信息
- 确认 Key 的服务平台选择了 "Web端(JS API)"

### 数据无法保存？

- 检查 GitHub Token 是否正确
- 检查 Token 是否有 `repo` 权限
- 检查网络连接是否正常

### 图片上传失败？

- 检查图片格式（支持 JPG、PNG）
- 检查图片大小（建议小于 5MB）
- 检查 GitHub Token 权限

### 本地开发无法访问 GitHub API？

- 本地开发时如果没有配置 GitHub Token，会使用空数据
- 配置 `.env` 文件后重启开发服务器

## 📄 License

[MIT License](LICENSE)

## 🙏 致谢

- [Vue.js](https://vuejs.org/)
- [Vite](https://vitejs.dev/)
- [高德地图](https://lbs.amap.com/)
- [GitHub Pages](https://pages.github.com/)

---

如有问题或建议，欢迎提交 [Issue](https://github.com/your-username/travel-map/issues)！