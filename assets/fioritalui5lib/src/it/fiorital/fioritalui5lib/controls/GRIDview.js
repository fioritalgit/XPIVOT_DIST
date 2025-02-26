sap.ui.define([
		"jquery.sap.global",
		"sap/ui/core/XMLComposite",
		"sap/m/MessageToast",
		"sap/m/MessageBox",
		"sap/ui/model/Filter",
		"sap/ui/model/FilterOperator",
		"sap/ui/model/json/JSONModel",
		"it/fiorital/fioritalui5lib/controls/APCmanager",
		"it/fiorital/fioritalui5lib/controls/FioritalMessageStrip",
	],
	function (jQuery, XMLComposite, MessageToast, MessageBox, Filter, FilterOperator, jsModel, APCManager, FioritalMessageStrip) {
		"use strict";

		var GRIDview = XMLComposite.extend("it.fiorital.fioritalui5lib.controls.GRIDview", {
			metadata: {
				properties: {

				},
				events: {

				},
				aggregations: {

				}
			},

			init: function () {

				//---> super
				XMLComposite.prototype.init.apply(this, arguments);
				this.jsModelList = new jsModel;
				this.byId('listRoutePositions').setModel(this.jsModelList, 'ALTERNATIVEROUTESPOPOVERNODES');

			},

			applySettings: function (mSettings, oScope) {

				//--> super
				XMLComposite.prototype.applySettings.apply(this, arguments);
			},

			openByGRID: function (evt, grid, explicitModel) {

				this.destControl = evt.getSource();

				var mdl;
				if (explicitModel !== undefined) {
					mdl = explicitModel;
				} else {
					mdl = this.getModel();
				}

				this.ActionGetGrid = mdl.bindContext("/GET_GRID_ROUTE(...)");
				this.ActionGetGrid.setParameter("GRID", grid);

				this.byId('popoverAternativeRoutes').setBusy(true);

				//---> run background process
				this.ActionGetGrid.execute().then(function () {

					this.byId('popoverAternativeRoutes').setBusy(false);

					//---> nothing to do, managed in background process
					var ctx = this.ActionGetGrid.getBoundContext().getObject();
					var dt = JSON.parse(ctx.data);

					this.jsModelList.setData(dt);
					this.jsModelList.refresh(true);

					this.byId('popoverAternativeRoutes').openBy(this.destControl);

				}.bind(this)).catch(function (err) {

				});

			},

			backFromRouteDetail: function (evt) {
				this.byId('popoverAternativeRoutes').close();
			},

			//-------------------------------------------------------------

			deleteTrailZeros: function (foId) {
				try {
					return foId.replace(/^0+(\d)|(\d)0+$/gm, '$1$2');
				} catch (ex) {
					
				}
			},

			capacityText: function (occupancy, maxload, uom) {
				if (maxload !== undefined && maxload !== 0) {
					return Math.trunc(occupancy) + ' ' + uom;
				} else {
					return 'no capacity info';
				}
			},

			capacityPerc: function (occupancy, maxload) {
				if (maxload !== undefined && maxload !== 0) {
					return occupancy / maxload * 100;
				} else {
					return 0;
				}
			},

			formatFOdate: function (datestring) {
				try {
					if (datestring === '') {
						return '';
					} else {
						return datestring.substring(6, 8) + "/" + datestring.substring(4, 6) + "/" + datestring.substring(0, 4);
					}
				} catch (ex) {

				}
			},

			formatFOtime: function (timeString) {
				try {
					if (timeString === '') {
						return '';
					} else {
						return timeString.substring(0, 2) + ":" + timeString.substring(2, 4);
					}
				} catch (ex) {

				}
			}

		});

		return GRIDview;

	}, true);