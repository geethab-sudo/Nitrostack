/**
 * Script to update all users to have email addresses
 * Generates email addresses for users that don't have them based on their name
 * 
 * Run with: node scripts/update-users-email.js
 */

import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/';
const DATABASE_NAME = process.env.MONGODB_DATABASE_NAME || 'Insurance';
const COLLECTION_NAME = 'Users';

/**
 * Generate email from name
 */
function generateEmail(name) {
  // Convert name to lowercase, replace spaces with dots, remove special characters
  const emailName = name
    .toLowerCase()
    .replace(/\s+/g, '.')
    .replace(/[^a-z0-9.]/g, '')
    .substring(0, 50); // Limit length
  
  return `${emailName}@example.com`;
}

/**
 * Check if email already exists
 */
async function emailExists(collection, email, excludeId = null) {
  const query = { email };
  if (excludeId) {
    query._id = { $ne: excludeId };
  }
  const count = await collection.countDocuments(query);
  return count > 0;
}

/**
 * Generate unique email
 */
async function generateUniqueEmail(collection, name, excludeId = null) {
  let baseEmail = generateEmail(name);
  let email = baseEmail;
  let counter = 1;
  
  while (await emailExists(collection, email, excludeId)) {
    // If email exists, add a number suffix
    const emailParts = baseEmail.split('@');
    email = `${emailParts[0]}${counter}@${emailParts[1]}`;
    counter++;
  }
  
  return email;
}

async function updateUsersEmail() {
  let client;
  
  try {
    console.log('Connecting to MongoDB...');
    console.log(`URI: ${MONGODB_URI}`);
    console.log(`Database: ${DATABASE_NAME}`);
    console.log(`Collection: ${COLLECTION_NAME}\n`);
    
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('✅ Connected to MongoDB successfully!\n');
    
    const db = client.db(DATABASE_NAME);
    const collection = db.collection(COLLECTION_NAME);
    
    // Get all users
    const users = await collection.find({}).toArray();
    console.log(`Found ${users.length} users in the database.\n`);
    
    if (users.length === 0) {
      console.log('⚠️  No users found. Nothing to update.');
      return;
    }
    
    // Check how many users already have emails
    const usersWithEmail = users.filter(u => u.email && u.email.trim() !== '');
    const usersWithoutEmail = users.filter(u => !u.email || u.email.trim() === '');
    
    console.log(`📊 Current Status:`);
    console.log(`   - Users with email: ${usersWithEmail.length}`);
    console.log(`   - Users without email: ${usersWithoutEmail.length}\n`);
    
    let updatedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    
    // Update users without email
    if (usersWithoutEmail.length > 0) {
      console.log('🔄 Updating users without email addresses...\n');
      
      for (const user of usersWithoutEmail) {
        try {
          const newEmail = await generateUniqueEmail(collection, user.name, user._id);
          
          const result = await collection.updateOne(
            { _id: user._id },
            { 
              $set: { 
                email: newEmail,
                updatedAt: new Date()
              }
            }
          );
          
          if (result.modifiedCount > 0) {
            console.log(`✅ Updated: ${user.name} -> ${newEmail}`);
            updatedCount++;
          } else {
            console.log(`⚠️  Skipped: ${user.name} (no changes needed)`);
            skippedCount++;
          }
        } catch (error) {
          console.error(`❌ Error updating ${user.name}:`, error.message);
          errorCount++;
        }
      }
    }
    
    // Verify all users have emails
    console.log('\n🔍 Verifying all users have email addresses...');
    const usersAfterUpdate = await collection.find({}).toArray();
    const usersStillWithoutEmail = usersAfterUpdate.filter(u => !u.email || u.email.trim() === '');
    
    if (usersStillWithoutEmail.length === 0) {
      console.log('✅ All users now have email addresses!\n');
    } else {
      console.log(`⚠️  ${usersStillWithoutEmail.length} users still don't have email addresses.`);
      usersStillWithoutEmail.forEach(u => {
        console.log(`   - ${u.name} (ID: ${u._id})`);
      });
      console.log('');
    }
    
    // Display summary
    console.log('📊 Update Summary:');
    console.log('─'.repeat(80));
    console.log(`   Total users: ${users.length}`);
    console.log(`   Updated: ${updatedCount}`);
    console.log(`   Already had email: ${usersWithEmail.length}`);
    console.log(`   Skipped: ${skippedCount}`);
    console.log(`   Errors: ${errorCount}`);
    console.log(`   Users with email now: ${usersAfterUpdate.length - usersStillWithoutEmail.length}`);
    console.log('');
    
    // Display sample updated users
    if (updatedCount > 0) {
      console.log('📋 Sample Updated Users:');
      console.log('─'.repeat(80));
      const updatedUsers = await collection.find({ 
        _id: { $in: usersWithoutEmail.map(u => u._id) }
      }).limit(5).toArray();
      
      updatedUsers.forEach((user, index) => {
        console.log(`${index + 1}. ${user.name}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Age: ${user.age}, Salary: ₹${user.salary?.toLocaleString('en-IN') || 'N/A'}`);
        console.log('');
      });
    }
    
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

updateUsersEmail();
