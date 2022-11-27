import * as DataTier from '../../../../libs/data-tier/data-tier.min.js';
import '../../../../libs/data-tier-list/data-tier-list.min.js';
import * as l10nService from '../../../../services/localization.js';
import * as productsService from '../../../../services/product-convert-utils.js';
import { ComponentBase, initComponent } from '../../../../libs/rich-component/rich-component.min.js';
import '../../../../elements/splitter.js';
import '../../field-text.js';
import '../../field-boolean.js';
import '../../../../elements/span-currency.js';

const
	cassesModel = DataTier.ties.create('csDetails', {
		data: []
	});

l10nService.initL10nResource('cassesLabels', {
	he: {
		retAge: 'גיל פרישה',
		totalCont: 'סך (המשכי)',
		totalStop: 'סך (עצר)',
		promisedCoefficient: 'מקדם מובטח לפרישה',
		promisedExpectancy: 'מקדם הבטחת תוחלת',
		promisedExpectancyRetirement: 'מקדם הבטחת תוחלת פרישה',
		programName: 'שם מסלול',
		promisedReturnCoefficient: 'מקדם הבטחת שתואה',
		promisedReturnCoefficientTemp: 'מקדם הבטחת שתואה לתקופה',
		temporalReturnCoefficient: 'תקופת הגבלה (שנים)',
		expectancyInfluencingAnnuity: 'תוחלת משפיעה קצבה',
		returnInfluencingAnnuity: 'תשואה משפיעה קצבה',
		expectedAnnuityPercent: 'שיעור פנסיית זקנה צפויה',
		type: 'סוג',
		annCont: 'קצבה (המשכי)',
		annStop: 'קצבה (עצר)',
		return: 'תשואה בתחזית',
		totalLumpCont: 'סך הוני (המשכי)',
		totalLumpStop: 'סך הוני (עצר)',
		totalAnnCont: 'סך לקצבה (המשכי)',
		totalAnnStop: 'סך לקצבה (עצר)'
	},
	en: {
		retAge: 'Retirement age',
		totalCont: 'Total (continued)',
		totalStop: 'Total (stopped)',
		promisedCoefficient: 'מקדם מובטח לפרישה',
		promisedExpectancy: 'מקדם הבטחת תוחלת',
		promisedExpectancyRetirement: 'מקדם הבטחת תוחלת פרישה',
		programName: 'שם מסלול',
		promisedReturnCoefficient: 'מקדם הבטחת שתואה',
		promisedReturnCoefficientTemp: 'מקדם הבטחת שתואה לתקופה',
		temporalReturnCoefficient: 'תקופת הגבלה (שנים)',
		expectancyInfluencingAnnuity: 'תוחלת משפיעה קצבה',
		returnInfluencingAnnuity: 'תשואה משפיעה קצבה',
		expectedAnnuityPercent: 'שיעור פנסיית זקנה צפויה',
		type: 'Type',
		annCont: 'Annuity (cont)',
		annStop: 'Annuity (stop)',
		return: 'Estimated return',
		totalLumpCont: 'Total lump (cont)',
		totalLumpStop: 'Total lump (stop)',
		totalAnnCont: 'Total annuity (cont)',
		totalAnnStop: 'Total annuity (stop)'
	}
});

initComponent('product-details-casses', class extends ComponentBase {
	set product(product) {
		const newModel = [];

		if (product && product.details && product.details.productDetails && Array.isArray(product.details.productDetails.yitraLefiGilPrisha)) {
			const retirementValues = product.details.productDetails.yitraLefiGilPrisha;

			retirementValues
				.filter(rv => rv && rv.kupot && Array.isArray(rv.kupot.kupa) && rv.kupot.kupa.some(nc => nc.sugkupa !== 3))
				.forEach(rv => {
					const tmpRv = {
						retirementAge: rv.gilprisha,
						totalEstInclDeposits: rv.totalchisachonmitztabertzafuy,
						totalEstExclDeposits: rv.tzviratchisachonchazuyalelopremiyot,
						promisedCoefficient: rv.mekademmovtachleprisha,
						promisedExpectancy: rv.mekademhavtachsttochelet === 1,
						promisedExpectancyRetirement: rv.mekademhavtachsttocheletprisha === 1,
						programName: rv.shemmaslol,
						promisedReturnCoefficient: rv.mekademhavtachattsua === 1,
						promisedReturnCoefficientTemp: rv.mekademhavtachattsuatkufa === 1,
						temporalReturnCoefficient: rv.tkufathagbalabeshanim,
						expectancyInfluencingAnnuity: rv.tocheletmashpiakitzba === 1,
						returnInfluencingAnnuity: rv.tsuamashpiakitzba === 1,
						expectedAnnuityPercent: rv.sheurpnsziknatzfuya,
						casses: {
							meta: {
								cassType: { labelTie: 'l10n:cassesLabels.type', type: 'tie', order: 1 },
								annuityEstInclDeposits: { labelTie: 'l10n:cassesLabels.annCont', type: 'currency', order: 2 },
								annuityEstExclDeposits: { labelTie: 'l10n:cassesLabels.annStop', type: 'currency', order: 3 },
								estimatedReturn: { labelTie: 'l10n:cassesLabels.return', order: 4 },
								totalLumpEstInclDeposits: { labelTie: 'l10n:cassesLabels.totalLumpCont', type: 'currency', order: 5 },
								totalLumpEstExclDeposits: { labelTie: 'l10n:cassesLabels.totalLumpStop', type: 'currency', order: 6 },
								totalForAnnEstInclDeposits: { labelTie: 'l10n:cassesLabels.totalAnnCont', type: 'currency', order: 7 },
								totalForAnnEstExclDeposits: { labelTie: 'l10n:cassesLabels.totalAnnStop', type: 'currency', order: 8 }
							},
							data: []
						}
					};

					if (!tmpRv.promisedExpectancy) {
						this.classList.add('hide-promisedExpectancy');
					}
					if (!tmpRv.promisedExpectancyRetirement) {
						this.classList.add('hide-promisedExpectancyRetirement');
					}
					if (!tmpRv.promisedReturnCoefficient) {
						this.classList.add('hide-promisedReturnCoefficient');
					}
					if (!tmpRv.promisedReturnCoefficientTemp) {
						this.classList.add('hide-promisedReturnCoefficientTemp');
					}
					if (!tmpRv.expectancyInfluencingAnnuity) {
						this.classList.add('hide-expectancyInfluencingAnnuity');
					}
					if (!tmpRv.returnInfluencingAnnuity) {
						this.classList.add('hide-returnInfluencingAnnuity');
					}

					rv.kupot.kupa
						.filter(nc => nc.sugkupa !== 3)
						.forEach(nc => {
							tmpRv.casses.data.push({
								cassType: productsService.translateCassType(nc.sugkupa),
								annuityEstInclDeposits: nc.schumkitzvatzikna,
								annuityEstExclDeposits: nc.kitzvathodshittzfuya,
								estimatedReturn: nc.achuztsuabatachazit,
								totalLumpEstInclDeposits: nc.totalitratzfuyamechushavlehonimpremiot,
								totalLumpEstExclDeposits: nc.tzviratchisachontzfuyalehonlelopremiyot,
								totalForAnnEstInclDeposits: nc.totalschummtzbrtzafuylegilprishamechushavlekitzbaimpremiyot,
								totalForAnnEstExclDeposits: nc.totalschummitzvtabertzfuylegilprishamechushavhameyoadlekitzbalelopremiyot
							});
						});

					newModel.push(tmpRv);
				});
		}

		cassesModel.data = newModel;
	}

	static get htmlUrl() { return import.meta.url.replace(/js$/, 'htm'); }
});