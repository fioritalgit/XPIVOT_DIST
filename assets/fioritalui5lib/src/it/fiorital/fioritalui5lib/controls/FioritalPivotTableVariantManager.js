sap.ui.define([
		"jquery.sap.global",
		"sap/ui/core/XMLComposite",
		"it/fiorital/fioritalui5lib/formatter/SharedFormatter",
		"sap/ui/model/json/JSONModel"
	],
	function (jQuery, XMLComposite, fioritalVariantManager, JSONModel) {
		"use strict";

		var tableVariantManager = XMLComposite.extend("it.fiorital.fioritalui5lib.controls.FioritalPivotTableVariantManager", {
			fioritalVariantManager: fioritalVariantManager,
			JSONModel: JSONModel,

			metadata: {
				properties: {

				},
				events: {

				},
				aggregations: {

				}
			},

			init: function () {
				//--> super
				XMLComposite.prototype.init.apply(this, arguments);

				this.modelVariants = new this.JSONModel();
				this.byId('Variants').setModel(this.modelVariants);
				this.byId('Variants').getBinding('variantItems').resume();
			},

			applySettings: function (mSettings, oScope) {
				//--> super
				XMLComposite.prototype.applySettings.apply(this, arguments);
			},

			startVariantManagement: function (tableId, tableModel) {

				this.oTablepersoService = this.byId('Variants').startVariantManagement(tableId, this.modelVariants);

			},

			onPersoButtonPressed: function (oEvent) {
				this.byId('Variants').openManageViewsDialogForKeyUser();
			}
		});

		return tableVariantManager;

	}, true);