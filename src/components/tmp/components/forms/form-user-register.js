import * as DataTier from '../../libs/data-tier/data-tier.min.js';
import { ComponentBase, initComponent } from '../../libs/rich-component/rich-component.min.js';
import * as l10n from '../../services/localization.js';
import * as user from '../../services/user.js';
import '../../elements/input-text.js';

l10n.initL10nResource('registerForm', {
	en: {
		legalId: 'Legal ID',
		email: 'Email',
		cell: 'Cell phone',
		legalIdHelp: '9 numbers, including leading 0'
	},
	he: {
		legalId: 'מספר תעודת הזהות',
		email: 'דוא"ל',
		cell: 'טלפון נייד',
		legalIdHelp: '9 ספרות, כולל 0 מובילים'
	}
});

const
	formModel = DataTier.ties.create('registerFormModel', {
		data: {},
		legalIdValidator: input => {
			return input && input.length === 9 && user.validateLuhnNumber(input);
		},
		emailValidator: input => {
			return typeof input === 'string' &&
				/^.+@.+\..+$/.test(input);
		},
		cellValidator: input => {
			return typeof input === 'string' &&
				/^[0-9+][0-9]*-?[0-9-]*[0-9]$/.test(input);
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

	<input-text class="field legal required input-ltr status-on" data-tie="registerFormModel:data.legalId, registerFormModel:legalIdValidator => validator">
		<span slot="label" data-tie="l10n:registerForm.legalId"></span>
		<span slot="help" data-tie="l10n:registerForm.legalIdHelp"></span>
	</input-text>
	<input-text class="field email required input-ltr status-on" data-tie="registerFormModel:data.email, registerFormModel:emailValidator => validator">
		<span slot="label" data-tie="l10n:registerForm.email"></span>
	</input-text>
	<input-text class="field cell required input-ltr status-on" data-tie="registerFormModel:data.cellPhone, registerFormModel:cellValidator => validator">
		<span slot="label" data-tie="l10n:registerForm.cell"></span>
	</input-text>
`;

initComponent('form-user-register', class extends ComponentBase {
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