//----------------------------------------------------------------------
// DOM helper functions
//----------------------------------------------------------------------

sap.ui.define(["sap/ui/base/ManagedObject", "sap/base/Log", "sap/m/MessageBox"],
	function (ManagedObect, Log, MessageBox) {

		return ManagedObect.extend('it.fiorital.fioritalui5lib.utility.DOMUtils', {

			metadata: {
				properties: {}
			},

			constructor: function (componentRef) {
				ManagedObect.call(this);
			},

			/**
			 * Find all JS objects among instanced objects by type and id ( id search is only applicable to
			 * HT objects having getId() function ).
			 * @param objectType: type of pbject to look for
			 * @param objectId:   id of object to look for, if omitted are searched all objects of specified type 
			 *                     but is returned only the first
			 * @return objects corresponding to type/id specified as input parameters
			 */
			findJSObjects: function (objectType, objectId) {

				var foundObjects = [];
				for (var key in window) {
					var value = window[key];

					if (value instanceof objectType) {
						// foo instance found in the global scope, named by key

						//--> Look for HT objects having getId() method
						if (objectId !== null && objectId !== "") {

							//--> Try catch to manage objects not declaring 'getId()' function
							try {

								//--> Skip objects not having specified id
								if (typeof value.getId !== 'undefined' && typeof value.getId === 'function') {
									if (objectId !== value.getId()) {

										continue;
									}
								} else {
									//--> If specified id input parameter means looking for HT objects 
									//--> having id so are skipped not HT objects.
									continue;
								}

							} catch (ex) {
								//--> If specified id input parameter means looking for HT objects 
								//--> having id so are skipped not HT objects.

								continue;
							}

						} //<-- if ( objectId != null && objectId != "" )

						//--> Add current object to found objects array
						foundObjects.push(value);

					} //<-- if (value instanceof objectType)

				} //<-- for (var key in window) {

				return foundObjects;

			}, //<-- function findJSObjects(objectType, objectId)

			/**
			 * Find single JS object among instanced objects by type and id ( id search is only applicable to
			 * HT objects having getId() function ).
			 * @param objectType: type of pbject to look for
			 * @param objectId:   id of object to look for, if omitted are searched all objects of specified type 
			 *                     but is returned only the first
			 * @return first object corresponding to id input parameter
			 */
			findFirstJSObject: function (objectType, objectId) {
				var jsObjects = this.findJSObjects(objectType, objectId);
				if (jsObjects !== null && jsObjects.length >= 1) {
					return jsObjects[0];
				}

				return null;
			},

			/**
			 * Get style sheet by id
			 * @param sheetId id of STYLE sheet to look for
			 * @return style sheet object or null when not found
			 */
			getStyleSheet: function (sheetId) {

				/*
				for(var i=0; i<document.styleSheets.length; i++) {
				  var sheet = document.styleSheets[i];
				  if(sheet.title == sheetId) {
				    return sheet;
				  }
				}
				*/

				var sheet = null;

				//--> Get STYLE sheet section by pure JS way
				//if ( document.getElementById(sheetId) ) {
				//	sheet = document.getElementById(sheetId).sheet;
				//}

				//-->  Get STYLE sheet section by JQuery
				if ($("#" + sheetId) && $("#" + sheetId).get(0)) {
					sheet = $("#" + sheetId).get(0).sheet;
				}

				return sheet;

			},

			/**
			 * Looks for style sheets having specified prefix + counter and returns a new id
			 * @param styleSheetPrefix id of style sheet to look for 
			 * @return a new id composed of styleSheetPrefix + available counter
			 */
			getUniqueStyleSheetId: function (styleSheetPrefix) {
				var styleSheetId = styleSheetPrefix;
				var counter = 0;
				while (this.getStyleSheet(styleSheetId) !== null) {
					counter++;
					styleSheetId = styleSheetPrefix + counter;
				}
				return styleSheetId;
			},

			/**
			 * Remove CSS rule from specified style sheet in DOM
			 * @param sheetId sheetId to look for
			 * @param cssClassName class name to delete
			 * @return number of deleted CSS classes
			 */
			removeCssClass: function (sheetId, cssClassName) {

				var deleted = 0;
				try {
					var elem = $("#" + sheetId).get(0);
					var sheet = elem.sheet;

					for (var i = 0; i < sheet.cssRules.length; i++) {
						if (elem.id === sheetId) {
							if (sheet.cssRules[i].selectorText === cssClassName) {
								sheet.deleteRule(i);
								deleted++; 
							}
						}
					}
				} catch (ex) {
					//<-- Remove failed
				}
				return deleted;
			},

			/**
			 * Crea CSS rule of specified style sheet in DOM.
			 * If the style sheet do not exist it is created on the fly.
			 * @param sheetId sheetId to look for ( eg. 'myPageStyleSheet' )
			 * @param cssClassName class name to create ( eg. 'myElemClass' )
			 * @param cssStyle CSS style string without parenthesis ( eg: 'color: red; background-color: black;' )
			 */
			createCssClass: function (sheetId, cssClassName, cssStyle) {

				var sheet = this.getStyleSheet(sheetId);
				
				//--> Create new sheet
				if (!sheet) {

					//--> Pure JS way:				
					//var element = document.createElement('style');
					//element.id = sheetId;
					////--> Append style element to head
					//document.head.appendChild(element);
					//// Reference to the stylesheet
					//sheet = element.sheet;				

					//--> Create style section in page by JQuery
					$("head").append('<style id="' + sheetId + '" type="text/css"></style>');
					sheet = $("#" + sheetId).get(0).sheet;

				}

				var cssRule = cssClassName + " { " + cssStyle + " }";

				//--> Add/update the first CSS rule to the stylesheet
				this.removeCssClass(sheetId, cssClassName);
				sheet.insertRule(cssRule, 0);

			}

		});

	});