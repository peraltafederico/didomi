import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  UpdateDateColumn,
  CreateDateColumn,
} from 'typeorm';
import { Event } from './event.entity';
import { ConsentType } from '../enums/consent-type.enum';

@Entity('consents')
export class Consent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: ConsentType,
  })
  consentId: ConsentType;

  @Column()
  enabled: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Event, (event) => event.consents, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  event: Event;
}
