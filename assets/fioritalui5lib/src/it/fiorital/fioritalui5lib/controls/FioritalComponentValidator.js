/* eslint-disable sap-no-hardcoded-url */
/* eslint no-undef: 0 */
/* eslint-disable */

sap.ui.define([
	"sap/ui/core/Control",
], function (Control) {
	"use strict";
	return Control.extend("it.fiorital.fioritalui5lib.controls.FioritalComponentValidator", {

		metadata: {
			properties: {
				requiredProperty: {
					type: "string",
					defaultValue: ""
				},
				eventChange: {
					type: "string",
					defaultValue: ""
				},
				bindingChangeProperty: {
					type: "string",
					defaultValue: ""
				},
				customValidator: {
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

		//----> must override to inject logic in parent
		setParent: function (cmpParent) {

			Control.prototype.setParent.apply(this, arguments);

			this.componentReference = cmpParent;
			this.componentReference.validationHandled = [];
			this.componentReference.__VALIDATOR_Reference = this; //<--- inject validator object reference in component

			this.componentReference._VALIDATOR_getViewController = this._VALIDATOR_getViewController; //<--- inject function reference to parent component
			this.componentReference.autoValidateComponent = this.autoValidateComponent; //<--- inject function reference to parent component
			this.componentReference._EVENT_attach = this._EVENT_attach;

			//---> post pend function to onAfterRendering
			if (this.componentReference.onAfterRendering) {
				this.onAfterRenderingRef = this.componentReference.onAfterRendering.bind(this.componentReference);
				this.componentReference.onAfterRendering = this.__VALIDATION_onAfterRendering;
			} else {
				this.onAfterRenderingRef = undefined;
			}

		},

		constructor: function () {
			Control.prototype.constructor.apply(this, arguments);
		},

		__VALIDATION_onAfterRendering: function () {

			//--> run base 
			if (this.__VALIDATOR_Reference.onAfterRenderingRef) {
				this.__VALIDATOR_Reference.onAfterRenderingRef();
			}

			//--> attach to pure event management
			if (this.__VALIDATOR_Reference.getEventChange() !== '') {
				
				if ( this.__VALIDATOR_Reference.eventAttached === undefined ){
					
					this.__VALIDATOR_Reference.eventAttached = true;
					this.attachEvent(this.__VALIDATOR_Reference.getEventChange(),this,this._EVENT_attach);
					
				}

			} else {
				//--> auto validation for value binding
				if (this.__VALIDATOR_Reference.getBindingChangeProperty()) {

					var prps = this.__VALIDATOR_Reference.getBindingChangeProperty().split(',');

					prps.forEach(function (sBinding) {
						this.__VALIDATOR_Reference.activateValidationForBinding(sBinding);
					}.bind(this))

				}
			}

		},

		activateValidationForBinding: function (bindingName) {

			//--> auto validation
			var fnd = this.componentReference.validationHandled.find(function (sprop) {
				return sprop.property === bindingName;
			})

			if (this.componentReference.getBinding(bindingName) && fnd === undefined) {
				this.componentReference.validationHandled.push({
					property: bindingName
				});
				this.componentReference.getBinding(bindingName).attachChange(this.componentReference.autoValidateComponent.bind(this.componentReference));
			}

		},
		
		_EVENT_attach: function(evt){
			this.autoValidateComponent(evt);
		},

		autoValidateComponent: function (evt) {

			var isFail = false;
			if (this.getRequired() && this.getProperty(this.__VALIDATOR_Reference.getRequiredProperty()) === '') {
				isFail = true;
				this.setValueStateText('inserimento obbligatorio');
			}

			//--> properties validations
			//..... delegate to component class
			if (this.___componentInternalValidation) { //<--- standard interface !!!
				var compValid = this.___componentInternalValidation();

				//--> manage validation result as object or pure boolean
				if (compValid) {
					if (typeof compValid === 'object') {
						isFail = isFail && compValid.fail;
						if (compValid.fail) {
							this.setValueStateText(compValid.message);
						}
					} else {
						isFail = isFail && compValid;
					}
				}
			}

			//--> custom validation 
			if (this.__VALIDATOR_Reference.getCustomValidator() !== '') {
				var finalFunction = this.__VALIDATOR_Reference.getCustomValidator().replace('.', '');

				var vc = this._VALIDATOR_getViewController();
				var customCheck = vc[finalFunction](this);

				if (customCheck) {

					if (typeof customCheck === 'object') {
						isFail = isFail && customCheck.fail;
						if (customCheck.fail) {
							this.setValueStateText(customCheck.message);
						}
					} else {
						isFail = isFail && customCheck;
					}

				}

			}

			//--> final fail check
			if (isFail) {

				this.fireEvent("onValidationFail", {
					invalidatedControl: this
				});

				this.setValueState('Error');
				return true;
			} else {
				//--> reset status
				this.setValueState();
				this.setValueStateText();
				return false;
			}

		},

		_VALIDATOR_getViewController: function () {

			if (this.viewController) {
				return this.viewController;
			}

			this.parent = this;
			do {
				this.parent = this.parent.getParent();
				if (this.parent !== null && this.parent.getMetadata().getName() === 'sap.ui.core.mvc.XMLView') {
					this.viewController = this.parent.getController();
					return this.viewController;
				}
			} while (parent !== null);
		}

	});

}, true);