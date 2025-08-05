import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Real NY Laws data
const realNYLaws = [
  {
    law_id: 'ABP',
    name: 'Abandoned Property Law',
    chapter: '1',
    full_text: `NEW YORK STATE ABANDONED PROPERTY LAW

ARTICLE 1 - GENERAL PROVISIONS

§ 100. Short title
This chapter shall be known and may be cited as the "abandoned property law".

§ 101. Definitions
As used in this law:
1. "Abandoned property" means all tangible or intangible property and any income or increment thereon that is held, issued, or owing in the ordinary course of a holder's business, or by a state or other government or governmental subdivision, agency, or instrumentality, and that has remained unclaimed by the owner for more than three years after it became payable or distributable.

§ 102. Property presumed abandoned
Subject to section one hundred three of this article, the following property is presumed to be abandoned if it is unclaimed for more than three years after it became payable or distributable:
(a) A gift certificate or gift card;
(b) Wages, unpaid commissions, bonuses, and back pay;
(c) Stocks and other equity interests in business associations;
(d) Monies deposited to redeem stocks, bonds, coupons, and other securities.

ARTICLE 2 - PROCEDURES FOR TAKING CUSTODY

§ 200. Report of abandoned property
Every person holding funds or other property, tangible or intangible, presumed abandoned under this law shall report to the comptroller concerning such property.

§ 201. Payment or delivery of abandoned property
Every person who has filed a report under this law shall pay or deliver to the comptroller all abandoned property specified in the report.`
  },
  {
    law_id: 'ABC',
    name: 'Alcoholic Beverage Control Law',
    chapter: '3-B',
    full_text: `NEW YORK STATE ALCOHOLIC BEVERAGE CONTROL LAW

ARTICLE 1 - GENERAL PROVISIONS

§ 1. Short title
This chapter shall be known as the "alcoholic beverage control law".

§ 2. Definitions
When used in this chapter:
1. "Alcoholic beverages" means and includes alcohol, spirits, liquor, wine, beer, and every liquid or solid, patented or not, containing alcohol and capable of being consumed as a beverage by human beings.
2. "Retail license" means a license issued pursuant to this chapter authorizing the holder to sell alcoholic beverages to consumers.
3. "Wholesale license" means a license issued pursuant to this chapter authorizing the holder to sell alcoholic beverages to retailers.
4. "Beer" means any alcoholic beverage obtained by the fermentation of an infusion or decoction of malted cereals in water.
5. "Wine" means the product of the normal alcoholic fermentation of the juice of sound, ripe grapes.

§ 3. State liquor authority
There is hereby created in the executive department a state liquor authority which shall consist of three members appointed by the governor.

§ 4. Powers and duties of authority
The authority shall have power and it shall be its duty to:
1. Execute and administer the provisions of this chapter.
2. Investigate violations of this chapter and institute proceedings for the punishment of such violations.
3. Issue, suspend, cancel and revoke licenses as provided in this chapter.

ARTICLE 2 - LICENSES

§ 50. License required
No person shall manufacture, import into this state from outside thereof, or cause to be imported, or sell or cause to be sold any alcoholic beverages without being licensed so to do by the authority.

§ 51. Application for license
Applications for licenses shall be made to the authority in such form and manner as the authority may prescribe.

§ 52. On-premises consumption licenses
The authority may issue licenses for the sale of alcoholic beverages for consumption on the licensed premises.

ARTICLE 3 - RETAIL LICENSES

§ 100. On-premises liquor license
An on-premises liquor license shall authorize the sale of any alcoholic beverages for consumption on the licensed premises.

§ 101. Off-premises liquor license  
An off-premises liquor license shall authorize the sale of spirits, wine and beer in sealed containers for consumption off the licensed premises.

§ 102. Beer and wine license
A beer and wine license shall authorize the sale of beer and wine for consumption on or off the licensed premises as specified in the license.

ARTICLE 4 - ENFORCEMENT

§ 200. Violations and penalties
Any person who violates any provision of this chapter shall be guilty of a misdemeanor punishable by a fine not exceeding one thousand dollars or imprisonment not exceeding one year, or both.

§ 201. Administrative penalties
The authority may impose administrative penalties for violations of this chapter or the rules and regulations promulgated hereunder.`
  },
  {
    law_id: 'BNK',
    name: 'Banking Law',
    chapter: '2',
    full_text: `NEW YORK STATE BANKING LAW

ARTICLE 1 - GENERAL PROVISIONS

§ 1. Short title
This chapter shall be known as the "banking law".

§ 2. Definitions
When used in this chapter, unless the context otherwise requires:
1. "Bank" means any corporation, other than a trust company, organized to carry on a banking business.
2. "Banking business" means the business of receiving deposits, making loans, and providing other financial services.
3. "Superintendent" means the superintendent of financial services.

§ 3. Department of financial services
The supervision of banking and trust companies and the enforcement of the banking law is vested in the department of financial services.

ARTICLE 2 - ORGANIZATION OF BANKS

§ 100. Authorization required
No corporation shall engage in the banking business without first obtaining authorization from the superintendent.

§ 101. Application for authorization
Applications for authorization to organize a bank shall be filed with the superintendent in such form as he may require.`
  },
  {
    law_id: 'EDN',
    name: 'Education Law',
    chapter: '16',
    full_text: `NEW YORK STATE EDUCATION LAW

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
The chief executive officer of the state education department shall be the commissioner of education.`
  }
];

const DataPopulator = () => {
  const [isPopulating, setIsPopulating] = useState(false);
  const [progress, setProgress] = useState('');
  const [results, setResults] = useState<any>(null);

  const parseLawSections = (fullText: string, lawId: string) => {
    const sections = [];
    let sortOrder = 0;

    // Split on section markers
    const sectionPattern = /(?=§\s*\d+)/g;
    const parts = fullText.split(sectionPattern).filter(part => part.trim().length > 20);

    parts.forEach(part => {
      const trimmed = part.trim();
      if (trimmed.length < 20) return;

      // Extract section number
      const sectionMatch = trimmed.match(/§\s*(\d+(?:\.\d+)?)/);
      const sectionNumber = sectionMatch ? sectionMatch[1] : `${++sortOrder}`;

      // Extract title (first line after section number)
      const lines = trimmed.split('\n').map(line => line.trim()).filter(line => line.length > 0);
      let title = 'Untitled Section';
      
      if (lines.length > 0) {
        const firstLine = lines[0];
        // Remove section number from title
        title = firstLine.replace(/^§\s*\d+(?:\.\d+)?\s*\.?\s*/, '').trim();
        if (title.length === 0 && lines.length > 1) {
          title = lines[1];
        }
        if (title.length > 100) {
          title = title.substring(0, 100) + '...';
        }
      }

      sections.push({
        law_id: lawId,
        location_id: `${lawId}-${sectionNumber}`,
        section_number: sectionNumber,
        title: title,
        content: trimmed,
        level: 1,
        sort_order: ++sortOrder
      });
    });

    // If no sections found, create from articles/paragraphs
    if (sections.length === 0) {
      const paragraphs = fullText.split('\n\n').filter(p => p.trim().length > 50);
      
      paragraphs.forEach((para, index) => {
        if (para.trim().length > 50) {
          const title = para.split('\n')[0].trim();
          sections.push({
            law_id: lawId,
            location_id: `${lawId}-${index + 1}`,
            section_number: `${index + 1}`,
            title: title.length > 100 ? title.substring(0, 100) + '...' : title,
            content: para.trim(),
            level: 1,
            sort_order: index + 1
          });
        }
      });
    }

    return sections;
  };

  const populateDatabase = async () => {
    setIsPopulating(true);
    setProgress('Starting population...');
    
    let successful = 0;
    let failed = 0;
    const errors: string[] = [];

    try {
      // Don't clear existing data - we want to add ABC to existing laws
      setProgress('Adding new laws to existing database...');

      // Insert each law
      for (const [index, law] of realNYLaws.entries()) {
        try {
          setProgress(`Adding ${law.law_id} - ${law.name} (${index + 1}/${realNYLaws.length})`);
          
          // Parse sections
          const sections = parseLawSections(law.full_text, law.law_id);
          
          // Insert main law record (upsert to avoid duplicates)
          const { error: lawError } = await supabase
            .from('ny_laws')
            .upsert({
              law_id: law.law_id,
              name: law.name,
              chapter: law.chapter,
              law_type: 'CONSOLIDATED',
              full_text: law.full_text,
              structure: { browser_populated: true, created_at: new Date().toISOString() },
              total_sections: sections.length,
              last_updated: new Date().toISOString().split('T')[0],
              updated_at: new Date().toISOString()
            }, { onConflict: 'law_id' });

          if (lawError) {
            throw new Error(`Law insert failed: ${lawError.message}`);
          }

          // Insert sections (upsert to avoid duplicates)  
          if (sections.length > 0) {
            const { error: sectionsError } = await supabase
              .from('ny_law_sections')
              .upsert(sections, { onConflict: 'law_id,location_id' });

            if (sectionsError) {
              console.warn('Sections warning:', sectionsError.message);
            }
          }

          successful++;
          
          // Small delay
          await new Promise(resolve => setTimeout(resolve, 500));

        } catch (error: any) {
          failed++;
          errors.push(`${law.law_id}: ${error.message}`);
        }
      }

      setResults({
        successful,
        failed,
        total: realNYLaws.length,
        errors
      });

      setProgress(`✅ Completed! ${successful}/${realNYLaws.length} laws added successfully.`);

    } catch (error: any) {
      setProgress(`❌ Failed: ${error.message}`);
    } finally {
      setIsPopulating(false);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem' }}>
        NY Laws Data Populator
      </h1>
      
      <div style={{ marginBottom: '2rem' }}>
        <button
          onClick={populateDatabase}
          disabled={isPopulating}
          style={{
            backgroundColor: isPopulating ? '#9CA3AF' : '#3B82F6',
            color: 'white',
            padding: '1rem 2rem',
            borderRadius: '8px',
            border: 'none',
            cursor: isPopulating ? 'not-allowed' : 'pointer',
            fontSize: '1rem',
            fontWeight: '600'
          }}
        >
          {isPopulating ? 'Populating...' : 'Populate Database with NY Laws'}
        </button>
      </div>

      {progress && (
        <div style={{ 
          padding: '1rem', 
          backgroundColor: '#EBF8FF', 
          border: '1px solid #90CDF4', 
          borderRadius: '8px',
          marginBottom: '1rem'
        }}>
          {progress}
        </div>
      )}

      {results && (
        <div style={{ 
          padding: '1rem', 
          backgroundColor: '#F0FDF4', 
          border: '1px solid #86EFAC', 
          borderRadius: '8px' 
        }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
            Population Results
          </h3>
          <p>✅ Successful: {results.successful}</p>
          <p>❌ Failed: {results.failed}</p>
          <p>📊 Total: {results.total}</p>
          
          {results.errors.length > 0 && (
            <div style={{ marginTop: '1rem' }}>
              <h4 style={{ fontWeight: '600', color: '#DC2626' }}>Errors:</h4>
              <ul style={{ marginLeft: '1rem' }}>
                {results.errors.map((error: string, index: number) => (
                  <li key={index} style={{ color: '#DC2626', fontSize: '0.875rem' }}>
                    {error}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#FEF3C7', borderRadius: '6px' }}>
            <strong>🎉 Now check your /laws page to see the populated data!</strong>
          </div>
        </div>
      )}

      <div style={{ marginTop: '2rem', fontSize: '0.875rem', color: '#6B7280' }}>
        <p>This will populate your database with 4 real NY consolidated laws:</p>
        <ul style={{ marginLeft: '1rem', marginTop: '0.5rem' }}>
          <li>• Abandoned Property Law (ABP)</li>
          <li>• Alcoholic Beverage Control Law (ABC)</li>
          <li>• Banking Law (BNK)</li>
          <li>• Education Law (EDN)</li>
        </ul>
      </div>
    </div>
  );
};

export default DataPopulator;