import { useState } from 'react';
import api from '@/lib/api';
import { useTicketQueueStore } from '@/store/ticketQueueStore';
import type { JiraIssue } from '@/types/jira';

export function useJira() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const raiseIssue = async (payload: {
    ticketId: string;
    domain: string;
    summary: string;
    description: string;
  }): Promise<JiraIssue | null> => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post('/api/jira/issue', payload);
      // Store jira result on the specific ticket
      const activeId = useTicketQueueStore.getState().activeTicketId;
      if (activeId) {
        useTicketQueueStore.getState().updateTicket(activeId, { jira: data });
      }
      return data;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Jira error';
      setError(msg);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { raiseIssue, loading, error };
}
