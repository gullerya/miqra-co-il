import { ComponentBase, initComponent } from '../libs/rich-component/rich-component.min.js';

const
	valueKey = Symbol('value.key'),
	onSelectKey = Symbol('on.select.key'),
	template = document.createElement('template');

template.innerHTML = `
	<style>
		:host {
			display: flex;
			flex-direction: column;
			cursor: default;
			user-select: none;
		}

		:host(.horizontal) {
			flex-direction: row;
			align-items: center;
		}

		.select-items::slotted(.selected) {
			color: #fff;
			background-color: var(--main-gray);
		}
	</style>

	<slot class="select-items"></slot>
`;

initComponent('select-list', class extends ComponentBase {
	connectedCallback() {
		this.shadowRoot.querySelector('.select-items').addEventListener('slotchange', () => this.updateView());
		this.shadowRoot.addEventListener('click', e => this[onSelectKey](e));
	}

	[onSelectKey](event) {
		const selectedItem = event.composedPath().find(e => e.classList && e.classList.contains('selectable'));
		if (!selectedItem) {
			return;
		}

		if (typeof selectedItem.value !== 'undefined') {
			this.value = selectedItem.value;
		} else if (selectedItem.dataset.value) {
			this.value = selectedItem.dataset.value;
		} else {
			console.error('value-less selectable selected, skipping this event');
			return;
		}

		this.dispatchEvent(new CustomEvent('select', {
			detail: {
				value: this.value
			}
		}));
	}

	set value(value) {
		if (!value || value === this[valueKey]) {
			return;
		}

		this[valueKey] = value;
		this.updateView();
	}

	get value() {
		return this[valueKey];
	}

	updateView() {
		const currentValue = this[valueKey];
		this.getSelectableItems()
			.forEach(selectable => {
				if (currentValue && (selectable.dataset.value === currentValue || selectable.value === currentValue)) {
					selectable.classList.add('selected');
				} else {
					selectable.classList.remove('selected');
				}
			});
	}

	getSelectableItems() {
		return this.shadowRoot
			.querySelector('.select-items')
			.assignedElements()
			.filter(e => e.classList && e.classList.contains('selectable'));
	}

	get defaultTieTarget() {
		return 'value';
	}

	get changeEventName() {
		return 'select';
	}

	static get template() {
		return template;
	}
});