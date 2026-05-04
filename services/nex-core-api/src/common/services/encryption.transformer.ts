import { ValueTransformer } from 'typeorm';
import { EncryptionService } from './encryption.service';

/**
 * A custom TypeORM transformer to automatically encrypt/decrypt 
 * specific string columns based on the EncryptionService config.
 */
export class EncryptedColumn implements ValueTransformer {
  /**
   * Called before saving data to the database.
   */
  to(value: string | null | undefined): string | null | undefined {
    if (!value) return value;
    return EncryptionService.encrypt(value);
  }

  /**
   * Called after reading data from the database.
   */
  from(value: string | null | undefined): string | null | undefined {
    if (!value) return value;
    return EncryptionService.decrypt(value);
  }
}
