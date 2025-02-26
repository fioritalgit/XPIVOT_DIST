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
		"it/fiorital/fioritalui5lib/extension/BooleanParse"
	],
	function (jQuery, XMLComposite, MessageToast, MessageBox, Filter, FilterOperator, jsModel, APCManager, FioritalMessageStrip, boolParse) {
		"use strict";

		var FOManager = XMLComposite.extend("it.fiorital.fioritalui5lib.controls.AllocationPopup", {
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
					onAllocationSuccess: {
						parameters: {
							actualRefreshMode: {
								type: "string"
							}
						}
					}
				},
				aggregations: {

				}
			},

			APCManager: APCManager,
			boolParse: boolParse,

			jsonRequestCompletedAll: function (event) {

				//---> must store the request id for later kill
				if (this.jsModelListAll.getData().value.length > 0) {
					this.requestIds.push(this.jsModelListAll.getData().value[0].requestGuid); //<-- take the first all are the same 
				}

				//--> prepare output structured format
				this.jsModelListDisplayAll.setData(this.__internal_CompactAtpcAvilability(this.jsModelListAll.getData().value));

				this.byId('allocationAllList').setBusy(false);

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

			textAllocation: function (validity) {
				if (validity === '3') {
					return 'ASSIGNATION';
				} else if (validity === '4') {
					return 'REALLOCATION';
				} else {
					return 'ALLOCATION';
				}
			},

			prepWarehouse: function (pwhs) {
				if (pwhs === '') {
					return '(none)';
				} else {
					return pwhs;
				}
			},

			iconDemandType: function (demandType) {

				switch (demandType) {
				case 'ODV':
					return 'sap-icon://customer';
					break;
				case 'MAN':
					return 'sap-icon://globe';
					break;
				case 'RES':
					return 'sap-icon://employee-pane';
					break;
				case 'PRD':
					return 'sap-icon://factory';
					break;
				default:
				}

			},

			masterFoOpen: function (evt) {

				this.jsModelListAlternativeRoutes.loadData(evt.getSource().getModel().sServiceUrl + "SotItem(docnr='" + this.so + "',docpos='" +
					this.soItem +
					"',exidv='')/SotItemCompatibleFo");
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
					path: "/AtpcAvailability(gcid='" + dt.gcid +
						"',grid='" + dt.grid + "',charg='" + dt.charg + "',destNodeReqDate=" + dt.destNodeReqDate +
						",destNodeReqTime='" + dt.destNodeReqTime + "')/ActiveAtpc",
					template: this.byId('popoverAllocationsExistingList').getBindingInfo("items").template,
					parameters: {
						$search: 'showgenerics' //<--- show also generics allocations
					},
				});

				this.byId('popoverAllocationsExisting').openBy(evt.getSource());

			},

			closePopoverExixstingAllocations: function (evt) {
				this.byId('popoverAllocationsExisting').close();
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

				if (event.getParameter("success")) {
					//---> must store the request id for later killad
					if (this.jsModelList.getData().AtpcItemAvailability.length > 0) {
						this.requestIds.push(this.jsModelList.getData().AtpcItemAvailability[0].requestGuid); //<-- take the first all are the same 
					}

					this.jsModelListDisplay.setData(this.__internal_CompactAtpcAvilability(this.jsModelList.getData().AtpcItemAvailability));

					//--> add the qty column for moving allocations + set the model
					if (this.jsModelList.getData().OtherRelatedAllocations !== undefined) {
						var existAlloc = this.jsModelList.getData().OtherRelatedAllocations;
						for (var idx = 0; idx < existAlloc.length; idx++) {
							existAlloc[idx].moveAllocationQty = 0;
							existAlloc[idx].overAllocation = ''; //<--- flag for further coloring row in case of over allocation
						}

						this.jsModelExistingAllocations.setData(this.jsModelList.getData().OtherRelatedAllocations);
					}

					sap.ui.core.BusyIndicator.hide();
					this.byId('allocationPopup').open();
				} else {

					sap.ui.core.BusyIndicator.hide();
					var ms = new FioritalMessageStrip('Errore in richiesta disponibilità', {
						status: 'error',
						icon: 'sap-icon://message-error',
						timeout: 4000
					});

					return;
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
							newAvailObj['adiacentRoute'] = data[idx]['adiacentRoute'];

							//--> unreacheable availability
							if (data[idx].routeid === '' || data[idx].routeid === undefined) {
								newAvailObj['reacheablecluster'] = '';
								data[idx]['reacheable'] = '';
							} else {
								newAvailObj['reacheablecluster'] = 'X';
								data[idx]['reacheable'] = 'X';
							}

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

							//--> unreacheable availability
							if (data[idx].routeid === '' || data[idx].routeid === undefined) {
								data[idx]['reacheable'] = '';
							} else {
								data[idx]['reacheable'] = 'X';
							}

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

			jsonRequestCompletedAlternativeRoutesPopover: function (event) {

				this.byId('allocationBasicList').setBusy(false);
				this.byId('allocationAllList').setBusy(false);
				this.byId('allocationAlternativeList').setBusy(false);
				this.byId('allocationFreeList').setBusy(false);

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

				this.byId('allocationBasicList').setBusy(true);
				this.byId('allocationAllList').setBusy(true);
				this.byId('allocationAlternativeList').setBusy(true);
				this.byId('allocationFreeList').setBusy(true);

				//--> other FO selected?
				if (this.jsModelSelectedAlternativeRoute.getData() !== undefined && this.jsModelSelectedAlternativeRoute.getData().sotradelgort !==
					undefined) {
					var foOutId = this.jsModelSelectedAlternativeRoute.getData().freightorderid;
				} else {

					//---> take from SO
					var foOutId = this.ctx.getObject().freightorderidtm;
				}

				this.jsModelListAlternativeRoutesPopover.loadData(evt.getSource().getModel().sServiceUrl + "AtpcAvailability(gcid='" + dt.batches[0]
					.gcid +
					"',grid='" + dt.batches[0].grid + "',charg='" + dt.batches[0].charg + "',destNodeReqDate=" + dt.batches[0].destNodeReqDate +
					",destNodeReqTime='" + dt.batches[0].destNodeReqTime + "')/AtpcPossibleRoutes?$expand=AtpcPossibleRoutesNodes&$search=FO" +
					foOutId); //<-- it's ok to take the frst batch guid

				this.byId('allocationBasicList').setBusy(true);

			},

			multiRouteShowSingle: function (evt) {

				this.pressedMultiIcon = evt.getSource();

				if (evt.getSource().getBindingContext('SUPPLYJSONMODEL') !== undefined) {
					var dt = evt.getSource().getBindingContext('SUPPLYJSONMODEL').getObject();
					this.activeJsonModel = this.jsModelListDisplay;
				}

				if (evt.getSource().getBindingContext('SUPPLYJSONMODELALL') !== undefined) {
					var dt = evt.getSource().getBindingContext('SUPPLYJSONMODELALL').getObject();
					this.activeJsonModel = this.jsModelListDisplayAll;
				}

				if (evt.getSource().getBindingContext('SUPPLYJSONMODELALTERNATIVE') !== undefined) {
					var dt = evt.getSource().getBindingContext('SUPPLYJSONMODELALTERNATIVE').getObject();
					this.activeJsonModel = this.jsModelListDisplayAlternative;
				}

				this.getSelectedCluster = dt;

				this.byId('allocationBasicList').setBusy(true);
				this.byId('allocationAllList').setBusy(true);
				this.byId('allocationAlternativeList').setBusy(true);
				this.byId('allocationFreeList').setBusy(true);

				this.jsModelListAlternativeRoutesPopover.loadData(evt.getSource().getModel().sServiceUrl + "AtpcAvailability(gcid='" + dt.batches[0]
					.gcid +
					"',grid='" + dt.batches[0].grid + "',charg='" + dt.batches[0].charg + "',destNodeReqDate=" + dt.batches[0].destNodeReqDate +
					",destNodeReqTime='" + dt.batches[0].destNodeReqTime + "')/AtpcPossibleRoutes?$expand=AtpcPossibleRoutesNodes"); //<-- it's ok to take the frst batch guid

				this.byId('allocationBasicList').setBusy(true);

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

				try {
					this.byId('inputtradeitem').getBinding('suggestionItems').suspend();
				} catch (exc) {
					//--> already suspended	
				}

				this.jsModeAllocatedQty = new jsModel;

				this.jsModelList = new jsModel;
				this.jsModelListDisplay = new jsModel;

				this.jsModelListAll = new jsModel;
				this.jsModelListDisplayAll = new jsModel;

				this.jsModelListAlternative = new jsModel;
				this.jsModelListDisplayAlternative = new jsModel;

				this.jsModelListFree = new jsModel;
				this.jsModelListDisplayFree = new jsModel;

				this.jsModelSuggest = new jsModel;

				this.jsModelExistingAllocations = new jsModel;

				//-------------------------------------- other models

				this.jsModelListAlternativeRoutes = new jsModel;
				this.jsModelSelectedAlternativeRoute = new jsModel;
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

				this.setModel(this.jsModelSelectedAlternativeRoute, 'SELECTEDALTERNATIVEROUTE');
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

			openByData: function (evt, so, soItem, ctx, ctxGlobal, tableRow, explicitServiceUrl) {
				this.byId('showGenericBatches').setSelected(false);
				this.byId('btnAllocation').setEnabled(true);
				this.byId('iconOverSelection').removeStyleClass('blinking');
				this.isOverAllocation = false;

				this.so = so;
				this.soItem = soItem;

				this.tableRow = tableRow;

				this.jsModeAllocatedQty.setData({
					qty: 0,
					qtykg: 0
				});

				this.jsModelListDisplayFree.setData([]);
				this.byId('inputtradeitem').setValue();

				this.so = so;
				this.soItem = soItem;
				this.ctx = ctx; //<-- store for later selective refresh
				this.ctxGlobal = ctxGlobal;
				this.byId('alternativeRouteShow').setVisible(false);

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

				//-->pad start location to get always 4 char 
				sap.ui.core.BusyIndicator.show(0);

				var sUrl;
				if (explicitServiceUrl !== undefined) {
					sUrl = explicitServiceUrl;
				} else {
					sUrl = evt.getSource().getModel().sServiceUrl;
				}
				this.jsModelList.loadData(sUrl + "SotItem(docnr='" + so + "',docpos='" + soItem +
					"',exidv='')?$expand=SotItemCompatibleFo,AtpcItemAvailability");
			},

			onAfterOpen: function (evt) {

				//---> component need APC callback handler check if present
				this.componentRef = sap.ui.core.Component.getOwnerComponentFor(this);

				if (this.componentRef.YsocketManager === undefined) {
					this.componentRef.YsocketManager = new this.APCManager(this.getApchandshake(), this.getApcendpoint(), this);
					this.YsocketManager = this.componentRef.YsocketManager;

				} else {
					this.YsocketManager = this.componentRef.YsocketManager;
				}

			},

			onAfterClose: function (evt) {

				//--> free models
				this.jsModelListDisplay.setData([]);
				this.jsModelListDisplayAll.setData([]);
				this.jsModelListDisplayAlternative.setData([]);
				this.jsModelListDisplayFree.setData([]);
				this.jsModelExistingAllocations.setData([]);

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

				this.byId('idIconTabBar').setSelectedKey('basic');
				this.jsModelSelectedAlternativeRoute.setData(); //<--- reset selected FO

			},

			onPressFO: function (evt) {

				var dt = evt.getSource().getBindingContext('ALTERNATIVEROUTES').getObject();

				if (dt.sotradeitemfo === 'X') {
					//---> hide; default route!
					this.byId('alternativeRouteShow').setVisible(false);
				} else {
					//---> show it
					this.jsModelSelectedAlternativeRoute.setData(dt);
					this.byId('alternativeRouteShow').setVisible(true);
				}

				var filterDate = dt.sotradedate.substr(0, 4) + '-' + dt.sotradedate.substr(4, 2) + '-' + dt.sotradedate.substr(6, 2);

				sap.ui.core.BusyIndicator.show(0);
				this.jsModelList.loadData(evt.getSource().getModel().sServiceUrl + "SotItem(docnr='" + this.so + "',docpos='" + this.soItem +
					"',exidv='')?$expand=AtpcItemAvailability($filter=destNodeReqDate eq " + dt.sotradedate + " and destNodeReqTime eq '" +
					dt.sotradetime + "' and destNode eq '" + dt.sotradelgort + "')");

				//--> if in different page must also refresh them..
				var shippingNode = dt.sotradelgort;
				var reqDate = dt.sotradedate;
				var reqTime = dt.sotradetime;

				switch (this.byId('idIconTabBar').getSelectedKey()) {
				case 'all':

					this.jsModelListAll.loadData(evt.getSource().getModel().sServiceUrl + "AtpcAvailability?$filter=destNode eq '" + shippingNode +
						"' and matnr eq '" + this.jsModelList.getData().productcode + "' and destNodeReqDate eq " + reqDate +
						" and destNodeReqTime eq '" + reqTime + "'&$search=ALT" + this.so + this.soItem); //<--- $search used as special parameter to free ATPC memory

					this.byId('allocationAllList').setBusy(true, 0);

					break;
				case 'alt':

					var reqDateABAP = reqDate.split('-').join('');

					this.jsModelListAlternative.loadData(evt.getSource().getModel().sServiceUrl + "GET_AVAILABILITY_ALTERNATIVE(MATNR='" + this.jsModelList
						.getData().productcode +
						"',DESTNODE='" + shippingNode + "',DESTNODEREQDATE='" + reqDateABAP + "',DESTNODEREQTIME='" + reqTime +
						"',SHOWUNREACHEABLE='L',SHOWADIACENT='X',MEMORYID='ALT" + this.so + this.soItem + //<--- $search used as special parameter to free ATPC memory
						"')");

					break;
				default:
				}

				this.byId('spliAllcoationPopup').hideMaster();

			},

			valueAllocationChange: function (evt) {

				if (evt.getParameter('value') === '') {
					evt.getSource().setValue('0');
				}

				//---> check all quantities in clusters
				this.globalCheckQty = false;
				this.__internalCheckOverAllocation(this.jsModelListDisplay.getData());
				this.__internalCheckOverAllocation(this.jsModelListDisplayAll.getData());
				this.__internalCheckOverAllocation(this.jsModelListDisplayAlternative.getData());
				this.__internalCheckOverAllocation(this.jsModelListDisplayFree.getData());
				this.__internalCheckOverAllocationExistingAllocations(this.jsModelExistingAllocations.getData());

				//---> recalculate totals
				this.__internal_calculateAllocationQty();

			},

			__internalCheckOverAllocationExistingAllocations: function (alloc) {

				for (var idx = 0; idx < alloc.length; idx++) {

					if (alloc[idx].qty < alloc[idx].moveAllocationQty) {
						alloc[idx].overAllocation = 'X';
					} else {
						alloc[idx].overAllocation = '';
					}

				}

			},

			__internalCheckOverAllocation: function (supply) {

				//---> for all clusters
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
						this.globalCheckQty = true;
					} else {
						supply[idx].overAllocation = '';
					}

				}

				return sum;

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

			changeSupplyPage: function (evt) {

				var selectedPage = evt.getParameter('selectedKey');

				//--> free quantities on tab change
				this.__internal_clearAllocationQtyMoving();
				this.__internal_clearAllocationQtyFromModel(this.jsModelListDisplayAll);
				this.__internal_clearAllocationQtyFromModel(this.jsModelListDisplayAlternative);
				this.__internal_clearAllocationQtyFromModel(this.jsModelListDisplay);

				//---> must check if alternative route is selected
				var shippingNode;
				if (this.jsModelSelectedAlternativeRoute.getData() !== undefined && this.jsModelSelectedAlternativeRoute.getData().sotradelgort !==
					undefined) {
					shippingNode = this.jsModelSelectedAlternativeRoute.getData().sotradelgort;
					var reqDate = this.jsModelSelectedAlternativeRoute.getData().sotradedate;
					var reqTime = this.jsModelSelectedAlternativeRoute.getData().sotradetime;
				} else {
					shippingNode = this.jsModelList.getData().shippingnode;
					var reqDate = this.jsModelList.getData().SotItemCompatibleFo[0].sotradedate;
					var reqTime = this.jsModelList.getData().SotItemCompatibleFo[0].sotradetime;
				}

				switch (selectedPage) {
				case 'basic':
					//---> do nothing; go back
					break;
				case 'all':

					this.jsModelListAll.loadData(evt.getSource().getModel().sServiceUrl + "AtpcAvailability?$filter=destNode eq '" + shippingNode +
						"' and matnr eq '" + this.jsModelList.getData().productcode + "' and destNodeReqDate eq " + reqDate +
						" and destNodeReqTime eq '" + reqTime + "' and requestForceGeneric eq 'X' &$search=ALT" + this.so + this.soItem); //<--- $search used as special parameter to free ATPC memory

					this.byId('allocationAllList').setBusy(true, 0);
					break;
				case 'alt':

					var reqDateABAP = reqDate.split('-').join('');

					this.jsModelListAlternative.loadData(evt.getSource().getModel().sServiceUrl + "GET_AVAILABILITY_ALTERNATIVE(MATNR='" + this.jsModelList
						.getData().productcode +
						"',DESTNODE='" + shippingNode + "',DESTNODEREQDATE='" + reqDateABAP + "',DESTNODEREQTIME='" + reqTime +
						"',SHOWUNREACHEABLE='L',SHOWADIACENT='X',MEMORYID='ALT" + this.so + this.soItem + //<--- $search used as special parameter to free ATPC memory
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
				var shippingNode;
				if (this.jsModelSelectedAlternativeRoute.getData() !== undefined && this.jsModelSelectedAlternativeRoute.getData().sotradelgort !==
					undefined) {
					shippingNode = this.jsModelSelectedAlternativeRoute.getData().sotradelgort;
					var reqDate = this.jsModelSelectedAlternativeRoute.getData().sotradedate;
					var reqTime = this.jsModelSelectedAlternativeRoute.getData().sotradetime;
				} else {
					shippingNode = this.jsModelList.getData().shippingnode;
					var reqDate = this.jsModelList.getData().SotItemCompatibleFo[0].sotradedate;
					var reqTime = this.jsModelList.getData().SotItemCompatibleFo[0].sotradetime;
				}

				//---> ask for materials alternatives 
				this.jsModelListFree.loadData(evt.getSource().getModel().sServiceUrl + "AtpcAvailability?$filter=destNode eq '" +
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
					this.jsModelSuggest.loadData(event.getSource().getModel().sServiceUrl +
						"Product?$select=productcode,productdescription&$filter=contains(productcode,'" + value + "') or contains(productdescription,'" +
						value + "')");
				}

			},

			suggestionModelLoaded: function (evt) {
				this.byId('inputtradeitem').suggest();
			},

			__internal_clearAllocationQtyMoving: function () {

				var dat = this.jsModelExistingAllocations;
				for (var idx = 0; idx < dat.length; idx++) {
					dat[idx].moveAllocationQty = 0;
				}

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

				var sumObj = {
					sum: 0,
					sumkg: 0
				};

				sumObj = this.__internal_calculateAllocationQtyModel(this.jsModelListDisplay.getData(), sumObj);
				sumObj = this.__internal_calculateAllocationQtyModel(this.jsModelListDisplayAll.getData(), sumObj);
				sumObj = this.__internal_calculateAllocationQtyModel(this.jsModelListDisplayAlternative.getData(), sumObj);
				sumObj = this.__internal_calculateAllocationQtyModel(this.jsModelListDisplayFree.getData(), sumObj);
				sumObj = this.__internal_calculateAllocationQtyAllocations(this.jsModelExistingAllocations.getData(), sumObj);

				//---> set the text for use 
				this.jsModeAllocatedQty.setData(sumObj);

				//---> over custom order line qty?
				if (sumObj.sumkg > this.jsModelList.getData().lineqty * this.jsModelList.getData().unitkg) {
					this.byId('iconOverSelection').addStyleClass('blinking');
					this.isOverAllocation = true;
				} else {
					this.isOverAllocation = false;
					this.byId('iconOverSelection').removeStyleClass('blinking');
				}

			},

			__internal_calculateAllocationQtyModel: function (dat, sumObj) {
				for (var idx = 0; idx < dat.length; idx++) {
					for (var subidx = 0; subidx < dat[idx].batches.length; subidx++) {
						sumObj.sum = sumObj.sum + parseFloat(dat[idx].batches[subidx].allocateQty);
						sumObj.sumkg = sumObj.sumkg + (parseFloat(dat[idx].batches[subidx].allocateQty) * parseFloat(dat[idx].batches[subidx].unitkg));
					}
				}

				return sumObj;
			},

			__internal_calculateAllocationQtyAllocations: function (dat, sumObj) {
				for (var idx = 0; idx < dat.length; idx++) {
					sumObj.sum = sumObj.sum + parseFloat(dat[idx].moveAllocationQty);
				}

				return sumObj;
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

			showFO: function (evt) {
				this.byId('foManagerId').openByOrder(evt, evt.getSource().getText().padStart(20, '0'));
			},

			showMainFO: function (evt) {
				this.byId('foManagerId').openByOrder(evt, this.getModel('SUPPLYJSONMODELBASE').getData().freightorderidfinal);
			},

			runAllocationExternal: function (evt) {

				if (this.globalCheckQty === true) {
					var ms = new FioritalMessageStrip('Quantità superiori alla disponibilità!', {
						status: 'error',
						icon: 'sap-icon://message-error',
						timeout: 3000
					});
					return;
				};

				if (this.isOverAllocation === true) {
					sap.m.MessageBox.show(
						"Confirm over allocation ?", {
							icon: sap.m.MessageBox.Icon.INFORMATION,
							title: "OVER ALLOCATION",
							actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
							onClose: function (oAction) {
								if (oAction === 'YES') {
									this.runAllocation(evt);
								}
							}.bind(this)
						}
					);
				} else {
					this.runAllocation(evt);
				}
			},

			runAllocation: function (evt) {
				this.byId('btnAllocation').setEnabled(false);
				
				//---> first must check if we are moving or adding new
				if (this.byId('idIconTabBar').getSelectedKey() === 'existing') {

					//---> move existing allocation
					this.createRequest = this.getModel().bindContext('/MOVE_ALLOCATION_TO_ORDER(...)');

				} else {

					//---> create allocations

					this.createRequest = this.getModel().bindContext('/CREATE_ATPC_CHAIN(...)');

					var dt = new Object();
					dt.REQUESTED_AVAILABILITIES = [];
					dt.REQUESTED_AVAILABILITIES = this.__internal_appendAllocationQty(this.jsModelListDisplay.getData(), dt.REQUESTED_AVAILABILITIES);
					dt.REQUESTED_AVAILABILITIES = this.__internal_appendAllocationQty(this.jsModelListDisplayAll.getData(), dt.REQUESTED_AVAILABILITIES);
					dt.REQUESTED_AVAILABILITIES = this.__internal_appendAllocationQty(this.jsModelListDisplayAlternative.getData(), dt.REQUESTED_AVAILABILITIES);
					dt.REQUESTED_AVAILABILITIES = this.__internal_appendAllocationQty(this.jsModelListDisplayFree.getData(), dt.REQUESTED_AVAILABILITIES);

					dt.DEMAND_ID = this.so;
					dt.DEMAND_ROW_ID = this.soItem;
					dt.DEMAND_TYPE = 'ODV';
					dt.CUSTOMER = '';

					//--> other FO selected?
					if (this.jsModelSelectedAlternativeRoute.getData() !== undefined && this.jsModelSelectedAlternativeRoute.getData().sotradelgort !==
						undefined) {
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

					this.byId('idIconTabBar').setBusy(true);
					

					//---> fire the UNBOUND action on odata V4
					this.createRequest.execute().then(function (dt) {

						this.byId('idIconTabBar').setBusy(false);
						this.byId('btnAllocation').setEnabled(true);
						
						var result = this.createRequest.getBoundContext().getObject().res;

						if (result === 0) {

							//---> fire the toast message
							new FioritalMessageStrip('Allocation request refused!', {
								status: 'error',
								icon: 'sap-icon://error',
								timeout: 4000
							});

						} else {

							//---> mark the row...
							if (this.tableRow !== undefined) {
								this.tableRow.data('inallocation', 'X', true);
							}

							//--->register a callback
							this.YsocketManager.addListenerSingle({
									id1: this.so + this.soItem
								}, 'ODV',
								function (data) {

									if (this.tableRow !== undefined) {
										this.tableRow.data('inallocation', '', true);
									}

									//---> remove pending listeners (KO)
									this.YsocketManager.deleteListenersByid1(this.so + this.soItem);

									//---> handle a further refresh
									if (this.actualRefreshMode === 'M') {
										if (this.ctxGlobal !== undefined) {
											this.ctxGlobal.refresh('directGroup', true);
										}
									} else {
										this.ctx.refresh('directGroup', true);
									}

									//--> allocation event
									this.fireEvent("onAllocationSuccess", {
										actualRefreshMode: this.actualRefreshMode
									});

								}.bind(this), true);

							this.YsocketManager.addListenerSingle({
									id1: this.so + this.soItem,
									id2: 'FAIL'
								}, 'ALLOCATION',
								function (data) {

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

									if (this.tableRow !== undefined) {
										this.tableRow.data('inallocation', '', true);
									}

									//---> remove pending listeners (KO)
									this.YsocketManager.deleteListenersByid1(this.so + this.soItem);

									//---> handle a further refresh
									if (this.actualRefreshMode === 'M') {
										if (this.ctxGlobal !== undefined) {
											this.ctxGlobal.refresh('directGroup', true);
										}
									} else {
										this.ctx.refresh('directGroup', true);
									}

								}.bind(this), true);

							//---> close popup
							this.actualRefreshMode = this.createRequest.getBoundContext().getObject().refreshMode;
							if (this.actualRefreshMode === 'M') {
								if (this.ctxGlobal !== undefined) {
									this.ctxGlobal.refresh('directGroup', true);
								}
							} else {
								this.ctx.refresh('directGroup', true);
							}
						}
						
						this.byId('btnAllocation').setEnabled(true);
						this.byId('allocationPopup').close();

					}.bind(this)).catch(function (exc) {
						this.byId('idIconTabBar').setBusy(false);
						this.byId('btnAllocation').setEnabled(true);
					}.bind(this));

				}

			},

			__internal_appendAllocationQty: function (dat, allocArray) {

				for (var idx = 0; idx < dat.length; idx++) {
					for (var subidx = 0; subidx < dat[idx].batches.length; subidx++) {

						if (dat[idx].batches[subidx].allocateQty !== undefined && dat[idx].batches[subidx].allocateQty !== 0 && dat[idx].batches[subidx].allocateQty !==
							'0' && dat[idx].batches[subidx].allocateQty !== '') {
							var newAll  = new Object();
							newAll.GUID = dat[idx].batches[subidx].guid;
							newAll.QTY  = dat[idx].batches[subidx].allocateQty;
							newAll.HU   = dat[idx].batches[subidx].exidv;
							allocArray.push(newAll);
						}

					}
				}

				return allocArray;
			},

			closeAllocation: function (evt) {
				this.byId('allocationPopup').close();
			},

			selectExistingATPC: function (evt) {
				var atpcid = evt.getSource().getBindingContext('EXISTINGALLOCATIONS').getObject().atpcid;
				this.byId('ATPCdetailExistingAllocation').openByATPC(evt, atpcid);
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

			FOtileColor: function (itemFOflag) {
				if (itemFOflag === 'X') {
					return '#34618742';
				}
			},

			formatAvailDate: function (availDate, supplyType, destnode, node) {

				if (supplyType === 'STK' && destnode === node) {
					return '';
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

			formatAvailTimePopover: function (availTime, supplyType, destnode, node) {

				if (supplyType === 'STK' && destnode === node) {
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

			textGoodsQuality: function (txtGQ) {

				if (txtGQ === '' || txtGQ === undefined) {
					return '';
				} else {
					return 'Cat. ' + txtGQ;
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

			formatIconMultiRouteVisible: function (routesCount, destNode, node, adiacentRoute) {
				if (destNode === node && routesCount > 0) {
					return false;
				} else {
					return true;
				}

			},

			formatIconMultiRouteColor: function (routesCount, destNode, node, adiacentRoute) {
				if ((destNode === node && routesCount > 0) || adiacentRoute === 'X') {
					return 'darkseagreen';
				} else {
					if (routesCount > 0) {
						return 'green';
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

			hideSupplyId: function (supplyType, supplyId) {
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
			},

			showIceRework: function (specialBatch) {
				return specialBatch.includes('G');
			},

			showSanificationRework: function (specialBatch) {
				return specialBatch.includes('B');
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

			hideallocationtexts: function (selected) {
				if (selected === 0 || selected === undefined) {
					return false;
				} else {
					return true;
				}
			},

			formatAllocationText: function (iAllocatedQty, iQty, unitkg, selected) {
				if (parseInt(iQty - iAllocatedQty) * unitkg > selected) {
					return 'partial allocation';
				} else if (parseInt(iQty - iAllocatedQty) * unitkg < selected) {
					return 'over allocation';
				} else {
					return 'allocation ok';
				}
			},

			disableInputQty: function (availQty) {
				if (availQty > 0) {
					return true;
				} else {
					return false;
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
					return 'Ord.prod.';
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

			supplyIdFormat: function (suppType, suppId) {

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

			},

			formatAllocationIconColor: function (iAllocatedQty, iQty, unitkg, selected) {
				if (parseInt(iQty - iAllocatedQty) * unitkg > selected) {
					return 'gold';
				} else if (parseInt(iQty - iAllocatedQty) * unitkg < selected) {
					return 'red';
				} else {
					return 'green';
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

			computeResidualAllocation: function (iAllocatedQty, iQty) {
				return parseInt(iQty - iAllocatedQty);
			},

			computeResidualAllocationKg: function (iAllocatedQty, iQty, unitKg) {
				return parseInt(iQty - iAllocatedQty) * unitKg;
			}

		});

		return FOManager;

	}, true);