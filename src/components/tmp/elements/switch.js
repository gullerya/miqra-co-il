import './boolean-icon.js';

const
	template = document.createElement('template'),
	trippleStateKey = Symbol('tripple.state.key');

template.innerHTML = `
	<style>
		:host {
			width: 46px;
			display: inline-flex;
			position: relative;
			align-items: center;
			flex-direction: row;
		}

		:host > .rail {
			position: absolute;
			top: calc(50% - 5px);
			left: 8px;
			right: 8px;
			height: 10px;
			background-color: gray;
			border-left: 10px solid gray;
			border-right: 10px solid gray;
			border-radius: 5px;
			z-index: -1;
		}

		:host > .container {
			flex-basis: calc(50% + 13px);
			transition: flex-basis 100ms;
			display: flex;
			flex-direction: row;
			align-items: center;
			justify-content: flex-end;
		}

		:host > .container > .icon {
			background: rgb(230, 230 ,230);
		}

		:host(.pos) > .container {
			flex-basis: 0;
		}

		:host(.neg) > .container {
			flex-basis: 100%;
		}
	</style>

	<div class="rail"></div>
	<div class="container">
		<boolean-icon class="icon"></boolean-icon>
	</div>
`;

customElements.define('boolean-switch', class extends HTMLElement {
	constructor() {
		super();
		this
			.attachShadow({ mode: 'open' })
			.appendChild(template.content.cloneNode(true));
		customElements.upgrade(this.shadowRoot.querySelector('.icon'));
		this.addEventListener('click', () => {
			if (this.value === null) {
				this.value = true;
			} else if (this.value) {
				this.value = false;
			} else {
				if (this.tripple) {
					this.value = null;
				} else {
					this.value = true;
				}
			}
		});
	}

	connectedCallback() {
		this.tripple = this.hasAttribute('tripple');
	}

	get defaultTieTarget() {
		return 'value';
	}

	get changeEventName() {
		return 'change';
	}

	set tripple(tripple) {
		this[trippleStateKey] = Boolean(tripple);
		if (typeof this.value !== 'boolean') {
			this.value = false;
		}
	}

	get tripple() {
		return this[trippleStateKey];
	}

	set value(value) {
		if (!this.tripple) {
			value = Boolean(value);
		}

		if (this.value !== value) {
			if (typeof value !== 'boolean') {
				this.classList.remove('pos', 'neg');
			} else if (value) {
				this.classList.remove('neg');
				this.classList.add('pos');
			} else {
				this.classList.remove('pos');
				this.classList.add('neg');
			}
			this.shadowRoot.querySelector('.icon').value = value;
			this.dispatchEvent(new Event('change'));
		}
	}

	get value() {
		return this.classList.contains('pos')
			? true
			: (this.classList.contains('neg')
				? false
				: null);
	}
});
