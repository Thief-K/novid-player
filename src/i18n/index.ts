import { useCallback } from "react";
import { zhCN } from "./locales/zh-CN";
import { enUS } from "./locales/en-US";
import type { LanguageCode, SupportedLocale, TranslationKey, TranslationSchema } from "./types";
import { usePlayerStore } from "../stores/playerStore";

export const dictionaries: Record<SupportedLocale, TranslationSchema> = {
  "zh-CN": zhCN,
  "en-US": enUS,
};

export function getSystemLocale(): SupportedLocale {
  if (typeof navigator !== "undefined" && navigator.language) {
    const lang = navigator.language.toLowerCase();
    if (lang.startsWith("zh")) {
      return "zh-CN";
    }
  }
  return "en-US";
}

export function resolveLocale(lang: LanguageCode): SupportedLocale {
  if (lang === "auto") {
    return getSystemLocale();
  }
  return lang;
}

export function translate(
  locale: SupportedLocale,
  key: TranslationKey,
  params?: Record<string, string | number>
): string {
  const dict = dictionaries[locale] || dictionaries["zh-CN"];
  const parts = key.split(".");
  let current: any = dict;

  for (const part of parts) {
    if (current && typeof current === "object" && part in current) {
      current = current[part];
    } else {
      let fallback: any = dictionaries["zh-CN"];
      for (const p of parts) {
        if (fallback && typeof fallback === "object" && p in fallback) {
          fallback = fallback[p];
        } else {
          return key;
        }
      }
      current = fallback;
      break;
    }
  }

  if (typeof current !== "string") {
    return key;
  }

  if (params) {
    return Object.entries(params).reduce((str, [k, v]) => {
      return str.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
    }, current);
  }

  return current;
}

export function t(key: TranslationKey, params?: Record<string, string | number>): string {
  const lang = usePlayerStore.getState().language;
  return translate(resolveLocale(lang), key, params);
}

export function useTranslation() {
  const language = usePlayerStore((state) => state.language);
  const resolvedLocale = resolveLocale(language);

  const tFn = useCallback(
    (key: TranslationKey, params?: Record<string, string | number>) => {
      return translate(resolvedLocale, key, params);
    },
    [resolvedLocale]
  );

  return {
    t: tFn,
    language,
    resolvedLocale,
  };
}

export * from "./types";
