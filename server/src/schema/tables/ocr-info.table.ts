import { AssetTable } from 'src/schema/tables/asset.table';
import { Column, ForeignKeyColumn, Index, Table } from 'src/sql-tools';

@Table({ name: 'ocr_info', primaryConstraintName: 'ocr_info_pk' })
@Index({
  name: 'ocr_info_pk',
  columns: ['assetId'],
})
@Index({
  name: 'ocr_info_text_index',
  columns: ['text'],
})
export class OcrInfoTable {
  @ForeignKeyColumn(() => AssetTable, {
    onDelete: 'CASCADE',
    primary: true,
    constraintName: 'ocr_info_assets_id_fk',
  })
  assetId!: string;

  @Column({ type: 'text', synchronize: false })
  text!: string;

  @Column({ type: 'jsonb', synchronize: false })
  ocrJson!: string;
}
