/* eslint-disable */

sap.ui.define([
	"sap/ui/table/Column"
], function (uitable) {
	"use strict";
	return sap.ui.table.Column.extend("it.fiorital.flex5app.controls.FioritalUITableColumn", {

		metadata: {
			properties: {
				noRightBorder: {
					type: "boolean",
					defaultValue: "false"
				}
				
			}
		},

		constructor: function (sId, mSettings) {
			sap.ui.table.Column.prototype.constructor.apply(this, arguments);
		},

		getTemplateClone : function(iIndex, sPreferredTemplateType) {
			sap.ui.table.Column.prototype.getTemplateClone.apply(this, arguments);
		},


		_getViewController: function() {
			this.viewController = null;
			this.parent = this;
			do{
				this.parent = this.parent.getParent();
				if (this.parent !== null && this.parent.getMetadata().getName() === 'sap.ui.core.mvc.XMLView'){
					this.viewController = this.parent.getController();
					break;
				}
			} while (parent !== null);
		}
	});
});