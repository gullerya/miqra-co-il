import * as DataTier from '../../../../libs/data-tier/data-tier.min.js';
import '../../../../libs/data-tier-list/data-tier-list.min.js';
import * as l10n from '../../../../services/localization.js';
import * as productsService from '../../../../services/product-convert-utils.js';
import { ComponentBase, initComponent } from '../../../../libs/rich-component/rich-component.min.js';
import '../../../../components/grid/grid.js';

const
	template = document.createElement('template'),
	loansTieKey = Symbol('loan.details.key');

l10n.initL10nResource('loanLabels', {
	he: {
		title: 'הלוואה',
		loanLevel: 'רמת הלוואה',
		loanPeriod: 'תקופת הלוואה',
		sum: 'סכום',
		interest: 'ריבית',
		left: 'יתרה לתשלום',
		payback: 'החזר',
		linkageType: 'סוג הצמדה',
		calcType: 'סוג חישוב'
	},
	en: {
		title: 'Loan',
		loanLevel: 'Loan level',
		loanPeriod: 'Loan period',
		sum: 'Sum',
		interest: 'Interest',
		left: 'Left to pay',
		payback: 'Payback',
		linkageType: 'Linkage type',
		calcType: 'Calculation type'
	}
});

initComponent('product-details-loans', class extends ComponentBase {
	constructor() {
		super();
		this[loansTieKey] = DataTier.ties.create('loansData');
	}

	disconnectedCallback() {
		DataTier.ties.remove(this[loansTieKey]);
	}

	set product(product) {
		const loansData = [];

		if (product && product.details && product.details.productDetails) {
			const details = product.details.productDetails;

			if (Array.isArray(details.halvaa) && details.halvaa.length) {
				details.halvaa
					.filter(nativeLoan => nativeLoan && nativeLoan.yeshhalvaabamutzar !== 2)
					.forEach(nativeLoan => {
						loansData.push({
							refId: nativeLoan.misdarsidurishelhahalvaa,
							loanLevel: productsService.translateLoanLevel(nativeLoan.ramathalvaa),
							loanPeriod: productsService.translateDateTime(nativeLoan.taarichkabalathalvaa) + ' - ' + productsService.translateDateTime(nativeLoan.taarichsiyumhalvaa),
							sum: nativeLoan.schumhalvaa,
							interest: nativeLoan.ribit, // + ', ' + productsService.translateInterestType(nativeLoan.sugribit),
							left: nativeLoan.yitrathalvaa,
							payback: nativeLoan.schumhechzertkufati, // + ' ' + productsService.translateLoanPaymentPeriod(nativeLoan.tadiruthechzerhalvaa),
							linkageType: productsService.translateLinkage(nativeLoan.sughatznmada),
							calcType: productsService.translateLoanPaymentType(nativeLoan.sughechzer)
						});
					});
			}
		}

		this[loansTieKey].splice(0, this[loansTieKey].length, ...loansData);
	}

	static get template() {
		return template;
	}
});

template.innerHTML = `
	<style>
		:host {
			flex: 1;
			padding: 10px 30px;
			display: flex;
			flex-direction: column;
			overflow: auto;
		}
	</style>

	<template is="data-tier-item-template" data-tie="loansData">
		<data-section>
			<div slot="title">
				<span data-tie="l10n:loanLabels.title"></span>
				&nbsp;
				<span data-tie="item:refId"></span>
			</div>
			<div>
				<text-field data-tie="l10n:loanLabels.loanLevel => label, item:loanLevel => l10nValue"></text-field>
				<text-field data-tie="l10n:loanLabels.loanPeriod => label, item:loanPeriod => l10nValue"></text-field>
				<text-field data-tie="l10n:loanLabels.sum => label, item:sum"></text-field>
				<text-field data-tie="l10n:loanLabels.interest => label, item:interest"></text-field>
			</div>
			<div>
				<text-field data-tie="l10n:loanLabels.left => label, item:left"></text-field>
				<text-field data-tie="l10n:loanLabels.payback => label, item:payback"></text-field>
				<text-field data-tie="l10n:loanLabels.linkageType => label, item:linkageType => l10nValue"></text-field>
				<text-field data-tie="l10n:loanLabels.calcType => label, item:calcType => l10nValue"></text-field>
			</div>
		</data-section>
	</template>
`;