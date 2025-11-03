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
  const [rotationSpeed, setRotationSpeed] = useState(0.3); // 回転速度の倍率（1.0がデフォルト）

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

  // スクロールイベントで回転速度を制御（throttle付き + 方向対応）
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let isThrottled = false;
    const baseSpeed = 0.3; // 基本速度

    const handleWheel = (e: WheelEvent) => {
      // throttle: 50ms毎に1回だけ処理
      if (isThrottled) return;
      isThrottled = true;
      setTimeout(() => {
        isThrottled = false;
      }, 50);

      // スクロール量と方向を計算
      const delta = e.deltaY;
      const scrollSpeed = Math.min(Math.abs(delta) / 20, 10); // 最大10倍まで（感度2倍）
      const direction = delta > 0 ? 1 : -1; // 下スクロール: 1, 上スクロール: -1

      // 回転速度を更新（方向を考慮）
      setRotationSpeed(baseSpeed * direction * (1.0 + scrollSpeed));

      // タイムアウトをクリア
      clearTimeout(timeoutId);

      // 0.8秒後に速度を元に戻す
      timeoutId = setTimeout(() => {
        setRotationSpeed(baseSpeed);
      }, 800);
    };

    window.addEventListener('wheel', handleWheel, { passive: true });

    return () => {
      window.removeEventListener('wheel', handleWheel);
      clearTimeout(timeoutId);
    };
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
        {selectedElement && <Element elementData={selectedElement} rotationSpeed={rotationSpeed} />}

        {/* カメラコントロール（マウスで回転のみ） */}
        <OrbitControls enableDamping={false} enableZoom={false} />

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
