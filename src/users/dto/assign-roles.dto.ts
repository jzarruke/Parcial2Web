import { IsArray, IsString } from "class-validator";

export class AssignRolesDto {
    Body: { "roles": ["admin", "supervisor"] }
    @IsArray({ message: 'roles inválidos' })
    @IsString({ each: true, message: 'roles inválidos' })
    roles: string[];
}