sap.ui.define(["jquery.sap.global", "./../library", "sap/ui/core/XMLComposite"],
	function (jQuery, library, XMLComposite) {
		"use strict";

		var MessageOutputManager = XMLComposite.extend("it.fiorital.fioritalui5lib.controls.MessageOutputManagerDirect", {
			metadata: {
				library: "it.fiorital.fioritalui5lib",
				properties: {
					title: {
						type: "string",
						defaultValue: "Message Output Manager"
					},
					callerObjectCaption: {
						type: "string",
						defaultValue: ""
					}
				}
			},

			init: function () {
				//--> super
				XMLComposite.prototype.init.apply(this, arguments);

				this._messageList = this.byId("listMessage");
				this._messageList.setBindingContext(null);

				this._messageOutputPopover = this.byId("popoverMessageOutputDirect");

			},

			applySettings: function (mSettings, oScope) {
				// mSettings.messageItems.template = this.getAggregation("messageItems")[0].clone();
				XMLComposite.prototype.applySettings.apply(this, arguments);
			},

			openDirectRebind: function (evt, directPath, explicitModelName) {
				//--> if provided override default model
				if (explicitModelName !== undefined & explicitModelName !== '') {
					this.setModel(this.getModel(explicitModelName));
				}

				this._messageList.setBindingContext(new sap.ui.model.Context(this.getModel(), directPath));

				this._messageOutputPopover.openBy(evt.getSource());
			},

		});

		MessageOutputManager.prototype.openBy = function (control) {
			this.byId("popoverMessageOutputDirect").openBy(control);

			if (this.byId("listMessage").getBinding("items").isSuspended) {
				this.byId("listMessage").getBinding("items").resume();
			}
		};

		MessageOutputManager.prototype.bindItems = function (pathItems, pathLogItems) {
			this.byId("listMessage").bindItems({
				path: pathItems,
				template: this.byId("listTemplate")
			});

			this.byId("listLogs").bindItems({
				path: pathLogItems,
				template: this.byId("listTemplate")
			});
		};

		MessageOutputManager.prototype.refresh = function () {
			this.byId("listMessage").getBinding("items").refresh();
			this.byId("listLogs").getBinding("logItems").refresh();
		};

		MessageOutputManager.prototype._getInternalist = function () {
			return this.byId("listMessage");
		};

		MessageOutputManager.prototype._onCloseButtonPress = function () {

			this._backToMessages();
			this.byId("popoverMessageOutputDirect").close();
		};

		MessageOutputManager.prototype._onMessagePress = function (oEvent) {

			this.byId("listLogs").setBindingContext(oEvent.getSource().getBindingContext());

			var oBindingInfo = {
				path: "NastLogs",
				parameters: {
					$$updateGroupId: "directGroup",
					$$groupId: "directGroup"
				},
				template: this.byId("LogsColumnListItemId")
			};

			this.byId("listLogs").bindAggregation("items", oBindingInfo);

			if (this.byId("listLogs").getBinding("items").isSuspended() === true) {
				this.byId("listLogs").getBinding("items").resume();
			}

			this.byId("listMessage").setVisible(false);
			this.byId("listLogs").setVisible(true);

		};

		MessageOutputManager.prototype._backToMessages = function (oEvent) {

			this.byId("listLogs").setVisible(false);
			this.byId("listMessage").setVisible(true);

		};

		return MessageOutputManager;
	}, /* bExport= */ true);