import { Injectable } from '@nestjs/common';
import { Kysely, sql } from 'kysely';
import { InjectKysely } from 'nestjs-kysely';
import { DB } from 'src/db';
import { DummyValue, GenerateSql } from 'src/decorators';
import { AssetStatus, AssetType } from 'src/enum';
import { OCRResponse } from 'src/repositories/machine-learning.repository';
import { searchAssetBuilder } from 'src/utils/database';
import { paginationHelper } from 'src/utils/pagination';
import { isValidInteger } from 'src/validation';

export interface SearchAssetIdOptions {
  checksum?: Buffer;
  deviceAssetId?: string;
  id?: string;
}

export interface SearchUserIdOptions {
  deviceId?: string;
  libraryId?: string | null;
  userIds?: string[];
}

export type SearchIdOptions = SearchAssetIdOptions & SearchUserIdOptions;

export interface SearchStatusOptions {
  isArchived?: boolean;
  isEncoded?: boolean;
  isFavorite?: boolean;
  isMotion?: boolean;
  isOffline?: boolean;
  isVisible?: boolean;
  isNotInAlbum?: boolean;
  type?: AssetType;
  status?: AssetStatus;
  withArchived?: boolean;
  withDeleted?: boolean;
}

export interface SearchOneToOneRelationOptions {
  withExif?: boolean;
  withStacked?: boolean;
}

export interface SearchRelationOptions extends SearchOneToOneRelationOptions {
  withFaces?: boolean;
  withPeople?: boolean;
}

export interface SearchDateOptions {
  createdBefore?: Date;
  createdAfter?: Date;
  takenBefore?: Date;
  takenAfter?: Date;
  trashedBefore?: Date;
  trashedAfter?: Date;
  updatedBefore?: Date;
  updatedAfter?: Date;
}

export interface SearchPathOptions {
  encodedVideoPath?: string;
  originalFileName?: string;
  originalPath?: string;
  previewPath?: string;
  thumbnailPath?: string;
}

export interface SearchExifOptions {
  city?: string | null;
  country?: string | null;
  lensModel?: string | null;
  make?: string | null;
  model?: string | null;
  state?: string | null;
  description?: string | null;
  rating?: number | null;
}

export interface SearchOcrOptions {
  ocr: string;
  userIds: string[];
}

export interface SearchPeopleOptions {
  personIds?: string[];
}

export interface SearchTagOptions {
  tagIds?: string[];
}

export interface SearchOrderOptions {
  orderDirection?: 'asc' | 'desc';
}

export interface SearchPaginationOptions {
  page: number;
  size: number;
}

type BaseAssetSearchOptions = SearchDateOptions &
  SearchIdOptions &
  SearchExifOptions &
  SearchOrderOptions &
  SearchPathOptions &
  SearchStatusOptions &
  SearchUserIdOptions &
  SearchPeopleOptions &
  SearchTagOptions;

export type AssetSearchOptions = BaseAssetSearchOptions & SearchRelationOptions;

export type AssetSearchBuilderOptions = Omit<AssetSearchOptions, 'orderDirection'>;

export type SmartSearchOptions = SearchDateOptions &
  SearchOcrOptions &
  SearchExifOptions &
  SearchOneToOneRelationOptions &
  SearchStatusOptions &
  SearchUserIdOptions &
  SearchPeopleOptions &
  SearchTagOptions;

@Injectable()
export class OCRInfoRepository {
  constructor(@InjectKysely() private db: Kysely<DB>) {}

  @GenerateSql({
    params: [
      { page: 1, size: 200 },
      {
        takenAfter: DummyValue.DATE,
        ocr: DummyValue.STRING,
        lensModel: DummyValue.STRING,
        withStacked: true,
        isFavorite: true,
        userIds: [DummyValue.UUID],
      },
    ],
  })
  async searchOcr(pagination: SearchPaginationOptions, options: SmartSearchOptions) {
    if (!isValidInteger(pagination.size, { min: 1, max: 1000 })) {
      throw new Error(`Invalid value for 'size': ${pagination.size}`);
    }

    const items = await searchAssetBuilder(this.db, options)
      .innerJoin('ocr_info', 'assets.id', 'ocr_info.assetId')
      .where(sql`f_unaccent(ocr_info.text)`, 'ilike', sql`'%' || f_unaccent(${options.ocr}) || '%'`)
      .limit(pagination.size + 1)
      .offset((pagination.page - 1) * pagination.size)
      .execute();

    return paginationHelper(items, pagination.size);
  }

  async upsert(assetId: string, text: string, ocrJson: OCRResponse['result']): Promise<void> {
    await this.db
      .insertInto('ocr_info')
      .values({ assetId, text, ocrJson })
      .onConflict((oc) =>
        oc
          .column('assetId')
          .doUpdateSet((eb) => ({ text: eb.ref('excluded.text'), ocrJson: eb.ref('excluded.ocrJson') })),
      )
      .execute();
  }
}
