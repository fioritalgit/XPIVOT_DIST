sap.ui.define([
	"sap/ui/model/SimpleType",
	"sap/ui/model/ValidateException"
], function (stype, valExc) {
	"use strict"; 
	return stype.extend("it.fiorital.fioritalui5lib.extension.SAPStatusParse", {

		formatValue: function (sValue, slnternalType) {
			return 1;
		/*	debugger;
			var ty = typeof sValue;

			switch (ty) {
			case 'number':
				return sValue;
				break;
			case 'string':
				switch (sStateValue) {
				case "C":
					return 8;
				case "A":
					return 3;
				case "B":
					return 5;
				default:
					return 9;
				}
				break;
			}*/

		},

		parseValue: function (sValue, slnternalType) {

		},

		validateValue: function (sValue) {

		}

	});
});