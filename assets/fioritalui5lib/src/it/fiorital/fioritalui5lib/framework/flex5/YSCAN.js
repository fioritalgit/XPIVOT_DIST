//---> FLEX5 handler
/*eslint-disable */
sap.ui.define(["sap/ui/base/ManagedObject", "sap/ui/events/KeyCodes", "sap/base/Log"],
	function (ManagedObect, KeyCodes, Log) {
		"use strict";
		return ManagedObect.extend('it.fiorital.fioritalui5lib.framework.flex5.YSCAN', {
			metadata: {
				properties: {
					bufferKey: { 
						type: "string", //<--- buffered keys
						defaultValue: ""
					},
					active: {
						type: "boolean",
						defaultValue: "true"
					}
				}
			},

			//--> MAD - Detect whether input came from scanner or keyboard device
			_INTERNAL_resetScannerDetectProperties: function(initTime) {
				
				this.prevCalculatedAvgTimeByChar = 0;
				this.calculatedAvgTimeByChar = 0;
				this.avgKeyboardTypingTimePerChar = 40; //<-- IMPORTANT: estimated keyboard typing speed
				this.prevCharTime  = initTime;
				this.firstCharTime = initTime;
				this.lastCharTime  = initTime;
				this.isScanner = false;

			},
			//--> MAD - Detect whether input came from scanner or keyboard device
			
			constructor: function (componentRef,isActive) {

				ManagedObect.call(this);
				
				if (isActive !== undefined){
					this.setActive(isActive);
				}
				
				//--> MAD - Detect whether input came from scanner or keyboard device
				this._INTERNAL_resetScannerDetectProperties(0);
				//--> MAD - Detect whether input came from scanner or keyboard device
				
				this.componentRef = componentRef;
				this.GS1 = false;
				this.keyCodeBuffer = [];
				this.GS1Object = [];
				this.GS1coreCounter = 0;
				this.delayedSetGS1blockId = false;

				//---> -1 = variable with FNC1 separator
				this.GS1blocks = {
					'00': 18,
					'01': 14,
					'02': 1,
					'10': -1,
					'11': 6,
					'13': 6,
					'15': 6,
					'16': 6,
					'17': 6,
					'21': -1,
					'30': -1,
					'3100': 6,
					'3101': 6,
					'3102': 6,
					'3103': 6,
					'37': 8
				};

				//--> start key down event handler
				var bndFct = this._INTERNAL_KeyDownEvent.bind(this);
				$(document).keydown(bndFct);

				window.addEventListener('message', this._INTERNAL_messageEvent.bind(this), false);

			},

			//---> WebMessage event (fired from native code in android scanner device)
			_INTERNAL_messageEvent: function (evt) {

				//---> identify the avtual view and controller
				var idStr = this.componentRef.getId() + "---" + this.componentRef.getMetadata().getRootView().id + "--" + this.componentRef.getMetadata()
					.getRoutingConfig().controlId;
				var appContainer = sap.ui.getCore().byId(idStr);

				var viewId = this.componentRef.getId() + "---" + appContainer.getCurrentPage().getViewName().split('.')[appContainer.getCurrentPage()
					.getViewName().split('.').length - 1];

				var actualView = sap.ui.getCore().byId(viewId);
				var viewController = actualView.getController();

				//---> text is in now fire the event; now check if the controller have the magin method....
				if (viewController._YSCAN_SCAN_EVENT !== undefined) {
					//--> Note: evt.data from android scan device is base64 when fired by scanner or plain text when typed by keyboard
					//--> _YSCAN_SCAN_EVENT must respect 3 parameters signature: scanned data, base64 scanned data, source event
					viewController._YSCAN_SCAN_EVENT(evt.data, evt.data, evt); //<--- direct read message stream content
				}

			},

			//--> Update specific control in YSCAN DEBUG toolbar
			_INTERNAL_setDebugToolbarText: function (actualView, labelId, labelText) {

				var outCtrl = actualView.byId(labelId);
				if (outCtrl !== undefined && labelText !== undefined && labelText !== null) {
					outCtrl.setText(labelText);
				}

			},

			//--> Update typing info in YSCAN DEBUG toolbar
			_INTERNAL_updateDebugToolbar: function (actualView, actualBufferText, actualKey, actualBufferMode) {

				this._INTERNAL_setDebugToolbarText(actualView, 'YSCAN_KEY_CODE', actualKey);
				this._INTERNAL_setDebugToolbarText(actualView, 'YSCAN_MODE', actualBufferMode === "" ? "DEFAULT" : actualBufferMode);
				this._INTERNAL_setDebugToolbarText(actualView, 'YSCAN_BUFFERTEXT', actualBufferText);

			},
			
			//--> MAD - Detect whether input came from scanner or keyboard device
			_INTERNAL_DetectInputDeviceSpeed: function() {
				
				if ( this.getBufferKey().trim() === '' ) {
					this._INTERNAL_resetScannerDetectProperties(Date.now());
				} else {

					//--> Calculate average character typing time ( calculatedAvgTimeByChar variable can be evaluated 
					//--> at runtime to calibrate the value in 'avgKeyboardTypingTimePerChar' hard coded variable )
					if ( this.currCharTime !== 0 ) {
						
						this.prevCharTime = this.currCharTime;
						this.currCharTime = Date.now();
						if ( this.prevCalculatedAvgTimeByChar > 0 ) {
							this.calculatedAvgTimeByChar = ( this.prevCalculatedAvgTimeByChar + ( this.currCharTime - this.prevCharTime ) ) / 2;
						    //Log.info("[ Prev. average estimated type speed: " + this.prevCalculatedAvgTimeByChar + " current type speed: " + ( this.currCharTime - this.prevCharTime ) + " ms, average: " + this.calculatedAvgTimeByChar );
						} else {
							this.calculatedAvgTimeByChar = this.currCharTime - this.prevCharTime;
						}
						this.prevCalculatedAvgTimeByChar = this.calculatedAvgTimeByChar;
						
					}
					
				}
							
			},
			
			//--> Detection of input device estimated on the basis of typing speed
			_INTERNAL_DetectInputDevice: function() {
				
				this.lastCharTime = Date.now();
				this.isScanner = true;
				this.INPUT_DEVICE = "KEYBOARD";
				
				if ( this.getBufferKey().length >= 0 && this.lastCharTime - this.firstCharTime < ( this.getBufferKey().length + 1 ) * this.avgKeyboardTypingTimePerChar /* + 1 for ENTER */ ) {
					this.isScanner = true;
					this.INPUT_DEVICE = "SCANNER";
				}

			},
			//<-- MAD - Detect whether input came from scanner or keyboard device	
			
			_INTERNAL_KeyDownEvent: function (evt) {
				
				//---> avoid processing if disabled
				if (this.getActive() !== true){
					return;
				}
				
				//---> if in input field avoid stop propagation
				var skipProp = true;
				try{
					if (sap.ui.getCore().byId(document.activeElement.parentElement.parentElement.id) instanceof sap.m.Input){
						skipProp = false;
					}
				}catch(exc){
					//---> not available
				}
	
				if (skipProp === true){
				  evt.stopPropagation();
				  evt.preventDefault();
				}

				var intPart = -1;
				var decPart = -1;
				
				//--> MAD - Detect whether input came from scanner or keyboard device	
				this._INTERNAL_DetectInputDeviceSpeed();
				//<-- MAD - Detect whether input came from scanner or keyboard device	
				
				//--> Get current scan buffer
				var actualBufferKey = this.getBufferKey();

				//---> populate buffer & check if
				this.keyCodeBuffer.push(evt.keyCode);
				
				console.log(evt.keyCode);

				//---> enqueue the data
				if (this.GS1coreCounter > 0) {

					if (evt.keyCode !== 16 && evt.keyCode !== 17 && evt.keyCode !== 13) {
						this.subGS1string = this.subGS1string + evt.key;
					}

					this.GS1coreCounter = this.GS1coreCounter - 1;

					if (this.GS1coreCounter === 0) { //<--- fixed lenght reached; new GS1 block
						var GS1object = new Object();
						GS1object.id = this.GS1id;
						GS1object.value = this.subGS1string;
						//GS1object[this.GS1id] = this.subGS1string;
						this.GS1Object.push(GS1object);

						//console.log('GS1 store block value:' + this.subGS1string);

						this.delayedSetGS1blockId = true;
						this.GS1idCounter = 2;

						this.GS1id = '';
						this.subGS1string = '';
					}
				}

				//---> get the GS1 identifier block
				if (this.GS1idCounter > 0 && this.delayedSetGS1blockId === false) {
					this.GS1idCounter = this.GS1idCounter - 1;
					this.GS1id = this.GS1id + evt.key;

					//---> if id is ready start collect values
					if (this.GS1idCounter === 0) {
						//---> must check if extended id
						if (this.GS1id === '31') {
							this.GS1idCounter = 2;
						} else if (this.GS1id === '41') {
							this.GS1idCounter = 1;
						} else {

							//console.log('GS1 block: ' + this.GS1id);

							//---> identify the next lenght
							var coreBlocklen = this.GS1blocks[this.GS1id];
							if (coreBlocklen === -1) {
								//---> variable lenght set a limitless
								this.GS1coreCounter = 999;
							} else {
								this.GS1coreCounter = this.GS1blocks[this.GS1id];
							}

							//console.log('GS1 block expected: ' + this.GS1coreCounter);

						}
					}
				}

				if (this.delayedSetGS1blockId) {
					this.delayedSetGS1blockId = false;
				}

				//---> check for GS1 initiator
				if (this.keyCodeBuffer.length >= 4) {
					var len = this.keyCodeBuffer.length;
					if (this.keyCodeBuffer[len - 1] === 49 && this.keyCodeBuffer[len - 2] === 67 && this.keyCodeBuffer[len - 3] === 16 && this.keyCodeBuffer[len - 4] === 187) {

						//console.log('in GS1');
						this.GS1 = true;
						this.GS1id = '';
						this.subGS1string = '';
						this.GS1idCounter = 2; //<--- next 2 chars will be a GS1 id

					}
				}

				//---> check for GS1 field separator
				if (this.GS1 && this.keyCodeBuffer.length >= 2) {
					var len = this.keyCodeBuffer.length;
					if (this.keyCodeBuffer[len - 1] === 187 && this.keyCodeBuffer[len - 2] === 17) {

						//console.log('>FNC1');

						//--> store the GS1 object
						var GS1object = new Object();
						GS1object.id = this.GS1id;
						GS1object.value = this.subGS1string.substring(0, this.subGS1string.length - 1);
						//GS1object[this.GS1id] = this.subGS1string.substring(0, this.subGS1string.length - 1);
						this.GS1Object.push(GS1object);

						//console.log('GS1 store block value:' + this.subGS1string.substring(0, this.subGS1string.length - 1));

						//--> reset 
						this.GS1id = '';
						this.GS1idCounter = 2; //<--- next 2 chars will be a GS1 id
						this.subGS1string = '';
						this.GS1coreCounter = 0;
					}
				}

				//---> identify the avtual view and controller
				var idStr = this.componentRef.getId() + "---" + this.componentRef.getMetadata().getRootView().id + "--" + this.componentRef.getMetadata()
					.getRoutingConfig().controlId;
				var appContainer = sap.ui.getCore().byId(idStr);

				var viewId = this.componentRef.getId() + "---" + appContainer.getCurrentPage().getViewName().split('.')[appContainer.getCurrentPage()
					.getViewName().split('.').length - 1];

				var actualView = sap.ui.getCore().byId(viewId);

				//--> Prevent exceptions when view/controllers are not yet instanced
				if (actualView !== undefined && actualView.getController() !== undefined) {

					var viewController = actualView.getController();

					//---> get from page the key management custom parameters
					try {
						var scanMode = ''; //<--- by default no special scan mode
						var cdata = actualView.getAggregation('content')[0].getCustomData();
						cdata.forEach(function (s_cdata) {
							if (s_cdata.getKey() === 'YSCAN_scanmode') {
								scanMode = s_cdata.getValue();

								//---> get additional parameters for generic number
								if (scanMode === 'NUM') {
									//---> must get other 2 params
									cdata.forEach(function (s_cdata_inner) {
										if (s_cdata_inner.getKey() === 'YSCAN_maxinteger') {
											intPart = s_cdata_inner.getValue();
										}
										if (s_cdata_inner.getKey() === 'YSCAN_maxdecimal') {
											decPart = s_cdata_inner.getValue();
										}
									});
								}

								//---> get additional parameters for integer number
								if (scanMode === 'INTEGER') {
									//---> must get other 2 params
									cdata.forEach(function (s_cdata_inner) {
										if (s_cdata_inner.getKey() === 'YSCAN_maxinteger') {
											intPart = s_cdata_inner.getValue();
										}
									});
								}
							}
						});
					} catch (exc) {
						//---> no cdata at all!
					}

					if (evt.keyCode === 13) { //<-- CARRIAGE RETURN

						//--> MAD - Statistical detection of SCANNER based on typying speed
						this._INTERNAL_DetectInputDevice();
						//<-- MAD - Statistical detection of SCANNER based on typying speed

						if (this.GS1) {

							if (this.GS1coreCounter > 0) {
								var GS1object = new Object();
								GS1object.id = this.GS1id;
								GS1object.value = this.subGS1string;
								//GS1object[this.GS1id] = this.subGS1string;
								this.GS1Object.push(GS1object);
							}

							if (viewController._YSCAN_SCAN_EVENT !== undefined) {
								
								//---> create SAP json
								var finalbase = new Object();
								finalbase.SCANMODE = 'WGS1';
								finalbase.SCANDATA64 = btoa(JSON.stringify(this.GS1Object));
								
								var finalbase64str = 'base64:'+btoa(JSON.stringify(finalbase));
								
								//--> Add input device/raw/b64 input values to source event
								evt.INPUT_DEVICE = this.INPUT_DEVICE;
								evt.INPUT_VALUE  = this.getBufferKey();
								evt.B64_VALUE    = finalbase64str;
								
								viewController._YSCAN_SCAN_EVENT(this.GS1Object, finalbase64str, evt);

							}
							
						} else {
							
							//---> Manage RAW input: text is in, now fire the event; now check if the controller have the event handler method....
							if (viewController._YSCAN_SCAN_EVENT !== undefined && this.getBufferKey().trim() !== "" ) {

								var b64Obj = new Object();
								
								//--> SCANMODE uniformed to Android scan logic: 
								//b64Obj.SCANMODE = 'RAW';
								b64Obj.SCANMODE = 'SCANNER';
								
								var b64RawValue = new Object();
								b64RawValue.BARCODETYPE = "RAW";
								b64RawValue.BARCODEDATA = this.getBufferKey();
								
								b64Obj.SCANDATA64 = btoa(JSON.stringify(b64RawValue));
								
								var base64str = 'base64:' + btoa(JSON.stringify(b64Obj));
								
								//--> Add input device/raw/b64 input values to source event
								evt.INPUT_DEVICE = this.INPUT_DEVICE;
								evt.INPUT_VALUE  = this.getBufferKey();
								evt.B64_VALUE    = base64str;
								Log.info("[ INPUT DEVICE: " + this.INPUT_DEVICE + " RAW VALUE: " + evt.INPUT_VALUE + "] keyboard assumed typing speed: " + this.avgKeyboardTypingTimePerChar + " ms current average speed per char: " + this.calculatedAvgTimeByChar + " ms");
								//<-- MAD - Statistical detection of SCANNER based on typying speed

								viewController._YSCAN_SCAN_EVENT(this.getBufferKey(), base64str, evt);

							}
							
						}

						this.GS1 = false; //<-- reset GS1 status
						this.GS1id = '';
						this.GS1idCounter = 0;
						this.GS1coreCounter = 0;
						this.subGS1string = '';
						this.keyCodeBuffer = [];
						this.setBufferKey('');
						this.GS1Object = [];
						
						//--> MAD - Statistical detection of SCANNER based on typying speed
						this._INTERNAL_resetScannerDetectProperties(0);
						//<-- MAD - Statistical detection of SCANNER based on typying speed
						
						//--> Update DEBUG toolbar if defined on page
						this._INTERNAL_updateDebugToolbar(actualView, "" /* actualBufferText */ , evt.keyCode, scanMode /* actualBufferMode */ );

					} else if (evt.keyCode === 8) { //<-- Backspace

						if (actualBufferKey.length > 0) {
							actualBufferKey = actualBufferKey.substring(0, actualBufferKey.length - 1);

							this.setBufferKey(actualBufferKey);

							//--> Update DEBUG toolbar if defined on page
							this._INTERNAL_updateDebugToolbar(actualView, actualBufferKey, evt.keyCode, scanMode /* actualBufferMode */ );

						}

					} else if (evt.keyCode === 17 || evt.keyCode === 16 || evt.keyCode === KeyCodes.TAB || evt.keyCode === 20 ) //<-- ctrl / shift / TAB / CapsLock 
					{
						//---> nothing to do only skip		
					} else if (evt.keyCode === 37 || evt.keyCode === 38 || evt.keyCode === 39 || evt.keyCode === 40 || evt.keyCode === 91 || evt.keyCode ===
						18) //<-- arrows
					{

						//--> Update DEBUG toolbar if defined on page
						this.setBufferKey('');
						this._INTERNAL_updateDebugToolbar(actualView, "" /* actualBufferText */ , evt.keyCode, scanMode);

					} else if (evt.keyCode === 27) { //<-- ESC

						//--> Update DEBUG toolbar if defined on page
						this.setBufferKey('');
						this._INTERNAL_updateDebugToolbar(actualView, "" /* actualBufferText */ , evt.keyCode, scanMode);

					} else if (evt.keyCode !== 0) { //<-- MAD Fix 2019.06.12: Prevent NULL keyCode (=) evt.key === "Unidentified"

						var checkEnqueue = true;
						var finalChar = evt.key;

						if ((scanMode === 'CHAR') || (scanMode === 'CHARLOWER') || (scanMode === 'CHARUPPER')) {
							var regexExpr = /^[a-zA-Z]+$/;
							if (evt.key.match(regexExpr) === null) {
								checkEnqueue = false;
							} else {
								if (scanMode === 'CHARLOWER') {
									finalChar = evt.key.toLowerCase();
								}

								if (scanMode === 'CHARUPPER') {
									finalChar = evt.key.toUpperCase();
								}
							}
						}

						if (scanMode === 'INTEGER') {
							var regexExpr = /^[0-9]+$/;
							if (evt.key.match(regexExpr) === null) {
								checkEnqueue = false;
							} else if (actualBufferKey !== undefined && intPart !== -1) {
								if (actualBufferKey.length + 1 > intPart) {
									checkEnqueue = false;
								}
							}
						}

						if (scanMode === 'NUM') {
							var regexExpr = /^[0-9.]+$/;
							if (evt.key.match(regexExpr) === null) {
								checkEnqueue = false;
							} else {

								//--> must check if . is the first one
								if (actualBufferKey === undefined && evt.key === '.') {
									finalChar = '0.';
								} else if ((evt.key === '.') && (actualBufferKey.includes('.') === true)) {
									checkEnqueue = false; //<--- two '.' not admitted
								} else if (evt.key === '.') {
									checkEnqueue = true;
								} else if (actualBufferKey !== undefined && actualBufferKey.includes('.') === true) { //<-- decimal part

									var intDec = actualBufferKey.split('.');
									if (intDec[1].length + 1 > decPart) {
										checkEnqueue = false;
									}

								} else if (actualBufferKey !== undefined && actualBufferKey.includes('.') === false) { //<-- integer part

									var intDec = actualBufferKey.split('.');
									if (intDec[0].length + 1 > intPart) {
										checkEnqueue = false;
									}

								} else { //<--- first number
									checkEnqueue = true;
								}
							}
						}

						if (checkEnqueue) {

							//---> no enter event: enqueue the new char to the buffer
							if (actualBufferKey === undefined) {
								actualBufferKey = finalChar;
							} else {
								actualBufferKey = actualBufferKey + finalChar;
							}

							this.setBufferKey(actualBufferKey);

							//--> Update DEBUG toolbar if defined on page
							this._INTERNAL_updateDebugToolbar(actualView, actualBufferKey, evt.keyCode, scanMode /* actualBufferMode */ );

						}
					}

					//---> fire single keyp ress event
					if (viewController._YSCAN_EVENT_KEYPRESSED !== undefined) {
						
						viewController._YSCAN_EVENT_KEYPRESSED(evt.keyCode, finalChar, evt);
						
					}

				} //<-- if ( actualView !== undefined && actualView.getController() != undefined ) {

			}

		});
	});