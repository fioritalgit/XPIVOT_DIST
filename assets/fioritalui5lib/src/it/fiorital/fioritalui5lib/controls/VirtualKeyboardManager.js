sap.ui.define([
		"jquery.sap.global",
		"sap/ui/core/XMLComposite"
	],
	function (jQuery, XMLComposite) {
		"use strict";

		var VKM = XMLComposite.extend("it.fiorital.fioritalui5lib.controls.VirtualKeyboardManager", {
			metadata: {
				properties: {

				},
				events: {
					onEnter: {
						parameters: {
							value: {
								type: "string"
							}
						}
					}
				}
			},

			init: function () {

				//--> super
				XMLComposite.prototype.init.apply(this, arguments);
				this.statusUpper = true;
				this._VKMPopover = this.byId("VKMPopover");
			},

			openBy: function (control, openbyControl) {

				this.byId('actualText').setText('');
				this.referenceControl = control;

				if (openbyControl !== undefined) {
					this._VKMPopover.openBy(openbyControl);
				} else {
					this._VKMPopover.openBy(control);
				}

			},

			_processInput: function (value, typedKey) {

				//--> Backspace
				if (typedKey === "DELETE") {

					if (value.length > 0) {
						value = value.substring(0, value.length - 1);
					}

				} else if (typedKey === "CLEAR") {

					value = "";

				} else {

					//--> Check if value ends with decimal separator fix to be numerically parsable ( Eg: 1, transformed in 1,0 )
					var isEnterKey = false;
					if (typedKey && typedKey.toUpperCase() === "ENTER" ) {
						typedKey = "";
						isEnterKey = true;
					}

					//--> Process numeric input
					if (this.referenceControl.getType !== undefined && this.referenceControl.getType() === "Number") {

						//--> NOTE: Type sap.ui.model.type.Float of input field needs localized input!
						var decimalSeparator = this.byId("DecimalSeparator").getText();

						//--> Prevent wrong value if user types consecutive decimal separator
						if (typedKey === decimalSeparator) {

							//--> Actual numeric value follow float type numeric input
							if (value.indexOf(decimalSeparator) < 0) {
								value = value + decimalSeparator;
							}

						} else {

							//--> Check if value ends with decimal separator fix to be numerically parsable ( Eg: 1, transformed in 1,0 )
							if ( isEnterKey && value.substring(value.length - decimalSeparator.length) ===
								decimalSeparator) {
								typedKey = "0";
							}

							//--> ALlowed numeric digits only
							var reg = new RegExp(/^\d+$/);
							if (reg.test(typedKey)) {
								value = value + typedKey;
							}

						}

						//--> Strip leading zeros ( eg: 01 - 000,1 )
						while (value.length > 1 && value.charAt(0) === '0' && value.charAt(1) !== decimalSeparator) {
							value = value.substring(1, value.length);
						}

						//--> Comma typed as first char
						if (value === "") {
							value = "0";
						}

					} else {

						value = value + typedKey; //<-- Process alphanumeric input

					}

				}

				return value;

			},

			_setReferenceControlValue: function (value) {

				if (this.referenceControl instanceof sap.m.Input && this.referenceControl.getProperty('type') === 'Number') {
					if (value[value.length - 1] === '.' || value[value.length - 1] === ',') {
						value = value + '0';
						this.referenceControl.setValue(value);
					} else {
						this.referenceControl.setValue(value);
					}
					return;
				}

				if (this.referenceControl instanceof sap.m.Input || this.referenceControl instanceof sap.m.TextArea) {
					this.referenceControl.setValue(value);
					return;
				}

				if (this.referenceControl instanceof sap.m.Label) {
					this.referenceControl.setText(value);
					return;
				}

				if (this.referenceControl instanceof sap.m.SearchField) {
					this.referenceControl.setValue(value);
					return;
				}
			},

			pressKey: function (evt) {

				var typedKey = evt.getSource().getText();

				var prevTypedText = this.byId('actualText').getText();

				if (evt.getSource().data('type') !== undefined && evt.getSource().data('type') === 'enter') {

					//--> On numeric values if user typed '12,'' must be considered 12
					var value = this._processInput(prevTypedText, typedKey);

					//--> identify the outer control...
					if (this.referenceControl instanceof sap.m.SearchField) {
						//---> run the search
						this.referenceControl.fireSearch({
							query: value
						});
					} else {
						this._setReferenceControlValue(value);
					}

					this.fireEvent("onEnter", {
						value: value //this.byId('actualText').getText()
					});

					this._VKMPopover.close();

					return;

				}

				if (evt.getSource().data('type') !== undefined && evt.getSource().data('type') === 'delete') {

					typedKey = "DELETE";

				} else if (evt.getSource().data('type') !== undefined && evt.getSource().data('type') === 'space') {

					typedKey = ' ';

				} else {

					typedKey = typedKey;

				}

				//--> Set Virtual Keyboard actual value
				value = this._processInput(prevTypedText, typedKey);
				this.byId('actualText').setText(value);

				//--> Set reference control value

				var value = this._processInput(prevTypedText, typedKey);
				this._setReferenceControlValue(value);

			},

			changeUpperLower: function (evt) {

				if (evt.getParameter('state') !== this.statusUpper) {

					this.statusUpper = evt.getParameter('state');

					var grid = this.byId('gridButtons');
					grid.getItems().forEach(function (obj) {

						if (obj instanceof sap.m.Button) {
							if (evt.getParameter('state') === true) {
								obj.setText(obj.getText().toUpperCase());
							} else {
								obj.setText(obj.getText().toLowerCase());
							}
						}

					});

				}
			}

		});

		return VKM;

	}, true);