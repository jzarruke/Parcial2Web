import { MigrationInterface, QueryRunner } from "typeorm";

// Pega aquí el hash generado con PasswordHasher (contraseña del admin)
const ADMIN_PASSWORD_HASH = '$scrypt$ln=17,r=8,p=1$hKUivzmhkemnvnLYJGsezA$C3jmcE9wWKtgzz9VRAHxcnnwdAmKctMozmaJp76c55I';

export class DefaultState1795451300108 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Deja la base vacía antes de insertar el estado por defecto
        await queryRunner.query(`DELETE FROM user_roles`);
        await queryRunner.query(`DELETE FROM users`);
        await queryRunner.query(`DELETE FROM roles`);

        await queryRunner.query(
            `INSERT INTO roles (role_name, description) VALUES ('admin', 'Administrador del sistema')`,
        );

        await queryRunner.query(
            `INSERT INTO users (email, password, name) VALUES ('admin@parcial.com', $1, 'Administrador')`,
            [ADMIN_PASSWORD_HASH],
        );

        await queryRunner.query(`
            INSERT INTO user_roles (user_id, role_id)
            SELECT u.id, r.id FROM users u, roles r
            WHERE u.email = 'admin@parcial.com' AND r.role_name = 'admin'
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // user_roles se borra en cascada
        await queryRunner.query(`DELETE FROM users WHERE email = 'admin@parcial.com'`);
        await queryRunner.query(`DELETE FROM roles WHERE role_name = 'admin'`);
    }

}
