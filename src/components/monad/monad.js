class Monad extends HTMLElement {

	constructor() {
		super();
	}

	connectedCallback() {
	}

	set data(data) {
		this.innerHTML = data.t;
		if (data.t.endsWith('־')) {
			this.classList.add('maqqaf');
		}
	}
}

customElements.define('miqra-monad', Monad);
