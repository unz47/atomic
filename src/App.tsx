import { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stats } from '@react-three/drei';
import { Element } from './Element';
import { ElementData } from './data/elementsDB';
import { PeriodicTableMenu } from './components/PeriodicTableMenu';
import { fetchAllElements } from './services/elementService';

function App() {
  const [selectedElement, setSelectedElement] = useState<ElementData | null>(null);
  const [elements, setElements] = useState<ElementData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 元素データを取得
  useEffect(() => {
    const loadElements = async () => {
      try {
        setLoading(true);
        const data = await fetchAllElements();
        setElements(data);
        setError(null);
      } catch (err) {
        console.error('Failed to load elements:', err);
        setError('元素データの読み込みに失敗しました');
      } finally {
        setLoading(false);
      }
    };

    loadElements();
  }, []);

  // ローディング中の表示
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#1a1a2e',
        color: '#ffffff',
        fontSize: '24px',
      }}>
        元素データを読み込み中...
      </div>
    );
  }

  // エラー時の表示
  if (error) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#1a1a2e',
        color: '#ff3333',
        fontSize: '24px',
        flexDirection: 'column',
        gap: '20px',
      }}>
        <div>{error}</div>
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: '#667eea',
            color: '#ffffff',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        >
          再読み込み
        </button>
      </div>
    );
  }

  return (
    <>
      <Canvas
        camera={{ position: [0, 0, 15], fov: 75 }}
        style={{ width: '100vw', height: '100vh' }}
        dpr={1} // デバイスピクセル比を1に固定（最大パフォーマンス）
        gl={{
          antialias: false, // アンチエイリアス無効化
          powerPreference: 'high-performance', // 高性能GPU使用
        }}
        shadows={false} // 影を無効化
      >
        {/* 背景色 */}
        <color attach="background" args={['#1a1a2e']} />

        {/* ライト */}
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={1} />

        {/* 選択された元素の原子モデル */}
        {selectedElement && <Element elementData={selectedElement} />}

        {/* カメラコントロール（マウスで回転・ズーム） */}
        <OrbitControls enableDamping={false} />

        {/* FPS表示（左上） */}
        <Stats />
      </Canvas>

      {/* 周期表メニュー */}
      <PeriodicTableMenu
        elements={elements}
        selectedElement={selectedElement}
        onSelectElement={setSelectedElement}
      />
    </>
  );
}

export default App;
