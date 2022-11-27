import * as DataTier from '../../libs/data-tier/data-tier.min.js';
import { ComponentBase, initComponent } from '../../libs/rich-component/rich-component.min.js';
import * as l10n from '../../services/localization.js';
import * as user from '../../services/user.js';
import '../../elements/input-text.js';

const
	formModel = DataTier.ties.create('userPersonalFormModel', {
		data: {},
		legalIdValidator: input => {
			return input && input.length === 9 && user.validateLuhnNumber(input);
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

	<input-text class="field first required status-on" data-tie="userPersonalFormModel:data.firstName">
		<span slot="label" data-tie="l10n:userPersonalForm.first"></span>
	</input-text>
	<input-text class="field last required status-on" data-tie="userPersonalFormModel:data.lastName">
		<span slot="label" data-tie="l10n:userPersonalForm.last"></span>
	</input-text>
	<input-text class="field legal required input-ltr status-on" maxlength="9"
		data-tie="userPersonalFormModel:data.legalId, userPersonalFormModel:legalIdValidator => validator">
		<span slot="label" data-tie="l10n:userPersonalForm.legalId"></span>
		<span slot="help" data-tie="l10n:userPersonalForm.legalIdHelp"></span>
		<span slot="error" data-tie="l10n:userPersonalForm.legalIdHelp"></span>
	</input-text>
`;

initComponent('form-user-personal', class extends ComponentBase {
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

l10n.initL10nResource('userPersonalForm', {
	en: {
		first: 'Your name',
		last: 'Your surname',
		legalId: 'Legal ID',
		legalIdHelp: '9 numbers, including leading 0'
	},
	he: {
		first: 'שמך הפרטי',
		last: 'שם משפחתך',
		legalId: 'מספר תעודת הזהות',
		legalIdHelp: '9 ספרות, כולל 0 מובילים'
	}
});