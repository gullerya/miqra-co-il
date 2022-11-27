import { currentLocale } from '../services/localization.js';

const
	rawDataKey = Symbol('raw.data.key'),
	l10nObserverKey = Symbol('l10n.observer.key'),
	preprocessorKey = Symbol('preprocessor.key');

customElements.define('span-currency', class extends HTMLElement {
	connectedCallback() {
		this[l10nObserverKey] = () => {
			this.innerHTML = this[preprocessorKey](this[rawDataKey])
		};
		currentLocale.observe(this[l10nObserverKey], { path: 'id' });
		if (this.innerText) {
			this[rawDataKey] = this.innerText;
			this.innerHTML = this[preprocessorKey](this.innerText);
		}
	}

	disconnectedCallback() {
		currentLocale.unobserve(this[l10nObserverKey]);
	}

	set textContent(text) {
		this[rawDataKey] = text;
		this.innerHTML = this[preprocessorKey](text);
	}

	get textContent() {
		if (rawDataKey in this) {
			return this[rawDataKey];
		} else {
			return this.innerText;
		}
	}

	[preprocessorKey](input) {
		const tmp = parseFloat(input);
		let result = input;

		if (typeof tmp === 'number' && !isNaN(tmp)) {
			result = tmp.toLocaleString(currentLocale.id, {
				minimumFractionDigits: tmp === Math.floor(tmp) ? 0 : 2,
				maximumFractionDigits: 2
			});
			if (currentLocale.id === 'en') {
				result = '<span class="currency-sign" style="font-size:0.75em;color:#aaa">ILS\u00A0</span>' + result;
			} else {
				result += '<span class="currency-sign" style="font-size:0.75em;color:#aaa">\u00A0\u20AA</span>'
			}
		}

		return result;
	}
});