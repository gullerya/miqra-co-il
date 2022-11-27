import { ComponentBase, initComponent } from '../libs/rich-component/rich-component.min.js';

const
	VALUE_KEY = Symbol('value.key'),
	template = document.createElement('template');

template.innerHTML = `
	<style>
		:host {
			display: inline-flex;
			direction: ltr;
			overflow: hidden;
			white-space: nowrap;
		}

		.day::after, .month::after {
			content: "/";
			margin: 0 4px;
			color: #ccc;
		}

		:host(.no-day) > .day {
			display: none;
		}
	</style>

	<span class="day"></span>
	<span class="month"></span>
	<span class="year"></span>
`;

initComponent('span-date', class extends ComponentBase {
	set value(value) {
		if (value) {
			if (typeof value === 'string') {
				this[VALUE_KEY] = translateDateString(value);
			} else if (typeof value === 'number') {
				this[VALUE_KEY] = new Date(value);
			} else if (typeof value === 'object' && value instanceof Date && !isNaN(value.getTime())) {
				this[VALUE_KEY] = value;
			}
		} else {
			this[VALUE_KEY] = null;
		}
		this.update();
	}

	update() {
		let day = '--', month = '--', year = '----';
		if (this[VALUE_KEY]) {
			day = this[VALUE_KEY].getDate().toString().padStart(2, '0');
			month = (this[VALUE_KEY].getMonth() + 1).toString().padStart(2, '0');
			year = this[VALUE_KEY].getFullYear().toString().padStart(4, '0');
		}
		this.shadowRoot.querySelector('.day').textContent = day;
		this.shadowRoot.querySelector('.month').textContent = month;
		this.shadowRoot.querySelector('.year').textContent = year;
	}

	get defaultTieTarget() {
		return 'value';
	}

	static get template() {
		return template;
	}
});

function translateDateString(dateString) {
	let result = null,
		year, month, day;

	if (dateString.indexOf('/') > 0) {
		//	parse as ISO date
		const parts = dateString.split('/');
		day = 1;
		month = 0;
		if (parts.length === 3) {
			day = parseInt(parts[0]);
			month = parseInt(parts[1]);
			year = parseInt(parts[2]);
		} else if (parts.length === 2) {
			month = parseInt(parts[0]);
			year = parseInt(parts[1]);
		} else {
			year = parseInt(parts[0]);
		}
		result = new Date(year, month, day);
	} else {
		//	parse as Clearing House date
		if (dateString.length >= 6) {
			year = parseInt(dateString.substring(0, 4));
			month = parseInt(dateString.substring(4, 6)) - 1;
			day = 1;
		}
		if (dateString.length === 8) {
			day = parseInt(dateString.substring(6, 8));
		}
		result = new Date(year, month, day);
	}

	return result;
}