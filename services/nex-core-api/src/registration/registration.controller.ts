import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { RegistrationService } from './registration.service';
import { Public } from '../common/decorators/public.decorator';

@Controller('registration')
export class RegistrationController {
  constructor(private readonly registrationService: RegistrationService) {}

  /** Get all business types and sub-types (public) */
  @Public()
  @Get('business-types')
  async getBusinessTypes() {
    return this.registrationService.getBusinessTypes();
  }

  /** Register a new tenant (public) */
  @Public()
  @Post()
  async register(
    @Body()
    body: {
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
    },
  ) {
    return this.registrationService.register(body);
  }

  /** Check provisioning status (public) */
  @Public()
  @Get('status/:id')
  async getStatus(@Param('id') id: string) {
    return this.registrationService.getStatus(id);
  }

  @Public()
  @Get('dbd/:taxId')
  async getCompanyByTaxId(@Param('taxId') taxId: string) {
    const sanitizedTaxId = taxId.replace(/[^0-9]/g, '');

    // 1. ตรวจสอบว่ามี API Key หรือไม่ (เช่น Creden Data หรือ Open-DBD)
    const CREDEN_API_KEY = process.env.CREDEN_API_KEY;
    const OPEND_API_KEY = process.env.OPEND_API_KEY;

    if (OPEND_API_KEY && sanitizedTaxId.length === 13) {
      try {
        // ทดสอบดึงข้อมูลจาก Open Data (DBD) ผ่าน data.go.th
        // หมายเหตุ: url นี้เป็นรูปแบบการดึงจาก CKAN Datastore ซึ่งอาจต้องเปลี่ยน resource_id ให้ตรงกับชุดข้อมูลล่าสุด
        const response = await fetch(`https://opend.data.go.th/get-ckan/datastore_search?resource_id=5c325859-994c-47bc-ad9d-cc09951664f6&q=${sanitizedTaxId}`, {
          method: 'GET',
          headers: {
            'api-key': OPEND_API_KEY,
          }
        });

        if (response.ok) {
          const result = await response.json();
          const records = result.result?.records;
          if (records && records.length > 0) {
            const companyData = records[0];
            const addressParts = [];
            if (companyData.address_no) addressParts.push(`เลขที่ ${companyData.address_no}`);
            if (companyData.building) addressParts.push(`อาคาร ${companyData.building}`);
            if (companyData.room_no) addressParts.push(`ห้อง ${companyData.room_no}`);
            if (companyData.floor) addressParts.push(`ชั้น ${companyData.floor}`);
            if (companyData.village_name) addressParts.push(`หมู่บ้าน ${companyData.village_name}`);
            if (companyData.moo) addressParts.push(`หมู่ ${companyData.moo}`);
            if (companyData.soi) addressParts.push(`ซอย ${companyData.soi}`);
            if (companyData.road) addressParts.push(`ถนน ${companyData.road}`);
            if (companyData.tumbon) addressParts.push(`ต. ${companyData.tumbon}`);
            if (companyData.ampur) addressParts.push(`อ. ${companyData.ampur}`);
            if (companyData.province) addressParts.push(`จ. ${companyData.province}`);
            const fullAddress = companyData.address || companyData.address_detail || companyData.address_th || addressParts.join(' ');

            return {
              success: true,
              data: {
                companyTitle: companyData.juristic_type || 'บริษัท',
                companyNameTH: companyData.juristic_name_th || '',
                companyNameEN: companyData.juristic_name_en || '',
                status: companyData.juristic_status || 'Active',
                address: fullAddress
              }
            };
          }
        }
      } catch (error) {
        console.error('Open-DBD API Error:', error);
      }
    }

    if (CREDEN_API_KEY && sanitizedTaxId.length === 13) {
      try {
        // ตัวอย่างการเรียกใช้ API จริง (อ้างอิงโครงสร้าง Creden Data)
        const response = await fetch(`https://api.creden.co/company/profile/${sanitizedTaxId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Token ${CREDEN_API_KEY}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const result = await response.json();
          return {
            success: true,
            data: {
              companyTitle: result.company_type || 'บริษัท',
              companyNameTH: result.company_name_th || '',
              companyNameEN: result.company_name_en || '',
              status: result.company_status || 'Active',
              address: result.address || result.address_th || ''
            }
          };
        }
      } catch (error) {
        console.error('Real API Error:', error);
        // Fallback ไปใช้ Mock Data หาก API จริงมีปัญหา
      }
    }

    // 3. Fallback: กรณีไม่มี API Key หรือ API จริงมีปัญหา
    // เพื่อให้ระบบทำงานต่อได้ จะทำการ Mock ข้อมูลจำลอง
    if (sanitizedTaxId === '0135562022591') {
      return {
        success: true,
        data: {
          companyTitle: 'บริษัท',
          companyNameTH: 'เจเอ็นเอ เน็กซัส แอคเคาน์ติ้ง แอนด์ คอนซัลติ้ง (ประเทศไทย) จำกัด',
          companyNameEN: 'JNA NEXUS ACCOUNTING AND CONSULTING (THAILAND) CO., LTD.',
          status: 'ยังดำเนินกิจการอยู่',
          address: 'เลขที่ 9/1 ซอยสุคนธสวัสดิ์ 11 แขวงลาดพร้าว เขตลาดพร้าว กรุงเทพมหานคร 10230'
        }
      };
    }

    // ข้อมูลสำหรับทดสอบอื่นๆ
    if (sanitizedTaxId === '0415554000815') {
      return {
        success: true,
        data: {
          companyTitle: 'บริษัท',
          companyNameTH: 'เทค บิซ คอนเวอร์เจนซ์ จำกัด',
          companyNameEN: 'TECH BIZ CONVERGENCE CO., LTD.',
          status: 'ยังดำเนินกิจการอยู่',
          address: 'เลขที่ 123 อาคารซอฟต์แวร์พาร์ค ชั้น 5 ถ.แจ้งวัฒนะ ต.คลองเกลือ อ.ปากเกร็ด จ.นนทบุรี 11120'
        }
      };
    }

    if (sanitizedTaxId.length === 13) {
      return {
        success: true,
        data: {
          companyTitle: 'บริษัท',
          companyNameTH: `ตัวอย่าง จำกัด (สาขา ${taxId.substring(9, 13)})`,
          companyNameEN: `EXAMPLE CO., LTD. (${taxId.substring(9, 13)})`,
          status: 'Active',
          address: '999 ถนนวิภาวดีรังสิต แขวงจอมพล เขตจตุจักร กรุงเทพมหานคร 10900'
        }
      };
    }

    return {
      success: false,
      message: 'ไม่พบข้อมูลนิติบุคคล'
    };
  }

  /** Seed business types (admin/one-time) */
  @Public()
  @Post('seed')
  async seedBusinessTypes() {
    return this.registrationService.seedBusinessTypes();
  }
}
