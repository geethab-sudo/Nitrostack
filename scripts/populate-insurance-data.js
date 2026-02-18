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

/**
 * Generate a unique policy number based on provider and type
 */
function generatePolicyNumber(provider, type, index) {
  // Create provider code (first 3-4 letters)
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

const sampleInsurancePlans = [
  // Health Insurance Plans
  {
    name: 'Family Health Insurance Premium',
    type: 'Health',
    category: 'Health',
    provider: 'HDFC ERGO',
    policyNumber: 'POL-HDFC-HEA-0001',
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
    policyNumber: 'POL-ICIC-HEA-0002',
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
    policyNumber: 'POL-APOL-HEA-0003',
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
    policyNumber: 'POL-BAJA-HEA-0004',
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
    policyNumber: 'POL-STAR-HEA-0005',
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
    policyNumber: 'POL-TATA-HEA-0006',
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
    policyNumber: 'POL-ADIT-HEA-0007',
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
    policyNumber: 'POL-ORIE-HEA-0008',
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
    policyNumber: 'POL-LIC-LIF-0009',
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
    policyNumber: 'POL-HDFC-LIF-0010',
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
    policyNumber: 'POL-ICIC-LIF-0011',
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
    policyNumber: 'POL-NEWI-ACC-0012',
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
    policyNumber: 'POL-UNIT-ACC-0013',
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
    policyNumber: 'POL-RELI-TRA-0014',
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
    policyNumber: 'POL-BAJA-MOT-0015',
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
  },
  
  // Additional Health Insurance Plans
  {
    name: 'Corporate Group Health Insurance',
    type: 'Health',
    category: 'Health',
    provider: 'Max Bupa',
    policyNumber: 'POL-MAXB-HEA-0016',
    minAge: 18,
    maxAge: 65,
    premium: 18000,
    coverage: 600000,
    familyCoverage: true,
    maxFamilyMembers: 5,
    coversPreExisting: true,
    coveredConditions: ['diabetes', 'hypertension', 'asthma'],
    features: ['Group coverage', 'Cashless treatment', 'OPD benefits', 'Maternity cover'],
    description: 'Corporate group health insurance with family coverage'
  },
  {
    name: 'Super Top-Up Health Insurance',
    type: 'Health',
    category: 'Health',
    provider: 'Care Health',
    policyNumber: 'POL-CARE-HEA-0017',
    minAge: 18,
    maxAge: 65,
    premium: 6000,
    coverage: 5000000,
    familyCoverage: true,
    maxFamilyMembers: 4,
    coversPreExisting: false,
    coveredConditions: [],
    features: ['High coverage', 'Top-up benefit', 'Affordable premium'],
    description: 'Super top-up health insurance for additional coverage'
  },
  {
    name: 'Diabetic Care Health Plan',
    type: 'Health',
    category: 'Health',
    provider: 'ManipalCigna',
    policyNumber: 'POL-MANI-HEA-0018',
    minAge: 25,
    maxAge: 65,
    premium: 22000,
    coverage: 800000,
    familyCoverage: true,
    maxFamilyMembers: 4,
    coversPreExisting: true,
    coveredConditions: ['diabetes', 'diabetic complications', 'hypertension'],
    features: ['Diabetes specific coverage', 'Regular health checkups', 'Medication coverage'],
    description: 'Specialized health insurance for diabetic patients'
  },
  {
    name: 'Student Health Insurance',
    type: 'Health',
    category: 'Health',
    provider: 'Future Generali',
    policyNumber: 'POL-FUTU-HEA-0019',
    minAge: 16,
    maxAge: 30,
    premium: 3500,
    coverage: 150000,
    familyCoverage: false,
    maxFamilyMembers: 1,
    coversPreExisting: false,
    coveredConditions: [],
    features: ['Student discount', 'Basic coverage', 'Online claims'],
    description: 'Affordable health insurance for students'
  },
  {
    name: 'Women Health Insurance Plan',
    type: 'Health',
    category: 'Health',
    provider: 'Kotak General',
    policyNumber: 'POL-KOTA-HEA-0020',
    minAge: 18,
    maxAge: 50,
    premium: 28000,
    coverage: 700000,
    familyCoverage: true,
    maxFamilyMembers: 3,
    coversPreExisting: true,
    coveredConditions: ['pregnancy', 'maternity', 'gynecological issues', 'breast cancer'],
    features: ['Women-specific coverage', 'Maternity benefits', 'Wellness programs'],
    description: 'Comprehensive health insurance designed for women'
  },
  
  // Additional Life Insurance Plans
  {
    name: 'Term Life Insurance - 50 Lakhs',
    type: 'Life',
    category: 'Life',
    provider: 'SBI Life',
    policyNumber: 'POL-SBIL-LIF-0021',
    minAge: 18,
    maxAge: 55,
    premium: 8000,
    coverage: 5000000,
    familyCoverage: false,
    maxFamilyMembers: 1,
    coversPreExisting: false,
    coveredConditions: [],
    features: ['Affordable premium', 'High coverage', 'Term insurance'],
    description: 'Term life insurance with 50 lakhs coverage'
  },
  {
    name: 'Endowment Life Insurance Plan',
    type: 'Life',
    category: 'Life',
    provider: 'PNB MetLife',
    policyNumber: 'POL-PNBM-LIF-0022',
    minAge: 25,
    maxAge: 50,
    premium: 35000,
    coverage: 3000000,
    familyCoverage: true,
    maxFamilyMembers: 3,
    coversPreExisting: false,
    coveredConditions: [],
    features: ['Maturity benefit', 'Death benefit', 'Savings component'],
    description: 'Endowment life insurance with savings and protection'
  },
  {
    name: 'ULIP Life Insurance Plan',
    type: 'Life',
    category: 'Life',
    provider: 'Birla Sun Life',
    policyNumber: 'POL-BIRL-LIF-0023',
    minAge: 25,
    maxAge: 50,
    premium: 60000,
    coverage: 5000000,
    familyCoverage: true,
    maxFamilyMembers: 4,
    coversPreExisting: false,
    coveredConditions: [],
    features: ['Investment component', 'Market-linked returns', 'Life coverage'],
    description: 'Unit Linked Insurance Plan with investment benefits'
  },
  {
    name: 'Child Education Life Plan',
    type: 'Life',
    category: 'Life',
    provider: 'Canara HSBC',
    policyNumber: 'POL-CANA-LIF-0024',
    minAge: 25,
    maxAge: 45,
    premium: 25000,
    coverage: 2000000,
    familyCoverage: true,
    maxFamilyMembers: 2,
    coversPreExisting: false,
    coveredConditions: [],
    features: ['Education fund', 'Maturity benefit', 'Parent protection'],
    description: 'Life insurance plan for child education funding'
  },
  
  // Additional Accident Insurance
  {
    name: 'Premium Accident Insurance',
    type: 'Accident',
    category: 'Accident',
    provider: 'Royal Sundaram',
    policyNumber: 'POL-ROYA-ACC-0025',
    minAge: 18,
    maxAge: 65,
    premium: 3500,
    coverage: 2000000,
    familyCoverage: false,
    maxFamilyMembers: 1,
    coversPreExisting: false,
    coveredConditions: [],
    features: ['High coverage', 'Permanent disability', 'Temporary disability'],
    description: 'Premium personal accident insurance with high coverage'
  },
  {
    name: 'Student Accident Insurance',
    type: 'Accident',
    category: 'Accident',
    provider: 'IFFCO Tokio',
    policyNumber: 'POL-IFFC-ACC-0026',
    minAge: 5,
    maxAge: 25,
    premium: 1000,
    coverage: 300000,
    familyCoverage: false,
    maxFamilyMembers: 1,
    coversPreExisting: false,
    coveredConditions: [],
    features: ['Student coverage', 'Low premium', 'Education benefit'],
    description: 'Affordable accident insurance for students'
  },
  
  // Additional Travel Insurance
  {
    name: 'Domestic Travel Insurance',
    type: 'Travel',
    category: 'Travel',
    provider: 'Cholamandalam MS',
    policyNumber: 'POL-CHOL-TRA-0027',
    minAge: 0,
    maxAge: 75,
    premium: 500,
    coverage: 200000,
    familyCoverage: true,
    maxFamilyMembers: 4,
    coversPreExisting: false,
    coveredConditions: [],
    features: ['Domestic travel', 'Trip cancellation', 'Baggage protection'],
    description: 'Domestic travel insurance for family trips'
  },
  {
    name: 'Business Travel Insurance',
    type: 'Travel',
    category: 'Travel',
    provider: 'Liberty General',
    policyNumber: 'POL-LIBE-TRA-0028',
    minAge: 18,
    maxAge: 65,
    premium: 5000,
    coverage: 1000000,
    familyCoverage: false,
    maxFamilyMembers: 1,
    coversPreExisting: false,
    coveredConditions: [],
    features: ['Business travel', 'High coverage', 'Emergency evacuation'],
    description: 'Comprehensive travel insurance for business travelers'
  },
  {
    name: 'Student Travel Insurance',
    type: 'Travel',
    category: 'Travel',
    provider: 'Religare Health',
    policyNumber: 'POL-RELI-TRA-0029',
    minAge: 16,
    maxAge: 30,
    premium: 2000,
    coverage: 300000,
    familyCoverage: false,
    maxFamilyMembers: 1,
    coversPreExisting: false,
    coveredConditions: [],
    features: ['Student discount', 'Study abroad coverage', 'Emergency support'],
    description: 'Travel insurance for students studying abroad'
  },
  
  // Additional Motor Insurance
  {
    name: 'Two-Wheeler Insurance',
    type: 'Motor',
    category: 'Motor',
    provider: 'Bharti AXA',
    policyNumber: 'POL-BHAR-MOT-0030',
    minAge: 18,
    maxAge: 70,
    premium: 2000,
    coverage: 100000,
    familyCoverage: false,
    maxFamilyMembers: 1,
    coversPreExisting: false,
    coveredConditions: [],
    features: ['Two-wheeler coverage', 'Third party liability', 'Own damage'],
    description: 'Comprehensive insurance for two-wheelers'
  },
  {
    name: 'Commercial Vehicle Insurance',
    type: 'Motor',
    category: 'Motor',
    provider: 'Shriram General',
    policyNumber: 'POL-SHRI-MOT-0031',
    minAge: 21,
    maxAge: 65,
    premium: 25000,
    coverage: 1000000,
    familyCoverage: false,
    maxFamilyMembers: 1,
    coversPreExisting: false,
    coveredConditions: [],
    features: ['Commercial vehicle', 'High coverage', 'Third party liability'],
    description: 'Insurance for commercial vehicles'
  },
  {
    name: 'Luxury Car Insurance',
    type: 'Motor',
    category: 'Motor',
    provider: 'Magma HDI',
    policyNumber: 'POL-MAGM-MOT-0032',
    minAge: 25,
    maxAge: 65,
    premium: 50000,
    coverage: 5000000,
    familyCoverage: false,
    maxFamilyMembers: 1,
    coversPreExisting: false,
    coveredConditions: [],
    features: ['Luxury car coverage', 'Zero depreciation', 'Engine protection'],
    description: 'Premium insurance for luxury vehicles'
  },
  
  // Additional Specialized Plans
  {
    name: 'Cancer Care Insurance',
    type: 'Health',
    category: 'Health',
    provider: 'Acko General',
    policyNumber: 'POL-ACKO-HEA-0033',
    minAge: 18,
    maxAge: 65,
    premium: 12000,
    coverage: 3000000,
    familyCoverage: true,
    maxFamilyMembers: 4,
    coversPreExisting: true,
    coveredConditions: ['cancer', 'tumor', 'chemotherapy', 'radiation'],
    features: ['Cancer-specific coverage', 'Lump sum benefit', 'Treatment coverage'],
    description: 'Specialized insurance for cancer treatment'
  },
  {
    name: 'Heart Care Insurance',
    type: 'Health',
    category: 'Health',
    provider: 'Digit Insurance',
    policyNumber: 'POL-DIGI-HEA-0034',
    minAge: 30,
    maxAge: 65,
    premium: 18000,
    coverage: 2500000,
    familyCoverage: true,
    maxFamilyMembers: 3,
    coversPreExisting: true,
    coveredConditions: ['heart disease', 'cardiac surgery', 'angioplasty', 'bypass'],
    features: ['Heart-specific coverage', 'Cardiac procedures', 'Rehabilitation'],
    description: 'Specialized insurance for heart-related conditions'
  },
  {
    name: 'Mental Health Insurance',
    type: 'Health',
    category: 'Health',
    provider: 'Go Digit',
    policyNumber: 'POL-GODI-HEA-0035',
    minAge: 18,
    maxAge: 60,
    premium: 10000,
    coverage: 500000,
    familyCoverage: true,
    maxFamilyMembers: 4,
    coversPreExisting: true,
    coveredConditions: ['depression', 'anxiety', 'psychiatric care', 'therapy'],
    features: ['Mental health coverage', 'Therapy sessions', 'Psychiatric care'],
    description: 'Insurance coverage for mental health and wellness'
  },
  
  // Popular Insurance Companies - Additional Plans with Different Age Ranges
  
  // LIC (Life Insurance Corporation) Plans
  {
    name: 'LIC Jeevan Anand - Whole Life Plan',
    type: 'Life',
    category: 'Life',
    provider: 'LIC',
    policyNumber: 'POL-LIC-LIF-0036',
    minAge: 18,
    maxAge: 50,
    premium: 45000,
    coverage: 5000000,
    familyCoverage: true,
    maxFamilyMembers: 3,
    coversPreExisting: false,
    coveredConditions: [],
    features: ['Whole life coverage', 'Maturity benefit', 'Death benefit', 'Bonus'],
    description: 'LIC whole life insurance with savings and protection'
  },
  {
    name: 'LIC Term Plan - 2 Crore Coverage',
    type: 'Life',
    category: 'Life',
    provider: 'LIC',
    policyNumber: 'POL-LIC-LIF-0037',
    minAge: 18,
    maxAge: 55,
    premium: 18000,
    coverage: 20000000,
    familyCoverage: false,
    maxFamilyMembers: 1,
    coversPreExisting: false,
    coveredConditions: [],
    features: ['High coverage', 'Affordable premium', 'Term insurance'],
    description: 'LIC term life insurance with 2 crore coverage'
  },
  {
    name: 'LIC Children Money Back Plan',
    type: 'Life',
    category: 'Life',
    provider: 'LIC',
    policyNumber: 'POL-LIC-LIF-0038',
    minAge: 0,
    maxAge: 12,
    premium: 30000,
    coverage: 1000000,
    familyCoverage: false,
    maxFamilyMembers: 1,
    coversPreExisting: false,
    coveredConditions: [],
    features: ['Child education fund', 'Money back benefit', 'Maturity benefit'],
    description: 'LIC money back plan for children education'
  },
  
  // HDFC Life Plans
  {
    name: 'HDFC Life Click 2 Protect - Term Plan',
    type: 'Life',
    category: 'Life',
    provider: 'HDFC Life',
    policyNumber: 'POL-HDFC-LIF-0039',
    minAge: 18,
    maxAge: 65,
    premium: 15000,
    coverage: 10000000,
    familyCoverage: true,
    maxFamilyMembers: 4,
    coversPreExisting: false,
    coveredConditions: [],
    features: ['Online term plan', 'High coverage', 'Flexible premium'],
    description: 'HDFC Life online term insurance plan'
  },
  {
    name: 'HDFC Life Assure - Whole Life',
    type: 'Life',
    category: 'Life',
    provider: 'HDFC Life',
    policyNumber: 'POL-HDFC-LIF-0040',
    minAge: 25,
    maxAge: 55,
    premium: 55000,
    coverage: 3000000,
    familyCoverage: true,
    maxFamilyMembers: 4,
    coversPreExisting: false,
    coveredConditions: [],
    features: ['Lifetime coverage', 'Maturity benefit', 'Family protection'],
    description: 'HDFC Life whole life insurance plan'
  },
  
  // ICICI Prudential Plans
  {
    name: 'ICICI Prudential iProtect Smart - Term Plan',
    type: 'Life',
    category: 'Life',
    provider: 'ICICI Prudential',
    policyNumber: 'POL-ICIC-LIF-0041',
    minAge: 18,
    maxAge: 65,
    premium: 14000,
    coverage: 15000000,
    familyCoverage: true,
    maxFamilyMembers: 5,
    coversPreExisting: false,
    coveredConditions: [],
    features: ['High coverage', 'Flexible riders', 'Online purchase'],
    description: 'ICICI Prudential term life insurance'
  },
  {
    name: 'ICICI Prudential Wealth Builder - ULIP',
    type: 'Life',
    category: 'Life',
    provider: 'ICICI Prudential',
    policyNumber: 'POL-ICIC-LIF-0042',
    minAge: 30,
    maxAge: 50,
    premium: 70000,
    coverage: 5000000,
    familyCoverage: true,
    maxFamilyMembers: 3,
    coversPreExisting: false,
    coveredConditions: [],
    features: ['Investment + Insurance', 'Market-linked returns', 'Tax benefits'],
    description: 'ICICI Prudential ULIP with investment benefits'
  },
  
  // SBI Life Plans
  {
    name: 'SBI Life eShield - Term Plan',
    type: 'Life',
    category: 'Life',
    provider: 'SBI Life',
    policyNumber: 'POL-SBIL-LIF-0043',
    minAge: 18,
    maxAge: 60,
    premium: 11000,
    coverage: 8000000,
    familyCoverage: false,
    maxFamilyMembers: 1,
    coversPreExisting: false,
    coveredConditions: [],
    features: ['Online term plan', 'Affordable', 'High coverage'],
    description: 'SBI Life online term insurance'
  },
  {
    name: 'SBI Life Smart Shield - Term Plan',
    type: 'Life',
    category: 'Life',
    provider: 'SBI Life',
    policyNumber: 'POL-SBIL-LIF-0044',
    minAge: 25,
    maxAge: 55,
    premium: 22000,
    coverage: 12000000,
    familyCoverage: true,
    maxFamilyMembers: 4,
    coversPreExisting: false,
    coveredConditions: [],
    features: ['Family coverage', 'Return of premium option', 'Riders available'],
    description: 'SBI Life term plan with family coverage'
  },
  
  // Bajaj Allianz Health Plans
  {
    name: 'Bajaj Allianz Health Guard - Individual',
    type: 'Health',
    category: 'Health',
    provider: 'Bajaj Allianz',
    policyNumber: 'POL-BAJA-HEA-0045',
    minAge: 18,
    maxAge: 65,
    premium: 15000,
    coverage: 500000,
    familyCoverage: false,
    maxFamilyMembers: 1,
    coversPreExisting: false,
    coveredConditions: [],
    features: ['Cashless treatment', 'Pre/post hospitalization', 'Day care'],
    description: 'Bajaj Allianz individual health insurance'
  },
  {
    name: 'Bajaj Allianz Family Health First',
    type: 'Health',
    category: 'Health',
    provider: 'Bajaj Allianz',
    policyNumber: 'POL-BAJA-HEA-0046',
    minAge: 18,
    maxAge: 65,
    premium: 32000,
    coverage: 800000,
    familyCoverage: true,
    maxFamilyMembers: 6,
    coversPreExisting: true,
    coveredConditions: ['diabetes', 'hypertension', 'asthma'],
    features: ['Family floater', 'Pre-existing covered', 'Maternity benefit'],
    description: 'Bajaj Allianz family health insurance'
  },
  
  // Star Health Plans
  {
    name: 'Star Health Family Health Optima',
    type: 'Health',
    category: 'Health',
    provider: 'Star Health',
    policyNumber: 'POL-STAR-HEA-0047',
    minAge: 18,
    maxAge: 65,
    premium: 28000,
    coverage: 1000000,
    familyCoverage: true,
    maxFamilyMembers: 6,
    coversPreExisting: true,
    coveredConditions: ['diabetes', 'hypertension', 'asthma', 'heart disease'],
    features: ['High coverage', 'Pre-existing covered', 'Wellness benefits'],
    description: 'Star Health comprehensive family health plan'
  },
  {
    name: 'Star Health Senior Citizen Red Carpet',
    type: 'Health',
    category: 'Health',
    provider: 'Star Health',
    policyNumber: 'POL-STAR-HEA-0048',
    minAge: 60,
    maxAge: 75,
    premium: 45000,
    coverage: 1500000,
    familyCoverage: true,
    maxFamilyMembers: 2,
    coversPreExisting: true,
    coveredConditions: ['diabetes', 'hypertension', 'arthritis', 'heart disease', 'osteoporosis'],
    features: ['Senior citizen specific', 'No medical test', 'Pre-existing covered'],
    description: 'Star Health insurance for senior citizens'
  },
  
  // TATA AIG Plans
  {
    name: 'TATA AIG MediCare - Individual',
    type: 'Health',
    category: 'Health',
    provider: 'TATA AIG',
    policyNumber: 'POL-TATA-HEA-0049',
    minAge: 18,
    maxAge: 65,
    premium: 13000,
    coverage: 400000,
    familyCoverage: false,
    maxFamilyMembers: 1,
    coversPreExisting: false,
    coveredConditions: [],
    features: ['Cashless treatment', 'OPD coverage', 'Preventive care'],
    description: 'TATA AIG individual health insurance'
  },
  {
    name: 'TATA AIG Family MediCare',
    type: 'Health',
    category: 'Health',
    provider: 'TATA AIG',
    policyNumber: 'POL-TATA-HEA-0050',
    minAge: 18,
    maxAge: 65,
    premium: 35000,
    coverage: 900000,
    familyCoverage: true,
    maxFamilyMembers: 5,
    coversPreExisting: true,
    coveredConditions: ['diabetes', 'hypertension'],
    features: ['Family floater', 'Pre-existing covered', 'Maternity cover'],
    description: 'TATA AIG family health insurance'
  },
  
  // Reliance General Plans
  {
    name: 'Reliance Health Gain - Individual',
    type: 'Health',
    category: 'Health',
    provider: 'Reliance General',
    policyNumber: 'POL-RELI-HEA-0051',
    minAge: 18,
    maxAge: 65,
    premium: 11000,
    coverage: 350000,
    familyCoverage: false,
    maxFamilyMembers: 1,
    coversPreExisting: false,
    coveredConditions: [],
    features: ['Basic coverage', 'Cashless treatment', 'Affordable premium'],
    description: 'Reliance General individual health insurance'
  },
  {
    name: 'Reliance Health Gain - Family',
    type: 'Health',
    category: 'Health',
    provider: 'Reliance General',
    policyNumber: 'POL-RELI-HEA-0052',
    minAge: 18,
    maxAge: 65,
    premium: 30000,
    coverage: 750000,
    familyCoverage: true,
    maxFamilyMembers: 4,
    coversPreExisting: true,
    coveredConditions: ['diabetes', 'hypertension'],
    features: ['Family coverage', 'Pre-existing covered', 'Maternity benefit'],
    description: 'Reliance General family health insurance'
  },
  
  // Max Bupa Plans
  {
    name: 'Max Bupa Health Companion - Individual',
    type: 'Health',
    category: 'Health',
    provider: 'Max Bupa',
    policyNumber: 'POL-MAXB-HEA-0053',
    minAge: 18,
    maxAge: 65,
    premium: 16000,
    coverage: 600000,
    familyCoverage: false,
    maxFamilyMembers: 1,
    coversPreExisting: false,
    coveredConditions: [],
    features: ['Comprehensive coverage', 'Cashless treatment', 'OPD benefits'],
    description: 'Max Bupa individual health insurance'
  },
  {
    name: 'Max Bupa Health Companion - Family',
    type: 'Health',
    category: 'Health',
    provider: 'Max Bupa',
    policyNumber: 'POL-MAXB-HEA-0054',
    minAge: 18,
    maxAge: 65,
    premium: 38000,
    coverage: 1200000,
    familyCoverage: true,
    maxFamilyMembers: 6,
    coversPreExisting: true,
    coveredConditions: ['diabetes', 'hypertension', 'asthma', 'heart disease'],
    features: ['High coverage', 'Pre-existing covered', 'Wellness programs'],
    description: 'Max Bupa comprehensive family health plan'
  },
  
  // Age-Specific Plans (Children & Young Adults)
  {
    name: 'Kids Health Insurance Plan',
    type: 'Health',
    category: 'Health',
    provider: 'HDFC ERGO',
    policyNumber: 'POL-HDFC-HEA-0055',
    minAge: 0,
    maxAge: 17,
    premium: 4000,
    coverage: 200000,
    familyCoverage: false,
    maxFamilyMembers: 1,
    coversPreExisting: false,
    coveredConditions: [],
    features: ['Child-specific coverage', 'Vaccination', 'Growth monitoring'],
    description: 'Health insurance specifically designed for children'
  },
  {
    name: 'Young Adult Health Plan (18-30)',
    type: 'Health',
    category: 'Health',
    provider: 'ICICI Lombard',
    policyNumber: 'POL-ICIC-HEA-0056',
    minAge: 18,
    maxAge: 30,
    premium: 6000,
    coverage: 250000,
    familyCoverage: false,
    maxFamilyMembers: 1,
    coversPreExisting: false,
    coveredConditions: [],
    features: ['Affordable for young adults', 'Basic coverage', 'Online claims'],
    description: 'Budget-friendly health insurance for young adults'
  },
  {
    name: 'Middle-Aged Health Plan (40-55)',
    type: 'Health',
    category: 'Health',
    provider: 'Apollo Munich',
    policyNumber: 'POL-APOL-HEA-0057',
    minAge: 40,
    maxAge: 55,
    premium: 25000,
    coverage: 700000,
    familyCoverage: true,
    maxFamilyMembers: 4,
    coversPreExisting: true,
    coveredConditions: ['diabetes', 'hypertension', 'heart disease'],
    features: ['Age-appropriate coverage', 'Pre-existing covered', 'Health checkups'],
    description: 'Health insurance for middle-aged individuals'
  },
  
  // Additional Policy Types - Home Insurance
  {
    name: 'Home Insurance - Basic Coverage',
    type: 'Home',
    category: 'Home',
    provider: 'HDFC ERGO',
    policyNumber: 'POL-HDFC-HOM-0058',
    minAge: 18,
    maxAge: 70,
    premium: 5000,
    coverage: 2000000,
    familyCoverage: true,
    maxFamilyMembers: 6,
    coversPreExisting: false,
    coveredConditions: [],
    features: ['Structure coverage', 'Content coverage', 'Natural disasters'],
    description: 'Basic home insurance coverage'
  },
  {
    name: 'Home Insurance - Premium Coverage',
    type: 'Home',
    category: 'Home',
    provider: 'ICICI Lombard',
    policyNumber: 'POL-ICIC-HOM-0059',
    minAge: 18,
    maxAge: 70,
    premium: 12000,
    coverage: 5000000,
    familyCoverage: true,
    maxFamilyMembers: 8,
    coversPreExisting: false,
    coveredConditions: [],
    features: ['High coverage', 'Jewelry coverage', 'Electronics coverage'],
    description: 'Premium home insurance with comprehensive coverage'
  },
  
  // Pet Insurance
  {
    name: 'Pet Insurance - Dog',
    type: 'Pet',
    category: 'Pet',
    provider: 'Bajaj Allianz',
    policyNumber: 'POL-BAJA-PET-0060',
    minAge: 0,
    maxAge: 12,
    premium: 8000,
    coverage: 200000,
    familyCoverage: false,
    maxFamilyMembers: 1,
    coversPreExisting: false,
    coveredConditions: [],
    features: ['Veterinary coverage', 'Surgery coverage', 'Vaccination'],
    description: 'Pet insurance for dogs'
  },
  {
    name: 'Pet Insurance - Cat',
    type: 'Pet',
    category: 'Pet',
    provider: 'Future Generali',
    policyNumber: 'POL-FUTU-PET-0061',
    minAge: 0,
    maxAge: 15,
    premium: 6000,
    coverage: 150000,
    familyCoverage: false,
    maxFamilyMembers: 1,
    coversPreExisting: false,
    coveredConditions: [],
    features: ['Cat-specific coverage', 'Veterinary care', 'Illness coverage'],
    description: 'Pet insurance for cats'
  },
  
  // Dental Insurance
  {
    name: 'Dental Insurance - Individual',
    type: 'Dental',
    category: 'Dental',
    provider: 'Star Health',
    policyNumber: 'POL-STAR-DEN-0062',
    minAge: 18,
    maxAge: 65,
    premium: 3000,
    coverage: 50000,
    familyCoverage: false,
    maxFamilyMembers: 1,
    coversPreExisting: false,
    coveredConditions: [],
    features: ['Preventive care', 'Basic procedures', 'Annual checkups'],
    description: 'Individual dental insurance coverage'
  },
  {
    name: 'Dental Insurance - Family',
    type: 'Dental',
    category: 'Dental',
    provider: 'HDFC ERGO',
    policyNumber: 'POL-HDFC-DEN-0063',
    minAge: 0,
    maxAge: 65,
    premium: 8000,
    coverage: 150000,
    familyCoverage: true,
    maxFamilyMembers: 4,
    coversPreExisting: false,
    coveredConditions: [],
    features: ['Family coverage', 'Preventive care', 'Orthodontic coverage'],
    description: 'Family dental insurance plan'
  },
  
  // Vision Insurance
  {
    name: 'Vision Insurance - Individual',
    type: 'Vision',
    category: 'Vision',
    provider: 'ICICI Lombard',
    policyNumber: 'POL-ICIC-VIS-0064',
    minAge: 18,
    maxAge: 65,
    premium: 2000,
    coverage: 30000,
    familyCoverage: false,
    maxFamilyMembers: 1,
    coversPreExisting: false,
    coveredConditions: [],
    features: ['Eye exams', 'Glasses coverage', 'Contact lens coverage'],
    description: 'Individual vision insurance'
  },
  {
    name: 'Vision Insurance - Family',
    type: 'Vision',
    category: 'Vision',
    provider: 'Bajaj Allianz',
    policyNumber: 'POL-BAJA-VIS-0065',
    minAge: 0,
    maxAge: 65,
    premium: 5000,
    coverage: 100000,
    familyCoverage: true,
    maxFamilyMembers: 4,
    coversPreExisting: false,
    coveredConditions: [],
    features: ['Family coverage', 'Annual eye exams', 'Frame allowance'],
    description: 'Family vision insurance plan'
  },
  
  // Disability Insurance
  {
    name: 'Short-Term Disability Insurance',
    type: 'Disability',
    category: 'Disability',
    provider: 'TATA AIG',
    policyNumber: 'POL-TATA-DIS-0066',
    minAge: 18,
    maxAge: 60,
    premium: 8000,
    coverage: 500000,
    familyCoverage: false,
    maxFamilyMembers: 1,
    coversPreExisting: false,
    coveredConditions: [],
    features: ['Short-term coverage', 'Income replacement', 'Medical coverage'],
    description: 'Short-term disability insurance'
  },
  {
    name: 'Long-Term Disability Insurance',
    type: 'Disability',
    category: 'Disability',
    provider: 'LIC',
    policyNumber: 'POL-LIC-DIS-0067',
    minAge: 25,
    maxAge: 55,
    premium: 15000,
    coverage: 2000000,
    familyCoverage: true,
    maxFamilyMembers: 3,
    coversPreExisting: false,
    coveredConditions: [],
    features: ['Long-term coverage', 'High benefit', 'Family protection'],
    description: 'Long-term disability insurance coverage'
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
      console.log('Adding new data without deleting existing records...');
      
      // Filter out plans that already exist (by policyNumber)
      const existingPolicyNumbers = await collection.distinct('policyNumber');
      const newPlans = sampleInsurancePlans.filter(
        plan => !existingPolicyNumbers.includes(plan.policyNumber)
      );
      
      if (newPlans.length === 0) {
        console.log('⚠️  All plans already exist in the database. No new data to add.');
      } else {
        console.log(`\nInserting ${newPlans.length} new insurance plans (${sampleInsurancePlans.length - newPlans.length} already exist)...`);
        const result = await collection.insertMany(newPlans);
        console.log(`✅ Successfully inserted ${result.insertedCount} new insurance plans!`);
      }
    } else {
      console.log(`\nInserting ${sampleInsurancePlans.length} insurance plans...`);
      const result = await collection.insertMany(sampleInsurancePlans);
      console.log(`✅ Successfully inserted ${result.insertedCount} insurance plans!`);
    }
    
    // Display summary
    console.log('\n📊 Summary:');
    const healthPlans = await collection.countDocuments({ type: 'Health' });
    const lifePlans = await collection.countDocuments({ type: 'Life' });
    const accidentPlans = await collection.countDocuments({ type: 'Accident' });
    const travelPlans = await collection.countDocuments({ type: 'Travel' });
    const motorPlans = await collection.countDocuments({ type: 'Motor' });
    const homePlans = await collection.countDocuments({ type: 'Home' });
    const petPlans = await collection.countDocuments({ type: 'Pet' });
    const dentalPlans = await collection.countDocuments({ type: 'Dental' });
    const visionPlans = await collection.countDocuments({ type: 'Vision' });
    const disabilityPlans = await collection.countDocuments({ type: 'Disability' });
    
    console.log(`  - Health Insurance: ${healthPlans} plans`);
    console.log(`  - Life Insurance: ${lifePlans} plans`);
    console.log(`  - Accident Insurance: ${accidentPlans} plans`);
    console.log(`  - Travel Insurance: ${travelPlans} plans`);
    console.log(`  - Motor Insurance: ${motorPlans} plans`);
    if (homePlans > 0) console.log(`  - Home Insurance: ${homePlans} plans`);
    if (petPlans > 0) console.log(`  - Pet Insurance: ${petPlans} plans`);
    if (dentalPlans > 0) console.log(`  - Dental Insurance: ${dentalPlans} plans`);
    if (visionPlans > 0) console.log(`  - Vision Insurance: ${visionPlans} plans`);
    if (disabilityPlans > 0) console.log(`  - Disability Insurance: ${disabilityPlans} plans`);
    
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
