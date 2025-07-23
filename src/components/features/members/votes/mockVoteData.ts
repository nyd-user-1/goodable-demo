// Enhanced mock vote data with 100+ entries for pagination testing
export const mockVoteData = [
  {
    id: 1,
    bill_number: "S08298",
    vote_type: "Yes",
    vote_date: "2025-01-05",
    description: "Clarifies the definition of business records and the use of such records in grand jury proceedings.",
    bill_id: 1001,
    sponsor: "Senator John Smith",
    co_sponsors: ["Senator Jane Doe", "Senator Bob Johnson"],
    committee: "Judiciary Committee",
    bill_text: "An act to amend the criminal procedure law in relation to business records and grand jury proceedings",
    status: "Passed Senate"
  },
  {
    id: 2,
    bill_number: "A05254",
    vote_type: "No", 
    vote_date: "2025-01-04",
    description: "Enacts the 'New York open water data act'",
    bill_id: 1002,
    sponsor: "Assemblymember Sarah Wilson",
    co_sponsors: ["Assemblymember Mike Davis"],
    committee: "Environmental Conservation Committee",
    bill_text: "An act to establish open data requirements for water quality information",
    status: "In Committee"
  },
  {
    id: 3,
    bill_number: "A06452",
    vote_type: "Absent",
    vote_date: "2025-01-03", 
    description: "Requires the superintendent of state police to study and report on hate crimes",
    bill_id: 1003,
    sponsor: "Assemblymember Lisa Rodriguez",
    co_sponsors: ["Assemblymember Tom Chen", "Assemblymember Amy Martinez"],
    committee: "Codes Committee",
    bill_text: "An act requiring comprehensive hate crime reporting and analysis",
    status: "Referred to Committee"
  },
  {
    id: 4,
    bill_number: "S07123",
    vote_type: "Yes",
    vote_date: "2025-01-02",
    description: "Establishes renewable energy standards for state buildings",
    bill_id: 1004,
    sponsor: "Senator Emily Green",
    co_sponsors: ["Senator Robert Brown"],
    committee: "Energy and Telecommunications Committee",
    bill_text: "An act establishing renewable energy requirements for government facilities",
    status: "Passed Senate"
  },
  {
    id: 5,
    bill_number: "A04789",
    vote_type: "No",
    vote_date: "2025-01-01",
    description: "Modifies regulations on small business tax incentives",
    bill_id: 1005,
    sponsor: "Assemblymember David Lee",
    co_sponsors: ["Assemblymember Karen White", "Assemblymember Joe Black"],
    committee: "Small Business Committee",
    bill_text: "An act to modify tax incentive programs for small businesses",
    status: "In Assembly"
  },
  // Additional 95 votes for pagination testing
  ...Array.from({ length: 95 }, (_, index) => {
    const id = index + 6;
    const billTypes = ["S", "A"];
    const voteTypes = ["Yes", "No", "Absent"];
    const sponsors = [
      "Senator Alice Johnson", "Assemblymember Robert Smith", "Senator Maria Garcia",
      "Assemblymember James Wilson", "Senator Patricia Davis", "Assemblymember Michael Brown"
    ];
    const committees = [
      "Judiciary Committee", "Finance Committee", "Health Committee", 
      "Education Committee", "Transportation Committee", "Agriculture Committee",
      "Environmental Conservation Committee", "Labor Committee", "Housing Committee"
    ];
    
    const billType = billTypes[Math.floor(Math.random() * billTypes.length)];
    const billNumber = `${billType}${String(Math.floor(Math.random() * 9000) + 1000).padStart(5, '0')}`;
    const voteType = voteTypes[Math.floor(Math.random() * voteTypes.length)];
    const sponsor = sponsors[Math.floor(Math.random() * sponsors.length)];
    const committee = committees[Math.floor(Math.random() * committees.length)];
    
    // Generate dates from the past year
    const baseDate = new Date(2024, 0, 1);
    const randomDays = Math.floor(Math.random() * 365);
    const voteDate = new Date(baseDate.getTime() + randomDays * 24 * 60 * 60 * 1000);
    
    const descriptions = [
      "Relates to criminal justice reform and sentencing guidelines",
      "Establishes new environmental protection standards",
      "Modifies healthcare coverage requirements",
      "Updates education funding formulas",
      "Addresses public transportation infrastructure",
      "Regulates digital privacy and data protection",
      "Implements tax relief for working families",
      "Strengthens consumer protection laws",
      "Enhances public safety measures",
      "Promotes affordable housing development",
      "Supports small business growth initiatives",
      "Improves mental health services access",
      "Modernizes voting and election procedures",
      "Expands renewable energy programs",
      "Protects workers' rights and benefits"
    ];
    
    const description = descriptions[Math.floor(Math.random() * descriptions.length)];
    
    return {
      id,
      bill_number: billNumber,
      vote_type: voteType,
      vote_date: voteDate.toISOString().split('T')[0],
      description,
      bill_id: 1000 + id,
      sponsor,
      co_sponsors: [sponsors[Math.floor(Math.random() * sponsors.length)]],
      committee,
      bill_text: `An act to implement ${description.toLowerCase()}`,
      status: Math.random() > 0.5 ? "In Committee" : "Passed"
    };
  })
];