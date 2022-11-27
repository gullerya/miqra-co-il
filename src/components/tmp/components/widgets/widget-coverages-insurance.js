import * as DataTier from '../../libs/data-tier/data-tier.min.js';
import { ComponentBase, initComponent } from '../../libs/rich-component/rich-component.min.js';
import * as l10nService from '../../services/localization.js';
import * as productUtils from '../../services/product-convert-utils.js';
import '../../elements/span-currency.js';
import '../../elements/span-l10n.js';

const
	widgetCoveragesInsuranceModel = DataTier.ties.create('widgetCoveragesInsurance', {}),
	template = document.createElement('template');

l10nService.initL10nResource('widgetCoveragesInsurance', {
	he: {
		title: 'ביטוחים כלליים',
		subtitle: 'סיכום כיסויים ביטוחיים',
		premiumLabel: 'עלות'
	},
	en: {
		title: 'General insurances',
		subtitle: 'General insurances summary',
		premiumLabel: 'Premium'
	}
});

template.innerHTML = `
	<style>
		@import "./commons/styles/base.css";

		:host {
			display: flex;
			flex-direction: column;
			align-items: center;
			width: 14em;
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
		}

		.row.premium {
			padding: 4px 8px;
			border-radius: 4px;
			box-sizing: border-box;
			color: #fff;
			background-color: var(--main-dark);
		}

		.row > .value {
			font-weight: 600;
		}
	</style>

	<div class="titles">
		<h5 data-tie="l10n:widgetCoveragesInsurance.title"></h5>
		<span class="subtitle" data-tie="l10n:widgetCoveragesInsurance.subtitle"></span>
	</div>
	<div class="row premium">
		<span class="label" data-tie="l10n:widgetCoveragesInsurance.premiumLabel"></span>
		<span-currency class="total-sum" data-tie="widgetCoveragesInsurance:totalPremium"></span-currency>
	</div>
	<template is="data-tier-item-template" data-tie="widgetCoveragesInsurance:coverages">
		<div class="row">
			<span-l10n class="label" data-tie="item:label"></span-l10n>
			<span-currency class="value" data-tie="item:value"></span-currency>
		</div>
	</template>
`;

initComponent('widget-coverages-insurance', class extends ComponentBase {
	set data(data) {
		const tmpCovs = [];
		let tmpTotal = 0;
		if (data) {
			Object.keys(data).forEach(covType => {
				const covData = data[covType];
				tmpTotal += covData.totalPremium;
				tmpCovs.push({
					label: productUtils.translateCoverageType(covType),
					value: covData.totalSum
				});
			});
		}
		widgetCoveragesInsuranceModel.totalPremium = tmpTotal;
		widgetCoveragesInsuranceModel.coverages = tmpCovs;
	}

	get defaultTieTarget() {
		return 'data';
	}

	static get template() {
		return template;
	}
});