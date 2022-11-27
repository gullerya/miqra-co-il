import { initComponent } from '../libs/rich-component/rich-component.min.js';
import { InputText } from './input-text.js';

initComponent('input-pass', class extends InputText {
	connectedCallback() {
		super.connectedCallback();
		const
			s = document.createElement('style'),
			ie = this.shadowRoot.querySelector('.input'),
			uv = document.createElement('svg-icon');
		ie.type = 'password';
		uv.type = 'unveil';
		uv.className = 'unveil';

		s.innerHTML = `
			.unveil {
				display: inline-flex;
				color: var(--main-gray);
				outline: none;
			}

			.unveil:hover {
				color: #00f;
				opacity: 0.5;
			}

			:host(:not(:focus-within):not(.has-content)) .unveil {
				visibility: hidden;
			}
		`;

		ie.parentNode.insertBefore(uv, ie);
		this.shadowRoot.appendChild(s);

		this.shadowRoot.querySelector('.unveil').addEventListener('mouseenter', () => {
			ie.type = 'text';
		});
		this.shadowRoot.querySelector('.unveil').addEventListener('mouseleave', () => {
			ie.type = 'password';
		});

		this.statusOn = true;
	}

	validator(input) {
		return input && typeof input.length === 'number' && input.length >= 8 &&
			input !== input.toLowerCase() &&
			input !== input.toUpperCase() &&
			(/.*\d.*/.test(input) || /.*[!@#$%^&*()].*/.test(input));
	}
});