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
	],
	function (jQuery, XMLComposite, MessageToast, MessageBox, Filter, FilterOperator, jsModel, APCManager, FioritalMessageStrip) {
		"use strict";

		var FOManager = XMLComposite.extend("it.fiorital.fioritalui5lib.controls.AllocationPopupOrder", {
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

			jsonRequestCompleted: function (event) {

				//---> must store the request id for later kill
				if (this.jsModelList.getData().AtpcAvailability.length > 0) {
					this.requestIds.push(this.jsModelList.getData().AtpcAvailability[0].requestGuid); //<-- take the first all are the same 
				}

				//--> clear filters (set base no generic batches) 
				this.byId('showGenericBatches').setSelected(false);
				this.byId('allocationBasicList').getBinding('items').filter([]);
				this.byId('inputtradeitem').setValue('');
				this.byId('comboNodes').setValue('');

				//--> prepare output structured format & set data for models (divide json)
				this.jsModelListAlternativeRoutes.setData(this.jsModelList.getData().CompatibleFreightOrders);

				var finalShowData = this.__internal_CompactAtpcAvilability(this.jsModelList.getData().AtpcAvailability);
				this.jsModelListDisplay.setData(finalShowData);

				//--> populate model for nodes filter
				var nodesList = [];
				finalShowData.forEach(function (el) {

					var found = false;
					nodesList.forEach(function (elInner) {
						if (elInner.node === el.node) {
							found = true;
						}
					});

					if (!found) {
						nodesList.push(new Object({
							'node': el.node,
							'descr': 'todo'
						}));
					}

				});

				this.jsModelNodes.setData(nodesList);

				this.byId('allocationBasicList').setBusy(false);
				sap.ui.core.BusyIndicator.hide();
				this.byId('allocationPopup').open();

			},

			onChangeNodeFilter: function (evt) {

				var finalFilter = [];
				finalFilter.push.apply(finalFilter, this.matFilter);

				var fltNode = new Filter({
					path: 'node',
					operator: FilterOperator.EQ,
					value1: evt.getSource().getSelectedItem().getKey()
				});

				this.nodeFilter = [];
				this.nodeFilter.push(fltNode);
				finalFilter.push.apply(finalFilter, this.nodeFilter);

				this.byId('allocationBasicList').getBinding('items').filter(finalFilter);

			},

			onClearFilterNode: function (evt) {

				this.byId('comboNodes').setValue('');

				this.nodeFilter = [];

				var finalFilter = [];
				finalFilter.push(this.matFilter);
				this.byId('allocationBasicList').getBinding('items').filter(finalFilter);
			},

			changeShowGenerics: function (evt) {
				var finalShowData = this.__internal_CompactAtpcAvilability(this.jsModelList.getData().AtpcAvailability);
				this.jsModelListDisplay.setData(finalShowData);
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

				this.getSelectedCluster = dt;
				this.jsModelListAlternativeRoutesPopover.loadData(evt.getSource().getModel().sServiceUrl + "AtpcAvailability(guid='" + dt.batches[0]
					.guid +
					"')/AtpcPossibleRoutes?$expand=AtpcPossibleRoutesNodes"); //<-- it's ok to take the frst batch guid

				this.byId('allocationBasicList').setBusy(true);

			},

			selectAlternativeRoute: function (evt) {

				//---> set single nodes model
				var dt = evt.getParameter('listItem').getBindingContext('ALTERNATIVEROUTESPOPOVER').getObject();
				this.jsModelListAlternativeRoutesPopoverNodes.setData(dt.AtpcPossibleRoutesNodes);

			},

			showBatchDetails: function (evt) {

				var ctx = evt.getSource().getBindingContext('SUPPLYJSONMODEL');
				var obj = ctx.getObject();

				this.byId('attributeManagerId').openByBatchId(evt, obj.charg, obj.matnr, '1000');

			},

			showFO: function (evt) {
				this.byId('foManagerId').openByOrder(evt, evt.getSource().getText().padStart(20, '0'));
			},

			showMainFO: function (evt) {
				this.byId('foManagerId').openByOrder(evt, this.getModel('SUPPLYJSONMODELBASE').getData().freightorderidfinal);
			},

			selectedAlternativeSupplyRoute: function (evt) {

				var cluster;

				//---> must select the right route for all cluster
				var selectedRoute = this.byId('alternativeRouteList').getSelectedItem().getBindingContext('ALTERNATIVEROUTESPOPOVER').getObject();

				var clusterData = this.activeJsonModel.getData(); //<--- depends over active tab
				for (var idx = 0; idx < clusterData.length; idx++) {
					for (var subidx = 0; subidx < clusterData[idx].batches.length; subidx++) {
						if (clusterData[idx].batches[subidx].guid === selectedRoute.guid) {
							cluster = clusterData[idx];
							break;
						}
					}

					if (cluster !== undefined) {
						break;
					}
				}

				//---> now set default for route id and remove for others
				for (idx = 0; idx < cluster.batches.length; idx++) {
					if (cluster.batches[idx].routeid === selectedRoute.routeid) {
						cluster.batches[idx].defaultRouteid = 'X';
					} else {
						cluster.batches[idx].defaultRouteid = '';
					}

					cluster.batches[idx].allocateQty = 0; //<-- reet quantities
				}

				//--> special char for CSS
				var itm;
				cluster.batches.forEach(function (sitem) {
					if (sitem.defaultRouteid === 'X') {
						itm = sitem;
					}
				});
				itm.LASTBATCH = 'X';

				cluster.routeid = selectedRoute.routeid;
				this.activeJsonModel.refresh(true);

				this.byId('popoverAternativeRoutes').close();

			},

			backFromRouteDetail: function (evt) {
				this.byId('popoverAternativeRoutes').close();
			},

			init: function () {

				//---> super
				XMLComposite.prototype.init.apply(this, arguments);

				this.matFilter = [];
				this.nodeFilter = [];

				this.jsModelList = new jsModel;
				this.jsModelListDisplay = new jsModel;

				//-------------------------------------- other models

				this.jsModelListAlternativeRoutes = new jsModel;
				this.jsModelSelectedAlternativeRoute = new jsModel;
				this.jsModelListAlternativeRoutesPopover = new jsModel;
				this.jsModelListAlternativeRoutesPopoverNodes = new jsModel;

				this.jsModelSuggest = new jsModel;
				this.jsModelNodes = new jsModel;

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

				this.setModel(this.jsModelSuggest, 'SUGGESTIONS');
				this.jsModelSuggest.attachRequestCompleted(this.suggestionModelLoaded.bind(this));

				this.setModel(this.jsModelNodes, 'NODESFILTER');

			},

			applySettings: function (mSettings, oScope) {

				//--> super
				XMLComposite.prototype.applySettings.apply(this, arguments);
			},

			openByData: function (evt, so, ctxGlobal, soData) {

				this.byId('showGenericBatches').setSelected(false);
				this.byId('iconOverSelection').removeStyleClass('blinking');
				this.byId('onlylocalavailability').setState(true);
				this.byId('onlyPartner').setState(false);

				this.so = so;
				this.soData = soData;
				this.ctxGlobal = ctxGlobal;
				this.byId('alternativeRouteShow').setVisible(false);

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

				//-->pad start location to get always 4 char
				sap.ui.core.BusyIndicator.show(0);
				this.jsModelList.loadData(evt.getSource().getModel().sServiceUrl + "SalesOrderTrade(docnr='" + this.so +
					"')?$expand=CompatibleFreightOrders,AtpcAvailability($filter=requestOnlyDestNode eq '1')");
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

				this.jsModelList.loadData(evt.getSource().getModel().sServiceUrl + "SalesOrderTrade(docnr='" + this.so +
					"')?$expand=CompatibleFreightOrders,AtpcAvailability($filter=requestOnlyDestNode eq '" + onlyLocalNode + "' " +
					onlyPartnerReserver + " )");

				this.byId('allocationBasicList').setBusy(true);

			},

			changeBPFlag: function (evt) {

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
				if (this.byId('onlylocalavailability').getState() === false) {
					onlyLocalNode = '0';
				} else {
					onlyLocalNode = '1';
				}

				var onlyPartnerReserver;
				if (evt.getParameter('state') == true) {
					onlyPartnerReserver = "and requestSpecificBp eq '" + this.soData.customercode + "'";
				} else {
					onlyPartnerReserver = '';
				}

				this.jsModelList.loadData(evt.getSource().getModel().sServiceUrl + "SalesOrderTrade(docnr='" + this.so +
					"')?$expand=CompatibleFreightOrders,AtpcAvailability($filter=requestOnlyDestNode eq '" + onlyLocalNode + "' " +
					onlyPartnerReserver + " )");

				this.byId('allocationBasicList').setBusy(true);

			},

			onAfterOpen: function (evt) {

				//---> component need APC callback handler check if present
				this.componentRef = sap.ui.core.Component.getOwnerComponentFor(this);

				if (this.componentRef.YsocketManager === undefined) {

					this.YsocketManager = new this.APCManager(this.getApchandshake(), this.getApcendpoint(), this);

				} else {
					this.YsocketManager = this.componentRef.YsocketManager;
				}

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

				sap.ui.core.BusyIndicator.show(0);

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

				this.jsModelList.loadData(evt.getSource().getModel().sServiceUrl + "SalesOrderTrade(docnr='" + this.so +
					"')?$expand=CompatibleFreightOrders,AtpcAvailability($filter=requestOnlyDestNode eq '" + onlyLocalNode +
					"' and destNodeReqDate eq " + dt.sotradedate +
					" and destNodeReqTime eq '" +
					dt.sotradetime + "' and destNode eq '" + dt.sotradelgort + "' " + onlyPartnerReserver + " )");

				this.byId('spliAllcoationPopup').hideMaster();

			},

			valueAllocationChange: function (evt) {

				if (evt.getParameter('value') === '') {
					evt.getSource().setValue('0');
				}

				var sum = 0;

				//---> check all quantities in clusters
				sum = this.__internalCheckOverAllocation(this.jsModelListDisplay.getData(), sum);

				//---> recalculate totals
				this.__internal_calculateAllocationQty();

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

			gosearchFilterMaterial: function (evt) {

				var finalFilter = [];
				var srcUp = evt.getParameter('query').toUpperCase();
				var src = evt.getParameter('query');

				if (src === '') {

					this.matFilter = [];
					finalFilter.push.apply(finalFilter, this.nodeFilter);
					this.byId('allocationBasicList').getBinding('items').filter(finalFilter);

				} else {

					this.matFilter = [];
					this.matFilter.push(new Filter({
						filters: [
							new Filter({
								path: 'matnr',
								operator: FilterOperator.Contains,
								value1: srcUp
							}),
							new Filter({
								path: 'matnr',
								operator: FilterOperator.Contains,
								value1: src
							})
						],
						and: false
					}));

					finalFilter.push.apply(finalFilter, this.nodeFilter);
					finalFilter.push.apply(finalFilter, this.matFilter);
					this.byId('allocationBasicList').getBinding('items').filter(finalFilter);

				}

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
				for (var idx = 0; idx < dat.length; idx++) {
					for (var subidx = 0; subidx < dat[idx].batches.length; subidx++) {
						sum = sum + parseFloat(dat[idx].batches[subidx].allocateQty);
					}
				}

				return sum;
			},

			runAllocation: function (evt) {

				//---> create allocations
				this.createRequest = this.getModel().bindContext('/CREATE_ATPC_CHAIN(...)');

				var dt = new Object();
				dt.REQUESTED_AVAILABILITIES = [];
				dt.REQUESTED_AVAILABILITIES = this.__internal_appendAllocationQty(this.jsModelListDisplay.getData(), dt.REQUESTED_AVAILABILITIES);

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
				this.byId('allocationBasicList').setBusy(true);

				//---> fire the UNBOUND action on odata V4
				this.createRequest.execute().then(function (dt) {

					this.byId('allocationBasicList').setBusy(false);

					var result = this.createRequest.getBoundContext().getObject().res;

					if (result === 0) {

						//---> fire the toast message
						new FioritalMessageStrip('Allocation request refused!', {
							status: 'error',
							icon: 'sap-icon://error',
							timeout: 4000
						});

					} else {

						//--->register a callback
						this.YsocketManager.addListenerSingle({
								id1: this.so
							}, 'ODV',
							function (data) {

								//---> handle a further refresh
								this.ctxGlobal.refresh('directGroup', true);

								//---> remove pending listeners (KO)
								this.YsocketManager.deleteListenersByid1(this.so);

							}.bind(this), true);

						this.YsocketManager.addListenerSingle({
								id1: this.so,
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

								//---> handle a further refresh
								this.ctxGlobal.refresh('directGroup', true);

								//---> remove pending listeners (OK)
								this.YsocketManager.deleteListenersByid1(this.so);

							}.bind(this), true);

						//---> close popup
						this.ctxGlobal.refresh('directGroup', true);

					}

					this.byId('allocationPopup').close();

				}.bind(this)).catch(function (exc) {
					this.byId('allocationBasicList').setBusy(false);
				}.bind(this));

			},

			__internal_appendAllocationQty: function (dat, allocArray) {

				for (var idx = 0; idx < dat.length; idx++) {
					for (var subidx = 0; subidx < dat[idx].batches.length; subidx++) {

						if (dat[idx].batches[subidx].allocateQty !== undefined && dat[idx].batches[subidx].allocateQty !== 0 && dat[idx].batches[subidx].allocateQty !==
							'' && dat[idx].batches[subidx].allocateQty !== '0') {
							var newAll = new Object();
							newAll.GUID = dat[idx].batches[subidx].guid;
							newAll.QTY = dat[idx].batches[subidx].allocateQty;
							allocArray.push(newAll);
						}

					}
				}

				return allocArray;
			},

			closeAllocation: function (evt) {
				this.byId('allocationPopup').close();
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
				this.jsModelListAlternativeRoutesPopover.loadData(evt.getSource().getModel().sServiceUrl + "AtpcAvailability(guid='" + dt.batches[0]
					.guid +
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

			formatAvailTime: function (availTime, supplyType) {

				if (supplyType === 'STK') {
					return '';
				} else {
					return availTime;
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
				if (destNode === node) {
					return false;
				} else {
					return true;
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

			priceNull: function (price) {
				if (price === 0) {
					return '(nd)';
				} else {
					return price;
				}
			},

			hidePrice: function (price) {
				if (price === 0) {
					return false;
				} else {
					return true;
				}
			},

			hideRouteOnStock: function (destNode, node, adiacent, routesCnt) {
				if (destNode === node || adiacent === 'X' || routesCnt === 0) {
					return false;
				} else {
					return true;
				}
			},

			formatAvailTimePopover: function (availTime, supplyType) {

				if (supplyType === 'STK') {
					return '';
				} else {
					return availTime.substr(0, 2) + ':' + availTime.substr(2, 2) + ':' + availTime.substr(4, 2);
				}

			},

			hideSupplyId: function (supplyId, supplyType) {

				if (supplyType === 'ODA' || supplyType === 'ODP') {
					return true;
				} else {
					return false;
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

			hideAtpcCustomer: function (atpccustomer) {
				if (atpccustomer === '' || atpccustomer === null || atpccustomer === undefined) {
					return false;
				} else {
					return true;
				}

			},

			supplyIdFormat: function (suppType, suppId) {

				switch (suppType) {
				case 'ATPC':
					return suppId.replace(/^0+(\d)|(\d)0+$/gm, '$1$2');
					break;
				default:
					return suppId;
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
			}

		});

		return FOManager;

	}, true);