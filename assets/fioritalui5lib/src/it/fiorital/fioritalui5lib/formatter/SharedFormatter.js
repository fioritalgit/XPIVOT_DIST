/* eslint no-undef: 0 */

sap.ui.define(["sap/ui/core/format/DateFormat", "it/fiorital/fioritalui5lib/utility/utilities"], function (DateFormat, Utilities) {

	"use strict";

	return {
		Utilities: Utilities,

		testFormatter: function (val) {
			if (val === null)
				return "Shared Formatter";
			return "Shared formatter: " + val;
		},

		testLocalizedFormatter: function (val) {

			var formattedVal = "";

			try {
				formattedVal = this.getResourceBundle().getText("localizedFormatterTest", [val]);
			} catch (ex) {
				//<-- Nothing to DO
				formattedVal = "FAILED local formatting of value: " + val;
			}
			return formattedVal;

		},

		imageURL: function (sURL) {
			return sURL ? URI(sURL).path() : "";
		},

		floatParser: function (sValue) {
			return parseFloat(sValue);
		},

		/*
		 * Format date value to string pattern
		 * @dateObject input date object
		 * @datePattern pattern to apply ( eg: "yyyy-MM-dd HH:mm:ss" )
		 * @return string formatted date or null 
		 */
		formatDate: function (dateObject, datePattern) {
			var strDate = null;
			var options = {};
			if (datePattern !== undefined && datePattern !== null) {
				options = {
					pattern: datePattern
				};
			}
			try {
				var df = DateFormat.getDateInstance(options);
				strDate = df.format(dateObject);
			} catch (ex) {
				//<-- Nothing to do
			}

			return strDate;

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

				var df = DateFormat.getDateInstance(options);
				strDate = df.format(dateObject);

			} catch (ex) {
				//<-- Nothing to do
			}

			return strDate;

		},

		//-->moved to utilities
		stripInitialChars: function (sInput, charToStrip) {
			return Utilities.stripInitialChars(sInput, charToStrip);
		},

		//-->moved to utilities
		alphaOutput: function (sInput) {
			return Utilities.alphaOutput(sInput);
		},

		/**
		 * Get color scheme for InfoLabel
		 * @sStateValue input string definine status values
		 * @return integer coding color
		 */
		getInfoLabelColor: function (sStatus) {
			var mInfoLabelStatusToColorMap = Utilities.initInfoLabelColorMap();
			var sValueToReturn = mInfoLabelStatusToColorMap.get(sStatus);

			return sValueToReturn;
		},

		/**
		 * Get SAP accent color codes
		 * @sColorName color name [ORANGE, RED, DARKRED, PURPLE, LIGHTBLUE, BLUE, LIGHTGREEN, GREEN]
		 * @return color code
		 */
		getSapAccentColor: function (sColorName) {
			var mSapAccentColor = Utilities.initSapAccentColorMap();
			var sValueToReturn = mSapAccentColor.get(sColorName.toUpperCase());
			return sValueToReturn;
		},

		/**
		 * Get SAP accent color codes
		 * @sColorName color name [NEGATIVE, CRITICAL, POSITIVE, NEUTRAL, INFORMATION]
		 * @return color code
		 */
		getSapSemanticColor: function (sColorName) {
			var mSapSemanticColor = Utilities.initSapSemanticColorMap();
			var sValueToReturn = mSapSemanticColor.get(sColorName.toUpperCase());
			return sValueToReturn;
		},

		getTransportationIcon: function (sCode) {
			return Utilities.getTransportationIcon(sCode);
		}
	};
});