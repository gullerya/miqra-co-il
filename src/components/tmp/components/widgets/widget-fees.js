import * as DataTier from '../../libs/data-tier/data-tier.min.js';
import '../../libs/data-tier-list/data-tier-list.min.js';
import { ComponentBase, initComponent } from '../../libs/rich-component/rich-component.min.js';
import * as l10n from '../../services/localization.js';
import '../../elements/span-currency.js';
import '../../elements/span-l10n.js';

const
	widgetFeesModel = DataTier.ties.create('widgetFees', {
		onEntryEnter: event => {
			const t = event.target;
			widgetFeesModel.currentHint = t.fundTotal;
			t.getRootNode().querySelector('.drawing .' + t.className).classList.add('selected');
		},
		onEntryLeave: event => {
			const t = event.target;
			widgetFeesModel.currentHint = widgetFeesModel.total;
			t.getRootNode().querySelector('.drawing .' + t.className).classList.remove('selected');
		}
	}),
	template = document.createElement('template');

l10n.initL10nResource('widgetFees', {
	he: {
		mainTitle: 'דמי ניהול',
		subTitle: 'מתחילת השנה',
		pension: 'פנסיה',
		study: 'השתלמות',
		insurance: 'ביטוח',
		provident: 'גמל'
	},
	en: {
		mainTitle: 'Fees',
		subTitle: 'For this year',
		pension: 'Pension',
		study: 'Study',
		insurance: 'Insurance',
		provident: 'Provident'
	}
});

template.innerHTML = `
	<style>
		:host {
			display: flex;
			width: 24em;
			height: 12em;
			padding: 24px;
			justify-content: space-between;
		}

		.column {
			padding: 0 24px;
			display: flex;
			flex-direction: column;
			overflow: hidden;
		}

		.chart {
			flex: 0 0 9em;
			align-items: center;
			justify-content: space-between;
		}

		.drawing-section {
			position: relative;
			flex: 0 0 9em;
			display: flex;
			flex-direction: column;
		}

		.drawing {
			flex: 0 0 9em;
			width: 100%;
		}
		.drawing .selected {
			stroke-dasharray: 2;
		}
		.drawing .pension {
			color: var(--pension-color);
		}
		.drawing .study {
			color: var(--study-color);
		}
		.drawing .insurance {
			color: var(--insurance-color);
		}
		.drawing .provident {
			color: var(--provident-color);
		}

		.titles {
			display: flex;
			flex-direction: column;
			align-items: center;
		}

		.titles > .main {
			font-size: 1.25em;
			font-weight: 600;
		}

		.titles > .sub {
			color: var(--main-gray);
		}

		.drawing-section > .hint {
			position: absolute;
			top: 50%;
			left: 50%;
			transform: translate(-50%, -50%);
			font-size: 1.5em;
			font-weight: 600;
			text-align: center;
		}

		.legend {
			flex: 0 1 auto;
			justify-content: center;
			box-sizing: border-box;
		}

		.column.legend > * {
			padding: 12px;
			display: flex;
			align-items: center;
		}

		.column.legend > .magician {
			display: none;
		}

		.hinter {
			border-radius: 50%;
		}

		.hinter.outer {
			margin: 0 18px;
			flex: 0 0 13px;
			height: 13px;
			display: flex;
			border: 2px solid transparent;
		}
		.pension .hinter.outer {
			border-color: var(--pension-color);
		}
		.study .hinter.outer {
			border-color: var(--study-color);
		}
		.insurance .hinter.outer {
			border-color: var(--insurance-color);
		}
		.provident .hinter.outer {
			border-color: var(--provident-color);
		}

		.hinter.inner {
			flex: 1;
			margin: 3px;
		}
		.pension:hover .hinter.inner {
			background-color: var(--pension-color);
		}
		.study:hover .hinter.inner {
			background-color: var(--study-color);
		}
		.insurance:hover .hinter.inner {
			background-color: var(--insurance-color);
		}
		.provident:hover .hinter.inner {
			background-color: var(--provident-color);
		}
	</style>

	<div class="column chart">
		<div class="drawing-section">
			<svg class="drawing"></svg>
			<span-currency class="hint nis" data-tie="widgetFees:currentHint"></span-currency>
		</div>
		<div class="titles">
			<span class="title main" data-tie="l10n:widgetFees.mainTitle"></span>
			<span class="title sub" data-tie="l10n:widgetFees.subTitle"></span>
		</div>
	</div>

	<div class="column legend">
		<template class="magician" is="data-tier-item-template" data-tie="widgetFees:entries">
			<div data-tie="item:type => className, item:total => fundTotal, widgetFees:onEntryEnter => onmouseenter, widgetFees:onEntryLeave => onmouseleave">
				<span class="hinter outer">
					<span class="hinter inner"></span>
				</span>
				<span-l10n class="label" data-tie="item:label"></span-l10n>
			</div>
		</template>
	</div>
`;

initComponent('widget-fees', class extends ComponentBase {
	updateView() {
		if (widgetFeesModel.entries && widgetFeesModel.entries.length) {
			const
				svg = this.shadowRoot.querySelector('.drawing'),
				centerX = svg.getBoundingClientRect().width / 2,
				width = 10,
				entriesCnt = widgetFeesModel.entries.length;
			let lastPos = 1;
			widgetFeesModel.entries
				.filter(entry => entry && entry.type && entry.total)
				.forEach(entry => {
					const
						to = lastPos + Math.max(entry.total / widgetFeesModel.total * (360 - entriesCnt) - 1, 2);
					this.drawArc(svg, centerX, centerX, centerX - width / 2, width, lastPos, to, entry.type);
					lastPos = to + 2;
				});
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

	set data(data) {
		if (!data || typeof data !== 'object') {
			return;
		}

		let total = 0;
		const entries = [];
		Object.keys(data)
			.filter(fundType => data[fundType] && data[fundType].total)
			.forEach(fundType => {
				total += data[fundType].total;
				entries.push({
					type: fundType,
					total: data[fundType].total,
					label: 'l10n:widgetFees.' + fundType
				});
			});
		entries.sort((e1, e2) => e1.type > e2.type ? 1 : -1);

		widgetFeesModel.total = total;
		widgetFeesModel.currentHint = total;
		widgetFeesModel.entries = entries;
		this.updateView();
	}

	get defaultTieTarget() {
		return 'data';
	}

	static get template() {
		return template;
	}
});