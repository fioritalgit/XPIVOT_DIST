sap.ui.define([
	"sap/ui/core/XMLComposite",
	"sap/m/Label"
], function (Control, Label) {
	"use strict";
	//return Control.extend("it.fiorital.controls.Clock", {
	return Control.extend("it.fiorital.fioritalui5lib.controls.Clock", {
		metadata : {
			properties : {
				value: 	{type : "string", defaultValue : ""},

			},
			aggregations : {
				_label : {type : "sap.m.Label", multiple: false, visibility : "hidden"},
			},
			events : {
				// change : {
				// 	parameters : {
				// 		value : {type : "int"}
				// 	}
				// }
			}
		},
		init : function () {

			//var oLabel = this.getView().byId("oLabel");
			
        	var result = this.getClock();
        	this.setProperty("value",result);

        	//oLabel.setText(result);
        	
        	var that = this;
        	
        	setInterval(function() {
            	var result = that.getClock();
            	//oLabel.setText(result);
            	this.setProperty("value",result);
        	}.bind(this), 1000);
        							
		},
		
		getClock: function() {

          var tday = new Array("Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday");
          var tmonth = new Array("January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December");
          var d = new Date();
          var nday = d.getDay(),
            nmonth = d.getMonth(),
            ndate = d.getDate(),
            nyear = d.getYear(),
            nhour = d.getHours(),
            nmin = d.getMinutes(),
            nsec = d.getSeconds(),
            ap;
          //if (nhour === 0) {
          //  ap = " AM";
          //  nhour = 12;
          //} else if (nhour < 12) {
          //  ap = " AM";
          //} else if (nhour == 12) {
          //  ap = " PM";
          //} else if (nhour > 12) {
          //  ap = " PM";
          //  nhour -= 12;
          //}
          if (nyear < 1000) nyear += 1900;
          if (nmin <= 9) nmin = "0" + nmin;
          if (nsec <= 9) nsec = "0" + nsec;
          var result = nhour + ":" + nmin + ":" + nsec;
          return result;
        },

		setValue: function (iValue) {
			// this.setProperty("value", iValue, true);
			// this.getAggregation("_rating").setValue(iValue);
		}

		/*
		renderer : function (oRM, oControl) {
			
			oRM.write("<div");
			oRM.writeControlData(oControl);
			oRM.addClass("myAppDemoWTProductRating");
			oRM.writeClasses();
			oRM.write(">");
			oRM.renderControl(oControl.getAggregation("_label"));
			oRM.write("</div>");
		}
		*/
		
	});
});