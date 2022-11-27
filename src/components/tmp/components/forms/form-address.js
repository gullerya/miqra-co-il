import * as DataTier from '../../libs/data-tier/data-tier.min.js';
import { ComponentBase, initComponent } from '../../libs/rich-component/rich-component.min.js';
import * as l10n from '../../services/localization.js';
import '../../elements/input-text.js';
import '../../elements/input-button.js';
import '../../elements/input-select.js';

l10n.initL10nResource('addressForm', {
	en: {
		city: 'City',
		street: 'Street',
		block: 'Block',
		zip: 'ZIP'
	},
	he: {
		city: 'יישוב',
		street: 'רחוב',
		block: 'בית',
		zip: 'מיקוד'
	}
});

const
	formModel = DataTier.ties.create('addressFormModel', {
		data: {}
	}),
	template = document.createElement('template');

template.innerHTML = `
	<style>
		:host {
			min-width: 180px;
			display: flex;
			flex-direction: column;
		}

		.field {
			width: 100%;
		}

		.zip-block {
			display: flex;
			align-items: center;
			justify-content: space-between;
			overflow: hidden;
		}

		.lookup {
			flex: 0 0 36px;
			height: 36px;
			overflow: hidden;
		}

		.lookup-label {
			font-size: 2em;
			margin-top: -0.18em;
		}

		.field.zip {
			flex-basis: calc(100% - 48px);
		}
	</style>

	<input-select class="field city required" data-tie="addressFormModel:data.city">
		<span slot="label" data-tie="l10n:addressForm.city"></span>
	</input-select>
	<input-select class="field street required" data-tie="addressFormModel:data.street">
		<span slot="label" data-tie="l10n:addressForm.street"></span>
	</input-select>
	<input-text class="field block required" data-tie="addressFormModel:data.block">
		<span slot="label" data-tie="l10n:addressForm.block"></span>
	</input-text>
	<div class="zip-block">
		<input-button class="lookup emphasized">
			<span slot="text" class="lookup-label">&#x2315;</span>
		</input-button>
		<input-text class="field zip required" data-tie="addressFormModel:data.zip">
			<span slot="label" data-tie="l10n:addressForm.zip"></span>
		</input-text>
	</div>
`;

initComponent('form-address', class extends ComponentBase {
	connectedCallback() {
		formModel.observe(changes => {
			changes.forEach(change => {
				const lastPathNode = change.path[change.path.length - 1];
				if (lastPathNode === 'city') {
					formModel.data.street = null;
					formModel.data.block = null;
					formModel.data.zip = null;
				} else if (lastPathNode === 'street') {
					formModel.data.block = null;
					formModel.data.zip = null;
				} else if (lastPathNode === 'block') {
					formModel.data.zip = null;
				}
			});
		});
	}

	set model(newModel) {
		if (newModel === undefined || newModel === null || newModel === '') {
			formModel.data = null;
		} else if (typeof newModel === 'object') {
			formModel.data = newModel;
		} else {
			console.error('model MUST be of type "object"');
		}
	}

	get model() {
		return formModel.data;
	}

	get isValid() {
		return !!formModel.data.city && !!formModel.data.street && !!formModel.data.block && !!formModel.data.zip;
	}

	get defaultTieTarget() {
		return 'model';
	}

	get changeEventName() {
		return 'input';
	}

	static get template() {
		return template;
	}
});