
sap.ui.define(["jquery.sap.global", "./../library", "sap/ui/core/XMLComposite"],
	function (jQuery, library, XMLComposite) {
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
		var MessageOutputManager = XMLComposite.extend("it.fiorital.fioritalui5lib.controls.MessageOutputManager", {
	        metadata: {
	        	library: "it.fiorital.fioritalui5lib",
	            properties: {
	            	/**
					 * title
					 */
	                title: {
	                	type: "string", 
	                	defaultValue: "Message Output Manager"
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
					messageItems : {
						type: "sap.m.ColumnListItem", 
						multiple: true,
						forwarding: {
                           idSuffix: "--listMessage",
                           aggregation: "items",
                           forwardBinding: true,
                           invalidate: true
                		}
					}
					// logItems : {
					// 	type: "sap.m.ColumnListItem",
					// 	multiple: true,
					// 	forwarding: {
					// 		idSuffix: "--listLogs",
					// 		aggregation: "items",
     //                   	forwardBinding: true,
     //                   	invalidate: true
					// 	}
						
					// }
	        	},
	            defaultAggregation : "messageItems"
	        },
	        		
	        init: function() {
				
				//--> super
			XMLComposite.prototype.init.apply(this, arguments);
				
	        },
	        
	        applySettings: function(mSettings, oScope) {
	            mSettings.messageItems.template = this.getAggregation("messageItems")[0].clone();
	            //mSettings.logItems.template = this.getAggregation("logItems")[0].clone();
	            
	            XMLComposite.prototype.applySettings.apply(this, arguments);
	        }
	        
	    });
	    
	    MessageOutputManager.prototype.openBy = function(control) {
	    	this.byId("popoverMessageOutput").openBy(control);
	    };
	    
	    MessageOutputManager.prototype.bindItems = function(pathItems, pathLogItems) {
	    	this.byId("listMessage").bindItems({
	    		path: pathItems,
	    		template: this.byId("listTemplate")
	    	});
	    	
	    	this.byId("listLogs").bindItems({
	    		path: pathLogItems,
	    		template: this.byId("listTemplate")
	    	});
	    };
	    
	    MessageOutputManager.prototype.refresh = function() {
	    	this.byId("listMessage").getBinding("items").refresh();
	    	this.byId("listLogs").getBinding("logItems").refresh();
	    };
	    
	    MessageOutputManager.prototype._getInternalist = function() {
	    	return this.byId("listMessage");
	    };
	    
	    MessageOutputManager.prototype._onCloseButtonPress = function() {
	    	
	    	this._backToMessages();
	    	this.byId("popoverMessageOutput").close();
	    };
	    
	    MessageOutputManager.prototype._onMessagePress = function(oEvent) {

			
			this.byId("listLogs").setBindingContext(oEvent.getSource().getBindingContext());
			
			var oBindingInfo = {
				 path: "NastLogs", 
				 parameters: {
					 $$updateGroupId: "directGroup", 
					 $$groupId: "directGroup" 
				},
				template: this.byId("LogsColumnListItemId")
			};
			
			this.byId("listLogs").bindAggregation("items", oBindingInfo);
			
			if(this.byId("listLogs").getBinding("items").isSuspended() === true){
				this.byId("listLogs").getBinding("items").resume();
			}
			
			this.byId("listMessage").setVisible(false);
			this.byId("listLogs").setVisible(true);

	    };
	    
	    MessageOutputManager.prototype._backToMessages = function(oEvent) {
	    	
	    	this.byId("listLogs").setVisible(false);
	    	this.byId("listMessage").setVisible(true);
			
	    };
	    
	    return MessageOutputManager;
	}, /* bExport= */ true);