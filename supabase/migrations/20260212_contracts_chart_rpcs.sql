-- ============================================================
-- New RPC functions for contracts dashboard chart modes
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- Mode 1: Contracts by month (new contracts per month over time)
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION get_contracts_by_month()
RETURNS TABLE (
  month text,
  count bigint,
  total_amount numeric
) LANGUAGE sql STABLE AS $$
  SELECT
    TO_CHAR(contract_start_date::date, 'YYYY-MM') AS month,
    COUNT(*)::bigint AS count,
    COALESCE(SUM(current_contract_amount), 0)::numeric AS total_amount
  FROM "Contracts"
  WHERE contract_start_date IS NOT NULL
    AND EXTRACT(YEAR FROM contract_start_date::date) BETWEEN 2000 AND 2030
  GROUP BY TO_CHAR(contract_start_date::date, 'YYYY-MM')
  ORDER BY month;
$$;

-- ────────────────────────────────────────────────────────────
-- Mode 2: Top vendors by total contract value
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION get_contracts_top_vendors(p_limit int DEFAULT 40)
RETURNS TABLE (
  vendor_name text,
  total_amount numeric,
  contract_count bigint
) LANGUAGE sql STABLE AS $$
  SELECT
    COALESCE(vendor_name, 'Unknown Vendor') AS vendor_name,
    COALESCE(SUM(current_contract_amount), 0)::numeric AS total_amount,
    COUNT(*)::bigint AS contract_count
  FROM "Contracts"
  GROUP BY COALESCE(vendor_name, 'Unknown Vendor')
  ORDER BY total_amount DESC
  LIMIT p_limit;
$$;

-- ────────────────────────────────────────────────────────────
-- Mode 3: Contract duration buckets
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION get_contracts_duration_buckets()
RETURNS TABLE (
  bucket text,
  count bigint,
  total_amount numeric
) LANGUAGE sql STABLE AS $$
  WITH durations AS (
    SELECT
      (contract_end_date::date - contract_start_date::date) AS days,
      COALESCE(current_contract_amount, 0) AS amount
    FROM "Contracts"
    WHERE contract_start_date IS NOT NULL
      AND contract_end_date IS NOT NULL
      AND contract_end_date::date >= contract_start_date::date
  )
  SELECT
    CASE
      WHEN days < 365 THEN '<1 yr'
      WHEN days < 730 THEN '1-2 yr'
      WHEN days < 1825 THEN '2-5 yr'
      WHEN days < 3650 THEN '5-10 yr'
      ELSE '10+ yr'
    END AS bucket,
    COUNT(*)::bigint AS count,
    COALESCE(SUM(amount), 0)::numeric AS total_amount
  FROM durations
  GROUP BY
    CASE
      WHEN days < 365 THEN '<1 yr'
      WHEN days < 730 THEN '1-2 yr'
      WHEN days < 1825 THEN '2-5 yr'
      WHEN days < 3650 THEN '5-10 yr'
      ELSE '10+ yr'
    END
  ORDER BY
    CASE
      WHEN days < 365 THEN 1
      WHEN days < 730 THEN 2
      WHEN days < 1825 THEN 3
      WHEN days < 3650 THEN 4
      ELSE 5
    END;
$$;
