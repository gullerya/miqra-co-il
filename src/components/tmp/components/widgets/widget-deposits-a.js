import * as DataTier from '../../libs/data-tier/data-tier.min.js';
import '../../libs/data-tier-list/data-tier-list.min.js';
import { ComponentBase, initComponent } from '../../libs/rich-component/rich-component.min.js';
import * as l10n from '../../services/localization.js';
import '../../elements/span-currency.js';
import '../../elements/span-l10n.js';

const
	widgetDepositsModel = DataTier.ties.create('widgetDeposits', {}),
	template = document.createElement('template');

l10n.initL10nResource('widgetDeposits', {
	he: {
		mainTitle: 'הפקדות',
		subTitle: 'מתחילת השנה',
		pension: 'פנסיה',
		study: 'השתלמות',
		insurance: 'ביטוח',
		provident: 'גמל'
	},
	en: {
		mainTitle: 'Deposits',
		subTitle: 'For this year',
		pension: 'Pension',
		study: 'Study',
		insurance: 'Insurance',
		provident: 'Provident'
	}
});

template.innerHTML = `
	<style>
		@import "./commons/styles/base.css";

		:host {
			display: flex;
			flex-direction: column;
			align-items: center;
			width: 10em;
		}

		.total-sum {
			font-size: 1.5em;
			font-weight: 600;
			color: var(--main-dark);
		}

		.details {
			width: 100%;
			display: flex;
			flex-wrap: wrap;
			align-items: center;
			justify-content: center;
		}

		.chart {
			flex: 0 0 6em;
			position: relative;
			display: flex;
			flex-direction: column;
			align-items: center;
		}

		.chart > .pie {
			margin: 16px 0;
			flex: 0 0 6em;
			width: 6em;
		}

		.chart > .icon {
			position: absolute;
			top: 50%;
			left: 50%;
			transform: translate(-50%, -50%);
			color: var(--main-green);
		}

		.part.pension {
			color: #00a8a6;
		}
		.part.study {
			color: #20c8c6;
		}
		.part.insurance {
			color: #40e8e6;
		}
		.part.provident {
			color: #60ffff;
		}

		.legend {
			flex: 0 0 10em;
			justify-content: center;
		}

		.column.legend > div {
			display: flex;
			align-items: center;
			font-size: 0.9em;
			color: var(--main-dark);
		}

		.column.legend > div > .label {
			margin: 0 8px;
		}

		.column.legend > div > .value {
			flex: 1;
			display: flex;
			align-items: baseline;
			justify-content: flex-end;
		}

		.color-hint {
			flex: 0 0 10px;
			height: 10px;
			border-radius: 50%;
		}
		.pension .color-hint {
			background-color: #00a8a6;
		}
		.study .color-hint {
			background-color: #20c8c6;
		}
		.insurance .color-hint {
			background-color: #40e8e6;
		}
		.provident .color-hint {
			background-color: #60ffff;
		}
	</style>

	<h5 class="main" data-tie="l10n:widgetDeposits.mainTitle"></h5>
	<span class="subtitle" data-tie="l10n:widgetDeposits.subTitle"></span>
	<span-currency class="total-sum" data-tie="widgetDeposits:total"></span-currency>

	<div class="details">
		<div class="chart">
			<svg class="pie"></svg>
			<svg-icon class="icon" type="safe"></svg-icon>
		</div>

		<div class="column legend">
			<template class="magician" is="data-tier-item-template" data-tie="widgetDeposits:entries">
				<div class="row" data-tie="item:type => className">
					<span class="color-hint"></span>
					<span-l10n class="label" data-tie="item:label"></span-l10n>
					<span-currency class="value" data-tie="item:total"></span-currency>
				</div>
			</template>
		</div>
	</div>
`;

initComponent('widget-deposits', class extends ComponentBase {
	updateView() {
		if (widgetDepositsModel.entries && widgetDepositsModel.entries.length) {
			const
				svg = this.shadowRoot.querySelector('.chart .pie'),
				centerX = svg.getBoundingClientRect().width / 2,
				width = 16;
			let lastPos = 0;
			widgetDepositsModel.entries
				.filter(entry => entry && entry.type && entry.total)
				.forEach(entry => {
					if (entry.type === 'pension') entry.order = 1;
					else if (entry.type === 'study') entry.order = 2;
					else if (entry.type === 'insurance') entry.order = 3;
					else entry.order = 4;
				});
			widgetDepositsModel.entries.sort((i1, i2) => i1.order < i2.order ? -1 : 1);
			widgetDepositsModel.entries
				.filter(entry => entry && entry.type && entry.total)
				.forEach(entry => {
					const
						to = lastPos + Math.max(entry.total / widgetDepositsModel.total * 360, 2);
					if (lastPos === 0 && to === 360) {
						lastPos = 1;
					}
					this.drawArc(svg, centerX, centerX, centerX - width / 2, width, lastPos, to, entry.type);
					lastPos = to;
				});
			this.drawArc(svg, centerX, centerX, centerX - width / 2, width, 0, 2, widgetDepositsModel.entries[0].type);
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
					label: 'l10n:widgetDeposits.' + fundType
				});
			});
		entries.sort((e1, e2) => e1.type > e2.type ? 1 : -1);

		widgetDepositsModel.total = total;
		widgetDepositsModel.currentHint = total;
		widgetDepositsModel.entries = entries;
		this.updateView();
	}

	get defaultTieTarget() {
		return 'data';
	}

	static get template() {
		return template;
	}
});