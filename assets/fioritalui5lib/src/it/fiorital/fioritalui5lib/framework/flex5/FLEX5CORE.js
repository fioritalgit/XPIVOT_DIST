//---> FLEX5 handler

sap.ui.define(["sap/ui/base/ManagedObject"],
	function (ManagedObect) {
		"use strict";
		return ManagedObect.extend('it.fiorital.fioritalui5lib.framework.flex5.FLEX5CORE', {
			metadata: {
				properties: {}
			},

			sStreamParams: [],
			GlobalVariables: [],
			UY5: null, //<-- reference to UY5 caller instance
			ctx: null, //<-- FLEX5 context
			ACTIVE_SYNC_MODELS: null, //<-- active models (two way per definition active for the process)
			runningAction: false, //<-- Semaphore to prevent multiple actions invocations
			autoHideBusyIndicator: true, //<-- Hide busy indicator automatically when backend calls occur

			constructor: function (UY5reference) {

				ManagedObect.call(this);

				this.GlobalVariables = [];

				//---> Initialize FLEX5 context
				this._INTERNAL_InitializeContext();
				this.UY5 = UY5reference; //<-- store caller reference

				this.FLEX5_MESSAGES = new sap.ui.model.json.JSONModel();
				this.UY5.component.setModel(this.FLEX5_MESSAGES, 'FLEX5_MESSAGES');

			},

			_INTERNAL_InitializeContext: function () {

				this.ctx = new Object();
				this.ctx.ACTIONPARAMS = [];
				this.ctx.GLOBALVARS = [];
				this.ctx.LAST_CALL_MESSAGES = [];
			},

			setUY5Reference: function (UY5ref) {
				this.UY5 = UY5ref;
			},

			addParam: function (parName, parValue) {

				//--> Store single parmeter
				var sParam = new Object();
				sParam['PARID'] = parName;
				sParam['DATA'] = parValue;
				this.sStreamParams.push(sParam);

				return this;

			},

			handle_callback: function (successCallback, failureCallback, showMsgBoxError) {

				if (this.ctx.CALLBACK !== undefined && this.ctx.CALLBACK !== '') {
					this.execute_action(this.ctx.CALLBACK, successCallback, failureCallback, showMsgBoxError);
				}

			},

			_INTERNAL_Handle_PageParametersEvent: function (TargeTpageId) {

				//---> Identify the actual view and controller
				var idStr = this.UY5.component.getId() + "---" + this.UY5.component.getMetadata().getRootView().id + "--" + this.UY5.component.getMetadata()
					.getRoutingConfig().controlId;
				var appContainer = sap.ui.getCore().byId(idStr);

				var viewId = this.UY5.component.getId() + "---" + TargeTpageId;
				this.targetView = sap.ui.getCore().byId(viewId);

				if (this.targetView !== undefined) {

					var targetViewController = this.targetView.getController();

					if (targetViewController !== undefined) {
						if (targetViewController._EVENT_PAGE_PARAMETERS !== undefined) {
							targetViewController._EVENT_PAGE_PARAMETERS(this.ctx.PAGE_PARAMETERS);
						}
					} else {
						//---> view is active but controller not ready; fire after initialization in completed
						this.targetView.attachAfterInit(function (oEvent) {
							if (this.targetView.getController()._EVENT_PAGE_PARAMETERS !== undefined) {
								this.targetView.getController()._EVENT_PAGE_PARAMETERS(this.ctx.PAGE_PARAMETERS);
							}
						}.bind(this));
					}

				} //<-- if  (targetView !== undefined) {

			},

			_INTERNAL_Expand_GlobalVariables: function () {

				this.GlobalVariables = [];
				this.ctx.GLOBALVARS.forEach(function (sgvbackend) {
					var newGV = new Object();
					newGV.PAR_NAME = sgvbackend.PAR_NAME;

					try {
						newGV.PAR_VALUE = JSON.parse(sgvbackend.PAR_VALUE);
					} catch (exc) {
						newGV.PAR_VALUE = sgvbackend.PAR_VALUE;
					}

					this.GlobalVariables.push(newGV);
				}.bind(this));

			},

			_INTERNAL_Show_FioritalMessageToast: function (toastMessage, toastType, toastDuration) {

				//---> Manage TOAST
				if (!toastDuration) {
					toastDuration = 5000;
				}
				if (toastMessage !== undefined && toastMessage !== '') {

					switch (toastType) {
					case 'S':
						it.fiorital.flex5app.controls.FioritalToast.showSuccess(toastMessage, {
							duration: toastDuration
						});
						break;
					case 'I':
						it.fiorital.flex5app.controls.FioritalToast.showInfo(toastMessage, {
							duration: toastDuration
						});
						break;
					case 'W':
						it.fiorital.flex5app.controls.FioritalToast.showWarning(toastMessage, {
							duration: toastDuration
						});
						break;
					case 'E':
						it.fiorital.flex5app.controls.FioritalToast.showError(toastMessage, {
							duration: toastDuration
						});
						break;
					}

				}

			},

			execute_action: function (actionId, successCallback, failureCallback, showMsgBoxError, showBusy) {

				//--> Skip multiple action invocations when are fired multiple events ( eg.user taps )
				if (this.runningAction) {
					return;
				}

				this.UY5.clear();

				//---> prepare the context
				this.ctx.ACTIONID = actionId;
				this.ctx.ACTIONPARAMS = []; //<-- clear and regenerate
				this.ctx.LAST_CALL_MESSAGES = []; //<-- clear lasrt call messages
				this.ctx.LAST_CALL_ERROR = '';
				this.ctx.LAST_CALL_ERROR_TEXT = '';
				this.ctx.TOAST_MESSAGE = '';
				this.ctx.TOAST_TYPE = '';
				this.ctx.PAGE_PARAMETERS = [];
				this.ctx.GLOBALVARS = [];

				this.GlobalVariables.forEach(function (GV) {
					var actpar = new Object();
					actpar.PAR_NAME = GV.PAR_NAME;
					actpar.PAR_VALUE = JSON.stringify(GV.PAR_VALUE); //<--- parameters must be stream (are managed and deserialized in process class call)
					this.ctx.GLOBALVARS.push(actpar);
				}.bind(this));

				this.sStreamParams.forEach(function (sParameter) {
					var actpar = new Object();
					actpar.PAR_NAME = sParameter.PARID;

					//--> MAD Bug fix: string vars where double quoted with stringyfy
					if ((typeof sParameter.DATA === 'string' || sParameter.DATA instanceof String)) {
						actpar.PAR_VALUE = sParameter.DATA; //<--- parameters must be stream (are managed and deserialized in process class call)
					} else {
						actpar.PAR_VALUE = JSON.stringify(sParameter.DATA); //<--- parameters must be stream (are managed and deserialized in process class call)	
					}

					this.ctx.ACTIONPARAMS.push(actpar);

				}.bind(this));

				this.UY5.clear();
				this.UY5.addParamConstant(JSON.stringify(this.ctx), "IN_CTX");

				//--> Call backend with implicit model synchronization ( not based on group ids defined in DYNM_SAP_models.xml )
				if (showBusy === undefined || showBusy) {
					sap.ui.core.BusyIndicator.show();
				}

				this.runningAction = true;

				//--> Default failure callback ( show error FioritalToast )
				if (failureCallback === undefined || failureCallback === null) {
					failureCallback = function (errorMsg, context) {

						sap.ui.core.BusyIndicator.hide();

						// Message dialog requesting user confirm.	
						if (showMsgBoxError !== null && showMsgBoxError !== undefined && showMsgBoxError === true) {
							sap.m.MessageBox.error(
								errorMsg, {
									styleClass: 'fioritalError'
								} //<-- CSS style ‘errorStyle’
							);

							//this.getView().byId("html5audio").$()[0].play();

						} else {
							//--> Show auto hiding message 
							this._INTERNAL_Show_FioritalMessageToast(errorMsg, 'E');

						}

					}.bind(this);

				}

				var failCallbackWrapper = function (errorMsg, context) {

					//--> Re-enable action listening
					this.runningAction = false;
					failureCallback(errorMsg, context);

				}.bind(this);

				this.UY5.callFunctionAutoSyncModels("EXECUTE_STEP",
					function (outJSONData) { //<-- Success callback

						this.ctx = outJSONData.OUT_CTX;

						//---> expand global variables from backend
						this._INTERNAL_Expand_GlobalVariables();

						/*
												//--> Default failure callback ( show error FioritalToast )
												if (failureCallback === undefined || failureCallback === null) {
													failureCallback = function (errorMsg, context) {

														//--> Message dialog requesting user confirm.						
														//sap.m.MessageBox.alert(
														//	errorMsg, 
														//	{ styleClass: 'fioritalError' } //<-- CSS style ‘errorStyle’
														//);
														
														sap.ui.core.BusyIndicator.hide();
														
														//--> Show auto hiding message 
														this._INTERNAL_Show_FioritalMessageToast(errorMsg, 'E');

													}.bind(this);

												}
						*/

						//--> Manage message TOAST ( auto hiding message ) when in BACKEND is set TOAST_MESSAGE context attribute
						if (this.ctx.TOAST_MESSAGE !== undefined && this.ctx.TOAST_MESSAGE !== '') {
							this._INTERNAL_Show_FioritalMessageToast(this.ctx.TOAST_MESSAGE, this.ctx.TOAST_TYPE);
						}

						//--> Manage FLEX5 errors fired on ABAP side as RAISE/RAISE EXCEPTION 
						if (
							this.ctx.LAST_CALL_ERROR === 'X' &&
							this.ctx.LAST_CALL_ERROR_TEXT !== undefined &&
							this.ctx.LAST_CALL_ERROR_TEXT !== null &&
							this.ctx.LAST_CALL_ERROR_TEXT !== ''
						) {
							failCallbackWrapper(this.ctx.LAST_CALL_ERROR_TEXT, this.ctx);
							return;
						} else {

							//--> Re-enable action listening
							this.runningAction = false;

							//---> if present propagate the success callback
							if (successCallback !== undefined) {

								//--> DEMAND HIDE after view is SHOWN ( BaseController.js )
								if (this.autoHideBusyIndicator) {
									sap.ui.core.BusyIndicator.hide();
								}
								successCallback(this.ctx.EXPORTING);

							}

						}

						//---> Page navigation
						if (this.ctx.PAGEID !== undefined && this.ctx.PAGEID !== '') {
							try {
								this.UY5.component.getRouter().navTo(this.ctx.PAGEID);
								this._INTERNAL_Handle_PageParametersEvent(this.ctx.PAGEID);
							} catch (exc) {
								//--> Re-enable action listening
								this.runningAction = false;
								sap.m.MessageBox.alert("Pagina di destinazione FLEX5 '" + this.ctx.PAGEID + "' inesistente! ");
							}
						}

					}.bind(this),
					//--> Fail callback ( network errors )
					failCallbackWrapper,
					this.ACTIVE_SYNC_MODELS);

			},

			start_process: function (process_id, processGlobalVars, successCback) {

				//--> Skip multiple action invocations when are fired multiple events ( eg.user taps )
				if (this.runningAction) {
					return;
				}

				if (processGlobalVars === null) {

					processGlobalVars = [];

				}

				this._INTERNAL_InitializeContext(); //<-- reset the context
				this.ctx.PROCESSID = process_id;

				this.ctx.ACTIONPARAMS = []; //<-- clear and regenerate
				this.ctx.LAST_CALL_MESSAGES = []; //<-- clear lasrt call messages
				this.ctx.TOAST_MESSAGE = '';
				this.ctx.TOAST_TYPE = '';
				this.ctx.PAGE_PARAMETERS = [];
				this.ctx.GLOBALVARS = processGlobalVars;

				this.UY5.clear();

				sap.ui.core.BusyIndicator.show();

				var successCallback = function (outJSONData) {

					//--> Re-enable action listening
					this.runningAction = false;

					if (this.autoHideBusyIndicator) {
						sap.ui.core.BusyIndicator.hide();
					}

					this.ctx = outJSONData.RES_CTX;

					//--> Manage FLEX5 errors fired on ABAP side as RAISE/RAISE EXCEPTION 
					if (
						this.ctx &&
						this.ctx.LAST_CALL_ERROR === 'X' &&
						this.ctx.LAST_CALL_ERROR_TEXT !== undefined &&
						this.ctx.LAST_CALL_ERROR_TEXT !== null &&
						this.ctx.LAST_CALL_ERROR_TEXT !== ''
					) {

						sap.ui.core.BusyIndicator.hide();

						//--> Show auto hiding message 
						this._INTERNAL_Show_FioritalMessageToast(this.ctx.LAST_CALL_ERROR_TEXT, 'E');

						return;

					}

					//---> expand global variables from backend
					this._INTERNAL_Expand_GlobalVariables();

					this.ACTIVE_SYNC_MODELS = outJSONData.RES_CTX.ACTIVE_SYNC_MODELS; //<--- store active sync models for process (defined server side)

					try {

						this.UY5.component.getRouter().navTo(outJSONData.RES_CTX.PAGEID);
						this._INTERNAL_Handle_PageParametersEvent(outJSONData.RES_CTX.PAGEID);

						//---> Manage messages in local JSON model
						if (outJSONData.RES_CTX.LAST_CALL_MESSAGES !== undefined) {
							this.FLEX5_MESSAGES.setData(outJSONData.RES_CTX.LAST_CALL_MESSAGES);
						}

						//--> Outer callback code defined on page controller starting the flow
						try {
							if (successCback) {

								//--> Current context available in: outJSONData.RES_CTX
								successCback(outJSONData);

							}
						} catch (ex) {
							//<-- Nothing to do
						}

					} catch (exc) {
						sap.m.MessageBox.alert("Pagina di destinazione FLEX5 '" + outJSONData.RES_CTX.PAGEID + "' inesistente! ");
					}

				};
				successCallback = successCallback.bind(this);

				//--> Default failure callback ( show error FioritalToast )
				var failureCallback = function (errorMsg, context) {

					sap.ui.core.BusyIndicator.hide();

					// Message dialog requesting user confirm.	
					var showMsgBoxError = true;
					if (showMsgBoxError === true) {

						sap.m.MessageBox.error(
							errorMsg, {
								styleClass: 'fioritalError',
								contentWidth: "90%"
							} //<-- CSS style ‘errorStyle’
						);

					} else {

						//--> Show auto hiding message 
						this._INTERNAL_Show_FioritalMessageToast(errorMsg, 'E');

					}

				}.bind(this);

				var failCallbackWrapper = function (errorMsg, context) {

					//--> Re-enable action listening
					this.runningAction = false;
					failureCallback(errorMsg, context);

				}.bind(this);

				this.UY5.addParamConstant(JSON.stringify(this.ctx), "START_CTX");
				this.UY5.callFunction("START_PROCESS", successCallback,

					failCallbackWrapper,

					"");

			},

			clearParameters: function () {
				this.clear();
				return this;
			},

			clear: function () {
				this.sStreamParams = [];
				return this;
			},

			addGlobalVariable: function (varName, varValue) {
				var newGV = new Object();
				newGV.PAR_NAME = varName;
				newGV.PAR_VALUE = varValue;
				this.GlobalVariables.push(newGV);
			},

			removeGlobalVariable: function (varName) {
				this.GlobalVariables = this.GlobalVariables.filter(function (sObj, index, myar) {
					if (sObj.PAR_NAME !== varName) {
						return sObj;
					}
				});
			},

			getGlobalVariable: function (varName) {

				this.GlobalVariables.forEach(function (sgv) {
					if (sgv.PAR_NAME === varName) {
						return sgv.PAR_VALUE;
					}
				});

			},

			clearGlovalVariables: function () {
				this.GLOBALVARS = [];
			},

			getActualProcessId: function () {
				return this.ctx.PROCESSID;
			},

			getActualActionId: function () {
				return this.ctx.ACTIONID;
			}

		});
	});