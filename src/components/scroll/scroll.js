import 'https://libs.gullerya.com/data-tier-list/2.2.1/data-tier-list.js';
import '../paragraph/paragraph.js';
import '../waiting-progress/waiting-progress.js';
import { loadParagraphs, totalParagraphs } from '../../services/data-service.js';

let htmCache;

class Scroll extends HTMLElement {
	#slidingWindowSize = 12;
	#incrementSize = 3;

	#firstParId = 0;
	#slidingWindowData;
	#lastScrollTop = null;
	#updateInProgress = false;
	#scrollContainer;
	#waitingProgressElement = document.createElement('waiting-progress');

	constructor() {
		super();
	}

	connectedCallback() {
		const shadowRoot = this.attachShadow({ mode: 'open' });
		shadowRoot.innerHTML = htmCache;
		this.#scrollContainer = shadowRoot.querySelector('.scrollbarless-outer');

		//	setup events
		this.#scrollContainer.addEventListener('scroll', this.#onscroll.bind(this));

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
				this.#scrollContainer.append(this.#waitingProgressElement);
				this.#firstParId += this.#incrementSize;
				const ps = await loadParagraphs(
					this.#firstParId + this.#slidingWindowSize - this.#incrementSize,
					this.#incrementSize
				);

				await this.#appendParagraphs(ps, false);
				this.#updateInProgress = false;
				// this.#scrollContainer.removeChild(this.#waitingProgressElement);
				this.#removeParagraphs(this.#incrementSize, true);
			}
		} else {
			if (this.#firstParId === 0) {
				return;
			}
			if (nst < halfView) {
				this.#updateInProgress = true;
				this.#scrollContainer.prepend(this.#waitingProgressElement);
				this.#firstParId -= this.#incrementSize;
				const ps = await loadParagraphs(this.#firstParId, this.#incrementSize);

				await this.#appendParagraphs(ps, true);
				this.#updateInProgress = false;
				// this.#scrollContainer.removeChild(this.#waitingProgressElement);
				this.#removeParagraphs(this.#incrementSize, false);
			}
		}
	}

	async #appendParagraphs(pars, fromBeg) {
		const aop = fromBeg ? 'pop' : 'shift';
		const dop = fromBeg ? 'unshift' : 'push';
		return new Promise(resolve => {
			const wf = () => {
				const p = pars[aop]();
				this.#slidingWindowData[dop](p);
				if (pars.length) {
					requestAnimationFrame(wf);
				} else {
					resolve();
				}
			};
			requestAnimationFrame(wf);
		});
	}

	async #removeParagraphs(count, fromBeg) {
		const opf = fromBeg ? 'shift' : 'pop';
		return new Promise(resolve => {
			const wf = () => {
				this.#slidingWindowData[opf]();
				if (--count) {
					requestAnimationFrame(wf);
				} else {
					resolve();
				}
			};
			requestAnimationFrame(wf);
		});
	}
}

fetch(`${import.meta.url}/../scroll.htm`)
	.then(r => r.text())
	.then(t => {
		htmCache = t;
		customElements.define('miqra-scroll', Scroll);
	});
