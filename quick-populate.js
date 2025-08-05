import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://dmtxyqgizfpghlqahqvo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRtdHh5cWdpemZwZ2hscWFocXZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMzNzYwNzcsImV4cCI6MjA0ODk1MjA3N30.q90xOJX5b8nZ_hNb3z3LCKjH4qvBBqhJNvqHl0zIdoE';

const supabase = createClient(supabaseUrl, supabaseKey);

// Sample NY consolidated laws data
const sampleLaws = [
  {
    law_id: 'ABP',
    name: 'Abandoned Property Law',
    chapter: '1',
    full_text: `NEW YORK ABANDONED PROPERTY LAW

ARTICLE 1 - GENERAL PROVISIONS

§ 100. Short title
This chapter shall be known and may be cited as the "abandoned property law".

§ 101. Definitions
As used in this law:
1. "Abandoned property" means all tangible or intangible property and any income or increment thereon that is held, issued, or owing in the ordinary course of a holder's business, or by a state or other government or governmental subdivision, agency, or instrumentality, and that has remained unclaimed by the owner for more than three years after it became payable or distributable.

§ 102. Property presumed abandoned
(a) Subject to section one hundred three of this article, the following property is presumed to be abandoned if it is unclaimed for more than three years after it became payable or distributable:
(1) A gift certificate or gift card;
(2) Wages, unpaid commissions, bonuses, and back pay;
(3) Stocks and other equity interests in business associations;
(4) Monies deposited to redeem stocks, bonds, coupons, and other securities;
(5) Payments to shareholders.

ARTICLE 2 - PROCEDURES FOR TAKING CUSTODY

§ 200. Report of abandoned property
Every person holding funds or other property, tangible or intangible, presumed abandoned under this law shall report to the comptroller concerning such property.

§ 201. Payment or delivery of abandoned property
Every person who has filed a report under this law shall pay or deliver to the comptroller all abandoned property specified in the report.`,
    sections: [
      {
        location_id: 'ABP-100',
        section_number: '100',
        title: 'Short title',
        content: 'This chapter shall be known and may be cited as the "abandoned property law".',
        level: 1,
        sort_order: 1
      },
      {
        location_id: 'ABP-101',
        section_number: '101',
        title: 'Definitions',
        content: 'As used in this law:\n1. "Abandoned property" means all tangible or intangible property and any income or increment thereon that is held, issued, or owing in the ordinary course of a holder\'s business, or by a state or other government or governmental subdivision, agency, or instrumentality, and that has remained unclaimed by the owner for more than three years after it became payable or distributable.',
        level: 1,
        sort_order: 2
      },
      {
        location_id: 'ABP-102',
        section_number: '102',
        title: 'Property presumed abandoned',
        content: '(a) Subject to section one hundred three of this article, the following property is presumed to be abandoned if it is unclaimed for more than three years after it became payable or distributable:\n(1) A gift certificate or gift card;\n(2) Wages, unpaid commissions, bonuses, and back pay;\n(3) Stocks and other equity interests in business associations;\n(4) Monies deposited to redeem stocks, bonds, coupons, and other securities;\n(5) Payments to shareholders.',
        level: 1,
        sort_order: 3
      },
      {
        location_id: 'ABP-200',
        section_number: '200',
        title: 'Report of abandoned property',
        content: 'Every person holding funds or other property, tangible or intangible, presumed abandoned under this law shall report to the comptroller concerning such property.',
        level: 1,
        sort_order: 4
      },
      {
        location_id: 'ABP-201',
        section_number: '201',
        title: 'Payment or delivery of abandoned property',
        content: 'Every person who has filed a report under this law shall pay or deliver to the comptroller all abandoned property specified in the report.',
        level: 1,
        sort_order: 5
      }
    ]
  },
  {
    law_id: 'AGM',
    name: 'Agriculture and Markets Law',
    chapter: '69',
    full_text: `NEW YORK AGRICULTURE AND MARKETS LAW

ARTICLE 1 - GENERAL PROVISIONS

§ 1. Short title
This chapter shall be known and may be cited as the "agriculture and markets law".

§ 2. Declaration of policy
It is hereby declared to be the policy of the state to foster and encourage the development of agriculturally related industries, the maintenance of viable farming, and the protection of agricultural lands as a basic economic and food resource of vital importance to the health, welfare and prosperity of the people of this state.

§ 3. Definitions
As used in this chapter, unless the context otherwise requires:
1. "Department" means the department of agriculture and markets.
2. "Commissioner" means the commissioner of agriculture and markets.
3. "Farm products" means goods, products, or commodities produced on a farm.

ARTICLE 2 - DEPARTMENT OF AGRICULTURE AND MARKETS

§ 10. Department continued; commissioner
The department of agriculture and markets is hereby continued. The head of the department shall be the commissioner of agriculture and markets.

§ 11. Powers and duties of commissioner
The commissioner shall have the power and it shall be his duty to:
1. Execute and administer the provisions of this chapter;
2. Foster and encourage the development and improvement of agriculture and agricultural marketing within the state;
3. Promote the general welfare of farmers and farm workers.`,
    sections: [
      {
        location_id: 'AGM-1',
        section_number: '1',
        title: 'Short title',
        content: 'This chapter shall be known and may be cited as the "agriculture and markets law".',
        level: 1,
        sort_order: 1
      },
      {
        location_id: 'AGM-2',
        section_number: '2',
        title: 'Declaration of policy',
        content: 'It is hereby declared to be the policy of the state to foster and encourage the development of agriculturally related industries, the maintenance of viable farming, and the protection of agricultural lands as a basic economic and food resource of vital importance to the health, welfare and prosperity of the people of this state.',
        level: 1,
        sort_order: 2
      },
      {
        location_id: 'AGM-3',
        section_number: '3',
        title: 'Definitions',
        content: 'As used in this chapter, unless the context otherwise requires:\n1. "Department" means the department of agriculture and markets.\n2. "Commissioner" means the commissioner of agriculture and markets.\n3. "Farm products" means goods, products, or commodities produced on a farm.',
        level: 1,
        sort_order: 3
      },
      {
        location_id: 'AGM-10',
        section_number: '10',
        title: 'Department continued; commissioner',
        content: 'The department of agriculture and markets is hereby continued. The head of the department shall be the commissioner of agriculture and markets.',
        level: 1,
        sort_order: 4
      },
      {
        location_id: 'AGM-11',
        section_number: '11',
        title: 'Powers and duties of commissioner',
        content: 'The commissioner shall have the power and it shall be his duty to:\n1. Execute and administer the provisions of this chapter;\n2. Foster and encourage the development and improvement of agriculture and agricultural marketing within the state;\n3. Promote the general welfare of farmers and farm workers.',
        level: 1,
        sort_order: 5
      }
    ]
  },
  {
    law_id: 'EDN',
    name: 'Education Law',
    chapter: '16',
    full_text: `NEW YORK EDUCATION LAW

ARTICLE 1 - GENERAL PROVISIONS

§ 1. Short title
This chapter shall be known as the "education law".

§ 2. Educational policy of the state
The legislature hereby declares that the educational policy of the state of New York is to provide a sound basic education for all children actually resident therein.

§ 3. Definitions
When used in this chapter, unless a different meaning clearly appears from the context:
1. "University" means the University of the State of New York.
2. "Department" means the state education department.
3. "Commissioner" means the commissioner of education.

ARTICLE 2 - UNIVERSITY OF THE STATE OF NEW YORK

§ 201. University continued
The University of the State of New York is hereby continued, and shall remain under the name of "University of the State of New York."

§ 202. Corporate powers
The university shall be a body corporate with the powers, privileges and immunities of a corporation.

ARTICLE 5 - STATE EDUCATION DEPARTMENT

§ 301. State education department
There shall continue to be in the university a state education department.

§ 302. Commissioner of education
The chief executive officer of the state education department shall be the commissioner of education.`,
    sections: [
      {
        location_id: 'EDN-1',
        section_number: '1',
        title: 'Short title',
        content: 'This chapter shall be known as the "education law".',
        level: 1,
        sort_order: 1
      },
      {
        location_id: 'EDN-2',
        section_number: '2',
        title: 'Educational policy of the state',
        content: 'The legislature hereby declares that the educational policy of the state of New York is to provide a sound basic education for all children actually resident therein.',
        level: 1,
        sort_order: 2
      },
      {
        location_id: 'EDN-3',
        section_number: '3',
        title: 'Definitions',
        content: 'When used in this chapter, unless a different meaning clearly appears from the context:\n1. "University" means the University of the State of New York.\n2. "Department" means the state education department.\n3. "Commissioner" means the commissioner of education.',
        level: 1,
        sort_order: 3
      },
      {
        location_id: 'EDN-201',
        section_number: '201',
        title: 'University continued',
        content: 'The University of the State of New York is hereby continued, and shall remain under the name of "University of the State of New York."',
        level: 1,
        sort_order: 4
      },
      {
        location_id: 'EDN-202',
        section_number: '202',
        title: 'Corporate powers',
        content: 'The university shall be a body corporate with the powers, privileges and immunities of a corporation.',
        level: 1,
        sort_order: 5
      },
      {
        location_id: 'EDN-301',
        section_number: '301',
        title: 'State education department',
        content: 'There shall continue to be in the university a state education department.',
        level: 1,
        sort_order: 6
      },
      {
        location_id: 'EDN-302',
        section_number: '302',
        title: 'Commissioner of education',
        content: 'The chief executive officer of the state education department shall be the commissioner of education.',
        level: 1,
        sort_order: 7
      }
    ]
  }
];

async function populateDatabase() {
  console.log('🚀 Quick populating NY Laws database...');
  
  let successful = 0;
  let failed = 0;

  // Clear existing data first
  console.log('🧹 Clearing existing data...');
  await supabase.from('ny_law_sections').delete().neq('id', 0);
  await supabase.from('ny_laws').delete().neq('id', 0);

  for (const law of sampleLaws) {
    try {
      console.log(`📖 Adding ${law.law_id} - ${law.name}`);
      
      // Insert main law record
      const { error: lawError } = await supabase
        .from('ny_laws')
        .upsert({
          law_id: law.law_id,
          name: law.name,
          chapter: law.chapter,
          law_type: 'CONSOLIDATED',
          full_text: law.full_text,
          structure: { manually_added: true, added_at: new Date().toISOString() },
          total_sections: law.sections.length,
          last_updated: new Date().toISOString().split('T')[0],
          updated_at: new Date().toISOString()
        }, { onConflict: 'law_id' });

      if (lawError) {
        throw new Error(`Failed to store law: ${lawError.message}`);
      }

      // Insert sections
      const sectionsWithLawId = law.sections.map(section => ({
        ...section,
        law_id: law.law_id
      }));

      const { error: sectionsError } = await supabase
        .from('ny_law_sections')
        .insert(sectionsWithLawId);

      if (sectionsError) {
        throw new Error(`Failed to store sections: ${sectionsError.message}`);
      }

      console.log(`   ✅ Added ${law.sections.length} sections`);
      successful++;

    } catch (error) {
      console.error(`   ❌ Failed: ${error.message}`);
      failed++;
    }
  }

  console.log(`\n🎉 POPULATION COMPLETED!`);
  console.log(`✅ Successful: ${successful}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📊 Total laws: ${sampleLaws.length}`);
  console.log(`\n🔍 Check your Laws page now!`);
}

populateDatabase()
  .then(() => {
    console.log('\n🎉 ALL DONE! Your database now has searchable NY laws!');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n💥 Population failed:', error);
    process.exit(1);
  });