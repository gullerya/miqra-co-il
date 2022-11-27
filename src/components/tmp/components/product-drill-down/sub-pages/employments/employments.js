import * as DataTier from '../../../../libs/data-tier/data-tier.min.js';
import '../../../../libs/data-tier-list/data-tier-list.min.js';
import * as l10n from '../../../../services/localization.js';
import * as productsService from '../../../../services/product-convert-utils.js';
import { ComponentBase, initComponent } from '../../../../libs/rich-component/rich-component.min.js';
import '../../../../elements/span-currency.js';
import '../../field-text.js';
import '../../field-time.js';
import '../../field-boolean.js';

const
	employmentsModel = DataTier.ties.create('esDetails', {
		data: []
	});

l10n.initL10nResource('esLabels', {
	he: import.meta.url.substring(0, import.meta.url.lastIndexOf('/')) + '/l10n/he.json',
	en: import.meta.url.substring(0, import.meta.url.lastIndexOf('/')) + '/l10n/en.json'
});

initComponent('product-details-employments', class extends ComponentBase {
	set product(product) {
		const newModel = [];

		if (product && product.details && product.details.productDetails && Array.isArray(product.details.productDetails.pirteiTaktziv)) {
			const
				nativeBs = product.details.productDetails.pirteiTaktziv,
				employers = Array.isArray(product.details.employers) ? product.details.employers : [];

			nativeBs
				.filter(nb => nb.pirteiOved && nb.pirteiHaasaka)
				.forEach(nb => {
					const
						employment = nb.pirteiHaasaka,
						employee = nb.pirteiOved,
						employer = employers.find(e => e && e.mprmaasikbeyatzran === employee.mprmaasikbeyatzran),
						tmpModel = {
							employer: {},
							employment: {}
						};
					if (employer) {
						tmpModel.policyOwnerLegalIdType = employee.sugbaalhapolisasheeinohamevutach;
						tmpModel.policyOwnerLegalId = employee.misparbaalpolisasheeinomevutah;
						tmpModel.policyOwnerName = employee.shembaalpolisasheeinomevutah;

						tmpModel.employer.refIdType = employer.sugmezahemaasik;
						tmpModel.employer.refId = employer.misparmezahemaasik;
						tmpModel.employer.taxRefId = employer.mispartiknikuiim;
						tmpModel.employer.name = employer.shemmaasik;
						tmpModel.employer.address = productsService.translateAddress(
							employer.eretz,
							employer.shemyishuv,
							employer.shemrechov,
							employer.misparbait,
							employer.misparknisa,
							employer.mispardira,
							employer.mikud,
							employer.tadoar);
						tmpModel.employer.email = employer.email;
						tmpModel.employer.cellPhone = employer.misparcellulari;
						tmpModel.employer.landPhone = employer.mispartelephonekavi;
						tmpModel.employer.remarks = employer.hearot;
						tmpModel.empFound = '';
						tmpModel.empNotFound = 'hidden';
					} else if (employee.mprmaasikbeyatzran) {
						console.warn('failed to match employer "' + employee.mprmaasikbeyatzran + '" among ' + employers.length + ' employers');
						tmpModel.employer.refIdInInstitution = employee.mprmaasikbeyatzran;
						tmpModel.empFound = 'hidden';
						tmpModel.empNotFound = '';
					}

					tmpModel.employer.employerStatus = productsService.translateEmployerStatus(employee.statusmaasik);
					tmpModel.employment.saverStatus = productsService.translateEmploymentType(employee.sugtochnitocheshbon);

					tmpModel.employment.paymentType = productsService.translateSalaryDepositType(employment.kodchishuvsacharpolisaoheshbon);
					tmpModel.employment.salary = employment.sacharpolisa;
					tmpModel.employment.linkageType = productsService.translateSalaryLinkage(employment.kodofenhatzmada);
					tmpModel.employment.salaryUpdatedTo = productsService.translateDateTime(employment.taarichmaskoret);
					tmpModel.employment.unconditional = employment.zakautlelotnai === 1 ? true : (employment.zakautlelotnai === 2 ? false : null);
					tmpModel.employment.punkt14 = employment.seif14 === 1 ? true : (employment.seif14 === 2 ? false : null);
					tmpModel.employment.paymentStartDate = productsService.translateDateTime(employment.taarichtchilattashlum);

					newModel.push(tmpModel);
				});
		}

		employmentsModel.data = newModel;
	}

	static get htmlUrl() { return import.meta.url.replace(/js$/, 'htm'); }
});