sap.ui.define([
	"sap/m/Text"
], function (Text) {
	"use strict";
	return Text.extend("it.fiorital.flex5app.controls.FioritalText", {

		metadata: {
			properties: {
				background: {
					type: "string",
					defaultValue: ""
				},
				borderRadius: {
					type: "string",
					defaultValue: ""
				},
				link: {
					type: "string",
					defaultValue: ""
				},
				linkInNewTab: {
					type: "boolean",
					defaultValue: false
				},
				color: {
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
				bold: {
					type: "boolean",
					defaultValue: false
				},
				fontSize: {
					type: "string",
					defaultValue: ""
				},
				cssClasses: {
					type: "string",
					defaultValue: ""
				},
				canFocus: {
					type: "boolean",
					default: false
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
			Text.prototype.constructor.apply(this, arguments);
		},

		onAfterRendering: function () {
			this.$().off(); //<--- remove old handlers!
			this.$().click(this._click.bind(this));
			this.$().contextmenu(this._clickRight.bind(this));
			this.addStyleClass('showCursorPointer');
			
			if(this.getCanFocus()){
				this.$().attr('tabindex', '0');
			}

			if (this.getColor() !== undefined && this.getColor() !== '') {
				$('#' + this.getId()).css('color', this.getColor());
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

			//--> bold
			if (this.getBold()) {
				this.$().css("font-weight", 'bold');
			}

			//--> font size
			if (this.getFontSize() !== undefined && this.getFontSize() !== '') {
				this.$().css("font-size", this.getFontSize());
			}

			if (this.getBackground() !== undefined && this.getBackground() !== '') {
				this.$().css("background-color", this.getBackground());
			}

			if (this.getBorderRadius() !== undefined && this.getBorderRadius() !== '') {
				this.$().css("border-radius", this.getBorderRadius());
			}

			if (this.getLink() !== undefined && this.getLink() !== '') {
				this.$().addClass('link');
			}

			//--> custom CSS classes
			if (this.getCssClasses() !== undefined && this.getCssClasses() !== '') {

				var classes = this.getCssClasses().split(' ');
				classes.forEach(function (sClass) {
					this.$().addClass(sClass);
				}.bind(this));

			}
		},

		_clickRight: function (evt) {
			evt.preventDefault();
			evt.stopPropagation();
			this.fireEvent("pressRight", {
				text: this.getText()
			});
		},

		_click: function (evt) {
			if (this.getLink() !== "") {
				evt.preventDefault();
				evt.stopPropagation();
				sap.m.URLHelper.redirect(this.getLink(), this.getLinkInNewTab());
			} else {
				this.fireEvent("press", {
					text: this.getText()
				});
			}
		},

		renderer: "sap.m.TextRenderer" //<--- set standard renderer!

	});
});