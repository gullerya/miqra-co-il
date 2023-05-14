import { ComponentBase, initComponent } from '../libs/rich-component/rich-component.min.js';

const
	template = document.createElement('template');

template.innerHTML = `
	<style>
		:host {
			direction: ltr;
			display: flex;
			align-items: center;
			justify-content: space-between;
			border-top-color: var(--dark-blue);
			border-top-style: solid;
		}

		.branding {
			height: 100%;
			display: flex;
			flex-direction: column;
			justify-content: space-evenly;
		}

		.logo {
			min-height: 24px;
		}

		.portal-type::slotted(*) {
			color: rgba(72, 72, 72, 0.8);
		}

		@media (min-width: 1201px) {
			:host {
				min-height: 164px;
				padding: 0 10%;
				border-top-width: 16px;
			}

			.logo {
				min-width: 148px;
			}
		}

		@media (min-width: 481px) and (max-width: 1200px) {
			:host {
				min-height: 128px;
				padding: 0 6%;
				border-top-width: 8px;
			}

			.logo {
				min-width: 148px;
			}
		}

		@media (max-width: 480px) {
			:host {
				min-height: 64px;
				padding: 0 4%;
				border-top-width: 2px;
			}

			.logo {
				min-width: 96px;
			}
		}

		.main-menu::slotted(main-menu) {
			flex: 1;
		}

		.main-toolbar::slotted(main-toolbar) {
			flex: 0 0 auto;
		}
	</style>

	<div class="branding">
		<img class="logo" src="./commons/images/logo.svg"/>
		<slot name="portal" class="portal-type"></slot>
	</div>
	<slot name="main-menu" class="main-menu"></slot>
	<slot name="main-toolbar" class="main-toolbar"></slot>
`;

initComponent('master-header', class extends ComponentBase {
	connectedCallback() {
		this.shadowRoot.querySelector('.branding').addEventListener('click', () => {
			location.href = location.origin;
		});
	}

	static get template() {
		return template;
	}
});
