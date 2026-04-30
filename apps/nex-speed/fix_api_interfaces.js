import fs from 'fs';

const missingInterfaces = `
export interface LiquidType { id: number; name: string; status?: string; createdAt?: string; updatedAt?: string; [key: string]: any; }
export interface MechanicType { id: number; name: string; status?: string; createdAt?: string; updatedAt?: string; [key: string]: any; }
export interface ParkingType { id: number; name: string; status?: string; createdAt?: string; updatedAt?: string; [key: string]: any; }
export interface PartCategory { id: number; name: string; status?: string; createdAt?: string; updatedAt?: string; [key: string]: any; }
export interface PartGroup { id: number; name: string; status?: string; createdAt?: string; updatedAt?: string; [key: string]: any; }
export interface StorageType { id: number; name: string; status?: string; createdAt?: string; updatedAt?: string; [key: string]: any; }
export interface UnitType { id: number; name: string; status?: string; createdAt?: string; updatedAt?: string; [key: string]: any; }
export interface VehicleType { id: number; name: string; status?: string; createdAt?: string; updatedAt?: string; [key: string]: any; }
export interface MechanicExpertise { id: number; name: string; status?: string; createdAt?: string; updatedAt?: string; [key: string]: any; }
export interface SystemApp { id: number; app_name: string; icon_url: string; route_path: string; is_active: boolean; [key: string]: any; }

export const systemAppService = {
    getAll: () => Promise.resolve([]),
};
`;

const missingFunctions = `
    // Mock endpoints
    getLiquidTypes: (): Promise<{data: LiquidType[], meta?: any}> => Promise.resolve({ data: [] }),
    createLiquidType: (data: any) => Promise.resolve({ data: [] }),
    updateLiquidType: (id: number, data: any) => Promise.resolve({ data: [] }),
    deleteLiquidType: (id: number) => Promise.resolve({ data: [] }),

    getMechanicExpertise: (): Promise<{data: MechanicExpertise[], meta?: any}> => Promise.resolve({ data: [] }),
    createMechanicExpertise: (data: any) => Promise.resolve({ data: [] }),
    updateMechanicExpertise: (id: number, data: any) => Promise.resolve({ data: [] }),
    deleteMechanicExpertise: (id: number) => Promise.resolve({ data: [] }),

    getMechanicTypes: (): Promise<{data: MechanicType[], meta?: any}> => Promise.resolve({ data: [] }),
    createMechanicType: (data: any) => Promise.resolve({ data: [] }),
    updateMechanicType: (id: number, data: any) => Promise.resolve({ data: [] }),
    deleteMechanicType: (id: number) => Promise.resolve({ data: [] }),

    getParkingTypes: (): Promise<{data: ParkingType[], meta?: any}> => Promise.resolve({ data: [] }),
    createParkingType: (data: any) => Promise.resolve({ data: [] }),
    updateParkingType: (id: number, data: any) => Promise.resolve({ data: [] }),
    deleteParkingType: (id: number) => Promise.resolve({ data: [] }),

    getPartCategories: (): Promise<{data: PartCategory[], meta?: any}> => Promise.resolve({ data: [] }),
    createPartCategory: (data: any) => Promise.resolve({ data: [] }),
    updatePartCategory: (id: number, data: any) => Promise.resolve({ data: [] }),
    deletePartCategory: (id: number) => Promise.resolve({ data: [] }),

    getPartGroups: (): Promise<{data: PartGroup[], meta?: any}> => Promise.resolve({ data: [] }),
    createPartGroup: (data: any) => Promise.resolve({ data: [] }),
    updatePartGroup: (id: number, data: any) => Promise.resolve({ data: [] }),
    deletePartGroup: (id: number) => Promise.resolve({ data: [] }),

    getStorageTypes: (): Promise<{data: StorageType[], meta?: any}> => Promise.resolve({ data: [] }),
    createStorageType: (data: any) => Promise.resolve({ data: [] }),
    updateStorageType: (id: number, data: any) => Promise.resolve({ data: [] }),
    deleteStorageType: (id: number) => Promise.resolve({ data: [] }),

    getUnitTypes: (): Promise<{data: UnitType[], meta?: any}> => Promise.resolve({ data: [] }),
    createUnitType: (data: any) => Promise.resolve({ data: [] }),
    updateUnitType: (id: number, data: any) => Promise.resolve({ data: [] }),
    deleteUnitType: (id: number) => Promise.resolve({ data: [] }),

    getVehicleTypes: (): Promise<{data: VehicleType[], meta?: any}> => Promise.resolve({ data: [] }),
    createVehicleType: (data: any) => Promise.resolve({ data: [] }),
    updateVehicleType: (id: number, data: any) => Promise.resolve({ data: [] }),
    deleteVehicleType: (id: number) => Promise.resolve({ data: [] }),

    updateMaintenancePlan: (id: number, data: any) => Promise.resolve({ data: [] }),
`;

let content = fs.readFileSync('src/services/api.ts', 'utf-8');

// replace LocationItem
content = content.replace(
      /export interface LocationItem \{\s*id: number; name: string; type: string; address: string;\s*province: string; lat: number; lng: number;\s*createdAt: string; updatedAt: string;\s*\}/,
      `export interface LocationItem {
    id: number; name: string; type: string; address: string;
    province: string; lat: number; lng: number;
    status?: string;
    createdAt: string; updatedAt: string;
}`);

// replace Province (because standard TS check failed earlier if I missed it, wait, I'll just be generic for Province)
content = content.replace(
      /export interface Province \{\s*id: number; name: string; nameEn: string; abbr: string;\s*region: string; createdAt: string; updatedAt: string;\s*\}/,
      `export interface Province {
    id: number; name: string; nameEn: string; abbr: string;
    region: string;
    status?: string; 
    createdAt: string; updatedAt: string;
}`);

// insert interfaces
content = content.replace('export const api = {', missingInterfaces + '\nexport const api = {\n' + missingFunctions);

fs.writeFileSync('src/services/api.ts', content, 'utf-8');
console.log('Successfully patched api.ts');
