/*!
 * ${copyright}
 */

/**
 * Initialization Code and shared classes of library it.fiorital.fioritalui5lib.
 */
sap.ui.define(["jquery.sap.global",
		"sap/ui/core/library"
	], // library dependency
	function ( /*jQuery*/ ) {

		"use strict";

		/**
		 * FIORITAL UI5 common resources
		 *
		 * @namespace
		 * @name it.fiorital.fioritalui5lib
		 * @author SAP SE
		 * @version ${version}
		 * @public
		 */

		// delegate further initialization of this library to the Core
		sap.ui.getCore().initLibrary({
			name: "it.fiorital.fioritalui5lib",
			version: "${version}",
			dependencies: ["sap.ui.core"],
			types: [],
			interfaces: [],
			controls: [
				"it.fiorital.fioritalui5lib.controls.DocumentFlow",
				"it.fiorital.fioritalui5lib.controls.Example",
				"it.fiorital.fioritalui5lib.controls.FioriTile",
				"it.fiorital.fioritalui5lib.controls.MyFirstCompositeControl",
				"it.fiorital.fioritalui5lib.controls.RollerSelector",
				"it.fiorital.fioritalui5lib.controls.FioritalMessageStrip",
				"it.fiorital.fioritalui5lib.controls.FioritalMessageManager",
				"it.fiorital.fioritalui5lib.controls.MultiInputControl",
				"it.fiorital.fioritalui5lib.controls.FreightOrderList",
				"it.fiorital.fioritalui5lib.controls.PhotoPicker",
				"it.fiorital.fioritalui5lib.controls.Clock",
				"it.fiorital.fioritalui5lib.controls.QRCodeControl",
				"it.fiorital.fioritalui5lib.framework.model.json.JSONModel"
			],
			elements: []
		});

		/* eslint-disable */
		return it.fiorital.fioritalui5lib;
		/* eslint-enable */

	}, /* bExport= */ false);