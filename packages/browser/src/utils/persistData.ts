export const STORAGE_KEY = '@qubic-js';

export function getPersistedData(): { accounts: string[]; chainId: string } | null {
  try {
    const result = localStorage.getItem(`${STORAGE_KEY}/accounts`);
    if (!result) return null;
    const accounts = JSON.parse(result || '[]') as string[];
    if (accounts.length === 0) return null;
    const chainId = localStorage.getItem(`${STORAGE_KEY}/chainId`);
    if (!chainId) return null;

    return {
      accounts,
      chainId,
    };
  } catch (error) {
    // silent failed
    return null;
  }
}

export function clearPersistedData(): void {
  localStorage.removeItem(`${STORAGE_KEY}/accounts`);
  localStorage.removeItem(`${STORAGE_KEY}/chainId`);
}

export function setPersistedData(key: 'accounts' | 'chainId', stringifiedValue: string): void {
  localStorage.setItem(`${STORAGE_KEY}/${key}`, stringifiedValue);
}
