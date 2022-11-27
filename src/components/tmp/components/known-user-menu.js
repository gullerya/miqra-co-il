import * as DataTier from '../libs/data-tier/data-tier.min.js';
import { ComponentBase, initComponent } from '../libs/rich-component/rich-component.min.js';
import * as l10n from '../services/localization.js';
import * as security from '../services/security.js';
import '../elements/svg-icon.js';
import '../elements/splitter.js';

const
	template = document.createElement('template'),
	knownUserMenuModel = DataTier.ties.create('knownUserMainMenu', {});

initComponent('known-user-menu', class extends ComponentBase {
	connectedCallback() {
		knownUserMenuModel.logout = () => {
			security.logout();
			location.replace(location.origin);
		};
		knownUserMenuModel.switchToDistributors = () => {
			this.dispatchEvent(new Event('switchToDistributors'));
		};
	}

	set user(user) {
		if (!user) {
			throw new Error('invalid user');
		}

		let userName = [user.firstName, user.lastName].join(' ').trim();
		if (!userName) {
			userName = user.email;
		}
		knownUserMenuModel.userName = userName;
	}

	static get template() {
		return template;
	}
});

l10n.initL10nResource('knownUserMainMenu', {
	he: {
		logout: 'צא'
	},
	en: {
		logout: 'Exit'
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
	</style>

	<div data-tie="knownUserMainMenu:userName"></div>
	<h-splitter></h-splitter>
	<div class="menu-item" data-tie="knownUserMainMenu:logout => onclick">
		<svg-icon type="logout" class="icon logout"></svg-icon>
		<v-splitter transparent clearance="8px"></v-splitter>
		<h6 data-tie="l10n:knownUserMainMenu.logout" class="label"></h6>
	</div>
`;