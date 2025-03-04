import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Consent } from './consent.entity';

@Entity('events')
export class Event {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.events, { onDelete: 'CASCADE' })
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => Consent, (consent) => consent.event, { cascade: true })
  consents: Consent[];
}
