export {
	defineComponent
};

async function defineComponent(selfUrl, type) {
	fetch(`${import.meta.url}/../waiting.htm`)
		.then(r => r.text())
		.then(t => {
			htmCache = t;
			customElements.define('miqra-word', Word);
		});
}