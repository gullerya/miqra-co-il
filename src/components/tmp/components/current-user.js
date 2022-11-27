import * as DataTier from '../libs/data-tier/data-tier.min.js';
import { ComponentBase, initComponent } from '../libs/rich-component/rich-component.min.js';
import '../elements/svg-icon.js';
import { openPopup } from './popup.js';

const
	template = document.createElement('template'),
	defaultModel = {
		guest: true,
		avatar: ''
	},
	currentUserModel = DataTier.ties.create('currentUserModel', defaultModel);

template.innerHTML = `
	<style>
		:host {
			overflow: hidden;
			position: relative;
			width: 40px;
			height: 40px;
			border-radius: 50%;
			display: inline-flex;
			flex-direction: row;
			align-items: center;
			justify-content: center;
			user-select: none;
			cursor: default;
		}
		
		.user-view {
			display: none;
			flex: 1;
		}

		.known-user-name {
			color: #fff;
			justify-content: center;
		}

		:host(.guest) > .guest-user-icon {
			display: flex;
			width: 100%;
			height: 100%;
		}

		:host(.avatar) > .known-user-icon {
			display: flex;
			flex: 0 0 30px;
			width: 30px;
			height: 30px;
		}
		
		:host(.abbreviation) > .known-user-name {
			display: flex;
		}

		:host(.abbreviation) {
			background-color: var(--dark-blue);
		}

		:host(.abbreviation:hover) {
			background-color: var(--main-green);
		}
	</style>

	<svg class="user-view guest-user-icon" viewBox="12 9 40 40">
		<path fill="currentColor" d="m32.3 48.2a18.6 18.6 0 1 0-18.8-18.6 18.7 18.7 0 0 0 18.8 18.6"/>
		<path fill="#fff" d="m27.1 22.4c0.2-4.4 3.33-4.87 4.67-4.87h0.07c1.66 0 4.48 0.71 4.67 4.87 0 0.05 0.43 4.22-1.52 6.42a4 4 0 0 1-3.16 1.32h-0.06a4 4 0 0 1-3.14-1.32c-2-2.18-1.53-6.38-1.53-6.42m4.62 9.4h0.19a5.7 5.7 0 0 0 4.34-1.88c2.36-2.66 2-7.23 1.92-7.67-0.15-3.27-1.7-4.84-3-5.57a6.83 6.83 0 0 0-3.3-0.87h-0.1a6.83 6.83 0 0 0-3.31 0.84c-1.29 0.73-2.86 2.3-3 5.6 0 0.44-0.43 5 1.93 7.67a5.66 5.66 0 0 0 4.33 1.88" fill="#fff"/>
		<path fill="#fff" d="m28.3 32.7a0.83 0.83 0 0 0-1.16-0.2 17.8 17.8 0 0 1-5.1 2.32h-0.06c-2.67 0.92-2.75 3.76-2.79 5a0.81 0.81 0 0 1 0 0.16 11.7 11.7 0 0 0 0.2 2.4 1.51 1.51 0 0 0 0.26 0.12h0.14a0.63 0.63 0 0 0 0.33 0 1.36 1.36 0 0 0 0.65-0.43 1.39 1.39 0 0 0 0.18-0.31 11.5 11.5 0 0 1-0.1-1.76v-0.16c0.05-1.4 0.21-2.93 1.64-3.44a19.6 19.6 0 0 0 5.61-2.56 0.84 0.84 0 0 0 0.21-1.16" fill="#fff"/>
		<path fill="#fff" d="m42.6 41.9c0 0.17 0.06 0.34 0.1 0.51a1.1 1.1 0 0 0 1.19 0.64 0.52 0.52 0 0 1 0.1-0.11 1.62 1.62 0 0 0 0.1-0.18 9.63 9.63 0 0 0 0.29-2.78v-0.17c0-1.22-0.12-4.06-2.79-5h-0.06a17.6 17.6 0 0 1-5.03-2.35 0.84 0.84 0 0 0-1.16 0.21 0.82 0.82 0 0 0 0.16 1.15 18.9 18.9 0 0 0 5.61 2.57c1.43 0.51 1.59 2 1.63 3.44a0.76 0.76 0 0 0 0 0.15 10.6 10.6 0 0 1-0.13 1.9" fill="#fff"/>
		<path fill="none" d="m13.5 29.6a18.8 18.8 0 1 0 18.8-18.6 18.7 18.7 0 0 0-18.8 18.6"/>
	</svg>
	<img class="user-view known-user-icon" data-tie="currentUserModel:avatar" src="" alt="known user avatar">
	<span class="user-view known-user-name" data-tie="currentUserModel:abbreviation"></span>
`;

initComponent('current-user', class extends ComponentBase {
	connectedCallback() {
		this.setupEventListeners();
		this.updateView();
	}

	setupEventListeners() {
		this.addEventListener('click', () => {
			//  create popup content
			let popupContent;
			if (this.classList.contains('guest')) {
				popupContent = document.createElement('guest-user-menu')
			} else {
				popupContent = document.createElement('known-user-menu');
				popupContent.user = currentUserModel;
			}

			openPopup(this, popupContent);
		});
	}

	get defaultTieTarget() {
		return 'user';
	}

	set user(user) {
		Object.assign(currentUserModel,
			user
				? {
					guest: Boolean(user.guest),
					avatar: user.avatar || '',
					abbreviation: this.calcAbbreviation(user),
					firstName: user.firstName,
					lastName: user.lastName,
					email: user.email
				}
				: defaultModel
		);
		this.updateView();
	}

	updateView() {
		if (currentUserModel.guest) {
			this.classList.remove('avatar', 'abbreviation');
			this.classList.add('guest');
		} else {
			this.classList.remove('guest');
			if (currentUserModel.avatar) {
				this.classList.remove('abbreviation');
				this.classList.add('avatar');
			} else {
				this.classList.remove('avatar');
				this.classList.add('abbreviation');
			}
		}
	}

	calcAbbreviation(user) {
		let result = '?';

		if (user) {
			if (user.firstName || user.lastName) {
				result = (user.firstName && typeof user.firstName === 'string' ? user.firstName[0].toUpperCase() : '') +
					(user.lastName && typeof user.lastName === 'string' ? user.lastName[0].toUpperCase() : '');
			} else if (user.email && typeof user.email === 'string') {
				const namePart = user.email.substring(0, user.email.indexOf('@')),
					names = namePart.split(/[._-]/);
				let nextName;
				result = '';
				while ((nextName = names.shift()) && result.length < 3) {
					result += nextName[0].toUpperCase();
				}
			}
		}

		return result;
	}

	static get template() {
		return template;
	}
});