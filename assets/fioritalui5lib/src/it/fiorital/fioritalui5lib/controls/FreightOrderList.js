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

		var FOManager = XMLComposite.extend("it.fiorital.fioritalui5lib.controls.FreightOrderList", {
			metadata: {
				properties: {
					title: {
						type: "string",
						defaultValue: "Freight Order List"
					}
				},
				aggregations: {

				},
				defaultAggregation: "items"
			},

			init: function () {

				//--> super
				XMLComposite.prototype.init.apply(this, arguments);
				this._FreightOrderListStops = this.byId("FreightOrderListStops");
				this._FreightOrderListPopover = this.byId("FreightOrderListPopover");

			},

			applySettings: function (mSettings, oScope) {
				//mSettings.content.template = this.getAggregation("content")[0].clone();
				//mSettings.stops.template = this.getAggregation("stops")[0].clone();
				//mSettings.partners.template = this.getAggregation("partners")[0].clone();

				//--> super
				XMLComposite.prototype.applySettings.apply(this, arguments);
			},

			openByLocation: function (evt, storageLocation,targetField) {
				
				this.storageLocation = storageLocation;
				this.targetField = targetField;

				if (storageLocation !== undefined && storageLocation !== '') {
					this._FreightOrderListStops.bindItems({
						path: '/FreightOrder',
						parameters:{
						  $search:	storageLocation,
						  $expand:  'FreightOrderStage'
						},
						template: this._FreightOrderListStops.getBindingInfo('items').template
					});
				}

				this.byId('headerSloc').setText(storageLocation);
				this._FreightOrderListPopover.openBy(evt.getSource());
			},

			//-----------------------------------------------------------------------------> control EVENTS
			onFreightOrderSelect: function(evt){
				if (this.targetField !== undefined){
					
					if (this.targetField.setText !== undefined){
						this.targetField.setText(evt.getSource().getBindingContext().getObject().freightorderid.replace(/^0+/, ''));
					}
					
					if (this.targetField.setValue !== undefined){
						this.targetField.setValue(evt.getSource().getBindingContext().getObject().freightorderid.replace(/^0+/, ''));
					}
					
					this._FreightOrderListPopover.close();
				}	
			},
			
			_onCloseButtonPress: function (evt) {
				this._FreightOrderListPopover.close();
			},

			//-----------------------------------------------------------------------------> control formatters
			dateLocate: function(dtString){
			
				var dt = new Date(dtString);
				return dt.toLocaleDateString();
				
			},
			
			setStartLocationFlag: function(startLocation){
				if ( startLocation === this.storageLocation){
					return 'X';
				}else{
					return '';
				}
			},
		
		});

		return FOManager;

	}, true);