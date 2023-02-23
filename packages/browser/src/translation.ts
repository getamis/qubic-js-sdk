const language: string = (
  ((window.navigator as any).userLanguage as string) || window.navigator.language
).toLowerCase();

const enUs = {
  yes: 'Yes',
  no: 'No',
  'popup-window-hint': 'Attempt to open Qubic to complete the action. Do you want to proceed ?',
};

type localeKeys = keyof typeof enUs;
const zhTw: Record<localeKeys, string> = {
  yes: '是',
  no: '否',
  'popup-window-hint': '會在新視窗開啟以完成操作，是否繼續？',
};

const locales: Record<string, Record<localeKeys, string>> = {
  'en-us': enUs,
  'zh-tw': zhTw,
};

export const t = (key: localeKeys): string => {
  return language in locales ? locales[language][key] : locales['en-us'][key];
};
