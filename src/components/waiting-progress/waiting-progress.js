let htmCache;

class WaitingProgress extends HTMLElement {

	constructor() {
		super();
		const shadowRoot = this.attachShadow({ mode: 'open' });
		shadowRoot.innerHTML = htmCache;
	}

	connectedCallback() {
	}
}

fetch(`${import.meta.url}/../waiting-progress-circle.htm`)
	.then(r => r.text())
	.then(t => {
		htmCache = t;
		customElements.define('waiting-progress', WaitingProgress);
	});
