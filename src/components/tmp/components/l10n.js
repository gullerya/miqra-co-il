import { ComponentBase, initComponent } from '../libs/rich-component/rich-component.min.js';
import * as localizationService from '../services/localization.js';
import { openPopup } from './popup.js';

const
	toggleTemplate = document.createElement('template'),
	localesTemplate = document.createElement('template');

toggleTemplate.innerHTML = `
	<style>
		:host {
			display: inline-flex;
		}

		.icon {
			width: 100%;
			height: 100%;
		}
	</style>

	<svg class="icon" viewBox="11 8 42 42">
		<style>
			.cls-3{fill:currentColor;}
			.cls-4{fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:1.61px;}
			.cls-5{fill:#fff;}
		</style>
		<g>
			<path class="cls-3" d="M31.85,48A18.58,18.58,0,1,0,13,29.38,18.71,18.71,0,0,0,31.85,48"/>
			<ellipse class="cls-4" cx="31.85" cy="29.38" rx="18.83" ry="18.58"/>
			<path class="cls-5" d="M41.37,34.4H37.63a18.31,18.31,0,0,0,.68-4.29h4.27a10.6,10.6,0,0,1-1.21,4.29M39.46,37a10.71,10.71,0,0,1-4.58,2.72A12.44,12.44,0,0,0,36,38.19a15,15,0,0,0,1.15-2.34h3.31a10.64,10.64,0,0,1-1,1.14m-6.88,2.86v-4h3a11.78,11.78,0,0,1-.82,1.58,8,8,0,0,1-2.17,2.42m4.27-9.74a16.68,16.68,0,0,1-.73,4.29H32.58V30.11Zm-4.27-5.75h3.54a16.75,16.75,0,0,1,.73,4.3H32.58Zm0-5.44a7.83,7.83,0,0,1,2.17,2.42,12.29,12.29,0,0,1,.82,1.57h-3v-4Zm6.88,2.86a11.6,11.6,0,0,1,1,1.13H37.14A14.85,14.85,0,0,0,36,20.58a11.71,11.71,0,0,0-1.11-1.52,10.71,10.71,0,0,1,4.58,2.72m1.91,2.58a10.65,10.65,0,0,1,1.21,4.3H38.31a18.47,18.47,0,0,0-.68-4.3ZM31.13,22.91h-3A13.71,13.71,0,0,1,29,21.34a7.72,7.72,0,0,1,2.18-2.42Zm0,5.75H26.85a16.34,16.34,0,0,1,.74-4.3h3.54Zm0,5.74H27.59a16.26,16.26,0,0,1-.74-4.29h4.28Zm0,5.45A7.83,7.83,0,0,1,29,37.43a13.07,13.07,0,0,1-.82-1.58h3ZM24.25,37a10.64,10.64,0,0,1-1-1.14h3.3a15,15,0,0,0,1.15,2.34,11.5,11.5,0,0,0,1.12,1.52A10.59,10.59,0,0,1,24.25,37M22.33,34.4a10.6,10.6,0,0,1-1.21-4.29H25.4a17.79,17.79,0,0,0,.67,4.29Zm0-10h3.74a18,18,0,0,0-.67,4.3H21.12a10.65,10.65,0,0,1,1.21-4.3m1.92-2.58a10.59,10.59,0,0,1,4.58-2.72,10.88,10.88,0,0,0-1.12,1.52,14.85,14.85,0,0,0-1.15,2.33h-3.3a11.6,11.6,0,0,1,1-1.13m16.23-1A12.07,12.07,0,0,0,32,17.18h-.33a12.21,12.21,0,0,0,0,24.41H32a12.21,12.21,0,0,0,8.46-20.84"/></g>
	</svg>
`;

localesTemplate.innerHTML = `
	<style>
		:host {
			display: flex;
			flex-direction: column;
			cursor: default;
		}

		.locale-item {
			width: 200px;
			margin: 6px;
			padding: 3px;
			box-sizing: border-box;
			border-radius: 4px;
			display: flex;
			flex-direction: row;
			align-items: center;
			justify-content: center;
			color: var(--light-blue);
		}

		.locale-item.disabled {
			color: #aaa;
			pointer-events: none;
		}

		.locale-item.selected {
			font-weight: 600;
			color: var(--dark-blue);
		}
		
		.locale-item:hover:not(.selected) {
			color: #fff;
			background-color: var(--light-blue);
		}
	</style>
`;

localizationService.locales
	.map(locale => {
		const le = document.createElement('div');
		le.dataset.id = locale.id;
		le.dataset.order = locale.order;
		le.dataset.direction = locale.direction;
		le.classList.add('locale-item');
		le.textContent = locale.label;

		if (locale.id === 'ar' || locale.id === 'ru') {
			le.classList.add('disabled');
		}

		return le;
	})
	.sort((e1, e2) => e1.dataset.order < e2.dataset.order ? -1 : 1)
	.forEach(le => localesTemplate.content.appendChild(le));

//	https://restcountries.eu/rest/v2/alpha/isr?fields=flag

initComponent('l10n-toggle', class extends ComponentBase {
	connectedCallback() {
		this.addEventListener('click', () => {
			const localesList = document.createElement('locales-list');
			openPopup(this, localesList);
		});
	}

	static get template() {
		return toggleTemplate;
	}
});

initComponent('locales-list', class LocalesList extends ComponentBase {
	connectedCallback() {
		const clid = localizationService.currentLocale.id;
		this.shadowRoot.querySelectorAll('.locale-item').forEach(ls => {
			if (ls.dataset.id === clid) {
				ls.classList.add('selected');
			}
			ls.addEventListener('click', e => this.localeItemClickHandler(e));
		});
	}

	localeItemClickHandler(event) {
		const se = event.currentTarget;
		localizationService.setActiveLocale(se.dataset.id);
		se.classList.add('selected');
		this.shadowRoot.querySelectorAll('.locale-item').forEach(ls => {
			if (ls !== se) {
				ls.classList.remove('selected');
			}
		});
	}

	static get template() {
		return localesTemplate;
	}
});