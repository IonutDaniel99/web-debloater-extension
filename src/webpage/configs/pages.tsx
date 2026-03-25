import { YouTubePage } from '@/webpage/pages/youtube';
import { GitHubPage } from '@/webpage/pages/github';
import { InstagramPage } from '@/webpage/pages/instagram';
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
    element: <YouTubePage />,
    path: '/site/youtube'
  },
  {
    id: 'github',
    element: <GitHubPage />,
    path: '/site/github'
  },
  {
    id: 'instagram',
    element: <InstagramPage />,
    path: '/site/instagram'
  }
];

