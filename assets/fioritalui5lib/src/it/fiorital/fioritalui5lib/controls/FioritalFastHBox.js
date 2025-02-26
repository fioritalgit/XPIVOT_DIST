sap.ui.define([
	"sap/ui/core/Control"
], function (Control) {
	"use strict";
	return Control.extend("it.fiorital.flex5app.controls.FioritalFastHBox", {

		metadata: {
			properties: {
				width:{
					type: "sap.ui.core.CSSSize"
				},
				height:{
					type: "sap.ui.core.CSSSize"
				}
			},
			aggregations: {

				items: {
					type: "sap.ui.core.Control",
					multiple: true,
					singularName: "item"
				}
			},
			defaultAggregation:"items"
		},

		constructor: function (sId, mSettings) {
			Control.prototype.constructor.apply(this, arguments);
		},

		onAfterRendering: function () {
			this.$().off(); //<--- remove old handlers!
		},

		renderer: "it.fiorital.fioritalui5lib.controls.FioritalFastHBoxRenderer"
	});
});