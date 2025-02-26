sap.ui.define([
	"sap/m/Button"
], function (Button) {
	"use strict";
	return Button.extend("it.fiorital.flex5app.controls.FioritalButton", {

		metadata: {
			properties: {
				height: {
					type: "string",
					defaultValue: ""
				},
				lineHeight: {
					type: "string",
					defaultValue: ""
				},
				fontSize: {
					type: "string",
					defaultValue: ""
				},
				enableDirectPress: {
					type: "boolean",
					defaultValue: false
				}
			},
			events: {
				pressDirect: {
					parameters: {
						data: {
							type: "object"
						}
					}
				}
			}
		},

		constructor: function (sId, mSettings) {
			Button.prototype.constructor.apply(this, arguments);
		},

		onAfterRendering: function () {
			this.$().off(); //<--- remove old handlers!

			if (this.getHeight() !== "") {
				this.$().find('.sapMBtnInner').css('height', this.getHeight());
			}

			if (this.getLineHeight() !== "") {
				this.$().find('.sapMBtnContent').css('line-height', this.getLineHeight());
				this.$().find('.sapMBtnIcon').css('line-height', this.getLineHeight());
			}

			if (this.getFontSize() !== "") {
				this.$().find('.sapMBtnContent').css('font-size', this.getFontSize());
			}

			if (this.getEnableDirectPress()) {
				/*this.$().click(function (evt) {
					this.fireEvent("pressDirect", {
						data: this.data()
					});
				}.bind(this));*/
				this.$().on("tap", function (evt) {
					this.fireEvent("pressDirect", {
						data: this.data()
					});
				}.bind(this));
			}
		},

		renderer: "sap.m.ButtonRenderer" //<--- set standard renderer!

	});
});