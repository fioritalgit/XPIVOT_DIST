sap.ui.define(["jquery.sap.global", "./../library", "sap/ui/core/XMLComposite", "it/fiorital/fioritalui5lib/formatter/SharedFormatter"],
	function (jQuery, library, XMLComposite, SharedFormatter) {
		"use strict";
		/**
		 * Document Flow Popover constructor
		 *
		 * @param {string} [sId] id for the new control, generated automatically if no id is given
		 * @param {object} [mSettings] initial settings for the new control
		 *
		 * @class
		 * XML Composite control class
		 * @extends sap.ui.core.XMLComposite
		 *
		 * @author Phantom
		 * @version ${version}
		 *
		 * @constructor
		 * @public
		 * @alias it.fiorital.fioritalui5lib.controls.DocumentFlow
		 */
		var DocumentFlow = XMLComposite.extend("it.fiorital.fioritalui5lib.controls.DocumentFlow", {
			SharedFormatter: SharedFormatter,
			metadata: {
				library: "it.fiorital.fioritalui5lib",
				properties: {
					/**
					 * title
					 */
					title: {
						type: "string",
						defaultValue: "Document Flow"
					},
					/**
					 * caption text of the document
					 */
					callerObjectCaption: {
						type: "string",
						defaultValue: ""
					}
				},
				aggregations: {
					items: {
						type: "sap.m.CustomListItem",
						multiple: true,
						forwarding: {
							idSuffix: "--listFlow",
							aggregation: "items",
							forwardBinding: true
						}
					}
				},
				defaultAggregation: "items"
			},

			init: function () {

			},

			applySettings: function (mSettings, oScope) {
				mSettings.items.template = this.getAggregation("items")[0].clone();
				XMLComposite.prototype.applySettings.apply(this, arguments);
			},

			openByEvent: function (evt) {

				this.getBinding('items').setContext(evt.getSource().getBindingContext());
				this.byId('popoverFlow').bindElement({
					path: evt.getSource().getBindingContext().getPath()
				});
				
				this.openBy(evt.getSource());

			},

			openBy: function (control) {
				this.byId("popoverFlow").openBy(control);
			},

			bindItems: function (path) {
				this.byId("listFlow").bindItems({
					path: path,
					template: this.byId("listTemplate")
				});
			},

			refresh: function () {
				this.byId("listFlow").getBinding("items").refresh();
			},

			_getInternalist: function () {
				return this.byId("listFlow");
			},

			_closeButtonFlowPress: function () {
				this.byId("popoverFlow").close();
			},
			
			//---------------------------------------------------------------------
			alphaOutputPos: function(pos){
				if (pos === undefined || pos === null || pos === ''){
					return '';
				}else{
					return ' - '+pos;
				}
			},
			
			deleteTrailZeros: function (num) {
				try {
					return num.replace(/^0+(\d)|(\d)0+$/gm, '$1$2');
				} catch (ex) {

				}
			},
			
			formatImageDoc: function(docType){
				
				switch (docType) {
					case 'C':
						return 'sap-icon://document-text';
					case 'B':
						return 'sap-icon://expense-report';
					case 'J':
						return 'sap-icon://globe';
					case 'M':
						return 'sap-icon://sales-order';
					case 'N':
						return 'sap-icon://sales-order';
					case 'O':
						return 'sap-icon://sales-order';
					case 'P':
						return 'sap-icon://sales-order';
					case 'R':
						return 'sap-icon://journey-depart';
					case 'TMFU':
						return 'sap-icon://database';
					case 'TMFO':
						return 'sap-icon://shipping-status';
						break;
					default:
				}
		
			}

		});

		return DocumentFlow;
	}, /* bExport= */ true);