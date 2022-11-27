import * as DataTier from '../../libs/data-tier/data-tier.min.js';
import '../../libs/data-tier-list/data-tier-list.min.js';
import { ComponentBase, initComponent } from '../../libs/rich-component/rich-component.min.js';
import * as l10n from '../../services/localization.js';
import '../../elements/span-currency.js';

const
	baseModel = {
		baseType: 'fund',
		onEntryEnter: event => {
			const t = event.target;
			widgetModel.currentHint = t.fundTotal;
			t.getRootNode()
				.querySelectorAll('.drawing .' + t.className)
				.forEach(e => e.classList.add('selected'));
		},
		onEntryLeave: event => {
			const t = event.target;
			widgetModel.currentHint = widgetModel.total;
			t.getRootNode()
				.querySelectorAll('.drawing .' + t.className)
				.forEach(e => e.classList.remove('selected'));
		},
		data: null
	},
	widgetModel = DataTier.ties.create('widgetMoneyColors', baseModel),
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
			flex: 3em;
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
			font-size: 1.2em;
			font-weight: 500;
		}

		.header > .space {
			flex: 1;
		}
		.header .selector {
			padding: 0 1em;
			text-align: center;
			color: var(--light-blue);
		}
		.header .selector.selected {
			font-weight: 500;
			color: var(--dark-blue);
			border-bottom: 2px solid var(--dark-blue);
			box-shadow: 0 4px 4px -4px rgba(0,0,0,0.1);
		}

		.graph-bar {
			flex: 0 0 60px;
			margin: 3em 1em 0;
			position: relative;
			display: flex;
			align-items: stretch;
			border-radius: 30px;
			overflow: hidden;
		}
		.graph-bar .item {
			flex-basis: 0;
			transition: flex-basis 160ms;
		}
		.graph-bar .shadower {
			position: absolute;
			top: 0;
			left: 0;
			right: 0;
			bottom: 0;
			border-radius: 30px;
			box-shadow: inset 0 0 8px 2px rgba(0,0,0,0.1);
		}
		.graph-bar .item.pension {
			background-color: var(--dark-blue);
		}
		.graph-bar .item.study {
			background-color: var(--main-orange);
		}
		.graph-bar .item.provident {
			background-color: var(--main-green);
		}
		.graph-bar .item.insurance {
			background-color: var(--main-yellow);
		}
		.graph-bar .item.installment {
			background-color: var(--dark-blue);
		}
		.graph-bar .item.studyRedeem {
			background-color: var(--main-orange);
		}
		.graph-bar .item.lump {
			background-color: var(--main-green);
		}

		.legend {
			margin: 1.4em 0;
			display: flex;
			flex-wrap: wrap;
			justify-content: center;
		}
		.legend .item {
			flex: calc(50%  - 2em);
			margin: 0.4em 1em;
			min-width: 11em;
			max-width: 16em;
			display: none;
			align-items: center;
		}
		.legend .item .color {
			width: 1em;
			height: 1em;
			border-radius: 2em;
			box-shadow: 1px 1px 4px 2px rgba(0,0,0,0.1)
		}
		.legend .item.pension .color {
			background-color: var(--dark-blue);
		}
		.legend .item.study .color {
			background-color: var(--main-orange);
		}
		.legend .item.provident .color {
			background-color: var(--main-green);
		}
		.legend .item.insurance .color {
			background-color: var(--main-yellow);
		}
		.legend .item.installment .color {
			background-color: var(--dark-blue);
		}
		.legend .item.studyRedeem .color {
			background-color: var(--main-orange);
		}
		.legend .item.lump .color {
			background-color: var(--main-green);
		}
		.legend .item .space-a {
			flex: 0 0 0.4em;
		}
		.legend .item .space-b {
			flex: 1;
			height: 0.6em;
			border-bottom: 1px solid var(--dark-blue);
		}

		:host(.saving) .saving {
			display: flex;
		}
		:host(.redeem) .redeem {
			display: flex;
		}

		.footer {
			padding: 0.8em;
			font-size: 1.2em;
			font-weight: 500;
			text-align: center;
		}

		.footer .total {
			color: var(--main-green);
		}
	</style>
	
	<div class="header">
		<span class="title" data-tie="l10n:widgetMoneyColors.title"></span>
		<span class="space"></span>
		<span class="selector saving selected" data-tie="l10n:widgetMoneyColors.saving"></span>
		<span class="selector redeem" data-tie="l10n:widgetMoneyColors.redeem"></span>
	</div>
	<div class="graph-bar">
		<span class="item pension installment"></span>
		<span class="item provident lump"></span>
		<span class="item study studyRedeem"></span>
		<span class="item insurance"></span>
		<div class="shadower"></div>
	</div>
	<div class="legend">
		<div class="item saving pension">
			<span class="color"></span>
			<span class="space-a"></span>
			<span class="label" data-tie="l10n:widgetMoneyColors.pension"></span>
			<span class="space-b"></span>
			<span-currency class="total" data-tie="widgetMoneyColors:data.pension"></span-currency>
		</div>
		<div class="item saving study">
			<span class="color"></span>
			<span class="space-a"></span>
			<span class="label" data-tie="l10n:widgetMoneyColors.study"></span>
			<span class="space-b"></span>
			<span-currency class="total" data-tie="widgetMoneyColors:data.study"></span-currency>
		</div>
		<div class="item saving provident">
			<span class="color"></span>
			<span class="space-a"></span>
			<span class="label" data-tie="l10n:widgetMoneyColors.provident"></span>
			<span class="space-b"></span>
			<span-currency class="total" data-tie="widgetMoneyColors:data.provident"></span-currency>
		</div>
		<div class="item saving insurance">
			<span class="color"></span>
			<span class="space-a"></span>
			<span class="label" data-tie="l10n:widgetMoneyColors.insurance"></span>
			<span class="space-b"></span>
			<span-currency class="total" data-tie="widgetMoneyColors:data.insurance"></span-currency>
		</div>

		<div class="item redeem installment">
			<span class="color"></span>
			<span class="space-a"></span>
			<span class="label" data-tie="l10n:widgetMoneyColors.installment"></span>
			<span class="space-b"></span>
			<span-currency class="total" data-tie="widgetMoneyColors:data.installment"></span-currency>
		</div>
		<div class="item redeem studyRedeem">
			<span class="color"></span>
			<span class="space-a"></span>
			<span class="label" data-tie="l10n:widgetMoneyColors.studyRedeem"></span>
			<span class="space-b"></span>
			<span-currency class="total" data-tie="widgetMoneyColors:data.studyRedeem"></span-currency>
		</div>
		<div class="item redeem lump">
			<span class="color"></span>
			<span class="space-a"></span>
			<span class="label" data-tie="l10n:widgetMoneyColors.lump"></span>
			<span class="space-b"></span>
			<span-currency class="total" data-tie="widgetMoneyColors:data.lump"></span-currency>
		</div>
	</div>
	<div class="footer">
		<span class="label" data-tie="l10n:widgetMoneyColors.totalLabel"></span>
		<span-currency class="total" data-tie="widgetMoneyColors:data.total"></span-currency>
	</div>
`;

initComponent('widget-money-colors-a', class extends ComponentBase {
	connectedCallback() {
		this.classList.add('saving');
		this.shadowRoot.querySelectorAll('.header .selector').forEach(s => s.addEventListener('click', event => {
			const saving = !event.target.classList.contains('redeem');
			this.shadowRoot.querySelectorAll('.header .selector').forEach(s => {
				if ((s.classList.contains('saving') && saving) || (!s.classList.contains('saving') && !saving)) {
					s.classList.add('selected');
				} else {
					s.classList.remove('selected');
				}
			});

			if (saving) {
				this.classList.replace('redeem', 'saving');
			} else {
				this.classList.replace('saving', 'redeem');
			}

			this.updateGraphBar();
		}));
	}

	set data(data) {
		let tmp = {
			pension: 0,
			study: 0,
			provident: 0,
			insurance: 0,
			other: 0,
			installment: 0,
			studyRedeem: 0,
			lump: 0,
			total: 0
		};

		if (data || typeof data === 'object') {
			Object.keys(data).forEach(fundType => {
				if (data[fundType]) {
					const ft = ['pension', 'study', 'provident', 'insurance'].includes(fundType) ? fundType : 'other';
					let sum;
					if (data[fundType].installment && typeof data[fundType].installment.total === 'number') {
						sum = data[fundType].installment.total;
						tmp[ft] += sum;
						tmp.installment += sum;
						tmp.total += sum;
					}
					if (data[fundType].studyRedeem && typeof data[fundType].studyRedeem.total === 'number') {
						sum = data[fundType].studyRedeem.total;
						tmp[ft] += sum;
						tmp.studyRedeem += sum;
						tmp.total += sum;
					}
					if (data[fundType].lump && typeof data[fundType].lump.total === 'number') {
						sum = data[fundType].lump.total;
						tmp[ft] += sum;
						tmp.lump += sum;
						tmp.total += sum;
					}
				}
			});
		}

		widgetModel.data = tmp;
		this.updateGraphBar();
	}

	updateGraphBar() {
		let values = [0, 0, 0, 0];
		if (widgetModel.data && widgetModel.data.total) {
			const saving = !this.classList.contains('redeem');
			if (saving) {
				values = [widgetModel.data.pension, widgetModel.data.provident, widgetModel.data.study, widgetModel.data.insurance];
			} else {
				values = [widgetModel.data.installment, widgetModel.data.lump, widgetModel.data.studyRedeem, 0];
			}
		}
		this.shadowRoot.querySelectorAll('.graph-bar .item').forEach((e, i) => e.style.flexBasis = values[i] / widgetModel.data.total * 100 + '%');
	}

	get defaultTieTarget() {
		return 'data';
	}

	static get template() {
		return template;
	}
});

l10n.initL10nResource('widgetMoneyColors', {
	he: {
		title: 'סך צברת נכון להיום',
		saving: 'לפי סוג החסכון',
		redeem: 'לפי אופן המימוש',
		pension: 'פנסיה',
		study: 'השתלמות',
		provident: 'גמל',
		insurance: 'ביטוח',
		lump: 'סכום חד פעמי',
		installment: 'קצבה',
		studyRedeem: 'השתלמות',
		totalLabel: 'סך הכל צבירה'
	},
	en: {
		title: 'Total savings today',
		saving: 'By fund kind',
		redeem: 'By redeem type',
		pension: 'Pension',
		study: 'Study',
		provident: 'Provident',
		insurance: 'Insurance',
		lump: 'Lump sum',
		installment: 'Installment',
		studyRedeem: 'Study',
		totalLabel: 'Total savings'
	}
});