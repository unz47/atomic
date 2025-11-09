import { ElementCategory } from '../data/elementsDB';

// 周期表のカテゴリー別の色定義（PeriodicTable.cssと同じ色）
export const categoryColors: Record<ElementCategory, string> = {
  'alkali-metal': '#ff6b6b',
  'alkaline-earth': '#feca57',
  'transition-metal': '#48dbfb',
  'post-transition': '#1dd1a1',
  'metalloid': '#54a0ff',
  'nonmetal': '#00d2d3',
  'halogen': '#5f27cd',
  'noble-gas': '#c8d6e5',
  'lanthanide': '#ff9ff3',
  'actinide': '#ee5a6f',
};

// カテゴリーに応じた色を取得
export function getCategoryColor(category?: ElementCategory): string {
  if (!category) return '#667eea'; // デフォルト色
  return categoryColors[category];
}
