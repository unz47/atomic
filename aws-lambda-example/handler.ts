/**
 * AWS Lambda + API Gateway用のサンプルハンドラー
 *
 * デプロイ方法:
 * 1. AWS DynamoDB テーブル作成 (テーブル名: Elements, プライマリキー: atomicNumber)
 * 2. このコードをLambda関数にデプロイ
 * 3. API Gatewayと連携
 * 4. フロントエンドの環境変数を更新
 *
 * 必要なパッケージ:
 * - @aws-sdk/client-dynamodb
 * - @aws-sdk/lib-dynamodb
 */

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand, UpdateCommand, DeleteCommand, ScanCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({ region: process.env.AWS_REGION || 'ap-northeast-1' });
const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.ELEMENTS_TABLE_NAME || 'Elements';

interface APIGatewayEvent {
  httpMethod: string;
  path: string;
  pathParameters?: { [key: string]: string };
  queryStringParameters?: { [key: string]: string };
  body?: string;
}

interface APIGatewayResponse {
  statusCode: number;
  headers: { [key: string]: string };
  body: string;
}

/**
 * CORS対応のレスポンスヘッダー
 */
const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

/**
 * メインハンドラー
 */
export async function handler(event: APIGatewayEvent): Promise<APIGatewayResponse> {
  console.log('Event:', JSON.stringify(event, null, 2));

  try {
    // OPTIONSリクエスト（CORS preflight）
    if (event.httpMethod === 'OPTIONS') {
      return {
        statusCode: 200,
        headers,
        body: '',
      };
    }

    const { httpMethod, path, pathParameters, body } = event;

    // ルーティング
    if (path === '/elements' && httpMethod === 'GET') {
      return await getAllElements();
    }

    if (path.match(/\/elements\/\d+$/) && httpMethod === 'GET') {
      const atomicNumber = parseInt(pathParameters?.atomicNumber || '0');
      return await getElementByAtomicNumber(atomicNumber);
    }

    if (path.match(/\/elements\/symbol\/\w+$/) && httpMethod === 'GET') {
      const symbol = pathParameters?.symbol || '';
      return await getElementBySymbol(symbol);
    }

    if (path.match(/\/elements\/category\/[\w-]+$/) && httpMethod === 'GET') {
      const category = pathParameters?.category || '';
      return await getElementsByCategory(category);
    }

    if (path === '/elements' && httpMethod === 'POST') {
      const element = JSON.parse(body || '{}');
      return await createElementInDB(element);
    }

    if (path.match(/\/elements\/\d+$/) && httpMethod === 'PUT') {
      const atomicNumber = parseInt(pathParameters?.atomicNumber || '0');
      const updates = JSON.parse(body || '{}');
      return await updateElementInDB(atomicNumber, updates);
    }

    if (path.match(/\/elements\/\d+$/) && httpMethod === 'DELETE') {
      const atomicNumber = parseInt(pathParameters?.atomicNumber || '0');
      return await deleteElementFromDB(atomicNumber);
    }

    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: 'Not Found' }),
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal Server Error', message: (error as Error).message }),
    };
  }
}

/**
 * すべての元素を取得
 */
async function getAllElements(): Promise<APIGatewayResponse> {
  const command = new ScanCommand({
    TableName: TABLE_NAME,
  });

  const result = await docClient.send(command);
  const elements = (result.Items || []).sort((a, b) => a.atomicNumber - b.atomicNumber);

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify(elements),
  };
}

/**
 * 原子番号で元素を取得
 */
async function getElementByAtomicNumber(atomicNumber: number): Promise<APIGatewayResponse> {
  const command = new GetCommand({
    TableName: TABLE_NAME,
    Key: { atomicNumber },
  });

  const result = await docClient.send(command);

  if (!result.Item) {
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: 'Element not found' }),
    };
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify(result.Item),
  };
}

/**
 * 元素記号で元素を取得
 */
async function getElementBySymbol(symbol: string): Promise<APIGatewayResponse> {
  const command = new ScanCommand({
    TableName: TABLE_NAME,
    FilterExpression: 'symbol = :symbol',
    ExpressionAttributeValues: {
      ':symbol': symbol,
    },
  });

  const result = await docClient.send(command);

  if (!result.Items || result.Items.length === 0) {
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: 'Element not found' }),
    };
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify(result.Items[0]),
  };
}

/**
 * カテゴリで元素を取得
 */
async function getElementsByCategory(category: string): Promise<APIGatewayResponse> {
  const command = new ScanCommand({
    TableName: TABLE_NAME,
    FilterExpression: 'category = :category',
    ExpressionAttributeValues: {
      ':category': category,
    },
  });

  const result = await docClient.send(command);

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify(result.Items || []),
  };
}

/**
 * 元素を作成
 */
async function createElementInDB(element: any): Promise<APIGatewayResponse> {
  const command = new PutCommand({
    TableName: TABLE_NAME,
    Item: element,
  });

  await docClient.send(command);

  return {
    statusCode: 201,
    headers,
    body: JSON.stringify(element),
  };
}

/**
 * 元素を更新
 */
async function updateElementInDB(atomicNumber: number, updates: any): Promise<APIGatewayResponse> {
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

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify(result.Attributes),
  };
}

/**
 * 元素を削除
 */
async function deleteElementFromDB(atomicNumber: number): Promise<APIGatewayResponse> {
  const command = new DeleteCommand({
    TableName: TABLE_NAME,
    Key: { atomicNumber },
  });

  await docClient.send(command);

  return {
    statusCode: 204,
    headers,
    body: '',
  };
}
