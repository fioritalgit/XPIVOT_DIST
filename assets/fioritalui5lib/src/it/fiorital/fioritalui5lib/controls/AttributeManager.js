sap.ui.define([
		"jquery.sap.global",
		"sap/ui/core/XMLComposite",
		"sap/m/MessageToast",
		"sap/m/MessageBox",
		"sap/ui/model/Filter",
		"sap/ui/model/FilterOperator"
	],
	function (jQuery, XMLComposite, MessageToast, MessageBox, Filter, FilterOperator) {
		"use strict";

		var TextManager = XMLComposite.extend("it.fiorital.fioritalui5lib.controls.AttributeManager", {
			metadata: {
				properties: {
					title: {
						type: "string",
						defaultValue: "Attributes Manager"
					},

					batch: {
						type: "string",
						defaultValue: ""
					}
				},
				events: {
					onClose: {
						parameters: {
							activechanges: {
								type: "string"
							}
						}
					}

				},

				aggregations: {
					itemsLaw: {
						type: "sap.m.CustomListItem",
						multiple: true,
						forwarding: {
							idSuffix: "--attributeManagerListLaw",
							aggregation: "items",
							forwardBinding: true,
							invalidate: true
						}
					},
					itemsOther: {
						type: "sap.m.CustomListItem",
						multiple: true,
						forwarding: {
							idSuffix: "--attributeManagerListOther",
							aggregation: "items",
							forwardBinding: true,
							invalidate: true
						}
					}
				},
				defaultAggregation: "items"
			},

			showMulti: function (hasSuggestions) {
				if (hasSuggestions === 'S') {
					return false;
				} else {
					return true;
				}
			},

			/*			hideMulti: function (hasSuggestions) {
							return !hasSuggestions;
						},*/

			init: function () {

				//--> super
				XMLComposite.prototype.init.apply(this, arguments);

				this.activeChanges = false;

				this._attributeManagerListLaw = this.byId("attributeManagerListLaw");
				this._attributeManagerListOther = this.byId("attributeManagerListOther");
				this._attributeManagerPopover = this.byId("attributeManagerPopover");

				this.localJson = new sap.ui.model.json.JSONModel();
				this.setModel(this.localJson, 'LOCALJSON');

				this.localdata = new Object();
			},

			applySettings: function (mSettings, oScope) {

				if (mSettings.itemsLaw === undefined) {
					mSettings.itemsLaw = {};
				}

				if (mSettings.itemsOther === undefined) {
					mSettings.itemsOther = {};
				}

				mSettings.itemsLaw.template = this.getAggregation("itemsLaw")[0].clone();
				mSettings.itemsOther.template = this.getAggregation("itemsOther")[0].clone();

				//--> super
				XMLComposite.prototype.applySettings.apply(this, arguments);
			},

			openBy: function (control, explicitModelName) {

				this.activeChanges = false;

				//--> if provided override default model
				if (explicitModelName !== undefined & explicitModelName !== '') {
					this.setModel(this.getModel(explicitModelName));
				}

				this._attributeManagerPopover.openBy(control);
			},

			openDirectRebind: function (evt, itemsLaw, itemsOther, explicitModelName, filter1, filter2, readOnly) {

				this.activeChanges = false;
				
				if (readOnly !== undefined) {
					this.localdata.readOnly = readOnly;
				} else {
					this.localdata.readOnly = false;
				}

				this.localJson.setData(this.localdata);

				//--> if provided override default model
				if (explicitModelName !== undefined & explicitModelName !== '') {
					this.setModel(this.getModel(explicitModelName));
				}

				if (filter1 === undefined) {
					this._attributeManagerListLaw.bindAggregation("items", {
						path: itemsLaw,
						parameters: {
							$$updateGroupId: 'directGroup'
						},
						template: this._attributeManagerListLaw.getBindingInfo('items').template
					});
				} else {
					this._attributeManagerListLaw.bindAggregation("items", {
						path: itemsLaw,
						filters: filter1,
						parameters: {
							$$updateGroupId: 'directGroup'
						},
						template: this._attributeManagerListLaw.getBindingInfo('items').template
					});
				}

				if (filter2 === undefined) {
					this._attributeManagerListOther.bindAggregation("items", {
						path: itemsOther,
						parameters: {
							$$updateGroupId: 'directGroup'
						},
						template: this._attributeManagerListOther.getBindingInfo('items').template
					});
				} else {
					this._attributeManagerListOther.bindAggregation("items", {
						path: itemsOther,
						filters: filter2,
						parameters: {
							$$updateGroupId: 'directGroup'
						},
						template: this._attributeManagerListOther.getBindingInfo('items').template
					});
				}

				this._attributeManagerPopover.openBy(evt.getSource());

			},

			openByBatchId: function (evt, batchId, matnr, werks, explicitModelName, explicitObligatoryCharacts, readOnly) {

				this.activeChanges = false;

				if (readOnly !== undefined) {
					this.localdata.readOnly = readOnly;
				} else {
					this.localdata.readOnly = false;
				}

				this.localJson.setData(this.localdata);

				//--> if provided override default model
				if (explicitModelName !== undefined & explicitModelName !== '') {
					this.setModel(this.getModel(explicitModelName));
				}

				if (explicitObligatoryCharacts !== undefined) {

					var singleCharFilters = [];
					var singleCharFiltersNE = [];
					explicitObligatoryCharacts.forEach(function (schar) {
						var scharFilter = new sap.ui.model.Filter({
							path: 'charactName',
							operator: 'EQ',
							value1: schar
						});

						singleCharFilters.push(scharFilter);

						var scharFilter = new sap.ui.model.Filter({
							path: 'charactName',
							operator: 'NE',
							value1: schar
						});

						singleCharFiltersNE.push(scharFilter);
					});

					var fltEQ = new sap.ui.model.Filter({
						filters: singleCharFilters,
						and: false
					});

					var fltNE = new sap.ui.model.Filter({
						filters: singleCharFiltersNE,
						and: true
					});

				} else {

					var scharFilter = new sap.ui.model.Filter({
						path: 'charactGroup',
						operator: 'EQ',
						value1: 'ZFISHLAW'
					});

					var fltEQ = [];
					fltEQ.push(scharFilter);

					var scharFilter = new sap.ui.model.Filter({
						path: 'charactGroup',
						operator: 'NE',
						value1: 'ZFISHLAW'
					});

					var fltNE = [];
					fltNE.push(scharFilter);
				}

				var sBatchNumber = "batchnr='" + batchId + "',";
				var sProductCode = "productcode='" + matnr + "',";
				var sPlant = "plant='" + werks + "'";
				var sPath = "/Batch(" + sBatchNumber + sProductCode + sPlant + ")/Attribute";

				this._attributeManagerListLaw.bindAggregation("items", {
					path: sPath,
					filters: fltEQ,
					parameters: {
						$$updateGroupId: 'directGroup'
					},
					template: this._attributeManagerListLaw.getBindingInfo('items').template
				});

				this._attributeManagerListOther.bindAggregation("items", {
					path: sPath,
					filters: fltNE,
					parameters: {
						$$updateGroupId: 'directGroup'
					},
					template: this._attributeManagerListOther.getBindingInfo('items').template
				});

				this._attributeManagerPopover.openBy(evt.getSource());

			},
            
            onMultiChange: function (evt) {
				this.activeChanges = true;
			},

			openByEvent: function (evt, readOnly) {

				this.activeChanges = false;

				if (readOnly !== undefined) {
					this.localdata.readOnly = readOnly;
				} else {
					this.localdata.readOnly = false;
				}

				this.localJson.setData(this.localdata);

				var ctx = evt.getSource().getBindingContext();
				this._eventSource = evt.getSource();

				if (this._attributeManagerPopover.getBindingContext() !== undefined && this._attributeManagerPopover.getBindingContext().getPath() ===
					ctx.getPath()) {
					this._attributeManagerPopover.getBindingContext().refresh();
				} else {
					
					this.getBinding('itemsLaw').setContext(evt.getSource().getBindingContext());
					this.getBinding('itemsOther').setContext(evt.getSource().getBindingContext());
					
					this._attributeManagerPopover.bindElement({
						path: ctx.getPath(),
						parameters: {
							$$updateGroupId: 'directGroup',
							//$$groupId: 'batchGroupAPI'
						}
					});
				}

				this._attributeManagerPopover.openBy(this._eventSource);

			},

			setBatchNr: function (batchNr) {
				this.setProperty("batch", batchNr, true);
			},

			//----------------------------------------> control EVENTS
			_onSaveButtonPress: function (evt) {

				this.setBusy(true);

				var fnSuccess = function () {
					this.setBusy(false);
					this._attributeManagerPopover.close();
				}.bind(this);

				var fnError = function (oError) {
					sap.ui.core.BusyIndicator.hide();
				}.bind(this);

				this.getModel().submitBatch("batchGroupAPI").then(fnSuccess, fnError);

			},

			_onCloseButtonPress: function (evt) {

				this.fireEvent("onClose", {activechanges: this.activeChanges});
				this._attributeManagerPopover.close();
			},

			attribChange: function (evt) {

				//--> show change icon

			}

		});

		return TextManager;

	}, true);