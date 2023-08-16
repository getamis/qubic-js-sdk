const language: string =
  typeof window !== 'undefined'
    ? (((window.navigator as any).userLanguage as string) || window.navigator.language).toLowerCase()
    : 'en--us';

const enUs = {
  yes: 'Yes',
  no: 'No',
  'popup-window-hint': 'Attempt to open Qubic to complete the action. Do you want to proceed ?',
};

type TransKey = keyof typeof enUs;
const zhTw: Record<TransKey, string> = {
  yes: '是',
  no: '否',
  'popup-window-hint': '會在新視窗開啟以完成操作，是否繼續？',
};

// this should be written with typescript satisfies but cra doesn't support this feature
// https://github.com/facebook/create-react-app/issues/12978
enum LocaleKey {
  'en-us' = 'en-us',
  'zh-tw' = 'zh-tw',
}

const locales: Record<LocaleKey, Record<TransKey, string>> = {
  [LocaleKey['en-us']]: enUs,
  [LocaleKey['zh-tw']]: zhTw,
};

// type LocaleKey = keyof typeof locales;

export const t = (key: TransKey): string => {
  return language in locales ? locales[language as LocaleKey][key] : locales['en-us'][key];
};
