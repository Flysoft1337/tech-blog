import type { APIRoute } from "astro";

function escapeXml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export const GET: APIRoute = async () => {
  const API_BASE = import.meta.env.PUBLIC_API_URL || "http://localhost:3000";

  let posts: any[] = [];
  let siteSettings: Record<string, string> = {};

  try {
    const [postsRes, settingsRes] = await Promise.all([
      fetch(`${API_BASE}/api/v1/posts?pageSize=20`),
      fetch(`${API_BASE}/api/v1/settings`),
    ]);
    const postsData = await postsRes.json();
    const settingsData = await settingsRes.json();
    if (postsData.success) posts = postsData.data.items;
    if (settingsData.success) siteSettings = settingsData.data;
  } catch {}

  const siteName = siteSettings.siteName || "Tech Blog";
  const siteDescription = siteSettings.siteDescription || "A personal tech blog";
  const siteUrl = siteSettings.siteUrl || "https://example.com";

  const items = posts
    .map(
      (post: any) => `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${siteUrl}/post/${post.slug}</link>
      <guid>${siteUrl}/post/${post.slug}</guid>
      <pubDate>${new Date(post.publishedAt || post.createdAt).toUTCString()}</pubDate>
      <description>${escapeXml(post.excerpt || "")}</description>
      ${post.categoryName ? `<category>${escapeXml(post.categoryName)}</category>` : ""}
      <author>${escapeXml(post.authorName || "Admin")}</author>
    </item>`
    )
    .join("\n");

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(siteName)}</title>
    <link>${siteUrl}</link>
    <description>${escapeXml(siteDescription)}</description>
    <language>zh-CN</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${siteUrl}/rss.xml" rel="self" type="application/rss+xml"/>
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
