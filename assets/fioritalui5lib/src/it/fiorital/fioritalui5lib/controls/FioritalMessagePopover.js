sap.ui.define([
	"sap/m/MessagePopover"
], function (MessagePopover) {
	"use strict";
	return MessagePopover.extend("it.fiorital.flex5app.controls.FioritalMessagePopover", {

		metadata: {
			properties: {
				width: {
					type: "string",
					defaultValue: ""
				}
			}
		},

		constructor: function (sId, mSettings) {
			MessagePopover.prototype.constructor.apply(this, arguments);
			this._oPopover.setContentWidth('50em');
		},
		
		renderer: "sap.m.MessagePopover" //<--- set standard renderer!
	});
});