import BrowserProvider from './BrowserProvider';
import { getPersistedData } from './utils/persistData';

export type { BrowserProviderOptions } from './BrowserProvider';
export { BrowserProvider, getPersistedData };
export default BrowserProvider;
export { isInQubicDappBrowser, globalEthereum } from './utils/isInQubicDappBrowser';
