import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await sql`
-- auto-generated definition
create table ocr_info
(
    "assetsId" uuid not null
        constraint ocr_info_pk
            primary key
        constraint ocr_info_assets_id_fk
            references assets
            on delete cascade,
    text       text not null,
    "ocrJson"  jsonb
);

alter table ocr_info
    owner to postgres;

create index ocr_info_assetsid_text_index
    on ocr_info ("assetsId", text);
`.execute(db);
}

export async function down(db: Kysely<any>): Promise<void> {
  await sql`DROP TABLE "ocr_info";`.execute(db);
}
