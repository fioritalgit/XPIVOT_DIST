sap.ui.define([
		"jquery.sap.global",
		"sap/ui/core/XMLComposite",
		"sap/m/MessageToast",
		"sap/m/MessageBox",
		"sap/ui/model/Filter",
		"sap/ui/model/FilterOperator",
		"sap/ui/model/json/JSONModel",
		"it/fiorital/fioritalui5lib/formatter/SharedFormatter",
		"sap/base/Log"
	],
	function (jQuery, XMLComposite, MessageToast, MessageBox, Filter, FilterOperator, jsModel, SharedFormatter, Log) {
		"use strict";

		var FioritalShortCuteManger = XMLComposite.extend("it.fiorital.fioritalui5lib.controls.FioritalShortCutManger", {
			SharedFormatter: SharedFormatter,

			metadata: {
				properties: {
					title: {
						type: "string",
						defaultValue: "Shortcuts attivi"
					}
				},
				events: {
					onshortcut: {
						parameters: {
							focusControl: {
								type: "object"
							},
							shortcut: {
								type: "object"
							},
							id: {
								type: "string"
							}
						}
					}

				},
				aggregations: {

				},
				defaultAggregation: "items"
			},

			init: function () {

				this.SKMjsonModel = new jsModel();
				this.byId('SKMdialogList').setModel(this.SKMjsonModel, 'SKM');

				//--> super
				XMLComposite.prototype.init.apply(this, arguments);

				//---> global key down event controller
				$(document).keydown(function (e) {


					//---> get shortcuts
					this.SCK = this.data();

					//---> get owner component && parent first view
					var ownc = sap.ui.core.Component.getOwnerComponentFor(this);

					var viewFound = undefined;
					var elem = this;

					while (viewFound === undefined && elem.getParent() !== undefined) {
						if (elem.getParent() instanceof sap.ui.core.mvc.XMLView) {
							viewFound = elem.getParent();
						} else {
							elem = elem.getParent(); //<-- go up	
						}
					}

					//--> no view no party! should never happen anyway....
					if (viewFound === undefined) {
						return;
					} else {
						var ctrl = viewFound.getController();

						//----> go oy on visible views !!!!
						if (viewFound.$().css('display') === 'none') {
							return;
						}
					}
					
					//---> special shortcut?
					try {
						if (e.ctrlKey && e.shiftKey && e.altKey && String.fromCharCode(e.keyCode).toUpperCase() === 'K') {
							this.open();
							return;
						}
					} catch (exc) {
						//--> ?!
					}

					//---> get owner component && parent first view
					var ownc = sap.ui.core.Component.getOwnerComponentFor(this);

					for (var key in this.SCK) {
						var singleKeys = this.SCK[key].keys.split('-');

						//--> check CTRL (e.ctrlKey)
						var fnd = singleKeys.find(function (skey) {
							return (skey === 'CTRL');
						});

						if (fnd !== undefined && !e.ctrlKey) {
							continue;
						}

						//--> check SHIFT (e.shiftKey)
						var fnd = singleKeys.find(function (skey) {
							return (skey === 'SHIFT');
						});

						if (fnd !== undefined && !e.shiftKey) {
							continue;
						}

						//--> cehck ALT (e.altKey)
						var fnd = singleKeys.find(function (skey) {
							return (skey === 'ALT');
						});

						if (fnd !== undefined && !e.altKey) {
							continue;
						}

						var fnd = singleKeys.find(function (skey) {
							return (skey !== 'ALT' && skey !== 'CTRL' && skey !== 'SHIFT');
						});

						//---> now check the actual key
						var foundMasterKey = '';
						var foundSKobject = undefined;
						try {
							if (String.fromCharCode(e.keyCode).toUpperCase() === fnd) {
								foundMasterKey = key;
								foundSKobject = this.SCK[key];
							}
						} catch (exc) {
							//--> ?! maybe special key ?!
						}

						if (foundMasterKey) {
							break;
						}

					}
					
					if (!foundMasterKey) {
					  return;	
					}

					//---> get focused element
					var fcs = $(':focus');
					if (fcs.attr('id') !== undefined) {

						//---> search for UI5 element 
						var foundUI5 = sap.ui.getCore().byId(fcs.attr('id'));

						if (foundUI5 !== undefined) {

							Log.info("direct element GK");
							this.fireEvent("onshortcut", {
								focusControl: foundUI5,
								shortcut: foundSKobject,
								id: foundSKobject.id
							});

						} else {

							//---> go up to parents...
							var prt = fcs.parent();
							while (prt !== undefined) {

								foundUI5 = sap.ui.getCore().byId(prt.attr('id'));
								if (foundUI5 !== undefined) {
									Log.info("indirect element GK");
									break;
								}

								prt = prt.parent();

							}

							if (foundUI5 !== undefined) {
								this.fireEvent("onshortcut", {
									focusControl: foundUI5,
									shortcut: foundSKobject,
									id: foundSKobject.id
								});
							}

						}

					} else {

						//---> no focus only general events; check shortcut for general events
						Log.info("no focus GK");
						this.fireEvent("onshortcut", {
							focusControl: undefined,
							shortcut: foundSKobject,
							id: foundSKobject.id
						});

					}

				}.bind(this));

			},

			applySettings: function (mSettings, oScope) {
				//--> super
				XMLComposite.prototype.applySettings.apply(this, arguments);
			},

			closepopoverGKM: function (evt) {
				this.byId('GKMdialog').close();
			},

			open: function (evt) {

				var skjson = [];

				//---> get shortcuts
				this.SCK = this.data();

				for (var key in this.SCK) {
					skjson.push(this.SCK[key]);
				}

				this.SKMjsonModel.setData(skjson);

				this.byId('SKMdialog').open();
			}

		});

		return FioritalShortCuteManger;

	}, true);