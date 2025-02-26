sap.ui.define([
	"sap/m/Popover"
], function (popover) {
	"use strict";
	return popover.extend("it.fiorital.fioritalui5lib.controls.FioritalPopover", {

		init : function() {
            popover.prototype.init.apply(this, arguments);
            this.oPopup.setAutoClose(false);
        },
		
		renderer: "sap.m.PopoverRenderer" //<--- set standard renderer!
	});
});