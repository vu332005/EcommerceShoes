import { MigrationInterface, QueryRunner } from "typeorm";

export class AddChatMessages1744361000000 implements MigrationInterface {
  name = "AddChatMessages1744361000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "chat_messages" (
        "id" SERIAL PRIMARY KEY,
        "user_id" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "content" TEXT NOT NULL,
        "sender_role" VARCHAR(10) NOT NULL CHECK (sender_role IN ('user', 'admin')),
        "sender_id" INTEGER NOT NULL,
        "sender_name" VARCHAR(100) NOT NULL,
        "is_read" BOOLEAN NOT NULL DEFAULT false,
        "created_at" TIMESTAMP NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_chat_messages_user_id" ON "chat_messages" ("user_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_chat_messages_created_at" ON "chat_messages" ("created_at")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_chat_messages_created_at"`);
    await queryRunner.query(`DROP INDEX "IDX_chat_messages_user_id"`);
    await queryRunner.query(`DROP TABLE "chat_messages"`);
  }
}
