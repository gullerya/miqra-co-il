import { ComponentBase, initComponent } from '../libs/rich-component/rich-component.min.js';

const
	templateH = document.createElement('template'),
	templateV = document.createElement('template'),
	ATTRIBUTE_COLOR = 'color',
	ATTRIBUTE_CLEARANCE = 'clearance',
	ATTRIBUTE_TRANSPARENT = 'transparent';

templateH.innerHTML = `
	<style>
		:host {
			display: block;
			min-height: 0;
			min-width: 100%;
			margin: 3px 0;
			border: none;
			border-top: 1px solid rgb(227, 237, 238);
		}
		
		:host(.transparent) {
			border-color: transparent;
		}
	</style>
`;

initComponent('h-splitter', class extends ComponentBase {
	connectedCallback() {
		if (this.hasAttribute(ATTRIBUTE_COLOR)) {
			this.style.borderTopColor = this.getAttribute(ATTRIBUTE_COLOR);
		}
		if (this.hasAttribute(ATTRIBUTE_CLEARANCE)) {
			this.style.margin = this.getAttribute(ATTRIBUTE_CLEARANCE) + ' 0';
		}
		if (this.hasAttribute(ATTRIBUTE_TRANSPARENT)) {
			this.classList.add('transparent');
		}
	}

	static get template() {
		return templateH;
	}
});

templateV.innerHTML = `
	<style>
		:host {
			display: inline-block;
			min-height: 100%;
			min-width: 0;
			margin: 0 3px;
			border: none;
			border-left: 1px solid rgb(227, 237, 238);
		}
		
		:host::after {
			content: '\u2060';
		}
		
		:host(.transparent) {
			border-color: transparent;
		}
	</style>
`;

initComponent('v-splitter', class extends ComponentBase {
	connectedCallback() {
		if (this.hasAttribute(ATTRIBUTE_COLOR)) {
			this.style.borderLeftColor = this.getAttribute(ATTRIBUTE_COLOR);
		}
		if (this.hasAttribute(ATTRIBUTE_CLEARANCE)) {
			this.style.margin = '0 ' + this.getAttribute(ATTRIBUTE_CLEARANCE);
		}
		if (this.hasAttribute(ATTRIBUTE_TRANSPARENT)) {
			this.classList.add('transparent');
		}
	}

	static get template() {
		return templateV;
	}
});