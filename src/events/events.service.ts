import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from './entities/event.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private eventsRepository: Repository<Event>,
    private usersService: UsersService,
  ) {}

  async create(createEventDto: CreateEventDto): Promise<Event> {
    const user = await this.usersService.findOne(createEventDto.user.id);

    const event = this.eventsRepository.create({
      user,
      consents: createEventDto.consents.map((consent) => ({
        consentId: consent.id,
        enabled: consent.enabled,
      })),
    });

    return this.eventsRepository.save(event);
  }
}
