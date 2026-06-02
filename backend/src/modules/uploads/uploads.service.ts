import {
  BadRequestException,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import sharp from 'sharp';
import { randomUUID } from 'node:crypto';

import type { Env } from '../../config/env.schema';

const ALLOWED_MIME = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const TARGET_WIDTH = 1280;
const TARGET_HEIGHT = 720;

// Minimal shape of a Multer in-memory file. Declared locally because the
// `@types/multer` v2 package is a deprecated stub and multer's own types are
// not resolvable at top level under pnpm.
export interface UploadedImageFile {
  buffer: Buffer;
  mimetype: string;
  size: number;
  originalname: string;
}

@Injectable()
export class UploadsService {
  private readonly logger = new Logger(UploadsService.name);
  private readonly client: SupabaseClient | null;
  private readonly bucket: string;

  constructor(config: ConfigService<Env, true>) {
    const url = config.get('SUPABASE_URL', { infer: true });
    const key = config.get('SUPABASE_SERVICE_ROLE_KEY', { infer: true });
    this.bucket = config.get('SUPABASE_STORAGE_BUCKET', { infer: true });

    if (url && key) {
      this.client = createClient(url, key, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
    } else {
      this.client = null;
      this.logger.warn(
        'Supabase storage not configured (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY) — image upload is disabled.',
      );
    }
  }

  async uploadImage(file: UploadedImageFile): Promise<{ url: string }> {
    if (!file) throw new BadRequestException('file_required');
    if (!ALLOWED_MIME.includes(file.mimetype)) {
      throw new BadRequestException('unsupported_image_type');
    }
    if (file.size > MAX_BYTES) {
      throw new BadRequestException('image_too_large');
    }
    if (!this.client) {
      throw new ServiceUnavailableException('storage_not_configured');
    }

    const webp = await sharp(file.buffer)
      .resize(TARGET_WIDTH, TARGET_HEIGHT, { fit: 'cover', position: 'centre' })
      .webp({ quality: 82 })
      .toBuffer();

    const path = `courses/${randomUUID()}.webp`;
    const { error } = await this.client.storage
      .from(this.bucket)
      .upload(path, webp, { contentType: 'image/webp', upsert: false });

    if (error) {
      this.logger.error(`Supabase upload failed: ${error.message}`);
      throw new ServiceUnavailableException('upload_failed');
    }

    const { data } = this.client.storage.from(this.bucket).getPublicUrl(path);
    return { url: data.publicUrl };
  }

  /**
   * Uploads an already-rendered PDF buffer (e.g. a certificate) to storage and
   * returns its public URL. Uses upsert so re-generation overwrites cleanly.
   */
  async uploadPdf(buffer: Buffer, path: string): Promise<{ url: string }> {
    if (!this.client) {
      throw new ServiceUnavailableException('storage_not_configured');
    }

    const { error } = await this.client.storage
      .from(this.bucket)
      .upload(path, buffer, { contentType: 'application/pdf', upsert: true });

    if (error) {
      this.logger.error(`Supabase PDF upload failed: ${error.message}`);
      throw new ServiceUnavailableException('upload_failed');
    }

    const { data } = this.client.storage.from(this.bucket).getPublicUrl(path);
    return { url: data.publicUrl };
  }
}
