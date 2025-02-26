sap.ui.define([
	"sap/tnt/InfoLabel"
], function (InfoLabel) {
	"use strict";
	return InfoLabel.extend("it.fiorital.flex5app.controls.FioritalInfolabel", {

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
			InfoLabel.prototype.constructor.apply(this, arguments);

		},

		onAfterRendering: function () {
			this.$().off(); //<--- remove old handlers!
			this.$().click(this._click.bind(this));
			this.addStyleClass('showCursorPointer');
		},

		_click: function (evt) {
			this.fireEvent("press", {text:this.getText()});
		},

		renderer: "sap.tnt.InfoLabelRenderer" //<--- set standard renderer!

	});
});