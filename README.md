# Tech Blog

[English](#english) | [中文](#中文)

---

<a id="中文"></a>

一个全栈个人技术博客，前端使用 **Astro + Vue 3**，后端使用 **Fastify + Drizzle ORM**，采用 pnpm monorepo 架构。

## 功能特性

### 前端 (Astro + Vue 3)
- 服务端渲染，响应式设计
- 深色模式，自动检测系统偏好
- 国际化支持（中文 / English），可在后台设置中切换
- Markdown 内容渲染，Shiki 语法高亮（亮色/暗色双主题）
- 代码一键复制、目录导航、阅读时间估算
- 文章卡片自适应网格布局
- 分类、标签、归档页面
- 评论系统，支持嵌套回复
- 搜索防抖
- 分页、上一篇/下一篇文章导航
- SEO：Open Graph、Twitter Cards、Sitemap、RSS、Canonical URL
- 404 页面、返回顶部按钮

### 后台管理
- 仪表盘数据概览
- 文章编辑器：Markdown 工具栏、实时预览、快捷键（Ctrl+S）
- 未保存更改提醒（页面离开确认）
- 文章/评论批量操作（全选、批量发布/删除）
- 分类、标签、用户、媒体、站点设置管理
- 骨架屏加载动画
- 评论审核与状态筛选
- 移动端响应式侧边栏
- 深色模式适配

### 后端 (Fastify + Drizzle)
- RESTful API，JWT 认证（access + refresh token）
- SQLite 数据库（libsql）
- Markdown 渲染，Shiki 双主题语法高亮
- 图片上传与静态文件服务
- 公开接口速率限制
- 自动创建默认管理员账号

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | Astro 6, Vue 3, TypeScript |
| 后端 | Fastify 5, Drizzle ORM, libsql (SQLite) |
| 样式 | CSS 变量, 响应式设计 |
| Markdown | Marked + Shiki + sanitize-html |
| 认证 | JWT (access + refresh token), bcrypt |
| 构建 | pnpm workspaces, tsup, tsx |

## 项目结构

```
tech-blog/
├── apps/
│   ├── web/                  # Astro + Vue 前端
│   │   └── src/
│   │       ├── components/   # Astro 与 Vue 组件
│   │       ├── i18n/         # 国际化翻译 (zh-CN, en)
│   │       ├── layouts/      # 博客与后台布局
│   │       ├── pages/        # 路由页面 (博客 + 后台)
│   │       ├── styles/       # 全局与后台样式
│   │       └── middleware.ts  # 语言检测中间件
│   └── server/               # Fastify 后端
│       └── src/
│           ├── db/           # 数据库 Schema 与初始化
│           ├── routes/       # API 路由
│           └── services/     # Markdown 渲染服务
└── packages/
    └── shared/               # 共享类型与工具
```

## 快速开始

### 环境要求

- Node.js >= 20
- pnpm

### 安装

```bash
git clone https://github.com/Flysoft1337/tech-blog.git
cd tech-blog
pnpm install
```

### 开发

```bash
# 同时启动前端和后端
pnpm dev

# 或分别启动
pnpm dev:server   # 后端 http://localhost:3000
pnpm dev:web      # 前端 http://localhost:4321
```

### 默认管理员账号

- 邮箱：`admin@example.com`
- 密码：`admin123`

可通过环境变量 `ADMIN_EMAIL` 和 `ADMIN_PASSWORD` 自定义。

### 构建

```bash
pnpm build
```

## 环境变量

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `PUBLIC_API_URL` | `http://localhost:3000` | 后端 API 地址 |
| `ADMIN_EMAIL` | `admin@example.com` | 默认管理员邮箱 |
| `ADMIN_PASSWORD` | `admin123` | 默认管理员密码 |
| `JWT_SECRET` | (自动生成) | JWT 签名密钥 |
| `PORT` | `3000` | 后端服务端口 |

---

<a id="english"></a>

## English

A full-stack personal tech blog built with **Astro + Vue 3** frontend and **Fastify + Drizzle ORM** backend, organized as a pnpm monorepo.

### Features

#### Frontend (Astro + Vue 3)
- Server-side rendered blog with responsive design
- Dark mode with system preference detection
- i18n support (Chinese / English), switchable from admin settings
- Markdown content with Shiki syntax highlighting (dual theme)
- Code copy buttons, table of contents, reading time
- Post cards with adaptive grid layout
- Category, tag, and archive pages
- Comment system with threaded replies
- Search with debounce
- Pagination, previous/next post navigation
- SEO: Open Graph, Twitter Cards, sitemap, RSS feed, canonical URLs
- 404 page, back-to-top button

#### Admin Panel
- Dashboard with stats overview
- Post editor with Markdown toolbar, live preview, keyboard shortcuts (Ctrl+S)
- Unsaved changes warning (beforeunload)
- Posts/comments management with bulk actions (select all, bulk publish/delete)
- Category, tag, user, media, and settings management
- Skeleton loading animations
- Comment moderation with status filters
- Responsive sidebar for mobile
- Dark mode support

#### Backend (Fastify + Drizzle)
- RESTful API with JWT authentication (access + refresh tokens)
- SQLite database via libsql
- Markdown rendering with Shiki dual-theme syntax highlighting
- Image upload with static file serving
- Rate limiting on public endpoints
- Auto-seeded admin account

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Astro 6, Vue 3, TypeScript |
| Backend | Fastify 5, Drizzle ORM, libsql (SQLite) |
| Styling | CSS Variables, responsive design |
| Markdown | Marked + Shiki + sanitize-html |
| Auth | JWT (access + refresh tokens), bcrypt |
| Build | pnpm workspaces, tsup, tsx |

### Getting Started

#### Prerequisites

- Node.js >= 20
- pnpm

#### Installation

```bash
git clone https://github.com/Flysoft1337/tech-blog.git
cd tech-blog
pnpm install
```

#### Development

```bash
# Start both frontend and backend
pnpm dev

# Or start separately
pnpm dev:server   # Backend on http://localhost:3000
pnpm dev:web      # Frontend on http://localhost:4321
```

#### Default Admin Account

- Email: `admin@example.com`
- Password: `admin123`

Customize via environment variables `ADMIN_EMAIL` and `ADMIN_PASSWORD`.

#### Build

```bash
pnpm build
```

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PUBLIC_API_URL` | `http://localhost:3000` | Backend API URL |
| `ADMIN_EMAIL` | `admin@example.com` | Default admin email |
| `ADMIN_PASSWORD` | `admin123` | Default admin password |
| `JWT_SECRET` | (auto-generated) | JWT signing secret |
| `PORT` | `3000` | Backend server port |

## License

MIT
