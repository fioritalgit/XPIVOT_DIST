sap.ui.define([
	"sap/m/ObjectNumber"
], function (ObjectNumber) {
	"use strict";
	return ObjectNumber.extend("it.fiorital.flex5app.controls.FioritalObjectNumber", {

		metadata: {
			properties: {

			},
			events: {
				press: {
					parameters: {
						number: {
							type: "float"
						}
					}
				}
			}
		},

		constructor: function (sId, mSettings) {
			ObjectNumber.prototype.constructor.apply(this, arguments);
		},

		onAfterRendering: function () {
			this.$().off(); //<--- remove old handlers!
			this.$().click(this._click.bind(this));
			this.addStyleClass('showCursorPointer');
		},

		_click: function (evt) {
			this.fireEvent("press", {text:this.getNumber()});
		},

		renderer: "sap.m.ObjectNumberRenderer" //<--- set standard renderer!

	});
});