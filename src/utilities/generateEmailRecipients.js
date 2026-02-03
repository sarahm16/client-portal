export const generateEmailRecipients = (recipients) => {
  return recipients.map((recipient) => ({
    emailAddress: {
      address: recipient,
    },
  }));
};
