import { ComponentBase, initComponent } from '../libs/rich-component/rich-component.min.js';

const
	template = document.createElement('template');

template.innerHTML = `
	<style>
		:host {
			display: flex;
			flex-direction: row;
			flex-wrap: wrap;
			justify-content: center;
			overflow-x: hidden;
			overflow-y: auto;
		}

		.cards::slotted(*) {
			margin: 24px;
			border-radius: 16px;
			box-shadow: 0 0 12px 6px rgba(240, 246, 252, 0.9);
			background: var(--default-background);
		}
	</style>

	<slot class="cards"></slot>
`;

initComponent('cards-out', class extends ComponentBase {
	static get template() {
		return template;
	}
});