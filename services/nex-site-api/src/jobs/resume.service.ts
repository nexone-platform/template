import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool } from 'pg';

export interface ResumeSubmission {
    jobTitle: string;
    personal: {
        title: string;
        gender: string;
        firstName: string;
        lastName: string;
        phone: string;
        email: string;
        position: string;
        location: string;
    };
    skills: Array<{ hardSkill: string; softSkill: string }>;
    educations: Array<{
        institution: string;
        subject: string;
        startDate: string;
        completeDate: string;
        degree: string;
        grade: string;
    }>;
    experiences: Array<{
        companyName: string;
        location: string;
        jobPosition: string;
        periodFrom: string;
        periodTo: string;
    }>;
    submittedAt: string;
}

@Injectable()
export class ResumeService {
    private readonly logger = new Logger(ResumeService.name);
    private pool: Pool;

    constructor(private configService: ConfigService) {
        // Uses same external DB pool as ExternalJobsService
        this.pool = new Pool({
            host: this.configService.get('EXTERNAL_DB_HOST', 'localhost'),
            port: Number(this.configService.get('EXTERNAL_DB_PORT', 5432)),
            user: this.configService.get('EXTERNAL_DB_USER', 'postgres'),
            password: this.configService.get('EXTERNAL_DB_PASSWORD', 'qwerty'),
            database: this.configService.get('EXTERNAL_DB_NAME', 'postgres'),
        });
    }

    // Map title prefix string → integer code
    private mapTitle(prefix: string): number {
        const map: Record<string, number> = { 'Mr.': 1, 'Mrs.': 2, 'Ms.': 3, 'Dr.': 4 };
        return map[prefix] || 0;
    }

    // Map position name → integer code (index-based from POSITIONS list)
    private mapPosition(pos: string): number {
        const POSITIONS = [
            'IOS', 'General Manager', 'Admin Officer', 'Accountant',
            'Junior Developer', 'Senior Developer', 'System Analyst',
            'Developer', 'Chief Financial Officer', 'Chief Technology Officer',
            'Chief Executive Officer', 'Chief Information Officer',
            'Sales Representative', 'Finance Officer', 'Accounting Manager',
            'Sale & Marketing Manager', 'HR Manager', 'Senior HR',
            'Recruiter / Talent Acquisition', 'Administrator / Admin Officer', 'IT Support',
        ];
        const idx = POSITIONS.indexOf(pos);
        return idx >= 0 ? idx + 1 : 0;
    }

    // Map location name → integer code
    private mapLocation(loc: string): number {
        const LOCATIONS = [
            'บริษัท มิตซูบิชิมอเตอร์ส (ประเทศไทย) จำกัด',
            'บริษัท อินฟอร์เมติค แอดวานซ์ เทคโนโลยี จำกัด',
            'บริษัท ยูแทคไทย จำกัด',
        ];
        const idx = LOCATIONS.indexOf(loc);
        return idx >= 0 ? idx + 1 : 0;
    }

    /**
     * Insert a resume/application into the external DB table:
     * schema: "solution-one", table: "adm-tb-ms-manage-resume"
     *
     * Actual columns:
     *   manage_resume_id (numeric PK), title (int), first_name, last_name,
     *   email, phone, position (int), location (int), skills (varchar),
     *   gender, experiences (varchar), educations (varchar),
     *   create_date, create_by, update_date, update_by
     */
    async submitResume(data: ResumeSubmission): Promise<{ success: boolean; id?: string; error?: string }> {
        const client = await this.pool.connect();
        try {
            const now = new Date();

            const result = await client.query(
                `INSERT INTO "solution-one"."adm-tb-ms-manage-resume"
                 (title, first_name, last_name, email, phone,
                  "position", "location", skills, gender,
                  experiences, educations,
                  create_date, create_by, update_date, update_by)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
                 RETURNING manage_resume_id`,
                [
                    this.mapTitle(data.personal.title),
                    data.personal.firstName,
                    data.personal.lastName,
                    data.personal.email,
                    data.personal.phone,
                    this.mapPosition(data.personal.position),
                    this.mapLocation(data.personal.location),
                    JSON.stringify(data.skills),
                    data.personal.gender,
                    JSON.stringify(data.experiences),
                    JSON.stringify(data.educations),
                    now,
                    'web-frontend',
                    now,
                    'web-frontend',
                ],
            );

            const resumeId = result.rows[0]?.manage_resume_id;
            this.logger.log(`Resume submitted successfully, ID: ${resumeId}, Job: ${data.jobTitle}`);
            return { success: true, id: String(resumeId) };
        } catch (error) {
            this.logger.error(`Failed to submit resume: ${error.message}`, error.stack);
            return { success: false, error: error.message };
        } finally {
            client.release();
        }
    }
}
