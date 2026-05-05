import { useState, useEffect } from 'react';
import { systemConfigService } from '../services/api';

export interface SystemConfigValues {
  showTenantName: boolean;
  tenantNameDisplayPosition: string; // 'SIDEBAR_TOP' | 'TOP_HEADER_RIGHT' | 'BREADCRUMB'
  tenantName: string;
  pageRecordDefault: number;
  dateFormat: string;
  timeFormat: string;
  dateTimeFormat: string;
}

export function useSystemConfig() {
  const [configs, setConfigs] = useState<SystemConfigValues>({
    showTenantName: false,
    tenantNameDisplayPosition: 'TOP_HEADER_RIGHT',
    tenantName: '',
    pageRecordDefault: 10, // Default fallback
    dateFormat: 'dd/MM/yyyy',
    timeFormat: 'HH:mm:ss',
    dateTimeFormat: 'dd/MM/yyyy HH:mm:ss',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConfigs = async () => {
      try {
        const [showTenantNameStr, displayPositionStr, pageRecordStr, dateFormatStr, timeFormatStr, dateTimeFormatStr] = await Promise.all([
          systemConfigService.getByKey('SHOW_TENANT_NAME'),
          systemConfigService.getByKey('TENANT_NAME_DISPLAY_POSITION'),
          systemConfigService.getByKey('PAGE_RECORD_DEFAULT'),
          systemConfigService.getByKey('DATE_FORMAT'),
          systemConfigService.getByKey('TIME_FORMAT'),
          systemConfigService.getByKey('DATETIME_FORMAT')
        ]);

        let tenantName = typeof window !== 'undefined' ? localStorage.getItem('workspaceId') || '' : '';

        // If no workspaceId, try to fetch the company name
        if (!tenantName) {
            try {
                const apiUrl = typeof window !== 'undefined' && window.location.hostname !== 'localhost'
                    ? `http://${window.location.hostname}:8101/api`
                    : 'http://localhost:8101/api';
                const companyRes = await fetch(`${apiUrl}/v1/company`, { credentials: 'include' });
                if (companyRes.ok) {
                    const companyData = await companyRes.json();
                    if (companyData?.data?.name_en || companyData?.data?.name_th) {
                        tenantName = companyData.data.name_th || companyData.data.name_en;
                    }
                }
            } catch (e) {
                console.error('Failed to fetch company info', e);
            }
        }

        if (!tenantName) {
            tenantName = 'NexOne System';
        }

        const pageRecordDefault = pageRecordStr && !isNaN(parseInt(pageRecordStr, 10)) 
            ? parseInt(pageRecordStr, 10) 
            : 10;

        setConfigs({
          showTenantName: showTenantNameStr === 'true' || showTenantNameStr === '1',
          tenantNameDisplayPosition: displayPositionStr || 'TOP_HEADER_RIGHT',
          tenantName: tenantName,
          pageRecordDefault: pageRecordDefault,
          dateFormat: dateFormatStr || 'dd/MM/yyyy',
          timeFormat: timeFormatStr || 'HH:mm:ss',
          dateTimeFormat: dateTimeFormatStr || 'dd/MM/yyyy HH:mm:ss',
        });
      } catch (error) {
        console.error('Error fetching system configs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchConfigs();
  }, []);

  return { configs, loading };
}
