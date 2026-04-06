export interface ProductConfig {
  id: string;
  name: string;
  color: string;
  lightColor: string;
  zendeskGroupId: string;
  slackBugsChannel: string;
  jiraProjectKey: string;
  skills: number[];
  greeting: string;
  tagIdentifier: string;
}

export const PRODUCTS: Record<string, ProductConfig> = {
  cookieyes: {
    id: 'cookieyes',
    name: 'CookieYes',
    color: '#7F77DD',
    lightColor: '#eeecfb',
    zendeskGroupId: '',
    slackBugsChannel: '#cx-bugs',
    jiraProjectKey: 'CY',
    skills: [1, 2, 3, 4, 5, 6],
    greeting: 'Greetings from CookieYes!',
    tagIdentifier: 'cookieyes',
  },
  'product-b': {
    id: 'product-b',
    name: 'Product B',
    color: '#1D9E75',
    lightColor: '#ecfdf5',
    zendeskGroupId: '',
    slackBugsChannel: '#pb-bugs',
    jiraProjectKey: 'PB',
    skills: [1, 2, 3, 6],
    greeting: 'Greetings from Product B!',
    tagIdentifier: 'product-b',
  },
};

export function detectProduct(tags: string[]): string {
  if (tags.includes('product-b')) return 'product-b';
  return 'cookieyes';
}
