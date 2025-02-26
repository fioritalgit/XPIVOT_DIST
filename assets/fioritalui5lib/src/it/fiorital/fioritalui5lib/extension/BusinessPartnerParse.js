sap.ui.define([
	"sap/ui/model/SimpleType",
	"sap/ui/model/ValidateException",
	"it/fiorital/fioritalui5lib/utility/utilities"
], function (stype, valExc, SharedUtilities) {
	"use strict";
	return stype.extend("it.fiorital.fioritalui5lib.extension.BusinessPartnerParse", {
		SharedUtilities: SharedUtilities,

		formatValue: function (sValue, slnternalType) {
			//-->to format value based on browser language use the following
			//var userLang = navigator.language || navigator.userLanguage;

			var typ = typeof sValue;
			switch (typ) {
			case 'number':
				if (!SharedUtilities.isEmpty(sValue)) { //if empty or undefined do nothing
					var sValueStr = sValue.toString();
					return this.stripInitialChars(sValueStr, "0");
				}
				break;
			case 'string':
				if (!SharedUtilities.isEmpty(sValue)) { //if empty or undefined do nothing
					return this.stripInitialChars(sValue, "0");
				}
				break;
			default:
				return 0;
			}

		},

		parseValue: function (sValue, slnternalType) {

			var typ = typeof sValue;
			switch (typ) {
			case 'number':
				if (!SharedUtilities.isEmpty(sValue)) { //if empty or undefined do nothing
					var sValueStr = sValue.toString();
					return sValueStr.padStart(10, "0");
				}
				break;
			case 'string':
				if (!SharedUtilities.isEmpty(sValue)) { //if empty or undefined do nothing
					return sValue.padStart(10, "0");
				}
				break;
			default:
				return 0;
			}
		},

		validateValue: function (sValue) {
			return true;
		},

		stripInitialChars: function (sInput, charToStrip) {
			if (sInput && charToStrip) {
				var strregex = "^" + charToStrip + "+";
				var regexppattern = new RegExp(strregex);
				return sInput.replace(regexppattern, "");
			}
			return sInput;
		}

	});
});