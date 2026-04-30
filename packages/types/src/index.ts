// packages/types/src/index.ts
// Shared TypeScript Types for all NexOne Platform apps

// ── Common ────────────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
    data: T;
    success: boolean;
    message?: string;
    pagination?: PaginationMeta;
}

export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export type SortDirection = 'asc' | 'desc';

export interface SortConfig {
    field: string;
    direction: SortDirection;
}

// ── Auth / Users ──────────────────────────────────────────────────────────────

export type UserRole =
    | 'super_admin' | 'admin' | 'manager'
    | 'dispatcher' | 'driver' | 'accountant'
    | 'warehouse' | 'sales' | 'viewer';

export interface NexUser {
    id: string;
    username: string;
    name: string;
    email: string;
    phone?: string;
    avatar?: string;
    role: UserRole;
    permissions: string[];
    appAccess: string[];          // App IDs user can access
    tenantId: string;
    isActive: boolean;
    lastLogin?: string;
    createdAt: string;
    updatedAt: string;
}

export interface Company {
    id: string;
    name: string;
    nameEn?: string;
    taxId: string;
    address: string;
    phone?: string;
    email?: string;
    logo?: string;
    tenantId: string;
}

// ── NexSpeed — TMS ────────────────────────────────────────────────────────────

export type VehicleStatus = 'available' | 'on-trip' | 'maintenance' | 'inactive';
export type TripStatus = 'pending' | 'loading' | 'in-transit' | 'delivered' | 'cancelled';
export type OrderStatus = 'pending' | 'assigned' | 'in-transit' | 'delivered' | 'cancelled';
export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';

export interface Vehicle {
    id: string; plateNumber: string; type: string; brand: string; model: string;
    year: number; status: VehicleStatus; fuelLevel: number; mileage: number;
    nextMaintenance: string; insuranceExpiry: string; driverId?: string;
    currentLat?: number; currentLng?: number; capacity: number;
    createdAt: string; updatedAt: string;
}

export interface Driver {
    id: string; name: string; phone: string; licenseType: string; licenseExpiry: string;
    status: string; safetyScore: number; hoursToday: number; totalTrips: number;
    vehicleId?: string; createdAt: string; updatedAt: string;
}

export interface TransportOrder {
    id: string; customerName: string; origin: string; destination: string;
    cargoType: string; weight: number; status: OrderStatus; priority: string;
    deliveryDate: string; estimatedCost: number; vehicleId?: string;
    driverId?: string; createdAt: string; updatedAt: string;
}

export interface Trip {
    id: string; orderId: string; vehicleId: string; driverId: string;
    status: TripStatus; origin: string; destination: string;
    departureTime: string; estimatedArrival: string; actualArrival?: string;
    distance: number; progress: number; currentLat: number; currentLng: number;
    fuelCost?: number; tollCost?: number; driverCost?: number; totalCost?: number;
    profit?: number; createdAt: string; updatedAt: string;
}

export interface EPODRecord {
    id: string; tripId: string; receiverName: string;
    signatureUrl?: string; productPhotoUrl?: string;
    deliveryPhotoUrl?: string; notes?: string;
    lat?: number; lng?: number;
    submittedAt: string; createdAt: string;
}

export interface TripCostBreakdown {
    tripId: string;
    distance: number;
    fuelLiters: number;
    fuelCost: number;
    tollCost: number;
    driverWage: number;
    maintenanceCost: number;
    otherCost: number;
    totalCost: number;
    revenue: number;
    profit: number;
    profitMargin: number;  // %
    costPerKm: number;
}

export interface Invoice {
    id: string; invoiceNo: string; customerName: string;
    tripId?: string; orderId?: string;
    amount: number; tax: number; totalAmount: number;
    status: InvoiceStatus; issueDate: string; dueDate?: string;
    paidDate?: string; notes?: string;
    createdAt: string; updatedAt: string;
}

export interface TrackingToken {
    token: string;      // public trackable token (no auth required)
    tripId: string;
    expiresAt: string;
    customerName: string;
    origin: string;
    destination: string;
}

// ── NexStock — WMS ────────────────────────────────────────────────────────────

export type StockMovementType = 'receive' | 'issue' | 'transfer' | 'adjust' | 'return';

export interface StockItem {
    id: string; sku: string; name: string; category: string;
    unit: string; quantity: number; minStock: number;
    unitCost: number; location: string; supplierId?: string;
    batchNo?: string; expiryDate?: string;
    createdAt: string; updatedAt: string;
}

export interface StockMovement {
    id: string; type: StockMovementType; itemId: string;
    quantity: number; fromLocation?: string; toLocation?: string;
    reference?: string; notes?: string;
    createdBy: string; createdAt: string;
}

// ── NexSales — CRM ────────────────────────────────────────────────────────────

export type LeadStage = 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost';

export interface Lead {
    id: string; name: string; company?: string; phone?: string; email?: string;
    source: string; stage: LeadStage; value?: number; assignedTo?: string;
    notes?: string; createdAt: string; updatedAt: string;
}

export interface Quotation {
    id: string; quoteNo: string; customerId: string; customerName: string;
    items: QuotationItem[]; subtotal: number; discount: number;
    tax: number; total: number; status: string;
    validUntil: string; createdAt: string; updatedAt: string;
}

export interface QuotationItem {
    id: string; description: string; quantity: number;
    unitPrice: number; unit: string; total: number;
}

// ── NexFinance ────────────────────────────────────────────────────────────────

export type JournalEntryType = 'debit' | 'credit';

export interface JournalEntry {
    id: string; date: string; description: string;
    debitAccount: string; creditAccount: string;
    amount: number; reference?: string;
    createdBy: string; createdAt: string;
}

export interface Account {
    id: string; code: string; name: string;
    type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
    balance: number; parentId?: string;
}

// ── NexForce — HRM ────────────────────────────────────────────────────────────

export type EmployeeStatus = 'active' | 'onleave' | 'terminated' | 'probation';

export interface Employee {
    id: string; employeeNo: string; name: string; nameEn?: string;
    email: string; phone: string; departmentId: string; positionId: string;
    status: EmployeeStatus; startDate: string; salary?: number;
    avatarUrl?: string; managerId?: string;
    createdAt: string; updatedAt: string;
}

export interface LeaveRequest {
    id: string; employeeId: string; type: string;
    startDate: string; endDate: string; days: number;
    reason: string; status: 'pending' | 'approved' | 'rejected';
    approvedBy?: string; approvedAt?: string;
    createdAt: string;
}

// ── Notifications ─────────────────────────────────────────────────────────────

export type NotificationSeverity = 'info' | 'warning' | 'critical' | 'success';

export interface Notification {
    id: number; type: string; title: string; message: string;
    severity: NotificationSeverity; isRead: boolean;
    entityType?: string; entityId?: string;
    icon?: string; createdAt: string;
}

// ── GPS / Maps ────────────────────────────────────────────────────────────────

export interface GPSUpdate {
    vehicleId: string; tripId?: string;
    lat: number; lng: number; speed: number;
    heading?: number; fuelLevel?: number;
    progress?: number; status?: TripStatus;
    timestamp: string;
}

export interface Geofence {
    id: string; name: string;
    lat: number; lng: number; radius: number;  // meters
    type: 'depot' | 'customer' | 'rest_area' | 'restricted';
    isActive: boolean;
}

// ── System ────────────────────────────────────────────────────────────────────

export interface SystemApp {
    id: number; appName: string; appCode: string;
    description?: string; iconUrl?: string; routePath?: string;
    port?: number; isActive: boolean; seqNo?: number;
    group?: string;
}

export interface AuditLog {
    id: string; userId: string; userName: string;
    action: string; entityType: string; entityId: string;
    oldValues?: Record<string, unknown>;
    newValues?: Record<string, unknown>;
    ipAddress?: string; userAgent?: string;
    createdAt: string;
}
