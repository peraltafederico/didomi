import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  VirtualColumn,
} from 'typeorm';
import { Event } from '../../events/entities/event.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @OneToMany(() => Event, (event) => event.user)
  events: Event[];

  @VirtualColumn({
    query: (alias) => `
      SELECT COALESCE(json_agg(agg), '[]')
      FROM (
        SELECT DISTINCT ON ("consent"."consent_id")
          "consent"."consent_id" AS "id",
          "consent"."enabled" AS "enabled"
        FROM "consents" "consent"
        INNER JOIN "events" "event" 
          ON "event"."id" = "consent"."event_id"
        WHERE "event"."user_id" = ${alias}.id
        ORDER BY 
          "consent"."consent_id" ASC,
          "consent"."created_at" DESC
      ) AS agg
    `,
  })
  consents: { id: string; enabled: boolean }[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
