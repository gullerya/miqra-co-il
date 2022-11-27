import * as DataTier from '../../libs/data-tier/data-tier.min.js';
import * as l10n from '../../services/localization.js';
import * as productsService from '../../services/product-convert-utils.js';
import { ComponentBase, initComponent } from '../../libs/rich-component/rich-component.min.js';
import '../../components/fund-icon.js';
import '../../elements/span-l10n.js';
import '../../elements/select-list.js';
import '../../elements/switchable-pane.js';
import './sub-pages/general/product-details-general.js';
import './sub-pages/saver/saver.js';
import './sub-pages/beneficiaries/beneficiaries.js';
import './sub-pages/relatives/relatives.js';
import './sub-pages/employments/employments.js';
import './sub-pages/savings/pd-savings.js';
import './sub-pages/deposits/deposits.js';
import './sub-pages/fees/fees.js';
import './sub-pages/money-traces/money-traces.js';
import './sub-pages/profees/profees.js';
import './sub-pages/loans/loans.js';
import './sub-pages/claims/claims.js';
import './sub-pages/casses/casses.js';
import './sub-pages/insurances/pd-insurances.js';
import './dd-section.js';

const
	productDataKey = Symbol('product.data.key'),
	productDetailsModel = DataTier.ties.create('productDetails', {});

l10n.initL10nResource('productDrillDownMain', {
	he: import.meta.url.substring(0, import.meta.url.lastIndexOf('/')) + '/l10n/he.json',
	en: import.meta.url.substring(0, import.meta.url.lastIndexOf('/')) + '/l10n/en.json'
});

initComponent('product-drill-down', class extends ComponentBase {
	connectedCallback() {
		this.shadowRoot.querySelector('.content-pane').addEventListener('switch', e => {
			e.target.currentPane.product = this[productDataKey];
		});
		productDetailsModel.selectedSubpage = this.shadowRoot.querySelector('.subpage-selector').firstElementChild.dataset.value;
	}

	set product(product) {
		this[productDataKey] = product;

		this.hideIrrelevantSubpages(product);
		if (this.shadowRoot.querySelector('.subpage-selector').firstElementChild) {
			productDetailsModel.selectedSubpage = this.shadowRoot.querySelector('.subpage-selector').firstElementChild.dataset.value;
		}

		if (product && product.details && product.details.productDetails) {
			const details = product.details.productDetails;
			productDetailsModel.fund = product.fund;
			productDetailsModel.name = productsService.translateProductType(product.details.productType, details.sugkerenpensia);
			productDetailsModel.refId = details.misparpolisaoheshbon;
			productDetailsModel.status = productsService.translateProductStatus(details.statuspolisaocheshbon);
			productDetailsModel.dataFrom = l10n.stringifyDateTime(productsService.translateDateTime(details.taarichnechonut), 'dd/mm/yyyy');
		}

		const selectedSubpage = this.shadowRoot.querySelector('.content-pane').currentPane;
		if (selectedSubpage) {
			selectedSubpage.product = this[productDataKey];
		}
	}

	hideIrrelevantSubpages(product) {
		if (product && product.details && product.details.productDetails) {
			const
				details = product.details.productDetails,
				pType = product.details.productType;

			//	move coverages to replace general in purely insurance products
			if (pType === 6 || pType === 7 || pType === 8) {
				this.shadowRoot.querySelector('.subpage-selector').replaceChild(
					this.shadowRoot.querySelector('.selectable.insurances'),
					this.shadowRoot.querySelector('.selectable.general')
				)
			}

			//	remove beneficiaries
			if (pType === 3 || pType === 7) {
				this.shadowRoot.querySelector('.selectable.beneficiaries').remove();
			}

			//	remove relatives
			if (pType !== 2) {
				this.shadowRoot.querySelector('.selectable.relatives').remove();
			}

			//	remove employments
			if (!details.pirteiTaktziv.some(pt => pt.pirteiHaasaka && Object.keys(pt.pirteiHaasaka).length)) {
				this.shadowRoot.querySelector('.selectable.employments').remove();
			}

			//	remove savings
			if (pType === 6 || pType === 7 || pType === 8) {
				this.shadowRoot.querySelector('.selectable.savings').remove();
			}

			//	remove deposits
			if (pType === 6 || pType === 7 || pType === 8 || details.statuspolisaocheshbon === 2) {
				this.shadowRoot.querySelector('.selectable.deposits').remove();
			}

			//	remove fees
			if (pType === 6 || pType === 7 || pType === 8) {
				this.shadowRoot.querySelector('.selectable.fees').remove();
			}

			//	remove money traces
			if (pType === 6 || pType === 7 || pType === 8 ||
				!details.pirteiTaktziv.some(pt => pt.meshichaNiud && pt.meshichaNiud.length && Object.keys(pt.meshichaNiud[0]).length)) {
				this.shadowRoot.querySelector('.selectable.money-traces').remove();
			}

			//	remove loans
			if (!Array.isArray(details.halvaa) || !details.halvaa.length || details.halvaa.every(l => l.yeshhalvaabamutzar === 2)) {
				this.shadowRoot.querySelector('.selectable.loans').remove();
			}

			//	remove claims
			if (!Array.isArray(details.pirteyTvia) || !details.pirteyTvia.length || details.pirteyTvia.every(c => c.yeshtvia === 2)) {
				this.shadowRoot.querySelector('.selectable.claims').remove();
			}

			//	remove profees
			if (pType === 6 || pType === 7 || pType === 8) {
				this.shadowRoot.querySelector('.selectable.profees').remove();
			}

			//	remove casses
			if (pType === 4 || pType === 6 || pType === 7 || pType === 8) {
				this.shadowRoot.querySelector('.selectable.casses').remove();
			}

			//	remove insurances
			if (pType === 3 || pType === 4) {
				this.shadowRoot.querySelector('.selectable.insurances').remove();
			}
		}
	}

	get defaultTieTarget() {
		return 'product';
	}

	static get htmlUrl() { return import.meta.url.replace(/js$/, 'htm'); }
});