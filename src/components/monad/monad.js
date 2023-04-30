class Monad extends HTMLElement {

	constructor() {
		super();
	}

	connectedCallback() {
	}

	set data(data) {
		this.textContent = data.t;
		if (data.t.endsWith('־')) {
			this.classList.add('maqqaf');
		}
	}
}

customElements.define('miqra-monad', Monad);
