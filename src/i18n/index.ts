import { useMemo } from 'react';
import { en, type Translation } from './locales/en';
import { zhCN } from './locales/zh-CN';

export type Language = 'en' | 'zh-CN';

export const LOCALES: { code: Language; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'zh-CN', label: '中文' },
];

const TRANSLATIONS: Record<Language, Translation> = {
  en,
  'zh-CN': zhCN,
};

// 站点根 URL（用于 canonical/hreflang，可按实际部署域名调整）
export const SITE_ORIGIN = 'https://image-tools.667374.xyz';

/**
 * 根据浏览器路径判断当前语言：
 *   /zh-CN  或 /zh-CN/... → 中文
 *   其余（如 /、/foo）       → 英文
 */
export function getLanguageFromPath(pathname: string): Language {
  return pathname.replace(/\/+$/, '').startsWith('/zh-CN') ? 'zh-CN' : 'en';
}

/** 返回当前语言对应的 URL 路径前缀，如 '/zh-CN' 或 '' */
export function languagePrefix(lang: Language): string {
  return lang === 'en' ? '' : '/zh-CN';
}

/** 当前语言的另一语言，用于切换 */
export function otherLanguage(lang: Language): Language {
  return lang === 'en' ? 'zh-CN' : 'en';
}

/**
 * React hook：根据 window.location.pathname 返回当前语言的文案对象。
 * 由于语言切换走整页跳转，pathname 在挂载后即固定，无需监听变化。
 */
export function useTranslation(): { lang: Language; t: Translation } {
  const lang = useMemo(
    () => getLanguageFromPath(window.location.pathname),
    []
  );
  return { lang, t: TRANSLATIONS[lang] };
}

/**
 * 切换到目标语言：整页跳转到对应 URL。
 * 同页面切换为整页跳转，使浏览器加载新的 HTML（含对应语言的 meta），
 * 对 SEO 友好——爬虫与真实用户拿到的是同语言版本的 HTML。
 */
export function switchLanguage(target: Language): void {
  const current = getLanguageFromPath(window.location.pathname);
  if (target === current) return;

  // 保留其余路径与 query/hash，仅替换语言前缀
  const { pathname, search, hash } = window.location;
  const rest = pathname.replace(/^\/zh-CN(\/|$)/, '$1'); // 去掉中文前缀
  const targetPath = (target === 'en' ? '' : '/zh-CN') + rest;
  window.location.href = targetPath + search + hash;
}
