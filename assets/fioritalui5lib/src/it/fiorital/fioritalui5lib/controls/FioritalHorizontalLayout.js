sap.ui.define([
	"sap/ui/layout/HorizontalLayout" 
], function (hlayout) {
	"use strict";
	return hlayout.extend("it.fiorital.flex5app.controls.FioritalHorizontalLayout", {

		metadata: {
			properties: {
				background:{
					type: "string",
					defaultValue: ""
				},
				width:{
					type: "string",
					defaultValue: ""
				},
				height:{
					type: "string",
					defaultValue: ""
				},
				cssClasses:{
					type: "string",
					defaultValue: ""
				},
				bandMark:{
					type: "string",
					defaultValue: ""
				},
				borderFull:{
					type: "string",
					defaultValue: ""
				}
				,
				borderFullColor:{
					type: "string",
					defaultValue: "black"
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
			hlayout.prototype.constructor.apply(this, arguments);
		},

		onAfterRendering: function () {

			//--> background
			if (this.getBackground() !== undefined && this.getBackground() !== ''){
				this.$().css("background", this.getBackground());
			}
			
			if (this.getWidth() !== undefined && this.getWidth() !== ''){
				this.$().css("width", this.getWidth());
			}
			
			if (this.getHeight() !== undefined && this.getHeight() !== ''){
				this.$().css("height", this.getHeight());
			}
			
			
			if (this.getBorderFull() !== undefined && this.getBorderFull() !== ''){
				this.$().css("border", this.getBorderFull()+'px solid '+this.getBorderFullColor());
			}
			
			if (this.getBandMark() !== undefined && this.getBandMark() !== ''){
				this.$().css("border-left", '0.3em solid '+this.getBandMark());
			}

			//--> custom CSS classes
			if (this.getCssClasses() !== undefined && this.getCssClasses() !== ''){
			
				var classes = this.getCssClasses().split(' ');
				classes.forEach(function(sClass){
				 	this.$().addClass(sClass);
				}.bind(this));
				
			}

		},
		
		renderer: "sap.ui.layout.HorizontalLayoutRenderer" //<--- set standard renderer!
	});
});