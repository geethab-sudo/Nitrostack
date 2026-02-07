# Insurance Module

Comprehensive insurance data management module with MongoDB integration, caching, metrics, and intelligent plan suggestions.

## Features

- **List Insurance Plans**: Filter and paginate insurance plans based on salary, family size, and age
- **Search Insurance Names**: Auto-complete search for insurance plan names
- **Suggest Insurance Plans**: AI-powered suggestions based on user profile with match scoring
- **Caching**: In-memory caching for improved performance
- **Metrics**: Operation tracking and performance monitoring
- **Health Checks**: Database connection health monitoring
- **Input Sanitization**: Security-focused input validation and sanitization
- **Type Safety**: Full TypeScript support with comprehensive interfaces

## Architecture

### Services

- **MongoDBService**: Manages database connections with retry logic and connection pooling
- **InsuranceQueryBuilderService**: Builds optimized MongoDB queries
- **InsuranceScoringService**: Calculates match scores for insurance plans
- **InsuranceRecommendationService**: Generates personalized recommendations
- **CacheService**: In-memory caching with TTL support
- **MetricsService**: Tracks operation performance and success rates

### Configuration

Configuration is managed through environment variables. See `.env.example` for all available options.

### Error Handling

Custom error classes provide structured error handling:
- `DatabaseConnectionError`: MongoDB connection failures
- `DatabaseQueryError`: Query execution failures
- `InvalidInputError`: Input validation failures
- `ConfigurationError`: Configuration issues

## Usage

### Environment Variables

Create a `.env` file with the following variables:

```env
MONGODB_URI=mongodb://localhost:27017/
MONGODB_DATABASE_NAME=Insurance
MONGODB_COLLECTION_NAME=Insurance
MONGODB_MAX_POOL_SIZE=10
MONGODB_MIN_POOL_SIZE=2
MONGODB_CONNECT_TIMEOUT_MS=30000
MONGODB_SERVER_SELECTION_TIMEOUT_MS=5000
```

### Example: List Insurance Plans

```typescript
const result = await listInsurance({
  salary: 500000,
  familyMembers: 4,
  age: 35,
  limit: 10,
  skip: 0
});
```

### Example: Search Insurance Names

```typescript
const result = await searchInsuranceNames({
  searchQuery: 'health',
  limit: 20
});
```

### Example: Suggest Insurance Plans

```typescript
const result = await suggestInsurancePlan({
  age: 35,
  salary: 500000,
  familyMembers: 4,
  deficiencies: ['diabetes', 'hypertension']
});
```

## Database Indexes

The module automatically creates the following indexes for optimal performance:

- Text index on `name` field for search
- Index on `premium` for filtering
- Compound index on `minAge` and `maxAge` for age filtering
- Index on `familyCoverage` and `maxFamilyMembers` for family filtering
- Index on `coversPreExisting` for condition filtering
- Compound index for common query patterns

## Scoring Algorithm

The insurance plan scoring algorithm considers:

1. **Age Match** (30 points): Plan age range compatibility
2. **Premium Affordability** (25 points): Premium as percentage of salary
3. **Family Coverage** (20 points): Family member coverage match
4. **Pre-existing Conditions** (25 points): Coverage for pre-existing conditions
5. **Specific Conditions** (15 points): Coverage for specific conditions
6. **Type Match** (10 points): Health insurance type preference

Total score is capped at 100 points.

## Caching

- List queries: 5 minutes TTL
- Search queries: 2 minutes TTL
- Suggestion queries: 5 minutes TTL

Cache keys are generated based on input parameters to ensure accurate cache hits.

## Metrics

The module tracks:
- Operation count
- Average execution time
- Min/Max execution times
- Error count
- Success rate

Access metrics via `MetricsService.getInstance().getMetrics(operation)`.

## Health Checks

The module includes a health check that monitors:
- MongoDB connection status
- Database availability

Health check runs every 30 seconds automatically.

## Security

- Input sanitization prevents injection attacks
- Regex input sanitization prevents regex injection
- Filter object validation prevents MongoDB injection
- Type validation ensures data integrity

## Testing

Run tests with:

```bash
npm test
```

Test coverage includes:
- Service unit tests
- Input sanitization tests
- Query builder tests
- Scoring algorithm tests

## Performance Optimizations

1. **Database Indexes**: Automatic index creation for common queries
2. **Query Optimization**: Filters applied at database level before scoring
3. **Caching**: In-memory cache reduces database load
4. **Connection Pooling**: Efficient MongoDB connection management
5. **Pagination**: Efficient data retrieval with skip/limit

## Error Handling

All errors include:
- Error code for programmatic handling
- Descriptive error messages
- Context information for debugging
- Appropriate HTTP status codes

## Type Safety

Full TypeScript support with:
- Comprehensive interfaces for all data structures
- Type-safe input/output validation
- Zod schema validation
- No `any` types in public APIs

## Contributing

When adding new features:

1. Add TypeScript interfaces in `interfaces/`
2. Create service classes in `services/`
3. Add error classes in `errors/` if needed
4. Update tests in `__tests__/`
5. Update this README

## License

See main project license.
