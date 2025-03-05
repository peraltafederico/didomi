import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module';
import { TestDatabaseModule } from './test-db.module';
import * as request from 'supertest';

export async function createTestingApp(): Promise<{
  app: INestApplication;
  dataSource: DataSource;
}> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [TestDatabaseModule, AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication();
  const dataSource = moduleFixture.get<DataSource>(DataSource);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      errorHttpStatusCode: 422,
    }),
  );
  await app.init();
  return { app, dataSource };
}

export function getRequest(app: INestApplication) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  return request(app.getHttpServer());
}
