import * as DataTier from '../../../../libs/data-tier/data-tier.min.js';
import * as l10n from '../../../../services/localization.js';
import * as productsService from '../../../../services/product-convert-utils.js';
import { ComponentBase, initComponent } from '../../../../libs/rich-component/rich-component.min.js';
import '../../../../components/grid/grid.js';

const
	DEFAULT_MODEL = {
		beneficiariesUpdateDate: null,
		coverageGroups: []
	},
	beneficiariesModel = DataTier.ties.create('bsDetails', {
		data: DEFAULT_MODEL
	}),
	template = document.createElement('template');

template.innerHTML = `
	<style>
		:host {
			flex: 1;
			padding: 30px;
			display: flex;
			flex-direction: column;
			overflow-x: hidden;
			overflow-y: auto;
		}

		:host > .coverage-group > .coverages-title {
			margin-top: 20px;
			font-size: 120%;
		}

		.hidden {
			display: none;
		}

		.no-bens-notice {
			display: inline-block;
			margin: 16px 0;
			color: var(--main-red);
		}
	</style>

	<time-field class="info-row"
		data-tie="l10n:bsLabels.beneficiariesUpdateDate => label, bsDetails:data.beneficiariesUpdateDate">
	</time-field>

	<template is="data-tier-item-template" data-tie="bsDetails:data.coverageGroups">
		<div class="coverage-group">
			<div class="coverages-title">
				<span data-tie="l10n:bsLabels.coverages"></span>
				<v-splitter transparent></v-splitter>
				<span data-tie="item:coverages"></span>
			</div>
		</div>
		<data-grid data-tie="item:benGridData, item:dataVisibility => className"></data-grid>
		<div data-tie="item:noBenVis => className">
			<span class="no-bens-notice" data-tie="l10n:bsLabels.noBeneficiaries"></span>
		</div>
	</template>
`;

initComponent('product-details-beneficiaries', class BeneficiariesDetails extends ComponentBase {
	set product(product) {
		let newModel = DEFAULT_MODEL;

		if (product && product.details && product.details.productDetails) {
			const details = product.details.productDetails;
			const tmpModel = { coverageGroups: [] };
			tmpModel.beneficiariesUpdateDate = productsService.translateDateTime(details.taarichachronmotavmuvet);
			tmpModel.beneficiariesUpdateDate = !tmpModel.beneficiariesUpdateDate || tmpModel.beneficiariesUpdateDate.getFullYear() < 1920 ? null : tmpModel.beneficiariesUpdateDate;

			if (details.kisuim && details.kisuim.length) {
				const nc = details.kisuim;
				BeneficiariesDetails.prepareData(nc, tmpModel);
			}
			newModel = tmpModel;
		}
		beneficiariesModel.data = newModel;
	}

	static prepareData(nativeCoverages, tmpModel) {
		//	we'll need to go over the coverages and pick out the beneficiaries from there
		nativeCoverages
			.filter(nc => nc && nc.zihuiKisui)
			.map(nc => nc.zihuiKisui)
			.forEach(nc => {
				if (nc.mutav && nc.mutav.length && nc.mutav.some(m => m.sugzihuymutav !== 7)) {
					const tmpBens = [];
					nc.mutav
						.filter(m => m && m.sugzihuymutav !== 7)
						.forEach(m => {
							tmpBens.push({
								type: productsService.translateBeneficiaryType(m.sugzihuymutav),
								name: [m.shempratimutav, m.shemmishpachamutav].join(' '),
								legalId: trimLegalId(m.misparzihuymutav),
								percent: m.achuzmutav,
								definition: productsService.translateBeneficiaryDefinition(m.hagdaratmutav),
								case: productsService.translateBeneficiaryCase(m.mahutmutav)
							});
						});
					let cg = BeneficiariesDetails.findSameBeneficiariesGroup(tmpModel.coverageGroups, tmpBens);
					if (!cg) {
						cg = {
							coverages: nc.shemkisuiyatzran,
							benGridData: {
								meta: {
									type: { labelTie: 'l10n:bsLabels.type', type: 'tie', order: 1 },
									name: { labelTie: 'l10n:bsLabels.fullName', order: 2 },
									legalId: { labelTie: 'l10n:bsLabels.legalId', order: 3 },
									percent: { labelTie: 'l10n:bsLabels.percent', order: 4 },
									definition: { labelTie: 'l10n:bsLabels.definitionType', type: 'tie', order: 5 },
									case: { labelTie: 'l10n:bsLabels.beneficiaryCase', type: 'tie', order: 6 }
								},
								data: tmpBens
							},
							dataVisibility: '',
							noBenVis: 'hidden'
						};
						tmpModel.coverageGroups.push(cg);
					} else {
						cg.coverages += ', ' + nc.shemkisuiyatzran;
					}
				} else {
					tmpModel.coverageGroups.push({
						coverages: nc.shemkisuiyatzran,
						dataVisibility: 'hidden',
						noBenVis: ''
					});
				}
			});
	}

	static findSameBeneficiariesGroup(cGroups, bSet) {
		for (const cg of cGroups) {
			const eSet = cg.beneficiaries;
			if (eSet && eSet.length === bSet.length && bSet.every(i => eSet.some(e => e.type === i.type && e.legalId === i.legalId))) {
				return cg;
			}
		}
	}

	static get template() {
		return template;
	}
});

function trimLegalId(input) {
	if (!input || !input.length) {
		return input;
	}

	if (input.length > 9) {
		return input.slice(-9);
	} else {
		return input;
	}
}

l10n.initL10nResource('bsLabels', {
	he: {
		beneficiariesUpdateDate: 'תאריך עדכון אחרון',
		coverages: 'עבור כיסויים:',
		noBeneficiaries: 'לא נקבעו מוטבים',
		type: 'סוג מוטב',
		fullName: 'שם',
		legalId: 'תעודה מזהה',
		percent: 'אחוז',
		definitionType: 'הגדרה',
		beneficiaryCase: 'מוטב למקרה'
	},
	en: {
		beneficiariesUpdateDate: 'Last updat date',
		coverages: 'For coverages:',
		noBeneficiaries: 'No beneficiaries defined',
		type: 'Type',
		fullName: 'Name',
		legalId: 'Legal ID',
		percent: 'Percent',
		definitionType: 'Definitions',
		beneficiaryCase: 'Case'
	}
});