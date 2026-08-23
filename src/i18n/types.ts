import type { TranslationSchema } from "./locales/zh-CN";

export type LanguageCode = "auto" | "zh-CN" | "en-US";
export type SupportedLocale = "zh-CN" | "en-US";
export type { TranslationSchema };

type PathsToStringProps<T> = T extends string
  ? []
  : {
      [K in Extract<keyof T, string>]: [K, ...PathsToStringProps<T[K]>];
    }[Extract<keyof T, string>];

type Join<T extends string[], D extends string> = T extends []
  ? never
  : T extends [infer F]
    ? F
    : T extends [infer F, ...infer R]
      ? F extends string
        ? `${F}${D}${Join<Extract<R, string[]>, D>}`
        : never
      : string;

export type TranslationKey = Join<PathsToStringProps<TranslationSchema>, ".">;
