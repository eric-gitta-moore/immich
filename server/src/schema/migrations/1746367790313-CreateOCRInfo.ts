import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await sql`
-- auto-generated definition
create table ocr_info
(
    "assetId" uuid not null
        constraint ocr_info_pk
            primary key
        constraint ocr_info_assets_id_fk
            references assets
            on delete cascade,
    text      text not null,
    "ocrJson" jsonb
);

create index ocr_info_text_index
    on ocr_info (text);
`.execute(db);
}

export async function down(db: Kysely<any>): Promise<void> {
  await sql`DROP TABLE "ocr_info";`.execute(db);
}
