import * as DataTier from '../../../../libs/data-tier/data-tier.min.js';
import '../../../../libs/data-tier-list/data-tier-list.min.js';
import * as l10n from '../../../../services/localization.js';
import * as productsService from '../../../../services/product-convert-utils.js';
import { ComponentBase, initComponent } from '../../../../libs/rich-component/rich-component.min.js';
import '../../dd-section.js';
import '../../field-text.js';
import '../../../grid/grid.js';
import '../../../../elements/span-currency.js';
import '../../../../elements/span-l10n.js';

const
	feesGridMeta = {
		moneyType: { labelTie: 'l10n:feesLabels.moneyType', type: 'tie', order: 1 },
		feePer: { labelTie: 'l10n:feesLabels.feePer', order: 2 },
		feePerFrom: { labelTie: 'l10n:feesLabels.feePerFrom', type: 'date', order: 3 },
		otherFees: { labelTie: 'l10n:feesLabels.otherFees', type: 'currency', order: 4 },
		movePenalty: { labelTie: 'l10n:feesLabels.movePenalty', type: 'boolean', readonly: true, order: 5 },
		discountType: { labelTie: 'l10n:feesLabels.discountType', type: 'tie', order: 6 },
		discountPer: { labelTie: 'l10n:feesLabels.discountPer', order: 7 },
		discountDue: { labelTie: 'l10n:feesLabels.discountDue', type: 'date', order: 8 }
	},
	feesModel = DataTier.ties.create('feesModel', { data: [] });

initComponent('product-details-fees', class extends ComponentBase {
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
			.filter(b => b && b.perutHotzaot && b.perutHotzaot.mivneDmeiNihul && Array.isArray(b.perutHotzaot.mivneDmeiNihul.perutMivneDmeiNihul))
			.forEach(b => {
				const
					employer = employers.find(e => e && e.mprmaasikbeyatzran === b.pirteiOved.mprmaasikbeyatzran),
					sem = this.buildSingleEmployerModel(employer, b, product.details.productType, product.details.productDetails.taarichnechonut);

				newModel.push(sem);
			});

		feesModel.data = newModel;
	}

	buildSingleEmployerModel(employer, balance, productType, productDate) {
		const
			employment = balance.pirteiOved,
			feesStructure = balance.perutHotzaot.mivneDmeiNihul.perutMivneDmeiNihul,
			feesLastMonth = balance.perutHotzaot.hotzaotBafoalLehodeshDivoach,
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

		//	fees of the current (last) month
		newModel.thisMonth = l10n.stringifyDateTime(productsService.translateDateTime(productDate), 'MM/yyyy');
		newModel.lmTotalFees = feesLastMonth.totaldmeinihulpolisaoheshbon;
		newModel.lmTotalFeesOfSavings = feesLastMonth.totaldmeinihultzvira;
		newModel.lmTotalFeesOfDeposits = feesLastMonth.totaldmeinihulhafkada;
		newModel.lmTotalFeesOfInvestments = feesLastMonth.hotzotnihulashkaot;
		newModel.lmTotalFeesOther = feesLastMonth.sachdmeinihulacherim;
		newModel.lmTotalFeesOfInsurances = feesLastMonth.sachdmeibituahshenigboo;
		newModel.depositClasses = newModel.lmTotalFeesOfDeposits || productType !== 4 ? 'data' : 'data hidden';
		newModel.otherClasses = newModel.lmTotalFeesOther ? 'data' : 'data hidden';
		newModel.insClasses = productType === 3 || productType === 4 ? 'data hidden' : 'data';

		//	fees as a structure
		newModel.feesOfSavings = {
			meta: feesGridMeta,
			data: []
		}
		newModel.feesOfDeposits = {
			meta: feesGridMeta,
			data: []
		}
		feesStructure.filter(f => f.sughotzaa)
			.forEach(f => {
				const d = f.sughotzaa === 1 ? newModel.feesOfSavings.data : newModel.feesOfDeposits.data;
				const fee = {
					moneyType: productsService.trFeesMoneyType(f.ofenhafrasha),
					feePer: f.sheurdmeinihul,
					feePerFrom: l10n.stringifyDateTime(productsService.translateDateTime(f.taarichidkunsheurdnhl)),
					otherFees: f.dmeinihulacherim,
					movePenalty: f.kenasmeshichatkesafim === 1,
					discountType: f.kayemethatava === 1 ? productsService.trFeesDiscountType(f.sughatava) : null,
					discountPer: f.kayemethatava === 1 ? f.achozhatava : null,
					discountDue: f.kayemethatava === 1 ? l10n.stringifyDateTime(productsService.translateDateTime(f.taarichsiumhatava)) : null
				}
				d.push(fee);
			});

		return newModel;
	}

	static get htmlUrl() {
		return import.meta.url.replace(/js$/, 'htm');
	}
});

l10n.initL10nResource('feesLabels', {
	he: {
		empNotFound: 'פרטי מעסיק חסרים, מוכר ביצרן תחת זיהוי',
		saverStatus: 'מעמד החוסך',
		thisYear: 'סך דמי ניהול מתחילת השנה',
		thisMonth: 'דמי ניהול לחודש',
		lmTotalFees: 'סך דמי ניהול',
		lmTotalFeesOfSavings: 'סך דמי ניהול מצבירה',
		lmTotalFeesOfDeposits: 'סך דמי ניהול מהפקדה',
		lmTotalFeesOfInvestments: 'סך דמי ניהול השקעות',
		lmTotalFeesOther: 'סך דמי ניהול אחרים',
		lmTotalFeesOfInsurances: 'סך דמי ביטוח',
		feesOfSavings: 'מבנה דמי ניהול מצבירה',
		feesOfDeposits: 'מבנה דמי ניהול מהפקדה',
		moneyType: 'כספי מקור',
		feePer: 'שיעור',
		feePerFrom: 'תאריך עדכון',
		otherFees: 'דמי ניהול אחרים',
		movePenalty: 'קנס משיכה',
		discountType: 'סוג הטבה',
		discountPer: 'שיעור הטבה',
		discountDue: 'סיום הטבה'
	},
	en: {
		empNotFound: 'Employer details are missing, known to manufacturer by ID',
		saverStatus: 'Saver status',
		thisYear: 'Total fees from the beginning of the year',
		thisMonth: 'Fees of the month',
		lmTotalFees: 'Total',
		lmTotalFeesOfSavings: 'Total from savings',
		lmTotalFeesOfDeposits: 'Total from deposits',
		lmTotalFeesOfInvestments: 'Total for investments',
		lmTotalFeesOther: 'Total other',
		lmTotalFeesOfInsurances: 'Total for insurances',
		feesOfSavings: 'Fees from savings',
		feesOfDeposits: 'Fees from deposits',
		moneyType: 'Origin type',
		feePer: 'Percent',
		feePerFrom: 'Update date',
		otherFees: 'Other fees',
		movePenalty: 'Move penalty',
		discountType: 'Discount type',
		discountPer: 'Discount percent',
		discountDue: 'Discount due'
	}
});