import { initComponent } from '../libs/rich-component/rich-component.min.js';
import { InputText } from './input-text.js';
import { openPopup } from '../components/popup.js';

const
	optionsPopupKey = Symbol('options.popup');

initComponent('input-list', class extends InputText {
	connectedCallback() {
		super.connectedCallback();
		const
			optionsSlot = document.createElement('slot');
		optionsSlot.style.display = 'none';
		this.shadowRoot.appendChild(optionsSlot);
		optionsSlot.addEventListener('slotchange', () => {
			optionsSlot.assignedElements().forEach(n => {
			});
		});
		this.shadowRoot.querySelector('.input').addEventListener('focus', () => {
			this[optionsPopupKey] = openPopup(this, optionsSlot.assignedElements().map(e => e.cloneNode(true)));
		});
		this.shadowRoot.querySelector('.input').addEventListener('blur', () => {
			if (this[optionsPopupKey]) {
				this[optionsPopupKey].close();
				this[optionsPopupKey] = null;
			}
		});
		this.statusOn = true;
	}

	validator(input) {
		if (!input || typeof input !== 'string' || input.length < 8) {
			return false;
		}
		//	TODO: add more validations
		return true;
	}
});