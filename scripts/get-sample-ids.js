/**
 * Script to get sample User IDs and Insurance Plan IDs from MongoDB
 * Useful for testing the book_insurance tool
 * 
 * Run with: node scripts/get-sample-ids.js
 */

import { MongoClient, ObjectId } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/';
const DATABASE_NAME = process.env.MONGODB_DATABASE_NAME || 'Insurance';

async function getSampleIds() {
  let client;
  
  try {
    console.log('Connecting to MongoDB...');
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('✅ Connected to MongoDB successfully!\n');
    
    const db = client.db(DATABASE_NAME);
    const usersCollection = db.collection('Users');
    const insuranceCollection = db.collection('Insurance');
    
    // Get sample users
    console.log('📋 Sample Users:');
    console.log('─'.repeat(80));
    const users = await usersCollection.find({}).limit(5).toArray();
    if (users.length === 0) {
      console.log('⚠️  No users found. Run: node scripts/populate-users-data.js');
    } else {
      users.forEach((user, index) => {
        console.log(`${index + 1}. ${user.name} (Age: ${user.age}, Salary: ₹${user.salary?.toLocaleString('en-IN')})`);
        console.log(`   User ID: ${user._id.toString()}`);
        console.log(`   Email: ${user.email || 'N/A'}`);
        console.log('');
      });
    }
    
    // Get sample insurance plans
    console.log('\n📋 Sample Insurance Plans:');
    console.log('─'.repeat(80));
    const plans = await insuranceCollection.find({}).limit(5).toArray();
    if (plans.length === 0) {
      console.log('⚠️  No insurance plans found. Run: node scripts/populate-insurance-data.js');
    } else {
      plans.forEach((plan, index) => {
        console.log(`${index + 1}. ${plan.name}`);
        console.log(`   Plan ID: ${plan._id.toString()}`);
        console.log(`   Type: ${plan.type || 'N/A'}`);
        console.log(`   Premium: ₹${plan.premium?.toLocaleString('en-IN') || 'N/A'}`);
        console.log(`   Coverage: ₹${plan.coverage?.toLocaleString('en-IN') || 'N/A'}`);
        console.log('');
      });
    }
    
    // Generate example payload
    if (users.length > 0 && plans.length > 0) {
      console.log('\n📝 Example book_insurance Payload:');
      console.log('─'.repeat(80));
      console.log(JSON.stringify({
        userId: users[0]._id.toString(),
        insurancePlanId: plans[0]._id.toString(),
        paymentMethod: 'credit_card',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        notes: 'Booking after receiving suggestions'
      }, null, 2));
      console.log('');
      
      // Generate example with transaction ID
      console.log('\n📝 Example book_insurance Payload (with payment):');
      console.log('─'.repeat(80));
      console.log(JSON.stringify({
        userId: users[0]._id.toString(),
        insurancePlanId: plans[0]._id.toString(),
        paymentMethod: 'upi',
        transactionId: 'TXN' + Date.now(),
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        notes: 'Paid booking'
      }, null, 2));
      console.log('');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
      console.log('✅ Connection closed.');
    }
  }
}

getSampleIds();
