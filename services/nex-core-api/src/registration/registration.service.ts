import { Injectable, Logger, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { TenantRegistration } from './entities/tenant-registration.entity';
import { BusinessType } from './entities/business-type.entity';
import { BusinessSubType } from './entities/business-sub-type.entity';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

/** Maps business group code → default roles */
const DEFAULT_ROLES_MAP: Record<string, string[]> = {
  LOG: ['MD', 'Dispatcher', 'Driver', 'Warehouse', 'Finance'],
  TRD: ['MD', 'Sales', 'Purchasing', 'Warehouse', 'Cashier', 'Finance'],
  MFG: ['MD', 'Sales', 'Planner', 'Supervisor', 'QC', 'Warehouse', 'Purchasing', 'Finance'],
  SVC: ['MD', 'Sales', 'PM', 'Consultant', 'Dispatcher', 'Technician', 'Finance'],
  FNB: ['Owner', 'Manager', 'Chef', 'Server', 'Cashier', 'Purchasing'],
  RES: ['MD', 'Sales', 'PM', 'Juristic', 'Maintenance', 'Finance'],
  CON: ['MD', 'Estimator', 'PM', 'Engineer', 'Foreman', 'QC', 'Purchasing', 'Finance'],
};

/** Maps business group code → enabled app modules */
const ENABLED_APPS_MAP: Record<string, string[]> = {
  LOG: ['NexCore', 'NexSales', 'NexStock', 'NexFinance', 'NexForce', 'NexSpeed', 'NexAsset', 'NexMaint', 'NexBI'],
  TRD: ['NexCore', 'NexSales', 'NexStock', 'NexProcure', 'NexFinance', 'NexForce', 'NexSpeed', 'NexPOS', 'NexBI'],
  MFG: ['NexCore', 'NexSales', 'NexStock', 'NexProcure', 'NexFinance', 'NexForce', 'NexProduce', 'NexAsset', 'NexMaint', 'NexCost', 'NexBI'],
  SVC: ['NexCore', 'NexSales', 'NexProcure', 'NexFinance', 'NexForce', 'NexProduce', 'NexPOS', 'NexAsset', 'NexMaint', 'NexCost', 'NexBI'],
  FNB: ['NexCore', 'NexSales', 'NexStock', 'NexProcure', 'NexFinance', 'NexForce', 'NexProduce', 'NexPOS', 'NexBI'],
  RES: ['NexCore', 'NexSales', 'NexProcure', 'NexFinance', 'NexForce', 'NexProduce', 'NexAsset', 'NexMaint', 'NexCost', 'NexBI'],
  CON: ['NexCore', 'NexSales', 'NexStock', 'NexProcure', 'NexFinance', 'NexForce', 'NexProduce', 'NexAsset', 'NexMaint', 'NexCost', 'NexBI'],
};

@Injectable()
export class RegistrationService {
  private readonly logger = new Logger(RegistrationService.name);

  constructor(
    @InjectRepository(TenantRegistration)
    private readonly tenantRepo: Repository<TenantRegistration>,
    @InjectRepository(BusinessType)
    private readonly bizTypeRepo: Repository<BusinessType>,
    @InjectRepository(BusinessSubType)
    private readonly bizSubRepo: Repository<BusinessSubType>,
    private readonly dataSource: DataSource,
  ) {}

  /** Get all business types with sub-types */
  async getBusinessTypes() {
    return this.bizTypeRepo.find({
      where: { isActive: true },
      relations: ['subTypes'],
      order: { id: 'ASC' },
    });
  }

  /** Register a new tenant */
  async register(dto: {
    companyTitle?: string;
    companyNameTH: string;
    companyNameEN?: string;
    companyAbbreviation: string;
    address?: string;
    taxId?: string;
    phone?: string;
    email: string;
    employeeRange?: string;
    businessGroup: string;
    businessSubType: number;
    adminName: string;
    adminEmail: string;
    adminPassword: string;
    adminPhone?: string;
  }) {
    // 1. Generate schema name (Database name)
    const schemaName = this.generateSchemaName(dto.companyAbbreviation);

    // Check if database already exists
    const dbExists = await this.dataSource.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [schemaName]
    );
    if (dbExists.length > 0) {
      throw new ConflictException(`บริษัท ${dto.companyAbbreviation} มีการสร้างฐานข้อมูลในระบบแล้ว`);
    }

    // 2. Hash password
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(dto.adminPassword, salt, 100000, 64, 'sha512').toString('hex');
    const passwordHash = `${salt}:${hash}`;

    // 3. Get default roles & apps
    const defaultRoles = DEFAULT_ROLES_MAP[dto.businessGroup] || ['Admin'];
    const enabledApps = ENABLED_APPS_MAP[dto.businessGroup] || ['NexCore'];

    // 4. Save registration record
    const registration = this.tenantRepo.create({
      companyTitle: dto.companyTitle,
      companyNameTH: dto.companyNameTH,
      companyNameEN: dto.companyNameEN,
      companyAbbreviation: dto.companyAbbreviation,
      address: dto.address,
      taxId: dto.taxId,
      phone: dto.phone,
      email: dto.email,
      employeeRange: dto.employeeRange,
      businessGroup: dto.businessGroup,
      businessSubType: dto.businessSubType,
      adminName: dto.adminName,
      adminEmail: dto.adminEmail,
      adminPhone: dto.adminPhone,
      adminPasswordHash: passwordHash,
      schemaName,
      provisioningStatus: 'provisioning',
      defaultRoles,
      enabledApps,
    });

    const saved = await this.tenantRepo.save(registration);
    this.logger.log(`Registration created: ${saved.id} — schema: ${schemaName}`);

    // 5. Provision in background (simulated)
    this.provisionTenant(saved).catch((err) => {
      this.logger.error(`Provisioning failed for ${saved.id}: ${err.message}`);
    });

    return {
      id: saved.id,
      schemaName,
      status: 'provisioning',
      defaultRoles,
      enabledApps,
    };
  }

  /** Get registration status */
  async getStatus(id: string) {
    const reg = await this.tenantRepo.findOne({ where: { id } });
    if (!reg) return null;
    return {
      id: reg.id,
      schemaName: reg.schemaName,
      status: reg.provisioningStatus,
      enabledApps: reg.enabledApps,
      defaultRoles: reg.defaultRoles,
    };
  }

  /** Background provisioning logic */
  private async provisionTenant(reg: TenantRegistration) {
    try {
      // Step 1: Create Database
      this.logger.log(`Creating database: ${reg.schemaName}`);
      await this.dataSource.query(`CREATE DATABASE "${reg.schemaName}"`);

      // Step 2: Connect to the new database
      this.logger.log(`Connecting to new database: ${reg.schemaName}`);
      const tenantDataSource = new DataSource({
        type: 'postgres',
        host: process.env.DATABASE_HOST || '203.151.66.51',
        port: parseInt(process.env.DATABASE_PORT || '5434', 10),
        username: process.env.DATABASE_USER || 'postgres',
        password: process.env.DATABASE_PASSWORD || 'qwerty',
        database: reg.schemaName,
      });
      await tenantDataSource.initialize();

      try {
        // Step 3: Create schemas inside the new database
        this.logger.log(`Creating schemas in database: ${reg.schemaName}`);
        const schemas = [
          'nex_approve', 'nex_asset', 'nex_audit', 'nex_bi', 'nex_connect', 'nex_core', 'nex_cost', 'nex_delivery', 'nex_finance', 'nex_force', 'nex_hire', 'nex_learn', 'nex_less', 'nex_maint', 'nex_payroll', 'nex_pos', 'nex_procure', 'nex_produce', 'nex_project', 'nex_sales', 'nex_site', 'nex_speed', 'nex_stock', 'nex_tax', 'public', 'solution-one'
        ];
        for (const schema of schemas) {
          await tenantDataSource.query(`CREATE SCHEMA IF NOT EXISTS "${schema}"`);
        }

        // Step 4: Execute 03_create_schema_tables.sql
        this.logger.log(`Executing table creation script for database: ${reg.schemaName}`);
        const sqlFilePath = path.join(process.cwd(), '..', '..', 'database', '03_create_schema_tables.sql');
        let sqlScript = fs.readFileSync(sqlFilePath, 'utf8');

        // Execute the script directly since schemas exist in the new DB
        await tenantDataSource.query(sqlScript);
        this.logger.log(`Table creation completed for database: ${reg.schemaName}`);

        // Step 5: Setup Tenant Admin User
        this.logger.log(`Setting up Admin user for database: ${reg.schemaName}`);
        // Delete the placeholder admin user created by the script
        await tenantDataSource.query(`DELETE FROM nex_core.users WHERE email = 'admin@nexone.local'`);

        // Insert the actual tenant admin user using the hashed password from registration
        const appAccess = JSON.stringify(reg.enabledApps || ['nex-core']);
        await tenantDataSource.query(
          `INSERT INTO nex_core.users (email, password, display_name, role_id, role_name, app_access, create_by) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [reg.adminEmail, reg.adminPasswordHash, reg.adminName, 1, 'admin', appAccess, 'system']
        );

        // Step 6: Create organize and contact_person tables and insert data
        this.logger.log(`Creating organize and contact_person tables for database: ${reg.schemaName}`);
        await tenantDataSource.query(`
          CREATE TABLE IF NOT EXISTS nex_core.organize (
            id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
            company_title varchar(100),
            company_name_th varchar(255),
            company_name_en varchar(255),
            company_abbreviation varchar(50),
            tax_id varchar(20),
            address text,
            phone varchar(20),
            email varchar(255),
            employee_range varchar(50),
            business_group varchar(10),
            business_sub_type integer,
            create_date timestamptz DEFAULT CURRENT_TIMESTAMP,
            create_by varchar(50) DEFAULT 'system'
          );
        `);

        await tenantDataSource.query(`
          CREATE TABLE IF NOT EXISTS nex_core.contact_person (
            id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
            organize_id uuid REFERENCES nex_core.organize(id) ON DELETE CASCADE,
            contact_name varchar(255),
            contact_email varchar(255),
            contact_phone varchar(20),
            is_admin boolean DEFAULT false,
            create_date timestamptz DEFAULT CURRENT_TIMESTAMP,
            create_by varchar(50) DEFAULT 'system'
          );
        `);

        this.logger.log(`Inserting organize and contact_person data for database: ${reg.schemaName}`);
        const orgRes = await tenantDataSource.query(
          `INSERT INTO nex_core.organize 
            (company_title, company_name_th, company_name_en, company_abbreviation, tax_id, address, phone, email, employee_range, business_group, business_sub_type) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id`,
          [
            reg.companyTitle, reg.companyNameTH, reg.companyNameEN, reg.companyAbbreviation, 
            reg.taxId, reg.address, reg.phone, reg.email, reg.employeeRange, reg.businessGroup, reg.businessSubType
          ]
        );
        const orgId = orgRes[0].id;

        await tenantDataSource.query(
          `INSERT INTO nex_core.contact_person (organize_id, contact_name, contact_email, contact_phone, is_admin) VALUES ($1, $2, $3, $4, $5)`,
          [orgId, reg.adminName, reg.adminEmail, reg.adminPhone, true]
        );

      } finally {
        await tenantDataSource.destroy();
      }

      // Step 7: Update status
      await this.tenantRepo.update(reg.id, { provisioningStatus: 'completed' });
      this.logger.log(`Provisioning completed for: ${reg.id}`);
    } catch (error) {
      this.logger.error(`Provisioning error for ${reg.id}:`, error);
      await this.tenantRepo.update(reg.id, { provisioningStatus: 'failed' });
      throw error;
    }
  }

  /** Generate a safe database name from company abbreviation */
  private generateSchemaName(abbr: string): string {
    const clean = abbr
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '')
      .slice(0, 40);
    return `nex_${clean || 'tenant'}`;
  }

  /** Seed business types & sub-types (run once) */
  async seedBusinessTypes() {
    const existingCount = await this.bizTypeRepo.count();
    if (existingCount > 0) {
      return { message: 'Business types already seeded', count: existingCount };
    }

    const types = [
      { code: 'LOG', nameTH: 'ขนส่ง', nameEN: 'Logistics', icon: '🚚', color: '#3B82F6', descriptionTH: 'บริหารงานขนส่ง รถบรรทุก พัสดุ คลังสินค้า' },
      { code: 'TRD', nameTH: 'ซื้อมาขายไป', nameEN: 'Trading', icon: '🛒', color: '#10B981', descriptionTH: 'ธุรกิจจัดจำหน่าย ค้าส่ง ค้าปลีก อีคอมเมิร์ซ' },
      { code: 'MFG', nameTH: 'รับจ้างผลิต', nameEN: 'Manufacturing', icon: '🏭', color: '#F59E0B', descriptionTH: 'โรงงานผลิต แปรรูป ประกอบสินค้า' },
      { code: 'SVC', nameTH: 'บริการ', nameEN: 'Service', icon: '🎯', color: '#8B5CF6', descriptionTH: 'ที่ปรึกษา ซ่อมบำรุง งานรายเดือน สปา' },
      { code: 'FNB', nameTH: 'อาหาร & เครื่องดื่ม', nameEN: 'F&B', icon: '🍽️', color: '#EF4444', descriptionTH: 'ร้านอาหาร คาเฟ่ Cloud Kitchen จัดเลี้ยง' },
      { code: 'RES', nameTH: 'อสังหาริมทรัพย์', nameEN: 'Real Estate', icon: '🏠', color: '#14B8A6', descriptionTH: 'พัฒนาโครงการ บริหารอาคาร ให้เช่า นายหน้า' },
      { code: 'CON', nameTH: 'ก่อสร้าง', nameEN: 'Construction', icon: '🏗️', color: '#D97706', descriptionTH: 'รับเหมาก่อสร้าง งานระบบ ออกแบบ' },
    ];

    for (const t of types) {
      await this.bizTypeRepo.save(this.bizTypeRepo.create(t));
    }

    // Sub-types
    const subTypes = [
      // LOG
      { businessTypeCode: 'LOG', subTypeNumber: 1, nameTH: 'FTL / LTL Trucking', nameEN: 'Full & Less Truckload', descriptionTH: 'รับจ้างขนส่งสินค้า B2B ระหว่างเมือง', examplesTH: 'รถบรรทุก, รถพ่วง', defaultRoles: DEFAULT_ROLES_MAP.LOG, defaultApps: ENABLED_APPS_MAP.LOG },
      { businessTypeCode: 'LOG', subTypeNumber: 2, nameTH: 'Last-Mile Delivery', nameEN: 'Last-Mile', descriptionTH: 'ส่งพัสดุปลายทางถึงมือผู้รับ', examplesTH: 'Kerry, Flash, J&T', defaultRoles: DEFAULT_ROLES_MAP.LOG, defaultApps: ENABLED_APPS_MAP.LOG },
      { businessTypeCode: 'LOG', subTypeNumber: 3, nameTH: 'Cold Chain / ห้องเย็น', nameEN: 'Cold Chain', descriptionTH: 'ขนส่งสินค้าควบคุมอุณหภูมิ', examplesTH: 'อาหารแช่แข็ง, ยา, วัคซีน', defaultRoles: DEFAULT_ROLES_MAP.LOG, defaultApps: ENABLED_APPS_MAP.LOG },
      { businessTypeCode: 'LOG', subTypeNumber: 4, nameTH: 'Container / ท่าเรือ', nameEN: 'Container', descriptionTH: 'บริหารตู้สินค้า เข้า-ออก Port', examplesTH: 'Freight Forwarder, Shipping', defaultRoles: DEFAULT_ROLES_MAP.LOG, defaultApps: ENABLED_APPS_MAP.LOG },
      // TRD
      { businessTypeCode: 'TRD', subTypeNumber: 1, nameTH: 'ขายส่ง / Distributor', nameEN: 'Wholesale', descriptionTH: 'ซื้อจากโรงงาน กระจายให้ร้านค้าย่อย', examplesTH: 'ตัวแทนจำหน่าย, ยี่ปั๊ว', defaultRoles: DEFAULT_ROLES_MAP.TRD, defaultApps: ENABLED_APPS_MAP.TRD },
      { businessTypeCode: 'TRD', subTypeNumber: 2, nameTH: 'ขายปลีก / Retail', nameEN: 'Retail', descriptionTH: 'หลายสาขา หน้าร้าน มีสต็อก', examplesTH: '7-11, ร้านสะดวกซื้อ, Mini Mart', defaultRoles: DEFAULT_ROLES_MAP.TRD, defaultApps: ENABLED_APPS_MAP.TRD },
      { businessTypeCode: 'TRD', subTypeNumber: 3, nameTH: 'E-Commerce / ออนไลน์', nameEN: 'E-Commerce', descriptionTH: 'ขาย Shopee, Lazada, Website', examplesTH: 'Shopee Seller, Social Commerce', defaultRoles: DEFAULT_ROLES_MAP.TRD, defaultApps: ENABLED_APPS_MAP.TRD },
      { businessTypeCode: 'TRD', subTypeNumber: 4, nameTH: 'Import / Export', nameEN: 'Import-Export', descriptionTH: 'นำเข้าจากต่างประเทศ หรือส่งออก', examplesTH: 'ตัวแทนนำเข้า, ส่งออกสินค้าเกษตร', defaultRoles: DEFAULT_ROLES_MAP.TRD, defaultApps: ENABLED_APPS_MAP.TRD },
      // MFG
      { businessTypeCode: 'MFG', subTypeNumber: 1, nameTH: 'Make-to-Order / Job Shop', nameEN: 'Make-to-Order', descriptionTH: 'ผลิตตามสั่งทีละงาน ไม่มีสต็อก', examplesTH: 'เครื่องจักร, ชิ้นส่วนโลหะ, แม่พิมพ์', defaultRoles: DEFAULT_ROLES_MAP.MFG, defaultApps: ENABLED_APPS_MAP.MFG },
      { businessTypeCode: 'MFG', subTypeNumber: 2, nameTH: 'OEM / Contract Mfg', nameEN: 'OEM', descriptionTH: 'ผลิตตาม Design ลูกค้าเป็น Batch ใหญ่', examplesTH: 'อิเล็กทรอนิกส์, เสื้อผ้า, บรรจุภัณฑ์', defaultRoles: DEFAULT_ROLES_MAP.MFG, defaultApps: ENABLED_APPS_MAP.MFG },
      { businessTypeCode: 'MFG', subTypeNumber: 3, nameTH: 'Tolling / แปรรูปวัตถุดิบ', nameEN: 'Tolling', descriptionTH: 'ลูกค้าส่งวัตถุดิบมา เราแปรรูปคืน', examplesTH: 'โรงสี, แปรรูปอาหาร, ชุบโลหะ', defaultRoles: DEFAULT_ROLES_MAP.MFG, defaultApps: ENABLED_APPS_MAP.MFG },
      { businessTypeCode: 'MFG', subTypeNumber: 4, nameTH: 'Make-to-Stock / ผลิตขายเอง', nameEN: 'Make-to-Stock', descriptionTH: 'ผลิตเก็บสต็อก ขายผ่าน Distributor', examplesTH: 'อาหาร, เครื่องสำอาง, ของใช้ทั่วไป', defaultRoles: DEFAULT_ROLES_MAP.MFG, defaultApps: ENABLED_APPS_MAP.MFG },
      // SVC
      { businessTypeCode: 'SVC', subTypeNumber: 1, nameTH: 'Professional Services', nameEN: 'Professional', descriptionTH: 'ขายความรู้และเวลา Man-Day/Project', examplesTH: 'IT Consulting, กฎหมาย, บัญชี', defaultRoles: DEFAULT_ROLES_MAP.SVC, defaultApps: ENABLED_APPS_MAP.SVC },
      { businessTypeCode: 'SVC', subTypeNumber: 2, nameTH: 'Field Service / ซ่อมบำรุง', nameEN: 'Field Service', descriptionTH: 'รับแจ้งซ่อม ส่งช่างออกพื้นที่', examplesTH: 'ซ่อมแอร์, ลิฟต์, IT Support', defaultRoles: DEFAULT_ROLES_MAP.SVC, defaultApps: ENABLED_APPS_MAP.SVC },
      { businessTypeCode: 'SVC', subTypeNumber: 3, nameTH: 'Retainer / รายเดือน', nameEN: 'Retainer', descriptionTH: 'บริการต่อเนื่อง Subscription', examplesTH: 'รปภ., แม่บ้าน, Facility Mgt', defaultRoles: DEFAULT_ROLES_MAP.SVC, defaultApps: ENABLED_APPS_MAP.SVC },
      { businessTypeCode: 'SVC', subTypeNumber: 4, nameTH: 'Hospitality / Wellness', nameEN: 'Hospitality', descriptionTH: 'นัดหมายให้บริการ ณ สถานที่', examplesTH: 'โรงแรม, สปา, คลินิก, ร้านเสริมสวย', defaultRoles: DEFAULT_ROLES_MAP.SVC, defaultApps: ENABLED_APPS_MAP.SVC },
      // FNB
      { businessTypeCode: 'FNB', subTypeNumber: 1, nameTH: 'ร้านอาหาร / Single', nameEN: 'Single Restaurant', descriptionTH: 'หน้าร้านเดียว Dine-in + Takeaway', examplesTH: 'ร้านอาหาร, Café, Bistro', defaultRoles: DEFAULT_ROLES_MAP.FNB, defaultApps: ENABLED_APPS_MAP.FNB },
      { businessTypeCode: 'FNB', subTypeNumber: 2, nameTH: 'Chain / Franchise', nameEN: 'Chain Restaurant', descriptionTH: 'หลายสาขา ครัวกลาง มาตรฐานเดียว', examplesTH: 'MK, The Pizza Company', defaultRoles: DEFAULT_ROLES_MAP.FNB, defaultApps: ENABLED_APPS_MAP.FNB },
      { businessTypeCode: 'FNB', subTypeNumber: 3, nameTH: 'Cloud Kitchen', nameEN: 'Cloud Kitchen', descriptionTH: 'ผลิตเพื่อ Delivery เท่านั้น', examplesTH: 'Multi-Brand Kitchen, Delivery-Only', defaultRoles: DEFAULT_ROLES_MAP.FNB, defaultApps: ENABLED_APPS_MAP.FNB },
      { businessTypeCode: 'FNB', subTypeNumber: 4, nameTH: 'Catering / จัดเลี้ยง', nameEN: 'Catering', descriptionTH: 'รับจ้างทำอาหารสำหรับงานกิจกรรม', examplesTH: 'งานแต่ง, Conference, Corporate', defaultRoles: DEFAULT_ROLES_MAP.FNB, defaultApps: ENABLED_APPS_MAP.FNB },
      // RES
      { businessTypeCode: 'RES', subTypeNumber: 1, nameTH: 'Developer / ขายโครงการ', nameEN: 'Developer', descriptionTH: 'สร้างบ้าน/คอนโด แล้วขาย', examplesTH: 'Residential Developer, Condo', defaultRoles: DEFAULT_ROLES_MAP.RES, defaultApps: ENABLED_APPS_MAP.RES },
      { businessTypeCode: 'RES', subTypeNumber: 2, nameTH: 'Property Management', nameEN: 'Property Mgt', descriptionTH: 'บริหารโครงการที่สร้างแล้ว', examplesTH: 'นิติบุคคล, Property Manager', defaultRoles: DEFAULT_ROLES_MAP.RES, defaultApps: ENABLED_APPS_MAP.RES },
      { businessTypeCode: 'RES', subTypeNumber: 3, nameTH: 'เช่า / Rental', nameEN: 'Rental', descriptionTH: 'ให้เช่าพื้นที่ระยะยาว/สั้น', examplesTH: 'ออฟฟิศ, Serviced Apartment', defaultRoles: DEFAULT_ROLES_MAP.RES, defaultApps: ENABLED_APPS_MAP.RES },
      { businessTypeCode: 'RES', subTypeNumber: 4, nameTH: 'นายหน้า / Agency', nameEN: 'Agency', descriptionTH: 'เป็นตัวกลางซื้อ-ขาย-เช่า', examplesTH: 'Real Estate Agent, Broker', defaultRoles: DEFAULT_ROLES_MAP.RES, defaultApps: ENABLED_APPS_MAP.RES },
      // CON
      { businessTypeCode: 'CON', subTypeNumber: 1, nameTH: 'รับเหมาก่อสร้างทั่วไป', nameEN: 'General Contractor', descriptionTH: 'รับงานก่อสร้างอาคารตามสัญญา', examplesTH: 'บ้าน, อาคาร, โรงงาน', defaultRoles: DEFAULT_ROLES_MAP.CON, defaultApps: ENABLED_APPS_MAP.CON },
      { businessTypeCode: 'CON', subTypeNumber: 2, nameTH: 'งานระบบ / MEP', nameEN: 'MEP', descriptionTH: 'ไฟฟ้า ประปา แอร์ อัคคีภัย', examplesTH: 'Electrical, Plumbing, HVAC', defaultRoles: DEFAULT_ROLES_MAP.CON, defaultApps: ENABLED_APPS_MAP.CON },
      { businessTypeCode: 'CON', subTypeNumber: 3, nameTH: 'รับเหมาช่วง / Sub', nameEN: 'Subcontractor', descriptionTH: 'รับงานช่วงจาก Main Contractor', examplesTH: 'Work Package เฉพาะ', defaultRoles: DEFAULT_ROLES_MAP.CON, defaultApps: ENABLED_APPS_MAP.CON },
      { businessTypeCode: 'CON', subTypeNumber: 4, nameTH: 'Design & Build', nameEN: 'Design & Build', descriptionTH: 'ออกแบบ + ก่อสร้าง ในองค์กรเดียว', examplesTH: 'Turnkey Project', defaultRoles: DEFAULT_ROLES_MAP.CON, defaultApps: ENABLED_APPS_MAP.CON },
    ];

    for (const st of subTypes) {
      await this.bizSubRepo.save(this.bizSubRepo.create(st));
    }

    return { message: 'Seeded successfully', types: types.length, subTypes: subTypes.length };
  }
}
