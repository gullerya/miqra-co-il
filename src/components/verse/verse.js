import 'https://libs.gullerya.com/data-tier-list/2.2.1/data-tier-list.min.js';
import '../word/word.js';

let htmCache;

class Verse extends HTMLElement {

	constructor() {
		super();
	}

	connectedCallback() {
		const shadowRoot = this.attachShadow({ mode: 'open' });
		shadowRoot.innerHTML = htmCache;
	}

	set data(data) {
		this.shadowRoot.querySelector('.words').items = data.w;
		//this.shadowRoot.innerHTML = JSON.stringify(data);
	}
}

fetch(`${import.meta.url}/../verse.htm`)
	.then(r => r.text())
	.then(t => {
		htmCache = t;
		customElements.define('miqra-verse', Verse);
	});
