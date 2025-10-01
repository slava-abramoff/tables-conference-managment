import {
  Injectable,
  OnApplicationBootstrap,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Role } from '@prisma/client';
import { CreateUserDto } from 'src/users/dto/create.dto';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService implements OnApplicationBootstrap {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}

  async validateUser(login: string, password: string) {
    const user = await this.usersService.getOne(login);
    if (user && user.password === password) {
      return user;
    }
    throw new UnauthorizedException('Invalid credentials');
  }

  async login(user: any) {
    const payload = { sub: user.id, role: user.role, login: user.login };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '15m',
    });
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '7d',
    });

    return {
      user,
      accessToken,
      refreshToken,
    };
  }

  async refresh(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      const user = await this.usersService.getById(payload.sub);

      if (!user) throw new UnauthorizedException();

      return this.login(user);
    } catch (e) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async onApplicationBootstrap() {
    try {
      const password = this.configService.get<string>('ADMIN_PASSWORD');
      const name = this.configService.get<string>('ADMIN_NAME');
      const login = this.configService.get<string>('ADMIN_LOGIN');
      const email = this.configService.get<string>('ADMIN_EMAIL');

      if (!password || !name || !login || !email) {
        return;
      }

      const admin: CreateUserDto = {
        password,
        name,
        login,
        email,
        role: Role.admin,
      };

      const user = await this.usersService.create(admin);
      if (!user) {
        return;
      }
    } catch (error) {
      console.log('Администратор уже существует');
    }
  }
}
