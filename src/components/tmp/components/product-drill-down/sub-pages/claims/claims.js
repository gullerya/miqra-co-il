import * as DataTier from '../../../../libs/data-tier/data-tier.min.js';
import '../../../../libs/data-tier-list/data-tier-list.min.js';
import * as l10n from '../../../../services/localization.js';
import * as productsService from '../../../../services/product-convert-utils.js';
import { ComponentBase, initComponent } from '../../../../libs/rich-component/rich-component.min.js';
import '../../../../components/grid/grid.js';

const
	template = document.createElement('template'),
	claimsTieKey = Symbol('claims.details.key');

l10n.initL10nResource('claimLabels', {
	he: {
		title: 'תביעה',
		coverage: 'כיסוי',
		claimType: 'סוג תביעה',
		claimStatus: 'סטאטוס',
		statusDate: 'תאריך סטאטוס',
		payment: 'תשלום',
		paymentStartDate: 'תחילת תשלום',
		approvedPercentage: 'אחוז מאושר',
		disabilityPercentage: 'אחוז נכות'
	},
	en: {
		title: 'Claim',
		coverage: 'Coverage',
		claimType: 'Claim type',
		claimStatus: 'Status',
		statusDate: 'Status date',
		payment: 'Payment',
		paymentStartDate: 'Payment start',
		approvedPercentage: 'Approved percent',
		disabilityPercentage: 'Disability percent'
	}
});

initComponent('product-details-claims', class extends ComponentBase {
	constructor() {
		super();
		this[claimsTieKey] = DataTier.ties.create('claimsData');
	}

	disconnectedCallback() {
		DataTier.ties.remove(this[claimsTieKey]);
	}

	set product(product) {
		const claimsData = [];

		if (product && product.details && product.details.productDetails) {
			const details = product.details.productDetails;

			//  claims data
			if (Array.isArray(details.pirteyTvia) && details.pirteyTvia.length) {
				details.pirteyTvia
					.filter(nativeClaim => nativeClaim && nativeClaim.yeshtvia !== 2)
					.forEach(nativeClaim => {
						claimsData.push({
							refId: nativeClaim.mispartviabeyatzran,
							coverage: nativeClaim.shemkisuibeyatzran + ' (' + nativeClaim.misparkisuibeyatzran + ')',
							claimType: productsService.translateClaimType(nativeClaim.sughatviaa),
							claimStatus: productsService.translateClaimStatus(nativeClaim.kodstatustviaa),
							statusDate: productsService.translateDateTime(nativeClaim.taarichstatustvia),
							payment: nativeClaim.schumtviameushar, // + ' ' + productsService.translateClaimPaymentType(nativeClaim.ofentashlum),
							paymentStartDate: productsService.translateDateTime(nativeClaim.taarichtechilattashlum),
							approvedPercentage: nativeClaim.achuzmeusharokashichrur,
							disabilityPercentage: nativeClaim.achuznechut
						});
					});
			}
		}

		this[claimsTieKey].splice(0, this[claimsTieKey].length, ...claimsData);
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

	<template is="data-tier-item-template" data-tie="claimsData">
		<data-section>
			<div slot="title">
				<span data-tie="l10n:claimLabels.title"></span>
				&nbsp;
				<span data-tie="item:refId"></span>
			</div>
			<div>
				<text-field data-tie="l10n:claimLabels.coverage => label, item:coverage"></text-field>
				<text-field data-tie="l10n:claimLabels.claimType => label, item:claimType => l10nValue"></text-field>
				<text-field data-tie="l10n:claimLabels.claimStatus => label, item:claimStatus => l10nValue"></text-field>
				<time-field data-tie="l10n:claimLabels.statusDate => label, item:statusDate"></time-field>
			</div>
			<div>
				<text-field data-tie="l10n:claimLabels.payment => label, item:payment"></text-field>
				<time-field data-tie="l10n:claimLabels.paymentStartDate => label, item:paymentStartDate"></time-field>
				<text-field data-tie="l10n:claimLabels.approvedPercentage => label, item:approvedPercentage"></text-field>
				<text-field data-tie="l10n:claimLabels.disabilityPercentage => label, item:disabilityPercentage"></text-field>
			</div>
		</data-section>
	</template>
`;