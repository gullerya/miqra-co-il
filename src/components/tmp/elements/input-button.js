import { ComponentBase, initComponent } from '../libs/rich-component/rich-component.min.js';

const
	template = document.createElement('template');

template.innerHTML = `
	<style>
		:host {
			width: auto;
			height: 42px;
			margin: 4px;
			padding: 8px 11px;
			background-color: #fff;
			box-sizing: border-box;
			border-radius: 12em;
			display: inline-flex;
			flex-direction: row;
			align-items: center;
			justify-content: space-evenly;
			transition: all 50ms;
			box-shadow: 0 0 4px 2px rgba(0,0,0,0.15);
		}

		:host(.emphasized:not(.disabled)) {
			color: #fff;
			background-color: var(--dark-blue);
		}

		:host(:hover:not(.disabled)) {
			box-shadow: 0 0 6px 3px rgba(0,0,0,0.2);
		}

		:host(.disabled) {
			color: #ccc;
			background-color: #efefef;
			cursor: not-allowed;
		}

		:host(:active:not(.disabled)) {
			box-shadow: 0 0 2px 1px rgba(0,0,0,0.15);
		}

		::slotted(*) {
			pointer-events: none;
			white-space: nowrap;
		}

		.icon::slotted(*) {
			color: inherit;
			height: 75%;
			width: auto;
		}
	</style>

	<slot name="icon" class="icon"></slot>
	<slot name="text" class="text"></slot>
`;

initComponent('input-button', class extends ComponentBase {
	connectedCallback() {
		this.addEventListener('click', e => {
			if (this.classList.contains('disabled')) {
				e.stopImmediatePropagation();
			}
		}, true);
	}

	set disabled(disabled) {
		if (disabled) {
			this.classList.add('disabled');
		} else {
			this.classList.remove('disabled');
		}
	}

	get disabled() {
		return this.classList.contains('disabled');
	}

	get defaultTieTarget() {
		return 'onclick';
	}

	static get template() {
		return template;
	}
});