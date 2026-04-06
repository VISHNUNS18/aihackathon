import { useState } from 'react';
import api from '@/lib/api';
import { useWorkflowStore } from '@/store/workflowStore';
import type { JiraIssue } from '@/types/jira';

export function useJira() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setJira = useWorkflowStore((s) => s.setJira);

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
      setJira(data);
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
