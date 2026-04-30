import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { SiteSettingsService } from '../site-settings/site-settings.service';

export interface ContactEmailData {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    company?: string;
    subject: string;
    service?: string;
    message: string;
    submittedAt: string;
}

@Injectable()
export class EmailService {
    private readonly logger = new Logger(EmailService.name);

    constructor(private readonly settings: SiteSettingsService) {}

    /** Send contact form notification email */
    async sendContactNotification(data: ContactEmailData): Promise<{ success: boolean; message: string }> {
        try {
            // Check if email is enabled
            const enabled = await this.settings.get('email_enabled');
            if (enabled !== 'true') {
                this.logger.log('Email sending is disabled, skipping notification');
                return { success: false, message: 'Email sending is disabled' };
            }

            // Get SMTP config from settings
            const smtpHost = await this.settings.get('smtp_host');
            const smtpPort = parseInt(await this.settings.get('smtp_port') || '587');
            const smtpUser = await this.settings.get('smtp_user');
            const smtpPassword = await this.settings.get('smtp_password');
            const fromName = await this.settings.get('smtp_from_name') || 'TechBiz Convergence';
            const fromEmail = await this.settings.get('smtp_from_email') || smtpUser;
            const notificationEmail = await this.settings.get('contact_notification_email');

            if (!smtpHost || !smtpUser || !smtpPassword) {
                this.logger.warn('SMTP settings not configured');
                return { success: false, message: 'SMTP settings not configured' };
            }

            if (!notificationEmail) {
                this.logger.warn('Notification email not set');
                return { success: false, message: 'Notification email not set' };
            }

            // Create transporter
            const transporter = nodemailer.createTransport({
                host: smtpHost,
                port: smtpPort,
                secure: smtpPort === 465,
                auth: {
                    user: smtpUser,
                    pass: smtpPassword,
                },
            });

            // Build HTML email content
            const html = this.buildContactEmailHtml(data);

            // Send email
            const recipients = notificationEmail.split(',').map(e => e.trim()).filter(Boolean);

            await transporter.sendMail({
                from: `"${fromName}" <${fromEmail}>`,
                to: recipients.join(', '),
                subject: `[TechBiz] แจ้งเตือน: ข้อความใหม่จากเว็บไซต์ — ${data.subject}`,
                html,
                replyTo: data.email,
            });

            this.logger.log(`Contact notification email sent to: ${recipients.join(', ')}`);
            return { success: true, message: 'Email sent successfully' };

        } catch (error) {
            this.logger.error('Failed to send contact notification email', error);
            return { success: false, message: `Failed to send email: ${error.message}` };
        }
    }

    /** Build HTML template for contact notification */
    private buildContactEmailHtml(data: ContactEmailData): string {
        const fullName = `${data.firstName} ${data.lastName}`;
        const infoRows = [
            { label: 'ชื่อ-นามสกุล', value: fullName, icon: 'U' },
            { label: 'อีเมล', value: `<a href="mailto:${data.email}" style="color:#4a90e2;text-decoration:none;">${data.email}</a>`, icon: '@' },
            ...(data.phone ? [{ label: 'เบอร์โทร', value: data.phone, icon: 'T' }] : []),
            ...(data.company ? [{ label: 'บริษัท / องค์กร', value: data.company, icon: 'B' }] : []),
            ...(data.service ? [{ label: 'บริการที่สนใจ', value: data.service, icon: 'S' }] : []),
        ];

        const infoRowsHtml = infoRows.map(row => `
                <tr>
                    <td style="padding:14px 16px;border-bottom:1px solid #f1f5f9;width:44px;vertical-align:top;">
                        <div style="width:32px;height:32px;border-radius:8px;background:#eef4fd;color:#4a90e2;font-size:14px;font-weight:700;text-align:center;line-height:32px;">${row.icon}</div>
                    </td>
                    <td style="padding:14px 0;border-bottom:1px solid #f1f5f9;vertical-align:top;">
                        <div style="font-size:11px;color:#94a3b8;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:2px;">${row.label}</div>
                        <div style="font-size:14px;color:#1e293b;font-weight:600;line-height:1.5;">${row.value}</div>
                    </td>
                </tr>`).join('');

        return `
<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>แจ้งเตือนข้อความใหม่</title>
</head>
<body style="margin:0;padding:0;background-color:#f0f4f8;font-family:'Sarabun','Segoe UI',Tahoma,Geneva,sans-serif;-webkit-font-smoothing:antialiased;">
    <!-- Outer wrapper -->
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f0f4f8;">
        <tr>
            <td align="center" style="padding:40px 16px;">
                <!-- Main card -->
                <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width:600px;width:100%;">

                    <!-- Logo / Brand bar -->
                    <tr>
                        <td style="padding:0 0 16px;text-align:center;">
                            <table role="presentation" cellspacing="0" cellpadding="0" align="center">
                                <tr>
                                    <td style="width:36px;height:36px;background:#4a90e2;border-radius:10px;text-align:center;vertical-align:middle;">
                                        <span style="color:#ffffff;font-size:18px;font-weight:800;line-height:36px;">T</span>
                                    </td>
                                    <td style="padding-left:10px;">
                                        <span style="font-size:16px;font-weight:700;color:#1e293b;letter-spacing:-0.01em;">TechBiz Convergence</span>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Header -->
                    <tr>
                        <td style="background:linear-gradient(135deg,#4a90e2 0%,#3672b9 100%);border-radius:16px 16px 0 0;padding:40px 36px 32px;text-align:center;">
                            <!-- Icon circle -->
                            <div style="width:56px;height:56px;margin:0 auto 16px;background:rgba(255,255,255,0.2);border-radius:14px;line-height:56px;text-align:center;">
                                <span style="color:#ffffff;font-size:24px;">&#9993;</span>
                            </div>
                            <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:800;line-height:1.3;">แจ้งเตือนข้อความใหม่</h1>
                            <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;line-height:1.5;">มีผู้ติดต่อผ่านแบบฟอร์มหน้าเว็บไซต์</p>
                        </td>
                    </tr>

                    <!-- Body -->
                    <tr>
                        <td style="background:#ffffff;padding:0;border-radius:0 0 16px 16px;box-shadow:0 4px 24px rgba(0,0,0,0.06);">

                            <!-- Subject bar -->
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                                <tr>
                                    <td style="padding:24px 36px 20px;">
                                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f8faff;border:1px solid #e8eff8;border-radius:12px;">
                                            <tr>
                                                <td style="padding:16px 20px;">
                                                    <div style="font-size:11px;color:#94a3b8;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:4px;">หัวข้อ</div>
                                                    <div style="font-size:17px;color:#1e293b;font-weight:700;line-height:1.4;">${data.subject}</div>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>

                            <!-- Contact Info -->
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                                <tr>
                                    <td style="padding:0 36px;">
                                        <div style="font-size:11px;color:#94a3b8;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:12px;">ข้อมูลผู้ติดต่อ</div>
                                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">${infoRowsHtml}
                                        </table>
                                    </td>
                                </tr>
                            </table>

                            <!-- Message -->
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                                <tr>
                                    <td style="padding:24px 36px 8px;">
                                        <div style="font-size:11px;color:#94a3b8;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:12px;">ข้อความ</div>
                                        <div style="background:#f8fafc;border:1px solid #e8eff8;border-radius:12px;padding:20px;font-size:14px;color:#334155;line-height:1.8;white-space:pre-wrap;">${data.message}</div>
                                    </td>
                                </tr>
                            </table>

                            <!-- Action Button -->
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                                <tr>
                                    <td style="padding:24px 36px;text-align:center;">
                                        <a href="mailto:${data.email}?subject=Re: ${data.subject}" style="display:inline-block;padding:14px 36px;background:#4a90e2;color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;border-radius:10px;letter-spacing:0.02em;">ตอบกลับ ${data.firstName}</a>
                                    </td>
                                </tr>
                            </table>

                            <!-- Divider + Timestamp -->
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                                <tr>
                                    <td style="padding:0 36px 24px;">
                                        <div style="border-top:1px solid #f1f5f9;padding-top:16px;text-align:center;">
                                            <span style="font-size:12px;color:#94a3b8;">ส่งเมื่อ: ${data.submittedAt}</span>
                                        </div>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="padding:24px 0;text-align:center;">
                            <p style="margin:0 0 4px;font-size:12px;color:#94a3b8;line-height:1.6;">อีเมลนี้ถูกส่งอัตโนมัติจากระบบแจ้งเตือน</p>
                            <p style="margin:0;font-size:12px;color:#b0bec5;">&copy; ${new Date().getFullYear()} TechBiz Convergence Co., Ltd. All rights reserved.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;
    }
}
