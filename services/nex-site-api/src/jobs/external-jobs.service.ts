import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool } from 'pg';

// Employment type mapping (from external DB integer → string)
const EMPLOYMENT_TYPES: Record<number, string> = {
    1: 'full-time',
    2: 'part-time',
    3: 'internship',
    4: 'contract',
};

export interface ExternalJob {
    id: string;
    title: string;
    department: string;
    location: string;
    type: string;
    salary: string | null;
    description: string;
    experience: string;
    qualification: string;
    position: number;
    age: string;
    tags: string[];
    status: 'open' | 'closed';
    closingDate: string | null;
    startDate: string | null;
    createdAt: string;
}

@Injectable()
export class ExternalJobsService {
    private pool: Pool;

    constructor(private configService: ConfigService) {
        this.pool = new Pool({
            host: this.configService.get('EXTERNAL_DB_HOST', 'localhost'),
            port: Number(this.configService.get('EXTERNAL_DB_PORT', 5432)),
            user: this.configService.get('EXTERNAL_DB_USER', 'postgres'),
            password: this.configService.get('EXTERNAL_DB_PASSWORD', 'qwerty'),
            database: this.configService.get('EXTERNAL_DB_NAME', 'postgres'),
        });
    }

    async findAll(status?: string): Promise<ExternalJob[]> {
        try {
            // Default to Open jobs only; allow override via query param
            const statusFilter = status || 'Open';

            const result = await this.pool.query(
                `SELECT
                    j.manage_job_id::text         AS id,
                    j.job_title                   AS title,
                    COALESCE(
                        d.department_name_th,
                        j.department::text
                    )                              AS department,
                    j.job_location::text          AS location,
                    j.employment_type             AS employment_type_id,
                    j.description,
                    j.experience,
                    j.salary_from,
                    j.salary_to,
                    j.start_date,
                    j.expired_date                AS closing_date,
                    j.position,
                    j.age,
                    j.qualification,
                    j.create_date                 AS created_at,
                    j.status
                 FROM "solution-one"."adm-tb-ms-manage-jobs" j
                 LEFT JOIN "solution-one"."emp-tb-ms-department" d
                    ON j.department = d."deparment_id"
                 WHERE j.status = $1
                 ORDER BY j.create_date DESC`,
                [statusFilter],
            );

            return result.rows.map(row => this.mapRow(row));
        } catch (error) {
            console.warn('[ExternalJobsService] findAll failed:', error.message);
            return [];
        }
    }

    async findOne(id: string): Promise<ExternalJob | null> {
        try {
            const result = await this.pool.query(
                `SELECT
                    j.manage_job_id::text         AS id,
                    j.job_title                   AS title,
                    COALESCE(
                        d.department_name_th,
                        j.department::text
                    )                              AS department,
                    j.job_location::text          AS location,
                    j.employment_type             AS employment_type_id,
                    j.description,
                    j.experience,
                    j.salary_from,
                    j.salary_to,
                    j.start_date,
                    j.expired_date                AS closing_date,
                    j.position,
                    j.age,
                    j.qualification,
                    j.create_date                 AS created_at,
                    j.status
                 FROM "solution-one"."adm-tb-ms-manage-jobs" j
                 LEFT JOIN "solution-one"."emp-tb-ms-department" d
                    ON j.department = d."deparment_id"
                 WHERE j.manage_job_id = $1`,
                [id],
            );

            if (result.rows.length === 0) return null;
            return this.mapRow(result.rows[0]);
        } catch (error) {
            console.warn('[ExternalJobsService] findOne failed:', error.message);
            return null;
        }
    }

    private mapRow(row: any): ExternalJob {
        const salaryFrom = row.salary_from ? Number(row.salary_from) : null;
        const salaryTo = row.salary_to ? Number(row.salary_to) : null;
        const salary = salaryFrom && salaryTo
            ? `${salaryFrom.toLocaleString()} - ${salaryTo.toLocaleString()} บาท`
            : salaryFrom ? `${salaryFrom.toLocaleString()}+ บาท` : null;

        // Build tags from qualification keywords
        const tags: string[] = [];
        if (row.experience) tags.push(`ประสบการณ์ ${row.experience} ปี`);
        if (row.age) tags.push(`อายุ ${row.age} ปี`);

        return {
            id: row.id,
            title: row.title || 'ไม่ระบุตำแหน่ง',
            department: row.department || 'ไม่ระบุแผนก',
            location: row.location || 'ไม่ระบุ',
            type: EMPLOYMENT_TYPES[Number(row.employment_type_id)] || 'full-time',
            salary,
            description: row.description || '',
            experience: row.experience || '',
            qualification: row.qualification || '',
            position: Number(row.position) || 1,
            age: row.age || '',
            tags,
            status: row.status?.toLowerCase() === 'open' ? 'open' : 'closed',
            closingDate: row.closing_date ? new Date(row.closing_date).toISOString() : null,
            startDate: row.start_date ? new Date(row.start_date).toISOString() : null,
            createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
        };
    }
}
