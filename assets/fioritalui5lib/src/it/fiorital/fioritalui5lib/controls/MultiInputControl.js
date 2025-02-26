sap.ui.define([
	"sap/ui/core/Control",
	"sap/ui/dom/includeStylesheet",
	"it/fiorital/fioritalui5lib/controls/VirtualKeyboardManager",
	"sap/ui/model/FilterType",
	"it/fiorital/fioritalui5lib/extension/BooleanParse"
], function (Control, includeStylesheet, VKM, filterType, BooleanParse) {
	"use strict";
	return Control.extend("it.fiorital.fioritalui5lib.controls.MultiInputControl", {

		metadata: {
			properties: {
				readOnly: { //<--- is read only
					type: "boolean",
					defaultValue: false
				},
				iSmultiInput: { //<--- multi value or single
					type: "string",
					defaultValue: "S"
				},
				showDescriptionLabel: { //<--- show description label below
					type: "string",
					defaultValue: "Y"
				},
				width: {
					type: "string",
					defaultValue: ""
				},
				popoverWidth: {
					type: "string",
					defaultValue: "18em"
				},
				inputType: { //<---- number / string 
					type: "string",
					defaultValue: "CHAR"
				},
				hasSuggestion: { //<----has suggested values ?
					type: "string",
					defaultValue: ""
				},
				suggestionAggregation: { //<---- aggregation for suggestion binding
					type: "string",
					defaultValue: ""
				},
				valuesAggregation: { //<---- aggregation for multiple values
					type: "string",
					defaultValue: ""
				},
				singleValue: { //<---- single value binding
					type: "string",
					defaultValue: ""
				},
				singleDescription: { //<---- single value description binding
					type: "string",
					defaultValue: ""
				},
				suggestionIdField: { //<---- popup help id filed
					type: "string",
					defaultValue: "valueid"
				},
				suggestionDescrField: { //<----  popup help id text
					type: "string",
					defaultValue: "valuedescription"
				},
				showSingleVKM: {
					type: "boolean",
					defaultVaule: "false"
				},
				dialogType: {
					type: "string",
					defaultValue: "popover"
				}

			},
			defaultAggregation: "content",
			aggregations: {
				content: {
					type: "sap.ui.core.Control",
					multiple: true,
					singularName: "content"
				}
			},
			events: {
				change: {
					parameters: {

					}
				}
			}
		},
		/**
		 *      Init: Called when object is being created
		 *      @public
		 */
		init: function () {

			this.multiControlCreated = false;
			this.VKM = new VKM();

			//---> in FLP ??
			if (sap.ushell !== undefined && sap.ushell.Container !== undefined && sap.ushell.Container.getService("AppLifeCycle") !== undefined) {

				try {
					var cmp = sap.ushell.Container.getService("AppLifeCycle").getCurrentApplication().componentInstance;
					var appName = cmp.getMetadata().getLibraryName().split('.').pop();

					var baseurl = this.getMetadata().getLibraryName();
					baseurl = 'sap/fiori/' + appName + '/resources/' + baseurl.split('.').join('/') + '/MultiInputControl.css';

					includeStylesheet(baseurl);
				} catch (exc) {

					//---> ABAP stack 
					try { //Prevent abort on SCP
						var baseurl = this.getMetadata().getLibraryName();
						baseurl = '../zfioritalui5lib/controls/MultiInputControl.css';
						includeStylesheet(baseurl);
					} catch (ex) {}

					//---> SCP
					try { // Prevent abort on abap
						var baseurl = this.getMetadata().getLibraryName();
						baseurl = 'resources/' + baseurl.split('.').join('/') + '/MultiInputControl.css';
						includeStylesheet(baseurl);
					} catch (ex) {}

				}

			} else {

				//---> ABAP stack 
				try { //Prevent abort on SCP
					var baseurl = this.getMetadata().getLibraryName();
					baseurl = '../zfioritalui5lib/controls/MultiInputControl.css';
					includeStylesheet(baseurl);
				} catch (ex) {}

				//---> SCP
				try { // Prevent abort on abap
					var baseurl = this.getMetadata().getLibraryName();
					baseurl = 'resources/' + baseurl.split('.').join('/') + '/MultiInputControl.css';
					includeStylesheet(baseurl);
				} catch (ex) {}
			}

		},
		/**
		 *    Exit: Garbage collector
		 *      @public
		 */
		exit: function () {
			//this._oNoDataLabel.destroy();
			//this._oNoDataLabel2.destroy();
			//delete this._oNoDataLabel;
		},

		getInputValue: function () {

		},

		setInputValue: function (valueOf) {

		},

		_createContent: function (oControl) {

			//---> understand the type of control to create
			var inputType = this.getInputType();
			var hasSuggestion = this.getHasSuggestion();
			var suggestionAggregation = this.getSuggestionAggregation();

			// valueAssignment ; charactvalues
			if (this.getISmultiInput() === 'S') {
				//--> single value (no suggestion)
				if (inputType == 'CHAR' && hasSuggestion == '') {

					oControl.addContent(new sap.m.HBox({
						renderType: 'Bare',
						width: '100%',
						height: "1.0em"
					}));

					if (this.getShowSingleVKM() === true && !this.getReadOnly()) {

						//--> external HBox
						var hbowinput = new sap.m.HBox({
							renderType: 'Bare',
							width: '100%',
							alignItems: "Center",
							height: '2.5em'
						});

						//--> simple input control
						var existingCtrl = sap.ui.getCore().byId(this.getId() + "-innerControl");
						if (existingCtrl !== undefined) {
							existingCtrl.destroy(false);
						}
						var innerControl = new sap.m.Input({
							id: this.getId() + "-innerControl",
							type: "Text",
							enabled: !this.getReadOnly(),
							change: function (evt) {
								this.fireEvent("change", {});
							}.bind(this)
						});

						hbowinput.addItem(innerControl);

						hbowinput.addItem(new sap.m.HBox({
							renderType: 'Bare',
							width: '0.5em'
						}));

						//--> VKM Button
						this.selBtn = new sap.m.Button({
							width: '4em',
							visible: true,
							icon: 'sap-icon://keyboard-and-mouse',
							press: function (evt) {

								this.VKM.openBy(this.VKMcontrol, this);

							}.bind(this)

						});

						hbowinput.addItem(this.selBtn);

						this.VKMcontrol = innerControl;

					} else {

						//--> simple input control
						var existingCtrl = sap.ui.getCore().byId(this.getId() + "-innerControl");
						if (existingCtrl !== undefined) {
							existingCtrl.destroy(false);
						}
						var innerControl = new sap.m.Input({
							id: this.getId() + "-innerControl",
							type: "Text",
							enabled: !this.getReadOnly(),
							change: function (evt) {
								this.fireEvent("change", {});
							}.bind(this)
						});
					}

					this.externalInputControl = innerControl;

					innerControl.addStyleClass('multiControlSingleInputH2');

					if (this.getWidth() !== '') {
						innerControl.setWidth(this.getWidth());
					}

					if (this.getBinding('singleValue').getModel().getMetadata().getParent().getName() === 'sap.ui.model.json.JSONModel') {

						//---> Json model

						this.innerControl.setModel(this.getBinding('singleValue').getModel());
						this.innerControl.bindProperty('value', {
							path: this.getBinding('singleValue').getContext().getPath() + '/' + this.getBinding('singleValue').getPath(),
							// parameters: {
							// 	$$groupId: 'directGroup'
							// }
							model: this.getBindingInfo('singleValue').parts[0].model

						});

					} else {

						//---> odata model
						innerControl.bindProperty('value', {
							path: this.getBinding('singleValue').getPath(),
							parameters: {
								$$groupId: 'directGroup'
							}
						});

					}

					//oControl.addContent(innerControl);

					if (this.getShowSingleVKM() === true) {
						oControl.addContent(hbowinput);
					} else {
						oControl.addContent(innerControl);
					}

					oControl.addContent(new sap.m.HBox({
						renderType: 'Bare',
						width: '100%',
						height: "1.0em"
					}));

				}

				//--> single value (with suggestion)
				if (inputType == 'CHAR' && hasSuggestion !== '') {

					oControl.addContent(new sap.m.HBox({
						renderType: 'Bare',
						width: '100%',
						height: "1.0em"
					}));

					//--> external HBox
					var hbowinput = new sap.m.HBox({
						renderType: 'Bare',
						width: '100%',
						alignItems: "Center",
						height: '2.5em'
					});

					hbowinput.addStyleClass('multiControlBorder');

					if (this.getWidth() !== '') {
						hbowinput.setWidth(this.getWidth());
					}

					this.listEditKey = new sap.m.Label();
					this.listEditKey.addStyleClass('multiInputControlBold');

					var localValPath, localValPathreadOnly;

					if (this.getBinding('singleValue').getModel().getMetadata().getParent().getName() === 'sap.ui.model.json.JSONModel') {

						//---> Json model

						//--> Fix abort rendering MultiInputControls not having 'readonly' binding
						try {
							if (this.getBinding('readOnly').getPath() !== null) {
								localValPathreadOnly = this.getBinding('singleValue').getContext().getPath() + '/' + this.getBinding('readOnly').getPath();
							}
						} catch (ex) {
							//<-- Prevent exception when 'readonly' binding is not defined on view
						}

						localValPath = this.getBinding('singleValue').getContext().getPath() + '/' + this.getBinding('singleValue').getPath();
						this.listEditKey.setModel(this.getBinding('singleValue').getModel());
						this.listEditKey.bindProperty('text', {
							path: localValPath,
							// parameters: {
							// 	$$groupId: 'directGroup'
							// }
							model: this.getBindingInfo('singleValue').parts[0].model
						});

					} else {

						//---> odata model
						//--> Fix abort rendering MultiInputControls not having 'readonly' binding
						try {
							localValPathreadOnly = this.getBinding('readOnly').getPath();
						} catch (ex) {
							//<-- Prevent exception when 'readonly' binding is not defined on view
						}

						localValPath = this.getBinding('singleValue').getPath();
						this.listEditKey.bindProperty('text', {
							path: localValPath
						});

					}

					//--> the selection button
					this.selBtn = new sap.m.Button({
						width: '4em',
						visible: !this.getReadOnly(),
						press: function (evt) {

							//--> reactivate binding
							if (this.selectList.getBinding('items').isSuspended()) {
								this.selectList.getBinding('items').resume();
							}

							this.popoverSelect.setVisible(true);
							if (this.getDialogType() === 'popover') {
								this.popoverSelect.openBy(this.selBtn);
							} else {
								this.popoverSelect.open();
							}

						}.bind(this)

					});

					this.selBtn.setIcon('sap-icon://group-2');

					hbowinput.addItem(this.selBtn);
					hbowinput.addItem(new sap.m.HBox({
						renderType: 'Bare',
						width: '0.5em'
					}));

					this.isReadOnly = this.getReadOnly();

					//--> Fix abort rendering MultiInputControls not having 'readonly' binding
					var readOnlyModel;
					try {
						if (localValPathreadOnly !== null && localValPathreadOnly !== undefined) {
							readOnlyModel = {
								path: localValPathreadOnly,
								model: this.getBindingInfo('readOnly').parts[0].model,
								type: 'it.fiorital.fioritalui5lib.extension.BooleanParse'
							};
						} else {
							readOnlyModel = {
								value: this.getBinding('readOnly').getExternalValue()
							};
						}
					} catch (ex) {
						//--> Binding error
						readOnlyModel = {
							value: true
						};
					}

					hbowinput.addItem(new sap.ui.core.Icon({
						src: "sap-icon://sys-cancel",
						visible: {
							parts: [{
									path: localValPath,
									model: this.getBindingInfo('singleValue').parts[0].model,
									type: 'it.fiorital.fioritalui5lib.extension.BooleanParse'
								},
								readOnlyModel
							],

							formatter: function (sValue, readOnly) {

								if (readOnly) {
									return false;
								} else {
									return (sValue);
								}

							}.bind(this)
						}, //!this.getReadOnly(),
						press: function (evt) {

							//--> call delete (set patch with blank)
							this.listEditKey.setText('');
							this.listEditDescr.setText('');
							this.fireEvent("change", {});

							//JR

							if (this.getBindingInfo('singleValue').parts[0].model !== undefined) {

								this.getModel(this.getBindingInfo('singleValue').parts[0].model).getData()[this.getBindingContext(this.getBindingInfo(
									'singleValue').parts[0].model).getPath().split('/', 2)[1]][this.getBinding('singleValue').getPath()] = '';
								this.getModel(this.getBindingInfo('singleValue').parts[0].model).getData()[this.getBindingContext(this.getBindingInfo(
									'singleValue').parts[0].model).getPath().split('/', 2)[1]][this.getBinding('singleDescription').getPath()] = '';

							} else {

								evt.getSource().getBindingContext().getObject()[this.getBindingInfo('singleValue').parts[0].path] = "";
								evt.getSource().getBindingContext().getObject()[this.getBindingInfo('singleDescription').parts[0].path] = "";

							}

						}.bind(this)
					}));

					hbowinput.addItem(new sap.m.HBox({
						renderType: 'Bare',
						width: '0.5em'
					}));

					hbowinput.addItem(this.listEditKey);

					if (this.getShowDescriptionLabel() === 'Y') {

						this.listEditDescr = new sap.m.Label();

						if (this.getBinding('singleDescription').getModel().getMetadata().getParent().getName() === 'sap.ui.model.json.JSONModel') {

							this.listEditDescr.setModel(this.getBinding('singleDescription').getModel());
							this.listEditDescr.bindProperty('text', {
								path: this.getBinding('singleDescription').getContext().getPath() + '/' + this.getBinding('singleDescription').getPath(),
								//mode: 'OneWay',
								// parameters: {
								// 	$$groupId: 'directGroup'
								// }
								model: this.getBindingInfo('singleValue').parts[0].model
							});

						} else {

							this.listEditDescr.bindProperty('text', {
								path: this.getBinding('singleDescription').getPath(),
								mode: 'OneWay'
							});

						}

						hbowinput.addItem(new sap.m.HBox({
							renderType: 'Bare',
							width: '0.5em'
						}));

						if (this.getBinding('singleDescription').getModel().getMetadata().getParent().getName() === 'sap.ui.model.json.JSONModel') {

							hbowinput.addItem(new sap.m.Label({
								text: '-',
								visible: {
									path: localValPath,
									type: new BooleanParse(),
									formatter: function (sValue) {
										return sValue;
									}.bind(this),
									model: this.getBindingInfo('singleValue').parts[0].model
								},
							}));

						} else {

							hbowinput.addItem(new sap.m.Label({
								text: '-',
								visible: {
									path: localValPath,
									type: new BooleanParse(),
									formatter: function (sValue) {
										return sValue;
									}.bind(this)
								},
							}));

						}

						hbowinput.addItem(new sap.m.HBox({
							renderType: 'Bare',
							width: '0.5em'
						}));

						hbowinput.addItem(this.listEditDescr);

					}

					var oSelectItem = new sap.m.CustomListItem({
						type: 'Active',
						press: function (evt) {

							//JR

							if (this.getBindingInfo('singleValue').parts[0].model !== undefined) {

								this.listEditKey.setText(evt.getSource().getBindingContext(this.getBindingInfo('singleValue').parts[0].model).getObject()[
									this.getSuggestionIdField().toUpperCase()]);

								if (this.getShowDescriptionLabel() === 'Y') {
									//sap.m.MessageToast.show("Selected descr : " +  this.getSuggestionDescrField() + "RECORD: " + JSON.stringify(evt.getSource().getBindingContext().getObject()) );
									this.listEditDescr.setText(evt.getSource().getBindingContext(this.getBindingInfo('singleValue').parts[0].model).getObject()[
										this.getSuggestionDescrField()]);
									this.fireEvent("change", {});
								}

							} else {

								this.listEditKey.setText(evt.getSource().getBindingContext().getObject()[
									this.getSuggestionIdField()]);

								if (this.getShowDescriptionLabel() === 'Y') {
									//sap.m.MessageToast.show("Selected descr : " +  this.getSuggestionDescrField() + "RECORD: " + JSON.stringify(evt.getSource().getBindingContext().getObject()) );
									this.listEditDescr.setText(evt.getSource().getBindingContext().getObject()[
										this.getSuggestionDescrField()]);
									this.fireEvent("change", {});
								}

							}

							this.popoverSelect.close();
						}.bind(this)
					});

					var selectItemHbox = new sap.m.HBox({
						height: "3em"
					});
					selectItemHbox.addItem(new sap.m.HBox({
						width: "1em"
					}));
					selectItemHbox.addItem(new sap.ui.core.Icon({
						src: "sap-icon://blank-tag"
					}));
					selectItemHbox.addItem(new sap.m.HBox({
						width: "1em"
					}));
					selectItemHbox.setAlignItems('Center');

					if (this.getBinding('singleDescription').getModel().getMetadata().getParent().getName() === 'sap.ui.model.json.JSONModel') {

						var lbl1 = new sap.m.Label({
							text: {
								path: this.getSuggestionIdField(),
								model: this.getBindingInfo('singleValue').parts[0].model
							}
						});
						lbl1.addStyleClass('boldHI');
						selectItemHbox.addItem(lbl1);

						selectItemHbox.addItem(new sap.m.HBox({
							width: "0.5em"
						}));
						selectItemHbox.addItem(new sap.m.Label({
							text: {
								path: this.getSuggestionDescrField(),
								model: this.getBindingInfo('singleValue').parts[0].model
							}
						}));

						selectItemHbox.addItem(new sap.m.HBox({
							width: "0.5em"
						}));

					} else {

						var lbl1 = new sap.m.Label({
							text: "{" + this.getSuggestionIdField() + "}"
						});
						lbl1.addStyleClass('boldHI');
						selectItemHbox.addItem(lbl1);

						selectItemHbox.addItem(new sap.m.HBox({
							width: "0.5em"
						}));
						selectItemHbox.addItem(new sap.m.Label({
							text: "{" + this.getSuggestionDescrField() + "}"
						}));

						selectItemHbox.addItem(new sap.m.HBox({
							width: "0.5em"
						}));

					}

					oSelectItem.addContent(selectItemHbox);

					if (this.getDialogType() === "popover") {
						this.popoverSelect = new sap.m.Popover({
							visible: false,
							contentHeight: "15em",
							contentWidth: this.getPopoverWidth(),
							verticalScrolling: false,
							title: "Select a value",
							afterClose: function () {}.bind(this)
						});
					} else {
						this.popoverSelect = new sap.m.Dialog({
							visible: false,
							contentHeight: "40%",
							contentWidth: "40%",
							verticalScrolling: false,
							title: "Select a value",
							afterClose: function () {}.bind(this)
						});
					}

					this.popoverSelect.addStyleClass('smallScrollBar');

					this.selectList = new sap.m.List();

					if (this.getBinding('singleValue').getModel().getMetadata().getParent().getName() === 'sap.ui.model.json.JSONModel') {

						this.selectList.setModel(this.getBinding('singleValue').getModel());
						this.selectList.bindItems({
							path: this.getBinding('singleValue').getContext().getPath() + '/' + suggestionAggregation,
							template: oSelectItem,
							length: 9999,
							model: this.getBindingInfo('singleValue').parts[0].model
						});

					} else {

						this.selectList.bindItems({
							path: this.getBindingContext().getCanonicalPath() + '/' + suggestionAggregation,
							template: oSelectItem,
							suspended: true,
							length: 9999
						});

					}

					//---> search toolbar
					var hboxtbar = new sap.m.HBox({
						width: "100%"
					});
					hboxtbar.addItem(new sap.m.HBox({
						width: "0.2em"
					}));
					hboxtbar.addItem(new sap.m.Button({
						icon: "sap-icon://keyboard-and-mouse",
						width: "5em",
						press: function (evt) {
							this.VKM.openBy(this.searchField);
						}.bind(this)
					}));
					hboxtbar.addItem(new sap.m.HBox({
						width: "0.2em"
					}));

					this.searchField = new sap.m.SearchField(this.getId() + 'suggestionSerachField', {
						width: "100%",
						search: function (evt) {

							var flt = new sap.ui.model.Filter({
								path: this.getSuggestionDescrField(),
								operator: sap.ui.model.FilterOperator.Contains,
								value1: evt.getParameter('query').toUpperCase()
							});

							this.selectList.getBinding('items').filter(flt, filterType.Application);

						}.bind(this)
					});

					var fd = new sap.m.FlexItemData({
						growFactor: 1
					});
					this.searchField.setLayoutData(fd);

					hboxtbar.addItem(this.searchField);
					hboxtbar.addItem(new sap.m.HBox({
						width: "0.2em"
					}));
					this.popoverSelect.addContent(hboxtbar);

					var innerScroll = new sap.m.ScrollContainer({
						vertical: true,
						height: "87%"
					});

					innerScroll.addContent(this.selectList);
					this.popoverSelect.addContent(innerScroll);
					if (this.getDialogType() === 'popover') {
						this.popoverSelect.setPlacement('PreferredRightOrFlip');

						//---> footer for popover
						var tb = new sap.m.Toolbar();
						tb.addContent(new sap.m.ToolbarSpacer());
						tb.addContent(new sap.m.Button({
							icon: 'sap-icon://sys-cancel',
							press: function (evt) {
								this.close();
							}.bind(this.popoverSelect)
						}));

						this.popoverSelect.setFooter(tb);

					} else {
						this.popoverSelect.setEndButton(new sap.m.Button({
							icon: 'sap-icon://sys-cancel',
							press: function (evt) {
								this.close();
							}.bind(this.popoverSelect)
						}));
					}

					oControl.addDependent(this.popoverSelect);
					oControl.addContent(hbowinput);

					oControl.addContent(new sap.m.HBox({
						renderType: 'Bare',
						width: '100%',
						height: "1.0em"
					}));

				}

				//--> single value 
				if (inputType == 'NUM') {

					/*//--> simple input control
					this.innerControl = new sap.m.Input({
						id: this.getId() + "-innerControl",
						type: "Number",
						enabled: !this.getReadOnly(),
						change: function (evt) {
							this.fireEvent("change", {});
						}.bind(this)
					});*/

					if (this.getShowSingleVKM() === true && !this.getReadOnly()) {

						//--> external HBox
						var hbowinput = new sap.m.HBox({
							renderType: 'Bare',
							width: '100%',
							alignItems: "Center",
							height: '2.5em'
						});

						//--> simple input control
						var existingCtrl = sap.ui.getCore().byId(this.getId() + "-innerControl");
						if (existingCtrl !== undefined) {
							existingCtrl.destroy(false);
						}
						this.innerControl = new sap.m.Input({
							id: this.getId() + "-innerControl",
							type: "Number",
							enabled: !this.getReadOnly(),
							change: function (evt) {
								this.fireEvent("change", {});
							}.bind(this)
						});

						hbowinput.addItem(this.innerControl);

						//--> VKM Button
						this.selBtn = new sap.m.Button({
							width: '4em',
							visible: true,
							icon: 'sap-icon://keyboard-and-mouse',
							press: function (evt) {

								this.VKM.openBy(this.VKMcontrol, this);

							}.bind(this)

						});

						hbowinput.addItem(new sap.m.HBox({
							renderType: 'Bare',
							width: '0.5em'
						}));

						hbowinput.addItem(this.selBtn);

						this.VKMcontrol = this.innerControl;

					} else {

						//--> simple input control
						var existingCtrl = sap.ui.getCore().byId(this.getId() + "-innerControl");
						if (existingCtrl !== undefined) {
							existingCtrl.destroy(false);
						}
						this.innerControl = new sap.m.Input({
							id: this.getId() + "-innerControl",
							type: "Number",
							enabled: !this.getReadOnly(),
							change: function (evt) {
								this.fireEvent("change", {});
							}.bind(this)
						});
					}

					if (this.getWidth() !== '') {
						this.innerControl.setWidth(this.getWidth());
					}

					if (this.getBinding('singleValue').getModel().getMetadata().getParent().getName() === 'sap.ui.model.json.JSONModel') {

						//---> Json model

						this.innerControl.setModel(this.getBinding('singleValue').getModel());
						this.innerControl.bindProperty('value', {
							path: this.getBinding('singleValue').getContext().getPath() + '/' + this.getBinding('singleValue').getPath(),
							// parameters: {
							// 	$$groupId: 'directGroup'
							// }
							model: this.getBindingInfo('singleValue').parts[0].model
						});

					} else {

						//---> odata model
						this.innerControl.bindProperty('value', {
							path: this.getBinding('singleValue').getPath(),
							parameters: {
								$$groupId: 'directGroup'
							}
						});

					}

					if (this.getShowSingleVKM() === true) {
						oControl.addContent(hbowinput);
					} else {
						oControl.addContent(this.innerControl);
					}

				}

				//--> single value 
				if (inputType == 'DATE') {

					//--> simple input control
					var existingCtrl = sap.ui.getCore().byId(this.getId() + "-innerControl");
					if (existingCtrl !== undefined) {
						existingCtrl.destroy(false);
					}
					this.innerControl = new sap.m.DatePicker({
						id: this.getId() + "-innerControl",
						enabled: !this.getReadOnly(),
						//valueFormat: 'yyyyMMdd',
						change: function (evt) {
							this.fireEvent("change", {});
						}.bind(this)
					});

					if (this.getWidth() !== '') {
						this.innerControl.setWidth(this.getWidth());
					}

					if (this.getBinding('singleValue').getModel().getMetadata().getParent().getName() === 'sap.ui.model.json.JSONModel') {

						//---> Json model

						this.innerControl.setModel(this.getBinding('singleValue').getModel());
						this.innerControl.bindProperty('value', {
							parts: [{
								'type': 'sap.ui.model.type.Date',
								'path': this.getBinding('singleValue').getContext().getPath() + '/' + this.getBinding('singleValue').getPath(),
								'formatOptions': {
									'source': {
										'pattern': 'yyyyMMdd'
									}
								}
							}],
							model: this.getBindingInfo('singleValue').parts[0].model
						});

					} else {

						//---> odata model
						this.innerControl.bindProperty('value', {
							parts: [{
								'type': 'sap.ui.model.type.Date',
								'path': this.getBinding('singleValue').getPath(),
								'formatOptions': {
									'source': {
										'pattern': 'yyyyMMdd'
									}
								}
							}],
							parameters: {
								$$groupId: 'directGroup'
							}
						});

					}

					oControl.addContent(this.innerControl);

				}

				//--> single value 
				if (inputType == 'TIME') {

					//--> simple input control
					this.innerControl = new sap.m.TimePicker({
						id: this.getId() + "-innerControl",
						//valueFormat: "HH:mm",
						//displayFormat: "HH:mm",
						enabled: !this.getReadOnly(),
						change: function (evt) {
							this.fireEvent("change", {});
						}.bind(this)
					});

					if (this.getWidth() !== '') {
						this.innerControl.setWidth(this.getWidth());
					}

					if (this.getBinding('singleValue').getModel().getMetadata().getParent().getName() === 'sap.ui.model.json.JSONModel') {

						//---> Json model

						this.innerControl.setModel(this.getBinding('singleValue').getModel());
						this.innerControl.bindProperty('value', {
							path: this.getBinding('singleValue').getContext().getPath() + '/' + this.getBinding('singleValue').getPath(),
							// parameters: {
							// 	$$groupId: 'directGroup'
							// }
							model: this.getBindingInfo('singleValue').parts[0].model
						});

					} else {

						//---> odata model
						innerControl.bindProperty('value', {
							path: this.getBinding('singleValue').getPath(),
							parameters: {
								$$groupId: 'directGroup'
							}
						});

					}

					oControl.addContent(this.innerControl);

				}

			} else { //-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

				//--> multi value

				//--> multi value with suggestions
				if (inputType == 'CHAR' && hasSuggestion !== '') {

					oControl.addContent(new sap.m.HBox({
						renderType: 'Bare',
						width: '100%',
						height: "1.0em"
					}));

					//--> external HBox
					var innerControl = new sap.m.HBox({
						renderType: 'Bare',
						width: '100%'
					});

					if (this.getWidth() !== '') {
						innerControl.setWidth(this.getWidth());
					}

					//--> the selection button
					this.selBtn = new sap.m.Button({
						width: '100%',
						type: 'Accept',
						text: 'Add',
						visible: !this.getReadOnly(),
						press: function (evt) {

							//--> resume binding
							if (this.selectList.getBinding('items').isSuspended()) {
								this.selectList.getBinding('items').resume();
							}

							this.popoverSelect.setVisible(true);
							if (this.getDialogType() === 'popover') {
								this.popoverSelect.openBy(this.selBtn);
							} else {
								this.popoverSelect.open();
							}

						}.bind(this)

					});

					this.selBtn.setIcon('sap-icon://group-2');

					innerControl.addItem(this.selBtn);

					//---> helper selection list popover
					var oSelectItem = new sap.m.CustomListItem({
						type: 'Active',
						press: function (evt) {

							var newItem = new Object();

							//--->add new value in list
							newItem.atnam = this.getBindingContext(this.getBindingInfo('singleValue').parts[0].model).getObject().atnam;
							newItem.class = this.getBindingContext(this.getBindingInfo('singleValue').parts[0].model).getObject().class;
							newItem.klart = this.getBindingContext(this.getBindingInfo('singleValue').parts[0].model).getObject().klart;
							newItem.refObjectId1 = this.getBindingContext(this.getBindingInfo('singleValue').parts[0].model).getObject().refObjectId1;
							newItem.refObjectId2 = this.getBindingContext(this.getBindingInfo('singleValue').parts[0].model).getObject().refObjectId2;
							newItem.refObjectId3 = this.getBindingContext(this.getBindingInfo('singleValue').parts[0].model).getObject().refObjectId3;
							newItem.refObjectType = this.getBindingContext(this.getBindingInfo('singleValue').parts[0].model).getObject().refObjectType;
							newItem.atwrt = evt.getSource().getBindingContext(this.getBindingInfo('singleValue').parts[0].model).getObject()[this.getSuggestionIdField()];

							var listBind = this.multilist.getModel().bindList(this.multilist.getBinding('items').getPath(), undefined, undefined,
								undefined, {
									$$groupId: 'batchGroupAPI',
									$$updateGroupId: 'batchGroupAPI'
								});

							listBind.create(newItem);
							this.multilist.getModel().submitBatch('batchGroupAPI').then(function () {
								this.multilist.getBinding('items').refresh();
								this.fireEvent("change", {});
							}.bind(this));

							this.popoverSelect.close();
						}.bind(this)
					});

					var selectItemHbox = new sap.m.HBox({
						height: "3em"
					});
					selectItemHbox.addItem(new sap.m.HBox({
						width: "1em"
					}));
					selectItemHbox.addItem(new sap.ui.core.Icon({
						src: "sap-icon://blank-tag"
					}));
					selectItemHbox.addItem(new sap.m.HBox({
						width: "1em"
					}));
					selectItemHbox.setAlignItems('Center');

					var lbl1 = new sap.m.Label({
						text: "{" + this.getSuggestionIdField() + "}"
					});
					lbl1.addStyleClass('boldHI');
					selectItemHbox.addItem(lbl1);

					selectItemHbox.addItem(new sap.m.HBox({
						width: "0.5em"
					}));
					selectItemHbox.addItem(new sap.m.Label({
						text: "{" + this.getSuggestionDescrField() + "}"
					}));

					selectItemHbox.addItem(new sap.m.HBox({
						width: "0.5em"
					}));

					oSelectItem.addContent(selectItemHbox);

					this.popoverSelect = new sap.m.Popover({
						visible: false,
						contentHeight: "15em",
						contentWidth: this.getPopoverWidth(),
						verticalScrolling: false,
						title: "Select a value",
						afterClose: function () {
							this.popoverSelect.setVisible(false);
						}.bind(this)
					});

					this.popoverSelect.addStyleClass('smallScrollBar');

					this.selectList = new sap.m.List();

					if (this.getBinding('singleValue').getModel().getMetadata().getParent().getName() === 'sap.ui.model.json.JSONModel') {

						this.selectList.setModel(this.getBinding('singleValue').getModel());
						this.selectList.bindItems({
							path: this.getBinding('singleValue').getContext().getPath() + '/' + suggestionAggregation, //<--- absolute model patch (need resume)
							template: oSelectItem,
							length: 9999,
							model: this.getBindingInfo('singleValue').parts[0].model
						});

					} else {

						this.selectList.bindItems({
							path: this.getBindingContext().getCanonicalPath() + '/' + suggestionAggregation, //<--- absolute model patch (need resume)
							template: oSelectItem,
							suspended: true,
							length: 9999
						});

					}

					//---> search toolbar
					var hboxtbar = new sap.m.HBox({
						width: "100%"
					});
					hboxtbar.addItem(new sap.m.HBox({
						width: "0.2em"
					}));
					hboxtbar.addItem(new sap.m.Button({
						icon: "sap-icon://keyboard-and-mouse",
						width: "5em",
						press: function (evt) {
							this.VKM.openBy(this.searchField);
						}.bind(this)
					}));
					hboxtbar.addItem(new sap.m.HBox({
						width: "0.2em"
					}));

					this.searchField = new sap.m.SearchField(this.getId() + 'suggestionSerachField', {
						width: "100%",
						search: function (evt) {

							var flt = new sap.ui.model.Filter({
								path: this.getSuggestionDescrField(),
								operator: sap.ui.model.FilterOperator.Contains,
								value1: evt.getParameter('query').toUpperCase()
							});

							this.selectList.getBinding('items').filter(flt, filterType.Application);

						}.bind(this)
					});

					var fd = new sap.m.FlexItemData({
						growFactor: 1
					});
					this.searchField.setLayoutData(fd);

					hboxtbar.addItem(this.searchField);
					hboxtbar.addItem(new sap.m.HBox({
						width: "0.2em"
					}));
					this.popoverSelect.addContent(hboxtbar);

					var innerScroll = new sap.m.ScrollContainer({
						vertical: true,
						height: "100%"
					});

					innerScroll.addContent(this.selectList);
					this.popoverSelect.addContent(innerScroll);
					if (this.getDialogType() === 'popover') {
						this.popoverSelect.setPlacement('PreferredRightOrFlip');

						//---> footer for popover
						var tb = new sap.m.Toolbar();
						tb.addContent(new sap.m.ToolbarSpacer());
						tb.addContent(new sap.m.Button({
							icon: 'sap-icon://sys-cancel',
							press: function (evt) {
								this.close();
							}.bind(this.popoverSelect)
						}));

						this.popoverSelect.setFooter(tb);

					} else {
						this.popoverSelect.setEndButton(new sap.m.Button({
							icon: 'sap-icon://sys-cancel',
							press: function (evt) {
								this.close();
							}.bind(this.popoverSelect)
						}));
					}

					oControl.addContent(this.popoverSelect);

					//---> multi value list
					if (this.getReadOnly() === true) {
						this.multilist = new sap.m.List({
							id: this.getId() + "-innerControlList",
							delete: function (evt) {

								//--> handle delete request for value
								evt.getParameter('listItem').getBindingContext().delete("directGroup").then(function () {
									this.multilist.refresh();
									this.fireEvent("change", {});
								}.bind(this));

							}.bind(this)
						});
					} else {
						this.multilist = new sap.m.List({
							id: this.getId() + "-innerControlList",
							mode: "Delete",
							delete: function (evt) {

								//--> handle delete request for value
								evt.getParameter('listItem').getBindingContext().delete("directGroup").then(function () {
									this.multilist.refresh();
								}.bind(this));

							}.bind(this)
						});
					}

					this.multilist.addStyleClass('listNoLine');

					if (this.getWidth() !== '') {
						this.multilist.setWidth(this.getWidth());
					}

					var listItem = new sap.m.CustomListItem();

					if (this.getBinding('singleValue').getModel().getMetadata().getParent().getName() === 'sap.ui.model.json.JSONModel') {
						this.multilist.setModel(this.getBinding('singleValue').getModel());
					}

					var listEdit = new sap.m.HBox({
						width: "100%"
					});
					var listEditKey = new sap.m.Label();

					if (this.getBinding('singleValue').getModel().getMetadata().getParent().getName() === 'sap.ui.model.json.JSONModel') {
						listEditKey.bindProperty('text', {
							//path: this.getBinding('singleValue').getContext().getPath() + '/' + this.getBinding('singleValue').getPath()
							path: this.getValuesAggregation().split(">")[0] + '>' + this.getBinding('singleValue').getPath()
						});
					} else {
						listEditKey.bindProperty('text', {
							path: this.getBinding('singleValue').getPath()
						});
					}

					listEditKey.addStyleClass('multiInputControlBold');

					var listEditDescr = new sap.m.Label();

					if (this.getBinding('singleDescription').getModel().getMetadata().getParent().getName() === 'sap.ui.model.json.JSONModel') {
						listEditDescr.bindProperty('text', {
							//path: this.getBinding('singleDescription').getContext().getPath() + '/' + this.getBinding('singleDescription').getPath() 
							path: this.getValuesAggregation().split(">")[0] + '>' + this.getBinding('singleDescription').getPath()
						});
					} else {
						listEditDescr.bindProperty('text', {
							path: this.getBinding('singleDescription').getPath()
						});
					}

					listEdit.addItem(listEditKey);
					listEdit.addItem(new sap.m.HBox({
						width: "1em"
					}));

					listEdit.addItem(listEditDescr);

					listItem.addContent(listEdit);

					if (this.getValuesAggregation().indexOf('>') > 0) {

						//--> create inner item
						this.multilist.bindItems({
							path: this.getValuesAggregation(),
							template: listItem,
							length: 9999,
							parameters: {
								//$$groupId: 'directGroup',
								$$updateGroupId: 'directGroup'
							}
						});

					} else {

						//--> create inner item
						this.multilist.bindElement(this.getBindingContext().getCanonicalPath());
						this.multilist.bindItems({
							path: this.getBindingContext().getCanonicalPath() + '/' + this.getValuesAggregation(),
							template: listItem,
							length: 9999,
							parameters: {
								//$$groupId: 'directGroup',
								$$updateGroupId: 'directGroup'
							}
						});

					}

					oControl.addContent(innerControl);
					oControl.addContent(this.multilist);

					oControl.addContent(new sap.m.HBox({
						renderType: 'Bare',
						width: '100%',
						height: "1.0em"
					}));

				}

				//-----------> multi value no suggestions
				if (inputType == 'CHAR' && hasSuggestion == '') {

					oControl.addContent(new sap.m.HBox({
						renderType: 'Bare',
						width: '100%',
						height: "1.0em"
					}));

					//--> combo box single
					var existingCtrl = sap.ui.getCore().byId(this.getId() + "-innerControl");
					if (existingCtrl !== undefined) {
						existingCtrl.destroy(false);
					}
					this.innerControl = new sap.m.List({
						id: this.getId() + "-innerControl",
						mode: "Delete",
						delete: function (evt) {

							//--> handle delete request for value
							evt.getParameter('listItem').getBindingContext().delete("directGroup").then(function () {
								this.innerControl.refresh();
							}.bind(this));

						}.bind(this)
					});

					this.innerControl.addStyleClass('listNoLine');

					if (this.getWidth() !== '') {
						this.innerControl.setWidth(this.getWidth());
					}

					var listItem = new sap.m.CustomListItem();
					this.listEdit = new sap.m.Input({
						visible: !this.getReadOnly()
					});
					this.listEdit.attachChange(function (evt) {

						this.innerControl.getModel().submitBatch('batchGroupAPI').then(function () {
							this.innerControl.getBinding('items').refresh();
							this.fireEvent("change", {});
						}.bind(this));

					}.bind(this));

					this.listEdit.bindValue({
						path: this.getBinding('singleValue').getPath()
					});
					listItem.addContent(this.listEdit);

					if (this.getValuesAggregation().indexOf('>') > 0) {

						this.innerControl.bindItems({
							path: this.getValuesAggregation(),
							template: listItem,
							length: 9999,
							parameters: {
								//$$groupId: 'directGroup',
								$$updateGroupId: 'batchGroupAPI'
							}
						});

					} else {

						//--> create inner item
						this.innerControl.bindElement({
							path: this.getBindingContext().getCanonicalPath()
						});

						this.innerControl.bindItems({
							path: this.getBindingContext().getCanonicalPath() + '/' + this.getValuesAggregation(),
							template: listItem,
							length: 9999,
							parameters: {
								//$$groupId: 'directGroup',
								$$updateGroupId: 'batchGroupAPI'
							}
						});

					}

					//--> add button before
					var addBtn = new sap.m.Button({
						text: "New",
						width: "100%",
						icon: "sap-icon://sys-add",
						type: 'Accept',
						visible: !this.getReadOnly(),
						press: function (evt) {

							var newItem = new Object();
							newItem.atnam = this.getBindingContext().getObject().atnam;
							newItem.class = this.getBindingContext().getObject().class;
							newItem.klart = this.getBindingContext().getObject().klart;
							newItem.refObjectId1 = this.getBindingContext().getObject().refObjectId1;
							newItem.refObjectId2 = this.getBindingContext().getObject().refObjectId2;
							newItem.refObjectId3 = this.getBindingContext().getObject().refObjectId3;
							newItem.refObjectType = this.getBindingContext().getObject().refObjectType;
							newItem.atwrt = '';

							var listBind = this.innerControl.getModel().bindList(this.innerControl.getBinding('items').getPath(), undefined, undefined,
								undefined, {
									$$groupId: 'batchGroupAPI',
									$$updateGroupId: 'batchGroupAPI'
								});

							listBind.create(newItem);
							this.innerControl.getModel().submitBatch('batchGroupAPI').then(function () {
								this.innerControl.getBinding('items').refresh();
								this.fireEvent("change", {});
							}.bind(this));

						}.bind(this)

					});

					oControl.addContent(addBtn);
					oControl.addContent(this.innerControl);

					oControl.addContent(new sap.m.HBox({
						renderType: 'Bare',
						width: '100%',
						height: "1.0em"
					}));

				}

			}

		},

		onAfterRendering: function () {

			/*
						var innerControl;

						if (this.multiControlCreated === false) {
							
							this._createContent(this);

							//--> add dynamic content and set variable to avoid recoursive creation (invalidate triggered)
							this.multiControlCreated = true;
						}*/

		},

		renderer: {

			render: function (oRm, oControl) {
				oRm.write("<div tabindex=\"0\"");
				oRm.writeControlData(oControl);

				//---> write classes (standard ones)
				oRm.writeClasses();

				//---> write styles (from control meta XML data)
				oRm.writeStyles();
				oRm.write(">");

				if (oControl.getContent() !== undefined && oControl.getContent().length > 0) {
					oControl.getContent().forEach(function (ctrl) {
						try {
							ctrl.destroy();
						} catch (exc) {
							//--> ?!
						}
					});

					oControl.getDependents().forEach(function (ctrl) {
						try {
							ctrl.destroy();
						} catch (exc) {
							//--> ?!
						}
					});
				}

				oControl._createContent(oControl);

				oControl.getContent().forEach(function (ctrl) {
					oRm.renderControl(ctrl);
				});

				oControl.getDependents().forEach(function (ctrl) {
					oRm.renderControl(ctrl);
				});

				oRm.write("</div>");
			}
		}
	});
});