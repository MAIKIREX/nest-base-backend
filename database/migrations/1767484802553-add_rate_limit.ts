import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRateLimit1767484802553 implements MigrationInterface {
    name = 'AddRateLimit1767484802553'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "password_changed_at" TIMESTAMP WITH TIME ZONE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "password_changed_at"`);
    }

}
