import * as DataTier from '../libs/data-tier/data-tier.js';
import { ComponentBase, initComponent } from '../libs/rich-component/rich-component.min.js';
import * as l10nService from '../services/localization.js';
import '../elements/boolean-icon.js';
import { openPopup } from './popup.js';

const
	a11y = DataTier.ties.create('a11y', {
		values: {
			animations: true,
			contrast: false,
			monochrome: false
		}
	}),
	a11yToggleTemplate = document.createElement('template'),
	a11ySettingsTemplate = document.createElement('template');

l10nService.initL10nResource('a11y', {
	he: {
		animations: 'אנימציות',
		contrast: 'ניגודיות',
		monochrome: 'שחור-לבן'
	},
	en: {
		animations: 'Animations',
		contrast: 'Contrast',
		monochrome: 'Monochrome'
	}
});

//  TODO: fetch the data from the local storage if available

initComponent('a11y-toggle', class A11yToggle extends ComponentBase {
	connectedCallback() {
		this.addEventListener('click', () => {
			//  create modal content
			const accessibilitySettings = document.createElement('a11y-settings');
			Array.from(accessibilitySettings.shadowRoot.querySelectorAll('.a11y-setting'))
				.forEach(s => s.addEventListener('click', A11yToggle.handleSettingToggle));

			openPopup(this, accessibilitySettings, { closeOnInnerClick: false });
		});
	}

	static handleSettingToggle(event) {
		const t = event.currentTarget;
		if (t.classList.contains('animations')) {
			A11yToggle.toggleAnimations(t);
		} else if (t.classList.contains('contrast')) {
			A11yToggle.toggleContrast(t);
		} else if (t.classList.contains('monochrome')) {
			A11yToggle.toggleMonochrome(t);
		}
	}

	static toggleAnimations() {
		a11y.values.animations = !a11y.values.animations;

		if (a11y.values.animations) {
			document.documentElement.style.setProperty('animation', 'initial');
			document.documentElement.style.setProperty('transition', 'initial');
		} else {
			document.documentElement.style.setProperty('animation', 'none', 'important');
			document.documentElement.style.setProperty('transition', 'none', 'important');
		}
	}

	static toggleContrast() {
		a11y.values.contrast = !a11y.values.contrast;

		const fs = (document.documentElement.style.filter || '').split(' ');
		let done = false;
		for (const i in fs) {
			if (fs[i].startsWith('contrast')) {
				fs[i] = 'contrast(' + (a11y.values.contrast ? '1.2' : '1') + ')';
				done = true;
				break;
			}
		}
		if (!done) {
			fs.push('contrast(' + (a11y.values.contrast ? '1.2' : '1') + ')');
		}
		document.documentElement.style.filter = fs.join(' ');
	}

	static toggleMonochrome() {
		a11y.values.monochrome = !a11y.values.monochrome;

		const fs = (document.documentElement.style.filter || '').split(' ');
		let done = false;
		for (const i in fs) {
			if (fs[i].startsWith('grayscale')) {
				fs[i] = 'grayscale(' + (a11y.values.monochrome ? '1' : '0') + ')';
				done = true;
				break;
			}
		}
		if (!done) {
			fs.push('grayscale(' + (a11y.values.monochrome ? '1' : '0') + ')');
		}
		document.documentElement.style.filter = fs.join(' ');
	}

	static get template() {
		return a11yToggleTemplate;
	}
});

initComponent('a11y-settings', class extends ComponentBase {
	static get template() {
		return a11ySettingsTemplate;
	}
});

a11yToggleTemplate.innerHTML = `
	<style>
		:host {
			display: inline-flex;
		}

		.icon {
			width: 100%;
			height: 100%;
		}
	</style>
	
	<svg class="icon" viewBox="9 9 44 40">
		<style>
			.cls-4,.cls-6{fill:none;}
			.cls-4,.cls-6{stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;}
			.cls-4{stroke-width:1.61px;}
			.cls-5{fill:#fff;}
			.cls-6{stroke-width:0.25px;}
		</style>
		<g>
			<path fill="currentColor" d="M31.85,48A18.58,18.58,0,1,0,13,29.38,18.71,18.71,0,0,0,31.85,48"/>
			<ellipse class="cls-4" cx="31.85" cy="29.38" rx="18.83" ry="18.58"/>
			<path class="cls-5" d="M30.72,19.68A2.71,2.71,0,1,0,28.07,17a2.68,2.68,0,0,0,2.65,2.71"/>
			<path class="cls-6" d="M30.72,19.68A2.71,2.71,0,1,0,28.07,17,2.68,2.68,0,0,0,30.72,19.68Z"/>
			<path class="cls-5" d="M34.82,35a5.84,5.84,0,0,1-11.48-1.65,6,6,0,0,1,3.5-5.46V25.32A8.37,8.37,0,0,0,29.2,41.67a8.19,8.19,0,0,0,7.42-4.86L35.69,35h-.87"/>
			<path class="cls-6" d="M34.82,35a5.84,5.84,0,0,1-11.48-1.65,6,6,0,0,1,3.5-5.46V25.32A8.37,8.37,0,0,0,29.2,41.67a8.19,8.19,0,0,0,7.42-4.86L35.69,35Z"/>
			<path class="cls-5" d="M42.52,38.17,39,31.06a1.55,1.55,0,0,0-1.38-.87H33.05V29.14H37a1.15,1.15,0,0,0,.93-.51,1.23,1.23,0,0,0,.23-.68A1.17,1.17,0,0,0,37,26.76H33.05V23.17a2.33,2.33,0,1,0-4.66,0v7.77a2.4,2.4,0,0,0,2.37,2.43h5.88l3.11,6.24a1.55,1.55,0,0,0,1.38.87,1.51,1.51,0,0,0,.71-.17,1.61,1.61,0,0,0,.68-2.14"/>
			<path class="cls-6" d="M42.52,38.17,39,31.06a1.55,1.55,0,0,0-1.38-.87H33.05V29.14H37a1.15,1.15,0,0,0,.93-.51,1.23,1.23,0,0,0,.23-.68A1.17,1.17,0,0,0,37,26.76H33.05V23.17a2.33,2.33,0,1,0-4.66,0v7.77a2.4,2.4,0,0,0,2.37,2.43h5.88l3.11,6.24a1.55,1.55,0,0,0,1.38.87,1.51,1.51,0,0,0,.71-.17A1.61,1.61,0,0,0,42.52,38.17Z"/>
		</g>
	</svg>
`;

a11ySettingsTemplate.innerHTML = `
	<style>
		:host {
			display: flex;
			flex-direction: column;
			user-select: none;
		}
		
		.a11y-setting {
			width: 200px;
			margin: 6px;
			padding: 3px;
			display: flex;
			flex-direction: row;
			align-items: center;
			justify-content: space-between;
			cursor: default;
			border: 2px solid transparent;
			border-radius: 4px;
		}

		.a11y-setting:hover {
			color: #fff;
			background-color: var(--light-blue);
		}
		
		.a11y-setting > .status {
			width: 1em;
			height: 1em;
			justify-content: flex-start;
		}
		
		.a11y-setting > .a11y-label {
			flex-grow: 1;
		}
	</style>
	
	<div class="a11y-setting animations">
		<span class="a11y-label" data-tie="l10n:a11y.animations"></span>
		<boolean-icon class="status" data-tie="a11y:values.animations"></boolean-icon>
	</div>
	<div class="a11y-setting contrast">
		<span class="a11y-label" data-tie="l10n:a11y.contrast"></span>
		<boolean-icon class="status" data-tie="a11y:values.contrast"></boolean-icon>
	</div>
	<div class="a11y-setting monochrome">
		<span class="a11y-label" data-tie="l10n:a11y.monochrome"></span>
		<boolean-icon class="status" data-tie="a11y:values.monochrome"></boolean-icon>
	</div>
`;
