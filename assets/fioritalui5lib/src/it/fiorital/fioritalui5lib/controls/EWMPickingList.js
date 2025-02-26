sap.ui.define([
		"jquery.sap.global",
		"sap/ui/core/XMLComposite",
		"sap/m/MessageToast",
		"sap/m/MessageBox",
		"sap/ui/model/Filter",
		"sap/ui/model/FilterOperator",
		"sap/ui/model/json/JSONModel"
	],
	function (jQuery, XMLComposite, MessageToast, MessageBox, Filter, FilterOperator, JSONmodel) {
		"use strict";

		var EWMPickingList = XMLComposite.extend("it.fiorital.fioritalui5lib.controls.EWMPickingList", {
			metadata: {
				properties: {

				},
				aggregations: {

				}
			},

			init: function () {
				//--> super
				XMLComposite.prototype.init.apply(this, arguments);

				this.EWMpick = new JSONmodel();
				this.setModel(this.EWMpick, 'EWMPICK');
			},

			applySettings: function (mSettings, oScope) {
				//--> super
				XMLComposite.prototype.applySettings.apply(this, arguments);
			},

			openBy: function (evt, aggregation) {
				
				if (evt.getSource().getBindingContext().getPath().substr(0,1) === '/'){
					this.EWMpick.loadData(this.getModel().sServiceUrl +evt.getSource().getBindingContext().getPath().slice(1) + aggregation);
				}else{
					this.EWMpick.loadData(this.getModel().sServiceUrl + evt.getSource().getBindingContext().getPath() + aggregation);
				}

				
				this.byId('EWMpopoverId').openBy(evt.getSource());

			},

			_onCloseButtonPress: function (evt) {
				this.byId('EWMpopoverId').close();
			},

			//---------------------------------------------------------------------------------------

			deleteTrailZeros: function (num) {
				try {
					return num.replace(/^0+/, '');
				} catch (ex) {

				}
			},

			formatTaskIcon: function (status) {

				switch (status) {
				case 'C':
					return 'sap-icon://circle-task-2';
					break;
				case 'O':
					return 'sap-icon://circle-task';
					break;
				default:
					return 'sap-icon://circle-task';
				}

			},

			formatTaskIconColor: function (status) {

				switch (status) {
				case 'C':
					return 'green';
					break;
				case 'O':
					return 'gold';
					break;
				default:
					return 'gold';
				}

			},

			sumTasks: function (items) {

				try {
					return items.length;
				} catch (ext) {
					return 0;
				}

			}

		});

		return EWMPickingList;

	}, true);