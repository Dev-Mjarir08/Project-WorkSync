export const sendEmail = async ({ to, subject, html, text }) => {
  // In development, log email payload
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[Email Mock] To: ${to} | Subject: ${subject}`);
    return { success: true, messageId: `mock-${Date.now()}` };
  }
  return { success: true };
};

export default sendEmail;

