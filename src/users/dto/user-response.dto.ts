export class UserResponseDto {
  id: string;
  email: string;
  consents: {
    id: string;
    enabled: boolean;
  }[];
}
