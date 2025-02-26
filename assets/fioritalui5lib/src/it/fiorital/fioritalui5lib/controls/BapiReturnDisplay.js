sap.ui.define(["jquery.sap.global", "./../library", "sap/ui/core/XMLComposite", "it/fiorital/fioritalui5lib/formatter/SharedFormatter",
		"sap/ui/model/json/JSONModel"
	],
	function (jQuery, library, XMLComposite, SharedFormatter, jsonModel) {
		"use strict";

		var BAPIret = XMLComposite.extend("it.fiorital.fioritalui5lib.controls.BapiReturnDisplay", {
			SharedFormatter: SharedFormatter,
			metadata: {
				library: "it.fiorital.fioritalui5lib",
				events: {
					onAPCmessage: {
						parameters: {
							message: {
								type: "object"
							}
						}
					},
					afterClose: {
						parameters: {

						}
					},
					beforeClose: {
						parameters: {

						}
					}
				}
			},

			init: function () {
				this.BAPImessageModel = new jsonModel();
				this.BAPImessageModel.setData([]); //<-- empty array 

				this.setModel(this.BAPImessageModel, 'BAPImessages');
			},

			showBAPIret: function (mesgs) {
				this.BAPImessageModel.setData(mesgs);
				this.byId("BapiReturnDisplayDialog").open();
			},

			_beforeCloseEvent: function (evt) {
				this.fireEvent("beforeClose", { });
			},

			_afterClose: function (evt) {
				this.fireEvent("afterClose", { });
			},

			listenAPC: function (APC, context, contextType, resetContent) {

				//--> clear content
				if (resetContent !== undefined || resetContent === true) {
					this.BAPImessageModel.setData([]);
					this.BAPImessageModel.refresh(true);
				}

				this.byId('BAPItitle').setBusy(true);

				this.APC = APC;

				//---> delete old listners
				if (this._context !== undefined) {
					this.APC.deleteListenersByTypeAndId1(this._context, this._contextType);
				}

				//---> store for cleanup next call
				this._context = context;
				this._contextType = contextType;

				this.APC.addListenerPermanent({
						id1: context //<--- context
					}, contextType, //<--- context Type
					function (data) {

						this.byId('BAPItitle').setBusy(false);

						var bapiData = new Object();

						bapiData.TYPE = data.MESSAGE_TYPE;
						bapiData.MESSAGE = data.MESSAGE;

						this.BAPImessageModel.getData().push(bapiData);
						this.BAPImessageModel.refresh(true);

						//---> move out of control the event
						this.fireEvent("onAPCmessage", {
							message: data,
							isBroadcastMessage: false
						});

					}.bind(this),
					this.showMessage);

				this.byId("BapiReturnDisplayDialog").open();

			},

			formatBAPIImageColor: function (ABAPtype) {

				switch (ABAPtype) {
				case 'E':
					return 'red';
					break;
				case 'W':
					return 'gold';
					break;
				case 'S':
					return 'green';
					break;
				case 'I':
					return 'green';
					break;
				default:
				}

			},

			formatBAPIImage: function (ABAPtype) {

				switch (ABAPtype) {
				case 'E':
					return 'sap-icon://status-critical';
					break;
				case 'W':
					return 'sap-icon://status-inactive';
					break;
				case 'S':
					return 'sap-icon://status-positive';
					break;
				case 'I':
					return 'sap-icon://message-information';
					break;
				default:
				}

			},

			_closeButtonBAPIretPress: function (evt) {
				this.byId('BapiReturnDisplayDialog').close();
			}

		});

		return BAPIret;
	}, /* bExport= */ true);