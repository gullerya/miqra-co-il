customElements.define('span-l10n', class extends HTMLElement {
	connectedCallback() {
		this.appendChild(document.createElement('span'));
	}

	set l10nKey(l10nKey) {
		if (l10nKey && typeof l10nKey === 'string') {
			this.firstElementChild.dataset.tie = l10nKey;
		} else {
			this.firstElementChild.dataset.tie = 'l10n:nonExistingKeyToEmptify';
		}
	}

	get defaultTieTarget() {
		return 'l10nKey';
	}
});