--
-- PostgreSQL database dump
--

\restrict s0k8wYYpPznPx4f86VvahXN92iJYjJeQsrLttudfUhpncP7yrldEmwv1mnk31Ro

-- Dumped from database version 17.10
-- Dumped by pg_dump version 17.10

-- Started on 2026-06-19 21:07:03

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 217 (class 1259 OID 16396)
-- Name: alembic_version; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.alembic_version (
    version_num character varying(32) NOT NULL
);


ALTER TABLE public.alembic_version OWNER TO postgres;

--
-- TOC entry 231 (class 1259 OID 16567)
-- Name: brand_categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.brand_categories (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.brand_categories OWNER TO postgres;

--
-- TOC entry 230 (class 1259 OID 16566)
-- Name: brand_categories_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.brand_categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.brand_categories_id_seq OWNER TO postgres;

--
-- TOC entry 5021 (class 0 OID 0)
-- Dependencies: 230
-- Name: brand_categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.brand_categories_id_seq OWNED BY public.brand_categories.id;


--
-- TOC entry 233 (class 1259 OID 16578)
-- Name: brand_requirements; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.brand_requirements (
    id integer NOT NULL,
    brand_user_id integer NOT NULL,
    category_id integer NOT NULL,
    radius_km numeric(10,2),
    min_area_sqft numeric(12,2),
    max_area_sqft numeric(12,2),
    status character varying(50) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.brand_requirements OWNER TO postgres;

--
-- TOC entry 232 (class 1259 OID 16577)
-- Name: brand_requirements_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.brand_requirements_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.brand_requirements_id_seq OWNER TO postgres;

--
-- TOC entry 5022 (class 0 OID 0)
-- Dependencies: 232
-- Name: brand_requirements_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.brand_requirements_id_seq OWNED BY public.brand_requirements.id;


--
-- TOC entry 219 (class 1259 OID 16402)
-- Name: dealers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.dealers (
    id integer NOT NULL,
    full_name character varying(120) NOT NULL,
    email character varying(255) NOT NULL,
    phone character varying(20) NOT NULL,
    company_name character varying(200) NOT NULL,
    hashed_password character varying(255) NOT NULL,
    address character varying(500),
    is_active boolean NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.dealers OWNER TO postgres;

--
-- TOC entry 218 (class 1259 OID 16401)
-- Name: dealers_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.dealers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.dealers_id_seq OWNER TO postgres;

--
-- TOC entry 5023 (class 0 OID 0)
-- Dependencies: 218
-- Name: dealers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.dealers_id_seq OWNED BY public.dealers.id;


--
-- TOC entry 235 (class 1259 OID 16601)
-- Name: matches; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.matches (
    id integer NOT NULL,
    space_id integer NOT NULL,
    requirement_id integer NOT NULL,
    status character varying(50) NOT NULL,
    reviewed_by integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.matches OWNER TO postgres;

--
-- TOC entry 234 (class 1259 OID 16600)
-- Name: matches_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.matches_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.matches_id_seq OWNER TO postgres;

--
-- TOC entry 5024 (class 0 OID 0)
-- Dependencies: 234
-- Name: matches_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.matches_id_seq OWNED BY public.matches.id;


--
-- TOC entry 223 (class 1259 OID 16433)
-- Name: preferred_brands; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.preferred_brands (
    id integer NOT NULL,
    station_id integer NOT NULL,
    brand_name character varying(200) NOT NULL,
    brand_category character varying(100),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    category_id integer
);


ALTER TABLE public.preferred_brands OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 16432)
-- Name: preferred_brands_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.preferred_brands_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.preferred_brands_id_seq OWNER TO postgres;

--
-- TOC entry 5025 (class 0 OID 0)
-- Dependencies: 222
-- Name: preferred_brands_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.preferred_brands_id_seq OWNED BY public.preferred_brands.id;


--
-- TOC entry 225 (class 1259 OID 16449)
-- Name: spaces; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.spaces (
    id integer NOT NULL,
    station_id integer NOT NULL,
    name character varying(200) NOT NULL,
    space_type character varying(50) NOT NULL,
    area_sqft double precision,
    monthly_rent double precision,
    availability_status character varying(30) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    power_kw double precision,
    water_available boolean DEFAULT false NOT NULL,
    drainage_avail boolean DEFAULT false NOT NULL
);


ALTER TABLE public.spaces OWNER TO postgres;

--
-- TOC entry 224 (class 1259 OID 16448)
-- Name: spaces_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.spaces_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.spaces_id_seq OWNER TO postgres;

--
-- TOC entry 5026 (class 0 OID 0)
-- Dependencies: 224
-- Name: spaces_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.spaces_id_seq OWNED BY public.spaces.id;


--
-- TOC entry 227 (class 1259 OID 16465)
-- Name: station_images; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.station_images (
    id integer NOT NULL,
    station_id integer NOT NULL,
    file_name character varying(255) NOT NULL,
    file_path character varying(500) NOT NULL,
    file_size integer,
    mime_type character varying(100),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.station_images OWNER TO postgres;

--
-- TOC entry 226 (class 1259 OID 16464)
-- Name: station_images_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.station_images_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.station_images_id_seq OWNER TO postgres;

--
-- TOC entry 5027 (class 0 OID 0)
-- Dependencies: 226
-- Name: station_images_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.station_images_id_seq OWNED BY public.station_images.id;


--
-- TOC entry 229 (class 1259 OID 16483)
-- Name: station_utilities; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.station_utilities (
    id integer NOT NULL,
    station_id integer NOT NULL,
    electricity boolean NOT NULL,
    water boolean NOT NULL,
    internet boolean NOT NULL,
    parking boolean NOT NULL,
    washroom boolean NOT NULL,
    cctv boolean NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.station_utilities OWNER TO postgres;

--
-- TOC entry 228 (class 1259 OID 16482)
-- Name: station_utilities_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.station_utilities_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.station_utilities_id_seq OWNER TO postgres;

--
-- TOC entry 5028 (class 0 OID 0)
-- Dependencies: 228
-- Name: station_utilities_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.station_utilities_id_seq OWNED BY public.station_utilities.id;


--
-- TOC entry 221 (class 1259 OID 16415)
-- Name: stations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.stations (
    id integer NOT NULL,
    dealer_id integer NOT NULL,
    name character varying(200) NOT NULL,
    address character varying(500) NOT NULL,
    city character varying(100) NOT NULL,
    state character varying(100) NOT NULL,
    pincode character varying(20) NOT NULL,
    latitude double precision,
    longitude double precision,
    contact_number character varying(20),
    description text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    status character varying(50) DEFAULT 'pending'::character varying NOT NULL
);


ALTER TABLE public.stations OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 16414)
-- Name: stations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.stations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.stations_id_seq OWNER TO postgres;

--
-- TOC entry 5029 (class 0 OID 0)
-- Dependencies: 220
-- Name: stations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.stations_id_seq OWNED BY public.stations.id;


--
-- TOC entry 4807 (class 2604 OID 16570)
-- Name: brand_categories id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.brand_categories ALTER COLUMN id SET DEFAULT nextval('public.brand_categories_id_seq'::regclass);


--
-- TOC entry 4810 (class 2604 OID 16581)
-- Name: brand_requirements id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.brand_requirements ALTER COLUMN id SET DEFAULT nextval('public.brand_requirements_id_seq'::regclass);


--
-- TOC entry 4786 (class 2604 OID 16405)
-- Name: dealers id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dealers ALTER COLUMN id SET DEFAULT nextval('public.dealers_id_seq'::regclass);


--
-- TOC entry 4813 (class 2604 OID 16604)
-- Name: matches id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.matches ALTER COLUMN id SET DEFAULT nextval('public.matches_id_seq'::regclass);


--
-- TOC entry 4793 (class 2604 OID 16436)
-- Name: preferred_brands id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.preferred_brands ALTER COLUMN id SET DEFAULT nextval('public.preferred_brands_id_seq'::regclass);


--
-- TOC entry 4796 (class 2604 OID 16452)
-- Name: spaces id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spaces ALTER COLUMN id SET DEFAULT nextval('public.spaces_id_seq'::regclass);


--
-- TOC entry 4801 (class 2604 OID 16468)
-- Name: station_images id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.station_images ALTER COLUMN id SET DEFAULT nextval('public.station_images_id_seq'::regclass);


--
-- TOC entry 4804 (class 2604 OID 16486)
-- Name: station_utilities id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.station_utilities ALTER COLUMN id SET DEFAULT nextval('public.station_utilities_id_seq'::regclass);


--
-- TOC entry 4789 (class 2604 OID 16418)
-- Name: stations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stations ALTER COLUMN id SET DEFAULT nextval('public.stations_id_seq'::regclass);


--
-- TOC entry 4817 (class 2606 OID 16400)
-- Name: alembic_version alembic_version_pkc; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.alembic_version
    ADD CONSTRAINT alembic_version_pkc PRIMARY KEY (version_num);


--
-- TOC entry 4845 (class 2606 OID 16574)
-- Name: brand_categories brand_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.brand_categories
    ADD CONSTRAINT brand_categories_pkey PRIMARY KEY (id);


--
-- TOC entry 4849 (class 2606 OID 16585)
-- Name: brand_requirements brand_requirements_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.brand_requirements
    ADD CONSTRAINT brand_requirements_pkey PRIMARY KEY (id);


--
-- TOC entry 4819 (class 2606 OID 16411)
-- Name: dealers dealers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dealers
    ADD CONSTRAINT dealers_pkey PRIMARY KEY (id);


--
-- TOC entry 4859 (class 2606 OID 16608)
-- Name: matches matches_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.matches
    ADD CONSTRAINT matches_pkey PRIMARY KEY (id);


--
-- TOC entry 4831 (class 2606 OID 16440)
-- Name: preferred_brands preferred_brands_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.preferred_brands
    ADD CONSTRAINT preferred_brands_pkey PRIMARY KEY (id);


--
-- TOC entry 4835 (class 2606 OID 16456)
-- Name: spaces spaces_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spaces
    ADD CONSTRAINT spaces_pkey PRIMARY KEY (id);


--
-- TOC entry 4839 (class 2606 OID 16474)
-- Name: station_images station_images_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.station_images
    ADD CONSTRAINT station_images_pkey PRIMARY KEY (id);


--
-- TOC entry 4843 (class 2606 OID 16490)
-- Name: station_utilities station_utilities_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.station_utilities
    ADD CONSTRAINT station_utilities_pkey PRIMARY KEY (id);


--
-- TOC entry 4826 (class 2606 OID 16424)
-- Name: stations stations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stations
    ADD CONSTRAINT stations_pkey PRIMARY KEY (id);


--
-- TOC entry 4846 (class 1259 OID 16575)
-- Name: ix_brand_categories_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_brand_categories_id ON public.brand_categories USING btree (id);


--
-- TOC entry 4847 (class 1259 OID 16576)
-- Name: ix_brand_categories_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_brand_categories_name ON public.brand_categories USING btree (name);


--
-- TOC entry 4850 (class 1259 OID 16596)
-- Name: ix_brand_requirements_brand_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_brand_requirements_brand_user_id ON public.brand_requirements USING btree (brand_user_id);


--
-- TOC entry 4851 (class 1259 OID 16597)
-- Name: ix_brand_requirements_category_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_brand_requirements_category_id ON public.brand_requirements USING btree (category_id);


--
-- TOC entry 4852 (class 1259 OID 16598)
-- Name: ix_brand_requirements_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_brand_requirements_id ON public.brand_requirements USING btree (id);


--
-- TOC entry 4853 (class 1259 OID 16599)
-- Name: ix_brand_requirements_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_brand_requirements_status ON public.brand_requirements USING btree (status);


--
-- TOC entry 4820 (class 1259 OID 16412)
-- Name: ix_dealers_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_dealers_email ON public.dealers USING btree (email);


--
-- TOC entry 4821 (class 1259 OID 16413)
-- Name: ix_dealers_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_dealers_id ON public.dealers USING btree (id);


--
-- TOC entry 4854 (class 1259 OID 16624)
-- Name: ix_matches_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_matches_id ON public.matches USING btree (id);


--
-- TOC entry 4855 (class 1259 OID 16625)
-- Name: ix_matches_requirement_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_matches_requirement_id ON public.matches USING btree (requirement_id);


--
-- TOC entry 4856 (class 1259 OID 16626)
-- Name: ix_matches_space_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_matches_space_id ON public.matches USING btree (space_id);


--
-- TOC entry 4857 (class 1259 OID 16627)
-- Name: ix_matches_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_matches_status ON public.matches USING btree (status);


--
-- TOC entry 4827 (class 1259 OID 16628)
-- Name: ix_preferred_brands_category_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_preferred_brands_category_id ON public.preferred_brands USING btree (category_id);


--
-- TOC entry 4828 (class 1259 OID 16446)
-- Name: ix_preferred_brands_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_preferred_brands_id ON public.preferred_brands USING btree (id);


--
-- TOC entry 4829 (class 1259 OID 16447)
-- Name: ix_preferred_brands_station_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_preferred_brands_station_id ON public.preferred_brands USING btree (station_id);


--
-- TOC entry 4832 (class 1259 OID 16462)
-- Name: ix_spaces_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_spaces_id ON public.spaces USING btree (id);


--
-- TOC entry 4833 (class 1259 OID 16463)
-- Name: ix_spaces_station_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_spaces_station_id ON public.spaces USING btree (station_id);


--
-- TOC entry 4836 (class 1259 OID 16480)
-- Name: ix_station_images_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_station_images_id ON public.station_images USING btree (id);


--
-- TOC entry 4837 (class 1259 OID 16481)
-- Name: ix_station_images_station_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_station_images_station_id ON public.station_images USING btree (station_id);


--
-- TOC entry 4840 (class 1259 OID 16496)
-- Name: ix_station_utilities_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_station_utilities_id ON public.station_utilities USING btree (id);


--
-- TOC entry 4841 (class 1259 OID 16497)
-- Name: ix_station_utilities_station_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_station_utilities_station_id ON public.station_utilities USING btree (station_id);


--
-- TOC entry 4822 (class 1259 OID 16430)
-- Name: ix_stations_dealer_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_stations_dealer_id ON public.stations USING btree (dealer_id);


--
-- TOC entry 4823 (class 1259 OID 16431)
-- Name: ix_stations_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_stations_id ON public.stations USING btree (id);


--
-- TOC entry 4824 (class 1259 OID 16637)
-- Name: ix_stations_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_stations_status ON public.stations USING btree (status);


--
-- TOC entry 4866 (class 2606 OID 16586)
-- Name: brand_requirements brand_requirements_brand_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.brand_requirements
    ADD CONSTRAINT brand_requirements_brand_user_id_fkey FOREIGN KEY (brand_user_id) REFERENCES public.dealers(id) ON DELETE CASCADE;


--
-- TOC entry 4867 (class 2606 OID 16591)
-- Name: brand_requirements brand_requirements_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.brand_requirements
    ADD CONSTRAINT brand_requirements_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.brand_categories(id) ON DELETE CASCADE;


--
-- TOC entry 4868 (class 2606 OID 16609)
-- Name: matches matches_requirement_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.matches
    ADD CONSTRAINT matches_requirement_id_fkey FOREIGN KEY (requirement_id) REFERENCES public.brand_requirements(id) ON DELETE CASCADE;


--
-- TOC entry 4869 (class 2606 OID 16614)
-- Name: matches matches_reviewed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.matches
    ADD CONSTRAINT matches_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES public.dealers(id) ON DELETE SET NULL;


--
-- TOC entry 4870 (class 2606 OID 16619)
-- Name: matches matches_space_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.matches
    ADD CONSTRAINT matches_space_id_fkey FOREIGN KEY (space_id) REFERENCES public.spaces(id) ON DELETE CASCADE;


--
-- TOC entry 4861 (class 2606 OID 16629)
-- Name: preferred_brands preferred_brands_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.preferred_brands
    ADD CONSTRAINT preferred_brands_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.brand_categories(id) ON DELETE SET NULL;


--
-- TOC entry 4862 (class 2606 OID 16441)
-- Name: preferred_brands preferred_brands_station_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.preferred_brands
    ADD CONSTRAINT preferred_brands_station_id_fkey FOREIGN KEY (station_id) REFERENCES public.stations(id) ON DELETE CASCADE;


--
-- TOC entry 4863 (class 2606 OID 16457)
-- Name: spaces spaces_station_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spaces
    ADD CONSTRAINT spaces_station_id_fkey FOREIGN KEY (station_id) REFERENCES public.stations(id) ON DELETE CASCADE;


--
-- TOC entry 4864 (class 2606 OID 16475)
-- Name: station_images station_images_station_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.station_images
    ADD CONSTRAINT station_images_station_id_fkey FOREIGN KEY (station_id) REFERENCES public.stations(id) ON DELETE CASCADE;


--
-- TOC entry 4865 (class 2606 OID 16491)
-- Name: station_utilities station_utilities_station_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.station_utilities
    ADD CONSTRAINT station_utilities_station_id_fkey FOREIGN KEY (station_id) REFERENCES public.stations(id) ON DELETE CASCADE;


--
-- TOC entry 4860 (class 2606 OID 16425)
-- Name: stations stations_dealer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stations
    ADD CONSTRAINT stations_dealer_id_fkey FOREIGN KEY (dealer_id) REFERENCES public.dealers(id) ON DELETE CASCADE;


-- Completed on 2026-06-19 21:07:03

--
-- PostgreSQL database dump complete
--

\unrestrict s0k8wYYpPznPx4f86VvahXN92iJYjJeQsrLttudfUhpncP7yrldEmwv1mnk31Ro

