import * as DataTier from '../../libs/data-tier/data-tier.min.js';
import { ComponentBase, initComponent } from '../../libs/rich-component/rich-component.min.js';
import * as l10nService from '../../services/localization.js';
import '../../elements/span-currency.js';
import '../../elements/splitter.js';
import '../../elements/svg-icon.js';
import '../../elements/slider.js';

const
	widgetFutureModel = DataTier.ties.create('widgetFuture', {}),
	dataKey = Symbol('data.key'),
	fdToggleKey = Symbol('future.deposits.key'),
	template = document.createElement('template');

l10nService.initL10nResource('widgetFuture', {
	he: {
		todayTitle: 'היום',
		todayDescr: 'הסכום הנוחכי של כל החסכונות',
		futureTitle: 'בפרישה',
		futureDescr: 'הסכום הצפוי למועד הפרישה',
		futureDeposits: 'כולל הפקדות חודשיות עתידיות בסך',
		pensionDescr: 'קצבה חודשית משעורת במועד הפרישה'
	},
	en: {
		todayTitle: 'Today',
		todayDescr: 'Current sum of all the savings',
		futureTitle: 'At retirement',
		futureDescr: 'Estimated sum at the retirement date',
		futureDeposits: 'Including future monthly deposit of',
		pensionDescr: 'Estimated monthly pension at the retirement date'
	}
});

template.innerHTML = `
	<style>
		@import "./commons/styles/base.css";

		:host {
			display: flex;
			width: 40em;
			height: 10em;
			background-color: var(--default-background);
		}

		:host(.sliderless) .age-selector {
			display: none;
		}
		:host(.sliderless) .totals-splitter {
			display: block;
		}

		.icons {
			flex: 0 0 2.4em;
			padding: 0.4em 0;
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: space-between;
			color: var(--main-green);
			opacity: 0.5;
		}

		.icons > .icon {
			height: 2.4em;
		}

		.totals {
			flex: 1;
			margin: 0 1.6em;
			display: flex;
			flex-direction: column;
			justify-content: space-between;
		}

		.totals > .totals-splitter {
			display: none;
		}

		.totals > .age-selector {
			margin-top: 8px;
		}

		.pension {
			flex: 0 0 10em;
			padding: 0.4em;
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: space-around;
			text-align: center;
			border-radius: 0.8em;
			color: #ccc;
			background-color: var(--main-dark);
		}

		.pension > .icon {
			width: 2.4em;
			height: 2.4em;
		}

		.pension > .sum {
			color: #fff;
		}

		.pension > .sum > .currency-sign {
			color: #fff !important;
		}

		.pension > .description {
			width: 90%;
			color: #ccc;
		}

		.sum {
			font-size: 1.5em;
			font-weight: 600;
			color: var(--main-dark);
		}

		.now, .future {
			display: flex;
			justify-content: space-between;
		}

		.future-deposit-toggle > .toggle-label {
			color: var(--main-gray);
		}

		.future-deposit-toggle > .icon {
			width: 0.8em;
			height: 0.8em;
			border-radius: 0;
			border-bottom: 1px solid var(--main-gray);
		}

		:host(.no-future-deposits) .future-deposit-toggle > .icon {
			color: transparent;
		}

		.age-selector {
			flex: 0 0 36px;
			width: 100%;
		}
	</style>

	<div class="icons">
		<svg class="icon" viewBox="0 0 48 48">
			<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.95">
				<path d="m46.7 16.1c0 8.14-6.6 14.7-14.7 14.7-8.14 0-14.7-6.6-14.7-14.7 0-8.14 6.6-14.7 14.7-14.7 8.14 0 14.7 6.6 14.7 14.7z"/>
				<path d="m31.9 22v1.96"/>
				<path d="m31.9 8.29v1.96"/>
				<path d="m28.9 19.1c0 1.63 1.32 2.95 2.95 2.95s2.95-1.32 2.95-2.95c0-1.63-1.32-2.95-2.95-2.95s-2.95-1.32-2.95-2.95c0-1.63 1.32-2.95 2.95-2.95s2.95 1.32 2.95 2.95"/>
				<path d="m15.3 37.8v1.96"/>
				<path d="m15.3 24v1.96"/>
				<path d="m12.3 34.8c0 1.63 1.32 2.95 2.95 2.95 1.63 0 2.95-1.32 2.95-2.95 0-1.63-1.32-2.95-2.95-2.95-1.63 0-2.95-1.32-2.95-2.95 0-1.63 1.32-2.95 2.95-2.95 1.63 0 2.95 1.32 2.95 2.95"/>
				<path d="m17.3 17.2c-0.342-0.0236-0.686-0.0511-1.03-0.0511-8.14 0-14.7 6.6-14.7 14.7 0 8.14 6.6 14.7 14.7 14.7 8.14 0 14.7-6.6 14.7-14.7 0-0.35-0.0295-0.692-0.053-1.04"/>
			</g>
		</svg>
		<span class="arrow">&#11206;</span>
		<svg class="icon" viewBox="0 0 48 48">
			<g fill="none" stroke="currentColor" stroke-width="1.95">
				<path d="m30.8 5.57c0 2.16-6.56 3.91-14.7 3.91-8.09 0-14.7-1.75-14.7-3.91s6.56-3.91 14.7-3.91c8.1 0 14.7 1.75 14.7 3.91z"/>
				<path d="m30.8 5.57v5.86c0 2.16-6.56 3.91-14.7 3.91-8.09 0-14.7-1.75-14.7-3.91v-5.86"/>
				<path d="m30.8 11.4v5.86c0 2.16-6.56 3.91-14.7 3.91-8.09 0-14.7-1.75-14.7-3.91v-5.86"/>
				<path d="m46.5 31c0 2.16-6.56 3.91-14.7 3.91-8.09 0-14.7-1.75-14.7-3.91 0-2.16 6.56-3.91 14.7-3.91 8.1 0 14.7 1.75 14.7 3.91z"/>
				<path d="m46.5 31v5.86c0 2.16-6.56 3.91-14.7 3.91-8.09 0-14.7-1.75-14.7-3.91v-5.86"/>
				<path d="m46.5 36.8v5.86c0 2.16-6.56 3.91-14.7 3.91-8.09 0-14.7-1.75-14.7-3.91v-5.86"/>
				<path d="m30.8 17.3v5.86c0 2.16-6.56 3.91-14.7 3.91-8.09 0-14.7-1.75-14.7-3.91v-5.86"/>
				<path d="m1.52 23.2v5.86c0 2.16 6.56 3.91 14.7 3.91h0.977"/>
				<path d="m1.52 29v5.86c0 2.16 6.56 3.91 14.7 3.91h0.977"/>
				<path d="m30.8 23.2v3.91"/>
			</g>
		</svg>
	</div>

	<div class="totals">
		<div class="now">
			<div>
				<h5 class="main-title bidi-transor" data-tie="l10n:widgetFuture.todayTitle"></h5>
				<div class="description subtitle bidi-transor" data-tie="l10n:widgetFuture.todayDescr"></div>
			</div>
			<span-currency class="sum" data-tie="widgetFuture:now"></span-currency>
		</div>
		<h-splitter class="totals-splitter"></h-splitter>
		<h-slider class="age-selector" data-tie="widgetFuture:ageValue">
			<span slot="inner-hint" class="age subtitle" data-tie="widgetFuture:age"></span>
		</h-slider>
		<div class="future">
			<div class="column">
				<h5 class="main-title bidi-transor" data-tie="l10n:widgetFuture.futureTitle"></h5>
				<div class="description subtitle bidi-transor" data-tie="l10n:widgetFuture.futureDescr"></div>
			</div>
			<span-currency class="sum" data-tie="widgetFuture:futureTotal"></span-currency>
		</div>
		<div class="future-deposit-toggle">
			<svg-icon class="icon" type="v"></svg-icon>
			<span class="toggle-label" data-tie="l10n:widgetFuture.futureDeposits"></span>
			<span-currency class="toggle-label" data-tie="widgetFuture:monthlyDeposit"></span-currency>
		</div>
	</div>

	<div class="pension">
		<svg class="icon" viewBox="0 0 48 48">
			<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.93">
				<path d="m9.76 43.5h-7.62v-15.7h7.62z"/>
				<path d="m9.76 40.5c20 6.85 13.3 6.85 36.2-4.9-2.03-2.08-3.62-2.57-5.72-1.96l-8.45 2.88"/>
				<path d="m9.76 29.7h5.72c4.48 0 7.62 2.94 8.58 3.92h5.72c3.04 0 3.04 3.92 0 3.92h-10.5"/>
				<path d="m28.8 8.15c0 3.24 2.56 5.87 5.72 5.87 3.16 0 5.72-2.63 5.72-5.87 0-3.24-2.56-5.87-5.72-5.87-3.16 0-5.72 2.63-5.72 5.87z"/>
				<path d="m19.3 21.9c0 3.24 2.56 5.87 5.72 5.87 3.16 0 5.72-2.63 5.72-5.87 0-3.24-2.56-5.87-5.72-5.87-3.16 0-5.72 2.63-5.72 5.87z"/>
				<path d="m25 19.9v3.92"/>
				<path d="m34.5 6.19v3.92"/>
			</g>
		</svg>
		<span-currency class="sum" data-tie="widgetFuture:futurePension"></span-currency>
		<div class="description subtitle" data-tie="l10n:widgetFuture.pensionDescr"></div>
	</div>
`;

initComponent('widget-future', class extends ComponentBase {
	connectedCallback() {
		this.shadowRoot.querySelector('.age-selector').addEventListener('change', event => {
			if (this[dataKey]) {
				this.updateView(this.getDataEntryByAgeValue(event.detail.value));
			}
		});
		this.shadowRoot.querySelector('.future-deposit-toggle').addEventListener('click', () => {
			this.classList.toggle('no-future-deposits');
			this[fdToggleKey] = !this.classList.contains('no-future-deposits');
			this.updateView(this.getDataEntryByAgeValue(widgetFutureModel.ageValue))
		});
		this[fdToggleKey] = true;
	}

	getAgeValueByAge(age) {
		const list = this[dataKey] && Array.isArray(this[dataKey].savingsFuture) ? this[dataKey].savingsFuture : [];
		let index = 0;
		if (list && list.length) {
			list.forEach((one, i) => {
				if (one.age === age) {
					index = i;
				}
			});
		}
		return index / (list.length - 1);
	}

	getDataEntryByAgeValue(ageValue) {
		const entriesTotal = this[dataKey].savingsFuture.length;
		const entryIndex = Math.round(ageValue / 1 * (entriesTotal - 1));
		return this[dataKey].savingsFuture[entryIndex];
	}

	updateView(entry) {
		if (entry) {
			const futureDeposits = this[fdToggleKey];
			widgetFutureModel.age = entry.age;
			widgetFutureModel.futureTotal = futureDeposits ? entry.total : entry.totalFrozen;
			widgetFutureModel.futurePension = futureDeposits ? entry.pension : entry.pensionFrozen;
		} else {
			widgetFutureModel.age = 0;
			widgetFutureModel.futureTotal = 0;
			widgetFutureModel.futurePension = 0;
		}
	}

	set data(data) {
		if (!data || !data.savingsFuture || !data.savingsFuture.length || data.savingsFuture.length < 2) {
			this.classList.add('sliderless');
		} else {
			this.classList.remove('sliderless');
		}
		if (data) {
			this[dataKey] = data;
			widgetFutureModel.now = data.savingsNow;
			widgetFutureModel.monthlyDeposit = data.monthlyDeposit;
			if (data.savingsFuture && data.savingsFuture.length) {
				const
					ageVal = this.getAgeValueByAge(67),
					startingEntry = this.getDataEntryByAgeValue(ageVal);
				widgetFutureModel.ageValue = this.getAgeValueByAge(startingEntry.age);
				this.updateView(startingEntry);
			}
		} else {
			this[dataKey] = null;
			widgetFutureModel.now = 0;
			widgetFutureModel.monthlyDeposit = 0;
			this.updateView(null);
		}
	}

	get defaultTieTarget() {
		return 'data';
	}

	static get template() {
		return template;
	}
});