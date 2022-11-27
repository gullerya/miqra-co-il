import * as DataTier from '../../../../libs/data-tier/data-tier.min.js';
import * as l10n from '../../../../services/localization.js';
import * as productsService from '../../../../services/product-convert-utils.js';
import { ComponentBase, initComponent } from '../../../../libs/rich-component/rich-component.min.js';
import '../../../../components/grid/grid.js';

const
	DEFAULT_MODEL = {
		relatives: {
			meta: {},
			data: []
		}
	},
	relativesModel = DataTier.ties.create('rsDetails', DEFAULT_MODEL),
	template = document.createElement('template');

l10n.initL10nResource('rsLabels', {
	he: {
		title: 'שארים',
		fullName: 'שם',
		relation: 'ייחוס',
		legalId: 'תעודה מזהה',
		birthday: 'תאריך לידה'
	},
	en: {
		title: 'Relatives',
		fullName: 'Name',
		relation: 'Relation',
		legalId: 'Legal ID',
		birthday: 'Birthday'
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

		.data {
			flex: 1;
		}
	</style>

	<data-section>
		<span slot="title" data-tie="l10n:rsLabels.title"></span>
		<data-grid class="data headless" data-tie="rsDetails:relatives"></data-grid>
	</data-section>
`;

initComponent('product-details-relatives', class extends ComponentBase {
	set product(product) {
		let newModel = DEFAULT_MODEL;

		if (product && product.details && product.details.productDetails) {
			const details = product.details.productDetails;

			if (details.netuneiSheerim && Array.isArray(details.netuneiSheerim.sheer)) {
				const tmpModel = { relatives: { meta: {}, data: [] } };
				this.prepareData(details.netuneiSheerim.sheer, tmpModel.relatives);
				newModel = tmpModel;
			}
		}
		Object.assign(relativesModel, newModel);
	}

	prepareData(input, output) {
		output.meta = {
			fullName: { labelTie: 'l10n:rsLabels.fullName', order: 1 },
			relation: { labelTie: 'l10n:rsLabels.relation', type: 'tie', order: 2 },
			legalId: { labelTie: 'l10n:rsLabels.legalId', order: 3 },
			birthday: { labelTie: 'l10n:rsLabels.birthday', order: 4 }
		}

		//	transform the data
		const tmpRels = [];
		input.filter(r => r && r.sugzika)
			.sort((r1, r2) => r2.taarichleida < r1.taarichleida ? 1 : -1)
			.forEach(r => {
				tmpRels.push({
					fullName: [r.shempratisheerim, r.shemmishpachasheerim].join(' '),
					relation: productsService.translateFamilyRelation(r.sugzika),
					legalId: trimLegalId(r.misparzihuysheerim),
					birthday: l10n.stringifyDateTime(productsService.translateDateTime(r.taarichleida))
				});
			});

		output.data = tmpRels;
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