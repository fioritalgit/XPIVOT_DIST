/*eslint-disable */

sap.ui.define([
		"jquery.sap.global",
		"sap/ui/core/XMLComposite",
		"sap/m/MessageBox",
		"it/fiorital/fioritalui5lib/utility/utilities",
		"it/fiorital/fioritalui5lib/formatter/SharedFormatter",
		"it/fiorital/fioritalui5lib/controls/FioritalMessageStrip",
		"sap/ui/model/json/JSONModel",
		"sap/ui/model/Filter",
		"sap/ui/model/FilterOperator",
		"it/fiorital/fioritalui5lib/extension/FloatFixed2Parse",
		"it/fiorital/fioritalui5lib/extension/FloatFixed3Parse"
	], function (jQuery, XMLComposite, MessageBox, SharedUtilities, SharedFormatter, FioritalMessageStrip, JSONmodel, Filter, FilterOperator,
		FloatFixed2Parse, FloatFixed3Parse) {

		var BoxManager = XMLComposite.extend("it.fiorital.fioritalui5lib.controls.BoxManager", {
			SharedUtilities: SharedUtilities,
			SharedFormatter: SharedFormatter,
			FloatFixed2Parse: FloatFixed2Parse,
			FloatFixed3Parse: FloatFixed3Parse,
			metadata: {

				library: "it.fiorital.fioritalui5lib",
				properties: {
					/**
					 * Box Manager dialog title
					 */
					title: {
						type: "string",
						defaultValue: "Box Manager"
					}
				},
				events: {
					onClose: {
						parameters: {}
					}
				},
				aggregations: {

				},
				defaultAggregation: "items"
			},

			init: function () {
				//--> super
				XMLComposite.prototype.init.apply(this, arguments);

				this.loadedData = false;

				this.boxMgrModel = new sap.ui.model.json.JSONModel();
				this.byId("boxManagerDialogId").setModel(this.boxMgrModel, 'boxMgrModel');

				this.byId("boxManagerDialogId").setBindingContext(null);
				this.byId("boxMgrDialogBoxesTableId").setBindingContext(null);
				this.byId("boxManagerDialogPalletComboId").setBindingContext(null);

				this.jsonModelBoxes = new JSONmodel();
				this.jsonModelBoxes.attachRequestCompleted(this.jsonRequestCompleted.bind(this));
				this.setModel(this.jsonModelBoxes, 'BOXES');
				this.QZHelper = sap.ui.core.Component.getOwnerComponentFor(this).QZHelper;

				this.baseDataSelect = {
					boxes: 0,
					selectedLanguage: "IT",
					numberOfLabels: "1",
					from: 0,
					to: 0
				};

				this.jsonModeSelected = new JSONmodel(this.baseDataSelect);
				this.setModel(this.jsonModeSelected, 'SELECTED');

				this.jsonPrintLanguage = new JSONmodel({
					"language": [{
						"value": "IT"
					}, {
						"value": "EN"
					}, {
						"value": "FR"
					}, {
						"value": "ES"
					}, {
						"value": "DE"
					}, {
						"value": "PT"
					}, ]
				});
				this.setModel(this.jsonPrintLanguage, 'LANGUAGES');
			},

			applySettings: function (mSettings, oScope) {
				//--> super
				XMLComposite.prototype.applySettings.apply(this, arguments);
			},

			jsonRequestCompletedOnCreateBox: function (event) {
				this.boxesJsonModel.refresh();

				var ms = new FioritalMessageStrip(this.getModel("sharedi18n").getResourceBundle().getText("toastMessageBoxCreated"), {
					status: 'info',
					icon: 'sap-icon://sys-add',
					timeout: 3000
				});
				sap.ui.core.BusyIndicator.hide();
			},

			jsonRequestCompletedOnOpen: function (event) {
				this.byId("boxManagerDialogId").open();
			},

			jsonRequestCompleted: function (event) {

				//--> enable again button close
				this.byId('boxManagerCloseButton').setBusy(false);
				this.loadedData = true;

				//-->set property for print button
				if (this.baseDataSelect.disablePrintNoAWB === false) {
					this.byId("boxManagerDialogId").getModel("boxMgrModel").setProperty("/enablePrint", true);
				} else {
					this.byId("boxManagerDialogId").getModel("boxMgrModel").setProperty("/enablePrint", false);
				}
				this.getModel("BOXES").getData().value.forEach(function (box) {
					if (box.boxweight === 0.000 || box.boxweight === undefined || box.boxweight === null) {
						this.byId("boxManagerDialogId").getModel("boxMgrModel").setProperty("/enablePrint", false);
						return;
					}
				}.bind(this));
			},

			openByEventAndData: function (oEvent, oData, isNotVendor, disableControls, disablePrintNoAWB) {

				var bDisableControls = false;
				if (disableControls === true) {
					bDisableControls = true;
				}

				var bdisablePrintNoAWB = false;
				if (disablePrintNoAWB === true) {
					bdisablePrintNoAWB = true;

					var ms = new FioritalMessageStrip(this.getModel("sharedi18n").getResourceBundle().getText("BoxManagerMissingFOorAWB"), {
						status: 'warning',
						icon: 'sap-icon://message-information',
						timeout: 4500
					});
				}

				this.baseDataSelect = {
					boxes: 0,
					selectedLanguage: "IT",
					numberOfLabels: "1",
					from: 0,
					to: 0,
					disableControls: bDisableControls,
					disablePrintNoAWB: bdisablePrintNoAWB
				};

				this.jsonModeSelected.setData(this.baseDataSelect);
				this.jsonModeSelected.refresh(true);

				//--> set target value
				this.byId("boxesMicroChartId").setTargetValue(parseInt(oData.qty, 10));

				this.byId("boxManagerDialogId").setBindingContext(oEvent.getSource().getBindingContext());
				this.oItem = oData;

				if (isNotVendor) {
					this.isNotVendor = true;
				}

				this._initBoxManagerBindings(oEvent, oData);
				this._initBoxManagerProperties(oData);

				this.byId("boxManagerDialogId").open();
			},

			openBoxManagerByPurchaseOrder: function (oEvent, oObject) {

				this.baseDataSelect = {
					boxes: 0,
					selectedLanguage: "IT",
					numberOfLabels: "1",
					from: 0,
					to: 0
				};

				this.jsonModeSelected.setData(this.baseDataSelect);
				this.jsonModeSelected.refresh(true);

				if (oObject.model !== undefined) {
					this.setModel(oObject.model); //<--- set default model if discordant
				}

				this.oItem = oObject;

				this._initBoxManagerBindings(oEvent, oObject);
				this._initBoxManagerProperties(oObject);

				this.byId("boxManagerDialogId").open();
			},

			raiseCloseEvent: function (evt) {

				if (this.loadedData === true) {
					this.fireEvent("onClose", {});
				}

				this.isNotVendor = false;
				this.getModel("SELECTED").setProperty("/boxes", 0);
				this.byId("boxMgrDialogBoxesTableId").removeSelections();
			},

			onBoxManagerClose: function (oEvent) {
				this.byId("boxManagerDialogId").close();
			},

			_initConfirmDialog: function (oEvent, fnSuccess, fnError) {
				var i18n = this.getModel("sharedi18n").getResourceBundle(),
					source = oEvent.getSource();

				var dialog = new sap.m.Dialog({
					title: i18n.getText("deleteWarningTitle"),
					type: "Message",
					state: "Warning",
					content: new sap.m.Text({
						text: i18n.getText("deleteWarningContentText")
					}),
					beginButton: new sap.m.Button({
						type: "Ghost",
						text: i18n.getText("deleteWarningButtonClose"),
						press: function () {
							dialog.close();
							sap.ui.core.BusyIndicator.hide();
						}
					}),
					endButton: new sap.m.Button({
						type: "Ghost",
						text: i18n.getText("deleteWarningButtonConfirm"),
						press: function () {
							dialog.close();
							sap.ui.core.BusyIndicator.show(0);
							source.getBindingContext().delete().then(fnSuccess).catch(fnError);
						}.bind(this)
					}),
					afterClose: function () {
						dialog.destroy();
					}
				}).addStyleClass("sapUiSizeCompact");

				return dialog;
			},

			onCreateBoxPress: function (oEvent) {

				sap.ui.core.BusyIndicator.show(0);

				this.oPurchaseOrderItemContext = this.byId("boxMgrDialogBoxesTableId").getBindingContext();
				var oModel = this.getModel();

				var oCanonicalContext = new sap.ui.model.Context(oModel, this.oPurchaseOrderItemContext.getCanonicalPath());

				var oAction = oModel.bindContext("com.sap.gateway.default.zfioapi.v0001.CREATE_BOX(...)", oCanonicalContext);

				var sBoxes = this.byId("boxManagerDialogId").getModel("boxMgrModel").getProperty("/boxNumber");
				var dWgt = this.byId("boxManagerDialogId").getModel("boxMgrModel").getProperty("/totwgt");
				var sGuid = this.byId("boxManagerDialogId").getModel("boxMgrModel").getProperty("/guid");
				this.byId("boxManagerDialogId").getModel("boxMgrModel").setProperty("/guid", "");

				var sWeightType = this.byId("boxManagerDialogId").getModel("boxMgrModel").getProperty("/isvariableweight");
				var sHuId = "";
				if (this.byId("boxManagerDialogPalletComboId").getSelectedItem()) {
					sHuId = this.byId("boxManagerDialogPalletComboId").getSelectedItem().getKey().padStart(20, "0");
				}

				oAction.setParameter("NUMBER_OF_BOX", sBoxes);
				oAction.setParameter("TOTAL_WGHT", dWgt.toString());
				oAction.setParameter("ISVARIABLEWEIGHT", sWeightType);
				oAction.setParameter("HU_PARENT", sHuId);
				oAction.setParameter("GUID", sGuid);

				var fnSuccess = function (oData) {

					//--> refresh data
					this.jsonModelBoxes.loadData(this.boxesUrl);

					//-->refresh micro chart data
					var totBoxes = parseInt(this.oItem.totBoxes),
						boxesToAdd = parseInt(this.byId("boxManagerDialogId").getModel("boxMgrModel").getProperty("/boxNumber"));
					this.oItem.totBoxes = parseInt(totBoxes + boxesToAdd);
					this._refreshMicroChartData(this.oItem);

					var ms = new FioritalMessageStrip(this.getModel("sharedi18n").getResourceBundle().getText("toastMessageBoxCreated"), {
						status: 'info',
						icon: 'sap-icon://sys-add',
						timeout: 3000
					});

					sap.ui.core.BusyIndicator.hide();

				}.bind(this);

				var fnError = function (oError) {
					sap.ui.core.BusyIndicator.hide();
					this.getModel().resetChanges("batchGroupAPI");
				}.bind(this);

				oAction.execute().then(fnSuccess).catch(fnError);
			},

			onCreatePalletFromBoxManagerPress: function (oEvent) {
				sap.ui.core.BusyIndicator.show(0);
				//ACTION ARE ONLY LAUNCHABLE IN DEFERRED MODE. USE (...) TO DO THIS
				var oModel = this.getModel(),
					oPurchaseOrderContext = oEvent.getSource().getBindingContext(),
					oAction = oModel.bindContext("com.sap.gateway.default.zfioapi.v0001.CREATE_PALLET(...)", oPurchaseOrderContext),
					iQty = 1; //-->fixed qty when creating pallet from box manager

				oAction.setParameter("NUMBER_OF_PALLET", parseInt(iQty));

				var fnSuccess = function (oData) {
					var ms = new FioritalMessageStrip(this.getModel("sharedi18n").getResourceBundle().getText("toastMessagePalletCreated"), {
						status: 'info',
						icon: 'sap-icon://add',
						timeout: 3000
					});

					//-->set pallet value as selected key
					this.byId("boxManagerDialogId").getModel("boxMgrModel").setProperty("/huexternalid", oAction.getBoundContext().getProperty(
						"huexternalid"));

					this.byId("boxManagerDialogId").getModel("boxMgrModel").refresh();
					this.byId("boxManagerDialogPalletComboId").getBindingContext().refresh();

					sap.ui.core.BusyIndicator.hide();
				}.bind(this);

				var fnError = function (oError) {
					sap.ui.core.BusyIndicator.hide();
					this.getModel().resetChanges("batchGroupAPI");
				}.bind(this);

				sap.ui.core.BusyIndicator.show(0); // Lock UI until submitBatch is resolved.
				oAction.execute().then(fnSuccess).catch(fnError);
			},

			onPrintPress: function (oEvent) {
				var ms = new FioritalMessageStrip(this.getModel("sharedi18n").getResourceBundle().getText("NotYetImplemented"), {
					status: 'info',
					icon: 'sap-icon://message-warning',
					timeout: 3000
				});
			},

			onMassPrintPress: function (oEvent) {
				sap.ui.core.BusyIndicator.show(0);

				var oPurchaseOrderContext = oEvent.getSource().getBindingContext();
				var oModel = this.getModel();

				var oAction = oModel.bindContext("com.sap.gateway.default.zfioapi.v0001.MASS_PRINT_HU(...)", oPurchaseOrderContext);

				//-->use customdata to get modified items
				var aBoxes = [],
					aAllItems = this.byId("boxMgrDialogBoxesTableId").getItems();

				this.byId("boxMgrDialogBoxesTableId").getItems().forEach(function (oItem) {
					if (oItem.isSelected()) {
						aBoxes.push(oItem.getBindingContext('BOXES').getObject());
					}
				});

				oAction.setParameter("HU_JSON", JSON.stringify(aBoxes));
				oAction.setParameter("LABEL_TYPE", 'BOX');
				oAction.setParameter("LANGUAGE", this.getModel("SELECTED").getProperty("/selectedLanguage"));
				oAction.setParameter("COPY_NR", this.getModel("SELECTED").getProperty("/numberOfLabels").toString());

				var fnSuccess = function (oData) {

					var res = oAction.getBoundContext().getProperty("res");
					var resText = oAction.getBoundContext().getProperty("bapiretJson");

					if (res === 1) {
						if (JSON.parse(resText)[0].MESSAGE === 'EMPTY_CHARS') {
							sap.ui.core.BusyIndicator.hide();
							var ms = new FioritalMessageStrip(this.getModel("sharedi18n").getResourceBundle().getText("toastMessageErrorLabelsChars"), {
								status: 'error',
								icon: 'sap-icon://sys-cancel',
								timeout: 3000
							});
							return;
						}
						else if (JSON.parse(resText)[0].MESSAGE === 'INVALID_BOXWEIGHT') {
							sap.ui.core.BusyIndicator.hide();
							var ms = new FioritalMessageStrip(this.getModel("sharedi18n").getResourceBundle().getText("toastMessageErrorInvalidBoxWeight"), {
								status: 'error',
								icon: 'sap-icon://sys-cancel',
								timeout: 3000
							});
							return;
						}

						this.byId('BAPIret').showBAPIret(JSON.parse(resText));
						sap.ui.core.BusyIndicator.hide();
						return;
					}

					var ms = new FioritalMessageStrip(this.getModel("sharedi18n").getResourceBundle().getText("toastMessageMassPrintSuccess"), {
						status: 'info',
						icon: 'sap-icon://edit',
						timeout: 3000
					});

					if (res !== 2) {
						var ctx = oAction.getBoundContext();
						var labels = JSON.parse(ctx.getObject().zplJson);

						labels.forEach(function (sLabel) {
							this.QZHelper.printZPL(sLabel.ZPL_STR);
						}.bind(this));
					}

					sap.ui.core.BusyIndicator.hide();
				}.bind(this);

				var fnError = function (oError) {
					sap.ui.core.BusyIndicator.hide();
					this.getModel().resetChanges("batchGroupAPI");
				}.bind(this);

				oAction.execute().then(fnSuccess).catch(fnError);
			},

			onSyncronizeDataPress: function (oEvent) {

				sap.ui.core.BusyIndicator.show(0);

				var oPurchaseOrderItemContext = this.byId("boxMgrDialogBoxesTableId").getBindingContext(); //to use on tables without selection boxes, selected item determined from oEvent	
				var oModel = this.getModel();

				var oCanonicalContext = new sap.ui.model.Context(oModel, oPurchaseOrderItemContext.getCanonicalPath()); //creating new context on canonical path alone

				var oAction = oModel.bindContext("com.sap.gateway.default.zfioapi.v0001.BOXES_WEIGHT_CHANGE(...)", oCanonicalContext);

				//-->use customdata to get modified items
				var aBoxes = [],
					aAllItems = this.byId("boxMgrDialogBoxesTableId").getItems(),
					hasZeroWgt = false;

				this.byId("boxMgrDialogBoxesTableId").getItems().forEach(function (oItem) {
					//check if at least one row has 0 weight to give warning before sync
					var boxweight = oItem.getBindingContext('BOXES').getObject().boxweight;
					if ((boxweight === 0 || boxweight === "0.00" || boxweight === undefined) && !hasZeroWgt) {
						hasZeroWgt = true;
					}
					aBoxes.push(oItem.getBindingContext('BOXES').getObject());
				});

				oAction.setParameter("JSON_ITEMS", JSON.stringify(aBoxes));

				var fnSuccess = function (oData) {

					var res = oAction.getBoundContext().getProperty("res");
					var resText = oAction.getBoundContext().getProperty("jsonItem");

					if (res === 1) {
						this.byId('BAPIret').showBAPIret(JSON.parse(resText));
					}

					//-->disable button 
					this.byId("boxManagerDialogId").getModel("boxMgrModel").setProperty("/hasChanged", false);
					this.byId("synchronizeButtonId").removeStyleClass("blinking");

					var ms = new FioritalMessageStrip(this.getModel("sharedi18n").getResourceBundle().getText("toastMessageWeightModified"), {
						status: 'info',
						icon: 'sap-icon://edit',
						timeout: 3000
					});

					//--> refresh data
					this.jsonModelBoxes.loadData(this.boxesUrl);

					sap.ui.core.BusyIndicator.hide();
				}.bind(this);

				var fnError = function (oError) {
					sap.ui.core.BusyIndicator.hide();
					this.getModel().resetChanges("batchGroupAPI");
				}.bind(this);

				if (hasZeroWgt) {
					MessageBox.warning(this.getModel("sharedi18n").getResourceBundle().getText("warningMessageBoxManagerSync"), {
						title: this.getModel("sharedi18n").getResourceBundle().getText("deleteWarningTitle"),
						actions: [MessageBox.Action.NO, MessageBox.Action.YES],
						emphasizedAction: MessageBox.Action.YES,
						onClose: function (action) {
							if (action === sap.m.MessageBox.Action.YES) {
								oAction.execute().then(fnSuccess).catch(fnError);
							}

							if (action === sap.m.MessageBox.Action.NO) {
								sap.ui.core.BusyIndicator.hide();
							}
						}
					});
				} else {
					oAction.execute().then(fnSuccess).catch(fnError);
				}
			},

			ondDeleteHus: function (oEvent) {

				sap.m.MessageBox.show(
					"Confirm BOX delete ?", {
						icon: sap.m.MessageBox.Icon.INFORMATION,
						title: "DELETE BOX",
						actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
						onClose: function (oAction) {
							if (oAction === 'YES') {

								sap.ui.core.BusyIndicator.show(0);

								var oPurchaseOrderItemContext = this.byId("boxMgrDialogBoxesTableId").getBindingContext(); //to use on tables without selection boxes, selected item determined from oEvent	
								var oModel = this.getModel();
								var oCanonicalContext = new sap.ui.model.Context(oModel, oPurchaseOrderItemContext.getCanonicalPath()); //creating new context on canonical path alone
								var oAction = oModel.bindContext("com.sap.gateway.default.zfioapi.v0001.MASS_BOXES_DELETE(...)", oCanonicalContext);

								//-->use customdata to get modified items
								var aBoxes = [];

								this.byId("boxMgrDialogBoxesTableId").getSelectedItems().forEach(function (oItem) {
									var obj = oItem.getBindingContext('BOXES').getObject();
									var boxes = {
										"palletext": obj.palletext,
										"huexternalid": obj.huexternalid,
										"refdocnr": obj.refdocnr,
										"refdocpos": obj.refdocpos
									};
									aBoxes.push(boxes);
								});

								oAction.setParameter("JSON_ITEMS", JSON.stringify(aBoxes));

								var fnSuccess = function (oData) {

									var res = oAction.getBoundContext().getProperty("res");
									var resText = oAction.getBoundContext().getProperty("jsonItem");

									if (res === 1) {
										this.byId('BAPIret').showBAPIret(JSON.parse(resText));
									}

									var ms = new FioritalMessageStrip(this.getModel("sharedi18n").getResourceBundle().getText("toastMessageBoxesDelete"), {
										status: 'info',
										icon: 'sap-icon://edit',
										timeout: 3000
									});

									this.byId("boxMgrDialogBoxesTableId").removeSelections();

									//--> refresh data
									this.jsonModelBoxes.loadData(this.boxesUrl);

									sap.ui.core.BusyIndicator.hide();
								}.bind(this);

								var fnError = function (oError) {
									sap.ui.core.BusyIndicator.hide();
									this.getModel().resetChanges("batchGroupAPI");
								}.bind(this);

								oAction.execute().then(fnSuccess).catch(fnError);

							}
						}.bind(this)
					}
				);
			},

			onMultiLabelPress: function (oEvent) {
				sap.ui.core.BusyIndicator.show(0);

				var oPurchaseOrderContext = oEvent.getSource().getBindingContext();
				var oModel = this.getModel();

				var oAction = oModel.bindContext("com.sap.gateway.default.zfioapi.v0001.MASS_PRINT_HU(...)", oPurchaseOrderContext);

				//-->use customdata to get modified items
				var aBoxes = [],
					aAllItems = this.byId("boxMgrDialogBoxesTableId").getItems();

				this.byId("boxMgrDialogBoxesTableId").getItems().forEach(function (oItem) {
					if (oItem.isSelected()) {
						aBoxes.push(oItem.getBindingContext('BOXES').getObject());
					}
				});

				oAction.setParameter("HU_JSON", JSON.stringify(aBoxes));
				oAction.setParameter("LABEL_TYPE", 'MUL');
				oAction.setParameter("LANGUAGE", this.getModel("SELECTED").getProperty("/selectedLanguage"));
				oAction.setParameter("COPY_NR", this.getModel("SELECTED").getProperty("/numberOfLabels").toString());

				var fnSuccess = function (oData) {

					var res = oAction.getBoundContext().getProperty("res");
					var resText = oAction.getBoundContext().getProperty("bapiretJson");

					if (res === 1) {
						if (JSON.parse(resText)[0].MESSAGE === 'EMPTY_CHARS') {
							sap.ui.core.BusyIndicator.hide();
							var ms = new FioritalMessageStrip(this.getModel("sharedi18n").getResourceBundle().getText("toastMessageErrorLabelsChars"), {
								status: 'error',
								icon: 'sap-icon://sys-cancel',
								timeout: 3000
							});
							return;
						}
						else if (JSON.parse(resText)[0].MESSAGE === 'INVALID_BOXWEIGHT') {
							sap.ui.core.BusyIndicator.hide();
							var ms = new FioritalMessageStrip(this.getModel("sharedi18n").getResourceBundle().getText("toastMessageErrorInvalidBoxWeight"), {
								status: 'error',
								icon: 'sap-icon://sys-cancel',
								timeout: 3000
							});
							return;
						}

						this.byId('BAPIret').showBAPIret(JSON.parse(resText));
						sap.ui.core.BusyIndicator.hide();
						return;
					}

					var ctx = oAction.getBoundContext();

					if (ctx.getObject().zplJson === "") {
						var ms = new FioritalMessageStrip(this.getModel("sharedi18n").getResourceBundle().getText("toastMessageMultiLabelDownloadError"), {
							status: 'error',
							icon: 'sap-icon://sys-cancel',
							timeout: 3000
						});
					}

					var labels = JSON.parse(ctx.getObject().zplJson);

					var label_list = [];

					labels.forEach(function (sLabel) {
						label_list.push(sLabel.ZPL_STR);
					});

					var getdata = new Object();

					getdata.dpi = 203;
					getdata.height = 11.7;
					getdata.width = 8.3;
					getdata.accept = 'application/pdf';
					getdata.zpl = labels;

					$.ajax({
						url: '/fiorital/zplprinter',
						type: 'post',
						contentType: "application/json",
						data: JSON.stringify(getdata),
						success: function (data) {

							var ms = new FioritalMessageStrip(this.getModel("sharedi18n").getResourceBundle().getText(
								"toastMessageMultiLabelDownloadSuccess"), {
								status: 'info',
								icon: 'sap-icon://edit',
								timeout: 3000
							});

							this.__downloadPDFfromBlob(this.b64toblob(data, '', 512), "multi");

						}.bind(this),
						error: function (jqXHR, textStatus, errorThrown) {

						}.bind(this)
					});

					sap.ui.core.BusyIndicator.hide();
				}.bind(this);

				var fnError = function (oError) {
					sap.ui.core.BusyIndicator.hide();
					this.getModel().resetChanges("batchGroupAPI");
				}.bind(this);

				oAction.execute().then(fnSuccess).catch(fnError);
			},

			onSingleLabelPress: function (oEvent) {
				sap.ui.core.BusyIndicator.show(0);

				var oPurchaseOrderContext = oEvent.getSource().getBindingContext();
				var oModel = this.getModel();

				var oAction = oModel.bindContext("com.sap.gateway.default.zfioapi.v0001.MASS_PRINT_HU(...)", oPurchaseOrderContext);

				//-->use customdata to get modified items
				var aBoxes = [],
					aAllItems = this.byId("boxMgrDialogBoxesTableId").getItems();

				this.byId("boxMgrDialogBoxesTableId").getItems().forEach(function (oItem) {
					if (oItem.isSelected()) {
						aBoxes.push(oItem.getBindingContext('BOXES').getObject());
					}
				});

				oAction.setParameter("HU_JSON", JSON.stringify(aBoxes));
				oAction.setParameter("LABEL_TYPE", 'PDF');
				oAction.setParameter("LANGUAGE", this.getModel("SELECTED").getProperty("/selectedLanguage"));
				oAction.setParameter("COPY_NR", this.getModel("SELECTED").getProperty("/numberOfLabels").toString());

				var fnSuccess = function (oData) {

					var res = oAction.getBoundContext().getProperty("res");
					var resText = oAction.getBoundContext().getProperty("bapiretJson");

					if (res === 1) {
						if (JSON.parse(resText)[0].MESSAGE === 'EMPTY_CHARS') {
							sap.ui.core.BusyIndicator.hide();
							var ms = new FioritalMessageStrip(this.getModel("sharedi18n").getResourceBundle().getText("toastMessageErrorLabelsChars"), {
								status: 'error',
								icon: 'sap-icon://sys-cancel',
								timeout: 3000
							});
							return;
						}
						else if (JSON.parse(resText)[0].MESSAGE === 'INVALID_BOXWEIGHT') {
							sap.ui.core.BusyIndicator.hide();
							var ms = new FioritalMessageStrip(this.getModel("sharedi18n").getResourceBundle().getText("toastMessageErrorInvalidBoxWeight"), {
								status: 'error',
								icon: 'sap-icon://sys-cancel',
								timeout: 3000
							});
							return;
						}

						this.byId('BAPIret').showBAPIret(JSON.parse(resText));
						sap.ui.core.BusyIndicator.hide();
						return;
					}

					var ctx = oAction.getBoundContext();

					if (ctx.getObject().zplJson === "") {
						var ms = new FioritalMessageStrip(this.getModel("sharedi18n").getResourceBundle().getText("toastMessageSingleLabelDownloadError"), {
							status: 'error',
							icon: 'sap-icon://sys-cancel',
							timeout: 3000
						});
					}

					var labels = JSON.parse(ctx.getObject().zplJson);

					var countLabels = 0;

					var getdata = new Object();

					getdata.dpi = 203;
					getdata.height = 3.3;
					getdata.width = 4.1;
					getdata.accept = 'application/pdf';
					getdata.zpl = labels;

					$.ajax({
						url: '/fiorital/zplprinter',
						type: 'post',
						contentType: "application/json",
						data: JSON.stringify(getdata),
						success: function (data) {
							var ms = new FioritalMessageStrip(this.getModel("sharedi18n").getResourceBundle().getText(
								"toastMessageSingleLabelDownloadSuccess"), {
								status: 'info',
								icon: 'sap-icon://edit',
								timeout: 3000
							});

							this.__downloadPDFfromBlob(this.b64toblob(data, '', 512), "single");

						}.bind(this),
						error: function (jqXHR, textStatus, errorThrown) {

						}.bind(this)
					});

					sap.ui.core.BusyIndicator.hide();
				}.bind(this);

				var fnError = function (oError) {
					sap.ui.core.BusyIndicator.hide();
					this.getModel().resetChanges("batchGroupAPI");
				}.bind(this);

				oAction.execute().then(fnSuccess).catch(fnError);

			},

			onWgtChange: function (oEvent) {
				//-->set item as selected
				var idx = this._getIdxFromId(oEvent.getSource().getId());
				this.byId("boxMgrDialogBoxesTableId").getItems()[idx].data("isSelected", true);

				if (!this.byId("boxManagerDialogId").getModel("boxMgrModel").getProperty("/hasChanged")) {
					//->enable button
					this.byId("boxManagerDialogId").getModel("boxMgrModel").setProperty("/hasChanged", true);

					//->disable print button if sync has to be done
					this.byId("boxManagerDialogId").getModel("boxMgrModel").setProperty("/enablePrint", false);

					this.byId("synchronizeButtonId").addStyleClass("blinking");
				}
			},

			clearSelectedPallet: function () {
				this.byId("boxManagerDialogId").getModel("boxMgrModel").setProperty("/huexternalid", "");
				this.byId("boxManagerDialogPalletComboId").setSelectedKey("");
			},

			_initBoxManagerBindings: function (oEvent, oObject) {

				this.loadedData = false;
				this.byId('boxManagerCloseButton').setBusy(true);

				this.byId("boxManagerDialogId").bindElement({
					path: "/PurchaseOrder('" + oObject.docnr + "')"
				});

				this.byId("boxMgrDialogBoxesTableId").bindElement({
					path: "/PurchaseOrder('" + oObject.docnr + "')/PoItem(docnr='" + oObject.docnr + "',docpos='" + oObject.docpos + "')"
				});

				this.boxesUrl = this.getModel().sServiceUrl + "/PoItem(docnr='" + oObject.docnr + "',docpos='" + oObject.docpos + "')/Boxes";
				this.jsonModelBoxes.loadData(this.boxesUrl);

				this.byId("boxManagerDialogPalletComboId").bindElement({
					path: "/PurchaseOrder('" + oObject.docnr + "')"
				});
			},

			_initBoxManagerProperties: function (oObject) {
				this.byId("boxManagerDialogId").getModel("boxMgrModel").setProperty("/boxNumber", "1");

				if (oObject.isvariableweight === 'V' || oObject.isvariableweightbatch === 'V') {
					this.byId("boxManagerDialogId").getModel("boxMgrModel").setProperty("/totwgt", 0);
				} else {
					this.byId("boxManagerDialogId").getModel("boxMgrModel").setProperty("/totwgt", oObject.netwgt);
				}

				this.byId("boxManagerDialogId").getModel("boxMgrModel").setProperty("/isvariableweight", oObject.isvariableweight || oObject.isvariableweightbatch);
				this.byId("boxManagerDialogId").getModel("boxMgrModel").setProperty("/isvariableweightlabel", oObject.isvariableweightlabel);
				this.byId("boxManagerDialogId").getModel("boxMgrModel").setProperty("/productcode", oObject.productcode);
				this.byId("boxManagerDialogId").getModel("boxMgrModel").setProperty("/productdescr", oObject.productdescr);
				this.byId("boxManagerDialogId").getModel("boxMgrModel").setProperty("/uom", oObject.uom);
				this.byId("boxManagerDialogId").getModel("boxMgrModel").setProperty("/sizing", oObject.sizing);
				this.byId("boxManagerDialogId").getModel("boxMgrModel").setProperty("/sizingbatch", oObject.sizingbatch);
				this.byId("boxManagerDialogId").getModel("boxMgrModel").setProperty("/sizinglabel", oObject.sizinglabel);
				this.byId("boxManagerDialogId").getModel("boxMgrModel").setProperty("/sizingbatchlabel", oObject.sizingbatchlabel);
				this.byId("boxManagerDialogId").getModel("boxMgrModel").setProperty("/guid", "");

				if (oObject.enableInputWeight) { //-->override input weight enabling
					this.byId("boxManagerDialogId").getModel("boxMgrModel").setProperty("/isWeightEnabled", oObject.enableInputWeight);
				} else if (oObject.disableInputWeight) { //-->override input weight enabling
					this.byId("boxManagerDialogId").getModel("boxMgrModel").setProperty("/isWeightEnabled", false);
				} else if (this.byId("boxManagerDialogId").getModel("boxMgrModel").getProperty("/isvariableweight") === 'V') { //-->input weight is enabled if weight is Variable
					this.byId("boxManagerDialogId").getModel("boxMgrModel").setProperty("/isWeightEnabled", true);
				} else { //-->input weight is not enabled if weight is Fixed
					this.byId("boxManagerDialogId").getModel("boxMgrModel").setProperty("/isWeightEnabled", false);
				}

				//-->set property for sync button
				this.byId("boxManagerDialogId").getModel("boxMgrModel").setProperty("/hasChanged", false);

				//-->set property for pallet combo
				//this.byId("boxManagerDialogId").getModel("boxMgrModel").setProperty("/isPalletListEmpty", true);

				this._refreshMicroChartData(oObject);
			},

			formatSum: function (items) {

				try {
					return items.length;
				} catch (exc) {
					return 0;
				}

			},

			_refreshMicroChartData: function (oObject) {

				/*	//--> set micro chart values
					var iTarget = parseInt(oObject.qty, 10),
						iForecast = parseInt(iTarget + iTarget * 0.3, 10),
						iMidThrs = iTarget,
						iEndThrs = iForecast;

					this.byId("boxesMicroChartId").setForecastValue(iForecast);
					this.byId("boxesMicroChartThreshMiddleId").setValue(iMidThrs);
					this.byId("boxesMicroChartThreshEndId").setValue(iEndThrs);*/
			},

			_getIdxFromId: function (sId) {
				return sId.split("-").pop();
			},

			sizingFormatter: function (sizing300, sizing023) {
				if (sizing023 !== "") {
					return sizing023;
				} else {
					return sizing300;
				}
			},

			visibleSizing: function (sizing300, sizing023) {
				if (sizing023 !== "" || sizing300 !== "") {
					return true;
				} else {
					return false;
				}
			},

			onTableCheckboxPress: function (evt) {
				var selectedBoxes = evt.getSource().getSelectedItems().length;
				this.getModel("SELECTED").setProperty("/boxes", selectedBoxes);

				if (selectedBoxes !== 1) {
					this.getModel("SELECTED").setProperty("/numberOfLabels", 1);
				}
			},

			guidButtonPress: function (evt) {
				this.byId("guidPopover").openBy(evt.getSource());
			},

			onGuidPopoverClose: function (evt) {
				this.byId("guidPopover").close();
			},

			onSearchBox: function (evt) {
				this.byId("searchFieldWeight").setValue("");
				this.byId("searchFieldPallet").setValue("");

				if (evt.getParameter('value') !== "") {
					var filter = new Filter({
						path: 'guid',
						operator: FilterOperator.Contains,
						value1: evt.getParameter('value')
					});
					this.byId("boxMgrDialogBoxesTableId").getBinding("items").filter(filter);
				} else {
					this.byId("boxMgrDialogBoxesTableId").getBinding("items").filter();
				}
			},

			onSearchWeight: function (evt) {
				this.byId("searchFieldBox").setValue("");
				this.byId("searchFieldPallet").setValue("");

				if (evt.getParameter('value') !== "") {
					var filter = new Filter({
						path: 'boxweight',
						operator: FilterOperator.EQ,
						value1: parseFloat(evt.getParameter('value').replace(",", "."))
					});
					this.byId("boxMgrDialogBoxesTableId").getBinding("items").filter(filter);
				} else {
					this.byId("boxMgrDialogBoxesTableId").getBinding("items").filter();
				}
			},

			onSearchPallet: function (evt) {
				this.byId("searchFieldBox").setValue("");
				this.byId("searchFieldWeight").setValue("");

				if (evt.getParameter('value') !== "") {
					var filter = new Filter({
						path: 'palletguid',
						operator: FilterOperator.Contains,
						value1: evt.getParameter('value')
					});
					this.byId("boxMgrDialogBoxesTableId").getBinding("items").filter(filter);
				} else {
					this.byId("boxMgrDialogBoxesTableId").getBinding("items").filter();
				}
			},

			copyToClipboard: function (str) {
				var el = document.createElement('textarea');
				el.value = str;
				document.body.appendChild(el);
				el.select();
				document.execCommand('copy');
				document.body.removeChild(el);
			},

			askForData: function (evt) {
				// GET_BARCODE_TEXT
				var oAction = this.getModel().bindContext("/Hu(hunr='" + evt.getSource().getBindingContext("BOXES").getObject().hunr +
					"')/com.sap.gateway.default.zfioapi.v0001.GET_BARCODE_TEXT(...)");

				oAction.execute().then(function () {
					this.copyToClipboard(oAction.getBoundContext().getProperty("barcode"));

					var ms = new FioritalMessageStrip(this.getModel("sharedi18n").getResourceBundle().getText("toastMessageBarcodeCopied"), {
						status: 'info',
						icon: 'sap-icon://sys-enter',
						timeout: 3000
					});
				}.bind(this)).catch(function (oError) {

				}.bind(this));
			},

			onRangeSelection: function () {
				var from = this.getModel("SELECTED").getProperty("/from"),
					to = this.getModel("SELECTED").getProperty("/to");

				var items = this.byId("boxMgrDialogBoxesTableId").getItems();
				for (var i = 0; i < items.length; i++) {
					if (i >= from - 1 && i <= to - 1) {
						items[i].setSelected(true);
					} else {
						items[i].setSelected(false);
					}
				}
			},

			onMoveBoxPress: function (oEvent) {
				sap.ui.core.BusyIndicator.show(0);
				this._loadPalletPopoverJsonModel(oEvent);
			},

			_loadPalletPopoverJsonModel: function (oEvent) {
				if (this.getId().includes("PurchaseOrderDetailLabelAppPageId")) {
					var header = {
						"Z-Vendor-Token": this.getModel("userParamJsonModel").getProperty("/token")
					};
				}
				//-->load data for popover
				var sUrl = oEvent.getSource().getModel().sServiceUrl.substring(0, oEvent.getSource().getModel().sServiceUrl.length - 1) + this.byId(
					"boxManagerDialogId").getBindingContext().getPath() + "/Pallets";
				var palletJsonModel = new sap.ui.model.json.JSONModel();
				palletJsonModel.loadData(sUrl, null, true, 'GET', false, true, header);

				this.openPalletToChoicePopover = oEvent.getSource();

				palletJsonModel.attachRequestCompleted(this._palletJsonModelRequestCompleted.bind(this));
				this.byId("choosePalletMoveToSelectionId").setModel(palletJsonModel, 'palletJsonModel');
			},

			_palletJsonModelRequestCompleted: function (oEvent) {
				this.byId("choosePalletBoxMoveToPopoverId").openBy(this.openPalletToChoicePopover);
				sap.ui.core.BusyIndicator.hide();
			},

			onMoveBoxToPalletPress: function (oEvent) {
				sap.ui.core.BusyIndicator.show(0);
				//-->prepare data
				var sPalletToId = this.byId("choosePalletMoveToSelectionId").getSelectedKey(),
					aSelectedBoxes = this.byId("boxMgrDialogBoxesTableId").getSelectedItems(),
					aSelectedBoxesId = [];

				if (aSelectedBoxes.length === 0) {
					var sMessage = this.getModel("sharedi18n").getResourceBundle().getText("toastMessageNoBoxSelected");
					var ms = new FioritalMessageStrip(sMessage, {
						status: 'error',
						icon: 'sap-icon://sys-cancel',
						timeout: 3000
					});
					sap.ui.core.BusyIndicator.hide();
					return;
				}

				aSelectedBoxes.forEach(function (oBox) {
					var oItem = {};
					oItem = oBox.getBindingContext("BOXES").getObject();
					aSelectedBoxesId.push(oItem);
				});

				//-->call action
				var oPurchaseOrderItemContext = this.byId("boxMgrDialogBoxesTableId").getBindingContext();
				var oModel = this.getModel();
				var oCanonicalContext = new sap.ui.model.Context(oModel, oPurchaseOrderItemContext.getCanonicalPath());
				var oAction = oModel.bindContext("com.sap.gateway.default.zfioapi.v0001.BOX_MASS_CHANGE_PALLET(...)", oCanonicalContext);

				oAction.setParameter("JSON_BOXES", JSON.stringify(aSelectedBoxesId));
				oAction.setParameter("TO_PALLET", sPalletToId);

				var fnSuccess = function (oData) {
					sap.ui.core.BusyIndicator.hide();

					var sMessage = this.getModel("sharedi18n").getResourceBundle().getText("toastMessageBoxMoved", sPalletToId);
					var ms = new FioritalMessageStrip(sMessage, {
						status: 'info',
						icon: 'sap-icon://move',
						timeout: 3000
					});

					this.byId("boxMgrDialogBoxesTableId").removeSelections();

					//--> refresh data
					this.jsonModelBoxes.loadData(this.boxesUrl);

					sap.ui.core.BusyIndicator.hide();
				}.bind(this);

				var fnError = function (oError) {
					sap.ui.core.BusyIndicator.hide();
					this.getModel().resetChanges("batchGroupAPI");
				}.bind(this);

				oAction.execute().then(fnSuccess).catch(fnError);

				//-->close and reset bind context
				this.byId("choosePalletBoxMoveToPopoverId").close();
				this.byId("choosePalletMoveToSelectionId").setBindingContext(null);
			},

			b64toblob: function (b64Data, contentType, sliceSize) {
				var byteCharacters = atob(b64Data);
				var byteArrays = [];

				for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
					var slice = byteCharacters.slice(offset, offset + sliceSize);

					var byteNumbers = new Array(slice.length);
					for (var i = 0; i < slice.length; i++) {
						byteNumbers[i] = slice.charCodeAt(i);
					}

					var byteArray = new Uint8Array(byteNumbers);
					byteArrays.push(byteArray);
				}

				var blob = new Blob(byteArrays, {
					type: contentType
				});
				return blob;
			},

			__downloadPDFfromBlob: function (blob, type) {
				var filename;
				switch (type) {
				case "multi":
					filename = 'multilabel.pdf';
					break;
				case "single":
					filename = 'singlelabel.pdf';
					break;
				case "multiPDFPlt":
					filename = 'Multipallet.pdf';
					break;
				}

				url = window.URL.createObjectURL(blob);
				var a = document.createElement('a');
				a.style.display = 'none';
				a.href = url;
				a.download = filename;
				document.body.appendChild(a);
				a.click();
				window.URL.revokeObjectURL(url);
			},

			valueStateWeightInput: function (boxweight) {
				if (boxweight === 0.000 || boxweight === undefined || boxweight === null || boxweight === "" || boxweight === "0.000") {
					return "Error";
				}
			},

			onPasteClipboard: function (evt) {
				navigator.clipboard.readText().then(function (clipText) {

					var separator = '';
					var index = 0;

					if (clipText.search(';') >= 0) {
						separator = ';';
					} else if (clipText.search('\r\n') >= 0) {
						separator = '\r\n';
					} else if (clipText.search('\n') >= 0) {
						separator = '\n';
					} else if (clipText.search('\t') >= 0) {
						separator = '\t';
					}

					if (separator != '') {
						var weights = clipText.split(separator);

						if (this.byId("boxMgrDialogBoxesTableId").getSelectedItems().length > 0) {
							this.byId("boxMgrDialogBoxesTableId").getSelectedItems().forEach(function (itm) {

								if (weights[index] != '' && weights[index] != null && weights[index] != undefined) {
									if (isNaN(weights[index].replace(',', '.')) == false) {
										itm.getModel('BOXES').setProperty(itm.getBindingContext('BOXES').sPath + '/boxweight', parseFloat(weights[index].replace(',', '.')));
									} else {
										itm.getModel('BOXES').setProperty(itm.getBindingContext('BOXES').sPath + '/boxweight', 0);
									}
								}

								index = index + 1;
							}.bind(this));
						} else {
							this.byId("boxMgrDialogBoxesTableId").getItems().forEach(function (itm) {
								if (weights[index] != '' && weights[index] != null && weights[index] != undefined) {
									if (isNaN(weights[index].replace(',', '.')) == false) {
										itm.getModel('BOXES').setProperty(itm.getBindingContext('BOXES').sPath + '/boxweight', parseFloat(weights[index].replace(',', '.')));
									} else {
										itm.getModel('BOXES').setProperty(itm.getBindingContext('BOXES').sPath + '/boxweight', 0)
									}
								}

								index = index + 1;
							}.bind(this));
						}

						if (!this.byId("boxManagerDialogId").getModel("boxMgrModel").getProperty("/hasChanged")) {
							//->enable button
							this.byId("boxManagerDialogId").getModel("boxMgrModel").setProperty("/hasChanged", true);

							//->disable print button if sync has to be done
							this.byId("boxManagerDialogId").getModel("boxMgrModel").setProperty("/enablePrint", false);

							this.byId("synchronizeButtonId").addStyleClass("blinking");
						}

					}

				}.bind(this));

			}

		});

		return BoxManager;

	},
	true);