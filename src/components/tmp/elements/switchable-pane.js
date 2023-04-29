import { ComponentBase, initComponent } from '../libs/rich-component/rich-component.min.js';

const
	activePaneKey = Symbol('active.pane.key'),
	resolverKey = Symbol('resolver.key'),
	updaterKey = Symbol('updater.key'),
	template = document.createElement('template');

template.innerHTML = `
	<style>
		:host {
			display: flex;
			flex-direction: column;
			overflow: auto;
		}

		.content::slotted(*) {
			flex: 1;
			min-height: 0;
		}
	</style>

	<slot name="" class="content"></slot>
`;

initComponent('switchable-pane', class extends ComponentBase {
	set activePane(paneKey) {
		if (this[activePaneKey] === paneKey) {
			return;
		}

		this[activePaneKey] = paneKey;
		if (typeof this[resolverKey] !== 'function') {
			return;
		}

		this[updaterKey]();
	}

	set resolvePane(resolver) {
		if (typeof resolver === 'function') {
			this[resolverKey] = resolver;
			this[updaterKey]();
		}
	}

	get currentPane() {
		const slotted = this.shadowRoot.querySelector('.content').assignedElements();
		if (slotted && slotted.length) {
			return slotted[0];
		} else {
			return null;
		}
	}

	[resolverKey](paneKey) {
		if (paneKey) {
			return document.createElement(paneKey);
		} else {
			return null;
		}
	}

	[updaterKey]() {
		const
			resolver = this[resolverKey],
			activePane = this[activePaneKey];
		if (typeof resolver === 'function' && typeof activePane !== 'undefined') {
			while (this.childElementCount) this.removeChild(this.lastElementChild);
			const paneElement = resolver(activePane);
			if (paneElement) {
				this.appendChild(paneElement);
				this.dispatchEvent(new Event('switch'));
			}
		}
	}

	get defaultTieTarget() {
		return 'activePane';
	}

	static get template() {
		return template;
	}
});