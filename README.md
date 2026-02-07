# NitroStack Starter Template

**The simple starter template** - Learn NitroStack fundamentals with a clean calculator example.

## 🎯 What's Inside

This template demonstrates core NitroStack features:

- **One Module** - Calculator module with all features
- **One Tool** - `calculate` - Perform arithmetic operations
- **One Resource** - `calculator://operations` - List of operations
- **One Prompt** - `calculator_help` - Get usage help
- **Two Widgets** - Beautiful UI for results and operations list
- **No Authentication** - Focus on learning the basics
- **No Database** - Pure computation example

## 🚀 Quick Start

### Prerequisites

```bash
# Install NitroStack CLI globally
npm install -g nitrostack

# Or use npx
npx nitrostack --version
```

### Setup Your Project

```bash
# Create a new project
nitrostack init my-calculator --template typescript-starter
cd my-calculator

# Install all dependencies (root + widgets)
nitrostack install
```

That's it! The CLI automatically:
- ✅ Installs all root dependencies  
- ✅ Installs widget dependencies
- ✅ Sets up the project structure

### Run the Project

```bash
npm run dev
```

This starts:
- **MCP Server** (dual transport: STDIO + HTTP) - Hot reloads on code changes
- **Studio** on http://localhost:3000 - Visual testing environment
- **Widget Dev Server** on http://localhost:3001 - Hot module replacement

> 💡 **Dual Transport**: Your server exposes tools via both STDIO (for direct connections) and HTTP (for remote access). Switch between transports in Studio → Settings.

The `nitrostack dev` command handles everything automatically:
- ✅ Auto-detects widget directory
- ✅ Installs dependencies (if needed)
- ✅ Builds widgets (on first run)
- ✅ Starts all services concurrently
- ✅ Hot reload for TypeScript and widgets

## 📁 Project Structure

```
src/
├── modules/
│   └── calculator/
│       ├── calculator.module.ts       # @Module definition
│       ├── calculator.tools.ts        # @Tool with examples
│       ├── calculator.resources.ts    # @Resource
│       └── calculator.prompts.ts      # @Prompt
├── widgets/                           # Next.js UI widgets
│   └── app/
│       ├── calculator-result/         # Tool result widget
│       └── calculator-operations/     # Resource widget
├── app.module.ts                      # Root @McpApp module
└── index.ts                           # Application bootstrap
```

## 🛠️ Available Features

### Health Check: `system`

Monitors server health and resources:

- **Uptime**: Server running time
- **Memory Usage**: Heap memory consumption
- **Process Info**: PID and Node.js version
- **Status**: `up`, `degraded`, or `down`

Check health status in Studio's Health Checks tab!

### Tool: `calculate`

Perform basic arithmetic operations:

```typescript
@Tool({
  name: 'calculate',
  description: 'Perform basic arithmetic calculations',
  inputSchema: z.object({
    operation: z.enum(['add', 'subtract', 'multiply', 'divide']),
    a: z.number(),
    b: z.number()
  }),
  examples: {
    request: { operation: 'add', a: 5, b: 3 },
    response: { result: 8, expression: '5 + 3 = 8' }
  }
})
```

**Usage:**
```
User: "Calculate 5 + 3"
AI: [Calls calculate tool]
Result: Beautiful widget showing "5 + 3 = 8"
```

### Resource: `calculator://operations`

Lists all available operations with examples.

### Prompt: `calculator_help`

Get help on how to use the calculator.

## 🎨 Widgets

### Calculator Result Widget
- Gradient background
- Operation icon
- Breakdown of numbers
- Beautiful animations

### Calculator Operations Widget
- Grid of all operations
- Color-coded by type
- Examples for each operation

## 💡 Learning Path

This template is perfect for learning:

1. **Module Organization** - How to structure a feature module
2. **Tools** - How to create a tool with `@Tool` decorator
3. **Resources** - How to expose data with `@Resource`
4. **Prompts** - How to create conversation templates
5. **Widgets** - How to build UI components
6. **Examples** - How to include request/response examples
7. **Validation** - How to use Zod schemas

## 🔧 Commands

```bash
# Installation
npm install              # Install all dependencies (root + widgets)
nitrostack install       # Same as above

# Development
npm run dev              # Start dev server with Studio
npm run build            # Build TypeScript and widgets for production
npm start                # Run production server

# Upgrade
npm run upgrade          # Upgrade nitrostack to latest version

# Widget Management
npm run widget <command> # Run npm command in widgets directory
npm run widget add <pkg> # Add a widget dependency (e.g., @mui/material)
```

## 📝 Example Interactions

### Basic Calculation
```
User: "What's 12 times 8?"
AI: Calls calculate(operation="multiply", a=12, b=8)
Result: Widget showing "12 × 8 = 96"
```

### Get Help
```
User: "How do I use the calculator?"
AI: Uses calculator_help prompt
Result: Complete usage instructions
```

### List Operations
```
User: "What operations are available?"
AI: Fetches calculator://operations resource
Result: Widget showing all 4 operations with examples
```

## 🎓 Code Walkthrough

### 1. Tool Definition

```typescript
@Tool({
  name: 'calculate',
  description: 'Perform basic arithmetic calculations',
  inputSchema: z.object({...}),
  examples: {...}
})
@Widget('calculator-result')  // Link UI widget
async calculate(input: any, ctx: ExecutionContext) {
  // Your logic here
  return { result, expression };
}
```

**Key Points:**
- `@Tool` decorator defines the tool
- `inputSchema` validates input with Zod
- `examples` help AI understand usage
- `@Widget` links the UI component
- `ExecutionContext` provides logger, metadata

### 2. Resource Definition

```typescript
@Resource({
  uri: 'calculator://operations',
  name: 'Calculator Operations',
  mimeType: 'application/json',
  examples: {...}
})
@Widget('calculator-operations')
async getOperations(uri: string, ctx: ExecutionContext) {
  return { contents: [{...}] };
}
```

### 3. Prompt Definition

```typescript
@Prompt({
  name: 'calculator_help',
  arguments: [...]
})
async getHelp(args: any, ctx: ExecutionContext) {
  return { messages: [...] };
}
```

### 4. Module Definition

```typescript
@Module({
  name: 'calculator',
  controllers: [CalculatorTools, CalculatorResources, CalculatorPrompts]
})
export class CalculatorModule {}
```

### 5. Root Module

```typescript
@McpApp({
  server: { name: 'calculator-server', version: '1.0.0' }
})
@Module({
  imports: [ConfigModule.forRoot(), CalculatorModule]
})
export class AppModule {}
```

## 🚀 Extend This Template

### Add More Operations

Edit `calculator.tools.ts` and add new operations to the enum and switch statement.

### Add History Feature

1. Create a service to store calculations
2. Add a `get_history` tool
3. Create a history widget

### Add More Modules

```bash
nitrostack generate module converter
```

## 📚 Next Steps

Once you understand this template:

1. Try the **Pizza Shop Template** - Interactive maps and widgets
2. Try the **Flight Booking Template** - API integration with Duffel
3. Read the [NitroStack Documentation](https://nitrostack.ai/docs)

## 💡 Tips

- **Keep it Simple** - This template shows the minimum needed
- **Study the Code** - Each file has clear examples
- **Test in Studio** - Use the chat to test your tools
- **Check Examples** - The `examples` field helps AI understand your tools

## 🎉 What to Build

Use this as a starting point for:

- **Unit Converters** - Temperature, currency, etc.
- **Text Tools** - String manipulation, formatting
- **Data Processors** - JSON, CSV, XML parsing
- **Simple APIs** - Weather, jokes, facts
- **Utilities** - Date/time, UUID generation

---

**Happy Learning! 📖**

Start simple, learn the patterns, then build something amazing!
