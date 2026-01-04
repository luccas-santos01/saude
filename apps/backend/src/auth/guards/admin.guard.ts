import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { UsersService } from '../../users/users.service';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private usersService: UsersService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.userId;

    if (!userId) {
      throw new ForbiddenException('Acesso negado');
    }

    const user = await this.usersService.findById(userId);
    
    if (!user?.isAdmin) {
      throw new ForbiddenException('Apenas administradores podem realizar esta ação');
    }

    return true;
  }
}
