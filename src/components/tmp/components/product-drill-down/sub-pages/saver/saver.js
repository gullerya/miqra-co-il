import * as DataTier from '../../../../libs/data-tier/data-tier.min.js';
import * as l10n from '../../../../services/localization.js';
import * as productsService from '../../../../services/product-convert-utils.js';
import { ComponentBase, initComponent } from '../../../../libs/rich-component/rich-component.min.js';
import '../../field-text.js';
import '../../field-time.js';
import '../../field-boolean.js';

const
	sdTieKey = Symbol('saver.details.key');

l10n.initL10nResource('pdCustomer', {
	he: import.meta.url.substring(0, import.meta.url.lastIndexOf('/')) + '/l10n/he.json',
	en: import.meta.url.substring(0, import.meta.url.lastIndexOf('/')) + '/l10n/en.json'
});

initComponent('product-details-saver', class extends ComponentBase {
	constructor() {
		super();
		this[sdTieKey] = DataTier.ties.create('customerDetails');
	}

	disconnectedCallback() {
		DataTier.ties.remove(this[sdTieKey]);
	}

	set product(product) {
		const tmpModel = {};

		if (product && product.details && product.details.saver) {
			const sd = product.details.saver;

			tmpModel.fullName = [sd.shemprati, sd.shemmishpacha].join(' ');
			if (sd.shemmishpachakodem) {
				tmpModel.fullName += ' (' + sd.shemmishpachakodem + ')';
			}
			tmpModel.gender = productsService.translateGender(sd.min);
			tmpModel.legalId = trimLegalId(sd.misparzihuylakoach);
			tmpModel.birthday = productsService.translateDateTime(sd.taarichleyda);
			if (sd.ptira === 1) {
				tmpModel.deathday = productsService.translateDateTime(sd.taarichptira);
			}
			tmpModel.marital = productsService.translateMarital(sd.matzavmishpachti, sd.min);
			tmpModel.children = sd.misparyeladim;

			tmpModel.email = sd.email;
			tmpModel.cellPhone = /^[-+0-9 ]+$/.test(sd.misparcellulari) ? sd.misparcellulari : '';
			tmpModel.landPhone = /^[-+0-9 ]+$/.test(sd.mispartelephonekavi) ? sd.mispartelephonekavi : '';
			tmpModel.address = productsService.translateAddress(
				sd.eretz,
				sd.shemyishuv,
				sd.shemrechov,
				sd.misparbait,
				sd.misparknisa,
				sd.mispardira,
				sd.mikud,
				sd.tadoar);

			if (sd.hearot) {
				tmpModel.remarks = sd.hearot;
			} else {
				this.shadowRoot.querySelector('.remarks').classList.add('hidden');
			}

			if (product.details.productDetails.ktovetLemishloach &&
				(product.details.productDetails.ktovetLemishloach.shemyishuv ||
					product.details.productDetails.ktovetLemishloach.shemrechov ||
					product.details.productDetails.ktovetLemishloach.mikud ||
					product.details.productDetails.ktovetLemishloach.tadoar)) {
				const aa = product.details.productDetails.ktovetLemishloach,
					serializedAA = productsService.translateAddress(
						aa.eretz,
						aa.shemyishuv,
						aa.shemrechov,
						aa.misparbait,
						sd.misparknisa,
						sd.mispardira,
						aa.mikud,
						aa.tadoar);
				if (serializedAA !== tmpModel.address) {
					tmpModel.altAddress = serializedAA;
				} else {
					this.shadowRoot.querySelector('.alt-address').classList.add('hidden');
				}
			} else {
				this.shadowRoot.querySelector('.alt-address').classList.add('hidden');
			}
		}

		Object.assign(this[sdTieKey], tmpModel);
	}

	static get htmlUrl() { return import.meta.url.replace(/js$/, 'htm'); }
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