module.exports = {
  apps: [
    {
      name: "blog-api",
      script: "./server/dist/index.js",
      cwd: "/opt/blog",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
        DATABASE_PATH: "/opt/blog/data/blog.db",
        UPLOAD_DIR: "/opt/blog/data/uploads",
      },
      instances: 1,
      autorestart: true,
      max_memory_restart: "300M",
    },
    {
      name: "blog-web",
      script: "./web/dist/server/entry.mjs",
      cwd: "/opt/blog",
      env: {
        NODE_ENV: "production",
        HOST: "0.0.0.0",
        PORT: 4321,
        PUBLIC_API_URL: "http://127.0.0.1:3000",
      },
      instances: 1,
      autorestart: true,
      max_memory_restart: "300M",
    },
  ],
};
