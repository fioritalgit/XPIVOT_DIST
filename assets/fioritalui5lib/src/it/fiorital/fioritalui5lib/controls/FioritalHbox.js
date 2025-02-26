sap.ui.define([
	"sap/m/HBox"
], function (hbox) {
	"use strict";
	return hbox.extend("it.fiorital.flex5app.controls.FioritalHbox", {

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
				borderRight: {
					type: "string",
					defaultValue: ""
				},
				cssClasses: {
					type: "string",
					defaultValue: ""
				}
			},
			events: {
				onMouseEnter: {
					event: {
						type: "Object"
					}
				},
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
			hbox.prototype.constructor.apply(this, arguments);
		},

		__mouseenter: function (jqe) {
			this.fireEvent("onMouseEnter", {
				jqe: jqe
			});
		},

		setDirectWidth: function (newSize) {
			this.$().css('width', newSize);
		},

		setOpaque: function (val) {

			if (val === 0 || val === undefined) {
				this.$().css('opacity', '');
			} else {
				this.$().css('opacity', val + '%');
			}

		},

		onAfterRendering: function () {

			this.$().off();
			this.$().mouseenter(this.__mouseenter.bind(this));
			this.$().click(this._click.bind(this));

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

			//--> border right
			if (this.getBorderRight() !== undefined && this.getBorderRight() !== '') {
				this.$().css("border-right", this.getBorderRight());
			}

			//--> custom CSS classes
			if (this.getCssClasses() !== undefined && this.getCssClasses() !== '') {

				var classes = this.getCssClasses().split(' ');
				classes.forEach(function (sClass) {
					this.$().addClass(sClass);
				}.bind(this));

			}

		},

		_click: function (evt) {
			this.fireEvent("press", {
				text: this.getText()
			});
		},

		renderer: "sap.m.HBoxRenderer" //<--- set standard renderer!
	});
});