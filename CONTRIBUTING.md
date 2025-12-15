# 贡献指南

感谢你对本项目的关注！我们欢迎任何形式的贡献。

## 如何贡献

### 报告 Bug

如果你发现了 bug，请创建一个 issue，并包含以下信息：

- Bug 的详细描述
- 重现步骤
- 预期行为
- 实际行为
- 浏览器和操作系统信息
- 屏幕截图（如果适用）

### 提出新功能

如果你有新功能的想法，请创建一个 issue 说明：

- 功能描述
- 使用场景
- 可能的实现方式
- 是否愿意自己实现

### 提交代码

1. **Fork 仓库**
   ```bash
   # 点击 GitHub 页面上的 Fork 按钮
   ```

2. **克隆你的 fork**
   ```bash
   git clone https://github.com/your-username/travel-map.git
   cd travel-map
   ```

3. **创建分支**
   ```bash
   git checkout -b feature/your-feature-name
   # 或
   git checkout -b fix/your-bug-fix
   ```

4. **安装依赖**
   ```bash
   npm install
   ```

5. **进行修改**
   - 遵循项目的代码风格
   - 编写清晰的提交信息
   - 添加必要的注释

6. **测试修改**
   ```bash
   npm run dev   # 本地开发测试
   npm run build # 构建测试
   ```

7. **提交更改**
   ```bash
   git add .
   git commit -m "feat: 添加新功能描述"
   # 或
   git commit -m "fix: 修复bug描述"
   ```

   提交信息格式：
   - `feat:` 新功能
   - `fix:` Bug 修复
   - `docs:` 文档更新
   - `style:` 代码格式调整
   - `refactor:` 代码重构
   - `perf:` 性能优化
   - `test:` 测试相关
   - `chore:` 构建或辅助工具变动

8. **推送到你的 fork**
   ```bash
   git push origin feature/your-feature-name
   ```

9. **创建 Pull Request**
   - 在 GitHub 上打开你的 fork
   - 点击 "New Pull Request"
   - 填写 PR 描述，说明你的更改
   - 等待 review

## 代码规范

### Vue 组件

- 使用 Vue 3 Composition API
- 使用 `<script setup>` 语法
- 组件名使用 PascalCase
- Props 使用 camelCase
- Events 使用 kebab-case

示例：
```vue
<template>
  <div class="my-component">
    {{ myProp }}
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  myProp: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['my-event'])
</script>
```

### JavaScript

- 使用 ES6+ 语法
- 使用 2 空格缩进
- 字符串使用单引号
- 行末不加分号（除非必要）
- 使用有意义的变量名

### CSS

- 使用 kebab-case 类名
- 避免使用 ID 选择器
- 优先使用 Flexbox 和 Grid 布局
- 使用 CSS 变量管理颜色和尺寸

### 文件命名

- 组件文件：PascalCase（例如：`MyComponent.vue`）
- 工具文件：camelCase（例如：`helpers.js`）
- 样式文件：kebab-case（例如：`main-style.css`）

## 项目结构

```
src/
├── components/     # Vue 组件
├── composables/    # 组合式函数
├── utils/          # 工具函数
├── assets/         # 静态资源
│   └── styles/     # 样式文件
├── App.vue         # 根组件
└── main.js         # 入口文件
```

## 开发工具

推荐使用以下工具：

- **IDE**: VS Code
- **插件**: 
  - Volar (Vue 3 支持)
  - ESLint
  - Prettier

## 注意事项

1. **不要提交敏感信息**
   - API Keys
   - Tokens
   - 密码
   - 个人数据

2. **保持提交简洁**
   - 一个提交只做一件事
   - 提交信息要清晰明确

3. **测试你的代码**
   - 确保代码在本地正常运行
   - 检查是否有控制台错误
   - 测试不同浏览器（如果可能）

4. **遵循现有代码风格**
   - 查看现有代码
   - 保持一致性

5. **及时沟通**
   - 在 issue 中讨论大的改动
   - PR 中清楚说明你的更改
   - 及时回复 review 意见

## 获取帮助

如果有任何问题：

- 查看 [README.md](README.md) 了解项目信息
- 在 [Issues](https://github.com/your-username/travel-map/issues) 中搜索类似问题
- 创建新的 issue 提问

## 行为准则

- 尊重其他贡献者
- 保持建设性的讨论
- 接受不同的观点
- 专注于对项目最好的做法

再次感谢你的贡献！🎉
