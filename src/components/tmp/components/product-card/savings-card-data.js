import { ComponentBase, initComponent } from '../../libs/rich-component/rich-component.min.js';
import * as l10nService from '../../services/localization.js';
import * as productConvertUtils from '../../services/product-convert-utils.js';
import '../../elements/tool-icon.js';
import '../../elements/span-currency.js';

const template = document.createElement('template');

template.innerHTML = `
	<style>
		@import "./commons/styles/base.css";

		:host {
			display: flex;
			flex-direction: column;
			perspective: 36em;
		}

		.panes-toggle {
			position: absolute;
    		left: 50%;
			transform: translate(-50%, -1.9em);
			color: var(--main-gray);
    		background: var(--default-background);
		}
		.panes-toggle.active {
			color: var(--main-green);
		}

		.switchable {
			flex: 1;
			display: flex;
			flex-direction: column;
		}
		.switchable.ccw-hide {
			transform: rotateY(90deg);
			transition: transform 200ms;
		}
		.switchable.ccw-flip {
			transform: rotateY(-90deg);
		}
		.switchable.ccw-back {
			transform: rotateY(0deg);
			transition: transform 200ms;
		}
		.switchable.cw-hide {
			transform: rotateY(-90deg);
			transition: transform 200ms;
		}
		.switchable.cw-flip {
			transform: rotateY(90deg);
		}
		.switchable.cw-back {
			transform: rotateY(0deg);
			transition: transform 200ms;
		}


		.panes-toggle.hidden,
		.pane.hidden {
			display: none;
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
		}

		.label {
			margin-bottom: 0.8em;
		}

		.value {
			height: 1.4em;
		}

		.hint {
			color: #aaa;
		}

		.value .per:after {
			content: '%';
		}
	</style>

	<tool-icon class="panes-toggle hidden">
		<svg-icon type="umbrella"></svg-icon>
	</tool-icon>
	<div class="switchable">
		<div class="column pane basic">
			<div class="row">
				<div class="column">
					<div class="label subtitle bidi-transor" data-tie="l10n:savingsCardData.lastDeposit"></div>
					<span-currency class="value last-deposit bold-a"></span-currency>
				</div>
				<div class="column">
					<div class="label subtitle bidi-transor" data-tie="l10n:savingsCardData.totalNow"></div>
					<span-currency class="value total-now bold-a"></span-currency>
				</div>
				<div class="column">
					<div class="label subtitle bidi-transor" data-tie="l10n:savingsCardData.expected"></div>
					<span-currency class="value expected bold-a"></span-currency>
				</div>
			</div>
			<div class="row">
				<div class="column">
					<div class="label subtitle bidi-transor" data-tie="l10n:savingsCardData.feeDeposit"></div>
					<div class="value fee-deposit bold-a">
						<span class="per"></span>
					</div>
				</div>
				<div class="column">
					<div class="label subtitle bidi-transor" data-tie="l10n:savingsCardData.feeSavings"></div>
					<div class="value fee-savings bold-a">
						<span class="per"></span>
					</div>
				</div>
				<div class="column">
					<div class="label subtitle bidi-transor">
						<span data-tie="l10n:savingsCardData.profit"></span>
						&nbsp;
						<span class="current-year"></span>
					</div>
					<div class="value profit bold-a">
						<span-currency class="abs"></span-currency>
					</div>
				</div>
			</div>
		</div>
		<div class="column pane coverages hidden">
			<div class="row">
				<div class="column">
					<div class="label subtitle bidi-transor" data-tie="l10n:savingsCardData.baseSalary"></div>
					<span-currency class="value salary-base bold-a"></span-currency>
				</div>
				<div class="column">
					<div class="label subtitle bidi-transor" data-tie="l10n:savingsCardData.totalPrice"></div>
					<span-currency class="value total-price bold-a"></span-currency>
				</div>
				<div class="column">
					<div class="label subtitle bidi-transor" data-tie="l10n:savingsCardData.ownPen"></div>
					<div class="value own-pen bold-a">
						<span-currency class="sum"></span-currency>
						&nbsp;
						<span class="per hint"></span>
					</div>
				</div>
			</div>
			<div class="row">
				<div class="column">
					<div class="label subtitle bidi-transor" data-tie="l10n:savingsCardData.orPen"></div>
					<div class="value or-pen bold-a">
						<span-currency class="sum"></span-currency>
						&nbsp;
						<span class="per hint"></span>
					</div>
				</div>
				<div class="column">
					<div class="label subtitle bidi-transor" data-tie="l10n:savingsCardData.widPen"></div>
					<div class="value wid-pen bold-a">
						<span-currency class="sum"></span-currency>
						&nbsp;
						<span class="per hint"></span>
					</div>
				</div>
				<div class="column">
					<div class="label subtitle bidi-transor" data-tie="l10n:savingsCardData.parPen"></div>
					<div class="value par-pen bold-a">
						<span-currency class="sum"></span-currency>
						&nbsp;
						<span class="per hint"></span>
					</div>
				</div>
			</div>
		</div>
	</div>
`;

l10nService.initL10nResource('savingsCardData', {
	he: {
		lastDeposit: 'הפקדה אחרונה',
		totalNow: 'סך צבירה',
		expected: 'צפי לפרישה',
		feeDeposit: 'ד"נ מהפקדה',
		feeSavings: 'ד"נ מצבירה',
		profit: 'רווח נטו',
		baseSalary: 'שכר בסיס',
		totalPrice: 'עלות כוללת',
		ownPen: 'קצבתך',
		orPen: 'קצבת יתום/ה',
		widPen: 'קצבת אלמן/ה',
		parPen: 'קצבת הורה'
	},
	en: {
		lastDeposit: 'Last deposit',
		totalNow: 'Total currently',
		expected: 'Expected at retirement',
		feeDeposit: 'Fee from deposit',
		feeSavings: 'Fee from savings',
		profit: 'Profit',
		baseSalary: 'Base salary',
		totalPrice: 'Total price',
		ownPen: 'Your pension',
		orPen: 'Orphan pension',
		widPen: 'Widow/er pension',
		parPen: 'Parent pension'
	}
});

initComponent('savings-card-data', class extends ComponentBase {
	set product(product) {
		if (!product || typeof product !== 'object') {
			console.error('invalid product argument');
			return;
		}

		this.shadowRoot.querySelector('.last-deposit').textContent = product.lastDeposit;
		this.shadowRoot.querySelector('.total-now').textContent = product.totalNow;
		this.shadowRoot.querySelector('.expected').textContent = product.expected;

		this.shadowRoot.querySelector('.fee-deposit .per').textContent = l10nService.roundNumber(product.feeDepositPer, 2);
		this.shadowRoot.querySelector('.fee-savings .per').textContent = l10nService.roundNumber(product.feeSavingsPer, 2);

		this.shadowRoot.querySelector('.current-year').textContent = '(' + productConvertUtils.translateDateTime(product.upToDate).getFullYear() + ')';
		this.shadowRoot.querySelector('.profit .abs').textContent = product.profitAbs;

		//	handle pension coverages
		if (product.type === 2 && product.pensionCoverages && product.pensionCoverages.length) {
			//	presently showing the first one only
			const c = product.pensionCoverages[0];
			//	repair the data
			if (!c.salary) {
				c.salary = c.orphanSum && c.orphanPer
					? c.orphanSum / c.orphanPer * 100
					: (c.widSum && c.widPer
						? c.widSum / c.widPer * 100
						: (c.parSum && c.parPer
							? c.parSum / c.parPer * 100
							: 0
						)
					);
			}

			//	set values
			this.shadowRoot.querySelector('.salary-base').textContent = c.salary;
			this.shadowRoot.querySelector('.total-price').textContent = c.totalPricePref || c.totalPriceBckp;
			this.shadowRoot.querySelector('.own-pen .sum').textContent = c.ownSum;
			this.shadowRoot.querySelector('.own-pen .per').textContent = c.ownPer;

			this.shadowRoot.querySelector('.or-pen .sum').textContent = c.orphanSum;
			this.shadowRoot.querySelector('.or-pen .per').textContent = c.orphanPer;

			this.shadowRoot.querySelector('.wid-pen .sum').textContent = c.widSum;
			this.shadowRoot.querySelector('.wid-pen .per').textContent = c.widPer;

			this.shadowRoot.querySelector('.par-pen .sum').textContent = c.parSum;
			this.shadowRoot.querySelector('.par-pen .per').textContent = c.parPer;

			//	enable the coverages pane
			this.shadowRoot.querySelector('.panes-toggle').classList.remove('hidden');
			this.shadowRoot.querySelector('.panes-toggle').addEventListener('click', event => {
				event.target.classList.toggle('active');
				if (event.target.classList.contains('active')) {
					this.togglePanes('ccw-');
				} else {
					this.togglePanes('cw-');
				}
			});
		}
	}

	togglePanes(dirPref) {
		const
			hide = dirPref + 'hide',
			flip = dirPref + 'flip',
			back = dirPref + 'back',
			s = this.shadowRoot.querySelector('.switchable'),
			phaseB = () => {
				s.removeEventListener('transitionend', phaseB);
				s.classList.remove(flip, back);
			},
			phaseA = () => {
				s.removeEventListener('transitionend', phaseA);
				s.classList.replace(hide, flip);
				s.querySelectorAll('.pane').forEach(pane => pane.classList.toggle('hidden'));
				s.addEventListener('transitionend', phaseB);
				setTimeout(() => s.classList.replace(flip, back), 0);
			};
		s.addEventListener('transitionend', phaseA);
		s.classList.add(hide);
	}

	get defaultTieTarget() {
		return 'product';
	}

	static get template() {
		return template;
	}
});