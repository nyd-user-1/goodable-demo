/**
 * NY Legislative Domain Knowledge
 *
 * Base-layer context included in ALL AI chat system prompts.
 * Provides the model with structural knowledge about NYS government
 * so individual prompts don't need to re-explain basics.
 */

export const NY_LEGISLATIVE_DOMAIN = `
# New York State Legislative Domain Knowledge

## Bill Lifecycle
1. **Introduction**: Sponsor submits bill (A.#### for Assembly, S.#### for Senate)
2. **Committee Assignment**: Referred to relevant committee (e.g., Ways & Means, Finance)
3. **Committee Action**: Held, reported out, or dies in committee
4. **Floor Vote**: Passage requires simple majority in originating chamber
5. **Second Chamber**: Repeat process in other house
6. **Conference**: If versions differ, conference committee reconciles
7. **Governor Action**: Sign (becomes law), veto (can be overridden with 2/3 vote), or pocket veto (30 days)

## Bill Numbering
- **A.####**: Assembly bill (e.g., A.1234)
- **S.####**: Senate bill (e.g., S.5678)
- Companion bills: same legislation introduced in both chambers (e.g., A.1234 / S.5678)
- Budget bills: Usually S.#### / A.#### in March/April

## Budget Process
- **January**: Governor releases Executive Budget proposal
- **February-March**: Legislative hearings on budget proposals
- **April 1**: Constitutional deadline for budget passage
- **Reality**: Often passes late April with legislative additions ("budget extenders")

## Key State Agencies & Acronyms
- **DASNY**: Dormitory Authority of the State of New York (finances construction)
- **NYSERDA**: NY State Energy Research & Development Authority
- **OGS**: Office of General Services (procurement, real estate)
- **OSC**: Office of the State Comptroller (audits, contract oversight)
- **DOB**: Division of the Budget
- **ESD**: Empire State Development (economic development)
- **MTA**: Metropolitan Transportation Authority
- **SUNY**: State University of New York (64 campuses)
- **CUNY**: City University of New York (25 campuses)
- **SED**: State Education Department
- **OPWDD**: Office for People With Developmental Disabilities
- **OMH**: Office of Mental Health
- **OASAS**: Office of Addiction Services and Supports
- **JCOPE**: Joint Commission on Public Ethics (lobbying oversight)

## Lobbying Disclosure
- Lobbyists must register and file bimonthly reports with JCOPE
- Reports disclose: clients, compensation, expenses, bills/topics targeted
- "Compensation" = payments received for lobbying services
- "Expenses" = costs incurred in lobbying activities
- "Grand Total" = compensation + reimbursed expenses
- All filings are public record

## Contract Approval
- Contract data sourced from the NYS Office of the State Comptroller
- Contract types: services, commodities, construction, revenue, grants
- Comptroller review required for contracts exceeding certain thresholds
- Contracts above $50K are typically publicly disclosed
- "Amount" = total approved contract value

## Legislative Sessions
- **Regular session**: January - June (or until adjournment)
- **Extraordinary session**: Governor can call special session
- **2-year cycle**: Odd-numbered years = new session starts (e.g., 2025-2026 session)

## Chambers
- **Assembly**: 150 members, 2-year terms, led by Speaker
- **Senate**: 63 members, 2-year terms, led by Majority Leader
- Party affiliations primarily Democrat (D) and Republican (R)
`.trim();
