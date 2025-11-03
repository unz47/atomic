/**
 * ローカルDynamoDBのセットアップとデータ投入スクリプト
 *
 * 実行方法:
 * 1. Docker Composeを起動: docker-compose up -d
 * 2. このスクリプトを実行: npm run setup-local-db
 */

import { DynamoDBClient, CreateTableCommand, ListTablesCommand } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { elementsDB } from '../src/data/elementsDB';

// ローカルDynamoDB接続設定
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
 * テーブルが存在するかチェック
 */
async function tableExists(): Promise<boolean> {
  try {
    const command = new ListTablesCommand({});
    const response = await client.send(command);
    return response.TableNames?.includes(TABLE_NAME) || false;
  } catch (error) {
    console.error('テーブル確認エラー:', error);
    return false;
  }
}

/**
 * テーブルを作成
 */
async function createTable() {
  console.log(`\n📋 テーブル "${TABLE_NAME}" を作成中...`);

  const command = new CreateTableCommand({
    TableName: TABLE_NAME,
    AttributeDefinitions: [
      { AttributeName: 'atomicNumber', AttributeType: 'N' },
    ],
    KeySchema: [
      { AttributeName: 'atomicNumber', KeyType: 'HASH' },
    ],
    BillingMode: 'PAY_PER_REQUEST',
  });

  try {
    await client.send(command);
    console.log('✅ テーブルを作成しました');
    // テーブルが使用可能になるまで少し待機
    await new Promise(resolve => setTimeout(resolve, 2000));
  } catch (error: any) {
    if (error.name === 'ResourceInUseException') {
      console.log('ℹ️  テーブルは既に存在します');
    } else {
      throw error;
    }
  }
}

/**
 * 元素データを投入
 */
async function seedData() {
  console.log('\n📦 元素データを投入中...');

  const elements = Object.values(elementsDB);
  let successCount = 0;
  let errorCount = 0;

  for (const element of elements) {
    try {
      const command = new PutCommand({
        TableName: TABLE_NAME,
        Item: element,
      });

      await docClient.send(command);
      console.log(`  ✅ ${element.atomicNumber}. ${element.symbol} (${element.nameJa})`);
      successCount++;
    } catch (error) {
      console.error(`  ❌ ${element.symbol} の投入に失敗:`, error);
      errorCount++;
    }
  }

  console.log(`\n📊 結果: 成功 ${successCount}件 / 失敗 ${errorCount}件`);
}

/**
 * メイン処理
 */
async function main() {
  console.log('🚀 ローカルDynamoDBのセットアップを開始します\n');

  try {
    // DynamoDBへの接続確認
    console.log('🔌 DynamoDBへの接続を確認中...');
    const exists = await tableExists();

    if (!exists) {
      console.log('✅ 接続成功');
      await createTable();
    } else {
      console.log('✅ 接続成功（テーブルは既に存在します）');
    }

    // データ投入
    await seedData();

    console.log('\n🎉 セットアップが完了しました！');
    console.log('\n次のステップ:');
    console.log('  1. DynamoDB Admin UIを開く: http://localhost:8001');
    console.log('  2. ローカルAPIサーバーを起動: npm run dev:api');
    console.log('  3. フロントエンドを起動: npm run dev\n');
  } catch (error) {
    console.error('\n❌ エラーが発生しました:', error);
    console.log('\nトラブルシューティング:');
    console.log('  - Docker Composeが起動しているか確認: docker-compose ps');
    console.log('  - DynamoDBが起動しているか確認: docker logs periodic-table-dynamodb');
    console.log('  - ポート8000が使用可能か確認\n');
    process.exit(1);
  }
}

// スクリプト実行
main();
