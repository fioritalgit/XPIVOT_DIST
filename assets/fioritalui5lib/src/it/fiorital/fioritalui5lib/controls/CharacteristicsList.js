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

		var CharList = XMLComposite.extend("it.fiorital.fioritalui5lib.controls.CharacteristicsList", {
			metadata: {
				properties: {
					origin: {
						type: "string"
					},
					faozone: {
						type: "string"
					},
					producer: {
						type: "string"
					},
					fishgear: {
						type: "string"
					},
					uom: {
						type: "string"
					},
					pezzatura: {
						type: "string"
					},
					product: {
						type: "string"
					},
					productdescr: {
						type: "string"
					}
				},
				aggregations: {
					content : {type : "sap.ui.core.Control", multiple : true, singularName : "content"}
				},
				defaultAggregation: "content"
			},

			init: function () {
				//--> super
				XMLComposite.prototype.init.apply(this, arguments);
			},

			applySettings: function (mSettings, oScope) {
				//--> super
				XMLComposite.prototype.applySettings.apply(this, arguments);
			},

			getUniqueKey: function(){
				return this.getOrigin()+this.getFaozone()+this.getFishgear()+this.getProducer()+this.getUom()+this.getPezzatura()+this.getProduct();
			},
			
			hideClusterChars: function(charactValue){
				if (charactValue === '#'){
					return false;
				}else{
					return true;
				}
			}
		
		});

		return CharList;

	}, true);