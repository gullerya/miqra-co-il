import * as DataTier from '../libs/data-tier/data-tier.min.js';
import { ComponentBase, initComponent } from '../libs/rich-component/rich-component.min.js';
import './current-user.js';
import './a11y.js';
import './l10n.js';
import './notifications.js';

const
	template = document.createElement('template'),
	mainToolbarTie = DataTier.ties.create('mainToolbarModel');

template.innerHTML = `
	<style>
		:host {
			display: flex;
			flex-direction: row-reverse;
			align-self: center;
			align-items: center;
		}
		
		@media (min-width: 480px) {
			.toolbar-item {
				width: 40px;
				height: 40px;
			}
			.spacer {
				width: 16px;
			}
		}

		@media (max-width: 480px) {
			.toolbar-item {
				width: 32px;
				height: 32px;
			}
			.spacer {
				width: 8px;
			}
		}

		:host(.no-user) > .user {
			display: none;
		}

		.toolbar-item {
			color: var(--dark-blue);
		}
		.toolbar-item:hover {
			color: var(--main-green);
		}

		.notifications {
			display: none;
		}

		:host(.known) > .notifications {
			display: flex;
		}

		:host(.known.no-notifications) > .notifications {
			display: none;
		}
	</style>

	<current-user class="toolbar-item user" data-tie="mainToolbarModel:user"></current-user>
	<span class="spacer"></span>
	<a11y-toggle class="toolbar-item a11y"></a11y-toggle>
	<span class="spacer"></span>
	<l10n-toggle class="toolbar-item l10n"></l10n-toggle>
	<span class="spacer notifications"></span>
	<notifications-tool class="toolbar-item notifications"></notifications-tool>
`;

initComponent('main-toolbar', class extends ComponentBase {
	set user(user) {
		mainToolbarTie.user = user;
		if (user && !user.guest) {
			this.classList.add('known');
		} else {
			this.classList.remove('known');
		}
	}

	get defaultTieTarget() {
		return 'user';
	}

	static get template() {
		return template;
	}
});