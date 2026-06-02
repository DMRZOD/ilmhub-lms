import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { Roles } from '../../common/decorators/roles.decorator';
import { UploadsService, type UploadedImageFile } from './uploads.service';

@ApiTags('uploads')
@ApiBearerAuth('jwt')
@Roles('INSTRUCTOR', 'ADMIN')
@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploads: UploadsService) {}

  @Post('image')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary:
      'Upload + resize a course image (1280x720 webp) to Supabase Storage. Returns a public URL.',
  })
  @UseInterceptors(
    FileInterceptor('file', { limits: { fileSize: 5 * 1024 * 1024 } }),
  )
  uploadImage(@UploadedFile() file: UploadedImageFile) {
    if (!file) throw new BadRequestException('file_required');
    return this.uploads.uploadImage(file);
  }
}
