module.exports = class Data1667691730787 {
  name = 'Data1667691730787'

  async up(db) {
    await db.query(`CREATE TABLE "delegator_account" ("id" character varying NOT NULL, "delegations" jsonb, "total_staked" numeric NOT NULL, "updated_at_block" integer NOT NULL, CONSTRAINT "PK_fb70760edb46b876dfbd7215570" PRIMARY KEY ("id"))`)
    await db.query(`CREATE TABLE "collator_account" ("id" character varying NOT NULL, "self_bond" numeric NOT NULL, "delegation_count" integer NOT NULL, "total_bond" numeric NOT NULL, "updated_at_block" integer NOT NULL, CONSTRAINT "PK_0e7c577a63b63613e74b1218bb0" PRIMARY KEY ("id"))`)
    await db.query(`CREATE TABLE "chain_state" ("id" character varying NOT NULL, "delegator_count" integer NOT NULL, "active_collator_count" integer NOT NULL, "total_staked" numeric NOT NULL, "timestamp" TIMESTAMP WITH TIME ZONE NOT NULL, "block_number" integer NOT NULL, CONSTRAINT "PK_e28e46a238ada7cbbcf711b3f6c" PRIMARY KEY ("id"))`)
    await db.query(`CREATE INDEX "IDX_b15977afb801d90143ea51cdec" ON "chain_state" ("timestamp") `)
    await db.query(`CREATE INDEX "IDX_5596acea2cba293bbdc32b577c" ON "chain_state" ("block_number") `)
    await db.query(`CREATE TABLE "end_of_round" ("id" character varying NOT NULL, "staking_rewards" numeric NOT NULL, "collating_rewards" numeric NOT NULL, "timestamp" TIMESTAMP WITH TIME ZONE NOT NULL, "block_number" integer NOT NULL, CONSTRAINT "PK_bc78ecd176b4742fa519ff28da5" PRIMARY KEY ("id"))`)
    await db.query(`CREATE INDEX "IDX_1db0511fcdaf3622951f27d657" ON "end_of_round" ("timestamp") `)
    await db.query(`CREATE INDEX "IDX_0cfba2fce9e9e237488fbbb777" ON "end_of_round" ("block_number") `)
  }

  async down(db) {
    await db.query(`DROP TABLE "delegator_account"`)
    await db.query(`DROP TABLE "collator_account"`)
    await db.query(`DROP TABLE "chain_state"`)
    await db.query(`DROP INDEX "public"."IDX_b15977afb801d90143ea51cdec"`)
    await db.query(`DROP INDEX "public"."IDX_5596acea2cba293bbdc32b577c"`)
    await db.query(`DROP TABLE "end_of_round"`)
    await db.query(`DROP INDEX "public"."IDX_1db0511fcdaf3622951f27d657"`)
    await db.query(`DROP INDEX "public"."IDX_0cfba2fce9e9e237488fbbb777"`)
  }
}
