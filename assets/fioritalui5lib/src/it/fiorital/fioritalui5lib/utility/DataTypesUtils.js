//----------------------------------------------------------------------
// H.T. 08-02-2019 - Datatypes helper functions
//----------------------------------------------------------------------

sap.ui.define(["sap/ui/base/ManagedObject", "sap/base/Log", "sap/m/MessageBox", "sap/ui/core/format/DateFormat"],
	function (ManagedObect, Log, MessageBox, DateFormat) {

		return ManagedObect.extend('it.fiorital.fioritalui5lib.utility.DataTypesUtils', {

			metadata: {
				properties: {}
			},

			constructor: function (componentRef) {
				ManagedObect.call(this);
			},

			splitByUnderscore: function (val) {
				return val.split(/-\s*/);
			},

			splitByComma: function (val) {
				return val.split(/,\s*/);
			},

			extractLast: function (term) {
				return this.splitByComma(term).pop();
			},

			stripInitialZeros: function(val) {
				return val.replace(/^0+/, '');
			},
			
			isNullOrBlank: function (inputString) {
				return inputString === null || inputString.trim() === '';
			},

			/**
			 * Format string containing date value to another date format
			 * @stringDate input date as string
			 * @inputDatePattern pattern of input date string ( eg: "yyyy-MM-dd" )
			 * @outputDatePattern pattern to apply ( eg: "dd-MM-yyyy" )
			 * @return date string formatted with outputDatePattern format
			 */
			formatStringDate: function (stringDate, inputDatePattern, outputDatePattern) {
	
				var strDate = null;
				var options = {};
				if (inputDatePattern !== undefined && inputDatePattern !== null) {
					options = {
						pattern: inputDatePattern
					};
				}
				
				try {
					
					var df = DateFormat.getDateInstance(options);
					var dateObject = df.parse(stringDate);
					
					if (outputDatePattern !== undefined && outputDatePattern !== null) {
						options = {
							pattern: outputDatePattern
						};
					}
					
					df = DateFormat.getDateInstance(options);
					strDate  = df.format(dateObject);
					
				} catch (ex) {
					//<-- Nothing to do
				}
	
				return strDate;
	
			},

			/**
			 * Format date to specified date format, if not specified assumed "yyyy-MM-dd"
			 * @stringDate input date
			 * @outputDatePattern pattern to apply ( eg: "dd-MM-yyyy" )
			 * @return date string formatted with outputDatePattern format
			 */
			formatABAPdate: function (date){
				var year = date.getFullYear().toString();
				var month = (date.getMonth()+1).toString().padStart(2,'0');
				var day = date.getDate().toString().padStart(2,'0');
				
				return year+month+day;
				
			},
			
			formatDate: function (date, outputDatePattern) {
	
				var strDate = null;

				try {
					
					var options = {};
					
					if (outputDatePattern === undefined || outputDatePattern === null || outputDatePattern === "" ) {
						outputDatePattern = "yyyy-MM-dd";
					} 
					
					options = {
						pattern: outputDatePattern
					};
					
					var df = DateFormat.getDateInstance(options);
					strDate  = df.format(date);
					
				} catch (ex) {
					//<-- Nothing to do
				}
	
				return strDate;
	
			},

			/**
			 * Parse input string as float according to current locale sessings
			 * @param stringValue input value
			 * @return null if parsing fails, otherwise parsed value
			 */
			parseFloatString: function(stringValue) {
				
				var parsedValue = null;
				
				try {
					var fFmtOpts = sap.ui.core.format.NumberFormat.getFloatInstance();
					var float    = new sap.ui.model.type.Float(fFmtOpts);
					parsedValue  = float.parseValue(stringValue, "string");
				} catch(ex) {
					this.Log.error("BaseController.parseFloatString() - Error parsing input string: '" + stringValue + "' as float.");
				}
	
				return parsedValue;
	
			},
	
			/**
			 * Parse input string as int according to current locale sessings
			 * @param stringValue input value
			 * @return null if parsing fails, otherwise int parsed value
			 */
			parseIntString: function(stringValue) {
				
				var parsedValue;
		
				try {		
					var iFmtOpts = sap.ui.core.format.NumberFormat.getIntegerInstance();
					var integer = new sap.ui.model.type.Integer(iFmtOpts);
					parsedValue = integer.parseValue(stringValue, "string");
				} catch(ex) {
					this.Log.error("BaseController.parseFloatString() - Error parsing input string: '" + stringValue + "' as integer.");
				}
	
				return parsedValue;
	
			}

		});

	});