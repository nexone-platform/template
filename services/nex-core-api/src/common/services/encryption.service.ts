import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import { SystemConfig } from '../../entities/system-config.entity';

@Injectable()
export class EncryptionService implements OnModuleInit {
  private readonly logger = new Logger(EncryptionService.name);
  
  // Cache the config state.
  private static isEncryptionEnabled: boolean = false;
  
  // 32-bytes key for AES-256
  private static readonly ALGORITHM = 'aes-256-gcm';
  private static readonly PREFIX = '[ENC]:';

  constructor(
    @InjectRepository(SystemConfig)
    private readonly configRepository: Repository<SystemConfig>,
  ) {}

  async onModuleInit() {
    await this.refreshConfig();
    
    // Poll the configuration every 30 seconds to support real-time toggle
    setInterval(() => {
      this.refreshConfig();
    }, 30000);
  }

  private async refreshConfig() {
    try {
      const config = await this.configRepository.findOne({
        where: { systemKey: 'ENABLE_DB_ENCRYPT', isActive: true },
      });

      if (config) {
        EncryptionService.isEncryptionEnabled = config.systemValue?.toLowerCase() === 'true';
      } else {
        // If not found, default to false or whatever is in .env
        EncryptionService.isEncryptionEnabled = process.env.ENABLE_DB_ENCRYPT === 'true';
      }
    } catch (error) {
      this.logger.error(`Failed to refresh encryption config: ${error.message}`);
    }
  }

  /**
   * Encrypts text if encryption is enabled.
   */
  public static encrypt(text: string): string {
    if (!text) return text;
    
    // If it's already encrypted, don't encrypt it again
    if (text.startsWith(this.PREFIX)) return text;
    
    // If toggle is off, store plain text
    if (!this.isEncryptionEnabled) return text;

    try {
      // Must have ENCRYPTION_KEY in .env, fallback for dev
      const secret = process.env.ENCRYPTION_KEY || '0123456789abcdef0123456789abcdef';
      // ensure exactly 32 bytes
      const key = Buffer.from(secret.padEnd(32, '0').slice(0, 32), 'utf-8');
      
      const iv = crypto.randomBytes(12);
      const cipher = crypto.createCipheriv(this.ALGORITHM, key, iv);
      
      let encrypted = cipher.update(text, 'utf8', 'base64');
      encrypted += cipher.final('base64');
      
      const authTag = cipher.getAuthTag().toString('base64');
      
      // Format: [ENC]:iv:authTag:encryptedText
      return `${this.PREFIX}${iv.toString('base64')}:${authTag}:${encrypted}`;
    } catch (e) {
      console.error('Encryption error:', e);
      return text;
    }
  }

  /**
   * Decrypts text if it has the encryption prefix.
   */
  public static decrypt(encryptedText: string): string {
    if (!encryptedText) return encryptedText;
    
    // If it doesn't have the prefix, it's plain text (or encryption was disabled)
    if (!encryptedText.startsWith(this.PREFIX)) return encryptedText;

    try {
      const parts = encryptedText.substring(this.PREFIX.length).split(':');
      if (parts.length !== 3) return encryptedText; // Malformed, return as is
      
      const [ivBase64, authTagBase64, encryptedBase64] = parts;
      
      const secret = process.env.ENCRYPTION_KEY || '0123456789abcdef0123456789abcdef';
      const key = Buffer.from(secret.padEnd(32, '0').slice(0, 32), 'utf-8');
      const iv = Buffer.from(ivBase64, 'base64');
      const authTag = Buffer.from(authTagBase64, 'base64');
      
      const decipher = crypto.createDecipheriv(this.ALGORITHM, key, iv);
      decipher.setAuthTag(authTag);
      
      let decrypted = decipher.update(encryptedBase64, 'base64', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (e) {
      console.error('Decryption error:', e);
      return encryptedText; // fallback to raw string if fails
    }
  }
}
