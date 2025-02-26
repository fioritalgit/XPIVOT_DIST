sap.ui.define([
		"jquery.sap.global",
		"sap/ui/core/XMLComposite"
	],
	function (jQuery, XMLComposite) {
		"use strict";

		var VKM = XMLComposite.extend("it.fiorital.fioritalui5lib.controls.XKeyboardManager", {
			metadata: {
				properties: {
					odataDecimalSeparator: { 
						type: "string",
						defaultValue: "."
					},
					localizedDecimalSeparator: { 
						type: "string",
						defaultValue: "."
					},
					keyboardType: { 
						type: "string",
						defaultValue: "ALPHANUM"
					},
					typedValue: { 
						type: "string",
						defaultValue: ""
					},
					hasAlphabeticKeys: {
						type: "boolean",
						defaultValue: false
					},
					hasNumericKeys: {
						type: "boolean",
						defaultValue: true
					},
					hasNumericCtrlKeys: {
						type: "boolean",
						defaultValue: false
					},
					hasSpacingKeys: {
						type: "boolean",
						defaultValue: true
					},
					hasDecimalKeys: {
						type: "boolean",
						defaultValue: false
					},
					hasPunctuationKeys: {
						type: "boolean",
						defaultValue: true
					},
					enabledDecimalSeparator: {
						type: "boolean",
						defaultValue: true
					}
				},
				events: {
					onEnter: {
						parameters: {
							value: {
								type: "string"
							}
						}
					},
					onAfterClose: {
						parameters: {
							sourceControl: {
								type: "object"
							},
							sourceControlId: {
								type: "string"
							},
							value: {
								type: "string"
							},
							parsedValue: {}
						}
					}
				}
			},

			_retrieveReferenceControlValue: function() {

				var ctrlVal = "";

				if (this.referenceControl instanceof sap.m.Input || this.referenceControl instanceof sap.m.TextArea ) {
					ctrlVal = this.referenceControl.getValue();
				}

				if (this.referenceControl instanceof sap.m.Label) {
					ctrlVal = this.referenceControl.getText();
				}

				if (this.referenceControl instanceof sap.m.SearchField) {
					ctrlVal = this.referenceControl.getValue();
				}

				return ctrlVal;

			},
			
			/**
			 * Get parsed type as primitive
			 */
			getParsedValue: function() {
				
				var stringValue = this._retrieveReferenceControlValue();
				var parsedValue;
				
				if ( this.getKeyboardType() === "DECIMAL" ) {

					var fFmtOpts = sap.ui.core.format.NumberFormat.getFloatInstance();
					var float    = new sap.ui.model.type.Float(fFmtOpts);
					parsedValue  = float.parseValue(stringValue, "string");

				} else if ( this.getKeyboardType() === "INTEGER" ) {

					var iFmtOpts = sap.ui.core.format.NumberFormat.getIntegerInstance();
					var integer = new sap.ui.model.type.Integer(iFmtOpts);
					parsedValue = integer.parseValue(stringValue, "string");

				} else parsedValue = stringValue;
				
				return parsedValue;

			},

			_processInput: function(value, typedKey) {
				
               if ( typedKey === "DELETE") {
                	
					if ( value.length > 0 ) {
						value = value.substring(0, value.length - 1);
					}

                } else if ( typedKey === "CLEAR") {
                	
                	value= "";
                	
                } else {
                
					//--> For decimal input if format validation fails avoid to update value on reference control
					if ( this.getKeyboardType() === "DECIMAL" || this.getKeyboardType() === "INTEGER" ) {
						
						//--> NOTE: Type sap.ui.model.type.Float of input field needs localized input!
						var localizedDecSeparator = this._getDecimalSeparator();
						var numDecSeparator       = localizedDecSeparator; //this.getOdataDecimalSeparator();
						
						//--> Prevent wrong value if user types consecutive decimal separator
						if ( typedKey === localizedDecSeparator ) {
	
							//--> Actual numeric value follow float type numeric input
							if ( value.indexOf(numDecSeparator) < 0 ) {
								value = value + numDecSeparator;
							}
	
						} else {
							value = value + typedKey;
						}
	
						//--> Strip leading zeros ( eg: 01 - 000,1 )
						while ( value.length > 1 && value.charAt(0) === '0' && value.charAt(1) !== numDecSeparator ) {
							value = value.substring(1, value.length);
						}
								
						//--> Comma typed as first char
						if ( value === "" ) {
							value = "0";
						}

					} else {
						
						value = value + typedKey;
						
					}
				
                }
				
				return value;
				
			},
			
			_setReferenceControlValue: function(value, typedKey) {

				value = this._processInput(value, typedKey);

				if (this.referenceControl instanceof sap.m.Input || this.referenceControl instanceof sap.m.TextArea ) {
					this.referenceControl.setValue(value);
				}

				if (this.referenceControl instanceof sap.m.Label) {
					this.referenceControl.setText(value);
				}

				if (this.referenceControl instanceof sap.m.SearchField) {
					this.referenceControl.setValue(value);
				}

			},

			_setKeyboardValue: function(value, typedKey) {

                value = this._processInput(value, typedKey);
                
				this.setTypedValue(value);
				
				//--> Disable decimal separator button if just typed ( only on decimal keyboard )
				//this._enableDecimalSeparator(value);

			},
			
			_getDecimalSeparator: function() {
				
				try {

					var btnDecimalSeparator = this.byId("DecimalSeparator");
					
					//--> Odata numeric values need to be 
					return btnDecimalSeparator.getText();
					
				} catch(ex) {
					//<-- Nothing to do
				}
				
				return "";
				
			},
			
			/**
			 * DO NOT USE: causes closing of popover when clicked decimal deparator button
			 */
			_enableDecimalSeparator: function(currentKeyboardValue) {

				var btnDecimalSeparator = this.byId("DecimalSeparator");
				if ( this.getKeyboardType() === 'DECIMAL' && currentKeyboardValue.indexOf(btnDecimalSeparator.getText()) >= 0 ) {
					this.setEnabledDecimalSeparator(false);
				} else {
					this.setEnabledDecimalSeparator(true);
				}
				
			},
			
			_updateKeyboardType: function(keyboardType, showPunctuationKeys, showSpacingKeys) {

				if ( !showPunctuationKeys ) {
					showPunctuationKeys = false;
				}
				if ( !showSpacingKeys ) {
					showSpacingKeys = false;
				}
				
				this.setHasSpacingKeys(showSpacingKeys);
				this.setHasPunctuationKeys(showPunctuationKeys);
				this.setHasAlphabeticKeys(true);
				this.setHasNumericKeys(true);
				this.setHasDecimalKeys(false);
				
				if ( keyboardType !== null && keyboardType !== undefined ) {
					
					if ( keyboardType === "ALPHANUMERIC" ) {
						this.setKeyboardType(keyboardType);
						this.setHasAlphabeticKeys(true);
						this.setHasNumericKeys(true);
						this.setHasDecimalKeys(false);
						this.setHasSpacingKeys(showSpacingKeys);
						this.setHasPunctuationKeys(showPunctuationKeys);
						this.setHasNumericCtrlKeys(false);
					} 
					
					//--> No punctuation/spacing 
					if ( keyboardType === "ALPHABETIC" ) {
						this.setKeyboardType(keyboardType);
						this.setHasAlphabeticKeys(true);
						this.setHasNumericKeys(false);
						this.setHasDecimalKeys(false);
						this.setHasSpacingKeys(showSpacingKeys);
						this.setHasPunctuationKeys(showPunctuationKeys);
						this.setHasNumericCtrlKeys(false);
					} 
					
					if ( keyboardType === "INTEGER" ) {
						this.setKeyboardType(keyboardType);
						this.setHasAlphabeticKeys(false);
						this.setHasNumericKeys(true);
						this.setHasDecimalKeys(false);
						this.setHasSpacingKeys(showSpacingKeys);
						this.setHasPunctuationKeys(showPunctuationKeys);
						this.setHasNumericCtrlKeys(true);
					}
					
					if ( keyboardType === "DECIMAL" ) {
						this.setKeyboardType(keyboardType);
						this.setHasAlphabeticKeys(false);
						this.setHasNumericKeys(true);
						this.setHasDecimalKeys(true);
						this.setHasSpacingKeys(showSpacingKeys);
						this.setHasPunctuationKeys(showPunctuationKeys);
						//--> Setup decimal button according to actual value
						//this._enableDecimalSeparator(this._retrieveReferenceControlValue());
						this.setHasNumericCtrlKeys(true);
					}

				}

			},
			
			init: function () {
				
				//--> super
				XMLComposite.prototype.init.apply(this, arguments);
				
				this.statusUpper = true;
				this._VKMPopover = this.byId("VKMPopover");
				
				var keyboardType = this.getKeyboardType();
				this._updateKeyboardType(keyboardType);
				
			},
			
			_initLocalizedOptions: function(localeObj, decimalSeparator) {

				if ( localeObj ) {

					var oFloatNumberFormat = sap.ui.core.format.NumberFormat.getFloatInstance({
	                    maxFractionDigits: 2,
	                    minFractionDigits : 2,
	                    groupingEnabled: true
	                } , localeObj);
	                
	                //--> Esplicit deciaml separator parameter overrides current locale one
	                if ( decimalSeparator === undefined || decimalSeparator === null ) {
	                	
	                	//--> Bad coding practice: avoid direct access to private 'oFormatOptions' property
	                	//decimalSeparator = oFloatNumberFormat.oFormatOptions.decimalSeparator;

	                	//--> Simulate formatting to grab deciaml separator
	                	var formatted = oFloatNumberFormat.format(12.34);
	                	decimalSeparator = formatted.substring(2,3);
	                	
	                }

				}
				
				if ( decimalSeparator ) {
					
					this.setLocalizedDecimalSeparator(decimalSeparator);

				}
			},
			
			_initLocale: function(localeCodeAsString) {
				
				//--> Default locale
				var currentLocaleCode = sap.ui.getCore().getConfiguration().getFormatLocale();
				var currentLocale     = new sap.ui.core.Locale(currentLocaleCode);
				
				//--> Process custom locale
				if ( localeCodeAsString ) {
					if ( localeCodeAsString !== "" ) {
						try {
							currentLocale = new sap.ui.core.Locale(localeCodeAsString);
						} catch(ex) {
							//<-- NOTHING TO DO
						}
					}
				}
				
				return currentLocale;

			},
			
			openBy: function (control, keyboardType, options) {

				var localeAsString;
				var localizedDecimalSeparator;
				if ( options ) {
					localeAsString            = options.locale;
					localizedDecimalSeparator = options.decimalSeparator;
				}
				
				var locale = this._initLocale(localeAsString);
				this._initLocalizedOptions(locale, localizedDecimalSeparator);
				
				this.referenceControl = control;
				
				this._updateKeyboardType(keyboardType);
				
				this._setKeyboardValue(this._retrieveReferenceControlValue(), "");

				this._VKMPopover.openBy(control);

			},
            
            /**
             * Fires when keyboard is closed clicking outside its boundaries
             */
            onAfterCloseVKPopover: function(oEvent) {
            	
            	try {
	            	this.fireEvent("onAfterClose", {
						sourceControl: this.referenceControl,
						sourceControlId: this.referenceControl.getId(),
						value: this.getTypedValue(), //this.byId('actualText').getText()
						parsedValue: this.getParsedValue()
					});
            	} catch(ex) {
            		
            	}

            },
            
            close: function() {

				this._VKMPopover.close();
				
            },
            
            parseDecimalNumber: function(inpuTValue) {
            	
            	var floatVal = null;
            	
            	try {
            		
            		var oNumberFormat = sap.ui.core.format.NumberFormat.getFloatInstance({
					  //maxFractionDigits: 2,
					  groupingEnabled: false,
					  groupingSeparator: ",",
					  decimalSeparator: "."
					}); //Returns a NumberFormat instance for float
				
					floatVal = oNumberFormat.parse(inpuTValue);
					
            	} catch(ex) {
            		//<-- Nothing to do
            	}
            	
            	return floatVal;	
            	
            },
            
			pressKey: function (evt) {

				//--> Typed key
				var typedKey = evt.getSource().getText();
				
				//--> The value that should be used to update keyboard text and 
				var prevInputText = this.byId('actualText').getText();

				if (evt.getSource().data('type') !== undefined && evt.getSource().data('type') === 'enter') {

					//--> identify the outer control...
					if (this.referenceControl instanceof sap.m.SearchField) {
						//---> run the search
						this.referenceControl.fireSearch({
							query: this.referenceControl.getValue()
						});
					}

					this.fireEvent("onEnter", {
						value: this.getTypedValue() //this.byId('actualText').getText()
					});

					/*
					this.fireEvent("onAfterClose", {
						vKeyboard: this,
						value: this.getTypedValue() //this.byId('actualText').getText()
					});
					
					this._VKMPopover.close();
					*/
					
					this.close();
					
					return;

				}

				if (evt.getSource().data('type') !== undefined && evt.getSource().data('type') === 'delete') {

					typedKey = "DELETE";

				} else if (evt.getSource().data('type') !== undefined && evt.getSource().data('type') === 'space') {

					typedKey = ' ';

				} else if (evt.getSource().data('type') !== undefined && evt.getSource().data('type') === 'clear') {
					
					typedKey = "CLEAR";
					
				}
				
				this._setReferenceControlValue(prevInputText, typedKey);
				
				this._setKeyboardValue(prevInputText, typedKey);
				
			},

			/**
			 * Turn on upper/lowercase on alphabetic characters of keyboard
			 */
			changeUpperLower: function (evt) {

				if (evt.getParameter('state') !== this.statusUpper) {

					this.statusUpper = evt.getParameter('state');

					var btns = $(".txtButtonT");
					for ( var i=0; i<btns.length; i++) {

						var ui5Btn = sap.ui.getCore().byId(btns[i].id);
						if (ui5Btn instanceof sap.m.Button) {
							if (evt.getParameter('state') === true) {
								ui5Btn.setText(ui5Btn.getText().toUpperCase());
							} else {
								ui5Btn.setText(ui5Btn.getText().toLowerCase());
							}
						}

					}
					
				}
			}

		});

		return VKM;

	}, true);