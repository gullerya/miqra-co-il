import * as DataTier from '../../../libs/data-tier/data-tier.min.js';
import { initComponent, ComponentBase } from '../../../libs/rich-component/rich-component.min.js';
import * as l10n from '../../../services/localization.js';
import '../../../elements/splitter.js';
import '../../../components/grid/grid.js';
import '../../../components/fund-icon.js';
import { openModal } from '../../../components/modal.js';
import '../../../components/signature-pad.js';

import * as productsService from '../../../services/products.js';
import * as userService from '../../../services/user.js';
import './poa-b2.js';

const
	ISURE_MANAGED_FULLY = 3,
	poaManagerModel = DataTier.ties.create('poaManager', {
		userDataIncompleteError: '',
		institutions: [],
		startPOAForm: startPOAForm
	});

initComponent('poa-manager', class extends ComponentBase {
	async connectedCallback() {
		const
			userData = await userService.getCurrentUser(),
			productSummaries = await productsService.getProductSummaries();
		let userDataMissingError;

		if ((userDataMissingError = this.validateUserData(userData))) {
			poaManagerModel.userDataIncompleteError = userDataMissingError;
			this.classList.add('user-data-incomplete');
			return;
		}

		if (!productSummaries || !productSummaries.length) {
			this.classList.add('no-products');
			return;
		}

		const relevantProducts = productSummaries.filter(p => p.iSureManaged !== ISURE_MANAGED_FULLY);

		if (!relevantProducts.length) {
			this.classList.add('all-isure-managed');
			return;
		}

		//  left with the case where we have something to sign on
		const
			productsByInstitution = {},
			tmpInstitutions = [];
		relevantProducts.forEach(p => {
			const iRefId = p.fund.managerLegalId;
			if (!productsByInstitution[iRefId]) {
				productsByInstitution[iRefId] = [];
			}
			productsByInstitution[iRefId].push(p);
		});
		poaManagerModel.institutions = [];
		Object.keys(productsByInstitution).forEach(iRefId => {
			tmpInstitutions.push({
				userData: userData,
				institution: productsByInstitution[iRefId][0].fund,
				products: productsByInstitution[iRefId]
			});
		});
		poaManagerModel.institutions = tmpInstitutions;
		poaManagerModel.totalProducts = relevantProducts.length;

		//  waiting for DataTier to do its magic
		await new Promise(resolve => setTimeout(resolve, 0));
		this.shadowRoot.querySelectorAll('.institution-entry').forEach(one => {
			if (!one.querySelector('.action').data.institution.iSureRefId) {
				one.classList.add('isure-unlinked');
			}
		});

		this.classList.add('poa-forms-manager');
	}

	validateUserData(userData) {
		if (!userData.firstName || !userData.lastName) {
			return 'missing user\'s first or last name';
		}
		if (!userData.legalId) {
			return 'missing user\'s legal ID';
		}
		if (!userData.city || !userData.street || !userData.block) {
			return 'missing user\'s address part (city, street or block or few of those)';
		}
		return null;
	}

	static get htmlUrl() {
		return import.meta.url.replace(/js$/, 'htm');
	}
});

async function startPOAForm(event) {
	const
		data = event.currentTarget.data,
		poaB2Form = document.createElement('power-of-attorney-b2'),
		poaB2FormTitle = document.createElement('span');
	poaB2Form.data = {
		to: {
			id: data.institution.id,
			name: data.institution.name,
			refId: data.institution.managerLegalId
		},
		from: {
			name: data.userData.firstName + ' ' + data.userData.lastName,
			legalId: data.userData.legalId,
			address: data.userData.city + ', ' + data.userData.street + ' ' + data.userData.block
		},
		productsData: data.products.map(p => {
			return {
				id: p.id,
				name: p.name,
				refId: p.refId,
				limited: false,
				unifiedRefId: p.unifiedRefId
			};
		})
	};
	poaB2FormTitle.dataset.tie = 'l10n:poaManager.poaB2FormTitle';
	const poaB2Modal = openModal(poaB2Form, poaB2FormTitle);
	poaB2Form.addEventListener('submitted', () => {
		const
			handledInstitution = poaManagerModel.institutions.find(i => i.institution === data.institution),
			handledProductsLen = handledInstitution.products.length;
		poaManagerModel.institutions.splice(poaManagerModel.institutions.indexOf(handledInstitution), 1);
		poaManagerModel.totalProducts -= handledProductsLen;
		poaB2Modal.close();
	});
}

l10n.initL10nResource('poaManager', {
	he: {
		noProducts: 'אין מידע על מוצרים פנסיונים',
		allISure: 'הידד! כל המוצרים הפנסיוניים שבמערכת מנוהלים ע"י איישור!',
		overviewTitleA: 'מהמוצרים שלך שנמצאים ב-',
		overviewTitleB: 'גופים מוסדיים כרגע לא מנוהלים ע"י איישור',
		detailTitleA: 'העבר',
		detailTitleB: 'מוצרים לניהולה של איישור',
		unlinkedInstitution: 'איישור בתהליך חתימת הסכם עם גוף מוסדי זה, נא לנסות מאוחר יותר',
		poaB2FormTitle: 'ייפוי כוח מתמשך (ב2)'
	},
	en: {
		noProducts: 'No pension data',
		allISure: 'Hooray! All your products managed by iSure!',
		overviewTitleA: 'of your products in',
		overviewTitleB: 'institutions are not managed by iSure as of now',
		detailTitleA: 'Move',
		detailTitleB: 'products to be iSure managed',
		unlinkedInstitution: 'iSure is in process of contracting with this institution, please try later',
		poaB2FormTitle: 'Power of Attorney (b2)'
	}
});