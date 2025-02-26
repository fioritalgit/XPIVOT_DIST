sap.ui.define([
	"sap/ui/model/json/JSONModel" 
], function (jsModel) {
	"use strict";
	return jsModel.extend("it.fiorital.fioritalui5lib.controls.FioritalLocalJsonModel", {

		metadata: {
			properties: {

			},
			events: {

			}
		},

		constructor: function (paramsJson) {
			
			this.paramsJson = paramsJson;
			
			jsModel.prototype.constructor.apply(this, undefined);
			
			this.name = this.paramsJson.name;
			
			//--> check for local storage existance otherwise retrieve
			this.oStorage = jQuery.sap.storage(jQuery.sap.storage.Type.local);
			
			var modelData = this.oStorage.get(this.paramsJson.name);
			if (modelData === null){
				
				this.attachRequestCompleted(this._requestCompleted.bind(this));
				this.loadData(this.paramsJson.url);
				
			}else{
				this.setData(modelData); //<-- restore data
			}
		},
		
		_requestCompleted: function(){
			this.oStorage.put(this.name,this.getData().value);
			
			//--> take only value
			this.setData(this.getData().value);
		}

	});

}, true);