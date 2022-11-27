import * as DataTier from '../../libs/data-tier/data-tier.min.js';
import { ComponentBase, initComponent } from '../../libs/rich-component/rich-component.min.js';
import * as l10nService from '../../services/localization.js';
import '../../elements/span-currency.js';

const
	widgetCoveragesMortgageModel = DataTier.ties.create('widgetCoveragesMortgage', {}),
	template = document.createElement('template');

l10nService.initL10nResource('widgetCoveragesMortgage', {
	he: {
		title: 'ביטוח משכנתא',
		covPay: 'עלות',
		covSum: 'סכום הביטוח',
		loans: 'מספר הלוואות'
	},
	en: {
		title: 'Mortgage insurance',
		conPay: 'Premium',
		covSum: 'Coverage sum',
		loans: 'Total loans'
	}
});

template.innerHTML = `
	<style>
		@import "./commons/styles/base.css";

		:host {
			display: flex;
			flex-direction: column;
			align-items: center;
			width: 10em;
		}

		.titles {
			flex: 0 0 3em;
			text-align: center;
		}

		.row {
			margin: 8px 0;
			width: 100%;
			display: flex;
			justify-content: space-between;
			color: var(--main-dark);
		}

		.row.premium {
			padding: 4px 8px;
			border-radius: 4px;
			box-sizing: border-box;
			color: #fff;
			background-color: var(--main-dark);
		}

		.row > .label {
			align-self: flex-start;
		}
		.row > .value {
			font-weight: 600;
		}
	</style>

	<div class="titles">
		<h5 class="title" data-tie="l10n:widgetCoveragesMortgage.title"></h5>
	</div>
	<div class="row premium">
		<span class="label" data-tie="l10n:widgetCoveragesMortgage.covPay"></span>
		<span-currency class="value" data-tie="widgetCoveragesMortgage:covPay"></span-currency>
	</div>
	<div class="row sum">
		<span class="label" data-tie="l10n:widgetCoveragesMortgage.covSum"></span>
		<span-currency class="value" data-tie="widgetCoveragesMortgage:covSum"></span-currency>
	</div>
	<div class="row loans">
		<span class="label" data-tie="l10n:widgetCoveragesMortgage.loans"></span>
		<span class="value" data-tie="widgetCoveragesMortgage:loans"></span>
	</div>
`;

initComponent('widget-coverages-mortgage', class extends ComponentBase {
	connectedCallback() {
	}

	set data(data) {
		if (data) {
			widgetCoveragesMortgageModel.loans = data.totalLoans;
			widgetCoveragesMortgageModel.covSum = data.totalSum;
			widgetCoveragesMortgageModel.covPay = data.totalPremiumMain + data.totalPremiumRider;
		} else {
			widgetCoveragesMortgageModel.loans = 0;
			widgetCoveragesMortgageModel.covSum = 0;
			widgetCoveragesMortgageModel.covPay = 0;
		}
	}

	get defaultTieTarget() {
		return 'data';
	}

	static get template() {
		return template;
	}
});