import { ComponentBase, initComponent } from '../libs/rich-component/rich-component.min.js';
import '../elements/tool-icon.js';

const
	template = document.createElement('template');

template.innerHTML = `
	<style>
	</style>

	<tool-icon class="disabled">
		<svg-icon type="bell"></svg-icon>
	</tool-icon>
`;

initComponent('notifications-tool', class extends ComponentBase {
	static get template() {
		return template;
	}
});