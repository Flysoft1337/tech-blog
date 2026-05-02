import type { APIRoute } from "astro";

export const prerender = false;

function escapeXml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}

export const GET: APIRoute = async ({ params }) => {
  const API_BASE = import.meta.env.PUBLIC_API_URL || "http://localhost:3000";
  const slug = params.slug;

  let posts: any[] = [];
  let categoryName = slug || "";
  let siteSettings: Record<string, string> = {};

  try {
    const [postsRes, settingsRes, catsRes] = await Promise.all([
      fetch(`${API_BASE}/api/v1/posts?pageSize=20&category=${slug}`),
      fetch(`${API_BASE}/api/v1/settings`),
      fetch(`${API_BASE}/api/v1/categories`),
    ]);
    const postsData = await postsRes.json();
    const settingsData = await settingsRes.json();
    const catsData = await catsRes.json();
    if (postsData.success) posts = postsData.data.items;
    if (settingsData.success) siteSettings = settingsData.data;
    if (catsData.success) {
      const cat = catsData.data.find((c: any) => c.slug === slug);
      if (cat) categoryName = cat.name;
    }
  } catch {}

  const siteName = siteSettings.siteName || "Tech Blog";
  const siteUrl = siteSettings.siteUrl || "https://example.com";

  const items = posts.map((post: any) => `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${siteUrl}/post/${post.slug}</link>
      <guid>${siteUrl}/post/${post.slug}</guid>
      <pubDate>${new Date(post.publishedAt || post.createdAt).toUTCString()}</pubDate>
      <description>${escapeXml(post.excerpt || "")}</description>
    </item>`).join("\n");

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(siteName)} - ${escapeXml(categoryName)}</title>
    <link>${siteUrl}/category/${slug}</link>
    <description>${escapeXml(categoryName)} - ${escapeXml(siteName)}</description>
    <language>zh-CN</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${siteUrl}/rss/category/${slug}.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
};
