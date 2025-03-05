import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../src/users/entities/user.entity';
import { Event } from '../src/events/entities/event.entity';
import { Consent } from '../src/events/entities/consent.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.TEST_DB_HOST || 'localhost',
      port: parseInt(process.env.TEST_DB_PORT || '5433'),
      username: process.env.TEST_DB_USERNAME || 'postgres',
      password: process.env.TEST_DB_PASSWORD || 'postgres',
      database: process.env.TEST_DB_NAME || 'didomi_test',
      entities: [User, Event, Consent],
      synchronize: true, // Always true for tests
      dropSchema: true, // Clear database before tests
    }),
  ],
})
export class TestDatabaseModule {}
