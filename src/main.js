import './components/scroll/scroll.js';
import { loadParagraphs } from './services/data-service.js';

const ps = await loadParagraphs(0, 5);

document.querySelector('#scroll').data = ps;
