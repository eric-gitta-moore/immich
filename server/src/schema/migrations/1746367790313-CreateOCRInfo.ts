import { Kysely, sql } from 'kysely';

const tsConfig = process.env.DEFAULT_TEXT_SEARCH_CONFIG || 'chinese';

export async function up(db: Kysely<any>): Promise<void> {
  await sql`
ALTER DATABASE ${sql.id(process.env.DB_DATABASE_NAME || 'immich')} SET default_text_search_config = ${sql.id(tsConfig)};
`.execute(db);

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

create index ocr_info_idx_vec_text
    on ocr_info using gin (to_tsvector('${sql.id(tsConfig)}'::regconfig, text));
`.execute(db);
}

export async function down(db: Kysely<any>): Promise<void> {
  await sql`DROP TABLE "ocr_info";`.execute(db);
}
