-- ============================================================
-- Drill-down RPCs for new contract chart modes
-- ============================================================

-- Mode 1: Contracts grouped by year (for table rows)
CREATE OR REPLACE FUNCTION get_contracts_by_year()
RETURNS TABLE (
  year text,
  count bigint,
  total_amount numeric
) LANGUAGE sql STABLE AS $$
  SELECT
    EXTRACT(YEAR FROM contract_start_date::date)::int::text AS year,
    COUNT(*)::bigint AS count,
    COALESCE(SUM(current_contract_amount), 0)::numeric AS total_amount
  FROM "Contracts"
  WHERE contract_start_date IS NOT NULL AND contract_start_date <> ''
    AND EXTRACT(YEAR FROM contract_start_date::date) BETWEEN 2000 AND 2030
  GROUP BY EXTRACT(YEAR FROM contract_start_date::date)::int
  ORDER BY year DESC;
$$;

-- Mode 1 drill-down: Months within a year
CREATE OR REPLACE FUNCTION get_contracts_months_for_year(p_year int)
RETURNS TABLE (
  month text,
  month_name text,
  count bigint,
  total_amount numeric
) LANGUAGE sql STABLE AS $$
  SELECT
    TO_CHAR(contract_start_date::date, 'YYYY-MM') AS month,
    TO_CHAR(contract_start_date::date, 'Month') AS month_name,
    COUNT(*)::bigint AS count,
    COALESCE(SUM(current_contract_amount), 0)::numeric AS total_amount
  FROM "Contracts"
  WHERE contract_start_date IS NOT NULL AND contract_start_date <> ''
    AND EXTRACT(YEAR FROM contract_start_date::date) = p_year
  GROUP BY TO_CHAR(contract_start_date::date, 'YYYY-MM'), TO_CHAR(contract_start_date::date, 'Month'), EXTRACT(MONTH FROM contract_start_date::date)
  ORDER BY EXTRACT(MONTH FROM contract_start_date::date) DESC;
$$;

-- Mode 2 drill-down: Contracts for a specific vendor
CREATE OR REPLACE FUNCTION get_contracts_for_vendor(p_vendor_name text)
RETURNS TABLE (
  contract_number text,
  name text,
  amount numeric,
  start_date text,
  end_date text
) LANGUAGE sql STABLE AS $$
  SELECT
    contract_number,
    COALESCE(description, contract_type, 'Unknown') AS name,
    COALESCE(current_contract_amount, 0)::numeric AS amount,
    contract_start_date AS start_date,
    contract_end_date AS end_date
  FROM "Contracts"
  WHERE COALESCE(vendor_name, 'Unknown Vendor') = p_vendor_name
  ORDER BY amount DESC
  LIMIT 10;
$$;

-- Mode 3 drill-down: Contracts within a duration bucket
CREATE OR REPLACE FUNCTION get_contracts_for_duration_bucket(p_min_days int, p_max_days int)
RETURNS TABLE (
  contract_number text,
  vendor_name text,
  amount numeric,
  duration_days int
) LANGUAGE sql STABLE AS $$
  SELECT
    contract_number,
    COALESCE(vendor_name, 'Unknown Vendor') AS vendor_name,
    COALESCE(current_contract_amount, 0)::numeric AS amount,
    (contract_end_date::date - contract_start_date::date)::int AS duration_days
  FROM "Contracts"
  WHERE contract_start_date IS NOT NULL AND contract_start_date <> ''
    AND contract_end_date IS NOT NULL AND contract_end_date <> ''
    AND contract_end_date::date >= contract_start_date::date
    AND (contract_end_date::date - contract_start_date::date) >= p_min_days
    AND (contract_end_date::date - contract_start_date::date) < p_max_days
  ORDER BY amount DESC
  LIMIT 10;
$$;
