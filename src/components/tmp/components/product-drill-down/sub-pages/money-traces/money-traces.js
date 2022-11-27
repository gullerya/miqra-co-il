import * as DataTier from '../../../../libs/data-tier/data-tier.min.js';
import * as l10n from '../../../../services/localization.js';
import * as productsService from '../../../../services/product-convert-utils.js';
import { ComponentBase, initComponent } from '../../../../libs/rich-component/rich-component.min.js';
import '../../../../components/grid/grid.js';

const
	GRIDS_META = {
		type: { labelTie: 'l10n:moneyTraces.type', type: 'tie', order: 1 },
		sum: { labelTie: 'l10n:moneyTraces.sum', type: 'currency', order: 2 },
		at: { labelTie: 'l10n:moneyTraces.at', type: 'date', order: 3 },
		fine: { labelTie: 'l10n:moneyTraces.fine', type: 'currency', order: 4 }
	},
	moneyTracesModel = DataTier.ties.create('moneyTraces', {
		withdrawals: { meta: GRIDS_META, data: [] },
		moves: { meta: GRIDS_META, data: [] },
		refunds: { meta: GRIDS_META, data: [] }
	}),
	template = document.createElement('template');

l10n.initL10nResource('moneyTraces', {
	he: {
		titleWithdrawals: 'משיכות',
		titleMoves: 'העברות',
		titleRefunds: 'החזרים',
		type: 'סוג חיסכון',
		sum: 'סכום',
		at: 'בתאריך',
		fine: 'קנס'
	},
	en: {
		titleMwithdrawal: 'Withdrawals',
		titleMoves: 'Moves',
		titleRefunds: 'Refunds',
		type: 'Saving type',
		sum: 'Sum',
		at: 'At',
		fine: 'Fine'
	}
});

initComponent('money-traces', class extends ComponentBase {
	set product(product) {
		const
			tmpWithdrawals = [],
			tmpMoves = [],
			tmpRefunds = [];

		product.details.productDetails.pirteiTaktziv.forEach(pt => {
			if (!pt.meshichaNiud || !pt.meshichaNiud.length) return;

			pt.meshichaNiud
				.filter(m => Object.keys(m).length)
				.forEach(m => {
					const tmpM = {
						type: productsService.trMoneyMoveFromToType(m.rachivnimshachnuyad),
						sum: m.schoommeshichaniud,
						at: l10n.stringifyDateTime(productsService.translateDateTime(m.taarichbizoa), 'dd/MM/yyyy'),
						fine: m.knasmeshichaniud
					};
					if (m.kodsugpeula === 1) {
						tmpWithdrawals.push(tmpM);
					} else if (m.kodsugpeula === 2) {
						tmpMoves.push(tmpM);
					} else if (m.kodsugpeula === 3) {
						tmpRefunds.push(tmpM);
					} else {
						console.error('unexpected money move type ' + m.kodsugpeula);
					}
				});
		});

		if (tmpWithdrawals.length) {
			moneyTracesModel.withdrawals.data = tmpWithdrawals;
		} else {
			this.shadowRoot.querySelector('.withdrawals').classList.add('hidden');
		}
		if (tmpMoves.length) {
			moneyTracesModel.moves.data = tmpMoves;
		} else {
			this.shadowRoot.querySelector('.moves').classList.add('hidden');
		}
		if (tmpRefunds.length) {
			moneyTracesModel.refunds.data = tmpRefunds;
		} else {
			this.shadowRoot.querySelector('.refunds').classList.add('hidden');
		}
	}

	static get template() {
		return template;
	}
});

template.innerHTML = `
	<style>
		:host {
			flex: 1;
			padding: 10px 30px;
			display: flex;
			flex-direction: column;
			overflow: auto;
		}

		.data {
			flex: 100%;
		}

		.hidden {
			display: none;
		}
	</style>

	<data-section class="withdrawals">
		<div slot="title">
			<span data-tie="l10n:moneyTraces.titleWithdrawals"></span>
		</div>
		<data-grid class="data headless" data-tie="moneyTraces:withdrawals"></data-grid>
	</data-section>
	<data-section class="moves">
		<div slot="title">
			<span data-tie="l10n:moneyTraces.titleMoves"></span>
		</div>
		<data-grid class="data headless" data-tie="moneyTraces:moves"></data-grid>
	</data-section>
	<data-section class="refunds">
		<div slot="title">
			<span data-tie="l10n:moneyTraces.titleRefunds"></span>
		</div>
		<data-grid class="data headless" data-tie="moneyTraces:refunds"></data-grid>
	</data-section>
`;