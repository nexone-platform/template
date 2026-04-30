import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength, MaxLength, Matches } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'รูปแบบอีเมลไม่ถูกต้อง' })
  email: string;

  @IsNotEmpty({ message: 'กรุณากรอกรหัสผ่าน' })
  @MaxLength(128, { message: 'รหัสผ่านยาวเกินไป' })  // Prevent PBKDF2 DoS
  password: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  appName?: string;
}

export class RegisterDto {
  @IsEmail({}, { message: 'รูปแบบอีเมลไม่ถูกต้อง' })
  email: string;

  @IsNotEmpty({ message: 'กรุณากรอกรหัสผ่าน' })
  @MinLength(8, { message: 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร' })
  @MaxLength(128, { message: 'รหัสผ่านยาวเกินไป' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'รหัสผ่านต้องมีตัวพิมพ์ใหญ่ ตัวพิมพ์เล็ก และตัวเลขอย่างน้อยอย่างละ 1 ตัว',
  })
  password: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  displayName?: string;

  // ⚠️ roleId removed — prevent self-escalation to admin
  // Admin role assignment must be done by an admin through user management
}

export class ChangePasswordDto {
  @IsNotEmpty({ message: 'กรุณากรอกรหัสผ่านปัจจุบัน' })
  @MaxLength(128)
  currentPassword: string;

  @IsNotEmpty({ message: 'กรุณากรอกรหัสผ่านใหม่' })
  @MinLength(8, { message: 'รหัสผ่านใหม่ต้องมีอย่างน้อย 8 ตัวอักษร' })
  @MaxLength(128)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'รหัสผ่านต้องมีตัวพิมพ์ใหญ่ ตัวพิมพ์เล็ก และตัวเลขอย่างน้อยอย่างละ 1 ตัว',
  })
  newPassword: string;
}
