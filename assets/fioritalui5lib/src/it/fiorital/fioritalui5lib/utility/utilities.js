//----------------------------------------------------------------------
// H.T. 05-03-2019 - Utility tools helper functions
//----------------------------------------------------------------------

 
sap.ui.define([], function() {
	"use strict";

	return {
		/**
		 * Test emptyness of object (json), strings and arrays (checks for null, undefined, empty string and 0-length)
		 */
		isEmpty: function(value) {
							//empty string						//undefined						//null			//empty array			//empty json/object
			return typeof value == 'string' && !value.trim() || typeof value == 'undefined' || value === null || value.length === 0 || typeof value == 'object' && jQuery.isEmptyObject(value);
		},
		
		isInitial: function(value){
			var bIsFloatInitial = ( typeof value == 'number' && parseFloat(value) === parseFloat("0") ) || ( typeof value == 'number' && parseInt(value) === parseInt("0") );
			var bIsStringInitial = ( typeof value == 'string' && parseFloat(value) === parseFloat("0") ) || ( typeof value == 'string' && parseInt(value) === parseInt("0") );
			
			return bIsFloatInitial || bIsStringInitial;	
		},
		
		initInfoLabelColorMap: function(sStatus){
			var mInfoLabelStatusToColorMap = new Map(); // eslint-disable-line no-undef
			//AVAILABLE
			//CLAIM_CL
			//CLAIM_OP
			//DELIVERED
			//INVOICED
			//PARKED
			//PART_DEL
			//SHIPPED
			
			mInfoLabelStatusToColorMap.set("AVAILABLE", 8);
			mInfoLabelStatusToColorMap.set("CLAIM_CL", 9);
			mInfoLabelStatusToColorMap.set("CLAIM_OP", 3);
			mInfoLabelStatusToColorMap.set("DELIVERED", 9);
			mInfoLabelStatusToColorMap.set("INVOICED", 5);
			mInfoLabelStatusToColorMap.set("PARKED", 7);
			mInfoLabelStatusToColorMap.set("PART_DEL", 1);
			mInfoLabelStatusToColorMap.set("SHIPPED", 6);
			
			return mInfoLabelStatusToColorMap;
		},
		
		initSapAccentColorMap: function(sColorName){
			var mSapAccentColor = new Map(); // eslint-disable-line no-undef
			
			mSapAccentColor.set("ORANGE", "#E09D00");
			mSapAccentColor.set("RED", "#E6600D");
			mSapAccentColor.set("DARKRED", "#C14646");
			mSapAccentColor.set("PURPLE", "#AB218E");
			mSapAccentColor.set("LIGHTBLUE", "#678BC7");
			mSapAccentColor.set("BLUE", "#0092D1");
			mSapAccentColor.set("LIGHTGREEN", "#1A9898");
			mSapAccentColor.set("GREEN", "#759421");
			
			return mSapAccentColor;
		},
		
		initSapSemanticColorMap: function(sColorName){
			var mSapSemanticColor = new Map(); // eslint-disable-line no-undef
			
			mSapSemanticColor.set("NEGATIVE", "#BB0000");
			mSapSemanticColor.set("CRITICAL", "#E78C07");
			mSapSemanticColor.set("POSITIVE", "#2B7D2B");
			mSapSemanticColor.set("NEUTRAL", "#5E696E");
			mSapSemanticColor.set("INFORMATION", "#427cac");
			
			return mSapSemanticColor; 
		},
		
		getTransportationIcon: function (sCode) {
            var sIcon = "";
            if (sCode === "05") {
                sIcon = "sap-icon://flight";
            } else {
                sIcon = "sap-icon://shipping-status";
            }
            return sIcon;
        },
		
		stripInitialChars: function(sInput, charToStrip){
			if ( sInput && charToStrip ) {
				var strregex="^"+ charToStrip +"+";
				var regexppattern = new RegExp(strregex);
				return sInput.replace(regexppattern,"");
			} 
			return sInput;
		},
		
		alphaOutput: function(sInput){
			return this.stripInitialChars(sInput, "0");
		}
	};
});