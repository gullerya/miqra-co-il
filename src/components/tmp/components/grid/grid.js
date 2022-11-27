import * as DataTier from '../../libs/data-tier/data-tier.min.js';
import '../../libs/data-tier-list/data-tier-list.min.js';
import { fetchTemplate } from '../../libs/rich-component/rich-component.min.js';
import '../../elements/splitter.js';
import './grid-header.js';
import './grid-cell.js';

const
	DEFAULT_MODEL = {
		headers: null,
		data: null
	},
	dataKey = Symbol('data.key');

let
	htmlTemplate,
	tieIdSequencer = 0;

customElements.define('data-grid', class Grid extends HTMLElement {
	constructor() {
		super();

		//	create tied data
		const tieId = 'dataGridModel' + tieIdSequencer++;
		this[dataKey] = DataTier.ties.create(tieId, DEFAULT_MODEL);
		this.attachShadow({ mode: 'open' });

		//	create DOM
		if (!htmlTemplate) {
			fetchTemplate(Grid.htmlUrl)
				.then(tmpHtml => {
					htmlTemplate = tmpHtml;
					const postProcessedHTML = htmlTemplate.replace(/{tie-id}/g, tieId);
					this.shadowRoot.innerHTML = postProcessedHTML;
					this.setupEventHandlers();
				});
		} else {
			const postProcessedHTML = htmlTemplate.replace(/{tie-id}/g, tieId);
			this.shadowRoot.innerHTML = postProcessedHTML;
			this.setupEventHandlers();
		}
	}

	disconnectedCallback() {
		DataTier.ties.remove(this[dataKey]);
	}

	setupEventHandlers() {
		this.shadowRoot.querySelector('.headers').addEventListener('sort', event => {
			console.dir(event.detail);
		}, true);
	}

	set data(data) {
		if (!data) {
			Object.assign(this[dataKey], DEFAULT_MODEL);
			return;
		}
		if (!data.meta) {
			throw new Error('meta is missing');
		}
		if (!data.data) {
			throw new Error('data is missing');
		}

		const
			columnsMeta = Object.keys(data.meta),
			headersModel = [],
			dataModel = [];

		//	prepare headers
		columnsMeta.forEach(columnKey => {
			headersModel.push({
				key: columnKey,
				type: data.meta[columnKey].type,
				order: data.meta[columnKey].order,
				label: data.meta[columnKey].label,
				labelTie: data.meta[columnKey].labelTie,
				sortable: Boolean(data.meta[columnKey].sortable),
				readonly: Boolean(data.meta[columnKey].readonly),
				hidden: Boolean(data.meta[columnKey].hidden)
			});
		});
		headersModel.sort((c1, c2) => c1.order < c2.order ? -1 : 1);

		//	arrange data
		data.data.forEach(row => {
			const dataRow = {
				cells: []
			};
			headersModel.forEach(column => {
				dataRow.cells.push({
					meta: column,
					data: row[column.key]
				});
			});
			dataModel.push(dataRow);
		});

		Object.assign(this[dataKey], {
			headers: headersModel,
			data: dataModel
		});
	}

	getDataTable() {
		return this[dataKey].data;
	}

	getDataColumn() {
	}

	getDataRow() {
	}

	get defaultTieTarget() {
		return 'data';
	}

	static get htmlUrl() { return import.meta.url.replace(/js$/, 'htm'); }
});