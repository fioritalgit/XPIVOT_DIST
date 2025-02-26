/* eslint-disable sap-no-hardcoded-url,no-console,sap-no-ui5base-prop*/
/* eslint no-undef: 0 */
/*eslint-disable */
sap.ui.define([
		"jquery.sap.global",
		"sap/ui/core/XMLComposite",
		"sap/m/MessageToast",
		"sap/m/MessageBox",
		"sap/ui/model/Filter",
		"sap/ui/model/FilterOperator",
		"sap/ui/model/json/JSONModel",
		"it/fiorital/fioritalui5lib/formatter/SharedFormatter",
		"sap/base/Log",
		"it/fiorital/fioritalui5lib/libs/html2canvas",
		"it/fiorital/fioritalui5lib/controls/FioritalMessageStrip"
	],
	function (jQuery, XMLComposite, MessageToast, MessageBox, Filter, FilterOperator, jsModel, SharedFormatter, Log, html2canvas,
		messageStrip) {
		"use strict";

		return XMLComposite.extend("it.fiorital.fioritalui5lib.controls.YBUGManager", {
			html2canvas: html2canvas,
			metadata: {
				properties: {

				},
				events: {
					logsent: {
						parameters: {
							trasmissionok: {
								type: "boolean"
							}
						}
					}
				}
			},

			messageStrip: messageStrip,
			messageBox: MessageBox,

			oninit: function () {},

			constructor: function () {
				XMLComposite.prototype.constructor.apply(this, arguments);

				sap.YBUGinstance = this;

				this.globalDumpData = new Object();

				this.modelDump = new Object();
				this.modelDump.mainModelContext = [];
				this.modelDump.UY5ModelContext = [];
				this.modelDump.otherModelContext = [];
				this.modelDump.networkDumps = [];
				
				
				this.globalDumpData.issueType = this.byId('cbReqId').setSelectedKey(undefined);
				this.globalDumpData.appFunz = this.byId('cbFuncId').setSelectedKey(undefined);
				this.globalDumpData.issueType = this.byId('cbReqId').setValue(undefined);
				this.globalDumpData.appFunz = this.byId('cbFuncId').setValue(undefined);

				var issuetype = new sap.ui.model.json.JSONModel();
				this.byId('cbReqId').setModel(issuetype, 'ISSUETYPE');

				var appfunz = new sap.ui.model.json.JSONModel();
				this.byId('cbFuncId').setModel(appfunz, 'APPFUNZ');

				//--> must override standard logs functions

				//--> log
				this.defaultLog = console.log.bind(console);
				this.logs = [];
				console.log = function () {
					// default &  console.log()
					this.defaultLog.apply(console, arguments);
					// new & array data
					this.logs.push(Array.from(arguments));
				}.bind(this);

				//--> error
				this.defaultError = console.error.bind(console);
				this.errors = [];
				console.error = function () {
					// default &  console.error()
					this.defaultError.apply(console, arguments);
					// new & array data
					this.errors.push(Array.from(arguments));
				}.bind(this);

				//--> warn
				this.defaultWarn = console.warn.bind(console);
				this.warns = [];
				console.warn = function () {
					// default &  console.warn()
					this.defaultWarn.apply(console, arguments);
					// new & array data
					this.warns.push(Array.from(arguments));
				}.bind(this);

				//--> debug
				this.defaultDebug = console.debug.bind(console);
				this.debugs = [];
				console.debug = function () {
					// default &  console.debug()
					this.defaultDebug.apply(console, arguments);
					// new & array data
					this.debugs.push(Array.from(arguments));
				}.bind(this);

			},

			__internalDump_JSONmodel: function (jsonModel) {
				var mdlDump = new Object();
				mdlDump.jsonData = jsonModel.getData();

				return mdlDump;
			},

			__internalDump_OdataModel: function (odataModel, store) {

				odataModel.getAllBindings().forEach(function (sBinding) {

					if (sBinding.getCurrentContexts !== undefined) {
						var mdlDump = new Object();
						mdlDump.path = sBinding.getPath();
						mdlDump.groupId = sBinding.getGroupId();
						mdlDump.contexts = [];

						//--> now dump all contexts id not suspended
						if (sBinding.isSuspended() === false) {
							try {
								sBinding.getCurrentContexts(0).forEach(function (sContext) {
									mdlDump.contexts.push(sContext.getObject());
								}.bind(this));
							} catch (exc) {
								//--> !?!
							}
						}

						store.push(mdlDump);
						return mdlDump;
					}

				}.bind(this));

			},

			__internalDumpUY5Models: function () {

				if (sap.UY5globalReference !== undefined) {

					sap.UY5globalReference.SyncModels.forEach(function (sUY5model) {

						var mdlDumpUY5 = new Object();
						mdlDumpUY5.name = sUY5model.NAME;
						mdlDumpUY5.type = sUY5model.TYPE;
						mdlDumpUY5.mode = sUY5model.MODE;
						mdlDumpUY5.syncGroups = sUY5model.SYNCGROUPS;
						mdlDumpUY5.jsonData = sUY5model.JSMODEL.getData();

						this.modelDump.UY5ModelContext.push(mdlDumpUY5);

					}.bind(this));

				}

			},

			openBug: function () {
				this.createGlobalDumpData(false);

			},

			createGlobalDumpData: function (takeScreenShoot) {

				this.byId('titleId').setValue();
				this.byId('descrId').setValue();
				this.byId('roiDefId').setValue();
				this.byId('roiMId').setValue();

				sap.ui.core.BusyIndicator.show(0);

				//--> dump models
				this.getModelsData();

				//--> compose the master object
				this.globalDumpData.modelsdump = this.modelDump;
				this.globalDumpData.logs = new Object();
				this.globalDumpData.logs.error = this.errors;
				this.globalDumpData.logs.warns = this.warns;
				this.globalDumpData.logs.logs = this.logs;
				this.globalDumpData.screenshoot = '';
				this.globalDumpData.sap_emergenze = false;

				//--> take the screenshoot ?
				if (takeScreenShoot) {
					window.html2canvas(document.body).then(function (canvas) {

						sap.ui.core.BusyIndicator.hide();

						//--> take PNG base64
						this.globalDumpData.screenshoot = canvas.toDataURL().split('data:image/png;base64,')[1];
						this._getIssueMandatoryData();

					}.bind(this));

				} else {
					this._getIssueMandatoryData();
					sap.ui.core.BusyIndicator.hide();
				}

			},

			_getIssueMandatoryData: function () {
				var getData = new Object();

				getData.reqType = 'META';

				$.ajax({
					url: '/fiorital/zjira/meta',
					type: 'get',
					contentType: "application/json",
					success: function (data) {

						var meta = JSON.parse(data);

						this.byId('cbReqId').getModel("ISSUETYPE").setData(meta.issueType);
						
						this.byId('cbFuncId').getModel("APPFUNZ").setData(meta.appFunz);

						sap.ui.core.BusyIndicator.hide();

						this.byId('YBUGdialog').open();

					}.bind(this),
					error: function (jqXHR, textStatus, errorThrown) {

						sap.ui.core.BusyIndicator.hide();

						//--> notify the user
						new this.messageStrip('Retriving data FAILED', {
							status: 'error',
							icon: 'sap-icon://message-error',
							timeout: 8000
						});

						//--> manage event
						this.fireEvent("logsent", {
							trasmissionok: false
						});

						this.byId('YBUGdialog').close();

					}.bind(this)
				});
			},

			__InternalSendJiraLog: function () {

				this.globalDumpData.modelsdump = JSON.stringify(this.globalDumpData.modelsdump);
				this.globalDumpData.error = JSON.stringify(this.globalDumpData.logs.error);
				this.globalDumpData.warns = JSON.stringify(this.globalDumpData.logs.warns);
				this.globalDumpData.logs = JSON.stringify(this.globalDumpData.logs.logs);

				sap.ui.core.BusyIndicator.show(0);

				$.ajax({
					url: '/fiorital/zjira',
					type: 'post',
					//dataType: 'json',
					//contentType: 'application/json',
					processData: false,
					contentType: false,
					success: function (data) {

						sap.ui.core.BusyIndicator.hide();

						//--> notify the user
						new this.messageStrip('Bug trasmission ok', {
							status: 'info',
							icon: 'sap-icon://notification',
							timeout: 8000
						});

						//--> manage eventù
						this.fireEvent("logsent", {
							trasmissionok: true
						});

						this.byId('YBUGdialog').close();

					}.bind(this),
					error: function (jqXHR, textStatus, errorThrown) {

						sap.ui.core.BusyIndicator.hide();

						//--> notify the user
						new this.messageStrip('Bug trasmission FAILED', {
							status: 'error',
							icon: 'sap-icon://message-error',
							timeout: 8000
						});

						//--> manage event
						this.fireEvent("logsent", {
							trasmissionok: false
						});

						this.byId('YBUGdialog').close();

					}.bind(this),
					data: JSON.stringify(this.globalDumpData)
				});

			},

			//---> get all model data
			getModelsData: function () {

				//--> clear previous
				this.modelDump.mainModelContext = [];
				this.modelDump.UY5ModelContext = [];
				this.modelDump.otherModelContext = [];

				//--> dump main model
				this.__internalDump_OdataModel(this.getModel(), this.modelDump.mainModelContext);

				//--> dump UY5 models
				this.__internalDumpUY5Models();

				var that = this;

				$('.sapUiXMLView').each(function (sitem) {

					var id = $(this).attr('id');
					var viewControl = sap.ui.getCore().byId(id);

					for (var key in viewControl.oModels) {

						//--> additional JsonModel
						if (viewControl.oModels[key].getMetadata().getName() === 'sap.ui.model.odata.v4.ODataModel') {
							var mdlDump = that.__internalDump_OdataModel(viewControl.oModels[key], that.modelDump.otherModelContext);
							mdlDump.name = key;
						}

						//--> additional odata model
						if (viewControl.oModels[key].getMetadata().getName() === 'sap.ui.model.json.JSONModel') {
							var mdlDumpJS = that.__internalDump_JSONmodel(viewControl.oModels[key], that.modelDump.otherModelContext);
							mdlDumpJS.name = key;
						}
					}

				}); //<-- search models in every view

			},

			addAjaxError: function () {

			},

			exitBug: function () {
				this.byId('YBUGdialog').close();
			},

			sendBug: function () {
				this.globalDumpData.title = this.byId('titleId').getValue();
				this.globalDumpData.descr = this.byId('descrId').getValue();
				this.globalDumpData.roiDef = this.byId('roiDefId').getValue();
				this.globalDumpData.roi = this.byId('roiMId').getValue();
				this.globalDumpData.sapEmergenze = this.byId('switchEmergencyId').getState();
				this.globalDumpData.issueType = this.byId('cbReqId').getSelectedKey();
				this.globalDumpData.appFunz = this.byId('cbFuncId').getSelectedKey();
				this.__InternalSendJiraLog();
			},
			onChangeSwitchEmrgenze: function () {
				if (this.byId('roiVBoxid').getVisible() === true) {
					this.byId('roiVBoxid').setVisible(false);
					this.byId('infoHBoxId').setVisible(false);
					this.byId('YBUGdialog').setProperty("contentHeight", "40em");
				} else {
					this.byId('roiVBoxid').setVisible(true);
					this.byId('infoHBoxId').setVisible(true);
					this.byId('YBUGdialog').setProperty("contentHeight", "50em");
				}
			}

		});

	}, true);