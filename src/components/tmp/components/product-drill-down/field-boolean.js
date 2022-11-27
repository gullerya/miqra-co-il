import { ComponentBase, initComponent } from '../../libs/rich-component/rich-component.min.js';
import '../../elements/svg-icon.js';

const
	VALUE_KEY = Symbol('value.key'),
	template = document.createElement('template');

template.innerHTML = `
	<style>
		:host {
			height: 52px;
			margin: 15px 0;
			display: flex;
			flex-direction: column;
			justify-content: space-between;
			user-select: none;
			outline: none;
		}
		
		.label {
			display: flex;
			flex-direction: row;
			align-items: baseline;
			font-size: 80%;
			color: #a5a5a5;
		}

		.value {
			width: 1em;
			height: 1em;
		}
	</style>

	<slot name="label" class="label">
		<div></div>
	</slot>
	<svg-icon class="value"></svg-icon>
`;

initComponent('boolean-field', class extends ComponentBase {
	constructor() {
		super();
		this[VALUE_KEY] = false;
	}

	set label(label) {
		this.shadowRoot.querySelector('.label').textContent = label;
	}

	set value(value) {
		if (typeof value === 'boolean') {
			this[VALUE_KEY] = value;
			this.shadowRoot.querySelector('.value').type = value ? 'v' : 'x';
		} else {
			this.shadowRoot.querySelector('.value').type = null;
		}
	}

	get value() {
		return this[VALUE_KEY];
	}

	get defaultTieTarget() {
		return 'value';
	}

	static get template() {
		return template;
	}
});