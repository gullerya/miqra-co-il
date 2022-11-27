import { ComponentBase, initComponent } from '../libs/rich-component/rich-component.min.js';
import './svg-icon.js';

const
	valueKey = Symbol('value.key'),
	readOnlyKey = Symbol('readonly.key'),
	disabledKey = Symbol('disabled.key'),
	statusOnKey = Symbol('status.on.key'),
	validatorKey = Symbol('validator.key'),
	defaultValidatorKey = Symbol('default.validator.key'),
	template = document.createElement('template');

template.innerHTML = `
	<style class="style">
		:host {
			position: relative;
			width: 240px;
			height: 36px;
			box-sizing: border-box;
			border-bottom: 1px solid #aaa;
			margin: 24px 0;
			display: inline-flex;
			align-items: center;
		}

		.input-strip {
			width: 100%;
			display: flex;
			align-items: center;
		}

		.input {
			flex: 1;
			height: 100%;
			min-width: 0;
			border: none;
			outline: none;
			background: none;
			font: inherit;
			box-sizing: border-box;
			text-align: inherit;
		}

		:host(.numeric) > .input-strip,
		:host(.input-ltr) > .input-strip {
			direction: ltr;
		}

		:host(.input-rtl) > .input-strip {
			direction: rtl;
		}

		:host(.disabled) {
			border-bottom: 1px solid #ccc;
			background-color: #efefef;
		}

		:host(:focus-within) {
			border-bottom-color: inherit;
		}

		.status {
			display: none;
			width: 0.8em;
			height: 0.8em;
		}

		:host(.has-content.status-on:not(.invalid)) .status.v {
			display: flex;
		}

		:host(.has-content.status-on.invalid) .status.x {
			display: flex;
		}

		.label::slotted(*) {
			position: absolute;
			top: 0;
			width: 100%;
			height: 100%;
			font-size: 100%;
			display: flex;
			align-items: center;
			transition: all 100ms;
			pointer-events: none;
			color: var(--main-gray);
		}

		:host(.center) {
			text-align: center;
		}

		:host(.center) > .label::slotted(*) {
			justify-content: center;
		}

		:host(:focus-within) > .label::slotted(*), :host(.has-content) > .label::slotted(*) {
			top: -20px;
			height: auto;
			font-size: 75%;
		}

		:host(.required) > .label::slotted(*)::before {
			content: "\u2022";
			font: 1.3em monospace;
			color: red;
		}

		.hint {
			position: absolute;
			display: none;
			top: 100%;
			width: 100%;
			font-size: 75%;
			overflow: hidden;
			white-space: nowrap;
			justify-content: flex-end;
		}

		:host(:focus-within:not(.invalid)) > .hint.help {
			display: flex;
			color: rgba(128, 128, 128, 0.75);
		}

		:host(.invalid:focus-within) > .hint.error {
			display: flex;
			color: rgba(192, 0, 0, 0.75);
		}
	</style>

	<div class="input-strip">
		<input type="text" class="input"/>
		<svg-icon type="v" class="status v"></svg-icon>
		<svg-icon type="x" class="status x"></svg-icon>
	</div>
	<slot name="label" class="label"></slot>
	<slot name="help" class="hint help"></slot>
	<slot name="error" class="hint error"></slot>
`;

export class InputText extends ComponentBase {
	connectedCallback() {
		const i = this.shadowRoot.querySelector('.input');
		if (valueKey in this) {
			this.value = this[valueKey];
			delete this[valueKey];
		}
		if (readOnlyKey in this) {
			this.readOnly = this[readOnlyKey];
		} else if (this.hasAttribute('readonly')) {
			this.readOnly = true;
		}
		if (disabledKey in this) {
			this.disabled = this[disabledKey];
		} else if (this.hasAttribute('disabled')) {
			this.disabled = true;
		}
		if (statusOnKey in this) {
			this.statusOn = this[statusOnKey];
			delete this[statusOnKey];
		} else if (this.hasAttribute('status-on')) {
			this.statusOn = true;
		}
		if (this.hasAttribute('name')) {
			i.name = this.getAttribute('name');
		}
		if (this.hasAttribute('tabindex')) {
			i.setAttribute('tabindex', this.getAttribute('tabindex'));
		}
		if (this.hasAttribute('maxlength')) {
			i.maxLength = this.getAttribute('maxlength');
		}
		i.addEventListener('blur', () => {
			if (this.value !== null && this.value !== '') {
				this.classList.add('has-content');
			} else {
				this.classList.remove('has-content');
			}
		});
		i.addEventListener('input', () => {
			this.classList.add('interacted');
			this.validate();
		}, true);
		i.addEventListener('keydown', e => {
			if ((this.hasAttribute('numeric') || this.classList.contains('numeric')) &&
				!e.code.startsWith('Digit') &&
				!e.code.startsWith('Arrow') &&
				!e.code.startsWith('Numpad') &&
				e.code !== 'Period' &&
				e.code !== 'Slash' &&
				e.code !== 'Backspace' &&
				e.code !== 'Delete' &&
				e.code !== 'Enter' &&
				e.code !== 'Home' &&
				e.code !== 'Tab' &&
				e.code !== 'End' &&
				e.code !== 'NumpadEnter'
			) {
				e.preventDefault();
			}
			if (this.hasAttribute('numeric') && (e.shiftKey || e.altKey || e.ctrlKey)) {
				e.preventDefault();
			}
		});
		i.addEventListener('keyup', e => {
			if (e.code === 'Enter' || e.code === 'NumpadEnter') {
				if (typeof this.submit === 'function') {
					this.submit();
				}
				this.dispatchEvent(new Event('submit'));
			}
		});
	}

	set value(value) {
		if (this[disabledKey]) return;
		if (this.shadowRoot) {
			this.shadowRoot.querySelector('.input').value = value;
		} else {
			this[valueKey] = value;
		}
		this.validate();
	}

	get value() {
		if (this.shadowRoot) {
			return this.shadowRoot.querySelector('.input').value;
		} else {
			return this[valueKey];
		}
	}

	set readOnly(readOnly) {
		this[readOnlyKey] = Boolean(readOnly);
		if (this.shadowRoot) {
			const i = this.shadowRoot.querySelector('.input');
			i.disabled = this[readOnlyKey];
			if (this[readOnlyKey]) {
				this.classList.add('readonly');
			} else {
				this.classList.remove('readonly');
			}
		}
	}

	get readOnly() {
		return this[this.readOnly];
	}

	set disabled(disabled) {
		this[disabledKey] = Boolean(disabled);
		if (this.shadowRoot) {
			const i = this.shadowRoot.querySelector('.input');
			i.disabled = this[disabledKey];
			if (this[disabledKey]) {
				this.value = null;
				this.classList.add('disabled');
			} else {
				this.classList.remove('disabled');
			}
		}
	}

	get disabled() {
		return this[disabledKey];
	}

	get isValid() {
		return !this.classList.contains('invalid');
	}

	focus() {
		if (this.shadowRoot) {
			this.shadowRoot.querySelector('.input').focus();
		}
	}

	set validator(validator) {
		if (typeof validator === 'function') {
			this[validatorKey] = validator;
		}
	}

	get validator() {
		return typeof this[validatorKey] === 'function' ? this[validatorKey] : this[defaultValidatorKey];
	}

	validate() {
		const validationResult = Boolean(this.validator(this.value));
		if (validationResult) {
			this.classList.remove('invalid');
		} else {
			this.classList.add('invalid');
		}

		if (this.value) {
			this.classList.add('has-content');
		} else {
			this.classList.remove('has-content');
		}
	}

	[defaultValidatorKey](value) {
		if (this.classList.contains('required') && !value) {
			return false;
		} else {
			return true;
		}
	}

	get defaultTieTarget() {
		return 'value';
	}

	get changeEventName() {
		return 'input';
	}

	static get template() {
		return template;
	}
}

initComponent('input-text', InputText);