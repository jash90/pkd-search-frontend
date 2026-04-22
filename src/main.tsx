import { ViteReactSSG } from 'vite-react-ssg';
import axios from 'axios';
import { routes } from './routes';
import './index.css';

declare global {
  interface Window {
    _abortController: AbortController | null;
  }
}

axios.defaults.headers.common['X-BFCache-Support'] = 'true';

export const createRoot = ViteReactSSG({ routes });
