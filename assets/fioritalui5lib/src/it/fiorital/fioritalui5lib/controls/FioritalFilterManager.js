sap.ui.define([
	"sap/ui/base/ManagedObject",
	"sap/ui/core/format/DateFormat",
	"it/fiorital/fioritalui5lib/controls/FioritalMessageStrip"
], function (ManagedObject, DateFormat, messageStrip) {
	"use strict";
	return ManagedObject.extend("it.fiorital.fioritalui5lib.controls.FioritalFilterManager", {

		metadata: {
			properties: {

			},
			events: {

			}
		},

		staticFilters: [],

		constructor: function (controllerRef) {
			this.controllerRef = controllerRef;

			ManagedObject.prototype.constructor.apply(this, undefined);
		},

		addStaticFilter: function (filter) {
			this.staticFilters.push(filter);
		},

		clearFilterGroup: function (groupId,keepSearch) {

			//---> get list of fields for filtering
			var filterFields = $("[data-filtergroup='" + groupId + "']");

			for (var idx = 0; idx < filterFields.length; idx++) {

				var attrId = filterFields[idx].getAttribute('id');
				var UI5ctrl = sap.ui.getCore().byId(attrId);

				if (UI5ctrl.getMetadata().getName() === 'sap.m.Input') {
					UI5ctrl.setValue('');
					UI5ctrl.setSelectedKey('');
				}

				//---> single select
				if (UI5ctrl.getMetadata().getName() === 'sap.m.Select') {
					UI5ctrl.setSelectedItemId(' ');
				}

				//---> combobox
				if (UI5ctrl.getMetadata().getName() === 'sap.m.ComboBox') {
					UI5ctrl.setSelectedItemId(' ');
				}

				//---> multi combobox
				if (UI5ctrl.getMetadata().getName() === 'sap.m.MultiComboBox') {
					UI5ctrl.setSelectedItems([]);
				}

				//---> multi input control: get tokens in OR mode
				if (UI5ctrl.getMetadata().getName() === 'sap.m.MultiInput') {
					UI5ctrl.removeAllTokens();
				}

				//---> date range input control
				if (UI5ctrl.getMetadata().getName() === 'sap.m.DateRangeSelection') {
					UI5ctrl.setDateValue();
				}

			}

			//---> manage specialFilters via query 
			var trgt = groupId.split('-');
			var UI5TargetCtrl = this.controllerRef.getView().byId(trgt[0]);
			if (keepSearch !== true){
			UI5TargetCtrl.getBinding(trgt[1]).changeParameters({
				$search: undefined
			}); }

			//--> get the target control from group
			var trgt = groupId.split('-');
			var UI5TargetCtrl = this.controllerRef.getView().byId(trgt[0]);
			UI5TargetCtrl.getBinding(trgt[1]).filter([]);

		},

		applyfilterGroup: function (groupId, evt, externalFilters, autoResume, orExternalFilters) {

			var totalFilters = [];
			var specialFilter = [];

			//---> get list of fields for filtering
			var filterFields = $("[data-filtergroup='" + groupId + "']");

			for (var idx = 0; idx < filterFields.length; idx++) {
				var attrId = filterFields[idx].getAttribute('id');
				var UI5ctrl = sap.ui.getCore().byId(attrId);

				//--> now get additional data needed to create filter
				var fld = UI5ctrl.data('filterField');
				var fop = UI5ctrl.data('filterOperator'); //<---- is OPTIONAL (take EQ as default)
				var attGetter = UI5ctrl.data('filterAttributeFunction');

				if (fop === undefined || fop === '') {
					fop = sap.ui.model.FilterOperator.EQ;
				}

				var searchQuery = UI5ctrl.data('filterOperatorSearch');

				//---> checkbox
				if (UI5ctrl.getMetadata().getName() === 'sap.m.CheckBox') {

					//---> handle standard search				

					var val = UI5ctrl.getSelected();
					//var val = UI5ctrl.getProperty("value");
					if (val !== undefined && val !== false) {
						var flt = new sap.ui.model.Filter({
							path: fld,
							operator: fop,
							value1: val
						});

						totalFilters.push(flt);
					}

				}

				//---> radio group
				if (UI5ctrl.getMetadata().getName() === 'sap.m.RadioButtonGroup') {

					//---> handle standard search				
					var buttons = UI5ctrl.getButtons();
					buttons.forEach(function (sbutton) {
						if (sbutton.getSelected() === true && (sbutton.data('filterValue') !== undefined && sbutton.data('filterValue') !== null)) {
							var flt = new sap.ui.model.Filter({
								path: fld,
								operator: fop,
								value1: sbutton.data('filterValue')
							});

							totalFilters.push(flt);
						}
					});

				}

				//---> single input
				if (UI5ctrl.getMetadata().getName() === 'sap.m.Input') {

					//---> handle special search
					if (searchQuery !== undefined && searchQuery !== '' && searchQuery !== null) {

						//--> create the special query sequence
						var val = UI5ctrl.getValue();
						if (val !== undefined && val !== '') {
							var sqf = new Object();
							sqf.query = searchQuery;
							sqf.data = val;

							specialFilter.push(sqf);
						}

					} else {
						//---> handle standard search				

						if (attGetter === null) {
							var val = UI5ctrl.getValue();
						} else {
							var val = UI5ctrl[attGetter]();
						}

						if (val !== undefined && val !== '') {
							var flt = new sap.ui.model.Filter({
								path: fld,
								operator: fop,
								value1: val
							});

							totalFilters.push(flt);
						}

					}

				}

				//---> single select
				if (UI5ctrl.getMetadata().getName() === 'sap.m.Select') {

					//---> handle special search
					if (searchQuery !== undefined && searchQuery !== '' && searchQuery !== null) {

						//--> create the special query sequence
						var val = UI5ctrl.getSelectedKey();
						if (val !== undefined && val !== '') {
							var sqf = new Object();
							sqf.query = searchQuery;
							sqf.data = val;

							specialFilter.push(sqf);
						}

					} else {

						var val = UI5ctrl.getSelectedKey();
						if (val !== undefined && val !== '') {
							var flt = new sap.ui.model.Filter({
								path: fld,
								operator: fop,
								value1: val
							});

							totalFilters.push(flt);
						}

					}

				}

				//---> combobox
				if (UI5ctrl.getMetadata().getName() === 'sap.m.ComboBox') {
					//---> handle special search
					if (searchQuery !== undefined && searchQuery !== '' && searchQuery !== null) {

						//--> create the special query sequence
						var val = UI5ctrl.getSelectedKey();
						if (val !== undefined && val !== '') {
							var sqf = new Object();
							sqf.query = searchQuery;
							sqf.data = val;

							specialFilter.push(sqf);
						}

					} else {

						var val = UI5ctrl.getSelectedKey();
						if (val !== undefined && val !== '') {
							var flt = new sap.ui.model.Filter({
								path: fld,
								operator: fop,
								value1: val
							});

							totalFilters.push(flt);
						}

					}

				}

				//---> multi combobox
				if (UI5ctrl.getMetadata().getName() === 'sap.m.MultiComboBox') {
					//---> handle special search
					if (searchQuery !== undefined && searchQuery !== '' && searchQuery !== null) {
						//--> create the special query sequence
						var keys = UI5ctrl.getSelectedKeys();

						keys.forEach(function (val) {
							if (val !== undefined && val !== '') {
								var sqf = new Object();
								sqf.query = searchQuery;
								sqf.data = val;

								specialFilter.push(sqf);
							}
						});

					} else {

						var keys = [];

						var items = UI5ctrl.getSelectedItems();
						items.forEach(function (sitem) {
							keys.push(sitem.getKey());
						});

						var aFilter = [];

						keys.forEach(function (val) {
							if (val !== undefined && val !== '') {
								var flt = new sap.ui.model.Filter({
									path: fld,
									operator: fop,
									value1: val,
								});
								aFilter.push(flt);
							}
						});

						if (aFilter.length > 0) {
							var flts = new sap.ui.model.Filter({
								filters: aFilter,
								and: false
							});
							totalFilters.push(flts);
						}
					}

				}

				//---> multi input control: get tokens in OR mode
				if (UI5ctrl.getMetadata().getName() === 'sap.m.MultiInput') {

					//---> in token event we must consider removed ones....
					if (evt !== undefined) {
						var removedTokens = evt.getParameter('removedTokens');
					}

					var TokensFilterArray = [];
					UI5ctrl.getTokens().forEach(function (stoken) {

						//---> must check if removed..
						var found = false;

						if (removedTokens !== undefined) {
							removedTokens.forEach(function (sRemoved) {
								if (sRemoved === stoken) {
									found = true;
								}
							});
						}

						if (found === false) {

							var key = stoken.getKey();
							var flt = new sap.ui.model.Filter({
								path: fld,
								operator: fop,
								value1: key
							});

							TokensFilterArray.push(flt);

						}

					});

					//---> append to global AND filter
					if (TokensFilterArray.length > 0) {
						totalFilters.push(new sap.ui.model.Filter(TokensFilterArray, false)); //<-- OR 
					}

				}

				//---> date range input control
				if (UI5ctrl.getMetadata().getName() === 'sap.m.DateRangeSelection') {
					var dateFrom = UI5ctrl.getFrom(),
						dateTo = UI5ctrl.getTo();

					if (dateFrom !== undefined && dateTo !== undefined && dateFrom !== null && dateTo !== null) {
						var flt = new sap.ui.model.Filter({
							path: fld,
							operator: fop,
							//--> Omitting date pattern parameter iis assumed default "yyyy-MM-dd"
							value1: this._dateToCustomPatternString(dateFrom),
							value2: this._dateToCustomPatternString(dateTo)
						});

						totalFilters.push(flt);
					}
				}

			}

			//---> Adding external filters
			if (externalFilters !== undefined) {
				externalFilters.forEach(function (oItem) {
					if (Array.isArray(oItem)) {
						oItem.forEach(function (oItm) {
							totalFilters.push(oItm);
						});
					} else {
						totalFilters.push(oItem);
					}

				});
			}

			//---> Add static filters
			if (this.staticFilters.length > 0) {
				this.staticFilters.forEach(function (oItem) {
					totalFilters.push(oItem);
				});
			}

			var finalFilter = new sap.ui.model.Filter(totalFilters, true);

			//--> OR final filters
			if (orExternalFilters !== undefined) {
				finalFilter = new sap.ui.model.Filter([finalFilter, orExternalFilters], false);
			}

			//--> get the target control from group
			var trgt = groupId.split('-');
			var UI5TargetCtrl = this.controllerRef.getView().byId(trgt[0]);

			//---> manage specialFilters via query 
			if (specialFilter.length > 0) {
				var base64 = btoa(JSON.stringify(specialFilter)).replace(/=/g, '');
				UI5TargetCtrl.getBinding(trgt[1]).changeParameters({
					$search: 'base64.' + base64
				});
			} else {
				if (UI5TargetCtrl.getBindingInfo(trgt[1]).parameters === undefined || UI5TargetCtrl.getBindingInfo(trgt[1]).parameters.$search ===
					undefined) {

					//--> only for Odata model
					if (UI5TargetCtrl.getBinding(trgt[1]).getModel().getMetadata().getName().includes('JSONModel') === false) {
						UI5TargetCtrl.getBinding(trgt[1]).changeParameters({
							$search: undefined
						});
					}
				}

			}

			//--> only for Odata model
			if (UI5TargetCtrl.getBinding(trgt[1]).getModel().getMetadata().getName().includes('JSONModel') === false) {
				UI5TargetCtrl.getBinding(trgt[1]).getQueryOptionsForPath("/");

				if (autoResume && UI5TargetCtrl.getBinding(trgt[1]).isSuspended()) {
					UI5TargetCtrl.getBinding(trgt[1]).resume();
				}
			}

			UI5TargetCtrl.getBinding(trgt[1]).filter(finalFilter);

		},

		init: function () {

		},

		exit: function () {

		},

		_dateToCustomPatternString: function (dDate, outputDatePattern) {

			var sDate = "";

			try {

				var options = {};

				if (outputDatePattern === undefined || outputDatePattern === null || outputDatePattern === "") {
					outputDatePattern = "yyyy-MM-dd";
				}

				options = {
					pattern: outputDatePattern
				};

				var df = DateFormat.getDateInstance(options);

				sDate = df.format(dDate);

			} catch (ex) {
				//<-- Nothing to do
			}

			return sDate;

		}

	});

}, true);