import { DynamicSitePage } from '../components/layout/dynamic-site/DynamicSitePage';
import { Home } from '../pages/home';

export interface PagesInterface { 
  id: string; 
  element: JSX.Element; 
  path: string;
}

export const PAGES: PagesInterface[] = [
  {
    id: 'home',
    element: <Home />,
    path: '/'
  },
  {
    id: 'youtube',
    element: <DynamicSitePage siteId="youtube" />,
    path: '/site/youtube'
  },
  {
    id: 'github',
    element: <DynamicSitePage siteId="github" />,
    path: '/site/github'
  },
  {
    id: 'instagram',
    element: <DynamicSitePage siteId="instagram" />,
    path: '/site/instagram'
  },
  {
    id: 'whatsapp',
    element: <DynamicSitePage siteId="whatsapp" />,
    path: '/site/whatsapp'
  },
  {
    id: 'linkedin',
    element: <DynamicSitePage siteId="linkedin" />,
    path: '/site/linkedin'
  }
];

