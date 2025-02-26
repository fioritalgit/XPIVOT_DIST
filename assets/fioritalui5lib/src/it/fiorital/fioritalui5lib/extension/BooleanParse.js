sap.ui.define([
	"sap/ui/model/SimpleType",
	"sap/ui/model/ValidateException"
], function (stype,valExc) {
	"use strict";
	return stype.extend("it.fiorital.fioritalui5lib.extension.BooleanParse", {
		
		formatValue: function(sValue, slnternalType) {
			
			var ty = typeof sValue;
			
			switch (ty) {
				case 'number':
					if (sValue !== 0){
						return true;
					}else{
						return false;
					}
					break;
				case 'string':
					if (sValue !== '' && /^0*$/.test(sValue) === false){
						return true;
					}else{
						return false;
					}
					break;
				case 'boolean':
					if (sValue === true){
						return true;
					}else{
						return false;
					}
					break;
				default:
				   return false;
			}

		},
		
		parseValue: function(sValue, slnternalType) {
		
		},
		
		validateValue: function(sValue) {
	
		}

	});
});

