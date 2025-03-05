import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsObject,
  IsUUID,
  ValidateNested,
  ArrayNotEmpty,
  IsArray,
} from 'class-validator';
import { ConsentDto } from './consent.dto';
import { UniqueConsentIds } from '../validators/unique-consent-ids.validator';

class UserReferenceDto {
  @IsUUID()
  @IsNotEmpty()
  id: string;
}

export class CreateEventDto {
  @IsObject()
  @ValidateNested()
  @Type(() => UserReferenceDto)
  user: UserReferenceDto;

  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => ConsentDto)
  @UniqueConsentIds()
  consents: ConsentDto[];
}
