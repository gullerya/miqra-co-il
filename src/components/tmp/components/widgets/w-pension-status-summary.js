import * as DataTier from '../../libs/data-tier/data-tier.min.js';
import { ComponentBase, initComponent } from '../../libs/rich-component/rich-component.min.js';
import * as l10n from '../../services/localization.js';

import '../../elements/span-date.js';

//	{
//		isure: 1,
// 		other: 2,
// 		dataToDate: '',
// 		hoursLeft: ''
//	}
//
//	Information/warning about non-ISure managed products should be shown ONLY when
//	* there is at least one isure managed product AND
//	* there is as least one non-isure managed product
//	Warning about non-complete data will be shown ONLY when
//	* there is NO isure managed products AND
//	* there is an hoursLeft value

const
	pssModel = DataTier.ties.create('pssModel'),
	template = document.createElement('template');

l10n.initL10nResource('pss', {
	en: {
		dataToDate: 'Data up to month',
		other: 'products are not iSure managed',
		initInProgress: 'Data below may still be partial! Data collection from the Clearing House is expected to end in',
		hours: 'hours.'
	},
	he: {
		dataToDate: 'המידע נכון לחודש',
		other: 'מוצרים לא מנוהלים על ידי iSure',
		initInProgress: 'הנתונים מטה עשויים להיות חלקיים! תהליך איסוף מידע מן המסלקה צפוי להסתיים בעוד',
		hours: 'שעות.'
	}
});

template.innerHTML = `
	<style>
		:host {
			display: flex;
			justify-content: space-between;
		}

		.label {
			display: inline-flex;
		}

		.date {
			flex: 1;
			text-align: end;
		}

		.hidden {
			display: none;
		}
	</style>

	<div class="other hidden">
		<span data-tie="pssModel:other"></span>
		&#x20;
		<span data-tie="l10n:pss.other"></span>
	</div>
	<div class="initiation hidden">
		<span data-tie="l10n:pss.initInProgress"></span>
		<span data-tie="pssModel:hoursLeft"></span>
		<span data-tie="l10n:pss.hours"></span>
	</div>
	<div class="date">
		<span class="label">
			<span data-tie="l10n:pss.dataToDate"></span><span>&#x20;</span>
		</span>
		<span-date class="no-day" data-tie="pssModel:dataToDate"></span-date>
	</div>
`;

initComponent('widget-pss', class extends ComponentBase {
	set data(data) {
		const tmp = data || {};
		Object.assign(pssModel, {
			isure: tmp.isure,
			other: tmp.other,
			dataToDate: tmp.dataToDate,
			hoursLeft: tmp.hoursLeft
		});

		if (pssModel.isure && pssModel.other) {
			this.shadowRoot.querySelector('.other').classList.remove('hidden');
		} else {
			this.shadowRoot.querySelector('.other').classList.add('hidden');
		}
		if (!pssModel.isure && pssModel.hoursLeft) {
			this.shadowRoot.querySelector('.initiation').classList.remove('hidden');
		} else {
			this.shadowRoot.querySelector('.initiation').classList.add('hidden');
		}
	}

	get defaultTieTarget() {
		return 'data';
	}

	static get template() {
		return template;
	}
});