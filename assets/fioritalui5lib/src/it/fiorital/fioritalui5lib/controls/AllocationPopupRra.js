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
		"it/fiorital/fioritalui5lib/extension/FloatFixed2Parse"
	],
	function (jQuery, XMLComposite, MessageToast, MessageBox, Filter, FilterOperator, jsModel, APCManager, FioritalMessageStrip, FloatParse2D) {
		"use strict";

		var AllocRRA = XMLComposite.extend("it.fiorital.fioritalui5lib.controls.AllocationPopupRra", {
			metadata: {
				properties: {
					title: {
						type: "string",
						defaultValue: "Allocation"
					},
					modelname: {
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
			FloatParse2D: FloatParse2D,

			jsonRequestCompletedAll: function (event) {

				//---> must store the request id for later kill
				if (this.jsModelListAll.getData().value.length > 0) {
					this.requestIds.push(this.jsModelListAll.getData().value[0].requestGuid); //<-- take the first all are the same 
				}

				//--> prepare output structured format
				this.jsModelListDisplayAll.setData(this.__internal_CompactAtpcAvilability(this.jsModelListAll.getData().value));

				this.byId('allocationAllList').setBusy(false);

			},

			jsonRequestCompletedAlternative: function (event) {

				//---> must store the request id for later kill
				if (this.jsModelListAlternative.getData().value.length > 0) {
					this.requestIds.push(this.jsModelListAlternative.getData().value[0].requestGuid); //<-- take the first all are the same 
				}

				//--> prepare output structured format
				this.jsModelListDisplayAlternative.setData(this.__internal_CompactAtpcAvilability(this.jsModelListAlternative.getData().value));

				this.byId('allocationAlternativeList').setBusy(false);

			},

			jsonRequestCompletedFree: function (event) {

				//---> must store the request id for later kill
				if (this.jsModelListFree.getData().value.length > 0) {
					this.requestIds.push(this.jsModelListFree.getData().value[0].requestGuid); //<-- take the first all are the same 
				}

				//--> prepare output structured format
				this.jsModelListDisplayFree.setData(this.__internal_CompactAtpcAvilability(this.jsModelListFree.getData().value));

				this.byId('allocationFreeList').setBusy(false);

			},

			jsonRequestCompleted: function (event) {
				//---> must store the request id for later kill
				if (this.jsModelList.getData().AtpcItemAvailability.length > 0) {
					this.requestIds.push(this.jsModelList.getData().AtpcItemAvailability[0].requestGuid); //<-- take the first all are the same 
				}

				//--> prepare output structured format & set data for models (divide json)
				if (this.jsModelList.getData().SotItemCompatibleFo !== undefined) {
					this.jsModelListAlternativeRoutes.setData(this.jsModelList.getData().SotItemCompatibleFo);
				}

				this.jsModelListDisplay.setData(this.__internal_CompactAtpcAvilability(this.jsModelList.getData().AtpcItemAvailability));

				sap.ui.core.BusyIndicator.hide();
				this.byId('allocationPopupRra').open();

			},

			changeShowGenerics: function (evt) {

				var selectedPage = this.byId('idIconTabBar').getSelectedKey();

				switch (selectedPage) {
				case 'basic':
					var finalShowData = this.__internal_CompactAtpcAvilability(this.jsModelList.getData().AtpcItemAvailability);
					this.jsModelListDisplay.setData(finalShowData);
					break;
				case 'all':
					var finalShowData = this.__internal_CompactAtpcAvilability(this.jsModelListAll.getData().value);
					this.jsModelListDisplayAll.setData(finalShowData);
					break;
				case 'alt':
					var finalShowData = this.__internal_CompactAtpcAvilability(this.jsModelListAlternative.getData().value);
					this.jsModelListDisplayAlternative.setData(finalShowData);
					break;
				case 'free':
					break;
				default:
				}

			},

			__internal_CompactAtpcAvilability: function (data) {

				var prevRef = new Object();
				prevRef.clusterid = -1;
				var resATPC = [];

				for (var idx = 0; idx < data.length; idx++) {

					if (data[idx].charg !== 'GENERIC' || this.byId('showGenericBatches').getSelected() === true) {

						if (idx == 0 || (prevRef.clusterid !== data[idx].clusterid || prevRef.node !== data[idx].node)) {
							var newAvailObj = new Object();
							newAvailObj['destNode'] = data[idx]['destNode'];
							newAvailObj['node'] = data[idx]['node'];
							newAvailObj['defaultRouteid'] = data[idx]['defaultRouteid'];
							newAvailObj['destinationInDate'] = data[idx]['destinationInDate'];
							newAvailObj['destinationInTime'] = data[idx]['destinationInTime'];
							newAvailObj['foinId'] = data[idx]['foinId'];
							newAvailObj['matnr'] = data[idx]['matnr'];
							newAvailObj['qtyMaxCluster'] = data[idx]['qtyMaxCluster'];
							newAvailObj['routesCnt'] = data[idx]['routesCnt'];
							newAvailObj['sourceAvailabilityDate'] = data[idx]['sourceAvailabilityDate'];
							newAvailObj['sourceAvailabilityTime'] = data[idx]['sourceAvailabilityTime'];
							newAvailObj['sourceOutDate'] = data[idx]['sourceOutDate'];
							newAvailObj['sourceOutTime'] = data[idx]['sourceOutTime'];
							newAvailObj['supplyId'] = data[idx]['supplyId'];
							newAvailObj['supplyStatus'] = data[idx]['supplyStatus'];
							newAvailObj['supplyType'] = data[idx]['supplyType'];
							newAvailObj['boxtype'] = data[idx]['boxtype'];

							if (newAvailObj['defaultRouteid'] === 'X') {
								newAvailObj['routeid'] = data[idx]['routeid'];
							}

							newAvailObj['hasDefaultRoute'] = '';
							newAvailObj['overAllocation'] = '';
							newAvailObj['maktx'] = data[idx]['maktx'];
							newAvailObj['uom'] = data[idx]['uom'];
							newAvailObj['atpcCustomer'] = data[idx]['atpcCustomer'];
							newAvailObj['atpcCustomerName'] = data[idx]['atpcCustomerName'];

							newAvailObj.batches = [];
							data[idx].allocateQty = 0;

							if (data[idx].defaultRouteid === 'X') {
								newAvailObj['hasDefaultRoute'] = 'X';
							}

							newAvailObj.batches.push(data[idx]);

							resATPC.push(newAvailObj);

						} else {
							data[idx].parentref = newAvailObj; //<-- parent reference
							data[idx].allocateQty = 0;

							if (data[idx].defaultRouteid === 'X') {
								newAvailObj['routeid'] = data[idx]['routeid'];
							}

							if (data[idx].defaultRouteid === 'X') {
								newAvailObj['hasDefaultRoute'] = 'X';
							}

							newAvailObj.batches.push(data[idx]);
						}

						prevRef = data[idx];
					}
				}

				//---> check for missing default route
				for (idx = 0; idx < resATPC.length; idx++) {
					if (resATPC[idx]['hasDefaultRoute'] === '') {

						var frid = resATPC[idx].batches[0].routeid; //<--- take first...
						for (var subidx = 0; subidx < resATPC[idx].batches.length; subidx++) {
							if (resATPC[idx].batches[subidx].routeid === frid) {
								resATPC[idx].batches[subidx].defaultRouteid = 'X';
							}
						}

					}
				}

				//--> special char for CSS
				for (idx = 0; idx < resATPC.length; idx++) {
					var itm;
					resATPC[idx].batches.forEach(function (sitem) {
						if (sitem.defaultRouteid === 'X') {
							itm = sitem;
						}
					});
					itm.LASTBATCH = 'X';
				}

				return resATPC;

			},

			jsonRequestCompletedAPI: function (event) {

				//---> store the request Id

			},

			showBatchDetails: function (evt) {

				var ctx = evt.getSource().getBindingContext('SUPPLYJSONMODEL');

				if (ctx === undefined) {
					var ctx = evt.getSource().getBindingContext('SUPPLYJSONMODELALL');
				}

				if (ctx === undefined) {
					var ctx = evt.getSource().getBindingContext('SUPPLYJSONMODELALTERNATIVE');
				}

				if (ctx === undefined) {
					var ctx = evt.getSource().getBindingContext('SUPPLYJSONMODELFREE');
				}

				var obj = ctx.getObject();

				this.byId('attributeManagerId').openByBatchId(evt, obj.charg, obj.matnr, '1000');

			},

			jsonRequestCompletedAlternativeRoutesPopover: function (event) {

				this.byId('allocationBasicList').setBusy(false);

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

				//---> store actual context
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

				this.pressedMultiIcon = evt.getSource();

				this.getSelectedCluster = dt;
				this.jsModelListAlternativeRoutesPopover.loadData(this.LocalModel.sServiceUrl + "AtpcAvailability(gcid='" + dt.batches[0].gcid +
					"',grid='" + dt.batches[0].grid + "',charg='" + dt.batches[0].charg + "',destNodeReqDate=" + dt.batches[0].destNodeReqDate +
					",destNodeReqTime='" + dt.batches[0].destNodeReqTime + "')/AtpcPossibleRoutes?$expand=AtpcPossibleRoutesNodes"); //<-- it's ok to take the frst batch guid

				this.byId('allocationBasicList').setBusy(true);

			},

			multiRouteShowAll: function (evt) {

				this.pressedMultiIcon = evt.getSource();

				this.activeJsonModel = this.jsModelListDisplayAll;

				var dt = evt.getSource().getBindingContext('SUPPLYJSONMODELALL').getObject();
				this.getSelectedCluster = dt;
				this.jsModelListAlternativeRoutesPopover.loadData(this.LocalModel.sServiceUrl + "AtpcAvailability(gcid='" + dt.batches[0].gcid +
					"',grid='" + dt.batches[0].grid + "',charg='" + dt.batches[0].charg + "',destNodeReqDate=" + dt.batches[0].destNodeReqDate +
					",destNodeReqTime='" + dt.batches[0].destNodeReqTime + "')/AtpcPossibleRoutes?$expand=AtpcPossibleRoutesNodes"); //<-- it's ok to take the frst batch guid

			},

			multiRouteShowAlternative: function (evt) {

				this.pressedMultiIcon = evt.getSource();

				this.activeJsonModel = this.jsModelListDisplayAlternative;

				var dt = evt.getSource().getBindingContext('SUPPLYJSONMODELALTERNATIVE').getObject();
				this.getSelectedCluster = dt;
				this.jsModelListAlternativeRoutesPopover.loadData(this.LocalModel.sServiceUrl + "AtpcAvailability(gcid='" + dt.batches[0].gcid +
					"',grid='" + dt.batches[0].grid + "',charg='" + dt.batches[0].charg + "',destNodeReqDate=" + dt.batches[0].destNodeReqDate +
					",destNodeReqTime='" + dt.batches[0].destNodeReqTime + "')/AtpcPossibleRoutes?$expand=AtpcPossibleRoutesNodes"); //<-- it's ok to take the frst batch guid

			},

			multiRouteShowFree: function (evt) {

				this.pressedMultiIcon = evt.getSource();

				this.activeJsonModel = this.jsModelListDisplayFree;

				var dt = evt.getSource().getBindingContext('SUPPLYJSONMODELFREE').getObject();
				this.getSelectedCluster = dt;
				this.jsModelListAlternativeRoutesPopover.loadData(this.LocalModel.sServiceUrl + "AtpcAvailability(gcid='" + dt.batches[0].gcid +
					"',grid='" + dt.batches[0].grid + "',charg='" + dt.batches[0].charg + "',destNodeReqDate=" + dt.batches[0].destNodeReqDate +
					",destNodeReqTime='" + dt.batches[0].destNodeReqTime + "')/AtpcPossibleRoutes?$expand=AtpcPossibleRoutesNodes"); //<-- it's ok to take the frst batch guid

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

			createGUID: function () {
				return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1) + (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(
					1) + (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1) + (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(
					1) + (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1) + (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(
					1) + (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1) + (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(
					1);
			},

			init: function () {

				//---> super
				XMLComposite.prototype.init.apply(this, arguments);

				this.randomContext = this.createGUID();

				try {
					this.byId('inputtradeitem').getBinding('suggestionItems').suspend();
				} catch (exc) {
					//--> already suspended	
				}

				this.jsModelList = new jsModel;
				this.jsModelListDisplay = new jsModel;

				this.jsModelListAll = new jsModel;
				this.jsModelListDisplayAll = new jsModel;

				this.jsModelListAlternative = new jsModel;
				this.jsModelListDisplayAlternative = new jsModel;

				this.jsModelListFree = new jsModel;
				this.jsModelListDisplayFree = new jsModel;

				this.jsModelSuggest = new jsModel;

				this.jsModeAllocatedQty = new jsModel;

				//-------------------------------------- other models

				this.jsModelListAlternativeRoutes = new jsModel;
				this.jsModelListAlternativeRoutesPopover = new jsModel;
				this.jsModelListAlternativeRoutesPopoverNodes = new jsModel;
				this.jsModelListNoAttributes = new jsModel;
				this.jsModelListAlternativeMaterials = new jsModel;

				this.requestIds = []; //<-- store here the ATPC request Ids (to delete)

				this.jsModelListAlternativeRoutesPopover.attachRequestCompleted(this.jsonRequestCompletedAlternativeRoutesPopover.bind(this));
				this.jsModelList.attachRequestCompleted(this.jsonRequestCompleted.bind(this));
				this.jsModelListAll.attachRequestCompleted(this.jsonRequestCompletedAll.bind(this));
				this.jsModelListAlternative.attachRequestCompleted(this.jsonRequestCompletedAlternative.bind(this));
				this.jsModelListFree.attachRequestCompleted(this.jsonRequestCompletedFree.bind(this));
				this.jsModelListNoAttributes.attachRequestCompleted(this.jsonRequestCompletedAPI.bind(this));
				this.jsModelListAlternativeMaterials.attachRequestCompleted(this.jsonRequestCompletedAPI.bind(this));

				//---> set models to XML component
				this.setModel(this.jsModelList, 'SUPPLYJSONMODELBASE');
				this.setModel(this.jsModelListDisplay, 'SUPPLYJSONMODEL');
				this.setModel(this.jsModelListDisplayAll, 'SUPPLYJSONMODELALL');
				this.setModel(this.jsModelListDisplayAlternative, 'SUPPLYJSONMODELALTERNATIVE');
				this.setModel(this.jsModelListDisplayFree, 'SUPPLYJSONMODELFREE');
				this.setModel(this.jsModelExistingAllocations, 'EXISTINGALLOCATIONS');

				this.setModel(this.jsModelListAlternativeRoutes, 'ALTERNATIVEROUTES');
				this.setModel(this.jsModelListNoAttributes, 'SUPPLYJSONMODELNOATTR');
				this.setModel(this.jsModelListAlternativeMaterials, 'SUPPLYJSONMODELALT');
				this.setModel(this.jsModelListAlternativeRoutesPopover, 'ALTERNATIVEROUTESPOPOVER');
				this.setModel(this.jsModelListAlternativeRoutesPopoverNodes, 'ALTERNATIVEROUTESPOPOVERNODES');

				this.setModel(this.jsModeAllocatedQty, 'ALLOCATEDQTY');

				this.setModel(this.jsModelSuggest, 'SUGGESTIONS');
				this.jsModelSuggest.attachRequestCompleted(this.suggestionModelLoaded.bind(this));
			},

			applySettings: function (mSettings, oScope) {

				//--> super
				XMLComposite.prototype.applySettings.apply(this, arguments);
			},

			openByData: function (evt, rra, rraPos, model, callBackOk, callBackFail, thisRef) {
				//---> redirect base nodel over provided one
				this.setModel(model);

				this.byId('iconOverSelection').removeStyleClass('blinking');
				this.byId('qtySelected').setText('0');
				this.byId('qtySelected2').setText('0');
				this.rra = rra;
				this.LocalModel = model;
				this.thisRef = thisRef;
				this.rraPos = rraPos;
				this.callBackOk = callBackOk; //<-- store for later selective refresh
				this.callBackFail = callBackFail;

				this.byId('alternativeRouteShow').setVisible(false);
				this.byId('btnAllocation').setEnabled(true);

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

						fetch(this.LocalModel.sServiceUrl + 'DELETE_REQUEST_BUFFER', {
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
					url: this.LocalModel.sServiceUrl,
					headers: {
						"X-CSRF-Token": "Fetch",
					},
					success: function (data, textStatus, request) {
						this.token = request.getResponseHeader('x-csrf-token');
					}.bind(this)
				});

				//-->pad start location to get always 4 char
				sap.ui.core.BusyIndicator.show(0);
				this.jsModelList.loadData(this.LocalModel.sServiceUrl + "Rra(banfn='" + rra + "',bnfpo='" + rraPos +
					"')?$expand=AtpcItemAvailability");
			},

			onAfterOpen: function (evt) {

				//---> component need APC callback handler check if present
				this.componentRef = sap.ui.core.Component.getOwnerComponentFor(this);

				if (this.componentRef.YsocketManager === undefined) {

					this.YsocketManager = new this.APCManager('', '', this.componentRef, this.getModelname());

				} else {
					this.YsocketManager = this.componentRef.YsocketManager;
				}

			},

			onAfterClose: function (evt) {

				//---> remove the request buffer from server
				this.deleteRequest = this.LocalModel.bindContext('/DELETE_REQUEST_BUFFER(...)');

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

				this.byId('idIconTabBar').setSelectedKey('basic');

			},

			valueAllocationChange: function (evt) {

				if (evt.getParameter('value') === '') {
					evt.getSource().setValue('0');
				}

				//---> check all quantities in clusters
				this.__internalCheckOverAllocation(this.jsModelListDisplay.getData());
				this.__internalCheckOverAllocation(this.jsModelListDisplayAll.getData());
				this.__internalCheckOverAllocation(this.jsModelListDisplayAlternative.getData());
				this.__internalCheckOverAllocation(this.jsModelListDisplayFree.getData());

				//---> recalculate totals
				this.__internal_calculateAllocationQty();

			},

			__internalCheckOverAllocation: function (supply) {

				for (var idx = 0; idx < supply.length; idx++) {

					var sum = 0;
					var isSingleBatchOver = '';

					for (var subidx = 0; subidx < supply[idx].batches.length; subidx++) {
						sum = sum + parseFloat(supply[idx].batches[subidx].allocateQty);
						if (supply[idx].batches[subidx].allocateQty > supply[idx].batches[subidx].qtyAvailable) {
							isSingleBatchOver = 'X';
						}
					}

					if ((sum > 0 && sum > supply[idx].qtyMaxCluster) || isSingleBatchOver === 'X') {
						supply[idx].overAllocation = 'X';
					} else {
						supply[idx].overAllocation = '';
					}

				}

				return sum;

			},

			changeSupplyPage: function (evt) {

				var selectedPage = evt.getParameter('selectedKey');

				//--> free quantities on tab change
				this.__internal_clearAllocationQtyFromModel(this.jsModelListDisplayAll);
				this.__internal_clearAllocationQtyFromModel(this.jsModelListDisplayAlternative);
				this.__internal_clearAllocationQtyFromModel(this.jsModelListDisplay);

				//---> must check if alternative route is selected
				var shippingNode = this.jsModelList.getData().deststoragelocation;
				var reqDate = this.jsModelList.getData().deliverydate;
				var reqTime = this.jsModelList.getData().deliverytime.split(':').join('');

				switch (selectedPage) {
				case 'basic':
					//---> do nothing; go back

					break;
				case 'all':

					this.jsModelListAll.loadData(this.LocalModel.sServiceUrl + "AtpcAvailability?$filter=destNode eq '" + shippingNode +
						"' and matnr eq '" + this.jsModelList.getData().matnr + "' and destNodeReqDate eq " + reqDate +
						" and destNodeReqTime eq '" + reqTime + "' and node ne '" + shippingNode + "'&$search=ALT" + this.rra + this.rraPos); //<--- $search used as special parameter to free ATPC memory

					this.byId('allocationAllList').setBusy(true, 0);
					break;
				case 'alt':

					var reqDateABAP = reqDate.split('-').join('');

					this.jsModelListAlternative.loadData(evt.getSource().getModel().sServiceUrl + "GET_AVAILABILITY_ALTERNATIVE(MATNR='" + this.jsModelList
						.getData().matnr +
						"',DESTNODE='" + shippingNode + "',DESTNODEREQDATE='" + reqDateABAP + "',DESTNODEREQTIME='" + reqTime +
						"',SHOWUNREACHEABLE='L',SHOWADIACENT='X',MEMORYID='ALT" + this.rra + this.rraPos + //<--- $search used as special parameter to free ATPC memory
						"')");

					this.byId('allocationAlternativeList').setBusy(true, 0);
					break;
				case 'free':
					break;
				default:
				}

				this.__internal_calculateAllocationQty();
			},

			gosearchFree: function (evt) {

				//---> must check if alternative route is selected
				var shippingNode = this.jsModelList.getData().deststoragelocation;
				var reqDate = this.jsModelList.getData().deliverydate;
				var reqTime = '235900';

				//---> ask for materials alternatives 
				this.jsModelListFree.loadData(this.LocalModel.sServiceUrl + "AtpcAvailability?$filter=destNode eq '" +
					shippingNode +
					"' and matnr eq '" + evt.getParameter('query') + "' and destNodeReqDate eq " + reqDate +
					" and destNodeReqTime eq '" + reqTime + "'&$search=ALT" + this.so + this.soItem); //<--- $search used as special parameter to free ATPC memory

				this.byId('allocationFreeList').setBusy(true, 0);

			},

			searchlivechange: function (evt) {

			},

			onSuggest: function (event) {

				var value = event.getParameter("suggestValue");

				if (value !== '') {
					this.jsModelSuggest.loadData(this.LocalModel.sServiceUrl +
						"Product?$select=productcode,productdescription&$filter=contains(productcode,'" + value + "') or contains(productdescription,'" +
						value + "')");
				}

			},

			suggestionModelLoaded: function (evt) {
				this.byId('inputtradeitem').suggest();
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
				var sumKG = 0;

				var requestdUom = this.getModel("SUPPLYJSONMODELBASE").getProperty("/uom");

				if (requestdUom !== 'KG') {
					sum = this.__internal_calculateAllocationQtyModel(this.jsModelListDisplay.getData(), sum, requestdUom);
					sum = this.__internal_calculateAllocationQtyModel(this.jsModelListDisplayAll.getData(), sum, requestdUom);
					sum = this.__internal_calculateAllocationQtyModel(this.jsModelListDisplayAlternative.getData(), sum, requestdUom);
					sum = this.__internal_calculateAllocationQtyModel(this.jsModelListDisplayFree.getData(), sum, requestdUom);

					sumKG = this.__internal_calculateAllocationQtyModel(this.jsModelListDisplay.getData(), sumKG, 'KG');
					sumKG = this.__internal_calculateAllocationQtyModel(this.jsModelListDisplayAll.getData(), sumKG, 'KG');
					sumKG = this.__internal_calculateAllocationQtyModel(this.jsModelListDisplayAlternative.getData(), sumKG, 'KG');
					sumKG = this.__internal_calculateAllocationQtyModel(this.jsModelListDisplayFree.getData(), sumKG, 'KG');

					//---> set the text for use 
					this.getModel("ALLOCATEDQTY").setProperty("/sum", sum);
					this.getModel("ALLOCATEDQTY").setProperty("/sumkg", sumKG);

					//---> over custom order line qty?
					if (sum > this.jsModelList.getData().qtytoallocate) {
						this.byId('iconOverSelection').addStyleClass('blinking');
					} else {
						this.byId('iconOverSelection').removeStyleClass('blinking');
					}
				} else {
					sum = this.__internal_calculateAllocationQtyModel(this.jsModelListDisplay.getData(), sum, '');
					sum = this.__internal_calculateAllocationQtyModel(this.jsModelListDisplayAll.getData(), sum, '');
					sum = this.__internal_calculateAllocationQtyModel(this.jsModelListDisplayAlternative.getData(), sum, '');
					sum = this.__internal_calculateAllocationQtyModel(this.jsModelListDisplayFree.getData(), sum, '');

					sumKG = this.__internal_calculateAllocationQtyModel(this.jsModelListDisplay.getData(), sumKG, requestdUom);
					sumKG = this.__internal_calculateAllocationQtyModel(this.jsModelListDisplayAll.getData(), sumKG, requestdUom);
					sumKG = this.__internal_calculateAllocationQtyModel(this.jsModelListDisplayAlternative.getData(), sumKG, requestdUom);
					sumKG = this.__internal_calculateAllocationQtyModel(this.jsModelListDisplayFree.getData(), sumKG, requestdUom);

					//---> set the text for use 
					this.getModel("ALLOCATEDQTY").setProperty("/sum", sum);
					this.getModel("ALLOCATEDQTY").setProperty("/sumkg", sumKG);

					//---> over custom order line qty?
					if (sumKG > this.jsModelList.getData().qtytoallocate) {
						this.byId('iconOverSelection').addStyleClass('blinking');
					} else {
						this.byId('iconOverSelection').removeStyleClass('blinking');
					}
				}

			},

			__internal_calculateAllocationQtyModel: function (dat, sum, requesteduom) {
				             
				sum = parseFloat(sum);
				for (var idx = 0; idx < dat.length; idx++) {
					for (var subidx = 0; subidx < dat[idx].batches.length; subidx++) {
						if (parseFloat(dat[idx].batches[subidx].allocateQty) > 0) {
							if (requesteduom === "KG") {
								sum = parseFloat(parseFloat(sum) + ( parseFloat(dat[idx].batches[subidx].allocateQty) * parseFloat(dat[idx].batches[subidx].unitkg).toFixed(2)));
							} else {
								sum = parseFloat(parseFloat(sum) + parseFloat(dat[idx].batches[subidx].allocateQty)).toFixed(2);
							}
						}
					}
				}

				return sum;
			},

			runAllocation: function (evt) {
				this.byId('btnAllocation').setEnabled(false);

				sap.ui.core.BusyIndicator.show(0);

				//---> first must check if we are moving or adding new
				if (this.byId('idIconTabBar').getSelectedKey() === 'existing') {

					//---> move existing allocation
					this.createRequest = this.LocalModel.bindContext('/MOVE_ALLOCATION_TO_ORDER(...)');

				} else {

					//---> create allocations

					this.createRequest = this.LocalModel.bindContext('/CREATE_ATPC_CHAIN(...)');

					var dt = new Object();
					dt.REQUESTED_AVAILABILITIES = [];
					dt.REQUESTED_AVAILABILITIES = this.__internal_appendAllocationQty(this.jsModelListDisplay.getData(), dt.REQUESTED_AVAILABILITIES);
					dt.REQUESTED_AVAILABILITIES = this.__internal_appendAllocationQty(this.jsModelListDisplayAll.getData(), dt.REQUESTED_AVAILABILITIES);
					dt.REQUESTED_AVAILABILITIES = this.__internal_appendAllocationQty(this.jsModelListDisplayAlternative.getData(), dt.REQUESTED_AVAILABILITIES);
					dt.REQUESTED_AVAILABILITIES = this.__internal_appendAllocationQty(this.jsModelListDisplayFree.getData(), dt.REQUESTED_AVAILABILITIES);

					dt.DEMAND_ID = '';
					dt.DEMAND_ROW_ID = '';
					dt.DEMAND_TYPE = 'MAN';
					dt.MANUAL_ATPC_REFERENCE = this.rra; //<--- refertence to RRA demand
					dt.MANUAL_ATPC_REFERENCE_POS = this.rraPos;
					dt.CUSTOMER = '';
					dt.CONTEXT = this.randomContext;
					dt.EXPLICIT_DEMAND_FO = '';

					dt.CREATE_ASYNC = 'X';

					dt.REQUEST_GUID_LIST = [];
					for (var idx = 0; idx < this.requestIds.length; idx++) {
						dt.REQUEST_GUID_LIST.push(new Object({
							REQUEST_GUID: this.requestIds[idx]
						}));
					}
					
					
					this.createRequest.setParameter('DATA', JSON.stringify(dt));

					//---> fire the UNBOUND action on odata V4
					this.createRequest.execute().then(function (dt) {

						//---> refresh the line binding
						
						var result = this.createRequest.getBoundContext().getObject().res;

						if (result === 0) {

							sap.ui.core.BusyIndicator.hide();

							//---> fire the toast message
							new FioritalMessageStrip('Allocation request refused!', {
								status: 'error',
								icon: 'sap-icon://error',
								timeout: 4000
							});

						} else {

							sap.ui.core.BusyIndicator.hide();

							//--->register a callback
							this.YsocketManager.addListenerSingle({
									id1: this.randomContext
								}, 'MAN',
								function (data) {

									//---> remove pending listeners (KO)
									this.YsocketManager.deleteListenersByid1(this.randomContext);

									//---> callback ok
									// var boundfct = this.callBackOk.bind(this.thisRef);
									// boundfct();

								}.bind(this), true);

							this.YsocketManager.addListenerSingle({
									// id1: this.so + this.soItem,
									id1: this.randomContext,
									id2: 'FAIL'
								}, 'ALLOCATION',
								function (data) {

									//---> remove pending listeners (KO)
									this.YsocketManager.deleteListenersByid1(this.randomContext);

								}.bind(this), true);

							//---> callback ok
							var boundfct = this.callBackOk.bind(this.thisRef);
							boundfct();

						}

						this.getModel("ALLOCATEDQTY").setProperty("/sum", 0);

						this._internal_clearAllocateQty(this.jsModelListDisplay.getData());
						this._internal_clearAllocateQty(this.jsModelListDisplayAll.getData());
						this._internal_clearAllocateQty(this.jsModelListDisplayAlternative.getData());
						this._internal_clearAllocateQty(this.jsModelListDisplayFree.getData());

						//---> close popup
						this.byId('btnAllocation').setEnabled(true);
						this.byId('allocationPopupRra').close();
						

						var msg = new FioritalMessageStrip('Allocation requested for ' + this.rra + ' - ' + this.rraPos, {
							status: 'info',
							icon: 'sap-icon://sys-enter',
							timeout: 2000
						});

					}.bind(this));

				}

			},

			_internal_clearAllocateQty: function (dat) {
				for (var idx = 0; idx < dat.length; idx++) {
					for (var subidx = 0; subidx < dat[idx].batches.length; subidx++) {

						if (dat[idx].batches[subidx].allocateQty !== undefined && dat[idx].batches[subidx].allocateQty !== 0 && dat[idx].batches[subidx].allocateQty !==
							'') {
							dat[idx].batches[subidx].allocateQty = 0;
						}
					}
				}
			},

			__internal_appendAllocationQty: function (dat, allocArray) {

				for (var idx = 0; idx < dat.length; idx++) {
					for (var subidx = 0; subidx < dat[idx].batches.length; subidx++) {

						if (dat[idx].batches[subidx].allocateQty !== undefined && dat[idx].batches[subidx].allocateQty !== 0 && dat[idx].batches[subidx].allocateQty !==
							'') {
							var newAll = new Object();
							var newHU = new Object();
							newAll.GUID = dat[idx].batches[subidx].guid;
							newAll.QTY = dat[idx].batches[subidx].allocateQty;
							newAll.HU = dat[idx].batches[subidx].exidv;

							//   newHU.HU = dat[idx].batches[subidx].exidv;
							//  newHU.QTY = dat[idx].batches[subidx].allocateQty;

							// newAll.HUS.push(newHU);

							if (dat[idx].batches[subidx].unitpricetrade !== undefined && dat[idx].batches[subidx].unitpricetrade !== 0 && dat[idx].batches[
									subidx].unitpricetrade !==
								'') {
								newAll.DIRECT_PRICE = dat[idx].batches[subidx].unitpricetrade;
							}

							allocArray.push(newAll);
						}

					}
				}

				return allocArray;
			},

			closeAllocation: function (evt) {
				this.getModel("ALLOCATEDQTY").setProperty("/sum", 0);

				this._internal_clearAllocateQty(this.jsModelListDisplay.getData());
				this._internal_clearAllocateQty(this.jsModelListDisplayAll.getData());
				this._internal_clearAllocateQty(this.jsModelListDisplayAlternative.getData());
				this._internal_clearAllocateQty(this.jsModelListDisplayFree.getData());

				this.byId('allocationPopupRra').close();
			},

			selectExistingATPC: function (evt) {
				var atpcid = evt.getSource().getBindingContext('EXISTINGALLOCATIONS').getObject().atpcid;
				this.byId('ATPCdetailExistingAllocation').openByATPC(evt, atpcid);
			},

			multiRouteShowSingle: function (evt) {

				this.pressedMultiIcon = evt.getSource();

				//---> store actual context
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

				//--> no display on adiacent or no routes (unreacheable)
				if (dt.adiacentRoute === 'X' || dt.routesCnt === 0) {

					var ms = new FioritalMessageStrip('Nessuna rotta presente', {
						status: 'warning',
						icon: 'sap-icon://warning2',
						timeout: 4000
					});

					return;
				}

				this.jsModelListAlternativeRoutesPopover.loadData(evt.getSource().getModel().sServiceUrl + "AtpcAvailability(gcid='" + dt.batches[0]
					.gcid +
					"',grid='" + dt.batches[0].grid + "',charg='" + dt.batches[0].charg + "',destNodeReqDate=" + dt.batches[0].destNodeReqDate +
					",destNodeReqTime='" + dt.batches[0].destNodeReqTime +
					"')/AtpcPossibleRoutes?$expand=AtpcPossibleRoutesNodes&$filter= routeid eq '" + dt.routeid + "'"); //<-- it's ok to take the frst batch guid

				this.byId('allocationBasicList').setBusy(true);

			},

			//------------------------ formatters -------------------------------------------------------------------------------------------------------------------------------------------------------

			deleteTrailZeros: function (foId) {
				try {
					return foId.replace(/^0+(\d)|(\d)0+$/gm, '$1$2');
				} catch (ex) {

				}
			},

			textGoodsQuality: function (txtGQ) {

				if (txtGQ === '' || txtGQ === undefined) {
					return '';
				} else {
					return 'Cat. ' + txtGQ;
				}

			},

			showIceRework: function (specialBatch) {
				return specialBatch.includes('G');
			},

			showSanificationRework: function (specialBatch) {
				return specialBatch.includes('B');
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

			FOtileColor: function (itemFOflag) {
				if (itemFOflag === 'X') {
					return '#34618742';
				}
			},

			formatAvailDate: function (availDate, supplyType) {

				if (supplyType === 'STK') {
					return 'In Stock';
				} else {
					return availDate;
				}

			},

			formatBatchDates: function (batchDate) {
				if (batchDate === '' || batchDate === null) {
					return 'n.d.';
				} else {
					return batchDate;
				}
			},

			formatAvailTimePopover: function (availTime, supplyType) {

				if (supplyType === 'STK') {
					return '';
				} else {
					return availTime.substr(0, 2) + ':' + availTime.substr(2, 2) + ':' + availTime.substr(4, 2);
				}

			},

			hideAtpcCustomer: function (atpccustomer) {
				if (atpccustomer === '' || atpccustomer === null || atpccustomer === undefined) {
					return false;
				} else {
					return true;
				}

			},

			formatIconSupplyType: function (supplyType) {

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
			},

			supplyTypeText: function (supplyType) {
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
			},

			producerVisible: function (producer, vendor, batchid) {
				if (producer === vendor || batchid === 'GENERIC') {
					return false;
				} else {
					return true;
				}
			},

			vendorVisible: function (producer, vendor, batchid) {
				if (batchid === 'GENERIC') {
					return false;
				} else {
					return true;
				}
			},

			formatIconMultiRouteVisible: function (routesCount, destNode, node, adiacentRoute) {
				if (destNode === node) {
					return false;
				} else {
					return true;
				}

			},

			formatIconMultiRouteColor: function (routesCount, destNode, node, adiacentRoute) {
				if (destNode === node || adiacentRoute === 'X') {
					return 'darkseagreen';
				} else {
					if (routesCount > 0) {
						return 'true';
					} else {
						return 'red';
					}
				}
			},

			formatIconMultiRoute: function (routesCount, adiacentRoute) {

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
						return '';
					}
				}

			},

			hideRouteOnStock: function (destNode, node, adiacent, routesCnt) {
				if (destNode === node || adiacent === 'X' || routesCnt === 0) {
					return false;
				} else {
					return true;
				}
			},

			noCharactRequired: function (charactValue) {

				if (charactValue === '' || charactValue === null) {
					return '-';
				} else {
					return charactValue;
				}

			},

			hideSupplyId: function (supplyId) {
				if (supplyId === undefined || supplyId === '' || supplyId === null) {
					return false;
				} else {
					return true;
				}
			},

			formatIconDemandTypeSrc: function (demandType) {
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

			hideoverallocationicon: function (allocated, total) {
				if (allocated > total) {
					return true;
				} else {
					return false;
				}
			},

			formatAllocationText: function (allocated, total) {
				if (allocated < total) {
					return 'partial allocation';
				} else if (allocated > total) {
					return 'over allocation';
				} else {
					return 'allocation ok';
				}
			},

			computeResidualAllocation: function (iAllocatedQty, iQty) {
				return parseInt(iQty - iAllocatedQty);
			}

		});

		return AllocRRA;

	}, true);