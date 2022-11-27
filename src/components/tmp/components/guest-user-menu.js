import * as DataTier from '../libs/data-tier/data-tier.min.js';
import { ComponentBase, initComponent } from '../libs/rich-component/rich-component.min.js';
import * as l10nService from '../services/localization.js';
import '../elements/svg-icon.js';
import '../elements/splitter.js';

const template = document.createElement('template');

DataTier.ties.create('guestUserMainMenu', {
	login: () => {
		location = location.origin + '/savers';
	},
	register: () => {
		location = location.origin + '/register';
	}
});

initComponent('guest-user-menu', class extends ComponentBase {
	static get template() {
		return template;
	}
});

l10nService.initL10nResource('guestUserMainMenu', {
	he: {
		login: 'כניסה לאזור האישי',
		register: 'הרשמה'
	},
	en: {
		login: 'Go to personal area',
		register: 'Register'
	}
});

template.innerHTML = `
	<style>
		@import "./commons/styles/base.css";

		:host {
			width: 240px;
			padding: 12px;
			display: flex;
			flex-direction: column;
		}

		.menu-item {
			margin: 8px 0;
			padding: 8px;
			display: flex;
			flex-direction: row;
			align-items: center;
			border-radius: 4px;
		}

		.menu-item:first-of-type {
			margin-top: 0;
		}

		.menu-item:last-of-type {
			margin-bottom: 0;
		}

		.menu-item > .icon {
			color: var(--main-gray);
			height: 16px;
			width: auto;
		}

		.menu-item:hover {
			background-color: var(--light-blue);
		}

		.menu-item:hover > .icon, .menu-item:hover > .label {
			color: #fff;
		}

		.hidden {
			display: none;
		}
	</style>

	<div class="menu-item" data-tie="guestUserMainMenu:login => onclick">
		<svg-icon type="login" class="icon login"></svg-icon>
		<v-splitter transparent clearance="8px"></v-splitter>
		<h6 data-tie="l10n:guestUserMainMenu.login" class="label"></h6>
	</div>
	<h-splitter class="hidden"></h-splitter>
	<div class="menu-item hidden" data-tie="guestUserMainMenu:register => onclick">
		<svg-icon type="register" class="icon register"></svg-icon>
		<v-splitter transparent clearance="8px"></v-splitter>
		<h6 data-tie="l10n:guestUserMainMenu.register" class="label"></h6>
	</div>
`;