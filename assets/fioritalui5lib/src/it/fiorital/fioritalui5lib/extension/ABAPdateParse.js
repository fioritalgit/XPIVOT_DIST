sap.ui.define([
	"sap/ui/model/SimpleType",
	"sap/ui/model/ValidateException",
	"it/fiorital/fioritalui5lib/utility/utilities"
], function (stype, valExc, SharedUtilities) {
	"use strict";
	return stype.extend("it.fiorital.fioritalui5lib.extension.ABAPdateParse", {
		SharedUtilities: SharedUtilities,
		
		formatValue: function(sValue, slnternalType) {
			//-->to format value based on browser language use the following
			//var userLang = navigator.language || navigator.userLanguage;
			
			if (sValue === undefined){
			  return undefined;	
			}else{
				
			  if (sValue === '0000-00-00'){
			  	return undefined;
			  }else{
			  	
			  	//---> from front or from ABAP ?
			  	if (sValue.includes('-') === true){
			  		return new Date(sValue);
			  	}else{
			  		return new Date(sValue.substr(0,4)+'-'+sValue.substr(4,2)+'-'+sValue.substr(6,2));
			  	}
			  }
			  
			}//<-- value undefined

		},
		
		parseValue: function(sValue, slnternalType) {
			
			var y = sValue.getFullYear().toString();
			var m = sValue.getMonth()+1;
			var d = sValue.getDate();
			
			return y.toString()+m.toString().padStart(2,'0')+d.toString().padStart(2,'0');
		},
		
		validateValue: function(sValue) {
			return true;
		}

	});
});

