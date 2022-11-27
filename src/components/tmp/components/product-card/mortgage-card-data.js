import { ComponentBase, initComponent } from '../../libs/rich-component/rich-component.min.js';
import * as l10nService from '../../services/localization.js';
import * as productConvertUtils from '../../services/product-convert-utils.js';
import '../../elements/span-currency.js';

/**
 * product DTO
 * {
 * 		<general data properties - see product-card>,
 *
 * 		userLegalId:		<string>,
 * 		paymentPeriod:		<number as in CH spec>,
 * 		mortgageCoverages: [
 * 			{
 * 				coveredLegalId:		<string>,
 * 				coveredType:		<number, as in CH spec>,
 * 				from:				<string>,
 * 				till:				<string>,
 * 				sum:				<number>,
 * 				premium:			<number>
 * 			},
 * 			{}
 * 		]
 * }
 */

const
	template = document.createElement('template');

template.innerHTML = `
	<style>
		@import "./commons/styles/base.css";

		:host {
			display: flex;
			flex-direction: row;
		}

		.row {
			flex: 1;
			display: flex;
			flex-direction: row;
			align-items: center;
		}

		.column {
			flex: 1;
			display: flex;
			flex-direction: column;
			justify-content: space-evenly;
		}
		
		.value {
			height: 1.4em;
		}

		.hint, .period {
			font-size: 0.8em;
			color: #b1b1b1;
		}

		.hidden {
			display: none;
		}
	</style>

	<div class="column">
		<div class="label subtitle bidi-transor" data-tie="l10n:mortgageCardData.insuredStatus"></div>
		<div class="value insured-status a bold-a">
			<span class="val"></span>
			<br>
			<span class="hint"></span>
		</div>
		<div class="value insured-status b bold-a">
			<span class="val"></span>
			<br>
			<span class="hint"></span>
		</div>
	</div>
	<div class="column">
		<div class="label subtitle bidi-transor" data-tie="l10n:mortgageCardData.sum"></div>
		<span-currency class="value sum a bold-a nis"></span-currency>
		<span-currency class="value sum b bold-a nis"></span-currency>
	</div>
	<div class="column">
		<div class="label subtitle bidi-transor" data-tie="l10n:mortgageCardData.payment"></div>
		<div class="value payment a bold-a">
			<span-currency class="nis"></span-currency>
			<br>
			<span class="period"></span>
		</div>
		<div class="value payment b bold-a">
			<span-currency class="nis"></span-currency>
			<br>
			<span class="period"></span>
		</div>
	</div>
	<div class="column">
		<div class="label subtitle bidi-transor" data-tie="l10n:mortgageCardData.till"></div>
		<div class="value till a bold-a"></div>
		<div class="value till b bold-a"></div>
	</div>
`;

l10nService.initL10nResource('mortgageCardData', {
	he: {
		insuredStatus: 'מבוטח',
		youM: 'אתה',
		youF: 'את',
		youN: 'את/ה',
		sum: 'סכום ביטוח',
		payment: 'תשלום',
		till: 'תום הביטוח'
	},
	en: {
		insuredStatus: 'Insured',
		youM: 'you',
		youF: 'you',
		youN: 'you',
		sum: 'Insurance sum',
		payment: 'Payment',
		till: 'Insurance ends'
	}
});

initComponent('mortgage-card-data', class extends ComponentBase {
	set product(product) {
		if (!product || typeof product !== 'object') {
			console.error('invalid product argument');
			return;
		}
		if (!product.mortgageCoverages || !product.mortgageCoverages.length) {
			console.error('product of type mortgage insurance MUST HAVE at least one mortgage coverage');
			return;
		}

		const
			primaryCoverage = product.mortgageCoverages.find(c => c.coveredType === 1),
			secondaryCoverage = product.mortgageCoverages.find(c => c.coveredType === 2);

		this.shadowRoot.querySelectorAll('.payment .period').forEach(pp => {
			pp.dataset.tie = productConvertUtils.translatePaymentPeriod(product.paymentPeriod);
		});

		if (primaryCoverage) {
			this.shadowRoot.querySelector('.insured-status.a .val').dataset.tie = productConvertUtils.translateCoveredType(primaryCoverage.coveredType);
			if (primaryCoverage.coveredLegalId.endsWith(product.userLegalId)) {
				if (product.userGender) {
					this.shadowRoot.querySelector('.insured-status.a .hint').dataset.tie = 'l10n:mortgageCardData.you' + (product.userGender === 1 ? 'F' : 'M');
				} else {
					this.shadowRoot.querySelector('.insured-status.a .hint').dataset.tie = 'l10n:mortgageCardData.youN';
				}
			}
			this.shadowRoot.querySelector('.sum.a').textContent = primaryCoverage.sum;
			this.shadowRoot.querySelector('.payment.a .nis').textContent = primaryCoverage.payment;
			this.shadowRoot.querySelector('.till.a').textContent = l10nService.stringifyDateTime(productConvertUtils.translateDateTime(primaryCoverage.till));
		} else {
			this.shadowRoot.querySelectorAll('.a').forEach(e => e.classList.add('hidden'));
		}

		if (secondaryCoverage) {
			this.shadowRoot.querySelector('.insured-status.b .val').dataset.tie = productConvertUtils.translateCoveredType(secondaryCoverage.coveredType);
			if (secondaryCoverage.coveredLegalId.endsWith(product.userLegalId)) {
				if (product.userGender) {
					this.shadowRoot.querySelector('.insured-status.b .hint').dataset.tie = 'l10n:mortgageCardData.you' + (product.userGender === 1 ? 'F' : 'M');
				} else {
					this.shadowRoot.querySelector('.insured-status.b .hint').dataset.tie = 'l10n:mortgageCardData.youN';
				}
			}
			this.shadowRoot.querySelector('.sum.b').textContent = secondaryCoverage.sum;
			this.shadowRoot.querySelector('.payment.b .nis').textContent = secondaryCoverage.payment;
			this.shadowRoot.querySelector('.till.b').textContent = l10nService.stringifyDateTime(productConvertUtils.translateDateTime(secondaryCoverage.till));
		} else {
			this.shadowRoot.querySelectorAll('.b').forEach(e => e.classList.add('hidden'));
		}
	}

	get defaultTieTarget() {
		return 'product';
	}

	static get template() {
		return template;
	}
});