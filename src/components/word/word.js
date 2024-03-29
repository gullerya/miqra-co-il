import 'https://libs.gullerya.com/data-tier-list/2.2.1/data-tier-list.js';
import '../monad/monad.js';

let htmCache;

class Word extends HTMLElement {

	constructor() {
		super();
	}

	connectedCallback() {
		const shadowRoot = this.attachShadow({ mode: 'open' });
		shadowRoot.innerHTML = htmCache;
	}

	set data(data) {
		this.shadowRoot.querySelector('.monads').items = data.m;
	}
}

fetch(`${import.meta.url}/../word.htm`)
	.then(r => r.text())
	.then(t => {
		htmCache = t;
		customElements.define('miqra-word', Word);
	});
