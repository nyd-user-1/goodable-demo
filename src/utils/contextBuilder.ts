
export class ContextBuilder {
  static generateDynamicPrompts(entity: any, entityType: 'bill' | 'member' | 'committee' | 'problem' | null): string[] {
    if (!entity || !entityType) {
      return [
        "What can you tell me about this?",
        "What are the key points?",
        "How does this work?",
        "What should I know?"
      ];
    }

    switch (entityType) {
      case 'problem':
        return [
          "Similar Problems",
          "Fiscal Analysis", 
          "Root Cause",
          "Likely Allies"
        ];

      case 'bill':
        return [
          "What does this bill do?",
          "Who are the sponsors?",
          "What's the current status?",
          "What are the key provisions?",
          "What's the fiscal impact?"
        ];

      case 'member':
        return [
          "What bills has this member sponsored?",
          "What committees are they on?",
          "What's their voting record?",
          "What district do they represent?",
          "What are their key issues?"
        ];

      case 'committee':
        return [
          "What bills is this committee considering?",
          "Who are the committee members?",
          "When do they meet?",
          "What's their jurisdiction?",
          "What's on their agenda?"
        ];

      default:
        return [
          "Tell me more about this",
          "What are the details?",
          "How does this work?",
          "What should I know?"
        ];
    }
  }

  static buildContextString(entity: any, entityType: string): string {
    if (!entity || !entityType) return '';

    switch (entityType) {
      case 'problem':
        return `Problem Context:
Title: ${entity.title || 'Untitled Problem'}
Original Statement: ${entity.originalStatement || entity.description || 'No description'}
ID: ${entity.id || 'Unknown'}`;

      case 'bill':
        return `Bill Context:
Bill Number: ${entity.bill_number || 'Unknown'}
Title: ${entity.title || 'No title'}
Status: ${entity.status_desc || 'Unknown status'}
Committee: ${entity.committee || 'No committee assigned'}
Last Action: ${entity.last_action || 'No recent action'}`;

      case 'member':
        return `Member Context:
Name: ${entity.name || 'Unknown'}
Party: ${entity.party || 'Unknown'}
District: ${entity.district || 'Unknown'}
Chamber: ${entity.chamber || 'Unknown'}
Role: ${entity.role || 'Unknown'}`;

      case 'committee':
        return `Committee Context:
Name: ${entity.name || entity.committee_name || 'Unknown'}
Chamber: ${entity.chamber || 'Unknown'}
Chair: ${entity.chair_name || 'Unknown'}
Description: ${entity.description || 'No description'}`;

      default:
        return '';
    }
  }
}
