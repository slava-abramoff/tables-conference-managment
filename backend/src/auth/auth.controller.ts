import { Body, Controller, Post, Req, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, TokenDto } from './auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() dto: LoginDto, @Req() request: Request) {
    return await this.authService.login(dto);
  }

  @Post('refresh')
  async refresh(@Body() dto: TokenDto) {
    return await this.authService.refresh(dto);
  }
}
