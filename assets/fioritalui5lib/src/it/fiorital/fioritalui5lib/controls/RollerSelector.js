/*
 *  H.T. 19/02/2019 - Sample composite component 
 */

/*
   SAMPLE USAGE
   
  <!-- UI5 lib XML namespace declaration -->
  <mvc:View controllerName="it.fiorital.fioritalui5lib.controller.SampleView" ... xmlns:flib="it.fiorital.fioritalui5lib">
  ...
  <!-- Control usage -->
  <flib:controls.RollerSelector id="rollerSelector"></flib:controls.RollerSelector>
   
 */
sap.ui.define(["sap/ui/core/XMLComposite"], function(XMLComposite) {
	var RollerSelector = XMLComposite.extend("it.fiorital.fioritalui5lib.controls.RollerSelector", {
		metadata: {
			aggregations: {
			},
			properties: {
				selected_index: "int",
				left_button_icon: "string",
				right_button_icon: "string",
				left_button_text: "string",
				right_button_text: "string",
				value: "string",
				values: "array", //<-- Allowed rolling values
				editable: "string"
			},
			events: {
				scrollLeftValue: {},
				scrollRightValue: {}
			}
		},
		scrollLeftValue: function(oEvent) {

			var values = this.getProperty("values");
			var selIdx = this.getProperty("selected_index");
			if ( selIdx === undefined ) { selIdx = 0; }
			if ( selIdx > 0 ) {
				selIdx--;
				for ( var key in values[selIdx] ) { var val = values[selIdx][key]; }
				this.setProperty("value",val);
				this.setProperty("selected_index",selIdx);
			}

			//--> Fire event to allow adding custom logic on view when clicked button
			this.fireEvent("scrollLeftValue", {});
			
		},
		scrollRightValue: function(oEvent) {

			var values = this.getProperty("values");
			var selIdx = this.getProperty("selected_index");
			if ( selIdx === undefined ) { selIdx = 0; }
			if ( selIdx < values.length ) {
				selIdx++;
				for ( var key in values[selIdx] ) { var val = values[selIdx][key]; }
				this.setProperty("value",val);
				this.setProperty("selected_index",selIdx);
			}

			//--> Fire event to allow adding custom logic on view when clicked button
			this.fireEvent("scrollRightValue", {});

		},
	});
	return RollerSelector;
}, true);