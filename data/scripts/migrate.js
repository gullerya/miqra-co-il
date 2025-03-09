import os from 'node:os';
import { Word, Verse, Paragraph, Monad } from './impl/model.js';
import { readNextMonadBHS } from './impl/reader.js';
import { writeParagraphs } from './impl/writer.js';

let paragraphs = [];
let currentParagraph;
let currentVerse;
let currentWord;

const suffixes = {
	'&': asciiToUtf('\\xd6\\xbe'),					//	joining maqaf
	'05 ': asciiToUtf('\\xd7\\x80'),				//	joining pipe
	' 05 ': asciiToUtf('\\xc2\\xa0\\xd7\\x80'),		//	joining pipe but with non-breaking space before it
	'_P ': "פ",									//	opened paragraph
	'_S ': "ס",									//	closed paragraph
	'00 ': "׃",				//	end of verse
	'00_P ': "׃פ",			//	end of verse + opened paragraph
	'00_S ': "׃ס",			//	end of verse + closed paragraph
	'00_N_P ': "׃נפ",		//	end of verse + nun ragila + opened paragraph
	'00_N_S ': "׃נס",		//	end of verse + nun ragila + closed paragraph
	'00_N ': "׃׆"			//	end of verse + non haphukka (in this case should agree with BHS and move this meta to the next verse)
};

const END_OF_VERSE = asciiToUtf('\\xd7\\x83');
const NUN_RAGILA = asciiToUtf('\\xd7\\xa0');
const NUN_HAPHUKHA = asciiToUtf('\\xd7\\x86');

console.log(`Starting BHS data migration...${os.EOL}`);
const startTime = performance.now();

const bhsMonadsIterator = readNextMonadBHS();

for await (const rawMonad of bhsMonadsIterator) {
	const proceed = processRawMonad(rawMonad.lines, rawMonad.startLine - 56);
	if (!proceed) {
		break;
	}
}

await writeParagraphs(paragraphs);

console.log(`${os.EOL}... migration done in ${Math.floor(performance.now() - startTime)}ms`);

//	PROCESSORS
//
function processRawMonad(inputLines, startingLineNumber) {
	const monad = new Monad();

	let suffix;
	let word;
	let lex;
	let qere;
	let kqHybrid;
	let qereExpected = false;
	inputLines.forEach(line => {
		if (line.includes('ID_D')) {
			// result.id = parseInt(line.split('=').pop());
		} else if (line.startsWith('g_word_utf8')) {
			word = asciiToUtf(line.split(':=').pop());
		} else if (line.startsWith('g_word')) {
			if (line.includes('*')) {
				qereExpected = true;
			}
		} else if (line.startsWith('g_voc_lex_utf8')) {
			lex = asciiToUtf(line.split(':=').pop());
		} else if (line.startsWith('qere_utf8') && !line.endsWith('"";')) {
			qere = asciiToUtf(line.split(':=').pop());
		} else if (line.startsWith('kq_hybrid_utf8') && !line.endsWith('"";')) {
			kqHybrid = asciiToUtf(line.split(':=').pop());
		} else if (line.startsWith('distributional_parent')) {
			// result.distParent = parseInt(line.split(':=').pop());
		} else if (line.startsWith('functional_parent')) {
			// result.funcParent = parseInt(line.split(':=').pop());
		} else if (line.startsWith('g_suffix') && !line.startsWith('g_suffix_utf8')) {
			suffix = line.split(':=').pop().replace(/[\";]/g, '');
		}
	});

	monad.t = word || kqHybrid;
	monad.l = lex;
	if (qereExpected) {
		if (qere) {
			monad.qere = qere;
		} else {
			console.warn(`QERE was expected but not found: ${JSON.stringify(monad)}, line: ${startingLineNumber} - assuming LEX only here`);
		}
	}

	return finializeMonad(suffix, monad, startingLineNumber);
}

function asciiToUtf(asciiInput) {
	asciiInput = asciiInput.replace(/[\";]/g, '');
	let chars = asciiInput.split('\\x');
	chars.shift();
	chars = chars.map(char => parseInt(char, 16));
	const ab = new Uint8Array(chars);
	return new TextDecoder().decode(ab);
}

function finializeMonad(suffix, monad, lineNumber) {
	const proceed = true;

	if (!currentWord) {
		currentWord = new Word();
	}

	if (!monad.t) {
		if (!monad.l) {
			console.log(`monad is missing any text: ${JSON.stringify(monad)}; line: ${lineNumber} - finalizing everything`);
			finalizeParagraph();
			return false;
		}
		const prevMonad = currentWord.getLastMonad();
		if (prevMonad) {
			if (prevMonad.l1) {
				throw new Error(`prevous monad's l1 already occupied: ${JSON.stringify(monad)}; line: ${lineNumber}`);
			}
			prevMonad.l1 = monad.l;
			monad = prevMonad;
		} else {
			console.log(`QERE starting word: ${JSON.stringify(monad)}; line: ${lineNumber}`);
		}
	}


	if (suffix === '&' || suffix.includes('05')) {
		monad.t += suffixes[suffix];
	}

	//	handle end of monad
	currentWord.addMonad(monad);

	//	handle end of word
	if (suffix.endsWith(' ')) {
		finalizeWord(currentWord);
		currentWord = null;
	}

	//	handle end of verse
	if (suffix.includes('00')) {
		monad.t += END_OF_VERSE;
		finalizeVerse();
	}

	let nunHandled = false;

	//	handle closed pragraph
	if (suffix.includes('_S')) {
		if (suffix.includes('_N')) {
			monad.t += NUN_RAGILA;
			nunHandled = true;
		}
		finalizeParagraph(true);
	}

	//	handle opened pragraph
	if (suffix.includes('_P')) {
		if (suffix.includes('_N')) {
			monad.t += NUN_RAGILA;
			nunHandled = true;
		}
		finalizeParagraph(false);
	}

	//	handle NUN HAPHUKHA
	if (suffix.includes('_N') && !nunHandled) {
		monad.t += NUN_HAPHUKHA;
	}

	return proceed;
}

function finalizeWord(word) {
	if (!currentVerse) {
		currentVerse = new Verse();
	}
	currentVerse.addWord(word);
}

function finalizeVerse() {
	if (!currentParagraph) {
		currentParagraph = new Paragraph();
	}
	currentParagraph.addVerse(currentVerse);
	currentVerse = new Verse();
}

function finalizeParagraph(closed) {
	currentParagraph.closed = closed;
	paragraphs.push(currentParagraph);
	currentParagraph = new Paragraph();
}

// CREATE OBJECT
// FROM MONADS= { 672 } 
// WITH ID_D=2130 [					//	handled
// number:=672;
// lexeme_count:=30386;				//	handled
// kq_hybrid:="";
// qere_utf8:="";
// qere:="";
// kq_hybrid_utf8:="";
// g_word:="HA-";
// g_word_utf8:="\xd7\x94\xd6\xb7";	//	handled
// g_cons_utf8:="\xd7\x94";
// g_cons:="H";
// g_suffix:="";					//	handled
// g_suffix_utf8:="";				//	handled
// g_pfm:="";
// g_pfm_utf8:="";
// g_vbs:="";
// g_vbs_utf8:="";
// lex:="H";
// lex_utf8:="\xd7\x94";
// g_lex:="HA-";
// g_lex_utf8:="\xd7\x94\xd6\xb7";
// g_voc_lex:="HA";
// g_voc_lex_utf8:="\xd7\x94\xd6\xb7";		//	handled
// g_prs_utf8:="";
// g_prs:="";
// g_vbe:="";
// g_uvf_utf8:="";
// g_uvf:="";
// g_vbe_utf8:="";
// g_nme:="";
// g_nme_utf8:="";
// nme:="n/a";
// distributional_parent:=2123;		//	handled
// functional_parent:=2125;			//	handled
// prs:="n/a";
// vbe:="n/a";
// vbs:="n/a";
// pfm:="n/a";
// uvf:="absent";
// language:=Hebrew;
// ls:=none;
// vs:=NA;
// vt:=NA;
// prs_ps:=NA;
// ps:=NA;
// suffix_person:=NA;
// prs_nu:=NA;
// nu:=NA;
// suffix_number:=NA;
// gn:=NA;
// suffix_gender:=NA;
// prs_gn:=NA;
// st:=NA;
// sp:=art;
// pdp:=art;
// ]

// CREATE OBJECT
// FROM MONADS= { 164664 } 
// WITH ID_D=537519 [
// number:=4196;
// lexeme_count:=19;
// kq_hybrid:=":@7500";
// qere_utf8:="\xd7\xa4\xd6\xbc\xd6\xb0\xd7\xa8\xd6\xb8\xd6\xbd\xd7\xaa";
// qere:="P.:R@75T";
// kq_hybrid_utf8:="\xd6\xb3\xd6\xbd\xd7\x83";
// g_word:="*";
// g_word_utf8:="";
// g_cons_utf8:="";
// g_cons:="";
// g_suffix:="00 ";
// g_suffix_utf8:="\xd7\x83 ";
// g_pfm:="";
// g_pfm_utf8:="";
// g_vbs:="";
// g_vbs_utf8:="";
// lex:="PRT/";
// lex_utf8:="\xd7\xa4\xd7\xa8\xd7\xaa\xd6\x9c";
// g_lex:="";
// g_lex_utf8:="";
// g_voc_lex:="P.:R@T";
// g_voc_lex_utf8:="\xd7\xa4\xd6\xbc\xd6\xb0\xd7\xa8\xd6\xb8\xd7\xaa";
// g_prs_utf8:="";
// g_prs:="";
// g_vbe:="";
// g_uvf_utf8:="";
// g_uvf:="";
// g_vbe_utf8:="";
// g_nme:="/";
// g_nme_utf8:="\xd6\x9c";
// nme:="";
// distributional_parent:=537515;
// functional_parent:=537516;
// prs:="n/a";
// vbe:="n/a";
// vbs:="n/a";
// pfm:="n/a";
// uvf:="absent";
// language:=Hebrew;
// ls:=none;
// vs:=NA;
// vt:=NA;
// prs_ps:=NA;
// ps:=NA;
// suffix_person:=NA;
// prs_nu:=NA;
// nu:=sg;
// suffix_number:=NA;
// gn:=unknown;
// suffix_gender:=NA;
// prs_gn:=NA;
// st:=a;
// sp:=nmpr;
// pdp:=nmpr;
// ]