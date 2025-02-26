/* eslint-disable sap-no-location-reload*/

jQuery.sap.require("sap.m.routing.Router");

sap.m.routing.Router.extend("it.fiorital.fioritalui5lib.extension.RouterExt", {

	appId: null,
	
 	constructor: function() {
		sap.m.routing.Router.apply(this, arguments); //<-- Execute super class constructor
		
		this.baseRouteId = '';
		this.firstRouteMatched = true;
		this.attachRouteMatched(this.onRouteMatched);
		this.attachBeforeRouteMatched(this.onBeforeRouteMatched);
	},
	
	/**
	 * Application Id setter
	 */
	setAppId: function(appId) {
		this.appId = appId;
	},
	
	setBasedResetRoute: function(baseRouteId){
	  	this.baseRouteId = baseRouteId;
	},
	
	onBeforeRouteMatched: function(evt){
	
	  if (this.firstRouteMatched === true){
	  	
	  	this.firstRouteMatched = false; //<-- stop check next routings
	  	if (this.baseRouteId !== "" && this.baseRouteId !== evt.getParameter('name')){
	  		
	  		//---> bad navigation; redirect
	  		this.navTo(this.baseRouteId);
	  		window.location.reload();
	  	}
	  }
	},
	
	onRouteMatched: function(evt){
		//---> available
	},
	
	//---> navigation in other monitor (1)
	navToSlave1: function(targetView,obj){
		
		var newMessage = new Object();
		newMessage.target  = 'SLAVE';
		newMessage.command = 'NAVTO';
		newMessage.slaveId = 1;
		newMessage.destinationPage = targetView;
		newMessage.screenData = JSON.stringify(obj);

		//--> Local storage deprecated by UI5
		//var oStorage = localStorage;
		//localStorage.setItem("UI5multiMonitor",JSON.stringify(newMessage));
		var oStorage = jQuery.sap.storage(jQuery.sap.storage.Type.local);
		oStorage.put("UI5multiMonitor",JSON.stringify(newMessage));
		
	},

	//---> navigation in other monitor (2)
	navToSlave2: function(targetView,obj){
		
		var newMessage = new Object();
		newMessage.target = 'SLAVE';
		newMessage.command = 'NAVTO';
		newMessage.slaveId = 2;
		newMessage.destinationPage = targetView;
		newMessage.screenData = JSON.stringify(obj);
		
		//--> Local storage deprecated by UI5
		//var oStorage = localStorage;
		//oStorage.setItem("UI5multiMonitor",JSON.stringify(newMessage));
		var oStorage = jQuery.sap.storage(jQuery.sap.storage.Type.local);
		oStorage.put("UI5multiMonitor",JSON.stringify(newMessage));
		
	},
	
	navToSlave: function(slaveId,targetView,obj){
		
		var newMessage = new Object();
		newMessage.target  = 'SLAVE';
		newMessage.command = 'NAVTO';
		newMessage.slaveId = slaveId;
		newMessage.destinationPage = targetView;
		newMessage.screenData = JSON.stringify(obj);

        //--> Local storage deprecated by UI5
		//var oStorage = localStorage;
		//oStorage.setItem("UI5multiMonitor",JSON.stringify(newMessage));
		var oStorage = jQuery.sap.storage(jQuery.sap.storage.Type.local);
		oStorage.setItem("UI5multiMonitor",JSON.stringify(newMessage));
		
	}

/*
	navTo: function(targetView){
	
		//---> Implements custom navigation events inside single VIEW controllers
		//---> leave function:  _EVENT_NAVIGATE_LEAVE
		//---> arrive function: _EVENT_NAVIGATE_NAVTO
		
		 var targetViewObj;
		 var sourceViewObj;
		 var targetViewController;
		
		 //---> Manage navigation from/to events from actual page	
		 if ( this.appId != null & this.appId != "" ) {
		 	
			 //var masterApp = GV.masterApp;
			 var masterApp = sap.ui.getCore().byId(this.appId);
			 
			 var vArray = masterApp.getCurrentPage().getId().split(".");
			 var sourceViewName = vArray[vArray.length-1];
			 sourceViewObj = sap.ui.getCore().byId(sourceViewName);
			 
			 if (sourceViewObj != undefined){
			 	targetViewController = sourceViewObj.getController();
			 	if (targetViewController._EVENT_NAVIGATE_LEAVE != undefined){
			 		targetViewController._EVENT_NAVIGATE_LEAVE();
			 	}
			 }
		     
			 //---> before navigation code 	
			 var retObj =  sap.ui.core.routing.Router.prototype.navTo.call(this, targetView); // <-- like super()  
			  
			 //---> After navigation code (in view controller)
			 for (var idx=0; idx<masterApp.getPages().length;idx++){
			 	if (masterApp.getPages()[idx].getId().indexOf(targetView) != -1){
			 		targetViewObj = masterApp.getPages()[idx];
			 		break;
			 	}
			 }
			 
			 if (targetViewObj != undefined){
			 	targetViewController = targetViewObj.getController();
			 	if (targetViewController._EVENT_NAVIGATE_NAVTO != undefined){
			 		targetViewController._EVENT_NAVIGATE_NAVTO();
			 	}
			 }
		 
		 }
		 
		 return retObj;
	 
	}
*/

});