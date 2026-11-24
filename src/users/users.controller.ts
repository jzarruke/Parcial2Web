import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe } from '@nestjs/common';
import { UsersService } from './users.service.js';
import { AssignRolesDto } from './dto/assign-roles.dto.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { Can } from '@nestjs/authorization';
import { UserPolicy } from './user.policy.js';
import { CurrentUser } from '@nestjs/authentication';
import { User } from './entities/user.entity.js';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Patch(':id/roles') @Can(UserPolicy, 'assignRoles')
  assignRoles(@Param('id', ParseUUIDPipe) id: string, @Body() assignRolesDto: AssignRolesDto) {
    return this.usersService.assignRoles(id, assignRolesDto);
  }

  @Get() @Can(UserPolicy, 'list')
  findAll() {
    return this.usersService.findAll();
  }

  @Get('me') @Can.Anyone()
  findMe(@CurrentUser() user: User) {
    return this.usersService.findMe(user.id);
  }

  /*@Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }*/
}
