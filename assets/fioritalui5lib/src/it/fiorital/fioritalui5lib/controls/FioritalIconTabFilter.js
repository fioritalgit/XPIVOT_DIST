sap.ui.define([
	"sap/m/IconTabFilter"
], function (iconFilter) {
	"use strict";
	return iconFilter.extend("it.fiorital.flex5app.controls.FioritalIconTabFilter", {

		metadata: {
			properties: {
				avoidSelect: {
					type: "boolean",
					defaultValue: false
				},
				noBackground: {
					type: "boolean",
					defaultValue: false
				}
			},
			events: {
				press: {
					parameters: {
						text: {
							type: "string"
						}
					}
				},
				pressRight: {
					parameters: {
						text: {
							type: "string"
						}
					}
				}
			}
		},

		constructor: function (sId, mSettings) {
			iconFilter.prototype.constructor.apply(this, arguments);
		},

		onAfterRendering: function () {
			this.$().off(); //<--- remove old handlers!
			this.$().click(this._click.bind(this));
			this.$().contextmenu(this._clickRight.bind(this));
		},
		
		_fireEventPress: function(){
			this.fireEvent("press", {
					text: this.getText(),
					key: this.getKey()
				});
		},

		_click: function (evt) {
			this._fireEventPress();
		},

		_clickRight: function (evt) {
			evt.preventDefault();
			evt.stopPropagation();
			this.fireEvent("pressRight", {
				text: this.getText()
			});
			
			this.inRclickState = true;
		},

		renderer: "sap.m.IconTabFilterRenderer" //<--- set standard renderer!

	});
});