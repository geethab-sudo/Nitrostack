import { ResourceDecorator as Resource, ExecutionContext } from '@nitrostack/core';

export class InsuranceResources {
  @Resource({
    uri: 'insurance://list',
    name: 'Insurance List',
    description: 'Information about insurance listing operations',
    mimeType: 'application/json',
    examples: {
      response: {
        description: 'Use the list_insurance tool to retrieve insurance records from MongoDB',
        collection: 'Insurance',
        database: 'Insurance'
      }
    }
  })
  async getInsuranceInfo(uri: string, ctx: ExecutionContext) {
    ctx.logger.info('Fetching insurance resource information');

    return {
      contents: [{
        uri,
        mimeType: 'application/json',
        text: JSON.stringify({
          description: 'Insurance listing operations',
          collection: 'Insurance',
          database: 'Insurance',
          connection: 'mongodb://localhost:27017/',
          available_operations: [
            {
              name: 'list_insurance',
              description: 'List all insurance records with optional filtering and pagination'
            },
            {
              name: 'search_insurance_names',
              description: 'Search insurance names with auto-complete support'
            },
            {
              name: 'suggest_insurance_plan',
              description: 'Suggest insurance plans based on age, salary, family members, and health deficiencies'
            }
          ]
        }, null, 2)
      }]
    };
  }
}
