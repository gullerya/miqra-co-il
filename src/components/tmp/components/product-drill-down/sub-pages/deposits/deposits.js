import * as DataTier from '../../../../libs/data-tier/data-tier.min.js';
import '../../../../libs/data-tier-list/data-tier-list.min.js';
import * as l10n from '../../../../services/localization.js';
import * as productsService from '../../../../services/product-convert-utils.js';
import { ComponentBase, initComponent } from '../../../../libs/rich-component/rich-component.min.js';
import '../../../../components/grid/grid.js';
import '../../../../elements/span-l10n.js';
import '../../../../elements/span-currency.js';
import '../../field-text.js';

const
	depositsModel = DataTier.ties.create('depositsModel', {
		data: []
	});

l10n.initL10nResource('deposits', {
	he: import.meta.url.substring(0, import.meta.url.lastIndexOf('/')) + '/l10n/he.json',
	en: import.meta.url.substring(0, import.meta.url.lastIndexOf('/')) + '/l10n/en.json'
});

initComponent('product-details-deposits', class extends ComponentBase {
	set product(product) {
		if (!product || !product.details || !product.details.productDetails || !Array.isArray(product.details.productDetails.pirteiTaktziv)) {
			console.warn('no balances? wrong product!?');
			return;
		}
		const
			newModel = [],
			balances = product.details.productDetails.pirteiTaktziv,
			employers = Array.isArray(product.details.employers) ? product.details.employers : [];

		//	build data per balance/employer and push to the list
		balances
			.filter(b => b && Array.isArray(b.perutHafkadotMetchilatShana) && b.perutHafkadotMetchilatShana.length)
			.forEach(b => {
				const
					em = b.pirteiHaasaka,
					dm = b.perutHafrashotLePolisa,
					nds = b.perutHafkadotMetchilatShana,
					employer = employers.find(e => e && e.mprmaasikbeyatzran === b.pirteiOved.mprmaasikbeyatzran),
					sem = this.buildSingleEmployerModel(employer, b.pirteiOved, em, dm, nds);

				if (sem) {
					newModel.push(sem);
				}
			});

		depositsModel.data = newModel;

		if (!newModel.length) {
			this.shadowRoot.querySelector('.no-data').classList.remove('hidden');
		}
	}

	buildSingleEmployerModel(employer, employment, employmentMetadata, depositsMetadata, deposits) {
		const newModel = {
			employer: {},
			deposits: {}
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

		//	process deposits principal metadata
		const dps = {
			definitiveSalary: employmentMetadata.sacharpolisa,
			totalDepositPercent: 0,
			byDepositDoer: [],
			byDepositType: []
		};
		depositsMetadata.forEach(e => {
			dps.totalDepositPercent += e.achuzhafrasha;
			const tmpDoer = dps.byDepositDoer.find(one => one.doer === e.sughamafkid);
			if (!tmpDoer) {
				dps.byDepositDoer.push({ doer: e.sughamafkid, doerLabel: productsService.translateDeposerType(e.sughamafkid), percent: e.achuzhafrasha });
			} else {
				tmpDoer.percent += e.achuzhafrasha;
			}
			const tmpType = dps.byDepositDoer.find(one => one.type === e.sughafrasha);
			if (!tmpType) {
				dps.byDepositType.push({ type: e.sughafrasha, typeLabel: productsService.translateDepositType(e.sughafrasha), percent: e.achuzhafrasha });
			} else {
				tmpType.percent += e.achuzhafrasha;
			}
		});
		newModel.depositParts = dps;

		//	fill deposits grid metadata
		newModel.deposits.meta = {
			salaryMonth: { labelTie: 'l10n:deposits.salaryMonth', order: 1 },
			salary: { labelTie: 'l10n:deposits.salary', type: 'currency', order: 2 },
			severance: { labelTie: 'l10n:deposits.severance', type: 'currency', order: 3, hidden: true },
			employeeReward: { labelTie: 'l10n:deposits.employeeReward', type: 'currency', order: 4, hidden: true },
			employerReward: { labelTie: 'l10n:deposits.employerReward', type: 'currency', order: 5, hidden: true },
			reward47: { labelTie: 'l10n:deposits.reward47', type: 'currency', order: 6, hidden: true },
			disability: { labelTie: 'l10n:deposits.disability', type: 'currency', order: 7, hidden: true },
			employeeOther: { labelTie: 'l10n:deposits.employeeOther', type: 'currency', order: 8, hidden: true },
			employerOther: { labelTie: 'l10n:deposits.employerOther', type: 'currency', order: 9, hidden: true },
			employeeStudy: { labelTie: 'l10n:deposits.employeeStudy', type: 'currency', order: 10, hidden: true },
			employerStudy: { labelTie: 'l10n:deposits.employerStudy', type: 'currency', order: 11, hidden: true },
			rewardSpecial: { labelTie: 'l10n:deposits.rewardSpecial', type: 'currency', order: 12, hidden: true },
			saveForChild: { labelTie: 'l10n:deposits.saveForChild', type: 'currency', order: 12, hidden: true }
		}

		//	fill deposits grid data (also affecting the metadata for empty columns)
		newModel.deposits.data = [];
		deposits.forEach(d => {
			//	obtain current deposit's month - it will be a key
			const salaryMonth = productsService.translateDateTime(d.chodeshsachar);
			if (!salaryMonth) {
				console.error('invalid deposit data, missing salary month, skipping');
				return;
			}

			let monthly = newModel.deposits.data.find(d => d.depositDate.getTime() === salaryMonth.getTime());
			if (!monthly) {
				monthly = {
					depositDate: salaryMonth,
					salaryMonth: l10n.stringifyDateTime(salaryMonth, 'MM/yyyy'),
					salary: d.sacharberamathafkada,
					severance: 0,
					employeeReward: 0,
					employerReward: 0,
					reward47: 0,
					disability: 0,
					employeeOther: 0,
					employerOther: 0,
					employeeStudy: 0,
					employerStudy: 0,
					rewardSpecial: 0,
					saveForChild: 0
				};
				newModel.deposits.data.push(monthly);
			}

			//	append data to the monthly model
			let property;
			switch (d.sughafrasha) {
				case 1:
					property = 'severance';
					break;
				case 2:
					property = 'employeeReward';
					break;
				case 3:
					property = 'employerReward';
					break;
				case 4:
					property = 'reward47';
					break;
				case 5:
					property = 'disability';
					break;
				case 6:
					property = 'employeeOther';
					break;
				case 7:
					property = 'employerOther';
					break;
				case 8:
					property = 'employeeStudy';
					break;
				case 9:
					property = 'employerStudy';
					break;
				case 10:
					property = 'rewardSpecial';
					break;
				case 12:
					property = 'saveForChild';
					break;
				default:
					console.error('unexpected deposit type ' + d.sughafrasha + ', skipping');
					break;
			}
			if (property) {
				monthly[property] += d.schumhafkadasheshulam;
				newModel.deposits.meta[property].hidden = false;
			}
		});

		//	sort models by months
		newModel.deposits.data.sort((d1, d2) => d1.depositDate > d2.depositDate ? -1 : 1);

		//	insert missing months
		//	TODO:

		//	round the sums
		newModel.deposits.data.forEach(m =>
			Object.keys(m).forEach(k => {
				if (typeof m[k] === 'number') {
					m[k] = l10n.roundNumber(m[k], 2);
				}
			})
		);

		return newModel;
	}

	static get htmlUrl() { return import.meta.url.replace(/js$/, 'htm'); }
});