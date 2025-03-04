import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Event } from './event.entity';

@Entity('consents')
export class Consent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Event, (event) => event.consents, { onDelete: 'CASCADE' })
  event: Event;

  @Column()
  consentId: string;

  @Column()
  enabled: boolean;
}
