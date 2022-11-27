import { ComponentBase, initComponent } from '../../libs/rich-component/rich-component.min.js';

const
	template = document.createElement('template'),
	granularitySet = {
		second: 1,
		minute: 2,
		hour: 3,
		date: 4,
		month: 5,
		year: 6
	},
	DEFAULT_GRANULARITY = granularitySet.date,
	granularityKey = Symbol('granularity.key'),
	rawValueKey = Symbol('raw.value.key');

template.innerHTML = `
	<style>
		:host {
			height: 52px;
			margin: 15px 0;
			display: flex;
			flex-direction: column;
			justify-content: space-between;
			cursor: default;
			user-select: none;
			outline: none;
			white-space: nowrap;
		}
		
		.label {
			display: flex;
			flex-direction: row;
			align-items: baseline;
			font-size: 80%;
			color: #a5a5a5;
		}
		
		.value {
			font-size: 100%;
			font-family: inherit;
			outline: none;
			background: none;
			border: none;
			display: flex;
			flex-direction: row;
			align-items: center;
		}

		.value.hidden {
			display: none;
		}
		
		.value > .spacer {
			flex-basis: 15px;
		}
		.value > .spacer.hidden {
			display: none;
		}

		.value > .time > .time-item:not(:first-of-type)::before {
			content: ':';
			margin: 0 4px;
			color: #ccc;
		}
		.value > .time.hidden {
			display: none;
		}
		.value > .time > .time-item.hidden {
			display: none;
		}
		
		.value > .date > .date-item:not(:first-of-type)::before {
			content: '/';
			margin: 0 4px;
			color: #ccc;
		}
		.value > .date.hidden {
			display: none;
		}
		.value > .date > .date-item.hidden {
			display: none;
		}

		.na.hidden {
			display: none;
		}
	</style>

	<slot name="label" class="label">
		<div></div>
	</slot>
	<div class="value">
		<span class="time">
			<span class="time-item hour"></span><span class="time-item minute"></span><span class="time-item second"></span>
		</span>
		<span class="spacer">&nbsp;</span>
		<span class="date">
			<span class="date-item day"></span><span class="date-item month"></span><span class="date-item year"></span>
		</span>
	</div>
	<span class="na hidden">---</span>
`;

initComponent('time-field', class ISureTimeField extends ComponentBase {
	connectedCallback() {
		this[granularityKey] = DEFAULT_GRANULARITY;
		this.refreshGranularity();
	}

	set label(label) {
		this.shadowRoot.querySelector('.label').textContent = label;
	}

	set value(value) {
		if (value instanceof Date) {
			this[rawValueKey] = value;
		} else if (value && typeof value === 'number') {
			this[rawValueKey] = new Date(value);
		} else if (value && typeof value === 'string') {
			this[rawValueKey] = new Date(value);
		} else if (!value) {
			this[rawValueKey] = null;
		} else {
			console.error('invalid value for time field "' + value + '"');
			return;
		}
		this.refreshValue();
	}

	get value() {
		return this[rawValueKey];
	}

	refreshGranularity() {
		const g = this[granularityKey] || DEFAULT_GRANULARITY;
		this.shadowRoot.querySelector('.value > .time > .second').classList[g > 1 ? 'add' : 'remove']('hidden');
		this.shadowRoot.querySelector('.value > .time > .minute').classList[g > 2 ? 'add' : 'remove']('hidden');
		this.shadowRoot.querySelector('.value > .time > .hour').classList[g > 3 ? 'add' : 'remove']('hidden');
		this.shadowRoot.querySelector('.value > .date > .day').classList[g > 4 ? 'add' : 'remove']('hidden');
		this.shadowRoot.querySelector('.value > .date > .month').classList[g > 5 ? 'add' : 'remove']('hidden');

		this.shadowRoot.querySelector('.value > .time').classList[g > 3 ? 'add' : 'remove']('hidden');
		this.shadowRoot.querySelector('.value > .spacer').classList[g > 3 ? 'add' : 'remove']('hidden');
	}

	refreshValue() {
		const v = this[rawValueKey];
		if (v instanceof Date) {
			this.shadowRoot.querySelector('.value').classList.remove('hidden');
			this.shadowRoot.querySelector('.na').classList.add('hidden');
			this.shadowRoot.querySelector('.hour').textContent = v ? v.getHours().toString().padStart(2, '0') : '';
			this.shadowRoot.querySelector('.minute').textContent = v ? v.getMinutes().toString().padStart(2, '0') : '';
			this.shadowRoot.querySelector('.second').textContent = v ? v.getSeconds().toString().padStart(2, '0') : '';
			this.shadowRoot.querySelector('.day').textContent = v ? v.getDate().toString().padStart(2, '0') : '';
			this.shadowRoot.querySelector('.month').textContent = v ? (v.getMonth() + 1).toString().padStart(2, '0') : '';
			this.shadowRoot.querySelector('.year').textContent = v ? v.getFullYear().toString().padStart(4, '0') : '';
		} else {
			this.shadowRoot.querySelector('.value').classList.add('hidden');
			this.shadowRoot.querySelector('.na').classList.remove('hidden');
		}
	}

	get defaultTieTarget() {
		return 'value';
	}

	static get template() {
		return template;
	}
});