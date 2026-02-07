/**
 * Script to populate Users collection with sample data
 * 
 * Run with: node scripts/populate-users-data.js
 */

import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/';
const DATABASE_NAME = process.env.MONGODB_DATABASE_NAME || 'Insurance';
const COLLECTION_NAME = 'Users';

const sampleUsers = [
  {
    name: 'Rajesh Kumar',
    age: 32,
    salary: 800000,
    designation: 'Software Engineer',
    familyMembers: [
      { name: 'Priya Kumar', age: 28, relationship: 'spouse' },
      { name: 'Arjun Kumar', age: 5, relationship: 'child' },
      { name: 'Ananya Kumar', age: 3, relationship: 'child' }
    ],
    email: 'rajesh.kumar@example.com',
    phone: '+91-9876543210',
    address: '123 MG Road, Bangalore, Karnataka 560001',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Priya Sharma',
    age: 28,
    salary: 600000,
    designation: 'Marketing Manager',
    familyMembers: [
      { name: 'Rahul Sharma', age: 30, relationship: 'spouse' },
      { name: 'Ishaan Sharma', age: 2, relationship: 'child' }
    ],
    email: 'priya.sharma@example.com',
    phone: '+91-9876543211',
    address: '456 Park Street, Mumbai, Maharashtra 400001',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Amit Patel',
    age: 35,
    salary: 1200000,
    designation: 'Senior Developer',
    familyMembers: [
      { name: 'Sneha Patel', age: 32, relationship: 'spouse' },
      { name: 'Vihaan Patel', age: 8, relationship: 'child' },
      { name: 'Aarav Patel', age: 6, relationship: 'child' },
      { name: 'Kavya Patel', age: 4, relationship: 'child' }
    ],
    email: 'amit.patel@example.com',
    phone: '+91-9876543212',
    address: '789 Sector 18, Noida, Uttar Pradesh 201301',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Sneha Reddy',
    age: 29,
    salary: 750000,
    designation: 'Product Manager',
    familyMembers: [
      { name: 'Vikram Reddy', age: 31, relationship: 'spouse' }
    ],
    email: 'sneha.reddy@example.com',
    phone: '+91-9876543213',
    address: '321 Jubilee Hills, Hyderabad, Telangana 500033',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Ravi Singh',
    age: 42,
    salary: 1500000,
    designation: 'Director of Engineering',
    familyMembers: [
      { name: 'Meera Singh', age: 38, relationship: 'spouse' },
      { name: 'Aditya Singh', age: 15, relationship: 'child' },
      { name: 'Anika Singh', age: 12, relationship: 'child' },
      { name: 'Rohan Singh', age: 8, relationship: 'child' }
    ],
    email: 'ravi.singh@example.com',
    phone: '+91-9876543214',
    address: '654 Connaught Place, New Delhi, Delhi 110001',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Kavita Desai',
    age: 26,
    salary: 500000,
    designation: 'Junior Developer',
    familyMembers: [
      { name: 'Rohit Desai', age: 28, relationship: 'spouse' }
    ],
    email: 'kavita.desai@example.com',
    phone: '+91-9876543215',
    address: '987 Koregaon Park, Pune, Maharashtra 411001',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Vikram Iyer',
    age: 38,
    salary: 1800000,
    designation: 'VP of Sales',
    familyMembers: [
      { name: 'Anjali Iyer', age: 35, relationship: 'spouse' },
      { name: 'Neel Iyer', age: 10, relationship: 'child' },
      { name: 'Nisha Iyer', age: 7, relationship: 'child' }
    ],
    email: 'vikram.iyer@example.com',
    phone: '+91-9876543216',
    address: '147 Indiranagar, Bangalore, Karnataka 560038',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Anita Nair',
    age: 31,
    salary: 900000,
    designation: 'Data Scientist',
    familyMembers: [
      { name: 'Suresh Nair', age: 33, relationship: 'spouse' },
      { name: 'Dev Nair', age: 4, relationship: 'child' }
    ],
    email: 'anita.nair@example.com',
    phone: '+91-9876543217',
    address: '258 Banjara Hills, Hyderabad, Telangana 500034',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Mohammed Ali',
    age: 45,
    salary: 2000000,
    designation: 'Chief Technology Officer',
    familyMembers: [
      { name: 'Fatima Ali', age: 42, relationship: 'spouse' },
      { name: 'Zain Ali', age: 18, relationship: 'child' },
      { name: 'Ayesha Ali', age: 16, relationship: 'child' },
      { name: 'Hassan Ali', age: 13, relationship: 'child' }
    ],
    email: 'mohammed.ali@example.com',
    phone: '+91-9876543218',
    address: '369 Whitefield, Bangalore, Karnataka 560066',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Deepika Menon',
    age: 27,
    salary: 550000,
    designation: 'UI/UX Designer',
    familyMembers: [
      { name: 'Arjun Menon', age: 29, relationship: 'spouse' },
      { name: 'Aria Menon', age: 1, relationship: 'child' }
    ],
    email: 'deepika.menon@example.com',
    phone: '+91-9876543219',
    address: '741 HSR Layout, Bangalore, Karnataka 560102',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Suresh Kumar',
    age: 50,
    salary: 2500000,
    designation: 'CEO',
    familyMembers: [
      { name: 'Lakshmi Kumar', age: 48, relationship: 'spouse' },
      { name: 'Karthik Kumar', age: 22, relationship: 'child' },
      { name: 'Divya Kumar', age: 20, relationship: 'child' }
    ],
    email: 'suresh.kumar@example.com',
    phone: '+91-9876543220',
    address: '852 Worli, Mumbai, Maharashtra 400018',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Pooja Gupta',
    age: 33,
    salary: 1100000,
    designation: 'Senior Product Manager',
    familyMembers: [
      { name: 'Rahul Gupta', age: 35, relationship: 'spouse' },
      { name: 'Ishaan Gupta', age: 6, relationship: 'child' },
      { name: 'Myra Gupta', age: 3, relationship: 'child' }
    ],
    email: 'pooja.gupta@example.com',
    phone: '+91-9876543221',
    address: '963 Salt Lake, Kolkata, West Bengal 700064',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Nikhil Joshi',
    age: 30,
    salary: 850000,
    designation: 'DevOps Engineer',
    familyMembers: [
      { name: 'Shruti Joshi', age: 28, relationship: 'spouse' },
      { name: 'Aryan Joshi', age: 4, relationship: 'child' }
    ],
    email: 'nikhil.joshi@example.com',
    phone: '+91-9876543222',
    address: '159 Viman Nagar, Pune, Maharashtra 411014',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Meera Krishnan',
    age: 36,
    salary: 1300000,
    designation: 'Engineering Manager',
    familyMembers: [
      { name: 'Siddharth Krishnan', age: 38, relationship: 'spouse' },
      { name: 'Advik Krishnan', age: 9, relationship: 'child' },
      { name: 'Anvi Krishnan', age: 6, relationship: 'child' }
    ],
    email: 'meera.krishnan@example.com',
    phone: '+91-9876543223',
    address: '357 Adyar, Chennai, Tamil Nadu 600020',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Rohan Malhotra',
    age: 24,
    salary: 450000,
    designation: 'Associate Developer',
    familyMembers: [],
    email: 'rohan.malhotra@example.com',
    phone: '+91-9876543224',
    address: '741 Sector 63, Noida, Uttar Pradesh 201301',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

async function populateUsersData() {
  let client;
  
  try {
    console.log('Connecting to MongoDB...');
    console.log(`URI: ${MONGODB_URI}`);
    console.log(`Database: ${DATABASE_NAME}`);
    console.log(`Collection: ${COLLECTION_NAME}`);
    
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('✅ Connected to MongoDB successfully!');
    
    const db = client.db(DATABASE_NAME);
    const collection = db.collection(COLLECTION_NAME);
    
    // Check if collection already has data
    const existingCount = await collection.countDocuments();
    if (existingCount > 0) {
      console.log(`\n⚠️  Collection already has ${existingCount} documents.`);
      console.log('Deleting existing data...');
      await collection.deleteMany({});
      console.log('✅ Existing data deleted.');
    }
    
    console.log(`\nInserting ${sampleUsers.length} users...`);
    const result = await collection.insertMany(sampleUsers);
    console.log(`✅ Successfully inserted ${result.insertedCount} users!`);
    
    // Display summary
    console.log('\n📊 Summary:');
    
    // Count by designation
    const designations = await collection.distinct('designation');
    console.log('\n  Users by Designation:');
    for (const designation of designations) {
      const count = await collection.countDocuments({ designation });
      console.log(`    - ${designation}: ${count}`);
    }
    
    // Count by age ranges
    const ageRanges = [
      { label: '20-29', min: 20, max: 29 },
      { label: '30-39', min: 30, max: 39 },
      { label: '40-49', min: 40, max: 49 },
      { label: '50+', min: 50, max: 100 }
    ];
    
    console.log('\n  Users by Age Range:');
    for (const range of ageRanges) {
      const count = await collection.countDocuments({
        age: { $gte: range.min, $lte: range.max }
      });
      console.log(`    - ${range.label}: ${count}`);
    }
    
    // Count by salary ranges
    const salaryRanges = [
      { label: 'Below 5L', max: 500000 },
      { label: '5L - 10L', min: 500000, max: 1000000 },
      { label: '10L - 15L', min: 1000000, max: 1500000 },
      { label: '15L - 20L', min: 1500000, max: 2000000 },
      { label: 'Above 20L', min: 2000000 }
    ];
    
    console.log('\n  Users by Salary Range:');
    for (const range of salaryRanges) {
      let query = {};
      if (range.min && range.max) {
        query = { salary: { $gte: range.min, $lt: range.max } };
      } else if (range.max) {
        query = { salary: { $lt: range.max } };
      } else if (range.min) {
        query = { salary: { $gte: range.min } };
      }
      const count = await collection.countDocuments(query);
      console.log(`    - ${range.label}: ${count}`);
    }
    
    // Family members statistics
    const usersWithFamily = await collection.countDocuments({
      'familyMembers.0': { $exists: true }
    });
    const usersWithoutFamily = await collection.countDocuments({
      familyMembers: { $size: 0 }
    });
    
    console.log('\n  Family Statistics:');
    console.log(`    - Users with family: ${usersWithFamily}`);
    console.log(`    - Users without family: ${usersWithoutFamily}`);
    
    // Calculate average family size
    const allUsers = await collection.find({}).toArray();
    const totalFamilyMembers = allUsers.reduce((sum, user) => {
      return sum + (user.familyMembers?.length || 0);
    }, 0);
    const avgFamilySize = (totalFamilyMembers / allUsers.length).toFixed(2);
    console.log(`    - Average family size: ${avgFamilySize} members`);
    
    console.log('\n✅ Data population completed successfully!');
    console.log(`\nDatabase: ${DATABASE_NAME}`);
    console.log(`Collection: ${COLLECTION_NAME}`);
    console.log(`Total Documents: ${await collection.countDocuments()}`);
    
  } catch (error) {
    console.error('❌ Error populating users data:', error);
    throw error;
  } finally {
    if (client) {
      await client.close();
      console.log('\nMongoDB connection closed.');
    }
  }
}

// Run the script
populateUsersData()
  .then(() => {
    console.log('\n✨ Script execution completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
