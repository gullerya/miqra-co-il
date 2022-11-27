import * as DataTier from '../../libs/data-tier/data-tier.min.js';
import { ComponentBase, initComponent } from '../../libs/rich-component/rich-component.min.js';
import * as l10n from '../../services/localization.js';
import '../../elements/input-text.js';

l10n.initL10nResource('contactForm', {
	en: {
		email: 'Email',
		cell: 'Cell phone'
	},
	he: {
		email: 'דוא"ל',
		cell: 'טלפון נייד'
	}
});

const
	formModel = DataTier.ties.create('contactFormModel', {
		data: {},
		emailValidator: input => {
			return typeof input === 'string' && /^.+@.+\..+$/.test(input);
		},
		cellValidator: input => {
			return typeof input && input.length > 9 && /^[0-9+][0-9]*-?[0-9-]*[0-9]$/.test(input);
		}
	}),
	template = document.createElement('template');

template.innerHTML = `
	<style>
		:host {
			min-width: 180px;
			display: flex;
			flex-direction: column;
		}

		.field {
			width: 100%;
		}
	</style>

	<input-text class="field email required input-ltr status-on" data-tie="contactFormModel:data.email, contactFormModel:emailValidator => validator">
		<span slot="label" data-tie="l10n:contactForm.email"></span>
	</input-text>
	<input-text class="field cell required input-ltr status-on" data-tie="contactFormModel:data.cellPhone, contactFormModel:cellValidator => validator">
		<span slot="label" data-tie="l10n:contactForm.cell"></span>
	</input-text>
`;

initComponent('form-contact', class extends ComponentBase {
	set model(newModel) {
		if (newModel === undefined || newModel === null || newModel === '') {
			formModel.data = null;
		} else if (typeof newModel === 'object') {
			formModel.data = newModel;
		} else {
			console.error('model MUST be of type "object"');
		}
	}

	get model() {
		return formModel.data;
	}

	get isValid() {
		return Array.from(this.shadowRoot.querySelectorAll('.field')).every(f => f.isValid);
	}

	get defaultTieTarget() {
		return 'model';
	}

	get changeEventName() {
		return 'input';
	}

	static get template() {
		return template;
	}
});