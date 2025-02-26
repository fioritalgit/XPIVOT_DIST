/* eslint-disable sap-no-hardcoded-url */
/* eslint no-undef: 0 */
/* eslint no-console: 0 */
/* eslint sap-no-ui5base-prop: 0 */
/* eslint ui5-no-private-prop: 0 */

sap.ui.define([
	"sap/ui/base/ManagedObject"
], function (ManagedObject, FioritalMessageStrip, WS, GZIP, messageBox, JSONModel) {
	"use strict";
	return ManagedObject.extend("it.fiorital.fioritalui5lib.controls.UserTraceManager", {

		registeredEvents: [],

		metadata: {
			properties: {

			},
			events: {
				onPreEvent: {
					parameters: {
						objEvent: {
							type: "object"
						}
					}
				}
			}
		},

		constructor: function (loggerUrl, onlyObjectsWithFunctionDefinition) {

			ManagedObject.prototype.constructor.apply(this, undefined);

			this.loggerUrl = loggerUrl;
			this.onlyObjectsWithFunctionDefinition = onlyObjectsWithFunctionDefinition;

			//--> override standard UI5 fireEvent megthod to intercept all events
			sap.ui.base.EventProvider.prototype.fireEvent_old = sap.ui.base.EventProvider.prototype.fireEvent;
			sap.ui.base.EventProvider.prototype.fireEvent = function () {

				try {

					var evtName = arguments[0];
					var fctNames = [];

					if (window._UserTraceManagerLogger === true) {
						console.log(arguments);
					}

					var evts = sap.ui.base.EventProvider.prototype._ReferenceToGlobalListerners.registeredEvents;
					if (evts !== undefined) {
						var fndEvt = evts.find(function (sevt) {
							return (sevt.eventName === evtName);
						});

						if (fndEvt) {

							var firstFunctionName = undefined;
							this.mEventRegistry[arguments[0]].forEach(function (fct) {
								fctNames.push({
									functionName: fct.fFunction.name
								});

								if (firstFunctionName === undefined) {
									firstFunctionName = fct.fFunction.name;
								}
							});

							//--> get app name
							var appId = sap.ui.core.Component.getOwnerComponentFor(this).getManifest()["sap.app"].id;

							//--> has special function name tag?
							var fctionalName = '';
							if (this.data('functionalName') !== null) {
								fctionalName = this.data('functionalName');
							}

							var objEventSumData = {
								listener: fndEvt,
								functions: fctNames,
								eventName: evtName,
								appId: appId,
								functionName: firstFunctionName,
								functionalName: fctionalName,
								eventParams: arguments[1]
							};

							//--> only traced actions with custom attribute over UI object
							if (sap.ui.base.EventProvider.prototype._ReferenceToGlobalListerners.onlyObjectsWithFunctionDefinition !== true ||
								functionalName !== '') {

								//--> fire UI5 event if present
								sap.ui.base.EventProvider.prototype._ReferenceToGlobalListerners.fireEvent("onPreEvent", {
									objEvent: objEventSumData
								});

								//--> direct callBack registered in listener?
								if (objEventSumData.listener !== undefined) {
									try {
										objEventSumData.listener(objEventSumData);
									} catch (exc) {
										//--> error in callback
									}
								}

								//--> collect additional info per obejcts (raw approach)
								var callerData = {};

								var getSingleData = function (fctname, objRef, callerData) {
									
									for(var idx=0;idx<=fctname.length-1;idx++){
										if (objRef[fctname[idx]] !== undefined) {
										try {
											callerData[fctname[idx]] = objRef[fctname[idx]]();
										} catch (exc) {
											//--> no gain
										}
									}
									}
									
								};

								getSingleData(['getId','getText','getIcon','getValue'], this, callerData);
								objEventSumData.callerData = JSON.stringify(callerData);

								//--> stream events parameters (non objects)
								var evtParams = {};
								try {

									for (var key in arguments[1]) {
										if (typeof arguments[1][key] !== 'object'){
											evtParams[key] = arguments[1][key];
										}
									}

								} catch (exc) {
									//--> no gain
								}
								
								objEventSumData.eventParams = JSON.stringify(evtParams);
								
								//--> get app versione
								try{
									var mft = sap.ui.core.Component.getOwnerComponentFor(this).getManifest();
									objEventSumData.appversion = mft["sap.app"].applicationVersion.version;
								}catch(exc){
									//--> ?!
								}
								

								//--> send to logger (SAP)
								it.fiorital.fioritalui5lib.controls.UserTraceManager.prototype.callSAPlogger(objEventSumData);
							}
						}
					}

				} catch (exc) {
					//--> !?!?
				}

				return sap.ui.base.EventProvider.prototype.fireEvent_old.apply(this, arguments);
			};

		},

		attachRegisteredEvent: function (eventName, logIt, callBack) {

			var evtLog = {
				eventName: eventName,
				logIt: logIt,
				callBack: callBack
			};

			this.registeredEvents.push(evtLog);

			sap.ui.base.EventProvider.prototype._ReferenceToGlobalListerners = this;

		},

		callSAPlogger: function (obj) {

				var postObj = {
					functions: obj.functions,
					eventName: obj.eventName,
					appId: obj.appId,
					functionalName: obj.functionalName,
					functionName: obj.functionName,
					eventParams: obj.eventParams,
					callerData: obj.callerData,
					appversion: obj.appversion
				};

				//--> move to SAP
				var loggerUrl = sap.ui.base.EventProvider.prototype._ReferenceToGlobalListerners.loggerUrl;
				if (loggerUrl !== undefined && loggerUrl !== '' && obj.functionName !== '') {
					fetch(loggerUrl, {
						method: 'POST',
						cache: 'no-cache',
						headers: {
							'Content-Type': 'application/json'
						},
						body: JSON.stringify(postObj)
					});
				}

			} //<-- call SAP logger and registered callBack function

	});

}, true);