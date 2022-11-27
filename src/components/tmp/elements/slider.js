import { ComponentBase, initComponent } from '../libs/rich-component/rich-component.min.js';

const
	onDragMoveKey = Symbol('drag.move.key'),
	onDragEndKey = Symbol('drag.end.key'),
	handleStartKey = Symbol('handle.start.key'),
	dragStartKey = Symbol('drag.start.key'),
	dragRangeKey = Symbol('drag.range.key'),
	pusherKey = Symbol('pusher.key'),
	railKey = Symbol('rail.key'),
	valueKey = Symbol('value.key'),
	templateH = document.createElement('template');

templateH.innerHTML = `
	<style>
		:host {
			position: relative;
			min-width: 96px;
			min-height: 36px;
			width: 200px;
			height: 48px;
		}
		
		.rail {
			position: absolute;
			top: calc(50% - 2px);
			left: 18px;
			right: 18px;
			height: 6px;
			border-radius: 4px;
			background-color: var(--dark-blue);
			overflow: visible;
			display: flex;
			align-items: center;
		}

		.pusher {
			flex: 0 0 0;
		}

		.handle-anchor {
			flex: 0 1 0;
			position: relative;
		}

		.handle {
			position: absolute;
			top: -18px;
			left: -18px;
			width: 36px;
			height: 36px;
			border-radius: 50%;
			overflow: hidden;
			background-color: var(--main-green);
			box-shadow: 0 0 4px 2px rgba(0, 0, 0, 0.2);
		}

		.inner-hint::slotted(*) {
			display: flex;
			height: 100%;
			align-items: center;
			justify-content: center;
		}
	</style>

	<slot name="upper-hint" class="upper-hint"></slot>
	<div class="rail">
		<div class="pusher"></div>
		<div class="handle-anchor">
			<div class="handle">
				<slot name="inner-hint" class="inner-hint"></slot>
			</div>
		</div>
	</div>
	<slot name="lower-hint" class="lower-hint"></slot>
`;

initComponent('h-slider', class HSlider extends ComponentBase {
	connectedCallback() {
		this[onDragMoveKey] = HSlider.onDragMove.bind(this);
		this[onDragEndKey] = HSlider.onDragEnd.bind(this);
		this[pusherKey] = this.shadowRoot.querySelector('.pusher');
		this[railKey] = this.shadowRoot.querySelector('.rail');

		this.shadowRoot.querySelector('.handle').addEventListener('mousedown', event => {
			this[dragStartKey] = event.screenX;
			this[dragRangeKey] = this[railKey].offsetWidth;
			this[handleStartKey] = this[pusherKey].offsetWidth;
			document.body.addEventListener('mousemove', this[onDragMoveKey]);
			document.body.addEventListener('mouseup', this[onDragEndKey]);
		});
		this.shadowRoot.querySelector('.handle').addEventListener('touchstart', event => {
			this[dragStartKey] = event.touches[0].screenX;
			this[dragRangeKey] = this[railKey].offsetWidth;
			this[handleStartKey] = this[pusherKey].offsetWidth;
			document.body.addEventListener('touchmove', this[onDragMoveKey]);
			document.body.addEventListener('touchend', this[onDragEndKey]);
			document.body.addEventListener('touchcancel', this[onDragEndKey]);
		});
		this.value = 0;
	}

	static onDragMove(event) {
		const dragStart = this[dragStartKey];
		if (typeof dragStart === 'number') {
			const dragOffset = (event.screenX || event.touches[0].screenX) - dragStart;
			let handleOffset;
			if (document.body.getAttribute('dir') === 'rtl') {
				handleOffset = this[handleStartKey] - dragOffset;
			} else {
				handleOffset = this[handleStartKey] + dragOffset;
			}

			handleOffset = Math.min(Math.max(0, handleOffset), this[dragRangeKey]);

			const value = handleOffset / this[dragRangeKey];
			this.value = value;
			this.dispatchEvent(new CustomEvent('change', { detail: { value: value } }));
		}
	}

	static onDragEnd() {
		this[dragStartKey] = null;
		document.body.removeEventListener('mousemove', this[onDragMoveKey]);
		document.body.removeEventListener('mouseup', this[onDragEndKey]);
	}

	updateView(value) {
		if (typeof value === 'number' && !isNaN(value)) {
			value = Math.max(0, value);
			value = Math.min(100, value);
			this[pusherKey].style.flexBasis = value * 100 + '%';
		}
	}

	set value(value) {
		if (this[valueKey] !== value) {
			this[valueKey] = value;
			this.updateView(value);
		}
	}

	get value() {
		return this[valueKey];
	}

	get defaultTieTarget() {
		return 'value';
	}

	get changeEventName() {
		return 'change';
	}

	static get template() {
		return templateH;
	}
});
