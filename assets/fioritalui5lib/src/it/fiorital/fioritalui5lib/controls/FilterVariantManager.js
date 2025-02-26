/* eslint-disable sap-no-localstorage*/

sap.ui.define([
		"jquery.sap.global",
		"sap/ui/core/XMLComposite",
		"sap/m/MessageToast",
		"sap/m/MessageBox",
		"sap/ui/model/Filter",
		"sap/ui/model/FilterOperator", "sap/ui/model/json/JSONModel"
	],
	function (jQuery, XMLComposite, MessageToast, MessageBox, Filter, FilterOperator, jsModel) {
		"use strict";

		var VARMAN = XMLComposite.extend("it.fiorital.fioritalui5lib.controls.FilterVariantManager", {
			metadata: {
				properties: {
					fieldsGroup: {
						type: "string",
						defaultValue: ""
					},
					localStorage: {
						type: "boolean",
						defaultValue: "true"
					},
					variantType: {
						type: "string",
						defaultValue: ""
					}
				},
				events: {
					variantselect: {
						parameters: {

						}
					}
				}
			},

			init: function () {

				//---> variants Jsmodel
				this.jsModelVariants = new jsModel();
				this.jsModelVariants.setData([]);
				this.setModel(this.jsModelVariants, 'VARIANTS');

				this.jsModelVariantData = new jsModel();
				this.jsModelVariantData.setData({
					actualVariant: ''
				});
				this.setModel(this.jsModelVariantData, 'VARIANTDATA');

				this.actualVariant = '';

			},

			CreateNewVariant: function (evt) {

				var box = new sap.m.VBox({
					items: [
						new sap.m.Text({
							text: 'Nome variante'
						}),
						new sap.m.Input({
							value: '{/varname}'
						}),
						new sap.m.Input({
							value: '{/vardescr}'
						})
					]
				});

				box.setModel(new sap.ui.model.json.JSONModel({
					message: ''
				}));

				sap.m.MessageBox.show(
					box, {
						icon: sap.m.MessageBox.Icon.INFORMATION,
						title: "Creazione nuova variante",
						actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
						onClose: function (oAction) {
							if (oAction === sap.m.MessageBox.Action.YES) {

								var varName = box.getModel().getProperty('/varname');
								var varDescr = box.getModel().getProperty('/vardescr');

								if (varName !== undefined && varName !== '') {
									this.__internalSaveData(varName, varDescr);
								}

							}
						}.bind(this)
					}
				);

			},

			__internalSetFilters: function (variant) {

				variant.saveData.forEach(function (sitem) {

					var UI5ctrl = sap.ui.getCore().byId(sitem.id);

					//---> checkbox
					if (UI5ctrl.getMetadata().getName() === 'sap.m.CheckBox') {
						UI5ctrl.setSelected(sitem.selected);
					}

					//---> ui.table.table (get filtered columns)
					if (UI5ctrl.getMetadata().getName() === 'sap.ui.table.Table' || UI5ctrl.getMetadata().getName() === 'it.fiorital.flex5app.controls.FioritalUITable') {

						var cols = UI5ctrl.getColumns();
						var filters = sitem.filters;
						var sorters = sitem.sorters;

						//--> set filter on all matching columns
						cols.forEach(function (scol) {
							
							//---> filter present in variant?
							var fndFilter = filters.find(function(sflt){
								return (sflt.name === scol.getName());
							});
							
							if (fndFilter){
								UI5ctrl.filter(scol,fndFilter.value);
							}else{
								UI5ctrl.filter(scol,''); //<-- reset
							}
						});

						//--> set sorters on all matching columns
						cols.forEach(function (scol) {
							
							//---> sorter present in variant?
							var fndSorted = sorters.find(function(sflt){
								return (sflt.name === scol.getName());
							});
							
							if (fndSorted){
								UI5ctrl.sort(scol,fndSorted.value);
							}
						});

					}

					//---> radio group
					if (UI5ctrl.getMetadata().getName() === 'sap.m.RadioButtonGroup') {

						UI5ctrl.setSelectedIndex(sitem.selectedIndex);

					}

					//---> single input
					if (UI5ctrl.getMetadata().getName() === 'sap.m.Input') {

						UI5ctrl.setValue(sitem.value);

					}

					//---> single select
					if (UI5ctrl.getMetadata().getName() === 'sap.m.Select') {

						UI5ctrl.setSelectedItemId(sitem.itemid);

					}

					//---> combobox
					if (UI5ctrl.getMetadata().getName() === 'sap.m.ComboBox') {
						UI5ctrl.clearSelection();
						UI5ctrl.setSelectedKey(sitem.selectedKey);

					}

					//---> multi combobox
					if (UI5ctrl.getMetadata().getName() === 'sap.m.MultiComboBox') {
						UI5ctrl.clearSelection();
						UI5ctrl.setSelectedKeys(sitem.selectedKeys);

					}

					//---> multi input control: get tokens in OR mode
					if (UI5ctrl.getMetadata().getName() === 'sap.m.MultiInput') {

						UI5ctrl.destroyTokens();
						UI5ctrl.removeAllTokens();

						var tokens = [];
						var tokenDirectManage = false;
						var mdlPath = UI5ctrl.data('variantmodelpath');
						var mdlName = UI5ctrl.data('variantmodel');

						sitem.selectedKeys.forEach(function (stoken) {

							if (mdlPath === null) {

								tokenDirectManage = true;
								var newtoken = new sap.m.Token({
									key: stoken.key,
									selected: stoken.selected,
									text: stoken.text
								});

								tokens.push(newtoken);

							} else {
								tokens.push({
									key: stoken.key,
									text: stoken.text,
									selected: stoken.selected
								});
							}

						});

						if (tokenDirectManage) {
							UI5ctrl.setTokens(tokens);
						} else {
							if (mdlName === null || mdlName === '') {
								UI5ctrl.getModel().setProperty(mdlPath, tokens);
							} else {
								UI5ctrl.getModel(mdlName).setProperty(mdlPath, tokens);
							}
						}
					}

					//---> date range input control
					if (UI5ctrl.getMetadata().getName() === 'sap.m.DatePicker') {
						UI5ctrl.setDateValue(new Date(sitem.date));
					}

					//---> date range input control
					if (UI5ctrl.getMetadata().getName() === 'sap.m.DateRangeSelection') {

						UI5ctrl.setDateValue(new Date(sitem.fromdate));
						UI5ctrl.setSecondDateValue(new Date(sitem.todate));
					}

				}.bind(this));

				this.byId('FilterVariantManager').close();
				this.fireEvent("variantselect", {});

			},

			__internalSaveData: function (varName, varDescr) {

				var vts = this.jsModelVariants.getData();

				if (varName !== undefined) {

					var saveData = [];

					//---> get all elements in page with specific group
					$('[data-variantgroup="' + this.getFieldsGroup() + '"]').each(function () {

						var itmId = this.getAttribute('id');
						var UI5ctrl = sap.ui.getCore().byId(itmId);

						//---> checkbox
						if (UI5ctrl.getMetadata().getName() === 'sap.m.CheckBox') {

							saveData.push({
								id: UI5ctrl.$().attr('id'),
								selected: UI5ctrl.getSelected()
							});

						}

						//---> ui.table.table (get filtered columns)
						if (UI5ctrl.getMetadata().getName() === 'sap.ui.table.Table' || UI5ctrl.getMetadata().getName() === 'it.fiorital.flex5app.controls.FioritalUITable') {

							var cols = UI5ctrl.getColumns();
							var filters = [];
							var sorters = [];

							//--> get all filtered columns
							cols.forEach(function (scol) {
								if (scol.getFiltered()) {
									filters.push({
										name: scol.getName(),
										value: scol.getFilterValue()
									});
								}
							});

							//--> get all sorted columns
							cols.forEach(function (scol) {
								if (scol.getSorted()) {
									sorters.push({
										name: scol.getName(),
										value: scol.getSortOrder()
									});
								}
							});

							saveData.push({
								id: UI5ctrl.$().attr('id'),
								filters: filters,
								sorters: sorters
							});

						}

						//---> radio group
						if (UI5ctrl.getMetadata().getName() === 'sap.m.RadioButtonGroup') {

							saveData.push({
								id: UI5ctrl.$().attr('id'),
								selectedIndex: UI5ctrl.getSelectedIndex()
							});

						}

						//---> single input
						if (UI5ctrl.getMetadata().getName() === 'sap.m.Input') {
							if (UI5ctrl.getValue() !== '') {
								saveData.push({
									id: UI5ctrl.$().attr('id'),
									value: UI5ctrl.getValue()
								});
							}
						}

						//---> single select
						if (UI5ctrl.getMetadata().getName() === 'sap.m.Select') {

							saveData.push({
								id: UI5ctrl.$().attr('id'),
								itemid: UI5ctrl.getSelectedItemId()
							});

						}

						//---> combobox
						if (UI5ctrl.getMetadata().getName() === 'sap.m.ComboBox') {
							if (UI5ctrl.getValue() !== '') {
								saveData.push({
									id: UI5ctrl.$().attr('id'),
									selectedKey: UI5ctrl.getSelectedKey()
								});
							}
						}

						//---> multi combobox
						if (UI5ctrl.getMetadata().getName() === 'sap.m.MultiComboBox') {
							if (UI5ctrl.getSelectedKeys().length === 0) {
								saveData.push({
									id: UI5ctrl.$().attr('id'),
									selectedKeys: UI5ctrl.getSelectedKeys()
								});
							}
						}

						//---> multi input control: get tokens in OR mode
						if (UI5ctrl.getMetadata().getName() === 'sap.m.MultiInput') {

							var tokens = UI5ctrl.getTokens();
							var tokensData = [];

							if (tokens.length > 0) {

								tokens.forEach(function (tok) {
									tokensData.push({
										key: tok.getKey(),
										selected: tok.getSelected(),
										text: tok.getText()
									});
								});

								saveData.push({
									id: UI5ctrl.$().attr('id'),
									selectedKeys: tokensData
								});

							}

						}

						//---> date range input control
						if (UI5ctrl.getMetadata().getName() === 'sap.m.DatePicker') {
							if (UI5ctrl.getDateValue() !== null) {
								saveData.push({
									id: UI5ctrl.$().attr('id'),
									date: UI5ctrl.getDateValue().toString()
								});
							}
						}

						//---> date range input control
						if (UI5ctrl.getMetadata().getName() === 'sap.m.DateRangeSelection') {
							if (UI5ctrl.getDateValue() !== null) {
								saveData.push({
									id: UI5ctrl.$().attr('id'),
									fromdate: UI5ctrl.getDateValue().toString(),
									todate: UI5ctrl.getSecondDateValue().toString(),
								});
							}
						}

					});

					//---> check that no other variants with same name
					var fndVariant = vts.find(function (variant) {
						return (variant.variant === varName);
					});

					if (fndVariant) {
						fndVariant.saveData = saveData;

						if (varDescr !== undefined) {
							fndVariant.varDescr = varDescr;
						}

					} else {
						vts.push({
							variant: varName,
							varDescr: varDescr,
							saveData: saveData
						});
					}

					this.jsModelVariants.setData(vts);
					this.jsModelVariants.refresh(true);

				} //<-- new / existing variant

				if (this.getLocalStorage() === true) {

					//--> save to local storage
					localStorage.setItem('VARIANTS-' + this.getFieldsGroup(), JSON.stringify(vts));

				} else {

					//---> remote REST node
					fetch('/fiorital/filter_manager?' + new URLSearchParams({
						varianttype: this.getVariantType(),
						group: this.getFieldsGroup()
					}), {
						cache: 'no-cache',
						method: 'POST',
						body: btoa(JSON.stringify(vts))
					}).then(function (data) {
						//--> saved
					}.bind(this)).catch(function () {
						//--> ?!?!
					});

				}

			},

			saveVariant: function (evt) {
				if (this.actualVariant !== '') {
					this.__internalSaveData(this.actualVariant, undefined);
				}
			},

			deleteVariant: function (evt) {

				var vts = this.jsModelVariants.getData();
				var varNameToRemove = evt.getParameter('listItem').getTitle();
				
				if (this.actualVariant === varNameToRemove){
					this.actualVariant  = '';
					this.jsModelVariantData.setProperty('/actualVariant', this.actualVariant);
				}

				var dataRemoved = vts.filter(function (el) {
					return el.variant !== varNameToRemove;
				});

				this.jsModelVariants.setData(dataRemoved);
				this.jsModelVariants.refresh(true);

				this.__internalSaveData(undefined);

			},

			selectVariant: function (evt) {

				var vts = this.jsModelVariants.getData();
				var varName = sap.ui.getCore().byId(evt.getParameters('id').id).getTitle();

				//---> check that no other variants with same name
				var fndVariant = vts.find(function (variant) {
					return (variant.variant === varName);
				});

				if (fndVariant) {
					this.__internalSetFilters(fndVariant);
					this.actualVariant = varName;
					this.jsModelVariantData.setProperty('/actualVariant', varName);
				}

			},

			close: function (evt) {
				this.byId('FilterVariantManager').close();
			},

			openByEvt: function (evt) {

				this.objRef = evt.getSource();

				if (this.getLocalStorage() === true) {

					var vts = JSON.parse(localStorage.getItem('VARIANTS-' + this.getFieldsGroup()));
					this.jsModelVariants.setData(vts);
					this.jsModelVariants.refresh(true);
					this.byId('FilterVariantManager').openBy(evt.getSource());

				} else {

					fetch('/fiorital/filter_manager?' + new URLSearchParams({
						varianttype: this.getVariantType(),
						group: this.getFieldsGroup()
					}), {
						cache: 'no-cache',
						method: 'GET'
					}).then(function (data) {

						//--> parse response
						data.text().then(function (base64flt) {

							if (base64flt !== '') {
								var vts = JSON.parse(atob(base64flt));
								this.jsModelVariants.setData(vts);
								this.jsModelVariants.refresh(true);
							}

							this.byId('FilterVariantManager').openBy(this.objRef);
						}.bind(this));

					}.bind(this)).catch(function () {

						//--> ?!?!

					});
				}

			},

			saveActive: function (varname) {
				if (varname === undefined || varname === '') {
					return false;
				} else {
					return true;
				}
			}

		});

		return VARMAN;

	}, true);