/**
 * ローカル開発用APIサーバー
 *
 * DynamoDB Localに接続して、元素データのCRUD操作を提供します。
 *
 * 起動方法:
 * npm run dev:api
 */

import express from 'express';
import cors from 'cors';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand, UpdateCommand, DeleteCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';

const app = express();
const PORT = 3000;

// ミドルウェア
app.use(cors());
app.use(express.json());

// DynamoDB Local接続設定
const client = new DynamoDBClient({
  region: 'ap-northeast-1',
  endpoint: 'http://localhost:8000',
  credentials: {
    accessKeyId: 'local',
    secretAccessKey: 'local',
  },
});

const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = 'Elements';

/**
 * GET /api/elements
 * すべての元素を取得
 */
app.get('/api/elements', async (req, res) => {
  try {
    const command = new ScanCommand({
      TableName: TABLE_NAME,
    });

    const result = await docClient.send(command);
    const elements = (result.Items || []).sort((a, b) => a.atomicNumber - b.atomicNumber);

    res.json(elements);
  } catch (error) {
    console.error('Error fetching elements:', error);
    res.status(500).json({ error: 'Failed to fetch elements' });
  }
});

/**
 * GET /api/elements/:atomicNumber
 * 原子番号で元素を取得
 */
app.get('/api/elements/:atomicNumber', async (req, res) => {
  try {
    const atomicNumber = parseInt(req.params.atomicNumber);

    const command = new GetCommand({
      TableName: TABLE_NAME,
      Key: { atomicNumber },
    });

    const result = await docClient.send(command);

    if (!result.Item) {
      return res.status(404).json({ error: 'Element not found' });
    }

    res.json(result.Item);
  } catch (error) {
    console.error('Error fetching element:', error);
    res.status(500).json({ error: 'Failed to fetch element' });
  }
});

/**
 * GET /api/elements/symbol/:symbol
 * 元素記号で元素を取得
 */
app.get('/api/elements/symbol/:symbol', async (req, res) => {
  try {
    const symbol = req.params.symbol;

    const command = new ScanCommand({
      TableName: TABLE_NAME,
      FilterExpression: 'symbol = :symbol',
      ExpressionAttributeValues: {
        ':symbol': symbol,
      },
    });

    const result = await docClient.send(command);

    if (!result.Items || result.Items.length === 0) {
      return res.status(404).json({ error: 'Element not found' });
    }

    res.json(result.Items[0]);
  } catch (error) {
    console.error('Error fetching element by symbol:', error);
    res.status(500).json({ error: 'Failed to fetch element' });
  }
});

/**
 * GET /api/elements/category/:category
 * カテゴリで元素を取得
 */
app.get('/api/elements/category/:category', async (req, res) => {
  try {
    const category = req.params.category;

    const command = new ScanCommand({
      TableName: TABLE_NAME,
      FilterExpression: 'category = :category',
      ExpressionAttributeValues: {
        ':category': category,
      },
    });

    const result = await docClient.send(command);

    res.json(result.Items || []);
  } catch (error) {
    console.error('Error fetching elements by category:', error);
    res.status(500).json({ error: 'Failed to fetch elements' });
  }
});

/**
 * POST /api/elements
 * 新規元素を作成
 */
app.post('/api/elements', async (req, res) => {
  try {
    const element = req.body;

    const command = new PutCommand({
      TableName: TABLE_NAME,
      Item: element,
    });

    await docClient.send(command);

    res.status(201).json(element);
  } catch (error) {
    console.error('Error creating element:', error);
    res.status(500).json({ error: 'Failed to create element' });
  }
});

/**
 * PUT /api/elements/:atomicNumber
 * 元素を更新
 */
app.put('/api/elements/:atomicNumber', async (req, res) => {
  try {
    const atomicNumber = parseInt(req.params.atomicNumber);
    const updates = req.body;

    // UpdateExpressionを動的に生成
    const updateExpressionParts: string[] = [];
    const expressionAttributeNames: { [key: string]: string } = {};
    const expressionAttributeValues: { [key: string]: any } = {};

    Object.keys(updates).forEach((key, index) => {
      updateExpressionParts.push(`#field${index} = :value${index}`);
      expressionAttributeNames[`#field${index}`] = key;
      expressionAttributeValues[`:value${index}`] = updates[key];
    });

    const command = new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { atomicNumber },
      UpdateExpression: `SET ${updateExpressionParts.join(', ')}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW',
    });

    const result = await docClient.send(command);

    res.json(result.Attributes);
  } catch (error) {
    console.error('Error updating element:', error);
    res.status(500).json({ error: 'Failed to update element' });
  }
});

/**
 * DELETE /api/elements/:atomicNumber
 * 元素を削除
 */
app.delete('/api/elements/:atomicNumber', async (req, res) => {
  try {
    const atomicNumber = parseInt(req.params.atomicNumber);

    const command = new DeleteCommand({
      TableName: TABLE_NAME,
      Key: { atomicNumber },
    });

    await docClient.send(command);

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting element:', error);
    res.status(500).json({ error: 'Failed to delete element' });
  }
});

/**
 * GET /api/health
 * ヘルスチェック
 */
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// サーバー起動
app.listen(PORT, () => {
  console.log('\n🚀 ローカルAPIサーバーが起動しました');
  console.log(`📡 http://localhost:${PORT}`);
  console.log('\n利用可能なエンドポイント:');
  console.log(`  GET    /api/elements`);
  console.log(`  GET    /api/elements/:atomicNumber`);
  console.log(`  GET    /api/elements/symbol/:symbol`);
  console.log(`  GET    /api/elements/category/:category`);
  console.log(`  POST   /api/elements`);
  console.log(`  PUT    /api/elements/:atomicNumber`);
  console.log(`  DELETE /api/elements/:atomicNumber`);
  console.log(`  GET    /api/health`);
  console.log('\n');
});
