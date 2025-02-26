sap.ui.define([
	"sap/ui/layout/form/Form"
], function (form) {
	"use strict";
	return form.extend("it.fiorital.flex5app.controls.FioritalForm", {

		metadata: {
			properties: {
				validationGroups: {
					type: "string",
					defaultValue: ""
				}
			},
			events: {
				onValidationFail: {
					event: {
						type: "Object"
					}
				}
			}
		},

		constructor: function (sId, mSettings) {
			form.prototype.constructor.apply(this, arguments);
		},

		onAfterRendering: function () {
			form.prototype.onAfterRendering.apply(this, arguments);
		},

		//---> alias for runValidation
		validate: function () {
			return this.runValidation();
		},

		runValidation: function () {

			var grpList;
			var isGrpFail = false;

			if (this.getValidationGroups() === '') {

				//--> bulk search of UI childs
				var ctrls = this.$().find('[data-sap-ui]');
				ctrls.each(function (idx) {
					if (ctrls[idx].id) {
						var uiCtrl = sap.ui.getCore().byId(ctrls[idx].id);
						if (uiCtrl && uiCtrl.autoValidateComponent) {
							var singleFail = uiCtrl.autoValidateComponent();
							isGrpFail = isGrpFail || singleFail;
						}
					}
				}.bind(this));

			} else {

				//---> limit to field groups (if specified)
				grpList = this.getValidationGroups().split(' ');

				grpList.forEach(function (sGroup) {

					var ctrls = sap.ui.getCore().byFieldGroupId(sGroup);
					ctrls.forEach(function (sCtrl) {
						if (sCtrl.autoValidateComponent) {
							var singleFail = sCtrl.autoValidateComponent();
							isGrpFail = isGrpFail || singleFail;
						}
					}.bind(this));

				}.bind(this));

			}

			if (isGrpFail === false) {
				this.fireEvent("onValidationFail", {});
			}

			return isGrpFail;

		},

		renderer: "sap.ui.layout.form.FormRenderer" //<--- set standard renderer!

	});
});