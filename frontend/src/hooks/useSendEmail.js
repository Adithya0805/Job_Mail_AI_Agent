import { useState } from 'react';
import { sendEmail as apiSendEmail } from '../services/api';

export function useSendEmail() {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [messageId, setMessageId] = useState(null);

  const send = async (emailData) => {
    setSending(true);
    setError('');
    
    try {
      const result = await apiSendEmail(emailData);
      setSent(true);
      setMessageId(result.message_id);
      return result;
    } catch (err) {
      setError(err.message || 'Failed to send email');
      throw err;
    } finally {
      setSending(false);
    }
  };

  return { send, sending, sent, error, messageId };
}
