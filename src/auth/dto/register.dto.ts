import { IsEmail, IsString, IsOptional, MinLength } from 'class-validator'

export class RegisterDto {
    @IsEmail({}, { message: 'Email inválido' })
    email: string;
    @IsString() @MinLength(6)
    password: string;
    @IsString()
    name: string;
    @IsOptional() @IsString()
    phone: string;
}