import { Controller, Get, Body, Patch, Delete, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Usuários')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Obter dados do usuário atual' })
  @ApiResponse({ status: 200, description: 'Dados do usuário' })
  async getMe(@Request() req: any) {
    const user = await this.usersService.findById(req.user.userId);
    const { password: _, ...result } = user;
    return result;
  }

  @Patch('me')
  @ApiOperation({ summary: 'Atualizar dados do usuário atual' })
  @ApiResponse({ status: 200, description: 'Usuário atualizado' })
  async updateMe(@Request() req: any, @Body() updateUserDto: UpdateUserDto) {
    const user = await this.usersService.update(req.user.userId, updateUserDto);
    const { password: _, ...result } = user;
    return result;
  }

  @Delete('me')
  @ApiOperation({ summary: 'Excluir conta do usuário atual' })
  @ApiResponse({ status: 200, description: 'Conta excluída' })
  async deleteMe(@Request() req: any) {
    await this.usersService.remove(req.user.userId);
    return { message: 'Conta excluída com sucesso' };
  }
}
