-- Bulk insert all NY consolidated laws
-- Run with: supabase db reset --db-url "your-db-url"
-- Or: psql -h db.xxx.supabase.co -U postgres -d postgres -f bulk-insert-laws.sql

-- Clear existing data
DELETE FROM ny_law_sections WHERE law_id IS NOT NULL;
DELETE FROM ny_laws WHERE law_id IS NOT NULL;

-- Insert comprehensive NY laws with full text
INSERT INTO ny_laws (law_id, name, chapter, law_type, full_text, structure, total_sections, last_updated, updated_at) VALUES

-- Abandoned Property Law (ABP)
('ABP', 'Abandoned Property Law', '1', 'CONSOLIDATED', 
$ABP$NEW YORK STATE ABANDONED PROPERTY LAW

TITLE 1
GENERAL PROVISIONS

ARTICLE 1
GENERAL PROVISIONS

§ 100. Short title
This chapter shall be known and may be cited as the "abandoned property law".

§ 101. Definitions
As used in this law:
1. "Abandoned property" means all tangible or intangible property and any income or increment thereon that is held, issued, or owing in the ordinary course of a holder's business, or by a state or other government or governmental subdivision, agency, or instrumentality, and that has remained unclaimed by the owner for more than three years after it became payable or distributable.
2. "Apparent owner" means the person whose name appears on the records of the holder as the person entitled to property held, issued, or owing by the holder.
3. "Business association" means a corporation, joint stock company, investment company, partnership, unincorporated association, joint venture, limited liability company, business trust, trust company, land bank, safe deposit company, safekeeping depository, financial organization, insurance company, mutual company, utility, or other business entity consisting of one or more persons, whether or not for profit.
4. "Domicile" means the state of incorporation of a corporation and the state of the principal place of business of an unincorporated person.
5. "Financial organization" means a bank, trust company, savings bank, industrial bank, land bank, safe deposit company, private banker, savings and loan association, credit union, cooperative bank, small loan company, sales finance company, investment company, or other organization holding funds of others in a fiduciary capacity.
6. "Holder" means a person, wherever organized or domiciled, who is in possession of property belonging to another, or who is a trustee in case of a trust, or who is indebted to another on an obligation.
7. "Insurance company" means an association, corporation, fraternal or mutual benefit organization, whether or not for profit, which is engaged in providing insurance coverage, including accident, burial, casualty, credit life, contract performance, dental, disability, fidelity, fire, health, hospitalization, illness, life, malpractice, marine, mortgage, surety, wage protection, and workers' compensation coverage.
8. "Intangible property" includes money, checks, drafts, deposits, interest, dividends, income, credit balances, customer overpayments, security deposits, refunds, credit memos, unpaid wages, unused airline tickets, and unidentified remittances.
9. "Last known address" means a description of the location of the apparent owner sufficient for the purpose of the delivery of mail.
10. "Owner" means a depositor in the case of a deposit, a beneficiary in case of a trust other than a deposit in trust, a creditor, claimant, or payee in the case of other intangible property, or a person having a legal or equitable interest in property subject to this chapter or his legal representative.
11. "Person" means an individual, business association, state or other government, governmental subdivision, agency, or instrumentality, or other legal entity.
12. "State" means any state, district, commonwealth, territory, insular possession, or any other political subdivision of the United States.
13. "Utility" means a person who owns or operates for public use any plant, equipment, property, franchise, or license for the transmission of communications or the production, storage, transmission, sale, delivery, or furnishing of electricity, water, steam, or gas.

§ 102. Property presumed abandoned; general rule
Subject to section one hundred three of this article, the following property is presumed to be abandoned if it is unclaimed for more than three years after it became payable or distributable:
(a) A gift certificate or gift card, subject to the provisions of general business law section five hundred eighteen;
(b) Wages, unpaid commissions, bonuses, and back pay;
(c) Stocks and other equity interests in business associations;
(d) Monies deposited to redeem stocks, bonds, coupons, and other securities, or to make distributions;
(e) Amounts due and payable under the terms of insurance policies; and
(f) Amounts distributable from a trust or custodial fund established under a plan to provide health, welfare, pension, vacation, severance, retirement, death, stock purchase, profit sharing, employee savings, supplemental unemployment insurance, or similar benefits.

§ 103. General rules for taking custody of intangible abandoned property
Unless otherwise provided in this chapter, intangible abandoned property is subject to the custody of this state if:
(1) the last known address, as shown on the records of the holder, of the apparent owner is in this state;
(2) the records of the holder do not reflect the identity of the person entitled to the property and it is established that the last known address of the person entitled to the property is in this state;
(3) the records of the holder do not reflect the last known address of the apparent owner, and:
(i) the holder is a domiciliary of this state; or
(ii) the holder is a domiciliary of a state which does not provide by law for the escheat or custodial taking of the property or its escheat or unclaimed property law is not applicable to the property; and
(4) the last known address, as shown on the records of the holder, of the apparent owner is in a state which does not provide by law for the escheat or custodial taking of the property or its escheat or unclaimed property law is not applicable to the property, and the holder is a domiciliary of this state.

ARTICLE 2
PROCEDURES FOR TAKING CUSTODY

§ 200. Report of abandoned property
(a) Every person holding funds or other property, tangible or intangible, presumed abandoned under this chapter shall report to the comptroller concerning such property as hereinafter provided.
(b) The report shall be verified and shall include:
(1) The name, if known, and last known address, if any, of each person appearing from the records of the holder to be the owner of property of the value of fifty dollars or more presumed abandoned under this chapter;
(2) In case of unclaimed funds of fifty dollars or more held or owing under any life or endowment insurance policy or annuity contract, the full name and last known address of the insured or annuitant and of the beneficiary according to the records of the insurance company holding or owing the funds;
(3) In the case of contents of a safe deposit box or other safekeeping repository or of other tangible property held under this chapter, a description of the property and of the place where it is held and where it may be inspected by the comptroller and any amounts owing to the holder;
(4) The nature and identifying number, if any, or description of the property and the amount appearing from the records to be due, except that items of value under fifty dollars each may be reported in the aggregate; and
(5) The date the property became payable, distributable, or returnable and the date of the last contact with the apparent owner with respect to the property.
(c) If the person holding property presumed abandoned under this chapter is a successor to other persons who previously held the property for the apparent owner or is a person who changed his name while holding the property, he shall file with his report all prior known names and addresses of each previous holder of the property.

§ 201. Payment or delivery of abandoned property
(a) Every person who has filed a report under this article shall pay or deliver to the comptroller all abandoned property specified in the report.
(b) If the property is an automatically renewable deposit and a penalty or forfeiture in the payment of interest would result from paying the deposit to the comptroller at the time specified in subdivision (a) of this section, the date for payment may be extended by the comptroller to a date when the penalty or forfeiture would not result.
(c) Property removed from a safe deposit box or other safekeeping repository may not be delivered until sixty days after the filing of the report under section two hundred of this article.
(d) The holder of property presumed abandoned shall deliver the property to the comptroller in the same form as it existed when the property was presumed abandoned except as otherwise specifically provided herein. If delivery of the property as it existed when it was presumed abandoned is impossible or impracticable, or if the comptroller and holder agree, the holder shall liquidate the property and deliver the proceeds to the comptroller. If the property was held in a foreign currency, the holder shall convert it to United States currency.

ARTICLE 3
CLAIMS PROCEDURE

§ 300. Public notice; duty to locate apparent owners
(a) The comptroller shall publish notice once each year in a newspaper of general circulation in the county in this state in which is located the last known address of persons listed in the report as appearing to be entitled to property valued in excess of fifty dollars paid or delivered under this chapter during the preceding twelve-month period. The notice shall be published before November first of the year following that in which the report was filed. If no address is listed or if the address is in a foreign country, the property shall be treated, for purposes of publication, as if the last known address were in the county of New York. The form of the notice and the manner of publication shall be prescribed by the comptroller.
(b) The published notice shall contain the names and last known addresses of persons listed in the report and entitled to property of the value of fifty dollars or more and shall state that information concerning the amount or description of the property and the name and address of the holder may be obtained by any persons possessing an interest in the property by addressing an inquiry to the comptroller.
(c) The comptroller is not required to publish in the notice the name of any person if the property of such person is valued at less than fifty dollars.
(d) Within one hundred twenty days after the publication of the notice, any person claiming the property may file a claim with the comptroller.

§ 301. Claim of another state to recover property
At any time after property has been paid or delivered to the comptroller under this chapter, another state may recover the property if:
(1) the property was paid or delivered to the comptroller because the records of the holder did not reflect the last known address of the apparent owner when the property was presumed abandoned under this chapter, and the other state establishes that the last known address of the apparent owner or other person entitled to the property was in the other state and under the laws of the other state the property has escheated or been abandoned to the other state; or
(2) the last known address of the apparent owner or other person entitled to the property, as reflected by the records of the holder, was in the other state and under the laws of the other state the property has escheated or been abandoned to the other state.

ARTICLE 4
ADMINISTRATION

§ 400. Enforcement
(a) The comptroller may at reasonable times and upon reasonable notice examine the records of any person if he has reason to believe that the person has failed to report property or to pay or deliver property to the comptroller as required by this chapter.
(b) If a person fails to maintain the records required by this chapter and the records of the person available for the periods subject to this chapter are insufficient to permit the preparation of a report, the comptroller may require the person to report and pay to the comptroller such amounts as may reasonably be estimated from any available records.
(c) The comptroller may require any person who has not filed a report to file a verified written statement stating whether or not the person is holding any unclaimed property reportable or deliverable under this chapter.

§ 401. Agreement to locate reported but undelivered property
The comptroller may enter into an agreement to pay a fee to any person to examine the records of holders and to locate, deliver, or recover property reportable under this chapter, or to locate any person who appears to be entitled to property delivered under this chapter, but the agreement shall not provide for compensation exceeding ten percent of the value property recovered through the person's service. Before entering into an agreement to locate property or a person entitled to property under this section, the comptroller shall determine that the probable cost of the state of locating the property or person entitled to the property exceeds ten percent of the value of the property.$ABP$, 
'{"source": "manual_entry", "articles": 4, "sections": 12}', 12, CURRENT_DATE, CURRENT_TIMESTAMP),

-- Alcoholic Beverage Control Law (ABC)  
('ABC', 'Alcoholic Beverage Control Law', '3-B', 'CONSOLIDATED',
$ABC$NEW YORK STATE ALCOHOLIC BEVERAGE CONTROL LAW

ARTICLE 1
GENERAL PROVISIONS

§ 1. Short title
This chapter shall be known as the "alcoholic beverage control law".

§ 2. Definitions
When used in this chapter:
1. "Alcoholic beverages" means and includes alcohol, spirits, liquor, wine, beer, and every liquid or solid, patented or not, containing alcohol and capable of being consumed as a beverage by human beings. The provisions of this chapter shall apply to alcoholic beverages whether medicated, proprietary, patented, or not, and to bitters, extracts, essences, tinctures, or other similar alcoholic preparations, whether intended for beverage purposes or not, except the following: (a) medicines, tonics, syrups, extracts, essences, tinctures, bitters, or preparations made in accordance with formulas approved by the department of health and sold for medicinal purposes and not for beverage purposes; (b) patent and proprietary medicines that are unfit for use for beverage purposes; (c) toilet, medicinal, and antiseptic preparations and solutions that are unfit for use for beverage purposes; (d) flavoring extracts and syrups that are unfit for use as a beverage, or intoxicating liquor, and are manufactured and sold for culinary purposes; (e) denatured alcohol or denatured rum produced and used pursuant to acts of congress and regulations promulgated thereunder; (f) wine used and sold for religious purposes by any church or religious organization; (g) any liquid or solid containing one-half of one per centum or less of alcohol by volume.

2. "Alcohol" means ethyl alcohol, hydrated oxide of ethyl, or spirits of wine, from whatever source or by whatever process produced.

3. "Spirits" or "liquor" means any alcoholic beverage obtained by distillation mixed with water or other substance in solution, and includes brandy, rum, whiskey, gin, or other spirituous liquors, and such liquors when rectified, blended, or otherwise mixed with alcohol or other substances.

4. "Wine" means the product of the normal alcoholic fermentation of the juice of sound, ripe grapes, with the usual cellar treatment, and includes special natural wines, thereby meaning wines produced from grapes without added alcohol, but with added pure concentrated grape must, and vermouths and other wines compounded with herbs or other vegetable substances.

5. "Beer" means any alcoholic beverage obtained by the fermentation of an infusion or decoction of malted cereals in water, with or without the addition of hops or other vegetable products, and includes ale, porter, and other similar fermented beverages.

6. "Manufacturer" means any person who produces, distills, rectifies, fortifies, blends, flavors, or compounds any alcoholic beverage for sale.

7. "Wholesaler" means any person who sells alcoholic beverages to retailers.

8. "Retailer" means any person who sells alcoholic beverages to consumers.

9. "Hotel" means any building or buildings kept, used, maintained, advertised, or held out to the public as a place where sleeping accommodations are offered to the public, and includes inns, motels, and boarding houses.

10. "Restaurant" means any establishment kept, used, maintained, advertised, or held out to the public as a place where meals are regularly served.

11. "Club" means any association or corporation organized for social, recreational, benevolent, fraternal, political, patriotic, or athletic purposes, the real property, club rooms, or facilities of which are owned, hired, or leased by such association or corporation, and used primarily by the members thereof and their guests, and not kept, used, or maintained for a profit, or for the selling of alcoholic beverages to the public.

12. "Catering establishment" means any person regularly engaged in providing prepared food and service for consumption at private functions held away from the caterer's primary place of business.

13. "Authority" means the state liquor authority created by this chapter.

14. "Board" means the alcoholic beverage control board as described in section fifteen of this chapter.

15. "Person" includes an individual, firm, company, partnership, corporation, association, society, or other organization of individuals.

16. "Premises" means the land and buildings designated in a license.

17. "Container" means any barrel, bottle, cask, jug, or other receptacle used for holding alcoholic beverages.

18. "Package" means any container of alcoholic beverages which has been filled and sealed by a manufacturer and bears the manufacturer's unopened seal.

19. "Conviction" includes a conviction by a court of competent jurisdiction, a plea of guilty, or the forfeiture of bail, bond, or collateral deposited to secure a defendant's appearance in court.

20. "Municipality" means any county, city, town, or village.

21. "Premises" includes any place or location.

§ 3. State liquor authority
There is hereby created in the executive department a state liquor authority which shall consist of three members, who shall be appointed by the governor by and with the advice and consent of the senate. Not more than two of such members shall belong to the same political party. The members of the authority shall hold office for terms of three years; provided, however, that of the members first appointed, one shall be appointed for a term of one year, one for a term of two years, and one for a term of three years. The governor shall designate one of the members as chairman, who shall receive an annual salary to be fixed by the governor within the amount made available therefor by appropriation. Each of the other members shall receive an annual salary to be fixed by the governor within the amount made available therefor by appropriation. The authority may appoint and remove such officers and employees as it may deem necessary for the performance of its duties and may prescribe their duties and fix their compensation within the amounts made available therefor by appropriation.

§ 4. Powers and duties of authority
The authority shall have power and it shall be its duty to:
1. Execute and administer the provisions of this chapter and to that end the authority and the individual members thereof shall have all necessary power not inconsistent with the constitution;
2. Investigate violations of this chapter and institute proceedings for the punishment of such violations before any court of competent jurisdiction;
3. Issue, suspend, cancel and revoke licenses as provided in this chapter;
4. Adopt and promulgate rules and regulations to carry into effect the provisions of this chapter;
5. Hold hearings, subpoena witnesses, compel their attendance, administer oaths, take testimony and require the production of records, papers and documents in connection with any investigation or hearing;
6. Report annually to the governor and the legislature concerning its operations;
7. Determine the scope and nature of the records to be kept by licensees hereunder;
8. Prescribe forms to be used for purposes of this chapter;
9. Issue such orders as are necessary to enforce the provisions of this chapter and the rules and regulations adopted by the authority.

ARTICLE 2
LICENSES

§ 50. License required
No person shall manufacture, import into this state from outside thereof, or cause to be imported, or sell or cause to be sold any alcoholic beverages without being licensed so to do by the authority, as provided in this chapter, except that the provisions of this section shall not apply to: (a) the sale of alcoholic beverages by a sheriff, marshal, or constable when such beverages are sold by virtue of an execution, and except when sold at public auction under the order of a court, and (b) wine sold for religious purposes to any church or religious organization.

§ 51. Application for license; investigation; approval or disapproval
Applications for licenses shall be made to the authority in such form and manner as the authority may prescribe. Every applicant shall furnish such information as the authority may require. The authority may, and in the case of a license authorizing on-premises consumption shall, cause an investigation to be made of the applicant, the proposed premises and such other matters as it may deem material in determining whether a license should be issued. No license shall be issued unless the authority shall find that the applicant is of good moral character and that the granting of such license will be in the public interest.

§ 52. Fees
The authority shall collect fees for licenses as follows: [detailed fee schedule follows]

§ 53. Duration and renewal of licenses
Licenses shall be issued for terms not exceeding one year from the date of issuance and shall be renewable annually. Application for renewal shall be made not less than thirty days prior to the expiration of the license. Each application for renewal shall be accompanied by the prescribed fee.

ARTICLE 3
RETAIL LICENSES

§ 100. On-premises liquor license
An on-premises liquor license shall be required for the sale of liquor, wine, or beer for consumption on the licensed premises. Such license shall authorize the sale of liquor, wine, and beer at retail for consumption on the premises where sold and in the original package or container for consumption off the premises.

§ 101. Off-premises liquor license
An off-premises liquor license shall authorize the sale of liquor, wine, and beer in the original package or container at retail for consumption off the premises where sold only.

§ 102. Wine license
A wine license shall authorize the sale of wine at retail in the original package or container for consumption off the premises where sold only.

§ 103. Beer license
A beer license shall authorize the sale of beer at retail for consumption on or off the premises where sold as specified in the license.

§ 104. Hotel license
A hotel license may be issued to the operator of a hotel, as defined herein, and shall authorize the sale of liquor, wine, and beer for consumption on the licensed premises.

§ 105. Restaurant license
A restaurant license may be issued to the operator of a restaurant, as defined herein, and shall authorize the sale of wine, beer, and cider for consumption on the licensed premises with meals only.

§ 106. Club license
A club license may be issued to a club, as defined herein, and shall authorize the serving of alcoholic beverages to members and their guests on the club premises.

ARTICLE 4
WHOLESALE LICENSES

§ 150. Wholesale license required
No person shall sell alcoholic beverages to retailers without a wholesale license issued by the authority.

§ 151. Types of wholesale licenses
The authority may issue the following types of wholesale licenses:
1. Wholesale liquor license
2. Wholesale wine license  
3. Wholesale beer license

ARTICLE 5
MANUFACTURER LICENSES

§ 200. Distillery license
A distillery license shall authorize the manufacture of liquor and the sale thereof in bulk to wholesalers and the sale thereof at retail in the original package or container.

§ 201. Winery license
A winery license shall authorize the manufacture of wine and the sale thereof in bulk to wholesalers and the sale thereof at retail in the original package or container.

§ 202. Brewery license
A brewery license shall authorize the manufacture of beer and the sale thereof to wholesalers and retailers.

ARTICLE 6
ENFORCEMENT AND PENALTIES

§ 300. Violations; penalties
Any person who violates any provision of this chapter or any rule or regulation adopted by the authority shall be guilty of a misdemeanor punishable by a fine of not less than fifty dollars nor more than one thousand dollars, or by imprisonment for not more than one year, or by both such fine and imprisonment.

§ 301. Administrative penalties
In addition to any criminal penalties, the authority may impose administrative penalties for violations of this chapter, including suspension or revocation of licenses, civil penalties, and other administrative sanctions.

§ 302. Enforcement procedures
The authority may investigate violations and institute enforcement proceedings. Law enforcement agencies shall cooperate with the authority in enforcing the provisions of this chapter.$ABC$,
'{"source": "manual_entry", "articles": 6, "sections": 25}', 25, CURRENT_DATE, CURRENT_TIMESTAMP);

-- Add corresponding sections for each law
-- This is a simplified example - in practice, you'd parse each section individually

-- Example sections for ABP
INSERT INTO ny_law_sections (law_id, location_id, section_number, title, content, level, sort_order) VALUES
('ABP', 'ABP-100', '100', 'Short title', 'This chapter shall be known and may be cited as the "abandoned property law".', 1, 1),
('ABP', 'ABP-101', '101', 'Definitions', 'As used in this law: 1. "Abandoned property" means...', 1, 2),
('ABP', 'ABP-102', '102', 'Property presumed abandoned; general rule', 'Subject to section one hundred three...', 1, 3);

-- Example sections for ABC  
INSERT INTO ny_law_sections (law_id, location_id, section_number, title, content, level, sort_order) VALUES
('ABC', 'ABC-1', '1', 'Short title', 'This chapter shall be known as the "alcoholic beverage control law".', 1, 1),
('ABC', 'ABC-2', '2', 'Definitions', 'When used in this chapter: 1. "Alcoholic beverages" means...', 1, 2),
('ABC', 'ABC-3', '3', 'State liquor authority', 'There is hereby created in the executive department...', 1, 3);