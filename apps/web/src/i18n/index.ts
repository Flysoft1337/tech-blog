export const defaultLocale = "zh-CN";
export const locales = ["zh-CN", "en"] as const;
export type Locale = (typeof locales)[number];

const translations: Record<Locale, Record<string, string>> = {
  "zh-CN": {
    // Nav
    "nav.home": "首页",
    "nav.categories": "分类",
    "nav.tags": "标签",
    "nav.archives": "归档",
    "nav.rss": "RSS",
    "nav.admin": "管理",
    "nav.search": "搜索...",
    "nav.toggleMenu": "切换菜单",
    "nav.toggleTheme": "切换深色模式",
    "nav.rssFeed": "RSS 订阅",

    // Site
    "site.name": "Tech Blog",
    "site.description": "一个个人技术博客",
    "site.copyright": "Tech Blog. 保留所有权利。",

    // Home
    "home.title": "首页 - Tech Blog",
    "home.searchResults": '搜索结果：“{q}”',
    "home.postsFound": "找到 {count} 篇文章。",
    "home.clearSearch": "清除搜索",
    "home.noResults": "未找到结果",
    "home.tryDifferent": "试试其他关键词或",
    "home.browseAll": "浏览所有文章",
    "home.welcome": "欢迎来到 Tech Blog",
    "home.noPosts": "还没有发布文章。前往",
    "home.adminPanel": "管理面板",
    "home.startWriting": "开始写作。",
    "home.popularPosts": "热门文章",

    // Post
    "post.minRead": "{n} 分钟阅读",
    "post.previous": "上一篇",
    "post.next": "下一篇",
    "post.comments": "评论",
    "post.copy": "复制",
    "post.copied": "已复制！",
    "post.pinned": "置顶",
    "post.toc": "目录",
    "post.readMore": "阅读全文",
    "post.views": "{n} 次阅读",
    "post.relatedPosts": "相关文章",
    "post.series": "系列文章",
    "post.share": "分享",
    "post.copyLink": "复制链接",
    "post.like": "点赞",
    "post.shortcuts": "键盘快捷键",
    "post.toggleShortcuts": "显示/隐藏快捷键",
    "post.closeOverlay": "关闭弹窗",

    // Comment
    "comment.noComments": "暂无评论，来做第一个留言的人！",
    "comment.reply": "回复",
    "comment.cancel": "取消",
    "comment.leaveComment": "发表评论",
    "comment.name": "昵称",
    "comment.email": "邮箱",
    "comment.website": "网站",
    "comment.content": "评论内容",
    "comment.submitting": "提交中...",
    "comment.submit": "提交",
    "comment.submitted": "评论已提交！审核通过后将显示。",
    "comment.justNow": "刚刚",
    "comment.minutesAgo": "{n}分钟前",
    "comment.hoursAgo": "{n}小时前",
    "comment.daysAgo": "{n}天前",

    // 404
    "404.title": "404",
    "404.heading": "页面未找到",
    "404.description": "您访问的页面不存在或已被移动。",
    "404.backHome": "返回首页",
    "404.browseArchives": "浏览归档",

    // Archives
    "archives.title": "归档 - Tech Blog",
    "archives.heading": "归档",
    "archives.totalPosts": "共 {count} 篇文章",
    "archives.draft": "草稿",

    // Categories
    "categories.title": "分类 - Tech Blog",
    "categories.heading": "分类",
    "categories.postCount": "{count} 篇文章",
    "categories.empty": "暂无分类。",

    // Tags
    "tags.title": "标签 - Tech Blog",
    "tags.heading": "标签",
    "tags.empty": "暂无标签。",

    // Category/Tag pages
    "category.title": "分类：{name}",
    "tag.title": "标签：{name}",

    // Pagination
    "pagination.prev": "上一页",
    "pagination.next": "下一页",

    // Back to top
    "backToTop": "返回顶部",

    // ---- Admin ----
    "admin.login": "管理员登录",
    "admin.email": "邮箱",
    "admin.password": "密码",
    "admin.loggingIn": "登录中...",
    "admin.loginBtn": "登录",
    "admin.loginFailed": "登录失败",
    "admin.networkError": "网络错误",

    // Admin nav
    "admin.dashboard": "仪表盘",
    "admin.posts": "文章",
    "admin.categories": "分类",
    "admin.tags": "标签",
    "admin.comments": "评论",
    "admin.media": "媒体",
    "admin.users": "用户",
    "admin.settings": "设置",
    "admin.series": "系列",
    "admin.viewSite": "查看站点",
    "admin.logout": "退出登录",
    "admin.toggleSidebar": "切换侧边栏",

    // Admin dashboard
    "admin.pendingModeration": "{count} 条评论待审核",
    "admin.review": "查看",
    "admin.recentPosts": "最近文章",
    "admin.loading": "加载中...",
    "admin.noData": "暂无数据",

    // Admin table common
    "admin.title": "标题",
    "admin.status": "状态",
    "admin.category": "分类",
    "admin.author": "作者",
    "admin.date": "日期",
    "admin.created": "创建时间",
    "admin.actions": "操作",
    "admin.add": "添加",
    "admin.edit": "编辑",
    "admin.delete": "删除",
    "admin.save": "保存",
    "admin.cancelBtn": "取消",
    "admin.confirm": "确定要执行此操作吗？",
    "admin.created!": "已创建！",
    "admin.deleted!": "已删除！",
    "admin.updated!": "已更新！",
    "admin.prev": "上一页",
    "admin.next": "下一页",
    "admin.name": "名称",
    "admin.slug": "别名",
    "admin.description": "描述",

    // Post list
    "admin.all": "全部",
    "admin.published": "已发布",
    "admin.drafts": "草稿",
    "admin.searchPosts": "搜索文章...",
    "admin.selected": "已选择 {count} 项",
    "admin.publish": "发布",
    "admin.setDraft": "设为草稿",
    "admin.view": "查看",
    "admin.noPosts": "未找到文章",
    "admin.newPost": "新建文章",
    "admin.editPost": "编辑文章",
    "admin.backToPosts": "返回文章列表",
    "admin.bulkPublish": '确定将 {count} 篇文章设为"{status}"？',
    "admin.bulkDeletePosts": "确定删除 {count} 篇文章？此操作不可撤销。",
    "admin.postsUpdated": "{count} 篇文章已更新！",
    "admin.postsDeleted": "{count} 篇文章已删除！",
    "admin.deletePost": "确定删除此文章？",

    // Post editor
    "editor.title": "标题",
    "editor.slug": "别名",
    "editor.content": "内容 (Markdown)",
    "editor.preview": "预览",
    "editor.editMode": "编辑",
    "editor.bold": "粗体",
    "editor.italic": "斜体",
    "editor.code": "代码",
    "editor.link": "链接",
    "editor.image": "图片",
    "editor.heading": "标题",
    "editor.list": "列表",
    "editor.codeBlock": "代码块",
    "editor.chars": "{count} 字符",
    "editor.excerpt": "摘要",
    "editor.statusLabel": "状态",
    "editor.draft": "草稿",
    "editor.publishedStatus": "已发布",
    "editor.pinPost": "置顶此文章",
    "editor.categoryLabel": "分类",
    "editor.none": "无",
    "editor.tagsLabel": "标签",
    "editor.coverImage": "封面图 URL",
    "editor.saving": "保存中...",
    "editor.saveBtn": "保存",
    "editor.saved": "已保存！",
    "editor.postSaved": "文章已保存！",
    "editor.saveFailed": "保存失败",
    "editor.previewFailed": "预览失败",
    "editor.shortcuts": "快捷键",
    "editor.insertIndent": "插入缩进",
    "editor.savePost": "保存文章",
    "editor.selectImage": "选择图片",
    "editor.words": "{count} 字",
    "editor.scheduled": "定时发布",
    "editor.scheduledAt": "发布时间",
    "editor.seriesLabel": "系列",
    "editor.seriesOrder": "系列排序",
    "editor.autoSaved": "自动保存于 {time}",
    "editor.versionHistory": "版本历史",
    "editor.viewVersions": "查看历史版本",
    "editor.restore": "恢复",
    "editor.confirmRestore": "确定恢复到此版本？当前内容将被替换。",
    "editor.restored": "版本已恢复！",

    // Comment manager
    "admin.pending": "待审核",
    "admin.approved": "已通过",
    "admin.spam": "垃圾",
    "admin.approve": "通过",
    "admin.markSpam": "垃圾",
    "admin.noComments": "暂无评论",
    "admin.searchComments": "搜索评论...",
    "admin.commentUpdated": "评论已{status}！",
    "admin.deleteComment": "确定删除此评论？",
    "admin.bulkApprove": '确定将 {count} 条评论设为"{status}"？',
    "admin.bulkDeleteComments": "确定删除 {count} 条评论？此操作不可撤销。",
    "admin.commentsUpdated": "{count} 条评论已更新！",
    "admin.commentsDeleted": "{count} 条评论已删除！",
    "admin.commentCol": "评论",
    "admin.postCol": "文章",

    // Media
    "admin.dragFiles": "拖拽文件到此处或点击浏览",
    "admin.uploading": "上传中...",
    "admin.copyUrl": "复制链接",
    "admin.uploadComplete": "上传完成！",
    "admin.deleteFile": "确定删除此文件？",
    "admin.urlCopied": "链接已复制！",

    // Users
    "admin.addUser": "添加用户",
    "admin.displayName": "显示名称",
    "admin.role": "角色",
    "admin.editor": "编辑者",
    "admin.adminRole": "管理员",
    "admin.editUser": "编辑用户",
    "admin.newPassword": "新密码（留空则不修改）",
    "admin.noUsers": "暂无用户",
    "admin.userCreated": "用户已创建！",
    "admin.userCreateFailed": "创建用户失败",
    "admin.deleteUser": "确定删除此用户？",
    "admin.userUpdated": "用户已更新！",
    "admin.userUpdateFailed": "更新用户失败",
    "admin.userDeleted": "用户已删除！",
    "admin.userDeleteFailed": "删除用户失败",

    // Settings
    "admin.siteName": "站点名称",
    "admin.siteDescription": "站点描述",
    "admin.siteUrl": "站点 URL",
    "admin.logoUrl": "Logo URL",
    "admin.postsPerPage": "每页文章数",
    "admin.requireModeration": "评论需要审核",
    "admin.savingSettings": "保存中...",
    "admin.saveSettings": "保存设置",
    "admin.settingsSaved": "设置已保存！",

    // Language
    "admin.language": "界面语言",
    "admin.langZh": "中文",
    "admin.langEn": "English",

    // Analytics
    "admin.analytics": "数据分析",
    "admin.totalViews": "总浏览量",
    "admin.recentComments7d": "近7天评论",
    "admin.topPosts": "热门文章",
    "admin.views": "浏览量",
    "admin.publishHistory": "发布趋势",
    "admin.exportPosts": "导出文章",
  },
  en: {
    // Nav
    "nav.home": "Home",
    "nav.categories": "Categories",
    "nav.tags": "Tags",
    "nav.archives": "Archives",
    "nav.rss": "RSS",
    "nav.admin": "Admin",
    "nav.search": "Search...",
    "nav.toggleMenu": "Toggle menu",
    "nav.toggleTheme": "Toggle dark mode",
    "nav.rssFeed": "RSS Feed",

    // Site
    "site.name": "Tech Blog",
    "site.description": "A personal tech blog",
    "site.copyright": "Tech Blog. All rights reserved.",

    // Home
    "home.title": "Home - Tech Blog",
    "home.searchResults": "Search results for \"{q}\"",
    "home.postsFound": "{count} post(s) found.",
    "home.clearSearch": "Clear search",
    "home.noResults": "No results found",
    "home.tryDifferent": "Try different keywords or",
    "home.browseAll": "browse all posts",
    "home.welcome": "Welcome to Tech Blog",
    "home.noPosts": "No posts published yet. Start writing from the",
    "home.adminPanel": "admin panel",
    "home.startWriting": ".",
    "home.popularPosts": "Popular Posts",

    // Post
    "post.minRead": "{n} min read",
    "post.previous": "Previous",
    "post.next": "Next",
    "post.comments": "Comments",
    "post.copy": "Copy",
    "post.copied": "Copied!",
    "post.pinned": "Pinned",
    "post.toc": "Table of Contents",
    "post.readMore": "Read more",
    "post.views": "{n} views",
    "post.relatedPosts": "Related Posts",
    "post.series": "Series",
    "post.share": "Share",
    "post.copyLink": "Copy link",
    "post.like": "Like",
    "post.shortcuts": "Keyboard Shortcuts",
    "post.toggleShortcuts": "Toggle shortcuts",
    "post.closeOverlay": "Close overlay",

    // Comment
    "comment.noComments": "No comments yet. Be the first!",
    "comment.reply": "Reply",
    "comment.cancel": "Cancel",
    "comment.leaveComment": "Leave a Comment",
    "comment.name": "Name",
    "comment.email": "Email",
    "comment.website": "Website",
    "comment.content": "Comment",
    "comment.submitting": "Submitting...",
    "comment.submit": "Submit",
    "comment.submitted": "Comment submitted! It will appear after moderation.",
    "comment.justNow": "just now",
    "comment.minutesAgo": "{n}m ago",
    "comment.hoursAgo": "{n}h ago",
    "comment.daysAgo": "{n}d ago",

    // 404
    "404.title": "404",
    "404.heading": "Page Not Found",
    "404.description": "The page you are looking for doesn't exist or has been moved.",
    "404.backHome": "Back to Home",
    "404.browseArchives": "Browse Archives",

    // Archives
    "archives.title": "Archives - Tech Blog",
    "archives.heading": "Archives",
    "archives.totalPosts": "{count} posts in total",
    "archives.draft": "Draft",

    // Categories
    "categories.title": "Categories - Tech Blog",
    "categories.heading": "Categories",
    "categories.postCount": "{count} post(s)",
    "categories.empty": "No categories yet.",

    // Tags
    "tags.title": "Tags - Tech Blog",
    "tags.heading": "Tags",
    "tags.empty": "No tags yet.",

    // Category/Tag pages
    "category.title": "Category: {name}",
    "tag.title": "Tag: {name}",

    // Pagination
    "pagination.prev": "Prev",
    "pagination.next": "Next",

    // Back to top
    "backToTop": "Back to top",

    // ---- Admin ----
    "admin.login": "Admin Login",
    "admin.email": "Email",
    "admin.password": "Password",
    "admin.loggingIn": "Logging in...",
    "admin.loginBtn": "Login",
    "admin.loginFailed": "Login failed",
    "admin.networkError": "Network error",

    // Admin nav
    "admin.dashboard": "Dashboard",
    "admin.posts": "Posts",
    "admin.categories": "Categories",
    "admin.tags": "Tags",
    "admin.comments": "Comments",
    "admin.media": "Media",
    "admin.users": "Users",
    "admin.settings": "Settings",
    "admin.series": "Series",
    "admin.viewSite": "View Site",
    "admin.logout": "Logout",
    "admin.toggleSidebar": "Toggle sidebar",

    // Admin dashboard
    "admin.pendingModeration": "{count} comments pending moderation",
    "admin.review": "Review",
    "admin.recentPosts": "Recent Posts",
    "admin.loading": "Loading...",
    "admin.noData": "No data",

    // Admin table common
    "admin.title": "Title",
    "admin.status": "Status",
    "admin.category": "Category",
    "admin.author": "Author",
    "admin.date": "Date",
    "admin.created": "Created",
    "admin.actions": "Actions",
    "admin.add": "Add",
    "admin.edit": "Edit",
    "admin.delete": "Delete",
    "admin.save": "Save",
    "admin.cancelBtn": "Cancel",
    "admin.confirm": "Are you sure?",
    "admin.created!": "Created!",
    "admin.deleted!": "Deleted!",
    "admin.updated!": "Updated!",
    "admin.prev": "Prev",
    "admin.next": "Next",
    "admin.name": "Name",
    "admin.slug": "Slug",
    "admin.description": "Description",

    // Post list
    "admin.all": "All",
    "admin.published": "Published",
    "admin.drafts": "Drafts",
    "admin.searchPosts": "Search posts...",
    "admin.selected": "{count} selected",
    "admin.publish": "Publish",
    "admin.setDraft": "Set Draft",
    "admin.view": "View",
    "admin.noPosts": "No posts found",
    "admin.newPost": "New Post",
    "admin.editPost": "Edit Post",
    "admin.backToPosts": "Back to Posts",
    "admin.bulkPublish": "Set {count} posts to \"{status}\"?",
    "admin.bulkDeletePosts": "Delete {count} posts? This cannot be undone.",
    "admin.postsUpdated": "{count} posts updated!",
    "admin.postsDeleted": "{count} posts deleted!",
    "admin.deletePost": "Delete this post?",

    // Post editor
    "editor.title": "Title",
    "editor.slug": "Slug",
    "editor.content": "Content (Markdown)",
    "editor.preview": "Preview",
    "editor.editMode": "Edit",
    "editor.bold": "Bold",
    "editor.italic": "Italic",
    "editor.code": "Code",
    "editor.link": "Link",
    "editor.image": "Img",
    "editor.heading": "H2",
    "editor.list": "List",
    "editor.codeBlock": "Block",
    "editor.chars": "{count} chars",
    "editor.excerpt": "Excerpt",
    "editor.statusLabel": "Status",
    "editor.draft": "Draft",
    "editor.publishedStatus": "Published",
    "editor.pinPost": "Pin this post",
    "editor.categoryLabel": "Category",
    "editor.none": "None",
    "editor.tagsLabel": "Tags",
    "editor.coverImage": "Cover Image URL",
    "editor.saving": "Saving...",
    "editor.saveBtn": "Save",
    "editor.saved": "Saved!",
    "editor.postSaved": "Post saved!",
    "editor.saveFailed": "Failed to save",
    "editor.previewFailed": "Preview failed",
    "editor.shortcuts": "Keyboard Shortcuts",
    "editor.insertIndent": "Insert indent",
    "editor.savePost": "Save post",
    "editor.selectImage": "Select Image",
    "editor.words": "{count} words",
    "editor.scheduled": "Scheduled",
    "editor.scheduledAt": "Publish At",
    "editor.seriesLabel": "Series",
    "editor.seriesOrder": "Series Order",
    "editor.autoSaved": "Auto-saved at {time}",
    "editor.versionHistory": "Version History",
    "editor.viewVersions": "View Versions",
    "editor.restore": "Restore",
    "editor.confirmRestore": "Restore to this version? Current content will be replaced.",
    "editor.restored": "Version restored!",

    // Comment manager
    "admin.pending": "Pending",
    "admin.approved": "Approved",
    "admin.spam": "Spam",
    "admin.approve": "Approve",
    "admin.markSpam": "Spam",
    "admin.noComments": "No comments",
    "admin.searchComments": "Search comments...",
    "admin.commentUpdated": "Comment {status}!",
    "admin.deleteComment": "Delete this comment?",
    "admin.bulkApprove": "Set {count} comments to \"{status}\"?",
    "admin.bulkDeleteComments": "Delete {count} comments? This cannot be undone.",
    "admin.commentsUpdated": "{count} comments updated!",
    "admin.commentsDeleted": "{count} comments deleted!",
    "admin.commentCol": "Comment",
    "admin.postCol": "Post",

    // Media
    "admin.dragFiles": "Drag files here or browse",
    "admin.uploading": "Uploading...",
    "admin.copyUrl": "Copy URL",
    "admin.uploadComplete": "Upload complete!",
    "admin.deleteFile": "Delete this file?",
    "admin.urlCopied": "URL copied!",

    // Users
    "admin.addUser": "Add User",
    "admin.displayName": "Display Name",
    "admin.role": "Role",
    "admin.editor": "Editor",
    "admin.adminRole": "Admin",
    "admin.editUser": "Edit User",
    "admin.newPassword": "New Password (leave blank to keep)",
    "admin.noUsers": "No users",
    "admin.userCreated": "User created!",
    "admin.userCreateFailed": "Failed to create user",
    "admin.deleteUser": "Delete this user?",
    "admin.userUpdated": "User updated!",
    "admin.userUpdateFailed": "Failed to update user",
    "admin.userDeleted": "User deleted!",
    "admin.userDeleteFailed": "Failed to delete user",

    // Settings
    "admin.siteName": "Site Name",
    "admin.siteDescription": "Site Description",
    "admin.siteUrl": "Site URL",
    "admin.logoUrl": "Logo URL",
    "admin.postsPerPage": "Posts Per Page",
    "admin.requireModeration": "Require comment moderation",
    "admin.savingSettings": "Saving...",
    "admin.saveSettings": "Save Settings",
    "admin.settingsSaved": "Settings saved!",

    // Language
    "admin.language": "Language",
    "admin.langZh": "中文",
    "admin.langEn": "English",

    // Analytics
    "admin.analytics": "Analytics",
    "admin.totalViews": "Total Views",
    "admin.recentComments7d": "Comments (7d)",
    "admin.topPosts": "Top Posts",
    "admin.views": "Views",
    "admin.publishHistory": "Publish History",
    "admin.exportPosts": "Export Posts",
  },
};

let _serverLocale: Locale | null = null;

let currentLocale: Locale = defaultLocale;

export function setLocale(locale: Locale) {
  currentLocale = locale;
  if (typeof document !== "undefined") {
    document.cookie = `locale=${locale};path=/;max-age=${365 * 86400}`;
    localStorage.setItem("locale", locale);
  }
}

export function getLocale(): Locale {
  if (_serverLocale) return _serverLocale;
  if (typeof document !== "undefined") {
    const match = document.cookie.match(/(?:^|;\s*)locale=([^;]*)/);
    if (match) {
      const val = match[1] as Locale;
      if (locales.includes(val)) return val;
    }
    const saved = localStorage.getItem("locale") as Locale | null;
    if (saved && locales.includes(saved)) {
      document.cookie = `locale=${saved};path=/;max-age=${365 * 86400}`;
      return saved;
    }
  }
  return defaultLocale;
}

export function initLocale(astroRequest?: Request) {
  if (astroRequest) {
    const cookie = astroRequest.headers.get("cookie") || "";
    setServerLocale(getLocaleFromCookieHeader(cookie));
  }
}

export function getLocaleFromCookieHeader(cookieHeader?: string): Locale {
  if (!cookieHeader) return defaultLocale;
  const match = cookieHeader.match(/(?:^|;\s*)locale=([^;]*)/);
  if (match) {
    const val = match[1] as Locale;
    if (locales.includes(val)) return val;
  }
  return defaultLocale;
}

export function setServerLocale(locale: Locale) {
  _serverLocale = locale;
}

export function runWithLocale<T>(locale: Locale, fn: () => T): T {
  const prev = _serverLocale;
  _serverLocale = locale;
  try {
    return fn();
  } finally {
    _serverLocale = prev;
  }
}

export function t(key: string, params?: Record<string, string | number>): string {
  const locale = getLocale();
  let text = translations[locale]?.[key] || translations[defaultLocale]?.[key] || key;
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      text = text.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
    }
  }
  return text;
}

export function getTranslations(locale?: Locale) {
  return translations[locale || getLocale()];
}
