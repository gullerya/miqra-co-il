import 'https://libs.gullerya.com/data-tier-list/2.2.1/data-tier-list.min.js';
import '../verse/verse.js';

let htmCache;

class Paragraph extends HTMLElement {

	constructor() {
		super();
	}

	connectedCallback() {
		const shadowRoot = this.attachShadow({ mode: 'open' });
		shadowRoot.innerHTML = htmCache;
	}

	set data(data) {
		this.shadowRoot.querySelector('#verses').innerHTML = JSON.stringify(data);
	}
}

fetch(`${import.meta.url}/../paragraph.htm`)
	.then(r => r.text())
	.then(t => {
		htmCache = t;
		customElements.define('miqra-paragraph', Paragraph);
	});
