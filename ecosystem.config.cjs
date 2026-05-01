module.exports = {
  apps: [
    {
      name: "tech-blog",
      script: "./server/dist/index.js",
      cwd: "/opt/blog",
      env: {
        NODE_ENV: "production",
        PORT: 80,
        DATABASE_PATH: "/opt/blog/data/blog.db",
        UPLOAD_DIR: "/opt/blog/data/uploads",
      },
      instances: 1,
      autorestart: true,
      max_memory_restart: "500M",
    },
  ],
};
