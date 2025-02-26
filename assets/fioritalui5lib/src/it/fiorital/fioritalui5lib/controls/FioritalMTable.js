sap.ui.define([
	"sap/m/Table"
], function (mtable) {
	"use strict";
	return mtable.extend("it.fiorital.flex5app.controls.FioritalMTable", {

		metadata: {
			properties: {

			},
			events: {
				beforeRendering: {
					parameters: {

					}
				},
				afterRendering: {
					parameters: {

					}
				}
			}
		},

		constructor: function (sId, mSettings) {
			mtable.prototype.constructor.apply(this, arguments);

		},

		onBeforeRendering: function () {
			this.fireEvent("beforeRendering", {});
			mtable.prototype.onBeforeRendering.apply(this, arguments);
		},

		onAfterRendering: function () {
			mtable.prototype.onAfterRendering.apply(this, arguments);
			this.fireEvent("afterRendering", {});
		},

		renderer: "sap.m.TableRenderer" //<--- set standard renderer!

	});
});