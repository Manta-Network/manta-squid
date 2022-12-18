module.exports = class Data1671332650208 {
    name = 'Data1671332650208'

    async up(db) {
        await db.query(`DROP INDEX "public"."IDX_1db0511fcdaf3622951f27d657"`)
        await db.query(`ALTER TABLE "end_of_round" DROP COLUMN "collating_rewards"`)
        await db.query(`ALTER TABLE "end_of_round" DROP COLUMN "timestamp"`)
        await db.query(`ALTER TABLE "end_of_round" ADD "round_number" integer NOT NULL`)
        await db.query(`CREATE INDEX "IDX_d44769adbfe1d78aa430b6a40a" ON "end_of_round" ("round_number") `)
    }

    async down(db) {
        await db.query(`CREATE INDEX "IDX_1db0511fcdaf3622951f27d657" ON "end_of_round" ("timestamp") `)
        await db.query(`ALTER TABLE "end_of_round" ADD "collating_rewards" numeric NOT NULL`)
        await db.query(`ALTER TABLE "end_of_round" ADD "timestamp" TIMESTAMP WITH TIME ZONE NOT NULL`)
        await db.query(`ALTER TABLE "end_of_round" DROP COLUMN "round_number"`)
        await db.query(`DROP INDEX "public"."IDX_d44769adbfe1d78aa430b6a40a"`)
    }
}
