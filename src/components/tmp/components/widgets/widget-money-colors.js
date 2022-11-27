import * as DataTier from '../../libs/data-tier/data-tier.min.js';
import '../../libs/data-tier-list/data-tier-list.min.js';
import { ComponentBase, initComponent } from '../../libs/rich-component/rich-component.min.js';
import * as l10n from '../../services/localization.js';
import '../../elements/span-currency.js';
import '../../elements/span-l10n.js';
import '../../elements/select-list.js';

const
	rawDataKey = Symbol('raw.data.key'),
	chartKey = Symbol('chart.key'),
	baseModel = {
		baseType: 'fund',
		onEntryEnter: event => {
			const t = event.target;
			widgetMoneyColorsModel.currentHint = t.fundTotal;
			t.getRootNode()
				.querySelectorAll('.drawing .' + t.className)
				.forEach(e => e.classList.add('selected'));
		},
		onEntryLeave: event => {
			const t = event.target;
			widgetMoneyColorsModel.currentHint = widgetMoneyColorsModel.total;
			t.getRootNode()
				.querySelectorAll('.drawing .' + t.className)
				.forEach(e => e.classList.remove('selected'));
		}
	},
	widgetMoneyColorsModel = DataTier.ties.create('widgetMoneyColors', baseModel),
	template = document.createElement('template');

l10n.initL10nResource('widgetMoneyColors', {
	he: {
		byFund: 'לפי סוג חסכון',
		byRedeem: 'לפי אופן המימוש',
		pension: 'פנסיה',
		study: 'השתלמות',
		insurance: 'ביטוח',
		provident: 'גמל',
		lump: 'חד פעמי',
		studyRedeem: 'השתלמות',
		installment: 'קצבה',
		other: 'אחר'
	},
	en: {
		byFund: 'By fund type',
		byRedeem: 'By redeem kind',
		pension: 'Pension',
		study: 'Study',
		insurance: 'Insurance',
		provident: 'Provident',
		lump: 'Lump sum',
		studyRedeem: 'Study',
		installment: 'Installment',
		other: 'Other'
	}
});

template.innerHTML = `
	<style>
		@import "./commons/styles/base.css";

		:host {
			display: flex;
			flex-direction: column;
			width: 36em;
			height: 30em;
			overflow: hidden;
			background-color: var(--default-background);
		}

		.content.hidden {
			display: none;
		}

		.toolbar {
			flex: 0 0 52px;
			display: flex;
			align-items: center;
			justify-content: space-between;
			box-shadow: 0 6px 6px 6px rgba(240, 246, 252, 0.9);
		}

		.toolbar > .menu {
			height: 100%;
			flex-direction: row;
			display: flex;
			align-items: center;
		}

		.tool {
			width: 44px;
			height: 44px;
			color: var(--main-gray);
		}

		.tool.on {
			color: var(--main-green);
		}

		.menu > .selectable {
			height: 100%;
			padding: 0 24px;
			box-sizing: border-box;
			border-bottom: 3px solid transparent;
			display: flex;
			align-items: center;
			color: var(--main-gray);
			background: none;
		}

		.menu > .selected {
			color: var(--main-yellow);
			border-bottom-color: var(--main-yellow);
		}

		.content {
			flex: 1;
			display:flex;
			flex-direction: column;
			justify-content: space-between;
			overflow: hidden;
		}

		.chart {
			position: relative;
			flex: 0 0 24em;
			height: 24em;
			align-items: center;
			justify-content: space-between;
		}

		.drawing {
			position: absolute;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
		}
		.drawing .secondary {
			opacity: 0.4;
		}
		.drawing .selected {
			opacity: 1;
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
		.drawing .installment {
			color: var(--pension-color);
		}
		.drawing .studyRedeem {
			color: var(--study-color);
		}
		.drawing .lump {
			color: var(--provident-color);
		}
		.drawing .other {
			color: var(--main-gray);
		}

		.hint {
			position: absolute;
			top: 50%;
			left: 50%;
			transform: translate(-50%, -50%);
			text-align: center;
		}

		.row.main {
			flex: 0 1 auto;
			display: flex;
			justify-content: space-between;
		}

		.legend {
			display: flex;
			flex-direction: column;
			justify-content: center;
		}

		.row.legend {
			flex: 0 0 3em;
			display: flex;
			flex-direction: initial;
			align-items: center;
			justify-content: space-evenly;
		}

		.legend > * {
			padding: 12px;
			display: flex;
			align-items: center;
		}

		.legend > .magician {
			display: none;
		}

		.hinter {
			border-radius: 50%;
		}

		.hinter.outer {
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
		.installment .hinter.outer {
			border-color: var(--pension-color);
		}
		.studyRedeem .hinter.outer {
			border-color: var(--study-color);
		}
		.lump .hinter.outer {
			border-color: var(--provident-color);
		}
		.other .hinter.outer {
			border-color: var(--main-gray);
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
		.installment:hover .hinter.inner {
			background-color: var(--pension-color);
		}
		.studyRedeem:hover .hinter.inner {
			background-color: var(--study-color);
		}
		.lump:hover .hinter.inner {
			background-color: var(--provident-color);
		}
		.other:hover .hinter.inner {
			background-color: var(--main-gray);
		}

		.legend .label {
			margin: 0 18px;
			white-space: nowrap;
		}

		.content.bar .chart {
			display: flex;
		}

		.content.bar .chart .entry {
			flex: 1;
			height: 100%;
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: flex-end;
		}

		.bar .entry .label {
			flex: 0 0 3em;
			display: flex;
			align-items: center;
		}

		.bar .entry .bar {
			width: 100%;
			border-bottom: 1px solid var(--main-gray);
			position: relative;
			overflow: hidden;
		}

		.bar .entry .bar > div {
			position: absolute;
			left: calc(50% - 2em);
			bottom: -4em;
			width: 4em;
			border-radius: 4em;
			transition: height 200ms;
		}
		.entry .bar .pension {
			background-color: var(--pension-color);
		}
		.entry .bar .study {
			background-color: var(--study-color);
		}
		.entry .bar .insurance {
			background-color: var(--insurance-color);
		}
		.entry .bar .provident {
			background-color: var(--provident-color);
		}
		.entry .bar .installment {
			background-color: var(--pension-color);
		}
		.entry .bar .studyRedeem {
			background-color: var(--study-color);
		}
		.entry .bar .lump {
			background-color: var(--provident-color);
		}
		.entry .bar .other {
			background-color: var(--main-gray);
		}
	</style>

	<div class="toolbar">
		<select-list class="menu" data-tie="widgetMoneyColors:baseType">
			<span class="selectable" data-value="fund" data-tie="l10n:widgetMoneyColors.byFund"></span>
			<span class="selectable" data-value="redeem" data-tie="l10n:widgetMoneyColors.byRedeem"></span>
		</select-list>
		<tool-bar class="tools">
			<tool-icon class="tool bar">
				<svg-icon type="barChart"></svg-icon>
			</tool-icon>
			<tool-icon class="tool pie on">
				<svg-icon type="pieChart"></svg-icon>
			</tool-icon>
		</tool-bar>
	</div>

	<div class="content pie">
		<div class="row main">
			<div class="chart">
				<svg class="drawing"></svg>
				<h3><span-currency class="hint" data-tie="widgetMoneyColors:currentHint"></span-currency></h3>
			</div>
			<div class="legend">
				<template class="magician" is="data-tier-item-template" data-tie="widgetMoneyColors:vEntries">
					<div data-tie="item:type => className, item:total => fundTotal, widgetMoneyColors:onEntryEnter => onmouseenter, widgetMoneyColors:onEntryLeave => onmouseleave">
						<span class="hinter outer">
							<span class="hinter inner"></span>
						</span>
						<span-l10n class="label" data-tie="item:label"></span-l10n>
					</div>
				</template>
			</div>
		</div>
		<div class="row legend">
			<template class="magician" is="data-tier-item-template" data-tie="widgetMoneyColors:hEntries">
				<div data-tie="item:type => className, item:total => fundTotal, widgetMoneyColors:onEntryEnter => onmouseenter, widgetMoneyColors:onEntryLeave => onmouseleave">
					<span class="hinter outer">
						<span class="hinter inner"></span>
					</span>
					<span-l10n class="label" data-tie="item:label"></span-l10n>
				</div>
			</template>
		</div>
	</div>

	<div class="content bar hidden">
		<div class="row legend">
			<template class="magician" is="data-tier-item-template" data-tie="widgetMoneyColors:barLegend">
				<div data-tie="item:type => className">
					<span class="hinter outer">
						<span class="hinter inner"></span>
					</span>
					<span-l10n class="label" data-tie="item:label"></span-l10n>
				</div>
			</template>
		</div>
		<div class="chart">
			<template class="magician" is="data-tier-item-template" data-tie="widgetMoneyColors:barEntries">
				<div class="entry" data-tie="item => value">
					<h3><span-currency data-tie="item:total"></span-currency></h3>
					<div class="bar">
						<template class="magician" is="data-tier-item-template" data-tie="item:innerEntries">
							<div class="bar-part" data-tie="item:type => className; item:value => value"></div>
						</template>
					</div>
					<span-l10n class="label" data-tie="item:label"></span-l10n>
				</div>
			</template>
		</div>
	</div>
`;

initComponent('widget-money-colors', class extends ComponentBase {
	connectedCallback() {
		this[chartKey] = 'pie';
		widgetMoneyColorsModel.observe(() => {
			if (this[chartKey] === 'pie') {
				this.updatePie();
			} else {
				this.updateBar();
			}
		}, { path: 'baseType' });
		this.shadowRoot.querySelectorAll('.tool').forEach(tool => {
			tool.addEventListener('click', () => {
				let newChartType;
				this.shadowRoot.querySelectorAll('.tool').forEach(t => {
					if (t === tool) {
						t.classList.add('on');
						newChartType = t.classList.contains('pie') ? 'pie' : 'bar';
					} else {
						t.classList.remove('on');
					}
				});
				if (this[chartKey] !== newChartType) {
					this[chartKey] = newChartType;
					if (newChartType === 'pie') {
						this.shadowRoot.querySelector('.content.bar').classList.add('hidden');
						this.shadowRoot.querySelector('.content.pie').classList.remove('hidden');
						this.updatePie();
					} else {
						this.shadowRoot.querySelector('.content.pie').classList.add('hidden');
						this.shadowRoot.querySelector('.content.bar').classList.remove('hidden');
						this.updateBar();
					}
				}
			});
		});
		this.updatePie();
	}

	disconnectedCallback() {
		widgetMoneyColorsModel.unobserve();
		Object.assign(widgetMoneyColorsModel, baseModel);
	}

	updatePie() {
		if (!this.parentNode) {
			return;
		}

		const
			svg = this.shadowRoot.querySelector('.pie .drawing'),
			centerX = svg.getBoundingClientRect().width / 2;
		while (svg.childElementCount) svg.removeChild(svg.lastElementChild);

		if (!this[rawDataKey]) {
			return;
		}

		const
			data = this.prepareDataByBaseType(this[rawDataKey]),
			primaryTotals = {};
		let totalPrimaries = 0,
			totalSecondaries = 0,
			totalValue = 0;
		Object.keys(data).forEach(primary => {
			const entryTotal = Object.keys(data[primary])
				.map(secondary => {
					if (typeof data[primary][secondary].total === 'number') {
						totalSecondaries++;
						return data[primary][secondary].total;
					} else {
						return 0;
					}
				})
				.reduce((acc, val) => acc + val, 0);
			if (entryTotal) {
				primaryTotals[primary] = entryTotal;
				totalPrimaries++;
				totalValue += entryTotal;
			}
		});

		if (!totalPrimaries) {
			return;
		}

		let lastPos = 1;
		Object.keys(primaryTotals)
			.sort()
			.forEach(primary => {
				const
					primaryWidth = 52,
					secondaryWidth = 8;

				//	draw primary part
				const
					priFrom = lastPos,
					priTo = priFrom + Math.max(primaryTotals[primary] / totalValue * (360 - totalPrimaries) - 1, 2);
				this.drawArc(svg, centerX, centerX, centerX - primaryWidth - secondaryWidth, primaryWidth, priFrom, priTo, [primary]);

				//	draw secondary part
				let secLastPos = lastPos;
				Object.keys(data[primary])
					.forEach(secondary => {
						const
							secFrom = secLastPos,
							secTo = secFrom + Math.max(data[primary][secondary].total / totalValue * (360 - totalSecondaries) - 1, 2);
						this.drawArc(svg, centerX, centerX, centerX - primaryWidth / 2 + secondaryWidth / 2 - 4, secondaryWidth, secFrom, secTo, [secondary, 'secondary']);
						secLastPos = secTo + 2;
					});

				lastPos = priTo + 2;
			});
	}

	async updateBar() {
		if (!this.parentNode) {
			return;
		}
		if (!this[rawDataKey]) {
			return;
		}

		const
			data = this.prepareDataByBaseType(this[rawDataKey]),
			tmpLegend = [],
			tmpEntries = [];
		const innerKeys = Object.keys(data)
			.map(mk => data[mk])
			.reduce((acc, cv) => {
				Object.keys(cv).forEach(innerKey => { acc[innerKey] = true; });
				return acc;
			}, {});
		Object.keys(innerKeys).forEach(ik => {
			tmpLegend.push({
				type: ik,
				label: 'l10n:widgetMoneyColors.' + ik
			});
		})

		Object.keys(data).forEach(entryType => {
			tmpEntries.push({
				total: Object.keys(data[entryType]).reduce((acc, cv) => acc + data[entryType][cv].total, 0),
				label: 'l10n:widgetMoneyColors.' + entryType,
				innerEntries: Object.keys(data[entryType]).map(e => { return { type: e, value: data[entryType][e].total }; })
			});
		});

		widgetMoneyColorsModel.barLegend = tmpLegend;
		widgetMoneyColorsModel.barEntries = tmpEntries;

		//	draw bars
		await new Promise((resolve, reject) => setTimeout(resolve, 0));
		const maxVal = tmpEntries.map(e => e.total).reduce((acc, cv) => Math.max(acc, cv), 0);
		this.shadowRoot.querySelectorAll('.bar .entry').forEach(barEl => {
			const bTotal = barEl.value.total;
			let current = 0,
				zIndex = 10;
			barEl.querySelector('.bar').style.flex = bTotal / maxVal;
			barEl.querySelector('.bar').querySelectorAll('div').forEach(innerBar => {
				current += innerBar.value / bTotal * 100;
				innerBar.style.height = 'calc(' + current + '% + 4em)';
				innerBar.style.zIndex = zIndex--;
			});
		});
	}

	prepareDataByBaseType(input) {
		if (!input) {
			console.error('invalid input');
			return;
		}

		if (widgetMoneyColorsModel.baseType === 'fund') {
			return input;
		} else {
			const result = {};
			Object.keys(input)
				.forEach(primary => {
					Object.keys(input[primary])
						.forEach(secondary => {
							if (input[primary][secondary].total) {
								if (!(secondary in result)) {
									result[secondary] = {};
								}
								if (!(primary in result[secondary])) {
									result[secondary][primary] = { total: 0 };
								}
								result[secondary][primary].total += input[primary][secondary].total;
							}
						});
				});
			return result;
		}
	}

	drawArc(svg, centerX, centerY, radius, width, startAngle, endAngle, classes) {
		svg.setAttribute('viewBox', [0, 0, svg.getBoundingClientRect().width, svg.getBoundingClientRect().width].join(' '));

		const
			start = this.polarToCartesian(centerX, centerY, radius, endAngle),
			end = this.polarToCartesian(centerX, centerY, radius, startAngle),
			largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1,
			d = ['M', start.x, start.y, 'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y].join(' '),
			path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
		path.classList.add('part', ...classes);
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

		this[rawDataKey] = data;

		let total = 0;
		const vEntries = [], hEntries = {};
		Object.keys(data)
			.filter(fundType => data[fundType] && Object.keys(data[fundType]).some(redeem => data[fundType][redeem].total))
			.forEach(fundType => {
				const ftTotal = this.processFundType(data[fundType], hEntries);
				vEntries.push({
					type: fundType,
					total: ftTotal,
					label: 'l10n:widgetMoneyColors.' + fundType
				});
				total += ftTotal;
			});

		vEntries.sort((e1, e2) => e1.type > e2.type ? 1 : -1);

		widgetMoneyColorsModel.total = total;
		widgetMoneyColorsModel.currentHint = total;
		widgetMoneyColorsModel.vEntries = vEntries;
		widgetMoneyColorsModel.hEntries = Object.keys(hEntries)
			.map(key => hEntries[key])
			.sort((e1, e2) => e1.type > e2.type ? 1 : -1);
		this.updatePie();
	}

	processFundType(fundType, redeems) {
		let totalFundType = 0;
		Object.keys(fundType)
			.filter(redeem => fundType[redeem] && fundType[redeem].total)
			.forEach(redeem => {
				totalFundType += fundType[redeem].total;
				if (!(redeem in redeems)) {
					redeems[redeem] = {
						type: redeem,
						total: 0,
						label: 'l10n:widgetMoneyColors.' + redeem
					};
				}
				redeems[redeem].total += fundType[redeem].total;
			});
		return totalFundType;
	}

	get defaultTieTarget() {
		return 'data';
	}

	static get template() {
		return template;
	}
});