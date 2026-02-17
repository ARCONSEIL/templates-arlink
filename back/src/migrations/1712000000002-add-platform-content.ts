import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPlatformContent1712000000002 implements MigrationInterface {
  name = 'AddPlatformContent1712000000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "platform_content_type_enum" AS ENUM ('collection_card', 'news_banner', 'ad_card')
    `);

    await queryRunner.query(`
      CREATE TABLE "platform_content" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "type" "platform_content_type_enum" NOT NULL,
        "title" character varying(255) NOT NULL,
        "description" text,
        "icon" character varying(20),
        "image" text,
        "link" text,
        "badge_text" character varying(100),
        "is_active" boolean NOT NULL DEFAULT true,
        "sort_order" integer NOT NULL DEFAULT 0,
        "metadata" jsonb NOT NULL DEFAULT '{}',
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_platform_content" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_platform_content_type_active" ON "platform_content" ("type", "is_active")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_platform_content_type_active"`);
    await queryRunner.query(`DROP TABLE "platform_content"`);
    await queryRunner.query(`DROP TYPE "platform_content_type_enum"`);
  }
}
