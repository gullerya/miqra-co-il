import * as DataTier from '../libs/data-tier/data-tier.min.js';
import '../libs/data-tier-list/data-tier-list.min.js';
import { initComponent } from '../libs/rich-component/rich-component.min.js';
import { InputText } from './input-text.js';
import { openPopup } from '../components/popup.js';

const
	optionsModel = DataTier.ties.create('inputSelectOptionsList', { options: [] }),
	optionsListTemplate = document.createElement('template'),
	RESTRICTED_KEY = Symbol('restricted.key'),
	POPUP_KEY = Symbol('popup.key'),
	OPTIONS_PROVIDER_KEY = Symbol('options.provider.key'),
	UPDATE_OPTIONS_KEY = Symbol('update.options');

optionsListTemplate.innerHTML = `
	<style>
		.option {
			padding: 6px;
			border-radius: 4px;
		}

		.option:hover {
			color: #fff;
			background-color: var(--main-gray);
		}
	</style>

	<div class="no-data" style="display:none"></div>
	<div class="loading" style="display:none"></div>
	<div class="options" style="max-height: 128px; overflow-y: auto">
		<template class="list" is="data-tier-item-template">
			<div class="option" data-tie="item"></div>
		</template>
	</div>
`;

initComponent('input-select', class extends InputText {
	constructor() {
		super();
		this[RESTRICTED_KEY] = false;
	}

	connectedCallback() {
		super.connectedCallback();
		const ie = this.shadowRoot.querySelector('.input');
		ie.addEventListener('click', () => {
			if (!this[POPUP_KEY]) {
				const optionsList = document.createElement('div');
				optionsList.appendChild(optionsListTemplate.content.cloneNode(true));
				optionsList.querySelector('.options .list').dataset.tie = 'inputSelectOptionsList:options';
				optionsList.querySelector('.options').addEventListener('mousedown', event => {
					if (event.target.classList.contains('option')) {
						this.value = event.target.textContent;
						this.dispatchEvent(new Event('change'));
					}
				});
				this[POPUP_KEY] = openPopup(this, optionsList, { pointerless: true, closeOnAnchorClick: false, closeOnDocumentEvents: false });
				this[POPUP_KEY].addEventListener('closed', () => { this[POPUP_KEY] = null; });
				this[POPUP_KEY].width = this.clientWidth;
				this[POPUP_KEY].style.clipPath = 'inset(0 -8px -8px -8px)';
				this[UPDATE_OPTIONS_KEY](this.value);
			}
		});
		ie.addEventListener('blur', () => {
			if (this[POPUP_KEY]) {
				this[POPUP_KEY].close();
			}
		});
		ie.addEventListener('input', () => {
			this[UPDATE_OPTIONS_KEY](this.value);
		});
	}

	get restricted() {
		return this[RESTRICTED_KEY];
	}

	set restricted(restricted) {
		this[RESTRICTED_KEY] = Boolean(restricted);
	}

	validator(input) {
		return input && typeof input === 'string';
	}

	set optionsProvider(optionsProvider) {
		if (typeof optionsProvider !== 'function') {
			throw new Error('options provider MUST be a function');
		} else {
			this[OPTIONS_PROVIDER_KEY] = optionsProvider;
		}
	}

	async [UPDATE_OPTIONS_KEY](value) {
		if (!this[POPUP_KEY]) {
			return;
		}

		optionsModel.options = await this[OPTIONS_PROVIDER_KEY](value);
	}

	get changeEventName() {
		return 'input';
	}
});