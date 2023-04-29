import * as DataTier from '../libs/data-tier/data-tier.min.js';
import { ComponentBase, initComponent } from '../libs/rich-component/rich-component.min.js';

const
	timeDownModels = DataTier.ties.create('timeDown', []),
	INSTANCE_ID_KEY = Symbol('instance.id'),
	VALUE_KEY = Symbol('value.key'),
	TIMER_KEY = Symbol('timer.key');

let instanceId = 1;

initComponent('time-down', class extends ComponentBase {
	constructor() {
		super();
		this.value = 0;
	}

	get instanceId() {
		if (!this[INSTANCE_ID_KEY]) {
			this[INSTANCE_ID_KEY] = instanceId++;
		}
		return this[INSTANCE_ID_KEY];
	}

	set value(value) {
		if (typeof value === 'number' && !isNaN(value)) {
			value = Math.max(0, value);
		} else {
			value = 0;
		}
		this[VALUE_KEY] = value;
		this.update(value);
		this.updateTimer();
	}

	get value() {
		return this[VALUE_KEY];
	}

	updateTimer() {
		if (this[TIMER_KEY]) {
			clearInterval(this[TIMER_KEY]);
			this[TIMER_KEY] = null;
		}
		if (this[VALUE_KEY]) {
			this[TIMER_KEY] = setInterval(() => this.updater(), 1000);
		}
	}

	updater() {
		const value = Math.max(0, this[VALUE_KEY] - 1000);
		this[VALUE_KEY] = value;
		this.update(value);
		if (!value && this[TIMER_KEY]) {
			clearInterval(this[TIMER_KEY]);
			this[TIMER_KEY] = null;
		}
	}

	update(value) {
		const
			h = Math.floor(value / 1000 / 60 / 60),
			m = Math.floor(value / 1000 / 60 - h * 60),
			s = Math.floor((value - h * 60 * 60 * 1000 - m * 60 * 1000) / 1000);
		timeDownModels[this.instanceId] = { h: h.toString().padStart(2, '0'), m: m.toString().padStart(2, '0'), s: s.toString().padStart(2, '0') };
	}

	get defaultTieTarget() {
		return 'value';
	}

	static get template() {
		return self => {
			const
				iid = self.instanceId,
				tmpTemplate = document.createElement('template');
			tmpTemplate.innerHTML = `
				<style>
					:host {
						width: 8em;
						direction: ltr;
						display: flex;
						align-items: center;
						justify-content: space-between;
					}
				</style>

				<span class="item hours" data-tie="timeDown:${iid}.h"></span>
				<span class="split hours">:</span>
				<span class="item mins" data-tie="timeDown:${iid}.m"></span>
				<span class="split mins">:</span>
				<span class="item secs" data-tie="timeDown:${iid}.s"></span>
			`;
			return tmpTemplate;
		};
	}
});