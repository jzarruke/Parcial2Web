import { ConflictException, HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { User } from '../users/entities/user.entity.js';
import { PasswordHasher, TokenService } from '@nestjs/authentication';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RefreshTokenDto } from './dto/refresh-token.dto.js';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User) private readonly users: Repository<User>,
        private readonly hasher: PasswordHasher,
        private readonly tokens: TokenService,
    ) {}

    async register(dto: RegisterDto) {
        if (await this.users.exists({ where: { email: dto.email } })) throw new ConflictException('Email ya registrado');
        const hash = await this.hasher.hash(dto.password);
        const user = await this.users.save(
            this.users.create({ ...dto, password: hash }),
        );
        return { message: 'Usuario registrado con éxito', userId: user.id };
    }

    async login(dto: LoginDto) {
        const user = await this.users.findOne({ where: { email: dto.email } });
        const ok = await this.hasher.verify(dto.password, user?.password);
        if (!user || !ok) throw new UnauthorizedException('Credenciales incorrectas');
        if (!user.is_active) throw new HttpException('Usuario desactivado', HttpStatus.LOCKED);
        return this.tokens.issue(user.id);
    }

    refresh(refreshTokenDto: RefreshTokenDto) {
        return this.tokens.refresh(refreshTokenDto.refreshToken);
    }

    async logout(refreshTokenDto: RefreshTokenDto) {
        await this.tokens.revoke(refreshTokenDto.refreshToken);
    }
}
