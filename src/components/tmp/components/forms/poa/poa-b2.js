import * as DataTier from '../../../libs/data-tier/data-tier.min.js';
import { ComponentBase, initComponent } from '../../../libs/rich-component/rich-component.min.js';
import '../../../elements/splitter.js';
import '../../../components/grid/grid.js';
import '../../../components/signature-pad.js';
import { openModal } from '../../../components/modal.js';
import '../../../elements/input-text.js';

import * as userService from '../../../services/user.js';

const
	paB2Model = DataTier.ties.create('powerOfAttorneyB2', {
		to: {
			id: '',
			name: '',
			refId: ''
		},
		from: {
			name: '',
			legalId: '',
			address: ''
		},
		for: {
			name: 'iSure (איישור)',
			legalId: '25178393',
			phone: '054-6821577',
			email: 'team@isure.co.il'
		},
		products: {
			meta: {
				name: {
					order: 0,
					label: 'שם המוצר'
				},
				refId: {
					order: 1,
					label: 'מספר חשבון או פוליסה של הלקוח במוצר'
				},
				limited: {
					type: 'boolean',
					order: 3,
					label: 'סוכן הביטוח יקבל מידע בלבד לגבי מוצר זה (רשות) ולא ימונה בגוף המוסדי כבעל רישיון מטפל'
				}
			},
			data: []
		},
		strategies: {
			cancellation: {
				a: false,
				b: true
			},
			duration: {
				a: true,
				b: false,
				till: null,
				tillDisabled: true
			}
		}
	});

initComponent('poa-b2', class extends ComponentBase {
	connectedCallback() {
		paB2Model.observe(this.strategiesChangesObserver, { pathsFrom: 'strategies' });
		this.shadowRoot.querySelector('.duration-till').addEventListener('change', event => {
			const v = event.currentTarget.value;
			if (!v || !v.split || v.split('/').length !== 3) {
				event.currentTarget.value = null;
				window.alert('Date format is wrong');
			} else {
				const
					parts = v.split('/'),
					d = new Date(parts[2], parseInt(parts[1]) - 1, parts[0]);
				if (isNaN(d.getTime())) {
					event.currentTarget.value = null;
					window.alert('Date format is wrong');
				} else {
					if (d.getTime() <= new Date().getTime() + 1000 * 60 * 60 * 24 * 3) {
						event.currentTarget.value = null;
						window.alert('Date should be set at least 3 days ahead');
					}
				}
			}
		});
		this.shadowRoot.querySelector('.button.agree').addEventListener('click', async () => {
			//  validate
			const
				dueRequired = paB2Model.strategies.duration.b,
				dueDateText = dueRequired ? paB2Model.strategies.duration.till : null;
			let dueTimestamp = null;
			if (dueRequired) {
				if (!dueDateText) {
					window.alert('When options with due date selected, due date MUST NOT be empty');
					return;
				} else {
					const parts = dueDateText.split('/');
					dueTimestamp = new Date(parts[2], parseInt(parts[1]) - 1, parts[0]).getTime();
				}
			}

			const
				formData = {
					toId: paB2Model.to.id,
					toName: paB2Model.to.name,
					toLegalId: paB2Model.to.refId,
					products: paB2Model.products.data.map(pd => {
						return {
							id: pd.id,
							refId: pd.refId,
							unifiedRefId: pd.unifiedRefId,
							infoOnly: pd.limited
						}
					}),
					cancellation: paB2Model.strategies.cancellation.a ? 'a' : 'b',
					dueTimestamp: dueTimestamp,
					saverSignature: null
				},
				productsTableData = this.shadowRoot.querySelector('.products-data').getDataTable();
			productsTableData.forEach(pRow => {
				const product = formData.products.find(p => p.refId === pRow.cells[1].data);
				product.infoOnly = pRow.cells[2].data;
			});

			//  sign and continue
			const signatureForm = document.createElement('signature-pad');
			const signatureModal = openModal(signatureForm, 'נא לחתום מטה');
			signatureForm.addEventListener('graphically-signed', async event => {
				signatureModal.close();
				formData.saverSignature = event.detail.signature;
				await this.submitPOAB2Form(formData);
				this.dispatchEvent(new Event('submitted'));
			});
		});
	}

	async submitPOAB2Form(formData) {
		console.log('open waiting vilon');
		await userService.submitPowerOfAttorneyB2(formData);
		console.log('close waiting vilon');
	}

	strategiesChangesObserver(changes) {
		changes.forEach(change => {
			if (change.path[1] === 'cancellation') {
				if (change.path[2] === 'a') {
					change.object.b = !change.value;
				} else {
					change.object.a = !change.value;
				}
			} else if (change.path[1] === 'duration' && !change.path[2].startsWith('till')) {
				if (change.path[2] === 'a') {
					change.object.b = !change.value;
				} else {
					change.object.a = !change.value;
				}
				if (paB2Model.strategies.duration.b) {
					paB2Model.strategies.duration.tillDisabled = false;
				} else {
					paB2Model.strategies.duration.till = null;
					paB2Model.strategies.duration.tillDisabled = true;
				}
			}
		});
	}

	set data(data) {
		if (!data) {
			throw new Error('no data');
		}
		if (!data.to) {
			throw new Error('data lacks of addressee info');
		}
		if (!data.from) {
			throw new Error('data lacks of user info');
		}
		if (!Array.isArray(data.productsData) || !data.productsData.length) {
			throw new Error('data lacks of products data');
		}

		paB2Model.to = data.to;
		paB2Model.from = data.from;
		paB2Model.products = {
			meta: paB2Model.products.meta,
			data: data.productsData
		};
	}

	static get htmlUrl() { return import.meta.url.replace(/js$/, 'htm'); }
});
