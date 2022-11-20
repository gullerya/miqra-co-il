export {
	loadParagraphs
};

async function loadParagraphs(fromId, total = 1) {
	if (typeof fromId !== 'number' || fromId < 0) {
		throw new Error(`invalid 'fromId' argument ${fromId}`);
	}
	if (typeof total !== 'number' || total < 1) {
		throw new Error(`invalid 'total' argument ${total}`);
	}

	let promises = [];
	for (let i = fromId; i < fromId + total; i++) {
		promises[i - fromId] = fetch(`data/paragraphs/${i}.json`).then(r => r.json());
	}

	return Promise.all(promises);
}