import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from './entities/event.entity';
import { Consent } from './entities/consent.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private eventsRepository: Repository<Event>,
    @InjectRepository(Consent)
    private consentsRepository: Repository<Consent>,
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

  async getByUserId(
    userId: string,
  ): Promise<{ id: string; enabled: boolean }[]> {
    const consents = await this.consentsRepository
      .createQueryBuilder('consent')
      .distinctOn(['consent.consentId'])
      .innerJoin('consent.event', 'event')
      .where('event.userId = :userId', { userId })
      .orderBy('consent.consentId', 'ASC')
      .addOrderBy('consent.createdAt', 'DESC')
      .getMany();

    return consents.map((consent) => ({
      id: consent.consentId,
      enabled: consent.enabled,
    }));
  }
}
