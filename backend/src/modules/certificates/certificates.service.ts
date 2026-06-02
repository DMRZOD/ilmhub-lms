import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { NotificationType, Prisma } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { UploadsService } from '../uploads/uploads.service';
import { CertificatePdfService } from './certificate-pdf.service';
import { generateCertificateNumber } from './certificate-number';

const certWithRelations = {
  include: {
    user: { select: { name: true } },
    course: {
      select: { title: true, instructor: { select: { name: true } } },
    },
  },
} satisfies Prisma.CertificateDefaultArgs;

type CertWithRelations = Prisma.CertificateGetPayload<typeof certWithRelations>;

@Injectable()
export class CertificatesService {
  private readonly logger = new Logger(CertificatesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly pdf: CertificatePdfService,
    private readonly uploads: UploadsService,
    private readonly notifications: NotificationsService,
  ) {}

  async listMy(userId: string) {
    const rows = await this.prisma.certificate.findMany({
      where: { userId },
      orderBy: { issuedAt: 'desc' },
      include: {
        course: {
          select: {
            id: true,
            slug: true,
            title: true,
            thumbnailUrl: true,
            durationMinutes: true,
            instructor: { select: { name: true } },
          },
        },
      },
    });

    return {
      items: rows.map((row) => ({
        id: row.id,
        certificateNumber: row.certificateNumber,
        issuedAt: row.issuedAt.toISOString(),
        course: row.course,
      })),
    };
  }

  // ---------- Issuance (called on course completion) ----------

  /**
   * Idempotently issues a certificate for a completed course: creates the row +
   * number, links the enrollment, and notifies the student. The PDF itself is
   * built lazily on first download/verify (see {@link ensurePdf}).
   */
  async issueForCompletion(userId: string, courseId: string): Promise<void> {
    const existing = await this.prisma.certificate.findFirst({
      where: { userId, courseId },
      select: { id: true },
    });
    if (existing) return;

    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      select: { title: true },
    });
    if (!course) return;

    const cert = await this.createWithUniqueNumber(userId, courseId);

    await this.prisma.enrollment.updateMany({
      where: { userId, courseId },
      data: { certificateId: cert.id },
    });

    await this.notifications.createAndNotify(userId, {
      type: NotificationType.CERTIFICATE_ISSUED,
      title: 'Tabriklaymiz! Sertifikat tayyor',
      body: `"${course.title}" kursini muvaffaqiyatli tugatdingiz. Sertifikatingizni yuklab oling.`,
      link: '/student/certificates',
    });
  }

  private async createWithUniqueNumber(userId: string, courseId: string) {
    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        return await this.prisma.certificate.create({
          data: { userId, courseId, certificateNumber: generateCertificateNumber() },
        });
      } catch (err) {
        if (
          err instanceof Prisma.PrismaClientKnownRequestError &&
          err.code === 'P2002'
        ) {
          continue; // certificateNumber collision — retry with a new number
        }
        throw err;
      }
    }
    throw new Error('certificate_number_generation_failed');
  }

  // ---------- Download / verification ----------

  async getMyPdf(userId: string, certificateId: string) {
    const cert = await this.getCert({ id: certificateId });
    if (!cert) throw new NotFoundException('certificate_not_found');
    if (cert.userId !== userId) {
      throw new ForbiddenException('not_your_certificate');
    }
    return this.toDownload(cert);
  }

  async getPdfByNumber(certificateNumber: string) {
    const cert = await this.getCert({ certificateNumber });
    if (!cert) throw new NotFoundException('certificate_not_found');
    return this.toDownload(cert);
  }

  async verifyByNumber(certificateNumber: string) {
    const cert = await this.getCert({ certificateNumber });
    if (!cert) {
      return { valid: false as const, certificateNumber };
    }
    return {
      valid: true as const,
      certificateNumber: cert.certificateNumber,
      studentName: cert.user.name,
      courseTitle: cert.course.title,
      instructorName: cert.course.instructor.name,
      issuedAt: cert.issuedAt.toISOString(),
      pdfUrl: cert.pdfUrl,
    };
  }

  private getCert(where: Prisma.CertificateWhereUniqueInput) {
    return this.prisma.certificate.findUnique({ where, ...certWithRelations });
  }

  private async toDownload(cert: CertWithRelations) {
    const buffer = await this.ensurePdf(cert);
    return { buffer, filename: `ilmhub-${cert.certificateNumber}.pdf` };
  }

  /** Returns the certificate PDF bytes, generating + caching them on first use. */
  private async ensurePdf(cert: CertWithRelations): Promise<Buffer> {
    if (cert.pdfUrl) {
      try {
        const res = await fetch(cert.pdfUrl);
        if (res.ok) return Buffer.from(await res.arrayBuffer());
        this.logger.warn(
          `Cached certificate PDF unreachable (${cert.pdfUrl}) — regenerating`,
        );
      } catch {
        this.logger.warn(
          `Cached certificate PDF fetch failed (${cert.pdfUrl}) — regenerating`,
        );
      }
    }

    const buffer = await this.pdf.generatePdf({
      studentName: cert.user.name,
      courseTitle: cert.course.title,
      instructorName: cert.course.instructor.name,
      issuedAt: cert.issuedAt,
      certificateNumber: cert.certificateNumber,
    });

    try {
      const { url } = await this.uploads.uploadPdf(
        buffer,
        `certificates/${cert.certificateNumber}.pdf`,
      );
      await this.prisma.certificate.update({
        where: { id: cert.id },
        data: { pdfUrl: url },
      });
    } catch (err) {
      // Storage unconfigured/unavailable — still serve the freshly built bytes.
      this.logger.warn(
        `Certificate PDF not persisted: ${(err as Error).message}`,
      );
    }

    return buffer;
  }
}
