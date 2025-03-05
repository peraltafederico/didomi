import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { EventsService } from '../events/events.service';
import { Event } from '../events/entities/event.entity';
import { Consent } from '../events/entities/consent.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Event, Consent])],
  controllers: [UsersController],
  providers: [UsersService, EventsService],
  exports: [UsersService],
})
export class UsersModule {}
