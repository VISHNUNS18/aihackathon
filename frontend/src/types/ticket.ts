export interface Ticket {
  id: number;
  subject: string;
  description: string;
  status: 'open' | 'pending' | 'solved' | 'closed';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  tags: string[];
  channel: string;
  created_at: string;
  updated_at: string;
  product: 'cookieyes' | 'product-b';
  requester_id: number;
  assignee_id: number | null;
  organization_id: number | null;
}

export interface Requester {
  id: number;
  name: string;
  email: string;
  tickets_count: number;
  organization: string;
  created_at: string;
}

export interface ConversationMessage {
  id: number;
  index: number;
  is_agent: boolean;
  author_name: string;
  author_id: number;
  body: string;
  plain_body: string;
  created_at: string;
  attachments: Attachment[];
  via: { channel: string };
}

export interface Attachment {
  id: number;
  file_name: string;
  content_url: string;
  content_type: string;
  size: number;
}

export interface TicketBundle {
  ticket: Ticket;
  requester: Requester;
  assignee: Requester | null;
  conversation: ConversationMessage[];
}
