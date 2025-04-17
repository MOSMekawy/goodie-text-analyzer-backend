import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';
import { join } from 'path';
import * as fs from 'fs';
import { keywords } from './schemas/keywords';
import { Keyword } from '../domain/entities';
import { sources } from './schemas';

async function main() {
  const pool = new Pool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
  });

  const db = drizzle(pool);

  console.log('Running migrations...');

  await migrate(db, { migrationsFolder: join(__dirname, '../../drizzle') });

  console.log('Migrations completed successfully');

  // Seed data after migrations
  console.log('Seeding keywords...');

  // Read the JSON file
  const keywordsFilePath = join(__dirname, 'seeds', 'keywords.json');
  const keywordsData = fs.readFileSync(keywordsFilePath, 'utf8');
  const parsedKeywords = JSON.parse(keywordsData) as Keyword[]; // Assuming the JSON data matches the Keyword type;

  console.log(`Seeding ${parsedKeywords.length} keywords...`);

  const seedData = parsedKeywords.map((keyword) => ({
    word: keyword.word,
    frequency: 0,
    positiveSentimentDocumentsCount: 0,
    negativeSentimentDocumentsCount: 0,
    neutralSentimentDocumentsCount: 0,
  }));

  await db.insert(keywords).values(seedData).onConflictDoNothing();

  console.log('Keywords seeded successfully!');

  const sourcesFilePath = join(__dirname, 'seeds', 'sources.json');
  const sourcesData = fs.readFileSync(sourcesFilePath, 'utf8');
  const parsedSources = JSON.parse(sourcesData) as { name: string }[];

  console.log(`Seeding ${parsedSources.length} sources...`);

  await db.insert(sources).values(parsedSources).onConflictDoNothing();

  console.log('Sources seeded successfully!');

  await pool.end();
}

main().catch((err) => {
  console.error('Migration or Seed operation failed.');
  console.error(err);
  process.exit(1);
});
