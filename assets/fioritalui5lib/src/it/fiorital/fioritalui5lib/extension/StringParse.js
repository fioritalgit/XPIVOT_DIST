sap.ui.define([
	"sap/ui/model/SimpleType",
	"sap/ui/model/ValidateException"
], function (stype,valExc) {
	"use strict";
	return stype.extend("it.fiorital.fioritalui5lib.extension.StringParse", {
		
		formatValue: function(sValue, slnternalType) {
			
			return sValue.toString();

		},
		
		parseValue: function(sValue, slnternalType) {
			return sValue.toString();
		},
		
		validateValue: function(sValue) {
			return sValue;
		}

	});
});

