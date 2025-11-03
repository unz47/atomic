import { ElementData } from '../data/elementsDB';
import { elementsDB } from '../data/elementsDB';

/**
 * 元素データサービス
 * 将来的にAWS DynamoDB/RDS等と連携するための抽象化レイヤー
 */

// API設定
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
const USE_REMOTE_DB = import.meta.env.VITE_USE_REMOTE_DB === 'true';

/**
 * すべての元素を取得
 * 将来的にはAWS APIから取得
 */
export async function fetchAllElements(): Promise<ElementData[]> {
  if (USE_REMOTE_DB) {
    try {
      const response = await fetch(`${API_BASE_URL}/elements`);
      if (!response.ok) {
        throw new Error('Failed to fetch elements from API');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching from remote DB, falling back to local:', error);
      // フォールバック: ローカルDBを使用
      return Object.values(elementsDB).sort((a, b) => a.atomicNumber - b.atomicNumber);
    }
  }

  // ローカルDBを使用（開発環境）
  // 非同期APIの動作をシミュレート
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(Object.values(elementsDB).sort((a, b) => a.atomicNumber - b.atomicNumber));
    }, 100);
  });
}

/**
 * 原子番号で元素を取得
 * @param atomicNumber 原子番号
 */
export async function fetchElementByAtomicNumber(atomicNumber: number): Promise<ElementData | null> {
  if (USE_REMOTE_DB) {
    try {
      const response = await fetch(`${API_BASE_URL}/elements/${atomicNumber}`);
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error('Failed to fetch element from API');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching from remote DB, falling back to local:', error);
      return elementsDB[atomicNumber] || null;
    }
  }

  // ローカルDBを使用
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(elementsDB[atomicNumber] || null);
    }, 50);
  });
}

/**
 * 元素記号で元素を取得
 * @param symbol 元素記号 (例: "H", "He")
 */
export async function fetchElementBySymbol(symbol: string): Promise<ElementData | null> {
  if (USE_REMOTE_DB) {
    try {
      const response = await fetch(`${API_BASE_URL}/elements/symbol/${symbol}`);
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error('Failed to fetch element from API');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching from remote DB, falling back to local:', error);
      return Object.values(elementsDB).find(el => el.symbol === symbol) || null;
    }
  }

  // ローカルDBを使用
  return new Promise((resolve) => {
    setTimeout(() => {
      const element = Object.values(elementsDB).find(el => el.symbol === symbol);
      resolve(element || null);
    }, 50);
  });
}

/**
 * カテゴリで元素をフィルタ
 * @param category 元素カテゴリ
 */
export async function fetchElementsByCategory(category: string): Promise<ElementData[]> {
  if (USE_REMOTE_DB) {
    try {
      const response = await fetch(`${API_BASE_URL}/elements/category/${category}`);
      if (!response.ok) {
        throw new Error('Failed to fetch elements by category from API');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching from remote DB, falling back to local:', error);
      return Object.values(elementsDB).filter(el => el.category === category);
    }
  }

  // ローカルDBを使用
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(Object.values(elementsDB).filter(el => el.category === category));
    }, 50);
  });
}

/**
 * 元素を新規作成（管理者用）
 * @param element 元素データ
 */
export async function createElement(element: Omit<ElementData, 'atomicNumber'>): Promise<ElementData> {
  if (USE_REMOTE_DB) {
    const response = await fetch(`${API_BASE_URL}/elements`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(element),
    });

    if (!response.ok) {
      throw new Error('Failed to create element');
    }

    return await response.json();
  }

  // ローカルでは作成をシミュレート（実際には保存されない）
  throw new Error('Element creation is not supported in local mode');
}

/**
 * 元素を更新（管理者用）
 * @param atomicNumber 原子番号
 * @param updates 更新内容
 */
export async function updateElement(
  atomicNumber: number,
  updates: Partial<ElementData>
): Promise<ElementData> {
  if (USE_REMOTE_DB) {
    const response = await fetch(`${API_BASE_URL}/elements/${atomicNumber}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      throw new Error('Failed to update element');
    }

    return await response.json();
  }

  // ローカルでは更新をシミュレート（実際には保存されない）
  throw new Error('Element update is not supported in local mode');
}

/**
 * 元素を削除（管理者用）
 * @param atomicNumber 原子番号
 */
export async function deleteElement(atomicNumber: number): Promise<void> {
  if (USE_REMOTE_DB) {
    const response = await fetch(`${API_BASE_URL}/elements/${atomicNumber}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete element');
    }

    return;
  }

  // ローカルでは削除をシミュレート（実際には削除されない）
  throw new Error('Element deletion is not supported in local mode');
}
