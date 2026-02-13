-- ============================================================
-- New RPC functions: expiration buckets + spend utilization
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- Mode 4: Contracts by days until expiration
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION get_contracts_expiration_buckets()
RETURNS TABLE (
  bucket text,
  count bigint,
  total_amount numeric
) LANGUAGE sql STABLE AS $$
  WITH expiry AS (
    SELECT
      (contract_end_date::date - CURRENT_DATE) AS days_left,
      COALESCE(current_contract_amount, 0) AS amount
    FROM "Contracts"
    WHERE contract_end_date IS NOT NULL AND contract_end_date <> ''
  )
  SELECT
    CASE
      WHEN days_left < 0    THEN 'Expired'
      WHEN days_left < 30   THEN '<30 days'
      WHEN days_left < 90   THEN '30-90 days'
      WHEN days_left < 180  THEN '3-6 mo'
      WHEN days_left < 365  THEN '6-12 mo'
      WHEN days_left < 730  THEN '1-2 yr'
      ELSE '2+ yr'
    END AS bucket,
    COUNT(*)::bigint AS count,
    COALESCE(SUM(amount), 0)::numeric AS total_amount
  FROM expiry
  GROUP BY
    CASE
      WHEN days_left < 0    THEN 'Expired'
      WHEN days_left < 30   THEN '<30 days'
      WHEN days_left < 90   THEN '30-90 days'
      WHEN days_left < 180  THEN '3-6 mo'
      WHEN days_left < 365  THEN '6-12 mo'
      WHEN days_left < 730  THEN '1-2 yr'
      ELSE '2+ yr'
    END
  ORDER BY
    MIN(CASE
      WHEN days_left < 0    THEN 1
      WHEN days_left < 30   THEN 2
      WHEN days_left < 90   THEN 3
      WHEN days_left < 180  THEN 4
      WHEN days_left < 365  THEN 5
      WHEN days_left < 730  THEN 6
      ELSE 7
    END);
$$;

-- ────────────────────────────────────────────────────────────
-- Mode 4 drill-down: top 10 contracts for an expiration bucket
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION get_contracts_for_expiration_bucket(
  p_min_days int,
  p_max_days int
)
RETURNS TABLE (
  contract_number text,
  vendor_name text,
  department text,
  amount numeric,
  end_date text,
  days_until_expiry int
) LANGUAGE sql STABLE AS $$
  SELECT
    c.contract_number,
    COALESCE(c.vendor_name, 'Unknown Vendor') AS vendor_name,
    COALESCE(c.department_facility, 'Unknown') AS department,
    COALESCE(c.current_contract_amount, 0)::numeric AS amount,
    c.contract_end_date AS end_date,
    (c.contract_end_date::date - CURRENT_DATE)::int AS days_until_expiry
  FROM "Contracts" c
  WHERE c.contract_end_date IS NOT NULL AND c.contract_end_date <> ''
    AND (c.contract_end_date::date - CURRENT_DATE) >= p_min_days
    AND (c.contract_end_date::date - CURRENT_DATE) < p_max_days
  ORDER BY COALESCE(c.current_contract_amount, 0) DESC
  LIMIT 10;
$$;

-- ────────────────────────────────────────────────────────────
-- Mode 5: Contracts by spend utilization (spending_to_date / amount)
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION get_contracts_spend_buckets()
RETURNS TABLE (
  bucket text,
  count bigint,
  total_amount numeric
) LANGUAGE sql STABLE AS $$
  WITH spend AS (
    SELECT
      COALESCE(current_contract_amount, 0) AS amount,
      CASE
        WHEN spending_to_date IS NOT NULL
             AND spending_to_date <> ''
             AND spending_to_date ~ '^\d+\.?\d*$'
             AND COALESCE(current_contract_amount, 0) > 0
        THEN (spending_to_date::numeric / current_contract_amount * 100)
        ELSE 0
      END AS spend_pct
    FROM "Contracts"
    WHERE COALESCE(current_contract_amount, 0) > 0
  )
  SELECT
    CASE
      WHEN spend_pct = 0   THEN '0%'
      WHEN spend_pct < 25  THEN '<25%'
      WHEN spend_pct < 50  THEN '25-50%'
      WHEN spend_pct < 75  THEN '50-75%'
      WHEN spend_pct <= 100 THEN '75-100%'
      ELSE '>100%'
    END AS bucket,
    COUNT(*)::bigint AS count,
    COALESCE(SUM(amount), 0)::numeric AS total_amount
  FROM spend
  GROUP BY
    CASE
      WHEN spend_pct = 0   THEN '0%'
      WHEN spend_pct < 25  THEN '<25%'
      WHEN spend_pct < 50  THEN '25-50%'
      WHEN spend_pct < 75  THEN '50-75%'
      WHEN spend_pct <= 100 THEN '75-100%'
      ELSE '>100%'
    END
  ORDER BY
    MIN(CASE
      WHEN spend_pct = 0   THEN 1
      WHEN spend_pct < 25  THEN 2
      WHEN spend_pct < 50  THEN 3
      WHEN spend_pct < 75  THEN 4
      WHEN spend_pct <= 100 THEN 5
      ELSE 6
    END);
$$;

-- ────────────────────────────────────────────────────────────
-- Mode 5 drill-down: top 10 contracts for a spend bucket
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION get_contracts_for_spend_bucket(
  p_min_pct numeric,
  p_max_pct numeric
)
RETURNS TABLE (
  contract_number text,
  vendor_name text,
  amount numeric,
  spending numeric,
  spend_pct numeric
) LANGUAGE sql STABLE AS $$
  WITH spend AS (
    SELECT
      c.contract_number,
      COALESCE(c.vendor_name, 'Unknown Vendor') AS vendor_name,
      COALESCE(c.current_contract_amount, 0)::numeric AS amount,
      CASE
        WHEN c.spending_to_date IS NOT NULL
             AND c.spending_to_date <> ''
             AND c.spending_to_date ~ '^\d+\.?\d*$'
        THEN c.spending_to_date::numeric
        ELSE 0
      END AS spending,
      CASE
        WHEN c.spending_to_date IS NOT NULL
             AND c.spending_to_date <> ''
             AND c.spending_to_date ~ '^\d+\.?\d*$'
             AND COALESCE(c.current_contract_amount, 0) > 0
        THEN (c.spending_to_date::numeric / c.current_contract_amount * 100)
        ELSE 0
      END AS spend_pct
    FROM "Contracts" c
    WHERE COALESCE(c.current_contract_amount, 0) > 0
  )
  SELECT
    s.contract_number,
    s.vendor_name,
    s.amount,
    s.spending,
    ROUND(s.spend_pct::numeric, 1) AS spend_pct
  FROM spend s
  WHERE s.spend_pct >= p_min_pct AND s.spend_pct < p_max_pct
  ORDER BY s.amount DESC
  LIMIT 10;
$$;
