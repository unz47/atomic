import { ElementData } from '../data/elementsDB';
import { getCategoryColor } from '../utils/categoryColors';

interface ElementInfoProps {
  element: ElementData;
}

export function ElementInfo({ element }: ElementInfoProps) {
  // 電子数を計算
  const electrons = element.electronShells.reduce((sum, shell) => sum + shell.electrons, 0);

  // 元素のカテゴリーに応じた色を取得
  const elementColor = getCategoryColor(element.category);

  return (
    <>
      <style>
        {`
          @keyframes rotateSymbol {
            0%, 100% {
              transform: rotateX(0deg);
            }
            50% {
              transform: rotateX(180deg);
            }
          }
        `}
      </style>
      <div
      style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        backgroundColor: 'rgba(26, 26, 46, 0.9)',
        padding: '20px 30px',
        borderRadius: '15px',
        border: '2px solid rgba(102, 126, 234, 0.5)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        color: '#ffffff',
        fontFamily: 'Arial, sans-serif',
        textAlign: 'left',
        minWidth: '280px',
        maxWidth: '320px',
        zIndex: 100,
        backdropFilter: 'blur(10px)',
      }}
    >
      {/* 原子番号 - 右上 */}
      <div
        style={{
          position: 'absolute',
          top: '15px',
          right: '20px',
          fontSize: '14px',
          color: '#888888',
          fontWeight: '500',
        }}
      >
        #{element.atomicNumber}
      </div>

      {/* 元素記号 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '15px' }}>
        <div
          style={{
            fontSize: '48px',
            fontWeight: 'bold',
            color: elementColor,
            textShadow: `0 0 10px ${elementColor}80`,
            transformStyle: 'preserve-3d',
          }}
        >
          {element.symbol}
        </div>
      </div>

      {/* 粒子情報 */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '30px',
          fontSize: '14px',
          borderTop: '1px solid rgba(102, 126, 234, 0.3)',
          paddingTop: '15px',
        }}
      >
        <div>
          <div style={{ color: '#aaaaaa', marginBottom: '3px' }}>陽子</div>
          <div style={{ fontSize: '18px', color: '#ff6644', fontWeight: 'bold' }}>
            {element.protons}
          </div>
        </div>
        <div>
          <div style={{ color: '#aaaaaa', marginBottom: '3px' }}>中性子</div>
          <div style={{ fontSize: '18px', color: '#aacc44', fontWeight: 'bold' }}>
            {element.neutrons}
          </div>
        </div>
        <div>
          <div style={{ color: '#aaaaaa', marginBottom: '3px' }}>電子</div>
          <div style={{ fontSize: '18px', color: '#44aaff', fontWeight: 'bold' }}>
            {electrons}
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
