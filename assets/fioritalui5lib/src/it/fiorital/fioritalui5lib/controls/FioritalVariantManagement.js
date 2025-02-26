sap.ui.define([
	"sap/ui/comp/variants/VariantManagement",
	"sap/ui/table/TablePersoController",
	"it/fiorital/fioritalui5lib/controls/FioritalMessageStrip"
], function (vm, TablePersoController, messageStrip) {
	"use strict";
	return vm.extend("it.fiorital.flex5app.controls.FioritalVariantManagement", {

		TablePersoController: TablePersoController,
		messageStrip: messageStrip,

		metadata: {
			properties: {

			}
		},

		constructor: function (sId, mSettings) {
			vm.prototype.constructor.apply(this, arguments);
		},

		startVariantManagement: function (tableId, tableModel) {
			
			this.tableId = tableId;

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
					container: "TablePersonalisation",
					item: tableId
				};

				//--> define scope 
				var oScope = {
					keyCategory: this.oPersonalizationService.constants.keyCategory.FIXED_KEY,
					writeFrequency: this.oPersonalizationService.constants.writeFrequency.LOW,
					clientStorageAllowed: true
				};

				//--> Get a Personalizer
				var oPersonalizer = this.oPersonalizationService.getPersonalizer(oPersId, oScope, oComponent);
				this.oPersonalizationService.getContainer("TablePersonalisation", oScope, oComponent)
					.fail(function () {}).done(function (oContainer) {

						this.oContainer = oContainer;
						this.oVariantSetAdapter = new sap.ushell.services.Personalization.VariantSetAdapter(this.oContainer);

						//--> get variant set which is stored in backend
						this.oVariantSet = this.oVariantSetAdapter.getVariantSet(tableId+"Set");

						//--> if not in backend, then create one
						if (!this.oVariantSet) {
							this.oVariantSet = this.oVariantSetAdapter.addVariantSet(tableId+"Set");
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

				//--> create table persco controller
				this.oTablepersoService = new this.TablePersoController({
					table: this.fndView.byId(this.tableId),
					persoService: oPersonalizer
				});
				
				return this.oTablepersoService;

			}

		},

		onSaveAs: function (oEvent) {

			//--> get variant parameters:
			var VariantParam = oEvent.getParameters();

			//--> get columns data: 
			var aColumnsData = [];
			this.fndView.byId(this.tableId).getColumns().forEach(function (oColumn, index) {
				var aColumn = {};
				aColumn.fieldName = oColumn.getProperty("name");
				aColumn.Id = oColumn.getId();
				aColumn.index = index;
				aColumn.Visible = oColumn.getVisible();

				aColumn.Filtered = oColumn.getFiltered();
				aColumn.FilterValue = oColumn.getFilterValue();

				aColumn.Sorted = oColumn.getSorted();
				aColumn.SortOrder = oColumn.getSortOrder();

				aColumnsData.push(aColumn);
			});

			this.oVariant = this.oVariantSet.addVariant(VariantParam.name);
			if (this.oVariant) {
				this.oVariant.setItemValue("ColumnsVal", JSON.stringify(aColumnsData));
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
				var aColumns = JSON.parse(sVariant.getItemValue("ColumnsVal"));

				// Hide all columns first
				this.fndView.byId(this.tableId).getColumns().forEach(function (oColumn) {
					oColumn.setVisible(false);
				});
				
				// re-arrange columns according to the saved variant
				aColumns.forEach(function (aColumn) {
					var aTableColumn = $.grep(this.fndView.byId(this.tableId).getColumns(), function (el, id) {
						return el.getProperty("name") === aColumn.fieldName;
					});

					//--> column filtering
					if (aColumn.Filtered === true) {
						//aTableColumn[0].setFilterValue(aColumn.FilterValue);
						//aTableColumn[0].setFiltered(true);
						aTableColumn[0].filter(aColumn.FilterValue);
					} else {
						aTableColumn[0].filter();
					}

					//--> sort
					if (aColumn.Sorted === true) {
						aTableColumn[0].setSortOrder(aColumn.SortOrder);
						aTableColumn[0].setSorted(true);
					} else {
						aTableColumn[0].setSorted(false);
					}

					if (aTableColumn.length > 0) {
						aTableColumn[0].setVisible(aColumn.Visible);
						this.fndView.byId(this.tableId).removeColumn(aTableColumn[0]);
						this.fndView.byId(this.tableId).insertColumn(aTableColumn[0], aColumn.index);
					}
				}.bind(this));
			}
			// null means the standard variant is selected or the variant which is not available, then show all columns
			else {
				this.fndView.byId(this.tableId).getColumns().forEach(function (oColumn) {
					oColumn.setVisible(true);
				});
			}
		},

		onManage: function (oEvent) {
			var aParameters = oEvent.getParameters();
			// rename variants
			if (aParameters.renamed.length > 0) {
				aParameters.renamed.forEach(function (aRenamed) {
					var sVariant = this.oVariantSet.getVariant(aRenamed.key),
						sItemValue = sVariant.getItemValue("ColumnsVal");
					// delete the variant 
					this.oVariantSet.delVariant(aRenamed.key);
					// after delete, add a new variant
					var oNewVariant = this.oVariantSet.addVariant(aRenamed.name);
					oNewVariant.setItemValue("ColumnsVal", sItemValue);
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