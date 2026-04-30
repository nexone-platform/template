-- ===============================================================================
-- NexOne ERP : Schema Tables Creation Script (Including Legacy Tables Migration)
-- Based on: NexOne_ERP_Dev_Spec.md & table_module_mapping.md
-- ===============================================================================

-- 0. NexCore (System, Auth, Admin & Localization)
CREATE TABLE IF NOT EXISTS nex_core.users (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    email varchar(100) NOT NULL UNIQUE,
    password varchar(255) NOT NULL,
    display_name varchar(100),
    role_id integer DEFAULT 2,
    role_name varchar(50) DEFAULT 'user',
    is_active boolean DEFAULT true,
    employee_id varchar(50),
    avatar_url varchar(500),
    app_access text DEFAULT '["nex-core"]',
    last_login_at timestamp,
    failed_login_count integer DEFAULT 0,
    locked_until timestamp,
    create_date timestamp DEFAULT now(), create_by varchar(50),
    update_date timestamp, update_by varchar(50)
);
-- Default admin user (password: admin123 — CHANGE IN PRODUCTION!)
-- Password hash generated with PBKDF2-SHA512 + random salt
INSERT INTO nex_core.users (email, password, display_name, role_id, role_name, app_access, create_by)
SELECT 'admin@nexone.local',
       -- ⚠️ This is a placeholder hash. Run the app and use /api/auth/register to create real users.
       'CHANGE_ME:REGISTER_VIA_API',
       'System Admin', 1, 'admin', '["nex-core","nexspeed","nexforce","nexstock","nexsite"]', 'system'
WHERE NOT EXISTS (SELECT 1 FROM nex_core.users WHERE email = 'admin@nexone.local');

CREATE TABLE IF NOT EXISTS nex_core.sessions (
    id varchar(128) PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES nex_core.users(id) ON DELETE CASCADE,
    ip_address varchar(45),
    user_agent text,
    device_name varchar(100),
    is_active boolean DEFAULT true,
    expires_at timestamp NOT NULL,
    created_at timestamp DEFAULT now(),
    last_activity_at timestamp DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON nex_core.sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON nex_core.sessions(expires_at);

CREATE TABLE IF NOT EXISTS nex_core.menus (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    menu_name varchar(100), url varchar(255), parent_id uuid
);
CREATE TABLE IF NOT EXISTS nex_core.roles (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    role_name varchar(100), description text
);
CREATE TABLE IF NOT EXISTS nex_core.role_permissions (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    role_id uuid, menu_id uuid, can_read boolean, can_write boolean
);
CREATE TABLE IF NOT EXISTS nex_core.otps (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid, otp_code varchar(10), expires_at timestamp
);
CREATE TABLE IF NOT EXISTS nex_core.programs (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    program_name varchar(100), app_code varchar(50)
);
CREATE TABLE IF NOT EXISTS nex_core.system_configs (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    config_key varchar(100), config_value text
);
CREATE TABLE IF NOT EXISTS nex_core.categories (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    category_name varchar(100), module varchar(50)
);
CREATE TABLE IF NOT EXISTS nex_core.document_running_controls (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    prefix varchar(20), last_number integer, length integer
);
CREATE TABLE IF NOT EXISTS nex_core.logs (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    level varchar(20), message text, module varchar(50)
);
CREATE TABLE IF NOT EXISTS nex_core.languages (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    code varchar(10), name varchar(50)
);
CREATE TABLE IF NOT EXISTS nex_core.language_translations (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    language_code varchar(10), translation_key varchar(255), translation_value text
);
CREATE TABLE IF NOT EXISTS nex_core.labels (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    label_key varchar(255), default_value text
);
CREATE TABLE IF NOT EXISTS nex_core.response_messages (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    message_code varchar(50), default_message text
);
CREATE TABLE IF NOT EXISTS nex_core.email_settings (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    smtp_host varchar(255), smtp_port integer, smtp_user varchar(255), smtp_password varchar(255)
);
CREATE TABLE IF NOT EXISTS nex_core.email_templates (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    template_code varchar(100), subject varchar(255), body text
);
CREATE TABLE IF NOT EXISTS nex_core.notification_channels (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    channel_name varchar(100)
);
CREATE TABLE IF NOT EXISTS nex_core.notification_modules (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    module_name varchar(100)
);
CREATE TABLE IF NOT EXISTS nex_core.notification_settings (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid, email_enabled boolean, push_enabled boolean
);
CREATE TABLE IF NOT EXISTS nex_core.announcements (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    title varchar(255) NOT NULL,
    message text,
    target_type varchar(50) NOT NULL,
    target_ids jsonb,
    is_active boolean DEFAULT true
);


-- 1. NexSpeed (TMS)
CREATE TABLE IF NOT EXISTS nex_speed.fleet_vehicles (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    license_plate varchar(50) NOT NULL, vehicle_type varchar(50), status varchar(50) DEFAULT 'ACTIVE'
);
CREATE TABLE IF NOT EXISTS nex_speed.subcontractors (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name varchar(255) NOT NULL, contact_info varchar(255), status varchar(50) DEFAULT 'ACTIVE'
);
CREATE TABLE IF NOT EXISTS nex_speed.vehicle_inspections (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    vehicle_id uuid, inspection_date timestamp, status varchar(50) DEFAULT 'PASSED'
);
CREATE TABLE IF NOT EXISTS nex_speed.drivers (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    first_name varchar(100), last_name varchar(100), license_number varchar(100)
);
CREATE TABLE IF NOT EXISTS nex_speed.trips (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    vehicle_id uuid, driver_id uuid, trip_status varchar(50) DEFAULT 'PLANNED'
);
CREATE TABLE IF NOT EXISTS nex_speed.trip_expenses (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    trip_id uuid, expense_type varchar(50), amount numeric(10,2)
);
CREATE TABLE IF NOT EXISTS nex_speed.maintenance_logs (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    vehicle_id uuid, description text, cost numeric(10,2)
);
CREATE TABLE IF NOT EXISTS nex_speed.fuel_logs (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    vehicle_id uuid, liters numeric(10,2), total_cost numeric(10,2)
);
CREATE TABLE IF NOT EXISTS nex_speed.invoices (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    trip_id uuid, total_amount numeric(10,2), status varchar(50) DEFAULT 'DRAFT'
);
CREATE TABLE IF NOT EXISTS nex_speed.trip_costs (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    trip_id uuid, analyzed_cost numeric(10,2)
);
CREATE TABLE IF NOT EXISTS nex_speed.queues (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    vehicle_id uuid, queue_number varchar(50), status varchar(50) DEFAULT 'WAITING'
);

-- 2. NexStock (WMS)
CREATE TABLE IF NOT EXISTS nex_stock.inventory_items (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    sku varchar(100) NOT NULL, name varchar(255), quantity numeric(10,2) DEFAULT 0
);
CREATE TABLE IF NOT EXISTS nex_stock.locations (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    zone varchar(50), rack varchar(50), shelf varchar(50)
);
CREATE TABLE IF NOT EXISTS nex_stock.stock_movements (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    item_id uuid, movement_type varchar(50), quantity numeric(10,2)
);
CREATE TABLE IF NOT EXISTS nex_stock.stock_counts (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    item_id uuid, counted_quantity numeric(10,2), difference numeric(10,2)
);
CREATE TABLE IF NOT EXISTS nex_stock.lots (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    item_id uuid, lot_number varchar(100), expiry_date timestamp
);
CREATE TABLE IF NOT EXISTS nex_stock.returns (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    item_id uuid, return_reason varchar(255), status varchar(50) DEFAULT 'PENDING'
);
CREATE TABLE IF NOT EXISTS nex_stock.picking_orders (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    sales_order_id uuid, status varchar(50) DEFAULT 'PENDING'
);

-- 3. NexLess (Paperless)
CREATE TABLE IF NOT EXISTS nex_less.document_templates (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name varchar(255), content text
);
CREATE TABLE IF NOT EXISTS nex_less.e_forms (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    template_id uuid, form_data jsonb
);
CREATE TABLE IF NOT EXISTS nex_less.e_signatures (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    document_id uuid, signed_by varchar(100), signature_data text
);
CREATE TABLE IF NOT EXISTS nex_less.approval_workflows (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    document_id uuid, status varchar(50) DEFAULT 'PENDING'
);
CREATE TABLE IF NOT EXISTS nex_less.documents (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    title varchar(255), file_url varchar(255)
);

-- 4. NexProduce (MES + APS)
CREATE TABLE IF NOT EXISTS nex_produce.production_plans (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    plan_name varchar(255), target_date timestamp
);
CREATE TABLE IF NOT EXISTS nex_produce.work_centers (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    center_code varchar(50), capacity numeric(10,2)
);
CREATE TABLE IF NOT EXISTS nex_produce.production_orders (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    plan_id uuid, status varchar(50) DEFAULT 'PLANNED'
);
CREATE TABLE IF NOT EXISTS nex_produce.shop_floor_logs (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id uuid, log_details text
);
CREATE TABLE IF NOT EXISTS nex_produce.material_consumptions (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id uuid, material_id uuid, consumed_quantity numeric(10,2)
);
CREATE TABLE IF NOT EXISTS nex_produce.labor_trackings (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id uuid, employee_id uuid, hours_worked numeric(5,2)
);
CREATE TABLE IF NOT EXISTS nex_produce.quality_controls (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id uuid, qc_result varchar(50), remarks text
);
CREATE TABLE IF NOT EXISTS nex_produce.scraps (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id uuid, scrap_quantity numeric(10,2)
);

-- 5. NexSales (CRM)
CREATE TABLE IF NOT EXISTS nex_sales.leads (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    company_name varchar(255), contact_name varchar(255), status varchar(50) DEFAULT 'NEW'
);
CREATE TABLE IF NOT EXISTS nex_sales.opportunities (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    lead_id uuid, value numeric(10,2), stage varchar(50)
);
CREATE TABLE IF NOT EXISTS nex_sales.customers (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name varchar(255), tax_id varchar(50), credit_limit numeric(10,2)
);
CREATE TABLE IF NOT EXISTS nex_sales.quotations (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id uuid, total_amount numeric(10,2), status varchar(50) DEFAULT 'DRAFT'
);
CREATE TABLE IF NOT EXISTS nex_sales.sales_orders (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    quotation_id uuid, amount numeric(10,2), status varchar(50) DEFAULT 'CONFIRMED'
);
CREATE TABLE IF NOT EXISTS nex_sales.customer_contracts (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id uuid, start_date timestamp, end_date timestamp
);
CREATE TABLE IF NOT EXISTS nex_sales.price_lists (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    item_id uuid, tier_price numeric(10,2)
);
CREATE TABLE IF NOT EXISTS nex_sales.commissions (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    sales_rep_id uuid, calculated_amount numeric(10,2)
);
CREATE TABLE IF NOT EXISTS nex_sales.activities (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id uuid, activity_type varchar(50), notes text
);
CREATE TABLE IF NOT EXISTS nex_sales.loyalty_points (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id uuid, points integer DEFAULT 0
);

-- 6. NexProcure
CREATE TABLE IF NOT EXISTS nex_procure.purchase_requests (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    department varchar(100), total_estimated numeric(10,2), status varchar(50) DEFAULT 'PENDING'
);
CREATE TABLE IF NOT EXISTS nex_procure.vendors (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name varchar(255), contact_email varchar(100)
);
CREATE TABLE IF NOT EXISTS nex_procure.rfqs (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    request_id uuid, deadline timestamp
);
CREATE TABLE IF NOT EXISTS nex_procure.purchase_orders (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    vendor_id uuid, total_amount numeric(10,2), status varchar(50) DEFAULT 'ISSUED'
);
CREATE TABLE IF NOT EXISTS nex_procure.goods_receipts (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    po_id uuid, received_date timestamp, status varchar(50) DEFAULT 'RECEIVED'
);
CREATE TABLE IF NOT EXISTS nex_procure.ap_invoices (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    po_id uuid, invoice_number varchar(100), amount numeric(10,2)
);
CREATE TABLE IF NOT EXISTS nex_procure.vendor_contracts (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    vendor_id uuid, contract_terms text
);

-- 7. NexFinance (ERP)
CREATE TABLE IF NOT EXISTS nex_finance.general_ledgers (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    account_code varchar(50), debit numeric(10,2) DEFAULT 0, credit numeric(10,2) DEFAULT 0
);
CREATE TABLE IF NOT EXISTS nex_finance.accounts_receivables (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id uuid, amount numeric(10,2), due_date timestamp
);
CREATE TABLE IF NOT EXISTS nex_finance.accounts_payables (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    vendor_id uuid, amount numeric(10,2), due_date timestamp
);
CREATE TABLE IF NOT EXISTS nex_finance.bank_reconciliations (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    bank_account varchar(100), statement_balance numeric(10,2)
);
CREATE TABLE IF NOT EXISTS nex_finance.cash_flows (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    transaction_type varchar(50), amount numeric(10,2)
);
CREATE TABLE IF NOT EXISTS nex_finance.fixed_assets (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    asset_name varchar(255), purchase_value numeric(10,2)
);
CREATE TABLE IF NOT EXISTS nex_finance.vat_reports (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    month varchar(20), year varchar(4), total_vat numeric(10,2)
);

-- 8. NexCost
CREATE TABLE IF NOT EXISTS nex_cost.cost_centers (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name varchar(255), code varchar(50)
);
CREATE TABLE IF NOT EXISTS nex_cost.budgets (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    cost_center_id uuid, allocated_amount numeric(15,2)
);
CREATE TABLE IF NOT EXISTS nex_cost.standard_costs (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    item_id uuid, standard_price numeric(10,2)
);
CREATE TABLE IF NOT EXISTS nex_cost.actual_costs (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    item_id uuid, actual_price numeric(10,2)
);
CREATE TABLE IF NOT EXISTS nex_cost.job_costings (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    job_id uuid, total_cost numeric(10,2)
);

-- 9. NexForce (HRM + Old Legacy Tables)
CREATE TABLE IF NOT EXISTS nex_force.employees (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    first_name varchar(100), last_name varchar(100), position varchar(100), status varchar(50) DEFAULT 'ACTIVE'
);
CREATE TABLE IF NOT EXISTS nex_force.employee_types (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    type_name varchar(100)
);
CREATE TABLE IF NOT EXISTS nex_force.employment_histories (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id uuid, title varchar(100), start_date timestamp
);
CREATE TABLE IF NOT EXISTS nex_force.employments (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id uuid, employment_type varchar(50)
);
CREATE TABLE IF NOT EXISTS nex_force.departments (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    department_name varchar(100), manager_id uuid
);
CREATE TABLE IF NOT EXISTS nex_force.designations (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    designation_name varchar(100)
);
CREATE TABLE IF NOT EXISTS nex_force.branches (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    branch_name varchar(100), location text
);
CREATE TABLE IF NOT EXISTS nex_force.organizations (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    org_name varchar(255)
);
CREATE TABLE IF NOT EXISTS nex_force.genders (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    gender_name varchar(50)
);
CREATE TABLE IF NOT EXISTS nex_force.marital_statuses (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    status_name varchar(50)
);
CREATE TABLE IF NOT EXISTS nex_force.prefixes (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    prefix_name varchar(50)
);
CREATE TABLE IF NOT EXISTS nex_force.titles (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    title_name varchar(100)
);
CREATE TABLE IF NOT EXISTS nex_force.leave_types (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    type_name varchar(100)
);
CREATE TABLE IF NOT EXISTS nex_force.leave_quotas (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id uuid, leave_type_id uuid, total_days integer
);
CREATE TABLE IF NOT EXISTS nex_force.leave_requests (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id uuid, leave_type_id uuid, status varchar(50)
);
CREATE TABLE IF NOT EXISTS nex_force.holidays (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    holiday_name varchar(255), holiday_date timestamp
);
CREATE TABLE IF NOT EXISTS nex_force.special_days (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    day_name varchar(255), day_date timestamp
);
CREATE TABLE IF NOT EXISTS nex_force.schedule_timings (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    schedule_name varchar(100), start_time time, end_time time
);
CREATE TABLE IF NOT EXISTS nex_force.check_ins (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id uuid, check_in_time timestamp, check_out_time timestamp
);
CREATE TABLE IF NOT EXISTS nex_force.terminate_types (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    type_name varchar(100)
);
CREATE TABLE IF NOT EXISTS nex_force.promotions (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id uuid, new_position varchar(100), promotion_date timestamp
);
CREATE TABLE IF NOT EXISTS nex_force.resignations (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id uuid, reason text, resignation_date timestamp
);
CREATE TABLE IF NOT EXISTS nex_force.terminations (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id uuid, terminate_type_id uuid, termination_date timestamp
);

-- Core Features from Spec
CREATE TABLE IF NOT EXISTS nex_force.org_charts (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    department_name varchar(100), parent_id uuid
);
CREATE TABLE IF NOT EXISTS nex_force.attendances (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id uuid, check_in timestamp, check_out timestamp
);
CREATE TABLE IF NOT EXISTS nex_force.leaves (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id uuid, leave_type varchar(50), status varchar(50) DEFAULT 'PENDING'
);
CREATE TABLE IF NOT EXISTS nex_force.shifts (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    shift_name varchar(50), start_time time, end_time time
);
CREATE TABLE IF NOT EXISTS nex_force.performance_evaluations (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id uuid, score numeric(5,2), evaluation_period varchar(50)
);
CREATE TABLE IF NOT EXISTS nex_force.field_trackings (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id uuid, latitude numeric(10,6), longitude numeric(10,6)
);
CREATE TABLE IF NOT EXISTS nex_force.trainings (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    course_name varchar(255), trainer varchar(100)
);

-- 10. NexSite
CREATE TABLE IF NOT EXISTS nex_site.pages (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    page_name varchar(255), slug varchar(255)
);
CREATE TABLE IF NOT EXISTS nex_site.theme_settings (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    primary_color varchar(20), logo_url varchar(255)
);
CREATE TABLE IF NOT EXISTS nex_site.landing_pages (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    title varchar(255), content_html text
);
CREATE TABLE IF NOT EXISTS nex_site.customer_portals (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    portal_name varchar(100), access_url varchar(255)
);
CREATE TABLE IF NOT EXISTS nex_site.blogs (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    title varchar(255), body text, published boolean DEFAULT false
);
CREATE TABLE IF NOT EXISTS nex_site.contact_forms (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    sender_email varchar(100), message text
);
CREATE TABLE IF NOT EXISTS nex_site.careers (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    job_title varchar(100), description text, is_open boolean DEFAULT true
);

-- 11. NexBI
CREATE TABLE IF NOT EXISTS nex_bi.dashboards (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name varchar(255), layout_config jsonb
);
CREATE TABLE IF NOT EXISTS nex_bi.custom_reports (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    report_name varchar(255), query_config text
);
CREATE TABLE IF NOT EXISTS nex_bi.data_pipelines (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    source_system varchar(100), last_sync timestamp
);
CREATE TABLE IF NOT EXISTS nex_bi.kpi_alerts (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    kpi_name varchar(100), threshold numeric(10,2), alert_triggered boolean DEFAULT false
);

-- 12. NexPOS
CREATE TABLE IF NOT EXISTS nex_pos.pos_interfaces (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    terminal_id varchar(50), location varchar(100)
);
CREATE TABLE IF NOT EXISTS nex_pos.carts (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    terminal_id uuid, total_amount numeric(10,2)
);
CREATE TABLE IF NOT EXISTS nex_pos.payment_methods (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    method_name varchar(50), is_active boolean DEFAULT true
);
CREATE TABLE IF NOT EXISTS nex_pos.receipts (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id uuid, receipt_no varchar(50), total_paid numeric(10,2)
);
CREATE TABLE IF NOT EXISTS nex_pos.pos_shifts (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    cashier_id uuid, open_balance numeric(10,2), close_balance numeric(10,2)
);
CREATE TABLE IF NOT EXISTS nex_pos.returns (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    receipt_id uuid, return_amount numeric(10,2)
);
CREATE TABLE IF NOT EXISTS nex_pos.daily_summaries (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    summary_date timestamp, total_sales numeric(15,2)
);
CREATE TABLE IF NOT EXISTS nex_pos.branches (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    branch_name varchar(100), location text
);

-- 13. NexPayroll
CREATE TABLE IF NOT EXISTS nex_payroll.payrolls (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id uuid, month varchar(20), net_salary numeric(10,2)
);
CREATE TABLE IF NOT EXISTS nex_payroll.periods (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    period_name varchar(100), start_date timestamp, end_date timestamp
);
CREATE TABLE IF NOT EXISTS nex_payroll.additions (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    addition_name varchar(100)
);
CREATE TABLE IF NOT EXISTS nex_payroll.addition_assignments (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id uuid, addition_id uuid
);
CREATE TABLE IF NOT EXISTS nex_payroll.personal_additions (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id uuid, amount numeric(10,2)
);
CREATE TABLE IF NOT EXISTS nex_payroll.deductions (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    deduction_name varchar(100)
);
CREATE TABLE IF NOT EXISTS nex_payroll.deduction_assignments (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id uuid, deduction_id uuid
);
CREATE TABLE IF NOT EXISTS nex_payroll.personal_deductions (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id uuid, amount numeric(10,2)
);
CREATE TABLE IF NOT EXISTS nex_payroll.tax_deduction_types (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    type_name varchar(100)
);
CREATE TABLE IF NOT EXISTS nex_payroll.income_tax_brackets (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    min_income numeric(15,2), max_income numeric(15,2), tax_rate numeric(5,2)
);
CREATE TABLE IF NOT EXISTS nex_payroll.tax_deductions (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id uuid, amount numeric(10,2)
);
CREATE TABLE IF NOT EXISTS nex_payroll.social_security_rates (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    rate_percent numeric(5,2), max_cap numeric(10,2)
);
CREATE TABLE IF NOT EXISTS nex_payroll.overtime_types (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    type_name varchar(100), rate_multiplier numeric(5,2)
);
CREATE TABLE IF NOT EXISTS nex_payroll.overtime_requests (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id uuid, hours numeric(5,2), status varchar(50)
);
CREATE TABLE IF NOT EXISTS nex_payroll.payment_types (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    type_name varchar(100)
);
CREATE TABLE IF NOT EXISTS nex_payroll.banks (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    bank_name varchar(100), bank_code varchar(20)
);
CREATE TABLE IF NOT EXISTS nex_payroll.monthly_salaries (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id uuid, amount numeric(10,2)
);
CREATE TABLE IF NOT EXISTS nex_payroll.total_deductions (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id uuid, amount numeric(10,2)
);
CREATE TABLE IF NOT EXISTS nex_payroll.income_taxes (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id uuid, tax_amount numeric(10,2)
);
CREATE TABLE IF NOT EXISTS nex_payroll.social_securities (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id uuid, sso_amount numeric(10,2)
);
CREATE TABLE IF NOT EXISTS nex_payroll.provident_funds (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id uuid, fund_amount numeric(10,2)
);
CREATE TABLE IF NOT EXISTS nex_payroll.payslips (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    payroll_id uuid, is_sent boolean DEFAULT false
);

-- 14. NexAsset
CREATE TABLE IF NOT EXISTS nex_asset.assets (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name varchar(255), serial_no varchar(100), status varchar(50) DEFAULT 'ACTIVE'
);
CREATE TABLE IF NOT EXISTS nex_asset.asset_categories (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    category_name varchar(100)
);
CREATE TABLE IF NOT EXISTS nex_asset.asset_tags (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    asset_id uuid, qr_code varchar(255)
);
CREATE TABLE IF NOT EXISTS nex_asset.depreciations (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    asset_id uuid, depreciation_value numeric(10,2)
);
CREATE TABLE IF NOT EXISTS nex_asset.asset_assignments (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    asset_id uuid, assigned_to uuid
);
CREATE TABLE IF NOT EXISTS nex_asset.asset_transfers (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    asset_id uuid, from_location varchar(100), to_location varchar(100)
);
CREATE TABLE IF NOT EXISTS nex_asset.maintenance_schedules (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    asset_id uuid, next_maintenance_date timestamp
);
CREATE TABLE IF NOT EXISTS nex_asset.asset_inspections (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    asset_id uuid, condition varchar(50)
);
CREATE TABLE IF NOT EXISTS nex_asset.disposals (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    asset_id uuid, disposal_reason text
);

-- 15. NexApprove
CREATE TABLE IF NOT EXISTS nex_approve.approval_cancel_reasons (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    reason_text varchar(255)
);
CREATE TABLE IF NOT EXISTS nex_approve.approval_logs (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    reference_id uuid, log_text text
);
CREATE TABLE IF NOT EXISTS nex_approve.approval_references (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    document_no varchar(100)
);
CREATE TABLE IF NOT EXISTS nex_approve.approval_rules (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    rule_name varchar(100)
);
CREATE TABLE IF NOT EXISTS nex_approve.approval_statuses (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    status_name varchar(50)
);
CREATE TABLE IF NOT EXISTS nex_approve.approval_steps (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    step_sequence integer
);
CREATE TABLE IF NOT EXISTS nex_approve.rule_types (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    type_name varchar(100)
);
-- Core Features NexApprove
CREATE TABLE IF NOT EXISTS nex_approve.workflow_designs (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    workflow_name varchar(255), steps_config jsonb
);
CREATE TABLE IF NOT EXISTS nex_approve.request_types (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    type_name varchar(100), description text
);
CREATE TABLE IF NOT EXISTS nex_approve.approvals (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    request_id uuid, approver_id uuid, status varchar(50) DEFAULT 'PENDING'
);
CREATE TABLE IF NOT EXISTS nex_approve.delegations (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    delegator_id uuid, delegatee_id uuid, start_date timestamp, end_date timestamp
);
CREATE TABLE IF NOT EXISTS nex_approve.notifications (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid, message text, is_read boolean DEFAULT false
);
CREATE TABLE IF NOT EXISTS nex_approve.approval_histories (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    approval_id uuid, action varchar(50), action_date timestamp
);

-- 16. NexTax
CREATE TABLE IF NOT EXISTS nex_tax.vat_managements (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    month varchar(20), year varchar(4), input_vat numeric(10,2), output_vat numeric(10,2)
);
CREATE TABLE IF NOT EXISTS nex_tax.withholding_taxes (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    vendor_id uuid, tax_rate numeric(5,2), amount numeric(10,2)
);
CREATE TABLE IF NOT EXISTS nex_tax.corporate_taxes (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    year varchar(4), estimated_tax numeric(15,2)
);
CREATE TABLE IF NOT EXISTS nex_tax.e_tax_invoices (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    invoice_no varchar(50), digital_signature text
);
CREATE TABLE IF NOT EXISTS nex_tax.tax_documents (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    document_type varchar(50), file_path varchar(255)
);

-- 17. NexAudit
CREATE TABLE IF NOT EXISTS nex_audit.audit_trails (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    action varchar(100), table_name varchar(100), record_id uuid, old_value jsonb, new_value jsonb
);
CREATE TABLE IF NOT EXISTS nex_audit.pdpa_consents (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid, consent_version varchar(20), is_agreed boolean DEFAULT false
);
CREATE TABLE IF NOT EXISTS nex_audit.data_maskings (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    table_name varchar(100), column_name varchar(100), masking_rule varchar(100)
);
CREATE TABLE IF NOT EXISTS nex_audit.security_alerts (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    alert_type varchar(100), description text, is_resolved boolean DEFAULT false
);
CREATE TABLE IF NOT EXISTS nex_audit.access_histories (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid, accessed_module varchar(100), ip_address varchar(50)
);

-- 18. NexConnect
CREATE TABLE IF NOT EXISTS nex_connect.api_gateways (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    endpoint varchar(255), method varchar(10), is_active boolean DEFAULT true
);
CREATE TABLE IF NOT EXISTS nex_connect.webhook_managers (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    event_name varchar(100), target_url varchar(255)
);
CREATE TABLE IF NOT EXISTS nex_connect.marketplace_syncs (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    platform varchar(50), last_sync_time timestamp
);
CREATE TABLE IF NOT EXISTS nex_connect.bank_connects (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    bank_name varchar(100), api_key varchar(255)
);
CREATE TABLE IF NOT EXISTS nex_connect.partner_portals (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    partner_name varchar(255), client_secret varchar(255)
);

-- 19. NexDelivery
CREATE TABLE IF NOT EXISTS nex_delivery.riders (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name varchar(255), phone varchar(20), status varchar(50) DEFAULT 'AVAILABLE'
);
CREATE TABLE IF NOT EXISTS nex_delivery.delivery_trackings (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    tracking_number varchar(100), current_status varchar(50)
);
CREATE TABLE IF NOT EXISTS nex_delivery.micro_routings (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    rider_id uuid, route_data jsonb
);
CREATE TABLE IF NOT EXISTS nex_delivery.cod_payments (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    tracking_id uuid, amount_collected numeric(10,2), is_remitted boolean DEFAULT false
);

-- 20. NexMaint
CREATE TABLE IF NOT EXISTS nex_maint.maintenance_plans (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    machine_id uuid, interval_days integer
);
CREATE TABLE IF NOT EXISTS nex_maint.work_orders (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    issue_description text, status varchar(50) DEFAULT 'OPEN'
);
CREATE TABLE IF NOT EXISTS nex_maint.technicians (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name varchar(255), specialty varchar(100)
);
CREATE TABLE IF NOT EXISTS nex_maint.iot_devices (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    device_uid varchar(100), last_ping timestamp
);

-- 21. NexLearn
CREATE TABLE IF NOT EXISTS nex_learn.courses (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    title varchar(255), description text
);
CREATE TABLE IF NOT EXISTS nex_learn.quizzes (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    course_id uuid, questions_config jsonb
);
CREATE TABLE IF NOT EXISTS nex_learn.employee_trainings (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id uuid, course_id uuid, progress_percent numeric(5,2) DEFAULT 0
);
CREATE TABLE IF NOT EXISTS nex_learn.knowledge_bases (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    article_title varchar(255), article_body text
);

-- 22. NexHire (Legacy App / Resourcing)
CREATE TABLE IF NOT EXISTS nex_hire.manage_jobs (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    job_title varchar(255), status varchar(50)
);
CREATE TABLE IF NOT EXISTS nex_hire.manage_resumes (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    applicant_name varchar(255), is_reviewed boolean
);
CREATE TABLE IF NOT EXISTS nex_hire.interview_results (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    job_id uuid, resume_id uuid, score integer
);
CREATE TABLE IF NOT EXISTS nex_hire.questions (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    question_text text
);

-- 23. NexProject (Legacy App / Costing)
CREATE TABLE IF NOT EXISTS nex_project.projects (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    project_name varchar(255)
);
CREATE TABLE IF NOT EXISTS nex_project.project_types (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    type_name varchar(100)
);
CREATE TABLE IF NOT EXISTS nex_project.project_assignments (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id uuid, employee_id uuid
);
CREATE TABLE IF NOT EXISTS nex_project.project_costs (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id uuid, total_cost numeric(15,2)
);
CREATE TABLE IF NOT EXISTS nex_project.project_cost_details (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    cost_id uuid, item_desc varchar(255), amount numeric(10,2)
);
CREATE TABLE IF NOT EXISTS nex_project.project_files (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id uuid, file_url varchar(255)
);
CREATE TABLE IF NOT EXISTS nex_project.clients (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    client_name varchar(255)
);
CREATE TABLE IF NOT EXISTS nex_project.tasks (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id uuid, task_name varchar(255)
);
CREATE TABLE IF NOT EXISTS nex_project.task_boards (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    task_id uuid, board_status varchar(50)
);
CREATE TABLE IF NOT EXISTS nex_project.timesheet_headers (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id uuid, week_start_date timestamp
);
CREATE TABLE IF NOT EXISTS nex_project.timesheet_details (
    create_date timestamp DEFAULT now() NULL, create_by varchar(50) NULL, update_date timestamp NULL, update_by varchar(50) NULL, id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    header_id uuid, hours_worked numeric(5,2)
);
