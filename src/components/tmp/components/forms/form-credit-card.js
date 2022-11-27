import * as DataTier from '../../libs/data-tier/data-tier.min.js';
import { ComponentBase, initComponent } from '../../libs/rich-component/rich-component.min.js';
import * as l10n from '../../services/localization.js';
import { validateLuhnNumber } from '../../services/user.js';
import '../../elements/input-text.js';

const
	formModel = DataTier.ties.create('creditCardFormModel', {
		data: {},
		numberValidator: input => {
			return input && input.length > 11 && validateLuhnNumber(input);
		}
	}),
	template = document.createElement('template');

template.innerHTML = `
	<style>
		:host {
			direction: ltr;
			width: 24px;
			min-width: 220px;
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: space-evenly;
			overflow: hidden;
		}

		.field {
			border: 1px solid var(--dark-blue);
			border-radius: 36px;
		}
		
		.number {
			width: 100%;
			padding: 0 4px;
			margin-bottom: 12px;
		}

		.add-data {
			width: 100%;
			display: flex;
			align-items: center;
			justify-content: space-between;
		}

		.date {
			display: flex;
			min-width: 0;
			overflow: hidden;
			align-items: baseline;
		}

		.date .month {
			flex: 0 0 3em;
			min-width: 0;
		}

		.date .year {
			flex: 0 0 4em;
			min-width: 0;
		}

		.date .separ {
			margin: 0 6px;
		}

		.cvv {
			flex: 0 0 4em;
			min-width: 0;
		}
	</style>

	<input-text class="field number status-on center" numeric maxlength="19" data-tie="creditCardFormModel:data.number; creditCardFormModel:numberValidator => validator">
		<span slot="label" data-tie="l10n:creditCardForm.number"></span>
	</input-text>
	<div class="add-data">
		<div class="date">
			<input-text class="field month center" numeric maxlength="2" data-tie="creditCardFormModel:data.month">
				<span slot="label" data-tie="l10n:creditCardForm.month"></span>
			</input-text>
			<span class="separ">/</span>
			<input-text class="field year center" numeric maxlength="2" data-tie="creditCardFormModel:data.year">
				<span slot="label" data-tie="l10n:creditCardForm.year"></span>
			</input-text>
		</div>
		<input-text class="field cvv center" numeric maxlength="4" data-tie="creditCardFormModel:data.cvv">
			<span slot="label" data-tie="l10n:creditCardForm.cvv"></span>
		</input-text>
	</div>
`;

initComponent('form-credit-card', class extends ComponentBase {
	connectedCallback() {
		const
			monthInput = this.shadowRoot.querySelector('.field.month'),
			yearInput = this.shadowRoot.querySelector('.field.year');
		monthInput.addEventListener('blur', () => {
			if (formModel.data && formModel.data.month && !isNaN(parseInt(formModel.data.month))) {
				const monthAsNum = parseInt(formModel.data.month);
				if (monthAsNum < 1 || monthAsNum > 12) {
					formModel.data.month = null;
				} else if (monthAsNum < 10) {
					formModel.data.month = monthAsNum.toString().padStart(2, '0');
				}
			}
		});
		yearInput.addEventListener('blur', () => {
			if (formModel.data && formModel.data.year && !isNaN(parseInt(formModel.data.year))) {
				const yearAsNum = parseInt(formModel.data.year);
				if (yearAsNum < (new Date().getFullYear() - 2000)) {
					formModel.data.year = null;
				}
				if (yearAsNum === (new Date().getFullYear() - 2000) && !isNaN(parseInt(formModel.data.month)) && parseInt(formModel.data.month) < (new Date().getMonth() + 2)) {
					formModel.data.month = null;
				}
			}
		});
	}

	set model(newModel) {
		if (newModel === undefined || newModel === null || newModel === '') {
			formModel.data = null;
		} else if (typeof newModel === 'object') {
			Object.assign(formModel.data, {
				number: newModel.number,
				month: newModel.month,
				year: newModel.year,
				cvv: newModel.cvv
			});
		} else {
			console.error('model MUST be of type "object"');
		}
	}

	get model() {
		return formModel.data;
	}

	get isValid() {
		return validateLuhnNumber(formModel.data.number) &&
			!isNaN(parseInt(formModel.data.month)) &&
			!isNaN(parseInt(formModel.data.year)) &&
			!isNaN(parseInt(formModel.data.cvv));
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

l10n.initL10nResource('creditCardForm', {
	en: {
		number: 'Card number',
		month: 'Month',
		year: 'Year',
		cvv: 'CVV'
	},
	he: {
		number: 'מספר כרטיס',
		month: 'חודש',
		year: 'שנה',
		cvv: 'CVV'
	}
});