sap.ui.define([
	"sap/m/DatePicker",
	"it/fiorital/fioritalui5lib/controls/FioritalComponentValidator"
], function (DatePicker, FioritalComponentValidator) {
	"use strict";
	return DatePicker.extend("it.fiorital.flex5app.controls.FioritalDatePicker", {

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
			DatePicker.prototype.constructor.apply(this, arguments);
		},

		onAfterRendering: function () {

			DatePicker.prototype.onAfterRendering.apply(this, arguments);

		},

		___componentInternalValidation: function () {
			//---> property based validation; false = valid
			return false;
		},

		renderer: "sap.m.DatePickerRenderer" //<--- set standard renderer!

	});
});