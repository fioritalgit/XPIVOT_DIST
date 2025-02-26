sap.ui.define([
	"sap/ui/model/SimpleType",
	"sap/ui/model/ValidateException"
], function (stype,valExc) {
	"use strict";
	return stype.extend("it.fiorital.fioritalui5lib.extension.IntegerParse", {
		
		formatValue: function(sValue, slnternalType) {
			
			switch (slnternalType) {
				case 'number':
					return sValue;
					break;
				case 'string':
					if( sValue !== undefined && sValue !== null ){
						return parseInt(sValue.replace(',','.'));
					}
					break;
				case 'boolean':
					if (sValue === true){
						return 1;
					}else{
						return 0;
					}
					break;
				default:
				   return 0;
			}

		},
		
		parseValue: function(sValue, slnternalType) {
			return sValue;
		},
		
		validateValue: function(sValue) {
			return true;
		}

	});
});

