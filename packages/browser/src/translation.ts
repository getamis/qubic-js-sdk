const language: string = (
  ((window.navigator as any).userLanguage as string) || window.navigator.language
).toLowerCase();

const enUs = {
  ok: 'Ok',
  yes: 'Yes',
  no: 'No',
  'in-app-hint': 'Please open this page in Safari or Chrome',
  'popup-window-hint': 'Attempt to open Qubic to complete the action. Do you want to proceed ?',
};

type localeKeys = keyof typeof enUs;
const zhTw: Record<localeKeys, string> = {
  ok: '好的',
  yes: '是',
  no: '否',
  'in-app-hint': '請在 Safari 或是 Chrome 中開啟此頁',
  'popup-window-hint': '會在新視窗開啟以完成操作，是否繼續？',
};

export const locales: Record<string, Record<localeKeys, string>> = {
  'en-us': enUs,
  'zh-tw': zhTw,
};

export const t = (key: localeKeys): string => {
  return language in locales ? locales[language][key] : locales['en-US'][key];
};