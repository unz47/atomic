# npm install って何してるの？

## 料理のレシピに例えると

**あなたのプロジェクト** = ケーキを作る

### 🎂 レシピ（package.json）
```json
{
  "name": "ケーキ",
  "材料": {
    "小麦粉": "1kg",
    "卵": "3個",
    "砂糖": "200g",
    "バター": "100g"
  }
}
```

### 🛒 買い物（npm install）
```bash
npm install
```
→ スーパーに行って、レシピに書いてある材料を全部買ってくる

### 📦 買った材料の置き場所（node_modules/）
```
node_modules/
├── 小麦粉/
├── 卵/
├── 砂糖/
└── バター/
```

## 実際のプロジェクトでは

### package.json = レシピ本
プロジェクトに必要なパッケージ（材料）のリスト

### npm install = 材料を全部買ってくる
インターネットから必要なパッケージを全部ダウンロード

### node_modules/ = 冷蔵庫・パントリー
ダウンロードしたパッケージを全部ここに保存

---

## あなたのプロジェクトの package.json

```json
{
  "name": "three-house",
  "dependencies": {
    "@react-three/drei": "^9.114.3",
    "@react-three/fiber": "^8.17.10",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "three": "^0.169.0",
    "@aws-sdk/client-dynamodb": "^3.490.0",
    "@aws-sdk/lib-dynamodb": "^3.490.0",
    "cors": "^2.8.5",
    "express": "^4.18.2"
  },
  "devDependencies": {
    "@types/react": "^18.3.12",
    "typescript": "^5.6.3",
    "vite": "^5.4.11",
    // ... その他
  }
}
```

## 各パッケージの役割

### 📦 dependencies（本番でも必要）

#### 1. **react** (^18.3.1)
```
役割: UIを作るライブラリ
例え: 家の設計図
なければ: 画面に何も表示できない
```

#### 2. **three** (^0.169.0)
```
役割: 3Dグラフィックを描画
例え: 絵の具と筆
なければ: 3D原子モデルが描けない
```

#### 3. **@react-three/fiber** (^8.17.10)
```
役割: Three.jsをReactで使えるようにする接着剤
例え: 設計図を絵に変換する翻訳者
なければ: ReactとThree.jsが連携できない
```

#### 4. **@react-three/drei** (^9.114.3)
```
役割: Three.jsの便利な部品集
例え: すぐ使える家具のセット（Sphere, Torus, OrbitControlsなど）
なければ: 全部自分で作る必要がある（大変！）
```

#### 5. **@aws-sdk/client-dynamodb** (^3.490.0)
```
役割: DynamoDBと通信する
例え: データベースへの電話
なければ: データベースにアクセスできない
```

#### 6. **express** (^4.18.2)
```
役割: APIサーバーを作る
例え: レストランのウェイター（注文を受け取って、料理を運ぶ）
なければ: APIサーバーが作れない
```

### 🛠️ devDependencies（開発時だけ必要）

#### 7. **typescript** (^5.6.3)
```
役割: JavaScriptに型をつける
例え: 誤字チェックツール
なければ: バグが見つけにくい
```

#### 8. **vite** (^5.4.11)
```
役割: 開発サーバーとビルドツール
例え: 高速料理器具（レンジ、IH調理器）
なければ: 開発サーバーが起動しない
```

#### 9. **@types/react** (^18.3.12)
```
役割: ReactのTypeScript型定義
例え: React の使い方マニュアル（TypeScript用）
なければ: エディタの補完が効かない
```

---

## npm install の詳細な動作

### 1️⃣ package.json を読む
```
┌─────────────────────────────┐
│ package.json を開く          │
│ 必要なパッケージをリスト化   │
└─────────────────────────────┘
```

### 2️⃣ インターネットからダウンロード
```
npm レジストリ（https://registry.npmjs.org/）に接続
    ↓
必要なパッケージを検索
    ↓
最新の互換バージョンをダウンロード
    ↓
node_modules/ に保存
```

例：
```bash
Downloading react@18.3.1...
Downloading three@0.169.0...
Downloading @react-three/fiber@8.17.10...
...
```

### 3️⃣ 依存関係も一緒にダウンロード

**依存関係 = 材料の材料**

例：ケーキを作るには小麦粉が必要
→ でも小麦粉を作るには小麦が必要
→ npm は自動で全部ダウンロードする！

```
あなたのプロジェクト
  └─ react (必要)
      └─ loose-envify (reactが必要としている)
          └─ js-tokens (loose-envifyが必要としている)
```

### 4️⃣ package-lock.json を生成

```json
{
  "name": "three-house",
  "lockfileVersion": 3,
  "dependencies": {
    "react": {
      "version": "18.3.1",
      "resolved": "https://registry.npmjs.org/react/-/react-18.3.1.tgz",
      "integrity": "sha512-..."
    }
  }
}
```

**役割:**
- 正確なバージョンを記録
- チーム全員が同じバージョンを使う
- 「うちのパソコンでは動くのに...」を防ぐ

### 5️⃣ node_modules/ フォルダを作成

```
node_modules/
├── react/                    (2.8 MB)
├── three/                    (12.5 MB)
├── @react-three/
│   ├── fiber/               (1.2 MB)
│   └── drei/                (3.5 MB)
├── @aws-sdk/
│   ├── client-dynamodb/     (5.2 MB)
│   └── lib-dynamodb/        (2.1 MB)
├── express/                  (0.8 MB)
└── ... (合計200個以上！)

総サイズ: 約 300MB
```

---

## バージョン番号の意味

```json
"react": "^18.3.1"
         ↑  ↑ ↑
         │  │ └─ パッチバージョン（バグ修正）
         │  └─── マイナーバージョン（新機能追加）
         └───── メジャーバージョン（大きな変更）
```

### ^ (キャレット) の意味

```
"^18.3.1" = 18.3.1 以上 19.0.0 未満

OK:  18.3.1, 18.3.2, 18.4.0, 18.9.9
NG:  19.0.0, 17.0.0
```

→ マイナーアップデートとパッチは自動で最新に！

---

## 実際の流れ（タイムライン）

```bash
$ npm install
```

```
[00:00] 📖 package.json を読み込み中...
[00:01] 🔍 依存関係を解決中...
        - react@18.3.1 が必要
        - three@0.169.0 が必要
        - @react-three/fiber@8.17.10 が必要
        ...
[00:02] 📥 パッケージをダウンロード中...
        ⬇️  react@18.3.1 (2.8 MB)
        ⬇️  three@0.169.0 (12.5 MB)
        ⬇️  @react-three/fiber@8.17.10 (1.2 MB)
        ⬇️  @react-three/drei@9.114.3 (3.5 MB)
        ...
[00:15] 📦 node_modules/ に展開中...
[00:20] 🔒 package-lock.json を作成中...
[00:22] ✅ 完了！ 234 packages added

added 234 packages in 22s
```

---

## npm install の種類

### 1. **npm install**（引数なし）
```bash
npm install
```
→ package.json に書いてあるパッケージを全部インストール

### 2. **npm install [パッケージ名]**
```bash
npm install lodash
```
→ 新しいパッケージを追加してインストール
→ package.json に自動で追加される

### 3. **npm install [パッケージ名] --save-dev**
```bash
npm install eslint --save-dev
```
→ 開発用パッケージとしてインストール
→ devDependencies に追加される

---

## node_modules/ の中身

```
node_modules/
├── react/
│   ├── index.js          ← これをimportして使う
│   ├── package.json
│   └── cjs/              ← 実際のコード
├── three/
│   ├── build/
│   │   └── three.module.js
│   ├── examples/         ← サンプルコード
│   └── package.json
└── .bin/                 ← 実行可能コマンド
    ├── vite              ← npm run dev で実行される
    ├── tsc               ← TypeScriptコンパイラ
    └── tsx               ← TypeScript実行
```

---

## よくある質問

### Q1: node_modules/ をGitにコミットする？
**A: しない！**

理由:
- 容量が大きい（300MB以上）
- `npm install` で復元できる
- package.json と package-lock.json だけコミットする

.gitignore に記載:
```
node_modules/
```

### Q2: package-lock.json は必要？
**A: 必要！**

理由:
- 全員が同じバージョンを使える
- ビルドが安定する
- Gitにコミットすべき

### Q3: npm install のエラーが出たら？
```bash
# キャッシュをクリア
npm cache clean --force

# node_modules を削除
rm -rf node_modules package-lock.json

# 再インストール
npm install
```

### Q4: 特定のパッケージだけ更新したい
```bash
# reactだけ最新に
npm install react@latest

# 全部最新に（注意！）
npm update
```

### Q5: どのパッケージが入ってるか見たい
```bash
# 一覧表示
npm list

# トップレベルのみ
npm list --depth=0
```

---

## まとめ

```
npm install = プロジェクトに必要な材料を全部買ってくる

何を買う？    → package.json に記載
どこから？    → npmjs.org から
どこに？      → node_modules/ に
バージョンは？ → package-lock.json に記録
```

**一言で言うと:**
「package.json に書いてあるパッケージを全部ダウンロードして、node_modules/ に保存する」

これで開発に必要な全ての道具が揃います！🎉
