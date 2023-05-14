import '../elements/svg-icon.js';

const
	template = document.createElement('template');

template.innerHTML = `
	<style>
		:host {
			display: inline-flex;
			width: 26px;
			height: 26px;
			border-radius: 50%;
		}

		:host > .value {
			display: none;
			flex: 1;
			width: 100%;
			height: 100%;
		}

		:host(.pos) > .pos {
			display: inline-flex;
		}

		:host(.neg) > .neg {
			display: inline-flex;
		}
	</style>

	<svg-icon class="value pos" type="v"></svg-icon>
	<svg-icon class="value neg" type="x"></svg-icon>
`;

customElements.define('boolean-icon', class extends HTMLElement {
	constructor() {
		super();
		this
			.attachShadow({ mode: 'open' })
			.appendChild(template.content.cloneNode(true));
	}

	get defaultTieTarget() {
		return 'value';
	}

	set value(value) {
		if (typeof value !== 'boolean') {
			this.classList.remove('pos', 'neg');
		} else if (value) {
			this.classList.remove('neg');
			this.classList.add('pos');
		} else {
			this.classList.remove('pos');
			this.classList.add('neg');
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