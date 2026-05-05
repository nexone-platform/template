const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8101/api';

async function fetchAPI<T>(endpoint: string): Promise<T> {
    const res = await fetch(`${API_BASE}${endpoint}`, { credentials: 'include' });
    if (!res.ok) throw new Error(`API Error: ${res.status}`);
    const json = await res.json();
    return (json && json.data !== undefined) ? json.data as T : json as T;
}

async function postAPI<T>(endpoint: string, body: unknown): Promise<T> {
    const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        credentials: 'include'
    });
    if (!res.ok) throw new Error(`API Error: ${res.status}`);
    const json = await res.json();
    return (json && json.data !== undefined) ? json.data as T : json as T;
}

async function putAPI<T>(endpoint: string, body: unknown): Promise<T> {
    const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        credentials: 'include'
    });
    if (!res.ok) throw new Error(`API Error: ${res.status}`);
    const json = await res.json();
    return (json && json.data !== undefined) ? json.data as T : json as T;
}

async function deleteAPI<T>(endpoint: string): Promise<T> {
    const res = await fetch(`${API_BASE}${endpoint}`, { method: 'DELETE', credentials: 'include' });
    if (!res.ok) throw new Error(`API Error: ${res.status}`);
    const json = await res.json();
    return (json && json.data !== undefined) ? json.data as T : json as T;
}

// ========== Types ==========
export interface Vehicle {
    id: string; plateNumber: string; type: string; brand: string; model: string;
    year: number; status: string; fuelLevel: number; mileage: number;
    nextMaintenance: string; insuranceExpiry: string; driverId?: string;
    currentLat?: number; currentLng?: number; capacity: number;
    createdAt: string; updatedAt: string;
}

export interface Driver {
    id: string; name: string; phone: string; licenseType: string; licenseExpiry: string;
    status: string; safetyScore: number; hoursToday: number; totalTrips: number;
    vehicleId?: string; createdAt: string; updatedAt: string;
}

export interface Order {
    id: string; customerName: string; origin: string; destination: string;
    cargoType: string; weight: number; status: string; priority: string;
    deliveryDate: string; estimatedCost: number; vehicleId?: string;
    driverId?: string; createdAt: string; updatedAt: string;
}

export interface Trip {
    id: string; orderId: string; vehicleId: string; driverId: string;
    status: string; origin: string; destination: string;
    departureTime: string; estimatedArrival: string; actualArrival?: string;
    distance: number; progress: number; currentLat: number; currentLng: number;
    createdAt: string; updatedAt: string;
}

export interface Invoice {
    id: string; customerName: string; tripId?: string; orderId?: string;
    amount: number; status: string; issueDate: string; dueDate?: string;
    paidDate?: string; createdAt: string; updatedAt: string;
}

export interface Subcontractor {
    id: string; companyName: string; contactPerson: string; phone: string;
    tier: string; vehicleCount: number; performanceScore: number;
    onTimeRate: number; bounceRate: number; status: string; totalTrips: number;
    licenseValid: boolean; insuranceValid: boolean; joinDate: string;
    createdAt: string; updatedAt: string;
}

export interface Alert {
    id: number; type: string; title: string; message?: string;
    severity: string; isRead: boolean; entityType?: string;
    entityId?: string; createdAt: string;
}

export interface RevenueMonthly {
    month: string; year: number; revenue: number; cost: number; profit: number;
}

export interface DashboardStats {
    totalVehicles: number; activeVehicles: number; totalDrivers: number;
    onDutyDrivers: number; pendingOrders: number; activeTrips: number;
    monthlyRevenue: number; onTimeRate: number;
}

export interface Notification {
    id: number; type: string; title: string; message: string;
    time: string; read: boolean; icon: string;
}

export interface AIInsight {
    type: string; title: string; detail: string;
    impact: string; priority: string;
}

export interface RouteOptimization {
    distance: number; duration: string; fuelCost: number;
    tollCost: number; totalCost: number; co2Emission: number;
    waypoints: { name: string; lat: number; lng: number; type: string; eta: string }[];
    optimizedScore: number; savings: number; algorithm: string;
}

// ========== API Functions ==========
export interface LiquidType { id: number; name: string; status?: string; createdAt?: string; updatedAt?: string; [key: string]: any; }
export interface MechanicType { id: number; name: string; status?: string; createdAt?: string; updatedAt?: string; [key: string]: any; }
export interface ParkingType { id: number; name: string; status?: string; createdAt?: string; updatedAt?: string; [key: string]: any; }
export interface PartCategory { id: number; name: string; status?: string; createdAt?: string; updatedAt?: string; [key: string]: any; }
export interface PartGroup { id: number; name: string; status?: string; createdAt?: string; updatedAt?: string; [key: string]: any; }
export interface StorageType { id: number; name: string; status?: string; createdAt?: string; updatedAt?: string; [key: string]: any; }
export interface UnitType { id: number; name: string; status?: string; createdAt?: string; updatedAt?: string; [key: string]: any; }
export interface VehicleType { id: number; name: string; status?: string; createdAt?: string; updatedAt?: string; [key: string]: any; }
export interface MechanicExpertise { id: number; name: string; status?: string; createdAt?: string; updatedAt?: string; [key: string]: any; }
export interface SystemApp { id: number; app_name: string; icon_url?: string; route_path?: string; is_active?: boolean; seq_no?: number; [key: string]: any; }

export const systemAppService = {
    getAll: () => fetchAPI<SystemApp[]>('/system-apps'),
};

// ========== Templates API (nex-core-api port 8101) ==========
const CORE_API_BASE = process.env.NEXT_PUBLIC_CORE_API_URL
    ? `${process.env.NEXT_PUBLIC_CORE_API_URL}/templates`
    : 'http://localhost:8101/api/templates';

export interface Template {
    template_id: number;
    template_group: string;
    template_name: string;
    template_desc: string;
    is_active: boolean;
    create_date?: string;
    create_by?: string;
    update_date?: string;
    update_by?: string;
}

async function coreGet<T>(path: string): Promise<T> {
    const res = await fetch(`${CORE_API_BASE}${path}`, { credentials: 'include' });
    if (!res.ok) throw new Error(`Core API Error: ${res.status}`);
    return res.json() as Promise<T>;
}

async function corePost<T>(path: string, body: unknown): Promise<T> {
    const res = await fetch(`${CORE_API_BASE}${path}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        credentials: 'include'
    });
    if (!res.ok) throw new Error(`Core API Error: ${res.status}`);
    return res.json() as Promise<T>;
}

async function corePut<T>(path: string, body: unknown): Promise<T> {
    const res = await fetch(`${CORE_API_BASE}${path}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        credentials: 'include'
    });
    if (!res.ok) throw new Error(`Core API Error: ${res.status}`);
    return res.json() as Promise<T>;
}

async function coreDelete<T>(path: string): Promise<T> {
    const res = await fetch(`${CORE_API_BASE}${path}`, { method: 'DELETE', credentials: 'include' });
    if (!res.ok) throw new Error(`Core API Error: ${res.status}`);
    return res.json() as Promise<T>;
}
export interface Announcement {
  id: string;
  title: string;
  message: string;
  targetType: string;
  targetIds: any;
  isActive: boolean;
  scheduleDate?: string;
  endDate?: string;
  createDate: string;
  updateDate: string;
}

const CORE_V1_API_BASE = process.env.NEXT_PUBLIC_CORE_API_URL
    ? `${process.env.NEXT_PUBLIC_CORE_API_URL}/v1`
    : 'http://localhost:8101/api/v1';

async function coreV1Get<T>(path: string): Promise<T> {
    const res = await fetch(`${CORE_V1_API_BASE}${path}`, { credentials: 'include' });
    if (!res.ok) throw new Error(`Core API Error: ${res.status}`);
    const json = await res.json();
    return (json && json.data !== undefined) ? json.data as T : json as T;
}

async function coreV1Post<T>(path: string, body: unknown): Promise<T> {
    const res = await fetch(`${CORE_V1_API_BASE}${path}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        credentials: 'include'
    });
    if (!res.ok) throw new Error(`Core API Error: ${res.status}`);
    const json = await res.json();
    return (json && json.data !== undefined) ? json.data as T : json as T;
}

async function coreV1Put<T>(path: string, body: unknown): Promise<T> {
    const res = await fetch(`${CORE_V1_API_BASE}${path}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        credentials: 'include'
    });
    if (!res.ok) throw new Error(`Core API Error: ${res.status}`);
    const json = await res.json();
    return (json && json.data !== undefined) ? json.data as T : json as T;
}

async function coreV1Delete<T>(path: string): Promise<T> {
    const res = await fetch(`${CORE_V1_API_BASE}${path}`, { method: 'DELETE', credentials: 'include' });
    if (!res.ok) throw new Error(`Core API Error: ${res.status}`);
    const json = await res.json();
    return (json && json.data !== undefined) ? json.data as T : json as T;
}

export const coreAnnouncementApi = {
    getAll: () => coreV1Get<Announcement[]>('/announcements'),
    getOne: (id: string) => coreV1Get<Announcement>(`/announcements/${id}`),
    create: (dto: Partial<Announcement>) => coreV1Post<Announcement>('/announcements', dto),
    update: (id: string, dto: Partial<Announcement>) => coreV1Put<Announcement>(`/announcements/${id}`, dto),
    remove: (id: string) => coreV1Delete<void>(`/announcements/${id}`),
};

export const templateApi = {
    getAll: () => coreGet<Template[]>(''),
    getOne: (id: number) => coreGet<Template>(`/${id}`),
    create: (dto: Partial<Template>) => corePost<Template>('', dto),
    update: (id: number, dto: Partial<Template>) => corePut<Template>(`/${id}`, dto),
    remove: (id: number) => coreDelete<void>(`/${id}`),
    toggleStatus: (id: number, is_active: boolean) =>
        corePut<Template>(`/${id}/status`, { is_active }),
};

export const coreDashboardApi = {
    getUsersStats: async () => {
        const baseUrl = process.env.NEXT_PUBLIC_CORE_API_URL 
            ? `${process.env.NEXT_PUBLIC_CORE_API_URL}/v1` 
            : 'http://localhost:8101/api/v1';
        const res = await fetch(`${baseUrl}/dashboard/users-stats`);
        if (!res.ok) throw new Error(`Core API Error: ${res.status}`);
        return res.json() as Promise<{ totalUsers: number, onlineUsers: number }>;
    }
};


export const api = {
    // Basic types
    getLiquidTypes: () => fetchAPI<LiquidType[]>('/liquid-types'),

    createLiquidType: (data: Partial<LiquidType>) => postAPI('/liquid-types', data),
    updateLiquidType: (id: number, data: Partial<LiquidType>) => putAPI(`/liquid-types/${id}`, data),
    deleteLiquidType: (id: number) => deleteAPI(`/liquid-types/${id}`),

    getMechanicExpertise: () => fetchAPI<MechanicExpertise[]>('/mechanic-expertise'),
    createMechanicExpertise: (data: Partial<MechanicExpertise>) => postAPI('/mechanic-expertise', data),
    updateMechanicExpertise: (id: number, data: Partial<MechanicExpertise>) => putAPI(`/mechanic-expertise/${id}`, data),
    deleteMechanicExpertise: (id: number) => deleteAPI(`/mechanic-expertise/${id}`),

    getMechanicTypes: () => fetchAPI<MechanicType[]>('/mechanic-types'),
    createMechanicType: (data: Partial<MechanicType>) => postAPI('/mechanic-types', data),
    updateMechanicType: (id: number, data: Partial<MechanicType>) => putAPI(`/mechanic-types/${id}`, data),
    deleteMechanicType: (id: number) => deleteAPI(`/mechanic-types/${id}`),

    getParkingTypes: () => fetchAPI<ParkingType[]>('/parking-types'),
    createParkingType: (data: Partial<ParkingType>) => postAPI('/parking-types', data),
    updateParkingType: (id: number, data: Partial<ParkingType>) => putAPI(`/parking-types/${id}`, data),
    deleteParkingType: (id: number) => deleteAPI(`/parking-types/${id}`),

    getPartCategories: () => fetchAPI<PartCategory[]>('/part-categories'),
    createPartCategory: (data: Partial<PartCategory>) => postAPI('/part-categories', data),
    updatePartCategory: (id: number, data: Partial<PartCategory>) => putAPI(`/part-categories/${id}`, data),
    deletePartCategory: (id: number) => deleteAPI(`/part-categories/${id}`),

    getPartGroups: () => fetchAPI<PartGroup[]>('/part-groups'),
    createPartGroup: (data: Partial<PartGroup>) => postAPI('/part-groups', data),
    updatePartGroup: (id: number, data: Partial<PartGroup>) => putAPI(`/part-groups/${id}`, data),
    deletePartGroup: (id: number) => deleteAPI(`/part-groups/${id}`),

    getStorageTypes: () => fetchAPI<StorageType[]>('/storage-types'),
    createStorageType: (data: Partial<StorageType>) => postAPI('/storage-types', data),
    updateStorageType: (id: number, data: Partial<StorageType>) => putAPI(`/storage-types/${id}`, data),
    deleteStorageType: (id: number) => deleteAPI(`/storage-types/${id}`),

    getUnitTypes: () => fetchAPI<UnitType[]>('/unit-types'),
    createUnitType: (data: Partial<UnitType>) => postAPI('/unit-types', data),
    updateUnitType: (id: number, data: Partial<UnitType>) => putAPI(`/unit-types/${id}`, data),
    deleteUnitType: (id: number) => deleteAPI(`/unit-types/${id}`),

    getVehicleTypes: () => fetchAPI<VehicleType[]>('/vehicle-types'),
    createVehicleType: (data: Partial<VehicleType>) => postAPI('/vehicle-types', data),
    updateVehicleType: (id: number, data: Partial<VehicleType>) => putAPI(`/vehicle-types/${id}`, data),
    deleteVehicleType: (id: number) => deleteAPI(`/vehicle-types/${id}`),

    updateMaintenancePlan: (id: number, data: any) => putAPI(`/maintenance-plans/${id}`, data),

    // Dashboard
    getDashboardStats: () => fetchAPI<DashboardStats>('/dashboard/stats'),
    getAlerts: () => fetchAPI<Alert[]>('/dashboard/alerts'),
    getRevenue: () => fetchAPI<RevenueMonthly[]>('/dashboard/revenue'),

    // Vehicles
    getVehicles: () => fetchAPI<Vehicle[]>('/vehicles'),
    getVehicle: (id: string) => fetchAPI<Vehicle>(`/vehicles/${id}`),
    createVehicle: (v: Partial<Vehicle>) => postAPI('/vehicles', v),
    updateVehicle: (id: string, v: Partial<Vehicle>) => putAPI(`/vehicles/${id}`, v),
    deleteVehicle: (id: string) => deleteAPI(`/vehicles/${id}`),

    // Drivers
    getDrivers: () => fetchAPI<Driver[]>('/drivers'),
    createDriver: (d: Partial<Driver>) => postAPI('/drivers', d),
    updateDriver: (id: string, d: Partial<Driver>) => putAPI(`/drivers/${id}`, d),
    deleteDriver: (id: string) => deleteAPI(`/drivers/${id}`),

    // Orders
    getOrders: () => fetchAPI<Order[]>('/orders'),
    createOrder: (o: Partial<Order>) => postAPI('/orders', o),
    updateOrder: (id: string, o: Partial<Order>) => putAPI(`/orders/${id}`, o),
    deleteOrder: (id: string) => deleteAPI(`/orders/${id}`),

    // Trips
    getTrips: () => fetchAPI<Trip[]>('/trips'),
    createTrip: (t: Partial<Trip>) => postAPI('/trips', t),
    updateTrip: (id: string, t: Partial<Trip>) => putAPI(`/trips/${id}`, t),
    deleteTrip: (id: string) => deleteAPI(`/trips/${id}`),

    // Invoices
    getInvoices: () => fetchAPI<Invoice[]>('/invoices'),
    createInvoice: (inv: Partial<Invoice>) => postAPI('/invoices', inv),
    updateInvoice: (id: string, inv: Partial<Invoice>) => putAPI(`/invoices/${id}`, inv),
    deleteInvoice: (id: string) => deleteAPI(`/invoices/${id}`),

    // Subcontractors
    getSubcontractors: () => fetchAPI<Subcontractor[]>('/subcontractors'),
    createSubcontractor: (s: Partial<Subcontractor>) => postAPI('/subcontractors', s),
    updateSubcontractor: (id: string, s: Partial<Subcontractor>) => putAPI(`/subcontractors/${id}`, s),
    deleteSubcontractor: (id: string) => deleteAPI(`/subcontractors/${id}`),

    // Phase 4: AI & Notifications
    getNotifications: async () => {
        const res = await fetch(`${API_BASE}/notifications`);
        const json = await res.json();
        return json as { data: Notification[]; unread: number; total: number };
    },
    getAIInsights: async () => {
        const res = await fetch(`${API_BASE}/ai/insights`);
        const json = await res.json();
        return json.data as { insights: AIInsight[]; score: number };
    },
    optimizeRoute: (body: { origin: string; destination: string; originLat: number; originLng: number; destLat: number; destLng: number; vehicleType?: string; weight?: number }) =>
        postAPI<{ data: RouteOptimization }>('/ai/optimize-route', body),

    // Maintenance Records
    getMaintenanceRecords: () => fetchAPI<MaintenanceRecord[]>('/maintenance'),
    createMaintenanceRecord: (r: Partial<MaintenanceRecord>) => postAPI('/maintenance', r),
    updateMaintenanceRecord: (id: string, r: Partial<MaintenanceRecord>) => putAPI(`/maintenance/${id}`, r),
    deleteMaintenanceRecord: (id: string) => deleteAPI(`/maintenance/${id}`),

    // Mechanics
    getMechanics: () => fetchAPI<Mechanic[]>('/mechanics'),
    createMechanic: (r: Partial<Mechanic>) => postAPI('/mechanics', r),
    updateMechanic: (id: string, r: Partial<Mechanic>) => putAPI(`/mechanics/${id}`, r),
    deleteMechanic: (id: string) => deleteAPI(`/mechanics/${id}`),

    // Container Mechanics
    getContainerMechanics: () => fetchAPI<ContainerMechanic[]>('/container-mechanics'),
    createContainerMechanic: (r: Partial<ContainerMechanic>) => postAPI('/container-mechanics', r),
    updateContainerMechanic: (id: string, r: Partial<ContainerMechanic>) => putAPI(`/container-mechanics/${id}`, r),
    deleteContainerMechanic: (id: string) => deleteAPI(`/container-mechanics/${id}`),

    // Parts Shops
    getPartsShops: () => fetchAPI<PartsShop[]>('/parts-shops'),
    createPartsShop: (r: Partial<PartsShop>) => postAPI('/parts-shops', r),
    updatePartsShop: (id: string, r: Partial<PartsShop>) => putAPI(`/parts-shops/${id}`, r),
    deletePartsShop: (id: string) => deleteAPI(`/parts-shops/${id}`),

    // Stock Parts
    getStockParts: () => fetchAPI<StockPart[]>('/stock-parts'),
    createStockPart: (r: Partial<StockPart>) => postAPI('/stock-parts', r),
    updateStockPart: (id: string, r: Partial<StockPart>) => putAPI(`/stock-parts/${id}`, r),
    deleteStockPart: (id: string) => deleteAPI(`/stock-parts/${id}`),

    // Stock Oil
    getStockOil: () => fetchAPI<StockOil[]>('/stock-oil'),
    createStockOil: (r: Partial<StockOil>) => postAPI('/stock-oil', r),
    updateStockOil: (id: string, r: Partial<StockOil>) => putAPI(`/stock-oil/${id}`, r),
    deleteStockOil: (id: string) => deleteAPI(`/stock-oil/${id}`),

    // Storage Locations
    getStorageLocations: () => fetchAPI<StorageLocation[]>('/storage'),
    createStorageLocation: (r: Partial<StorageLocation>) => postAPI('/storage', r),
    updateStorageLocation: (id: string, r: Partial<StorageLocation>) => putAPI(`/storage/${id}`, r),
    deleteStorageLocation: (id: string) => deleteAPI(`/storage/${id}`),

    // Parking Lots
    getParkingLots: () => fetchAPI<ParkingLot[]>('/parking'),
    createParkingLot: (r: Partial<ParkingLot>) => postAPI('/parking', r),
    updateParkingLot: (id: string, r: Partial<ParkingLot>) => putAPI(`/parking/${id}`, r),
    deleteParkingLot: (id: string) => deleteAPI(`/parking/${id}`),

    // Brands
    getBrands: () => fetchAPI<Brand[]>('/brands'),
    createBrand: (r: Partial<Brand>) => postAPI('/brands', r),
    updateBrand: (id: number, r: Partial<Brand>) => putAPI(`/brands/${id}`, r),
    deleteBrand: (id: number) => deleteAPI(`/brands/${id}`),

    // Provinces
    getProvinces: () => fetchAPI<Province[]>('/provinces'),
    createProvince: (r: Partial<Province>) => postAPI('/provinces', r),
    updateProvince: (id: number, r: Partial<Province>) => putAPI(`/provinces/${id}`, r),
    deleteProvince: (id: number) => deleteAPI(`/provinces/${id}`),

    // Locations
    getLocations: () => fetchAPI<LocationItem[]>('/locations'),
    createLocation: (r: Partial<LocationItem>) => postAPI('/locations', r),
    updateLocation: (id: number, r: Partial<LocationItem>) => putAPI(`/locations/${id}`, r),
    deleteLocation: (id: number) => deleteAPI(`/locations/${id}`),

    // System Users
    getSystemUsers: () => fetchAPI<SystemUser[]>('/system-users'),
    createSystemUser: (r: Partial<SystemUser>) => postAPI('/system-users', r),
    updateSystemUser: (id: number, r: Partial<SystemUser>) => putAPI(`/system-users/${id}`, r),
    deleteSystemUser: (id: number) => deleteAPI(`/system-users/${id}`),
};

// ========== New Interfaces ==========
export interface MaintenanceRecord {
    id: string; vehicleId: string; type: string; description: string;
    status: string; priority: string; scheduledDate?: string; completedDate?: string;
    cost: number; mechanic: string; garage: string; mileageAt: number;
    notes: string; createdAt: string; updatedAt: string;
}

export interface Mechanic {
    id: string; name: string; phone: string; specialization: string;
    experience: number; rating: number; garage: string; address: string;
    certification: string; status: string; notes: string;
    createdAt: string; updatedAt: string;
}

export interface ContainerMechanic {
    id: string; name: string; phone: string; specialization: string;
    experience: number; rating: number; garage: string; address: string;
    certification: string; status: string; notes: string;
    createdAt: string; updatedAt: string;
}

export interface PartsShop {
    id: string; name: string; contactPerson: string; phone: string;
    lineId: string; category: string; address: string; rating: number;
    status: string; notes: string; createdAt: string; updatedAt: string;
}

export interface StockPart {
    id: string; name: string; partNumber: string; category: string;
    quantity: number; minStock: number; unit: string; unitPrice: number;
    location: string; supplier: string; status: string;
    createdAt: string; updatedAt: string;
}

export interface StockOil {
    id: string; name: string; type: string; brand: string;
    quantity: number; minStock: number; unit: string; unitPrice: number;
    location: string; supplier: string; expiryDate?: string; status: string;
    createdAt: string; updatedAt: string;
}

export interface StorageLocation {
    id: string; name: string; type: string; address: string;
    capacity: string; currentUsage: string; contactPerson: string;
    phone: string; status: string; notes: string;
    createdAt: string; updatedAt: string;
}

export interface ParkingLot {
    id: string; name: string; address: string; totalSlots: number;
    usedSlots: number; type: string; facilities: string;
    contactPerson: string; phone: string; monthlyRent: number;
    status: string; notes: string; createdAt: string; updatedAt: string;
}

export interface Brand {
    id: number; name: string; nameEn: string; country: string;
    logo: string; models: string; createdAt: string; updatedAt: string;
}

export interface Province {
    id: number; name: string; nameEn: string; abbr: string;
    region: string; createdAt: string; updatedAt: string;
}

export interface LocationItem {
    id: number; name: string; type: string; address: string;
    province: string; lat: number; lng: number;
    status?: string;
    createdAt: string; updatedAt: string;
}

export interface SystemUser {
    id: number; username: string; name: string; email: string;
    role: string; avatar: string; isActive: boolean;
    lastLogin: string | null; createdAt: string; updatedAt: string;
}

