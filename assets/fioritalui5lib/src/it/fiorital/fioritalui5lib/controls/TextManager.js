sap.ui.define([
		"jquery.sap.global",
		"sap/ui/core/XMLComposite",
		"sap/m/MessageToast",
		"sap/m/MessageBox"
	],
	function (jQuery, XMLComposite, MessageToast, MessageBox) {

		var TextManager = XMLComposite.extend("it.fiorital.fioritalui5lib.controls.TextManager", {
			metadata: {
				library: "it.fiorital.fioritalui5lib",
				properties: {
					/**
					 * TextManager's popover title
					 */
					title: {
						type: "string",
						defaultValue: "Text Manager"
					}
				},
				events: {
					onClose: {
						parameters: {
							saved: {
								type: "boolean"
							}
						}
					}

				},
				aggregations: {
					items: {
						type: "sap.m.CustomListItem",
						multiple: true,
						forwarding: {
							idSuffix: "--textManagerList",
							aggregation: "items",
							forwardBinding: true,
							invalidate: true
						}
					}
				},
				defaultAggregation: "items"
			},

			init: function () {

				//--> super
				XMLComposite.prototype.init.apply(this, arguments);

				this._textManagerList = this.byId("textManagerList");
				this._textManagerPopover = this.byId("textManagerPopover");
				this._textManagerPopover.setModel(new sap.ui.model.json.JSONModel({
					isEnabled: true
				}), "editableModel");
			},

			applySettings: function (mSettings, oScope) {
				mSettings.items.template = this.getAggregation("items")[0].clone();

				//--> super
				XMLComposite.prototype.applySettings.apply(this, arguments);
			},

			openBy: function (control, editable) {
				this._textManagerPopover.openBy(control);
				if (editable === false) {
					this._textManagerPopover.getModel("editableModel").setProperty("/isEnabled", false);
				} else {
					this._textManagerPopover.getModel("editableModel").setProperty("/isEnabled", true);
				}
			},

			openDirectRebind: function (evt, directPath, explicitModelName, filter, editable) {

				//--> if provided override default model
				if (explicitModelName !== undefined & explicitModelName !== '') {
					this.setModel(this.getModel(explicitModelName));
				}

				if (filter === undefined) {
					this._textManagerPopover.bindElement({
						path: directPath,
						parameters: {
							$$updateGroupId: "batchGroupAPI"
						}
					});
				} else {
					this._textManagerPopover.bindElement({
						path: directPath,
						filters: filter,
						parameters: {
							$$updateGroupId: "batchGroupAPI"
						}
					});
				}

				this._textManagerPopover.openBy(evt.getSource());
				if (editable === false) {
					this._textManagerPopover.getModel("editableModel").setProperty("/isEnabled", false);
				} else {
					this._textManagerPopover.getModel("editableModel").setProperty("/isEnabled", true);
				}
			},

			openByEvent: function (evt, editable) {

				var ctx = evt.getSource().getBindingContext();

				this.getBinding('items').setContext(evt.getSource().getBindingContext());
				this._textManagerPopover.bindElement({
					path: ctx.getPath(),
					parameters: {
						$$updateGroupId: "batchGroupAPI"
					}
				});

				this._textManagerPopover.openBy(evt.getSource());
				if (editable === false) {
					this._textManagerPopover.getModel("editableModel").setProperty("/isEnabled", false);
				} else {
					this._textManagerPopover.getModel("editableModel").setProperty("/isEnabled", true);
				}
			},

			bindItems: function (path) {
				this._textManagerList.bindItems({
					path: path,
					template: this.byId("listTemplate")
				});
			},

			//----------------------------------------> control EVENTS
			_onSaveButtonPress: function (evt) {

				this.setBusy(true);

				var fnSuccess = function () {
					this.setBusy(false);
					this.fireEvent("onClose", {
						saved: true
					});
					this._textManagerPopover.close();
				}.bind(this);

				var fnError = function (oError) {
					sap.ui.core.BusyIndicator.hide();
				}.bind(this);

				this.getModel().submitBatch("batchGroupAPI").then(fnSuccess, fnError);
			},

			_onCloseButtonPress: function (evt) {
				this._textManagerList.getBinding("items").resetChanges();
				this.fireEvent("onClose", {
					saved: false
				});
				this._textManagerPopover.close();
			},

			textChange: function (evt) {

				//--> show change icon
				evt.getSource().getParent().getParent().getParent().getAggregation('items')[2].getAggregation('items')[0].setVisible(true);

			},
			
			hideModification: function(date){
				if(date === '' || date === null || date === undefined){
					return false;
				}else{
					return true;
				}
			}

		});

		return TextManager;

	}, true);