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

		var FOManager = XMLComposite.extend("it.fiorital.fioritalui5lib.controls.ATPCDetail", {
			metadata: {
				properties: {
					title: {
						type: "string",
						defaultValue: "ATPC detail"
					}
				},
				aggregations: {

				}
			},

			jsonRequestCompleted: function (event) {
				//----> restructure the data

				var ATPCstructure = new Object();
				ATPCstructure.nodes = [];
				ATPCstructure.lines = [];

				var cnt = 1;
				var idcnt = 1;
				var ATPCdata = this.jsModelList.getData();
				var totNodesCnt = this.jsModelList.getData().AtpcPos.length;

				this.jsModelList.getData().AtpcPos.forEach(function (node) {

					//---> add source node in case of with PO
					if (cnt === 1 && node.supplyType === "ODA") {
						var newPreNode = new Object();
						newPreNode.shape = "Circle";
						newPreNode.icon = "sap-icon://supplier";
						newPreNode.key = idcnt;
						newPreNode.nodeType = 'PO';
						newPreNode.nodeId = node.originSupplyId;
						newPreNode.title = node.originSupplyType + ' / ' + node.originSupplyId;
						idcnt = idcnt + 1;

						var act = new Object({
							"icon": "sap-icon://settings"
						});
						newPreNode.actionButtons = [];
						newPreNode.actionButtons.push(act);

						ATPCstructure.nodes.push(newPreNode);

					}

					if (cnt === 1 && node.supplyType === "ATPC") {

					}

					if (node.foIn !== '' && cnt === 1) {
						newPreNode = new Object();
						newPreNode.shape = "Circle";
						newPreNode.icon = "sap-icon://shipping-status";
						newPreNode.key = idcnt;
						newPreNode.nodeType = 'FO';
						newPreNode.nodeId = node.foIn;
						newPreNode.status = "Warning";
						newPreNode.title = node.foIn.replace(/^0+/, '');
						idcnt = idcnt + 1;

						var act = new Object({
							"icon": "sap-icon://settings"
						});
						newPreNode.actionButtons = [];
						newPreNode.actionButtons.push(act);

						ATPCstructure.nodes.push(newPreNode);
					}

					//---> add master node
					var newMasterNode = new Object();
					newMasterNode.attributes = [];
					newMasterNode.actionButtons = [];
					newMasterNode.shape = "Box";
					newMasterNode.icon = 'sap-icon://factory';
					newMasterNode.status = "Success";
					newMasterNode.width = 300;
					newMasterNode.nodeType = 'WHS';
					newMasterNode.key = idcnt;
					newMasterNode.title = 'WHS: ' + node.node +' - '+ node.nodename;
					
					if (node.atpclevelinner === 'X'){
						newMasterNode.status = "Warning";
					}
					
					idcnt = idcnt + 1;

					//---> action Button
					var act = new Object({
						"icon": "sap-icon://settings"
					});
					newMasterNode.actionButtons.push(act);

					//---> in / out dates times
					if (node.supplyType !== "STK"){
						var attr = new Object();
						attr.icon = 'sap-icon://sap-icon://past';
						attr.label = 'In: ';
						
						if (node.foInDate === null){
							attr.value = '(adiacente)';
						}else{
							attr.value = node.foInDate + ' - ' + node.foInTime;
						}
						
						newMasterNode.attributes.push(attr);
					}

					var attr = new Object();
					attr.icon = 'sap-icon://sap-icon://future';
					attr.label = 'Out: ';
					
					if ( node.foOutDate === null){
						attr.value = '(adiacente)';
					}else{
						attr.value = node.foOutDate + ' - ' + node.foOutTime;
					}
					
					newMasterNode.attributes.push(attr);
					
					ATPCstructure.nodes.push(newMasterNode);
					
					
					if (node.foOut !== ''){
						var newFinalNode = new Object();
						newFinalNode.shape = "Circle";
						newFinalNode.icon = "sap-icon://shipping-status";
						newFinalNode.title = node.foOut.replace(/^0+/, '');
						newFinalNode.key = idcnt;
						newFinalNode.nodeType = 'FO';
						newFinalNode.nodeId = node.foOut;
						newFinalNode.status = "Warning";
						idcnt = idcnt + 1;

						var act = new Object({
							"icon": "sap-icon://settings"
						});
						newFinalNode.actionButtons = [];
						newFinalNode.actionButtons.push(act);

						ATPCstructure.nodes.push(newFinalNode);
					}
					
					

					//---> last node add target if ODV
					if (cnt === totNodesCnt && ATPCdata.demandType === 'ODV') {

						newFinalNode = new Object();
						newFinalNode.shape = "Circle";
						newFinalNode.nodeType = 'ODV';
						newFinalNode.icon = "sap-icon://person-placeholder";
						newFinalNode.title = ATPCdata.customername;
						newFinalNode.key = idcnt;
						newFinalNode.nodeId = ATPCdata.demand;
						newFinalNode.nodePosId = ATPCdata.demandPos;
						idcnt = idcnt + 1;

						var act = new Object({
							"icon": "sap-icon://settings"
						});
						newFinalNode.actionButtons = [];
						newFinalNode.actionButtons.push(act);

						ATPCstructure.nodes.push(newFinalNode);
					}
					
					cnt = cnt + 1;

				});

				//---> create connection lines
				for (var idx = 1; idx < idcnt - 1; idx++) {
					var newLink = new Object();
					newLink.from = idx;
					newLink.to = idx + 1;

					ATPCstructure.lines.push(newLink);
				}

				this.jsModelGraph.setData(ATPCstructure);

				this.byId('ATPCPopover').setBusy(false);
				
			},

			setZoom: function (evt) {
				//this._ATPCgraph.zoom({zoomLevel:0.85}); //<-- reduce zoom	
			},

			nodeActionPress: function (evt) {

				var nodeData = sap.ui.getCore().byId(evt.getParameter('id')).getParent().data();

				if (nodeData.nodeType === 'FO') {
					this.byId('ATPCFOdetail').openByOrder(sap.ui.getCore().byId(evt.getParameter('id')).getParent(), nodeData.nodeId);
				}

			},

			init: function () {

				//--> super
				XMLComposite.prototype.init.apply(this, arguments);
				this._ATPCgraph = this.byId("ATPCgraph");
				this._ATPCgraph.getToolbar().setVisible(false); //<-- hide the toolbar
				this._ATPCPopover = this.byId("ATPCPopover");

				this.jsModelGraph = new jsModel;
				this.jsModelList = new jsModel;

				var boundCallback = this.jsonRequestCompleted.bind(this);
				this.jsModelList.attachRequestCompleted(boundCallback);

				this._ATPCPopover.setModel(this.jsModelGraph, 'ATPCMODEL');
				this._ATPCPopover.setModel(this.jsModelList, 'ATPCMODELLIST');

			},

			applySettings: function (mSettings, oScope) {
				//--> super
				XMLComposite.prototype.applySettings.apply(this, arguments);
			},

			openByATPC: function (evt, ATPCid) {
				this.target = evt.getSource();
				this.byId('headerATPCId').setText(this.deleteTrailZeros(ATPCid));
				
				this.byId('ATPCPopover').setBusy(true);
				this._ATPCPopover.openBy(this.target);
				
				this.jsModelList.loadData(evt.getSource().getModel().sServiceUrl + "/Atpc(atpcid='" + ATPCid +
					"',hu='')?$expand=AtpcPos");

			},

			//-----------------------------------------------------------------------------> control EVENTS

			_onCloseButtonPress: function (evt) {
				this._ATPCPopover.close();
			},

			//-----------------------------------------------------------------------------> control formatters
			formatNodeTime: function (date,time){
				if (date === null){
					return '';
				}else{
					return time;
				}
			},
			
			hideIconNoDate: function(dateValue){
				if (dateValue === null){
					return false;
				}else{
					return true;
				}	
			},
			
			deleteTrailZeros: function (supplyId) {
				try {
					return supplyId.replace(/^0+/, '');
				} catch (ex) {

				}
			},
			
			formatIconSupplyTypeColor: function(supplyType){
				switch (supplyType) {
					case 'RRA':
						return 'darkgrey';
						break;
					case 'ATPC':
						return 'darkgrey';
						break;
					default:
					    return 'black';
					}	
			},
			
			formatIconSupplyType: function(supplyType){
				switch (supplyType) {
					case 'STO':
						return 'sap-icon://shipping-status';
						break;
					case 'RRA':
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
						return 'sap-icon://chain-link';
						break;
					default:
					}	
			},
			
			supplyIdFormatter: function(supplyId,supplyType){
				if (supplyType === 'STK'){
					return 'in stock';
				}else{
					switch (supplyType) {
						case 'STO':
							return 'Trasferimento';
							break;
						case 'RRA':
							return 'Richiesta Trasf.';
							break;
						case 'STK':
							return 'Stock';
							break;
						case 'ODA':
							return 'Ordine acquisto';
							break;
						case 'ODP':
							return 'Ordine produzione';
							break;
						case 'ATPC':
							return 'Trasferimento';
							break;
						default:
						}
				}
			}

		});

		return FOManager;

	}, true);