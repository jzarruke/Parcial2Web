import { ConflictException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto.js';
import { UpdateRoleDto } from './dto/update-role.dto.js';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './entities/role.entity.js';

@Injectable()
export class RolesService {
  constructor(@InjectRepository(Role) private readonly roles: Repository<Role>) {}

  async create(createRoleDto: CreateRoleDto) {
    if (await this.roles.exists({ where: { role_name: createRoleDto.role_name } })) throw new ConflictException('role_name ya existe');
    const role = await this.roles.save(this.roles.create(createRoleDto));
    return { message: 'Rol creado con éxito', roleId: role.id };
  }

  async findAll() {
    try {
      return await this.roles.find({ select: { id: true, role_name: true, description: true } });
    } catch {
      throw new InternalServerErrorException('Error al obtener roles');
    }
  }

  /*findOne(id: number) {
    return `This action returns a #${id} role`;
  }

  update(id: number, updateRoleDto: UpdateRoleDto) {
    return `This action updates a #${id} role`;
  }

  remove(id: number) {
    return `This action removes a #${id} role`;
  }*/
}
