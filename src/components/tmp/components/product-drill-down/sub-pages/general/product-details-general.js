import * as DataTier from '../../../../libs/data-tier/data-tier.min.js';
import * as l10n from '../../../../services/localization.js';
import * as productsService from '../../../../services/product-convert-utils.js';
import { ComponentBase, initComponent } from '../../../../libs/rich-component/rich-component.min.js';
import '../../field-text.js';
import '../../field-time.js';
import '../../field-boolean.js';

const
	generalModel = DataTier.ties.create('pgDetails', {
		data: {}
	});

l10n.initL10nResource('pdGeneral', {
	he: import.meta.url.substring(0, import.meta.url.lastIndexOf('/')) + '/l10n/he.json',
	en: import.meta.url.substring(0, import.meta.url.lastIndexOf('/')) + '/l10n/en.json'
});

initComponent('product-details-general', class ProductDetailsGeneral extends ComponentBase {
	set product(product) {
		const tmpModel = {};

		if (product && product.details && product.details.productDetails) {
			const details = product.details.productDetails;

			tmpModel.pensiaType = details.sugkerenpensia;
			tmpModel.pensiaOldNew = details.pensiavatikaohadasha;
			tmpModel.productName = details.shemtochnit;
			tmpModel.productStatus = productsService.translateProductStatus(details.statuspolisaocheshbon);
			tmpModel.iSureAssigned = product.iSureAssigned;

			tmpModel.joinedDate = productsService.translateDateTime(details.taarichhitztarfutmutzar);
			tmpModel.rightsStartDate = productsService.translateDateTime(details.taarichhitztarfutrishon);

			if (details.taarichidkunstatus &&
				details.taarichidkunstatus !== details.taarichhitztarfutmutzar && details.taarichidkunstatus !== details.taarichhitztarfutrishon) {
				tmpModel.lastUpdate = productsService.translateDateTime(details.taarichidkunstatus);
			} else {
				this.shadowRoot.querySelector('.last-update').classList.add('hidden');
			}

			if ([4, 8, 9].indexOf(details.statuspolisaocheshbon) >= 0) {
				tmpModel.riskStart = productsService.translateDateTime(details.taarichtchilariskzmani);
				tmpModel.riskEnd = productsService.translateDateTime(details.tomtokefriskzmani);
			} else {
				this.shadowRoot.querySelector('.risk-period').classList.add('hidden');
			}

			tmpModel.attachment = ProductDetailsGeneral.translateAttachmentConfiscation(details.perutShiabudIkul.hutalshiabud);
			if (!tmpModel.attachment) {
				this.shadowRoot.querySelector('.attachment').classList.add('hidden');
			}

			tmpModel.confiscation = ProductDetailsGeneral.translateAttachmentConfiscation(details.perutShiabudIkul.hutalikul);
			if (!tmpModel.confiscation) {
				this.shadowRoot.querySelector('.confiscation').classList.add('hidden');
			}

			tmpModel.pensionsNumber = details.mispargimlaot ? details.mispargimlaot : '-';

			tmpModel.amendment190 = details.tikun190 === 1;
			if (!tmpModel.amendment190) {
				this.shadowRoot.querySelector('.amendment190').classList.add('hidden');
			}

			if (details.kayamkisuyhizoni === 1) {
				tmpModel.extCoverageType = productsService.translateCoverageType(details.kisuyishykvozati);
			} else {
				this.shadowRoot.querySelector('.externalCoverage').classList.add('hidden');
			}

			if (details.netuneiAmitOmevutach && details.netuneiAmitOmevutach.misparzihuy !== product.details.saver.misparzihuylakoach) {
				tmpModel.insuredRefId = details.netuneiAmitOmevutach.misparzihuy;
			} else {
				this.shadowRoot.querySelector('.insuredRefId').classList.add('hidden');
			}

			if (Array.isArray(details.pirteiTaktziv)) {
				details.pirteiTaktziv.forEach(b => {
					if (!b.perutYitrotLesofShanaKodemet) return;
					if (b.perutYitrotLesofShanaKodemet.yitratsofshana) {
						tmpModel.totalBalanceELY = tmpModel.totalBalanceELY || 0;
						tmpModel.totalBalanceELY += b.perutYitrotLesofShanaKodemet.yitratsofshana;
					}
					if (b.perutYitrotLesofShanaKodemet.erechpidyonsofshana) {
						tmpModel.totalRedeemableELY = tmpModel.totalRedeemableELY || 0;
						tmpModel.totalRedeemableELY += b.perutYitrotLesofShanaKodemet.erechpidyonsofshana;
					}
					if (b.perutYitrotLesofShanaKodemet.erechmesolaksofshana) {
						tmpModel.totalClearedELY = tmpModel.totalClearedELY || 0;
						tmpModel.totalClearedELY += b.perutYitrotLesofShanaKodemet.erechmesolaksofshana;
					}
					if (b.perutYitrotLesofShanaKodemet.yiskonyitratkesafim) {
						tmpModel.totalByActuaryELY = tmpModel.totalByActuaryELY || 0;
						tmpModel.totalByActuaryELY += b.perutYitrotLesofShanaKodemet.yiskonyitratkesafim;
					}
				});
				if (!tmpModel.totalBalanceELY) {
					this.shadowRoot.querySelector('.total-ely').classList.add('hidden');
				}
				if (!tmpModel.totalRedeemableELY) {
					this.shadowRoot.querySelector('.redeemable-ely').classList.add('hidden');
				}
				if (!tmpModel.totalClearedELY) {
					this.shadowRoot.querySelector('.cleared-ely').classList.add('hidden');
				}
				if (!tmpModel.totalByActuaryELY) {
					this.shadowRoot.querySelector('.actuary-ely').classList.add('hidden');
				} else {
					this.shadowRoot.querySelector(tmpModel.totalByActuaryELY > 0 ? '.actuary-ely .cleared' : '.actuary-ely .added').classList.add('hidden');
					tmpModel.totalByActuaryELY = Math.abs(tmpModel.totalByActuaryELY);
				}
			} else {
				console.warn('no balances? wrong product!?');
			}

			if (details.kolelzakautagach === 1) {
				tmpModel.debenture = details.shioragachmeuadot;
			} else {
				this.shadowRoot.querySelector('.debenture').classList.add('hidden');
			}
			if (details.avtachttesoa === 1) {
				tmpModel.promisedReturnUntil = productsService.translateDateTime(details.taarichciumavtachttesoa);
			} else {
				this.shadowRoot.querySelector('.promisedReturnUntil').classList.add('hidden');
			}
			tmpModel.distributor = details.mprmefitzbeyatzran;

			if (Array.isArray(details.perutMeyupeKoach) && details.perutMeyupeKoach.some(r => r.kayammeyupekoach === 1)) {
				const representatives = product.details.productDetails.perutMeyupeKoach;

				tmpModel.representatives = [];
				representatives
					.filter(r => r && r.kayammeyupekoach === 1)
					.forEach(r => {
						const tmpR = {
							reprType: productsService.translateRepresentativeType(r.sugzihuy),
							reprRefId: r.misparzihuy,
							reprName: r.shemmeyupekoach,
							reprFrom: productsService.translateDateTime(r.taarichminuysochen)
						};

						tmpModel.representatives.push(tmpR);
					});
			} else {
				this.shadowRoot.querySelector('.representatives').classList.add('hidden');
			}
		}

		generalModel.data = tmpModel;
	}

	static translateAttachmentConfiscation(value) {
		if (value === 1) {
			return true;
		} else if (value === 2) {
			return false;
		} else {
			return null;
		}
	}

	static get htmlUrl() { return import.meta.url.replace(/js$/, 'htm'); }
});