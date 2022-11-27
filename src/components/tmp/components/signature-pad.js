import { ComponentBase, initComponent } from '../libs/rich-component/rich-component.min.js';
import SignaturePad from '../libs/signature-pad/signature-pad.min.js';
import trimCanvas from '../libs/trim-canvas/trim-canvas.js';
import * as DataTier from '../libs/data-tier/data-tier.min.js';

const
	signaturePadModel = DataTier.ties.create('signaturePad', {
		api: null,
		clearHandler: null,
		acceptHandler: null
	}),
	template = document.createElement('template');

initComponent('signature-pad', class extends ComponentBase {
	connectedCallback() {
		const sp = new SignaturePad(this.shadowRoot.querySelector('.draw-pad'), {
			onBegin: () => {
				this.shadowRoot.querySelector('.accept').removeAttribute('disabled');
			}
		});
		signaturePadModel.api = sp;
		signaturePadModel.clearHandler = () => {
			sp.clear();
			this.shadowRoot.querySelector('.accept').setAttribute('disabled', 'true');
		};
		signaturePadModel.acceptHandler = () => {
			const
				trimmedCanvas = this.getCroppedImage(),
				asDataURL = trimmedCanvas.toDataURL();
			this.dispatchEvent(new CustomEvent('graphically-signed', {
				detail: {
					signature: asDataURL
				}
			}));
			sp.clear();
		};
	}

	//	returns new canvas with cropped to drawing only image
	getCroppedImage() {
		const
			source = this.shadowRoot.querySelector('.draw-pad'),
			result = document.createElement('canvas');
		result.width = source.width;
		result.height = source.height;
		result.getContext('2d').drawImage(source, 0, 0);
		return trimCanvas(result);
	}

	static get template() {
		return template;
	}
});

template.innerHTML = `
	<style>
		:host {
			display: inline-flex;
			flex-direction: column;
			align-items: center;
		}

		.draw-pad {
			flex: 0 0 320px;
			width: 480px;
			box-shadow: 0 0 9px 4px rgb(0, 0, 0, .06);
		}

		.actions {
			flex: 0 0 48px;
			display: flex;
			flex-direction: row;
			align-items: center;
			justify-content: center;
		}

		.actions > .action {
			flex: 0 0 auto;
		}
	</style>

	<canvas class="draw-pad" width="480px" height="320px"></canvas>
	<div class="actions">
		<button class="action clear" data-tie="signaturePad:clearHandler => onclick">CLEAR</button>
		<button class="action accept" disabled data-tie="signaturePad:acceptHandler => onclick">ACCEPT</button>
	</div>
`;