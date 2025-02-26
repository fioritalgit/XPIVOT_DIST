sap.ui.define([
	"sap/m/ProgressIndicator"
], function (Progress) {
	"use strict";
	return Progress.extend("it.fiorital.flex5app.controls.FioritalProgress", {

		metadata: {
			properties: {

			},
			events: {
				press: {
					parameters: {

					}
				}
			}
		},

		constructor: function (sId, mSettings) {
			Progress.prototype.constructor.apply(this, arguments);

		},

		onAfterRendering: function () {
			this.$().off(); //<--- remove old handlers!
			this.$().click(this._click.bind(this));
			this.addStyleClass('showCursorPointer');
		},

		_click: function (evt) {
			this.fireEvent("press", {});
		},

		renderer: "sap.m.ProgressIndicatorRenderer" //<--- set standard renderer!

	});
});