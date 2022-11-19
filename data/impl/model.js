export class Monad {
	t;
	l;
	l1;
	qere;

	constructor() {
		Object.seal(this);
	}

	toJSON() {
		const result = { t: this.t, l: this.l };
		if (this.l1) {
			result.l1 = this.l1;
		}
		if (this.qere) {
			result.qere = this.qere;
		}
		return result;
	}
}

export class Word {
	#m = [];

	constructor() {
		Object.seal(this);
	}

	getLastMonad() { return this.#m[this.#m.length - 1]; }

	addMonad(m) { this.#m.push(m); }

	toJSON() {
		return { m: this.#m };
	}
}

export class Verse {
	b = 0;
	c = 0;
	v = 0;
	#w = [];

	constructor() {
		Object.seal(this);
	}

	addWord(w) { this.#w.push(w); }

	toJSON() {
		return { b: this.b, c: this.c, v: this.v, w: this.#w };
	}
}

export class Paragraph {
	closed = false;
	#v = [];

	constructor() {
		Object.seal(this);
	}

	addVerse(v) { this.#v.push(v); }

	toJSON() {
		return { closed: this.closed, v: this.#v };
	}
}