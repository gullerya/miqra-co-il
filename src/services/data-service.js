export {
	totalParagraphs,
	loadParagraphs
};

const totalParagraphs = 3149;
const cache = [];

async function loadParagraphs(fromId, total = 1) {
	if (typeof fromId !== 'number' || fromId < 0 || fromId > 3148) {
		throw new Error(`invalid 'fromId' argument ${fromId}, MUST be a number in 0-3148 range`);
	}
	if (typeof total !== 'number' || total < 1) {
		throw new Error(`invalid 'total' argument ${total}, MUST be a number greater than 1`);
	}
	if (fromId + total > totalParagraphs) {
		total = totalParagraphs - fromId;
	}

	let promises = [];
	for (let id = fromId; id < fromId + total; id++) {
		let p;
		if (cache[id]) {
			p = Promise.resolve(cache[id]);
		} else {
			p = fetch(`data/paragraphs/${id}.json`).then(r => r.json());
			p.then(j => cache[id] = j);
		}
		promises[id - fromId] = p;
	}

	return Promise.all(promises);
}