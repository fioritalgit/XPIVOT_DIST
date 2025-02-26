/*
 *  H.T. 19/02/2019 - Custom Resizable Tile 
 */

$.sap.require('sap.ui.thirdparty.jqueryui.jquery-ui-core');
$.sap.require('sap.ui.thirdparty.jqueryui.jquery-ui-widget');
$.sap.require('sap.ui.thirdparty.jqueryui.jquery-ui-mouse');
$.sap.require('sap.ui.thirdparty.jqueryui.jquery-ui-draggable');
$.sap.require('sap.ui.thirdparty.jqueryui.jquery-ui-sortable');
$.sap.require('sap.ui.thirdparty.jqueryui.jquery-ui-droppable');

/* 
  
  SAMPLE USAGE OF COMPONENT IN XML VIEW:
  --------------------------------------
  
  <!-- UI5 lib XML namespace declaration -->
  <mvc:View controllerName="it.fiorital.FioritalApp.controller.SampleView" ... xmlns:flib="it.fiorital.fioritalui5lib">
  ...
  <!-- Control usage -->
  <flib:controls.FioriTile width="13em" height="2em" padding="0.5em" class="tileGreen">
    <HBox>
      <core:Icon src="sap-icon://shipping-status"></core:Icon>
      <HBox width="0.5em"></HBox>
      <Label text="8:45 - DHL"></Label>
    </HBox>
  </flib:controls.FioriTile>
  ...

 */
 
sap.ui.define([
	"sap/ui/core/Control"
], function (Control) {
	"use strict";
	return Control.extend("it.fiorital.fioritalui5lib.controls.NewsTile", {
		/**
		 *    Metadata:
		 *    Where properties, aggregations and events
		 *    are declared
		 */
		metadata: {
			properties: {
				noData: {
					type: "string",
					defaultValue: "No data"
				},
				width: {
					type: "sap.ui.core.CSSSize",
					defaultValue: "auto"
				},
				height: {
					type: "sap.ui.core.CSSSize",
					defaultValue: "auto"
				},
				padding: {
					type: "sap.ui.core.CSSSize",
					defaultValue: "1rem"
				},
				borderColor: {
					type: "string",
					defaultValue: "#418ac7"
				},
				color: {
					type: "string",
					defaultValue: ""
				}
			},
			defaultAggregation: "content",
			aggregations: {
				content: {
					type: "sap.ui.core.Control",
					multiple: false, // 1:1
					singularName: "content"
				}
			}
		},
		/**
		 *      Init: Called when object is being created
		 *      @public
		 */
		init: function () {
			this._oNoDataLabel = new sap.m.Label().addStyleClass("cockpitPanelContainerNoData");
		},
		onAfterRendering: function () {
			var myId = this.getId();
			
			//--> let the tile be draggable (jaquery UI)
			$("#"+myId).draggable({
				cancel: false,
				cursorAt: { left: 5, top: 5 },
				helper: function (event) {
					return $("<div id ='drg' class='dot' style='z-index:999 '></div>");
				}
			});                         
		},
		/**
		 *    Exit: Garbage collector
		 *      @public
		 */
		exit: function () {
			this._oNoDataLabel.destroy();
			delete this._oNoDataLabel;
		},
		
		renderer: {
			
			 /**
			  * Renders the HTML for the given control, using the provided
			  * {@link sap.ui.core.RenderManager}.
	          *    Main method for custom objects.
	          *    In order to display the object with properties
	          *    and aggregations defined, the method below
	          *    treat them, and allows the developer to insert
	          *    css classes or styles
			  * @param {sap.ui.core.RenderManager} oRm
			  *            the RenderManager that can be used for writing to
			  *            the Render-Output-Buffer
			  * @param {sap.ui.core.Control} oControl
			  *            the control to be rendered
			  */
			render: function (oRm, oControl) {
				oRm.write("<div tabindex=\"0\"");
				oRm.writeControlData(oControl);

				//---> write classes (standard ones)
				oRm.addClass("sapMGT");
				oRm.addClass("sapUiTinyMarginBegin");
				oRm.addClass("sapUiTinyMarginTop");
				oRm.writeClasses();

				//---> write styles (from control meta XML data)
				oRm.addStyle("padding", oControl.getPadding());
				oRm.addStyle("height", oControl.getHeight());
				oRm.addStyle("width", oControl.getWidth());
				oRm.addStyle("border", "0px");
				oRm.addStyle("border-radius","0px");
				oRm.addStyle("border-left","0.6rem solid "+oControl.getBorderColor());

				if (oControl.getColor() !== ''){
					oRm.addStyle("background-color", oControl.getColor());	
				}

				oRm.writeStyles();

				oRm.write(">");
				this._renderContent(oRm, oControl); //
				oRm.write("</div>");
			},
			/**
			 *    Render each object of content aggregation
			 *    to the main object
			 *    @private
			 *    @param {object} oRm
			 *    @param {object} oControl
			 */
			_renderContent: function (oRm, oControl) {
				var oContent = oControl.getAggregation("content");
				if (!oContent || oContent.length === 0) {
					// no data found on content aggregation
					this._renderNoData(oRm, oControl);
				} else {
					oRm.renderControl(oControl.getContent());
				}
			},
			/**
			 *    Render 'noData' property to the main object
			 *    @private
			 *    @param {object} oRm
			 *    @param {object} oControl
			 */
			_renderNoData: function (oRm, oControl) {
				if (!oControl._oNoDataLabel.getText()) {
					// force "no data" text in case of empty container
					oControl._oNoDataLabel.setText("Empty Tile");
				}
				oRm.write("<div");
				oRm.writeClasses();
				oRm.write(">");
				oRm.renderControl(oControl._oNoDataLabel);
				oRm.write("</div>");
			}
		}
	});
});