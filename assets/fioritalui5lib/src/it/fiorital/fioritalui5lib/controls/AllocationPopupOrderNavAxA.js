/* eslint-disable */

sap.ui.define([
		"jquery.sap.global",
		"sap/ui/core/XMLComposite",
		"sap/m/MessageToast",
		"sap/m/MessageBox",
		"sap/ui/model/Filter",
		"sap/ui/model/FilterOperator",
		"sap/ui/model/json/JSONModel",
		"it/fiorital/fioritalui5lib/controls/APCmanager",
		"it/fiorital/fioritalui5lib/controls/FioritalMessageStrip",
		"it/fiorital/fioritalui5lib/extension/BooleanParse",
		"it/fiorital/fioritalui5lib/extension/FloatFixed2Parse"
	],
	function (jQuery, XMLComposite, MessageToast, MessageBox, Filter, FilterOperator, jsModel, APCManager, FioritalMessageStrip, boolParse,
		FloatParse2D) {
		"use strict";

		var FOManager = XMLComposite.extend("it.fiorital.fioritalui5lib.controls.AllocationPopupOrderNavAxA", {
			metadata: {
				properties: {
					title: {
						type: "string",
						defaultValue: "Allocation"
					},
					apcendpoint: {
						type: "string",
						defaultValue: ""
					},
					apchandshake: {
						type: "string",
						defaultValue: ""
					}
				},
				events: {

				},
				aggregations: {

				}
			},

			APCManager: APCManager,
			FioritalMessageStrip: FioritalMessageStrip,
			boolParse: boolParse,
			FloatParse2D: FloatParse2D,

			allocationsOpen: function (evt) {

				this.jsModelSoAllocations.loadData(evt.getSource().getModel().sServiceUrl + "SalesOrderTrade(docnr='" + this.so +
					"')/SotItem");

			},

			loadItemsCombo: function (evt) {
				if (evt.getSource().getBinding("items").isSuspended()) {
					evt.getSource().getBinding("items").resume();
				}
			},

			jsonRequestCompleted: function (event) {

				//--> store all data
				if (this.isCustAvail === true) {
					this.basedata = this.jsModelList.getData().AtpcAvailabilityRes;
				} else {
					this.basedata = this.jsModelList.getData().AtpcAvailability;
				}

				this.basedata.forEach(function (itm) {
					itm.allocateQty = undefined;
					itm.isAllocating = false;
				}.bind(this));

				var groupby = this.byId('groupingCbId').getSelectedKey();

				this._changeGrouping(this.basedata, groupby, ''); //<-- unfiltered on load

				this.localModel.getData().allocationRows = 0;
				this._setBadgeAllocations();

				this.jsonModelPreSelected.setData();
				this.setModel(this.jsonModelPreSelected, 'PRESELECTEDITEMS');

				this.waitDialog.close();
				this.byId('allocationPopupAxA').open();
				this.byId('allocationPopupAxA').setBusy(false);

			},

			_setBadgeAllocations: function () {

				var bdg = this.byId("allocationListButtonId").getBadgeCustomData();

				bdg.setValue(this.localModel.getData().allocationRows.toString());

				if (this.localModel.getData().allocationRows > 0) {
					bdg.setVisible(true);
				} else {
					bdg.setVisible(false);
				}
			},

			_changeGrouping: function (data, grptype, filter) {

				var countryOriginTranscode = this.jsModelCountryOrigin.getData().value;

				var showOnlyAvailable = this.jsModelParameters.getData().showavailableonly;
				if (!showOnlyAvailable) {
					showOnlyAvailable = false;
				}

				this.jsModelListDisplay.setData();

				var outerGroup = [];
				var lastObject;

				switch (grptype) {
				case 'matnr':
					data.forEach(function (sdata) {

						//--> manage filter
						var recordOk = false;
						var mstkey = sdata.matnr + ' - ' + sdata.maktx;

						if (showOnlyAvailable && sdata.qtyAvailable === 0) {
							recordOk = false;
						} else {
							if (filter !== '' && filter !== undefined) {

								//--> manage ":" as origin filter
								if (filter[0] === ':') {

									var flt = filter.substr(1, 9999).toUpperCase();

									//--> get transcode
									var coo = countryOriginTranscode.find(function (scco) {
										return (scco.valueid === sdata.origin);
									});

									if (coo) {
										var descr = coo.valuedescription.toUpperCase();
										if (sdata.origin.toUpperCase().search(flt) > -1 || descr.search(flt) > -1) {
											recordOk = true;
										}
									} else {
										if (sdata.origin.toUpperCase().search(flt) > -1) {
											recordOk = true;
										}
									}

								} else {

									//--> split filter?
									var fltSplit = filter.split(' ');
									if (fltSplit.length > 1) {
										
										var rgx = "^";
										fltSplit.forEach(function(sfilter){
											rgx = rgx + '(?=.*' + sfilter.toUpperCase() + ')';	
										});
										rgx = rgx + '.*$';
										
										var rgxFound = mstkey.toUpperCase().match(rgx);
										if (rgxFound !== null){
											recordOk = true;
										}
										
									} else {
										//---> product and code search
										if (mstkey.toUpperCase().search(filter.toUpperCase()) > -1) {
											recordOk = true;
										}
									}

								}

							} else {
								recordOk = true;
							}
						}

						if (recordOk === true) {

							lastObject = {
								matnr: sdata.matnr,
								key: sdata.matnr + ' - ' + sdata.maktx,
								subgroup: [],
								qtyAvailable: sdata.qtyAvailable,
								qtyTotal: sdata.qtyTotal,
								showControls: false
							};

							var fnd = outerGroup.find(function (data) {
								return (data.key === sdata.matnr + ' - ' + sdata.maktx);
							}.bind(this));

							if (fnd === undefined) {
								sdata.showControls = true;
								sdata.isAllocating = false;
								lastObject.subgroup.push(sdata);
								outerGroup.push(lastObject);
							} else {
								//--> add available qty to totals
								fnd.qtyAvailable = fnd.qtyAvailable + sdata.qtyAvailable;
								fnd.qtyTotal = fnd.qtyTotal + sdata.qtyTotal;
								fnd.subgroup.push(sdata);
							}

						} //<-- record ok for filter or no filter

					});

					break;

				case 'nogrp':
					data.forEach(function (sdata) {

						var recordOk = false;

						//--> only available
						if (showOnlyAvailable && sdata.qtyAvailable === 0) {
							//--> skip this record
							recordOk = false;
						} else {

							//--> manage filter
							var mstkey = sdata.matnr + ' - ' + sdata.maktx;
							if (filter !== '' && filter !== undefined) {

								//--> manage ":" as origin filter
								if (filter[0] === ':') {

									var flt = filter.substr(1, 9999).toUpperCase();

									//--> get transcode
									var coo = countryOriginTranscode.find(function (scco) {
										return (scco.valueid === sdata.origin);
									});

									if (coo) {
										var descr = coo.valuedescription.toUpperCase();
										if (sdata.origin.toUpperCase().search(flt) > -1 || descr.search(flt) > -1) {
											recordOk = true;
										}
									} else {
										if (sdata.origin.toUpperCase().search(flt) > -1) {
											recordOk = true;
										}
									}

								} else {

									//--> split filter?
									var fltSplit = filter.split(' ');
									if (fltSplit.length > 1) {
										
										var rgx = "^";
										fltSplit.forEach(function(sfilter){
											rgx = rgx + '(?=.*' + sfilter.toUpperCase() + ')';	
										});
										rgx = rgx + '.*$';
										
										var rgxFound = mstkey.toUpperCase().match(rgx);
										if (rgxFound !== null){
											recordOk = true;
										}
										
									} else {
										//---> product and code search
										if (mstkey.toUpperCase().search(filter.toUpperCase()) > -1) {
											recordOk = true;
										}
									}

								}

							} else {
								recordOk = true;
							}

						}

						if (recordOk === true) {
							sdata.isAllocating = false;
							outerGroup.push(sdata);
						}

					});
					break;
				}

				this.jsModelListDisplay.setData(outerGroup);

			},

			showBatchDetails: function (evt) {

				var ctx = evt.getSource().getBindingContext('SUPPLYJSONMODEL');
				var obj = ctx.getObject();

				this.byId('attributeManagerId').openByBatchId(evt, obj.charg, obj.matnr, '1000');

			},

			closePopoverExixstingAllocations: function (evt) {
				this.byId('popoverAllocationsExisting').close();
			},

			showFO: function (evt) {
				this.byId('foManagerId').openByOrder(evt, evt.getSource().getText().padStart(20, '0'));
			},

			showMainFO: function (evt) {
				this.byId('foManagerId').openByOrder(evt, this.getModel('SUPPLYJSONMODELBASE').getData().zzdefaultFo);
			},

			showExistingAllocations: function (evt) {

				if (evt.getSource().getBindingContext('SUPPLYJSONMODEL') !== undefined) {
					var dt = evt.getSource().getBindingContext('SUPPLYJSONMODEL').getObject();
				}

				if (evt.getSource().getBindingContext('SUPPLYJSONMODELALL') !== undefined) {
					var dt = evt.getSource().getBindingContext('SUPPLYJSONMODELALL').getObject();
				}

				if (evt.getSource().getBindingContext('SUPPLYJSONMODELALTERNATIVE') !== undefined) {
					var dt = evt.getSource().getBindingContext('SUPPLYJSONMODELALTERNATIVE').getObject();
				}

				//---> access by GCID / GRID / BATCH (unique key)
				this.byId('popoverAllocationsExistingList').bindAggregation("items", {
					path: "/" + this.association + "(gcid='" + dt.gcid +
						"',grid='" + dt.grid + "',charg='" + dt.charg + "',destNodeReqDate=" + dt.destNodeReqDate +
						",destNodeReqTime='" + dt.destNodeReqTime + "')/ActiveAtpc",
					template: this.byId('popoverAllocationsExistingList').getBindingInfo("items").template,
					parameters: {
						$search: 'showgenerics' //<--- show also generics allocations
					},
				});

				this.byId('popoverAllocationsExisting').openBy(evt.getSource());

			},

			__internal_calculatePreSelected: function () {

				this.preSelectedList = [];

				if (this.isCustAvail === true) {
					this.jsModelList.getData().AtpcAvailabilityRes.forEach(function (sdata) {

						if (sdata.subGroup != undefined) {
							sdata.subGroup.forEach(function (itm) {
								if (itm.allocateQty !== undefined && itm.allocateQty !== '' && itm.allocateQty !== '0') {
									this.preSelectedList.push(itm);
								}
							}.bind(this));
						} else {

							if (sdata.allocateQty !== undefined && sdata.allocateQty !== '' && sdata.allocateQty !== '0') {
								this.preSelectedList.push(sdata);
							}
						}

					}.bind(this));

				} else {
					this.jsModelList.getData().AtpcAvailability.forEach(function (sdata) {

						if (sdata.subGroup != undefined) {
							sdata.subGroup.forEach(function (itm) {
								if (itm.allocateQty !== undefined && itm.allocateQty !== '' && itm.allocateQty !== '0') {
									this.preSelectedList.push(itm);
								}
							}.bind(this));
						} else {

							if (sdata.allocateQty !== undefined && sdata.allocateQty !== '' && sdata.allocateQty !== '0') {
								this.preSelectedList.push(sdata);
							}
						}

					}.bind(this));
				}

				this.jsonModelPreSelected.setData(this.preSelectedList);
				this.localModel.getData().allocationRows = this.jsonModelPreSelected.getData().length;
				this._setBadgeAllocations();
			},

			showPreSelected: function (evt) {
				this.byId('preSelectedItems').openBy(evt.getSource());
			},

			deleteFromPreSelected: function (evt) {
				var dtstream = evt.getSource().getBindingContext('PRESELECTEDITEMS').getObject();
				this.__patchAllocationRunning(dtstream.gcid, dtstream.grid, dtstream.charg, true);
				this.__internal_calculatePreSelected();
				this._setBadgeAllocations();
			},

			goBackFromTradeItems: function (evt) {

				this.byId('masterNavContainer').to(this.byId('masterNavContainer').getPages()[0]);
			},

			onClearFilterNode: function (evt) {

				this.byId('comboNodes').setValue('');

				this.nodeFilter = [];

				var finalFilter = [];

				finalFilter.push(this.matFilter);
				this.byId('allocationBasicList').getBinding('items').filter(finalFilter);
			},

			jsonRequestCompletedAlternativeRoutesPopover: function (event) {

				this.byId('allocationPopupAxA').setBusy(false);

				//---> select actual route& populate the json model 
				for (var idx = 0; idx < this.byId('alternativeRouteList').getItems().length; idx++) {
					if (this.byId('alternativeRouteList').getItems()[idx].getBindingContext('ALTERNATIVEROUTESPOPOVER').getObject().routeid == this.getSelectedCluster
						.routeid) {

						this.byId('alternativeRouteList').getItems()[idx].setSelected(true);

						this.jsModelListAlternativeRoutesPopoverNodes.setData(
							this.jsModelListAlternativeRoutesPopover.getData().value[idx].AtpcPossibleRoutesNodes
						);

						break;
					}
				}

				this.byId('popoverAternativeRoutes').openBy(this.pressedMultiIcon);

			},

			//----> ONCLICK: take GUID; search for same node / clusterId >>> set Active to RouteId / Inactive for Other RouteId (of any)

			multiRouteShow: function (evt) {

				this.pressedMultiIcon = evt.getSource();
				this.activeJsonModel = this.jsModelListDisplay;

				var dt = evt.getSource().getBindingContext('SUPPLYJSONMODEL').getObject();

				//---> no popup for adiacent warehouses
				if (dt.adiacentRoute === 'X' || dt.routesCnt === 0) {

					var ms = new FioritalMessageStrip('Nessuna rotta presente', {
						status: 'warning',
						icon: 'sap-icon://warning2',
						timeout: 4000
					});

					return;
				}

				//--> other FO selected?
				if (this.jsModelSelectedAlternativeRoute.getData() !== undefined && this.jsModelSelectedAlternativeRoute.getData().sotradelgort !==
					undefined) {
					var foOutId = this.jsModelSelectedAlternativeRoute.getData().freightorderid;
				} else {

					//---> take from SO
					var foOutId = this.ctxGlobal.getContext().getObject().zzdefaultFo;
				}

				this.getSelectedCluster = dt;
				this.jsModelListAlternativeRoutesPopover.loadData(evt.getSource().getModel().sServiceUrl + this.association + "(gcid='" + dt.gcid +
					"',grid='" + dt.grid + "',charg='" + dt.charg + "',destNodeReqDate=" + dt.destNodeReqDate +
					",destNodeReqTime='" + dt.destNodeReqTime + "')/AtpcPossibleRoutes?$expand=AtpcPossibleRoutesNodes&$search=FO" +
					foOutId); //<-- it's ok to take the frst batch guid

				//this.byId('allocationBasicList').setBusy(true);

			},

			selectAlternativeRoute: function (evt) {

				//---> set single nodes model
				var dt = evt.getParameter('listItem').getBindingContext('ALTERNATIVEROUTESPOPOVER').getObject();
				this.jsModelListAlternativeRoutesPopoverNodes.setData(dt.AtpcPossibleRoutesNodes);

			},

			selectedAlternativeSupplyRoute: function (evt) {

				var selectedRoute = this.byId('alternativeRouteList').getSelectedItem().getBindingContext('ALTERNATIVEROUTESPOPOVER').getObject();
				this.selectedCluster.getObject().routeid = selectedRoute.routeid;

				this.selectedCluster.getObject().batches.forEach(function (sbatch) {
					if (sbatch.routeid === selectedRoute.routeid) {
						sbatch.defaultRouteid = 'X';
					} else {
						sbatch.defaultRouteid = '';
					}
					sbatch.allocateQty = 0; //<-- reet quantities
				});

				this.activeJsonModel.refresh(true);

				this.byId('popoverAternativeRoutes').close();

			},

			backFromRouteDetail: function (evt) {
				this.byId('popoverAternativeRoutes').close();
			},

			init: function () {

				//---> super
				XMLComposite.prototype.init.apply(this, arguments);

				this.waitDialog = new sap.m.BusyDialog();

				this.matFilter = [];
				this.nodeFilter = [];

				//--> side selection list for products / warehouses

				this.jsModelList = new jsModel(undefined, true);
				this.jsModelListDisplay = new jsModel(undefined, true);

				//-------------------------------------- other models

				this.jsModelListAlternativeRoutes = new jsModel;
				this.jsModelSelectedAlternativeRoute = new jsModel;
				this.jsModelListAlternativeRoutesPopover = new jsModel;
				this.jsModelListAlternativeRoutesPopoverNodes = new jsModel;
				this.jsModelSoAllocations = new jsModel;
				this.jsModelParameters = new jsModel;
				this.jsModelCountryOrigin = new jsModel([]);

				this.jsModelSuggest = new jsModel;
				this.jsModelNodes = new jsModel;
				this.localModel = new jsModel({
					count: 0,
					allocationRows: 0,
					dynamicFilter: '',
					dynamicFilterText: '',
					dynamicFilterTriggered: false
				}, true);
				this.jsonModelPreSelected = new jsModel(undefined, true);

				this.requestIds = []; //<-- store here the ATPC request Ids (to delete)

				this.jsModelListAlternativeRoutesPopover.attachRequestCompleted(this.jsonRequestCompletedAlternativeRoutesPopover.bind(this));
				this.jsModelList.attachRequestCompleted(this.jsonRequestCompleted.bind(this));

				//---> set models to XML component
				this.setModel(this.jsModelList, 'SUPPLYJSONMODELBASE');
				this.setModel(this.jsModelListDisplay, 'SUPPLYJSONMODEL');

				this.setModel(this.jsModelSelectedAlternativeRoute, 'SELECTEDALTERNATIVEROUTE');
				this.setModel(this.jsModelListAlternativeRoutes, 'ALTERNATIVEROUTES');
				this.setModel(this.jsModelListAlternativeRoutesPopover, 'ALTERNATIVEROUTESPOPOVER');
				this.setModel(this.jsModelListAlternativeRoutesPopoverNodes, 'ALTERNATIVEROUTESPOPOVERNODES');
				this.setModel(this.jsModelSoAllocations, 'SOALLOCATIONS');
				this.setModel(this.jsModelParameters, 'PARAMETERS');
				this.setModel(this.localModel, 'LOCALMODEL');
				this.setModel(this.jsonModelPreSelected, 'PRESELECTEDITEMS');

				this._getParametersFromLS();

			},

			_getParametersFromLS: function () {
				var oStore = jQuery.sap.storage(jQuery.sap.storage.Type.local);
				var loadata = oStore.get('AxAParameters');
				if (loadata === null) {
					var params = JSON.stringify({
						groupTreeProperty: 'nogrp'
					});

					oStore.put('AxAParameters', params);

					loadata = params;
				}

				this.jsModelParameters.setData(JSON.parse(loadata));
			},

			_setParametersFromLS: function () {
				var oStore = jQuery.sap.storage(jQuery.sap.storage.Type.local);
				oStore.put('AxAParameters', JSON.stringify(this.jsModelParameters.getData()));
			},

			onChangecompactMode: function () {
				this._setParametersFromLS();
				this._changeGrouping(this.basedata, this.jsModelParameters.getData().groupTreeProperty, ''); //<-- unfiltered
			},

			changeOnlyAvailable: function (evt) {
				this._setParametersFromLS();
				this._changeGrouping(this.basedata, this.jsModelParameters.getData().groupTreeProperty, ''); //<-- unfiltered
			},

			applySettings: function (mSettings, oScope) {

				//--> super
				XMLComposite.prototype.applySettings.apply(this, arguments);
			},

			__patchAllocationRunning: function (gcid, grid, charg, resetQty) {

				//--> do on base model (can be filtered)
				if (this.isCustAvail === true) {
					var baseModelData = this.jsModelList.getData().AtpcAvailabilityRes;
				} else {
					var baseModelData = this.jsModelList.getData().AtpcAvailability;
				}

				for (var idx = 0; idx < baseModelData.length - 1; idx++) {
					if (baseModelData[idx].gcid === gcid && baseModelData[idx].grid === grid && baseModelData[idx].charg === charg) {
						this.jsModelList.setProperty('/AtpcAvailability/' + idx + '/' + 'isAllocating', false);

						if (resetQty) {
							this.jsModelList.setProperty('/AtpcAvailability/' + idx + '/' + 'allocateQty', undefined);
						}
					}
				}

				//--> do on fronted model
				var visualModel = this.jsModelListDisplay.getData();
				for (var idx = 0; idx < visualModel.length - 1; idx++) {

					if (visualModel[idx].subgroup !== undefined) {

						//--> grouped
						for (var j = 0; j < visualModel[idx].subgroup.length - 1; j++) {
							if (visualModel[idx].subgroup[j].gcid === gcid && visualModel[idx].subgroup[j].grid === grid && visualModel[idx].subgroup[j].charg ===
								charg) {
								this.jsModelListDisplay.setProperty('/' + idx + '/subgroup/' + j + '/' + 'isAllocating', false);
								if (resetQty) {
									this.jsModelListDisplay.setProperty('/' + idx + '/subgroup/' + j + '/' + 'allocateQty', undefined);
								}
							}
						}

					} else {

						//--> not grouped
						if (visualModel[idx].gcid === gcid && visualModel[idx].grid === grid && visualModel[idx].charg === charg) {
							this.jsModelListDisplay.setProperty('/' + idx + '/' + 'isAllocating', false);
							if (resetQty) {
								this.jsModelListDisplay.setProperty('/' + idx + '/' + 'allocateQty', undefined);
							}
						}

					}

				}
			},

			setListener: function (newSo, ctxGlobal) {

				this.getYsocket();

				this.ctxGlobal = ctxGlobal;

				//---> remove pending listeners (KO)
				if (this.so !== undefined && this.so !== '') {
					this.YsocketManager.deleteListenersByTypeAndId1(this.so, 'ALLOCATION');
					this.YsocketManager.deleteListenersByTypeAndId1(this.so, 'ODV');
					this.YsocketManager.deleteListenersByTypeAndId1('GLOBAL_AVAILABILITY_PATCH', 'ALLOCATION');
				}

				if (newSo === undefined) {
					return;
				}

				this.so = newSo;

				this.YsocketManager.addListenerPermanent({
						id1: newSo,
						id2: 'INFO'
					}, 'ALLOCATION',
					function (data) {
						
					}.bind(this), true);

				//--->register a callback
				this.YsocketManager.addListenerPermanent({
						id1: newSo
					}, 'ODV',
					function (data) {

						data.DATASTREAM.REQUESTED_AVAILABILITIES.forEach(function (dtstream) {
							//--> patch frontend for allocation icon / reset quantity
							this.__patchAllocationRunning(dtstream.GCID, dtstream.GRID, dtstream.IDX_CHARG, true);
						}.bind(this));

						this.__internal_calculatePreSelected();

						this.localModel.setProperty('/count', this.localModel.getData().count - 1);
						//---> handle a further refresh
						this.ctxGlobal.refresh('directGroup', true);

					}.bind(this), false);

				//---> Failed allocation
				this.YsocketManager.addListenerPermanent({
						id1: newSo,
						id2: 'FAIL'
					}, 'ALLOCATION',
					function (data) {

						data.DATASTREAM.REQUESTED_AVAILABILITIES.forEach(function (dtstream) {
							//--> patch frontend for allocation icon / reset quantity
							this.__patchAllocationRunning(dtstream.GCID, dtstream.GRID, dtstream.IDX_CHARG, false);
						}.bind(this));

						this.localModel.setProperty('/count', this.localModel.getData().count - 1);

						//---> populate message manger
						try {

							data.DATASTREAM.forEach(function (sBAPIRET) {

								var msgType;
								switch (sBAPIRET.TYPE) {
								case 'E':
									msgType = 'Error';
									break;
								case 'A':
									msgType = 'Error';
									break;
								case 'I':
									msgType = 'Information';
									break;
								case 'W':
									msgType = 'Warning';
									break;
								default:
								}

								var msg = new sap.ui.core.message.Message({
									type: msgType,
									message: sBAPIRET.MESSAGE,
									description: sBAPIRET.MESSAGE
								});

								sap.ui.getCore().getMessageManager().getMessageModel().getData().push(msg);
							});

							sap.ui.getCore().getMessageManager().getMessageModel().refresh(true);

						} catch (exc) {
							//--> no BAPI ret
						}

						//---> handle a further refresh
						this.ctxGlobal.refresh('directGroup', true);

					}.bind(this), false);

				this.YsocketManager.addListenerPermanent({
						id1: 'GLOBAL_AVAILABILITY_PATCH'
					}, 'ALLOCATION',
					function (data) {

						this._updateAvailability(JSON.parse(data.DATASTREAM.AVAILDATA));

					}.bind(this), false); //<-- no message display
			},

			_updateAvailability: function (newAvail) {
				if (this.isCustAvail === true) {
					var baseModelData = this.jsModelList.getData().AtpcAvailabilityRes;
				} else {
					var baseModelData = this.jsModelList.getData().AtpcAvailability;
				}

				newAvail.forEach(function (itm) {
					var fnd = baseModelData.findIndex(function (bm) {
						return (itm.CHARG === bm.charg && itm.GRID === bm.grid && itm.GCID === bm.gcid);
					});

					if (fnd > -1) {
						for (const field of Object.keys(itm)) {
							var camelField = this.__camelize(field);
							if (camelField == 'qtyAvailable' || camelField == 'qtyTotal') {
								this.jsModelListDisplay.setProperty('/' + fnd + '/' + camelField, itm[field]);
							}

						}
					}

					var fnd2 = this.jsModelListDisplay.getData().findIndex(function (ds) {
						if (this.jsModelParameters.getData().groupTreeProperty === 'nogrp') {
							return (itm.GCID === ds.gcid && itm.GRID === ds.grid && itm.CHARG === ds.charg);
						} else {
							return (itm.GCID === ds.subgroup.gcid && itm.GRID === ds.subgroup.grid && itm.CHARG === ds.subgroup.charg);
						}
					}.bind(this));

					if (fnd2 > -1) {
						for (const field of Object.keys(itm)) {
							var camelField = this.__camelize(field);
							if (camelField == 'qtyAvailable' || camelField == 'qtyTotal') {
								if (this.jsModelParameters.getData().groupTreeProperty === 'nogrp') {
									this.jsModelListDisplay.setProperty('/' + fnd2 + '/' + camelField, itm[field]);
								} else {
									this.jsModelListDisplay.setProperty('/subgroup/' + fnd2 + '/' + camelField, itm[field]);
								}
							}
						}

					}

				}.bind(this));
			},

			__camelize: function (str) {
				return str.toLowerCase().replace('_', ' ').replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
					return index === 0 ? word.toLowerCase() : word.toUpperCase();
				}).replace(/\s+/g, '');
			},

			inputFocusIn: function (evt) {
				this.inFocus = true;
			},

			inputFocusOut: function (evt) {
				this.inFocus = false;
			},

			clearDynamicFilter: function (evt) {
				clearTimeout(this.timeoutHandler);
				this.localModel.getData().dynamicFilter = '';
				this.localModel.getData().dynamicFilterText = '';
				this.localModel.getData().dynamicFilterTriggered = false;

				//---> clear filter
				this._changeGrouping(this.basedata, this.jsModelParameters.getData().groupTreeProperty, ''); //<-- filter
			},

			parseFilterText: function (flt) {
				var out = flt.replaceAll(':', '(origine) ');
				out = out.replaceAll(';', '(attrezzo pesca) ');

				return out;
			},

			isLetter: function (c) {
				return c.toLowerCase() != c.toUpperCase();
			},

			_keyDown: function (evt) {

				//--> special characters keys
				if (evt.key.length > 1 && evt.key != 'Backspace') {
					return;
				}
				this.lastEvt = evt;
				//--> handle filter in field
				if (this.inFocus) {
					if (this.isLetter(evt.key[0]) && evt.key != 'Backspace') {
						//--> manage it! + go out of focus
						this.byId('dynamicFilterIn').focus();

						setTimeout(function () {
							this.__doDynamicFilter(this.lastEvt);
							this.lastEvt = undefined;
						}.bind(this), 10);
						return;
					} else {
						return;
					}
				}

				setTimeout(function () {
					this.__doDynamicFilter(this.lastEvt);
					this.lastEvt = undefined;
				}.bind(this), 10);

			},

			__doDynamicFilter: function (evt) {
				//---> special handling of x: clear filter
				if (evt.ctrlKey === true && evt.key === 'x') {
					this.clearDynamicFilter();
					return;
				}

				//--> handle dynamic fasat filter
				if (this.byId('allocationPopupAxA').isOpen()) {

					if (this.localModel.getData().dynamicFilterTriggered) {

						evt.preventDefault();
						evt.stopPropagation();

						if (evt.key === 'Backspace') {

							this.clearDynamicFilter();
							return;
						}

						this.localModel.getData().dynamicFilter = evt.key;
						this.localModel.getData().dynamicFilterText = this.parseFilterText(this.localModel.getData().dynamicFilter);
						this.localModel.getData().dynamicFilterTriggered = false;
					} else {

						if (evt.key === 'Backspace') {
							this.localModel.getData().dynamicFilter = this.localModel.getData().dynamicFilter.slice(0, -1);
							this.localModel.getData().dynamicFilterText = this.parseFilterText(this.localModel.getData().dynamicFilter);
						} else {
							this.localModel.getData().dynamicFilter = this.localModel.getData().dynamicFilter + evt.key;
							this.localModel.getData().dynamicFilterText = this.parseFilterText(this.localModel.getData().dynamicFilter);
						}

					}

					clearTimeout(this.timeoutHandler);
					this.timeoutHandler = setTimeout(function () {

						//---> start filtering
						this.localModel.getData().dynamicFilterTriggered = true;
						this._changeGrouping(this.basedata, this.jsModelParameters.getData().groupTreeProperty, this.localModel.getData().dynamicFilter); //<-- filter

					}.bind(this),1000);

				}
			},

			openByData: function (evt, so, ctxGlobal, soData, isCustAvail) {

				this.inFocus = false;
				this.localModel.getData().dynamicFilter = '';
				this.localModel.getData().dynamicFilterText = '';
				this.localModel.getData().dynamicFilterTriggered = false;

				if (this.jsModelCountryOrigin.getData().length === 0) {
					this.jsModelCountryOrigin.loadData(evt.getSource().getModel().sServiceUrl +
						"CharPossValues?$filter=characteristicid eq 'Z_PROVENIENZA'");
				}

				if (this.keydownHadlerEnabled === undefined) {
					this.keydownHadlerEnabled = true;
					$(document).keydown(this._keyDown.bind(this));
				}

				this.so = so;
				this.soData = soData;
				this.ctxGlobal = ctxGlobal;

				this.matFilter = [];
				this.nodeFilter = [];

				//---> ensure on unexpected window close to kill allocation requests
				if (this.setUnexpectedClosureCallback === undefined) {

					this.setUnexpectedClosureCallback = true;

					//---> if you kill or refresh the window... must clean the request buffer from server
					$(window).unload(function () {

						var dt = new Object();
						dt.REQUEST_GUID_LIST = [];

						for (var idx = 0; idx < this.requestIds.length; idx++) {
							dt.REQUEST_GUID_LIST.push(new Object({
								REQUEST_GUID: this.requestIds[idx]
							}));
						}

						var dtExt = new Object();
						dtExt.DATA = JSON.stringify(dt);
						var dtj = JSON.stringify(dtExt);

						fetch(this.getModel().sServiceUrl + 'DELETE_REQUEST_BUFFER', {
							method: 'POST',
							mode: 'same-origin',
							headers: {
								"Content-Type": "application/json",
								"X-CSRF-Token": this.token
							},
							body: dtj,
							keepalive: true //<---- MUST BE PRESENT on unload event
						});

					}.bind(this));
				}

				//----> get the token for (unexpected) tab closure (unload event)
				$.ajax({
					url: this.getModel().sServiceUrl,
					headers: {
						"X-CSRF-Token": "Fetch",
					},
					success: function (data, textStatus, request) {
						this.token = request.getResponseHeader('x-csrf-token');
					}.bind(this)
				});

				//-->pad start location to get always 4 cha
				this.waitDialog.open();
				this.waitDialog.setText('carico disponibilità...');

				this.isCustAvail = isCustAvail;

				if (isCustAvail === true) {
					this.association = 'AtpcAvailabilityRes';
				} else {
					this.association = 'AtpcAvailability';
				}

				this.jsModelList.loadData(evt.getSource().getModel().sServiceUrl + "SalesOrderTrade(docnr='" + this.so +
					"')?$expand=" + this.association + "($filter=requestOnlyDestNode eq '1')");
			},

			changeLocalFlag: function (evt) {

				var shippingNode;
				if (this.jsModelSelectedAlternativeRoute.getData() !== null) {
					shippingNode = this.jsModelSelectedAlternativeRoute.getData().sotradelgort;
					var reqDate = this.jsModelSelectedAlternativeRoute.getData().sotradedate;
					var reqTime = this.jsModelSelectedAlternativeRoute.getData().sotradetime;
				} else {
					shippingNode = this.jsModelList.getData().zzlgort;
					var reqDate = this.jsModelList.getData().fodeparturedate;
					var reqTime = this.jsModelList.getData().fodeparturetime.replace(new RegExp(':', 'g'), '');
				}

				var onlyLocalNode;
				if (evt.getParameter('state') == false) {
					onlyLocalNode = '0';
				} else {
					onlyLocalNode = '1';
				}

				var onlyPartnerReserver;
				if (this.byId('onlyPartner').getState() === true) {
					onlyPartnerReserver = "and requestSpecificBp eq '" + this.soData.customercode + "'";
				} else {
					onlyPartnerReserver = '';
				}

				var ms = new FioritalMessageStrip('riseleziona trade item dopo caricamento dati', {
					status: 'warning',
					icon: 'sap-icon://warning2',
					timeout: 2000
				});

				this.jsModelList.loadData(evt.getSource().getModel().sServiceUrl + "SalesOrderTrade(docnr='" + this.so +
					"')?$expand=" + this.association + "($filter=requestOnlyDestNode eq '" + onlyLocalNode + "' " +
					onlyPartnerReserver + " )");

				this.byId('allocationPopupAxA').setBusy(true);

			},

			getYsocket: function () {
				//---> component need APC callback handler check if present
				this.componentRef = sap.ui.core.Component.getOwnerComponentFor(this);

				if (this.componentRef.YsocketManager === undefined) {

					this.YsocketManager = new this.APCManager(this.getApchandshake(), this.getApcendpoint(), this);

				} else {
					this.YsocketManager = this.componentRef.YsocketManager;
				}
			},

			onAfterOpen: function (evt) {

				this.opened = true;
				this.getYsocket();

			},

			onAfterClose: function (evt) {

				//--> free models
				this.jsModelListDisplay.setData([]);

				//---> remove the request buffer from server
				this.deleteRequest = this.getModel().bindContext('/DELETE_REQUEST_BUFFER(...)');

				var dt = new Object();
				dt.REQUEST_GUID_LIST = [];

				for (var idx = 0; idx < this.requestIds.length; idx++) {
					dt.REQUEST_GUID_LIST.push(new Object({
						REQUEST_GUID: this.requestIds[idx]
					}));
				}

				this.deleteRequest.setParameter('DATA', JSON.stringify(dt));

				//---> fire the UNBOUND action on odata V4
				this.deleteRequest.execute().then(function () {
					this.requestIds = []; //<-- reset the request ids
				}.bind(this));

			},

			onPressFO: function (evt) {

				var dt = evt.getSource().getBindingContext('ALTERNATIVEROUTES').getObject();

				if (dt.sotradeitemfo === 'X') {
					//---> hide; default route!
					this.jsModelSelectedAlternativeRoute.setData(null);
					this.byId('alternativeRouteShow').setVisible(false);
				} else {
					//---> show it
					this.jsModelSelectedAlternativeRoute.setData(dt);
					this.byId('alternativeRouteShow').setVisible(true);
				}

				this.waitDialog.open();
				this.waitDialog.setText('carico per FO alternativo');

				var onlyLocalNode;
				if (this.byId('onlylocalavailability').getState() === false) {
					onlyLocalNode = '0';
				} else {
					onlyLocalNode = '1';
				}

				var onlyPartnerReserver;
				if (this.byId('onlyPartner').getState() === false) {
					onlyPartnerReserver = "and requestSpecificBp eq '" + this.so.customercode + "'";
				} else {
					onlyPartnerReserver = '';
				}

				var OriginFilterStr = '';
				if (this.byId('filterOrigin').getSelectedKey() !== '') {
					OriginFilterStr = " and origin eq '" + this.byId('filterOrigin').getSelectedKey() + "'";
				}
				var FaoFilterStr = '';
				if (this.byId('filterFaozone').getSelectedKey() !== '') {
					FaoFilterStr = " and faozone eq '" + this.byId('filterFaozone').getSelectedKey() + "'";
				}
				var ProductCategoryFilterStr = '';
				if (this.byId('filterProductCategory').getSelectedKey() !== '') {
					ProductCategoryFilterStr = " and category eq '" + this.byId('filterProductCategory').getSelectedKey() + "'";
				}

				var ms = new FioritalMessageStrip('riseleziona trade item dopo caricamento dati', {
					status: 'warning',
					icon: 'sap-icon://warning2',
					timeout: 2000
				});

				this.jsModelList.loadData(evt.getSource().getModel().sServiceUrl + "SalesOrderTrade(docnr='" + this.so +
					"')?$expand=" + this.association + "($filter=requestOnlyDestNode eq '" + onlyLocalNode +
					"' and destNodeReqDate eq " + dt.sotradedate +
					" and destNodeReqTime eq '" +
					dt.sotradetime + "' and destNode eq '" + dt.sotradelgort + "' " + onlyPartnerReserver + OriginFilterStr + FaoFilterStr +
					ProductCategoryFilterStr + " )");

				this.byId('spliAllcoationPopup').hideMaster();

			},

			valueAllocationChange: function (evt) {
				this.__internal_calculatePreSelected();
				this._setBadgeAllocations();
			},

			onSuggest: function (event) {

				var value = event.getParameter("suggestValue").toUpperCase();

				if (value !== '') {
					this.jsModelSuggest.loadData(event.getSource().getModel().sServiceUrl +
						"Product?$select=productcode,productdescription&$filter=contains(productcode,'" + value + "') or contains(productdescription,'" +
						value + "')");
				}

			},

			suggestionModelLoaded: function (evt) {
				this.byId('inputtradeitem').suggest();
			},

			__applyListFilter: function () {

				var finalFilter = [];
				if (this.nodeFilter.length > 0) {
					finalFilter.push.apply(finalFilter, this.nodeFilter);
				}

				if (this.matFilter.length > 0) {
					finalFilter.push.apply(finalFilter, this.matFilter);
				}

				//---> base filter for alternative route	

				this.byId('allocationBasicList').getBinding('items').filter(finalFilter);

			},

			__internalCheckOverAllocation: function (supply, sum) {

				for (var idx = 0; idx < supply.length; idx++) {

					var sum = 0;
					var isSingleBatchOver = '';

					for (var subidx = 0; subidx < supply[idx].batches.length; subidx++) {

						if (supply[idx].allocateQty > supply[idx].qtyAvailable) {
							isSingleBatchOver = 'X';
						}
					}

				}

				return sum;

			},

			__internal_clearAllocationQtyFromModel: function (mdl) {

				var dat = mdl.getData();

				for (var idx = 0; idx < dat.length; idx++) {
					for (var subidx = 0; subidx < dat[idx].batches.length; subidx++) {
						dat[idx].batches[subidx].allocateQty = 0;
					}
				}

				mdl.refresh(true);
			},

			__internal_calculateAllocationQty: function () {

				var sum = 0;

				sum = this.__internal_calculateAllocationQtyModel(this.jsModelListDisplay.getData(), sum);

				//---> set the text for use 
				this.byId('qtySelected').setText(sum);

				//---> over custom order line qty?
				if (sum > this.jsModelList.getData().lineQty) {
					this.byId('iconOverSelection').addStyleClass('blinking');
				} else {
					this.byId('iconOverSelection').removeStyleClass('blinking');
				}

			},

			__internal_calculateAllocationQtyModel: function (dat, sum) {

				if (this.isCustAvail === true) {
					this.jsModelList.getData().AtpcAvailabilityRes.forEach(function (savail) {
						var checkNum = isNaN(parseFloat(savail.allocateQty));
						if (checkNum === false) {
							sum = sum + parseFloat(savail.allocateQty);
						}
					});
				} else {
					this.jsModelList.getData().AtpcAvailability.forEach(function (savail) {
						var checkNum = isNaN(parseFloat(savail.allocateQty));
						if (checkNum === false) {
							sum = sum + parseFloat(savail.allocateQty);
						}
					});
				}

				return sum;
			},

			runAllocation: function (evt) {
				var exitQty = false;

				this.byId('btnAllocation').setEnabled(false);
				//---> create allocations
				this.createRequest = this.getModel().bindContext('/CREATE_ATPC_CHAIN(...)');

				var dt = new Object();
				dt.REQUESTED_AVAILABILITIES = [];
				if (this.isCustAvail === true) {
					dt.REQUESTED_AVAILABILITIES = this.__internal_appendAllocationQty(this.jsModelList.getData().AtpcAvailabilityRes, dt.REQUESTED_AVAILABILITIES,
						false);
				} else {
					dt.REQUESTED_AVAILABILITIES = this.__internal_appendAllocationQty(this.jsModelList.getData().AtpcAvailability, dt.REQUESTED_AVAILABILITIES,
						false);
				}

				dt.REQUESTED_AVAILABILITIES.forEach(function (data) {
					if (data.QTY > data.DISPO) {
						exitQty = true;
					}
				}.bind(this));

				if (exitQty == true) {
					new FioritalMessageStrip('Attenzione, presenti quantità richieste maggiori della disponibilità!', {
						status: 'error',
						icon: 'sap-icon://error',
						timeout: 4000
					});

					return;
				}

				dt.DEMAND_ID = this.so; //<---- only ORDER, no row (create new lines by default)
				dt.DEMAND_TYPE = 'ODV';
				dt.CUSTOMER = '';

				//--> other FO selected?
				if (this.jsModelSelectedAlternativeRoute.getData().sotradelgort !== undefined) {
					dt.EXPLICIT_DEMAND_FO = this.jsModelSelectedAlternativeRoute.getData().freightorderid;
				} else {
					dt.EXPLICIT_DEMAND_FO = '';
				}

				dt.CREATE_ASYNC = 'X';
				dt.MANUAL_ATPC_REFERENCE = '';

				dt.REQUEST_GUID_LIST = [];
				for (var idx = 0; idx < this.requestIds.length; idx++) {
					dt.REQUEST_GUID_LIST.push(new Object({
						REQUEST_GUID: this.requestIds[idx]
					}));
				}

				this.createRequest.setParameter('DATA', JSON.stringify(dt));
				this.byId('allocationPopupAxA').setBusy(true);

				//---> fire the UNBOUND action on odata V4
				this.createRequest.execute().then(function (dt) {

					this.byId('allocationPopupAxA').setBusy(false);

					var result = this.createRequest.getBoundContext().getObject().res;

					var finalMessage;
					if (this.createRequest.getBoundContext().getObject().message === '') {
						finalMessage = 'Allocazione rifiutata';
					} else {
						finalMessage = this.createRequest.getBoundContext().getObject().message;
					}

					if (result === 0) {

						//---> fire the toast message
						this.byId('allocationPopupAxA').setBusy(false);
						this.byId('btnAllocation').setEnabled(true);

						new FioritalMessageStrip(finalMessage, {
							status: 'error',
							icon: 'sap-icon://error',
							timeout: 4000
						});

					} else {

						//--> ex listener

						//---> close popup
						this.ctxGlobal.refresh('directGroup', true);
						this.byId('btnAllocation').setEnabled(true);

						this.byId('allocationPopupAxA').close();

					}

				}.bind(this)).catch(function (exc) {
					this.byId('allocationPopupAxA').setBusy(false);
					this.byId('btnAllocation').setBusy(false);
					new this.FioritalMessageStrip('Eccezione in allocazione', {
						status: 'error',
						icon: 'sap-icon://error',
						timeout: 4000
					});
				}.bind(this));

			},

			runAllocationContinue: function (evt) {
				var exitQty = false;
				//---> create allocations
				this.createRequest = this.getModel().bindContext('/CREATE_ATPC_CHAIN(...)');

				this.localModel.setProperty('/count', this.localModel.getData().count + 1);

				var dt = new Object();
				dt.REQUESTED_AVAILABILITIES = [];
				if (this.isCustAvail === true) {
					dt.REQUESTED_AVAILABILITIES = this.__internal_appendAllocationQty(this.jsModelList.getData().AtpcAvailabilityRes, dt.REQUESTED_AVAILABILITIES,
						true);
				} else {
					dt.REQUESTED_AVAILABILITIES = this.__internal_appendAllocationQty(this.jsModelList.getData().AtpcAvailability, dt.REQUESTED_AVAILABILITIES,
						true);
				}

				dt.REQUESTED_AVAILABILITIES.forEach(function (data) {
					if (data.QTY > data.DISPO) {
						exitQty = true;
					}
				}.bind(this));

				if (exitQty == true) {
					new FioritalMessageStrip('Attenzione, presenti quantità richieste maggiori della disponibilità!', {
						status: 'error',
						icon: 'sap-icon://error',
						timeout: 4000
					});

					return;
				}
				
				debugger;

				dt.DEMAND_ID = this.so; //<---- only ORDER, no row (create new lines by default)
				dt.DEMAND_TYPE = 'ODV';
				dt.CUSTOMER = '';
				dt.DIRECT_REQUEST = [];
				
				dt.DIRECT_REQUEST.push({DEST_NODE : this.ctxGlobal.getContext().getObject().zzlgort});
				

				//--> other FO selected?
				if (this.jsModelSelectedAlternativeRoute.getData().sotradelgort !== undefined) {
					dt.EXPLICIT_DEMAND_FO = this.jsModelSelectedAlternativeRoute.getData().freightorderid;
				} else {
					dt.EXPLICIT_DEMAND_FO = '';
				}

				dt.CREATE_ASYNC = 'X';
				dt.MANUAL_ATPC_REFERENCE = '';

				dt.REQUEST_GUID_LIST = [];
				for (var idx = 0; idx < this.requestIds.length; idx++) {
					dt.REQUEST_GUID_LIST.push(new Object({
						REQUEST_GUID: this.requestIds[idx]
					}));
				}

				this.createRequest.setParameter('DATA', JSON.stringify(dt));

				//---> fire the UNBOUND action on odata V4
				this.createRequest.execute().then(function (dt) {
					var result = this.createRequest.getBoundContext().getObject().res;

					var finalMessage;
					if (this.createRequest.getBoundContext().getObject().message === '') {
						finalMessage = 'Allocazione rifiutata';
					} else {
						finalMessage = this.createRequest.getBoundContext().getObject().message;
					}

					if (result === 0) {

						//---> fire the toast message

						new FioritalMessageStrip(finalMessage, {
							status: 'error',
							icon: 'sap-icon://error',
							timeout: 4000
						});

					} else {

						//--> ex listener

						//---> close popup
						this.ctxGlobal.refresh('directGroup', true);

					}

				}.bind(this)).catch(function (exc) {
					new this.FioritalMessageStrip('Eccezione in allocazione', {
						status: 'error',
						icon: 'sap-icon://error',
						timeout: 4000
					});
				}.bind(this));

			},

			__internal_appendAllocationQty: function (dat, allocArray, setBusy) {

				for (var i = 0; i < dat.length; i++) {
					if (dat[i].allocateQty !== undefined && dat[i].allocateQty !== 0 && dat[i].allocateQty !== '' && dat[i].allocateQty !== '0' && dat[
							i].isAllocating !== true) {
						var newAll = new Object();
						if (!setBusy) {
							newAll.GUID = dat[i].guid;
						} else {
							newAll.IDX_CHARG = dat[i].charg;
							newAll.GCID = dat[i].gcid;
							newAll.GRID = dat[i].grid;
						}

						newAll.QTY = dat[i].allocateQty;
						newAll.DISPO = dat[i].qtyAvailable;
						newAll.HU = dat[i].exidv;

						if (dat[i].inputprice !== undefined && dat[i].inputprice !== 0 && dat[i].inputprice !== '' && dat[i].inputprice !== '0') {
							newAll.DIRECT_PRICE = dat[i].inputprice;
						}

						if (setBusy) {
							this.jsModelList.setProperty('/AtpcAvailability/' + i + '/isAllocating', true);

							var fnd = this.jsModelListDisplay.getData().findIndex(function (itm) {
								if (this.jsModelParameters.getData().groupTreeProperty === 'nogrp') {
									return (itm.gcid === dat[i].gcid && itm.grid === dat[i].grid && itm.charg === dat[i].charg);
								} else {
									return (itm.subgroup.gcid === dat[i].gcid && tm.subgroup.grid === dat[i].grid && tm.subgroup.charg === dat[i].charg);
								}
							}.bind(this));

							if (fnd > -1) {
								if (this.jsModelParameters.getData().groupTreeProperty === 'nogrp') {
									this.jsModelListDisplay.setProperty('/' + fnd + '/isAllocating', true);
								} else {
									this.jsModelListDisplay.setProperty('/subgroup/' + fnd + '/isAllocating', true);
								}
							}
							//dat[i].isAllocating = true;
						}

						allocArray.push(newAll);
					}
				}

				return allocArray;
			},

			closeAllocation: function (evt) {
				this.byId('allocationPopupAxA').close();
			},

			multiRouteShowSingle: function (evt) {

				this.pressedMultiIcon = evt.getSource();

				if (evt.getSource().getBindingContext('SUPPLYJSONMODEL') !== undefined) {
					this.selectedCluster = evt.getSource().getBindingContext('SUPPLYJSONMODEL');
					var dt = evt.getSource().getBindingContext('SUPPLYJSONMODEL').getObject();
					this.activeJsonModel = this.jsModelListDisplay;
				}

				if (evt.getSource().getBindingContext('SUPPLYJSONMODELALL') !== undefined) {
					this.selectedCluster = evt.getSource().getBindingContext('SUPPLYJSONMODELALL');
					var dt = evt.getSource().getBindingContext('SUPPLYJSONMODELALL').getObject();
					this.activeJsonModel = this.jsModelListDisplayAll;
				}

				if (evt.getSource().getBindingContext('SUPPLYJSONMODELALTERNATIVE') !== undefined) {
					this.selectedCluster = evt.getSource().getBindingContext('SUPPLYJSONMODELALTERNATIVE');
					var dt = evt.getSource().getBindingContext('SUPPLYJSONMODELALTERNATIVE').getObject();
					this.activeJsonModel = this.jsModelListDisplayAlternative;
				}

				this.getSelectedCluster = dt;
				this.jsModelListAlternativeRoutesPopover.loadData(evt.getSource().getModel().sServiceUrl + this.association + "(gcid='" + dt.batches[
						0]
					.gcid +
					"',grid='" + dt.batches[0].grid + "',charg='" + dt.batches[0].charg + "',destNodeReqDate=" + dt.batches[0].destNodeReqDate +
					",destNodeReqTime='" + dt.batches[0].destNodeReqTime +
					"')/AtpcPossibleRoutes?$expand=AtpcPossibleRoutesNodes&$filter= routeid eq '" + dt.routeid + "'"); //<-- it's ok to take the frst batch guid

				this.byId('allocationBasicList').setBusy(true);

			},

			onInputPriceChange: function (evt) {
				if (evt.getParameter('value') === '') {
					evt.getSource().setValue('0.00');
				}
			},

			//------------------------ formatters -------------------------------------------------------------------------------------------------------------------------------------------------------

			deleteTrailZeros: function (foId) {
				try {
					return foId.replace(/^0+/, '');
				} catch (ex) {

				}
			},

			formatFOdate: function (datestring) {
				try {
					if (datestring === '') {
						return '';
					} else {
						return datestring.substring(6, 8) + "/" + datestring.substring(4, 6) + "/" + datestring.substring(0, 4);
					}
				} catch (ex) {

				}
			},

			formatFOtime: function (timeString) {
				try {
					if (timeString === '') {
						return '';
					} else {
						return timeString.substring(0, 2) + ":" + timeString.substring(2, 4);
					}
				} catch (ex) {

				}
			},

			formatAvailDate: function (availDate, supplyType) {
				try {
					if (availDate !== undefined && supplyType !== undefined) {

						if (supplyType === 'STK') {
							return 'In Stock';
						} else {
							return availDate;
						}

					} else {
						return '';
					}
				} catch (error) {

				}

			},

			formatAvailTime: function (availTime, supplyType) {
				try {
					if (availTime !== undefined && supplyType !== undefined) {
						if (supplyType === 'STK') {
							return '';
						} else {
							return availTime;
						}
					} else {
						return '';
					}
				} catch (error) {

				}

			},

			formatIconSupplyType: function (supplyType) {
				try {
					switch (supplyType) {
					case 'STO':
						return 'sap-icon://shipping-status';
						break;
					case 'STK':
						return 'sap-icon://database';
						break;
					case 'ODA':
						return 'sap-icon://customer-financial-fact-sheet';
						break;
					case 'ODP':
						return 'sap-icon://factory';
						break;
					case 'ATPC':
						return 'sap-icon://shipping-status';
						break;
					default:
					}
				} catch (error) {

				}
			},

			formatIconMultiRouteVisible: function (routesCount, destNode, node, adiacentRoute) {
				
				if (routesCount === undefined){
					return false;
				}
				
				try {
					if (destNode === node && routesCount > 0) {
						return false;
					} else {
						return true;
					}
				} catch (error) {
					
				}

			},

			textGoodsQuality: function (txtGQ) {
				try {
					if (txtGQ === '' || txtGQ === undefined) {
						return '';
					} else {
						return 'Cat. ' + txtGQ;
					}
				} catch (error) {

				}

			},

			formatIconMultiRoute: function (routesCount, adiacentRoute) {
				try {
					if (adiacentRoute === 'X') {
						return 'sap-icon://screen-split-two';
					} else {
						if (routesCount === 0) {
							return 'sap-icon://broken-link';
						} else if (routesCount > 1) {
							return 'sap-icon://checklist';
						} else if (routesCount === 1) {
							return 'sap-icon://checklist-item';
						} else {
							return 'sap-icon://checklist-item';
						}
					}
				} catch (error) {

				}
			},

			formatIconMultiRouteColor: function (routesCount, destNode, node, adiacentRoute) {
				try {
					if ((destNode === node && routesCount > 0) || adiacentRoute === 'X') {
						return 'darkseagreen';
					} else {
						if (routesCount > 0) {
							return 'green';
						} else {
							return 'red';
						}
					}
				} catch (error) {

				}
			},

			showIceRework: function (specialBatch) {
				try {
					return specialBatch.includes('G');
				} catch (error) {
					return false;
				}

			},

			showSanificationRework: function (specialBatch) {
				try {
					return specialBatch.includes('B');
				} catch (error) {
					return false;
				}
			},

			producerVisible: function (producer, vendor, batchid) {
				try {
					if (producer !== undefined && batchid !== undefined) {
						if (producer === vendor || batchid === 'GENERIC') {
							return false;
						} else {
							return true;
						}
					} else {
						return false;
					}
				} catch (error) {

				}
			},

			vendorVisible: function (producer, vendor, batchid) {
				try {
					if (batchid !== undefined) {
						if (batchid === 'GENERIC') {
							return false;
						} else {
							return true;
						}
					} else {
						return false;
					}
				} catch (error) {}
			},

			priceNull: function (price) {

				try {
					if (price !== undefined) {
						if (price === 0) {
							return '(nd)';
						} else {
							return price;
						}
					} else {
						return '';
					}
				} catch (error) {

				}
			},

			hidePrice: function (price) {
				try {
					if (price === 0 || price === undefined) {
						return false;
					} else {
						return true;
					}
				} catch (error) {

				}
			},

			hideRouteOnStock: function (destNode, node, adiacent, routesCnt) {
				try {
					if (destNode === node || adiacent === 'X' || routesCnt === 0) {
						return false;
					} else {
						return true;
					}
				} catch (error) {

				}
			},

			formatAvailTimePopover: function (availTime, supplyType) {
				try {
					if (availTime !== undefined && supplyType !== undefined) {
						if (supplyType === 'STK') {
							return '';
						} else {
							return availTime.substr(0, 2) + ':' + availTime.substr(2, 2) + ':' + availTime.substr(4, 2);
						}
					} else {
						return '';
					}
				} catch (error) {

				}

			},

			hideSupplyId: function (supplyType, supplyId) {
				try {
					switch (supplyType) {
					case 'ODA':
						return true;
						break;
					case 'STO':
						return true;
						break;
					case 'ODP':
						return true;
						break;
					default:
						return false;
					}
				} catch (error) {

				}
			},

			formatIconDemandTypeSrc: function (demandType) {
				try {
					switch (demandType) {
					case 'ODV':
						return 'sap-icon://customer';
						break;
					case 'MAN':
						return 'sap-icon://shipping-status';
						break;
					case 'ODP':
						return 'sap-icon://factory';
						break;
					default:
					}
				} catch (error) {

				}
			},

			supplyTypeText: function (supplyType) {
				try {
					switch (supplyType) {
					case 'STO':
						return 'Trasferimento in corso';
						break;
					case 'STK':
						return 'Stock';
						break;
					case 'ODA':
						return 'Ordine acquisto';
						break;
					case 'ODP':
						return 'Ord.Prod.';
						break;
					case 'ATPC':
						return 'Trasferimento';
						break;
					default:
					}
				} catch (error) {

				}
			},

			hideAtpcCustomer: function (atpccustomer) {
				try {
					if (atpccustomer === '' || atpccustomer === null || atpccustomer === undefined) {
						return false;
					} else {
						return true;
					}
				} catch (error) {

				}

			},

			truncateNumber: function (number) {
				return Math.trunc(parseFloat(number));
			},

			supplyIdFormat: function (suppType, suppId) {
				try {
					switch (suppType) {
					case 'ODA':
						return suppId.replace(/^0+/, '');
						break;
					case 'STO':
						return suppId.replace(/^0+/, '');
						break;
					case 'ODP':
						return suppId.replace(/^0+/, '');
						break;
					default:
						return false;
					}

				} catch (error) {

				}

			},

			isPresentInOrder: function (orderSum) {
				if (orderSum > 0) {
					return 'X';
				} else {
					return '';
				}
			},

			formatIconDemandTypeColor: function (rowType) {
				switch (rowType) {
				case 'P':
					return 'green';
					break;
				default:
					return 'red';
					break;
				}
			},

			formatBatchDates: function (batchDate) {
				if (batchDate === '' || batchDate === null) {
					return 'n.d.';
				} else {
					return batchDate;
				}
			},

			computeResidualAllocation: function (iAllocatedQty, iQty) {
				return parseInt(iQty - iAllocatedQty);
			},

			onCollapseAll: function () {
				this.byId('availabilityTreeTable').collapseAll();
			},

			onExpandFirstLevel: function () {
				this.byId('availabilityTreeTable').expandToLevel(1);
			},
			backColorAllocationType: function (validity) {
				switch (validity) {
				case '3':
					return '#0a6ed136';
					break;
				case '4':
					return 'khaki';
					break;
				default:
					return 'white';
				}

			},

			setInputBackground: function (avail, allocate) {
				if (allocate != undefined && allocate > avail) {
					return 'red';
				}

				if (avail == 0) {
					return 'lightgrey';
				}
			},

			changeColorMaterialGrouping: function (grouping) {
				if (grouping == 'nogrp') {
					return 'black';
				} else {
					return 'lightgrey';
				}
			}

		});

		return FOManager;

	},
	true);