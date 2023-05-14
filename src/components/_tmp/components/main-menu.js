import * as DataTier from '../libs/data-tier/data-tier.min.js';
import '../libs/data-tier-list/data-tier-list.min.js';
import { ComponentBase, initComponent } from '../libs/rich-component/rich-component.min.js';
import { openPopup } from '../components/popup.js';
import '../elements/selectable.js';
import '../elements/span-l10n.js';

const
	VALUE_KEY = Symbol('value.key'),
	POPUP_KEY = Symbol('popup.key'),
	TEMPLATE_SELF = document.createElement('template'),
	TEMPLATE_MENU = document.createElement('template'),
	mainMenuModel = DataTier.ties.create('mainMenuModel', {
		items: []
	});

TEMPLATE_SELF.innerHTML = `
	<style>
		@import "./commons/styles/base.css";

		:host {
			min-width: 0;
			height: 100%;
			display: flex;
			align-items: center;
			justify-content: center;
		}

		@media (min-width: 720px) {
			.menu-items {
				display: flex;
			}
			.menu-puller {
				display: none;
			}
		}

		@media (max-width: 720px) {
			.menu-items {
				display: none;
			}
			.menu-puller {
				display: flex;
			}
		}
	</style>

	<tool-icon class="menu-puller">
		<svg-icon type="menu"></svg-icon>
	</tool-icon>
`;

TEMPLATE_MENU.innerHTML = `
	<style>
		.menu-items {
			flex: 1;
			height: 100%;
			align-items: center;
			justify-content: center;
			overflow: hidden;
		}

		.menu-items.popup {
			width: 120px;
			flex-direction: column;
			text-align: center;
		}

		.item {
			display: flex;
			box-sizing: border-box;
			transform: scale(1.3, 1);
			transition: all 100ms;
		}

		.normal .item {
			height: 100%;
			align-items: center;
			padding: 0 24px;
			margin: 8px 16px;
			border-top: 3px solid transparent;
		}

		.popup .item {
			padding: 12px 0;
			justify-content: center;
		}

		.item > .label {
			font-size: 75%;
			pointer-events: none;
		}

		.normal .item:hover:not(.selected) {
			border-top-color: #fcba12;
		}

		.popup .item:hover:not(.selected) {
			color: #fff;
			background-color: var(--main-gray);
		}

		.normal .item:active:not(.selected) {
			box-shadow: inset 0 32px 32px -32px rgba(252, 186, 18, 0.8);
		}

		.normal .item.selected {
			color: #fcba12;
			border-top-color: #fcba12;
			box-shadow: inset 0 16px 16px -16px rgba(252, 186, 18, 0.8);
		}

		.popup .item.selected {
			color: #fff;
			background-color: var(--main-green);
		}
	</style>

	<div class="menu-items normal">
		<template is="data-tier-item-template" class="list" data-tie="mainMenuModel:items">
			<select-able class="item bidi-transor" data-tie="item:value => value, item:selected => selected">
				<span-l10n class="label" data-tie="item:label"></span-l10n>
			</select-able>
		</template>
	</div>
`;

initComponent('main-menu', class extends ComponentBase {
	connectedCallback() {
		//	permanent menu setup
		const popupMenu = TEMPLATE_MENU.content.cloneNode(true);
		this.shadowRoot.appendChild(popupMenu);
		const menuItems = this.shadowRoot.querySelector('.menu-items');
		menuItems.addEventListener('click', e => {
			if (e.target.classList.contains('item') && e.target.value !== this.value) {
				this.value = e.target.value;
			}
		}, true);
		//	temporary menu setup - upon menu puller
		this.shadowRoot.querySelector('.menu-puller').addEventListener('click', () => {
			if (!this[POPUP_KEY]) {
				const popupMenu = TEMPLATE_MENU.content.cloneNode(true);
				const menuItems = popupMenu.querySelector('.menu-items');
				menuItems.classList.replace('normal', 'popup');
				menuItems.addEventListener('click', e => {
					if (e.target.classList.contains('item') && e.target.value !== this.value) {
						this.value = e.target.value;
					}
				}, true);
				this[POPUP_KEY] = openPopup(this, popupMenu);
				this[POPUP_KEY].addEventListener('closed', () => {
					this[POPUP_KEY] = null;
				});
			}
		});
		mainMenuModel.observe(changes => {
			changes.forEach(change => {
				if (change.path[0] === 'items' && change.path.length === 1) {
					if (mainMenuModel.items.length) {
						mainMenuModel.items.forEach(item => {
							if (item.value === this.value) {
								item.selected = true;
							} else {
								item.selected = false;
							}
						});
					}
				}
			});
		});
	}

	set items(items) {
		if (Array.isArray(items)) {
			mainMenuModel.items = items;
		}
	}

	set value(value) {
		if (this[VALUE_KEY] !== value) {
			this[VALUE_KEY] = value;
			mainMenuModel.items.forEach(item => {
				if (item.value === value) {
					item.selected = true;
				} else {
					item.selected = false;
				}
			});
			this.dispatchEvent(new Event('change'));
		}
	}

	get value() {
		return this[VALUE_KEY];
	}

	get defaultTieTarget() {
		return 'value';
	}

	get changeEventName() {
		return 'change';
	}

	static get template() {
		return TEMPLATE_SELF;
	}
});