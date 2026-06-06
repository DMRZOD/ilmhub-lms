import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Mux from '@mux/mux-node';
import type { UnwrapWebhookEvent } from '@mux/mux-node/resources/webhooks/webhooks';

import type { Env } from '../../config/env.schema';

const TOKEN_EXPIRATION = '1h';
const TOKEN_TTL_SECONDS = 60 * 60;

export interface SignedPlaybackToken {
  token: string;
  expiresAt: number;
}

export interface DirectUpload {
  uploadId: string;
  url: string;
}

@Injectable()
export class MuxService {
  private readonly logger = new Logger(MuxService.name);
  private readonly client: Mux | null;
  private readonly signingKeyId: string | null;
  private readonly privateKey: string | null;
  private readonly webhookSecret: string | null;

  constructor(config: ConfigService<Env, true>) {
    const tokenId = config.get('MUX_TOKEN_ID', { infer: true });
    const tokenSecret = config.get('MUX_TOKEN_SECRET', { infer: true });
    this.signingKeyId =
      config.get('MUX_SIGNING_KEY_ID', { infer: true }) ?? null;
    this.privateKey = config.get('MUX_PRIVATE_KEY', { infer: true }) ?? null;
    this.webhookSecret =
      config.get('MUX_WEBHOOK_SECRET', { infer: true }) ?? null;

    if (tokenId && tokenSecret) {
      this.client = new Mux({ tokenId, tokenSecret });
    } else {
      this.client = null;
      this.logger.warn(
        'Mux credentials not configured — only PUBLIC playback IDs will work.',
      );
    }
  }

  hasSigningKeys(): boolean {
    return Boolean(this.client && this.signingKeyId && this.privateKey);
  }

  isConfigured(): boolean {
    return Boolean(this.client);
  }

  /**
   * Create a Mux Direct Upload URL. The instructor's browser PUTs the video file
   * straight to `url`; Mux then creates an asset asynchronously and fires the
   * `video.asset.ready` webhook. `passthrough` carries our lessonId back to us.
   */
  async createDirectUpload(
    corsOrigin: string,
    lessonId: string,
  ): Promise<DirectUpload> {
    if (!this.client) {
      throw new ServiceUnavailableException('mux_not_configured');
    }
    let upload;
    try {
      upload = await this.client.video.uploads.create({
        cors_origin: corsOrigin,
        new_asset_settings: {
          playback_policies: ['public'],
          video_quality: 'basic',
          passthrough: lessonId,
        },
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      // Mux's free plan caps the account at 10 assets and rejects new direct
      // uploads past that. Surface a dedicated code so the UI can explain it
      // instead of bubbling up as a generic 500.
      if (/limited to .*assets/i.test(message)) {
        this.logger.error(`Mux asset limit reached: ${message}`);
        throw new ServiceUnavailableException('mux_asset_limit_reached');
      }
      this.logger.error(`Mux direct upload failed: ${message}`);
      throw new ServiceUnavailableException('mux_upload_failed');
    }
    if (!upload.url) {
      throw new ServiceUnavailableException('mux_upload_url_missing');
    }
    return { uploadId: upload.id, url: upload.url };
  }

  /**
   * Best-effort delete of a Mux asset. Used when a lesson's video is replaced
   * or the lesson is removed, so we don't leak assets and exhaust the plan's
   * asset cap. Never throws — a missing/already-deleted asset is fine.
   */
  async deleteAsset(assetId: string): Promise<void> {
    if (!this.client) return;
    try {
      await this.client.video.assets.delete(assetId);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.warn(`Failed to delete Mux asset ${assetId}: ${message}`);
    }
  }

  /**
   * Verify (when MUX_WEBHOOK_SECRET is set) and decode a Mux webhook payload.
   * In local dev without a secret we fall back to plain JSON parsing.
   */
  async unwrapWebhook(
    rawBody: string,
    headers: Record<string, string | string[] | undefined>,
    hasClient = this.client,
  ): Promise<UnwrapWebhookEvent> {
    if (hasClient && this.webhookSecret) {
      return hasClient.webhooks.unwrap(rawBody, headers, this.webhookSecret);
    }
    return JSON.parse(rawBody) as UnwrapWebhookEvent;
  }

  get webhookVerificationEnabled(): boolean {
    return Boolean(this.client && this.webhookSecret);
  }

  async signPlaybackId(playbackId: string): Promise<SignedPlaybackToken> {
    if (!this.client || !this.signingKeyId || !this.privateKey) {
      throw new ServiceUnavailableException('mux_signing_not_configured');
    }
    const token = await this.client.jwt.signPlaybackId(playbackId, {
      keyId: this.signingKeyId,
      keySecret: this.privateKey,
      type: 'video',
      expiration: TOKEN_EXPIRATION,
    });
    return {
      token,
      expiresAt: Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS,
    };
  }
}
