import * as DataTier from '../../../../libs/data-tier/data-tier.min.js';
import '../../../../libs/data-tier-list/data-tier-list.min.js';
import * as l10n from '../../../../services/localization.js';
import * as productsService from '../../../../services/product-convert-utils.js';
import { ComponentBase, initComponent } from '../../../../libs/rich-component/rich-component.min.js';
import '../../../../elements/span-currency.js';
import '../../field-text.js';
import '../../dd-section.js';

const
	profeesDetailsTieKey = Symbol('profees.details.key');

initComponent('product-details-profees', class extends ComponentBase {
	constructor() {
		super();
		this[profeesDetailsTieKey] = DataTier.ties.create('profeesDetails');
	}

	disconnectedCallback() {
		DataTier.ties.remove(this[profeesDetailsTieKey]);
	}

	set product(product) {
		const model = {
			investments: []
		};

		if (product && product.details && product.details.productDetails) {
			const details = product.details.productDetails;

			model.thisYear = productsService.translateDateTime(details.taarichnechonut).getFullYear();
			model.totalProfitLoss = details.tsua.revachhefsedbenikoihozahot || 0;
			model.signType = details.tsua.simanrevachhefsed === 1 || !details.tsua.simanrevachhefsed ? 'pos' : 'neg';
			model.yieldNet = details.tsua.sheurtsuaneto || 0;
			if (details.kolelzakautagach === 1) {
				model.yieldBond = details.tsua.sheurtsuamovtachatmeyoadot || 0;
			} else {
				this.shadowRoot.querySelector('.yield-bond').classList.add('hidden');
			}

			details.pirteiTaktziv.forEach(b => {
				if (!Array.isArray(b.perutMasluleiHashkaa)) return;
				b.perutMasluleiHashkaa.forEach(ip => {
					const
						ipId = ip.kodmaslulhashkaa,
						tmpIp = model.investments.find(ip => ip.refId === ipId);
					if (tmpIp) {
						//  update an existing investment path
						tmpIp.total += ip.schumtzvirabamaslul;
						tmpIp.totals.push({
							depositType: productsService.translateInvestmentDepositType(ip.kodsughafrasha),
							depositTotal: ip.schumtzvirabamaslul,
							depositPercent: ip.achuzhafkadalehashkaa
						});
					} else {
						//  init new investment path
						model.investments.push({
							refId: ipId,
							type: productsService.translateInvestmentType(ip.kodsugmaslul),
							name: ip.shemmaslulhashkaa,
							total: ip.schumtzvirabamaslul,
							yieldNet: ip.tsuaneto,
							feeDepositPercent: ip.sheurdmeinihulhafkada,
							feeAccumulPercent: ip.sheurdmeinihulhisachon,
							feeDepositMivnePercent: ip.sheurdmeinihulhafkadamivne,
							feeAccumulMivnePercent: ip.sheurdmeinihulhisachonmivne,
							feeOther: ip.dmeinihulacherim,
							totals: [{
								depositType: productsService.translateInvestmentDepositType(ip.kodsughafrasha),
								depositTotal: ip.schumtzvirabamaslul,
								depositPercent: ip.achuzhafkadalehashkaa
							}]
						});
					}
				});
			});
		}

		Object.assign(this[profeesDetailsTieKey], model);
	}

	static get htmlUrl() { return import.meta.url.replace(/js$/, 'htm'); }
});

l10n.initL10nResource('pddProfees', {
	he: {
		total: 'סך',
		profit: 'רווח',
		loss: 'הפסד',
		woExpenses: 'בניכוי הוצאות בשנת',
		yieldNet: 'תשואה נטו',
		yieldBond: 'תשואת אג"ח',
		pathName: 'שם מסלול',
		totalIP: 'סך צבירה במסלול',
		feeDepositPercent: 'דמי ניהול הפקדה',
		feeAccumulPercent: 'דמי ניהול צבירה',
		feeDepositMivnePercent: 'דמי ניהול הפקדה (מבנה)',
		feeAccumulMivnePercent: 'דמי ניהול צבירה (מבנה)',
		feeOther: 'דמי ניהול אחרים'
	},
	en: {
		total: 'Total',
		profit: 'profit',
		loss: 'loss',
		woExpenses: 'excluding expenses in',
		yieldNet: 'Yield net',
		yieldBond: 'Promised bond yield',
		pathName: 'Path name',
		totalIP: 'Total investment sum',
		feeDepositPercent: 'Deposit fee',
		feeAccumulPercent: 'Accumulation fee',
		feeDepositMivnePercent: 'Deposit fee (stated)',
		feeAccumulMivnePercent: 'Accumulation fee (stated)',
		feeOther: 'Other fees'
	}
});