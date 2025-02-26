sap.ui.define([
		"jquery.sap.global",
		"sap/ui/core/XMLComposite",
		"sap/ui/model/json/JSONModel",
		"it/fiorital/fioritalui5lib/controls/FileDownload"
	],
	function (jQuery, XMLComposite, jsModel, FileDownload) {
		"use strict";

		var FioritalBatchAttachment = XMLComposite.extend("it.fiorital.fioritalui5lib.controls.FioritalBatchMaster", {

			jsModel: jsModel,
			FileDownload: FileDownload,

			metadata: {
				properties: {

				},
				events: {

				},
				aggregations: {

				},
				defaultAggregation: "items"
			},

			init: function () {

				//--> super
				XMLComposite.prototype.init.apply(this, arguments);

				this.downloadManager = new this.FileDownload();

				this.batchmodel = new this.jsModel();
				this.byId('PopoverBatchMaster').setModel(this.batchmodel, 'BATCHMASTERDATA');

			},

			__internalLoadData: function (evt) {
				this.batchmodel.loadData(this.finalModel.sServiceUrl + "/Batch(batchnr='" + this.batchRequest + "',productcode='" + this.productRequest +
					"',plant='1000')?$expand=BatchFiles");
			},

			openByBatch: function (evt, product, batchId, explicitModel) {

				this.byId('fileUploader').setValue();

				this.batchRequest = batchId;
				this.productRequest = product;

				if (explicitModel === undefined) {
					this.finalModel = this.getModel();
				} else {
					this.finalModel = this.getModel(explicitModel);
				}

				this.__internalLoadData();

				this.byId('PopoverBatchMaster').openBy(evt.getSource());
			},

			applySettings: function (mSettings, oScope) {
				//--> super
				XMLComposite.prototype.applySettings.apply(this, arguments);
			},

			beforeFilesPopoverOpen: function (evt) {

			},

			downloadFile: function (evt) {

				sap.ui.core.BusyIndicator.show(0);
				this.downloadFile = evt.getSource().getBindingContext('BATCHMASTERDATA').getObject();
				var oAction = this.finalModel.bindContext("/BatchFiles(loioId='" + evt.getSource().getBindingContext('BATCHMASTERDATA').getObject()
					.loioId + "')/com.sap.gateway.default.zfioapi.v0001.GET_BATCH_FILE(...)");

				oAction.execute().then(
					function () {

						//---> refresh list
						var ctx = oAction.getBoundContext().getObject();

						this.downloadManager.download('data:application/octet-stream;base64,' + ctx.base64, this.downloadFile.fileName,
							'application/octet-stream');

						sap.ui.core.BusyIndicator.hide();
					}.bind(this),
					function (oError) {
						sap.ui.core.BusyIndicator.hide();
					}.bind(this)
				);

			},

			loadFile: function (evt) {

				var fileReader64 = new FileReader();

				fileReader64.onloadend = function (evt) {

					var base64String = evt.target.result.split('base64,')[1];

					sap.ui.core.BusyIndicator.show(0);

					var oAction = this.finalModel.bindContext("/Batch(batchnr='" + this.batchmodel.getData().batchnr + "',productcode='" + this.batchmodel
						.getData().productcode + "',plant='1000')/com.sap.gateway.default.zfioapi.v0001.CREATE_ATTACHMENT(...)");

					oAction.setParameter("FILE", base64String);
					oAction.setParameter("FILE_NAME", this.byId('fileUploader').FUEl.files[0].name);
					oAction.setParameter("MIME_TYPE", this.byId('fileUploader').FUEl.files[0].type);

					oAction.execute().then(
						function () {

							//---> refresh list
							this.__internalLoadData();

							sap.ui.core.BusyIndicator.hide();
						}.bind(this),
						function (oError) {
							sap.ui.core.BusyIndicator.hide();
						}.bind(this)
					);

				}.bind(this);

				//--> load file with file API
				fileReader64.readAsDataURL(this.byId('fileUploader').FUEl.files[0]);

			},
			
			saveText: function(evt){
			
			
				sap.ui.core.BusyIndicator.show(0);

				var oAction = this.finalModel.bindContext("/Batch(batchnr='" + this.batchmodel.getData().batchnr + "',productcode='" + this.batchmodel
					.getData().productcode + "',plant='1000')/com.sap.gateway.default.zfioapi.v0001.SET_TEXT(...)");

				oAction.setParameter("TEXT", this.byId('batchExtNotes').getValue());

				oAction.execute().then(
					function () {
						sap.ui.core.BusyIndicator.hide();
					}.bind(this),
					function (oError) {
						sap.ui.core.BusyIndicator.hide();
					}.bind(this)
				);	

			},

			deleteFile: function (evt) {

				sap.ui.core.BusyIndicator.show(0);

				var oAction = this.finalModel.bindContext("/Batch(batchnr='" + this.batchmodel.getData().batchnr + "',productcode='" + this.batchmodel
					.getData().productcode + "',plant='1000')/com.sap.gateway.default.zfioapi.v0001.DELETE_ATTACHMENT(...)");

				oAction.setParameter("LOIOID", evt.getSource().getBindingContext('BATCHMASTERDATA').getObject().loioId);

				oAction.execute().then(
					function () {

						//---> refresh list
						this.__internalLoadData();

						sap.ui.core.BusyIndicator.hide();
					}.bind(this),
					function (oError) {
						sap.ui.core.BusyIndicator.hide();
					}.bind(this)
				);

			},

			//--------------------------------------------

			fileIcon: function (mime) {
				switch (mime) {
				case 'PDF':
					return 'sap-icon://pdf-attachment';
					break;
				case 'XLS':
					return 'sap-icon://excel-attachment';
					break;
				case 'PNG':
					return 'sap-icon://background';
					break;
				case 'JPG':
					return 'sap-icon://background';
					break;
				case 'GIF':
					return 'sap-icon://background';
					break;
				case 'BMP':
					return 'sap-icon://background';
					break;
				default:
					return 'sap-icon://document-text';
				}
			},

		});

		return FioritalBatchAttachment;

	}, true);