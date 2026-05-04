--
-- PostgreSQL database dump
--

\restrict geqAwRkxrSBoxnxgLEgB2P6HJ8uzTps2pg6UdrfLuQGM9mgT0U2fDlAdIBn5L7w

-- Dumped from database version 16.13 (Debian 16.13-1.pgdg13+1)
-- Dumped by pg_dump version 17.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: nex_core; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA nex_core;


ALTER SCHEMA nex_core OWNER TO postgres;

--
-- Name: Organizetype; Type: TYPE; Schema: nex_core; Owner: postgres
--

CREATE TYPE nex_core."Organizetype" AS ENUM (
    'HEADQUARTERS',
    'BRANCH'
);


ALTER TYPE nex_core."Organizetype" OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: announcements; Type: TABLE; Schema: nex_core; Owner: postgres
--

CREATE TABLE nex_core.announcements (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title character varying(255) NOT NULL,
    message text,
    target_type character varying(50) NOT NULL,
    target_ids jsonb,
    is_active boolean DEFAULT true,
    schedule_date timestamp with time zone,
    end_date timestamp with time zone,
    create_by character varying(50),
    create_date timestamp with time zone DEFAULT now(),
    update_by character varying(50),
    update_date timestamp with time zone DEFAULT now()
);


ALTER TABLE nex_core.announcements OWNER TO postgres;

--
-- Name: contact_persons; Type: TABLE; Schema: nex_core; Owner: postgres
--

CREATE TABLE nex_core.contact_persons (
    create_date timestamp with time zone DEFAULT now() NOT NULL,
    create_by character varying(50) DEFAULT 'system'::character varying NOT NULL,
    update_date timestamp with time zone,
    update_by character varying(50),
    is_active boolean DEFAULT true NOT NULL,
    company_id integer NOT NULL,
    contact_person_id bigint NOT NULL,
    contact_name character varying(255) NOT NULL,
    contact_mobile character varying(50) NOT NULL,
    line_id character varying(50)
);


ALTER TABLE nex_core.contact_persons OWNER TO postgres;

--
-- Name: contact_persons_contact_person_id_seq; Type: SEQUENCE; Schema: nex_core; Owner: postgres
--

ALTER TABLE nex_core.contact_persons ALTER COLUMN contact_person_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME nex_core.contact_persons_contact_person_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: email_settings; Type: TABLE; Schema: nex_core; Owner: postgres
--

CREATE TABLE nex_core.email_settings (
    create_date timestamp with time zone DEFAULT now() NOT NULL,
    create_by character varying(50) DEFAULT 'system'::character varying NOT NULL,
    update_date timestamp with time zone,
    update_by character varying(50),
    is_active boolean DEFAULT true NOT NULL,
    email_setting_id bigint NOT NULL,
    smtp_host character varying(255),
    smtp_port integer,
    smtp_user character varying(255),
    smtp_password character varying(255)
);


ALTER TABLE nex_core.email_settings OWNER TO postgres;

--
-- Name: email_settings_email_setting_id_seq; Type: SEQUENCE; Schema: nex_core; Owner: postgres
--

ALTER TABLE nex_core.email_settings ALTER COLUMN email_setting_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME nex_core.email_settings_email_setting_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: email_templates; Type: TABLE; Schema: nex_core; Owner: postgres
--

CREATE TABLE nex_core.email_templates (
    create_date timestamp with time zone DEFAULT now() NOT NULL,
    create_by character varying(50) DEFAULT 'system'::character varying NOT NULL,
    update_date timestamp with time zone,
    update_by character varying(50),
    is_active boolean DEFAULT true NOT NULL,
    template_id bigint NOT NULL,
    title character varying(255) NOT NULL,
    email_content text,
    template_code character varying,
    language_code character varying(10) NOT NULL,
    app_name jsonb
);


ALTER TABLE nex_core.email_templates OWNER TO postgres;

--
-- Name: email_templates_template_id_seq; Type: SEQUENCE; Schema: nex_core; Owner: postgres
--

ALTER TABLE nex_core.email_templates ALTER COLUMN template_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME nex_core.email_templates_template_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: language_translations; Type: TABLE; Schema: nex_core; Owner: postgres
--

CREATE TABLE nex_core.language_translations (
    create_date timestamp with time zone DEFAULT now() NOT NULL,
    create_by character varying(50) DEFAULT 'system'::character varying NOT NULL,
    update_date timestamp with time zone,
    update_by character varying(50),
    is_active boolean DEFAULT true NOT NULL,
    translation_id bigint NOT NULL,
    language_code character varying(2) NOT NULL,
    page_key character varying(50) NOT NULL,
    label_key character varying(100) NOT NULL,
    label_value character varying(200)
);


ALTER TABLE nex_core.language_translations OWNER TO postgres;

--
-- Name: language_translations_translation_id_seq; Type: SEQUENCE; Schema: nex_core; Owner: postgres
--

ALTER TABLE nex_core.language_translations ALTER COLUMN translation_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME nex_core.language_translations_translation_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: languages; Type: TABLE; Schema: nex_core; Owner: postgres
--

CREATE TABLE nex_core.languages (
    create_date timestamp with time zone DEFAULT now() NOT NULL,
    create_by character varying(50) DEFAULT 'system'::character varying NOT NULL,
    update_date timestamp with time zone,
    update_by character varying(50),
    is_active boolean DEFAULT true NOT NULL,
    language_id bigint NOT NULL,
    language_code character varying(2) NOT NULL,
    language_name character varying(50) NOT NULL,
    description character varying(100)
);


ALTER TABLE nex_core.languages OWNER TO postgres;

--
-- Name: languages_language_id_seq; Type: SEQUENCE; Schema: nex_core; Owner: postgres
--

ALTER TABLE nex_core.languages ALTER COLUMN language_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME nex_core.languages_language_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: menus; Type: TABLE; Schema: nex_core; Owner: postgres
--

CREATE TABLE nex_core.menus (
    create_date timestamp with time zone DEFAULT now() NOT NULL,
    create_by character varying(50) DEFAULT 'system'::character varying NOT NULL,
    update_date timestamp with time zone,
    update_by character varying(50),
    is_active boolean DEFAULT true NOT NULL,
    app_name character varying(100),
    parent_id integer,
    menu_id bigint NOT NULL,
    menu_seq integer NOT NULL,
    menu_code character varying NOT NULL,
    menu_value character varying(255) NOT NULL,
    title character varying(255) NOT NULL,
    route character varying(255) NOT NULL,
    base character varying(255) NOT NULL,
    page_key character varying(50) NOT NULL,
    icon character varying(255)
);


ALTER TABLE nex_core.menus OWNER TO postgres;

--
-- Name: menus_menu_id_seq; Type: SEQUENCE; Schema: nex_core; Owner: postgres
--

ALTER TABLE nex_core.menus ALTER COLUMN menu_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME nex_core.menus_menu_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: organize; Type: TABLE; Schema: nex_core; Owner: postgres
--

CREATE TABLE nex_core.organize (
    create_date timestamp with time zone DEFAULT now() NOT NULL,
    create_by character varying(50) DEFAULT 'system'::character varying NOT NULL,
    update_date timestamp with time zone,
    update_by character varying(50),
    is_active boolean DEFAULT true NOT NULL,
    organize_id bigint NOT NULL,
    organize_code character varying(20) NOT NULL,
    organize_type nex_core."Organizetype" NOT NULL,
    organize_name character varying NOT NULL,
    address character varying,
    country character varying,
    city character varying,
    province character varying,
    zipcode character varying,
    email character varying,
    phone character varying,
    fax character varying,
    website character varying,
    logo_path character varying,
    favicon_path character varying,
    tax_no character varying
);


ALTER TABLE nex_core.organize OWNER TO postgres;

--
-- Name: organize_organize_id_seq; Type: SEQUENCE; Schema: nex_core; Owner: postgres
--

ALTER TABLE nex_core.organize ALTER COLUMN organize_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME nex_core.organize_organize_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: provinces; Type: TABLE; Schema: nex_core; Owner: postgres
--

CREATE TABLE nex_core.provinces (
    create_date timestamp with time zone DEFAULT now() NOT NULL,
    create_by character varying(50) DEFAULT 'system'::character varying NOT NULL,
    update_date timestamp with time zone,
    update_by character varying(50),
    is_active boolean DEFAULT true NOT NULL,
    province_id bigint NOT NULL,
    name_th character varying(255) NOT NULL,
    name_en character varying(255) NOT NULL,
    abbr character varying(50),
    region character varying(100)
);


ALTER TABLE nex_core.provinces OWNER TO postgres;

--
-- Name: provinces_province_id_seq; Type: SEQUENCE; Schema: nex_core; Owner: postgres
--

ALTER TABLE nex_core.provinces ALTER COLUMN province_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME nex_core.provinces_province_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: role_permissions; Type: TABLE; Schema: nex_core; Owner: postgres
--

CREATE TABLE nex_core.role_permissions (
    create_date timestamp with time zone DEFAULT now() NOT NULL,
    create_by character varying(50) DEFAULT 'system'::character varying NOT NULL,
    update_date timestamp with time zone,
    update_by character varying(50),
    is_active boolean DEFAULT true NOT NULL,
    app_name character varying(100) NOT NULL,
    role_id integer NOT NULL,
    menus_id integer NOT NULL,
    permissions_id bigint NOT NULL,
    can_view boolean DEFAULT false,
    can_add boolean DEFAULT false,
    can_edit boolean DEFAULT false,
    can_delete boolean DEFAULT false,
    can_import boolean DEFAULT false,
    can_export boolean DEFAULT false
);


ALTER TABLE nex_core.role_permissions OWNER TO postgres;

--
-- Name: role_permissions_permissions_id_seq; Type: SEQUENCE; Schema: nex_core; Owner: postgres
--

ALTER TABLE nex_core.role_permissions ALTER COLUMN permissions_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME nex_core.role_permissions_permissions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: roles; Type: TABLE; Schema: nex_core; Owner: postgres
--

CREATE TABLE nex_core.roles (
    create_date timestamp with time zone DEFAULT now() NOT NULL,
    create_by character varying(50) DEFAULT 'system'::character varying NOT NULL,
    update_date timestamp with time zone,
    update_by character varying(50),
    is_active boolean DEFAULT true NOT NULL,
    role_id bigint NOT NULL,
    role_name character varying(50) NOT NULL,
    description text
);


ALTER TABLE nex_core.roles OWNER TO postgres;

--
-- Name: roles_role_id_seq; Type: SEQUENCE; Schema: nex_core; Owner: postgres
--

ALTER TABLE nex_core.roles ALTER COLUMN role_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME nex_core.roles_role_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: sessions; Type: TABLE; Schema: nex_core; Owner: postgres
--

CREATE TABLE nex_core.sessions (
    id character varying(128) NOT NULL,
    user_id uuid NOT NULL,
    ip_address character varying(45),
    user_agent text,
    device_name character varying(100),
    is_active boolean DEFAULT true,
    expires_at timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    last_activity_at timestamp with time zone DEFAULT now()
);


ALTER TABLE nex_core.sessions OWNER TO postgres;

--
-- Name: system_apps; Type: TABLE; Schema: nex_core; Owner: postgres
--

CREATE TABLE nex_core.system_apps (
    create_date timestamp with time zone DEFAULT now() NOT NULL,
    create_by character varying(50) DEFAULT 'system'::character varying NOT NULL,
    update_date timestamp with time zone,
    update_by character varying(50),
    is_active boolean DEFAULT true NOT NULL,
    app_id bigint NOT NULL,
    app_seq_no integer DEFAULT 99,
    app_group character varying(50),
    app_name character varying(100) NOT NULL,
    icon_path character varying(200) NOT NULL,
    route_path character varying(500) DEFAULT NULL::character varying,
    api_path character varying(500) DEFAULT NULL::character varying
);


ALTER TABLE nex_core.system_apps OWNER TO postgres;

--
-- Name: system_apps_app_id_seq; Type: SEQUENCE; Schema: nex_core; Owner: postgres
--

ALTER TABLE nex_core.system_apps ALTER COLUMN app_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME nex_core.system_apps_app_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: system_config; Type: TABLE; Schema: nex_core; Owner: postgres
--

CREATE TABLE nex_core.system_config (
    create_date timestamp with time zone DEFAULT now() NOT NULL,
    create_by character varying(50) DEFAULT 'system'::character varying NOT NULL,
    update_date timestamp with time zone,
    update_by character varying(50),
    is_active boolean DEFAULT true NOT NULL,
    system_id bigint NOT NULL,
    system_seq_no integer DEFAULT 99,
    system_group character varying(50),
    system_key character varying(100) NOT NULL,
    system_value character varying(100) NOT NULL,
    system_type character varying(100),
    description character varying(200)
);


ALTER TABLE nex_core.system_config OWNER TO postgres;

--
-- Name: system_config_system_id_seq; Type: SEQUENCE; Schema: nex_core; Owner: postgres
--

ALTER TABLE nex_core.system_config ALTER COLUMN system_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME nex_core.system_config_system_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: template_master_graph; Type: TABLE; Schema: nex_core; Owner: postgres
--

CREATE TABLE nex_core.template_master_graph (
    create_date timestamp with time zone DEFAULT now() NOT NULL,
    create_by character varying(50) DEFAULT 'system'::character varying NOT NULL,
    update_date timestamp with time zone,
    update_by character varying(50),
    is_active boolean DEFAULT true NOT NULL,
    template_id bigint NOT NULL,
    order_id character varying(50),
    invoice_no character varying(50),
    customer character varying(255) NOT NULL,
    amount numeric NOT NULL,
    issue_date date NOT NULL,
    due_date date NOT NULL,
    status character varying(20)
);


ALTER TABLE nex_core.template_master_graph OWNER TO postgres;

--
-- Name: template_master_graph_template_id_seq; Type: SEQUENCE; Schema: nex_core; Owner: postgres
--

ALTER TABLE nex_core.template_master_graph ALTER COLUMN template_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME nex_core.template_master_graph_template_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: templates; Type: TABLE; Schema: nex_core; Owner: postgres
--

CREATE TABLE nex_core.templates (
    create_date timestamp with time zone DEFAULT now() NOT NULL,
    create_by character varying(50) DEFAULT 'system'::character varying NOT NULL,
    update_date timestamp with time zone,
    update_by character varying(50),
    is_active boolean DEFAULT true NOT NULL,
    template_id bigint NOT NULL,
    template_group character varying(50),
    template_name character varying(100) NOT NULL,
    template_desc character varying(200)
);


ALTER TABLE nex_core.templates OWNER TO postgres;

--
-- Name: templates_template_id_seq; Type: SEQUENCE; Schema: nex_core; Owner: postgres
--

ALTER TABLE nex_core.templates ALTER COLUMN template_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME nex_core.templates_template_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: unit_types; Type: TABLE; Schema: nex_core; Owner: postgres
--

CREATE TABLE nex_core.unit_types (
    create_date timestamp with time zone DEFAULT now() NOT NULL,
    create_by character varying(50) DEFAULT 'system'::character varying NOT NULL,
    update_date timestamp with time zone,
    update_by character varying(50),
    is_active boolean DEFAULT true NOT NULL,
    unit_type_id bigint NOT NULL,
    unit_type_name character varying(255) NOT NULL,
    description text,
    symbol character varying(25) NOT NULL
);


ALTER TABLE nex_core.unit_types OWNER TO postgres;

--
-- Name: unit_types_unit_type_id_seq; Type: SEQUENCE; Schema: nex_core; Owner: postgres
--

ALTER TABLE nex_core.unit_types ALTER COLUMN unit_type_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME nex_core.unit_types_unit_type_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: users; Type: TABLE; Schema: nex_core; Owner: postgres
--

CREATE TABLE nex_core.users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    email character varying(100) NOT NULL,
    password character varying(255) NOT NULL,
    display_name character varying(100),
    role_id integer DEFAULT 2,
    role_name character varying(50) DEFAULT 'user'::character varying,
    is_active boolean DEFAULT true,
    employee_id character varying(50),
    avatar_url character varying(500),
    last_login_at timestamp with time zone,
    failed_login_count integer DEFAULT 0,
    locked_until timestamp with time zone,
    create_date timestamp with time zone DEFAULT now(),
    create_by character varying(50),
    update_date timestamp with time zone DEFAULT now(),
    update_by character varying(50),
    require_password_change boolean DEFAULT false,
    password_changed_at timestamp with time zone,
    mfa_enabled boolean DEFAULT false,
    mfa_secret character varying(255),
    manager_id uuid,
    company_id uuid,
    cost_center_code character varying(50),
    valid_from timestamp with time zone,
    valid_to timestamp with time zone,
    deleted_at timestamp with time zone,
    timezone character varying(50) DEFAULT 'Asia/Bangkok'::character varying,
    language character varying(10) DEFAULT 'TH'::character varying
);


ALTER TABLE nex_core.users OWNER TO postgres;

--
-- Data for Name: announcements; Type: TABLE DATA; Schema: nex_core; Owner: postgres
--

COPY nex_core.announcements (id, title, message, target_type, target_ids, is_active, schedule_date, end_date, create_by, create_date, update_by, update_date) FROM stdin;
60502998-ba92-4090-aa1a-b275b1c52bc9	ประกาศปิดปรับปรุง Server ประจำสัปดาห์	ระบบจะปิดทำการอัปเดต Service ในช่วงเวลา 02:00 น. - 04:00 น.	ALL	[]	t	\N	\N	SYSTEM	2026-04-27 11:15:56.365061+00	SYSTEM	2026-04-28 07:15:56.365061+00
6e5c1e04-0248-4ec0-b9ed-d63c7dd91073	New Policy: ระบบการลาฉบับใหม่	กรุณาตรวจสอบข้อตกลงและนโยบายการลาฉบับใหม่ที่มีผลบังคับใช้	DEPARTMENT	["mock_id_1", "mock_id_2"]	t	\N	\N	SYSTEM	2026-04-27 12:15:56.379718+00	SYSTEM	2026-04-28 07:15:56.379718+00
01dacc8b-d505-42d3-a45c-0bf9db47431f	คำเตือน: ความพยายามเข้าสู่ระบบล้มเหลว	ตรวจสอบพบการเข้าสู่ระบบผิดพลาด 5 ครั้งจาก IP 124.xx.xx.xx	ROLE	["mock_id_1", "mock_id_2"]	t	\N	\N	SYSTEM	2026-04-27 13:15:56.391467+00	SYSTEM	2026-04-28 07:15:56.391467+00
bc2de0bd-1081-42cb-ada0-2544c2e27d1c	อัปเดตเวอร์ชั่น NexCore 2.4.1	ระบบได้รับการอัปเดตแล้ว สามารถใช้งานฟีเจอร์ใหม่ได้ทันที	USER	["mock_id_1", "mock_id_2"]	t	\N	\N	SYSTEM	2026-04-27 14:15:56.402397+00	SYSTEM	2026-04-28 07:15:56.402397+00
337443e2-822d-45be-a728-9d05f9f0a4f7	แจ้งเตือน: การเปลี่ยนรหัสผ่าน	กรุณาเปลี่ยนรหัสผ่านเพื่อความปลอดภัยภายใน 3 วัน	ALL	[]	f	\N	\N	SYSTEM	2026-04-27 15:15:56.413587+00	SYSTEM	2026-04-28 07:15:56.413587+00
47ed2313-a419-4cc8-b257-5742177a3c59	เชิญประชุม Townhall ประจำเดือน	ขอเชิญพนักงานทุกคนเข้าร่วมประชุมในวันศุกร์นี้	ALL	[]	t	\N	\N	SYSTEM	2026-04-27 16:15:56.424379+00	SYSTEM	2026-04-28 07:15:56.424379+00
a6abb02a-8bc2-4622-8f94-8982d145cfbb	นโยบายการทำงานจากที่บ้าน (WFH)	แจ้งแนวทางปฏิบัติสำหรับการทำงานที่บ้านในสถานการณ์ปัจจุบัน	DEPARTMENT	["mock_id_1", "mock_id_2"]	t	\N	\N	SYSTEM	2026-04-27 17:15:56.437159+00	SYSTEM	2026-04-28 07:15:56.437159+00
913025db-8a0d-45df-9f65-27589a9ff78e	อัปเดตคู่มือการใช้งานระบบ ERP	คู่มือเวอร์ชันล่าสุดอัปโหลดเรียบร้อยแล้วในเมนูระบบ	ROLE	["mock_id_1", "mock_id_2"]	t	\N	\N	SYSTEM	2026-04-27 18:15:56.447493+00	SYSTEM	2026-04-28 07:15:56.447493+00
37ff1502-e504-4244-91a7-128769593393	สรุปผลประกอบการไตรมาสที่ 1	รายละเอียดเกี่ยวกับผลประกอบการไตรมาส 1 พร้อมเอกสารแนบ	USER	["mock_id_1", "mock_id_2"]	t	\N	\N	SYSTEM	2026-04-27 19:15:56.459242+00	SYSTEM	2026-04-28 07:15:56.459242+00
79ad77ea-f3c8-49ee-9497-f31c6e74bbe6	แจ้งเตือนการตรวจสอบความปลอดภัย	ขอความร่วมมือสแกนไวรัสเครื่องคอมพิวเตอร์ของคุณ	ALL	[]	f	\N	\N	SYSTEM	2026-04-27 20:15:56.469932+00	SYSTEM	2026-04-28 07:15:56.469932+00
0b7d0a22-75c5-4c27-bbe0-ad0251da847f	กิจกรรมสร้างทีมสัมพันธ์ ประจำปี	เตรียมตัวให้พร้อมสำหรับกิจกรรม Team Building เดือนหน้า	ALL	[]	t	\N	\N	SYSTEM	2026-04-27 21:15:56.481024+00	SYSTEM	2026-04-28 07:15:56.481024+00
98b03670-f15f-405d-b1f8-9b10a85545b3	ระบบเครือข่ายขัดข้องชั่วคราว	กำลังดำเนินการแก้ไขปัญหาเครือข่าย คาดว่าจะเสร็จสิ้นใน 1 ชม.	DEPARTMENT	["mock_id_1", "mock_id_2"]	t	\N	\N	SYSTEM	2026-04-27 22:15:56.493099+00	SYSTEM	2026-04-28 07:15:56.493099+00
ab3ffa8a-f5be-4a83-b657-ac5aa5aea89b	การปรับปรุงระบบฐานข้อมูล HR	ระบบ HR จะไม่สามารถเข้าใช้งานได้ในวันเสาร์นี้เวลา 22:00 น.	ROLE	["mock_id_1", "mock_id_2"]	t	\N	\N	SYSTEM	2026-04-27 23:15:56.503868+00	SYSTEM	2026-04-28 07:15:56.503868+00
26e7aace-a128-4f33-b36f-1f932b75b009	ผลการประเมินประจำปี 2026	ตรวจสอบผลประเมินของคุณได้ที่เมนูพนักงาน	USER	["mock_id_1", "mock_id_2"]	t	\N	\N	SYSTEM	2026-04-28 00:15:56.514347+00	SYSTEM	2026-04-28 07:15:56.514347+00
c5162967-e863-4836-96a8-40e489d258d7	ประกาศผลการประกวดนวัตกรรม	ขอแสดงความยินดีกับทีมพัฒนาที่ได้รับรางวัลนวัตกรรมดีเด่น	ALL	[]	f	\N	\N	SYSTEM	2026-04-28 01:15:56.52487+00	SYSTEM	2026-04-28 07:15:56.52487+00
35d8b9c7-947c-4db4-9997-ed79c094c8a0	แจ้งปัญหา: ระบบอีเมลล่าช้า	พบปัญหาความล่าช้าในการรับ-ส่งอีเมล ทีมงานกำลังแก้ไข	ALL	[]	t	\N	\N	SYSTEM	2026-04-28 02:15:56.535763+00	SYSTEM	2026-04-28 07:15:56.535763+00
6b69d3a8-6438-44d8-969f-30d5992327e6	ขั้นตอนการขอเบิกอุปกรณ์ไอที	การขออุปกรณ์ไอทีสามารถทำผ่านระบบ Request ได้ตั้งแต่วันนี้	DEPARTMENT	["mock_id_1", "mock_id_2"]	t	\N	\N	SYSTEM	2026-04-28 03:15:56.546486+00	SYSTEM	2026-04-28 07:15:56.546486+00
dd355de5-2329-40f8-be28-9968c7dda4b9	ยินดีต้อนรับพนักงานใหม่	ยินดีต้อนรับทีมงานใหม่ 10 ท่านเข้าสู่ครอบครัว NexOne	ROLE	["mock_id_1", "mock_id_2"]	t	\N	\N	SYSTEM	2026-04-28 04:15:56.557279+00	SYSTEM	2026-04-28 07:15:56.557279+00
d8b362b4-1abe-476f-8c5a-24e42ab34f29	เปลี่ยนแปลงสถานที่จอดรถ	ตั้งแต่วันจันทร์หน้า พื้นที่จอดรถโซน B จะปรับปรุง	USER	["mock_id_1", "mock_id_2"]	t	\N	\N	SYSTEM	2026-04-28 05:15:56.567874+00	SYSTEM	2026-04-28 07:15:56.567874+00
723c2e46-d03b-4059-88aa-628750c943bd	สรุปรายงานการประชุมผู้บริหาร	สรุปการประชุมเรื่องทิศทางบริษัทในครึ่งปีหลัง	ALL	[]	f	\N	\N	SYSTEM	2026-04-28 06:15:56.579075+00	SYSTEM	2026-04-28 07:15:56.579075+00
\.


--
-- Data for Name: contact_persons; Type: TABLE DATA; Schema: nex_core; Owner: postgres
--

COPY nex_core.contact_persons (create_date, create_by, update_date, update_by, is_active, company_id, contact_person_id, contact_name, contact_mobile, line_id) FROM stdin;
\.


--
-- Data for Name: email_settings; Type: TABLE DATA; Schema: nex_core; Owner: postgres
--

COPY nex_core.email_settings (create_date, create_by, update_date, update_by, is_active, email_setting_id, smtp_host, smtp_port, smtp_user, smtp_password) FROM stdin;
\.


--
-- Data for Name: email_templates; Type: TABLE DATA; Schema: nex_core; Owner: postgres
--

COPY nex_core.email_templates (create_date, create_by, update_date, update_by, is_active, template_id, title, email_content, template_code, language_code, app_name) FROM stdin;
\.


--
-- Data for Name: language_translations; Type: TABLE DATA; Schema: nex_core; Owner: postgres
--

COPY nex_core.language_translations (create_date, create_by, update_date, update_by, is_active, translation_id, language_code, page_key, label_key, label_value) FROM stdin;
2026-04-27 16:01:29.568458+00	system	\N	\N	t	41	th	system_apps	NexCore	ระบบจัดการส่วนกลาง
2026-04-27 16:01:29.579621+00	system	\N	\N	t	42	en	system_apps	NexCore	Admin Control
2026-04-27 16:02:31.206927+00	system	\N	\N	t	43	en	system_apps	NexForce	Human Resource Management
2026-04-27 16:02:31.216813+00	system	\N	\N	t	44	th	system_apps	NexForce	ระบบบริหารจัดการทรัพยากรบุคคลครบวงจร
2026-04-27 16:02:55.725915+00	system	\N	\N	t	45	th	system_apps	NexSite	ระบบบริหารจัดการเว็บไซต์องค์กร
2026-04-27 16:02:55.7364+00	system	\N	\N	t	46	en	system_apps	NexSite	Enterprise Website Management
2026-04-27 16:03:10.207475+00	system	\N	\N	t	47	en	system_apps	NexAsset	Asset Management
2026-04-27 16:03:10.218372+00	system	\N	\N	t	48	th	system_apps	NexAsset	ระบบบริหารจัดการสินทรัพย์และครุภัณฑ์
2026-04-27 16:03:31.64142+00	system	\N	\N	t	49	th	system_apps	NexProcure	ระบบบริหารจัดการจัดซื้อจัดจ้าง
2026-04-27 16:03:31.651974+00	system	\N	\N	t	50	en	system_apps	NexProcure	Enterprise Procurement System
2026-04-27 16:04:35.678918+00	system	\N	\N	t	51	en	system_apps	NexStock	Inventory Management System
2026-04-27 16:04:35.689387+00	system	\N	\N	t	52	th	system_apps	NexStock	ระบบบริหารจัดการสินค้าคงคลัง
2026-04-27 16:04:56.244775+00	system	\N	\N	t	53	en	system_apps	NexProduce	Manufacturing Execution System (MES / MRP)
2026-04-27 16:04:56.255251+00	system	\N	\N	t	54	th	system_apps	NexProduce	ระบบวางแผนและควบคุมการผลิต
2026-04-27 16:05:09.493649+00	system	\N	\N	t	55	th	system_apps	NexSpeed	ระบบบริหารจัดการการขนส่งและโลจิสติกส์
2026-04-27 16:05:09.504831+00	system	\N	\N	t	56	en	system_apps	NexSpeed	Transportation Management
2026-04-27 16:05:22.185612+00	system	\N	\N	t	57	en	system_apps	NexSales	Sales Order Management & CRM
2026-04-27 16:05:22.197565+00	system	\N	\N	t	58	th	system_apps	NexSales	ระบบบริหารงานขายและลูกค้าสัมพันธ์
2026-04-27 16:06:11.964181+00	system	\N	\N	t	59	th	system_apps	NexPOS	ระบบจัดการหน้าร้าน
2026-04-27 16:06:11.979534+00	system	\N	\N	t	60	en	system_apps	NexPOS	Point of Sale
2026-04-27 16:06:35.86369+00	system	\N	\N	t	61	en	system_apps	NexDelivery	Last-mile Delivery Track
2026-04-27 16:06:35.874715+00	system	\N	\N	t	62	th	system_apps	NexDelivery	ระบบตรวจสอบสถานะการจัดส่งสำหรับลูกค้า
2026-04-27 16:07:00.17669+00	system	\N	\N	t	63	th	system_apps	NexFinance	ระบบบัญชีและการเงินระดับองค์กร
2026-04-27 16:07:00.189195+00	system	\N	\N	t	64	en	system_apps	NexFinance	Enterprise Financial Management
2026-04-27 16:07:25.457489+00	system	\N	\N	t	65	en	system_apps	NexCost	Enterprise Cost Optimization
2026-04-27 16:07:25.467493+00	system	\N	\N	t	66	th	system_apps	NexCost	แพลตฟอร์มบริหารและเพิ่มประสิทธิภาพต้นทุน
2026-04-27 16:07:57.646088+00	system	\N	\N	t	67	th	system_apps	NexTax	ระบบจัดการภาษี VAT และหัก ณ ที่จ่าย
2026-04-27 16:07:57.657577+00	system	\N	\N	t	68	en	system_apps	NexTax	Tax Management
2026-04-27 16:08:20.823793+00	system	\N	\N	t	69	en	system_apps	NexPayroll	Payroll Management
2026-04-27 16:08:20.83378+00	system	\N	\N	t	70	th	system_apps	NexPayroll	ระบบเงินเดือนและประกันสังคม
2026-04-27 16:08:36.672273+00	system	\N	\N	t	71	th	system_apps	NexLess	ระบบจัดการเอกสารดิจิทัลอัจฉริยะ
2026-04-27 16:08:36.683133+00	system	\N	\N	t	72	en	system_apps	NexLess	Smart Paperless & Document Management
2026-04-27 16:08:57.614169+00	system	\N	\N	t	73	en	system_apps	NexApprove	E-Approval Workflow
2026-04-27 16:08:57.625294+00	system	\N	\N	t	74	th	system_apps	NexApprove	ระบบ Workflow อนุมัติเอกสารแบบครบวงจร
2026-04-27 16:09:20.641802+00	system	\N	\N	t	75	en	system_apps	NexAudit	Audit & Compliance Log
2026-04-27 16:09:20.652281+00	system	\N	\N	t	76	th	system_apps	NexAudit	ระบบบันทึก Audit Log และ PDPA Compliance
2026-04-27 16:09:37.391012+00	system	\N	\N	t	77	th	system_apps	NexMaint	ระบบบริหารงานซ่อมบำรุง
2026-04-27 16:09:37.412458+00	system	\N	\N	t	78	en	system_apps	NexMaint	Preventive Maintenance
2026-04-27 16:14:12.39318+00	system	\N	\N	t	79	th	system_apps	NexLearn	ระบบฝึกอบรมและ e-Learning
2026-04-27 16:14:12.404899+00	system	\N	\N	t	80	en	system_apps	NexLearn	Learning Management System
2026-04-27 16:14:24.53291+00	system	\N	\N	t	81	en	system_apps	NexConnect	API Integration Hub
2026-04-27 16:14:24.542776+00	system	\N	\N	t	82	th	system_apps	NexConnect	ศูนย์กลางการเชื่อมต่อและบูรณาการ API ภายนอก
2026-04-27 16:14:35.956631+00	system	\N	\N	t	83	en	system_apps	NexBI	Executive Dashboard & Data Analytics
2026-04-27 16:14:35.970057+00	system	\N	\N	t	84	th	system_apps	NexBI	ระบบศูนย์กลางวิเคราะห์ข้อมูลสำหรับผู้บริหาร
2026-04-27 17:04:30.084523+00	system	\N	\N	t	85	th	menu	nexcore-01-010	ภาพรวม
2026-04-27 17:04:30.096825+00	system	\N	\N	t	86	en	menu	nexcore-01-010	Overview
2026-04-27 17:04:30.108406+00	system	\N	\N	t	87	th	menu	nexcore-01-020	องค์กร
2026-04-27 17:04:30.119375+00	system	\N	\N	t	88	en	menu	nexcore-01-020	Organization
2026-04-27 17:04:30.13001+00	system	\N	\N	t	89	th	menu	nexcore-01-030	ความปลอดภัย
2026-04-27 17:04:30.141055+00	system	\N	\N	t	90	en	menu	nexcore-01-030	Security
2026-04-27 17:04:30.151455+00	system	\N	\N	t	91	th	menu	nexcore-01-040	การปรับแต่ง
2026-04-27 17:04:30.164944+00	system	\N	\N	t	92	en	menu	nexcore-01-040	Customization
2026-04-27 17:04:30.175935+00	system	\N	\N	t	93	th	menu	nexcore-01-050	แม่แบบ
2026-04-27 17:04:30.195839+00	system	\N	\N	t	94	en	menu	nexcore-01-050	Templates
2026-04-27 17:04:30.206417+00	system	\N	\N	t	95	th	menu	nexcore-01-060	ระบบ
2026-04-27 17:04:30.232479+00	system	\N	\N	t	96	en	menu	nexcore-01-060	System
2026-04-27 17:04:30.246418+00	system	\N	\N	t	97	th	menu	nexcore-01-070	ข้อมูลอ้างอิง
2026-04-27 17:04:30.257052+00	system	\N	\N	t	98	en	menu	nexcore-01-070	Reference Data
2026-04-27 17:04:30.268539+00	system	\N	\N	t	99	th	menu	nexcore-01-080	รูปแบบเมนู
2026-04-27 17:04:30.278976+00	system	\N	\N	t	100	en	menu	nexcore-01-080	Menu Styles
2026-04-27 17:04:30.320508+00	system	\N	\N	t	104	en	menu	nexcore-02-010	Admin
2026-04-27 17:04:30.341426+00	system	\N	\N	t	106	en	menu	nexcore-02-020	Analytics
2026-04-27 17:04:30.361947+00	system	\N	\N	t	108	en	menu	nexcore-02-030	Commerce
2026-04-27 17:04:30.382402+00	system	\N	\N	t	110	en	menu	nexcore-02-040	Finance
2026-04-27 17:04:30.401545+00	system	\N	\N	t	112	en	menu	nexcore-02-050	Governance
2026-04-27 17:04:30.420459+00	system	\N	\N	t	114	en	menu	nexcore-02-060	Operations
2026-04-27 17:04:30.439991+00	system	\N	\N	t	116	en	menu	nexcore-02-070	People
2026-04-27 17:04:30.470506+00	system	\N	\N	t	118	en	menu	nexcore-02-080	Site & Portal
2026-04-27 17:04:30.480843+00	system	\N	\N	t	119	th	menu	nexcore-03-010	ภาพรวมระบบ
2026-04-27 17:04:30.494842+00	system	\N	\N	t	120	en	menu	nexcore-03-010	System Overview
2026-04-27 17:04:30.509949+00	system	\N	\N	t	121	th	menu	nexcore-03-020	ระบบประกาศ
2026-04-27 17:04:30.520431+00	system	\N	\N	t	122	en	menu	nexcore-03-020	Announcements
2026-04-27 17:04:30.529793+00	system	\N	\N	t	123	th	menu	nexcore-03-030	การแจ้งเตือน
2026-04-27 17:04:30.53947+00	system	\N	\N	t	124	en	menu	nexcore-03-030	Notifications
2026-04-27 17:04:30.549757+00	system	\N	\N	t	125	th	menu	nexcore-03-040	ประวัติการใช้งาน
2026-04-27 17:04:30.559334+00	system	\N	\N	t	126	en	menu	nexcore-03-040	Activity Log
2026-04-27 17:04:30.568919+00	system	\N	\N	t	127	th	menu	nexcore-03-050	ข้อมูลบริษัท
2026-04-27 17:04:30.578773+00	system	\N	\N	t	128	en	menu	nexcore-03-050	Company Info
2026-04-27 17:04:30.299972+00	system	\N	\N	t	102	en	menu	nexcore-01-090	System Apps
2026-04-27 17:04:30.31031+00	system	\N	\N	t	103	th	menu	nexcore-02-010	ผู้ดูแลระบบ
2026-04-27 17:04:30.33077+00	system	\N	\N	t	105	th	menu	nexcore-02-020	การวิเคราะห์ข้อมูล
2026-04-27 17:04:30.372432+00	system	\N	\N	t	109	th	menu	nexcore-02-040	การเงิน
2026-04-27 17:04:30.391914+00	system	\N	\N	t	111	th	menu	nexcore-02-050	การกำกับดูแล
2026-04-27 17:04:30.410855+00	system	\N	\N	t	113	th	menu	nexcore-02-060	การดำเนินงาน
2026-04-27 17:04:30.45503+00	system	\N	\N	t	117	th	menu	nexcore-02-080	เว็บไซต์และพอร์ทัล
2026-04-27 17:04:30.588484+00	system	\N	\N	t	129	th	menu	nexcore-03-060	ข้อมูลสาขา
2026-04-27 17:04:30.61001+00	system	\N	\N	t	130	en	menu	nexcore-03-060	Branch Info
2026-04-27 17:04:30.620012+00	system	\N	\N	t	131	th	menu	nexcore-03-070	การเงิน & ภาษี
2026-04-27 17:04:30.629298+00	system	\N	\N	t	132	en	menu	nexcore-03-070	Finance & Tax
2026-04-27 17:04:30.638854+00	system	\N	\N	t	133	th	menu	nexcore-03-080	ผู้ใช้งานระบบ
2026-04-27 17:04:30.651792+00	system	\N	\N	t	134	en	menu	nexcore-03-080	Users
2026-04-27 17:04:30.661932+00	system	\N	\N	t	135	th	menu	nexcore-03-090	บทบาทและสิทธิ์
2026-04-27 17:04:30.671786+00	system	\N	\N	t	136	en	menu	nexcore-03-090	Roles & Permissions
2026-04-27 17:04:30.681426+00	system	\N	\N	t	137	th	menu	nexcore-03-100	ตั้งค่าความปลอดภัย
2026-04-27 17:04:30.69126+00	system	\N	\N	t	138	en	menu	nexcore-03-100	Security Settings
2026-04-27 17:04:30.700826+00	system	\N	\N	t	139	th	menu	nexcore-03-110	การแสดงผล & ธีม
2026-04-27 17:04:30.71031+00	system	\N	\N	t	140	en	menu	nexcore-03-110	Display & Theme
2026-04-27 17:04:30.719797+00	system	\N	\N	t	141	th	menu	nexcore-03-120	อีเมลแม่แบบ
2026-04-27 17:04:30.729372+00	system	\N	\N	t	142	en	menu	nexcore-03-120	Email Templates
2026-04-27 17:04:30.747887+00	system	\N	\N	t	143	th	menu	nexcore-03-130	มาสเตอร์ แบบที่ 1
2026-04-27 17:04:30.75783+00	system	\N	\N	t	144	en	menu	nexcore-03-130	Master Type 1
2026-04-27 17:04:30.767285+00	system	\N	\N	t	145	th	menu	nexcore-03-140	มาสเตอร์ แบบที่ 2
2026-04-27 17:04:30.777066+00	system	\N	\N	t	146	en	menu	nexcore-03-140	Master Type 2
2026-04-27 17:04:30.787501+00	system	\N	\N	t	147	th	menu	nexcore-03-150	มาสเตอร์ แบบที่ 3
2026-04-27 17:04:30.798494+00	system	\N	\N	t	148	en	menu	nexcore-03-150	Master Type 3
2026-04-27 17:04:30.809463+00	system	\N	\N	t	149	th	menu	nexcore-03-160	มาสเตอร์และกราฟ แบบที่ 1
2026-04-27 17:04:30.819259+00	system	\N	\N	t	150	en	menu	nexcore-03-160	Master & Graph Type 1
2026-04-27 17:04:30.82829+00	system	\N	\N	t	151	th	menu	nexcore-03-170	ภาษา
2026-04-27 17:04:30.837869+00	system	\N	\N	t	152	en	menu	nexcore-03-170	Languages
2026-04-27 17:04:30.848462+00	system	\N	\N	t	153	th	menu	nexcore-03-180	เมนู
2026-04-27 17:04:30.858277+00	system	\N	\N	t	154	en	menu	nexcore-03-180	Menus
2026-04-27 17:04:30.868512+00	system	\N	\N	t	155	th	menu	nexcore-03-190	ภาษาเมนู
2026-04-27 17:04:30.877945+00	system	\N	\N	t	156	en	menu	nexcore-03-190	Menu Languages
2026-04-27 17:04:30.889569+00	system	\N	\N	t	157	th	menu	nexcore-03-200	แอปในระบบ
2026-04-27 17:04:30.899369+00	system	\N	\N	t	158	en	menu	nexcore-03-200	System Apps
2026-04-27 17:04:30.909285+00	system	\N	\N	t	159	th	menu	nexcore-03-210	ฐานข้อมูล
2026-04-27 17:04:30.918809+00	system	\N	\N	t	160	en	menu	nexcore-03-210	Database
2026-04-27 17:04:30.928515+00	system	\N	\N	t	161	th	menu	nexcore-03-220	ตรวจสอบระบบ
2026-04-27 17:04:30.937765+00	system	\N	\N	t	162	en	menu	nexcore-03-220	System Audit
2026-04-27 17:04:30.947494+00	system	\N	\N	t	163	th	menu	nexcore-03-230	จังหวัด / พื้นที่
2026-04-27 17:04:30.957729+00	system	\N	\N	t	164	en	menu	nexcore-03-230	Provinces / Areas
2026-04-27 17:04:30.967337+00	system	\N	\N	t	165	th	menu	nexcore-03-240	หน่วยนับ
2026-04-27 17:04:30.976797+00	system	\N	\N	t	166	en	menu	nexcore-03-240	Units of Measurement
2026-04-27 17:04:30.995982+00	system	\N	\N	t	168	en	menu	nexcore-03-250	Classic
2026-04-27 17:04:31.015169+00	system	\N	\N	t	170	en	menu	nexcore-03-260	Dual Sidebar
2026-04-27 17:04:31.024834+00	system	\N	\N	t	171	th	menu	nexcore-03-270	NexCore
2026-04-27 17:04:31.034271+00	system	\N	\N	t	172	en	menu	nexcore-03-270	NexCore
2026-04-27 17:04:31.024834+00	system	\N	\N	t	197	th	menu	nexcore-03-400	NexAsset
2026-04-27 17:04:31.034271+00	system	\N	\N	t	198	en	menu	nexcore-03-400	NexAsset
2026-04-27 17:04:30.289476+00	system	\N	\N	t	101	th	menu	nexcore-01-090	แอปทั้งระบบ
2026-04-27 17:04:30.986347+00	system	\N	\N	t	167	th	menu	nexcore-03-250	คลาสสิค
2026-04-27 17:04:31.00527+00	system	\N	\N	t	169	th	menu	nexcore-03-260	ดับเบิ้ลเมนู
2026-04-27 17:04:31.024834+00	system	\N	\N	t	173	th	menu	nexcore-03-280	NexBI
2026-04-27 17:04:31.034271+00	system	\N	\N	t	174	en	menu	nexcore-03-280	NexBI
2026-04-27 17:04:31.024834+00	system	\N	\N	t	175	th	menu	nexcore-03-290	NexProcure
2026-04-27 17:04:31.034271+00	system	\N	\N	t	176	en	menu	nexcore-03-290	NexProcure
2026-04-27 17:04:31.024834+00	system	\N	\N	t	177	th	menu	nexcore-03-300	NexSales
2026-04-27 17:04:31.034271+00	system	\N	\N	t	178	en	menu	nexcore-03-300	NexSales
2026-04-27 17:04:31.024834+00	system	\N	\N	t	179	th	menu	nexcore-03-310	NexPOS
2026-04-27 17:04:31.034271+00	system	\N	\N	t	180	en	menu	nexcore-03-310	NexPOS
2026-04-27 17:04:31.024834+00	system	\N	\N	t	181	th	menu	nexcore-03-320	NexConnect
2026-04-27 17:04:31.034271+00	system	\N	\N	t	182	en	menu	nexcore-03-320	NexConnect
2026-04-27 17:04:31.024834+00	system	\N	\N	t	183	th	menu	nexcore-03-330	NexFinance
2026-04-27 17:04:31.034271+00	system	\N	\N	t	184	en	menu	nexcore-03-330	NexFinance
2026-04-27 17:04:31.024834+00	system	\N	\N	t	185	th	menu	nexcore-03-340	NexCost
2026-04-27 17:04:31.034271+00	system	\N	\N	t	186	en	menu	nexcore-03-340	NexCost
2026-04-27 17:04:31.024834+00	system	\N	\N	t	187	th	menu	nexcore-03-350	NexTax
2026-04-27 17:04:31.034271+00	system	\N	\N	t	188	en	menu	nexcore-03-350	NexTax
2026-04-27 17:04:31.024834+00	system	\N	\N	t	189	th	menu	nexcore-03-360	NexPayroll
2026-04-27 17:04:31.034271+00	system	\N	\N	t	190	en	menu	nexcore-03-360	NexPayroll
2026-04-27 17:04:31.024834+00	system	\N	\N	t	191	th	menu	nexcore-03-370	NexLess
2026-04-27 17:04:31.034271+00	system	\N	\N	t	192	en	menu	nexcore-03-370	NexLess
2026-04-27 17:04:31.024834+00	system	\N	\N	t	193	th	menu	nexcore-03-380	NexApprove
2026-04-27 17:04:31.034271+00	system	\N	\N	t	194	en	menu	nexcore-03-380	NexApprove
2026-04-27 17:04:31.024834+00	system	\N	\N	t	195	th	menu	nexcore-03-390	NexAudit
2026-04-27 17:04:31.034271+00	system	\N	\N	t	196	en	menu	nexcore-03-390	NexAudit
2026-04-27 17:04:31.024834+00	system	\N	\N	t	199	th	menu	nexcore-03-410	NexStock
2026-04-27 17:04:31.034271+00	system	\N	\N	t	200	en	menu	nexcore-03-410	NexStock
2026-04-27 17:04:31.024834+00	system	\N	\N	t	201	th	menu	nexcore-03-420	NexProduce
2026-04-27 17:04:31.034271+00	system	\N	\N	t	202	en	menu	nexcore-03-420	NexProduce
2026-04-27 17:04:31.024834+00	system	\N	\N	t	203	th	menu	nexcore-03-430	NexSpeed
2026-04-27 17:04:31.034271+00	system	\N	\N	t	204	en	menu	nexcore-03-430	NexSpeed
2026-04-27 17:04:31.024834+00	system	\N	\N	t	205	th	menu	nexcore-03-440	NexDelivery
2026-04-27 17:04:31.034271+00	system	\N	\N	t	206	en	menu	nexcore-03-440	NexDelivery
2026-04-27 17:04:31.024834+00	system	\N	\N	t	207	th	menu	nexcore-03-450	NexMaint
2026-04-27 17:04:31.034271+00	system	\N	\N	t	208	en	menu	nexcore-03-450	NexMaint
2026-04-27 17:04:31.024834+00	system	\N	\N	t	209	th	menu	nexcore-03-460	NexForce
2026-04-27 17:04:31.034271+00	system	\N	\N	t	210	en	menu	nexcore-03-460	NexForce
2026-04-27 17:04:31.024834+00	system	\N	\N	t	211	th	menu	nexcore-03-470	NexLearn
2026-04-27 17:04:31.034271+00	system	\N	\N	t	212	en	menu	nexcore-03-470	NexLearn
2026-04-27 17:04:31.024834+00	system	\N	\N	t	213	th	menu	nexcore-03-480	NexSite
2026-04-27 17:04:31.034271+00	system	\N	\N	t	214	en	menu	nexcore-03-480	NexSite
2026-04-27 17:04:30.351854+00	system	\N	\N	t	107	th	menu	nexcore-02-030	การติดต่อ
2026-04-27 17:04:30.430303+00	system	\N	\N	t	115	th	menu	nexcore-02-070	การจัดการบุคคลากร
2026-04-29 15:45:06.967139+00	system	\N	\N	t	215	en	menu	nex-core:template-master-4	Master Type 4
2026-04-29 15:45:06.967139+00	system	\N	\N	t	216	th	menu	nex-core:template-master-4	ข้อมูลหลักแบบที่ 4
\.


--
-- Data for Name: languages; Type: TABLE DATA; Schema: nex_core; Owner: postgres
--

COPY nex_core.languages (create_date, create_by, update_date, update_by, is_active, language_id, language_code, language_name, description) FROM stdin;
2026-04-18 10:10:10+00	system	\N	\N	t	1	th	Thai	Thai
2026-04-18 10:10:10+00	system	\N	\N	t	2	en	English	English
\.


--
-- Data for Name: menus; Type: TABLE DATA; Schema: nex_core; Owner: postgres
--

COPY nex_core.menus (create_date, create_by, update_date, update_by, is_active, app_name, parent_id, menu_id, menu_seq, menu_code, menu_value, title, route, base, page_key, icon) FROM stdin;
2026-04-27 21:07:00.585409+00	system	\N	\N	t	nex-core	71	36	11	nex-core:company	company	Company	company	company	company	Building2
2026-04-27 21:07:00.585409+00	system	\N	\N	t	nex-core	71	37	12	nex-core:branch	branch	Branch	branch	branch	branch	MapPin
2026-04-27 21:07:00.585409+00	system	\N	\N	t	nex-core	71	38	13	nex-core:billing	billing	Billing	billing	billing	billing	CreditCard
2026-04-27 21:07:00.585409+00	system	\N	\N	t	nex-core	72	39	21	nex-core:users	users	Users	users	users	users	Users
2026-04-27 21:07:00.585409+00	system	\N	\N	t	nex-core	70	34	4	nex-core:notifications	notifications	Notifications	notifications	notifications	notifications	Bell
2026-04-27 21:07:00.585409+00	system	\N	\N	t	nex-core	70	35	5	nex-core:logs	logs	Activity Logs	logs	logs	logs	FileText
2026-04-29 15:45:06.948107+00	system	\N	\N	t	nex-core	77	84	39	nex-core:template-master-4	Master Type 4	Master Type 4	/template-master-4	/template-master-4	template-master-4	layout-template
2026-04-28 06:50:11.440212+00	system	\N	\N	t	nex-core	77	81	40	nex-core:template-master-graph	Master Graph 1	Master Graph 1	/template-master-graph	/template-master-graph	template-master-graph	layout-template
2026-04-28 06:50:11.354737+00	system	\N	\N	t	nex-core	\N	77	35	nex-core:templates	Templates	Templates	/templates	/templates	templates	layout-template
2026-04-28 06:50:11.376774+00	system	\N	\N	t	nex-core	77	78	36	nex-core:template-master-1	Master Type 1	Master Type 1	/template-master-1	/template-master-1	template-master-1	layout-template
2026-04-28 06:50:11.397857+00	system	\N	\N	t	nex-core	77	79	37	nex-core:template-master-2	Master Type 2	Master Type 2	/template-master-2	/template-master-2	template-master-2	layout-template
2026-04-28 06:50:11.418822+00	system	\N	\N	t	nex-core	77	80	38	nex-core:template-master-3	Master Type 3	Master Type 3	/template-master-3	/template-master-3	template-master-3	layout-template
2026-04-28 06:50:11.332317+00	system	\N	\N	t	nex-core	70	76	3	nex-core:announcements	Announcements	Announcements	/announcements	/announcements	announcements	megaphone
2026-04-27 21:07:00.585409+00	system	\N	\N	t	nex-site	\N	52	1	dashboard	dashboard	Dashboard	/	/	dashboard	\N
2026-04-27 21:07:00.585409+00	system	\N	\N	t	nex-site	\N	53	2	pages	pages	Pages	/pages	/pages	pages	\N
2026-04-27 21:07:00.585409+00	system	\N	\N	t	nex-site	\N	54	3	theme	theme	Theme	/theme	/theme	theme	\N
2026-04-27 21:07:00.585409+00	system	\N	\N	t	nex-site	\N	55	4	translations	translations	Language	/translations	/translations	translations	\N
2026-04-27 21:07:00.585409+00	system	\N	\N	t	nex-site	\N	56	5	settings	settings	Settings	/settings	/settings	settings	\N
2026-04-27 21:07:00.585409+00	system	\N	\N	t	nex-speed	\N	57	1	nex-speed:dashboard	dashboard	Dashboard	dashboard	dashboard	dashboard	\N
2026-04-27 21:07:00.585409+00	system	\N	\N	t	nex-speed	\N	58	2	nex-speed:fleet	fleet	Fleet	fleet	fleet	fleet	\N
2026-04-27 21:07:00.585409+00	system	\N	\N	t	nex-speed	\N	59	3	nex-speed:subcontractors	subcontractors	Subcontractors	subcontractors	subcontractors	subcontractors	\N
2026-04-27 21:07:00.585409+00	system	\N	\N	t	nex-speed	\N	60	4	nex-speed:maintenance	maintenance	Maintenance	maintenance	maintenance	maintenance	\N
2026-04-27 21:07:00.585409+00	system	\N	\N	t	nex-speed	\N	61	5	nex-speed:drivers	drivers	Drivers	drivers	drivers	drivers	\N
2026-04-27 21:07:00.585409+00	system	\N	\N	t	nex-speed	\N	62	6	nex-speed:orders	orders	Orders	orders	orders	orders	\N
2026-04-27 21:07:00.585409+00	system	\N	\N	t	nex-speed	\N	63	7	nex-speed:trips	trips	GPS Tracking	trips	trips	trips	\N
2026-04-27 21:07:00.585409+00	system	\N	\N	t	nex-speed	\N	64	8	nex-speed:finance	finance	Finance	finance	finance	finance	\N
2026-04-27 21:07:00.585409+00	system	\N	\N	t	nex-speed	\N	65	9	nex-speed:analytics	analytics	Analytics	analytics	analytics	analytics	\N
2026-04-27 21:07:00.585409+00	system	\N	\N	t	nex-speed	\N	66	10	nex-speed:mechanics	mechanics	Mechanics	mechanics	mechanics	mechanics	\N
2026-04-27 21:07:00.585409+00	system	\N	\N	t	nex-speed	\N	67	11	nex-speed:stock-parts	stock-parts	Part Types	stock-parts	stock-parts	stock-parts	\N
2026-04-27 21:07:00.585409+00	system	\N	\N	t	nex-speed	\N	68	12	nex-speed:settings	settings	Settings	settings	settings	settings	\N
2026-04-27 21:07:00.585409+00	system	\N	\N	t	nex-core	74	44	41	nex-core:languages	languages	Languages	languages	languages	languages	Globe
2026-04-27 21:07:00.585409+00	system	\N	\N	t	nex-core	74	45	42	nex-core:menus	menus	Menus	menus	menus	menus	LayoutTemplate
2026-04-27 21:07:00.585409+00	system	\N	\N	t	nex-core	72	40	22	nex-core:roles	roles	Roles	roles	roles	roles	ShieldCheck
2026-04-27 21:07:00.585409+00	system	\N	\N	t	nex-core	72	41	23	nex-core:security-config	security-config	Security Config	security-config	security-config	security-config	Shield
2026-04-27 21:07:00.585409+00	system	\N	\N	t	nex-core	73	42	31	nex-core:display	display	Display & Theme	display	display	display	SlidersHorizontal
2026-04-27 21:07:00.585409+00	system	\N	\N	t	nex-core	73	43	32	nex-core:email	email	Email Templates	email	email	email	Mail
2026-04-28 06:33:23.919688+00	system	\N	\N	t	nex-core	\N	70	1	nex-core:overview	Overview	Overview	/overview	/overview	overview	dashboard
2026-04-28 06:33:23.942621+00	system	\N	\N	t	nex-core	\N	71	10	nex-core:organization	Organization	Organization	/organization	/organization	organization	business
2026-04-28 06:33:23.96423+00	system	\N	\N	t	nex-core	\N	72	20	nex-core:security	Security	Security	/security	/security	security	shield
2026-04-28 06:33:23.98321+00	system	\N	\N	t	nex-core	\N	73	30	nex-core:customization	Customization	Customization	/customization	/customization	customization	palette
2026-04-28 06:33:24.003661+00	system	\N	\N	t	nex-core	\N	74	40	nex-core:system-group	System	System	/system-group	/system-group	system-group	settings
2026-04-28 06:33:24.024841+00	system	\N	\N	t	nex-core	\N	75	50	nex-core:master-data	Master Data	Master Data	/master-data	/master-data	master-data	database
2026-04-27 21:07:00.585409+00	system	\N	\N	t	nex-core	70	33	2	nex-core:dashboard	dashboard	System Overview	dashboard	dashboard	dashboard	\N
2026-04-27 21:07:00.585409+00	system	\N	\N	t	nex-core	74	46	43	nex-core:menus-languages	menus-languages	Menu Languages	menus-languages	menus-languages	menus-languages	Globe
2026-04-27 21:07:00.585409+00	system	\N	\N	t	nex-core	74	47	44	nex-core:system-apps	system-apps	System Apps	system-apps	system-apps	system-apps	LayoutDashboard
2026-04-27 21:07:00.585409+00	system	\N	\N	t	nex-core	74	48	45	nex-core:database	database	Database	database	database	database	Database
2026-04-27 21:07:00.585409+00	system	\N	\N	t	nex-core	74	49	46	nex-core:monitoring	monitoring	Monitoring	monitoring	monitoring	monitoring	Monitor
2026-04-27 21:07:00.585409+00	system	\N	\N	t	nex-core	75	50	51	nex-core:provinces	provinces	Provinces	provinces	provinces	provinces	MapPin
2026-04-27 21:07:00.585409+00	system	\N	\N	t	nex-core	75	51	52	nex-core:unit-type	unit-type	Unit Types	unit-type	unit-type	unit-type	Box
\.


--
-- Data for Name: organize; Type: TABLE DATA; Schema: nex_core; Owner: postgres
--

COPY nex_core.organize (create_date, create_by, update_date, update_by, is_active, organize_id, organize_code, organize_type, organize_name, address, country, city, province, zipcode, email, phone, fax, website, logo_path, favicon_path, tax_no) FROM stdin;
\.


--
-- Data for Name: provinces; Type: TABLE DATA; Schema: nex_core; Owner: postgres
--

COPY nex_core.provinces (create_date, create_by, update_date, update_by, is_active, province_id, name_th, name_en, abbr, region) FROM stdin;
\.


--
-- Data for Name: role_permissions; Type: TABLE DATA; Schema: nex_core; Owner: postgres
--

COPY nex_core.role_permissions (create_date, create_by, update_date, update_by, is_active, app_name, role_id, menus_id, permissions_id, can_view, can_add, can_edit, can_delete, can_import, can_export) FROM stdin;
2026-04-28 07:14:35.198236+00	system	\N	\N	t	nex-site	1	52	32	t	t	t	t	t	t
2026-04-28 07:14:35.209742+00	system	\N	\N	t	nex-site	1	53	33	t	t	t	t	t	t
2026-04-28 07:14:35.237224+00	system	\N	\N	t	nex-site	1	54	34	t	t	t	t	t	t
2026-04-28 07:14:35.247848+00	system	\N	\N	t	nex-site	1	55	35	t	t	t	t	t	t
2026-04-28 07:14:35.25822+00	system	\N	\N	t	nex-site	1	56	36	t	t	t	t	t	t
2026-04-28 07:13:46.877702+00	system	2026-04-28 10:13:26.238667+00	system	t	nex-core	1	38	9	t	t	t	t	t	t
2026-04-28 07:13:46.888175+00	system	2026-04-28 10:13:26.249682+00	system	t	nex-core	1	72	10	t	t	t	t	t	t
2026-04-28 07:13:46.899204+00	system	2026-04-28 10:13:26.260653+00	system	t	nex-core	1	39	11	t	t	t	t	t	t
2026-04-28 07:13:46.910047+00	system	2026-04-28 10:13:26.271303+00	system	t	nex-core	1	40	12	t	t	t	t	t	t
2026-04-28 07:13:46.9208+00	system	2026-04-28 10:13:26.282271+00	system	t	nex-core	1	41	13	t	t	t	t	t	t
2026-04-28 07:13:46.931636+00	system	2026-04-28 10:13:26.293141+00	system	t	nex-core	1	73	14	t	t	t	t	t	t
2026-04-28 07:13:46.942655+00	system	2026-04-28 10:13:26.303684+00	system	t	nex-core	1	42	15	t	t	t	t	t	t
2026-04-28 07:13:46.953688+00	system	2026-04-28 10:13:26.31464+00	system	t	nex-core	1	43	16	t	t	t	t	t	t
2026-04-28 07:13:46.788236+00	system	2026-04-28 10:13:26.147666+00	system	t	nex-core	1	70	1	t	t	t	t	t	t
2026-04-28 07:13:46.801612+00	system	2026-04-28 10:13:26.159647+00	system	t	nex-core	1	33	2	t	t	t	t	t	t
2026-04-28 07:13:46.812671+00	system	2026-04-28 10:13:26.170133+00	system	t	nex-core	1	76	3	t	t	t	t	t	t
2026-04-28 07:13:46.823757+00	system	2026-04-28 10:13:26.182155+00	system	t	nex-core	1	34	4	t	t	t	t	t	t
2026-04-28 07:13:46.834641+00	system	2026-04-28 10:13:26.194134+00	system	t	nex-core	1	35	5	t	t	t	t	t	t
2026-04-28 07:13:46.845695+00	system	2026-04-28 10:13:26.205639+00	system	t	nex-core	1	71	6	t	t	t	t	t	t
2026-04-28 07:13:46.856658+00	system	2026-04-28 10:13:26.217094+00	system	t	nex-core	1	36	7	t	t	t	t	t	t
2026-04-28 07:13:46.866963+00	system	2026-04-28 10:13:26.227647+00	system	t	nex-core	1	37	8	t	t	t	t	t	t
2026-04-29 15:45:40.571318+00	system	\N	\N	t	nex-core	1	84	38	t	t	t	t	t	t
2026-04-29 15:45:40.571318+00	system	\N	\N	t	nex-core	2	84	39	t	t	t	t	t	t
2026-04-29 15:45:40.571318+00	system	\N	\N	t	nex-core	3	84	40	t	t	t	t	t	t
2026-04-29 15:45:40.571318+00	system	\N	\N	t	nex-core	4	84	41	t	t	t	t	t	t
2026-04-29 15:45:40.571318+00	system	\N	\N	t	nex-core	5	84	42	t	t	t	t	t	t
2026-04-29 15:45:40.571318+00	system	\N	\N	t	nex-core	6	84	43	t	t	t	t	t	t
2026-04-29 15:45:40.571318+00	system	\N	\N	t	nex-core	7	84	44	t	t	t	t	t	t
2026-04-29 15:45:40.571318+00	system	\N	\N	t	nex-core	8	84	45	t	t	t	t	t	t
2026-04-28 07:13:46.964582+00	system	2026-04-28 10:13:26.325658+00	system	t	nex-core	1	77	17	t	t	t	t	t	t
2026-04-28 07:13:46.985975+00	system	2026-04-28 10:13:26.347636+00	system	t	nex-core	1	79	19	t	t	t	t	t	t
2026-04-28 07:13:46.997203+00	system	2026-04-28 10:13:26.360659+00	system	t	nex-core	1	80	20	t	t	t	t	t	t
2026-04-28 07:13:47.008063+00	system	2026-04-28 10:13:26.371781+00	system	t	nex-core	1	81	21	t	t	t	t	t	t
2026-04-28 07:13:47.019677+00	system	2026-04-28 10:13:26.382755+00	system	t	nex-core	1	74	22	t	t	t	t	t	t
2026-04-28 07:13:47.031248+00	system	2026-04-28 10:13:26.393622+00	system	t	nex-core	1	44	23	t	t	t	t	t	t
2026-04-28 07:13:47.043273+00	system	2026-04-28 10:13:26.404591+00	system	t	nex-core	1	45	24	t	t	t	t	t	t
2026-04-28 07:13:47.054535+00	system	2026-04-28 10:13:26.415741+00	system	t	nex-core	1	46	25	t	t	t	t	t	t
2026-04-28 07:13:47.066049+00	system	2026-04-28 10:13:26.426661+00	system	t	nex-core	1	47	26	t	t	t	t	t	t
2026-04-28 07:13:47.077251+00	system	2026-04-28 10:13:26.437719+00	system	t	nex-core	1	48	27	t	t	t	t	t	t
2026-04-28 07:13:47.088975+00	system	2026-04-28 10:13:26.448174+00	system	t	nex-core	1	49	28	t	t	t	t	t	t
2026-04-28 07:13:47.100658+00	system	2026-04-28 10:13:26.458721+00	system	t	nex-core	1	75	29	t	t	t	t	t	t
2026-04-28 07:13:47.112658+00	system	2026-04-28 10:13:26.4692+00	system	t	nex-core	1	50	30	t	t	t	t	t	t
2026-04-28 07:13:47.124609+00	system	2026-04-28 10:13:26.48065+00	system	t	nex-core	1	51	31	t	t	t	t	t	t
2026-04-28 07:13:46.975622+00	system	2026-04-28 10:13:26.336626+00	system	f	nex-core	1	78	18	t	t	t	t	t	t
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: nex_core; Owner: postgres
--

COPY nex_core.roles (create_date, create_by, update_date, update_by, is_active, role_id, role_name, description) FROM stdin;
2025-02-25 17:21:33.911482+00	system	\N		t	1	System Admin	\N
2025-02-13 09:40:24.398568+00	system	\N		t	2	Super Admin	\N
2026-01-15 04:51:58.433409+00	system	\N		t	3	Sale Staff	\N
2026-01-15 04:50:51.609216+00	system	\N		t	4	Sale Manager	\N
2025-03-19 12:29:24.443362+00	system	\N		t	5	IT Staff	\N
2026-01-15 04:51:36.040784+00	system	\N		t	6	IT Manager	\N
2025-12-26 08:41:56.360695+00	system	\N		t	7	HR Staff	\N
2025-03-20 10:29:21.261546+00	system	\N		t	8	HR Manager	\N
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: nex_core; Owner: postgres
--

COPY nex_core.sessions (id, user_id, ip_address, user_agent, device_name, is_active, expires_at, created_at, last_activity_at) FROM stdin;
83b594a76c379b3773a2362559090f65c11ca36dd2c08b4415b50d6783018510437afe0defe9d53084351458f8a77af234529a82a7e0d1f95929ac9b13469364	baa6f7ca-bb1b-435b-81a2-6966a9476e01	::1	node	Browser	t	2026-04-30 21:17:39.318+00	2026-04-30 06:17:40.327197+00	2026-04-30 06:17:40.327197+00
ed957d7a983e0062c6b863ef024e1c73e61f59e0191a52db6251d66e9ff63fb827723e266d45eb893c8405cfd71622070ef1f3ae33dfbdca91aebd2b349d618c	baa6f7ca-bb1b-435b-81a2-6966a9476e01	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	Windows PC	t	2026-04-30 22:27:25.085+00	2026-04-30 07:27:26.059692+00	2026-04-30 14:54:23.122+00
4295d127ce8a72c7d2ad9fcf292bc5dd6a072e509792d66db5c0e6a9ec07916eba0babb264a16cfb1daf86cb07f9231bfb6609b0672bc93135bea27a51d1814f	baa6f7ca-bb1b-435b-81a2-6966a9476e01	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	Windows PC	t	2026-04-30 20:46:24.742+00	2026-04-30 12:46:25.569491+00	2026-04-30 13:53:09.484+00
\.


--
-- Data for Name: system_apps; Type: TABLE DATA; Schema: nex_core; Owner: postgres
--

COPY nex_core.system_apps (create_date, create_by, update_date, update_by, is_active, app_id, app_seq_no, app_group, app_name, icon_path, route_path, api_path) FROM stdin;
2026-04-17 08:08:20.998+00	system	\N		t	11	1	Admin	NexCore	/apps/nexlearn.png	http://localhost:3101	http://localhost:8101/api
2026-04-16 00:10:20.289+00	system	\N	\N	t	12	2	People	NexForce	/apps/nexforce.png	http://localhost:3102	http://localhost:8102/api
2026-04-16 00:10:20.289+00	system	\N	\N	t	13	3	Site & Portal	NexSite	/apps/nexsite.png	http://localhost:3103	http://localhost:8103/api
2026-04-17 08:04:00.062+00	system	\N	\N	t	14	4	Operations	NexAsset	/apps/nexasset.png	http://localhost:3104	http://localhost:8104/api
2026-04-16 00:10:20.289+00	system	\N	\N	t	15	5	Commerce	NexProcure	/apps/nexprocure.png	http://localhost:3105	http://localhost:8105/api
2026-04-16 00:10:20.289+00	system	\N	\N	t	16	6	Operations	NexStock	/apps/nexstock.png	http://localhost:3106	http://localhost:8106/api
2026-04-16 00:10:20.289+00	system	\N	\N	t	17	7	Operations	NexProduce	/apps/nexproduce.png	http://localhost:3107	http://localhost:8107/api
2026-04-16 00:10:20.289+00	system	\N	\N	t	18	8	Operations	NexSpeed	/apps/nexspeed.png	http://localhost:3108	http://localhost:8108/api
2026-04-16 00:10:20.289+00	system	\N	\N	t	19	9	Commerce	NexSales	/apps/nexsales.png	http://localhost:3109	http://localhost:8109/api
2026-04-17 08:04:00.062+00	system	\N	\N	t	20	10	Commerce	NexPOS	/apps/nexpos.png	http://localhost:3010	http://localhost:8010/api
2026-04-17 08:04:00.062+00	system	\N	\N	t	21	11	Operations	NexDelivery	/apps/nexdelivery.png	http://localhost:3011	http://localhost:8011/api
2026-04-16 00:10:20.289+00	system	\N	\N	t	22	12	Finance	NexFinance	/apps/nexfinance.png	http://localhost:3012	http://localhost:8012/api
2026-04-16 00:10:20.289+00	system	\N	\N	t	23	13	Finance	NexCost	/apps/nexcost.png	http://localhost:3013	http://localhost:8013/api
2026-04-17 08:04:00.062+00	system	\N	\N	t	24	14	Finance	NexTax	/apps/nextax.png	http://localhost:3014	http://localhost:8014/api
2026-04-17 08:04:00.062+00	system	\N	\N	t	25	15	Finance	NexPayroll	/apps/nexpayroll.png	http://localhost:3015	http://localhost:8015/api
2026-04-16 00:10:20.289+00	system	\N	\N	t	26	16	Governance	NexLess	/apps/nexless.png	http://localhost:3016	http://localhost:8016/api
2026-04-17 08:04:00.062+00	system	\N	\N	t	27	17	Governance	NexApprove	/apps/nexapprove.png	http://localhost:3017	http://localhost:8017/api
2026-04-17 08:04:00.062+00	system	\N	\N	t	28	18	Governance	NexAudit	/apps/nexaudit.png	http://localhost:3018	http://localhost:8018/api
2026-04-17 08:08:20.998+00	system	\N	\N	t	29	19	Operations	NexMaint	/apps/nexmaint.png	http://localhost:3019	http://localhost:8019/api
2026-04-17 08:08:20.998+00	system	\N	\N	t	30	20	People	NexLearn	/apps/nexlearn.png	http://localhost:3020	http://localhost:8020/api
2026-04-17 08:04:00.062+00	system	\N	\N	t	31	21	Commerce	NexConnect	/apps/nexconnect.png	http://localhost:3021	http://localhost:8021/api
2026-04-16 00:10:20.289+00	system	\N	\N	t	32	22	Analytics	NexBI	/apps/nexbi.png	http://localhost:3022	http://localhost:8022/api
\.


--
-- Data for Name: system_config; Type: TABLE DATA; Schema: nex_core; Owner: postgres
--

COPY nex_core.system_config (create_date, create_by, update_date, update_by, is_active, system_id, system_seq_no, system_group, system_key, system_value, system_type, description) FROM stdin;
2026-04-30 14:13:47.52552+00	system	\N	\N	t	1	1	SECURITY	ENABLE_DB_ENCRYPTION	true	config	Toggle Data Encryption
2026-04-30 07:23:22.710941+00	system	\N	\N	t	2	99	SYSTEM	MAINTENANCE_MODE	false	boolean	Toggle to put the system into maintenance mode
2026-04-30 07:23:22.755788+00	system	\N	\N	t	3	99	SECURITY	SESSION_TIMEOUT_MIN	30	number	Session timeout in minutes
2026-04-30 07:23:22.80104+00	system	\N	\N	t	4	99	SECURITY	MAX_LOGIN_ATTEMPT	5	number	Maximum failed login attempts before locking account
2026-04-30 07:23:22.843908+00	system	\N	\N	t	5	99	SECURITY	PASSWORD_EXPIRE_DAYS	90	number	Days before user must reset password
2026-04-30 07:23:22.885862+00	system	\N	\N	t	7	99	SECURITY	ENABLE_DB_ENCRYPT	true	boolean	Enable database level field encryption
\.


--
-- Data for Name: template_master_graph; Type: TABLE DATA; Schema: nex_core; Owner: postgres
--

COPY nex_core.template_master_graph (create_date, create_by, update_date, update_by, is_active, template_id, order_id, invoice_no, customer, amount, issue_date, due_date, status) FROM stdin;
2026-04-22 13:11:03.73727+00	system	2026-04-22 13:11:03.73727+00	\N	t	2	\N	INV-2026-001	บริษัท สยามซีเมนต์ จำกัด	3700.00	2026-03-01	2026-03-15	เกินกำหนด
2026-04-22 13:11:03.73727+00	system	2026-04-22 13:11:03.73727+00	\N	t	3	ORD-2026-0002	INV-2026-002	บริษัท ซีพี ออลล์ จำกัด	5350.00	2026-03-02	2026-03-16	ชำระแล้ว
2026-04-22 13:11:03.73727+00	system	2026-04-22 13:11:03.73727+00	\N	t	4	ORD-2026-0003	INV-2026-003	บริษัท เบทาโกร จำกัด	6000.00	2026-03-03	2026-03-17	ชำระแล้ว
2026-04-22 13:11:03.73727+00	system	2026-04-22 13:11:03.73727+00	\N	t	5	ORD-2026-0004	INV-2026-004	บริษัท ทรู คอร์ปอเรชั่น จำกัด	7650.00	2026-03-04	2026-03-18	รอชำระ
2026-04-22 13:11:03.73727+00	system	2026-04-22 13:11:03.73727+00	\N	t	6	\N	INV-2026-005	บริษัท โตโยต้า มอเตอร์ จำกัด	8300.00	2026-03-05	2026-03-19	ชำระแล้ว
2026-04-22 13:11:03.73727+00	system	2026-04-22 13:11:03.73727+00	\N	t	7	ORD-2026-0006	INV-2026-006	บริษัท ลาซาด้า จำกัด	8950.00	2026-03-06	2026-03-20	ชำระแล้ว
2026-04-22 13:11:03.73727+00	system	2026-04-22 13:11:03.73727+00	\N	t	8	ORD-2026-0007	INV-2026-007	บริษัท สยามซีเมนต์ จำกัด	9100.00	2026-03-07	2026-03-21	รอชำระ
2026-04-22 13:11:03.73727+00	system	2026-04-22 13:11:03.73727+00	\N	t	9	ORD-2026-0008	INV-2026-008	บริษัท ซีพี ออลล์ จำกัด	9750.00	2026-03-08	2026-03-22	เกินกำหนด
2026-04-22 13:11:03.73727+00	system	2026-04-22 13:11:03.73727+00	\N	t	10	\N	INV-2026-009	บริษัท เบทาโกร จำกัด	9400.00	2026-03-09	2026-03-23	ชำระแล้ว
2026-04-22 13:11:03.73727+00	system	2026-04-22 13:11:03.73727+00	\N	t	11	ORD-2026-0010	INV-2026-010	บริษัท ทรู คอร์ปอเรชั่น จำกัด	10050.00	2026-03-10	2026-03-24	รอชำระ
2026-04-22 13:11:03.73727+00	system	2026-04-22 13:11:03.73727+00	\N	t	12	ORD-2026-0011	INV-2026-011	บริษัท โตโยต้า มอเตอร์ จำกัด	10700.00	2026-03-11	2026-03-25	ชำระแล้ว
2026-04-22 13:11:03.73727+00	system	2026-04-22 13:11:03.73727+00	\N	t	13	ORD-2026-0012	INV-2026-012	บริษัท ลาซาด้า จำกัด	10850.00	2026-03-12	2026-03-26	ชำระแล้ว
2026-04-22 13:11:03.73727+00	system	2026-04-22 13:11:03.73727+00	\N	t	14	ORD-2026-0013	INV-2026-013	บริษัท สยามซีเมนต์ จำกัด	11500.00	2026-03-13	2026-03-27	รอชำระ
2026-04-22 13:11:03.73727+00	system	2026-04-22 13:11:03.73727+00	\N	t	15	\N	INV-2026-014	บริษัท ซีพี ออลล์ จำกัด	11650.00	2026-03-14	2026-03-28	เกินกำหนด
2026-04-22 13:11:03.73727+00	system	2026-04-22 13:11:03.73727+00	\N	t	16	ORD-2026-0015	INV-2026-015	บริษัท เบทาโกร จำกัด	12300.00	2026-03-15	2026-03-01	ชำระแล้ว
2026-04-22 13:11:03.73727+00	system	2026-04-22 13:11:03.73727+00	\N	t	17	ORD-2026-0016	INV-2026-016	บริษัท ทรู คอร์ปอเรชั่น จำกัด	12450.00	2026-03-16	2026-03-02	รอชำระ
2026-04-22 13:11:03.73727+00	system	2026-04-22 13:11:03.73727+00	\N	t	18	ORD-2026-0017	INV-2026-017	บริษัท โตโยต้า มอเตอร์ จำกัด	13100.00	2026-03-17	2026-03-03	ชำระแล้ว
2026-04-22 13:11:03.73727+00	system	2026-04-22 13:11:03.73727+00	\N	t	19	ORD-2026-0018	INV-2026-018	บริษัท ลาซาด้า จำกัด	12750.00	2026-03-18	2026-03-04	ชำระแล้ว
2026-04-22 13:11:03.73727+00	system	2026-04-22 13:11:03.73727+00	\N	t	20	ORD-2026-0019	INV-2026-019	บริษัท สยามซีเมนต์ จำกัด	13400.00	2026-03-19	2026-03-05	รอชำระ
2026-04-22 13:11:03.73727+00	system	2026-04-22 13:11:03.73727+00	\N	t	21	\N	INV-2026-020	บริษัท ซีพี ออลล์ จำกัด	14050.00	2026-03-20	2026-03-06	ชำระแล้ว
2026-04-22 13:11:03.73727+00	system	2026-04-22 13:11:03.73727+00	\N	t	22	ORD-2026-0021	INV-2026-021	บริษัท เบทาโกร จำกัด	14700.00	2026-03-21	2026-03-07	เกินกำหนด
2026-04-22 13:11:03.73727+00	system	2026-04-22 13:11:03.73727+00	\N	t	23	ORD-2026-0022	INV-2026-022	บริษัท ทรู คอร์ปอเรชั่น จำกัด	14350.00	2026-03-22	2026-03-08	ชำระแล้ว
2026-04-22 13:11:03.73727+00	system	2026-04-22 13:11:03.73727+00	\N	t	24	ORD-2026-0023	INV-2026-023	บริษัท โตโยต้า มอเตอร์ จำกัด	15000.00	2026-03-23	2026-03-09	รอชำระ
2026-04-22 13:11:03.73727+00	system	2026-04-22 13:11:03.73727+00	\N	t	25	\N	INV-2026-024	บริษัท ลาซาด้า จำกัด	15150.00	2026-03-24	2026-03-10	ชำระแล้ว
2026-04-22 13:11:03.73727+00	system	2026-04-22 13:11:03.73727+00	\N	t	26	ORD-2026-0025	INV-2026-025	บริษัท สยามซีเมนต์ จำกัด	15800.00	2026-03-25	2026-03-11	ชำระแล้ว
2026-04-22 13:11:03.73727+00	system	2026-04-22 13:11:03.73727+00	\N	t	27	ORD-2026-0026	INV-2026-026	บริษัท ซีพี ออลล์ จำกัด	15950.00	2026-03-26	2026-03-12	รอชำระ
2026-04-22 13:11:03.73727+00	system	2026-04-22 13:11:03.73727+00	\N	t	28	ORD-2026-0027	INV-2026-027	บริษัท เบทาโกร จำกัด	16600.00	2026-03-27	2026-03-13	ชำระแล้ว
2026-04-22 13:11:03.73727+00	system	2026-04-22 13:11:03.73727+00	\N	t	29	ORD-2026-0028	INV-2026-028	บริษัท ทรู คอร์ปอเรชั่น จำกัด	16250.00	2026-03-28	2026-03-14	เกินกำหนด
2026-04-22 13:11:03.73727+00	system	2026-04-22 13:11:03.73727+00	\N	t	30	ORD-2026-0029	INV-2026-029	บริษัท โตโยต้า มอเตอร์ จำกัด	16900.00	2026-03-01	2026-03-15	ชำระแล้ว
2026-04-22 13:11:03.73727+00	system	2026-04-22 13:11:03.73727+00	\N	t	31	\N	INV-2026-030	บริษัท ลาซาด้า จำกัด	17050.00	2026-03-02	2026-03-16	รอชำระ
2026-04-22 13:11:03.73727+00	system	2026-04-22 13:11:03.73727+00	\N	t	32	ORD-2026-0031	INV-2026-031	บริษัท สยามซีเมนต์ จำกัด	17700.00	2026-03-03	2026-03-17	ชำระแล้ว
2026-04-22 13:11:03.73727+00	system	2026-04-22 13:11:03.73727+00	\N	t	33	ORD-2026-0032	INV-2026-032	บริษัท ซีพี ออลล์ จำกัด	17350.00	2026-03-04	2026-03-18	ชำระแล้ว
2026-04-22 13:11:03.73727+00	system	2026-04-22 13:11:03.73727+00	\N	t	34	ORD-2026-0033	INV-2026-033	บริษัท เบทาโกร จำกัด	18000.00	2026-03-05	2026-03-19	รอชำระ
2026-04-22 13:11:03.73727+00	system	2026-04-22 13:11:03.73727+00	\N	t	35	\N	INV-2026-034	บริษัท ทรู คอร์ปอเรชั่น จำกัด	18150.00	2026-03-06	2026-03-20	ชำระแล้ว
2026-04-22 13:11:03.73727+00	system	2026-04-22 13:11:03.73727+00	\N	t	36	ORD-2026-0035	INV-2026-035	บริษัท โตโยต้า มอเตอร์ จำกัด	18800.00	2026-03-07	2026-03-21	เกินกำหนด
2026-04-22 13:11:03.73727+00	system	2026-04-22 13:11:03.73727+00	\N	t	37	ORD-2026-0036	INV-2026-036	บริษัท ลาซาด้า จำกัด	18950.00	2026-03-08	2026-03-22	ชำระแล้ว
2026-04-22 13:11:03.73727+00	system	2026-04-22 13:11:03.73727+00	\N	t	38	ORD-2026-0037	INV-2026-037	บริษัท สยามซีเมนต์ จำกัด	19600.00	2026-03-09	2026-03-23	รอชำระ
2026-04-22 13:11:03.73727+00	system	2026-04-22 13:11:03.73727+00	\N	t	39	ORD-2026-0038	INV-2026-038	บริษัท ซีพี ออลล์ จำกัด	19250.00	2026-03-10	2026-03-24	ชำระแล้ว
2026-04-22 13:11:03.73727+00	system	2026-04-22 13:11:03.73727+00	\N	t	40	ORD-2026-0039	INV-2026-039	บริษัท เบทาโกร จำกัด	19900.00	2026-03-11	2026-03-25	ชำระแล้ว
2026-04-22 13:11:03.73727+00	system	2026-04-22 13:11:03.73727+00	\N	t	41	\N	INV-2026-040	บริษัท ทรู คอร์ปอเรชั่น จำกัด	20050.00	2026-03-12	2026-03-26	รอชำระ
2026-04-22 13:11:03.73727+00	system	2026-04-22 13:11:03.73727+00	\N	t	42	ORD-2026-0041	INV-2026-041	บริษัท โตโยต้า มอเตอร์ จำกัด	20700.00	2026-03-13	2026-03-27	ชำระแล้ว
2026-04-22 13:11:03.73727+00	system	2026-04-22 13:11:03.73727+00	\N	t	43	ORD-2026-0042	INV-2026-042	บริษัท ลาซาด้า จำกัด	20350.00	2026-03-14	2026-03-28	เกินกำหนด
2026-04-22 13:11:03.73727+00	system	2026-04-22 13:11:03.73727+00	\N	t	44	ORD-2026-0043	INV-2026-043	บริษัท สยามซีเมนต์ จำกัด	21000.00	2026-03-15	2026-03-01	ชำระแล้ว
2026-04-22 13:11:03.73727+00	system	2026-04-22 13:11:03.73727+00	\N	t	45	ORD-2026-0044	INV-2026-044	บริษัท ซีพี ออลล์ จำกัด	21150.00	2026-03-16	2026-03-02	รอชำระ
2026-04-22 13:11:03.73727+00	system	2026-04-22 13:11:03.73727+00	\N	t	46	ORD-2026-0045	INV-2026-045	บริษัท เบทาโกร จำกัด	21800.00	2026-03-17	2026-03-03	ชำระแล้ว
2026-04-27 15:16:09.339987+00	system	2026-04-27 15:18:52.892603+00	system	t	47	fD	1dDDSD	DDD	0	2026-04-27	2026-04-27	รอชำระ
\.


--
-- Data for Name: templates; Type: TABLE DATA; Schema: nex_core; Owner: postgres
--

COPY nex_core.templates (create_date, create_by, update_date, update_by, is_active, template_id, template_group, template_name, template_desc) FROM stdin;
2026-04-21 07:54:37.078273+00	system	\N	\N	t	1	หมวดหมู่หลัก	มาตรฐานแบบที่ 2 (Pattern 2)	มีส่วนประกอบของกล่องตัวเลขสถิติด้านบน
2026-04-21 07:54:37.079771+00	system	\N	\N	t	2	หมวดหมู่ย่อย	เปลี่ยน Layout ง่ายๆ	เพียงแค่ใส่ props summaryCards ใน CrudLayout
2026-04-21 07:54:37.081158+00	system	\N	\N	t	3	หมวดหมู่หลัก	รายการคำสั่งซื้อคลังสินค้าที่ 4	ข้อมูลจำลองการส่งมอบและสถานะลอจิสติกส์ 4
2026-04-21 07:54:37.081714+00	system	\N	\N	t	4	หมวดหมู่ย่อย	รายการคำสั่งซื้อคลังสินค้าที่ 5	ข้อมูลจำลองการส่งมอบและสถานะลอจิสติกส์ 5
2026-04-21 07:54:37.083323+00	system	\N	\N	t	5	หมวดหมู่หลัก	รายการคำสั่งซื้อคลังสินค้าที่ 7	ข้อมูลจำลองการส่งมอบและสถานะลอจิสติกส์ 7
2026-04-21 07:54:37.083977+00	system	\N	\N	t	6	หมวดหมู่ย่อย	รายการคำสั่งซื้อคลังสินค้าที่ 8	ข้อมูลจำลองการส่งมอบและสถานะลอจิสติกส์ 8
2026-04-21 07:54:37.08466+00	system	\N	\N	t	7	หมวดหมู่ย่อย	รายการคำสั่งซื้อคลังสินค้าที่ 9	ข้อมูลจำลองการส่งมอบและสถานะลอจิสติกส์ 9
2026-04-21 07:54:37.085347+00	system	\N	\N	t	8	หมวดหมู่หลัก	รายการคำสั่งซื้อคลังสินค้าที่ 10	ข้อมูลจำลองการส่งมอบและสถานะลอจิสติกส์ 10
2026-04-21 07:54:37.085882+00	system	\N	\N	t	9	หมวดหมู่ย่อย	รายการคำสั่งซื้อคลังสินค้าที่ 11	ข้อมูลจำลองการส่งมอบและสถานะลอจิสติกส์ 11
2026-04-21 07:54:37.08644+00	system	\N	\N	t	10	หมวดหมู่ย่อย	รายการคำสั่งซื้อคลังสินค้าที่ 12	ข้อมูลจำลองการส่งมอบและสถานะลอจิสติกส์ 12
2026-04-21 07:54:37.087264+00	system	\N	\N	t	11	หมวดหมู่ย่อย	รายการคำสั่งซื้อคลังสินค้าที่ 14	ข้อมูลจำลองการส่งมอบและสถานะลอจิสติกส์ 14
2026-04-21 07:54:37.087701+00	system	\N	\N	t	12	หมวดหมู่ย่อย	รายการคำสั่งซื้อคลังสินค้าที่ 15	ข้อมูลจำลองการส่งมอบและสถานะลอจิสติกส์ 15
2026-04-21 07:54:37.088146+00	system	\N	\N	t	13	หมวดหมู่หลัก	รายการคำสั่งซื้อคลังสินค้าที่ 16	ข้อมูลจำลองการส่งมอบและสถานะลอจิสติกส์ 16
2026-04-21 07:54:37.08852+00	system	\N	\N	t	14	หมวดหมู่ย่อย	รายการคำสั่งซื้อคลังสินค้าที่ 17	ข้อมูลจำลองการส่งมอบและสถานะลอจิสติกส์ 17
2026-04-21 07:54:37.089411+00	system	\N	\N	t	15	หมวดหมู่หลัก	รายการคำสั่งซื้อคลังสินค้าที่ 19	ข้อมูลจำลองการส่งมอบและสถานะลอจิสติกส์ 19
2026-04-21 07:54:37.08987+00	system	\N	\N	t	16	หมวดหมู่ย่อย	รายการคำสั่งซื้อคลังสินค้าที่ 20	ข้อมูลจำลองการส่งมอบและสถานะลอจิสติกส์ 20
2026-04-21 07:54:37.090263+00	system	\N	\N	t	17	หมวดหมู่ย่อย	รายการคำสั่งซื้อคลังสินค้าที่ 21	ข้อมูลจำลองการส่งมอบและสถานะลอจิสติกส์ 21
2026-04-21 07:54:37.090658+00	system	\N	\N	t	18	หมวดหมู่หลัก	รายการคำสั่งซื้อคลังสินค้าที่ 22	ข้อมูลจำลองการส่งมอบและสถานะลอจิสติกส์ 22
2026-04-21 07:54:37.09144+00	system	\N	\N	t	19	หมวดหมู่ย่อย	รายการคำสั่งซื้อคลังสินค้าที่ 24	ข้อมูลจำลองการส่งมอบและสถานะลอจิสติกส์ 24
2026-04-21 07:54:37.091879+00	system	\N	\N	t	20	หมวดหมู่หลัก	รายการคำสั่งซื้อคลังสินค้าที่ 25	ข้อมูลจำลองการส่งมอบและสถานะลอจิสติกส์ 25
2026-04-21 07:54:37.098517+00	system	\N	\N	t	21	หมวดหมู่ย่อย	รายการคำสั่งซื้อคลังสินค้าที่ 26	ข้อมูลจำลองการส่งมอบและสถานะลอจิสติกส์ 26
2026-04-21 07:54:37.098963+00	system	\N	\N	t	22	หมวดหมู่ย่อย	รายการคำสั่งซื้อคลังสินค้าที่ 27	ข้อมูลจำลองการส่งมอบและสถานะลอจิสติกส์ 27
2026-04-21 07:54:37.086851+00	system	\N	\N	t	23	หมวดหมู่หลัก	รายการคำสั่งซื้อคลังสินค้าที่ 13	ข้อมูลจำลองการส่งมอบและสถานะลอจิสติกส์ 13
2026-04-21 07:54:37.089025+00	system	\N	\N	t	24	หมวดหมู่ย่อย	รายการคำสั่งซื้อคลังสินค้าที่ 18	ข้อมูลจำลองการส่งมอบและสถานะลอจิสติกส์ 18
2026-04-21 07:54:37.091068+00	system	\N	\N	t	25	หมวดหมู่ย่อย	รายการคำสั่งซื้อคลังสินค้าที่ 23	ข้อมูลจำลองการส่งมอบและสถานะลอจิสติกส์ 23
2026-04-21 07:54:37.100926+00	system	\N	\N	t	26	หมวดหมู่ย่อย	รายการคำสั่งซื้อคลังสินค้าที่ 29	ข้อมูลจำลองการส่งมอบและสถานะลอจิสติกส์ 29
2026-04-21 07:54:37.101734+00	system	\N	\N	t	27	หมวดหมู่ย่อย	รายการคำสั่งซื้อคลังสินค้าที่ 30	ข้อมูลจำลองการส่งมอบและสถานะลอจิสติกส์ 30
2026-04-21 07:54:37.102248+00	system	\N	\N	t	28	หมวดหมู่หลัก	รายการคำสั่งซื้อคลังสินค้าที่ 31	ข้อมูลจำลองการส่งมอบและสถานะลอจิสติกส์ 31
2026-04-21 07:54:37.102735+00	system	\N	\N	t	29	หมวดหมู่ย่อย	รายการคำสั่งซื้อคลังสินค้าที่ 32	ข้อมูลจำลองการส่งมอบและสถานะลอจิสติกส์ 32
2026-04-21 07:54:37.080382+00	system	\N	\N	t	30	สถานะพิเศษ	Export บาร์ฝั่งซ้าย	สามารถเติมเนื้อหาในฝั่งซ้าย toolbarLeft ได้
2026-04-21 07:54:37.082497+00	system	\N	\N	t	31	หมวดหมู่ย่อย	รายการคำสั่งซื้อคลังสินค้าที่ 6	ข้อมูลจำลองการส่งมอบและสถานะลอจิสติกส์ 6
2026-04-21 07:54:37.099462+00	system	\N	\N	t	32	หมวดหมู่หลัก	รายการคำสั่งซื้อคลังสินค้าที่ 28	ข้อมูลจำลองการส่งมอบและสถานะลอจิสติกส์ 28
\.


--
-- Data for Name: unit_types; Type: TABLE DATA; Schema: nex_core; Owner: postgres
--

COPY nex_core.unit_types (create_date, create_by, update_date, update_by, is_active, unit_type_id, unit_type_name, description, symbol) FROM stdin;
2026-04-15 19:15:05.007728+00	system	\N	\N	t	1	เมตร	หน่วยความยาว (Meter)	m
2026-04-15 19:15:05.008208+00	system	\N	\N	t	2	คัน	หน่วยนับสำหรับรถ (Vehicle)	veh
2026-04-15 19:15:05.008835+00	system	\N	\N	t	3	เที่ยว	หน่วยการขนส่ง (Trip)	trip
2026-04-16 13:30:56.853873+00	system	\N	\N	t	4	ชิ้น	หน่วยชิ้นทั่วไป (Piece)	pcs
2026-04-15 19:15:05.001494+00	system	\N	\N	t	5	ลิตร	หน่วยวัดปริมาตรของเหลว (Liter)	L
2026-04-15 19:15:05.002245+00	system	\N	\N	t	6	ชุด	อะไหล่หรืออุปกรณ์ที่มาเป็นชุด (Set)	set
2026-04-15 19:15:05.002777+00	system	\N	\N	t	7	เส้น	หน่วยนับสำหรับยาง สายพาน (Line/Belt/Tire)	pcs
2026-04-15 19:15:05.003294+00	system	\N	\N	t	8	ถัง	หน่วยนับของน้ำมัน/จาระบีแบบบรรจุถัง (Drum/Barrel)	drum
2026-04-15 19:15:05.003933+00	system	\N	\N	t	9	แกลลอน	หน่วยนับสำหรับน้ำมันหรือของเหลว (Gallon)	gal
2026-04-15 19:15:05.004553+00	system	\N	\N	t	10	หลอด	หน่วยสำหรับกาวหรือซิลิโคน (Tube)	tube
2026-04-15 19:15:05.004983+00	system	\N	\N	t	11	ม้วน	หน่วยสำหรับสายไฟหรือเทป (Roll)	roll
2026-04-15 19:15:05.005469+00	system	\N	\N	t	12	กิโลกรัม	หน่วยวัดและชั่งน้ำหนัก (Kilogram)	kg
2026-04-15 19:15:05.00589+00	system	\N	\N	t	13	ตัน	หน่วยความจุ/น้ำหนัก (Ton)	t
2026-04-15 19:15:05.006313+00	system	\N	\N	t	14	กล่อง	หน่วยหีบห่อแบบกล่อง (Box)	box
2026-04-15 19:15:05.006787+00	system	\N	\N	t	15	แผง	หน่วยบรรจุภัณฑ์แผง (Card/Panel)	card
2026-04-15 19:15:05.007277+00	system	\N	\N	t	16	ตู้	หน่วยตู้คอนเทนเนอร์ (Container)	cnt
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: nex_core; Owner: postgres
--

COPY nex_core.users (id, email, password, display_name, role_id, role_name, is_active, employee_id, avatar_url, last_login_at, failed_login_count, locked_until, create_date, create_by, update_date, update_by, require_password_change, password_changed_at, mfa_enabled, mfa_secret, manager_id, company_id, cost_center_code, valid_from, valid_to, deleted_at, timezone, language) FROM stdin;
ea155c9b-b859-4a1e-86ef-d23edf4e675e	user@company.com	ba9a818c692ec174338e51c613c16a26:c0a6e943fe327732a1cfc5c5ba90880375c17a34b033056d992d8ae1a45897c5968534a98f81855c5f3f1d1ddb09bde18c213bb098e4ed854c6a08acd98967e3	Normal User	2	user	t	\N	\N	\N	0	\N	2026-04-30 06:17:17.191801+00	system	2026-04-30 06:17:17.191801+00	\N	f	\N	f	\N	\N	\N	\N	\N	\N	\N	Asia/Bangkok	TH
5bea6bf4-0089-4dc3-a65a-4fa0171e25ba	somchai.r@nexone.co.th	2f059bb0a16e161a8e9d7a4cb2a5332f:c2426e6f93b778f2baace3a691648ec41831a7a1576ae04820d5864dea4e2880c0fde804048d412822bea8bf7190b843d14a1ba04946b75091bd8f1e9451cfe0	สมชาย รักดี	1	Super Admin	t	USR-001	\N	\N	0	\N	2026-04-30 08:04:38.966927+00	\N	2026-04-30 08:04:38.966927+00	\N	f	\N	f	\N	\N	\N	\N	\N	\N	\N	Asia/Bangkok	TH
d4323d25-c2c5-4736-b952-3411b6532f43	somying.j@nexone.co.th	c31b87c91a113be01c30aeb613c210c7:70b3598591d2da0c0926d292132bf52de959b5e5eb02cd23f40e42a0e2574f83a86db9b4e43571104bc681c670c6cdd581ac9b5482315f10f1af22ee216acfe1	สมหญิง จริงใจ	2	Fleet Manager	t	USR-002	\N	\N	0	\N	2026-04-30 08:04:39.077844+00	\N	2026-04-30 08:04:39.077844+00	\N	f	\N	f	\N	\N	\N	\N	\N	\N	\N	Asia/Bangkok	TH
0638eb8b-ee1d-4a03-81a6-1932a59edc0e	wichai.m@nexone.co.th	6a0cbc02f6002d8f930cf84dc4fa1a87:06fff32d732842945537944d81365a6837e3d66c1d021ec236997d63d9c83709ac4a79d028d9e4ce5192925ba6df739371b156898830e35c0ba11904ca41ac05	วิชัย มั่นคง	3	Warehouse Lead	t	USR-003	\N	\N	0	\N	2026-04-30 08:04:39.207804+00	\N	2026-04-30 08:04:39.207804+00	\N	f	\N	f	\N	\N	\N	\N	\N	\N	\N	Asia/Bangkok	TH
f7faf637-a0c9-42dd-9f03-ab76de9de476	naree.s@nexone.co.th	a4a33464afa0bf3671ee9a16e213ca39:3e9bb24599904374a949c3ad4391fcef19c46131c6197402f74bc820c47673edf8f69dbeea2a21b9f0e6b9ecd09e898e9e8cf128cfdc2cc58031a53c93af5bff	นารี สวยสด	4	Accountant	t	USR-004	\N	\N	0	\N	2026-04-30 08:04:39.305423+00	\N	2026-04-30 08:04:39.305423+00	\N	f	\N	f	\N	\N	\N	\N	\N	\N	\N	Asia/Bangkok	TH
0316de35-fcb7-43ce-be6e-930f3fd7b554	ekapong.k@nexone.co.th	6757bc74c5beb9328f0137e5139a3743:572c00b1dfaf3e58c47adfc8760aa95b306e3a686c1a2f3f3179c0284e8553af491638f73742a5dd3da02dee2d5268ca19a613b92659d418d77ae49775905021	เอกพงษ์ กล้าหาญ	5	Dispatcher	t	USR-005	\N	\N	0	\N	2026-04-30 08:04:39.403356+00	\N	2026-04-30 08:04:39.403356+00	\N	f	\N	f	\N	\N	\N	\N	\N	\N	\N	Asia/Bangkok	TH
baa6f7ca-bb1b-435b-81a2-6966a9476e01	admin@company.com	ba9a818c692ec174338e51c613c16a26:c0a6e943fe327732a1cfc5c5ba90880375c17a34b033056d992d8ae1a45897c5968534a98f81855c5f3f1d1ddb09bde18c213bb098e4ed854c6a08acd98967e3	Admin User	1	admin	t	\N	\N	2026-04-30 12:46:24.686+00	0	\N	2026-04-30 06:17:17.176554+00	system	2026-04-30 12:46:25.517922+00	\N	f	\N	f	\N	\N	\N	\N	\N	\N	\N	Asia/Bangkok	TH
\.


--
-- Name: contact_persons_contact_person_id_seq; Type: SEQUENCE SET; Schema: nex_core; Owner: postgres
--

SELECT pg_catalog.setval('nex_core.contact_persons_contact_person_id_seq', 1, false);


--
-- Name: email_settings_email_setting_id_seq; Type: SEQUENCE SET; Schema: nex_core; Owner: postgres
--

SELECT pg_catalog.setval('nex_core.email_settings_email_setting_id_seq', 1, false);


--
-- Name: email_templates_template_id_seq; Type: SEQUENCE SET; Schema: nex_core; Owner: postgres
--

SELECT pg_catalog.setval('nex_core.email_templates_template_id_seq', 1, false);


--
-- Name: language_translations_translation_id_seq; Type: SEQUENCE SET; Schema: nex_core; Owner: postgres
--

SELECT pg_catalog.setval('nex_core.language_translations_translation_id_seq', 216, true);


--
-- Name: languages_language_id_seq; Type: SEQUENCE SET; Schema: nex_core; Owner: postgres
--

SELECT pg_catalog.setval('nex_core.languages_language_id_seq', 2, true);


--
-- Name: menus_menu_id_seq; Type: SEQUENCE SET; Schema: nex_core; Owner: postgres
--

SELECT pg_catalog.setval('nex_core.menus_menu_id_seq', 84, true);


--
-- Name: organize_organize_id_seq; Type: SEQUENCE SET; Schema: nex_core; Owner: postgres
--

SELECT pg_catalog.setval('nex_core.organize_organize_id_seq', 1, false);


--
-- Name: provinces_province_id_seq; Type: SEQUENCE SET; Schema: nex_core; Owner: postgres
--

SELECT pg_catalog.setval('nex_core.provinces_province_id_seq', 1, false);


--
-- Name: role_permissions_permissions_id_seq; Type: SEQUENCE SET; Schema: nex_core; Owner: postgres
--

SELECT pg_catalog.setval('nex_core.role_permissions_permissions_id_seq', 45, true);


--
-- Name: roles_role_id_seq; Type: SEQUENCE SET; Schema: nex_core; Owner: postgres
--

SELECT pg_catalog.setval('nex_core.roles_role_id_seq', 8, true);


--
-- Name: system_apps_app_id_seq; Type: SEQUENCE SET; Schema: nex_core; Owner: postgres
--

SELECT pg_catalog.setval('nex_core.system_apps_app_id_seq', 32, true);


--
-- Name: system_config_system_id_seq; Type: SEQUENCE SET; Schema: nex_core; Owner: postgres
--

SELECT pg_catalog.setval('nex_core.system_config_system_id_seq', 7, true);


--
-- Name: template_master_graph_template_id_seq; Type: SEQUENCE SET; Schema: nex_core; Owner: postgres
--

SELECT pg_catalog.setval('nex_core.template_master_graph_template_id_seq', 47, true);


--
-- Name: templates_template_id_seq; Type: SEQUENCE SET; Schema: nex_core; Owner: postgres
--

SELECT pg_catalog.setval('nex_core.templates_template_id_seq', 32, true);


--
-- Name: unit_types_unit_type_id_seq; Type: SEQUENCE SET; Schema: nex_core; Owner: postgres
--

SELECT pg_catalog.setval('nex_core.unit_types_unit_type_id_seq', 16, true);


--
-- Name: announcements announcements_pkey; Type: CONSTRAINT; Schema: nex_core; Owner: postgres
--

ALTER TABLE ONLY nex_core.announcements
    ADD CONSTRAINT announcements_pkey PRIMARY KEY (id);


--
-- Name: contact_persons contact_persons_contact_mobile_key; Type: CONSTRAINT; Schema: nex_core; Owner: postgres
--

ALTER TABLE ONLY nex_core.contact_persons
    ADD CONSTRAINT contact_persons_contact_mobile_key UNIQUE (contact_mobile);


--
-- Name: contact_persons contact_persons_contact_name_key; Type: CONSTRAINT; Schema: nex_core; Owner: postgres
--

ALTER TABLE ONLY nex_core.contact_persons
    ADD CONSTRAINT contact_persons_contact_name_key UNIQUE (contact_name);


--
-- Name: contact_persons contact_persons_pkey; Type: CONSTRAINT; Schema: nex_core; Owner: postgres
--

ALTER TABLE ONLY nex_core.contact_persons
    ADD CONSTRAINT contact_persons_pkey PRIMARY KEY (contact_person_id);


--
-- Name: contact_persons contact_persons_unique; Type: CONSTRAINT; Schema: nex_core; Owner: postgres
--

ALTER TABLE ONLY nex_core.contact_persons
    ADD CONSTRAINT contact_persons_unique UNIQUE (company_id, contact_person_id);


--
-- Name: email_settings email_settings_pkey; Type: CONSTRAINT; Schema: nex_core; Owner: postgres
--

ALTER TABLE ONLY nex_core.email_settings
    ADD CONSTRAINT email_settings_pkey PRIMARY KEY (email_setting_id);


--
-- Name: email_templates email_templates_pkey; Type: CONSTRAINT; Schema: nex_core; Owner: postgres
--

ALTER TABLE ONLY nex_core.email_templates
    ADD CONSTRAINT email_templates_pkey PRIMARY KEY (template_id);


--
-- Name: language_translations language_translations_pkey; Type: CONSTRAINT; Schema: nex_core; Owner: postgres
--

ALTER TABLE ONLY nex_core.language_translations
    ADD CONSTRAINT language_translations_pkey PRIMARY KEY (translation_id);


--
-- Name: languages languages_language_code_key; Type: CONSTRAINT; Schema: nex_core; Owner: postgres
--

ALTER TABLE ONLY nex_core.languages
    ADD CONSTRAINT languages_language_code_key UNIQUE (language_code);


--
-- Name: languages languages_language_name_key; Type: CONSTRAINT; Schema: nex_core; Owner: postgres
--

ALTER TABLE ONLY nex_core.languages
    ADD CONSTRAINT languages_language_name_key UNIQUE (language_name);


--
-- Name: languages languages_pkey; Type: CONSTRAINT; Schema: nex_core; Owner: postgres
--

ALTER TABLE ONLY nex_core.languages
    ADD CONSTRAINT languages_pkey PRIMARY KEY (language_id);


--
-- Name: menus menus_menu_code_key; Type: CONSTRAINT; Schema: nex_core; Owner: postgres
--

ALTER TABLE ONLY nex_core.menus
    ADD CONSTRAINT menus_menu_code_key UNIQUE (menu_code);


--
-- Name: menus menus_parent_uk; Type: CONSTRAINT; Schema: nex_core; Owner: postgres
--

ALTER TABLE ONLY nex_core.menus
    ADD CONSTRAINT menus_parent_uk UNIQUE (menu_id, menu_seq, parent_id);


--
-- Name: menus menus_pkey; Type: CONSTRAINT; Schema: nex_core; Owner: postgres
--

ALTER TABLE ONLY nex_core.menus
    ADD CONSTRAINT menus_pkey PRIMARY KEY (menu_id);


--
-- Name: organize organize_pkey; Type: CONSTRAINT; Schema: nex_core; Owner: postgres
--

ALTER TABLE ONLY nex_core.organize
    ADD CONSTRAINT organize_pkey PRIMARY KEY (organize_id);


--
-- Name: provinces provinces_name_en_key; Type: CONSTRAINT; Schema: nex_core; Owner: postgres
--

ALTER TABLE ONLY nex_core.provinces
    ADD CONSTRAINT provinces_name_en_key UNIQUE (name_en);


--
-- Name: provinces provinces_name_th_key; Type: CONSTRAINT; Schema: nex_core; Owner: postgres
--

ALTER TABLE ONLY nex_core.provinces
    ADD CONSTRAINT provinces_name_th_key UNIQUE (name_th);


--
-- Name: provinces provinces_pkey; Type: CONSTRAINT; Schema: nex_core; Owner: postgres
--

ALTER TABLE ONLY nex_core.provinces
    ADD CONSTRAINT provinces_pkey PRIMARY KEY (province_id);


--
-- Name: role_permissions role_permissions_pkey; Type: CONSTRAINT; Schema: nex_core; Owner: postgres
--

ALTER TABLE ONLY nex_core.role_permissions
    ADD CONSTRAINT role_permissions_pkey PRIMARY KEY (permissions_id);


--
-- Name: role_permissions role_permissions_unique; Type: CONSTRAINT; Schema: nex_core; Owner: postgres
--

ALTER TABLE ONLY nex_core.role_permissions
    ADD CONSTRAINT role_permissions_unique UNIQUE (menus_id, role_id, permissions_id);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: nex_core; Owner: postgres
--

ALTER TABLE ONLY nex_core.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (role_id);


--
-- Name: roles roles_role_name_key; Type: CONSTRAINT; Schema: nex_core; Owner: postgres
--

ALTER TABLE ONLY nex_core.roles
    ADD CONSTRAINT roles_role_name_key UNIQUE (role_name);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: nex_core; Owner: postgres
--

ALTER TABLE ONLY nex_core.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: system_apps system_apps_app_name_key; Type: CONSTRAINT; Schema: nex_core; Owner: postgres
--

ALTER TABLE ONLY nex_core.system_apps
    ADD CONSTRAINT system_apps_app_name_key UNIQUE (app_name);


--
-- Name: system_apps system_apps_pkey; Type: CONSTRAINT; Schema: nex_core; Owner: postgres
--

ALTER TABLE ONLY nex_core.system_apps
    ADD CONSTRAINT system_apps_pkey PRIMARY KEY (app_id);


--
-- Name: system_config system_config_pkey; Type: CONSTRAINT; Schema: nex_core; Owner: postgres
--

ALTER TABLE ONLY nex_core.system_config
    ADD CONSTRAINT system_config_pkey PRIMARY KEY (system_id);


--
-- Name: system_config system_config_system_key_key; Type: CONSTRAINT; Schema: nex_core; Owner: postgres
--

ALTER TABLE ONLY nex_core.system_config
    ADD CONSTRAINT system_config_system_key_key UNIQUE (system_key);


--
-- Name: template_master_graph template_master_graph_pkey; Type: CONSTRAINT; Schema: nex_core; Owner: postgres
--

ALTER TABLE ONLY nex_core.template_master_graph
    ADD CONSTRAINT template_master_graph_pkey PRIMARY KEY (template_id);


--
-- Name: templates templates_pkey; Type: CONSTRAINT; Schema: nex_core; Owner: postgres
--

ALTER TABLE ONLY nex_core.templates
    ADD CONSTRAINT templates_pkey PRIMARY KEY (template_id);


--
-- Name: email_templates templates_unique; Type: CONSTRAINT; Schema: nex_core; Owner: postgres
--

ALTER TABLE ONLY nex_core.email_templates
    ADD CONSTRAINT templates_unique UNIQUE (template_code, language_code);


--
-- Name: unit_types unit_types_pkey; Type: CONSTRAINT; Schema: nex_core; Owner: postgres
--

ALTER TABLE ONLY nex_core.unit_types
    ADD CONSTRAINT unit_types_pkey PRIMARY KEY (unit_type_id);


--
-- Name: unit_types unit_types_unique; Type: CONSTRAINT; Schema: nex_core; Owner: postgres
--

ALTER TABLE ONLY nex_core.unit_types
    ADD CONSTRAINT unit_types_unique UNIQUE (unit_type_name, symbol);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: nex_core; Owner: postgres
--

ALTER TABLE ONLY nex_core.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: nex_core; Owner: postgres
--

ALTER TABLE ONLY nex_core.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: sessions sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: nex_core; Owner: postgres
--

ALTER TABLE ONLY nex_core.sessions
    ADD CONSTRAINT sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES nex_core.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict geqAwRkxrSBoxnxgLEgB2P6HJ8uzTps2pg6UdrfLuQGM9mgT0U2fDlAdIBn5L7w

