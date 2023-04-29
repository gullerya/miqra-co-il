import { ComponentBase, initComponent } from '../libs/rich-component/rich-component.min.js';

export {
	openPopup
}

const
	template = document.createElement('template'),
	spaceAroundPxls = 10,
	pointerSizePxls = 8,
	ANCHOR_KEY = Symbol('anchor.key'),
	CLOSE_ON_INNER_CLICK_KEY = Symbol('close.on.inner.click.key'),
	CLOSE_ON_ANCHOR_CLICK_KEY = Symbol('close.on.anchor.click.key'),
	tmpWidthKey = Symbol('tmp.width.key'),
	tmpHeightKey = Symbol('tmp.height.key'),
	tmpContentKey = Symbol('tmp.content.key'),
	openedPopups = [];

/**
 * opens popup, adds it to the page and returns the actual popup element for further customizations if needed
 */
function openPopup(anchor, content, options) {
	if (!anchor || !anchor.nodeType) {
		throw new Error('invalid anchor, DOM element expected');
	}
	if (!content || !content.nodeType) {
		throw new Error('invalid content, single DOM element expected');
	}

	options = {
		...{
			pointerless: false,
			closeOnInnerClick: true,
			closeOnAnchorClick: true,
			closeOnDocumentEvents: true
		},
		...options
	};

	const result = document.createElement('pop-up');
	result.anchor = anchor;
	if (options.pointerless) {
		result.classList.add('pointerless');
	}
	result.closeOnInnerClick = options.closeOnInnerClick;
	result.closeOnAnchorClick = options.closeOnAnchorClick;
	result.closeOnDocumentEvents = options.closeOnDocumentEvents;
	result.appendChild(content);
	document.body.appendChild(result);
	return result;
}

template.innerHTML = `
	<style>
		:host {
			position: absolute;
			min-width: 96px;
			min-height: 48px;
			z-index: 999999;
			background-color: var(--default-background);
			box-shadow: 0 0 8px 2px rgba(96, 96, 96, 0.2);
			opacity: 0;
			transition: opacity 100ms;
		}

		:host(.visible) {
			opacity: 1;
		}

		.pointer {
			position: absolute;
			top: -8px;
			width: 8px;
			height: 8px;
			border-left: 8px solid transparent;
			border-right: 8px solid transparent;
			border-bottom: 8px solid var(--light-blue);
			box-sizing: border-box;
			z-index: 2;
		}

		:host(.pointerless) .pointer {
			display: none;
		}

		.content-wrapper {
			border-top: 1px solid var(--light-blue);
			z-index: 1;
		}
	</style>

	<div class="pointer"></div>
	<div class="content-wrapper">
		<slot class="content"></slot>
	</div>
`;

initComponent('pop-up', class extends ComponentBase {
	connectedCallback() {
		openedPopups.push(this);

		if (this[tmpWidthKey]) {
			this.width = this[tmpWidthKey];
			delete this[tmpWidthKey];
		}
		if (this[tmpHeightKey]) {
			this.height = this[tmpHeightKey];
			delete this[tmpHeightKey];
		}
		if (this[tmpContentKey]) {
			this.content = this[tmpContentKey];
			delete this[tmpContentKey];
		}
		this.positionSelf();
		this.classList.add('visible');
	}

	disconnectedCallback() {
		const i = openedPopups.indexOf(this);
		if (i >= 0) {
			openedPopups.splice(i, 1);
		}
		this.dispatchEvent(new Event('closed'));
	}

	set anchor(anchor) {
		if (this[ANCHOR_KEY]) {
			throw new Error('anchor MAY NOT be redefined, close this popup and open a new one');
		}
		if (!anchor || !anchor.nodeType) {
			throw new Error('invalid anchor');
		}
		this[ANCHOR_KEY] = anchor;
	}

	get anchor() {
		return this[ANCHOR_KEY];
	}

	set closeOnInnerClick(value) {
		this[CLOSE_ON_INNER_CLICK_KEY] = Boolean(value);
	}

	get closeOnInnerClick() {
		return this[CLOSE_ON_INNER_CLICK_KEY];
	}

	set closeOnAnchorClick(value) {
		this[CLOSE_ON_ANCHOR_CLICK_KEY] = Boolean(value);
	}

	get closeOnAnchorClick() {
		return this[CLOSE_ON_ANCHOR_CLICK_KEY];
	}

	set width(width) {
		if (this.parentNode) {
			this.style.width = typeof width === 'number' ? (width + 'px') : width;
			this.positionSelf();
		} else {
			this[tmpWidthKey] = width;
		}
	}

	set height(height) {
		if (this.parentNode) {
			this.style.height = typeof height === 'number' ? (height + 'px') : height;
			this.positionSelf();
		} else {
			this[tmpHeightKey] = height;
		}
	}

	close() {
		this.remove();
	}

	positionSelf() {
		const
			{ x: ax, y: ay, w: aw, h: ah } = this.calcAbsoluteAnchorBox(),
			pointerless = this.classList.contains('pointerless');

		//  position self
		let px;
		if (this.offsetWidth >= document.body.clientWidth) {
			px = 0;
		} else {
			px = ax + (aw - this.offsetWidth) / 2;
			px = Math.max(px, spaceAroundPxls);
			px = Math.min(px, document.body.clientWidth - this.offsetWidth - spaceAroundPxls);
		}
		this.style.left = px + 'px';
		this.style.top = (ay + ah + (pointerless ? 0 : spaceAroundPxls)) + 'px';

		//  position pointer
		if (!pointerless) {
			const p = this.shadowRoot.querySelector('.pointer');
			p.style.left = (ax - px - spaceAroundPxls / 2 + aw / 2 - pointerSizePxls / 2 + 1) + 'px';
		}
	}

	calcAbsoluteAnchorBox() {
		const
			r = { x: 0, y: 0, w: 0, h: 0 },
			p = this[ANCHOR_KEY];
		if (p && typeof p.getBoundingClientRect === 'function') {
			const bc = p.getBoundingClientRect();
			r.x = bc.x + window.scrollX;
			r.y = bc.y + window.scrollY;
			r.w = bc.width;
			r.h = bc.height;
		} else {
			throw new Error('invalid anchor value');
		}
		return r;
	}

	static get template() {
		return template;
	}
});

document.addEventListener('keydown', event => {
	if (event.code !== 'Escape') return;
	if (!openedPopups.length) return;

	openedPopups[openedPopups.length - 1].close();
});
document.addEventListener('click', event => {
	if (!openedPopups.length) return;

	const
		eventPath = event.composedPath(),
		popupToClose = openedPopups[openedPopups.length - 1];

	if (!popupToClose.closeOnDocumentEvents) return;

	if (eventPath.some(e => e === popupToClose)) {
		//	handle click within popup
		if (popupToClose.closeOnInnerClick) {
			popupToClose.close();
		}
	} else {
		const anchorClick = eventPath.some(e => e === popupToClose.anchor);
		//	to close or not
		if (!anchorClick || popupToClose.closeOnAnchorClick) {
			popupToClose.close();
		}
		//	event propagation
		if (anchorClick) {
			event.stopPropagation();
		}
	}
}, true);
document.addEventListener('scroll', () => {
	if (!openedPopups.length) return;
	const popupToClose = openedPopups[openedPopups.length - 1];
	if (popupToClose.closeOnDocumentEvents) {
		popupToClose.close();
	} else {
		popupToClose.positionSelf();
	}
}, true);
window.addEventListener('resize', () => {
	if (!openedPopups.length) return;
	const popupToClose = openedPopups[openedPopups.length - 1];
	if (popupToClose.closeOnDocumentEvents) {
		popupToClose.close();
	} else {
		popupToClose.positionSelf();
	}
}, true);