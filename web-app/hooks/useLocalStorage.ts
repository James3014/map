'use client';

import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
    const [storedValue, setStoredValue] = useState<T>(initialValue);
    const [isLoaded, setIsLoaded] = useState(false);

    // 讀取 localStorage
    useEffect(() => {
        try {
            const item = window.localStorage.getItem(key);
            if (item) {
                setStoredValue(JSON.parse(item));
            }
        } catch (error) {
            console.warn(`Error reading localStorage key "${key}":`, error);
        } finally {
            setIsLoaded(true);
        }
    }, [key]);

    // 寫入 localStorage（含 quota 錯誤處理）
    const setValue = (value: T | ((val: T) => T)) => {
        try {
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
        } catch (error) {
            // 檢測 QuotaExceededError（LocalStorage 容量超限）
            if (
                error instanceof DOMException &&
                (error.name === 'QuotaExceededError' ||
                 error.name === 'NS_ERROR_DOM_QUOTA_REACHED')
            ) {
                console.error(
                    `LocalStorage quota exceeded for key "${key}". ` +
                    'Consider clearing old data or reducing stored data size.'
                );
                // 可選：通知用戶或清理舊數據
                // 目前僅記錄錯誤，不影響 UI 流程
            } else {
                console.warn(`Error setting localStorage key "${key}":`, error);
            }
        }
    };

    return [storedValue, setValue, isLoaded] as const;
}
