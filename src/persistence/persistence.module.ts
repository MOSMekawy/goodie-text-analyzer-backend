import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'DATABASE_POOL',
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return new Pool({
          host: configService.get('DB_HOST', 'localhost'),
          port: configService.get('DB_PORT', 5432),
          user: configService.get('DB_USERNAME', 'postgres'),
          password: configService.get('DB_PASSWORD', 'postgres'),
          database: configService.get('DB_DATABASE', 'public'),
        });
      },
    },
    {
      provide: 'DB_CONTEXT',
      inject: ['DATABASE_POOL'],
      useFactory: (pool: Pool) => {
        return drizzle(pool);
      },
    },
  ],
  exports: ['DB_CONTEXT', 'DATABASE_POOL'],
})
export class PersistenceModule {}
