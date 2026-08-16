import { InjectQueue } from '@nestjs/bull';
import { Injectable, OnModuleInit } from '@nestjs/common';
import type { Queue } from 'bull';
import { exportFile } from './exporter.helper';

@Injectable()
export class ExportQueueService implements OnModuleInit {
  constructor(@InjectQueue('export-queue') private exportQueue: Queue) {}

  async onModuleInit() {
    this.processQueue(); // Start the processing when the module is initialized
  }

  async addToQueue(fileName: string, fileType: string, data: any[]) {
    console.log('addToQueue');
    await this.exportQueue.add({ fileName, fileType, data });
  }

  async processQueue() {
    this.exportQueue.process(async (job, done) => {
      // console.log("Processing job:", job.data);
      const { fileName, fileType, data } = job.data;
      const result = await exportFile(fileName, fileType, data);
      done(null, result); // Notify Bull of job completion
    });
  }
}
