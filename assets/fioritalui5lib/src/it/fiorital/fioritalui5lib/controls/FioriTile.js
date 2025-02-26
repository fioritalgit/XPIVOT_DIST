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
	"sap/ui/core/Control",
	'sap/ui/thirdparty/jqueryui/jquery-ui-core',
	'sap/ui/thirdparty/jqueryui/jquery-ui-widget',
	'sap/ui/thirdparty/jqueryui/jquery-ui-mouse',
	'sap/ui/thirdparty/jqueryui/jquery-ui-draggable',
	'sap/ui/thirdparty/jqueryui/jquery-ui-sortable',
	'sap/ui/thirdparty/jqueryui/jquery-ui-droppable'
], function (Control, jqCore, jqWidget, jqMouse, jqDraggable, jqSortablem, jqDroppable) {
	"use strict";
	return Control.extend("it.fiorital.fioritalui5lib.controls.FioriTile", {
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
				color: {
					type: "string",
					defaultValue: ""
				},
				dragElementName: {
					type: "string",
					defaultValue: ""
				},
				draggable: {
					type: "boolean",
					defaultValue: false
				},
				droppable: {
					type: "boolean",
					defaultValue: false
				},
				borderColor:{
					type: "string",
					defaultValue: ''
				},
				selected:{
					type: "boolean",
					defaultValue: false
				},
				selectedBack:{
					type: "boolean",
					defaultValue: false
				},
				selectedBackColor:{
					type: "string",
					defaultValue: ''
				},
				canAcceptDrop:{
					type: "boolean",
					defaultValue: false
				},
				opaque:{
					type: "boolean",
					defaultValue: false
				},
				background:{
					type: "string",
					defaultValue: ''
				}
			},
			defaultAggregation: "content",
			aggregations: {
				content: {
					type: "sap.ui.core.Control",
					multiple: false, // 1:1
					singularName: "content"
				}
			},
			events: {
				onDragClose: {
					parameters: {
						event: {
							type: "object"
						},
						ui: {
							type: "object"
						}
					}
				},
				onDragStart: {
					parameters: {
						event: {
							type: "object"
						},
						ui: {
							type: "object"
						}
					}
				},
				onDragMove: {
					parameters: {
						event: {
							type: "object"
						},
						ui: {
							type: "object"
						}
					}
				},
				onDropOut: {
					parameters: {
						event: {
							type: "object"
						},
						ui: {
							type: "object"
						}
					}
				},
				onDropOver: {
					parameters: {
						event: {
							type: "object"
						},
						ui: {
							type: "object"
						}
					}
				},
				onDrop: {
					parameters: {
						event: {
							type: "object"
						},
						ui: {
							type: "object"
						}
					}
				},
				onAccept: {
					parameters: {
						draggable: {
							type: "object"
						}
					}
				},
				press: {
					parameters: {
						data: {
							type: "object"
						},
						jqe: {
							type: "object"
						}
					}
				},
				rightPress: {
					parameters: {
						data: {
							type: "object"
						},
						jqe: {
							type: "object"
						}
					}
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
		
		_click: function(jqe){
			this.fireEvent("press", {jqe:jqe});
		},
		
		_rightClick: function(jqe){
			this.fireEvent("rightPress", {jqe:jqe});
			jqe.preventDefault();
			jqe.stopPropagation();                         
		},
		
		switchBackSelected: function(){
			if (this.getSelectedBack()){
				this.setSelectedBack(false);
			}else{
				this.setSelectedBack(true);
			}
		},
		
		onAfterRendering: function () {
			var myId = this.getId();
			
			this.$().off(); //<--- remove old handlers!
			this.$().click(this._click.bind(this));
		
			this.$().contextmenu(this._rightClick.bind(this));            
			
			if (this.getOpaque()){
				this.$().css('opacity','0.35');
			}
			
			if (this.getSelectedBack()){
				
				if (this.getSelectedBackColor() === ''){
					this.$().css('background-color','beige');	
				}else{
					this.$().css('background-color',this.getSelectedBackColor());	
				}
				
			}

			//--> let the tile be draggable (jaquery UI)
			if (this.getDraggable()) {

				$("#" + myId).draggable({
					cancel: false,
					zIndex: 99999,
					stack: '.stack',
					cursorAt: {
						left: 5,
						top: 5
					},
					helper: function (event) {

						var el = $('<div id="drgcreated" class="dot" style="z-index: 999;"></div>');
						$("body").append(el);  //<-- must append to BODY for overlay problems
						return el;

					}.bind(this),
					stop: function (event, ui) {

						this.fireEvent("onDragClose", {
							event: event,
							ui: ui
						});

					}.bind(this),
					start: function (event, ui) {

						this.fireEvent("onDragStart", {
							event: event,
							ui: ui
						});

					}.bind(this),
					drag: function (event, ui) {

						this.fireEvent("onDragMove", {
							event: event,
							ui: ui
						});

					}.bind(this)
				});

			}

			if (this.getDroppable()) {

				$("#" + myId).droppable({
					out: function (event, ui) {
						var comp = sap.ui.getCore().byId(event.target.id);
						comp.removeStyleClass('backMark');
						
						this.fireEvent("onDropOut", {
							event: event,
							ui: ui
						});
					}.bind(this),
					over: function (event, ui) {
						var comp = sap.ui.getCore().byId(event.target.id);
						comp.addStyleClass('backMark');
						
						this.fireEvent("onDropOver", {
							event: event,
							ui: ui
						});
					}.bind(this),
					drop: function (event, ui) {
						var sourceId = ui.draggable.attr('id');
						var targetId = event.target.id;

						var comp = sap.ui.getCore().byId(event.target.id);
						comp.removeStyleClass('backMark');
						
						this.fireEvent("onDrop", {
							'event': event,
							'ui': ui
						});
					}.bind(this),
					accept: function (dragElement) {
						
						this.fireEvent("onAccept", {
							'draggable': dragElement
						});
						
						return this.getCanAcceptDrop();
					}.bind(this),
					intersect: 'fit'
				});

			}

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
				
				if (oControl.getBorderColor() !== ''){
					oRm.addStyle("border-left", '0.3em solid '+oControl.getBorderColor());
				}
				
				if (oControl.getSelected() == true){
					oRm.addStyle("border-color", 'red');
					oRm.addStyle("border-width", '0.2em');
				}

				if (oControl.getColor() !== '') {
					oRm.addStyle("background-color", oControl.getColor());
				}
				
				if (oControl.getBackground() !== '') {
					oRm.addStyle("background", oControl.getBackground());
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