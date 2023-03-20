module.exports = class Data1679352678264 {
    name = 'Data1679352678264'

    async up(db) {
        await db.query(`CREATE TABLE "to_private" ("id" character varying NOT NULL, "block_number" integer NOT NULL, "timestamp" TIMESTAMP WITH TIME ZONE NOT NULL, "source" text NOT NULL, "asset" jsonb NOT NULL, CONSTRAINT "PK_da8bb7a573a3cf38ebc51f87420" PRIMARY KEY ("id"))`)
        await db.query(`CREATE INDEX "IDX_b8b7ac5cea124987095f3025c1" ON "to_private" ("block_number") `)
        await db.query(`CREATE INDEX "IDX_51b8f0037ef111d862b51ee5ef" ON "to_private" ("timestamp") `)
        await db.query(`CREATE TABLE "to_public" ("id" character varying NOT NULL, "block_number" integer NOT NULL, "timestamp" TIMESTAMP WITH TIME ZONE NOT NULL, "sink" text NOT NULL, "asset" jsonb NOT NULL, CONSTRAINT "PK_d51b3f07ad9ecfc5ae88161acb5" PRIMARY KEY ("id"))`)
        await db.query(`CREATE INDEX "IDX_73fa3784c96b36244242f2faf1" ON "to_public" ("block_number") `)
        await db.query(`CREATE INDEX "IDX_a3f80afccfcb6c74f98c3cd20e" ON "to_public" ("timestamp") `)
        await db.query(`CREATE TABLE "private_transfer" ("id" character varying NOT NULL, "block_number" integer NOT NULL, "timestamp" TIMESTAMP WITH TIME ZONE NOT NULL, "account" text, CONSTRAINT "PK_5a39c140f217db2f4a2df953808" PRIMARY KEY ("id"))`)
        await db.query(`CREATE INDEX "IDX_82e9b18b7ce80636c6c2a75c11" ON "private_transfer" ("block_number") `)
        await db.query(`CREATE INDEX "IDX_8212440c329762690e053c08fb" ON "private_transfer" ("timestamp") `)
    }

    async down(db) {
        await db.query(`DROP TABLE "to_private"`)
        await db.query(`DROP INDEX "public"."IDX_b8b7ac5cea124987095f3025c1"`)
        await db.query(`DROP INDEX "public"."IDX_51b8f0037ef111d862b51ee5ef"`)
        await db.query(`DROP TABLE "to_public"`)
        await db.query(`DROP INDEX "public"."IDX_73fa3784c96b36244242f2faf1"`)
        await db.query(`DROP INDEX "public"."IDX_a3f80afccfcb6c74f98c3cd20e"`)
        await db.query(`DROP TABLE "private_transfer"`)
        await db.query(`DROP INDEX "public"."IDX_82e9b18b7ce80636c6c2a75c11"`)
        await db.query(`DROP INDEX "public"."IDX_8212440c329762690e053c08fb"`)
    }
}
