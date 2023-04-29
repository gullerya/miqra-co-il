import 'https://libs.gullerya.com/data-tier-list/2.2.1/data-tier-list.min.js';
import '../paragraph/paragraph.js';
import { loadParagraphs, totalParagraphs } from '../../services/data-service.js';

let htmCache;

class Scroll extends HTMLElement {
	#firstParId = 0;
	#slidingWindowSize = 12;
	#slidingWindowData;
	#lastScrollTop = null;
	#updateInProgress = false;

	constructor() {
		super();
	}

	connectedCallback() {
		const shadowRoot = this.attachShadow({ mode: 'open' });
		shadowRoot.innerHTML = htmCache;

		//	setup events
		shadowRoot
			.querySelector('.scrollbarless-outer')
			.addEventListener('scroll', this.#onscroll.bind(this));

		//	init initial
		this.#initData();
	}

	async #initData() {
		this.shadowRoot.querySelector('.paragraphs').items = [];
		this.#slidingWindowData = this.shadowRoot.querySelector('.paragraphs').items;
		const ps = await loadParagraphs(this.#firstParId, this.#slidingWindowSize);
		this.#slidingWindowData.push(...ps);
	}

	async #onscroll(scrollEvent) {
		const t = scrollEvent.target;
		const nst = t.scrollTop;
		if (this.#lastScrollTop === null) {
			this.#lastScrollTop = nst;
			return;
		}

		let scrolledUp = true;
		if (this.#lastScrollTop > nst) {
			scrolledUp = false;
		}
		this.#lastScrollTop = nst;

		if (this.#updateInProgress) {
			return;
		}
		const totalScroll = t.scrollHeight;
		const halfView = t.clientHeight / 2;
		if (scrolledUp) {
			if (this.#firstParId + this.#slidingWindowSize >= totalParagraphs) {
				return;
			}
			if (totalScroll - nst - halfView * 2 < halfView) {
				this.#updateInProgress = true;
				this.#firstParId += 3;
				const ps = await loadParagraphs(this.#firstParId + this.#slidingWindowSize - 3, 3);
				requestAnimationFrame(() => {
					this.#slidingWindowData.push(...ps);
					this.#updateInProgress = false;

					requestAnimationFrame(() => {
						this.#slidingWindowData.shift();
						this.#slidingWindowData.shift();
						this.#slidingWindowData.shift();
					});
				});
			}
		} else {
			if (this.#firstParId === 0) {
				return;
			}
			if (nst < halfView) {
				this.#updateInProgress = true;
				this.#firstParId -= 3;
				const ps = await loadParagraphs(this.#firstParId, 3);
				requestAnimationFrame(() => {
					this.#slidingWindowData.unshift(...ps);
					this.#updateInProgress = false;

					requestAnimationFrame(() => {
						this.#slidingWindowData.pop();
						this.#slidingWindowData.pop();
						this.#slidingWindowData.pop();
					});
				});
			}
		}
	}
}

fetch(`${import.meta.url}/../scroll.htm`)
	.then(r => r.text())
	.then(t => {
		htmCache = t;
		customElements.define('miqra-scroll', Scroll);
	});
