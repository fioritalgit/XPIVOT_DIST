sap.ui.define([
	"sap/ui/core/Control"
], function (Control) {
	"use strict";
	return Control.extend("it.fiorital.fioritalui5lib.controls.FioritalSpacer", {

		metadata: {
			properties: {
				width: {
					type: "sap.ui.core.CSSSize",
					defaultValue: "auto"
				},
				height: {
					type: "sap.ui.core.CSSSize",
					defaultValue: "auto"
				}
			}

		},

		init: function () {

		},

		renderer: {

			render: function (oRm, oControl) {
				oRm.write("<span ");
				oRm.writeControlData(oControl);

				//---> write styles (from control meta XML data)
				oRm.addStyle("height", oControl.getHeight());
				oRm.addStyle("width", oControl.getWidth());
				oRm.writeStyles();

				oRm.write(">");
				oRm.write("</span>");
			}
		}
	});
});