sap.ui.define([
	"sap/m/ObjectIdentifier"
], function (ObjectIdentifier) {
	"use strict";
	return ObjectIdentifier.extend("it.fiorital.flex5app.controls.FioritalObjectIdentifier", {

		metadata: {
			properties: {

			},
			events: {
				press: {
					parameters: {
						text: {
							type: "string"
						}
					}
				}
			}
		},

		constructor: function (sId, mSettings) {
			ObjectIdentifier.prototype.constructor.apply(this, arguments);

		},

		onAfterRendering: function () {
			this.$().off(); //<--- remove old handlers!
			this.$().click(this._click.bind(this));
			this.addStyleClass('showCursorPointer');
		},

		_click: function (evt) {
			this.fireEvent("press", {code:this.getProperty("text"), descr:this.getProperty("title")});
		},

		renderer: "sap.m.ObjectIdentifierRenderer" //<--- set standard renderer!

	});
});