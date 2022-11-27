import { ComponentBase, initComponent } from '../libs/rich-component/rich-component.min.js';

/**
 * this component expects to be set with data having the following structure
 * {
 * 		type: <number, numeric types as they are defined in CH IL>,
 * 		logo: <string, URL>
 * }
 */

const
	template = document.createElement('template'),
	dataKey = Symbol('data-key');

template.innerHTML = `
	<style>
		:host {
			position: relative;
			display: flex;
			flex-direction: row;
			align-items: center;
			border-radius: 12px;
			background-color: #efefef;
		}

		:host(.pensia) {
			color: rgba(137, 235, 124, 1);
			background-color: rgba(240, 254, 237, 1);
		}
		:host(.study) {
			color: rgba(93, 88, 230, 1);
			background-color: rgba(245, 245, 255, 1);
		}
		:host(.provident) {
			color: rgba(255, 196, 43, 1);
			background-color: rgba(254, 248, 236, 1);
		}
		:host(.insurance) {
			color: rgba(227, 70, 139, 1);
			background-color: rgba(254, 241, 248, 1);
		}
		:host(.saving) {
			color: rgba(225, 138, 54, 1);
			background-color: rgba(254, 245, 238, 1);
		}
		:host(.mortgage) {
			color: rgba(189, 92, 233, 1);
			background-color: rgba(250, 242, 253, 1);
		}

		.logo {
			flex-grow: 1;
			width: 40%;
			height: 40%;
		}

		.logo[src=""] {
			display: none;
		}

		.rank {
			position: absolute;
			top:-4px;
			right: -4px;
			width: 0.7em;
			height: 0.7em;
			background-color: var(--main-green);
			border: 4px solid #fff;
			border-radius: 50%;
		}
	</style>

	<img class="logo" src=""/>
	<div class="rank"></div>
`;

initComponent('fund-icon', class extends ComponentBase {
	connectedCallback() {
		this.shadowRoot.querySelector('.logo').addEventListener('error', event => {
			event.target.src = '';
		});
	}

	get defaultTieTarget() {
		return 'data';
	}

	set data(data) {
		if (data) {
			this[dataKey] = data;
			this.updateView();
		}
	}

	updateView() {
		const data = this[dataKey];
		switch (data.type) {
			case 1:
				this.classList.add('insurance');
				break;
			case 2:
				this.classList.add('pensia');
				break;
			case 3:
				this.classList.add('provident');
				break;
			case 4:
				this.classList.add('study');
				break;
			case 5:
				this.classList.add('saving');
				break;
			case 6:
				this.classList.add('insurance');
				break;
			case 7:
				this.classList.add('mortgage');
				break;
			case 8:
				this.classList.add('insurance');
				break;
			case 9:
				this.classList.add('saving');
				break;
			case 10:
				this.classList.add('saving');
				break;
			default:
				break;
		}
		this.shadowRoot.querySelector('.logo').src = data.logo;
	}

	static get template() {
		return template;
	}
});