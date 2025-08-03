import { IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsString()
  login: string;

  @IsString()
  @MinLength(6)
  password: string;
}

export class TokenDto {
  @IsString()
  refreshToken: string;
}
