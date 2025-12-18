#!/usr/bin/env node

/**
 * DynamoDB Table Management Script
 * Checks and creates DynamoDB tables if they don't exist
 */

import { DynamoDBClient, ListTablesCommand, CreateTableCommand, DescribeTableCommand } from '@aws-sdk/client-dynamodb';
import { fromEnv } from '@aws-sdk/credential-providers';

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: fromEnv()
});

const TABLES = {
  UnityAIAssistantLogs: {
    TableName: 'UnityAIAssistantLogs',
    BillingMode: 'PAY_PER_REQUEST',
    AttributeDefinitions: [
      { AttributeName: 'id', AttributeType: 'S' },
      { AttributeName: 'conversationId', AttributeType: 'S' },
      { AttributeName: 'userId', AttributeType: 'S' },
      { AttributeName: 'timestamp', AttributeType: 'S' }
    ],
    KeySchema: [
      { AttributeName: 'id', KeyType: 'HASH' }
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'byConversation',
        KeySchema: [
          { AttributeName: 'conversationId', KeyType: 'HASH' },
          { AttributeName: 'timestamp', KeyType: 'RANGE' }
        ],
        Projection: { ProjectionType: 'ALL' }
      },
      {
        IndexName: 'byUser',
        KeySchema: [
          { AttributeName: 'userId', KeyType: 'HASH' },
          { AttributeName: 'timestamp', KeyType: 'RANGE' }
        ],
        Projection: { ProjectionType: 'ALL' }
      }
    ],
    StreamSpecification: {
      StreamEnabled: true,
      StreamViewType: 'NEW_AND_OLD_IMAGES'
    },
    Tags: [
      { Key: 'Environment', Value: process.env.ENVIRONMENT || 'production' },
      { Key: 'Project', Value: 'swbc-ethos-ai' }
    ]
  },
  userFeedback: {
    TableName: 'userFeedback',
    BillingMode: 'PAY_PER_REQUEST',
    AttributeDefinitions: [
      { AttributeName: 'id', AttributeType: 'S' },
      { AttributeName: 'logId', AttributeType: 'S' },
      { AttributeName: 'userId', AttributeType: 'S' },
      { AttributeName: 'timestamp', AttributeType: 'S' }
    ],
    KeySchema: [
      { AttributeName: 'id', KeyType: 'HASH' }
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'byLogId',
        KeySchema: [
          { AttributeName: 'logId', KeyType: 'HASH' },
          { AttributeName: 'timestamp', KeyType: 'RANGE' }
        ],
        Projection: { ProjectionType: 'ALL' }
      },
      {
        IndexName: 'byUser',
        KeySchema: [
          { AttributeName: 'userId', KeyType: 'HASH' },
          { AttributeName: 'timestamp', KeyType: 'RANGE' }
        ],
        Projection: { ProjectionType: 'ALL' }
      }
    ],
    Tags: [
      { Key: 'Environment', Value: process.env.ENVIRONMENT || 'production' },
      { Key: 'Project', Value: 'swbc-ethos-ai' }
    ]
  },
  UnityAIAssistantEvalJob: {
    TableName: 'UnityAIAssistantEvalJob',
    BillingMode: 'PAY_PER_REQUEST',
    AttributeDefinitions: [
      { AttributeName: 'id', AttributeType: 'S' },
      { AttributeName: 'status', AttributeType: 'S' },
      { AttributeName: 'createdAt', AttributeType: 'S' }
    ],
    KeySchema: [
      { AttributeName: 'id', KeyType: 'HASH' }
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'byStatus',
        KeySchema: [
          { AttributeName: 'status', KeyType: 'HASH' },
          { AttributeName: 'createdAt', KeyType: 'RANGE' }
        ],
        Projection: { ProjectionType: 'ALL' }
      }
    ],
    Tags: [
      { Key: 'Environment', Value: process.env.ENVIRONMENT || 'production' },
      { Key: 'Project', Value: 'swbc-ethos-ai' }
    ]
  }
};

async function listExistingTables() {
  try {
    const command = new ListTablesCommand({});
    const response = await client.send(command);
    return response.TableNames || [];
  } catch (error) {
    console.error('Error listing tables:', error);
    throw error;
  }
}

async function tableExists(tableName) {
  try {
    const command = new DescribeTableCommand({ TableName: tableName });
    const response = await client.send(command);
    return response.Table?.TableStatus === 'ACTIVE';
  } catch (error) {
    if (error.name === 'ResourceNotFoundException') {
      return false;
    }
    throw error;
  }
}

async function createTable(tableConfig) {
  try {
    console.log(`Creating table: ${tableConfig.TableName}`);
    const command = new CreateTableCommand(tableConfig);
    const response = await client.send(command);
    console.log(`✅ Table ${tableConfig.TableName} creation initiated`);
    return response;
  } catch (error) {
    if (error.name === 'ResourceInUseException') {
      console.log(`⚠️  Table ${tableConfig.TableName} already exists`);
      return null;
    }
    console.error(`❌ Error creating table ${tableConfig.TableName}:`, error);
    throw error;
  }
}

async function waitForTableActive(tableName, maxWaitTime = 300000) {
  const startTime = Date.now();
  console.log(`Waiting for table ${tableName} to become active...`);
  
  while (Date.now() - startTime < maxWaitTime) {
    try {
      const command = new DescribeTableCommand({ TableName: tableName });
      const response = await client.send(command);
      
      if (response.Table?.TableStatus === 'ACTIVE') {
        console.log(`✅ Table ${tableName} is now active`);
        return true;
      }
      
      console.log(`Table ${tableName} status: ${response.Table?.TableStatus}`);
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
    } catch (error) {
      console.error(`Error checking table status for ${tableName}:`, error);
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
  
  console.error(`❌ Timeout waiting for table ${tableName} to become active`);
  return false;
}

async function checkAndCreateTables() {
  console.log('🔍 Checking DynamoDB tables...\n');
  
  try {
    const existingTables = await listExistingTables();
    console.log('Existing tables:', existingTables);
    
    const tablesToCreate = [];
    
    for (const [tableName, tableConfig] of Object.entries(TABLES)) {
      const exists = await tableExists(tableName);
      
      if (exists) {
        console.log(`✅ Table ${tableName} already exists and is active`);
      } else {
        console.log(`❌ Table ${tableName} does not exist`);
        tablesToCreate.push(tableConfig);
      }
    }
    
    if (tablesToCreate.length === 0) {
      console.log('\n🎉 All required tables exist and are active!');
      return true;
    }
    
    console.log(`\n📝 Creating ${tablesToCreate.length} missing tables...`);
    
    // Create tables
    const creationPromises = tablesToCreate.map(tableConfig => createTable(tableConfig));
    await Promise.all(creationPromises);
    
    // Wait for all tables to become active
    console.log('\n⏳ Waiting for tables to become active...');
    const waitPromises = tablesToCreate.map(tableConfig => 
      waitForTableActive(tableConfig.TableName)
    );
    
    const results = await Promise.all(waitPromises);
    const allActive = results.every(result => result === true);
    
    if (allActive) {
      console.log('\n🎉 All tables created successfully and are active!');
      return true;
    } else {
      console.error('\n❌ Some tables failed to become active');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Error in table management:', error);
    return false;
  }
}

async function main() {
  console.log('DynamoDB Table Management Script');
  console.log('================================\n');
  
  const success = await checkAndCreateTables();
  
  if (success) {
    console.log('\n✅ DynamoDB table management completed successfully');
    process.exit(0);
  } else {
    console.error('\n❌ DynamoDB table management failed');
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
}

export { checkAndCreateTables, TABLES };