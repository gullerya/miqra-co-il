export {
	loadParagraphById
};

async function loadParagraphById(id) {
	const r = await fetch(`data/paragraphs/${id}.json`);
	return await r.json();
}