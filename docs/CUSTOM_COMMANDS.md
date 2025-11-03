# カスタムコマンドの作り方と使い方

## 追加したカスタムコマンド

### 1. `db:reset` - データベースを完全リセット

```json
"db:reset": "npm run db:stop && rm -rf dynamodb-data && npm run db:start && npm run db:setup"
```

**使い方:**
```bash
npm run db:reset
```

**何をする？**
```
1. Dockerを停止
   ↓
2. データフォルダを削除（dynamodb-data/）
   ↓
3. Dockerを再起動
   ↓
4. データを再投入
```

**いつ使う？**
- データがおかしくなった時
- 最初からやり直したい時
- 新しい元素を追加した後、クリーンな状態で試したい時

---

### 2. `start:all` - データベースをまとめて起動

```json
"start:all": "npm run db:start && npm run db:setup"
```

**使い方:**
```bash
npm run start:all
```

**何をする？**
```
1. Dockerを起動
   ↓
2. データを投入
```

**いつ使う？**
- 初回セットアップ時
- 2つのコマンドを1つにまとめたい時

---

### 3. `check` - TypeScriptの型チェックのみ

```json
"check": "tsc --noEmit"
```

**使い方:**
```bash
npm run check
```

**何をする？**
```
TypeScriptの型エラーをチェック
（ビルドはしない）
```

**出力例:**
```bash
# エラーがない場合
$ npm run check
# （何も表示されない = OK）

# エラーがある場合
$ npm run check
src/App.tsx:10:5 - error TS2322: Type 'string' is not assignable to type 'number'.
```

**いつ使う？**
- コードを書いた後、エラーがないか確認
- ビルドせずに型チェックだけしたい時

---

### 4. `clean` - ビルド結果とnode_modulesを削除

```json
"clean": "rm -rf dist node_modules"
```

**使い方:**
```bash
npm run clean
```

**何をする？**
```
dist/          ← ビルド結果を削除
node_modules/  ← パッケージを削除
```

**いつ使う？**
- プロジェクトをクリーンアップしたい時
- 容量を空けたい時（300MB以上削減）
- 次の `reinstall` の前に

⚠️ **注意:** node_modulesを削除した後は `npm install` が必要

---

### 5. `reinstall` - 完全再インストール

```json
"reinstall": "npm run clean && npm install"
```

**使い方:**
```bash
npm run reinstall
```

**何をする？**
```
1. dist/ と node_modules/ を削除
   ↓
2. npm install を実行
   ↓
3. 全パッケージを再ダウンロード
```

**いつ使う？**
- パッケージの依存関係がおかしい時
- `npm install` でエラーが出た時
- 最初からインストールし直したい時

---

## カスタムコマンドの作り方

### 基本の形

```json
"scripts": {
  "コマンド名": "実行するコマンド"
}
```

### 例1: 簡単なコマンド

```json
"hello": "echo 'Hello World!'"
```

```bash
npm run hello
# → Hello World!
```

---

### 例2: 複数のコマンドを順番に実行（&&）

```json
"build-and-preview": "npm run build && npm run preview"
```

```bash
npm run build-and-preview
# → buildが成功したらpreviewを実行
```

**&& の意味:**
- 前のコマンドが成功したら次を実行
- 失敗したらそこで止まる

---

### 例3: 他のnpmスクリプトを呼ぶ

```json
"full-reset": "npm run clean && npm install && npm run dev"
```

```bash
npm run full-reset
# → clean → install → dev の順に実行
```

---

### 例4: 引数を渡す

```json
"test": "vitest",
"test:watch": "vitest --watch"
```

```bash
npm run test         # 通常のテスト
npm run test:watch   # ファイル監視モード
```

---

## 実用的なカスタムコマンド例

### 開発用

```json
"scripts": {
  "dev:debug": "vite --debug",
  "dev:host": "vite --host",
  "dev:port": "vite --port 3000"
}
```

### テスト用

```json
"scripts": {
  "test": "vitest",
  "test:ui": "vitest --ui",
  "test:coverage": "vitest --coverage"
}
```

### デプロイ用

```json
"scripts": {
  "deploy": "npm run build && firebase deploy",
  "deploy:preview": "npm run build && firebase deploy --only hosting:preview"
}
```

### データベース管理用

```json
"scripts": {
  "db:logs": "docker logs periodic-table-dynamodb",
  "db:admin": "open http://localhost:8001",
  "db:backup": "cp -r dynamodb-data dynamodb-backup"
}
```

---

## あなたのプロジェクトで使える便利なコマンド集

追加するとしたら、こんなのも便利：

```json
"scripts": {
  // 既存のコマンド
  "dev": "vite",
  "build": "tsc && vite build",

  // 開発補助
  "open": "open http://localhost:5173",
  "open:admin": "open http://localhost:8001",

  // ログ確認
  "logs:db": "docker logs periodic-table-dynamodb -f",
  "logs:api": "npm run api:dev",

  // テスト
  "test": "echo 'テストがありません'",

  // 元素追加ワークフロー
  "add-element": "npm run db:setup && npm run dev",

  // フルスタック起動（全部一気に）
  "start:full": "npm run db:start && sleep 3 && npm run db:setup && npm run api:dev",

  // バックアップ
  "backup:db": "cp -r dynamodb-data dynamodb-backup-$(date +%Y%m%d)"
}
```

---

## 命名規則のベストプラクティス

### `:` (コロン) でグループ化

```json
"scripts": {
  "db:start": "...",
  "db:stop": "...",
  "db:setup": "...",
  "db:reset": "...",

  "test:unit": "...",
  "test:e2e": "...",
  "test:coverage": "..."
}
```

→ 関連するコマンドをまとめる

---

### 動詞で始める

```json
"build": "...",    // ✅ Good
"deploy": "...",   // ✅ Good
"check": "...",    // ✅ Good

"compiled": "...", // ❌ Bad（過去形）
"building": "..."  // ❌ Bad（進行形）
```

---

### 短く、明確に

```json
"dev": "vite",                                    // ✅ Good
"start-development-server-with-hot-reload": "..." // ❌ Bad（長すぎ）
```

---

## よくある使い方

### ワークフロー1: 初回セットアップ

```bash
npm install        # パッケージインストール
npm run start:all  # DB起動＋データ投入
npm run dev        # フロントエンド起動
```

### ワークフロー2: 日常開発（Dockerなし）

```bash
npm run dev  # これだけでOK！
```

### ワークフロー3: 日常開発（Docker使用）

```bash
# 1日の最初に
npm run db:start

# 開発中（2つのターミナル）
npm run api:dev  # ターミナル1
npm run dev      # ターミナル2

# 1日の最後に
npm run db:stop
```

### ワークフロー4: トラブル時

```bash
# 何かおかしい時
npm run db:reset     # DBリセット
npm run reinstall    # パッケージ再インストール
npm run check        # 型エラーチェック
```

### ワークフロー5: デプロイ前

```bash
npm run check    # 型チェック
npm run build    # ビルド
npm run preview  # 動作確認
```

---

## まとめ

**カスタムコマンドは自由に作れる！**

```json
"scripts": {
  "好きな名前": "実行したいコマンド"
}
```

**実行方法:**
```bash
npm run 好きな名前
```

**便利なテクニック:**
- `&&` で複数コマンドを連結
- `npm run 他のスクリプト` で呼び出し
- `:` でグループ化

**あなたのプロジェクトに追加されたコマンド:**
- `npm run db:reset` → DB完全リセット
- `npm run start:all` → DB起動＋セットアップ
- `npm run check` → 型チェックのみ
- `npm run clean` → ビルド結果削除
- `npm run reinstall` → 完全再インストール

自分の開発スタイルに合わせて、どんどん追加してください！🚀
