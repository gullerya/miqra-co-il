import * as DataTier from '../../../../libs/data-tier/data-tier.min.js';
import '../../../../libs/data-tier-list/data-tier-list.min.js';
import * as l10nService from '../../../../services/localization.js';
import * as productsService from '../../../../services/product-convert-utils.js';
import { ComponentBase, initComponent } from '../../../../libs/rich-component/rich-component.min.js';
import '../../../../elements/span-l10n.js';
import '../../../../elements/span-currency.js';
import '../../../../elements/splitter.js';
import '../../field-text.js';
import '../../field-time.js';
import '../../field-boolean.js';

const
	insurancesModel = DataTier.ties.create('insurancesModel', { data: [] }),
	collectiveModel = DataTier.ties.create('collectiveModel', { data: null });

l10nService.initL10nResource('insurancesDetails', {
	he: import.meta.url.substring(0, import.meta.url.lastIndexOf('/')) + '/l10n/he.json',
	en: import.meta.url.substring(0, import.meta.url.lastIndexOf('/')) + '/l10n/en.json'
});

initComponent('product-details-insurances', class extends ComponentBase {
	set product(product) {
		if (!product || !product.details || !product.details.productDetails || !Array.isArray(product.details.productDetails.kisuim)) {
			console.warn('coverages data missing, wrong product?');
			return;
		}

		const newModel = [];
		const pt = product.details.productType;
		const cs = product.details.productDetails.kisuim;

		cs
			.filter(nc => nc && nc.zihuiKisui)
			.map(nc => nc.zihuiKisui)
			.forEach(nc => {
				const tmpC = {
					covName: nc.shemkisuiyatzran
				};
				if (!nc.schumeiBituahYesodi || nc.sugkisuyetzelyatzran === 2 || pt === 2 || pt === 3 || pt === 4 || pt === 9 || pt === 10) {
					tmpC.visibilityBasic = 'hidden';
				} else {
					const sby = nc.schumeiBituahYesodi;
					Object.assign(tmpC, {
						linkageOnSum: productsService.trCoverageLinkageSum(sby.sughatzmadaschumbituah),
						linkageOnPremium: productsService.trCoverageLinkageFee(sby.sughatzmadadmeibituah),
						pathType: productsService.trCoveragePathType(sby.sugmaslullebituah),
						sumIncludesSavings: sby.indschumbituahkolelchisachon === 1,
						insurancePathSum: sby.schumbituachlemaslul,
						salariesTotal: sby.misparmaskorot,
						savingsPercent: sby.achuzhaktzaalechisachon,
						maxForDeath: sby.tikratgaghatamlemikremavet,
						maxForDisability: sby.tikratgaghatamleoka,
						sumForDeath: sby.schumbituahlemavet
					});
					//	fields hiding part
					tmpC.basePartClasses = pt === 6 || pt === 7 || pt === 8 ? 'hidden' : '';
					tmpC.pathSumClasses = tmpC.pathType === 1 ? '' : 'hidden';
				}

				if (!nc.pirteiKisuiBeMutzar || pt === 5 || pt === 8 || pt === 9 || pt === 10) {
					tmpC.visibilityCoverages = 'hidden';
				} else {
					const pkbm = nc.pirteiKisuiBeMutzar;
					Object.assign(tmpC, {
						insuredType: productsService.translateCoveredType(pkbm.sugmevutach),
						insuranceType: productsService.translateCoverageType(pkbm.sugkisuybitochi),
						startDate: productsService.translateDateTime(pkbm.taarichtchilatkisuy),
						endDate: productsService.translateDateTime(pkbm.taarichtomkisuy),
						appendixRefId: pkbm.kodnispachkisuy,
						jobType: productsService.translateCoveredJobType(pkbm.sugisuk),
						franchise: pkbm.kolelprenzisa === 1,
						paymentEndDate: productsService.translateDateTime(pkbm.taarichhafsakattashlum),
						percentFromBasic: pkbm.achuzmescmbthyesodi,
						percentFromSalary: pkbm.achuzmesachar,
						paymentType: productsService.translateCoveragePaymentType(pkbm.ofentashlumschumbituach),
						insuranceSum: pkbm.schumbituach,
						insurancePayer: productsService.translateCoveragePayer(pkbm.meshalemhakisuy),
						smoking: pkbm.kodishun === 1 ? true : (pkbm.kodishun === 2 ? false : null),
						underwriting: pkbm.indchitum === 1 ? true : (pkbm.indchitum === 2 ? false : null),
						underwritingDate: productsService.translateDateTime(pkbm.taarichchitum),
						exception: pkbm.hachraga === 1,
						exceptionType: productsService.trCoverageExceptionType(pkbm.sughachraga),
						qualificationPeriod: pkbm.tkufatachshara,
						waitPeriod: pkbm.tkufathamtanachodashim,
						discount: pkbm.hanacha === 1,
						discountCondition: pkbm.hatnayalahanachadmeibituah === 1 ? true : (pkbm.hatnayalahanachadmeibituah === 2 ? false : null),
						discountType: productsService.trCoverageDiscountType(pkbm.sughanachakisuy),
						discountPercent: pkbm.shiurhanachabekisui,
						discountValue: pkbm.erechhanachabekisui,
						premium: pkbm.dmeibituahletashlumbapoal,
						premiumChangeFreq: pkbm.tadirutshinuydmeihabituahbeshanim,
						premiumChangeNext: productsService.translateDateTime(pkbm.taarichidkunhabasheldmeihabituah)
					});
					//	fields hiding part
					tmpC.nonRiderHidden = nc.sugkisuyetzelyatzran !== 2 ? 'hidden' : '';
					tmpC.insSumClass = pkbm.sugkisuybitochi === 5 || pkbm.sugkisuybitochi === 9 ? '' : 'hidden';
					tmpC.nonSavingClasses = pt === 6 || pt === 7 || pt === 8 ? 'hidden' : '';
					tmpC.exceptionClasses = tmpC.exception ? 'data-or-no-yes' : 'data-or-no-no';
					const discountClasses = [];
					if (!tmpC.discount) {
						discountClasses.push('hidden');
					} else {
						if (pkbm.sughanachakisuy === 2) {
							discountClasses.push('dis-per');
						}
						if (pkbm.sughanachakisuy === 3) {
							discountClasses.push('dis-sum');
						}
					}
					tmpC.discountClasses = discountClasses.join(' ');
				}

				if (nc.kisuiBKerenPensia && pt === 2) {
					const kbkp = nc.kisuiBKerenPensia;
					Object.assign(tmpC, {
						disableCoveragePrice: kbkp.alutkisuinechut,
						disableCoverageBenPenPrice: kbkp.alutkisuipnsshrmneche,
						disableCoveragePercent: kbkp.sheurkisuynechut,
						definitiveSalary: kbkp.sacharkovealenechutvesheerim,
						definitiveSalaryUpdateDate: productsService.translateDateTime(kbkp.taarichmaskoretnechutvesheerim),
						disablePensionSum: kbkp.sachpensiatnechut,
						disableEvolving: kbkp.nechutmitpatahat === 1,
						coverageCession: kbkp.viturkisuybituchi === 1 ? true : (kbkp.viturkisuybituchi === 2 ? false : null),
						beneficiariesCoveragePrice: kbkp.alutkisuysheerim,
						orphanCoveragePercent: kbkp.shiurkisuyyatom,
						orphanPension: kbkp.kitzbatsheerimleyatom,
						widowCoveragePercent: kbkp.shiurkisuyalmanoalmana,
						widowPension: kbkp.kitzbatsheerimlealmanoalmana,
						parentCoveragePercent: kbkp.shiurkisuyhorenitmach,
						parentPension: kbkp.kitzbatsheerimlehorenitmach,
						beneficiariesCession: productsService.trCovBeneficiariesCessionType(kbkp.sugvitorshaerim),
						beneficiariesCessionDate: productsService.translateDateTime(kbkp.taarichvitorsheerim),
						beneficiariesCessionEndDate: productsService.translateDateTime(kbkp.taarichciumvitorseerim),
						retirementAge: kbkp.gilprishalepensiyatzikna,
						widowPensionTotal: kbkp.sachpensiyatalmanoalmana,
						totalMonthsInPensionCont: kbkp.misparhodsheihaverutbekerenhapensiya,
						totalMonthsInOldPension: kbkp.misparhodsheihaverutmitzbekerenhapensiya,
						accPensionPart: kbkp.menatpensiatzvura,
						accPensionPercent: kbkp.ahuzpensiyatzvura,
						pensionStartDate: productsService.translateDateTime(kbkp.taarichtchilathaverut),
						dataValueDate: productsService.translateDateTime(kbkp.taaricherechlanentunim),
						bonus: kbkp.hatavabituchit === 1 ? true : (kbkp === 2 ? false : null)
					});
				} else {
					tmpC.visibilityPension = 'hidden';
				}

				tmpC.increases = [];
				if (Array.isArray(nc.pirteiTosafot)) {
					nc.pirteiTosafot
						.filter(pt => pt.tosefettaarif === 1)
						.forEach(pt => {
							tmpC.increases.push({
								increaseType: pt.kodsugtosefet,
								increasePercent: pt.sheurtosefet,
								increasePromil: pt.promiltosefet,
								increaseEndDate: productsService.translateDateTime(pt.taarichtomtosefet)
							});
						});
				}

				tmpC.beneficiaries = [];
				if (Array.isArray(nc.mutav)) {
					nc.mutav
						.forEach(m => {
							tmpC.beneficiaries.push({
								beneficiaryType: m.sugzihuymutav,
								refIdType: m.kodzihuymutav,
								refId: m.misparzihuymutav,
								firstName: m.shempratimutav,
								lastName: m.shemmishpachamutav,
								relationType: m.sugzika,
								percent: m.achuzmutav,
								definitionType: m.hagdaratmutav,
								beneficiaryCase: m.mahutmutav
							});
						});
				}

				tmpC.occupations = [];
				if (Array.isArray(nc.miktsoaIsukTachviv)) {
					nc.miktsoaIsukTachviv
						.forEach(m => {
							tmpC.occupations.push({
								occupations: m.tachvivimoisukim,
								occupationType: m.kodmiktzoa,
								occupation: m.tchumisukchadash
							});
						});
				}

				newModel.push(tmpC);
			});

		insurancesModel.data = newModel;

		this.processCollectiveInsurances(product);
	}

	processCollectiveInsurances(product) {
		if (product && product.details && product.details.productDetails &&
			Array.isArray(product.details.productDetails.perutMitriyot) &&
			product.details.productDetails.perutMitryot.some(c => c.kayamkisuybituchicolectivileamitim === 1)) {
			const tmpCollectiveCoveragesData = {
				meta: {
					insuringName: { labelKey: 'l10n:insurancesDetails.insuringName', order: 1 },
					startDate: { labelKey: 'l10n:insurancesDetails.startDate', order: 1 },
					endDate: { labelKey: 'l10n:insurancesDetails.endDate', order: 1 },
					insuranceType: { labelKey: 'l10n:insurancesDetails.insuranceType', order: 1 },
					insuranceSum: { labelKey: 'l10n:insurancesDetails.insuranceSum', order: 1 },
					price: { labelKey: 'l10n:insurancesDetails.price', order: 1 },
					payer: { labelKey: 'l10n:insurancesDetails.payer', order: 1 },
					payPeriod: { labelKey: 'l10n:insurancesDetails.payPeriod', order: 1 },
					joinForm: { labelKey: 'l10n:insurancesDetails.joinForm', order: 1 }
				},
				data: []
			}

			product.details.productDetails.perutMitryot
				.filter(cc => cc.kayamkisuybituchicolectivileamitim === 1)
				.forEach(cc => {
					tmpCollectiveCoveragesData.data.push({
						insuringName: cc.shemmevatachat,
						startDate: productsService.translateDateTime(cc.taarichtchilathabituach),
						endDate: productsService.translateDateTime(cc.taarichtomtkufathabituah),
						insuranceType: productsService.translateColCoverageType(cc.kodsugmutzarbituach),
						insuranceSum: cc.schumbituach,
						price: cc.alutkisui,
						payer: productsService.translateColCovPayer(cc.meshalemdmeihabituah),
						payPeriod: productsService.translateColCovPayPeriod(cc.tadiruthatshlum),
						joinForm: cc.haimnechtamtofeshitztarfut === 1 ? true : (cc.haimnechtamtofeshitztarfut === 2 ? false : null)
					});
				});

			collectiveModel.data = tmpCollectiveCoveragesData;
		} else {
			this.classList.add('hide-group-coverages');
		}
	}

	static get htmlUrl() { return import.meta.url.replace(/js$/, 'htm'); }
});
