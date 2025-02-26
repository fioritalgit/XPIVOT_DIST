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

		var FioritalBusy = XMLComposite.extend("it.fiorital.fioritalui5lib.controls.FioritalBusy", {
			metadata: {
				properties: {
					
				},
				aggregations: {
					
				
				}
			},

			init: function () {
				//--> super
				XMLComposite.prototype.init.apply(this, arguments);
				this.addStyleClass('busyInvisible');
			},


			open: function () {
				this.removeStyleClass('busyInvisible');
			},

			close: function () {
				this.addStyleClass('busyInvisible');
			}

		});

		return FioritalBusy;

	}, true);