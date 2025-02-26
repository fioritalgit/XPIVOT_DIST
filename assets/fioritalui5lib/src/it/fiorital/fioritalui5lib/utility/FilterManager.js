sap.ui.define([
	"it/fiorital/fioritalui5lib/utility/utilities"
], function(Utilities) {
	"use strict";

	return {
		
		Utilities: Utilities,
		
		initFilterManagerModel: function(oComponent){
			var	oModel = new sap.ui.model.json.JSONModel({
					headerExpanded: false
				});
			oModel.setDefaultBindingMode("TwoWay");
			oComponent.setModel(oModel, "filterManagerModel");
		},
		
		setDateRange: function(oComponent, iDaysBefore, iDaysAfter, startDatePropertyName, endDatePropertyName){
			var aDates = this._setDateRange(iDaysBefore, iDaysAfter);
			
			oComponent.getModel("filterManagerModel").setProperty("/" + startDatePropertyName, aDates[0]);
			oComponent.getModel("filterManagerModel").setProperty("/" + endDatePropertyName, aDates[1]);
		},
		
		setCreationDateRange: function(oComponent, iDaysBefore, iDaysAfter){
			var aDates = this._setDateRange(iDaysBefore, iDaysAfter);
			
			oComponent.getModel("filterManagerModel").setProperty("/startCreateDate", aDates[0]);
			oComponent.getModel("filterManagerModel").setProperty("/endCreateDate", aDates[1]);
		},
		
		setArrivalDateRange: function(oComponent, iDaysBefore, iDaysAfter){
			var aDates = this._setDateRange(iDaysBefore, iDaysAfter);

			oComponent.getModel("filterManagerModel").setProperty("/startArrivalDate", aDates[0]);
			oComponent.getModel("filterManagerModel").setProperty("/endArrivalDate", aDates[1]);
		},
		
		setDepartureDateRange: function(oComponent, iDaysBefore, iDaysAfter){
			var aDates = this._setDateRange(iDaysBefore, iDaysAfter);

			oComponent.getModel("filterManagerModel").setProperty("/startDepartureDate", aDates[0]);
			oComponent.getModel("filterManagerModel").setProperty("/endDepartureDate", aDates[1]);
		},
		
		setUser: function(oComponent, sUser){
			oComponent.getModel("filterManagerModel").setProperty("/user", sUser);
		},
		
		setPurchasingGroup: function(oComponent, sPurchGroup){
			oComponent.getModel("filterManagerModel").setProperty("/purchasingGroup", sPurchGroup);
		},           
		
		setProperty: function(oComponent, sPropertyName, sPropertyValue){
			oComponent.getModel("filterManagerModel").setProperty(sPropertyName, sPropertyValue);
		},
		
		setPropertyNonEmpty: function(oComponent, sPropertyName, sPropertyValue){
			if (sPropertyValue !== '' && sPropertyValue !== undefined){
			  oComponent.getModel("filterManagerModel").setProperty(sPropertyName, sPropertyValue);
			}
		},
		
		setDemandDateRange: function(oComponent, iDaysBefore, iDaysAfter){
			var aDates = this._setDateRange(iDaysBefore, iDaysAfter);
			
			oComponent.getModel("filterManagerModel").setProperty("/startDemandDate", aDates[0]);
			oComponent.getModel("filterManagerModel").setProperty("/endDemandDate", aDates[1]);
		},
		
		getDateRange: function(iDaysBefore, iDaysAfter, bConvertToString){
			var aDates = this._setDateRange(iDaysBefore, iDaysAfter);
			
			//-->convert dates to string
			if(bConvertToString){
				for(var i=0; i<aDates.length; i++){
					aDates[i] = this._datetimeToDateString(aDates[i]);
				}
			}
			return aDates;
		},
		
		createSearchFilterObject: function(aFilterIds, aFilterValues, operator) {
			var oFilterOp, 
				aFilters = [],
				iCount = 0;
			switch (operator){
				case "equal":
					oFilterOp = sap.ui.model.FilterOperator.EQ;
					for (iCount = 0; iCount < aFilterIds.length; iCount = iCount + 1) {
						aFilters.push(new sap.ui.model.Filter(aFilterIds[iCount], oFilterOp, aFilterValues[iCount], ""));
					}
					return aFilters;
				case "contains":
					oFilterOp = sap.ui.model.FilterOperator.Contains;
					for (iCount = 0; iCount < aFilterIds.length; iCount = iCount + 1) {
						aFilters.push(new sap.ui.model.Filter(aFilterIds[iCount], oFilterOp, aFilterValues[iCount]));
					}
					
					return aFilters;
				case "range":
					oFilterOp = sap.ui.model.FilterOperator.BT;
					for (iCount = 0; iCount < aFilterIds.length; iCount = iCount + 2) {
						aFilters.push(new sap.ui.model.Filter(aFilterIds[iCount], oFilterOp, aFilterValues[iCount], aFilterValues[iCount+1]));
					}
					return aFilters;

				default:
					return aFilters;
			}
		},
		
		createMultipleSearchFilterObject: function(aFilterIds, aFilterValues, operator, bAnd) {
			var oFilterOp, 
				aFilters = [],
				iCount = 0;
			switch (operator){
				case "equal":
					oFilterOp = sap.ui.model.FilterOperator.EQ;
					for (iCount = 0; iCount < aFilterIds.length; iCount = iCount + 1) {
						aFilters.push(new sap.ui.model.Filter(aFilterIds[iCount], oFilterOp, aFilterValues[iCount], ""));
					}
					break;
					//return aFilters;

				case "notequal":
					oFilterOp = sap.ui.model.FilterOperator.NE;
					for (iCount = 0; iCount < aFilterIds.length; iCount = iCount + 1) {
						aFilters.push(new sap.ui.model.Filter(aFilterIds[iCount], oFilterOp, aFilterValues[iCount], ""));
					}
					break;

				case "range":
					oFilterOp = sap.ui.model.FilterOperator.BT;
					for (iCount = 0; iCount < aFilterIds.length; iCount = iCount + 2) {
						aFilters.push(new sap.ui.model.Filter(aFilterIds[iCount], oFilterOp, aFilterValues[iCount], aFilterValues[iCount+1]));
					}
					break;

				case "greater":
					oFilterOp = sap.ui.model.FilterOperator.GT;
					for (iCount = 0; iCount < aFilterIds.length; iCount = iCount + 1) {
						aFilters.push( new sap.ui.model.Filter( aFilterIds[iCount], oFilterOp, aFilterValues[iCount] ) );
					}
					break;
					
				case "contains":
					oFilterOp = sap.ui.model.FilterOperator.Contains;
					for (iCount = 0; iCount < aFilterIds.length; iCount = iCount + 1) {
						aFilters.push(new sap.ui.model.Filter(aFilterIds[iCount], oFilterOp, aFilterValues[iCount]));
					}
					break;

				case "notstartswith":
					oFilterOp = sap.ui.model.FilterOperator.NotStartsWith;
					for (iCount = 0; iCount < aFilterIds.length; iCount = iCount + 1) {
						aFilters.push(new sap.ui.model.Filter(aFilterIds[iCount], oFilterOp, aFilterValues[iCount]));
					}
					break;

				default:
					break;
			}
			
			var filter = new sap.ui.model.Filter({
				filters: aFilters,
				and: bAnd
			});
			
			return filter;
		},
		
		mergeFilters: function(aFilters, bAnd){
			var filter = new sap.ui.model.Filter({
				filters: aFilters,
				and: bAnd
			});
			
			return filter;
		},
		
		_setDateRange: function(iDaysBefore, iDaysAfter){
			var dToday = new Date(),
				dStartDate = new Date(),
				dEndDate =  new Date(),
				aDates = [];
			
			if( !Utilities.isEmpty(iDaysBefore) ){
				dStartDate.setDate(dToday.getDate() - iDaysBefore);	
			}else{
				dStartDate.setDate(dToday.getDate() - 2);	
			}
			
			if( !Utilities.isEmpty(iDaysAfter) ){
				dEndDate.setDate(dToday.getDate() + iDaysAfter);
			}else{
				dEndDate.setDate(dToday.getDate() + 3);	
			}
			
			aDates.push(dStartDate);
			aDates.push(dEndDate);
			return aDates;
		},
		
		_datetimeToDateString: function(dDate){
			var sYear = dDate.getFullYear().toString(),
				sMonth = ( dDate.getMonth() + 1 ).toString().padStart(2, "0"),
				sDay = ( dDate.getDate() ).toString().padStart(2, "0");
				
			return sYear + "-" + sMonth + "-" + sDay;	
		},
		
		_datetimeToTimeString: function(dDate){
			var sHours = dDate.getHours().toString().padStart(2, "0"),
				sMinutes = dDate.getMinutes().toString().padStart(2, "0"),
				sSeconds = dDate.getSeconds().toString().padStart(2, "0");
				
			return sHours + ":" + sMinutes + ":" + sSeconds;
		},
	};
});