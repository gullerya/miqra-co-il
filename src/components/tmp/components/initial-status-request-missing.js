import * as l10nService from '../services/localization.js';
import { ComponentBase, initComponent } from '../libs/rich-component/rich-component.min.js';
import '../elements/input-button.js';

const
	template = document.createElement('template'),
	tmpMessageKey = Symbol('tmp.message.key'),
	tmpButtonKey = Symbol('tmp-button-key');

l10nService.initL10nResource('initialRequestMissing', {
	he: {
		message: 'טרם הוגשה בקשה לקבלת תמונת מצב פנסיוני',
		action: 'הזמן נתונים פנסיוניים'
	},
	en: {
		message: 'Pension status report has not yet been requested',
		action: 'Request pension status'
	}
});

initComponent('initial-status-request-missing', class extends ComponentBase {
	connectedCallback() {
		if (this[tmpMessageKey]) {
			this.message = this[tmpMessageKey];
			delete this[tmpMessageKey];
		}
		if (this[tmpButtonKey]) {
			this.button = this[tmpButtonKey];
			delete this[tmpButtonKey];
		}
		this.shadowRoot.querySelector('.request-status').addEventListener('click', () => {
			this.dispatchEvent(new Event('requestStatus'));
		});
	}

	set message(message) {
		if (this.parentNode) {
			this.shadowRoot.querySelector('.no-status-request-message').textContent = message;
		} else {
			this[tmpMessageKey] = message;
		}
	}

	set button(button) {
		if (this.parentNode) {
			this.shadowRoot.querySelector('.request-status').textContent = button;
		} else {
			this[tmpButtonKey] = button;
		}
	}

	static get template() {
		return template;
	}
});

template.innerHTML = `
	<style>
		:host {
			flex: 1;
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
		}
		
		:host > .no-status-request-icon {
			flex-basis: 160px;
			width: 160px;
			color: #999;
		}

		:host > .no-status-request-message {
			margin: 10px;
			font-size: 24px;
			color: #999;
			cursor: default;
		}

		:host > .request-status {
			margin-top: 30px;
			width: 300px;
		}
	</style>

	<svg class="no-status-request-icon" viewBox="0 0 64 64">
		<circle cx="32" cy="32" r="20" fill="none" stroke="currentColor" stroke-width="4"/>
		<path d="m18 46 27-27z" fill="none" stroke="currentColor" stroke-width="2.5"/>
	</svg>
	<div class="no-status-request-message" data-tie="l10n:initialRequestMissing.message"></div>
	<input-button class="request-status">
		<span slot="text" data-tie="l10n:initialRequestMissing.action"></span>
	</input-button>
`;
