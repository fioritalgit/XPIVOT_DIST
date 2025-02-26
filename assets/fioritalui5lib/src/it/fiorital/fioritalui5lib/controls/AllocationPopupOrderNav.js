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

		var FOManager = XMLComposite.extend("it.fiorital.fioritalui5lib.controls.AllocationPopupOrderNav", {
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

			masterFoOpen: function (evt) {

				this.jsModelListAlternativeRoutes.loadData(evt.getSource().getModel().sServiceUrl + "SalesOrderTrade(docnr='" + this.so +
					"')/CompatibleFreightOrders");

			},

			loadItemsCombo: function (evt) {
				if (evt.getSource().getBinding("items").isSuspended()) {
					evt.getSource().getBinding("items").resume();
				}
			},

			jsonRequestCompleted: function (event) {

				//---> must store the request id for later kill
				if (this.isCustAvail === true) {
					if (this.jsModelList.getData().AtpcAvailabilityRes.length > 0) {
						this.requestIds.push(this.jsModelList.getData().AtpcAvailabilityRes[0].requestGuid); //<-- take the first all are the same 
					}
				} else {
					if (this.jsModelList.getData().AtpcAvailability.length > 0) {
						this.requestIds.push(this.jsModelList.getData().AtpcAvailability[0].requestGuid); //<-- take the first all are the same 
					}
				}

				//--> clear filters (set base no generic batches) 
				this.byId('showGenericBatches').setSelected(false);
				this.byId('allocationBasicList').getBinding('items').filter([]);

				//--> store all data
				if (this.isCustAvail === true) {
					this.basedata = this.jsModelList.getData().AtpcAvailabilityRes;
				} else {
					this.basedata = this.jsModelList.getData().AtpcAvailability;
				}

				//--> populate model for tradeItems list & populate model for nodes filter
				var tradeItemsList = [];
				var nodesList = [];

				//---> clear selection
				this.jsModelListDisplay.setData();
				this.byId('masterNavContainer').to(this.byId('masterNavContainer').getPages()[0]);
				this.byId('txtCodeNode').setText('(seleziona un codice / magazzino)');

				this.basedata.forEach(function (el) {

					if (el.defaultRouteid === 'X') {

						//-----> nodes list
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

						//-----> trade item
						var titm = tradeItemsList.find(function (sitem) {
							return (sitem.productcode === el.matnr);
						});

						if (titm === undefined) {

							var hasSpecific = false;
							if (el.charg !== 'GENERIC') {
								hasSpecific = true;
							}

							tradeItemsList.push({
								hasSpecific: hasSpecific,
								productcode: el.matnr,
								productdescr: el.maktx,
								totalAvailabilities: 0,
								visibleFields: true,
								lineType: 'S',
								sitems: [el]
							});
						} else {

							if (el.charg !== 'GENERIC') {
								titm.hasSpecific = true;
							}

							titm.sitems.push(el);
						}

					}

				});

				//--> now count kg / boxes basdd on generic / specific presence
				tradeItemsList.forEach(function (sitem) {

					sitem.totalCP = 0;
					sitem.totalKg = 0;

					if (sitem.hasSpecific) {
						sitem.sitems.forEach(function (subitem) {
							if (subitem.charg !== 'GENERIC') {
								sitem.totalCP = sitem.totalCP + subitem.qtyAvailable;
								sitem.totalKg = sitem.totalKg + subitem.qtyAvailableKg;
							}
						});
					} else {
						sitem.sitems.forEach(function (subitem) {
							if (subitem.charg === 'GENERIC') {
								sitem.totalCP = sitem.totalCP + subitem.qtyAvailable;
								sitem.totalKg = sitem.totalKg + subitem.qtyAvailableKg;
							}
						});
					}

				});

				this.jsModelTradeItems.setData(tradeItemsList);
				this.jsModelNodes.setData(nodesList);

				this.byId('allocationBasicList').setBusy(false);
				this.waitDialog.close();
				this.byId('allocationPopup').open();

			},

			goFilterItems: function (evt) {

				//--> apply filter on TRADEITEMS 
				var src = evt.getParameter('query');

				if (src === '') {
					this.byId('tradeItemsList').getBinding('items').filter();
				} else {
					var titmFilters = [];
					titmFilters.push(new Filter({
						filters: [
							new Filter({
								path: 'productcode',
								operator: FilterOperator.Contains,
								value1: src,
								caseSensitive: false
							}),
							new Filter({
								path: 'productdescr',
								operator: FilterOperator.Contains,
								value1: src,
								caseSensitive: false
							})
						],
						and: false
					}));

					this.byId('tradeItemsList').getBinding('items').filter(titmFilters);
				}

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

			selectTradeItemGlobal: function (evt) {

				this.ActualCode = evt.getSource().getBindingContext('TRADEITEMS').getObject().productcode;
				this.ActualCodeDescr = evt.getSource().getBindingContext('TRADEITEMS').getObject().productdescr;

				var whsList = [];
				this.basedata.forEach(function (el) {

					if (el.matnr === this.ActualCode && el.defaultRouteid === 'X') {

						//-----> nodes list
						var fndNode = whsList.find(function (snode) {
							return snode.node === el.node;
						});

						if (fndNode === undefined) {
							whsList.push({
								node: el.node,
								nodedescr: el.nodeName,
								totalKg: el.qtyAvailableKg,
								totalCP: el.qtyAvailable
							});
						} else {
							fndNode.totalCP = fndNode.totalCP + el.qtyAvailable;
							fndNode.totalKg = fndNode.totalKg + el.qtyAvailableKg;
						}

					}

				}.bind(this));

				this.jsModelWarehouses.setData(whsList);
				this.byId('masterNavContainer').to(this.byId('masterNavContainer').getPages()[1]);
			},

			selectTradeItem: function (evt) {

				this.ActualCode = evt.getSource().getBindingContext('TRADEITEMS').getObject().productcode;
				this.byId('txtCodeNode').setText(evt.getSource().getBindingContext('TRADEITEMS').getObject().productcode + ' - ' + evt.getSource().getBindingContext(
					'TRADEITEMS').getObject().productdescr);

				if (this.isCustAvail === true) {
					this.finalShowData = this.__internal_CompactAtpcAvilability(this.jsModelList.getData().AtpcAvailabilityRes, this.ActualCode);
				} else {
					this.finalShowData = this.__internal_CompactAtpcAvilability(this.jsModelList.getData().AtpcAvailability, this.ActualCode);
				}
				this.jsModelListDisplay.setData(this.finalShowData);
			},

			__internal_calculatePreSelected: function () {

				this.preSelectedList = [];

				if (this.isCustAvail === true) {
					this.jsModelList.getData().AtpcAvailabilityRes.forEach(function (sdata) {

						if (sdata.allocateQty !== undefined && sdata.allocateQty !== '' && sdata.allocateQty !== '0') {
							this.preSelectedList.push(sdata);
						}

					}.bind(this));

				} else {
					this.jsModelList.getData().AtpcAvailability.forEach(function (sdata) {

						if (sdata.allocateQty !== undefined && sdata.allocateQty !== '' && sdata.allocateQty !== '0') {
							this.preSelectedList.push(sdata);
						}

					}.bind(this));
				}

				this.jsonModelPreSelected.setData(this.preSelectedList);
			},

			showPreSelected: function (evt) {

				this.__internal_calculatePreSelected();
				this.byId('preSelectedItems').openBy(evt.getSource());

			},

			deleteFromPreSelected: function (evt) {
				evt.getSource().getBindingContext('PRESELECTEDITEMS').getObject().allocateQty = '';
				this.__internal_calculatePreSelected();
				this.jsModelListDisplay.refresh(true);
			},

			selectWarehouse: function (evt) {
				var node = evt.getSource().getBindingContext('WHSITEMS').getObject().node;
				this.byId('txtCodeNode').setText(this.ActualCode + ' - ' + this.ActualCodeDescr + ' - ' + node);
				if (this.isCustAvail === true) {
					this.finalShowData = this.__internal_CompactAtpcAvilability(this.jsModelList.getData().AtpcAvailabilityRes, this.ActualCode, node);
				} else {
					this.finalShowData = this.__internal_CompactAtpcAvilability(this.jsModelList.getData().AtpcAvailability, this.ActualCode, node);
				}
				this.jsModelListDisplay.setData(this.finalShowData);
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

			changeShowGenerics: function (evt) {
				if (this.isCustAvail === true) {
					var finalShowData = this.__internal_CompactAtpcAvilability(this.jsModelList.getData().AtpcAvailabilityRes, this.ActualCode);
				} else {
					finalShowData = this.__internal_CompactAtpcAvilability(this.jsModelList.getData().AtpcAvailability, this.ActualCode);
				}
				this.jsModelListDisplay.setData(finalShowData);
			},

			__internal_CompactAtpcAvilability: function (data, matnr, node) {

				var prevRef = new Object();
				prevRef.clusterid = -1;
				var resATPC = [];

				for (var idx = 0; idx < data.length; idx++) {

					if ((node === undefined || data[idx].node === node) && (matnr === 'ALL' || matnr === undefined || data[idx].matnr === matnr) && (
							data[idx].charg !==
							'GENERIC' || this.byId('showGenericBatches').getSelected() === true)) {

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
							//data[idx].allocateQty = 0;

							if (data[idx].defaultRouteid === 'X') {
								newAvailObj['hasDefaultRoute'] = 'X';
							}

							data.forEach(function (row) {
								// add custom field for input price only first time when not in JSONModel
								if (row.inputprice === undefined) {
									row.inputprice = 0;
								}
							});

							newAvailObj.batches.push(data[idx]);

							resATPC.push(newAvailObj);

						} else {
							data[idx].parentref = newAvailObj; //<-- parent reference
							//data[idx].allocateQty = 0;

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

				//--> other FO selected?
				if (this.jsModelSelectedAlternativeRoute.getData() !== undefined && this.jsModelSelectedAlternativeRoute.getData().sotradelgort !==
					undefined) {
					var foOutId = this.jsModelSelectedAlternativeRoute.getData().freightorderid;
				} else {

					//---> take from SO
					var foOutId = this.ctxGlobal.getContext().getObject().zzdefaultFo;
				}

				this.getSelectedCluster = dt;
				this.jsModelListAlternativeRoutesPopover.loadData(evt.getSource().getModel().sServiceUrl + this.association + "(gcid='" + dt.batches[
						0]
					.gcid +
					"',grid='" + dt.batches[0].grid + "',charg='" + dt.batches[0].charg + "',destNodeReqDate=" + dt.batches[0].destNodeReqDate +
					",destNodeReqTime='" + dt.batches[0].destNodeReqTime + "')/AtpcPossibleRoutes?$expand=AtpcPossibleRoutesNodes&$search=FO" +
					foOutId); //<-- it's ok to take the frst batch guid

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

				this.waitDialog = new sap.m.BusyDialog();

				this.matFilter = [];
				this.nodeFilter = [];

				//--> side selection list for products / warehouses
				this.jsModelTradeItems = new jsModel;
				this.setModel(this.jsModelTradeItems, 'TRADEITEMS');

				this.jsModelWarehouses = new jsModel;
				this.setModel(this.jsModelWarehouses, 'WHSITEMS');

				this.jsModelList = new jsModel;
				this.jsModelListDisplay = new jsModel;

				this.jsonModelPreSelected = new jsModel();
				this.setModel(this.jsonModelPreSelected, 'PRESELECTEDITEMS');

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

			setListener: function (newSo, ctxGlobal) {

				this.getYsocket();

				this.ctxGlobal = ctxGlobal;

				//---> remove pending listeners (KO)
				if (this.so !== undefined && this.so !== '') {
					this.YsocketManager.deleteListenersByTypeAndId1(this.so, 'ALLOCATION');
					this.YsocketManager.deleteListenersByTypeAndId1(this.so, 'ODV');
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
						//--> only message 
					}.bind(this), true);

				//--->register a callback
				this.YsocketManager.addListenerPermanent({
						id1: newSo
					}, 'ODV',
					function (data) {

						//---> handle a further refresh
						this.ctxGlobal.refresh('directGroup', true);

					}.bind(this), true);

				this.YsocketManager.addListenerPermanent({
						id1: newSo,
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
						//this.YsocketManager.deleteListenersByid1(this.so);

					}.bind(this), true);
			},

			openByData: function (evt, so, ctxGlobal, soData, isCustAvail) {

				this.byId('showGenericBatches').setSelected(false);
				this.byId('btnAllocation').setEnabled(true);
				this.byId('iconOverSelection').removeStyleClass('blinking');
				this.byId('onlylocalavailability').setState(true);
				this.byId('onlyPartner').setState(false);

				this.byId('qtySelected').setText('-');

				this.byId('txtCodeNode').setText('(seleziona un codice / magazzino)');

				//---> remove pending listeners (KO)
				/*				if (this.so !== undefined && this.so !== '') {
									this.YsocketManager.deleteListenersByid1(this.so);
								}*/

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

				//-->pad start location to get always 4 cha
				this.waitDialog.open();
				this.waitDialog.setText('carico disponibilità...');

				this.byId('filterFaozone').clearSelection();
				this.byId('filterFaozone').setValue();
				this.byId('filterProductCategory').clearSelection();
				this.byId('filterProductCategory').setValue();
				this.byId('filterOrigin').clearSelection();
				this.byId('filterOrigin').setValue();
				this.byId('filterOriginPO').setValue();

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

				this.byId('allocationBasicList').setBusy(true);

			},

			goChangeFAO: function (evt) {
				this.goChangeOrigin(evt);
			},

			goChangeOriginPO: function (evt) {
				this.goChangeOrigin(evt);
			},

			goChangeProductCategory: function (evt) {
				this.goChangeOrigin(evt);
			},

			goChangeOrigin: function (evt) {

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
				
				var fltOrignPo = '';
				if (this.byId('filterOriginPO').getValue() !== ''){
					fltOrignPo = " and contains(originPo,'"+this.byId('filterOriginPO').getValue()+"')";
				}

				this.jsModelList.loadData(evt.getSource().getModel().sServiceUrl + "SalesOrderTrade(docnr='" + this.so +
					"')?$expand=" + this.association + "($filter=requestOnlyDestNode eq '" + onlyLocalNode + "' " +
					onlyPartnerReserver + OriginFilterStr + FaoFilterStr + ProductCategoryFilterStr + fltOrignPo + " )");

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
					"')?$expand=" + this.association + "($filter=requestOnlyDestNode eq '" + onlyLocalNode + "' " +
					onlyPartnerReserver + OriginFilterStr + FaoFilterStr + ProductCategoryFilterStr + " )");

				this.byId('allocationBasicList').setBusy(true);

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
			this.byId('btnAllocation').setEnabled(false);
				//---> create allocations
				this.createRequest = this.getModel().bindContext('/CREATE_ATPC_CHAIN(...)');

				var dt = new Object();
				dt.REQUESTED_AVAILABILITIES = [];
				if (this.isCustAvail === true) {
					dt.REQUESTED_AVAILABILITIES = this.__internal_appendAllocationQty(this.jsModelList.getData().AtpcAvailabilityRes, dt.REQUESTED_AVAILABILITIES);
				}else{
					dt.REQUESTED_AVAILABILITIES = this.__internal_appendAllocationQty(this.jsModelList.getData().AtpcAvailability, dt.REQUESTED_AVAILABILITIES);	
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
				this.byId('allocationBasicList').setBusy(true);
				

				//---> fire the UNBOUND action on odata V4
				this.createRequest.execute().then(function (dt) {

					this.byId('allocationBasicList').setBusy(false);
					
					

					var result = this.createRequest.getBoundContext().getObject().res;

					var finalMessage;
					if (this.createRequest.getBoundContext().getObject().message === '') {
						finalMessage = 'Allocazione rifiutata';
					} else {
						finalMessage = this.createRequest.getBoundContext().getObject().message;
					}

					if (result === 0) {

						//---> fire the toast message
						this.byId('allocationBasicList').setBusy(false);
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
						
						
						this.byId('allocationPopup').close();

					}
					

				}.bind(this)).catch(function (exc) {
					this.byId('allocationBasicList').setBusy(false);
					this.byId('btnAllocation').setBusy(false);
					new this.FioritalMessageStrip('Eccezione in allocazione', {
						status: 'error',
						icon: 'sap-icon://error',
						timeout: 4000
					});
				}.bind(this));

			},

			__internal_appendAllocationQty: function (dat, allocArray) {

				dat.forEach(function (sall) {
					if (sall.allocateQty !== undefined && sall.allocateQty !== 0 && sall.allocateQty !== '' && sall.allocateQty !== '0') {
						var newAll = new Object();
						newAll.GUID = sall.guid;
						newAll.QTY = sall.allocateQty;
						newAll.HU = sall.exidv;

						if (sall.inputprice !== undefined && sall.inputprice !== 0 && sall.inputprice !== '' && sall.inputprice !== '0') {
							newAll.DIRECT_PRICE = sall.inputprice;
						}

						allocArray.push(newAll);
					}
				});

				return allocArray;
			},

			closeAllocation: function (evt) {
				this.byId('allocationPopup').close();
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
				if (destNode === node && routesCount > 0) {
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

			showIceRework: function (specialBatch) {
				return specialBatch.includes('G');
			},

			showSanificationRework: function (specialBatch) {
				return specialBatch.includes('B');
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

			truncateNumber: function (number) {
				return Math.trunc(parseFloat(number));
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

		});

		return FOManager;

	}, true);