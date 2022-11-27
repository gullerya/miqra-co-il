import { ComponentBase, initComponent } from '../libs/rich-component/rich-component.min.js';

const
	template = document.createElement('template');

template.innerHTML = `
	<style>
		:host {
			display: flex;
			flex-direction: row;
			flex-wrap: wrap;
		}

		.cards::slotted(*) {
			
		}
	</style>

	<slot class="cards"></slot>
`;

initComponent('cards-out', class extends ComponentBase {
	static get template() {
		return template;
	}
});