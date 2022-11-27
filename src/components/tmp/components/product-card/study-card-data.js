import { ComponentBase, initComponent } from '../../libs/rich-component/rich-component.min.js';
import * as l10nService from '../../services/localization.js';
import * as productConvertUtils from '../../services/product-convert-utils.js';
import '../../elements/span-currency.js';
import '../../elements/svg-icon.js';

/**
 * product DTO
 * {
 * 		<general data properties - see product-card>,
 *
 * 		releaseTime:	<timestamp>,
 *		lastDeposit:	<number>,
 *		totalNow:		<number>,
 *		feeSavingsAbs:	<number>,
 *		profitPer:		<number>
 * }
 */

const
	template = document.createElement('template');

template.innerHTML = `
	<style>
		@import "./commons/styles/base.css";

		:host {
			display: flex;
			flex-direction: column;
		}

		.row {
			flex: 1;
			display: flex;
			flex-direction: row;
			align-items: center;
		}

		.value.hidden,
		.column.hidden {
			display: none;
		}

		.column {
			flex: 1;
			display: flex;
			flex-direction: column;
		}

		.label {
			margin-bottom: 0.8em;
		}

		.value {
			height: 1.4em;
		}

		.value .per:after {
			content: '%';
		}

		.value.liquidity-now {
			width: 1em;
			height: 1em;
		}
	</style>

	<div class="row">
		<div class="column">
			<div class="label subtitle bidi-transor" data-tie="l10n:studyCardData.lastDeposit"></div>
			<span-currency class="value last-deposit bold-a nis"></span-currency>
		</div>
		<div class="column">
			<div class="label subtitle bidi-transor" data-tie="l10n:studyCardData.totalNow"></div>
			<span-currency class="value total-now bold-a nis"></span-currency>
		</div>
		<div class="column liquidity">
			<div class="label subtitle bidi-transor" data-tie="l10n:studyCardData.liquidity"></div>
			<div class="value liquidity-future bold-a"></div>
			<svg-icon class="value liquidity-now" type="v"></svg-icon>
		</div>
	</div>
	<div class="row">
		<div class="column">
			<div class="label subtitle bidi-transor" data-tie="l10n:studyCardData.feeSavings"></div>
			<div class="value fee-savings bold-a">
				<span class="per"></span>
			</div>
		</div>
		<div class="column">
			<div class="label subtitle bidi-transor">
				<span data-tie="l10n:studyCardData.yield"></span>
				&nbsp;
				<span class="current-year"></span>
			</div>
			<div class="value yield bold-a">
				<span class="per"></span>
			</div>
		</div>
	</div>
`;

l10nService.initL10nResource('studyCardData', {
	he: {
		lastDeposit: 'הפקדה אחרונה',
		totalNow: 'סך צבירה',
		liquidity: 'נזילות',
		feeSavings: 'ד"נ מצבירה',
		yield: 'תשואה'
	},
	en: {
		lastDeposit: 'Last deposit',
		totalNow: 'Total currently',
		liquidity: 'Liquidity',
		feeSavings: 'Fee from savings',
		yield: 'Yield'
	}
});

initComponent('study-card-data', class extends ComponentBase {
	set product(product) {
		if (!product || typeof product !== 'object') {
			console.error('invalid product argument');
			return;
		}

		this.shadowRoot.querySelector('.last-deposit').textContent = product.lastDeposit;
		this.shadowRoot.querySelector('.total-now').textContent = product.totalNow;
		if (product.releaseTime) {
			if (product.releaseTime < new Date().getTime()) {
				this.shadowRoot.querySelector('.liquidity-future').classList.add('hidden');
			} else {
				this.shadowRoot.querySelector('.liquidity-now').classList.add('hidden');
				this.shadowRoot.querySelector('.liquidity-future').textContent = l10nService.stringifyDateTime(new Date(product.releaseTime));
			}
		} else {
			this.shadowRoot.querySelector('.column.liquidity').classList.add('hidden');
		}

		this.shadowRoot.querySelector('.fee-savings .per').textContent = l10nService.roundNumber(product.feeSavingsPer, 2);

		this.shadowRoot.querySelector('.current-year').textContent = '(' + productConvertUtils.translateDateTime(product.upToDate).getFullYear() + ')';
		this.shadowRoot.querySelector('.yield .per').textContent = product.profitPer;
	}

	get defaultTieTarget() {
		return 'product';
	}

	static get template() {
		return template;
	}
});