import * as DataTier from '../../libs/data-tier/data-tier.min.js';
import { ComponentBase, initComponent } from '../../libs/rich-component/rich-component.min.js';
import * as l10nService from '../../services/localization.js';
import '../../elements/span-currency.js';
import '../../elements/svg-icon.js';

const
	widgetCoveragesPensionModel = DataTier.ties.create('widgetCoveragesPension', {}),
	template = document.createElement('template');

l10nService.initL10nResource('widgetCoveragesPension', {
	he: {
		title: 'ביטוחים פנסיוניים',
		subtitle: 'סך הכיסויים בקרנות הפנסיה',
		premiumLabel: 'עלות',
		disabilityLabel: 'קצבת נכות',
		deathLabel: 'קצבת שארים',
		widowLabel: 'אלמן/ה',
		orphanLabel: 'יתום/ה',
		parentLabel: 'הורה נתמך'
	},
	en: {
		title: 'Pension insurances',
		subtitle: 'Total pension coverages',
		premiumLabel: 'Premium',
		disabilityLabel: 'Disability pension',
		deathLabel: 'Relatives pension',
		widowLabel: 'Widow',
		orphanLabel: 'Orphan',
		parentLabel: 'Parent'
	}
});

template.innerHTML = `
	<style>
		@import "./commons/styles/base.css";

		:host {
			width: 14em;
			overflow: hidden;
			display: flex;
			flex-direction: column;
			align-items: center;
		}

		.titles {
			flex: 0 0 3em;
			text-align: center;
		}

		.row {
			margin: 8px 0;
			width: 100%;
			display: flex;
			justify-content: space-between;
		}

		.row > .value {
			font-weight: 600;
		}

		.row.premium {
			padding: 4px 8px;
			border-radius: 4px;
			box-sizing: border-box;
			color: #fff;
			background-color: var(--main-dark);
		}

		.row.death {
			flex-direction: column;
			align-items: center;
		}

		.total-sum {
			font-weight: 600;
		}

		.chart {
			position: relative;
			flex: 0 0 6em;
			width: 6em;
		}
		.chart > .pie {
			position: relative;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
		}
		.chart > .icon {
			position: absolute;
			top: 50%;
			left: 50%;
			transform: translate(-50%, -50%);
			color: #7ca85b;
		}
		.widow {
			color: #7ca85b;
		}
		.orphan {
			color: #9cc87b;
		}
		.parent {
			color: #bce89b;
		}
		.widow .color-hint {
			background-color: #7ca85b;
		}
		.orphan .color-hint {
			background-color: #9cc87b;
		}
		.parent .color-hint {
			background-color: #bce89b;
		}

		.hint {
			width: 100%;
			display: flex;
			align-items: center;
			font-size: 0.9em;
			color: var(--main-dark);
		}
		.hint > .color-hint {
			flex: 0 0 12px;
			height: 12px;
			border-radius: 50%;
		}
		.hint > .label {
			margin: 0 8px;
		}
		.hint > .value {
			flex: 1;
			display: flex;
			align-items: baseline;
			justify-content: flex-end;
			color: var(--main-dark);
		}
	</style>

	<div class="titles">
		<h5 data-tie="l10n:widgetCoveragesPension.title"></h5>
		<span class="subtitle" data-tie="l10n:widgetCoveragesPension.subtitle"></span>
	</div>
	<div class="row premium">
		<span class="label" data-tie="l10n:widgetCoveragesPension.premiumLabel"></span>
		<span-currency class="value" data-tie="widgetCoveragesPension:totalPremium"></span-currency>
	</div>
	<div class="row disability">
		<span class="label" data-tie="l10n:widgetCoveragesPension.disabilityLabel"></span>
		<span-currency class="value" data-tie="widgetCoveragesPension:disabilityTotal"></span-currency>
	</div>
	<div class="row death-sum">
		<span class="label" data-tie="l10n:widgetCoveragesPension.deathLabel"></span>
		<span-currency class="value" data-tie="widgetCoveragesPension:deathTotal"></span-currency>
	</div>
	<div class="row death">
		<div class="chart">
			<svg class="pie"></svg>
			<svg-icon class="icon" type="umbrella"></svg-icon>
		</div>
		<div class="hint widow">
			<span class="color-hint"></span>
			<span class="label" data-tie="l10n:widgetCoveragesPension.widowLabel"></span>
			<span-currency class="value" data-tie="widgetCoveragesPension:totalWidow"></span-currency>
		</div>
		<div class="hint orphan">
			<span class="color-hint"></span>
			<span class="label" data-tie="l10n:widgetCoveragesPension.orphanLabel"></span>
			<span-currency class="value" data-tie="widgetCoveragesPension:totalOrphan"></span-currency>
		</div>
		<div class="hint parent">
			<span class="color-hint"></span>
			<span class="label" data-tie="l10n:widgetCoveragesPension.parentLabel"></span>
			<span-currency class="value" data-tie="widgetCoveragesPension:totalParent"></span-currency>
		</div>
	</div>
`;

initComponent('widget-coverages-pension', class extends ComponentBase {
	set data(data) {
		if (data) {
			widgetCoveragesPensionModel.totalPremium = data.totalPremium;
			widgetCoveragesPensionModel.disabilityTotal = data.totalDisability;
			widgetCoveragesPensionModel.deathTotal = data.totalWidow + data.totalOrphan + data.totalParent;
			widgetCoveragesPensionModel.totalWidow = data.totalWidow;
			widgetCoveragesPensionModel.totalOrphan = data.totalOrphan;
			widgetCoveragesPensionModel.totalParent = data.totalParent;

			const
				svg = this.shadowRoot.querySelector('.chart .pie'),
				centerX = svg.getBoundingClientRect().width / 2,
				width = 16;
			let lastPos = 0;
			let to = lastPos + Math.max(widgetCoveragesPensionModel.totalWidow / widgetCoveragesPensionModel.deathTotal * 360, 2);
			this.drawArc(svg, centerX, centerX, centerX - width / 2, width, lastPos, to, 'widow');
			lastPos = to;
			to = lastPos + Math.max(widgetCoveragesPensionModel.totalOrphan / widgetCoveragesPensionModel.deathTotal * 360, 2);
			this.drawArc(svg, centerX, centerX, centerX - width / 2, width, lastPos, to, 'orphan');
			lastPos = to;
			to = lastPos + Math.max(widgetCoveragesPensionModel.totalParent / widgetCoveragesPensionModel.deathTotal * 360, 2);
			this.drawArc(svg, centerX, centerX, centerX - width / 2, width, lastPos, to, 'parent');

			this.drawArc(svg, centerX, centerX, centerX - width / 2, width, 0, 1, 'widow');
		} else {
			widgetCoveragesPensionModel.totalPremium = 0;
			widgetCoveragesPensionModel.disabilityTotal = 0;
			widgetCoveragesPensionModel.deathTotal = 0;
			widgetCoveragesPensionModel.totalWidow = 0;
			widgetCoveragesPensionModel.totalOrphan = 0;
			widgetCoveragesPensionModel.totalParent = 0;

			const svg = this.shadowRoot.querySelector('.chart .pie');
			while (svg.childElementCount) svg.removeChild(svg.lastElementChild);
		}
	}

	drawArc(svg, centerX, centerY, radius, width, startAngle, endAngle, className) {
		svg.setAttribute('viewBox', [0, 0, svg.getBoundingClientRect().width, svg.getBoundingClientRect().width].join(' '));

		const
			start = this.polarToCartesian(centerX, centerY, radius, endAngle),
			end = this.polarToCartesian(centerX, centerY, radius, startAngle),
			largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1,
			d = ['M', start.x, start.y, 'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y].join(' '),
			path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
		path.classList.add('part', className);
		path.setAttribute('d', d);
		path.setAttribute('fill', 'none');
		path.setAttribute('stroke', 'currentColor');
		path.setAttribute('stroke-width', width + 'px');
		path.setAttribute('stroke-linecap', 'round');
		svg.appendChild(path);
		return path;
	}

	polarToCartesian(centerX, centerY, radius, angleInDegrees) {
		const angleInRadians = (angleInDegrees - 90) * Math.PI / 180;

		return {
			x: centerX + radius * Math.cos(angleInRadians),
			y: centerY + radius * Math.sin(angleInRadians)
		};
	}

	get defaultTieTarget() {
		return 'data';
	}

	static get template() {
		return template;
	}
});