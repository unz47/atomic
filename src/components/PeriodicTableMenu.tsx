import { useState } from 'react';
import { ElementData } from '../data/elementsDB';
import '../styles/PeriodicTable.css';

interface PeriodicTableMenuProps {
  elements: ElementData[];
  selectedElement: ElementData | null;
  onSelectElement: (element: ElementData | null) => void;
}

export function PeriodicTableMenu({ elements, selectedElement, onSelectElement }: PeriodicTableMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  // 周期表のグリッド位置を計算
  const getGridPosition = (element: ElementData) => {
    // ランタノイド系列: Ce(58)～Lu(71) を第8行に配置（La(57)は除く）
    if (element.category === 'lanthanide' && element.atomicNumber !== 57) {
      return {
        gridRow: 8, // ランタノイド行
        gridColumn: element.atomicNumber - 58 + 3, // Ce(58)が3列目から
      };
    }

    // アクチノイド系列: Th(90)～Lr(103) を第9行に配置（Ac(89)は除く）
    if (element.category === 'actinide' && element.atomicNumber !== 89) {
      return {
        gridRow: 9, // アクチノイド行
        gridColumn: element.atomicNumber - 90 + 3, // Th(90)が3列目から
      };
    }

    // La(57)とAc(89)、その他の元素は通常の周期表位置
    if (!element.period || !element.group) {
      return {};
    }

    return {
      gridRow: element.period,
      gridColumn: element.group,
    };
  };

  const handleElementClick = (element: ElementData) => {
    if (selectedElement?.atomicNumber === element.atomicNumber) {
      onSelectElement(null);
    } else {
      onSelectElement(element);
    }
    // 元素を選択したらメニューを閉じる
    setIsOpen(false);
  };

  return (
    <div className="periodic-table-container">
      <button
        className="toggle-button"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>周期表</span>
        <span className={`toggle-button-arrow ${isOpen ? 'open' : ''}`}>▼</span>
      </button>

      <div className={`periodic-table-menu ${isOpen ? 'open' : ''}`}>
        <div className="periodic-table-grid">
          {elements.map((element) => {
            const isActive = selectedElement?.atomicNumber === element.atomicNumber;
            const gridPosition = getGridPosition(element);
            const categoryClass = element.category || '';

            return (
              <button
                key={element.atomicNumber}
                className={`element-button ${categoryClass} ${isActive ? 'active' : ''}`}
                style={gridPosition}
                onClick={() => handleElementClick(element)}
                title={`${element.nameJa} (${element.name})`}
              >
                <span className="element-number">{element.atomicNumber}</span>
                <span className="element-symbol">{element.symbol}</span>
                <span className="element-name">{element.nameJa}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
