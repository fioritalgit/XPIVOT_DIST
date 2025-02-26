/* eslint sap-no-ui5base-prop: 0 */
/* eslint-disable */

sap.ui.define([
	"sap/ui/table/TreeTable",
	"sap/ui/model/json/JSONModel",
	// "sap/ui/core/_IconRegistry",
	"sap/base/security/encodeCSS",
	"sap/ui/table/Row",
	"sap/ui/table/Column"
], function (uitable, JSONModel, encodeCSS, Row, Column) {
	"use strict";
	return sap.ui.table.TreeTable.extend("it.fiorital.flex5app.controls.FioritalUITreeTable", {

		metadata: {
			properties: {
				rowHeightEm: {
					type: "float",
					defaultValue: ""
				},
				autoHeightAdjustment: {
					type: "boolean",
					defaultValue: false
				},
				autoResizeAdjustment: {
					type: "boolean",
					defaultValue: false
				}
				
			}
			
		},

		constructor: function (sId, mSettings) {
			sap.ui.table.Table.prototype.constructor.apply(this, arguments);

			if (this.getAutoHeightAdjustment()) {
				$(window).resize(this._onResize.bind(this));
			}

		},

		_onResize: function () {
			this.invalidate();
		},


		onAfterRendering: function () {

			sap.ui.table.Table.prototype.onAfterRendering.apply(this, arguments);

			//--> get controller of owner view

			if (this.getAutoHeightAdjustment() && this.getVisibleRowCountMode() !== "Fixed") {
				if (Array.isArray(this.getRows()) && this.getRows().length !== 0) {

					if (this.getColumnHeaderVisible() === true) {
						var hdrHeight = this.$().find('.sapUiTableColHdrCnt').outerHeight();
					} else {
						var hdrHeight = 0;
					}

					var toolbarHeight = this.$().find(".sapMTB").outerHeight();

					var parentHeight = this.getParent().$().outerHeight(),
						rh = this.getRows()[0].$().outerHeight();

					var rowCount = Math.floor((parentHeight - hdrHeight - toolbarHeight) / rh);
					
					if (rowCount === 0){
						return;
					}
					
					this.setVisibleRowCountMode("Fixed");
					if (this.getVisibleRowCount() !== rowCount) {
						this.setVisibleRowCount(rowCount);
					}
				}
			}

		},

		onBeforeRendering: function () {

			sap.ui.table.Table.prototype.onBeforeRendering.apply(this, arguments);

			//--> auto height adjust 
			if (this.getAutoHeightAdjustment()) {
				var base = Number(getComputedStyle(document.body, null).fontSize.replace(/[^\d]/g, ''));
				this.setRowHeight(Math.ceil(base * this.getRowHeightEm()));
			}
		},

		renderer: "sap.ui.table.TreeTableRenderer" //<--- set standard renderer!

	});
});