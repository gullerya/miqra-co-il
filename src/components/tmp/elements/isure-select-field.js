const
	template = document.createElement('template'),
	labelKey = Symbol('label.key'),
	valueKey = Symbol('value.key');

template.innerHTML = `
	<style>
		:host {
			height: 50px;
			margin: 15px 0;
			display: flex;
			flex-direction: column;
			justify-content: space-between;
			user-select: none;
			outline: none;
		}

		:host > .label {
			display: flex;
			flex-direction: row;
			align-items: baseline;
			color: #666;
		}

		:host > .label > .required-mark {
			visibility: hidden;
			margin: 0 3px;
			border: 3px solid #f00;
			border-radius: 50%;
		}

		:host.required > .label > .required-mark {
			visibility: visible;
		}

		:host > .label > .label-text {
			font-size: 80%;
		}

		:host > .value {
			outline: 3px solid red;
		}
	</style>

	<div class="label">
		<span class="required-mark"></span>
		<label class="label-text"></label>
	</div>
	<div class="value">
		<span class="value-image" data-tie="value:image"></span>
		<span class="value-label" data-tie="value:label"></span>
	</div>
`;

customElements.define('isure-select-field', class extends HTMLElement {
	constructor() {
		super();
		this
			.attachShadow({ mode: 'open' })
			.appendChild(template.content.cloneNode(true));
	}

	connectedCallback() {
		if (typeof this[labelKey] === 'undefined') {
			this[labelKey] = this.getAttribute('label') || 'NA';
		}
		this.label = this[labelKey];
		this.required = this.hasAttribute('required');
		this.readonly = this.hasAttribute('readonly');
		this.tabIndex = this.getAttribute('tabindex') || 0;
		this.setupEventHandlers();
	}

	setupEventHandlers() {
		this.addEventListener('click', event => {
			console.log('open selection list');
		});
	}

	set label(label) {
		this[labelKey] = label;
		if (this.parentNode) {
			this.shadowRoot.querySelector('.label > .label-text').textContent = label;
		}
	}

	set required(required) {
		if (required) {
			this.classList.add('required');
		} else {
			this.classList.remove('required');
		}
	}

	get required() {
		return this.classList.contains('required');
	}

	set readonly(readOnly) {
		if (readOnly) {
			this.classList.add('readonly');
		} else {
			this.classList.remove('readonly');
		}
	}

	get readonly() {
		return this.classList.contains('readonly');
	}

	set value(value) {
		this[valueKey] = value;
	}

	get value() {
		return this[valueKey];
	}
});