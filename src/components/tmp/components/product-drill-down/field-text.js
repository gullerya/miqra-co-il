import { ComponentBase, initComponent } from '../../libs/rich-component/rich-component.min.js';

const template = document.createElement('template');

template.innerHTML = `
	<style>
		:host {
			height: 52px;
			margin: 15px 0;
			display: flex;
			flex-direction: column;
			justify-content: space-between;
			user-select: text;
			outline: none;
		}
		
		.label {
			display: flex;
			flex-direction: row;
			align-items: baseline;
			font-size: 80%;
			color: #a5a5a5;
		}

		.value::slotted(*) {
			font-size: 100%;
			font-family: inherit;
			outline: none;
			background: none;
			border: none;
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
		}
	</style>

	<slot name="label" class="label">
		<div></div>
	</slot>
	<slot name="value" class="value">
		<div></div>
	</slot>
`;

initComponent('text-field', class extends ComponentBase {
	set label(label) {
		this.shadowRoot.querySelector('.label').textContent = label;
	}

	set value(value) {
		this.shadowRoot.querySelector('.value').textContent = value || '---';
	}

	set l10nValue(l10nValue) {
		this.shadowRoot.querySelector('.value').dataset.tie = l10nValue;
	}

	get defaultTieTarget() {
		return 'value';
	}

	static get template() {
		return template;
	}
});