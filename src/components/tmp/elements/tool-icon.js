import '../elements/svg-icon.js';

const
	template = document.createElement('template');

template.innerHTML = `
	<style>
		:host {
			width: 44px;
			height: 44px;
			overflow: hidden;
			display: inline-flex;
			position: relative;
			align-items: center;
			justify-content: center;
			border-radius: 50%;
		}

		.background {
			position: absolute;
			border-radius: 50%;
			border: 0 solid rgba(132, 150, 168, 0.2);
			transition: border-width 50ms;
		}

		:host(:hover:not(.on):not(.disabled)) > .background {
			border-width: 22px;
		}

		:host(:active:not(.on):not(.disabled)) > .background {
			border-width: 17px;
		}

		.icon::slotted(*) {
			width: 40px;
			height: 40px;
		}

		:host(.on) > .icon::slotted(*) {
			color: var(--main-green);
		}

		:host(:hover:not(.on):not(.disabled)) > .icon::slotted(*) {
			color: var(--main-green);
		}

		:host(.disabled) > .icon::slotted(*) {
			color: var(--main-light);
		}
	</style>

	<div class="background"></div>
	<slot class="icon"></slot>
`;

customElements.define('tool-icon', class extends HTMLElement {
	constructor() {
		super();
		this
			.attachShadow({ mode: 'open' })
			.appendChild(template.content.cloneNode(true));

		this.addEventListener('click', e => {
			if (this.classList.contains('disabled')) {
				e.stopImmediatePropagation();
				e.preventDefault();
			}
		});
	}
});