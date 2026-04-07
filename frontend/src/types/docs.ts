export interface DocArticle {
  id: string;
  title: string;
  category: 'Getting Started' | 'Technical' | 'Billing' | 'Compliance' | 'Account' | 'Presales' | 'Features';
  tags: string[];
  content: string;
  url?: string;
}
