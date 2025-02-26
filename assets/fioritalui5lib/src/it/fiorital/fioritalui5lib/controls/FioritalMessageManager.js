/* eslint sap-no-location-reload: 0 */
sap.ui.define([
	"sap/ui/base/ManagedObject",
	"it/fiorital/fioritalui5lib/controls/FioritalMessageStrip",
	"it/fiorital/fioritalui5lib/controls/FioritalBusy"
], function (ManagedObject, messageStrip, busyIndicator) {
	"use strict";
	return ManagedObject.extend("it.fiorital.fioritalui5lib.controls.FioritalMessageManager", {

		metadata: {
			properties: {

			},
			events: {
				odataServiceRequest: {
					parameters: {
						request: {
							type: "object"
						},
						settings: {
							type: "object"
						}
					}
				},
				odataServiceError: {
					parameters: {
						request: {
							type: "object"
						},
						settings: {
							type: "object"
						},
						error: {
							type: "string"
						}
					}
				},
				odataMessageServiceError: {
					parameters: {
						message: {
							type: "object"
						}
					}
				}
			}
		},

		//  options.callback           >>> custom callback function 
		//  options.errorCallback      >>> custom callback function dedicated for error messages
		//  options.showToast          >>> show toasts ? (default=true)
		//	options.showToastOnlyError >>> show toasts only for errors (default=true)

		constructor: function (model, options) {

			this.callCount = 1;
			this.busy = new busyIndicator();

			if (options !== undefined) {
				this._options = options;
			} else {
				this._options = new Object();
			}

			if (this._options.view !== undefined) {
				this._options.view.addContent(this.busy);
			}

			if (this._options.deleteBoundMessages === undefined) {
				this._options.deleteBoundMessages = true;
			}
			
			//---> ybug instance
			if (this._options.YbugInstance !== undefined){
				this.YBUG = this._options.YbugInstance;
			}

			this._model = model; //<-- store reference
			this.ServiceUrl = model.sServiceUrl;

			var bnd = new sap.ui.model.json.JSONPropertyBinding(sap.ui.getCore().getMessageManager().getMessageModel(), "/");
			bnd.attachChange(function (evt) {
				var todel = [];
				sap.ui.getCore().getMessageManager().getMessageModel().getData().forEach(function (smsg) {
					if (smsg.message.includes("$batch")) {
						todel.push(smsg);
					}
				});
				
				sap.ui.getCore().getMessageManager().removeMessages(todel);
			});

			$(document).ajaxSend(this._onAjaxSend.bind(this)); //<--- trace the Ajax call
			$(document).ajaxError(this._onAjaxError.bind(this)); //<--- trace the Ajax call
			$(document).ajaxComplete(this._onAjaxComplete.bind(this)); //<--- trace the Ajax call

			this._model.attachMessageChange(this, this._onNewMessageEvent.bind(this));

			ManagedObject.prototype.constructor.apply(this, undefined);
		},

		_onAjaxError: function (event, request, settings, error) {

			//--> check if the call is about the odata service of the model
			if (settings.url.indexOf(this.ServiceUrl) >= 0) {
				
				
				//---> if YBUG instance present add in log queue
				if (this.YBUG !== undefined){
					var networkDump = new Object();
					networkDump.url = settings.url;
					
					this.YBUG.networkDumps.push(networkDump);
				}

				//---> manage session expired (503)
				if (request.status === 503) {
					sap.m.MessageBox.show(
						'Session Expired!', {
							icon: sap.m.MessageBox.Icon.INFORMATION,
							title: "Attention !",
							actions: [sap.m.MessageBox.Action.YES],
							onClose: function (oAction) {
								window.location.reload();
							}
						});

					return;
				}

				//---> fire registered events
				this.fireEvent("odataServiceError", {
					request: request,
					settings: settings,
					error: error
				});
			}

		},

		_onAjaxComplete: function (event, jqXHR, ajaxOptions) {

			//---> check for SCP expired session....
			var logReq = jqXHR.getResponseHeader('com.sap.cloud.security.login');
			if (logReq === 'login-request') {

				sap.m.MessageBox.show(
					"Session Expired!", {
						icon: sap.m.MessageBox.Icon.INFORMATION,
						title: "Attention !",
						actions: [sap.m.MessageBox.Action.YES],
						onClose: function (oAction) {
							window.location.reload();
						}
					});
			}

			this.busy.close();

		},

		_onAjaxSend: function (event, request, settings) {

			this.callCount = this.callCount + 1;
			this.busy.open();

			//--> check if the call is about the odata service of the model
			if (settings.url.indexOf(this.ServiceUrl) >= 0) {
				
				//---> clear skip / top
				if (this._options.removeQueryParameters !== undefined){
					var fnd = this._options.removeQueryParameters.find(function(sname){
						return (settings.url.includes(sname)); 
					});
					
					if (fnd !== undefined){
						settings.url = settings.url.split('?')[0];
					}
				}

				//---> fire registered events
				this.fireEvent("odataServiceRequest", {
					request: request,
					settings: settings
				});

				//---> delete allbound messages if required
				if (this._options.deleteBoundMessages !== undefined && this._options.deleteBoundMessages === true) {

					var msgs = sap.ui.getCore().getMessageManager().getMessageModel().getData();
					msgs.forEach(function (sMsg) {

						try {
							//--> control bound message only
							if (sMsg.controlIds.length > 0) {
								sap.ui.getCore().getMessageManager().removeMessages(sMsg); //<--- this will reset also the visual status
							}
						} catch (exc) {
							//--> ?!?!?	
						}

					});

				}

			}

		},

		_onNewMessageEvent: function (message) {

			//---> manage callback if user provided
			if (this._options.callback !== undefined) {
				try {
					this._options.callback(message);
				} catch (exc) {
					//--> shit!
				}
			}

			var messages = message.getParameter('newMessages');
			messages.forEach(function (msg) {

				//---> error message; special handler
				if ((msg.type === 'Error') && (msg.message.indexOf('$batch') === -1)) {

					//---> ensure to remove busy indicator
					sap.ui.core.BusyIndicator.hide();

					//--> direct notification with toast
					if ((this._options.toastNotification === undefined) || (this._options.toastNotification === true)) {
						new messageStrip(msg.message, {
							status: "error",
							icon: "sap-icon://message-error",
							timeout: 4000
						});

					}

				}
				
				//---> error message; special handler
				if (msg.type === 'Success') {

					//---> ensure to remove busy indicator
					sap.ui.core.BusyIndicator.hide();

					//--> direct notification with toast
					if ((this._options.toastNotification === undefined) || (this._options.toastNotification === true)) {
						new messageStrip(msg.message, {
							status: "warning",
							icon: "sap-icon://message-success",
							timeout: 4000
						});

					}

				}

				//---> error message; special handler
				if (msg.type === 'Warning') {

					//---> ensure to remove busy indicator
					sap.ui.core.BusyIndicator.hide();

					//--> direct notification with toast
					if ((this._options.toastNotification === undefined) || (this._options.toastNotification === true)) {
						new messageStrip(msg.message, {
							status: "warning",
							icon: "sap-icon://message-warning",
							timeout: 4000
						});

					}

				}

				//---> error event
				if (msg.type === 'Error') {

					//---> special event handler
					if (this._options.errorCallback !== undefined) {
						try {
							this._options.errorCallback(message);
						} catch (exc) {
							//--> shit!
						}
					}

					//---> fire registered events
					this.fireEvent("odataMessageServiceError", {
						message: message
					});

				}

				//---> error message; special handler
				if (msg.type === 'None') {

					//---> ensure to remove busy indicator
					sap.ui.core.BusyIndicator.hide();

					//--> direct notification with toast
					if ((this._options.toastNotification === undefined) || (this._options.toastNotification === true)) {
						new messageStrip(msg.message, {
							status: "warning",
							icon: "sap-icon://message-warning",
							timeout: 4000
						});

					}

				}

			}.bind(this));

		},

		init: function () {

		},

		exit: function () {

		}

	});

}, true);