# 五笔86特训营 (Wubi86 Dojo)

> 30天从双拼平滑切换到五笔86的终极训练工具。

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/react-18.x-61dafb.svg)
![TypeScript](https://img.shields.io/badge/typescript-5.x-3178c6.svg)
![Vite](https://img.shields.io/badge/vite-6.x-646cff.svg)

## 📖 项目简介 (Introduction)

**五笔86特训营** 是一个专为中文打字用户设计的单页面 Web 应用 (SPA)。

### 🎯 它的目标 (Goal)
帮助目前熟练使用**双拼（如小鹤双拼）**的用户，在 **30天** 内平滑切换到 **五笔86** 输入法。通过科学的渐进式目标设定，确保用户在练习结束时，五笔打字速度能够达到之前的双拼水平，实现无损切换。

### 💡 它是什么 (What it is)
- 一个专注于**中文汉字**输入的练习工具（自动过滤标点符号）。
- 一个带有**智能编码提示**的学习辅助工具。
- 一个基于**本地数据**的隐私安全应用。

### 🚫 它不是什么 (What it is NOT)
- 它不是一个通用的英文打字练习软件。
- 它不依赖服务器存储你的练习数据（所有数据均在本地）。

---

## ✨ 核心功能 (Features)

1.  **🚀 基线测试 (Baseline Assessment)**
    -   开始前先测试你当前的双拼 WPM (Words Per Minute)。
    -   以此为终极目标，制定个性化的 30 天训练计划。

2.  **📈 渐进式目标系统 (Daily Goal System)**
    -   自动生成从 0 到目标 WPM 的增长曲线。
    -   每日动态更新目标，让你循序渐进，不易放弃。

3.  **⌨️ 智能练习界面 (Smart Practice)**
    -   **五笔编码提示**：每个汉字下方实时显示 86 版五笔编码，边打边记。
    -   **纯净模式**：只练习汉字，忽略标点符号，专注字根拆解。
    -   **实时反馈**：即时显示当前速度和准确率。

4.  **📊 进度追踪 (Progress Tracking)**
    -   可视化折线图：直观对比“实际速度”与“目标速度”。
    -   详细统计：记录每日练习时长、字数和准确率。

5.  **🔒 隐私优先 (Privacy First)**
    -   所有数据存储在浏览器 `LocalStorage` 中。
    -   无需注册登录，即开即用。

---

## 🛠️ 技术架构 (Technical Architecture)

本项目采用现代化的前端技术栈构建，追求极致的性能和开发体验。

| 模块 | 技术选型 | 说明 |
| :--- | :--- | :--- |
| **构建工具** | [Vite](https://vitejs.dev/) | 极速的开发服务器和构建工具 |
| **前端框架** | [React](https://react.dev/) (v18) | 组件化 UI 开发 |
| **语言** | [TypeScript](https://www.typescriptlang.org/) | 类型安全的 JavaScript 超集 |
| **样式** | [Tailwind CSS](https://tailwindcss.com/) | 原子化 CSS 框架 |
| **状态管理** | [Zustand](https://github.com/pmndrs/zustand) | 轻量级状态管理 + 持久化中间件 |
| **图表库** | [Recharts](https://recharts.org/) | 基于 React 的可组合图表库 |
| **图标** | [Lucide React](https://lucide.dev/) | 美观统一的 SVG 图标集 |
| **路由** | [React Router](https://reactrouter.com/) | 单页面应用路由管理 |

### 目录结构
```
src/
├── components/   # 通用 UI 组件
├── data/         # 静态数据（练习文本、五笔编码映射）
├── hooks/        # 自定义 React Hooks
├── lib/          # 工具函数
├── pages/        # 页面组件 (Home, Baseline, Stats, Settings)
├── store/        # Zustand 状态存储
└── ...
```

---

## 🚀 快速开始 (Quick Start)

如果你想在本地运行或参与贡献代码，请按照以下步骤操作。

### 环境要求
- [Node.js](https://nodejs.org/) (推荐 v18 或更高版本)
- [Git](https://git-scm.com/)

### 安装步骤

1.  **克隆仓库**
    ```bash
    git clone git@github.com:Simon-CHOU/wubi86-dojo.git
    cd wubi86-dojo
    ```

2.  **安装依赖**
    ```bash
    npm install
    # 或者使用 yarn / pnpm
    # yarn install
    # pnpm install
    ```

3.  **启动开发服务器**
    ```bash
    npm run dev
    ```
    访问终端中显示的地址（通常是 `http://localhost:5173`）。

4.  **构建生产版本**
    ```bash
    npm run build
    ```

---

## 🤝 贡献 (Contributing)

欢迎提交 Issue 或 Pull Request！

1.  Fork 本仓库
2.  创建你的特性分支 (`git checkout -b feature/AmazingFeature`)
3.  提交你的修改 (`git commit -m 'Add some AmazingFeature'`)
4.  推送到分支 (`git push origin feature/AmazingFeature`)
5.  开启一个 Pull Request

---

## 📄 许可证 (License)

[MIT](LICENSE) © 2024 Simon-CHOU
