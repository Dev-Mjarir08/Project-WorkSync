import { getUserItem, setUserItem } from '../../utils/userStorage.js';

export const getInvitations = () => {
  return getUserItem('admin_invitations', []);
};

export const saveInvitations = (invitations) => {
  setUserItem('admin_invitations', invitations);
};

export const mockInvitations = getInvitations();

export default {
  getInvitations,
  saveInvitations,
  mockInvitations
};
