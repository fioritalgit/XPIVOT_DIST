sap.ui.define([
		"jquery.sap.global",
		"sap/ui/core/XMLComposite",
		"sap/m/MessageToast",
		"sap/m/MessageBox",
		"sap/ui/model/Filter",
		"sap/ui/model/FilterOperator",
		"sap/ui/model/json/JSONModel",
		"sap/ui/core/format/DateFormat",
		"it/fiorital/fioritalui5lib/formatter/SharedFormatter"
	],
	function (jQuery, XMLComposite, MessageToast, MessageBox, Filter, FilterOperator, jsModel, DateFormat, SharedFormatter) {
		"use strict";

		var FOManager = XMLComposite.extend("it.fiorital.fioritalui5lib.controls.FreightOrderListJson", {
			SharedFormatter: SharedFormatter,

			metadata: {
				properties: {
					title: {
						type: "string",
						defaultValue: "Freight Order List"
					},
					forceselectdate: {
						type: "boolean",
						defaultValue: true
					},
					filtersenabled: {
						type: "boolean",
						defaultValue: true
					}
				},
				events: {
					afterClose: {
						parameters: {
							chosenFO: {
								type: "object"
							}
						}
					},
					afterOpen: {
						parameters: {
							chosenFO: {
								type: "object"
							}
						}
					}

				},
				aggregations: {

				},
				defaultAggregation: "items"
			},

			_interanlAfterOpen: function (evt) {
				this.fireEvent("afterOpen", {
					evt: evt
				});
			},

			jsonRequestCompleted: function (event) {

				this.originalData = this.jsModelList.getData();

				this.originalData.value.forEach(function (sfo) {
					sfo.isStage = false;
					sfo.FreightOrderStage.forEach(function (sstage) {
						sstage.isStage = true;
					});
				});

				this.jsModelListAll.setData(this.originalData);

				if (this.getForceselectdate() === true) {
					this.jsModelList.setData(); //<--- clear 
				}

				this._FreightOrderListPopover.openBy(this.target);
			},

			handleFilterDates: function (Evt) {

				//this.byId('FreightOrderListStops').setNoDataText('Nessun freight order selezionato');

				var DP = this.byId('DP1');
				var DA = this.byId('DP2');

				var outRange = false;
				var outData = new Object({
					value: []
				});

				var data = this.originalData;

				data.value.forEach(function (sdata) {

					outRange = false;

					sdata.FreightOrderStage.forEach(function (sstage) {

						if (sstage.startstoragelocation === this.storageLocation && DP.getDateValue() !== null) {

							var DTLfrom = DP.getDateValue();

							//--> MAD: Performed strict date range check: are acceptable FO falling entirely in selected date range
							var dateStart = this._parseDateString(sstage.startnodedate + ' ' + sstage.startnodetime, "yyyy-MM-dd HH:mm:ss");
							var checkStart = dateStart.getDate().toString() + dateStart.getMonth().toString() + dateStart.getYear().toString();
							var checkStartSel = DTLfrom.getDate().toString() + DTLfrom.getMonth().toString() + DTLfrom.getYear().toString();

							if (checkStart !== checkStartSel) {
								outRange = true;
							}

						}

						if (sstage.endlocationid.replace(/^0+/, '') === this.sPartnerCode.replace(/^0+/, '') && DA.getDateValue() !== null) {

							var DTLto = DA.getDateValue();

							//--> MAD: Performed strict date range check: are acceptable FO falling entirely in selected date range
							if (sstage.endnodedate != null) {
								var dateEnd = this._parseDateString(sstage.endnodedate + ' ' + sstage.endnodetime, "yyyy-MM-dd HH:mm:ss");
								var checkEnd = dateEnd.getDate().toString() + dateEnd.getMonth().toString() + dateEnd.getYear().toString();
								var checkEndSel = DTLto.getDate().toString() + DTLto.getMonth().toString() + DTLto.getYear().toString();

								if (checkEnd !== checkEndSel) {
									outRange = true;
								}

							}
						}

					}.bind(this));

					if (outRange === false) {
						outData.value.push(sdata);
					}
				}.bind(this));

				//--> set data & refresh
				this.jsModelList.setData(outData);

			},

			clearFilters: function (evt) {

				this.byId('DP1').setDateValue();
				this.byId('DP2').setDateValue();

				if (this.getForceselectdate() === true) {
					this.jsModelList.setData();
					//this.byId('FreightOrderListStops').setNoDataText('Seleziona data partenza o arrivo');
				} else {
					this.jsModelList.setData(this.originalData);
					//this.byId('FreightOrderListStops').setNoDataText('Nessun freight order selezionato');
				}

			},

			init: function () {

				//--> super
				XMLComposite.prototype.init.apply(this, arguments);
				this._FreightOrderListStops = this.byId("FreightOrderListStops");
				this._FreightOrderListPopover = this.byId("FreightOrderListPopover");

				this.jsModelList = new jsModel;
				this.jsModelListAll = new jsModel;
				this.jsModelDefaults = new jsModel;

				var dt = new Date();
				var dtmax = new Date();
				dtmax.setDate(dt.getDate() + 15);

				this.jsModelDefaults.setData({
					dateminDRS: dt,
					datemaxDRS: dtmax
				});

				var boundCallback = this.jsonRequestCompleted.bind(this);
				this.jsModelList.attachRequestCompleted(boundCallback);

				this._FreightOrderListPopover.setModel(this.jsModelList, 'FOJSMODEL');
				this._FreightOrderListPopover.setModel(this.jsModelListAll, 'FOJSMODELALL');
				this._FreightOrderListPopover.setModel(this.jsModelDefaults, 'FODEFAULTS');

			},

			applySettings: function (mSettings, oScope) {
				//--> super
				XMLComposite.prototype.applySettings.apply(this, arguments);
			},

			openByLocation: function (evt, storageLocation, targetField, inout, explicitShowTarget, sFilterDateFrom, sFilterDateTo, sPartnerCode,sPlant, bHideDGRID, oldFo) {
				var oldFoCall = "" ;

				this.byId('DP1').setDateValue();
				this.byId('DP2').setDateValue();

				if (this.getForceselectdate() === true) {
					//this.byId('FreightOrderListStops').setNoDataText('Seleziona data partenza o arrivo');
				} else {
					//this.byId('FreightOrderListStops').setNoDataText('Nessun freight order selezionato');
				}

				this.storageLocation = storageLocation;
				this.sPartnerCode = sPartnerCode;

				if (inout === undefined) {
					this.direction = 'O';
				} else {
					this.direction = inout;
				}

				this.targetField = targetField;

				//-->if inout=O: search by storage, if empty search in all FO
				if (storageLocation == undefined || storageLocation == "") {
					storageLocation = "0000";
				} else {
					this.storageLocation = storageLocation;
				}

				if (explicitShowTarget !== undefined) {
					this.target = explicitShowTarget;
				} else {
					this.target = evt.getSource();
				}

				//-->if inout=O: search by date, if empty search in all FO
				if (sFilterDateFrom == undefined) {
					sFilterDateFrom = "00010101";
				}

				//-->if inout=O: search by date, if empty search in all FO
				if (sFilterDateTo == undefined) {
					sFilterDateTo = "99991231";
				}

				//-->if inout=O: search by shipto, if empty search in all FO
				if (sPartnerCode == undefined) {
					sPartnerCode = "0000000000";
				}

				//-->if plant is empty/undefined replace with 0000
				if (sPlant == undefined) {
					sPlant = "0000";
				}

				if (bHideDGRID === undefined) {
					bHideDGRID = 'S';
				}
				
				if (oldFo === true){
					oldFoCall = "X";
				}

				this.byId('headerSloc').setText(this.storageLocation);

				this.jsModelList.loadData(
					evt.getSource().getModel().sServiceUrl + "/FreightOrder?$expand=FreightOrderStage&$search=" + this.direction + storageLocation.padStart(
						4, ".") + sFilterDateFrom + sFilterDateTo + sPartnerCode.padStart(10, "0") + sPlant + bHideDGRID + oldFoCall
				);

			},

			openByUrl: function (sUrl, storageLocation, targetField, inout, explicitShowTarget, sFilterDateFrom, sFilterDateTo, sPartnerCode,
				sPlant, bHideDGRID) {
				if (inout === undefined) {
					this.direction = 'O';
				} else {
					this.direction = inout;
				}

				this.targetField = targetField;
				this.target = explicitShowTarget;

				//-->if inout=O: search by storage, if empty search in all FO
				if (storageLocation == undefined || storageLocation == "") {
					storageLocation = "0000";
				} else {
					this.storageLocation = storageLocation;
				}

				//-->if inout=O: search by date, if empty search in all FO
				if (sFilterDateFrom == undefined) {
					sFilterDateFrom = "00010101";
				}

				//-->if inout=O: search by date, if empty search in all FO
				if (sFilterDateTo == undefined) {
					sFilterDateTo = "99991231";
				}

				//-->if inout=O: search by shipto, if empty search in all FO
				if (sPartnerCode == undefined) {
					sPartnerCode = "0000000000";
				}

				//-->if plant is empty/undefined replace with 0000
				if (sPlant == undefined) {
					sPlant = "0000";
				}

				if (bHideDGRID === undefined) {
					bHideDGRID = 'S';
				}

				this.byId('headerSloc').setText(this.storageLocation);

				this.jsModelList.loadData(
					sUrl + "/FreightOrder?$expand=FreightOrderStage&$search=" + this.direction + storageLocation.padStart(4, ".") + sFilterDateFrom +
					sFilterDateTo + sPartnerCode.padStart(10, "0") + sPlant + bHideDGRID
				);
			},

			//-----------------------------------------------------------------------------> control EVENTS

			onFreightOrderSelect: function (evt) {
				//-->if target field is defined, set selected FO to target field
				if (this.targetField !== undefined && this.targetField !== "") {

					if (this.targetField.setText !== undefined) {
						this.targetField.setText(evt.getSource().getBindingContext('FOJSMODEL').getObject().freightorderid.replace(/^0+/, ''));
					}

					if (this.targetField.setValue !== undefined) {
						this.targetField.setValue(evt.getSource().getBindingContext('FOJSMODEL').getObject().freightorderid.replace(/^0+/, ''));
					}
				}

				//-->save FO to chosenFO parameter to get FO data from calling controller
				this.fireEvent("afterClose", {
					chosenFO: evt.getSource().getBindingContext('FOJSMODEL').getObject()
				});

				this._FreightOrderListPopover.close();
			},

			onFreightOrderAllSelect: function (evt) {

				//-->if target field is defined, set selected FO to target field
				if (this.targetField !== undefined && this.targetField !== "") {

					if (this.targetField.setText !== undefined) {
						this.targetField.setText(evt.getSource().getBindingContext('FOJSMODELALL').getObject().freightorderid.replace(/^0+/, ''));
					}

					if (this.targetField.setValue !== undefined) {
						this.targetField.setValue(evt.getSource().getBindingContext('FOJSMODELALL').getObject().freightorderid.replace(/^0+/, ''));
					}
				}

				//-->save FO to chosenFO parameter to get FO data from calling controller
				this.fireEvent("afterClose", {
					chosenFO: evt.getSource().getBindingContext('FOJSMODELALL').getObject()
				});

				this._FreightOrderListPopover.close();
			},

			_onCloseButtonPress: function (evt) {
				this._FreightOrderListPopover.close();
			},

			//-----------------------------------------------------------------------------> control formatters

			/**
			 * Parse string date respecting specific pattern.
			 * @param sDate string date to be parsed
			 * @param inputDatePattern pattern of input string date, if omitted assumed "yyyy-MM-dd"
			 * @return date value corresponding to input string, null if parse fails
			 */
			_parseDateString: function (sDate, inputDatePattern) {

				var dDate = null;

				try {

					var options = {};

					if (inputDatePattern === undefined || inputDatePattern === null || inputDatePattern === "") {
						inputDatePattern = "yyyy-MM-dd";
					}

					options = {
						pattern: inputDatePattern
					};

					var df = DateFormat.getDateInstance(options);

					dDate = df.parse(sDate);

				} catch (ex) {
					//<-- Nothing to do
				}

				return dDate;

			},

			formatMTR: function (mtr) {

				switch (mtr) {
				case 'FULLTRUCK':
					return 'Full Truck';
					break;
				case 'MFULLTRUCK':
					return 'Full Truck';
					break;
				case 'GROUPAGE':
					return 'Groupage';
					break;
				case 'MGROUPAGE':
					return 'Groupage';
					break;
				default:
					return 'altro tipo';
				}

			},

			formatMTRcolor: function (mtr) {

				switch (mtr) {
				case 'FULLTRUCK':
					return 8;
					break;
				case 'MFULLTRUCK':
					return 8;
					break;
				case 'GROUPAGE':
					return 9;
					break;
				case 'MGROUPAGE':
					return 9;
					break;
				default:
					return 9;
				}

			},

			formatMTvisible: function (mtr) {

				switch (mtr) {
				case 'FULLTRUCK':
					return true;
					break;
				case 'MFULLTRUCK':
					return true;
					break;
				default:
					return false;
				}

			},

			formatPriority: function (prio) {
				if (prio === 'X') {
					return true;
				} else {
					return false;
				}
			},

			dateLocale: function (dtString) {

				var dt = new Date(dtString);
				return dt.toLocaleDateString();

			},

			showDGRID: function (dgrid) {
				if (dgrid !== undefined && dgrid !== '') {
					return true;
				} else {
					return false;
				}
			},

			setStartLocationFlag: function (startLocation, endlocation) {

				if (this.direction === 'O') {
					if (startLocation === this.storageLocation) {
						return 'X';
					} else {
						return '';
					}
				} else {
					if (endlocation === this.storageLocation) {
						return 'X';
					} else {
						return '';
					}
				}
			},

			deleteTrailZeros: function (foId) {
				try {
					return foId.replace(/^0+(\d)|(\d)0+$/gm, '$1$2');
				} catch (ex) {

				}
			},

			isDateToday: function (sDate) {
				var dToday = new Date(),
					sToday = dToday.getFullYear() + "-" + parseInt(dToday.getMonth() + 1) + "-" + dToday.getDate();
				if (sDate === sToday) {
					return 'X';
				} else {
					return '';
				}
			}

		});

		return FOManager;

	}, true);