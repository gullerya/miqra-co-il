const
	template = document.createElement('template'),
	settingsKey = Symbol('settings.key');

template.innerHTML = `
	<style>
		:host {
			padding: 4px;
			display: flex;
			align-items: center;
			overflow: hidden;
			cursor: default;
			user-select: none;
		}

		:host(.hidden) {
			display: none;
		}

		.label {
			flex: 1;
			overflow: hidden;
			white-space: nowrap;
			text-overflow: ellipsis;
			font-size: 0.8em;
		}

		.sorts {
			display: none;
			flex-basis: 12px;
		}

		:host(.sortable) > .sorts {
			display: flex;
		}

		.asc, .desc {
			fill: none;
			stroke: #000;
		}

		:host(.sort-asc) .asc {
			stroke: none;
			fill: #000;
		}

		:host(.sort-desc) .desc {
			stroke: none;
			fill: #000;
		}
	</style>

	<span class="label"></span>
	<span class="sorts">
		<svg viewbox="0 0 24 50" width="90%">
			<path class="asc" d="M 12,0 23,23 0,23 z"/>
			<path class="desc" d="M 0,26 23,26 12,49 z"/>
		</svg>
	</span>
`;

customElements.define('data-grid-header', class extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({ mode: 'open' }).appendChild(template.content.cloneNode(true));
		this.shadowRoot.querySelector('.sorts').addEventListener('click', () => {
			if (this.classList.contains('sort-asc')) {
				this.classList.replace('sort-asc', 'sort-desc');
				this.dispatchEvent(new CustomEvent('sort', { detail: { direction: 'desc' } }));
			} else if (this.classList.contains('sort-desc')) {
				this.classList.remove('sort-desc');
				this.dispatchEvent(new CustomEvent('unsort'));
			} else {
				this.classList.add('sort-asc');
				this.dispatchEvent(new CustomEvent('sort', { detail: { direction: 'asc' } }));
			}
		});
	}

	get defaultTieTarget() {
		return 'settings';
	}

	set settings(settings) {
		this[settingsKey] = settings;

		const labelE = this.shadowRoot.querySelector('.label');

		if (settings.labelTie) {
			labelE.dataset.tie = settings.labelTie;
		} else if (settings.label) {
			labelE.textContent = settings.label;
		}

		if (settings.sortable) {
			this.classList.add('sortable');
		} else {
			this.classList.remove('sortable');
		}

		if (settings.hidden) {
			this.classList.add('hidden');
		}
	}
});