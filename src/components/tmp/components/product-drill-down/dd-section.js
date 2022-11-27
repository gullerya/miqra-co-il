import { ComponentBase, initComponent } from '../../libs/rich-component/rich-component.min.js';

const
	template = document.createElement('template');

template.innerHTML = `
	<style>
		:host {
			display: flex;
			flex-direction: column;
		}

		.title::slotted(*) {
			font-size: 1.2em;
			font-weight: 600;
			margin: 18px 0;
			color: #3b3b3b;
		}

		.content {
			padding: 32px 48px;
			border-radius: 8px;
			box-shadow: 0 0 6px 6px rgba(240, 246, 252, 0.9);
		}

		.content {
			display: flex;
			flex-direction: row;
			flex-wrap: wrap;
			justify-content: space-between;
		}

		.items::slotted(*) {
			flex: 0 1 45%;
			display: flex;
			flex-direction: column;
			min-width: 200px;
		}
	</style>

	<slot name="title" class="title"></slot>
	<div class="content">
		<slot class="items"></slot>
	</div>
`;

initComponent('data-section', class extends ComponentBase {
	static get template() {
		return template;
	}
});