import 'https://libs.gullerya.com/data-tier-list/2.2.1/data-tier-list.min.js';
import '../paragraph/paragraph.js';

let htmCache;

class Scroll extends HTMLElement {

	constructor() {
		super();
	}

	connectedCallback() {
		const shadowRoot = this.attachShadow({ mode: 'open' });
		shadowRoot.innerHTML = htmCache;
	}

	set data(data) {
		this.shadowRoot.querySelector('.paragraphs').items = data;
	}
}

fetch(`${import.meta.url}/../scroll.htm`)
	.then(r => r.text())
	.then(t => {
		htmCache = t;
		customElements.define('miqra-scroll', Scroll);
	});
