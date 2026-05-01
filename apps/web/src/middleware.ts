import { defineMiddleware } from "astro:middleware";
import { getLocaleFromCookieHeader, setServerLocale, runWithLocale } from "./i18n/index";

export const onRequest = defineMiddleware((context, next) => {
  const cookie = context.request.headers.get("cookie") || "";
  const locale = getLocaleFromCookieHeader(cookie);
  setServerLocale(locale);
  return runWithLocale(locale, () => next());
});
