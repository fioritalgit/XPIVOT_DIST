/*eslint-disable */

sap.ui.define([
		"jquery.sap.global",
		"sap/ui/core/XMLComposite",
		"sap/m/MessageToast",
		"it/fiorital/fioritalui5lib/utility/utilities",
		"it/fiorital/fioritalui5lib/formatter/SharedFormatter",
		"it/fiorital/fioritalui5lib/controls/FioritalMessageStrip",
		"sap/ui/model/json/JSONModel",
		"sap/ui/model/Filter",
		"sap/ui/model/FilterOperator"
	],
	function (jQuery, XMLComposite, MessageToast, SharedUtilities, SharedFormatter, FioritalMessageStrip, JSONModel, Filter, FilterOperator) {

		var HUmanager = XMLComposite.extend("it.fiorital.fioritalui5lib.controls.HuManager", {
			SharedUtilities: SharedUtilities,
			SharedFormatter: SharedFormatter,
			metadata: {
				library: "it.fiorital.fioritalui5lib",
				properties: {
					/**
					 * Hu Manager dialog title
					 */
					title: {
						type: "string",
						defaultValue: "Hu Manager"
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

				this.palletMgrDialogModel = new sap.ui.model.json.JSONModel();
				this.byId("dialogPalletManagerId").setModel(this.palletMgrDialogModel, 'palletMgrDialogModel');

				this._palletManagerDialog = this.byId("dialogPalletManagerId");
				this.QZHelper = sap.ui.core.Component.getOwnerComponentFor(this).QZHelper;

				this.jsonModeSelected = new JSONModel({
					pallets: 0,
					boxes: 0,
					from: 0,
					to: 0
				});
				this.setModel(this.jsonModeSelected, 'SELECTED');
			},

			applySettings: function (mSettings, oScope) {
				//--> super
				XMLComposite.prototype.applySettings.apply(this, arguments);
			},

			/*--PALLET MANAGER--*/
			openByEvent: function (oEvent, isNotVendor) {
				this._palletManagerDialog.setBindingContext(oEvent.getSource().getBindingContext());

				//this._loadPalletPopoverJsonModel(oEvent);

				//-->init variables and open
				this._initPalletManagerProperties();
				this._palletManagerDialog.open();
				this.isNotVendor = isNotVendor;
			},

			openPalletManagerByPurchaseOrder: function (PO, model) {

				if (model !== undefined) {
					this.setModel(model); //<--- set default model if discordant
				}

				this.byId("dialogPalletManagerId").bindElement({
					path: "/PurchaseOrder('" + PO + "')"
				});

				this._initPalletManagerProperties();

				this.byId("dialogPalletManagerId").open();
			},

			onPalletChangePress: function (oEvent) {
				sap.ui.core.BusyIndicator.show(0);

				var path = oEvent.getSource().getBindingContext().getCanonicalPath();
				this.byId("palletMgrNestedBoxesTableId").bindItems({
					path: path + '/HuChildGet',
					template: this.byId("palletMgrNestedBoxesTableId").getBindingInfo('items').template,
					length: 9999,
					parameters: {
						$select: 'huexternalid,pallet'
					},
				});

				var selectedItems = this.byId("palletMgrPalletTableId").getSelectedItems();
				selectedItems.forEach(function (item) {
					if (item.getId() !== oEvent.getSource().getId()) {
						item.setSelected(false);
					}
				});

				if (selectedItems === 0) {
					this.byId("palletManagerNestedBoxTabBarId").setEnabled(false);
					this.byId("palletMgrBoxesIconTabBarId").setSelectedKey("palletManagerAvailableBoxKey");
				} else {
					this.byId("palletManagerNestedBoxTabBarId").setEnabled(true);
				}

				oEvent.getSource().setSelected(true);

				this.getModel("SELECTED").setProperty("/pallets", this.byId("palletMgrPalletTableId").getSelectedItems().length);

				this._checkSelectedPallet();
				sap.ui.core.BusyIndicator.hide();
			},

			onPalletCheckboxPress: function (evt) {
				var selectedItems = evt.getSource().getSelectedItems().length;

				if (selectedItems === 1) {
					sap.ui.core.BusyIndicator.show(0);

					var path = evt.getSource().getSelectedItem().getBindingContext().getCanonicalPath();
					this.byId("palletMgrNestedBoxesTableId").bindItems({
						path: path + '/HuChildGet',
						template: this.byId("palletMgrNestedBoxesTableId").getBindingInfo('items').template,
						length: 9999,
						parameters: {
							$select: 'huexternalid,pallet'
						}
					});

					this.byId("palletManagerNestedBoxTabBarId").setEnabled(true);
					this._checkSelectedPallet();

					sap.ui.core.BusyIndicator.hide();
				}

				if (selectedItems === 0) {
					this.byId("palletMgrBoxesIconTabBarId").setSelectedKey("palletManagerAvailableBoxKey");
					this.byId("palletManagerNestedBoxTabBarId").setEnabled(false);
					this._checkSelectedPallet();
				}

				this.getModel("SELECTED").setProperty("/pallets", selectedItems);
			},

			onDeleteBoxPress: function (oEvent) {
				// this.selectedBoxData = oEvent.getSource().getBindingContext().getObject();
				this.bindingContext = oEvent.getSource().getBindingContext();
				sap.m.MessageBox.show(
					"Confirm box delete ?", {
						icon: sap.m.MessageBox.Icon.INFORMATION,
						title: "DELETE BOX",
						actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
						onClose: function (oAction) {
							if (oAction === 'YES') {

								sap.ui.core.BusyIndicator.show(0);

								var selectedTab = this.byId("palletMgrBoxesIconTabBarId").getSelectedKey();

								this.bindingContext.delete().then(function (oData) {

									var ms = new FioritalMessageStrip(this.getModel("sharedi18n").getResourceBundle().getText("toastMessageBoxDeleted"), {
										status: 'info',
										icon: 'sap-icon://delete',
										timeout: 3000
									});

									// 	//--> refresh data
									if (selectedTab === "palletManagerAvailableBoxKey") {
										this.byId("palletMgrAvailableBoxesTableId").getBindingContext().refresh();
									} else {
										this.byId("palletMgrNestedBoxesTableId").getBindingContext().refresh();
									}
									sap.ui.core.BusyIndicator.hide();

								}.bind(this)).catch(function (oError) {
									//--> Error
									sap.ui.core.BusyIndicator.hide();
									this.byId("dialogPalletManagerId").getModel().resetChanges("directGroup");
								}.bind(this));
							}
						}.bind(this)
					}
				);
			},

			onPalletIconTabBarSelectionChange: function (oEvent) {
				var sSelectedKey = oEvent.getParameter("selectedKey").split("--")[oEvent.getParameter("selectedKey").split("--").length - 1];
				if (sSelectedKey == "palletManagerAvailableBoxKey") {
					this.byId("dialogPalletManagerId").getModel('palletMgrDialogModel').setProperty("/isAvailableTabSelected", true);
					this.byId("dialogPalletManagerId").getModel('palletMgrDialogModel').setProperty("/isNestedTabSelected", false);

					this.byId("palletMgrAvailableBoxesTableId").removeSelections();
				} else if (sSelectedKey == "palletManagerNestedBoxKey") {
					this.byId("dialogPalletManagerId").getModel('palletMgrDialogModel').setProperty("/isAvailableTabSelected", false);
					this.byId("dialogPalletManagerId").getModel('palletMgrDialogModel').setProperty("/isNestedTabSelected", true);

					this.byId("palletMgrNestedBoxesTableId").removeSelections();
				}

				this.getModel("SELECTED").setProperty("/from", 0);
				this.getModel("SELECTED").setProperty("/to", 0);

				this._checkSelectedPallet();
				this._checkSelectedBox();
			},

			onBoxSelection: function (oEvent) {
				this._checkSelectedBox();
				this.getModel("SELECTED").setProperty("/boxes", oEvent.getSource().getSelectedItems().length);
			},

			_initPalletManagerProperties: function () {
				this.byId("palletMgrBoxesIconTabBarId").setSelectedKey("palletManagerAvailableBoxKey");

				this.byId("dialogPalletManagerId").getModel('palletMgrDialogModel').setProperty("/isAvailableTabSelected", true);
				this.byId("dialogPalletManagerId").getModel('palletMgrDialogModel').setProperty("/isNestedTabSelected", false);

				this._checkSelectedPallet();
				this._checkSelectedBox();
			},

			_checkSelectedPallet: function () {
				if (!SharedUtilities.isEmpty(this.byId("palletMgrPalletTableId").getSelectedItem())) {
					this.byId("dialogPalletManagerId").getModel('palletMgrDialogModel').setProperty("/isPalletSelected", true);
				} else {
					this.byId("dialogPalletManagerId").getModel('palletMgrDialogModel').setProperty("/isPalletSelected", false);
				}
			},

			_checkSelectedBox: function () {
				if (!SharedUtilities.isEmpty(this.byId("palletMgrAvailableBoxesTableId").getSelectedItem()) ||
					!SharedUtilities.isEmpty(this.byId("palletMgrNestedBoxesTableId").getSelectedItem())) {
					this.byId("dialogPalletManagerId").getModel('palletMgrDialogModel').setProperty("/isBoxSelected", true);
				} else {
					this.byId("dialogPalletManagerId").getModel('palletMgrDialogModel').setProperty("/isBoxSelected", false);
				}
			},

			onCreatePalletPress: function (oEvent) {
				sap.ui.core.BusyIndicator.show(0);
				//ACTION ARE ONLY LAUNCHABLE IN DEFERRED MODE. USE (...) TO DO THIS
				var oModel = this.byId("dialogPalletManagerId").getModel(),
					oPurchaseOrderContext = this.byId("dialogPalletManagerId").getBindingContext(),
					oAction = oModel.bindContext("com.sap.gateway.default.zfioapi.v0001.CREATE_PALLET(...)", oPurchaseOrderContext),
					iQty = this.byId("palletQtyId").getValue();

				oAction.setParameter("NUMBER_OF_PALLET", parseInt(iQty));

				var fnSuccess = function (oData) {
					var ms = new FioritalMessageStrip(this.getModel("sharedi18n").getResourceBundle().getText("toastMessagePalletCreated"), {
						status: 'info',
						icon: 'sap-icon://add',
						timeout: 3000
					});
					this.byId("palletMgrPalletTableId").getBindingContext().refresh();

					sap.ui.core.BusyIndicator.hide();
				}.bind(this);

				var fnError = function (oError) {
					sap.ui.core.BusyIndicator.hide();
					this.byId("dialogPalletManagerId").getModel().resetChanges("batchGroupAPI");
				}.bind(this);

				oAction.execute().then(fnSuccess).catch(fnError);
			},

			openChoosePalletQtyCreationPopover: function (oEvent) {
				this.byId("choosePalletQtyCreationPopoverId").openBy(oEvent.getSource());
			},

			onDeletePalletPress: function (oEvent) {
				this.bindingContext = oEvent.getSource().getBindingContext();
				sap.m.MessageBox.show(
					"Confirm pallet delete ?", {
						icon: sap.m.MessageBox.Icon.INFORMATION,
						title: "DELETE PALLET",
						actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
						onClose: function (oAction) {
							if (oAction === 'YES') {

								sap.ui.core.BusyIndicator.show(0);

								this.bindingContext.delete().then(function (oData) {

									var ms = new FioritalMessageStrip(this.getModel("sharedi18n").getResourceBundle().getText("toastMessagePalletDeleted"), {
										status: 'info',
										icon: 'sap-icon://delete',
										timeout: 3000
									});

									this.byId("palletMgrPalletTableId").getBindingContext().refresh();
									sap.ui.core.BusyIndicator.hide();

								}.bind(this)).catch(function (oError) {
									//--> Error
									sap.ui.core.BusyIndicator.hide();
									this.byId("dialogPalletManagerId").getModel().resetChanges("directGroup");
								}.bind(this));

							}
						}.bind(this)
					}
				);
			},

			onNestButtonPress: function (oEvent) {
				sap.ui.core.BusyIndicator.show(0);
				//ACTION ARE ONLY LAUNCHABLE IN DEFERRED MODE. USE (...) TO DO THIS
				var oModel = this.byId("dialogPalletManagerId").getModel(),
					oBindingContext = this.byId("palletMgrPalletTableId").getSelectedItem().getBindingContext(),
					aBoxesToBeNested = [],
					aSelectedBoxes = this.byId("palletMgrAvailableBoxesTableId").getSelectedItems();

				aSelectedBoxes.forEach(function (item) {
					var oItem = {};
					oItem.huexternalid = item.getBindingContext().getProperty("huexternalid");
					oItem.pallet = item.getBindingContext().getProperty("pallet");
					aBoxesToBeNested.push(oItem);
				});

				var oAction = oModel.bindContext("com.sap.gateway.default.zfioapi.v0001.MASS_NEST(...)", oBindingContext);
				oAction.setParameter("JSON_BOXES", JSON.stringify(aBoxesToBeNested));

				var fnSuccess = function (oData) {
					var sMessage = this.getModel("sharedi18n").getResourceBundle().getText("toastMessageBoxAdded", oBindingContext.getProperty(
						"huexternalid"));
					var ms = new FioritalMessageStrip(sMessage, {
						status: 'info',
						icon: 'sap-icon://delete',
						timeout: 3000
					});
					this.byId("palletMgrPalletTableId").getBindingContext().refresh();
					this.byId("palletMgrNestedBoxesTableId").getBinding("items").refresh();
					this.byId("palletMgrAvailableBoxesTableId").getBinding("items").refresh();
					sap.ui.core.BusyIndicator.hide();
				}.bind(this);

				var fnError = function (oError) {
					sap.ui.core.BusyIndicator.hide();
					this.byId("dialogPalletManagerId").getModel().resetChanges("batchGroupAPI");
				}.bind(this);

				oAction.execute().then(fnSuccess).catch(fnError);
			},

			onUnnestButtonPress: function (oEvent) {
				sap.ui.core.BusyIndicator.show(0);
				//ACTION ARE ONLY LAUNCHABLE IN DEFERRED MODE. USE (...) TO DO THIS
				var oModel = this.byId("dialogPalletManagerId").getModel(),
					oBindingContext = this.byId("palletMgrPalletTableId").getSelectedItem().getBindingContext(),
					aBoxesToBeNested = [],
					aSelectedBoxes = this.byId("palletMgrNestedBoxesTableId").getSelectedItems();

				aSelectedBoxes.forEach(function (item) {
					var oItem = {};
					oItem.huexternalid = item.getBindingContext().getProperty("huexternalid");
					oItem.pallet = item.getBindingContext().getProperty("pallet");
					aBoxesToBeNested.push(oItem);
				});

				var oAction = oModel.bindContext("com.sap.gateway.default.zfioapi.v0001.MASS_UNNEST(...)", oBindingContext);
				oAction.setParameter("JSON_BOXES", JSON.stringify(aBoxesToBeNested));

				var fnSuccess = function (oData) {
					var sMessage = this.getModel("sharedi18n").getResourceBundle().getText("toastMessageBoxRemoved", oBindingContext.getProperty(
						"huexternalid"));
					var ms = new FioritalMessageStrip(sMessage, {
						status: 'info',
						icon: 'sap-icon://delete',
						timeout: 3000
					});
					this.byId("palletMgrPalletTableId").getBindingContext().refresh();
					this.byId("palletMgrNestedBoxesTableId").getBinding("items").refresh();
					this.byId("palletMgrAvailableBoxesTableId").getBinding("items").refresh();
					sap.ui.core.BusyIndicator.hide();
				}.bind(this);

				var fnError = function (oError) {
					sap.ui.core.BusyIndicator.hide();
					this.byId("dialogPalletManagerId").resetChanges("batchGroupAPI");
				}.bind(this);

				oAction.execute().then(fnSuccess).catch(fnError);
			},

			onMoveBoxPress: function (oEvent) {
				sap.ui.core.BusyIndicator.show(0);
				//this._loadPalletPopoverJsonModel(oEvent);

				this._setPalletPopoverJsonModel(oEvent);
			},

			onMoveBoxToPalletPress: function (oEvent) {
				sap.ui.core.BusyIndicator.show(0);
				//-->prepare data
				var sPalletToId = this.byId("choosePalletMoveToSelectionId").getSelectedKey(),
					sPalletFromId = this.byId("palletMgrPalletTableId").getSelectedItem().getBindingContext().getProperty("huexternalid"),
					aSelectedBoxes = this.byId("palletMgrNestedBoxesTableId").getSelectedItems(),
					aSelectedBoxesId = [];

				aSelectedBoxes.forEach(function (oBox) {
					var oItem = {};
					oItem.huexternalid = oBox.getBindingContext().getProperty("huexternalid");
					aSelectedBoxesId.push(oItem);
				});

				//-->call action
				//ACTION ARE ONLY LAUNCHABLE IN DEFERRED MODE. USE (...) TO DO THIS
				var oContext = this.byId("palletMgrPalletTableId").getSelectedItem().getBindingContext(),
					oModel = this.byId("dialogPalletManagerId").getModel(),
					oAction = oModel.bindContext("com.sap.gateway.default.zfioapi.v0001.MASS_PALLET_CHANGE(...)", oContext);

				oAction.setParameter("JSON_BOXES", JSON.stringify(aSelectedBoxesId));
				oAction.setParameter("FROM_PALLET", sPalletFromId);
				oAction.setParameter("TO_PALLET", sPalletToId);

				var fnSuccess = function (oData) {
					//-->refresh 
					this.byId("palletMgrPalletTableId").getBindingContext().refresh();
					this.byId("palletMgrNestedBoxesTableId").getBinding("items").refresh();

					sap.ui.core.BusyIndicator.hide();

					var sMessage = this.getModel("sharedi18n").getResourceBundle().getText("toastMessageBoxMoved", sPalletToId);
					var ms = new FioritalMessageStrip(sMessage, {
						status: 'info',
						icon: 'sap-icon://move',
						timeout: 3000
					});
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

			onPalletManagerClose: function () {
				this.fireEvent("onClose", {});
				this._removeTableSelections();
				this.byId("dialogPalletManagerId").close();
			},

			onPrintPallet: function (oEvent) {
				sap.ui.core.BusyIndicator.show(0);

				var oBindingContext = oEvent.getSource().getBindingContext();
				var oModel = this.getModel();

				var oAction = oModel.bindContext("com.sap.gateway.default.zfioapi.v0001.MASS_PRINT_HU(...)", oBindingContext);

				//-->use customdata to get modified items
				var aBoxes = [],
					aAllItems = this.byId("palletMgrPalletTableId").getItems();

				this.byId("palletMgrPalletTableId").getItems().forEach(function (oItem) {
					if (oItem.isSelected()) {
						aBoxes.push(oItem.getBindingContext().getObject());
					}
				});

				oAction.setParameter("HU_JSON", JSON.stringify(aBoxes));
				oAction.setParameter("LABEL_TYPE", 'PAL');
				oAction.setParameter("LANGUAGE", '');
				oAction.setParameter("COPY_NR", '');

				var fnSuccess = function (oData) {

					var res = oAction.getBoundContext().getProperty("res");
					var resText = oAction.getBoundContext().getProperty("bapiretJson");

					this.byId("palletMgrPalletTableId").removeSelections();

					if (res === 1) {
						this.byId('BAPIret').showBAPIret(JSON.parse(resText));
						sap.ui.core.BusyIndicator.hide();
						return;
					}

					var ms = new FioritalMessageStrip(this.getModel("sharedi18n").getResourceBundle().getText("toastMessageMassPrintSuccess"), {
						status: 'info',
						icon: 'sap-icon://edit',
						timeout: 3000
					});

					var ctx = oAction.getBoundContext();
					var labels = JSON.parse(ctx.getObject().zplJson);

					labels.forEach(function (sLabel) {
						this.QZHelper.printZPL(sLabel.ZPL_STR);
					}.bind(this));

					sap.ui.core.BusyIndicator.hide();
				}.bind(this);

				var fnError = function (oError) {
					sap.ui.core.BusyIndicator.hide();
					this.getModel().resetChanges("batchGroupAPI");
				}.bind(this);

				oAction.execute().then(fnSuccess).catch(fnError);
			},

			onRangeSelection: function () {
				var from = this.getModel("SELECTED").getProperty("/from"),
					to = this.getModel("SELECTED").getProperty("/to");

				var selectedTab = this.byId("palletMgrBoxesIconTabBarId").getSelectedKey();

				if (selectedTab === "palletManagerAvailableBoxKey") {
					var items = this.byId("palletMgrAvailableBoxesTableId").getItems();
					for (var i = 0; i < items.length; i++) {
						if (i >= from - 1 && i <= to - 1) {
							items[i].setSelected(true);
						} else {
							items[i].setSelected(false);
						}
					}
				} else if (selectedTab === "palletManagerNestedBoxKey") {
					items = this.byId("palletMgrNestedBoxesTableId").getItems();
					for (i = 0; i < items.length; i++) {
						if (i >= from - 1 && i <= to - 1) {
							items[i].setSelected(true);
						} else {
							items[i].setSelected(false);
						}
					}

					this.getModel("SELECTED").setProperty("/boxes", this.byId("palletMgrNestedBoxesTableId").getSelectedItems().length);
				}
			},

			onSearchProductUnnested: function (evt) {
				this.byId("searchFieldBatchUnnested").setValue("");

				if (evt.getParameter('value') !== "") {
					var filter = new Filter({
						path: 'material',
						operator: FilterOperator.Contains,
						value1: evt.getParameter('value')
					});
					this.byId("palletMgrAvailableBoxesTableId").getBinding("items").filter(filter);
				} else {
					this.byId("palletMgrAvailableBoxesTableId").getBinding("items").filter();
				}
			},

			onSearchProductNested: function (evt) {
				this.byId("searchFieldBatchNested").setValue("");

				if (evt.getParameter('value') !== "") {
					var filter = new Filter({
						path: 'material',
						operator: FilterOperator.Contains,
						value1: evt.getParameter('value')
					});
					this.byId("palletMgrNestedBoxesTableId").getBinding("items").filter(filter);
				} else {
					this.byId("palletMgrNestedBoxesTableId").getBinding("items").filter();
				}
			},

			onSearchBatchUnnested: function (evt) {
				this.byId("searchFieldProductUnnested").setValue("");

				if (evt.getParameter('value') !== "") {
					var filter = new Filter({
						path: 'batch',
						operator: FilterOperator.Contains,
						value1: evt.getParameter('value')
					});
					this.byId("palletMgrAvailableBoxesTableId").getBinding("items").filter(filter);
				} else {
					this.byId("palletMgrAvailableBoxesTableId").getBinding("items").filter();
				}
			},

			onSearchBatchNested: function (evt) {
				this.byId("searchFieldProductNested").setValue("");

				if (evt.getParameter('value') !== "") {
					var filter = new Filter({
						path: 'batch',
						operator: FilterOperator.Contains,
						value1: evt.getParameter('value')
					});
					this.byId("palletMgrNestedBoxesTableId").getBinding("items").filter(filter);
				} else {
					this.byId("palletMgrNestedBoxesTableId").getBinding("items").filter();
				}
			},

			_removeTableSelections: function () {
				this.byId("palletMgrPalletTableId").removeSelections();
				this.byId("palletMgrAvailableBoxesTableId").removeSelections();
				this.byId("palletMgrNestedBoxesTableId").removeSelections();
			},

			_setPalletPopoverJsonModel: function (oEvent) {
				var oPalletItems = this.byId("palletMgrPalletTableId").getItems(),
					sSelectedPalletId = this.byId("palletMgrPalletTableId").getSelectedItem().getBindingContext().getProperty("huexternalid"),
					aPalletItemsData = [];
				oPalletItems.forEach(function (oPalletItem) {
					if (sSelectedPalletId !== oPalletItem.getBindingContext().getProperty("huexternalid")) { //-->DO NOT add selected pallet to list
						aPalletItemsData.push(oPalletItem.getBindingContext().getObject());
					}
				});
				var palletJsonModel = new sap.ui.model.json.JSONModel(aPalletItemsData);
				this.byId("choosePalletMoveToSelectionId").setModel(palletJsonModel, 'palletJsonModel');

				this.byId("choosePalletBoxMoveToPopoverId").openBy(oEvent.getSource());
				sap.ui.core.BusyIndicator.hide();
			},

			_loadPalletPopoverJsonModel: function (oEvent) {
				//-->load data for popover
				var sUrl = oEvent.getSource().getModel().sServiceUrl.substring(0, oEvent.getSource().getModel().sServiceUrl.length - 1) + this.byId(
					"dialogPalletManagerId").getBindingContext().getPath() + "/Pallets";
				var palletJsonModel = new sap.ui.model.json.JSONModel();
				palletJsonModel.loadData(sUrl);

				this.openPalletToChoicePopover = oEvent.getSource();

				palletJsonModel.attachRequestCompleted(this._palletJsonModelRequestCompleted.bind(this));
				this.byId("choosePalletMoveToSelectionId").setModel(palletJsonModel, 'palletJsonModel');
			},

			_palletJsonModelRequestCompleted: function (oEvent) {
				this.byId("choosePalletBoxMoveToPopoverId").openBy(this.openPalletToChoicePopover);
				sap.ui.core.BusyIndicator.hide();
			},

			onPalletPDFPress: function (oEvent) {
				sap.ui.core.BusyIndicator.show(0);

				var oPurchaseOrderContext = oEvent.getSource().getBindingContext();
				var oModel = this.getModel();

				var oAction = oModel.bindContext("com.sap.gateway.default.zfioapi.v0001.MASS_PRINT_HU(...)", oPurchaseOrderContext);

				//-->use customdata to get modified items
				var aPallets = [];

				this.byId("palletMgrPalletTableId").getItems().forEach(function (oItem) {
					if (oItem.isSelected()) {
						aPallets.push(oItem.getBindingContext().getObject());
					}
				});

				oAction.setParameter("HU_JSON", JSON.stringify(aPallets));
				oAction.setParameter("LABEL_TYPE", 'PLT');
				oAction.setParameter("LANGUAGE", 'IT');
				oAction.setParameter("COPY_NR", '1');

				var fnSuccess = function (oData) {

					var res = oAction.getBoundContext().getProperty("res");
					var resText = oAction.getBoundContext().getProperty("bapiretJson");

					if (res === 1) {
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

					var countLabels = 0;

					var getdata = new Object();

					getdata.dpi = 203;
					getdata.height = 2.8;
					getdata.width = 4;
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

							this.__downloadPDFfromBlob(this.b64toblob(data, '', 512), "multiPDFPlt");

						}.bind(this),
						error: function (jqXHR, textStatus, errorThrown) {

							var ms = new FioritalMessageStrip(this.getModel("sharedi18n").getResourceBundle().getText(
								"toastMessageMultiLabelDownloadError"), {
								status: 'error',
								icon: 'sap-icon://sys-cancel',
								timeout: 3000
							});

						}.bind(this)
					});

					// labels.forEach(function (sLabel) {

					// 	var oReq = new XMLHttpRequest();

					// 	if (this.isNotVendor) {
					// 		oReq.open("POST", "/fiorital/zlabelary/v1/printers/8dpmm/labels/4x2.8/", true);
					// 	} else {
					// 		oReq.open("POST", "/labelary/v1/printers/8dpmm/labels/4x2.8/", true);

					// 		oReq.responseType = 'blob';
					// 		oReq.setRequestHeader('Accept', 'application/pdf');
					// 		oReq.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
					// 	}

					// 	oReq.onload = function (oEvent) {
					// 		var blob;
					// 		var url;

					// 		if (typeof (oReq.response) !== "object") {
					// 			fetch('data:application/pdf;base64,' + oReq.response).then(function (response) {
					// 				return response.blob();
					// 			}.bind(this)).then(function (blob) {
					// 				this.__downloadPDFfromBlob(blob, "multi");
					// 			}.bind(this));
					// 		} else {
					// 			if (oReq.response.type === "text/html") {
					// 				oReq.response.text().then(function (text) {
					// 					fetch('data:application/pdf;base64,' + text).then(function (response) {
					// 						return response.blob();
					// 					}.bind(this)).then(function (blob) {
					// 						this.__downloadPDFfromBlob(blob, "multiPDFPlt");
					// 					}.bind(this));
					// 				});
					// 			} else {
					// 				this.__downloadPDFfromBlob(oReq.response, "multiPDFPlt");
					// 			}
					// 		}
					// 	}.bind(this);

					// 	var body = sLabel.ZPL_STR;

					// 	oReq.send(body);
					// }.bind(this));

					// var ms = new FioritalMessageStrip(this.getModel("sharedi18n").getResourceBundle().getText(
					// 	"toastMessageMultiLabelDownloadSuccess"), {
					// 	status: 'info',
					// 	icon: 'sap-icon://edit',
					// 	timeout: 3000
					// });

					sap.ui.core.BusyIndicator.hide();
				}.bind(this);

				var fnError = function (oError) {
					sap.ui.core.BusyIndicator.hide();
					this.getModel().resetChanges("batchGroupAPI");
				}.bind(this);

				oAction.execute().then(fnSuccess).catch(fnError);
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

			onPalletMassDelPress: function (oEvent) {
				sap.ui.core.BusyIndicator.show(0);

				var oPurchaseOrderContext = oEvent.getSource().getBindingContext();
				var oModel = this.getModel();

				var oAction = oModel.bindContext("com.sap.gateway.default.zfioapi.v0001.MASS_PALLET_DELETE(...)", oPurchaseOrderContext);

				//-->use customdata to get modified items
				var aPallets = [];

				this.byId("palletMgrPalletTableId").getItems().forEach(function (oItem) {
					if (oItem.isSelected()) {
						var obj = oItem.getBindingContext().getObject();

						var newLine = {
							"hunr": obj.hunr,
							"huexternalid": obj.huexternalid
						};
						aPallets.push(newLine);
					}
				});

				oAction.setParameter("PALLETS_JSON", JSON.stringify(aPallets));

				var fnSuccess = function (oData) {
					var sMessage = "Pallets selected removed!"
					var ms = new FioritalMessageStrip(sMessage, {
						status: 'info',
						icon: 'sap-icon://delete',
						timeout: 3000
					});
					this.byId("palletMgrPalletTableId").getBindingContext().refresh();
					this.byId("palletMgrNestedBoxesTableId").getBinding("items").refresh();
					this.byId("palletMgrAvailableBoxesTableId").getBinding("items").refresh();
					this.byId("purchaseOrderDetailTableId").getBinding("items").refresh();

					sap.ui.core.BusyIndicator.hide();
				}.bind(this);

				var fnError = function (oError) {
					sap.ui.core.BusyIndicator.hide();
					this.byId("dialogPalletManagerId").resetChanges("batchGroupAPI");
				}.bind(this);

				oAction.execute().then(fnSuccess).catch(fnError);

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

			_resetDialog: function () {
					this.byId("palletMgrPalletTableId").removeSelections();
					var oModel = new sap.ui.model.json.JSONModel({
						isAvailableTabSelected: true,
						isNestedTabSelected: false,
						isPalletSelected: false
					});
					this._oView.setModel(oModel, "palletMgrDialogModel");
				}
				/*--END PALLET MANAGER--*/

		});

		return HUmanager;

	}, true);