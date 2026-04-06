export interface Agent {
  id: string;
  name: string;
  email: string;
  product: 'cookieyes' | 'product-b';
  role: 'agent' | 'lead' | 'admin';
  token?: string;
}
