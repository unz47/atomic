# AWS DB移行ガイド

このプロジェクトは、将来的にAWS DynamoDBへの移行を前提とした設計になっています。

## 現在の構成（ローカルDB）

```
src/
├── data/
│   └── elementsDB.ts          # ローカル元素データベース
├── services/
│   └── elementService.ts      # DB抽象化レイヤー
└── components/
    └── App.tsx                 # サービス層を使用
```

## AWS移行後の構成

```
Frontend (React)
    ↓ (HTTP API)
elementService.ts
    ↓
AWS API Gateway
    ↓
Lambda Function
    ↓
DynamoDB
```

## 移行手順

### ステップ1: AWS環境のセットアップ

1. **DynamoDBテーブルを作成**
   ```bash
   aws dynamodb create-table \
     --table-name Elements \
     --attribute-definitions AttributeName=atomicNumber,AttributeType=N \
     --key-schema AttributeName=atomicNumber,KeyType=HASH \
     --billing-mode PAY_PER_REQUEST \
     --region ap-northeast-1
   ```

2. **初期データを投入**
   - `aws-lambda-example/README.md` の手順に従って初期データを投入

### ステップ2: Lambda関数のデプロイ

1. **必要なパッケージをインストール**
   ```bash
   cd aws-lambda-example
   npm install @aws-sdk/client-dynamodb @aws-sdk/lib-dynamodb
   ```

2. **Serverless Frameworkでデプロイ**
   ```bash
   serverless deploy
   ```

   または **AWS SAMでデプロイ**
   ```bash
   sam build
   sam deploy --guided
   ```

### ステップ3: フロントエンドの設定変更

`.env` ファイルを更新:

```env
# AWS DBを使用
VITE_USE_REMOTE_DB=true

# API GatewayのURLを設定（デプロイ後に取得）
VITE_API_BASE_URL=https://xxxxx.execute-api.ap-northeast-1.amazonaws.com/prod
```

### ステップ4: 動作確認

1. アプリを起動
   ```bash
   npm run dev
   ```

2. ブラウザのコンソールで以下を確認:
   - API呼び出しが成功しているか
   - 元素データが正しく表示されるか

## コードの変更不要

`elementService.ts` が抽象化レイヤーとして機能するため、**フロントエンドのコンポーネントコードは一切変更不要**です。

環境変数を切り替えるだけで、ローカルDB ⇄ AWS DBを切り替えられます。

## サービス層の仕組み

```typescript
// elementService.ts
export async function fetchAllElements(): Promise<ElementData[]> {
  if (USE_REMOTE_DB) {
    // AWS APIから取得
    const response = await fetch(`${API_BASE_URL}/elements`);
    return await response.json();
  }

  // ローカルDBから取得
  return Object.values(elementsDB).sort(...);
}
```

## フォールバック機能

AWS APIが利用できない場合、自動的にローカルDBにフォールバックします:

```typescript
try {
  // AWS APIを試行
  return await fetch(...);
} catch (error) {
  console.error('Falling back to local DB');
  // ローカルDBを使用
  return elementsDB[atomicNumber];
}
```

## 開発環境とプロダクション環境

### 開発環境
```env
VITE_USE_REMOTE_DB=false
VITE_API_BASE_URL=http://localhost:3000/api
```

### ステージング環境
```env
VITE_USE_REMOTE_DB=true
VITE_API_BASE_URL=https://staging-api.your-domain.com/api
```

### プロダクション環境
```env
VITE_USE_REMOTE_DB=true
VITE_API_BASE_URL=https://api.your-domain.com/api
```

## コスト見積もり

**月間1万リクエストの場合（小規模）:**
- DynamoDB: 約$0（無料枠内）
- Lambda: 約$0（無料枠内）
- API Gateway: 約$0.01

**月間10万リクエストの場合（中規模）:**
- DynamoDB: 約$0.25
- Lambda: 約$0.20
- API Gateway: 約$0.10
合計: 約$0.55/月

## 監視とログ

AWS環境では以下が自動的に設定されます:

- **CloudWatch Logs**: Lambda関数のログ
- **CloudWatch Metrics**: API呼び出し数、エラー率
- **X-Ray**: 分散トレーシング（オプション）

## トラブルシューティング

### 問題1: CORSエラー
**解決策**: API GatewayでCORS設定を有効化

### 問題2: データが取得できない
**解決策**:
1. API URLが正しいか確認
2. DynamoDBにデータが存在するか確認
3. Lambda関数のIAMロールを確認

### 問題3: レスポンスが遅い
**解決策**:
1. Lambda関数のメモリを増やす（128MB → 512MB）
2. DynamoDBのキャパシティモードを確認
3. CloudFrontでキャッシュを有効化

## 次のステップ

1. **キャッシュ戦略**: React QueryやSWRを導入
2. **オフライン対応**: Service Workerでキャッシュ
3. **リアルタイム更新**: WebSocketまたはServer-Sent Events
4. **画像最適化**: CloudFrontでCDN配信
