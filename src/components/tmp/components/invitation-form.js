import * as DataTier from '../libs/data-tier/data-tier.min.js';
import '../libs/data-tier-list/data-tier-list.min.js';
import * as l10n from '../services/localization.js';
import { ComponentBase, initComponent } from '../libs/rich-component/rich-component.min.js';
import '../elements/input-text.js';
import '../elements/input-list.js';
import '../elements/input-button.js';
import './l10n.js';

const
	template = document.createElement('template'),
	model = DataTier.ties.create('invitationForm', {
		languages: ['Hebrew', 'English'],
		submitDisabled: true,
		emailValidator: candidate => {
			const r = candidate &&
				/.+@.+\..+/.test(candidate);
			model.submitDisabled = !r;
			return r;
		}
	});

l10n.initL10nResource('invitationForm', {
	he: {
		label: 'דוא"ל לשליחת הזמנה',
		lang: 'שפת ההזמנה',
		send: 'שלח',
		errorEmail: 'נא למלא כתובת דוא"ל תקינה'
	},
	en: {
		label: 'Email to send invitation to',
		lang: 'Invitation language',
		send: 'Send',
		errorEmail: 'please provide a valid recipient email address'
	}
});

template.innerHTML = `
	<style>
		:host {
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
		}

		.field.email {
			width: 320px;
		}

		.send-button {
			width: 120px;
		}
	</style>
	
	<input-text class="field email required status-on input-ltr" data-tie="invitationForm:email, invitationForm:emailValidator => validator">
		<span slot="label" data-tie="l10n:invitationForm.label"></span>
		<span slot="error" data-tie="l10n:invitationForm.errorEmail"></span>
	</input-text>
	<!--input-list class="field">
		<span slot="label" data-tie="l10n:invitationForm.lang"></span>
		<template is="data-tier-item-template" data-tie="invitationForm:languages">
			<span data-tie="item"></span>
		</template>
	</input-list-->
	<input-button class="send-button" data-tie="invitationForm:send => onclick, invitationForm:submitDisabled => disabled">
		<span slot="text" data-tie="l10n:invitationForm.send"></span>
	</input-button>
`;

initComponent('invitation-form', class extends ComponentBase {
	constructor() {
		super();
		model.send = this.send.bind(this);
	}

	async send() {
		const targetEmail = model.email;
		if (!targetEmail) {
			model.error = 'please specify recipient email';
		} else {
			this.dispatchEvent(new CustomEvent('submit', {
				detail: {
					email: targetEmail
				}
			}));
		}
	}

	reset() {
		model.email = '';
	}

	static get template() {
		return template;
	}
});
