// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const globalEthereum = typeof window !== 'undefined' ? (window as any).ethereum : undefined;
export const isInQubicDappBrowser = globalEthereum && globalEthereum?.isQubic;
