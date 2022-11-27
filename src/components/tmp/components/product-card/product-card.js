import { ComponentBase, initComponent } from '../../libs/rich-component/rich-component.min.js';
import * as productsTranslateUtils from '../../services/product-convert-utils.js';
import * as productsService from '../../services/products.js';
import '../../elements/splitter.js';
import '../../elements/input-button.js';
import '../../elements/svg-icon.js';
import { openModal } from '../modal.js';
import '../fund-icon.js';
import '../product-drill-down/product-drill-down.js';
import './study-card-data.js';
import './savings-card-data.js';
import './insurance-card-data.js';
import './mortgage-card-data.js';

/**
 * product DTO - general data
 * {
 * 		fund:			<see fund-icon API to know what to pass here> },
 * 		id:				<number>,
 * 		upToDate:		<string>,
 * 		name:			<string>,
 * 		type:			<number>,
 * 		refId:			<string>,
 * 		status:			<number>,
 * 		iSureManaged:	<number>,
 *
 * 		<specific data as relevant per product type>
 * }
 */

const
	productDataKey = Symbol('product.data.key'),
	template = document.createElement('template');

template.innerHTML = `
	<style>
		@import "./commons/styles/base.css";

		:host {
			min-width: 480px;
			width: 24em;
			height: 16em;
			position: relative;
			display: inline-flex;
			flex-direction: column;
			padding: 16px;
			background-color: var(--default-background);
		}

		.row {
			flex: 1;
			display: flex;
			flex-direction: row;
			align-items: center;
		}

		.column {
			flex: 1;
			display: flex;
			flex-direction: column;
		}

		.hidden {
			display: none;
		}

		.header {
			flex: 0 0 5em;
			display: flex;
			flex-direction: row;
			align-items: center;
		}

		.fund {
			flex: 0 0 4.2em;
			height: 4.2em;
		}

		.product.info .column.b {
			align-items: flex-end;
		}

		.buttons-bar {
			position: absolute;
			top: 0;
			width: calc(100% + 12px);
			height: 0;
			display: flex;
			align-items: center;
			justify-content: flex-end;
		}

		.status {
			color: var(--main-gray);
		}

		.status.pos {
			color: var(--main-green);
		}

		.status.neg {
			color: var(--main-red);
		}

		.status.att {
			color: var(--main-yellow);
		}

		.content::slotted(*) {
			flex: 1;
			display: flex;
		}
	</style>

	<div class="header">
		<fund-icon class="fund"></fund-icon>
		<v-splitter transparent clearance="8px"></v-splitter>
		<div class="product info column">
			<h5 class="name bidi-transor"></h5>
			<div class="row">
				<div class="column a">
					<div class="type subtitle bidi-transor"></div>
					<div class="ref-id subtitle bidi-transor"></div>
				</div>
				<div class="column b">
					<div class="status bold-a"></div>
					<div class="empty subtitle bidi-transor">&nbsp;</div>
				</div>
			</div>
		</div>
	</div>
	<h-splitter clearance="12px" color="var(--main-green)"></h-splitter>
	<slot name="content" class="content"></slot>
	<div class="buttons-bar">
		<input-button class="show-more">
			<svg-icon slot="icon" type="showMore"></svg-icon>
		</input-button>
	</div>
`;

initComponent('product-card', class extends ComponentBase {
	connectedCallback() {
		this.shadowRoot.querySelector('.show-more').addEventListener('click', async () => {
			const productId = this[productDataKey].id;
			console.info('going to fetch product details by pId ' + productId + '...');

			const product = await productsService.getProductDetails(productId);
			if (product) {
				console.info('... product details of ' + productId + ' fetched');
				const productDrillDown = document.createElement('product-drill-down');
				productDrillDown.product = product;
				openModal(productDrillDown, { width: '85%', height: '85%' });
			} else {
				//  TODO: show some explicit error notification to the user
				console.error('failed to get product details of pId ' + productId);
			}
		});
	}

	set product(product) {
		if (!product || typeof product !== 'object') {
			return;
		}

		this[productDataKey] = product;

		//	process title data
		this.shadowRoot.querySelector('.fund').data = product.fund;
		this.shadowRoot.querySelector('.product .name').textContent = product.name;
		this.shadowRoot.querySelector('.product .type').dataset.tie = productsTranslateUtils.translateProductType(product.type, product.pensiaType);
		this.shadowRoot.querySelector('.product .ref-id').textContent = product.refId;
		if (product.status) {
			const statusView = this.shadowRoot.querySelector('.product .status')
			statusView.dataset.tie = productsTranslateUtils.translateProductStatus(product.status);
			if (product.status === 1 || product.status === 9) {
				statusView.classList.add('pos');
			} else if (product.status === 2 || product.status === 3) {
				statusView.classList.add('neg');
			} else if (product.status === 4 || product.status === 8) {
				statusView.classList.add('att');
			} else {
				//	leave neutral
			}
		}

		//	process content according to the product type
		let content;
		if (product.type === 1 || product.type === 2 || product.type === 3 ||
			product.type === 5 || product.type === 9 || product.type === 10) {
			if (product.type === 2) {
				this.shadowRoot.querySelector('.product .name').dataset.tie = this.shadowRoot.querySelector('.product .type').dataset.tie;
				this.shadowRoot.querySelector('.product .type').classList.add('hidden');
			}
			content = document.createElement('savings-card-data');
		} else if (product.type === 4) {
			this.shadowRoot.querySelector('.product .name').dataset.tie = this.shadowRoot.querySelector('.product .type').dataset.tie;
			this.shadowRoot.querySelector('.product .type').classList.add('hidden');
			content = document.createElement('study-card-data');
		} else if (product.type === 6 || product.type === 8) {
			if (product.type === 6) {
				const covTypes = {};
				product.generalCoverages.forEach(c => { covTypes[c.type] = true });
				this.shadowRoot.querySelector('.product .name').dataset.tie = productsTranslateUtils.translateCoverageType(Object.keys(covTypes).map(k => parseInt(k)));
				this.shadowRoot.querySelector('.product .type').classList.add('hidden');
			}
			content = document.createElement('insurance-card-data');
		} else if (product.type === 7) {
			this.shadowRoot.querySelector('.product .name').dataset.tie = this.shadowRoot.querySelector('.product .type').dataset.tie;
			this.shadowRoot.querySelector('.product .type').classList.add('hidden');
			content = document.createElement('mortgage-card-data');
		}
		content.product = product;
		content.slot = 'content';
		this.appendChild(content);
	}

	get product() {
		return this[productDataKey];
	}

	get defaultTieTarget() {
		return 'product';
	}

	static get template() {
		return template;
	}
});