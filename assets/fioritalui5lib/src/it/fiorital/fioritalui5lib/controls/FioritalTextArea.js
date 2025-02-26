sap.ui.define([
	"sap/m/TextArea",
	"it/fiorital/fioritalui5lib/controls/FioritalComponentValidator"
], function (TextArea, FioritalComponentValidator) {
	"use strict";
	return TextArea.extend("it.fiorital.flex5app.controls.FioritalTextArea", {

		FioritalComponentValidator: FioritalComponentValidator,

		metadata: {
			properties: {

			},
			events: {
				submit: {

				}
			}
		},

		constructor: function (sId, mSettings) {
			TextArea.prototype.constructor.apply(this, arguments);
		},

		onAfterRendering: function () {
			TextArea.prototype.onAfterRendering.apply(this, arguments);
		},

		___componentInternalValidation: function () {
			//---> property based validation; false = valid
			return false;
		},

		renderer: "sap.m.TextAreaRenderer" //<--- set standard renderer!

	});
});