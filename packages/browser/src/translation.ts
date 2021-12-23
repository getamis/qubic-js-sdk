const language: string = (
  ((window.navigator as any).userLanguage as string) || window.navigator.language
).toLowerCase();

const enUs = {
  ok: 'Ok',
  yes: 'Yes',
  no: 'No',
  'copy-link': 'Copy Link',
  'copy-failed': 'Copy failed. Please copy the link manually',
  'in-app-hint': 'Please open this page in Chrome',
  'in-app-hint-ios': 'Please open this page in Safari',
  'popup-window-hint': 'Attempt to open Qubic to complete the action. Do you want to proceed ?',
};

type localeKeys = keyof typeof enUs;
const zhTw: Record<localeKeys, string> = {
  ok: '好的',
  yes: '是',
  no: '否',
  'copy-link': '複製連結',
  'copy-failed': '複製失敗。請手動複製網址',
  'in-app-hint': '請在 Chrome 中開啟此頁',
  'in-app-hint-ios': '請在 Safari 中開啟此頁',
  'popup-window-hint': '會在新視窗開啟以完成操作，是否繼續？',
};

export const locales: Record<string, Record<localeKeys, string>> = {
  'en-us': enUs,
  'zh-tw': zhTw,
};

export const t = (key: localeKeys): string => {
  return language in locales ? locales[language][key] : locales['en-us'][key];
};
