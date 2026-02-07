# Book Insurance - Example Payloads

This document provides example payloads for the `book_insurance` tool with real data from your database.

## Important Notes

1. **ID Format**: Both `userId` and `insurancePlanId` must be valid MongoDB ObjectId strings (24-character hexadecimal)
2. **Getting IDs**: 
   - User IDs: Use IDs from the `Users` collection
   - Insurance Plan IDs: Use IDs from `suggest_insurance_plan` response (`suggestedPlans[]._id`) or `list_insurance` response (`insurance[]._id`)
3. **Run Script**: Use `node scripts/get-sample-ids.js` to get current IDs from your database

## Current Sample Data (as of last run)

### Sample User IDs:
- `6987234e9aed7e961e302cd8` - Rajesh Kumar (Age: 32, Salary: ₹8,00,000)
- `6987234e9aed7e961e302cd9` - Priya Sharma (Age: 28, Salary: ₹6,00,000)
- `6987234e9aed7e961e302cda` - Amit Patel (Age: 35, Salary: ₹12,00,000)
- `6987234e9aed7e961e302cdb` - Sneha Reddy (Age: 29, Salary: ₹7,50,000)
- `6987234e9aed7e961e302cdc` - Ravi Singh (Age: 42, Salary: ₹15,00,000)

### Sample Insurance Plan IDs:
- `69870c92500baacfc344facc` - Family Health Insurance Premium (₹25,000 premium, ₹5,00,000 coverage)
- `69870c92500baacfc344facd` - Individual Health Shield (₹12,000 premium, ₹3,00,000 coverage)
- `69870c92500baacfc344face` - Senior Citizen Health Plan (₹35,000 premium, ₹10,00,000 coverage)
- `69870c92500baacfc344facf` - Young Professional Health Plan (₹8,000 premium, ₹2,00,000 coverage)
- `69870c92500baacfc344fad0` - Maternity Health Insurance (₹30,000 premium, ₹4,00,000 coverage)

---

## Example Payloads

### Example 1: Basic Booking (Minimal Required Fields)

```json
{
  "userId": "6987234e9aed7e961e302cd8",
  "insurancePlanId": "69870c92500baacfc344facc"
}
```

**Response:**
```json
{
  "success": true,
  "booking": {
    "_id": "6987234e9aed7e961e302cd9",
    "userId": "6987234e9aed7e961e302cd8",
    "insurancePlanId": "69870c92500baacfc344facc",
    "status": "pending",
    "premium": 25000,
    "coverageAmount": 500000,
    "paymentStatus": "pending",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

### Example 2: Booking with Payment Method and Dates

```json
{
  "userId": "6987234e9aed7e961e302cd8",
  "insurancePlanId": "69870c92500baacfc344facc",
  "paymentMethod": "credit_card",
  "startDate": "2024-01-01",
  "endDate": "2024-12-31",
  "notes": "Booking after receiving suggestions"
}
```

**Response:**
```json
{
  "success": true,
  "booking": {
    "_id": "6987234e9aed7e961e302cd9",
    "userId": "6987234e9aed7e961e302cd8",
    "insurancePlanId": "69870c92500baacfc344facc",
    "status": "pending",
    "premium": 25000,
    "coverageAmount": 500000,
    "paymentMethod": "credit_card",
    "paymentStatus": "pending",
    "startDate": "2024-01-01T00:00:00.000Z",
    "endDate": "2024-12-31T00:00:00.000Z",
    "notes": "Booking after receiving suggestions",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

### Example 3: Booking with Payment (Transaction ID)

```json
{
  "userId": "6987234e9aed7e961e302cd9",
  "insurancePlanId": "69870c92500baacfc344facd",
  "paymentMethod": "upi",
  "transactionId": "TXN20240115103012345",
  "startDate": "2024-02-01",
  "endDate": "2025-01-31",
  "notes": "Paid booking via UPI"
}
```

**Response:**
```json
{
  "success": true,
  "booking": {
    "_id": "6987234e9aed7e961e302cda",
    "userId": "6987234e9aed7e961e302cd9",
    "insurancePlanId": "69870c92500baacfc344facd",
    "status": "pending",
    "premium": 12000,
    "coverageAmount": 300000,
    "paymentMethod": "upi",
    "paymentStatus": "paid",
    "transactionId": "TXN20240115103012345",
    "startDate": "2024-02-01T00:00:00.000Z",
    "endDate": "2025-01-31T00:00:00.000Z",
    "notes": "Paid booking via UPI",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

### Example 4: Complete Booking with All Fields

```json
{
  "userId": "6987234e9aed7e961e302cda",
  "insurancePlanId": "69870c92500baacfc344face",
  "paymentMethod": "bank_transfer",
  "transactionId": "BANK20240115103012345",
  "startDate": "2024-03-01",
  "endDate": "2025-02-28",
  "notes": "Senior citizen health plan for comprehensive coverage"
}
```

---

## Complete Workflow Example

### Step 1: Get Insurance Suggestions

**Tool:** `suggest_insurance_plan`

**Payload:**
```json
{
  "age": 35,
  "salary": 1200000,
  "familyMembers": 4,
  "deficiencies": ["diabetes", "hypertension"],
  "insuranceType": "Health"
}
```

**Response (excerpt):**
```json
{
  "success": true,
  "suggestedPlans": [
    {
      "_id": "69870c92500baacfc344facc",
      "name": "Family Health Insurance Premium",
      "premium": 25000,
      "coverage": 500000,
      "matchScore": 95,
      "reasons": ["Covers family members", "Includes pre-existing conditions"]
    }
  ]
}
```

### Step 2: Book the Suggested Plan

**Tool:** `book_insurance`

**Payload:**
```json
{
  "userId": "6987234e9aed7e961e302cda",
  "insurancePlanId": "69870c92500baacfc344facc",
  "paymentMethod": "credit_card",
  "startDate": "2024-01-01",
  "endDate": "2024-12-31",
  "notes": "Booking based on suggestions for family with pre-existing conditions"
}
```

---

## Field Descriptions

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `userId` | string | ✅ Yes | MongoDB ObjectId of the user (24-char hex) | `"6987234e9aed7e961e302cd8"` |
| `insurancePlanId` | string | ✅ Yes | MongoDB ObjectId of the insurance plan (24-char hex) | `"69870c92500baacfc344facc"` |
| `paymentMethod` | string | ❌ No | Payment method used | `"credit_card"`, `"debit_card"`, `"upi"`, `"bank_transfer"` |
| `startDate` | string | ❌ No | Coverage start date (ISO 8601) | `"2024-01-01"` |
| `endDate` | string | ❌ No | Coverage end date (ISO 8601) | `"2024-12-31"` |
| `transactionId` | string | ❌ No | Payment transaction ID (if provided, sets paymentStatus to "paid") | `"TXN20240115103012345"` |
| `notes` | string | ❌ No | Additional notes or comments | `"Booking after receiving suggestions"` |

---

## Common Payment Methods

- `credit_card`
- `debit_card`
- `upi`
- `bank_transfer`
- `net_banking`
- `wallet`

---

## Date Format

Dates should be in **ISO 8601 format**:
- ✅ Valid: `"2024-01-01"`, `"2024-12-31"`
- ❌ Invalid: `"01/01/2024"`, `"2024-1-1"`

---

## Error Handling

### Invalid ObjectId Format
```json
{
  "error": "Invalid insurancePlanId format. Expected a 24-character hexadecimal MongoDB ObjectId string. Received: \"invalid-id\". Example format: \"507f1f77bcf86cd799439012\". You can get valid IDs from the suggest_insurance_plan tool response (suggestedPlans[]._id) or use the list_insurance tool."
}
```

### User Not Found
```json
{
  "error": "User with ID 6987234e9aed7e961e302cd8 not found"
}
```

### Insurance Plan Not Found
```json
{
  "error": "Insurance plan with ID 69870c92500baacfc344facc not found"
}
```

### Invalid Date Format
```json
{
  "error": "Invalid startDate format. Use ISO 8601 format (e.g., \"2024-01-01\")"
}
```

### Invalid Date Range
```json
{
  "error": "endDate must be after startDate"
}
```

---

## Quick Reference

**Get current IDs:**
```bash
node scripts/get-sample-ids.js
```

**Populate sample data:**
```bash
node scripts/populate-users-data.js
node scripts/populate-insurance-data.js
```
