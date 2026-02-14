/**
 * Contract context builder for NewChat.
 *
 * Fetches a contract by number plus related vendor/department contracts
 * and returns a formatted data-context string suitable for
 * `composeSystemPrompt({ dataContext })`.
 */

import { supabase } from '@/integrations/supabase/client';

export async function buildContractContext(
  contractNumber: string,
): Promise<string | undefined> {
  const { data: contract } = await supabase
    .from('Contracts')
    .select('*')
    .eq('contract_number', contractNumber)
    .single();

  if (!contract) return undefined;

  const parts: string[] = [];

  // Primary contract details
  parts.push(
    `PRIMARY CONTRACT DATA:\n` +
      `- Contract Number: ${contract.contract_number}\n` +
      `- Vendor: ${contract.vendor_name}\n` +
      `- Department: ${contract.department_facility}\n` +
      `- Type: ${contract.contract_type || 'N/A'}\n` +
      `- Amount: $${Number(contract.current_contract_amount || 0).toLocaleString()}\n` +
      `- Spending to Date: $${Number(contract.spending_to_date || 0).toLocaleString()}\n` +
      `- Start Date: ${contract.contract_start_date || 'N/A'}\n` +
      `- End Date: ${contract.contract_end_date || 'N/A'}\n` +
      `- Description: ${contract.contract_description || 'N/A'}`,
  );

  // Other contracts from the same vendor (top 10 by amount)
  const { data: vendorContracts } = await supabase
    .from('Contracts')
    .select(
      'contract_number, department_facility, current_contract_amount, spending_to_date, contract_start_date, contract_end_date, contract_type, contract_description',
    )
    .eq('vendor_name', contract.vendor_name)
    .neq('contract_number', contractNumber)
    .order('current_contract_amount', { ascending: false, nullsFirst: false })
    .limit(10);

  if (vendorContracts && vendorContracts.length > 0) {
    const vendorSummary = vendorContracts
      .map(
        (c) =>
          `  - ${c.contract_number}: ${c.department_facility} | $${Number(c.current_contract_amount || 0).toLocaleString()} | ${c.contract_type || 'N/A'} | ${c.contract_start_date || '?'} to ${c.contract_end_date || '?'}`,
      )
      .join('\n');
    parts.push(
      `\nOTHER CONTRACTS BY SAME VENDOR (${contract.vendor_name}) - ${vendorContracts.length} additional contracts found:\n${vendorSummary}`,
    );
  }

  // Other contracts from the same department (top 10 by amount)
  const { data: deptContracts } = await supabase
    .from('Contracts')
    .select(
      'contract_number, vendor_name, current_contract_amount, spending_to_date, contract_type, contract_description',
    )
    .eq('department_facility', contract.department_facility)
    .neq('contract_number', contractNumber)
    .order('current_contract_amount', { ascending: false, nullsFirst: false })
    .limit(10);

  if (deptContracts && deptContracts.length > 0) {
    const deptSummary = deptContracts
      .map(
        (c) =>
          `  - ${c.contract_number}: ${c.vendor_name} | $${Number(c.current_contract_amount || 0).toLocaleString()} | ${c.contract_type || 'N/A'}`,
      )
      .join('\n');
    parts.push(
      `\nTOP CONTRACTS IN SAME DEPARTMENT (${contract.department_facility}) - showing top ${deptContracts.length} by amount:\n${deptSummary}`,
    );
  }

  return parts.join('\n');
}
