# Insurance Suggestion and Metrics Documentation

## Table of Contents
1. [Insurance Suggestion System](#insurance-suggestion-system)
2. [Metrics System](#metrics-system)
3. [Integration Flow](#integration-flow)

---

## Insurance Suggestion System

### Overview

The insurance suggestion system provides intelligent, personalized insurance plan recommendations based on user profiles. It uses a two-phase approach: **filtering** followed by **scoring** to identify the most suitable insurance plans.

### Architecture

The suggestion system consists of three main components:

1. **InsuranceQueryBuilderService** - Builds optimized MongoDB queries
2. **InsuranceScoringService** - Calculates match scores for plans
3. **InsuranceRecommendationService** - Generates human-readable recommendations

### Complete Flow

```
User Input (age, salary, familyMembers, deficiencies, insuranceType)
    ↓
Input Validation & Sanitization
    ↓
Cache Check (if cached, return immediately)
    ↓
Build Optimized Query (InsuranceQueryBuilderService)
    ↓
Fetch Candidate Plans from MongoDB (limited to 15 plans = MAX_SUGGESTIONS * 3)
    ↓
Score Each Plan (InsuranceScoringService)
    ↓
Sort by Match Score (highest first)
    ↓
Select Top 5 Plans (MAX_SUGGESTIONS)
    ↓
Generate Recommendations Text (InsuranceRecommendationService)
    ↓
Cache Result
    ↓
Return Response with Scored Plans
```

### Phase 1: Query Building and Filtering

The `buildSuggestionQuery()` method in `InsuranceQueryBuilderService` creates an optimized MongoDB query that filters plans **before** scoring. This reduces the number of plans that need to be scored.

#### Filtering Criteria

1. **Premium Affordability (Required)**
   ```typescript
   premium ≤ (salary × 0.10)  // 10% of annual salary
   ```
   - Only plans where premium is ≤ 10% of user's annual salary are considered
   - This ensures all suggested plans are financially viable

2. **Age Range Matching (Required)**
   ```typescript
   // Plan matches if:
   (minAge doesn't exist OR user age >= minAge) AND
   (maxAge doesn't exist OR user age <= maxAge)
   ```
   - Ensures user's age falls within the plan's eligible age range
   - Plans without age restrictions are also included

3. **Family Coverage (Conditional)**
   ```typescript
   if (familyMembers > 1) {
     // Only plans with:
     familyCoverage === true OR
     maxFamilyMembers >= familyMembers
   }
   ```
   - If user has more than 1 family member, only family plans are considered
   - Single users can use individual or family plans

4. **Insurance Type (Optional)**
   ```typescript
   if (insuranceType provided) {
     type === insuranceType OR category === insuranceType
   }
   ```
   - Filters by specific insurance type (Health, Life, Accident, etc.)

5. **Pre-existing Conditions (Preference)**
   ```typescript
   if (deficiencies provided) {
     // Prefer plans that cover pre-existing conditions
     coversPreExisting === true OR coversPreExisting doesn't exist
   }
   ```
   - If user has health deficiencies, prefers plans that cover pre-existing conditions
   - Doesn't exclude plans that don't specify this field

#### Query Optimization

- The query fetches only **15 candidate plans** (3× the final result size)
- This prevents loading all plans into memory
- MongoDB indexes are used for efficient filtering

### Phase 2: Scoring Algorithm

After filtering, each candidate plan is scored using the `calculateScore()` method in `InsuranceScoringService`. The scoring algorithm uses weighted criteria to calculate a match score from 0-100.

#### Scoring Components

| Component | Weight | Description |
|-----------|--------|-------------|
| **Age Match** | 30 points | User's age within plan's age range |
| **Premium Affordability** | 25 points | Premium as percentage of salary |
| **Family Coverage** | 20 points | Plan matches family size requirements |
| **Pre-existing Conditions** | 25 points | Plan covers pre-existing conditions |
| **Specific Conditions** | 15 points | Plan's coveredConditions includes user deficiencies |
| **Type Match** | 10 points | Health insurance type preference (if deficiencies exist) |

**Total Maximum Score: 100 points**

#### Detailed Scoring Logic

##### 1. Age Match (30 points)
```typescript
if (userAge >= plan.minAge && userAge <= plan.maxAge) {
  score += 30
}
```
- Full points if age is within range
- 0 points if outside range
- Handles plans with only minAge or only maxAge

##### 2. Premium Affordability (25 points)
```typescript
premiumRatio = plan.premium / salary

if (premiumRatio ≤ 0.05) {        // ≤ 5% of salary
  score += 25  // Highly affordable
} else if (premiumRatio ≤ 0.10) {  // ≤ 10% of salary
  score += 15  // Moderate (60% of weight)
} else {                            // > 10% of salary
  score += 5   // May be high (20% of weight)
}
```

**Affordability Tiers:**
- **Highly Affordable**: Premium ≤ 5% of salary → 25 points
- **Moderate**: Premium ≤ 10% of salary → 15 points
- **May be High**: Premium > 10% of salary → 5 points

##### 3. Family Coverage (20 points)
```typescript
if (familyMembers > 1 && plan.familyCoverage === true) {
  score += 20  // "Covers family members"
} else if (familyMembers === 1 && plan.familyCoverage === false) {
  score += 20  // "Individual plan suitable"
} else if (familyMembers <= plan.maxFamilyMembers) {
  score += 20  // "Covers up to X family members"
}
```

##### 4. Pre-existing Conditions (25 points)
```typescript
if (plan.coversPreExisting === true) {
  score += 25  // "Covers pre-existing conditions"
} else if (plan.coversPreExisting === false) {
  score -= 10  // Penalty: "Does not cover pre-existing conditions"
}
```

##### 5. Specific Conditions (15 points)
```typescript
// Check if plan's coveredConditions includes any user deficiencies
coveredDeficiencies = deficiencies.filter(def => 
  plan.coveredConditions.includes(def)
)

if (coveredDeficiencies.length > 0) {
  score += 15  // "Covers: [condition1, condition2]"
}
```

##### 6. Type Match (10 points)
```typescript
if (user has deficiencies && plan.type === 'Health') {
  score += 10  // "Health insurance type matches your needs"
}
```

#### Score Normalization

The final score is clamped between 0 and 100:
```typescript
finalScore = Math.min(100, Math.max(0, matchScore))
```

### Phase 3: Ranking and Selection

1. **Sort Plans**: All scored plans are sorted by `matchScore` in descending order
2. **Select Top 5**: Only the top 5 plans (`MAX_SUGGESTIONS`) are returned
3. **Include Reasons**: Each plan includes a `reasons` array explaining why it was suggested

### Phase 4: Recommendation Generation

The `InsuranceRecommendationService` generates human-readable recommendation text based on the user profile:

```typescript
generateRecommendations(userProfile: UserProfile): string
```

**Recommendation Rules:**

1. **Family Size**
   - If `familyMembers > 1`: "We recommend family insurance plans covering X members."

2. **Health Deficiencies**
   - If deficiencies exist: "Consider plans that cover pre-existing conditions: [list]."

3. **Affordable Premium**
   - Calculates: `affordablePremium = salary × 0.05`
   - Suggests: "Affordable premium range: up to X per year (5% of salary)."

4. **Age-Based Recommendations**
   - Age < 30: "As a young adult, consider plans with lower premiums and good coverage."
   - Age ≥ 50: "Consider comprehensive health coverage with focus on preventive care."

### Caching

Suggestion results are cached to improve performance:

- **Cache Key**: Generated from user profile (age, salary, familyMembers, deficiencies, insuranceType)
- **TTL**: 5 minutes (configurable)
- **Cache Hit**: Returns immediately without database query or scoring

### Example Request/Response

**Request:**
```typescript
{
  age: 35,
  salary: 500000,
  familyMembers: 4,
  deficiencies: ['diabetes', 'hypertension'],
  insuranceType: 'Health'
}
```

**Response:**
```typescript
{
  success: true,
  userProfile: { ... },
  suggestedPlans: [
    {
      _id: '507f1f77bcf86cd799439011',
      name: 'Family Health Insurance Premium',
      type: 'Health',
      premium: 25000,
      coverage: 500000,
      matchScore: 95,
      reasons: [
        'Age appropriate (18-65 years)',
        'Highly affordable premium',
        'Covers family members',
        'Covers pre-existing conditions',
        'Covers: diabetes, hypertension',
        'Health insurance type matches your needs'
      ]
    },
    // ... 4 more plans
  ],
  recommendations: 'Based on your profile:\n- We recommend family insurance plans covering 4 members.\n- Consider plans that cover pre-existing conditions: diabetes, hypertension.\n- Affordable premium range: up to 25000 per year (5% of salary).'
}
```

---

## Metrics System

### Overview

The metrics system tracks performance and reliability of all insurance operations. It provides real-time monitoring of operation counts, execution times, error rates, and success rates.

### Architecture

The `MetricsService` is a **singleton service** that maintains an in-memory metrics store. It tracks metrics for each operation independently.

### Data Structure

```typescript
interface MetricEntry {
  count: number;           // Total successful operations
  totalTime: number;       // Sum of all execution times (ms)
  minTime: number;         // Fastest execution time (ms)
  maxTime: number;         // Slowest execution time (ms)
  errors: number;          // Total failed operations
  lastUpdated: number;     // Timestamp of last update
}
```

### Tracked Operations

The system tracks metrics for the following operations:

1. `list_insurance` - Listing insurance plans
2. `suggest_insurance_plan` - Generating insurance suggestions
3. `book_insurance_with_user` - Creating insurance bookings
4. `list_booking_status_by_email` - Retrieving booking statuses

### Metrics Collection

#### Recording Success

```typescript
metricsService.recordSuccess(operation: string, duration: number): void
```

**What it records:**
- Increments operation `count`
- Adds `duration` to `totalTime`
- Updates `minTime` if duration is lower
- Updates `maxTime` if duration is higher
- Updates `lastUpdated` timestamp

**Example:**
```typescript
const startTime = Date.now();
// ... perform operation ...
const duration = Date.now() - startTime;
metricsService.recordSuccess('suggest_insurance_plan', duration);
```

#### Recording Errors

```typescript
metricsService.recordError(operation: string, duration: number): void
```

**What it records:**
- Increments `errors` count
- Adds `duration` to `totalTime` (even for errors)
- Updates `lastUpdated` timestamp
- Does NOT increment `count` (only successful operations increment count)

**Example:**
```typescript
try {
  // ... perform operation ...
  metricsService.recordSuccess(operation, duration);
} catch (error) {
  metricsService.recordError(operation, duration);
  throw error;
}
```

### Metrics Retrieval

#### Get Metrics for Specific Operation

```typescript
getMetrics(operation: string): {
  count: number;           // Total successful operations
  avgTime: number;          // Average execution time (ms)
  minTime: number;          // Fastest execution (ms)
  maxTime: number;          // Slowest execution (ms)
  errors: number;           // Total errors
  successRate: number;      // Success rate percentage
} | null
```

**Calculated Values:**
- `avgTime = totalTime / count`
- `successRate = ((count - errors) / count) × 100`

**Example:**
```typescript
const metrics = metricsService.getMetrics('suggest_insurance_plan');
// Returns:
// {
//   count: 150,
//   avgTime: 245.5,
//   minTime: 120,
//   maxTime: 850,
//   errors: 3,
//   successRate: 98.0
// }
```

#### Get All Metrics

```typescript
getAllMetrics(): Record<string, Metrics>
```

Returns metrics for all tracked operations.

**Example:**
```typescript
const allMetrics = metricsService.getAllMetrics();
// Returns:
// {
//   'list_insurance': { count: 500, avgTime: 180, ... },
//   'suggest_insurance_plan': { count: 150, avgTime: 245.5, ... },
//   'book_insurance_with_user': { count: 75, avgTime: 320, ... },
//   'list_booking_status_by_email': { count: 200, avgTime: 150, ... }
// }
```

### Metrics Reset

#### Reset All Metrics

```typescript
reset(): void
```

Clears all metrics for all operations.

#### Reset Specific Operation

```typescript
resetOperation(operation: string): void
```

Clears metrics for a specific operation only.

### Integration in Tools

Every tool method follows this pattern:

```typescript
async toolMethod(input: Input, ctx: ExecutionContext): Promise<Response> {
  const startTime = Date.now();
  const operation = 'tool_name';

  try {
    // ... perform operation ...
    
    const duration = Date.now() - startTime;
    this.metricsService.recordSuccess(operation, duration);
    
    return response;
  } catch (error) {
    const duration = Date.now() - startTime;
    this.metricsService.recordError(operation, duration);
    
    throw error;
  }
}
```

### Metrics Storage

- **Storage Type**: In-memory (Map data structure)
- **Persistence**: Metrics are **not persisted** to database
- **Lifetime**: Metrics exist for the lifetime of the application process
- **Reset**: Metrics are lost on application restart

### Use Cases

1. **Performance Monitoring**
   - Track average response times
   - Identify slow operations
   - Monitor performance degradation

2. **Reliability Monitoring**
   - Track error rates
   - Calculate success rates
   - Identify problematic operations

3. **Capacity Planning**
   - Track operation volumes
   - Identify high-traffic operations
   - Plan for scaling

4. **Debugging**
   - Compare min/max times to identify outliers
   - Track error patterns
   - Monitor operation health

### Example Metrics Output

```typescript
// Get metrics for suggestion operation
const suggestionMetrics = metricsService.getMetrics('suggest_insurance_plan');

console.log(suggestionMetrics);
// {
//   count: 150,              // 150 successful suggestions
//   avgTime: 245.5,          // Average 245.5ms per suggestion
//   minTime: 120,            // Fastest: 120ms
//   maxTime: 850,            // Slowest: 850ms
//   errors: 3,               // 3 failed attempts
//   successRate: 98.0        // 98% success rate
// }

// Get all metrics
const allMetrics = metricsService.getAllMetrics();
console.log(allMetrics);
// {
//   'list_insurance': {
//     count: 500,
//     avgTime: 180,
//     minTime: 95,
//     maxTime: 450,
//     errors: 2,
//     successRate: 99.6
//   },
//   'suggest_insurance_plan': {
//     count: 150,
//     avgTime: 245.5,
//     minTime: 120,
//     maxTime: 850,
//     errors: 3,
//     successRate: 98.0
//   },
//   // ... other operations
// }
```

---

## Integration Flow

### Complete Request Flow with Metrics

```
1. User Request
   ↓
2. Tool Method Called (e.g., suggestInsurancePlan)
   ↓
3. Start Timer (startTime = Date.now())
   ↓
4. Input Validation & Sanitization
   ↓
5. Cache Check
   ├─ Cache Hit → Return cached + recordSuccess
   └─ Cache Miss → Continue
   ↓
6. Build Query (InsuranceQueryBuilderService)
   ↓
7. Fetch Plans from MongoDB
   ↓
8. Score Plans (InsuranceScoringService)
   ↓
9. Sort & Select Top 5
   ↓
10. Generate Recommendations
   ↓
11. Cache Result
   ↓
12. Calculate Duration (duration = Date.now() - startTime)
   ↓
13. Record Success Metrics
    metricsService.recordSuccess('suggest_insurance_plan', duration)
   ↓
14. Return Response
```

### Error Flow with Metrics

```
1. Tool Method Called
   ↓
2. Start Timer
   ↓
3. Operation Fails (exception thrown)
   ↓
4. Catch Error
   ↓
5. Calculate Duration
   ↓
6. Record Error Metrics
    metricsService.recordError(operation, duration)
   ↓
7. Re-throw Error
```

### Metrics Collection Points

Metrics are collected at these key points:

1. **Cache Hits**: Very fast (typically < 5ms)
2. **Database Queries**: Moderate (100-500ms)
3. **Scoring Operations**: Moderate (50-200ms)
4. **Full Pipeline**: Complete operation (200-1000ms)

### Performance Optimization

The metrics system helps identify:

- **Slow Operations**: High `avgTime` or `maxTime`
- **Cache Effectiveness**: Compare cached vs non-cached times
- **Database Performance**: Query execution times
- **Scoring Performance**: Scoring algorithm efficiency

---

## Configuration

### Scoring Weights

Scoring weights can be configured (defaults in `InsuranceConfig`):

```typescript
{
  age: 30,
  premium: 25,
  familyCoverage: 20,
  preExistingConditions: 25,
  specificConditions: 15,
  typeMatch: 10
}
```

### Constants

```typescript
MAX_AFFORDABLE_PREMIUM_RATIO: 0.10      // 10% of salary
HIGHLY_AFFORDABLE_PREMIUM_RATIO: 0.05  // 5% of salary
MAX_SUGGESTIONS: 5                      // Top 5 plans returned
```

---

## Summary

### Insurance Suggestion

- **Two-phase approach**: Filtering → Scoring
- **Optimized queries**: Only fetches 15 candidate plans
- **Weighted scoring**: 6 criteria totaling 100 points
- **Top 5 results**: Returns best matches with reasons
- **Caching**: 5-minute TTL for performance

### Metrics System

- **Real-time tracking**: Operation counts, times, errors
- **In-memory storage**: Fast access, not persisted
- **Success/Error tracking**: Separate counters for reliability
- **Performance insights**: Min/max/avg times for optimization
- **Success rate calculation**: Automatic percentage calculation

Both systems work together to provide intelligent insurance recommendations with comprehensive performance monitoring.
