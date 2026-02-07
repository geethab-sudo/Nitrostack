import { PromptDecorator as Prompt, ExecutionContext } from '@nitrostack/core';

export class InsurancePrompts {
  @Prompt({
    name: 'insurance_help',
    description: 'Get help with insurance operations',
    arguments: [
      {
        name: 'operation',
        description: 'The operation to get help with (optional)',
        required: false
      }
    ]
  })
  async getHelp(args: any, ctx: ExecutionContext) {
    ctx.logger.info('Generating insurance help prompt');

    const operation = args.operation;

    if (operation === 'list_insurance') {
      return [
        {
          role: 'user' as const,
          content: 'How do I list insurance records?'
        },
        {
          role: 'assistant' as const,
          content: `To list insurance records, use the 'list_insurance' tool. 

You can optionally provide:
- **limit**: Maximum number of records to return (default: 100)
- **skip**: Number of records to skip for pagination (default: 0)
- **filter**: A filter object to query specific insurance records

Example: list_insurance(limit=10, skip=0) will return the first 10 insurance records.`
        }
      ];
    }

    // General help
    return [
      {
        role: 'user' as const,
        content: 'How do I work with insurance data?'
      },
      {
        role: 'assistant' as const,
        content: `The insurance module provides tools to interact with insurance data stored in MongoDB.

Available operations:
1. **list_insurance** - List all insurance records from the insuranceList collection
   - Supports pagination with limit and skip parameters
   - Supports filtering with a filter object
   - Returns insurance records with metadata

The data is stored in MongoDB:
- Database: Insurance
- Collection: insuranceList
- Connection: mongodb://localhost:27017/`
      }
    ];
  }
}
