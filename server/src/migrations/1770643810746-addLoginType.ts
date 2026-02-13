import { MigrationInterface, QueryRunner } from "typeorm";

export class AddLoginType1770643810746 implements MigrationInterface {
    name = 'AddLoginType1770643810746'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "login_type" character varying(20) NOT NULL DEFAULT 'local'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "login_type"`);
    }

}
