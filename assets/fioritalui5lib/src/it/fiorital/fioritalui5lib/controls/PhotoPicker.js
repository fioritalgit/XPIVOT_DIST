/**
 * XML usage:
 * 
 * <!-- Fiorital library Namespace declaration: -->
 * <mvc:View controllerName="it.fiorital.ewmapp.controller.VIEW_CONTROLLER ...
 *      xmlns:flib="it.fiorital.fioritalui5lib.controls" ... />
 * 
 * <!-- Control usage: -->
 * <flib:PhotoPicker id="PhotoPicker" 
 *		videoHeight="170rem" videoWidth="170rem" 
 *		canvasWidth="170rem" canvasHeight="170rem" />
 * 
 */
sap.ui.define([
	'sap/ui/core/Control', "sap/base/Log"
], function (Control, Log) {
	"use strict";
	return Control.extend("it.fiorital.flex5app.controls.PhotoPicker", {

		metadata: {
			properties: {
				autoplay: {
					type: 'string',
					defaultValue: "true"
				},
				videoResolution: {
					type: 'string',
					defaultValue: "HD" //<-- VGA/HD
				},
				videoHeight: {
					type: "sap.ui.core.CSSSize",
					defaultValue: "auto"
				},
				videoWidth: {
					type: "sap.ui.core.CSSSize",
					defaultValue: "auto"
				},
				videoFilter: {
					type: 'string',
					defaultValue: "none"
				},
				canvasWidth: {
					type: "sap.ui.core.CSSSize",
					defaultValue: "auto"
				},
				canvasHeight: {
					type: "sap.ui.core.CSSSize",
					defaultValue: "auto"
				},
				hideCanvas: {
					type: "string",
					defaultValue: "true"
				},
				hideCameraSelector: {
					type: "string",
					defaultValue: "true"
				},
				background: {
					type: "sap.ui.core.CSSColor",
					defaultValue: "#ffffff"
				},
				margin: {
					type: "sap.ui.core.CSSSize",
					defaultValue: "5px"
				},
				geoPositionLatitude: {
					type: "string", //<-- sap.ui.model.type.Float
					defaultValue: "0"
				},
				geoPositionLongitude: {
					type: "string", //<-- sap.ui.model.type.Float
					defaultValue: "0"
				},
				geoPositionAltitude: {
					type: "string", //<-- sap.ui.model.type.Float
					defaultValue: "0"
				},
				//--> Acceptable values: "user": front camera, "environment": rear camera
				facingMode: {
					type: "string", 
					defaultValue: "environment" 
				},
				//--> Integer index referred to detected camera devices enumerated in cameraDevices array
				activeCameraIndex: {
					type: "string", 
					defaultValue: ""
				}
			},
			aggregations: {
				content: {
					type: "sap.ui.core.Control"
				}
			},
			events: {
				openCamera: {
					parameters: {
						inputParMap: {
							type: "object"
						}
					}
				},
				takePhoto: {
					parameters: {
						inputParMap: {
							type: "object"
						}
					}
				}
			}
		},

		oNavigator: null,
		oCamera: null,
		_videoParameters: null,
		_displayingVideo: false,
		_stream: null,
		_photoFilters: [
			'grayscale(100%)',
			'blur(5px)',
			'sepia(90%)',
			'brightness(150%)',
			'contrast(150%)',
			'hue-rotate(90deg)',
			'hue-rotate(180deg)',
			'hue-rotate(270deg)',
			'saturate(150%)',
			'invert(100%)',
			''
		],
		cameraDevices: [],

		initCSS: function () {
			//--> initialisation code, in this case, ensure css is imported
			//var libraryPath = jQuery.sap.getModulePath("dalrae.ui"); //get the server location of the ui library
			//jQuery.sap.includeStyleSheet(libraryPath + "/../css/dalrae.css"); //specify the css path relative from the ui folder
		},

		init: function () {

			this._displayingVideo = false;
			this.oNavigator = navigator;

			//--> Initialize camera
			if (this.hasGetUserMedia()) {
				
				try {
					
					//--> IOS Fix: Ask usercamera permission immediately to allow enumeration of defices after rendering
					var mediaConfigPars = this.getVideoConfigPars();
					this.oNavigator.mediaDevices.getUserMedia(mediaConfigPars);
					Log.info('[PhotoPicker] Function navigator.mediaDevices.getUserMedia() supported by browser: initializing camera ..');
				
				} catch(ex) {
					//<-- Nothing to do
				}
				
			} else {
				Log.error('[PhotoPicker] Function navigator.mediaDevices.getUserMedia() NOT supported by browser: camera not working.');
			}

			//--> Take current photo position
			if (this.hasGeolocation()) {

				this.oNavigator.geolocation.getCurrentPosition(
					this.onGeoLocationSuccess.bind(this),
					this.onGeoLocationFailure.bind(this), {
						enableHighAccuracy: true
					}
				);

			} else {
				Log.error('[PhotoPicker] Geolocation is not supported by your browse.');
			}

		},

		isIOSDevice: function iOS(oNav) {
			
			var isIOS = false;
			
			try {
				
				//if ( !oNav ) { oNav = navigator };
				isIOS = [
					'iPad Simulator',
					'iPhone Simulator',
					'iPod Simulator',
					'iPad',
					'iPhone',
					'iPod'
				].includes(oNav.platform)
				//--> iPad on iOS 13 detection
				|| (oNav.userAgent.includes("Mac") && "ontouchend" in document);
				
			} catch(ex) {
				//<-- Nothing to do
			}
			
			return isIOS;
			
		},
		
		/**
		 * Get JSON model containing video minWidth/minHeight according to resolution param.
		 * @param desired resolution : "HD", "VGA"
		 */
		getVideoResolutionPars: function(resolutionType) {
			
			//--> Translate resolution attributes to pixel size
			var resolutionPars = {};
			
			var minWidth  = 0;
			var minHeight = 0;
			
			switch (resolutionType) {
				case "HD":
					minWidth  = 1280;
					minHeight = 720;
					break;
				case "VGA":
					minWidth  = 640;
					minHeight = 480;
					break;
				default:
			}
			
			//--> Video resolution
			if ( minWidth != 0 || minHeight != 0 ) {
				
				resolutionPars = {
					video: {
						width: {
							min: minWidth
						},
						height: {
							min: minHeight
						}
					}
				};
				
			}

			return resolutionPars;
			
		},
		
		/**
		 * Initialize video config parameters 
		 * @param defaultOptions: default JSON options to apply to video
		 */
		getVideoConfigPars: function (customOptions) {

			this._videoParameters = {};

			//--> Set selected fotocamera by id referenced by integer index of availablle this.cameraDevices
		    if ( 
		    	this.getActiveCameraIndex() !== null && 
		    	this.getActiveCameraIndex() !== ""   &&
		    	this.cameraDevices && this.cameraDevices.length > 0  ) {

				//--> Set active camera by camera id of enumerated video devices
		    	this._videoParameters = {
		    		
		    		video: {
		    			deviceId: {
    						exact: this.cameraDevices[this.getActiveCameraIndex() * 1].deviceId
		    			}
		    		}
		    		
				}; //<-- this._videoParameters
				
			//--> Set specified resolution
			var videoResolutionOptions = this.getVideoResolutionPars(this.getVideoResolution());
			
			//--> Merge in this._videoParameters with JSON attributes in videoResolutionOptions  
			$.extend( true, this._videoParameters, videoResolutionOptions );
				
		    } else {
		    
		    	//--> Set active camera by facing mode ( doesn't work on IOS devices )
				this._videoParameters = {
					video: {
						facingMode: 'enviroment'
					}
				}; //<-- this._videoParameters
				
		    }

			//--> Fallback configuration: applied when video empty configuration paramaeters
			if ( !this._videoParameters || JSON.stringify(this._videoParameters) === JSON.stringify({}) ) {

				//--> Default video parameters
				this._videoParameters = {
					video: true,
					audio: false
				};

			}

		    
		    //--> Merge in this._videoParameters JSON attributes found in customOptions  
		    if ( customOptions ) {
				$.extend( true, this._videoParameters, customOptions );
		    }
		    
			return this._videoParameters;

		},

		hasGetUserMedia: function () {
			return (this.oNavigator.mediaDevices && this.oNavigator.mediaDevices.getUserMedia);
		},

		hasCamera: function () {
			return (this.oNavigator.camera !== undefined);
		},

		hasGeolocation: function () {
			return this.oNavigator && this.oNavigator.geolocation;
		},

		/**
		  * Detected available video devices  
		  */
		enumerateCameras: function(mediaDevices) {
			
			this.cameraDevices = [];
			var counter = 1;
			
			//--> Remove all select options
			$('#' + this.getId() + '-select').find('option').remove().end();
			$('<option>').val(" ").text("             ").appendTo('#' + this.getId() + '-select');
    

			//--> Manage change of camera
			var _this = this;
			var idSelect = '#' + _this.getId() + '-select';
			$( idSelect ).change(function(oEvent) {
				var selectedCameraId = $( idSelect + " option:selected" ).val();
				_this._getStream(selectedCameraId);
				
			});

			mediaDevices.forEach(function(mediaDevice) {
			    if (mediaDevice.kind === 'videoinput') {

					var currentCamera = {
						"deviceId" : mediaDevice.deviceId,
						"deviceName": mediaDevice.label || 'Camera ' + (counter++)
					};
					this.cameraDevices[this.cameraDevices.length] = currentCamera;
					
					//--> Add to cameras select box
    				$('<option>').val(currentCamera.deviceId).text(currentCamera.deviceName).appendTo('#' + this.getId() + '-select');
    
				}
			}.bind(this));
			
			return this.cameraDevices;

		},

		setupCamera: function (customOptions) {
			
			var that   = this;
			var oVideo = this._getVideo();
			
			//--> Show/hide camera select box
			this._getCamerasSelect().removeAttr("style");
			if ( this.getHideCameraSelector() === "true" ) {
				this._getCamerasSelect().attr("style","display:none;");
			}
			this._getCamerasSelect().css("width","100%");
			
			//--> Stop all previous running tracks if any
			this.stopCamera();
			
			//--> Set the camera stream on the canvas.
			if (oVideo && !this._displayingVideo) {

				var videoSetupErrorHandler = function() {
					//<-- Nothing to do
				};
				
				this.oNavigator.mediaDevices.enumerateDevices().then(this.enumerateCameras.bind(this)).then(this._getStream.bind(this)).catch(videoSetupErrorHandler);

			}
			
		},

		//--> TRASH Code
		/*
		_setStream: function(videoCameraId) {
			
			var constraints = {
				"video": {
    				"deviceId": {
    					"exact": videoCameraId
					}
				}
    		};
    		
    		this.oNavigator.mediaDevices.getUserMedia(constraints).then(this.setVideoStream.bind(this)).catch(this.handleSetStreamError.bind(this));
    
    		return constraints;

		},
		
		setVideoStream: function(stream) {
			
			//window.stream = stream; // make stream available to console
			var oVideo = this._getVideo();
			oVideo.srcObject = stream;
			
		},
		*/
		//<-- TRASH Code
		
		handleSetStreamError: function(error) {
			//--> Nothing to do
		},

		/**
		 * WIP: not working
		 * Apply CSS filters to video if any ( grayscale, sepia, blur etc .)
		 */
		_applyVideoFilter: function(videoFilter, resetPreviousFilters) {
			
			if ( resetPreviousFilters !== false ) {
				this._getVideo().css("filter", "");
				this._getVideo().css("-webkit-filter", "");
			}

			if ( videoFilter && videoFilter !== "" ) {
				
				this._getVideo().css("filter", videoFilter);
				this._getVideo().css("-webkit-filter", videoFilter);
				
			}

		},
		
		_getStream: function() {
			
			var that   = this;
			var oVideo = this._getVideo();
			var mediaConfigPars = this.getVideoConfigPars();
    		
			// Ask the user for camera access.
			this.oNavigator.mediaDevices.getUserMedia(mediaConfigPars)
				.then(function (stream) {
					
					//--> We have a camera. Let's store the stream for later use
					that._stream = stream;
					oVideo.srcObject = stream;
					oVideo.play();
					that._displayingVideo = true;
					
					this._applyVideoFilter(this.getVideoFilter());
					
				})
				.catch(function (err) {
					Log.error("Problems accessing the camera: " + err);
				});

		},
		
		/**
		 * Get canvas object
		 */
		_getCanvas: function () {
			return jQuery("canvas", jQuery("#" + this.getId())).get(0);
		},

		/**
		 * Get video object
		 */
		_getVideo: function () {
			return jQuery("video", jQuery("#" + this.getId())).get(0);
		},

		/**
		 * Get select object
		 */
		_getCamerasSelect: function () {
			var idSelect = '#' + this.getId() + '-select';
			return jQuery(idSelect);
		},
		
		//------------------------------------------------------------------------------------------------------------------------
		// Public functions
		//------------------------------------------------------------------------------------------------------------------------

		openCamera: function (oEvent, successCallback, failCallback) {

			var _this = this;
			var video = this._getVideo();

			//var videoCfg = this.initVideoResolution(this.getVideoResolution());
			var videoCfg = this.getVideoConfigPars();

			//--> Get access to the camera
			if (this.oNavigator && _this._displayingVideo !== true) {

				//--> Open camera ( user is asked to allow camera usage )
				this.oNavigator.mediaDevices.getUserMedia(
					videoCfg
				).then(function (stream) {
					video.srcObject = stream;
					video.play();
					_this._stream = stream;
					_this._displayingVideo = true;

					_this.oCamera = _this.oNavigator.camera;

					if (!successCallback) {
						successCallback = _this.onPhotoURISuccess;
					}
					if (!failCallback) {
						failCallback = _this.onPhotoURIFail;
					}

				});

			}

		}, //<-- openCamera

		/*
		 * Note: this only sets videoFilter property, do not apply the filter, this is done in 'setupCamera'
		 * Change image filter with rolling logic
		 * @return applied CSS filter name
		 */
		toggleImageFilter: function () {

			var newFilter = null;
			
			try {
				
				var filterIdx = -1;
				for ( var i=0; i<this._photoFilters.length; i++) {
					if ( this._photoFilters[i] === this.getVideoFilter() ) {
						filterIdx = i;
						break;
					}
				}
				
				filterIdx++;
				newFilter = this._photoFilters[filterIdx];
				this.setVideoFilter(newFilter);
				
			} catch (ex) {
				//<-- Nothing to do
			}
			
			return newFilter;

		},

		getDeviceCameras: function() {
			return this.cameraDevices;	
		},
		
		/*
		 * WIP: Apply image filters
		 */
		applyNextFilter: function() {
			this.toggleImageFilter();
		},
		
		/*
		 * Take a picture
		 */
		takePhoto: function (oEvent) {

			var oImageData = null;
			
			try {
				var oCanvas = this._getCanvas();
				var oVideo = this._getVideo();

				var context = oCanvas.getContext('2d');
				if (oCanvas.width && oCanvas.height) {
					context.drawImage(oVideo, 0, 0, oCanvas.width, oCanvas.height);
					oImageData = oCanvas.toDataURL('image/png'); //<-- Alternativ format: mage/webp
				}
			} catch(ex) {
				Log.info("[PhotoPicker] Abort occurred taking photo: " + ex);
			}
			
			return oImageData;

		},

		/**
		 * Stop camera
		 */
		stopCamera: function () {

			try {
				var oVideo = this._getVideo();
				
				if ( oVideo ) {
					oVideo.pause();
					oVideo.src = "";
					
					this._displayingVideo = false;
					if (this._stream) {
						this._stream.getVideoTracks().forEach(function (track) {
							track.stop();
							Log.info("[PhotoPicker] Stopped camera track.");
						});
					}
					oVideo.srcObject = null;
					Log.info("[PhotoPicker] Stopped camera.");
				}
			} catch(ex) {
				Log.info("[PhotoPicker] Abort occurred stopping camera: " + ex);	
			}

		},
		
		//------------------------------------------------------------------------------------------------------------------------
		// Callback definitions
		//------------------------------------------------------------------------------------------------------------------------

		onGeoLocationSuccess: function (position) {

			this.setGeoPositionLatitude(position.coords.latitude);
			this.setGeoPositionLongitude(position.coords.longitude);
			this.setGeoPositionAltitude(position.coords.altitude);

			Log.info("[PhotoPicker] Geoposition latitude: " + position.coords.latitude + " " +
				"longitude: " + position.coords.longitude + " " +
				"altitude: " + position.coords.altitude);

		},

		onGeoLocationFailure: function (error) {
			Log.error("[PhotoPicker] Failed to get geolocation: " + error);
		},

		onTakePhotoFailure: function (error) {
			Log.error("[PhotoPicker] Failed to take picture: " + error);
		},

		onPhotoURISuccess: function (oEvent) {
			this._displayingVideo = true;
			Log.error("[PhotoPicker] Failed to load photo URI : " + oEvent);
		},

		onPhotoURIFail: function (oEvent) {
			Log.error("[PhotoPicker] Failed to get take picture: " + oEvent);
		},
		
		//------------------------------------------------------------------------------------------------------------------------
		// Renderer definition
		//------------------------------------------------------------------------------------------------------------------------

		renderer: function (oRm, oControl) {

			//--> First up, render a div for the ShadowBox
			oRm.write("<div style='background-color:" + oControl.getBackground() + "' display: flex; flex-direction: column;");
			oRm.writeControlData(oControl);
			//--> Add this controls style class (plus any additional ones the developer has specified)
			oRm.addClass("dalrShadowBox");
			oRm.writeClasses(oControl);
			oRm.writeClasses();

			//--> next, iterate over the content aggregation, and call the renderer for each control
			$(oControl.getContent()).each(function () {
				oRm.renderControl(this);
			});

			oRm.write(">");

			//--> Add div styles 
			oRm.write("<div");
			oRm.addStyle("display", "flex");
			oRm.addStyle("flex-direction", "row");
			oRm.addStyle("align-items", "center");
			oRm.addStyle("justify-content", "space-around");
			oRm.writeStyles(); //<-- Write and flush all buffered styles
			oRm.write(">");

			//--> Render video object
			oRm.write("<video");
			oRm.addClass("video");
			oRm.writeClasses(oControl); //<-- Write classes and flush buffer
			oRm.writeAttribute("id", oControl.getId() + "-video");
			oRm.writeAttribute("width", oControl.getVideoWidth());
			oRm.writeAttribute("height", oControl.getVideoHeight());
			oRm.write(" autoplay></video>");

			//--> Button to take picture
			/*
			oRm.write('<button');
			oRm.addClass("className");
			oRm.writeClasses();
			oRm.writeAttribute("id", oControl.getId() + -"button");
			oRm.write(">");
			oRm.write(oControl.getSnapButtonText());
			oRm.write("</button>");
			*/
			
			//--> Canvas used to take a snapshot photo from camera
			oRm.write('<canvas');
			//--> Add canvas styles 
			if (oControl.getHideCanvas() === "true") {
				oRm.addStyle("display", "none");
			}
			oRm.writeStyles();
			oRm.write(">");
			oRm.writeAttribute("id", oControl.getId() + "-canvas");
			oRm.writeAttribute("width", oControl.getCanvasWidth() );
			oRm.writeAttribute("height", oControl.getCanvasHeight());
			oRm.write("</canvas>");

			oRm.write("</div>");

			oRm.write('<select');
			if (oControl.getHideCameraSelector() === "true") {
				oRm.addStyle("display", "none");
			}
			oRm.writeAttribute("width", oControl.getVideoWidth());
			oRm.addClass("className");
			oRm.writeClasses();
			oRm.writeAttribute("id", oControl.getId() + "-select");
			oRm.write(">");
			oRm.write("</select>");

			oRm.write("</div>");

		},
		
		onAfterRendering: function (oRm, oControl) {
			
			//--> Initialization not yet completed
			this.setupCamera();

			//--> Set ACTUAL video size to canvas used to snap pictures
			this.setCanvasWidth(this._getVideo().videoWidth+"px");
			this.setCanvasHeight(this._getVideo().videoHeight+"px");

			/*
			//--> if I need to do any post render actions, it will happen here
			if (sap.ui.core.Control.prototype.onAfterRendering) {
				sap.ui.core.Control.prototype.onAfterRendering.apply(this, arguments); //run the super class's method first
			}
			*/

		}
		
	});

});