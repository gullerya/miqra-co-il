let htmCache;

class WaitingProgress extends HTMLElement {

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

fetch(`${import.meta.url}/../waiting-progress.htm`)
	.then(r => r.text())
	.then(t => {
		htmCache = t;
		customElements.define('waiting-progress', WaitingProgress);
	});
