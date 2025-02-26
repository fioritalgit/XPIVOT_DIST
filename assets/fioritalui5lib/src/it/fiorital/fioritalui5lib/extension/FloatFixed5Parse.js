sap.ui.define([
	"sap/ui/model/SimpleType",
	"sap/ui/model/ValidateException",
	"it/fiorital/fioritalui5lib/utility/utilities"
], function (stype, valExc, SharedUtilities) {
	"use strict";
	return stype.extend("it.fiorital.fioritalui5lib.extension.FloatFixed5Parse", {
		SharedUtilities: SharedUtilities,

		formatValue: function (sValue, slnternalType) {
			//-->to format value based on browser language use the following
			//var userLang = navigator.language || navigator.userLanguage;

			var typ = typeof sValue;
			switch (typ) {
			case 'number':
				if (!SharedUtilities.isEmpty(sValue)) { //if empty or undefined do nothing
					return sValue.toFixed(5);
				}
				break;
			case 'string':
				if (!SharedUtilities.isEmpty(sValue)) { //if empty or undefined do nothing
					return parseFloat(sValue.replace(',', '.')).toFixed(5);
				}
				break;
			case 'boolean':
				if (sValue === true) {
					return 1;
				} else {
					return 0;
				}
				break;
			default:
				return 0;
			}

		},

		parseValue: function (sValue, slnternalType) {
			switch (slnternalType) {
			case 'number':
				if (!SharedUtilities.isEmpty(sValue)) { //if empty or undefined do nothing
					return sValue.toFixed(5);
				}
				break;
			case 'string':
				if (!SharedUtilities.isEmpty(sValue)) { //if empty or undefined do nothing
					return parseFloat(sValue.replace(',', '.')).toFixed(5);
				}
				break;
			case 'boolean':
				if (sValue === true) {
					return 1;
				} else {
					return 0;
				}
				break;
			default:
				return 0;
			}
		},

		validateValue: function (sValue) {
			return true;
		}

	});
});