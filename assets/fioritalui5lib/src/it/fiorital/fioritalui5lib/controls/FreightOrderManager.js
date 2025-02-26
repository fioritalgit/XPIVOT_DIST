sap.ui.define([
		"jquery.sap.global",
		"sap/ui/core/XMLComposite",
		"sap/m/MessageToast",
		"sap/m/MessageBox",
		"sap/ui/model/Filter",
		"sap/ui/model/FilterOperator",
		"it/fiorital/fioritalui5lib/formatter/SharedFormatter"
	],
	function (jQuery, XMLComposite, MessageToast, MessageBox, Filter, FilterOperator, SharedFormatter) {
		"use strict";

		var FOManager = XMLComposite.extend("it.fiorital.fioritalui5lib.controls.FreightOrderManager", {
			SharedFormatter: SharedFormatter,
			metadata: {
				properties: {
					title: {
						type: "string",
						defaultValue: "Freight Order Manager"
					}
				},
				aggregations: {

				},
				defaultAggregation: "items"
			},

			init: function () {

				//--> super
				XMLComposite.prototype.init.apply(this, arguments);

				this._FreightOrderListContent = this.byId("FreightOrderListContent");
				this._FreightOrderListPartners = this.byId("FreightOrderListPartners");
				this._FreightOrderListStops = this.byId("FreightOrderListStops");

				this._FreightOrderPopover = this.byId("FreightOrderPopover");

			},

			applySettings: function (mSettings, oScope) {
				//mSettings.content.template = this.getAggregation("content")[0].clone();
				//mSettings.stops.template = this.getAggregation("stops")[0].clone();
				//mSettings.partners.template = this.getAggregation("partners")[0].clone();

				//--> super
				XMLComposite.prototype.applySettings.apply(this, arguments);
			},

			openByOrder: function (evt, orderId, modelName) {

				//--> force model!
				if (modelName !== undefined & modelName !== '') {
					this.setModel(this.getModel(modelName));
				}

				this.byId('subHederFOmanager').setBusy(true);
				this.byId('contentVboxFOmanager').setBusy(true);

				this._FreightOrderPopover.bindElement({
					path: "/FreightOrder(freightorderid='" + orderId + "',dgrid='')",
					events: {
						dataReceived: function (Evt) {
						
							this.byId('subHederFOmanager').setBusy(false);
							this.byId('contentVboxFOmanager').setBusy(false);
						}.bind(this)
					}
				});

				if (evt.getSource !== undefined) {
					this._FreightOrderPopover.openBy(evt.getSource());
				} else {
					this._FreightOrderPopover.openBy(evt);
				}

			},

			//-----------------------------------------------------------------------------> control EVENTS
			_onCloseButtonPress: function (evt) {
				//this._attributeManagerList.getBinding("items").resetChanges();
				this._FreightOrderPopover.close();
			},

			//-----------------------------------------------------------------------------> control formatters
			documentReference: function (docnr, docpos) {
				try {
					return docnr.replace(/^0+(\d)|(\d)0+$/gm, '$1$2') + ' / ' + docpos.replace(/^0+(\d)|(\d)0+$/gm, '$1$2');
				} catch (exc) {
					return '';
				}
			},

			routeDescription: function (routeDescr) {
				if (routeDescr === undefined || routeDescr === '') {
					return 'nessuna schedulazione per il FO';
				} else {
					return routeDescr;
				}
			},

			grossWeight: function (weight) {
				return parseFloat(weight);
			},

			address: function (name, addr, country) {
				return name + ' > ' + addr + ' > ' + country;
			},

			carrier: function (carrierid, carrierName) {
				if (carrierid === '') {
					return 'still not defined';
				} else {
					return '(' + carrierid + ') ' + carrierName;
				}
			},

			transportationMode: function (mot, mott) {
				if (mot === '') {
					return 'still not defined';
				} else {
					return '(' + mot + ') ' + mott;
				}

			},

			deleteTrailZeros: function (num) {
				try {
					return num.replace(/^0+/, '');
				} catch (ex) {

				}
			},
			
			goToFIoriApp: function(){
				
				var url = "";
				var fokey = this._FreightOrderPopover.getBindingContext().getObject().uniquekey;
				var isair = this._FreightOrderPopover.getBindingContext().getObject().isairtransported;
				if(!isair){
					url = window.location.origin + '/ui2/nwbc/~canvas;window=app/wda/scmtms/fre_order/?key=' + fokey + '&sap-theme=sap_belize_plus';
				}else{
					url = window.location.origin + '/ui2/nwbc/~canvas;window=app/wda/scmtms/fre_book/?key=' + fokey + '&sap-theme=sap_belize_plus';
				}
				
				window.open(url);
			}

		});

		return FOManager;

	}, true);