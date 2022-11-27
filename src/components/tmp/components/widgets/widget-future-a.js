import * as DataTier from '../../libs/data-tier/data-tier.min.js';
import { ComponentBase, initComponent } from '../../libs/rich-component/rich-component.min.js';
import * as l10n from '../../services/localization.js';
import '../../elements/span-currency.js';
import '../../elements/slider.js';

const
	widgetFutureModel = DataTier.ties.create('widgetFuture', {
		data: {}
	}),
	dataKey = Symbol('data.key'),
	template = document.createElement('template');

template.innerHTML = `
	<style>
		@import "./commons/styles/base.css";

		:host {
			display: flex;
			flex-direction: column;
			overflow: hidden;
			background-color: var(--default-background);
		}

		.header {
			flex: 0 0 3em;
			display: flex;
			align-items: stretch;
		}

		.header > * {
			border-bottom: 2px solid var(--light-gray);
			box-sizing: border-box;
			display: flex;
			align-items: center;
		}

		.header > .title {
			flex: 1;
			font-size: 1.2em;
			font-weight: 500;
		}

		.age {
			margin: 0.4em 0;
			display: flex;
			align-items: center;
		}
		.age .label {
			flex: 0 0 auto;
		}
		.age .space {
			flex: 0 0 1em;
		}
		.age .selector {
			flex: 1;
		}
		.age .value {
			color: #fff;
		}

		.pension {
			margin-bottom: 1em;
			display: flex;
			flex-direction: column;
			align-items: center;
		}
		.pension .value {
			flex: 0 0 1.2em;
			font-size: 3.6em;
			font-weight: 500;
			color: var(--main-green);
		}

		.totals {
			margin: 0.5em 0;
			padding: 0.8em;
			display: flex;
			align-items: flex-end;
			justify-content: space-between;
			border-radius: 2em;
			box-shadow: 0 0 4px 2px rgba(96, 96, 96, 0.1);
			overflow: hidden;
		}
		.totals > .label, .totals > .today {
			flex: 0 0 8em;
			font-size: 0.9em;
		}
		.totals .atRet {
			flex: 1;
			display: flex;
			flex-wrap: wrap;
			justify-content: flex-end;
			font-weight: 500;
		}
		.totals .atRet .value {
			color: var(--main-green);
		}
	</style>

	<div class="header">
		<span class="title" data-tie="l10n:widgetFuture.title"></span>
	</div>
	<div class="age">
		<span class="label" data-tie="l10n:widgetFuture.ageLabel"></span>
		<span class="space"></span>
		<h-slider class="selector" data-tie="widgetFuture:data.ageValue">
			<span slot="inner-hint" class="value" data-tie="widgetFuture:data.age"></span>
		</h-slider>
	</div>
	<div class="pension">
		<span-currency class="value" data-tie="widgetFuture:data.pension"></span-currency>
		<span data-tie="l10n:widgetFuture.pensionLabel"></span>
	</div>

	<div class="totals">
		<span class="label" data-tie="l10n:widgetFuture.savingInstallment"></span>
		<span class="today">
			<span class="label" data-tie="l10n:widgetFuture.today"></span>
			<span-currency data-tie="widgetFuture:data.todayInstallment"></span-currency>
		</span>
		<span class="atRet">
			<span class="label" data-tie="l10n:widgetFuture.atRet"></span>
			&nbsp;
			<span-currency class="value" data-tie="widgetFuture:data.atRetInstallment"></span-currency>
		</span>
	</div>
	<div class="totals">
		<span class="label" data-tie="l10n:widgetFuture.savingLump"></span>
		<span class="today">
			<span class="label" data-tie="l10n:widgetFuture.today"></span>
			<span-currency data-tie="widgetFuture:data.todayLump"></span-currency>
		</span>
		<span class="atRet">
			<span class="label" data-tie="l10n:widgetFuture.atRet"></span>
			&nbsp;
			<span-currency class="value" data-tie="widgetFuture:data.atRetLump"></span-currency>
		</span>
	</div>
`;

initComponent('widget-future-a', class extends ComponentBase {
	connectedCallback() {
		widgetFutureModel.observe(changes => {
			const lastChange = changes.pop();
			if (this[dataKey]) {
				this.updateView(this.getDataEntryByAgeValue(lastChange.value));
			}
		}, { path: 'data.ageValue' });
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
			widgetFutureModel.data.age = entry.age;
			widgetFutureModel.data.pension = entry.pension;
			widgetFutureModel.data.atRetInstallment = entry.atRetInstallment;
			widgetFutureModel.data.atRetLump = entry.atRetLump;
		} else {
			widgetFutureModel.data.age = '-';
			widgetFutureModel.data.pension = null;
			widgetFutureModel.data.atRetInstallment = null;
			widgetFutureModel.data.atRetLump = null;
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
			widgetFutureModel.data.todayInstallment = data.todayInstallment;
			widgetFutureModel.data.todayLump = data.todayLump;
			widgetFutureModel.monthlyDeposit = data.monthlyDeposit;
			if (Array.isArray(data.savingsFuture) && data.savingsFuture.length) {
				const
					ageVal = this.getAgeValueByAge(67),
					startingEntry = this.getDataEntryByAgeValue(ageVal);
				widgetFutureModel.data.ageValue = this.getAgeValueByAge(startingEntry.age);
				this.updateView(startingEntry);
			}
		} else {
			this[dataKey] = null;
			widgetFutureModel.data.todayInstallment = null;
			widgetFutureModel.data.todayLump = null;
			widgetFutureModel.monthlyDeposit = null;
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

l10n.initL10nResource('widgetFuture', {
	he: {
		title: 'צפי לפרישה על בסיס כל החסכונות שלך',
		ageLabel: 'אפרוש בגיל',
		pensionLabel: 'קצבה חודשית משוערת במועד הפרישה',
		savingInstallment: 'צבירה לקצבה',
		savingLump: 'צבירה הונית',
		today: 'היום',
		atRet: 'בפרישה'
	},
	en: {
		title: 'Expect at retirement as of present savings',
		ageLabel: 'Retire at',
		pensionLabel: 'Estimated monthly pension at retirement',
		savingInstallment: 'Savings to pension',
		savingLump: 'Savings to lump sum',
		today: 'Today',
		atRet: 'At retirement'
	}
});