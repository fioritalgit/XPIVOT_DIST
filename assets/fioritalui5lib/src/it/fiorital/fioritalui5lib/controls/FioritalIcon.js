sap.ui.define([
	"sap/ui/core/Icon"
], function (Text) {
	"use strict";
	return Text.extend("it.fiorital.flex5app.controls.FioritalIcon", {

		metadata: {
			properties: {
				delayed: {
					type: "int",
					defaultValue: -1
				},
				padBegin: {
					type: "string",
					defaultValue: ""
				},
				marginBegin: {
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
				cssClasses: {
					type: "string",
					defaultValue: ""
				},
				blink: {
					type: "boolean",
					defaultValue: false
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
			Text.prototype.constructor.apply(this, arguments);
		},

		onAfterRendering: function () {
			this.$().off(); //<--- remove old handlers!

			if (this.getDelayed() === -1) {
				this.$().hover(this.__hoverEvent.bind(this));
			} else {
				this.$().mouseenter(this.__mouseenter.bind(this));
				this.$().mouseleave(this.__mouseleave.bind(this));
			}

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

			//--> margin left
			if (this.getMarginBegin() !== undefined && this.getMarginBegin() !== '') {
				this.$().css("margin-left", this.getMarginBegin());
			}

			//--> custom CSS classes
			if (this.getCssClasses() !== undefined && this.getCssClasses() !== '') {

				var classes = this.getCssClasses().split(' ');
				classes.forEach(function (sClass) {
					this.$().addClass(sClass);
				}.bind(this));

			}

			if (this.getBlink() !== undefined && this.getBlink() === true) {
				this.$().css({
					"animation": "blinker 1s linear infinite"
				});
			}
		},

		__mouseenter: function (evt) {
			this.timerRef = setTimeout(function () {
				this.fireEvent("onOver", {
					event: event
				});
			}.bind(this), this.getDelayed());
		},

		__mouseleave: function (evt) {
			clearTimeout(this.timerRef);
		},

		__hoverEvent: function (evt) {

			this.fireEvent("onOver", {
				event: event
			});
		},

		renderer: "sap.ui.core.IconRenderer" //<--- set standard renderer!
	});
});