export {
	loadParagraphById
};

async function loadParagraphById(id) {
	const r = await fetch(`data/paragraphs/${id}`);
	return await r.json();
}