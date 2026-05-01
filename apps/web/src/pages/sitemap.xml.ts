import type { APIRoute } from "astro";

export const GET: APIRoute = async () => {
  const API_BASE = import.meta.env.PUBLIC_API_URL || "http://localhost:3000";

  let posts: any[] = [];
  let categories: any[] = [];
  let tags: any[] = [];
  let siteUrl = "https://example.com";

  try {
    const [postsRes, catsRes, tagsRes, settingsRes] = await Promise.all([
      fetch(`${API_BASE}/api/v1/posts?pageSize=1000`),
      fetch(`${API_BASE}/api/v1/categories`),
      fetch(`${API_BASE}/api/v1/tags`),
      fetch(`${API_BASE}/api/v1/settings`),
    ]);
    const postsData = await postsRes.json();
    const catsData = await catsRes.json();
    const tagsData = await tagsRes.json();
    const settingsData = await settingsRes.json();

    if (postsData.success) posts = postsData.data.items;
    if (catsData.success) categories = catsData.data;
    if (tagsData.success) tags = tagsData.data;
    if (settingsData.success && settingsData.data.siteUrl) siteUrl = settingsData.data.siteUrl;
  } catch {}

  const urls: { loc: string; lastmod?: string; priority: string }[] = [
    { loc: siteUrl, priority: "1.0" },
    { loc: `${siteUrl}/archives`, priority: "0.6" },
  ];

  for (const post of posts) {
    urls.push({
      loc: `${siteUrl}/post/${post.slug}`,
      lastmod: post.publishedAt || post.createdAt,
      priority: post.pinned ? "0.9" : "0.8",
    });
  }

  for (const cat of categories) {
    if (cat.postCount > 0) {
      urls.push({ loc: `${siteUrl}/category/${cat.slug}`, priority: "0.5" });
    }
  }

  for (const tag of tags) {
    if (tag.postCount > 0) {
      urls.push({ loc: `${siteUrl}/tag/${tag.slug}`, priority: "0.4" });
    }
  }

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>${u.lastmod ? `\n    <lastmod>${new Date(u.lastmod).toISOString().split("T")[0]}</lastmod>` : ""}
    <priority>${u.priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
};
