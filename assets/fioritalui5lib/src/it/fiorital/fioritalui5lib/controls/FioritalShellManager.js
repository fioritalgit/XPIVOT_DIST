/* eslint-disable sap-no-hardcoded-url */
/* eslint no-undef: 0 */
/* eslint no-console: 0 */
/* eslint sap-no-ui5base-prop: 0 */
/* eslint ui5-no-private-prop: 0 */
/* eslint sap-no-localstorage: 0 */
/* eslint-disable */
sap.ui.define([
	"sap/ui/base/ManagedObject",
	"sap/ui/model/json/JSONModel",
	"sap/m/Dialog",
	"sap/m/List",
	"sap/m/StandardListItem",
	"sap/m/ScrollContainer",
	"sap/ui/util/Storage",
	"sap/base/Log",
	"sap/m/VBox",
	"it/fiorital/fioritalui5lib/controls/FioritalIconTabFilter",
	"sap/m/ActionSheet",
	"it/fiorital/fioritalui5lib/controls/FioritalMessageStrip",
], function (ManagedObject, JSONModel, dialog, list, listitem, scrollcontainer, storage, log, VBox, FioritalIconTabFilter, ActionSheet,
	FioritalMessageStrip) {
	"use strict";
	return ManagedObject.extend("it.fiorital.fioritalui5lib.controls.FioritalShellManager", {

		dialog: dialog,
		JSONModel: JSONModel,
		list: list,
		listitem: listitem,
		scrollcontainer: scrollcontainer,
		storage: storage,
		Log: log,
		VBox: VBox,
		FioritalIconTabFilter: FioritalIconTabFilter,
		ActionSheet: ActionSheet,
		FioritalMessageStrip: FioritalMessageStrip,

		FSMprefix: '_FSF_',

		registeredApps: [],

		metadata: {
			properties: {

			},
			events: {
				onSubAppEvent: {
					parameters: {
						appId: {
							type: "string"
						},
						eventId: {
							type: "string"
						},
						eventData: {
							type: "object"
						}
					}
				},
				onSubAppPushEvent: {
					parameters: {
						appId: {
							type: "string"
						},
						eventId: {
							type: "string"
						},
						eventData: {
							type: "object"
						}
					}
				},
				onNavigateRequest: {
					parameters: {
						targetObject: {
							type: "object"
						}
					}
				}
			}
		},

		constructor: function (mode, componentController, capacities, debugMode, delayedReady, Containers, navigationHandler) { //<--- master, slave

			ManagedObject.prototype.constructor.apply(this, undefined);

			sap.ui.getCore().FSM = this; //<-- store in global SAP namespace

			window.FSMprefix = this.FSMprefix;
			window.FSM_UI5_STORAGE = this.storage;
			window.FSM_uuidv4 = this.uuidv4;
			window.FSM_internalGetViev = this.__internalGetViev;

			this.Containers = Containers;

			this.componentController = componentController; //<-- store to manager dialog
			this.componentController.FSManager = this; //<-- install myself in component
			this.mode = mode;

			//--> setup navigation handler
			if (navigationHandler !== undefined) {
				this.attachEvent('onNavigateRequest', navigationHandler.bind(componentController));
			}

			if (capacities !== undefined) {
				this.capacities = capacities;
			} else {
				this.capacities = []; //<-- app has no capacities
			}

			//--> get URL parameters
			var searchParams = new URLSearchParams(window.location.search);

			//--> if in slave mode activate only if URL parameter is present!
			if (mode === 'slave') {
				if (searchParams.has('fsm_app_id')) {

					this.slaveAppId = searchParams.get('fsm_app_id');
					window.FSM_SLAVE_APP_ID = this.slaveAppId;

					//--> send back the event to the master app
					this.storage.put(this.__GenerateStorageKey(), {
						eventType: 'REGISTRATION',
						appId: this.slaveAppId,
						objectHandlingCapacity: this.capacities
					});

					//--> send back direct ready event
					if (delayedReady === undefined || delayedReady === false) {
						this.storage.put(this.__GenerateStorageKey(), {
							eventType: 'APP_READY',
							appId: this.slaveAppId
						});

						this.appReady = true;
					}

					//---> manage open request
					if (searchParams.has('fsm_open_request')) {
						var openObject = JSON.parse(atob(searchParams.get('fsm_open_request')));

						this.fireEvent('onNavigateRequest', {
							navigationRequest: openObject
						});

					}

					//--> override standard UI5 fireEvent megthod to intercept click events for dynamic navigation
					sap.ui.base.EventProvider.prototype.fireEvent_old_shell = sap.ui.base.EventProvider.prototype.fireEvent;
					sap.ui.base.EventProvider.prototype.fireEvent = function () {

						if (window.FSM_slaveActive === true) {

							try {

								var evtName = arguments[0];
								var fctNames = [];

								if (window._UserTraceManagerLogger === true) {
									console.log(arguments);
								}

								//--> activate only with alt key
								var managed = false;
								if (evtName === 'click' || evtName === 'press') {

									//--> actual object support data forwarding? (remove sub icons / img)
									var simpleId = this.getId().replace(/-icon$/, "").replace(/-img$/, "");
									var objToCheck = sap.ui.getCore().byId(simpleId);

									if (objToCheck.data('FSM_EVENT_DATA') !== undefined && objToCheck.data('FSM_EVENT_DATA') !== null) {

										var objId = undefined;

										try {

											//--> first send master event (to global navigation history)
											var dte = objToCheck.data('FSM_EVENT_DATA');
											if (dte.CUSTOM_FUNCTION !== undefined && dte.CUSTOM_FUNCTION !== '') {

												//--> remove . if present
												if (dte.CUSTOM_FUNCTION[0] === '.') {
													dte.CUSTOM_FUNCTION = dte.CUSTOM_FUNCTION.substring(1);
												}

												//--> search for parent view to get the controller
												var ownerView = window.FSM_internalGetViev(this);

												//--> found view; get function and run it!
												if (ownerView !== undefined) {
													if (ownerView.getController()[dte.CUSTOM_FUNCTION] !== undefined) {
														var cFct = ownerView.getController()[dte.CUSTOM_FUNCTION].bind(ownerView.getController());
														objId = cFct(dte);
													}
												}

											} else if (dte.OTHER_FIELD_ID !== undefined) {

												//--> mode 1 take from other field getter OTHER_FIELD_PROPERTY
												var ocid = $('[id$=' + dte.OTHER_FIELD_ID + ']').attr('id');
												objId = sap.ui.getCore().byId(ocid).getProperty(dte.OTHER_FIELD_PROPERTY);

											} else if (dte.EVENT_PROPERTY !== undefined) {

												//--> get from event parameters (direct or indirect)
												var objProp = arguments[1][dte.EVENT_PROPERTY];
												if (dte.EVENT_SUB_PROPERTY !== undefined) {

													//--> get property
													objId = arguments[1][dte.EVENT_PROPERTY][getter].getProperty(dte.EVENT_SUB_PROPERTY);

												} else {
													objId = arguments[1][dte.EVENT_PROPERTY];
												}

											} else {

												//--> get from my context
												if (dte.CONTEXT_MODEL === '' || dte.CONTEXT_MODEL === undefined) {
													var ctx = this.getBindingContext();
												} else {
													var ctx = this.getBindingContext(dte.CONTEXT_MODEL);
												}

												if (ctx !== undefined) {
													objId = ctx.getObject()[dte.CONTEXT_FIELD];
												}

											}

										} catch (exc) {
											//--> ?!?
										}

										//--> got the objId? send the event to ShellManager master
										if (objId !== undefined) {

											//--> get extra data if present
											var extraData = [];
											if (dte.EXTRA_DATA !== undefined && Array.isArray(dte.EXTRA_DATA)) {
												for (var idx = 0; idx < dte.EXTRA_DATA.length; idx++) {

													var extraObj = undefined;

													if (dte.EXTRA_DATA[idx].DIRECT_VALUE !== undefined) {
														extraObj = dte.EXTRA_DATA[idx].DIRECT_VALUE;
													} else if (dte.EXTRA_DATA[idx].OTHER_FIELD_ID !== undefined) {

														//--> mode 1 take from other field getter OTHER_FIELD_PROPERTY
														var ocid = $('[id$=' + dte.EXTRA_DATA[idx].OTHER_FIELD_ID + ']').attr('id');
														extraObj = sap.ui.getCore().byId(ocid).getProperty(dte.EXTRA_DATA[idx].OTHER_FIELD_PROPERTY);

													} else if (dte.EXTRA_DATA[idx].EVENT_PROPERTY !== undefined) {

														//--> get from event parameters (direct or indirect)
														var objProp = arguments[1][dte.EXTRA_DATA[idx].EVENT_PROPERTY];
														if (dte.EXTRA_DATA[idx].EVENT_SUB_PROPERTY !== undefined) {

															//--> get property
															extraObj = arguments[1][dte.EXTRA_DATA[idx].EVENT_PROPERTY][getter].getProperty(dte.EXTRA_DATA[idx].EVENT_SUB_PROPERTY);

														} else {
															extraObj = arguments[1][dte.EXTRA_DATA[idx].EVENT_PROPERTY];
														}

													} else {

														//--> get from my context
														if (dte.EXTRA_DATA[idx].CONTEXT_MODEL === '' || dte.EXTRA_DATA[idx].CONTEXT_MODEL === undefined) {
															var ctx = this.getBindingContext();
														} else {
															var ctx = this.getBindingContext(dte.EXTRA_DATA[idx].CONTEXT_MODEL);
														}

														if (ctx !== undefined) {
															extraObj = ctx.getObject()[dte.EXTRA_DATA[idx].CONTEXT_FIELD];
														}

													}

													if (extraObj !== undefined) {
														var xd = {
															dataValue: extraObj,
															dataId: dte.EXTRA_DATA[idx].PARAM_ID
														}

														extraData.push(xd);
													}

												} //<-- loop over all extra data
											}

											var SID = window.FSMprefix + '_' + window.FSM_uuidv4();
											var appType = sap.ui.core.Component.getOwnerComponentFor(this).getManifest()["sap.app"].id;

											//--> shell navigation enabled?
											var shellNav = false;
											if (dte.SHELL_NAVIGATION_ENABLED === true) {
												shellNav = true;
											}

											//--> send back the event to the master app
											window.FSM_UI5_STORAGE.put(SID, {
												eventType: 'OBJECT_NOTIFICATION',
												appId: window.FSM_SLAVE_APP_ID,
												appType: appType,
												objId: objId,
												objClass: dte.OBJECT_CLASS,
												objExtraData: extraData,
												shellNavigationEnabled: shellNav
											});

										}

										//--> dynamic navigation popover 
										if (window.event.altKey && shellNav === true) {

											managed = true;

											//--> already have the injected action?
											var fnd = this.getDependents().find(function (sdep) {
												return (sdep.data('FSM_ACTION_POPOVER') === true);
											});

											if (fnd) {

												//--> action popover exists!
												fnd.openBy(objToCheck);

											} else {

												var appType = sap.ui.core.Component.getOwnerComponentFor(this).getManifest()["sap.app"].id;

												var baseObjNav = {
													objId: objId,
													appId: window.FSM_SLAVE_APP_ID,
													objClass: dte.OBJECT_CLASS,
													appType: appType
												};

												//--> add dynamic action popover (first level)
												var as = new sap.m.ActionSheet({
													placement: 'Auto'
												});

												var asSecondLevel = new sap.m.ActionSheet({
													placement: 'Auto'
												});

												//--> in second level add navigation capacities of current app
												if (dte.CUSTOM_NAVIGATIONS_FUNCTION !== undefined) {

													//--> remove . if present
													if (dte.CUSTOM_NAVIGATIONS_FUNCTION[0] === '.') {
														dte.CUSTOM_NAVIGATIONS_FUNCTION = dte.CUSTOM_NAVIGATIONS_FUNCTION.substring(1);
													}

													//--> search for parent view to get the controller
													var ownerView = window.FSM_internalGetViev(this);

													//--> found view; get function and run it!
													if (ownerView !== undefined) {
														if (ownerView.getController()[dte.CUSTOM_FUNCTION] !== undefined) {
															var cFctNavs = ownerView.getController()[dte.CUSTOM_NAVIGATIONS_FUNCTION].bind(ownerView.getController());
															dte.NAVIGATIONS = cFctNavs(dte, objToCheck);
														}
													}

												}

												var cntNavs = 0;
												if (dte.NAVIGATIONS !== undefined && Array.isArray(dte.NAVIGATIONS)) {

													for (var idx = 0; idx < dte.NAVIGATIONS.length; idx++) {

														//--> hase custom navigation function?
														if (dte.NAVIGATIONS[idx].NAVIGATION_CUSTOM_FUNCTION !== undefined) {

															//--> remove . if present
															if (dte.NAVIGATIONS[idx].NAVIGATION_CUSTOM_FUNCTION[0] === '.') {
																dte.NAVIGATIONS[idx].NAVIGATION_CUSTOM_FUNCTION = dte.NAVIGATIONS[idx].NAVIGATION_CUSTOM_FUNCTION.substring(1);
															}

															//--> search for parent view to get the controller
															var ownerView = window.FSM_internalGetViev(this);

															//--> found view; get function and run it!
															if (ownerView !== undefined) {
																if (ownerView.getController()[dte.NAVIGATIONS[idx].NAVIGATION_CUSTOM_FUNCTION] !== undefined) {
																	var cFctNav = ownerView.getController()[dte.NAVIGATIONS[idx].NAVIGATION_CUSTOM_FUNCTION].bind(ownerView.getController());
																	cFctNav(dte.NAVIGATIONS[idx], objToCheck);
																}
															}

														}

														cntNavs = cntNavs + 1;

														var btnSecond = new sap.m.Button({
															text: dte.NAVIGATIONS[idx].NAVIGATION_TEXT,
															icon: dte.NAVIGATIONS[idx].NAVIGATION_ICON,
															press: function (evt) {

																var dt = evt.getSource().data('FSM_NAV_DATA');
																var nd = evt.getSource().data('NAVIGATION_DATA');
																var targetContainer = evt.getSource().getParent().data('SELECTED_TARGET_CONTAINER');

																var SID = window.FSMprefix + '_' + window.FSM_uuidv4();

																window.FSM_UI5_STORAGE.put(SID, {
																	eventType: 'NAVIGATION_REQUEST',

																	targetContainer: targetContainer.container,
																	targetIcontabbar: targetContainer.icontabbar,
																	targetAppType: nd.NAVIGATION_APP,
																	targetNavType: nd.NAVIGATION_TYPE,
																	targetNavData: nd.NAVIGATION_DATA,
																	targetCustomType: nd.NAVIGATION_CUSTOM_TYPE,
																	targetNavText: nd.NAVIGATION_TEXT,
																	navigationId: nd.NAVIGATION_ID,

																	navMode: 'NEW',
																	sourceObjClass: dt.objClass,
																	sourceAppId: window.FSM_SLAVE_APP_ID,
																	sourceObjId: dt.objId,
																	sourceAppType: dt.appType
																});

																var ms = new it.fiorital.fioritalui5lib.controls.FioritalMessageStrip('navigazione avviata', {
																	status: 'info',
																	icon: 'sap-icon://map-2',
																	timeout: 3000
																});

															}.bind(objToCheck)

														});

														btnSecond.data('FSM_NAV_DATA', baseObjNav);
														btnSecond.data('NAVIGATION_DATA', dte.NAVIGATIONS[idx]);
														asSecondLevel.addButton(btnSecond);
													}

												} //<-- navigations specified ??

												//--> buttons for every container of master app
												if (cntNavs > 0) {

													for (var idx = 0; idx < window.FSM_Containers.length; idx++) {

														var btn = new sap.m.Button({
															text: window.FSM_Containers[idx].text,
															icon: 'sap-icon://business-objects-mobile',
															press: function (evt) {

																//--> propagate target container
																evt.getSource().data('FSM_ACTION_POPOVER_SL').data('SELECTED_TARGET_CONTAINER', evt.getSource().data(
																	'SELECTED_TARGET_CONTAINER'));
																evt.getSource().data('FSM_ACTION_POPOVER_SL').openBy(evt.getSource().data('FSM_ORIGINAL_ELEMENT'));

															}.bind(objToCheck)

														});

														btn.data('FSM_ACTION_POPOVER_SL', asSecondLevel);
														btn.data('FSM_ORIGINAL_ELEMENT', this);
														btn.data('SELECTED_TARGET_CONTAINER', window.FSM_Containers[idx]);

														as.addButton(btn);

													}

												} //<-- add navigations areas button only if navs are present

												as.data('FSM_ACTION_POPOVER', true);
												objToCheck.addDependent(as); //<-- add action popover
												objToCheck.addDependent(asSecondLevel); //<-- add action popover 2°level

												as.openBy(objToCheck);

											}

										} else if (window.event.altKey) { //<--- only cache; toast!

											var ms = new it.fiorital.fioritalui5lib.controls.FioritalMessageStrip('navigazione aggiunta in cache', {
												status: 'info',
												icon: 'sap-icon://co',
												timeout: 3000
											});

										}

									} //<-- filed is marked for dynamic navigation

								}

								if (managed === false) {
									//--> manage stadard event
									return sap.ui.base.EventProvider.prototype.fireEvent_old_shell.apply(this, arguments);
								}

							} catch (exc) {
								//--> manage stadard event
								return sap.ui.base.EventProvider.prototype.fireEvent_old_shell.apply(this, arguments);
							}

						} else {

							//--> manage stadard event
							return sap.ui.base.EventProvider.prototype.fireEvent_old_shell.apply(this, arguments);
						}

					};

				} else {
					return; //<-- direct run; no fun
				}
			}

			//--> dubug mode
			if (debugMode !== undefined) {
				this.debugMode = debugMode;
			} else {

				//---> get from URL
				if (searchParams.has('FSM_DEBUG')) {
					var urlDebug = searchParams.get('FSM_DEBUG');
					if (urlDebug === 'X') {
						this.debugMode = true;
					}
				} else {
					this.debugMode = false;
				}

			}

			this.registeredApps = [];

			//--> global object cache
			if (mode === 'master') {
				this._loadGlobalCache(componentController);
			}

			//--> dubug facility (dialog)
			this.eventsJson = new this.JSONModel();
			this.eventsJson.setData([]); //<-- default empty array
			this.dialog = new this.dialog({
				title: 'ShellManager event tracer',
				contentWidth: '40em',
				contentHeight: '20em'
			});
			var scrollCont = new this.scrollcontainer({
				vertical: true,
				horizontal: false,
				height: '100%',
				width: '100%'
			});
			var eventList = new this.list();

			var listTemplate = new this.listitem({
				icon: 'sap-icon://chevron-phase',
				title: {
					path: 'FSM_EVENTS>eventText'
				}
			});

			eventList.setModel(this.eventsJson, 'FSM_EVENTS');
			eventList.bindAggregation('items', {
				model: 'FSM_EVENTS',
				path: '/',
				template: listTemplate
			});

			scrollCont.addContent(eventList);
			this.dialog.addContent(scrollCont);

			this.componentController.getRootControl().addDependent(this.dialog); //<-- add dialog to dependencies

			//--> install intra app event 
			window.addEventListener('storage', this.__internalStorageEvent.bind(this));

			this.FSMready = true;

		},

		_loadGlobalCache: function (componentController) {

			//--> create json models
			this.globalCacheModel = new this.JSONModel();
			this.globalDocsModel = new this.JSONModel();
			

			//--> load hisory
			fetch('/fiorital/zfsm_user_data', {
				headers: {
					'type': 'HISTORY'
				}
			}).then(function (res) {

				if (res.status == 200) {
					res.text().then(function (data) {
						if (data !== '') {
							var globalCache = JSON.parse(atob(data));
							this.globalCacheModel.setData(globalCache);
							componentController.setModel(this.globalCacheModel, 'FSM_GLOBAL_CACHE');
						}
					}.bind(this));
				}
			}.bind(this));
			
			
			//--> load docs
			fetch('/fiorital/zfsm_user_data', {
				headers: {
					'type': 'CUSTOM_DOCS'
				}
			}).then(function (res) {

				if (res.status == 200) {
					res.text().then(function (data) {
						if (data !== '') {
							var globalCacheDocs = JSON.parse(atob(data));
							this.globalDocsModel.setData(globalCacheDocs);
							componentController.setModel(this.globalDocsModel, 'FSM_GLOBAL_DOCS');
						}
					}.bind(this));
				}
			}.bind(this));			

		},

		getAppByTypeAndContainer: function (appId, containerElement) {

			return this.registeredApps.find(function (sapp) {
				return (sapp.appType === appId && sapp.containerElement === containerElement);
			});

		},

		setAsAppReady: function () {

			if (this.FSMready !== true) {
				return;
			}

			if (this.appReady !== true && this.mode === 'slave') {

				this.storage.put(this.__GenerateStorageKey(), {
					eventType: 'APP_READY',
					appId: this.slaveAppId
				});

				this.appReady = true;

			}

		},

		__InternalOpenSlave: function (appId, slaveAppId, finalUrl, containerElement, iconTabBar, existingSlaveAppId, title, noWaitOverlay) {

			var slaveAppIframe = new sap.ui.core.HTML({ //<--- start with zero height to allow wait
				preferDOM: true,
				content: "<iframe height='100%' width='100%' frameBorder='0' id='" + slaveAppId + "' src='" + finalUrl +
					"'></iframe>"
			});

			//--> store the base app data: data will be completed by return event 
			var newAppObject = {
				appId: slaveAppId,
				appType: appId,
				iframeElement: slaveAppIframe,
				containerElement: containerElement
			};

			this.registeredApps.push(newAppObject);

			//--> which type of target element?
			var classType = containerElement.getMetadata().getName();
			if (classType === 'it.fiorital.flex5app.controls.FioritalStackVbox') {

				//--> if secondaryId is specified and exists then kill
				if (existingSlaveAppId !== undefined) {
					var tab = containerElement.getItemByTag(existingSlaveAppId);
				} else {
					var tab = undefined;
				}

				if (tab !== undefined) {
					//--> remove and kill
					this._internalRemoveRegisteredAppByIframe(tab);
				}

				//--> create new one and set the key
				if (noWaitOverlay === undefined || noWaitOverlay === false) {
					var vboxContainer = containerElement.addItemWithWaiter(slaveAppIframe, slaveAppId, true, true); //<-- Vbox stack with spinner
				} else {
					var vboxContainer = containerElement.addItemWithWaiter(slaveAppIframe, slaveAppId, false, true); //<-- Vbox stack no spinner
				}

				newAppObject.innerContainer = vboxContainer; //<-- set reference

				var iconObjRef = vboxContainer;

			} else {

				//--> standard container, check for correct method to add iframe
				if (containerElement.addItem !== undefined) {

					//--> if already used kill the existing iframe
					if (containerElement.getItems()[0] !== undefined) {
						this._internalRemoveRegisteredAppByIframe(containerElement.getItems()[0]);
					}

					containerElement.addItem(slaveAppIframe);

				}

				if (containerElement.addContent !== undefined) {

					//--> if already used kill the existing iframe
					if (containerElement.getContent()[0] !== undefined) {
						this._internalRemoveRegisteredAppByIframe(containerElement.getContent()[0]);
					}

					containerElement.addContent(slaveAppIframe);

				}

				var iconObjRef = slaveAppIframe;

			} //<-- multi or single container ?

			//--> if iconTabBar provided create the icon
			if (iconTabBar !== undefined) {

				var it = new this.FioritalIconTabFilter({
					text: title,
					icon: 'sap-icon://co',
					design: 'Horizontal',
					//avoidSelect: true,
					key: slaveAppId,
					/*press: function (evt) {

						//--> press event: visualize if multi container
						var cont = evt.getSource().data('containerElement');
						if (cont.getMetadata().getName() === 'it.fiorital.flex5app.controls.FioritalStackVbox') {
							cont.showItemByTag(sap.ui.getCore().byId(evt.getParameter('id')).data('appId')); //<-- show contained item
						}

					}.bind(this),*/
					pressRight: function (evt) {
						evt.getSource().getDependents()[0].openBy(evt.getSource());
					}.bind(this)
				}); //<-- press events

				it.data('appId', slaveAppId);
				it.data('innerContainer', iconObjRef);
				it.data('containerElement', containerElement);

				//--> show ActionSheet for closing
				var as = new this.ActionSheet({
					placement: 'Bottom'
				});

				var btnClose = new sap.m.Button({
					text: 'Close',
					icon: 'sap-icon://decline',
					press: function (evt) {

						//--> destroy app
						var cnt = evt.getSource().data('containerElement');
						cnt.freeItemByRef(evt.getSource().data('innerContainer'));

						//--> remove icon tab
						evt.getSource().data('iconTabRef').destroy();

					}.bind(this)
				});

				as.addButton(btnClose);

				btnClose.data('innerContainer', iconObjRef);
				btnClose.data('containerElement', containerElement);
				btnClose.data('iconTabRef', it);

				it.addDependent(as); //<-- add action

				iconTabBar.addItem(it);

			}

		},

		openSlaveDirectUrl: function (customType, url, containerElement, iconTabBar, existingSlaveAppId, title) {

			//--> open it
			var slaveAppId = this.uuidv4();
			this.__InternalOpenSlave(customType, slaveAppId, url, containerElement, iconTabBar, existingSlaveAppId, title, true); //<-- no spinner overlay

		},

		openSlave: function (appId, containerElement, iconTabBar, existingSlaveAppId, openRequest) {

			fetch('/sap/bc/ui2/app_index/ui5_app_info?id=' + appId, {}).then(function (res) {
				if (res.status === 200) {
					res.text().then(function (appdata) {

						//--> get master dependency = app url
						var appDep = JSON.parse(appdata)[appId].dependencies.find(function (sdep) {
							return (sdep.id === appId);
						});

						//--> load manifest
						fetch(appDep.descriptorUrl, {}).then(function (resManifest) {
							resManifest.text().then(function (manifestData) {

								var mnfst = JSON.parse(manifestData);

								var slaveAppId = this.uuidv4();
								var finalUrl = appDep.url;

								//--> add param or set FSM_APP_ID
								if (finalUrl.includes('?') === false) {
									finalUrl = finalUrl + '?fsm_app_id=' + slaveAppId;
								} else {
									finalUrl = finalUrl + '&fsm_app_id=' + slaveAppId;
								}

								if (openRequest !== undefined) {
									finalUrl = finalUrl + '&fsm_open_request=' + btoa(JSON.stringify(openRequest));
								}

								//--> open it
								this.__InternalOpenSlave(appId, slaveAppId, finalUrl, containerElement, iconTabBar, existingSlaveAppId, mnfst[
									"sap.app"].title);

							}.bind(this));
						}.bind(this));

					}.bind(this));
				} else {
					//---> no app info; no fun
				}
			}.bind(this));

		},

		_internalRemoveRegisteredAppByIframe: function (innerContainer) {

			var existingRegister = this.registeredApps.find(function (sapp) {
				return (sapp.innerContainer === innerContainer);
			});

			var index = this.registeredApps.indexOf(existingRegister);
			if (index !== -1) {
				this.registeredApps.splice(index, 1);
			}

			innerContainer.destroy();

		},

		__GenerateStorageKey: function () {
			return this.FSMprefix + '_' + this.uuidv4();
		},

		__internalStorageEvent: function (evt) {

			this.Log.info("FSM > local storage Event");

			//--> from key check that we have a framework event: event key = '_FSF_' + unique guid
			if (evt.key.includes(this.FSMprefix) === true && evt.newValue !== '' && evt.newValue !== undefined) {

				this.Log.info("FSM > confirmed local storage Event: " + evt.newValue);

				//--> in debug mode ? ensure popup is open
				if (this.debugMode) {
					if (this.dialog.isOpen() === false) {
						this.dialog.open();
					}
				}

				var eventObj = JSON.parse(evt.newValue);
				var managed = false;

				//--> log
				this.__logEvent(eventObj);

				//---> master or slave
				if (this.mode === 'master') {

					switch (eventObj.eventType) {
					case 'REGISTRATION': //<-- app registration event

						//--> eventObj.appId
						//--> eventObj.objectHandlingCapacity []
						var app = this.registeredApps.find(function (app) {
							return (app.appId === eventObj.appId);
						});

						app.objectHandlingCapacity = eventObj.objectHandlingCapacity;

						//---> write back registration acknowledge to slave app
						this.storage.put(this.__GenerateStorageKey(), {
							eventType: 'REGISTRATION_AKNOWLEDGE',
							appId: eventObj.appId,
							containers: this.Containers
						});

						managed = true;
						break;
					case 'APP_READY': //<-- app ready to be visualized

						var app = this.registeredApps.find(function (app) {
							return (app.appId === eventObj.appId);
						});

						//--> hide waiter
						var classType = app.containerElement.getMetadata().getName();
						if (classType === 'it.fiorital.flex5app.controls.FioritalStackVbox') {
							app.containerElement.hideWaiterByRef(app.innerContainer);
						}

						managed = true;

						break;
					case 'CLOSE_REQUEST': //<-- app closure request

						managed = true;
						break;
					case 'PUSH_EVENT': //<-- app other event (push)

						managed = true;
						break;
					case 'NAVIGATION_REQUEST': //<-- app bookmark object event

						var ocid = $('[id$=' + eventObj.targetContainer + ']').attr('id');
						var trgCont = sap.ui.getCore().byId(ocid);

						var ictbid = $('[id$=' + eventObj.targetIcontabbar + ']').attr('id');
						var trgItb = sap.ui.getCore().byId(ictbid);

						//--> navigation request from a child app
						var existingApp = this.registeredApps.find(function (sapp) {
							return (sapp.appType = eventObj.targetAppType && sapp.containerElement.getId() === trgCont);
						});

						if (eventObj.targetNavType === 'CUSTOM') {

							//--> external app navigation; ask SAP for URL decode
							var navRequest = {
								customtype: eventObj.targetCustomType,
								customdata: JSON.stringify(eventObj.targetNavData),
							}

							fetch('/fiorital/zfsm_request', {
								headers: {
									'navRequest': btoa(JSON.stringify(navRequest))
								}
							}).then(function (res) {

								if (res.status == 200) {
									res.text().then(function (data) {

										var url = data;
										if (url !== '' && url !== undefined) {

											//--> store in global cache object
											if (eventObj.navigationId !== undefined) {

												var dt = this.globalCacheModel.getData();

												if (Array.isArray(dt)) {

													//--> search for same obj
													var fnd = dt.find(function (scache) {
														return (scache.objClass === eventObj.sourceObjClass && scache.appType === eventObj.targetCustomType && scache.objId ===
															eventObj.navigationId);
													});

													if (fnd !== undefined) {
														//--> update only time stamp
														fnd.addTimestamp = new Date();
													} else {

														//--> new nav object
														var newObject = {
															objClass: eventObj.sourceObjClass,
															appType: eventObj.targetCustomType,
															objId: eventObj.navigationId,
															objExtraData: eventObj.targetNavData,
															appDesc: eventObj.targetNavText,
															shellNavigationEnabled: true,
															customUrl: url,
															navDescr: eventObj.targetNavText,
															addTimestamp: new Date()
														};

														dt.push(newObject);
													}

												} else {

													//--> first object
													dt = [];

													//--> new nav object
													var newObject = {
														objClass: eventObj.sourceObjClass,
														appType: eventObj.targetCustomType,
														objId: eventObj.navigationId,
														objExtraData: eventObj.targetNavData,
														appDesc: eventObj.targetNavText,
														shellNavigationEnabled: true,
														customUrl: url,
														navDescr: eventObj.targetNavText,
														addTimestamp: new Date()
													};

													dt.push(newObject);

												}

												//--> post to SAP service
												fetch('/fiorital/zfsm_user_data', {
													method: 'POST',
													headers: {
														'type': 'HISTORY'
													},
													body: btoa(JSON.stringify(dt))
												});

												this.globalCacheModel.setData(dt);
												this.globalCacheModel.refresh(true);

											}

											this.openSlaveDirectUrl(eventObj.targetCustomType, url, trgCont, trgItb, eventObj.targetCustomType, eventObj.targetNavText);
											
										} else {
											//--> we have no custom navagation available!
											var ms = new FioritalMessageStrip('Nessuna navigazione custom trovata!', {
												status: 'error',
												icon: 'sap-icon://message-error',
												timeout: 3000
											});
										}

									}.bind(this));

								} else { //<--- no custom navigation class available

									//--> no custom navigation possible
									var ms = new FioritalMessageStrip('Nessuna navigazione custom trovata!', {
										status: 'error',
										icon: 'sap-icon://message-error',
										timeout: 3000
									});
								}
							}.bind(this));

						} else {

							//--> app navigation

							if (eventObj.navMode === 'NEW') {

								//--> ignore existing app, open a new one!
								this.openSlave(eventObj.targetAppType, trgCont, trgItb, undefined, {
									targetNavType: eventObj.targetNavType,
									targetNavData: eventObj.targetNavData,
									sourceObjClass: eventObj.sourceObjClass,
									sourceAppId: eventObj.sourceAppId,
									sourceObjId: eventObj.sourceObjId,
									sourceAppType: eventObj.sourceAppType
								});

							} else if (eventObj.navMode === 'EXISTING') {

								//--> move the event to the target app
								this.storage.put(this.__GenerateStorageKey(), {
									eventType: 'NAVIGATE_TO',
									appId: existingApp.appId,
									targetNavType: eventObj.targetNavType,
									targetNavData: eventObj.targetNavData,
									sourceObjClass: eventObj.sourceObjClass,
									sourceAppId: eventObj.sourceAppId,
									sourceObjId: eventObj.sourceObjId,
									sourceAppType: eventObj.sourceAppType
								});

							}

						}

						managed = true;
						break;
					case 'SPECIAL_REQUEST':

						//--> special navigation request

					case 'OBJECT_NOTIFICATION':

						//--> get app name & data
						fetch('/sap/bc/ui2/app_index/ui5_app_info?id=' + eventObj.appType, {}).then(function (res) {

							res.text().then(function (appdata) {

								//--> get master dependency = app url
								var appDep = JSON.parse(appdata)[eventObj.appType].dependencies.find(function (sdep) {
									return (sdep.id === eventObj.appType);
								});

								//--> load manifest
								fetch(appDep.descriptorUrl, {}).then(function (resManifest) {
									resManifest.text().then(function (manifestData) {

										var mnfst = JSON.parse(manifestData);

										//--> store in global cache object
										var dt = this.globalCacheModel.getData();

										if (Array.isArray(dt)) {

											//--> search for same obj
											var fnd = dt.find(function (scache) {
												return (scache.objClass === eventObj.objClass && scache.appType === eventObj.appType && scache.objId ===
													eventObj.objId);
											});

											if (fnd !== undefined) {
												//--> update only time stamp
												fnd.addTimestamp = new Date();
											} else {

												//--> new nav object
												var newObject = {
													objClass: eventObj.objClass,
													appType: eventObj.appType,
													objId: eventObj.objId,
													objExtraData: eventObj.objExtraData,
													appDesc: mnfst["sap.app"].title,
													shellNavigationEnabled: eventObj.shellNavigationEnabled,
													addTimestamp: new Date()
												};

												dt.push(newObject);
											}

										} else {

											//--> first object
											dt = [];

											//--> new nav object
											var newObject = {
												objClass: eventObj.objClass,
												appType: eventObj.appType,
												objId: eventObj.objId,
												objExtraData: eventObj.objExtraData,
												appDesc: mnfst["sap.app"].title,
												shellNavigationEnabled: eventObj.shellNavigationEnabled,
												addTimestamp: new Date()
											};

											dt.push(newObject);

										}

										//--> load from storage
										fetch('/fiorital/zfsm_user_data', {
											method: 'POST',
											headers: {
												'type': 'HISTORY'
											},
											body: btoa(JSON.stringify(dt))
										});

										this.globalCacheModel.setData(dt);
										this.globalCacheModel.refresh(true);

									}.bind(this));
								}.bind(this)); //<-- get app manifest

							}.bind(this));
						}.bind(this)); //<-- get app desriptor

						managed = true;
						break;

					default:
					}

					//--> if event managed delete it
					if (managed) {
						localStorage.removeItem(evt.key);
					}

				}

				if (this.mode === 'slave') {

					//--> is event for me?
					if (eventObj.appId === this.slaveAppId) {

						switch (eventObj.eventType) {
						case 'NAVIGATE_TO': //<-- app navigate to object event

							this.fireEvent('onNavigateRequest', {
								navigationRequest: {
									targetNavType: eventObj.targetNavType,
									targetNavData: eventObj.targetNavData,
									sourceObjClass: eventObj.sourceObjClass,
									sourceAppId: eventObj.sourceAppId,
									sourceObjId: eventObj.sourceObjId,
									sourceAppType: eventObj.sourceAppType
								}
							});

							managed = true;
							break;

						case 'REGISTRATION_AKNOWLEDGE':

							this.slaveActive = true; //<-- active app 
							this.Containers = eventObj.containers; //<-- master containers
							window.FSM_Containers = eventObj.containers; //<-- master containers
							window.FSM_slaveActive = true;

							managed = true;
							break;

						default:
						}

						//--> if event managed delete it
						if (managed) {
							localStorage.removeItem(evt.key);
						}

					} //<-- is event for me ?

				} //<-- slave app

			} //<-- is a FSM framework event?

		},

		__internalGetViev: function (startObj) {

			var goOn = true;
			var sobj = startObj;
			var ownerView = undefined;

			while (goOn) {
				sobj = sobj.getParent();
				if (sobj !== undefined) {
					if (sobj['getController'] !== undefined) {
						goOn = false;
						ownerView = sobj;
					} else {
						goOn = true;
					}
				} else {
					goOn = false;
				}
			}

			return ownerView;

		},

		__logEvent: function (eventObj) {
			this.eventsJson.getData().push({
				eventText: JSON.stringify(eventObj)
			});
			this.eventsJson.refresh(true);
		},

		//--> GUID generator
		uuidv4: function () {
			return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, function (c) {
				return (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16);
			});
		}

	});

}, true);