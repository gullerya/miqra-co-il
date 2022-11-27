import * as DataTier from '../../../../libs/data-tier/data-tier.min.js';
import '../../../../libs/data-tier-list/data-tier-list.min.js';
import * as l10n from '../../../../services/localization.js';
import * as productsService from '../../../../services/product-convert-utils.js';
import { ComponentBase, initComponent } from '../../../../libs/rich-component/rich-component.min.js';
import '../../dd-section.js';
import '../../field-text.js';
import '../../../grid/grid.js';
import '../../../../elements/span-date.js';
import '../../../../elements/span-currency.js';
import '../../../../elements/span-l10n.js';

const
	savingsTypesGridMeta = {
		redeemType: { labelTie: 'l10n:savingsLabels.redeemType', type: 'tie', order: 1 },
		savingType: { labelTie: 'l10n:savingsLabels.savingType', type: 'tie', order: 2 },
		total: { labelTie: 'l10n:savingsLabels.total', type: 'currency', order: 3 },
		redeemable: { labelTie: 'l10n:savingsLabels.redeemable', type: 'currency', order: 4 }
	},
	savingsTimesGridMeta = {
		timeType: { labelTie: 'l10n:savingsLabels.timeType', type: 'tie', order: 1 },
		redeemType: { labelTie: 'l10n:savingsLabels.redeemType', type: 'tie', order: 2 },
		savingType: { labelTie: 'l10n:savingsLabels.savingType', type: 'tie', order: 3 },
		total: { labelTie: 'l10n:savingsLabels.total', type: 'currency', order: 4 }
	},
	savingsModel = DataTier.ties.create('savingsModel', { data: [] });

initComponent('product-details-savings', class extends ComponentBase {
	set product(product) {
		if (!product || !product.details || !product.details.productDetails || !Array.isArray(product.details.productDetails.pirteiTaktziv)) {
			console.warn('no balances? wrong products!?');
			return;
		}

		const
			newModel = [],
			employers = Array.isArray(product.details.employers) ? product.details.employers : [];

		//	build data per balance/employer and push to the list
		product.details.productDetails.pirteiTaktziv
			.filter(b => b && b.blockItrot && b.blockItrot.yitrot)
			.forEach(b => {
				const
					employer = employers.find(e => e && e.mprmaasikbeyatzran === b.pirteiOved.mprmaasikbeyatzran),
					sem = this.buildSingleEmployerModel(employer, b);

				newModel.push(sem);
			});

		savingsModel.data = newModel;
		savingsModel.totalForAll = newModel.reduce((a, ce) => a + ce.savingsByType.data.reduce((a, c) => a + c.total, 0), 0);
	}

	buildSingleEmployerModel(employer, balance) {
		const
			employment = balance.pirteiOved,
			savingsByType = balance.blockItrot.yitrot.perutYitrot,
			savingsByTime = balance.blockItrot.yitrot.perutYitraLeTkufa,
			newModel = {
				employer: {}
			}

		//	handle employer data for the block title
		if (employer) {
			newModel.employer.name = employer.shemmaasik;
			newModel.employer.refId = employer.misparmezahemaasik;
			newModel.employer.empNotFound = 'hidden';
			newModel.employer.empFound = '';
		} else {
			newModel.employer.refIdInInstitution = employment.mprmaasikbeyatzran;
			newModel.employer.empNotFound = '';
			newModel.employer.empFound = 'hidden';
		}

		//	saver status
		newModel.saverStatus = productsService.translateEmploymentType(employment.sugtochnitocheshbon);
		newModel.savingsToDate = productsService.translateDateTime(balance.blockItrot.yitrot.taaricherechtzvirot);

		//	savings by type
		newModel.savingsByType = {
			meta: savingsTypesGridMeta,
			data: []
		}
		savingsByType.sort((s1, s2) => s1.kodsughafrasha < s2.kodsughafrasha ? -1 : 1);
		savingsByType.forEach(s => {
			newModel.savingsByType.data.push({
				redeemType: productsService.trSavingRedeemType(s.kodsugitra),
				savingType: productsService.trSavingType(s.kodsughafrasha),
				total: s.totalchisachonmtzbr,
				redeemable: s.totalerkeipidion
			});
		});

		//	savings by time
		newModel.savingsByTime = {
			meta: savingsTimesGridMeta,
			data: []
		}
		savingsByTime.sort((s1, s2) => s1.rekivitraletkufa < s2.rekivitraletkufa ? -1 : 1);
		savingsByTime.forEach(s => {
			newModel.savingsByTime.data.push({
				timeType: productsService.trSavingTimeType(s.kodtechulatshichva),
				redeemType: productsService.trSavingRedeemType(s.sugitraletkufa),
				savingType: productsService.trSavingType(s.rekivitraletkufa),
				total: s.sachitraleshichvabeshach
			});
		});

		return newModel;
	}

	static get htmlUrl() {
		return import.meta.url.replace(/js$/, 'htm');
	}
});

l10n.initL10nResource('savingsLabels', {
	he: {
		totalForAll: 'סך צבירות במוצר',
		empNotFound: 'פרטי מעסיק חסרים, מוכר ביצרן תחת זיהוי',
		saverStatus: 'מעמד החוסך',
		savingsToDate: 'תאריך ערך צבירות',
		byRedeemType: 'צבירות לסוגיהן',
		byTimeType: 'צבירות לפי שכבות זמן',
		redeemType: 'אופן מימוש',
		savingType: 'סוג צבירה',
		total: 'סך',
		redeemable: 'סך לפדיון',
		timeType: 'שיכבת זמן'
	},
	en: {
		totalForAll: 'Total savings in the product',
		empNotFound: 'Employer details are missing, known to manufacturer by ID',
		saverStatus: 'Saver status',
		savingsToDate: 'Savings value date',
		byRedeemType: 'Savings by types',
		byTimeType: 'Savings by time layers',
		redeemType: 'Redeem type',
		savingType: 'Saving type',
		total: 'Total',
		redeemable: 'Total redeemable',
		timeType: 'Time layer'
	}
});