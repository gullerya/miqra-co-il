customElements.define('data-grid-cell', class extends HTMLElement {
	get defaultTieTarget() {
		return 'data';
	}

	set data(data) {
		if (!data) {
			throw new Error('data is missing');
		}
		if (!data.meta) {
			throw new Error('meta is missing');
		}

		if (data.meta.hidden) {
			this.classList.add('hidden');
		}

		switch (data.meta.type) {
			case 'boolean':
				this.setupAsBoolean(data);
				break;
			case 'date':
				this.setupAsDate(data);
				break;
			case 'tie':
				this.setupAsTie(data);
				break;
			case 'currency':
				this.setupAsCurrency(data);
				break;
			case 'percent':
				this.setupAsPercent(data);
				break;
			case 'text':
			default:
				this.setupAsText(data);
				break;
		}
	}

	setupAsBoolean(data) {
		let cbe;
		if (!this.childElementCount) {
			cbe = document.createElement('input');
			cbe.type = 'checkbox';
			cbe.classList.add('boolean');
			cbe.addEventListener('change', () => { data.data = cbe.checked; });
			this.appendChild(cbe);
		} else {
			cbe = this.firstElementChild;
		}
		cbe.checked = Boolean(data.data);
		if (data.meta.readonly) {
			cbe.disabled = true;
		}
	}

	setupAsDate(data) {
		let de;
		if (!this.childElementCount) {
			de = document.createElement('span');
			de.classList.add('date');
			this.appendChild(de);
		} else {
			de = this.firstElementChild;
		}
		de.textContent = data.data;
	}

	setupAsTie(data) {
		let te;
		if (!this.childElementCount) {
			te = document.createElement('span');
			te.classList.add('text');
			this.appendChild(te);
		} else {
			te = this.firstElementChild;
		}
		te.dataset.tie = data.data;
	}

	setupAsCurrency(data) {
		let ce;
		if (!this.childElementCount) {
			ce = document.createElement('span-currency');
			ce.classList.add('currency');
			this.appendChild(ce);
		} else {
			ce = this.firstElementChild;
		}
		if (!isNaN(data.data)) {
			ce.textContent = data.data;
		}
	}

	setupAsPercent(data) {
		let te;
		if (!this.childElementCount) {
			te = document.createElement('span');
			te.classList.add('percent');
			this.appendChild(te);
		} else {
			te = this.firstElementChild;
		}
		te.textContent = data.data;
	}

	setupAsText(data) {
		let te;
		if (!this.childElementCount) {
			te = document.createElement('span');
			te.classList.add('text');
			this.appendChild(te);
		} else {
			te = this.firstElementChild;
		}
		te.textContent = data.data;
	}
});