import { ComponentBase, initComponent } from '../libs/rich-component/rich-component.min.js';
import './input-text.js';
import './input-button.js';

const
	COUNTDOWN_VALUE_KEY = Symbol('countdown.value.key'),
	COUNTDOWN_PRINT_KEY = Symbol('countdown.print.key'),
	COUNTDOWN_INTERVAL_KEY = Symbol('countdown.interval.key'),
	COUNTDOWN_FUNCTION_KEY = Symbol('countdown.function.key'),
	template = document.createElement('template');

template.innerHTML = `
	<style>
		:host {
			width: 240px;
			height: 36px;
			margin: 24px 0;
			min-width: 180px;
			display: flex;
			align-items: center;
			justify-content: space-between;
		}

		.otp-input {
			flex: 0 0 0;
			overflow: hidden;
			transition: all 100ms;
			outline: none;
		}

		.spacer {
			flex: 0 0 0;
		}

		.act {
			flex: 1;
		}

		.countdown {
			display: none;
		}

		:host(.sent) .otp-input {
			flex-basis: calc(50% - 1em);
		}

		:host(.sent) .spacer {
			flex-basis: 2em;
		}

		:host(.sent) .countdown {
			display: initial;
		}

		:host(.sent) .custom-text {
			display: none;
		}
	</style>

	<input-text class="otp-input required" tabindex="-1"></input-text>
	<span class="spacer"></span>
	<input-button class="act">
		<slot class="custom-text" name="button-text" slot="text"></slot>
		<span class="countdown" slot="text"></span>
	</input-button>
`;

initComponent('input-otp', class extends ComponentBase {
	connectedCallback() {
		if (this.classList.contains('disabled')) {
			this.shadowRoot.querySelector('.act').classList.add('disabled');
		}

		this.shadowRoot.querySelector('.act').addEventListener('click', async event => {
			if (typeof this.sendOTP === 'function') {
				event.target.classList.add('disabled');
				let ttl;
				try {
					ttl = await this.sendOTP();
				} catch (e) {
					console.error('failed in "sendOTP" function', e);
				}
				if (ttl) {
					clearInterval(this[COUNTDOWN_INTERVAL_KEY]);
					this.classList.add('sent');
					this.shadowRoot.querySelector('.otp-input').focus();
					this[COUNTDOWN_VALUE_KEY] = ttl;
					this[COUNTDOWN_PRINT_KEY](ttl);
					this[COUNTDOWN_INTERVAL_KEY] = setInterval(() => this[COUNTDOWN_FUNCTION_KEY](), 1000);
				} else {
					event.target.classList.remove('disabled');
				}
			} else {
				console.error('no "sendOTP" function installed');
			}
		});
	}

	static get observedAttributes() {
		return ['class'];
	}

	attributeChangedCallback(name, oldValue, newValue) {
		if (this.classList.contains('disabled') || this.classList.contains('sent')) {
			this.shadowRoot.querySelector('.act').classList.add('disabled');
		} else {
			this.shadowRoot.querySelector('.act').classList.remove('disabled');
		}
	}

	set value(value) {
		this.shadowRoot.querySelector('.otp-input').value = value;
	}

	get value() {
		return this.shadowRoot.querySelector('.otp-input').value;
	}

	reset() {
		clearInterval(this[COUNTDOWN_INTERVAL_KEY]);
		this[COUNTDOWN_VALUE_KEY] = null;
		this.value = null;
		this.classList.remove('sent');
		this.shadowRoot.querySelector('.act').classList.remove('disabled');
	}

	[COUNTDOWN_FUNCTION_KEY]() {
		let countdownValue = this[COUNTDOWN_VALUE_KEY];
		if (!countdownValue || isNaN(countdownValue)) {
			this.reset();
		} else {
			countdownValue -= 1000;
			countdownValue = Math.max(countdownValue, 0);
			this[COUNTDOWN_VALUE_KEY] = countdownValue;
			this[COUNTDOWN_PRINT_KEY](countdownValue);
		}
	}

	[COUNTDOWN_PRINT_KEY](countdownValue) {
		this.shadowRoot.querySelector('.countdown').textContent = Math.round(countdownValue / 1000);
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
});