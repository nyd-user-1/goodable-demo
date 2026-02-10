-- ============================================================
-- RPC functions for dashboard pages
-- Run this in the Supabase SQL Editor
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 1. VOTES DASHBOARD
-- ────────────────────────────────────────────────────────────

-- 1a. Votes by member (aggregated)
CREATE OR REPLACE FUNCTION get_votes_by_member()
RETURNS TABLE (
  people_id int,
  name text,
  total_votes bigint,
  yes_count bigint,
  no_count bigint
) LANGUAGE sql STABLE AS $$
  SELECT
    v.people_id,
    COALESCE(p.name, 'Unknown') AS name,
    COUNT(*)::bigint AS total_votes,
    COUNT(*) FILTER (WHERE v.vote_desc LIKE 'Y%')::bigint AS yes_count,
    COUNT(*) FILTER (WHERE v.vote_desc LIKE 'N%' AND v.vote_desc NOT LIKE 'NV%')::bigint AS no_count
  FROM "Votes" v
  LEFT JOIN "People" p ON p.people_id = v.people_id
  GROUP BY v.people_id, p.name
  ORDER BY total_votes DESC;
$$;

-- 1b. Votes chart data (yes/no per day)
CREATE OR REPLACE FUNCTION get_votes_chart_data()
RETURNS TABLE (
  date text,
  yes bigint,
  no bigint
) LANGUAGE sql STABLE AS $$
  SELECT
    rc.date,
    COUNT(*) FILTER (WHERE v.vote_desc LIKE 'Y%')::bigint AS yes,
    COUNT(*) FILTER (WHERE v.vote_desc LIKE 'N%' AND v.vote_desc NOT LIKE 'NV%')::bigint AS no
  FROM "Votes" v
  JOIN "Roll Call" rc ON rc.roll_call_id = v.roll_call_id
  WHERE rc.date IS NOT NULL
  GROUP BY rc.date
  ORDER BY rc.date;
$$;

-- 1c. Votes drill-down for a specific member
CREATE OR REPLACE FUNCTION get_votes_drilldown(p_people_id int)
RETURNS TABLE (
  bill_number text,
  bill_title text,
  date text,
  vote text
) LANGUAGE sql STABLE AS $$
  SELECT
    b.bill_number,
    b.title AS bill_title,
    rc.date,
    CASE
      WHEN v.vote_desc LIKE 'Y%' THEN 'Yes'
      WHEN v.vote_desc LIKE 'N%' AND v.vote_desc NOT LIKE 'NV%' THEN 'No'
      ELSE 'Other'
    END AS vote
  FROM "Votes" v
  LEFT JOIN "Roll Call" rc ON rc.roll_call_id = v.roll_call_id
  LEFT JOIN "Bills" b ON b.bill_id = rc.bill_id
  WHERE v.people_id = p_people_id
  ORDER BY rc.date DESC NULLS LAST
  LIMIT 10;
$$;

-- 1d. Votes grand totals
CREATE OR REPLACE FUNCTION get_votes_totals()
RETURNS TABLE (
  total_votes bigint,
  total_members bigint
) LANGUAGE sql STABLE AS $$
  SELECT
    COUNT(*)::bigint AS total_votes,
    COUNT(DISTINCT people_id)::bigint AS total_members
  FROM "Votes";
$$;


-- ────────────────────────────────────────────────────────────
-- 2. CONTRACTS DASHBOARD
-- ────────────────────────────────────────────────────────────

-- 2a. Contracts grouped by a column (department or type)
CREATE OR REPLACE FUNCTION get_contracts_by_group(p_group_by text)
RETURNS TABLE (
  name text,
  amount numeric,
  contract_count bigint,
  pct_of_total numeric
) LANGUAGE plpgsql STABLE AS $$
DECLARE
  col_name text;
  total numeric;
BEGIN
  IF p_group_by = 'department' THEN
    col_name := 'department_facility';
  ELSE
    col_name := 'contract_type';
  END IF;

  -- Get grand total first
  SELECT COALESCE(SUM(current_contract_amount), 0) INTO total FROM "Contracts";

  RETURN QUERY EXECUTE format(
    'SELECT
      COALESCE(%I, ''Unknown'') AS name,
      COALESCE(SUM(current_contract_amount), 0)::numeric AS amount,
      COUNT(*)::bigint AS contract_count,
      CASE WHEN %L::numeric > 0
        THEN (COALESCE(SUM(current_contract_amount), 0) / %L::numeric * 100)::numeric
        ELSE 0::numeric
      END AS pct_of_total
    FROM "Contracts"
    GROUP BY COALESCE(%I, ''Unknown'')
    ORDER BY amount DESC',
    col_name, total, total, col_name
  );
END;
$$;

-- 2b. Contracts historical totals by year (cumulative)
CREATE OR REPLACE FUNCTION get_contracts_historical()
RETURNS TABLE (
  year text,
  total numeric,
  annual numeric
) LANGUAGE sql STABLE AS $$
  WITH by_year AS (
    SELECT
      EXTRACT(YEAR FROM contract_start_date::date)::int AS yr,
      COALESCE(SUM(current_contract_amount), 0) AS annual
    FROM "Contracts"
    WHERE contract_start_date IS NOT NULL
      AND EXTRACT(YEAR FROM contract_start_date::date) BETWEEN 1990 AND 2030
    GROUP BY yr
    ORDER BY yr
  )
  SELECT
    yr::text AS year,
    SUM(annual) OVER (ORDER BY yr)::numeric AS total,
    annual::numeric
  FROM by_year;
$$;

-- 2c. Contracts historical for a specific group
CREATE OR REPLACE FUNCTION get_contracts_historical_for_group(p_group_by text, p_group_value text)
RETURNS TABLE (
  year text,
  total numeric,
  annual numeric
) LANGUAGE plpgsql STABLE AS $$
DECLARE
  col_name text;
BEGIN
  IF p_group_by = 'department' THEN
    col_name := 'department_facility';
  ELSE
    col_name := 'contract_type';
  END IF;

  RETURN QUERY EXECUTE format(
    'WITH by_year AS (
      SELECT
        EXTRACT(YEAR FROM contract_start_date::date)::int AS yr,
        COALESCE(SUM(current_contract_amount), 0) AS annual
      FROM "Contracts"
      WHERE contract_start_date IS NOT NULL
        AND EXTRACT(YEAR FROM contract_start_date::date) BETWEEN 1990 AND 2030
        AND COALESCE(%I, ''Unknown'') = %L
      GROUP BY yr
      ORDER BY yr
    )
    SELECT
      yr::text AS year,
      SUM(annual) OVER (ORDER BY yr)::numeric AS total,
      annual::numeric
    FROM by_year',
    col_name, p_group_value
  );
END;
$$;

-- 2d. Contracts drill-down for a specific group
CREATE OR REPLACE FUNCTION get_contracts_drilldown(p_group_by text, p_group_value text)
RETURNS TABLE (
  name text,
  amount numeric,
  contract_number text,
  pct_of_parent numeric
) LANGUAGE plpgsql STABLE AS $$
DECLARE
  col_name text;
  parent_total numeric;
BEGIN
  IF p_group_by = 'department' THEN
    col_name := 'department_facility';
  ELSE
    col_name := 'contract_type';
  END IF;

  EXECUTE format(
    'SELECT COALESCE(SUM(current_contract_amount), 0) FROM "Contracts" WHERE COALESCE(%I, ''Unknown'') = %L',
    col_name, p_group_value
  ) INTO parent_total;

  RETURN QUERY EXECUTE format(
    'SELECT
      COALESCE(vendor_name, ''Unknown Vendor'') AS name,
      COALESCE(current_contract_amount, 0)::numeric AS amount,
      contract_number,
      CASE WHEN %L::numeric > 0
        THEN (COALESCE(current_contract_amount, 0) / %L::numeric * 100)::numeric
        ELSE 0::numeric
      END AS pct_of_parent
    FROM "Contracts"
    WHERE COALESCE(%I, ''Unknown'') = %L
    ORDER BY amount DESC
    LIMIT 10',
    parent_total, parent_total, col_name, p_group_value
  );
END;
$$;

-- 2e. Contracts grand totals
CREATE OR REPLACE FUNCTION get_contracts_totals()
RETURNS TABLE (
  grand_total numeric,
  total_contracts bigint
) LANGUAGE sql STABLE AS $$
  SELECT
    COALESCE(SUM(current_contract_amount), 0)::numeric AS grand_total,
    COUNT(*)::bigint AS total_contracts
  FROM "Contracts";
$$;


-- ────────────────────────────────────────────────────────────
-- 3. BUDGET DASHBOARD
-- ────────────────────────────────────────────────────────────

-- 3a. Budget grouped by a column
CREATE OR REPLACE FUNCTION get_budget_by_group(p_group_by text)
RETURNS TABLE (
  name text,
  amount numeric,
  prior_amount numeric,
  yoy_change numeric,
  pct_of_total numeric,
  row_count bigint
) LANGUAGE plpgsql STABLE AS $$
DECLARE
  total numeric;
BEGIN
  -- Get grand total first
  SELECT COALESCE(SUM(
    CASE WHEN "2026-27 Estimates" ~ '^[$]?[\d,.\s]+$'
      THEN REPLACE(REPLACE(REPLACE("2026-27 Estimates", '$', ''), ',', ''), ' ', '')::numeric * 1000
      ELSE 0 END
  ), 0) INTO total FROM budget_2027_spending;

  RETURN QUERY EXECUTE format(
    'SELECT
      COALESCE(%I, ''Unclassified'') AS name,
      COALESCE(SUM(
        CASE WHEN "2026-27 Estimates" ~ ''^[$]?[\d,.\s]+$''
          THEN REPLACE(REPLACE(REPLACE("2026-27 Estimates", ''$'', ''''), '','', ''''), '' '', '''')::numeric * 1000
          ELSE 0 END
      ), 0)::numeric AS amount,
      COALESCE(SUM(
        CASE WHEN "2025-26 Estimates" ~ ''^[$]?[\d,.\s]+$''
          THEN REPLACE(REPLACE(REPLACE("2025-26 Estimates", ''$'', ''''), '','', ''''), '' '', '''')::numeric * 1000
          ELSE 0 END
      ), 0)::numeric AS prior_amount,
      CASE WHEN COALESCE(SUM(
        CASE WHEN "2025-26 Estimates" ~ ''^[$]?[\d,.\s]+$''
          THEN REPLACE(REPLACE(REPLACE("2025-26 Estimates", ''$'', ''''), '','', ''''), '' '', '''')::numeric * 1000
          ELSE 0 END
      ), 0) != 0
        THEN ((COALESCE(SUM(
          CASE WHEN "2026-27 Estimates" ~ ''^[$]?[\d,.\s]+$''
            THEN REPLACE(REPLACE(REPLACE("2026-27 Estimates", ''$'', ''''), '','', ''''), '' '', '''')::numeric * 1000
            ELSE 0 END
        ), 0) - COALESCE(SUM(
          CASE WHEN "2025-26 Estimates" ~ ''^[$]?[\d,.\s]+$''
            THEN REPLACE(REPLACE(REPLACE("2025-26 Estimates", ''$'', ''''), '','', ''''), '' '', '''')::numeric * 1000
            ELSE 0 END
        ), 0)) / ABS(COALESCE(SUM(
          CASE WHEN "2025-26 Estimates" ~ ''^[$]?[\d,.\s]+$''
            THEN REPLACE(REPLACE(REPLACE("2025-26 Estimates", ''$'', ''''), '','', ''''), '' '', '''')::numeric * 1000
            ELSE 0 END
        ), 0)) * 100)::numeric
        ELSE 0::numeric
      END AS yoy_change,
      CASE WHEN %L::numeric > 0
        THEN (COALESCE(SUM(
          CASE WHEN "2026-27 Estimates" ~ ''^[$]?[\d,.\s]+$''
            THEN REPLACE(REPLACE(REPLACE("2026-27 Estimates", ''$'', ''''), '','', ''''), '' '', '''')::numeric * 1000
            ELSE 0 END
        ), 0) / %L::numeric * 100)::numeric
        ELSE 0::numeric
      END AS pct_of_total,
      COUNT(*)::bigint AS row_count
    FROM budget_2027_spending
    GROUP BY COALESCE(%I, ''Unclassified'')
    ORDER BY amount DESC',
    p_group_by, total, total, p_group_by
  );
END;
$$;

-- 3b. Budget drill-down (agencies within a group)
CREATE OR REPLACE FUNCTION get_budget_drilldown(p_group_by text, p_group_value text)
RETURNS TABLE (
  name text,
  amount numeric,
  prior_amount numeric,
  yoy_change numeric,
  pct_of_parent numeric
) LANGUAGE plpgsql STABLE AS $$
DECLARE
  parent_total numeric;
BEGIN
  EXECUTE format(
    'SELECT COALESCE(SUM(
      CASE WHEN "2026-27 Estimates" ~ ''^[$]?[\d,.\s]+$''
        THEN REPLACE(REPLACE(REPLACE("2026-27 Estimates", ''$'', ''''), '','', ''''), '' '', '''')::numeric * 1000
        ELSE 0 END
    ), 0) FROM budget_2027_spending WHERE COALESCE(%I, ''Unclassified'') = %L',
    p_group_by, p_group_value
  ) INTO parent_total;

  RETURN QUERY EXECUTE format(
    'SELECT
      COALESCE("Agency", ''Unknown Agency'') AS name,
      COALESCE(SUM(
        CASE WHEN "2026-27 Estimates" ~ ''^[$]?[\d,.\s]+$''
          THEN REPLACE(REPLACE(REPLACE("2026-27 Estimates", ''$'', ''''), '','', ''''), '' '', '''')::numeric * 1000
          ELSE 0 END
      ), 0)::numeric AS amount,
      COALESCE(SUM(
        CASE WHEN "2025-26 Estimates" ~ ''^[$]?[\d,.\s]+$''
          THEN REPLACE(REPLACE(REPLACE("2025-26 Estimates", ''$'', ''''), '','', ''''), '' '', '''')::numeric * 1000
          ELSE 0 END
      ), 0)::numeric AS prior_amount,
      CASE WHEN COALESCE(SUM(
        CASE WHEN "2025-26 Estimates" ~ ''^[$]?[\d,.\s]+$''
          THEN REPLACE(REPLACE(REPLACE("2025-26 Estimates", ''$'', ''''), '','', ''''), '' '', '''')::numeric * 1000
          ELSE 0 END
      ), 0) != 0
        THEN ((COALESCE(SUM(
          CASE WHEN "2026-27 Estimates" ~ ''^[$]?[\d,.\s]+$''
            THEN REPLACE(REPLACE(REPLACE("2026-27 Estimates", ''$'', ''''), '','', ''''), '' '', '''')::numeric * 1000
            ELSE 0 END
        ), 0) - COALESCE(SUM(
          CASE WHEN "2025-26 Estimates" ~ ''^[$]?[\d,.\s]+$''
            THEN REPLACE(REPLACE(REPLACE("2025-26 Estimates", ''$'', ''''), '','', ''''), '' '', '''')::numeric * 1000
            ELSE 0 END
        ), 0)) / ABS(COALESCE(SUM(
          CASE WHEN "2025-26 Estimates" ~ ''^[$]?[\d,.\s]+$''
            THEN REPLACE(REPLACE(REPLACE("2025-26 Estimates", ''$'', ''''), '','', ''''), '' '', '''')::numeric * 1000
            ELSE 0 END
        ), 0)) * 100)::numeric
        ELSE 0::numeric
      END AS yoy_change,
      CASE WHEN %L::numeric > 0
        THEN (COALESCE(SUM(
          CASE WHEN "2026-27 Estimates" ~ ''^[$]?[\d,.\s]+$''
            THEN REPLACE(REPLACE(REPLACE("2026-27 Estimates", ''$'', ''''), '','', ''''), '' '', '''')::numeric * 1000
            ELSE 0 END
        ), 0) / %L::numeric * 100)::numeric
        ELSE 0::numeric
      END AS pct_of_parent
    FROM budget_2027_spending
    WHERE COALESCE(%I, ''Unclassified'') = %L
    GROUP BY COALESCE("Agency", ''Unknown Agency'')
    ORDER BY amount DESC',
    parent_total, parent_total, p_group_by, p_group_value
  );
END;
$$;

-- 3c. Budget grand totals
CREATE OR REPLACE FUNCTION get_budget_totals()
RETURNS TABLE (
  grand_total numeric,
  prior_grand_total numeric
) LANGUAGE sql STABLE AS $$
  SELECT
    COALESCE(SUM(
      CASE WHEN "2026-27 Estimates" ~ '^[$]?[\d,.\s]+$'
        THEN REPLACE(REPLACE(REPLACE("2026-27 Estimates", '$', ''), ',', ''), ' ', '')::numeric * 1000
        ELSE 0 END
    ), 0)::numeric AS grand_total,
    COALESCE(SUM(
      CASE WHEN "2025-26 Estimates" ~ '^[$]?[\d,.\s]+$'
        THEN REPLACE(REPLACE(REPLACE("2025-26 Estimates", '$', ''), ',', ''), ' ', '')::numeric * 1000
        ELSE 0 END
    ), 0)::numeric AS prior_grand_total
  FROM budget_2027_spending;
$$;


-- ────────────────────────────────────────────────────────────
-- 4. LOBBYING DASHBOARD
-- ────────────────────────────────────────────────────────────

-- 4a. Lobbyists aggregated (compensation + client count + YoY)
CREATE OR REPLACE FUNCTION get_lobbying_by_lobbyist()
RETURNS TABLE (
  name text,
  amount numeric,
  client_count bigint,
  pct_of_total numeric,
  pct_change numeric
) LANGUAGE sql STABLE AS $$
  WITH comp AS (
    SELECT
      COALESCE(principal_lobbyist, 'Unknown Lobbyist') AS name,
      CASE
        WHEN grand_total_compensation_expenses::text ~ '^[$]?[\d,.\s]+$'
        THEN REPLACE(REPLACE(REPLACE(grand_total_compensation_expenses::text, '$', ''), ',', ''), ' ', '')::numeric
        ELSE 0
      END AS amount
    FROM lobbyist_compensation
    WHERE year = 2025
  ),
  totals AS (
    SELECT SUM(amount) AS grand_total FROM comp
  ),
  clients AS (
    SELECT
      COALESCE(principal_lobbyist, 'Unknown') AS lobbyist,
      COUNT(*)::bigint AS cnt
    FROM lobbyists_clients
    GROUP BY COALESCE(principal_lobbyist, 'Unknown')
  ),
  yoy AS (
    SELECT principal_lobbyist, pct_change
    FROM lobbyist_compensation_yoy
  )
  SELECT
    c.name,
    c.amount,
    COALESCE(cl.cnt, 0)::bigint AS client_count,
    CASE WHEN t.grand_total > 0 THEN (c.amount / t.grand_total * 100)::numeric ELSE 0::numeric END AS pct_of_total,
    y.pct_change::numeric AS pct_change
  FROM comp c
  CROSS JOIN totals t
  LEFT JOIN clients cl ON cl.lobbyist = c.name
  LEFT JOIN yoy y ON y.principal_lobbyist = c.name
  ORDER BY c.amount DESC;
$$;

-- 4b. Lobbying by client
CREATE OR REPLACE FUNCTION get_lobbying_by_client()
RETURNS TABLE (
  name text,
  amount numeric,
  pct_of_total numeric
) LANGUAGE sql STABLE AS $$
  WITH spend AS (
    SELECT
      COALESCE(contractual_client, 'Unknown Client') AS name,
      CASE
        WHEN compensation_and_expenses::text ~ '^[$]?[\d,.\s]+$'
        THEN REPLACE(REPLACE(REPLACE(compensation_and_expenses::text, '$', ''), ',', ''), ' ', '')::numeric
        ELSE 0
      END AS amount
    FROM lobbying_spend
  ),
  totals AS (
    SELECT SUM(amount) AS grand_total FROM spend
  )
  SELECT
    s.name,
    s.amount,
    CASE WHEN t.grand_total > 0 THEN (s.amount / t.grand_total * 100)::numeric ELSE 0::numeric END AS pct_of_total
  FROM spend s
  CROSS JOIN totals t
  ORDER BY s.amount DESC;
$$;

-- 4c. Lobbying drill-down (clients for a lobbyist)
CREATE OR REPLACE FUNCTION get_lobbying_clients_for_lobbyist(p_lobbyist text)
RETURNS TABLE (
  name text,
  amount numeric,
  pct_of_parent numeric
) LANGUAGE sql STABLE AS $$
  WITH clients AS (
    SELECT COALESCE(contractual_client, 'Unknown Client') AS name
    FROM lobbyists_clients
    WHERE principal_lobbyist = p_lobbyist
  ),
  spend_lookup AS (
    SELECT
      COALESCE(contractual_client, 'Unknown') AS client_name,
      CASE
        WHEN compensation_and_expenses::text ~ '^[$]?[\d,.\s]+$'
        THEN REPLACE(REPLACE(REPLACE(compensation_and_expenses::text, '$', ''), ',', ''), ' ', '')::numeric
        ELSE 0
      END AS amount
    FROM lobbying_spend
  ),
  matched AS (
    SELECT c.name, COALESCE(s.amount, 0) AS amount
    FROM clients c
    LEFT JOIN spend_lookup s ON s.client_name = c.name
  ),
  totals AS (
    SELECT SUM(amount) AS parent_total FROM matched
  )
  SELECT
    m.name,
    m.amount,
    CASE WHEN t.parent_total > 0 THEN (m.amount / t.parent_total * 100)::numeric ELSE 0::numeric END AS pct_of_parent
  FROM matched m
  CROSS JOIN totals t
  ORDER BY m.amount DESC;
$$;

-- 4d. Lobbying grand totals
CREATE OR REPLACE FUNCTION get_lobbying_totals()
RETURNS TABLE (
  lobbyist_grand_total numeric,
  client_grand_total numeric,
  total_lobbyists bigint,
  total_clients bigint
) LANGUAGE sql STABLE AS $$
  SELECT
    COALESCE((
      SELECT SUM(
        CASE WHEN grand_total_compensation_expenses::text ~ '^[$]?[\d,.\s]+$'
        THEN REPLACE(REPLACE(REPLACE(grand_total_compensation_expenses::text, '$', ''), ',', ''), ' ', '')::numeric
        ELSE 0 END
      ) FROM lobbyist_compensation WHERE year = 2025
    ), 0)::numeric AS lobbyist_grand_total,
    COALESCE((
      SELECT SUM(
        CASE WHEN compensation_and_expenses::text ~ '^[$]?[\d,.\s]+$'
        THEN REPLACE(REPLACE(REPLACE(compensation_and_expenses::text, '$', ''), ',', ''), ' ', '')::numeric
        ELSE 0 END
      ) FROM lobbying_spend
    ), 0)::numeric AS client_grand_total,
    (SELECT COUNT(DISTINCT principal_lobbyist) FROM lobbyist_compensation WHERE year = 2025)::bigint AS total_lobbyists,
    (SELECT COUNT(DISTINCT contractual_client) FROM lobbying_spend)::bigint AS total_clients;
$$;


-- ────────────────────────────────────────────────────────────
-- 1e. VOTES: Roll calls per day
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION get_votes_rollcalls_per_day()
RETURNS TABLE (
  date text,
  roll_calls bigint
) LANGUAGE sql STABLE AS $$
  SELECT
    rc.date,
    COUNT(*)::bigint AS roll_calls
  FROM "Roll Call" rc
  WHERE rc.date IS NOT NULL
  GROUP BY rc.date
  ORDER BY rc.date;
$$;

-- ────────────────────────────────────────────────────────────
-- 1f. VOTES: Bills passed vs failed per day
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION get_votes_pass_fail_per_day()
RETURNS TABLE (
  date text,
  passed bigint,
  failed bigint
) LANGUAGE sql STABLE AS $$
  WITH roll_call_results AS (
    SELECT
      rc.date,
      v.roll_call_id,
      COUNT(*) FILTER (WHERE v.vote_desc LIKE 'Y%') AS yes_count,
      COUNT(*) FILTER (WHERE v.vote_desc LIKE 'N%' AND v.vote_desc NOT LIKE 'NV%') AS no_count
    FROM "Votes" v
    JOIN "Roll Call" rc ON rc.roll_call_id = v.roll_call_id
    WHERE rc.date IS NOT NULL
    GROUP BY rc.date, v.roll_call_id
  )
  SELECT
    date,
    COUNT(*) FILTER (WHERE yes_count > no_count)::bigint AS passed,
    COUNT(*) FILTER (WHERE no_count >= yes_count)::bigint AS failed
  FROM roll_call_results
  GROUP BY date
  ORDER BY date;
$$;

-- ────────────────────────────────────────────────────────────
-- 1g. VOTES: Bills with pass/fail results (for table mode)
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION get_votes_bills_pass_fail()
RETURNS TABLE (
  roll_call_id int,
  bill_number text,
  bill_title text,
  date text,
  yes_count bigint,
  no_count bigint,
  result text
) LANGUAGE sql STABLE AS $$
  SELECT
    rc.roll_call_id,
    b.bill_number,
    b.title AS bill_title,
    rc.date,
    COUNT(*) FILTER (WHERE v.vote_desc LIKE 'Y%')::bigint AS yes_count,
    COUNT(*) FILTER (WHERE v.vote_desc LIKE 'N%' AND v.vote_desc NOT LIKE 'NV%')::bigint AS no_count,
    CASE
      WHEN COUNT(*) FILTER (WHERE v.vote_desc LIKE 'Y%') > COUNT(*) FILTER (WHERE v.vote_desc LIKE 'N%' AND v.vote_desc NOT LIKE 'NV%')
      THEN 'Passed'
      ELSE 'Failed'
    END AS result
  FROM "Votes" v
  JOIN "Roll Call" rc ON rc.roll_call_id = v.roll_call_id
  LEFT JOIN "Bills" b ON b.bill_id = rc.bill_id
  WHERE rc.date IS NOT NULL
  GROUP BY rc.roll_call_id, b.bill_number, b.title, rc.date
  ORDER BY rc.date DESC;
$$;

-- ────────────────────────────────────────────────────────────
-- 1h. VOTES: Member votes for a specific roll call (drill-down)
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION get_votes_bill_member_votes(p_roll_call_id int)
RETURNS TABLE (
  name text,
  vote text
) LANGUAGE sql STABLE AS $$
  SELECT
    COALESCE(p.name, 'Unknown') AS name,
    CASE
      WHEN v.vote_desc LIKE 'Y%' THEN 'Yes'
      WHEN v.vote_desc LIKE 'N%' AND v.vote_desc NOT LIKE 'NV%' THEN 'No'
      ELSE 'Other'
    END AS vote
  FROM "Votes" v
  LEFT JOIN "People" p ON p.people_id = v.people_id
  WHERE v.roll_call_id = p_roll_call_id
  ORDER BY p.name;
$$;
