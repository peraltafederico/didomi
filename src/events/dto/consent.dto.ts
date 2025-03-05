import { IsEnum, IsBoolean } from 'class-validator';
import { ConsentType } from '../enums/consent-type.enum';

export class ConsentDto {
  @IsEnum(ConsentType)
  id: ConsentType;

  @IsBoolean()
  enabled: boolean;
}
