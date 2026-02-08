# Data Population Scripts

## Overview
This directory contains scripts to populate and update MongoDB collections with sample data:
- `populate-insurance-data.js` - Populates the `Insurance` collection with insurance plan data
- `populate-users-data.js` - Populates the `Users` collection with user profile data
- `update-insurance-policy-numbers.js` - Updates existing insurance documents by adding policy numbers

## Usage

### Populate Insurance Data

```bash
node scripts/populate-insurance-data.js
```

### Populate Users Data

```bash
node scripts/populate-users-data.js
```

### Update Insurance Policy Numbers

This script adds policy numbers to existing insurance documents that don't have them:

```bash
node scripts/update-insurance-policy-numbers.js
```

The script will:
- Find all documents without policy numbers
- Generate unique policy numbers based on provider and type
- Update documents with the new policy numbers
- Display a summary of updates

All scripts support environment variables:
- `MONGODB_URI` - MongoDB connection string (default: `mongodb://localhost:27017/`)
- `MONGODB_DATABASE_NAME` - Database name (default: `Insurance`)

## Data Structure

Each insurance plan document contains the following fields:

### Required Fields
- `name` (string): Name of the insurance plan
- `type` (string): Type of insurance (Health, Life, Accident, Travel, Motor)
- `category` (string): Category of insurance
- `provider` (string): Insurance provider name
- `premium` (number): Annual premium amount
- `coverage` (number): Coverage amount

### Optional Fields
- `policyNumber` (string): Unique policy number (format: `POL-{PROVIDER}-{TYPE}-{NUMBER}`)
- `minAge` (number): Minimum age requirement
- `maxAge` (number): Maximum age limit
- `familyCoverage` (boolean): Whether plan covers family members
- `maxFamilyMembers` (number): Maximum number of family members covered
- `coversPreExisting` (boolean): Whether pre-existing conditions are covered
- `coveredConditions` (array): List of specific conditions covered
- `features` (array): List of plan features
- `description` (string): Plan description

## Sample Plans Included

### Health Insurance (8 plans)
1. Family Health Insurance Premium - HDFC ERGO
2. Individual Health Shield - ICICI Lombard
3. Senior Citizen Health Plan - Apollo Munich
4. Young Professional Health Plan - Bajaj Allianz
5. Maternity Health Insurance - Star Health
6. Critical Illness Insurance - TATA AIG
7. Comprehensive Family Health Plan - Aditya Birla Health
8. Basic Health Insurance - Oriental Insurance

### Life Insurance (3 plans)
1. Term Life Insurance - 1 Crore - LIC
2. Whole Life Insurance Plan - HDFC Life
3. Term Insurance with Return of Premium - ICICI Prudential

### Other Insurance (4 plans)
- Accident Insurance (2 plans)
- Travel Insurance (1 plan)
- Motor Insurance (1 plan)

## Data Sources

The insurance plan data is based on common plans from:
- HDFC ERGO
- ICICI Lombard
- Apollo Munich
- Bajaj Allianz
- Star Health
- TATA AIG
- Aditya Birla Health
- LIC
- HDFC Life
- ICICI Prudential
- And other major Indian insurance providers

---

## Users Data Population Script

### Overview
The `populate-users-data.js` script populates the `Users` collection with sample user profile data.

### Data Structure

Each user document contains the following fields:

#### Required Fields
- `name` (string): Full name of the user
- `age` (number): Age of the user
- `salary` (number): Annual salary in INR
- `designation` (string): Job title/designation
- `familyMembers` (array): Array of family member objects

#### Optional Fields
- `email` (string): Email address
- `phone` (string): Phone number
- `address` (string): Physical address
- `createdAt` (Date): Creation timestamp
- `updatedAt` (Date): Last update timestamp

#### Family Member Structure
Each family member object contains:
- `name` (string): Name of the family member
- `age` (number): Age of the family member
- `relationship` (string): Relationship to user (e.g., "spouse", "child", "parent")

### Sample Data Included

The script includes 15 sample users with:
- Various designations (Software Engineer, Product Manager, CEO, etc.)
- Age range from 24 to 50 years
- Salary range from 4.5L to 25L INR
- Family sizes from 0 to 4 members
- Diverse locations across major Indian cities

### Statistics Generated

After insertion, the script displays:
- Users by designation
- Users by age range
- Users by salary range
- Family statistics (with/without family, average family size)

---

## Notes

- Both scripts will delete existing data before inserting new data
- All amounts are in INR (Indian Rupees)
- Premiums and coverage amounts are representative values
- Age ranges and family coverage options vary by plan type
- User data includes realistic Indian names and addresses