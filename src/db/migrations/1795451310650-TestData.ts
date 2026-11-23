import { MigrationInterface, QueryRunner } from "typeorm";

// Pega aquí el hash generado con PasswordHasher (una contraseña para todos los usuarios de prueba)
const TEST_PASSWORD_HASH = '$scrypt$ln=17,r=8,p=1$LHdM7bWw3MRkWrRMdNmhjw$2u/KBp2z6fB/nOkncM0dv5WOiC0gMEE0i39FDi3kL6s';

const TEST_EMAILS = [
    'supervisor@parcial.com',
    'usuario@parcial.com',
    'sinrol@parcial.com',
    'inactivo@parcial.com',
];

export class TestData1795451310650 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            INSERT INTO roles (role_name, description) VALUES
            ('supervisor', 'Supervisa usuarios'),
            ('user', 'Usuario estándar')
        `);

        // sinrol: probar 403 en rutas de admin. inactivo: probar 423 en el login
        await queryRunner.query(
            `INSERT INTO users (email, password, name, phone, is_active) VALUES
            ('supervisor@parcial.com', $1, 'Sofía Supervisora', '3001234567', true),
            ('usuario@parcial.com', $1, 'Uriel Usuario', NULL, true),
            ('sinrol@parcial.com', $1, 'Sara Sin Rol', NULL, true),
            ('inactivo@parcial.com', $1, 'Iván Inactivo', NULL, false)`,
            [TEST_PASSWORD_HASH],
        );

        await queryRunner.query(`
            INSERT INTO user_roles (user_id, role_id)
            SELECT u.id, r.id FROM users u JOIN roles r ON (
                (u.email = 'supervisor@parcial.com' AND r.role_name IN ('supervisor', 'user')) OR
                (u.email = 'usuario@parcial.com' AND r.role_name = 'user') OR
                (u.email = 'inactivo@parcial.com' AND r.role_name = 'user')
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // user_roles se borra en cascada
        await queryRunner.query(`DELETE FROM users WHERE email = ANY($1)`, [TEST_EMAILS]);
        await queryRunner.query(`DELETE FROM roles WHERE role_name IN ('supervisor', 'user')`);
    }

}
