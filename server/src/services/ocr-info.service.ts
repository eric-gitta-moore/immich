import { Injectable } from '@nestjs/common';
import { JOBS_ASSET_PAGINATION_SIZE } from 'src/constants';
import { OnJob } from 'src/decorators';
import { JobName, JobStatus, QueueName } from 'src/enum';
import { BaseService } from 'src/services/base.service';
import { JobItem, JobOf } from 'src/types';
import { isOCRSearchEnabled } from 'src/utils/misc';

@Injectable()
export class OCRInfoService extends BaseService {
  @OnJob({ name: JobName.QUEUE_OCR_SEARCH, queue: QueueName.OCR_SEARCH })
  async handleQueueOCRSearch({ force }: JobOf<JobName.QUEUE_OCR_SEARCH>): Promise<JobStatus> {
    const { machineLearning } = await this.getConfig({ withCache: false });
    if (!isOCRSearchEnabled(machineLearning)) {
      return JobStatus.SKIPPED;
    }

    let queue: JobItem[] = [];
    const assets = this.assetJobRepository.streamForOCRSearch(force);
    for await (const asset of assets) {
      queue.push({ name: JobName.OCR_SEARCH, data: { id: asset.id } });
      if (queue.length >= JOBS_ASSET_PAGINATION_SIZE) {
        await this.jobRepository.queueAll(queue);
        queue = [];
      }
    }

    await this.jobRepository.queueAll(queue);

    return JobStatus.SUCCESS;
  }

  @OnJob({ name: JobName.OCR_SEARCH, queue: QueueName.OCR_SEARCH })
  async handleOCRSearch({ id }: JobOf<JobName.OCR_SEARCH>): Promise<JobStatus> {
    const { machineLearning } = await this.getConfig({ withCache: true });
    if (!isOCRSearchEnabled(machineLearning)) {
      return JobStatus.SKIPPED;
    }

    const asset = await this.assetJobRepository.getForOCRText(id);
    if (!asset || asset.files.length !== 1) {
      return JobStatus.FAILED;
    }

    if (!asset.isVisible) {
      return JobStatus.SKIPPED;
    }

    const ocrResponse = await this.machineLearningRepository.ocrImage(machineLearning.urls, asset.files[0].path);

    if (ocrResponse.text.length === 0) {
      this.logger.warn(`OCR text is empty for asset ${asset.id}`);
      return JobStatus.SKIPPED;
    }

    await this.ocrInfoRepository.upsert(asset.id, ocrResponse.text, ocrResponse.result);

    return JobStatus.SUCCESS;
  }
}
