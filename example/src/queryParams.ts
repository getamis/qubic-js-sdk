import qs from 'query-string';

export const parsed = qs.parse(window.location.search);
export const chainId = Number(parsed.chainId) || 1;
export const enableIframe = parsed.enableIframe === 'true';
export const autoHideWelcome = parsed.autoHideWelcome === 'true' || false;
