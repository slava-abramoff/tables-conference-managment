import {
  createParamDecorator,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { User } from '@prisma/client';

export const CurrentUser = createParamDecorator(
  (
    options: { key?: keyof User; roles?: string[] },
    ctx: ExecutionContext
  ): any => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    // Проверяем, что пользователь существует
    if (!user) {
      throw new Error('User not found in request');
    }
    if (options?.roles && options.roles.length > 0) {
      const hasRole = options.roles.includes(user.role);
      if (!hasRole) {
        throw new ForbiddenException('Access denied: insufficient permissions');
      }
    }

    // Возвращаем конкретное поле пользователя или весь объект
    return options?.key ? user[options.key] : user;
  }
);
