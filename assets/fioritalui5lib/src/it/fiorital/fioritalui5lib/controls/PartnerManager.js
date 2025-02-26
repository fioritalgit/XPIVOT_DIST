sap.ui.define([
		"jquery.sap.global",
		"sap/ui/core/XMLComposite",
		"sap/m/MessageToast",
		"it/fiorital/fioritalui5lib/utility/FilterManager",
		"it/fiorital/fioritalui5lib/utility/utilities",
		"it/fiorital/fioritalui5lib/controls/FioritalMessageStrip"
	],
	function (jQuery, XMLComposite, MessageToast, FilterManager, SharedUtilities, FioritalMessageStrip) {

		var PartnerManager = XMLComposite.extend("it.fiorital.fioritalui5lib.controls.PartnerManager", {
			SharedUtilities: SharedUtilities,
			
			metadata: {
				library: "it.fiorital.fioritalui5lib",
				properties: {
					/**
					 * PartnerManager's dialog title
					 */
					title: {
						type: "string",
						defaultValue: "Partner Manager"
					}
				},
				defaultAggregation: "items"
			},

			init: function () {
				//--> super
				XMLComposite.prototype.init.apply(this, arguments);
				
				this._partnerSchemaDialog = this.byId("partnerSchemaDialogId");
				
				this._partnerRoles = this.byId("partnerRoleSelectionId");
				this._currentPartners = this.byId("partnerSchemaTableId");
				this._newPartnerList = this.byId("newPartnerSelectionId");
				this._editPartnerList = this.byId("editPartnerSelectionId");
				
				this._initViewModel();
			},

			applySettings: function (mSettings, oScope) {
				//--> super
				XMLComposite.prototype.applySettings.apply(this, arguments);
			},
			
			

			openByEvent: function (oEvent, bReadOnly) {
				//--> init data to enable/disable add button
				this._resetData();
				
				if(	SharedUtilities.isEmpty(bReadOnly) ){
					bReadOnly = false;
				}
				this.oViewModel.setProperty("/readOnly", bReadOnly); 
				
				//--> bind calling context to page
				this.bindElement({path: oEvent.getSource().getBindingContext().getPath() });
				
				this._partnerSchemaDialog.open(oEvent.getSource());
			},

			//----------------------------------------> control EVENTS
			_onSelectTypeChange: function (oEvent) {
				var sPartnerRole = this._partnerRoles.getSelectedKey(),
					oBinding = this._newPartnerList.getBinding("suggestionRows");

				if(!oBinding.isSuspended()){
					oBinding.suspend();
				}
				
				var aFilterIds = ["salesrole"],
					aFilterValues = [sPartnerRole], 
					operator = "equal",
					aFilters = FilterManager.createSearchFilterObject(aFilterIds, aFilterValues, operator);    
					
				oBinding.filter(aFilters);
			
				this.oViewModel.setProperty("/hasPartnerTypeValue", true);
				this._toggleButtonEnabling();
			},

			_onstartPartnerCodeSuggest: function (oEvent) {
				var oBinding = this._newPartnerList.getBinding("suggestionRows");

				if(oBinding.isSuspended()){
					oBinding.resume();
				}
				
				//--> Fix re-query suggestion: resume do not fire a new odata query so 
				//--> when user typed a filter value this was used to apply a frontend filter among the values 
				//--> retrieved by the first query performed selecting the partner role ( a top 100 query )
				//--> Added binding filter to force odata re-query.
				var allFilters = [],
					sPartnerRole = this._partnerRoles.getSelectedKey(),
				    aFilterIds = ["salesrole"], 
				    aFilterValues = [sPartnerRole], 
				    operator = "equal",
				    roleFilter = FilterManager.createMultipleSearchFilterObject(aFilterIds, aFilterValues, operator, false);  
					
				var otherFilterIds = ["partnernr", "name"], 
					otherFilterValues = [ oEvent.getParameter("suggestValue"), oEvent.getParameter("suggestValue")], 
					otherOperator = "contains",
					otherFilters = FilterManager.createMultipleSearchFilterObject(otherFilterIds, otherFilterValues, otherOperator, false); 
				
				allFilters.push(roleFilter);
				allFilters.push(otherFilters);
				
				var filter = FilterManager.mergeFilters(allFilters, true);
				oBinding.filter(filter);
				//<-- Fix TOP 100 filtering
				
			},
		
			_onstartInlinePartnerCodeSuggest: function(oEvent){
				// lose binding, in init is read
				var oBindingInline = oEvent.getSource().getBinding("suggestionRows"),
					sPartnerRole = oEvent.getSource().getBindingContext().getProperty("partnerrole");
					
				var src = oEvent.getParameter('suggestValue').toUpperCase();
					
				if(oBindingInline.isSuspended()){
					oBindingInline.resume();
				}

				var aFilterIds = ["salesrole"], 
					aFilterValues = [sPartnerRole], 
					operator = "equal",
					aFilters = FilterManager.createSearchFilterObject(aFilterIds, aFilterValues, operator);    
					
				var aFilterIds2 = ["nameupper"], 
					aFilterValues2 = [src], 
					operator2 = "contains",
					aFilters2 = FilterManager.createSearchFilterObject(aFilterIds2, aFilterValues2, operator2);  
					
				var finalFilter = FilterManager.mergeFilters([aFilters[0],aFilters2[0]],true);
					
				oBindingInline.filter(finalFilter);
			},

			_onInputCodeChange: function (oEvent) {
				this.oViewModel.setProperty("/hasPartnerCodeValue", true);
				this._toggleButtonEnabling();
			},
			
			_toggleButtonEnabling: function () {
				if (this.oViewModel.getProperty("/hasPartnerTypeValue") && this.oViewModel.getProperty("/hasPartnerCodeValue")) {
					this.oViewModel.setProperty("/isButtonEnabled", true);
				} else {
					this.oViewModel.setProperty("/isButtonEnabled", false);
				}
			},

			_onAddPartner: function(oEvent){
				var sFunctionCode = this._partnerRoles.getSelectedKey(),
					sIntFunctionCode = this._partnerRoles.getSelectedItem().getBindingContext().getProperty("intfunccode"),
					sRefDocType = this._currentPartners.getBinding("items").getContexts()[0].getProperty("refDocumentType"),
					sRefDocPos = this._currentPartners.getBinding("items").getContexts()[0].getProperty("refDocumentPos"),
					sRefDoc = this._currentPartners.getBinding("items").getContexts()[0].getProperty("refDocument"),
					sPartnerCnt = this._currentPartners.getBinding("items").getContexts()[0].getProperty("partenerCnt"),
					sPartnerCode = this._newPartnerList.getValue();
					
				var oPartnerData = {
					partnerrole: sFunctionCode,
					intpartnerrole: sIntFunctionCode,
					partnernr: sPartnerCode,
					refDocumentType: sRefDocType,
					refDocument: sRefDoc,
					refDocumentPos: sRefDocPos,
					partenerCnt: sPartnerCnt
				};	
				
				var fnSuccess = function () {
					var ms = new FioritalMessageStrip(this.getModel("sharedi18n").getResourceBundle().getText("partnerAddedMessage"), {
						status: 'info',
						icon: 'sap-icon://sys-add',
						timeout: 3000
					});
					
					sap.ui.core.BusyIndicator.hide();
					this._resetData();
				}.bind(this);
				
				var fnError = function (oError) {
					this._resetData();
					this.getView().getModel().resetChanges();
					sap.ui.core.BusyIndicator.hide();
				}.bind(this);
					
				this._currentPartners.getBinding("items").create(oPartnerData).created().then(fnSuccess).catch(fnError);	
				
				sap.ui.core.BusyIndicator.show(); // Lock UI until submitBatch is resolved.	
			},

			_onPartnerDeletePress: function(oEvent){
				var fnSuccess = function (oData) {
					var ms = new FioritalMessageStrip(this.getModel("sharedi18n").getResourceBundle().getText("partnerRemovedMessage"), {
						status: 'info',
						icon: 'sap-icon://delete',
						timeout: 3000
					});
				}.bind(this);
				
				var fnError = function (oError) {
					this.getView().getModel().resetChanges();
				}.bind(this);
				
				//--> application: C|O|D --> D=Delete
				//--> delete must be an action
				oEvent.getSource().getBindingContext().delete().then(fnSuccess).catch(fnError);
			},
			
			_onSaveButtonPress: function (evt) {
				sap.ui.core.BusyIndicator.show(0);

				var fnSuccess = function () {
					sap.ui.core.BusyIndicator.hide();
					this._initViewModel(); 
					this._partnerSchemaDialog.close();
				}.bind(this);

				var fnError = function (oError) {
					this.getView().getModel().resetChanges();
					sap.ui.core.BusyIndicator.hide();
				}.bind(this);

				this._currentPartners.getModel().submitBatch("batchGroupAPI").then(fnSuccess).catch(fnError);
			},

			_onCancelButtonPress: function (evt) {
				this._initViewModel(); 
				this._partnerSchemaDialog.close();
			},
			
			_onPartnerEditPress: function(oEvent){
				//-->set text
				var oTxtCtrl = oEvent.getSource().getParent().getParent().getCells()[1].getItems()[0];
				oTxtCtrl.setVisible( !oTxtCtrl.getVisible() );
				//-->set input
				var oInputCtrl = oEvent.getSource().getParent().getParent().getCells()[1].getItems()[1];
				oInputCtrl.setVisible( !oInputCtrl.getVisible() );

				//this._partnerSchemaDialog.getModel("viewModel").setProperty("/isEnabled", true);
			},
			
			_resetData: function(){
				this._partnerRoles.setSelectedKey();
				this._newPartnerList.setValue();
				this._initViewModel();
				this._toggleButtonEnabling();
			},
			
			_initViewModel: function(){
				var oData = {
					readOnly: false,
					hasPartnerTypeValue: false,
					hasPartnerCodeValue: false,
					isEnabled: false
				};
				this.oViewModel = new sap.ui.model.json.JSONModel(oData);
				this.oViewModelName = "viewModel";
				this._partnerSchemaDialog.setModel(this.oViewModel, this.oViewModelName);
			}
		});

		return PartnerManager;

	}, true);