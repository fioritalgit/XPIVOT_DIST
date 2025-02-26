sap.ui.define([
		"jquery.sap.global",
		"sap/ui/core/XMLComposite",
		"sap/m/MessageToast"
	],
	function (jQuery, XMLComposite, MessageToast) {

		var OrderHistory = XMLComposite.extend("it.fiorital.fioritalui5lib.controls.OrderHistory", {
			metadata: {
				library: "it.fiorital.fioritalui5lib",
				properties: {
					/**
					 * OrderHistroy's dialog title
					 */
					title: {
						type: "string",
						defaultValue: "Order History"
					}
				},
				aggregations: {
					/*items: {
						type: "sap.m.ColumnListItem",
						multiple: true,
						forwarding: {
							idSuffix: "--orderHistoryTableId",
							aggregation: "items",
							forwardBinding: true,
							invalidate: true
						}
					}*/
					items: {
						type: "sap.suite.ui.commons.TimeLineItem",
						multiple: true,
						forwarding: {
							idSuffix: "--timelineId",
							aggregation: "content",
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

				this._dialogId = "orderHistoryDialogId";
				this._itemsBindingId = "timelineId";

				this._oDialog = this.byId(this._dialogId);
				this._oItems = this.byId(this._itemsBindingId);
			},

			applySettings: function (mSettings, oScope) {
				mSettings.items.template = this.getAggregation("items")[0].clone();
				this._itemTemplate = this.getAggregation("items")[0].clone();
				//--> super
				XMLComposite.prototype.applySettings.apply(this, arguments);
			},

			open: function (oEventSource) {

				this.oEventSource = oEventSource;
				this._oDialog.bindElement({
					path: oEventSource.getBindingContext().getPath(),
					length: 9999,
					parameters: {
						$$groupId: "batchGroupAPI"
					}
				});

				this._oDialog.getModel().submitBatch('batchGroupAPI').then(function (evt) {
					this._oDialog.openBy(this.oEventSource);
				}.bind(this));

			},
			
			openByEvent: function (evt) {

				this.oEventSource = evt.getSource();
				
				this.getBinding('items').setContext(evt.getSource().getBindingContext());
				this._oDialog.bindElement({
					path: evt.getSource().getBindingContext().getPath(),
					length: 9999,
					parameters: {
						$$groupId: "batchGroupAPI"
					}
				});

				this._oDialog.getModel().submitBatch('batchGroupAPI').then(function (evt) {
					this._oDialog.getModel().setSizeLimit(9999);
					this._oDialog.openBy(this.oEventSource);
				}.bind(this));

			},

			bindItems: function (path) {
				this._oItems.bindItems({
					path: path,
					template: this._itemTemplate
				});
			},

			//----------------------------------------> control EVENTS
			_onCloseButtonPress: function (evt) {
				this._oDialog.close();
			},

			deleteTrailZerosOrHeader: function (pos) {

				if (pos === '' || pos === '000000') {
					return '(testata)';
				} else {
					try {
						return pos * 1;
					} catch (ex) {

					}
				}
			},

			deleteTrailZeros: function (pos) {
				try {
					return pos.replace(/^0+(\d)|(\d)0+$/gm, '$1$2');
				} catch (ex) {

				}
			}
		});

		return OrderHistory;

	}, true);