/**
 * Script to update the email index from sparse to unique
 * This ensures email is required and unique for all users
 * 
 * Run with: node scripts/update-email-index.js
 */

import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/';
const DATABASE_NAME = process.env.MONGODB_DATABASE_NAME || 'Insurance';
const COLLECTION_NAME = 'Users';

async function updateEmailIndex() {
  let client;
  
  try {
    console.log('Connecting to MongoDB...');
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('✅ Connected to MongoDB successfully!\n');
    
    const db = client.db(DATABASE_NAME);
    const collection = db.collection(COLLECTION_NAME);
    
    // Check current indexes
    console.log('📋 Current indexes:');
    const indexes = await collection.indexes();
    indexes.forEach(index => {
      console.log(`   - ${JSON.stringify(index)}`);
    });
    console.log('');
    
    // Check if all users have emails
    const totalUsers = await collection.countDocuments({});
    const usersWithEmail = await collection.countDocuments({ email: { $exists: true, $ne: '' } });
    const usersWithoutEmail = totalUsers - usersWithEmail;
    
    console.log('📊 User Email Status:');
    console.log(`   Total users: ${totalUsers}`);
    console.log(`   Users with email: ${usersWithEmail}`);
    console.log(`   Users without email: ${usersWithoutEmail}\n`);
    
    if (usersWithoutEmail > 0) {
      console.log('⚠️  Warning: Some users don\'t have email addresses.');
      console.log('   Please run: node scripts/update-users-email.js first.\n');
    }
    
    // Check for duplicate emails
    const duplicateEmails = await collection.aggregate([
      { $match: { email: { $exists: true, $ne: '' } } },
      { $group: { _id: '$email', count: { $sum: 1 } } },
      { $match: { count: { $gt: 1 } } }
    ]).toArray();
    
    if (duplicateEmails.length > 0) {
      console.log('❌ Found duplicate emails:');
      duplicateEmails.forEach(dup => {
        console.log(`   - ${dup._id}: ${dup.count} users`);
      });
      console.log('\n⚠️  Cannot create unique index with duplicate emails.');
      console.log('   Please fix duplicate emails first.\n');
      return;
    }
    
    // Drop existing email index if it exists
    try {
      await collection.dropIndex('email_1');
      console.log('✅ Dropped existing email index\n');
    } catch (error) {
      if (error.codeName === 'IndexNotFound') {
        console.log('ℹ️  No existing email index found\n');
      } else {
        throw error;
      }
    }
    
    // Create unique index on email
    console.log('🔄 Creating unique index on email...');
    await collection.createIndex(
      { email: 1 },
      { 
        unique: true,
        background: true,
        name: 'email_1'
      }
    );
    console.log('✅ Created unique index on email\n');
    
    // Verify the index
    console.log('📋 Updated indexes:');
    const newIndexes = await collection.indexes();
    newIndexes.forEach(index => {
      if (index.key && index.key.email) {
        console.log(`   - ${JSON.stringify(index)}`);
      }
    });
    console.log('');
    
    console.log('✅ Email index updated successfully!');
    console.log('   Email is now required and unique for all users.\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
      console.log('✅ Connection closed.');
    }
  }
}

updateEmailIndex();
