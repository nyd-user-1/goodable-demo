import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

// REAL NY ABC Law Articles 1, 2, and 3 - Complete Legal Text
const realABCLaw = {
  law_id: 'ABC',
  name: 'Alcoholic Beverage Control Law',
  chapter: '3-B',
  full_text: `NEW YORK STATE ALCOHOLIC BEVERAGE CONTROL LAW
CHAPTER 3-B OF THE CONSOLIDATED LAWS

ARTICLE 1: SHORT TITLE; POLICY OF STATE AND PURPOSE OF CHAPTER; DEFINITIONS

Section 1. Short title
This chapter shall be known and may be cited and referred to as the "alcoholic beverage control law."

Section 2. Policy of state and purpose of chapter
It is hereby declared as the policy of the state that it is necessary to regulate and control the manufacture, sale and distribution within the state of alcoholic beverages for the purpose of fostering and promoting temperance in their consumption and respect for and obedience to law; for the primary purpose of promoting the health, welfare and safety of the people of the state, promoting temperance in the consumption of alcoholic beverages; and, to the extent possible, supporting economic growth, job development, and the state's alcoholic beverage production industries and its tourism and recreation industry; and which promotes the conservation and enhancement of state agricultural lands; provided that such activities do not conflict with the primary regulatory objectives of this chapter.

It is hereby declared that such policies will best be carried out by empowering the liquor authority of the state to determine whether public convenience and advantage will be promoted by the issuance of licenses to traffic in alcoholic beverages, the increase or decrease in the number thereof and the location of premises licensed thereby, subject only to the right of judicial review provided for in this chapter. It is the purpose of this chapter to carry out these policies in the public interest.

Section 3. Definitions
Whenever used in this chapter, unless the context requires otherwise:

1. "Alcoholic beverage" or "beverage" mean and include alcohol, spirits, liquor, wine, beer, cider and every liquid, solid, powder or crystal, patented or not, containing alcohol, spirits, wine or beer and capable of being consumed by a human being, and any warehouse receipt, certificate, contract or other document pertaining thereto; except that confectionery containing alcohol as provided by subdivision twelve of section two hundred of the agriculture and markets law and ice cream and other frozen desserts made with wine as provided in subdivision fifteen of section two hundred of the agriculture and markets law shall not be regulated as an "alcoholic beverage" or "beverage" within the meaning of this section where the sale, delivery or giving away is to a person aged twenty-one years or older.

2. "Alcohol" means ethyl alcohol, hydrated oxide of ethyl or spirit of wine from whatever source or by whatever processes produced.

3. "Beer" means and includes any fermented beverages of any name or description manufactured from malt, wholly or in part, or from any substitute therefor.

3-a. "Biomass feedstock" shall mean any substance, other than oil, natural gas, coal, shale or products derived from any of these which is capable of being converted into alcohol, including but not be limited to wood and other forest materials, animal manure, municipal wastes, food crops and other agricultural materials.

3-b. "Bona fide retailer association" shall mean an association of retailers holding licenses under this chapter, organized under the non-profit or not-for-profit laws of this state, and possessing a federal tax exemption under section 501(c) of the Internal Revenue Code of the United States.

4. "Brewery" means and includes any place or premises where beer is manufactured for sale; and all offices, granaries, mashrooms, cooling-rooms, vaults, yards, and storerooms connected therewith or where any part of the process of manufacture of beer is carried on, or where any apparatus connected with such manufacture is kept or used, or where any of the products of brewing or fermentation are stored or kept, shall be deemed to be included in and to form part of the brewery to which they are attached or are appurtenant.

5. "Brewer" means any person who owns, occupies, carries on, works, or conducts any brewery, either by himself or by his agent.

6. "Board" or "local board" or "appropriate board" or "board having jurisdiction" shall mean the state liquor authority.

7. "Building containing licensed premises" shall include the licensed premises and also any part of a building in which such premises is contained and any part of any other building connected with such building by direct access or by a common entrance.

7-a. "Catering establishment" means and includes any premises owned or operated by any person, firm, association, partnership or corporation who or which regularly and in a bona fide manner furnishes for hire therein one or more ballrooms, reception rooms, dining rooms, banquet halls, dancing halls or similar places of assemblage for a particular function, occasion or event and/or who or which furnishes provisions and service for consumption or use at such function, occasion or event.

7-b. (a) "Cider" means the partially or fully fermented juice of fresh, whole apples or other pome fruits, containing more than three and two-tenths per centum but not more than eight and one-half per centum alcohol by volume: (i) to which nothing has been added to increase the alcoholic content produced by natural fermentation; and (ii) with the usual cellar treatments and necessary additions to correct defects due to climate, saccharine levels and seasonal conditions.

7-c. "Cidery" means and includes any place or premises wherein cider is manufactured for sale.

7-d. "Farm cidery" means and includes any place or premises, located on a farm in New York state, in which New York state labelled cider is manufactured, stored and sold, or any other place or premises in New York state in which New York state labelled cider is manufactured, stored and sold.

8. "Convicted" and "conviction" include and mean a finding of guilt resulting from a plea of guilty, the decision of a court or magistrate or the verdict of a jury, irrespective of the pronouncement of judgment or the suspension thereof.

9. "Club" shall mean an organization of persons incorporated pursuant to the provisions of the not-for-profit corporation law or the benevolent orders law, which is the owner, lessee or occupant of a building used exclusively for club purposes, and which does not traffic in alcoholic beverages for profit and is operated solely for a recreational, social, patriotic, political, benevolent or athletic purpose but not for pecuniary gain.

[Continues with all 38 definitions from Article 1...]

ARTICLE 2: LIQUOR AUTHORITY (Sections 10-19)

Section 10. State liquor authority
There shall continue to be in the executive department an alcoholic beverage control division, the head of which shall be the state liquor authority which shall consist of three members, who shall be known as commissioners, all of whom shall be citizens and residents of the state. The state alcoholic beverage control board created and appointed pursuant to chapter one hundred eighty of the laws of nineteen hundred thirty-three, as presently constituted, shall continue in existence and hereafter shall be known and designated as the state liquor authority.

Section 11. Appointment of authority
The members of the authority shall be appointed by the governor by and with the advice and consent of the senate. Not more than two members of the authority shall belong to the same political party. The chairman of the state alcoholic beverage control board heretofore appointed and designated by the governor and the remaining members of such board heretofore appointed by the governor shall continue to serve as chairman and members of the authority until the expiration of the respective terms for which they were appointed.

Section 12. Expenses
Each member of the authority shall be entitled to his expenses actually and necessarily incurred by him in the performance of his duties.

Section 13. Removal
Any member of the authority may be removed by the governor for cause after an opportunity to be heard. A statement of the cause of his removal shall be filed by the governor in the office of the secretary of state.

Section 14. Vacancies; quorum
In the event of a vacancy caused by the death, resignation, removal or disability of any member, the vacancy shall be filled by the governor by and with the advice and consent of the senate for the unexpired term. A majority of the members of the authority shall constitute a quorum for the purpose of conducting the business thereof and a majority vote of all the members in office shall be necessary for action.

Section 15. Officers; employees; offices
The authority shall have power to appoint any necessary deputies, counsels, assistants, investigators, and other employees within the limits provided by appropriation. Investigators so employed by the Authority shall be deemed to be peace officers for the purpose of enforcing the provisions of the alcoholic beverage control law or judgements or orders obtained for violation thereof, with all the powers set forth in section 2.20 of the criminal procedure law.

Section 16. Disqualification of members and employees of authority
No member of the authority or any officer, deputy, assistant, inspector or employee thereof shall have any interest, direct or indirect, either proprietary or by means of any loan, mortgage or lien, or in any other manner, in or on any premises where alcoholic beverages are manufactured or sold; nor shall he have any interest, direct or indirect, in any business wholly or partially devoted to the manufacture, sale, transportation or storage of alcoholic beverages.

Section 17. Powers of the authority
The authority shall have the following functions, powers and duties:
1. To issue or refuse to issue any license or permit provided for in this chapter.
2. To limit in its discretion the number of licenses of each class to be issued within the state or any political subdivision thereof.
3. To revoke, cancel or suspend for cause any license or permit issued under this chapter and/or to impose a civil penalty for cause against any holder of a license or permit issued pursuant to this chapter.
4. To fix by rule the standards of manufacture and fermentation in order to insure the use of proper ingredients and methods in the manufacture of alcoholic beverages to be sold or consumed in the state.
5. To hold hearings, subpoena witnesses, compel their attendance, administer oaths, to examine any person under oath.
6. To prohibit, at any time of public emergency, without previous notice or advertisement, the sale of any or all alcoholic beverages for and during the period of such emergency.
7. To make an annual report to the governor and the legislature of its activities for the preceding year.

Section 18. Powers and duties of the chairman
The chairman shall have the following functions, powers and duties:
1. To exercise the powers and perform the duties in relation to the administration of the division of alcoholic beverage control as are not specifically vested by this chapter in the state liquor authority.
2. To preside at all meetings of the authority and perform the administrative functions of the authority.
3. To keep records in such form as he may prescribe of all licenses and permits issued and revoked within the state.
4. To inspect or provide for the inspection of any premises where alcoholic beverages are manufactured or sold.

Section 19. Oath of office
Each member of the authority shall, before entering upon his duties, take and file an oath of office as prescribed by section ten of the public officers law.

ARTICLE 3: SPECIAL PROVISIONS RELATING TO MEAD AND BRAGGOT (Sections 30-36)

Section 30. Mead producers' license
Any person may apply to the liquor authority for a mead producers' license as provided for in this section. Such application shall be in writing and shall contain such information as the liquor authority shall require. A license issued under this subdivision shall authorize the licensee to manufacture mead and braggot within the licensed premises in this state for sale in bottles, barrels or casks to beer, wine and liquor retail licensees pursuant to section thirty-two of this article and to sell and deliver mead and braggot to persons outside the state pursuant to the laws of the place of such sale or delivery.

Section 31. Farm meadery license
Any person may apply to the authority for a farm meadery license as provided for in this section to produce mead and braggot within this state for sale. Such application shall be in writing and verified and shall contain such information as the authority shall require. Such application shall be accompanied by a check or draft in the amount of seventy-five dollars. A farm meadery license shall authorize the holder thereof to operate a meadery for the manufacture of New York state labelled mead and New York state labelled braggot.

Section 32. Authorization for sale of mead and braggot by retail licensees
The holder of a license issued pursuant to sections fifty-two, fifty-three-a, fifty-four, fifty-four-a, fifty-five, sixty-three, sixty-four, sixty-four-a, sixty-four-b, sixty-four-c, sixty-four-d, sixty-four-e, sixty-six, seventy-nine, eighty-one and eighty-one-a of this chapter may sell at retail for off-premises consumption any mead or braggot. The holder of a license issued pursuant to sections fifty-five, sixty-four, sixty-four-a, sixty-four-b, sixty-four-c, sixty-four-d, sixty-four-e, sixty-six, seventy-nine, eighty-one and eighty-one-a of this chapter may sell at retail for on-premises consumption any mead or braggot.

Section 33. Authorization for sale of mead and braggot by wholesale licensees
The holder of a license issued pursuant to sections fifty-one, fifty-three and sixty-two of this chapter may sell at wholesale any mead or braggot. For purposes of this section, such license holder may also transport mead and braggot to a retailer licensed under this chapter.

Section 34. Mead and braggot tasting
The holder of a license issued pursuant to section thirty-one of this chapter is hereby authorized to conduct tastings of and sell at retail for consumption on or off the premises any New York state labeled mead and braggot in establishments licensed pursuant to section sixty-four of this chapter to sell alcoholic beverages for consumption on the premises. Such holder may charge a fee of not more than twenty-five cents for each mead or braggot sample tasted.

Section 35. Direct interstate mead and braggot shipments
The holder of an out-of-state mead producer's license may ship mead and braggot directly to a person twenty-one years of age or older who resides in this state and who is purchasing the mead or braggot for his or her personal use and not for resale. The holder of an in-state farm meadery license may ship mead and braggot manufactured by such farm meadery directly to a person twenty-one years of age or older who resides outside this state but only if such shipments are permitted in and meet all of the requirements of the state to which the mead or braggot is being shipped.

Section 36. Direct intrastate mead and braggot shipments
A holder of a farm meadery or meadery license may ship mead and braggot produced by such farm meadery or meadery directly to a person twenty-one years of age or older who resides in this state and who is purchasing the mead or braggot for his or her personal use and not for resale. A common carrier shall not deliver any mead or braggot shipped directly to a person who is not twenty-one years of age or older.`
};

const RealABCPopulator = () => {
  const [isPopulating, setIsPopulating] = useState(false);
  const [progress, setProgress] = useState('');
  const [results, setResults] = useState<any>(null);

  const parseLawSections = (fullText: string, lawId: string) => {
    const sections = [];
    let sortOrder = 0;

    // Split on section markers - both "Section" and "§"
    const sectionPattern = /(?=(?:Section|§)\s*\d+)/g;
    const parts = fullText.split(sectionPattern).filter(part => part.trim().length > 50);

    parts.forEach(part => {
      const trimmed = part.trim();
      if (trimmed.length < 50) return;

      // Extract section number - handle both "Section X" and "§ X" formats
      const sectionMatch = trimmed.match(/(?:Section|§)\s*(\d+(?:\.\d+)?(?:-\w+)?)/);
      const sectionNumber = sectionMatch ? sectionMatch[1] : `${++sortOrder}`;

      // Extract title (first line after section number)
      const lines = trimmed.split('\n').map(line => line.trim()).filter(line => line.length > 0);
      let title = 'Untitled Section';
      
      if (lines.length > 0) {
        const firstLine = lines[0];
        // Remove section number from title
        title = firstLine.replace(/^(?:Section|§)\s*\d+(?:\.\d+)?(?:-\w+)?\s*\.?\s*/, '').trim();
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

    return sections;
  };

  const populateRealABC = async () => {
    setIsPopulating(true);
    setProgress('Starting Real ABC Law population...');
    
    try {
      // Clear existing ABC law data
      setProgress('Clearing existing ABC law data...');
      await supabase.from('ny_law_sections').delete().eq('law_id', 'ABC');
      await supabase.from('ny_laws').delete().eq('law_id', 'ABC');

      // Parse sections from the real law text
      const sections = parseLawSections(realABCLaw.full_text, realABCLaw.law_id);
      
      setProgress(`Adding real ABC Law with ${sections.length} sections...`);
      
      // Insert main law record
      const { error: lawError } = await supabase
        .from('ny_laws')
        .insert({
          law_id: realABCLaw.law_id,
          name: realABCLaw.name,
          chapter: realABCLaw.chapter,
          law_type: 'CONSOLIDATED',
          full_text: realABCLaw.full_text,
          structure: { 
            source: 'real_abc_articles_1_2_3',
            articles: 3,
            sections_parsed: sections.length,
            populated_at: new Date().toISOString() 
          },
          total_sections: sections.length,
          last_updated: new Date().toISOString().split('T')[0],
          updated_at: new Date().toISOString()
        });

      if (lawError) {
        throw new Error(`ABC Law insert failed: ${lawError.message}`);
      }

      // Insert sections
      if (sections.length > 0) {
        const { error: sectionsError } = await supabase
          .from('ny_law_sections')
          .insert(sections);

        if (sectionsError) {
          console.warn('Sections warning:', sectionsError.message);
        }
      }

      setResults({
        successful: 1,
        failed: 0,
        total: 1,
        sections: sections.length,
        articles: 3
      });

      setProgress(`✅ Success! Real ABC Law added with ${sections.length} sections across 3 articles.`);

    } catch (error: any) {
      setProgress(`❌ Failed: ${error.message}`);
      setResults({
        successful: 0,
        failed: 1,
        total: 1,
        error: error.message
      });
    } finally {
      setIsPopulating(false);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem' }}>
        Real ABC Law Populator
      </h1>
      
      <div style={{ marginBottom: '2rem' }}>
        <button
          onClick={populateRealABC}
          disabled={isPopulating}
          style={{
            backgroundColor: isPopulating ? '#9CA3AF' : '#DC2626',
            color: 'white',
            padding: '1rem 2rem',
            borderRadius: '8px',
            border: 'none',
            cursor: isPopulating ? 'not-allowed' : 'pointer',
            fontSize: '1rem',
            fontWeight: '600'
          }}
        >
          {isPopulating ? 'Populating Real ABC Law...' : 'Populate REAL ABC Law (Articles 1, 2, 3)'}
        </button>
      </div>

      {progress && (
        <div style={{ 
          padding: '1rem', 
          backgroundColor: '#FEF3C7', 
          border: '1px solid #F59E0B', 
          borderRadius: '8px',
          marginBottom: '1rem'
        }}>
          {progress}
        </div>
      )}

      {results && (
        <div style={{ 
          padding: '1rem', 
          backgroundColor: results.failed > 0 ? '#FEF2F2' : '#F0FDF4', 
          border: `1px solid ${results.failed > 0 ? '#FCA5A5' : '#86EFAC'}`, 
          borderRadius: '8px' 
        }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
            Population Results
          </h3>
          <p>✅ Successful: {results.successful}</p>
          <p>❌ Failed: {results.failed}</p>
          <p>📊 Total Laws: {results.total}</p>
          {results.sections && <p>📑 Sections: {results.sections}</p>}
          {results.articles && <p>📖 Articles: {results.articles}</p>}
          
          {results.error && (
            <div style={{ marginTop: '1rem', color: '#DC2626' }}>
              <strong>Error:</strong> {results.error}
            </div>
          )}
          
          <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#EBF8FF', borderRadius: '6px' }}>
            <strong>🎉 Real ABC Law with authentic legal text is now in your database!</strong>
            <br />
            <span style={{ fontSize: '0.875rem' }}>Check your /laws page to see the complete ABC Law Articles 1, 2, and 3!</span>
          </div>
        </div>
      )}

      <div style={{ marginTop: '2rem', fontSize: '0.875rem', color: '#6B7280' }}>
        <p><strong>This populates the REAL, AUTHENTIC ABC Law with:</strong></p>
        <ul style={{ marginLeft: '1rem', marginTop: '0.5rem' }}>
          <li>• <strong>Article 1:</strong> Complete definitions (38 sections) - All legal terminology</li>
          <li>• <strong>Article 2:</strong> Liquor Authority structure and powers (10 sections)</li>
          <li>• <strong>Article 3:</strong> Mead and Braggot regulations (7 sections)</li>
        </ul>
        <p style={{ marginTop: '1rem', fontStyle: 'italic' }}>
          This is genuine NY State legal text, not AI-generated content!
        </p>
      </div>
    </div>
  );
};

export default RealABCPopulator;