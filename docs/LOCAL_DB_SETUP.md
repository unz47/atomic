# ローカルDB セットアップガイド

DynamoDB Localを使ったローカル開発環境のセットアップ手順です。

## 前提条件

- Docker と Docker Compose がインストールされていること
- Node.js 18以上がインストールされていること

## セットアップ手順

### 1. 依存パッケージのインストール

```bash
npm install
```

### 2. DynamoDB Localの起動

```bash
npm run db:start
```

これにより以下が起動します:
- **DynamoDB Local**: ポート8000
- **DynamoDB Admin UI**: ポート8001（ブラウザで確認可能）

起動確認:
```bash
docker-compose ps
```

### 3. データベースのセットアップとデータ投入

```bash
npm run db:setup
```

このコマンドで以下が実行されます:
1. `Elements` テーブルの作成
2. 元素データ（H, He, C, O, Fe, Au, No, Lr）の投入

完了すると以下のように表示されます:
```
✅ 1. H (水素)
✅ 2. He (ヘリウム)
✅ 6. C (炭素)
...
🎉 セットアップが完了しました！
```

### 4. ローカルAPIサーバーの起動

```bash
npm run api:dev
```

APIサーバーが `http://localhost:3000` で起動します。

### 5. フロントエンドの起動

別のターミナルで:

```bash
npm run dev
```

ブラウザで `http://localhost:5173` を開きます。

## 動作確認

### DynamoDB Admin UIでデータ確認

ブラウザで http://localhost:8001 を開くと、DynamoDB内のデータをGUIで確認できます。

### APIの動作確認

```bash
# すべての元素を取得
curl http://localhost:3000/api/elements

# 特定の元素を取得（水素）
curl http://localhost:3000/api/elements/1

# 元素記号で取得（金）
curl http://localhost:3000/api/elements/symbol/Au

# カテゴリで取得（遷移金属）
curl http://localhost:3000/api/elements/category/transition-metal
```

## ディレクトリ構造

```
three-house/
├── docker-compose.yml          # Docker設定
├── dynamodb-data/              # DynamoDBのデータ永続化（gitignore済み）
├── scripts/
│   └── setup-local-db.ts       # DBセットアップスクリプト
├── server/
│   └── local-api.ts            # ローカルAPIサーバー
├── src/
│   ├── data/
│   │   └── elementsDB.ts       # 元素データ定義
│   └── services/
│       └── elementService.ts   # DB抽象化レイヤー
└── .env                        # 環境変数設定
```

## 環境変数

`.env` ファイルで設定を切り替えられます:

```env
# ローカルDB使用
VITE_USE_REMOTE_DB=true
VITE_API_BASE_URL=http://localhost:3000/api
```

## トラブルシューティング

### 問題1: Dockerが起動しない

**症状**: `docker-compose up` でエラー

**解決策**:
```bash
# Dockerデーモンの確認
docker info

# ポート競合の確認
lsof -i :8000
lsof -i :8001
```

### 問題2: テーブルが作成されない

**症状**: `setup-local-db` でエラー

**解決策**:
```bash
# DynamoDBのログ確認
docker logs periodic-table-dynamodb

# コンテナの再起動
npm run db:stop
npm run db:start
npm run db:setup
```

### 問題3: データが表示されない

**症状**: フロントエンドで元素が表示されない

**解決策**:
1. APIサーバーが起動しているか確認
   ```bash
   curl http://localhost:3000/api/health
   ```

2. `.env` の設定を確認
   ```env
   VITE_USE_REMOTE_DB=true
   VITE_API_BASE_URL=http://localhost:3000/api
   ```

3. ブラウザのコンソールでエラーを確認

### 問題4: CORS エラー

**症状**: ブラウザコンソールに CORS エラー

**解決策**: APIサーバーを再起動
```bash
npm run api:dev
```

## 利用可能なコマンド

| コマンド | 説明 |
|---------|------|
| `npm run db:start` | DynamoDB Localを起動 |
| `npm run db:stop` | DynamoDB Localを停止 |
| `npm run db:setup` | テーブル作成とデータ投入 |
| `npm run api:dev` | ローカルAPIサーバー起動 |
| `npm run dev` | フロントエンド起動 |

## データの永続化

`dynamodb-data/` ディレクトリにデータが保存されます。

データをリセットしたい場合:
```bash
npm run db:stop
rm -rf dynamodb-data
npm run db:start
npm run db:setup
```

## 次のステップ

1. **新しい元素を追加する**
   - `src/data/elementsDB.ts` に元素データを追加
   - `npm run db:setup` で再投入

2. **APIをテストする**
   - Postman や Thunder Client でAPIをテスト
   - `server/local-api.ts` を編集してエンドポイント追加

3. **AWS環境へデプロイ**
   - `docs/AWS_MIGRATION_GUIDE.md` を参照
