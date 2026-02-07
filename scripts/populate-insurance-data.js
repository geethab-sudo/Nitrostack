/**
 * Script to populate Insurance collection with sample data
 * Based on common insurance plans from Indian insurance providers
 * 
 * Run with: node scripts/populate-insurance-data.js
 */

import { MongoClient } from 'mongodb';

const MONGODB_URI = 'mongodb://localhost:27017/';
const DATABASE_NAME = 'Insurance';
const COLLECTION_NAME = 'Insurance';

const sampleInsurancePlans = [
  // Health Insurance Plans
  {
    name: 'Family Health Insurance Premium',
    type: 'Health',
    category: 'Health',
    provider: 'HDFC ERGO',
    minAge: 18,
    maxAge: 65,
    premium: 25000,
    coverage: 500000,
    familyCoverage: true,
    maxFamilyMembers: 6,
    coversPreExisting: true,
    coveredConditions: ['diabetes', 'hypertension', 'asthma', 'heart disease'],
    features: ['Cashless treatment', 'Pre and post hospitalization', 'Day care procedures'],
    description: 'Comprehensive family health insurance covering up to 6 members'
  },
  {
    name: 'Individual Health Shield',
    type: 'Health',
    category: 'Health',
    provider: 'ICICI Lombard',
    minAge: 18,
    maxAge: 70,
    premium: 12000,
    coverage: 300000,
    familyCoverage: false,
    maxFamilyMembers: 1,
    coversPreExisting: false,
    coveredConditions: [],
    features: ['Cashless hospitalization', 'OPD coverage', 'Preventive health checkup'],
    description: 'Individual health insurance plan for single person'
  },
  {
    name: 'Senior Citizen Health Plan',
    type: 'Health',
    category: 'Health',
    provider: 'Apollo Munich',
    minAge: 60,
    maxAge: 80,
    premium: 35000,
    coverage: 1000000,
    familyCoverage: true,
    maxFamilyMembers: 2,
    coversPreExisting: true,
    coveredConditions: ['diabetes', 'hypertension', 'arthritis', 'osteoporosis', 'heart disease'],
    features: ['Senior citizen specific coverage', 'Pre-existing conditions covered', 'Home care'],
    description: 'Specialized health insurance for senior citizens'
  },
  {
    name: 'Young Professional Health Plan',
    type: 'Health',
    category: 'Health',
    provider: 'Bajaj Allianz',
    minAge: 21,
    maxAge: 40,
    premium: 8000,
    coverage: 200000,
    familyCoverage: false,
    maxFamilyMembers: 1,
    coversPreExisting: false,
    coveredConditions: [],
    features: ['Affordable premium', 'Basic coverage', 'Online claim processing'],
    description: 'Budget-friendly health insurance for young professionals'
  },
  {
    name: 'Maternity Health Insurance',
    type: 'Health',
    category: 'Health',
    provider: 'Star Health',
    minAge: 18,
    maxAge: 45,
    premium: 30000,
    coverage: 400000,
    familyCoverage: true,
    maxFamilyMembers: 4,
    coversPreExisting: true,
    coveredConditions: ['pregnancy', 'maternity', 'newborn care'],
    features: ['Maternity coverage', 'Newborn baby coverage', 'Vaccination coverage'],
    description: 'Comprehensive maternity and family health insurance'
  },
  {
    name: 'Critical Illness Insurance',
    type: 'Health',
    category: 'Health',
    provider: 'TATA AIG',
    minAge: 25,
    maxAge: 65,
    premium: 15000,
    coverage: 2000000,
    familyCoverage: true,
    maxFamilyMembers: 4,
    coversPreExisting: true,
    coveredConditions: ['cancer', 'heart attack', 'stroke', 'kidney failure', 'major organ transplant'],
    features: ['Lump sum payout', 'Critical illness coverage', 'No hospitalization required'],
    description: 'Critical illness coverage with lump sum benefit'
  },
  {
    name: 'Comprehensive Family Health Plan',
    type: 'Health',
    category: 'Health',
    provider: 'Aditya Birla Health',
    minAge: 18,
    maxAge: 65,
    premium: 40000,
    coverage: 1000000,
    familyCoverage: true,
    maxFamilyMembers: 8,
    coversPreExisting: true,
    coveredConditions: ['diabetes', 'hypertension', 'asthma', 'heart disease', 'thyroid'],
    features: ['High coverage', 'Large family support', 'Pre-existing conditions', 'Wellness benefits'],
    description: 'Premium family health insurance with comprehensive coverage'
  },
  {
    name: 'Basic Health Insurance',
    type: 'Health',
    category: 'Health',
    provider: 'Oriental Insurance',
    minAge: 18,
    maxAge: 60,
    premium: 5000,
    coverage: 100000,
    familyCoverage: false,
    maxFamilyMembers: 1,
    coversPreExisting: false,
    coveredConditions: [],
    features: ['Basic hospitalization', 'Emergency coverage'],
    description: 'Basic health insurance for essential coverage'
  },
  
  // Life Insurance Plans
  {
    name: 'Term Life Insurance - 1 Crore',
    type: 'Life',
    category: 'Life',
    provider: 'LIC',
    minAge: 18,
    maxAge: 60,
    premium: 12000,
    coverage: 10000000,
    familyCoverage: false,
    maxFamilyMembers: 1,
    coversPreExisting: false,
    coveredConditions: [],
    features: ['High coverage', 'Term insurance', 'Affordable premium'],
    description: 'Term life insurance with 1 crore coverage'
  },
  {
    name: 'Whole Life Insurance Plan',
    type: 'Life',
    category: 'Life',
    provider: 'HDFC Life',
    minAge: 25,
    maxAge: 55,
    premium: 50000,
    coverage: 5000000,
    familyCoverage: true,
    maxFamilyMembers: 4,
    coversPreExisting: false,
    coveredConditions: [],
    features: ['Lifetime coverage', 'Maturity benefit', 'Family protection'],
    description: 'Whole life insurance with savings component'
  },
  {
    name: 'Term Insurance with Return of Premium',
    type: 'Life',
    category: 'Life',
    provider: 'ICICI Prudential',
    minAge: 25,
    maxAge: 50,
    premium: 20000,
    coverage: 7500000,
    familyCoverage: false,
    maxFamilyMembers: 1,
    coversPreExisting: false,
    coveredConditions: [],
    features: ['Premium return', 'High coverage', 'Term insurance'],
    description: 'Term insurance with return of premium feature'
  },
  
  // Accident Insurance
  {
    name: 'Personal Accident Insurance',
    type: 'Accident',
    category: 'Accident',
    provider: 'New India Assurance',
    minAge: 18,
    maxAge: 70,
    premium: 2000,
    coverage: 500000,
    familyCoverage: false,
    maxFamilyMembers: 1,
    coversPreExisting: false,
    coveredConditions: [],
    features: ['Accident coverage', 'Disability benefit', 'Low premium'],
    description: 'Personal accident insurance coverage'
  },
  {
    name: 'Family Accident Insurance',
    type: 'Accident',
    category: 'Accident',
    provider: 'United India Insurance',
    minAge: 18,
    maxAge: 65,
    premium: 5000,
    coverage: 1000000,
    familyCoverage: true,
    maxFamilyMembers: 4,
    coversPreExisting: false,
    coveredConditions: [],
    features: ['Family coverage', 'Accident protection', 'Affordable'],
    description: 'Family accident insurance plan'
  },
  
  // Travel Insurance
  {
    name: 'International Travel Insurance',
    type: 'Travel',
    category: 'Travel',
    provider: 'Reliance General',
    minAge: 0,
    maxAge: 80,
    premium: 3000,
    coverage: 500000,
    familyCoverage: true,
    maxFamilyMembers: 6,
    coversPreExisting: false,
    coveredConditions: [],
    features: ['Travel medical', 'Trip cancellation', 'Baggage loss'],
    description: 'International travel insurance for family'
  },
  
  // Motor Insurance
  {
    name: 'Comprehensive Car Insurance',
    type: 'Motor',
    category: 'Motor',
    provider: 'Bajaj Allianz',
    minAge: 18,
    maxAge: 70,
    premium: 15000,
    coverage: 500000,
    familyCoverage: false,
    maxFamilyMembers: 1,
    coversPreExisting: false,
    coveredConditions: [],
    features: ['Third party liability', 'Own damage', 'Personal accident'],
    description: 'Comprehensive car insurance coverage'
  }
];

async function populateInsuranceData() {
  let client;
  
  try {
    console.log('Connecting to MongoDB...');
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('Connected to MongoDB successfully!');
    
    const db = client.db(DATABASE_NAME);
    const collection = db.collection(COLLECTION_NAME);
    
    // Check if collection already has data
    const existingCount = await collection.countDocuments();
    if (existingCount > 0) {
      console.log(`\n⚠️  Collection already has ${existingCount} documents.`);
      console.log('Options:');
      console.log('1. Delete existing data and insert new data');
      console.log('2. Skip insertion (keep existing data)');
      console.log('3. Add new data without deleting existing');
      
      // For script execution, we'll delete and reinsert
      // In production, you might want to add a prompt or flag
      console.log('\nDeleting existing data...');
      await collection.deleteMany({});
      console.log('Existing data deleted.');
    }
    
    console.log(`\nInserting ${sampleInsurancePlans.length} insurance plans...`);
    const result = await collection.insertMany(sampleInsurancePlans);
    console.log(`✅ Successfully inserted ${result.insertedCount} insurance plans!`);
    
    // Display summary
    console.log('\n📊 Summary:');
    const healthPlans = await collection.countDocuments({ type: 'Health' });
    const lifePlans = await collection.countDocuments({ type: 'Life' });
    const accidentPlans = await collection.countDocuments({ type: 'Accident' });
    const travelPlans = await collection.countDocuments({ type: 'Travel' });
    const motorPlans = await collection.countDocuments({ type: 'Motor' });
    
    console.log(`  - Health Insurance: ${healthPlans} plans`);
    console.log(`  - Life Insurance: ${lifePlans} plans`);
    console.log(`  - Accident Insurance: ${accidentPlans} plans`);
    console.log(`  - Travel Insurance: ${travelPlans} plans`);
    console.log(`  - Motor Insurance: ${motorPlans} plans`);
    
    const familyPlans = await collection.countDocuments({ familyCoverage: true });
    const preExistingPlans = await collection.countDocuments({ coversPreExisting: true });
    
    console.log(`\n  - Family Coverage Plans: ${familyPlans}`);
    console.log(`  - Pre-existing Condition Plans: ${preExistingPlans}`);
    
    console.log('\n✅ Data population completed successfully!');
    console.log(`\nDatabase: ${DATABASE_NAME}`);
    console.log(`Collection: ${COLLECTION_NAME}`);
    console.log(`Total Documents: ${await collection.countDocuments()}`);
    
  } catch (error) {
    console.error('❌ Error populating insurance data:', error);
    throw error;
  } finally {
    if (client) {
      await client.close();
      console.log('\nMongoDB connection closed.');
    }
  }
}

// Run the script
populateInsuranceData()
  .then(() => {
    console.log('\n✨ Script execution completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
