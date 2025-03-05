import { IsBoolean, IsIn, IsNotEmpty } from 'class-validator';

export class ConsentDto {
  @IsNotEmpty()
  @IsIn(['email_notifications', 'sms_notifications'], {
    message:
      'Consent ID must be either email_notifications or sms_notifications',
  })
  id: string;

  @IsBoolean()
  @IsNotEmpty()
  enabled: boolean;
}
