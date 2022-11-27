import { ComponentBase, initComponent } from '../libs/rich-component/rich-component.min.js';
import '../elements/input-button.js';
import '../elements/svg-icon.js';
import '../elements/splitter.js';

export {
	openModal
}

const
	modals = [],
	template = document.createElement('template');

function openModal(body, options) {
	if (!body) {
		throw new Error('invalid body');
	}

	const
		opts = Object.assign({
			container: document.body
		}, options),
		modal = document.createElement('mod-al');

	//	body
	appendContent(body, 'body', modal);

	opts.container.appendChild(modal);
	return modal;
}

function appendContent(content, slot, modal) {
	let result;
	if (typeof content === 'string') {
		const wrapper = document.createElement('template');
		wrapper.innerHTML = `<div>${content}</div>`;
		result = wrapper.content;
	} else if (content.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
		result = content;
	} else if (content.nodeType === Node.ELEMENT_NODE) {
		result = content;
	} else {
		throw new Error('either plain string or documentFragment supported, nothing else');
	}

	//	at this point result points to a document-fragment or an actual element
	if (result.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
		for (let i = 0; i < result.children.length; i++) {
			result.children[i].slot = slot;
		}
	} else {
		result.slot = slot;
	}
	modal.appendChild(result);
}

template.innerHTML = `
	<style>
		:host {
			position: absolute;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
			z-index: 999999;
		}
		
		:host(.global) {
			position: fixed;
		}
		
		.veil {
			position: absolute;
			top: 0;
			left: 0;
			height: 100%;
			width: 100%;
			background: rgb(230, 242, 254);
			opacity: 0.3;
			pointer-events: none;
		}

		.container {
			position: absolute;
			top: 50%;
			left: 50%;
			transform: translate(-50%, -50%);
			display: flex;
		}

		.container > .buttons-bar {
			position: absolute;
			top: 0;
			width: calc(100% + 24px);
			height: 0;
			display: flex;
			align-items: center;
			justify-content: flex-end;
		}

		:host(.closeless) .container > .buttons-bar > .close {
			display: none;
		}
	</style>

	<div class="veil"></div>
	<div class="container">
		<slot name="body" class="body"></slot>
		<div class="buttons-bar">
			<input-button class="close emphasized">
				<svg-icon slot="icon" type="x"></svg-icon>
			</input-button>
		<div>
	</div>
`;

initComponent('mod-al', class extends ComponentBase {
	connectedCallback() {
		if (this.parentNode === document.body) {
			this.classList.add('global');
		}
		this.shadowRoot.querySelector('.container > .buttons-bar > .close').addEventListener('click', () => {
			this.close();
		});
		modals.push(this);
	}

	disconnectedCallback() {
		modals.splice(modals.indexOf(this), 1);
		this.dispatchEvent(new Event('closed'));
	}

	close() {
		this.remove();
	}

	static get template() {
		return template;
	}
});

document.body.addEventListener('keydown', event => {
	if (event.code === 'Escape' && modals.length) {
		modals[modals.length - 1].close();
	}
});