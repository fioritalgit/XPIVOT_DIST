sap.ui.define([
	"sap/m/Table",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/odata/v4/Context",
	"sap/m/ListBase"
], function (mtable, jsModel, Context, listbase) {
	"use strict";
	return mtable.extend("it.fiorital.flex5app.controls.FioritalGTable", {

		metadata: {
			properties: {
				tableMinLenght: {
					type: "int",
					defaultValue: 200
				}
			},
			events: {
				beforeRendering: {
					parameters: {

					}
				},
				afterRendering: {
					parameters: {

					}
				}
			}
		},

		jsModel: jsModel,
		Context: Context,

		constructor: function (sId, mSettings) {
			mtable.prototype.constructor.apply(this, arguments);

			this.jsModelFakeContext = new this.jsModel;
			this.jsModelFakeContext.setData([{
				_hide_: true
			}]);

		},

		onBeforeRendering: function () {
			this.fireEvent("beforeRendering", {});
			mtable.prototype.onBeforeRendering.apply(this, arguments);
		},
		
		updateItems: function(sReason){
			listbase.prototype.updateItems.apply(this, arguments);
			
			//--> hide fake items
			var itms = this.getItems();
			for (var idx=0;idx<=itms.length-1;idx++){
				if (itms[idx].getBindingContext() !== undefined){
					itms[idx].removeStyleClass("hideFakeRow");
				}else{
					itms[idx].addStyleClass("hideFakeRow");
				}				
			}

		},

		_GetContext: function (iStart, iLength, iMaximumPrefetchSize) {

			//--> get contexts
			var ctxs = this.getBinding('items')._getContexts.apply(this.getBinding('items'), arguments);
			
			if (ctxs.dataRequested === true){
				return ctxs;
			}

			//--> fill with fake ones up to desidered rows
			var rowsCnt = this.getTableMinLenght();
			while (ctxs.length < rowsCnt) {
				ctxs.push(this.jsModelFakeContext.getContext('/0'));
			}

			this.storeContexts = ctxs;
			return ctxs;
		},

		onAfterRendering: function () {

			if (this.getBinding('items')._getContexts === undefined){
				this.getBinding('items')._getContexts = this.getBinding('items').getContexts;
				this.getBinding('items').getContexts = this._GetContext.bind(this);
			}

			mtable.prototype.onAfterRendering.apply(this, arguments);
			this.fireEvent("afterRendering", {});
		},

		renderer: "sap.m.TableRenderer" //<--- set standard renderer!

	});
});