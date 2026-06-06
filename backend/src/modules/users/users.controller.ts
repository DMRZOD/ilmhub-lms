import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';

import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import {
  CurrentUser,
  type AuthenticatedUser,
} from '../../common/decorators/current-user.decorator';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateAvatarDto } from './dto/update-avatar.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { RequestEmailChangeDto } from './dto/request-email-change.dto';
import { DeleteAccountDto } from './dto/delete-account.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get('me')
  me(@CurrentUser() user: AuthenticatedUser) {
    return user;
  }

  @Patch('me')
  updateProfile(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.users.updateProfile(userId, dto);
  }

  @Put('me/avatar')
  updateAvatar(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateAvatarDto,
  ) {
    return this.users.updateAvatar(userId, dto);
  }

  @Patch('me/password')
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @CurrentUser('id') userId: string,
    @Body() dto: ChangePasswordDto,
  ) {
    await this.users.changePassword(userId, dto);
    return { ok: true };
  }

  @Post('me/email-change')
  @HttpCode(HttpStatus.OK)
  async requestEmailChange(
    @CurrentUser('id') userId: string,
    @Body() dto: RequestEmailChangeDto,
  ) {
    await this.users.requestEmailChange(userId, dto);
    return { ok: true };
  }

  @Public()
  @Get('me/email-change/confirm')
  async confirmEmailChange(@Query('token') token: string) {
    await this.users.confirmEmailChange(token);
    return { ok: true };
  }

  @Delete('me')
  @HttpCode(HttpStatus.OK)
  async deleteAccount(
    @CurrentUser('id') userId: string,
    @Body() dto: DeleteAccountDto,
  ) {
    await this.users.deleteAccount(userId, dto);
    return { ok: true };
  }

  @Roles('STUDENT', 'INSTRUCTOR', 'ADMIN')
  @Get('me/dashboard')
  getDashboard(@CurrentUser('id') userId: string) {
    return this.users.getDashboard(userId);
  }

  @Public()
  @Get(':id/profile')
  getPublicProfile(@Param('id') id: string) {
    return this.users.getPublicProfile(id);
  }

}
