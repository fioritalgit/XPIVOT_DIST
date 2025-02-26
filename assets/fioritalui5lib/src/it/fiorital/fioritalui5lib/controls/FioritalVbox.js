sap.ui.define([
	"sap/m/VBox"
], function (vbox) {
	"use strict";
	return vbox.extend("it.fiorital.flex5app.controls.FioritalVbox", {

		metadata: {
			properties: {
				text: {
					type: "string",
					defaultValue: ""
				},
				padBegin: {
					type: "string",
					defaultValue: ""
				},
				padEnd: {
					type: "string",
					defaultValue: ""
				},
				padTop: {
					type: "string",
					defaultValue: ""
				},
				padBottom: {
					type: "string",
					defaultValue: ""
				},
				color: {
					type: "string",
					defaultValue: ""
				},
				bandMark: {
					type: "string",
					defaultValue: ""
				},
				borderbottom: {
					type: "string",
					defaultValue: ""
				}
			},
			events: {
				onMouseEnter: {
					event: {
						type: "Object"
					}
				}
			}
		},

		constructor: function (sId, mSettings) {
			vbox.prototype.constructor.apply(this, arguments);
		},
		
		__mouseenter: function(jqe){
			this.fireEvent("onMouseEnter", {
					jqe: jqe
				});
		},

		onAfterRendering: function () {

			this.$().off();
			this.$().mouseenter(this.__mouseenter.bind(this));

			//--> pad start
			if (this.getPadBegin() !== undefined && this.getPadBegin() !== '') {
				this.$().css("padding-left", this.getPadBegin());
			}

			//--> pad end
			if (this.getPadEnd() !== undefined && this.getPadEnd() !== '') {
				this.$().css("padding-right", this.getPadEnd());
			}

			//--> pad start
			if (this.getPadTop() !== undefined && this.getPadTop() !== '') {
				this.$().css("padding-top", this.getPadTop());
			}

			//--> pad bottom
			if (this.getPadBottom() !== undefined && this.getPadBottom() !== '') {
				this.$().css("padding-bottom", this.getPadBottom());
			}

			if (this.getBandMark() !== undefined && this.getBandMark() !== '') {
				this.$().css("border-left", '0.3em solid ' + this.getBandMark());
			}

			//--> backgroud color
			if (this.getColor() !== undefined && this.getColor() !== '') {
				this.$().css("background-color", this.getColor());
			}
			
			if (this.getBorderbottom() !== undefined && this.getBorderbottom() !== ''){
					this.$().css("border-bottom", this.getBorderbottom());
			}

		},

		renderer: "sap.m.VBoxRenderer" //<--- set standard renderer!
	});
});