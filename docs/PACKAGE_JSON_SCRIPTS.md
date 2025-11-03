# package.json の "scripts" って何？

## 簡単に言うと

**scripts = よく使うコマンドのショートカット集**

料理に例えると：
- 長いレシピ → 短い名前で呼べる
- 「チャーハンの作り方：油を熱して...」→ 「チャーハン作って！」

---

## あなたのプロジェクトの scripts

```json
"scripts": {
  "dev": "vite",
  "build": "tsc && vite build",
  "preview": "vite preview",
  "db:start": "docker-compose up -d",
  "db:stop": "docker-compose down",
  "db:setup": "tsx scripts/setup-local-db.ts",
  "api:dev": "tsx watch server/local-api.ts"
}
```

---

## 各コマンドの詳細説明

### 1. `"dev": "vite"`

**使い方:**
```bash
npm run dev
```

**実際に実行されるコマンド:**
```bash
vite
```

**何をする？**
```
開発サーバーを起動する
    ↓
http://localhost:5173 で起動
    ↓
ブラウザでアプリが見られる
    ↓
コードを変更すると自動的に画面が更新される
```

**例え:**
お店を開店する（お客さんが来られるようになる）

**いつ使う？**
- アプリを開発中、常時起動しておく
- 最もよく使うコマンド

---

### 2. `"build": "tsc && vite build"`

**使い方:**
```bash
npm run build
```

**実際に実行されるコマンド:**
```bash
tsc && vite build
```

**何をする？**
```
tsc (TypeScriptコンパイラ)
    ↓ TypeScriptの型チェック
    ↓ エラーがないか確認
    ↓
&&（成功したら次へ）
    ↓
vite build
    ↓ 本番用に最適化
    ↓ 圧縮・軽量化
    ↓
dist/ フォルダに出力
```

**例え:**
お弁当を作る（持ち運びやすく梱包）

**いつ使う？**
- 本番環境にデプロイする前
- AWS、Vercel、Netlifyなどにアップする前

**出力結果:**
```
dist/
├── index.html
├── assets/
│   ├── index-abc123.js    (圧縮済み)
│   └── index-def456.css   (圧縮済み)
```

---

### 3. `"preview": "vite preview"`

**使い方:**
```bash
npm run preview
```

**実際に実行されるコマンド:**
```bash
vite preview
```

**何をする？**
```
dist/ フォルダを表示
    ↓
本番環境と同じ状態で動作確認
    ↓
http://localhost:4173 で起動
```

**例え:**
本番前のリハーサル

**いつ使う？**
- `npm run build` の後
- 本番環境と同じ状態でテストしたい時

**流れ:**
```bash
npm run build   # 本番用にビルド
npm run preview # ビルド結果を確認
```

---

### 4. `"db:start": "docker-compose up -d"`

**使い方:**
```bash
npm run db:start
```

**実際に実行されるコマンド:**
```bash
docker-compose up -d
```

**何をする？**
```
docker-compose.yml を読む
    ↓
DynamoDB Local を起動（ポート8000）
    ↓
DynamoDB Admin を起動（ポート8001）
    ↓
-d (detached) = バックグラウンドで起動
```

**例え:**
データベースのお店を開店

**いつ使う？**
- ローカルDBを使いたい時
- 最初に1回実行すればOK

**確認方法:**
```bash
docker ps  # 起動中のDockerコンテナを確認
```

---

### 5. `"db:stop": "docker-compose down"`

**使い方:**
```bash
npm run db:stop
```

**実際に実行されるコマンド:**
```bash
docker-compose down
```

**何をする？**
```
起動中のDockerコンテナを停止
    ↓
DynamoDB Local を停止
    ↓
DynamoDB Admin を停止
    ↓
コンテナを削除（データは残る）
```

**例え:**
お店を閉店（データは倉庫に残る）

**いつ使う？**
- 作業が終わった時
- パソコンを再起動する前

**データは消える？**
いいえ！`dynamodb-data/` フォルダにデータは残ります

---

### 6. `"db:setup": "tsx scripts/setup-local-db.ts"`

**使い方:**
```bash
npm run db:setup
```

**実際に実行されるコマンド:**
```bash
tsx scripts/setup-local-db.ts
```

**何をする？**
```
tsx (TypeScript実行ツール)
    ↓
scripts/setup-local-db.ts を実行
    ↓
1. DynamoDBに接続
    ↓
2. Elementsテーブルを作成
    ↓
3. 元素データを投入
    ↓
✅ 完了！
```

**例え:**
お店の棚を作って、商品を並べる

**いつ使う？**
- 初回セットアップ時
- データをリセットしたい時
- 新しい元素を追加した後

**実行結果:**
```
✅ 1. H (水素)
✅ 2. He (ヘリウム)
✅ 6. C (炭素)
...
🎉 セットアップが完了しました！
```

---

### 7. `"api:dev": "tsx watch server/local-api.ts"`

**使い方:**
```bash
npm run api:dev
```

**実際に実行されるコマンド:**
```bash
tsx watch server/local-api.ts
```

**何をする？**
```
tsx watch (ファイル監視モード)
    ↓
server/local-api.ts を実行
    ↓
Express.jsサーバーを起動
    ↓
http://localhost:3000 で待機
    ↓
DynamoDB Localに接続
    ↓
APIエンドポイントを提供
    ↓
ファイル変更時、自動的に再起動
```

**例え:**
注文を受け付けるウェイターを配置

**いつ使う？**
- ローカルDBを使う時
- フロントエンドがAPIを呼ぶ時

**提供するAPI:**
```
GET  /api/elements           # 全元素取得
GET  /api/elements/1         # 水素取得
GET  /api/elements/symbol/Au # 金取得
POST /api/elements           # 新規追加
...
```

---

## && の意味

```json
"build": "tsc && vite build"
           ↑
         これ！
```

**&& = 「成功したら次を実行」**

```
tsc (型チェック)
    ↓
エラーなし？
    ├─ Yes → vite build を実行
    └─ No  → ここで停止（buildしない）
```

**なぜ？**
- 型エラーがあるのにビルドしても意味がない
- エラーを早期発見

---

## npm run の仕組み

### 書き方の対応

```json
"scripts": {
  "dev": "vite"
}
```

↓

```bash
npm run dev
```

↓

```bash
vite  # これが実際に実行される
```

### なぜショートカットを作る？

**❌ ショートカットなし:**
```bash
# 毎回長いコマンドを打つ
./node_modules/.bin/vite

# または
npx vite
```

**✅ ショートカットあり:**
```bash
# 短くて覚えやすい
npm run dev
```

---

## よく使うコマンド一覧

### 開発中（毎日使う）

```bash
# フロントエンド起動
npm run dev

# APIサーバー起動（ローカルDB使用時）
npm run api:dev
```

### 初回セットアップ（最初だけ）

```bash
# Docker起動
npm run db:start

# データベースセットアップ
npm run db:setup
```

### 終了時

```bash
# Docker停止（任意）
npm run db:stop
```

### デプロイ前

```bash
# 本番用ビルド
npm run build

# 動作確認
npm run preview
```

---

## 実践例：完全な起動手順

### パターン1：Dockerなし（簡単）

```bash
cd /Users/tomoyasaito/vscode/three-house

# 1. 依存パッケージをインストール
npm install

# 2. 開発サーバー起動
npm run dev
```

→ http://localhost:5173 を開く

---

### パターン2：Docker使用（本格的）

**ターミナル1：データベース**
```bash
cd /Users/tomoyasaito/vscode/three-house

# Docker起動
npm run db:start

# データセットアップ（初回のみ）
npm run db:setup
```

**ターミナル2：APIサーバー**
```bash
cd /Users/tomoyasaito/vscode/three-house

# APIサーバー起動
npm run api:dev
```

**ターミナル3：フロントエンド**
```bash
cd /Users/tomoyasaito/vscode/three-house

# 開発サーバー起動
npm run dev
```

---

## 自分でスクリプトを追加できる

例：テストコマンドを追加

```json
"scripts": {
  "dev": "vite",
  "test": "vitest",           ← 追加
  "test:ui": "vitest --ui"    ← 追加
}
```

使い方:
```bash
npm run test
npm run test:ui
```

---

## まとめ

```
"scripts" = よく使うコマンドのショートカット

"dev": "vite"
  ↓
npm run dev
  ↓
開発サーバー起動！
```

**覚えること:**
- `npm run dev` → 開発サーバー起動（最重要！）
- `npm run build` → 本番用ビルド
- `npm run db:start` → Docker起動
- `npm run api:dev` → APIサーバー起動

これだけ覚えればOK！🎉
