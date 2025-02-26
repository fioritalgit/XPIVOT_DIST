/* eslint no-debugger: 0 */

/*
 * NOTE: based on jquery-qrcode library stored in libs/qrcode folder.
 *
 * USAGE:
 *  XML View namespace declaration:
 *  <mvc:View xmlns:flib="it.fiorital.fioritalui5lib.controls"  ... />
 *
 *  XML sample declaration:
 *  <flib:QRCodeControl id="QRCode" />
 *
 *  JS sample of  QRCode rendering in View controller 
 *	onPressBtnGenerateQRCode: function(oEvent) {
 *		
 *      //--> Get QRCodeControl
 *		var qrCodeCtrl = this.getView().byId("QRCode");
 
 *      //--> Draws resulting QRCode in QRCodeControl
 *		qrCodeCtrl.encodeQR("TextToEncode");
 *
 *	},
 *
 **/

//jQuery.sap.registerModulePath("libs.qrcode.jquery-qrcode-0.17.0", "libs/qrcode/jquery-qrcode-0.17.0");

sap.ui.define([
	"sap/ui/core/Control",
	"sap/ui/dom/includeStylesheet",
	"sap/ui/dom/includeScript",
	"it/fiorital/fioritalui5lib/libs/qrcode/jquery-qrcode-0.17.0",
	"sap/base/Log"
], function (Control, includeStylesheet, includeScript, qrcodelib, Log) {
	"use strict";
	return Control.extend("it.fiorital.fioritalui5lib.controls.QRCodeControl", {
		qrcodelib: qrcodelib,
		
		metadata: {
			properties: {
				text: {
					type: "string",
					defaultValue: ""
				},
				width: {
					type: "sap.ui.core.CSSSize",
					defaultValue: ""
				},
				height: {
					type: "sap.ui.core.CSSSize",
					defaultValue: ""
				},
				size: {
					type: "integer",
					defaultValue: 100
				}
			},
			aggregations: {},
			defaultAggregation: ""
		},

		_includeControlCSS: function (cssName) {

			//---> in FLP ??
			var baseurl = "";
			if (sap.ushell !== undefined && sap.ushell.Container !== undefined && sap.ushell.Container.getService("AppLifeCycle") !== undefined) {

				var cmp = sap.ushell.Container.getService("AppLifeCycle").getCurrentApplication().componentInstance;
				var appName = cmp.getMetadata().getLibraryName().split('.').pop();
				baseurl = this.getMetadata().getLibraryName();
				baseurl = 'sap/fiori/' + appName + '/resources/' + baseurl.split('.').join('/') + '/' + cssName;
				includeStylesheet(baseurl);

			} else {
				//---> ABAP stack 
				try { //prevent abort on SCP
					baseurl = this.getMetadata().getLibraryName();
					baseurl = '../zfioritalui5lib/controls/' + cssName;
					includeStylesheet(baseurl);
				} catch (ex) {}

				//---> SCP
				try { //prevent abort on abap
					baseurl = this.getMetadata().getLibraryName();
					baseurl = 'resources/' + baseurl.split('.').join('/') + '/' + cssName;
					includeStylesheet(baseurl);
				} catch (ex) {}
			}

		},

		/*
		 * Include external JS libraries given relative path in UI5 library:
		 * @param scriptPath: path to JS source to load
		 */
		_includeControlExtLib: function (scriptPath) {

			//---> in FLP ??
			try {
				var baseurl = "";
				if (sap.ushell !== undefined && sap.ushell.Container !== undefined && sap.ushell.Container.getService("AppLifeCycle") !==
					undefined) {

					var cmp = sap.ushell.Container.getService("AppLifeCycle").getCurrentApplication().componentInstance;
					var appName = cmp.getMetadata().getLibraryName().split('.').pop();
					baseurl = this.getMetadata().getLibraryName();
					baseurl = 'sap/fiori/' + appName + '/resources/' + baseurl.split('.').join('/') + '/' + scriptPath;
					includeScript(baseurl);

				} else {

					//---> ABAP stack 
					try { //prevent abort on SCP
						baseurl = this.getMetadata().getLibraryName();
						baseurl = '../zfioritalui5lib/' + scriptPath;
						includeScript(baseurl);
					} catch (ex) {}

					//---> SCP
					//--> getLibraryName() points to current ( = 'controls') folder
					baseurl = this.getMetadata().getLibraryName();
					//--> Manage relative paths
					if (scriptPath && scriptPath.indexOf("..") === 0) {
						var pathTokens = scriptPath.split("/");
						for (var i = 0; i < pathTokens.length; i++) {
							if (pathTokens[i] === "..") {
								//--> Remove last branch of base path and .. from scriptPath
								baseurl = baseurl.substring(0, baseurl.lastIndexOf("."));
								scriptPath = scriptPath.substring(scriptPath.indexOf("/") + 1);
							} else {
								break;
							}
						}
					}
					try { //prevent abort on ABAP
						baseurl = 'resources/' + baseurl.split('.').join('/') + '/' + scriptPath;
						includeScript(baseurl);
					} catch (ex) {}

				}
			} catch (ex) {
				Log.error("Exception loadig library '" + scriptPath + "' from URL: '" + baseurl + "': " + ex);
			}

		},

		init: function () {

			//--> Include control CSS taking care of deplyment platform 
			//jQuery.sap.includeStyleSheet("controls/css/QRCodeControl.css"); 
			this._includeControlCSS("QRCodeControl.css");

			//--> Fix: loaded by sap.ui.define on top of source
			//--> Include external library taking care of deplyment platform 
			//this._includeControlExtLib("../libs/qrcode/jquery-qrcode-0.17.0.js");

		},

		encodeQR: function (text, otherOptions) {

			try {

				var renderType = "div";
				if (otherOptions && otherOptions.div) {
					renderType = otherOptions.div;
				}
				
				var size = this.getSize();
				
				var qrOptions = {
					"render": renderType,
					"text": text,
					"size": size
				};

				//--> Merge otherOptions on qrOptions
				$.extend(qrOptions, otherOptions);

				var qrcodeDiv = $("#" + this.getId());
				qrcodeDiv.empty();
				qrcodeDiv.qrcode(qrOptions);

			} catch (ex) {
				//<-- Exception
				Log.error("QRCode Exception: " + ex);
			}
		},

		setText: function (text) {
			this.setProperty("text", text);
			//--> Generate qrcode
			//this.encodeQR(text);
			
			this.ztext = text;
		},
		
		onAfterRendering: function(){
			this.encodeQR(this.ztext);
		},

		renderer: function (oRm, oControl) {

			oRm.write("<div");
			oRm.writeControlData(oControl);
			oRm.addClass("qrcode-container");
			oRm.writeClasses();

			//--> Control size
			var style = "";
			if (oControl.getWidth() !== "") {
				style = "width: " + oControl.getWidth() + "; ";
			}
			if (oControl.getHeight() !== "") {
				style = style + "height: " + oControl.getHeight() + "; ";
			}
			if (style !== "") {
				oRm.write(" style=\"" + style + "\"");
			}

			oRm.write(">");

			oRm.write("</div>");
			
		}
	});
});