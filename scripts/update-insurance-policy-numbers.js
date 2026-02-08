/**
 * Script to update existing Insurance collection documents by adding policy numbers
 * This script will add policy numbers to documents that don't have them
 * 
 * Run with: node scripts/update-insurance-policy-numbers.js
 */

import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/';
const DATABASE_NAME = process.env.MONGODB_DATABASE_NAME || 'Insurance';
const COLLECTION_NAME = 'Insurance';

/**
 * Generate a unique policy number based on provider and type
 */
function generatePolicyNumber(provider, type, index) {
  if (!provider || !type) {
    // Fallback if provider or type is missing
    const fallbackCode = 'UNKN';
    const typeCode = type ? type.substring(0, 3).toUpperCase() : 'UNK';
    const number = String(index + 1).padStart(4, '0');
    return `POL-${fallbackCode}-${typeCode}-${number}`;
  }

  // Create provider code (first 3-4 letters, remove spaces)
  const providerCode = provider
    .replace(/\s+/g, '')
    .substring(0, 4)
    .toUpperCase();
  
  // Create type code (first 2-3 letters)
  const typeCode = type.substring(0, 3).toUpperCase();
  
  // Generate sequential number with padding
  const number = String(index + 1).padStart(4, '0');
  
  return `POL-${providerCode}-${typeCode}-${number}`;
}

/**
 * Check if a policy number already exists in the collection
 */
async function policyNumberExists(collection, policyNumber) {
  const count = await collection.countDocuments({ policyNumber });
  return count > 0;
}

/**
 * Generate a unique policy number that doesn't exist in the collection
 */
async function generateUniquePolicyNumber(collection, provider, type, baseIndex) {
  let index = baseIndex;
  let policyNumber;
  let attempts = 0;
  const maxAttempts = 1000; // Prevent infinite loop

  do {
    policyNumber = generatePolicyNumber(provider, type, index);
    const exists = await policyNumberExists(collection, policyNumber);
    
    if (!exists) {
      return policyNumber;
    }
    
    index++;
    attempts++;
  } while (attempts < maxAttempts);

  // If we can't find a unique one, add timestamp to make it unique
  const timestamp = Date.now().toString().slice(-6);
  const providerCode = provider
    ? provider.replace(/\s+/g, '').substring(0, 4).toUpperCase()
    : 'UNKN';
  const typeCode = type ? type.substring(0, 3).toUpperCase() : 'UNK';
  return `POL-${providerCode}-${typeCode}-${timestamp}`;
}

async function updateInsurancePolicyNumbers() {
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
    
    // Find all documents without policy numbers
    const documentsWithoutPolicyNumber = await collection
      .find({ 
        $or: [
          { policyNumber: { $exists: false } },
          { policyNumber: null },
          { policyNumber: '' }
        ]
      })
      .toArray();
    
    const totalDocuments = await collection.countDocuments({});
    const documentsWithPolicyNumber = totalDocuments - documentsWithoutPolicyNumber.length;
    
    console.log('📊 Current Status:');
    console.log(`  - Total documents: ${totalDocuments}`);
    console.log(`  - Documents with policy number: ${documentsWithPolicyNumber}`);
    console.log(`  - Documents without policy number: ${documentsWithoutPolicyNumber.length}\n`);
    
    if (documentsWithoutPolicyNumber.length === 0) {
      console.log('✅ All documents already have policy numbers!');
      return;
    }
    
    console.log(`🔄 Updating ${documentsWithoutPolicyNumber.length} documents...\n`);
    
    let updatedCount = 0;
    let errorCount = 0;
    
    // Group by provider and type for better numbering
    const grouped = {};
    documentsWithoutPolicyNumber.forEach((doc, index) => {
      const provider = doc.provider || 'Unknown';
      const type = doc.type || doc.category || 'Unknown';
      const key = `${provider}|${type}`;
      
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push({ doc, index });
    });
    
    // Update documents
    for (const [key, items] of Object.entries(grouped)) {
      const [provider, type] = key.split('|');
      console.log(`  Processing: ${provider} - ${type} (${items.length} documents)`);
      
      for (let i = 0; i < items.length; i++) {
        const { doc } = items[i];
        
        try {
          // Get the highest existing index for this provider/type combination
          const existingDocs = await collection
            .find({ 
              provider: doc.provider || provider,
              type: doc.type || type,
              policyNumber: { $exists: true, $ne: null, $ne: '' }
            })
            .sort({ policyNumber: -1 })
            .limit(1)
            .toArray();
          
          let baseIndex = 0;
          if (existingDocs.length > 0 && existingDocs[0].policyNumber) {
            // Extract number from existing policy number
            const match = existingDocs[0].policyNumber.match(/-(\d+)$/);
            if (match) {
              baseIndex = parseInt(match[1], 10);
            }
          }
          
          // Generate unique policy number
          const policyNumber = await generateUniquePolicyNumber(
            collection,
            doc.provider || provider,
            doc.type || doc.category || type,
            baseIndex + i + 1
          );
          
          // Update the document
          const result = await collection.updateOne(
            { _id: doc._id },
            { 
              $set: { 
                policyNumber: policyNumber,
                updatedAt: new Date()
              } 
            }
          );
          
          if (result.modifiedCount > 0) {
            updatedCount++;
            console.log(`    ✅ Updated: ${doc.name} -> ${policyNumber}`);
          } else {
            console.log(`    ⚠️  No changes: ${doc.name}`);
          }
        } catch (error) {
          errorCount++;
          console.error(`    ❌ Error updating ${doc.name}:`, error.message);
        }
      }
    }
    
    console.log('\n📊 Update Summary:');
    console.log(`  - Successfully updated: ${updatedCount} documents`);
    if (errorCount > 0) {
      console.log(`  - Errors: ${errorCount} documents`);
    }
    
    // Verify final status
    const finalCount = await collection.countDocuments({ 
      $or: [
        { policyNumber: { $exists: false } },
        { policyNumber: null },
        { policyNumber: '' }
      ]
    });
    
    const finalTotal = await collection.countDocuments({});
    const finalWithPolicy = finalTotal - finalCount;
    
    console.log('\n✅ Final Status:');
    console.log(`  - Total documents: ${finalTotal}`);
    console.log(`  - Documents with policy number: ${finalWithPolicy}`);
    console.log(`  - Documents without policy number: ${finalCount}`);
    
    if (finalCount === 0) {
      console.log('\n✨ All documents now have policy numbers!');
    }
    
  } catch (error) {
    console.error('❌ Error updating insurance policy numbers:', error);
    throw error;
  } finally {
    if (client) {
      await client.close();
      console.log('\nMongoDB connection closed.');
    }
  }
}

// Run the script
updateInsurancePolicyNumbers()
  .then(() => {
    console.log('\n✨ Script execution completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
