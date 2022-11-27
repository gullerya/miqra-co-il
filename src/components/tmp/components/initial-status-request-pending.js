import * as DataTier from '../libs/data-tier/data-tier.min.js';
import { ComponentBase, initComponent } from '../libs/rich-component/rich-component.min.js';
import * as l10n from '../services/localization.js';
import '../elements/time-down.js';

const
	template = document.createElement('template'),
	DEFAULT_MODEL = {
		requestedAt: '--/--/----',
		availableIn: null,
		requestSent: true,
		requestValid: null,
		responses: null,
		dataSent: null
	},
	requestPendingTie = DataTier.ties.create('requestPendingModel', DEFAULT_MODEL);

l10n.initL10nResource('initialRequestPending', {
	he: {
		requestedAt: 'בקשת מצב פנסיוני הוגשה',
		at: 'ב',
		requestSent: 'בקשה נשלחה',
		requestValid: 'בקשה תקינה',
		responses: 'תשובות',
		dataSent: 'מידע התקבל'
	},
	en: {
		requestedAt: 'Pension status requested',
		at: 'at',
		requestSent: 'Request sent',
		requestValid: 'Request is valid',
		responses: 'Responses',
		dataSent: 'Data received'
	}
});

template.innerHTML = `
	<style>
		@import "./commons/styles/base.css";

		:host {
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			user-select: none;
			cursor: default;
		}

		.title {
			text-align: center;
		}

		.title .time {
			direction: ltr;
		}
		
		.info {
			flex: 1;
			display: flex;
			flex-wrap: wrap;
			align-items: center;
			justify-content: center;
		}

		.info > .available-in {
			flex: 1;
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
		}

		.info > .available-in > .timer {
			margin: 48px 0;
			height: auto;
			flex-direction: column;
		}

		.info > .phases {
			flex: 1 1 8em;
			display: flex;
			flex-direction: column;
		}

		.info > .phases > .phase {
			margin: 8px 0;
			display: flex;
			align-items: center;
		}

		.info > .phases > .phase > .value {
			flex: 0 0 60px;
			display: flex;
			justify-content: center;
		}

		.info > .phases > .phase > .label {
			display: flex;
			justify-content: flex-start;
			white-space: nowrap;
		}
	</style>

	<h3 class="title">
		<div data-tie="l10n:initialRequestPending.requestedAt"></div>
		<div>
			<span data-tie="l10n:initialRequestPending.at"></span>
			&nbsp;
			<span class="time" data-tie="requestPendingModel:requestedAt"></span>
		</div>
	</h3>
	<div class="info">
		<div class="available-in">
			<time-down class="timer" data-tie="requestPendingModel:availableIn"></time-down>
		</div>
		<div class="phases">
			<div class="phase">
				<boolean-icon class="value" data-tie="requestPendingModel:requestSent"></boolean-icon>
				<span class="label" data-tie="l10n:initialRequestPending.requestSent"></span>
			</div>
			<div class="phase">
				<boolean-icon class="value" data-tie="requestPendingModel:requestValid"></boolean-icon>
				<span class="label" data-tie="l10n:initialRequestPending.requestValid"></span>
			</div>
			<div class="phase">
				<span class="value" data-tie="requestPendingModel:responses"></span>
				<span class="label" data-tie="l10n:initialRequestPending.responses"></span>
			</div>
			<div class="phase">
				<span class="value" data-tie="requestPendingModel:dataSent"></span>
				<span class="label" data-tie="l10n:initialRequestPending.dataSent"></span>
			</div>
		</div>
	</div>
`;

initComponent('initial-status-request-pending', class extends ComponentBase {
	set data(data) {
		let newModel = DEFAULT_MODEL;
		if (data) {
			const requestedAtAsDate = data.requestedAt instanceof Date ? data.requestedAt : new Date(data.requestedAt);
			const requestedAt = l10n.stringifyDateTime(requestedAtAsDate, 'hh:mm dd/MM/yyyy');
			const availableIn = requestedAtAsDate.getTime() + data.availableIn - new Date().getTime();
			newModel = {
				requestedAt: requestedAt.toLocaleString(),
				availableIn: availableIn,
				requestSent: true,
				requestValid: data.requestValid,
				requestErrors: data.requestErrors,
				responses: data.responses,
				dataSent: data.dataSent
			};
		}
		Object.assign(requestPendingTie, newModel);
	}

	get defaultTieTarget() {
		return 'data';
	}

	static get template() {
		return template;
	}
});