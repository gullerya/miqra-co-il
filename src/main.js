import './components/scroll/scroll.js';
import { loadParagraphById } from './services/data-service.js';

const p = await loadParagraphById(0);

document.querySelector('#scroll').data = [p];
