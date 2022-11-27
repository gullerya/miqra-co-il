customElements.define('select-able', class extends HTMLElement {
	set selected(selected) {
		if (selected) {
			this.classList.add('selected');
		} else {
			this.classList.remove('selected');
		}
	}
});