# 周期表 3D ビジュアライザー

React + Three.js を使用した、インタラクティブな3D原子モデル可視化アプリケーション。

## 特徴

- 🎨 **美しい3D原子モデル**: 陽子、中性子、電子を物理シミュレーションで表示
- 📊 **周期表UI**: 展開式の周期表から元素を選択
- 🎯 **リアルタイム物理演算**: 核力と電磁力をシミュレート
- 🗄️ **データベース対応**: ローカルDBとAWS DynamoDB両対応
- 🎭 **カテゴリ別色分け**: 元素グループごとに美しいグラデーション
- 📱 **レスポンシブ**: 様々な画面サイズに対応

## クイックスタート

### ローカルDBなし（最も簡単）

```bash
# 依存パッケージのインストール
npm install

# 開発サーバー起動
npm run dev
```

ブラウザで http://localhost:5173 を開きます。

### ローカルDB使用（推奨）

```bash
# 1. 依存パッケージのインストール
npm install

# 2. DynamoDB Localを起動
npm run db:start

# 3. データベースセットアップ
npm run db:setup

# 4. APIサーバー起動（別ターミナル）
npm run api:dev

# 5. フロントエンド起動（別ターミナル）
npm run dev
```

詳細は [ローカルDBセットアップガイド](./docs/LOCAL_DB_SETUP.md) を参照。

## プロジェクト構成

```
three-house/
├── src/
│   ├── components/          # Reactコンポーネント
│   │   └── PeriodicTableMenu.tsx
│   ├── data/                # 元素データ
│   │   └── elementsDB.ts
│   ├── services/            # API抽象化レイヤー
│   │   └── elementService.ts
│   ├── styles/              # CSS
│   │   └── PeriodicTable.css
│   ├── shaders/             # GLSLシェーダー
│   ├── AtomModel.tsx        # 汎用原子モデル
│   ├── Element.tsx          # 元素コンポーネント
│   └── App.tsx              # メインアプリ
├── server/                  # ローカルAPIサーバー
│   └── local-api.ts
├── scripts/                 # セットアップスクリプト
│   └── setup-local-db.ts
├── aws-lambda-example/      # AWS Lambda サンプル
└── docs/                    # ドキュメント
```

## 利用可能なコマンド

### 開発
```bash
npm run dev           # フロントエンド開発サーバー
npm run api:dev       # ローカルAPIサーバー
```

### データベース
```bash
npm run db:start      # DynamoDB Local起動
npm run db:stop       # DynamoDB Local停止
npm run db:setup      # テーブル作成とデータ投入
```

### ビルド
```bash
npm run build         # プロダクションビルド
npm run preview       # ビルド結果のプレビュー
```

## 元素データの追加

1. `src/data/elementsDB.ts` に元素データを追加:

```typescript
92: {
  atomicNumber: 92,
  symbol: 'U',
  name: 'Uranium',
  nameJa: 'ウラン',
  protons: 92,
  neutrons: 146,
  electronShells: [
    { electrons: 2, radius: 2.0 },
    { electrons: 8, radius: 3.0 },
    { electrons: 18, radius: 4.0 },
    { electrons: 32, radius: 5.0 },
    { electrons: 21, radius: 6.0 },
    { electrons: 9, radius: 7.0 },
    { electrons: 2, radius: 8.0 },
  ],
  period: 7,
  group: 3,
  category: 'actinide',
},
```

2. ローカルDBを使用している場合、データを再投入:

```bash
npm run db:setup
```

## 技術スタック

- **フロントエンド**: React 18, TypeScript
- **3D描画**: Three.js, React Three Fiber, Drei
- **ローカルDB**: DynamoDB Local (Docker)
- **APIサーバー**: Express.js
- **AWS対応**: DynamoDB, Lambda, API Gateway

## ドキュメント

- [ローカルDBセットアップ](./docs/LOCAL_DB_SETUP.md)
- [AWS移行ガイド](./docs/AWS_MIGRATION_GUIDE.md)

## 物理シミュレーション

原子核内の粒子は以下の力でシミュレートされます:

- **電磁気力**: 陽子間の反発力
- **核力**: 短距離での引力（陽子・中性子間）
- **境界拘束**: 粒子を原子核内に保持
- **速度減衰**: 安定化のための摩擦

パラメータは `src/AtomModel.tsx` で調整可能です。

## ライセンス

MIT

## 作者

Tomoya Saito
