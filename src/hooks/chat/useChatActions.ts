import { EntityType } from './types';

export const useChatActions = (entity: any, entityType: EntityType) => {
  const handleShareChat = () => {
    // Implementation for sharing chat
  };

  const getTitle = () => {
    if (entityType === 'bill' && entity) {
      return `Bill: ${entity.bill_number}`;
    }
    if (entityType === 'member' && entity) {
      return `Member: ${entity.name}`;
    }
    if (entityType === 'committee' && entity) {
      return `Committee: ${entity.name}`;
    }
    return 'AI Chat';
  };

  return { handleShareChat, getTitle };
};