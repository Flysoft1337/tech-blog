import { defineMiddleware } from "astro:middleware";
import { setServerLocale, getLocaleFromCookieHeader } from "./i18n/index";

export const onRequest = defineMiddleware((context, next) => {
  const cookie = context.request.headers.get("cookie") || "";
  setServerLocale(getLocaleFromCookieHeader(cookie));
  return next();
});
