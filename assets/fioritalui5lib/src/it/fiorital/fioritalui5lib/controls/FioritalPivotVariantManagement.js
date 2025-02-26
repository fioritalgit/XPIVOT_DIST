sap.ui.define([
	"sap/ui/comp/variants/VariantManagement",
	"sap/ui/table/TablePersoController",
	"it/fiorital/fioritalui5lib/controls/FioritalMessageStrip"
], function (vm, TablePersoController, messageStrip) {
	"use strict";
	return vm.extend("it.fiorital.flex5app.controls.FioritalPivotVariantManagement", {

		TablePersoController: TablePersoController,
		messageStrip: messageStrip,

		metadata: {
			properties: {

			}
		},

		constructor: function (sId, mSettings) {
			vm.prototype.constructor.apply(this, arguments);
		},

		startVariantManagement: function (pivotId, tableModel) {
			
			this.pivotId = pivotId;

			//--> find parent view
			this.fndView = undefined;
			var ctrl = this;
			while (this.fndView === undefined) {
				ctrl = ctrl.getParent();
				if (ctrl.getMetadata().getName() === 'sap.ui.core.mvc.XMLView') {
					this.fndView = ctrl;
				}
			}
			
			this.attachManage(undefined,this.onManage,this);
			this.attachSave(undefined,this.onSaveAs,this);
			this.attachSelect(undefined,this.onSelect,this);

			if (sap.ushell && sap.ushell.Container && sap.ushell.Container.getService) {

				var oComponent = sap.ui.core.Component.getOwnerComponentFor(this.fndView);
				this.oPersonalizationService = sap.ushell.Container.getService("Personalization");

				var oPersId = {
					container: "PivotPersonalisation",
					item: pivotId
				};

				//--> define scope 
				var oScope = {
					keyCategory: this.oPersonalizationService.constants.keyCategory.FIXED_KEY,
					writeFrequency: this.oPersonalizationService.constants.writeFrequency.LOW,
					clientStorageAllowed: true
				};

				//--> Get a Personalizer
				var oPersonalizer = this.oPersonalizationService.getPersonalizer(oPersId, oScope, oComponent);
				this.oPersonalizationService.getContainer("PivotPersonalisation", oScope, oComponent)
					.fail(function () {}).done(function (oContainer) {

						this.oContainer = oContainer;
						this.oVariantSetAdapter = new sap.ushell.services.Personalization.VariantSetAdapter(this.oContainer);

						//--> get variant set which is stored in backend
						this.oVariantSet = this.oVariantSetAdapter.getVariantSet(pivotId+"Set");

						//--> if not in backend, then create one
						if (!this.oVariantSet) {
							this.oVariantSet = this.oVariantSetAdapter.addVariantSet(pivotId+"Set");
						}
						//--> array to store the existing variants
						var Variants = [];
						
						//--> now get the existing variants from the backend to show as list
						for (var key in this.oVariantSet.getVariantNamesAndKeys()) {
							if (this.oVariantSet.getVariantNamesAndKeys().hasOwnProperty(key)) {
								var oVariantItemObject = {};
								oVariantItemObject.Key = this.oVariantSet.getVariantNamesAndKeys()[key];
								oVariantItemObject.Name = key;
								Variants.push(oVariantItemObject);
							}
						}

						//--> create JSON model and attach to the variant management UI control
						tableModel.setData(Variants);

					}.bind(this));

			}

		},

		onSaveAs: function (oEvent) {

			//--> get variant parameters:
			var VariantParam = oEvent.getParameters();

			//--> get pivot setup
			var pivotSet = this.fndView.byId(this.pivotId).getParametersSet();                    

			this.oVariant = this.oVariantSet.addVariant(VariantParam.name);
			if (this.oVariant) {
				this.oVariant.setItemValue("PivotVals", JSON.stringify(pivotSet));
				if (VariantParam.def === true) {
					this.oVariantSet.setCurrentVariantKey(this.oVariant.getVariantKey());
				}
				this.oContainer.save().done(function () {

					var msg = new this.messageStrip('variante salvata correttamente', {
						status: 'info',
						icon: 'sap-icon://message-information',
						timeout: 3000
					});

				}.bind(this));
			}
		},

		onSelect: function (oEvent) {
			var selectedKey = oEvent.getParameters().key;
			for (var i = 0; i < oEvent.getSource().getVariantItems().length; i++) {
				if (oEvent.getSource().getVariantItems()[i].getProperty("key") === selectedKey) {
					var selectedVariant = oEvent.getSource().getVariantItems()[i].getProperty("text");
					break;
				}
			}
			this._setSelectedVariantToTable(selectedVariant);
		},

		_setSelectedVariantToTable: function (oSelectedVariant) {

			if (oSelectedVariant) {
				var sVariant = this.oVariantSet.getVariant(this.oVariantSet.getVariantKeyByName(oSelectedVariant));
				var pivotSetup = JSON.parse(sVariant.getItemValue("PivotVals"));

				this.fndView.byId(this.pivotId).loadData(null,undefined,undefined,undefined,false,pivotSetup);
			}
			// null means the standard variant is selected or the variant which is not available, then show all columns
			else {
				
				this.fndView.byId(this.pivotId).loadData(null,[],[],[]);
				
			}
		},

		onManage: function (oEvent) {
			
			var aParameters = oEvent.getParameters();
			// rename variants
			if (aParameters.renamed.length > 0) {
				aParameters.renamed.forEach(function (aRenamed) {
					var sVariant = this.oVariantSet.getVariant(aRenamed.key),
						sItemValue = sVariant.getItemValue("PivotVals");
					// delete the variant 
					this.oVariantSet.delVariant(aRenamed.key);
					// after delete, add a new variant
					var oNewVariant = this.oVariantSet.addVariant(aRenamed.name);
					oNewVariant.setItemValue("PivotVals", sItemValue);
				}.bind(this));
			}
			// default variant change
			if (aParameters.def !== "*standard*") {
				this.oVariantSet.setCurrentVariantKey(aParameters.def);
			} else {
				this.oVariantSet.setCurrentVariantKey(null);
			}
			// Delete variants
			if (aParameters.deleted.length > 0) {
				aParameters.deleted.forEach(function (aDelete) {
					this.oVariantSet.delVariant(aDelete);
				}.bind(this));
			}
			//  Save the Variant Container
			this.oContainer.save().done(function () {
				// Tell the user that the personalization data was saved
			});
		},

		renderer: "sap.ui.comp.variants.VariantManagementRenderer" //<--- set standard renderer!
	});
});