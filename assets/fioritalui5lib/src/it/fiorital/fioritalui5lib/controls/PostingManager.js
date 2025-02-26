sap.ui.define([
		"jquery.sap.global",
		"sap/ui/core/XMLComposite",
		"sap/m/MessageToast",
		"sap/m/MessageBox",
		"sap/ui/model/Filter",
		"sap/ui/model/FilterOperator",
		"sap/ui/model/json/JSONModel",
		"it/fiorital/fioritalui5lib/controls/FioritalMessageStrip",
		"it/fiorital/fioritalui5lib/controls/APCmanager",
		"it/fiorital/fioritalui5lib/controls/BapiReturnDisplay"
	],
	function (jQuery, XMLComposite, MessageToast, MessageBox, Filter, FilterOperator, JSONModel, FioritalMessageStrip, APCmanager,
		BapiReturnDisplay) {
		"use strict";

		var PostingManager = XMLComposite.extend("it.fiorital.fioritalui5lib.controls.PostingManager", {
			metadata: {
				properties: {

				},
				events: {
					onClose: {
						parameters: {

						}
					}
				},
				aggregations: {

				}
			},

			FioritalMessageStrip: FioritalMessageStrip,
			APCmanager: APCmanager,
			BapiReturnDisplay: BapiReturnDisplay,

			init: function () {
				XMLComposite.prototype.init.apply(this, arguments);

				this.jsonModelSoft = new JSONModel();
				this.jsonModelSoftLogs = new JSONModel();

				this.setModel(this.jsonModelSoft, "SOFTALLOCATIONSLIST");
				this.setModel(this.jsonModelSoftLogs, "SOFTALLOCATIONLOGS");

				this.jsonModelSoft.attachRequestCompleted(this.softAllocatedDataReceived.bind(this));

				this._postingManagerPopover = this.byId("popoverPosting");
				this._bapiReturnDisplay = new BapiReturnDisplay();

				this.contextSoftConv = this.getGuid();

				//---> component need APC callback handler check if present
				this.componentRef = sap.ui.core.Component.getOwnerComponentFor(this);

				if (this.componentRef.YsocketManager === undefined) {

					this.YsocketManager = new this.APCmanager("", "", this.componentRef);
				} else {
					this.YsocketManager = this.componentRef.YsocketManager;
				}

				//---> add permanent listener for SOFT allocations
				this.requestedSoftAllocationsGUID = [];

				//---> set the listener for ok conversion scenario
				this.YsocketManager.addListenerPermanent({
						id1: this.contextSoftConv
					}, "ALLOCATION",
					function (APCMessage) {

						var dt = this.getModel("SOFTALLOCATIONLOGS").getData();
						var dat = new Date();

						if (Array.isArray(dt) === true) {

							dt.splice(0, 0, {
								logtime: dat.getHours() + ":" + dat.getMinutes(),
								msg: APCMessage.MESSAGE,
								msgType: APCMessage.MESSAGE_TYPE,
								icon: APCMessage.MESSAGE_ICON,
								hasextended: false
							});

							this.getModel("SOFTALLOCATIONLOGS").setData(dt);

						} else { //<--- first log

							dt = [];
							dt.splice(0, 0, {
								logtime: dat.getHours() + ":" + dat.getMinutes(),
								msg: APCMessage.MESSAGE,
								msgType: APCMessage.MESSAGE_TYPE,
								icon: APCMessage.MESSAGE_ICON,
								hasextended: false
							});

							this.getModel("SOFTALLOCATIONLOGS").setData(dt);

						}

						//--> nothing to do but refresh
						this.__internalRefreshSoft();

					}.bind(this), false); //<--- no standard toast messages

				this.YsocketManager.addListenerPermanent({
						id1: this.contextSoftConv,
						id2: "FAIL"
					}, "ALLOCATION",
					function (APCMessage) {
						//--> show error (automatic via APC)

						var dt = this.getModel("SOFTALLOCATIONLOGS").getData();
						var dat = new Date();
						var extData = APCMessage.DATASTREAM;

						var hasExtendedData;
						if (Array.isArray(APCMessage.DATASTREAM) && APCMessage.DATASTREAM.length > 0) {
							hasExtendedData = true;
						} else {
							hasExtendedData = false;
						}

						if (Array.isArray(dt) === true) {

							dt.push({
								msgType: APCMessage.MESSAGE_TYPE,
								logtime: dat.getHours() + ":" + dat.getMinutes(),
								msg: APCMessage.MESSAGE,
								icon: APCMessage.MESSAGE_ICON,
								extdata: extData,
								hasextended: hasExtendedData
							});

							this.getModel("SOFTALLOCATIONLOGS").setData(dt);

						} else { //<--- first log

							dt = [];
							dt.push({
								msgType: APCMessage.MESSAGE_TYPE,
								logtime: dat.getHours() + ":" + dat.getMinutes(),
								msg: APCMessage.MESSAGE,
								icon: APCMessage.MESSAGE_ICON,
								extdata: extData,
								hasextended: hasExtendedData
							});

							this.getModel("SOFTALLOCATIONLOGS").setData(dt);

						}

						//--> nothing to do but refresh
						this.__internalRefreshSoft();

					}.bind(this), true);
			},

			getGuid: function () {
				return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1) + (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(
					1) + (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1) + (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(
					1) + (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1) + (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(
					1) + (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
			},

			softAllocatedDataReceived: function () {
				this.byId("idSoftAllocationTables").setBusy(false);
			},

			openBy: function (evt, node, datefrom, dateto) {
				this.__internalRefreshSoft(node, datefrom, dateto);
				this._postingManagerPopover.openBy(evt.getSource());
			},

			__internalRefreshSoft: function (node, datefrom, dateto) {
				try {
					var loggedUser = this.getModel("userinfos").getData().name;

					if (node !== undefined && node !== "") {
						var nodeStr = node;
					} else {
						nodeStr = "";
					}

					if (datefrom !== undefined && datefrom !== null && datefrom !== "") {
						var dateStrFrom = this.__internalSetABAPdate(datefrom);
					} else {
						dateStrFrom = "";
					}

					if (dateto !== undefined && dateto !== null && dateto !== "") {
						var dateStrTo = this.__internalSetABAPdate(dateto);
					} else {
						dateStrTo = "";
					}

					this.byId("idSoftAllocationTables").setBusy(true);
					this.jsonModelSoft.loadData(this.getModel().sServiceUrl +
						"GET_OPEN_ATPC_SOFT(PRODUCTCODE='',FROM_DATE='" + dateStrFrom + "',TO_DATE='" + dateStrTo + "',NODE='" + nodeStr +
						"',CATEGORY='',USER='" + loggedUser.toUpperCase() + "')");

				} catch (exc) {
					//--> managed for crossalloaktion
				}
			},

			__internalSetABAPdate: function (dateObj) {
				if (dateObj === null || dateObj === undefined) {
					return "";
				} else {
					var dt1 = dateObj.getFullYear().toString() + (dateObj.getMonth() + 1).toString();
					var day = dateObj.getDate().toString();
					while (day.length < 2) {
						day = "0" + day;
					}

					return dt1 + day;
				}
			},

			clearFilterAllocations: function (evt) {
				this.byId("softAllocationTradeItem").setValue();
				this.byId("softAllocationUser").setValue();

				this.__filterSoftList();
			},

			__filterSoftList: function () {
				//--> filter values 
				var flt = new Filter({
					filters: [
						new Filter({
							path: "productcode",
							test: function (val) {

								if (this.byId("softAllocationTradeItem").getValue() === undefined) {
									return true;
								} else {
									return (val.toUpperCase().includes(this.byId("softAllocationTradeItem").getValue().toUpperCase()));
								}

							}.bind(this)
						}),
						new Filter({
							path: "productdescr",
							test: function (val) {

								if (this.byId("softAllocationTradeItem").getValue() === undefined) {
									return true;
								} else {
									return (val.toUpperCase().includes(this.byId("softAllocationTradeItem").getValue().toUpperCase()));
								}

							}.bind(this)
						}),
						new Filter({
							path: "productdescr",
							test: function (val) {

								if (this.byId("softAllocationTradeItem").getValue() === undefined) {
									return true;
								} else {
									return (val.toUpperCase().includes(this.byId("softAllocationTradeItem").getValue().toUpperCase()));
								}

							}.bind(this)
						})
					],
					and: false
				});

				this.byId("idSoftAllocationTables").getBinding("items").filter(flt);
			},

			refreshSoftClick: function (evt) {
				this.__internalRefreshSoft();
			},

			confirmAllocationSelected: function (evt) {
				this.ActConfirmAssociationMass = this.getModel().bindContext("/CONVERT_TO_ALLOCATION_MASS(...)");

				var allocationsGuids = [];

				var tb = this.byId("idSoftAllocationTables");

				tb.getItems().forEach(function (srow) {
					if (srow.data().rowselection === "X") {
						allocationsGuids.push({
							SGUID: srow.getBindingContext("SOFTALLOCATIONSLIST").getObject().sguid
						});
					}
				});

				if (allocationsGuids.length === 0) {
					return;
				}

				this.ActConfirmAssociationMass.setParameter("CONTEXT", this.contextSoftConv);
				this.ActConfirmAssociationMass.setParameter("DATA", JSON.stringify(allocationsGuids));
				this.ActConfirmAssociationMass.setParameter("DIRECT_SO_CREATION", false);
				this.ActConfirmAssociationMass.setParameter("INCOTERM", "");
				this.ActConfirmAssociationMass.setParameter("FORCE_SYNC",false);

				//---> must close the reallocation demands ?
				this.ActConfirmAssociationMass.setParameter("CLOSE_REALLOCATION_DEM", this.byId("checkboxCloseDemands").getSelected());

				//---> fire the UNBOUND action on odata V4
				this.ActConfirmAssociationMass.execute().then(function () {
					//--> nothing to do 
				}.bind(this)).catch(function (err) {

					//--> show error
					var msg = new this.FioritalMessageStrip("ERROR converting soft allocation!", {
						status: "error",
						icon: "sap-icon://message-error",
						timeout: 3000
					});

				}.bind(this));
			},

			confirmAssignation: function (evt) {
				this.byId("idSoftAllocationTables").setBusy(true);
				this.ActConfirmAssociationSingle = this.getModel().bindContext("/AtpcSoft(sguid='" + evt.getSource().getBindingContext(
						"SOFTALLOCATIONSLIST")
					.getObject()
					.sguid + "')/com.sap.gateway.default.zfioapi.v0001.CONVERT_TO_ALLOCATION(...)");

				this.ActConfirmAssociationSingle.setParameter("CONTEXT", this.contextSoftConv);

				//---> fire the UNBOUND action on odata V4
				this.ActConfirmAssociationSingle.execute().then(function () {

					//--> nothing to do 

				}.bind(this)).catch(function (err) {

					//--> show error
					var msg = new this.FioritalMessageStrip("ERROR converting soft allocation!", {
						status: "error",
						icon: "sap-icon://message-error",
						timeout: 3000
					});

					this.YsocketManager.deleteListenersByid1(this.contextSoftConv);

				}.bind(this));
			},

			__internalDeleteSoftAllocation: function (sguid, specificCallback, specificCallbackError) {

				this.ActDeleteSoftAllocation = this.getModel().bindContext("/DELETE_SOFT_ALLOCATION(...)");
				this.ActDeleteSoftAllocation.setParameter("SGUID", sguid);

				//---> fire the UNBOUND action on odata V4
				this.ActDeleteSoftAllocation.execute().then(function () {

					//--> handle delegated callback
					if (specificCallback !== undefined) {
						var bndFct = specificCallback.bind(this);
						bndFct();
					}

				}.bind(this)).catch(function (err) {

					//--> show error
					var msg = new this.FioritalMessageStrip("ERROR deleting remote soft allocation!", {
						status: "error",
						icon: "sap-icon://message-error",
						timeout: 3000
					});

					//--> handle delegated callback
					if (specificCallbackError !== undefined) {
						var bndFct = specificCallbackError.bind(this);
						bndFct();
					}

				});

			},

			deleteAssignation: function (evt) {
				//---> delete and refresh
				this.__internalDeleteSoftAllocation(evt.getSource().getBindingContext("SOFTALLOCATIONSLIST").getObject().sguid, function () {

					//--> show error
					var msg = new this.FioritalMessageStrip("assegnazione cancellata", {
						status: "info",
						icon: "sap-icon://message-error",
						timeout: 3000
					});

					//--> invalidate refresh & close
					this.__internalRefreshSoft();
				});
			},

			selectRow: function (evt) {
				if (evt.getSource().getParent().data("rowselection") === "X") {
					evt.getSource().getParent().data("rowselection", "", true);
				} else {
					evt.getSource().getParent().data("rowselection", "X", true);
				}
			},

			selectAllRow: function (evt) {
				//---> check if one row is selected
				var selected = false;
				var setFlag = "";
				this.byId("idSoftAllocationTables").getItems().forEach(function (srow) {
					if (srow.data("rowselection") === "X") {
						selected = true;
					}
				});

				if (!selected) {
					setFlag = "X";
				}

				this.byId("idSoftAllocationTables").getItems().forEach(function (srow) {
					srow.data("rowselection", setFlag, true);
				});
			},

			showExtendedText: function (evt) {
				var dt = evt.getSource().getBindingContext("SOFTALLOCATIONLOGS").getObject().extdata;
				this._bapiReturnDisplay.showBAPIret(dt);
			},

			deleteSAPlogs: function (evt) {
				this.getModel("SOFTALLOCATIONLOGS").setData([]);
			},

			onCloseButtonPress: function (evt) {
				this.fireEvent("onClose");
				this._postingManagerPopover.close();
			},

			//-----------------------------------//
			//            Formatters             //
			//-----------------------------------//

			deleteTrailZeros: function (num) {
				try {
					return num.replace(/^0+/, "");
				} catch (ex) {

				}
			},

			softListShowZDEM: function (rranode) {
				if (rranode !== "") {
					return true;
				} else {
					return false;
				}
			},

			softListShowCustomer: function (rranode) {
				if (rranode !== "") {
					return false;
				} else {
					return true;
				}
			},

			softAllocationProductcode: function (code, originalcode) {
				if (code !== originalcode) {
					return code + " <<< " + originalcode;
				} else {
					return originalcode;
				}
			},

			colorMessageType: function (msgType) {
				if (msgType === 'E') {
					return 'red';
				} else {
					return 'green';
				}
			}

		});

		return PostingManager;

	}, true);