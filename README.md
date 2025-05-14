# GigaLike - 社交博客分享平台

GigaLike是一个简洁、美观的社交博客分享平台，使用Vue 3构建，支持用户登录、博客浏览和点赞功能。项目采用了类似小红书的瀑布流布局，视觉效果清新自然。

![GigaLike预览](https://via.placeholder.com/800x400?text=GigaLike+Preview)

## 功能特点

- 🔐 用户登录与身份验证
- 📱 响应式布局，适配各种设备
- 🎨 精美的卡片式博客展示
- 💖 博客点赞功能
- 📄 博客详情页面
- 🌊 小红书风格瀑布流布局

## 技术栈

- Vue 3 框架
- Vue Router 进行路由管理
- Axios 处理HTTP请求
- Vite 作为构建工具
- 原生CSS (无UI框架)

## 快速开始

### 前提条件

- Node.js (v14+)
- npm 或 yarn

### 安装

1. 克隆仓库
```bash
git clone https://github.com/yourusername/gigalike-frontend.git
cd gigalike-frontend
```

2. 安装依赖
```bash
npm install
# 或使用 yarn
yarn
```

3. 启动开发服务器
```bash
npm run dev
# 或使用 yarn
yarn dev
```

4. 在浏览器中访问 `http://localhost:5173`

### 生产环境构建

```bash
npm run build
# 或使用 yarn
yarn build
```

## API接口

项目默认连接到 `http://localhost:8123/api` 作为后端API。如需修改API地址，请更新 `vite.config.js` 中的代理设置。

## PowerShell执行策略问题

如果在Windows PowerShell中运行npm脚本时遇到以下错误：

```
无法加载文件 C:\Program Files\nodejs\npm.ps1，因为在此系统上禁止运行脚本
```

请以管理员身份运行PowerShell并执行以下命令：

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

或为当前会话临时设置：

```powershell
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process
```

## 贡献指南

1. Fork 这个仓库
2. 创建您的特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交您的更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建一个 Pull Request

## 许可证

[MIT](LICENSE)

## 联系方式

如有任何问题或建议，请通过Issues或Pull Requests联系我们。 