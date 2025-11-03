# AWS Lambda + DynamoDB デプロイガイド

このディレクトリには、元素データをAWS DynamoDBに格納し、Lambda経由でAPIを提供するためのサンプルコードが含まれています。

## アーキテクチャ

```
Frontend (React + Three.js)
    ↓
API Gateway
    ↓
Lambda Function
    ↓
DynamoDB
```

## セットアップ手順

### 1. DynamoDBテーブルの作成

AWS コンソールまたはCLIでDynamoDBテーブルを作成します。

```bash
aws dynamodb create-table \
  --table-name Elements \
  --attribute-definitions \
    AttributeName=atomicNumber,AttributeType=N \
  --key-schema \
    AttributeName=atomicNumber,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region ap-northeast-1
```

### 2. 初期データの投入

ローカルの `elementsDB.ts` から DynamoDB にデータを投入するスクリプト:

```typescript
// scripts/uploadToDynamoDB.ts
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { elementsDB } from '../src/data/elementsDB';

const client = new DynamoDBClient({ region: 'ap-northeast-1' });
const docClient = DynamoDBDocumentClient.from(client);

async function uploadElements() {
  for (const element of Object.values(elementsDB)) {
    const command = new PutCommand({
      TableName: 'Elements',
      Item: element,
    });

    await docClient.send(command);
    console.log(`Uploaded: ${element.symbol}`);
  }
}

uploadElements().then(() => console.log('Done!'));
```

### 3. Lambda関数のデプロイ

#### 方法A: Serverless Frameworkを使用

```yaml
# serverless.yml
service: periodic-table-api

provider:
  name: aws
  runtime: nodejs18.x
  region: ap-northeast-1
  environment:
    ELEMENTS_TABLE_NAME: Elements
  iam:
    role:
      statements:
        - Effect: Allow
          Action:
            - dynamodb:Query
            - dynamodb:Scan
            - dynamodb:GetItem
            - dynamodb:PutItem
            - dynamodb:UpdateItem
            - dynamodb:DeleteItem
          Resource: "arn:aws:dynamodb:ap-northeast-1:*:table/Elements"

functions:
  api:
    handler: aws-lambda-example/handler.handler
    events:
      - httpApi:
          path: /elements
          method: GET
      - httpApi:
          path: /elements/{atomicNumber}
          method: GET
      - httpApi:
          path: /elements/symbol/{symbol}
          method: GET
      - httpApi:
          path: /elements/category/{category}
          method: GET
      - httpApi:
          path: /elements
          method: POST
      - httpApi:
          path: /elements/{atomicNumber}
          method: PUT
      - httpApi:
          path: /elements/{atomicNumber}
          method: DELETE
```

デプロイ:
```bash
npm install -g serverless
serverless deploy
```

#### 方法B: AWS SAM を使用

```yaml
# template.yaml
AWSTemplateFormatVersion: '2010-09-09'
Transform: AWS::Serverless-2016-10-31

Resources:
  ElementsApi:
    Type: AWS::Serverless::Function
    Properties:
      Handler: handler.handler
      Runtime: nodejs18.x
      CodeUri: aws-lambda-example/
      Environment:
        Variables:
          ELEMENTS_TABLE_NAME: Elements
      Policies:
        - DynamoDBCrudPolicy:
            TableName: Elements
      Events:
        GetElements:
          Type: HttpApi
          Properties:
            Path: /elements
            Method: GET
        # ... 他のエンドポイント
```

デプロイ:
```bash
sam build
sam deploy --guided
```

### 4. フロントエンドの環境変数を更新

`.env` ファイルを更新:

```env
VITE_USE_REMOTE_DB=true
VITE_API_BASE_URL=https://your-api-id.execute-api.ap-northeast-1.amazonaws.com/prod
```

## API エンドポイント

| メソッド | パス | 説明 |
|---------|------|------|
| GET | `/elements` | すべての元素を取得 |
| GET | `/elements/{atomicNumber}` | 原子番号で元素を取得 |
| GET | `/elements/symbol/{symbol}` | 元素記号で元素を取得 |
| GET | `/elements/category/{category}` | カテゴリで元素を取得 |
| POST | `/elements` | 新規元素を作成 |
| PUT | `/elements/{atomicNumber}` | 元素を更新 |
| DELETE | `/elements/{atomicNumber}` | 元素を削除 |

## コスト見積もり

- **DynamoDB**: オンデマンド課金、100元素程度ならほぼ無料枠内
- **Lambda**: 月100万リクエストまで無料
- **API Gateway**: HTTP APIは安価（REST APIより70%安い）

月間1万リクエスト程度なら、ほぼ無料で運用可能です。

## セキュリティ考慮事項

本番環境では以下を追加してください:

1. **認証**: API Gateway Authorizerを追加
2. **レート制限**: API Gatewayのスロットリング設定
3. **CORS**: 適切なオリジン設定
4. **暗号化**: DynamoDBの暗号化を有効化
5. **監視**: CloudWatch Logsとアラーム設定

## 開発時のローカルテスト

```bash
# DynamoDB Localを使用
docker run -p 8000:8000 amazon/dynamodb-local

# Lambdaをローカルで実行
sam local start-api
```
