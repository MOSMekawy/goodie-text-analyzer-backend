# Running Locally
### Prerequisites
- RabbitMQ
- Postgresql
- Node.js (v20 or higher)
- npm (comes with Node.js)

### Installation

1. Install dependencies:
```bash
npm install
```
### Runnig The App
2. Run Main Service
```bash
npm run start
```

3. Run Worker Service
```bash
npm run start-worker
```

## Running with Docker
### Prerequisites
- Docker Desktop installed and running
### Building the Docker Image
Build the Docker image with the following command:
```bash
docker build -t goodie-text-analyzer-backend .
```

To run the docker image use the following command:
```bash
docker run --name goodie-worker -e DB_HOST=YOUR_DB_HOST -e DB_PORT=5432 -e DB_USERNAME=USERNAME -e DB_PASSWORD=PASSWORD -e DB_DATABASE=DATABASE_NAME -e RABBITMQ_URI=RABBITMQ_CONN_URI goodie-text-analyzer-backend
```
Place actual values instead of the placeholders in the command.

To Run the worker service same command is ran but worker.js is designated as application entrypoint.
```bash
docker run --name goodie-worker -e DB_HOST=YOUR_DB_HOST -e DB_PORT=5432 -e DB_USERNAME=USERNAME -e DB_PASSWORD=PASSWORD -e DB_DATABASE=DATABASE_NAME -e RABBITMQ_URI=RABBITMQ_CONN_URI goodie-text-analyzer-backend node dist/worker.js
```

# Project Architecture

This project follows a **vertical slice architecture**. Below is an overview of the folder structure, an explanation of vertical slice architecture and how it compares to a traditional layered architecture, plus a step-by-step guide on how to create a new vertical slice in this codebase.

---
## Folder / File Structure
Here’s a brief description of the top-level directories inside `src/`:

1. **domain/**
   - **contracts/**: Interfaces or TypeScript “contracts” for domain services or models.
   - **entities/**: Core domain objects or data models, representing the heart of the business logic.
   - **value-objects/**: Immutable and behavior-rich objects that are defined only by their attributes.

2. **features/**
   - Each folder (e.g., `documents`) represents a distinct entity area.
   - Inside each folder are the feature folders pertaining this entity. Inside each feature folder, you may have everything needed to fulfill that feature (e.g., controllers, handlers, modules, services).

3. **infrastructure/**
   - Contains technical details and services that support the application.
   - Examples include message bus (RabbitMQ), external APIs, or integration logic.

4. **persistence/**
   - Mappers, schemas, and other data-layer concerns that handle storing and retrieving data from databases or other sources.

5. **shared/**
   - Utilities, common code, cross-cutting concerns, or helper functions that various parts of the application can use.

6. **main.ts** and **worker.ts**
   - Entry points for running the main server (`main.ts`) or background workers (`worker.ts`).

---

## Vertical Slice Architecture

### What is Vertical Slice Architecture?

Vertical slice architecture organizes code by **feature** rather than by technology layer (e.g., controllers in one folder, services in another, etc.). Each feature folder (often referred to as a “slice”) encapsulates the full stack required to implement that feature:

- Domain logic
- Application logic (e.g., handlers, controllers)
- Infrastructure details (e.g., data access, messaging interfaces)
- Any specialized configuration or module files

In other words, instead of distributing code related to one feature across multiple layers and directories, everything that implements the feature stays together (High Cohesion) in a single slice.

### How Does This Compare to a Layered Architecture?

#### Layered Architecture
- **Organization**: Typically has folders like `controllers/`, `services/`, `repositories/`, etc.
- **Pros**:
  - Familiar to many developers.
  - Clear layering can enforce separation of concerns if done carefully.
- **Cons**:
  - Technology layers (e.g., “controllers“, “services“) can grow to be so large that it’s hard to navigate and maintain.
  - Code related to one feature is spread across different folders, which can slow development when you have to jump between layers for a single feature.
  - Adding new features can become cumbersome if you have to touch multiple layers.

#### Vertical Slice Architecture
- **Organization**: Folders represent discrete business capabilities or features (e.g., “documents,” “tasks”).
- **Pros**:
  - **Feature-focused**: All code for a feature (domain logic, data access, etc.) co-located in a single folder.
  - **Encapsulated**: Changes in one feature generally don’t affect others unless explicitly intended.
  - **Faster iteration**: Easier to add or modify features because you only need to work in one place.
- **Cons**:
  - Potential duplication of code if you’re not careful with shared modules.
  - Requires clear naming and structure to keep slices discoverable.

---

## Step-by-Step: Creating a New Slice

Below is a recommended approach for adding a new vertical slice (feature) to the `features/` directory.

1. **Identify the Feature**
   - Determine the scope of the new feature or use case.
   - Example: A “Report Generation” feature.

2. **Create a Folder**
   - Inside `src/features/`, create a new folder for your feature.
   - Example: `src/features/report-generation/`.

3. **Add a Module File**
   - Add a file like `report-generation.module.ts` to wire up everything for this slice.
   - This module might import feature-specific controllers, services, etc., and export them as needed.

4. **Add Domain Logic (If Needed)**
   - If your feature needs new domain objects (entities, value objects), consider placing them under `src/domain/`.

5. **Add Controllers or Handlers**
   - If this feature has HTTP routes, create controllers (in NestJS, for instance) within your slice folder.
   - If it’s purely background or queue-based work, add relevant message handlers or worker files in the slice folder.

6. **Add Infrastructure Integration (If Needed)**
   - If you need to integrate with an external service (like RabbitMQ), create or reference a service within `infrastructure/`. You may place feature-specific infrastructure code inside the slice for clarity, or reference common infrastructure classes from `src/infrastructure/`.

7. **Add Persistence Files (If Needed)**
   - If your feature stores data, you can either:
     - Place specialized repository or mapper code in the slice folder, or
     - Reference a shared `persistence/` class in `src/persistence/`.

8. **Share Common Logic**
   - If you discover some logic is actually cross-cutting or widely reusable, consider moving it to the `shared/` folder.

9. **Wire up the Module**
   - In your new module file, declare the controllers, providers, and any external modules you need from NestJS or your framework of choice.
   - Example (NestJS-ish pseudocode):
     ```ts
     @Module({
       imports: [...],
       controllers: [ReportGenerationController],
       providers: [GenerateReportService],
     })
     export class ReportGenerationModule {}
     ```

10. **Register Your Feature**
    - In your main module import and include your new module if it needs to be part of the main server application.
    - If your feature is only needed in the background worker, then you’d do a similar step in `worker.ts`.

11. **Test & Validate**
    - Create corresponding test files in the same folder structure or in a `tests` subfolder within your slice.
    - Ensure the new feature works end to end.

---

## Detailed Example: Creating a New Feature

Let's walk through creating a new feature called "trending-keywords" that will provide an API endpoint to get the most trending keywords over a specific time period.

### 1. Define the Command or Query Depending on Use-Case

Create a query class that represents the request parameters:

```typescript
// src/features/keywords/trending-keywords/trending-keywords.query.ts
import { ApplicationResult } from 'src/shared/application/application-result';
import { TrendingKeywordsResponse } from './trending-keywords.response';
import { Query } from '@nestjs/cqrs';
import { IsInt, IsOptional, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class TrendingKeywordsQuery extends Query<
  ApplicationResult<TrendingKeywordsResponse>
> {
  @ApiProperty({
    name: 'fromDate',
    required: false,
    description: 'Start date for trending period (ISO format)',
  })
  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @ApiProperty({
    name: 'toDate',
    required: false,
    description: 'End date for trending period (ISO format)',
  })
  @IsOptional()
  @IsDateString()
  toDate?: string;

  @ApiProperty({
    name: 'limit',
    required: false,
    description: 'Number of trending keywords to return',
    default: 10
  })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  limit?: number = 10;
}
```

### 2. Define the Response
Create a response class that defines the structure of the API response:

```typescript
import { ApiProperty } from "@nestjs/swagger";

class TrendingKeywordDTO {
  @ApiProperty()
  id: number;

  @ApiProperty()
  word: string;

  @ApiProperty()
  frequency: number;

  @ApiProperty()
  growthRate: number;
}

export class TrendingKeywordsResponse {
  @ApiProperty({ type: [TrendingKeywordDTO] })
  keywords: TrendingKeywordDTO[];

  @ApiProperty()
  period: {
    from: string;
    to: string;
  };
}
```

### 3. Implement the Command/Query Handler
Create a handler that processes the query and returns the response:

```typescript
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { TrendingKeywordsQuery } from './trending-keywords.query';
import { TrendingKeywordsResponse } from './trending-keywords.response';
import { ApplicationResult } from 'src/shared/application/application-result';
import { keywords, documents, keywordsToDocuments } from '../../../persistence/schemas';
import { and, between, eq, sql } from 'drizzle-orm';

@QueryHandler(TrendingKeywordsQuery)
export class TrendingKeywordsQueryHandler
  implements IQueryHandler<TrendingKeywordsQuery>
{
  constructor(@Inject('DB_CONTEXT') private readonly db: NodePgDatabase) {}

  async execute(
    query: TrendingKeywordsQuery,
  ): Promise<ApplicationResult<TrendingKeywordsResponse>> {
    const limit = query.limit || 10;
    const fromDate = query.fromDate ? new Date(query.fromDate) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // Default to 7 days ago
    const toDate = query.toDate ? new Date(query.toDate) : new Date(); // Default to now

    // Get keywords with their document counts in the specified period
    const trendingKeywords = await this.db
      .select({
        id: keywords.id,
        word: keywords.word,
        frequency: keywords.frequency,
        recentCount: sql<number>`count(${documents.id})`,
      })
      .from(keywords)
      .leftJoin(
        keywordsToDocuments,
        eq(keywords.id, keywordsToDocuments.keywordId)
      )
      .leftJoin(
        documents,
        eq(keywordsToDocuments.documentId, documents.id)
      )
      .where(
        and(
          between(documents.createdAt, fromDate, toDate)
        )
      )
      .groupBy(keywords.id)
      .orderBy(sql`recentCount desc`)
      .limit(limit);

    // Calculate growth rate (simplified for this example)
    const result = trendingKeywords.map(keyword => ({
      id: keyword.id,
      word: keyword.word,
      frequency: keyword.frequency,
      growthRate: keyword.recentCount / (keyword.frequency || 1) * 100
    }));

    const response = new TrendingKeywordsResponse();
    response.keywords = result;
    response.period = {
      from: fromDate.toISOString(),
      to: toDate.toISOString()
    };

    return ApplicationResult.ok(response);
  }
}
```

### 4. Create the Controller
Create a controller that exposes the API endpoint:

```typescript
import { Controller, Get, Query } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { TrendingKeywordsQuery } from './trending-keywords.query';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { TrendingKeywordsResponse } from './trending-keywords.response';

@ApiTags('keywords')
@Controller('keywords')
export class TrendingKeywordsController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get('/trending')
  @ApiOperation({
    summary: 'Get trending keywords for a specific time period',
  })
  @ApiResponse({
    status: 200,
    description: 'Trending keywords retrieved successfully',
    type: TrendingKeywordsResponse,
  })
  getTrendingKeywords(@Query() query: TrendingKeywordsQuery) {
    return this.queryBus.execute(query);
  }
}
```
### 5. Update the Keywords Module
Update the keywords module to include the new feature components:

## Benefits of This Approach

1. **Rapid Feature Development**
   With everything in one place, it’s faster to locate and modify code related to a feature.

2. **Easier Maintenance**
   Features are self-contained. Removing or updating a feature is straightforward because all artifacts reside in the same folder.

3. **Scalability**
   As the application grows, vertical slices can be expanded (split, refactored) or even extracted into microservices if needed, without refactoring unrelated features.

4. **Clear Ownership**
   In larger teams, each team or developer can “own” specific slices without interfering with other slices.

---

## Final Thoughts

Vertical slice architecture helps keep your application organized around real business features rather than technical layers. It can make the codebase more approachable for new developers, fosters better encapsulation, and leads to faster iteration.

If you have any questions or feedback on how to improve our vertical slice approach, please open an issue or start a discussion. We’re always looking to improve our codebase’s structure and maintainability.

Enjoy coding in vertical slices!
