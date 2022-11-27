import { ComponentBase, initComponent } from '../../libs/rich-component/rich-component.min.js';
import * as l10n from '../../services/localization.js';
import * as productConvertUtils from '../../services/product-convert-utils.js';
import '../../elements/span-currency.js';
import '../../elements/svg-icon.js';

const
	template = document.createElement('template');

template.innerHTML = `
	<style>
		@import "./commons/styles/base.css";

		:host {
			display: flex;
			flex-direction: column;
		}
		
		.row {
			flex: 1;
			display: flex;
			flex-direction: row;
			align-items: center;
		}

		.column {
			flex: 1;
			display: flex;
			flex-direction: column;
		}

		.hidden {
			display: none;
		}

		.label {
			margin-bottom: 0.8em;
		}

		.value {
			height: 1.4em;
		}

		.value.franchise {
			width: 1em;
			height: 1em;
		}
	</style>

	<div class="row">
		<div class="column">
			<div class="label subtitle bidi-transor" data-tie="l10n:insuranceCardData.type"></div>
			<div class="value type bold-a"></div>
		</div>
		<div class="column">
			<div class="label subtitle bidi-transor" data-tie="l10n:insuranceCardData.sum"></div>
			<span-currency class="value sum bold-a nis"></span-currency>
		</div>
		<div class="column">
			<div class="label subtitle bidi-transor" data-tie="l10n:insuranceCardData.payment"></div>
			<div class="value">
				<span class="payment-who bold-a"></span>
				&nbsp;
				<span-currency class="payment-how bold-a nis"></span-currency>
			</div>
		</div>
	</div>
	<div class="row">
		<div class="column franchise">
			<div class="label subtitle bidi-transor" data-tie="l10n:insuranceCardData.franchise"></div>
			<svg-icon class="value franchise"></svg-icon>
		</div>
		<div class="column total-covs">
			<div class="label subtitle bidi-transor" data-tie="l10n:insuranceCardData.totalCovs"></div>
			<div class="value bold-a"></div>
		</div>
	</div>
`;

initComponent('insurance-card-data', class extends ComponentBase {
	set product(product) {
		if (!product || typeof product !== 'object') {
			console.error('invalid product argument');
			return;
		}

		//	first coverage will be the definitive one
		const coverage = product.generalCoverages[0];

		this.shadowRoot.querySelector('.type').dataset.tie = productConvertUtils.translateCoverageType(coverage.type);
		this.shadowRoot.querySelector('.sum').textContent = coverage.sum;
		this.shadowRoot.querySelector('.payment-who').dataset.tie = productConvertUtils.translateCoveragePayer(coverage.payer);
		if (coverage.payment) {
			this.shadowRoot.querySelector('.payment-how').textContent = coverage.payment;
		} else {
			this.shadowRoot.querySelector('.payment-how').classList.add('hidden');
		}
		if (coverage.type === 5 || coverage.type === 9) {
			customElements.whenDefined('svg-icon').then(() => {
				this.shadowRoot.querySelector('.value.franchise').type = coverage.franchise === 1 ? 'v' : 'x';
			});
		} else {
			this.shadowRoot.querySelector('.column.franchise').classList.add('hidden');
		}
		if (product.generalCoverages.length > 1) {
			this.shadowRoot.querySelector('.total-covs .value').textContent = product.generalCoverages.length;
		} else {
			this.shadowRoot.querySelector('.column.total-covs').classList.add('hidden');
		}
	}

	get defaultTieTarget() {
		return 'product';
	}

	static get template() {
		return template;
	}
});

l10n.initL10nResource('insuranceCardData', {
	he: {
		type: 'סוג כיסוי',
		sum: 'סכום ביטוח',
		payment: 'פרמיה',
		franchise: "פרנצ'יזה",
		totalCovs: 'סך כיסויים במוצר'
	},
	en: {
		type: 'Coverage type',
		sum: 'Insurance sum',
		payment: 'Payment',
		franchise: 'Franchise',
		totalCovs: 'Total coverages in product'
	}
});