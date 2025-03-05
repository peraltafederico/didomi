import { registerDecorator, ValidationOptions } from 'class-validator';
import { ConsentDto } from '../dto/consent.dto';

export function UniqueConsentIds(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'uniqueConsentIds',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: ConsentDto[]) {
          const ids = value.map((consent) => consent.id);
          return new Set(ids).size === ids.length;
        },
        defaultMessage() {
          return 'Consent IDs must be unique within the array';
        },
      },
    });
  };
}
