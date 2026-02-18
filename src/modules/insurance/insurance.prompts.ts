import { PromptDecorator as Prompt, ExecutionContext } from '@nitrostack/core';

export class InsurancePrompts {
  @Prompt({
    name: 'insurance_help_list_insurance',
    description: 'Get help with listing insurance records'
  })
  async getListInsuranceHelp(args: any, ctx: ExecutionContext) {
    ctx.logger.info('Generating list_insurance help prompt');

    return [
      {
        role: 'user' as const,
        content: 'How do I list insurance records?'
      },
      {
        role: 'assistant' as const,
        content: `To list insurance records, use the 'list_insurance' tool.

**Required Parameters:**
- **salary**: Annual salary in currency units (required for affordability filtering)

**Optional Parameters:**
- **familyMembers**: Number of family members to cover (optional)
- **age**: User age in years (optional, 0-120)
- **limit**: Maximum number of records to return (default: 100)
- **skip**: Number of records to skip for pagination (default: 0)
- **filter**: Additional MongoDB filter object for advanced queries

**Filtering Logic:**
- Only returns plans where premium ≤ 10% of annual salary (affordability threshold)
- If familyMembers > 1: Returns plans with familyCoverage=true OR maxFamilyMembers >= familyMembers
- If age provided: Only returns plans where user's age falls within plan's age range
- All filters are combined with AND logic

Example: list_insurance(salary=500000, familyMembers=4, age=35, limit=10)`
      }
    ];
  }

  @Prompt({
    name: 'insurance_help_suggest_insurance_plan',
    description: 'Get help with insurance plan suggestions'
  })
  async getSuggestInsurancePlanHelp(args: any, ctx: ExecutionContext) {
    ctx.logger.info('Generating suggest_insurance_plan help prompt');

    return [
      {
        role: 'user' as const,
        content: 'How do I get insurance plan suggestions?'
      },
      {
        role: 'assistant' as const,
        content: `To get personalized insurance plan suggestions, use the 'suggest_insurance_plan' tool.

**Required Parameters:**
- **age**: User age in years (0-120)
- **salary**: Annual salary in currency units
- **familyMembers**: Number of family members to cover (including self)

**Optional Parameters:**
- **deficiencies**: Array of health deficiencies or pre-existing conditions (e.g., ["diabetes", "hypertension"])
- **insuranceType**: Type of insurance to filter by (e.g., "Health", "Life", "Accident", "Travel", "Motor")

**How It Works:**
1. Filters plans based on affordability (premium ≤ 10% of salary), age range, family coverage, and pre-existing conditions
2. Scores each plan using an intelligent algorithm (0-100 match score)
3. Returns top 5 plans sorted by match score (highest first)
4. Each plan includes matchScore and reasons array explaining why it was suggested

**Scoring Factors:**
- Age Match (30 points): User age within plan's age range
- Premium Affordability (25 points): Based on premium percentage of salary
- Family Coverage (20 points): Plan matches family size requirements
- Pre-existing Conditions (25 points): Plan covers pre-existing conditions
- Specific Conditions (15 points): Plan's coveredConditions includes user deficiencies
- Type Match (10 points): Plan type matches user needs

Example: suggest_insurance_plan(age=35, salary=500000, familyMembers=4, deficiencies=["diabetes"], insuranceType="Health")`
      }
    ];
  }

  @Prompt({
    name: 'insurance_help_book_insurance_with_user',
    description: 'Get help with booking an insurance plan'
  })
  async getBookInsuranceWithUserHelp(args: any, ctx: ExecutionContext) {
    ctx.logger.info('Generating book_insurance_with_user help prompt');

    return [
      {
        role: 'user' as const,
        content: 'How do I book an insurance plan?'
      },
      {
        role: 'assistant' as const,
        content: `To book an insurance plan, use the 'book_insurance_with_user' tool.

**IMPORTANT:** Before calling this tool, you MUST ask the user for their email address if it's not already available. The email is a REQUIRED field.

**Required Parameters:**
- **policyNumber**: Insurance policy number (e.g., "POL-HDFC-HEA-0002") - must exist in Insurance collection
- **email**: User email address (REQUIRED - valid email format, used as primary identifier. You must ask the user for their email if not provided)
- **name**: User full name (minimum 1 character)
- **phoneNumber**: User phone number

**Optional Parameters:**
- **paymentMethod**: Payment method (e.g., "credit_card", "debit_card", "upi", "bank_transfer")
- **startDate**: Insurance coverage start date (ISO 8601 format, e.g., "2024-01-01") - Required if years is provided
- **years**: Number of years for insurance coverage (1-50) - If provided, startDate is REQUIRED
- **transactionId**: Payment transaction ID (if provided, paymentStatus is set to 'paid', otherwise 'pending')
- **notes**: Additional comments for the booking

**What It Does:**
1. Validates that the policy number exists in the Insurance collection
2. Creates or updates user account with provided email, name, and phone
3. Creates booking record with status='pending' by default
4. Links booking to user and insurance plan
5. Extracts premium and coverage amounts from the insurance plan
6. Calculates endDate automatically if years and startDate are provided

**Date Handling:**
- If years is provided, startDate is REQUIRED
- endDate is calculated as startDate + years - 1 day
- endDate must be after startDate

Example: book_insurance_with_user(policyNumber="POL-HDFC-HEA-0002", email="user@example.com", name="John Doe", phoneNumber="+91-9876543210", paymentMethod="credit_card", startDate="2024-01-01", years=1)`
      }
    ];
  }

  @Prompt({
    name: 'insurance_help_list_booking_status_by_email',
    description: 'Get help with checking booking status'
  })
  async getListBookingStatusByEmailHelp(args: any, ctx: ExecutionContext) {
    ctx.logger.info('Generating list_booking_status_by_email help prompt');

    return [
      {
        role: 'user' as const,
        content: 'How do I check booking status?'
      },
      {
        role: 'assistant' as const,
        content: `To check booking statuses for a user, use the 'list_booking_status_by_email' tool.

**Required Parameters:**
- **email**: User email address (valid email format)

**What It Returns:**
- User information (name, email, phone)
- All bookings for the user (sorted by most recent first)
- Count of total bookings
- Each booking includes full details: _id, userId, insurancePlanId, policyNumber, status, premium, coverageAmount, paymentStatus, paymentMethod, transactionId, startDate, endDate, notes, createdAt, updatedAt

**Booking Status Values:**
- **status**: 'pending' | 'confirmed' | 'cancelled' | 'expired' | 'active'
- **paymentStatus**: 'pending' | 'paid' | 'failed' | 'refunded'

**Notes:**
- User must exist in Users collection (returns error if not found)
- Returns ALL bookings for the user (no limit)
- Each booking is displayed in a separate card in the widget

Example: list_booking_status_by_email(email="user@example.com")`
      }
    ];
  }

  @Prompt({
    name: 'insurance_help',
    description: 'Get general help with insurance operations'
  })
  async getHelp(args: any, ctx: ExecutionContext) {
    ctx.logger.info('Generating insurance help prompt');

    return [
      {
        role: 'user' as const,
        content: 'How do I work with insurance data?'
      },
      {
        role: 'assistant' as const,
        content: `The insurance module provides comprehensive tools to interact with insurance data stored in MongoDB.

**Available Tools:**

1. **list_insurance** - List insurance records filtered by salary, family members, and age
   - Filters by affordability (premium ≤ 10% of salary)
   - Supports family coverage and age range filtering
   - Supports pagination and custom MongoDB filters
   - Returns simplified list with name, description, and policy ID

2. **suggest_insurance_plan** - Get personalized insurance plan suggestions
   - Analyzes user profile (age, salary, family members, health deficiencies)
   - Uses intelligent scoring algorithm (0-100 match score)
   - Returns top 5 plans with match scores and reasons
   - Optimized database queries for performance

3. **book_insurance_with_user** - Book an insurance plan with user details
   - Creates or updates user account
   - Creates booking record with policy number
   - Supports payment information and coverage dates
   - Validates policy existence and user data

4. **list_booking_status_by_email** - Check booking statuses for a user
   - Retrieves all bookings for a user by email
   - Returns complete booking history with full details
   - Sorted by most recent first
   - Displays each booking in a separate card

**Data Storage:**
- Database: MongoDB
- Collections: Insurance (plans), Users (user accounts), Bookings (booking records)
- Features: Caching, metrics tracking, input sanitization, error handling

All tools include proper validation, error handling, and performance optimizations.`
      }
    ];
  }
}
