export interface Media {
  id: number;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  uploaderId: number;
  createdAt: string;
}

export interface SiteSetting {
  key: string;
  value: string;
}

export interface SiteSettings {
  siteName: string;
  siteDescription: string;
  siteLogo?: string;
  siteUrl: string;
  postsPerPage: number;
  commentModeration: boolean;
  [key: string]: string | number | boolean | undefined;
}
