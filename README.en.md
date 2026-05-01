# Tech Blog

[中文](./README.md) | English

A full-stack personal tech blog built with **Astro + Vue 3** frontend and **Fastify + Drizzle ORM** backend, organized as a pnpm monorepo.

## Features

### Frontend (Astro + Vue 3)
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

### Admin Panel
- Dashboard with stats overview
- Post editor with Markdown toolbar, live preview, keyboard shortcuts (Ctrl+S)
- Unsaved changes warning (beforeunload)
- Posts/comments management with bulk actions (select all, bulk publish/delete)
- Category, tag, user, media, and settings management
- Skeleton loading animations
- Comment moderation with status filters
- Responsive sidebar for mobile
- Dark mode support

### Backend (Fastify + Drizzle)
- RESTful API with JWT authentication (access + refresh tokens)
- SQLite database via libsql
- Markdown rendering with Shiki dual-theme syntax highlighting
- Image upload with static file serving
- Rate limiting on public endpoints
- Auto-seeded admin account

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Astro 6, Vue 3, TypeScript |
| Backend | Fastify 5, Drizzle ORM, libsql (SQLite) |
| Styling | CSS Variables, responsive design |
| Markdown | Marked + Shiki + sanitize-html |
| Auth | JWT (access + refresh tokens), bcrypt |
| Build | pnpm workspaces, tsup, tsx |

## Project Structure

```
tech-blog/
├── apps/
│   ├── web/                  # Astro + Vue frontend
│   │   └── src/
│   │       ├── components/   # Astro & Vue components
│   │       ├── i18n/         # i18n translations (zh-CN, en)
│   │       ├── layouts/      # Blog & Admin layouts
│   │       ├── pages/        # Routes (blog + admin)
│   │       ├── styles/       # Global & admin CSS
│   │       └── middleware.ts  # Locale detection middleware
│   └── server/               # Fastify backend
│       └── src/
│           ├── db/           # Schema & database setup
│           ├── routes/       # API routes
│           └── services/     # Markdown rendering
└── packages/
    └── shared/               # Shared types & utilities
```

## Getting Started

### Prerequisites

- Node.js >= 20
- pnpm

### Installation

```bash
git clone https://github.com/Flysoft1337/tech-blog.git
cd tech-blog
pnpm install
```

### Development

```bash
# Start both frontend and backend
pnpm dev

# Or start separately
pnpm dev:server   # Backend on http://localhost:3000
pnpm dev:web      # Frontend on http://localhost:4321
```

### Default Admin Account

- Email: `admin@example.com`
- Password: `admin123`

Customize via environment variables `ADMIN_EMAIL` and `ADMIN_PASSWORD`.

### Build

```bash
pnpm build
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PUBLIC_API_URL` | `http://localhost:3000` | Backend API URL |
| `ADMIN_EMAIL` | `admin@example.com` | Default admin email |
| `ADMIN_PASSWORD` | `admin123` | Default admin password |
| `JWT_SECRET` | (auto-generated) | JWT signing secret |
| `PORT` | `3000` | Backend server port |

## License

MIT
