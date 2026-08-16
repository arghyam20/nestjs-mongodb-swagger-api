import { HttpStatus, Injectable } from '@nestjs/common';
import mongoose from 'mongoose';
import { ApiResponse } from 'src/common/types/api-response.type';
import {
  ContactUsListingDto,
  SendReplyDTO,
} from 'src/modules/contact-us/dto/contact-us.dto';
import { ContactUsRepository } from 'src/modules/contact-us/repositories/contact-us.repository';
import { AdminReplyRepository } from '../admin-reply/repositories';
import { MailerService } from 'src/helpers/mailer.helper';

@Injectable()
export class ContactUsAdminService {
  constructor(
    private contactUsRepository: ContactUsRepository,
    private adminReplyRepository: AdminReplyRepository,
    private readonly mailerService: MailerService,
  ) {}

  async getAll(body: ContactUsListingDto): Promise<ApiResponse> {
    const getAllContactUs = await this.contactUsRepository.getAllPaginate(body);

    if (getAllContactUs) {
      return {
        statusCode: HttpStatus.OK,
        message: 'Contact Us data fetched successfully.',
        data: getAllContactUs,
      };
    } else {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Something went wrong.',
      };
    }
  }

  async get(id: string): Promise<ApiResponse> {
    if (!id || typeof id !== 'string' || !mongoose.Types.ObjectId.isValid(id)) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Invalid ID format.',
      };
    }

    // const contactUs = await this.contactUsRepository.getByField({ _id: new mongoose.Types.ObjectId(id), isDeleted: false });

    const contactUs = await this.contactUsRepository.getDetailsCustom(id);

    if (!contactUs) {
      return {
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Contact Us not found.',
      };
    }

    return {
      statusCode: HttpStatus.OK,
      message: 'Contact Us retrieved successfully.',
      data: contactUs,
    };
  }

  async delete(id: string): Promise<ApiResponse> {
    if (!id || typeof id !== 'string' || !mongoose.Types.ObjectId.isValid(id)) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Invalid ID format.',
      };
    }

    const deleteData = await this.contactUsRepository.updateById(
      { isDeleted: true },
      id,
    );

    if (deleteData) {
      return {
        statusCode: HttpStatus.OK,
        message: 'Contact Us deleted successfully.',
      };
    } else {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Something went wrong.',
      };
    }
  }

  async sendReply(body: SendReplyDTO): Promise<ApiResponse> {
    if (
      !body.contactId ||
      typeof body.contactId !== 'string' ||
      !mongoose.Types.ObjectId.isValid(body.contactId)
    ) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Invalid Contact ID format.',
      };
    }

    const saveData = await this.adminReplyRepository.save(body);
    if (saveData && saveData._id) {
      await this.contactUsRepository.updateById(
        { isReplied: true },
        body.contactId,
      );

      const contactUsData = await this.contactUsRepository.getById(
        body.contactId,
      );
      const projectName = process.env.PROJECT_NAME
        ? process.env.PROJECT_NAME
        : 'MDM';

      const locals = {
        site_logo_url: `${process.env.BACKEND_URL}/images/logo.png`,
        name: contactUsData?.fullName as string,
        data: contactUsData,
        message: saveData.message,
        project_name: projectName,
        current_year: new Date().getFullYear(),
      };

      await this.mailerService.sendMail(
        contactUsData?.email as string,
        'Contact Us Reply',
        'contact-us-reply',
        locals,
      );

      return {
        statusCode: HttpStatus.OK,
        message: 'Reply Send successfully.',
        data: saveData,
      };
    } else {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Something went wrong.',
      };
    }
  }
}
