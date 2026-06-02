import {
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Res,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { CertificatesService } from './certificates.service';

@ApiTags('certificates')
@ApiBearerAuth('jwt')
@Controller()
export class CertificatesController {
  constructor(private readonly certificates: CertificatesService) {}

  @Get('me/certificates')
  @ApiOperation({ summary: 'List my certificates' })
  listMy(@CurrentUser('id') userId: string) {
    return this.certificates.listMy(userId);
  }

  @Post('certificates/:id/download')
  @ApiOperation({ summary: 'Download my certificate PDF (generated on first use)' })
  async download(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    const { buffer, filename } = await this.certificates.getMyPdf(userId, id);
    this.sendPdf(res, buffer, filename);
  }

  @Public()
  @Get('certificates/verify/:number')
  @ApiOperation({ summary: 'Public certificate verification' })
  verify(@Param('number') number: string) {
    return this.certificates.verifyByNumber(number);
  }

  @Public()
  @Get('certificates/verify/:number/download')
  @ApiOperation({ summary: 'Public certificate PDF download (generated on first use)' })
  async publicDownload(@Param('number') number: string, @Res() res: Response) {
    const { buffer, filename } = await this.certificates.getPdfByNumber(number);
    this.sendPdf(res, buffer, filename);
  }

  private sendPdf(res: Response, buffer: Buffer, filename: string) {
    res.status(HttpStatus.OK);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);
  }
}
