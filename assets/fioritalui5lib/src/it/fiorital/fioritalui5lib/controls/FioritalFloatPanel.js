/* eslint-disable */

sap.ui.define([
	"sap/m/Panel"
], function (Panel) {
	"use strict";
	return Panel.extend("it.fiorital.flex5app.controls.FioritalFloatPanel", {

		metadata: {
			properties: {
				autoHideOnMove: {
					type: "boolean",
					defaultValue: true
				},
				deltaMove: {
					type: "int",
					defaultValue: 10
				}
			},
			events: {
					onOver: {
						event: {
							type: "Object"
						}
					}
			}
		},

		constructor: function (sId, mSettings) {
			Panel.prototype.constructor.apply(this, arguments);
		},

		onAfterRendering: function () {
			this.$().off(); //<--- remove old handlers!
			
			try{
				$(window).off(this.__windowMove);
			}catch(exc){
				//--> nothing :-)
			}		
			
			$(window).mousemove(this.__windowMove.bind(this));

		},
		
		__windowMove: function(evt){
			
			//--> calculate delta
			if (this.actualMouseX !== undefined){
				
				if (this.getVisible() && ( Math.abs(this.actualMouseX - event.pageX ) > this.getDeltaMove() || Math.abs(this.actualMouseY - event.pageY ) > this.getDeltaMove()  ) ){
					this.setVisible(false);
				}
				
			}
			
			this.actualMouseX = event.pageX;
			this.actualMouseY = event.pageY;
			
		},
		
		renderer: "sap.m.PanelRenderer" //<--- set standard renderer!
	});
});