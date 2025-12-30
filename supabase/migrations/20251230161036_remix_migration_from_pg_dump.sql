CREATE EXTENSION IF NOT EXISTS "pg_graphql";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "plpgsql";
CREATE EXTENSION IF NOT EXISTS "supabase_vault";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";
BEGIN;

--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.1

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
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--



--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


SET default_table_access_method = heap;

--
-- Name: simulation_states; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.simulation_states (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    description text,
    campuses jsonb NOT NULL,
    hostels jsonb NOT NULL,
    global_settings jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: simulation_states simulation_states_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.simulation_states
    ADD CONSTRAINT simulation_states_pkey PRIMARY KEY (id);


--
-- Name: simulation_states update_simulation_states_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_simulation_states_updated_at BEFORE UPDATE ON public.simulation_states FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: simulation_states Anyone can create simulations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can create simulations" ON public.simulation_states FOR INSERT WITH CHECK (true);


--
-- Name: simulation_states Anyone can delete simulations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can delete simulations" ON public.simulation_states FOR DELETE USING (true);


--
-- Name: simulation_states Anyone can update simulations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can update simulations" ON public.simulation_states FOR UPDATE USING (true);


--
-- Name: simulation_states Anyone can view saved simulations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view saved simulations" ON public.simulation_states FOR SELECT USING (true);


--
-- Name: simulation_states; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.simulation_states ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--




COMMIT;