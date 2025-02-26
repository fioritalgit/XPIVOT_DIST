/*!
 * ${copyright}
 */
// Provides control it.fiorital.fioritalui5lib.Example.
sap.ui.define(["jquery.sap.global", "./../library", "sap/ui/core/Control"],
	function (jQuery, library, Control) {
		"use strict";
		/**
		 * Constructor for a new Example control.
		 *
		 * @param {string} [sId] id for the new control, generated automatically if no id is given
		 * @param {object} [mSettings] initial settings for the new control
		 *
		 * @class
		 * Some class description goes here.
		 * @extends sap.ui.core.Control
		 *
		 * @author SAP SE
		 * @version ${version}
		 *
		 * @constructor
		 * @public
		 * @alias it.fiorital.fioritalui5lib.controls.Example
		 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
		 */
		var Example = Control.extend("it.fiorital.fioritalui5lib.controls.Example", {
			metadata: {
				library: "it.fiorital.fioritalui5lib",
				properties: {

					/**
					 * text
					 */
					text: {
						type: "string",
						group: "Misc",
						defaultValue: null
					}

				},
				events: {
					/**
					 * Event is fired when the user clicks on the control.
					 */
					press: {}

				}
			}
		});
		return Example;
	}, /* bExport= */ true);