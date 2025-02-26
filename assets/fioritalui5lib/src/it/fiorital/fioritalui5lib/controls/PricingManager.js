sap.ui.define([
		"jquery.sap.global",
		"sap/ui/core/XMLComposite",
		"sap/m/MessageToast",
		"sap/m/MessageBox",
		"sap/ui/model/Filter",
		"sap/ui/model/FilterOperator",
		"it/fiorital/fioritalui5lib/utility/utilities"
	],
	function (jQuery, XMLComposite, MessageToast, MessageBox, Filter, FilterOperator, Utilities) {
		"use strict";

		var PricingManager = XMLComposite.extend("it.fiorital.fioritalui5lib.controls.PricingManager", {
			metadata: {
				properties: {
					title: {
						type: "string",
						defaultValue: "Pricing Manager"
					},
					forceDisable: {
						type: "boolean",
						defaultValue: false
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
					pricing: {
						type: "sap.m.CustomListItem",
						multiple: true,
						forwarding: {
							idSuffix: "--pricingManagerList",
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

				this._pricingManagerList = this.byId("pricingManagerList");
				this._pricingManagerPopover = this.byId("pricingManagerPopover");
			},

			applySettings: function (mSettings, oScope) {
				mSettings.pricing.template = this.getAggregation("pricing")[0].clone();

				//--> super
				XMLComposite.prototype.applySettings.apply(this, arguments);
			},

			openBy: function (control) {

				this.changed = false;

				if (this._pricingManagerList.getModel().hasPendingChanges()) {
					this._pricingManagerList.getModel().resetChanges('grpPricingManager');
				}

				this._pricingManagerPopover.openBy(control);
			},

			openDirectRebind: function (evt, directPath, explicitModelName) {

				this.changed = false;

				//--> if provided override default model
				if (explicitModelName !== undefined & explicitModelName !== '') {
					this.setModel(this.getModel(explicitModelName));
				}

				this._pricingManagerPopover.bindElement({
					path: directPath,
					parameters: {
						$$updateGroupId: 'batchGroupAPI'
					}
				});

				if (this._pricingManagerList.getModel().hasPendingChanges()) {
					this._pricingManagerList.getModel().resetChanges('grpPricingManager');
				}

				this._pricingManagerPopover.openBy(evt.getSource());
			},

			openByEvent: function (evt) {

				this.changed = false;

				var ctx = evt.getSource().getBindingContext();
	
				this.getBinding('pricing').setContext(evt.getSource().getBindingContext());
				this._pricingManagerPopover.bindElement({
					path: ctx.getCanonicalPath(),
					parameters: {
						$$updateGroupId: 'batchGroupAPI'
					}
				});

				if (this._pricingManagerList.getModel().hasPendingChanges()) {
					this._pricingManagerList.getModel().resetChanges('grpPricingManager');
				}

				this._pricingManagerPopover.openBy(evt.getSource());
			},

			//-----------------------------------------------------------------------------> control EVENTS
			_onCloseButtonPress: function (evt) {
				this.fireEvent("onClose", {
					changed: this.changed
				});
				this._pricingManagerPopover.close();
			},

			valueChange: function (evt) {

				this.changed = true;

				sap.ui.core.BusyIndicator.show(0);

				//---> reset previous pending changes
				if (this._pricingManagerList.getModel().hasPendingChanges()) {
					this._pricingManagerList.getModel().resetChanges('grpPricingManager');
				}

				/*var fNewValue = evt.getParameter('newValue');
				if( Utilities.isEmpty( fNewValue ) ){
					fNewValue = 0;
				}
				evt.getSource().getBinding('value').setValue(parseFloat(fNewValue), 'grpPricingManager');*/

				evt.getSource().getBinding('value').setValue(evt.getParameter('newValue'), 'grpPricingManager');
				this._pricingManagerList.getModel().submitBatch('grpPricingManager').then(function () {
					this._pricingManagerPopover.getBindingContext().refresh();
					sap.ui.core.BusyIndicator.hide();
				}.bind(this));

			},

			//-----------------------------------------------------------------------------> control formatters
			activeCondition: function (activeCond, subtotal, statistics) {
				if (statistics === 'X') {
					return 'sap-icon://appear-offline';
				} else {

					if (subtotal === 'X') {
						//this.getParent().applyStyleClass('rowSubTotal');
						return 'sap-icon://expand-all';
					} else {
						if (activeCond !== '') {
							return 'sap-icon://project-definition-triangle-2';
						} else {
							return 'sap-icon://circle-task-2';
						}
					}
				}

			},

			activeConditionColor: function (activeCond, subtotal, statistics) {

				if (statistics === 'X') {
					return '#0a6ed1';
				} else {
					if (subtotal === 'X') {
						return '#4d6377';
					} else {
						if (activeCond !== '') {
							return '#fabd64';
						} else {
							return 'green';
						}
					}
				}
			},

			conditionRate: function (rate) {
				return parseFloat(rate.replace(',', '.'));
			},

			disableInput: function (def, force) {
				if (force) {
					return false;
				} else {
					return def;
				}
			},

			condquantity: function (condqty) {
				if (condqty !== '0') {
					return '/ ' + condqty;
				} else {
					return '';
				}
			},

			hideSubTotalInput: function (subtotal) {
				return !subtotal;
			}
		});

		return PricingManager;

	}, true);