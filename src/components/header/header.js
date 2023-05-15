let htmCache;

class SiteHeader extends HTMLElement {

	constructor() {
		super();
	}

	connectedCallback() {
		const shadowRoot = this.attachShadow({ mode: 'open' });
		shadowRoot.innerHTML = htmCache;
	}
}

fetch(`${import.meta.url}/../header.htm`)
	.then(r => r.text())
	.then(t => {
		htmCache = t;
		customElements.define('site-header', SiteHeader);
	});
