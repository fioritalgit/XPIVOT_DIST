sap.ui.define([
		"jquery.sap.global",
		"sap/ui/core/XMLComposite",
		"sap/m/MessageToast",
		"sap/m/MessageBox",
		"sap/ui/model/Filter",
		"sap/ui/model/FilterOperator",
		"sap/ui/model/json/JSONModel",
		"sap/ui/core/format/DateFormat",
		"it/fiorital/fioritalui5lib/formatter/SharedFormatter",
		"it/fiorital/fioritalui5lib/extension/BooleanParseXfeld"
	],
	function (jQuery, XMLComposite, MessageToast, MessageBox, Filter, FilterOperator, jsModel, DateFormat, SharedFormatter, BooleanParseXfeld) {
		"use strict";

		var ObjectStatusManager = XMLComposite.extend("it.fiorital.fioritalui5lib.controls.ObjectStatusesManager", {
			SharedFormatter: SharedFormatter,
			BooleanParseXfeld: BooleanParseXfeld,

			metadata: {
				properties: {
					title: {
						type: "string",
						defaultValue: "Object statuses manager"
					}
				},
				events: {
					afterClose: {
						parameters: {
						
						}
					}

				},
				aggregations: {

				},
				defaultAggregation: "items"
			},

			jsonRequestCompleted: function (event) {
				this.byId('objectStstusesPopover').openBy(this.targetField);
			},

			changeStatus: function (evt) {
				this.jsGeneral.setProperty('/changedStatus', true);
			},

			init: function () {

				//--> super
				XMLComposite.prototype.init.apply(this, arguments);

				this.jsGeneral = new jsModel;

				this.jsStatuses = new jsModel;
				this.jsStatuses.attachRequestCompleted(this.jsonRequestCompleted.bind(this));

				this.byId('objectStstusesPopover').setModel(this.jsStatuses, 'STATUSES');
				this.byId('objectStstusesPopover').setModel(this.jsGeneral, 'GENERAL');

			},

			applySettings: function (mSettings, oScope) {
				//--> super
				XMLComposite.prototype.applySettings.apply(this, arguments);
			},

			openObject: function (evt, targetField, ObjType, ObjId, ObjPosId) {

				this.targetField = targetField;

				this.jsGeneral.setProperty('/changedStatus', false);

				if (ObjPosId === undefined) {
					ObjPosId = '000000';
				}

				this.jsStatuses.loadData(
					evt.getSource().getModel().sServiceUrl + "/ObjectStatus?$filter= objid eq '" + ObjId + "' and objtype eq '" + ObjType +
					"' and objposid eq '" + ObjPosId + "'"
				);

			},

			_onCloseButtonPress: function (evt) {
				this.byId('objectStstusesPopover').close();
				
				//--> allocation event
				this.fireEvent("afterClose", {	});
			},

			_onSaveButtonPress: function (evt) {

				this.saveRequest = this.getModel().bindContext('/SAVE_STATUSES(...)');
				this.saveRequest.setParameter('DATA', JSON.stringify(this.jsStatuses.getData().value));

				this.byId('objectStstusesPopover').setBusy(true);
				this.saveRequest.execute().then(function () {
					this.byId('objectStstusesPopover').setBusy(false);
					this.jsGeneral.setProperty('/changedStatus', false);
				}.bind(this));

			},

			//-----------------------------------------------------------

			formatTimeUpdate: function (val) {

				if (val === '00:00:00' || val === undefined) {
					return '';
				} else {
					return val;
				}

			},

			statusValueBool: function (val) {
				if (val !== undefined && val === 'X') {
					return true;
				} else {
					return false;
				}
			}

		});

		return ObjectStatusManager;

	}, true);