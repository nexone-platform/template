import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContactSubmission } from '../entities/contact-submission.entity';
import { EmailService } from '../email/email.service';

@Injectable()
export class ContactService {
    private readonly logger = new Logger(ContactService.name);

    constructor(
        @InjectRepository(ContactSubmission)
        private readonly contactRepo: Repository<ContactSubmission>,
        private readonly emailService: EmailService,
    ) { }

    // ── Create new submission ──
    async create(data: {
        firstName: string;
        lastName: string;
        email: string;
        phone?: string;
        company?: string;
        subject: string;
        service?: string;
        message: string;
        ipAddress?: string;
        userAgent?: string;
    }): Promise<{ success: boolean; id: string; message: string }> {
        const submission = this.contactRepo.create({
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            phone: data.phone || '',
            company: data.company || '',
            subject: data.subject,
            service: data.service || '',
            message: data.message,
            ipAddress: data.ipAddress || null,
            userAgent: data.userAgent || null,
            status: 'new',
        });

        const saved = await this.contactRepo.save(submission);

        // Send email notification (non-blocking)
        this.emailService.sendContactNotification({
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            phone: data.phone,
            company: data.company,
            subject: data.subject,
            service: data.service,
            message: data.message,
            submittedAt: new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' }),
        }).then(result => {
            if (result.success) {
                this.logger.log(`Email notification sent for submission ${saved.id}`);
            } else {
                this.logger.warn(`Email notification skipped: ${result.message}`);
            }
        }).catch(err => {
            this.logger.error(`Email notification failed: ${err.message}`);
        });

        return {
            success: true,
            id: saved.id,
            message: 'ส่งข้อความสำเร็จ ทีมงานจะติดต่อกลับโดยเร็วที่สุด',
        };
    }

    // ── Get all submissions ──
    async findAll(limit = 100): Promise<ContactSubmission[]> {
        return this.contactRepo.find({
            order: { createdAt: 'DESC' },
            take: limit,
        });
    }

    // ── Get single submission ──
    async findOne(id: string): Promise<ContactSubmission | null> {
        return this.contactRepo.findOne({ where: { id } });
    }

    // ── Update status ──
    async updateStatus(
        id: string,
        status: 'new' | 'read' | 'replied' | 'archived',
    ): Promise<{ success: boolean; message: string }> {
        const submission = await this.contactRepo.findOne({ where: { id } });
        if (!submission) {
            return { success: false, message: 'ไม่พบข้อมูล' };
        }

        submission.status = status;
        await this.contactRepo.save(submission);

        return { success: true, message: 'อัปเดตสถานะสำเร็จ' };
    }

    // ── Delete submission ──
    async delete(id: string): Promise<{ success: boolean; message: string }> {
        const submission = await this.contactRepo.findOne({ where: { id } });
        if (!submission) {
            return { success: false, message: 'ไม่พบข้อมูล' };
        }

        await this.contactRepo.remove(submission);
        return { success: true, message: 'ลบข้อมูลสำเร็จ' };
    }

    // ── Stats ──
    async getStats(): Promise<{
        total: number;
        new: number;
        read: number;
        replied: number;
        archived: number;
    }> {
        const all = await this.contactRepo.find();
        return {
            total: all.length,
            new: all.filter(s => s.status === 'new').length,
            read: all.filter(s => s.status === 'read').length,
            replied: all.filter(s => s.status === 'replied').length,
            archived: all.filter(s => s.status === 'archived').length,
        };
    }
}
