import { describe, it, expect } from "vitest";
import { zhCN } from "../locales/zh-CN";
import { enUS } from "../locales/en-US";
import { translate, resolveLocale } from "../index";

function extractKeys(obj: Record<string, any>, prefix = ""): string[] {
  let keys: string[] = [];
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      keys = keys.concat(extractKeys(value, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

describe("i18n System and Locales", () => {
  it("has exactly matching key structures between zh-CN and en-US", () => {
    const zhKeys = extractKeys(zhCN).sort();
    const enKeys = extractKeys(enUS).sort();

    const missingInEn = zhKeys.filter((k) => !enKeys.includes(k));
    const missingInZh = enKeys.filter((k) => !zhKeys.includes(k));

    expect(missingInEn, "Keys present in zh-CN but missing in en-US").toEqual([]);
    expect(missingInZh, "Keys present in en-US but missing in zh-CN").toEqual([]);
    expect(zhKeys).toEqual(enKeys);
  });

  it("translates known keys in both languages correctly", () => {
    expect(translate("zh-CN", "common.appName")).toBe(zhCN.common.appName);
    expect(translate("en-US", "common.appName")).toBe(enUS.common.appName);
    expect(translate("zh-CN", "controls.play")).toBe(zhCN.controls.play);
    expect(translate("en-US", "controls.play")).toBe(enUS.controls.play);
  });

  it("handles string interpolation with params correctly", () => {
    const resultZh = translate("zh-CN", "playlist.totalItems", { count: 5 });
    expect(resultZh).toBe("共 5 个文件");

    const resultEn = translate("en-US", "playlist.totalItems", { count: 5 });
    expect(resultEn).toBe("5 items in total");
  });

  it("falls back to zh-CN dictionary when a key is missing in target locale", () => {
    const fakeLocale = "fr-FR" as any;
    expect(translate(fakeLocale, "common.appName")).toBe(zhCN.common.appName);
  });

  it("returns key itself when key does not exist anywhere", () => {
    expect(translate("zh-CN", "non.existent.key" as any)).toBe("non.existent.key");
  });

  it("resolves explicit languages or auto system language", () => {
    expect(resolveLocale("zh-CN")).toBe("zh-CN");
    expect(resolveLocale("en-US")).toBe("en-US");
    const autoLocale = resolveLocale("auto");
    expect(["zh-CN", "en-US"]).toContain(autoLocale);
  });
});
