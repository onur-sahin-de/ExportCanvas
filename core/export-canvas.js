/**

     * Author: Onur Sahin
     * Date: 30. September 2014
     * Version: 1.6.5
	 
	 Versionierungs-Verlauf
	 * 1.0.0 Start-Version (25. Juli 2014)
	 * * * * Bisher kein Vermerk
	 * 1.0.1 Erhöhung der Revisionsnummer um +1 (Fehlerbehebung) (23. September 2014)
	 * * * * Export ist nun auch über den Internet-Explorer möglich, jedoch nur als HTML-Dokument welches das Canvas-Element beinhaltet (Technisch bisher keine andere Möglichkeit)
	 * 1.0.2 Erhöhung der Revisionsnummer um +1 (Fehlerbehebung) (24. September 2014)
	 * * * * Die Browserspezifische WhiteList bezüglich der MimeTypes wurde hinzugefügt (Infos siehe hier: bit.ly/1uWDqIj)
	 * 1.1.2 Erhöhung der Nebenversionsnummer um +1 (Funktionelle Erweiterung) (24. September 2014)
	 * * * * Es ist jetzt möglich Sprachdateien für die ExportCanvas-Bibliothek zu erstellen
	 * 1.1.3 Erhöhung der Revisionsnummer um +1 (Fehlerbehebung) (26. September 2014)
	 * * * * Die Methode "initBrowserSpecificMimeTypeWhiteList" wurde gegen die Methode "getBrowserSpecificMimeTypeWhiteList" ausgetauscht um 
	 * * * * Zugriffe außerhalb ebenfalls zu ermöglichen. Vorher wurde die Browser-spezifische MimeType-Liste bei der export-Methode initialisiert, 
	 * * * * jedoch waren diese Informationen bei einem Produktiveinsatz vorher schon notwendig
	 * 1.5.3 Erhöhung der Nebenversionsnummer um +4 (Funktionelle Erweiterung) (27. September 2014)
	 * * * * Die Methode "isCanvasExportable" wurde hinzugefügt
	 * * * * Die Konstante CANVAS_NOT_EXPORTABLE, CANVAS_EXPORT_QUALITY_NOT_VALID  wurde in die Sprachdateien mitübernommen
	 * * * * Es wurde eine config.js für die Bibliothek hinzugefügt welches erstmalig die Konstanten MAX_CANVAS_WIDTH_FOR_EXPORT, MAX_CANVAS_HEIGHT_FOR_EXPORT, MIN_EXPORT_QUALITY, MAX_EXPORT_QUALITY beinhalten
	 * * * * Die Methode "setExportQuality" wurde hinzugefügt und deren Überprüfung
	 * 1.6.3 Erhöhung der Nebenversionsnummer um +1 (Funktionelle Erweiterung) (28. September 2014)
	 * * * * Die Methode "isImgExportable" wurde hinzugefügt
	 * 1.6.5 Erhöhung der Revisionsnummer um +2 (Fehlerbehebung) (30. September 2014)
	 * * * * Safari unterstützt nicht das HTML5-Download-Attribut, Alternative im Form eines Octet-Stream implementiert (siehe export-Methode)
	 * * * * Erzeugter Download-Link welches die Canvas-Daten enthält, wird nachdem Download direkt wieder gelöscht um DOM nicht zu belasten "link.parentNode.removeChild(link)"
	 
*/

function ExportCanvas() {
	
	// Eigenschaften bezüglich des Canvas-Exports
	var canvasToExport;
	var canvasDataURL;
	var lastReport;
	var mimeType = "image/png";
	var mimeTypeForImageDownload = "image/octet-stream";
	var mimeTypeWhiteList = new Array("image/png", "image/jpeg");
	var exportQuality = 1.0;
	
	// Browserspezifische Eigenschaften
	// Für weitere Browser-Ermittlungen siehe hier: bit.ly/1pqTR9m
	var isIE = false || !!document.documentMode;
	var isOpera = !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
	var isFirefox = typeof InstallTrigger !== 'undefined';
	var isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;
	var isChrome = !!window.chrome && !isOpera;
	var ieSaveAsDialogFileName = "my-canvas";
	
	// Überprüft ob ein Canvas-Element exportierbar ist
	this.isCanvasExportable = function(canvasID) {
		var canvasContext = document.getElementById(canvasID).getContext("2d");
		if(canvasContext.canvas.width > MAX_CANVAS_WIDTH_FOR_EXPORT || canvasContext.canvas.height > MAX_CANVAS_HEIGHT_FOR_EXPORT) throw SCRIPT_NAME + ": " + CANVAS_NOT_EXPORTABLE;
	}
	
	// Überprüft ob ein IMG-Element exportierbar ist
	this.isImgExportable = function(imgID) {
		var imageElement = document.getElementById(imgID);
		if(imageElement.naturalWidth > MAX_CANVAS_WIDTH_FOR_EXPORT || imageElement.naturalHeight > MAX_CANVAS_HEIGHT_FOR_EXPORT) throw SCRIPT_NAME + ": " + CANVAS_NOT_EXPORTABLE;
	}
	
	// Setze die Qualitätsstufe für den Export fest
	this.setExportQuality = function(getExportQuality) {
		exportQuality = getExportQuality;
	}
	
	// Hole die Dateiendung der Mimetypes
	this.getExtensionOfMimeType = function(getMimeType) {
		var extensionArr = getMimeType.split("/");
		var extension = extensionArr[extensionArr.length-1];
		return extension;	
	}
	
	// Hole die browserspezifischen Whitelist-Angaben bezüglich der MimeTypes
	// Informationen welche WhiteList man für welchen Browser setzt findet man hier: bit.ly/1uWDqIj
	this.getBrowserSpecificMimeTypeWhiteList = function() {
		if(isFirefox) return new Array("image/png", "image/jpeg", "image/bmp");
		if(isOpera || isChrome) return new Array("image/png", "image/jpeg", "image/webp");
		if(isSafari) return new Array("image/png", "image/jpeg", "image/gif");
		if(isIE) return new Array("image/png", "image/jpeg");
	}
	
	// Gebe WhiteList als Array zurück
	this.getMimeTypeWhiteList = function() {
		return mimeTypeWhiteList;
	}

	// Überprüfung der Whitelist bezüglich der MimeTypes
	this.isMimeTypeValid = function() {
		for(var i = 0; i < mimeTypeWhiteList.length; i++) if(mimeTypeWhiteList[i] == mimeType) return true;	
		return false;
	}
	
	// Lädt JS-Dateien in den Head-Bereich
	this.loadJS = function(getPathOfLangFile) {
		var script = document.createElement('script');
		script.src = getPathOfLangFile;
		document.getElementsByTagName("head")[0].appendChild(script);
	}
	
	// Lädt die Sprachdatei
	this.loadLanguageFile = function(getPathOfLangFile) {
		this.loadJS(getPathOfLangFile);
	}
	
	// Lad die Configdatei
	this.loadConfigFile = function(getPathOfLangFile) {
		this.loadJS(getPathOfLangFile);
	}
	
	// Die Methode welches den Export des Canvas-Objektes durchführt
	this.export = function(getCanvasID, successCallback, errorCallback) {
		
		try {
			
			// Falls unser Canvas nicht exportiert werden kann wird eine Exception geworden
			this.isCanvasExportable(getCanvasID);
			
			// Überprüfe ob die Qualitätsstufe des Exports gültig ist
			if(!(exportQuality >= MIN_EXPORT_QUALITY && exportQuality <= MAX_EXPORT_QUALITY)) throw SCRIPT_NAME + ": " + CANVAS_EXPORT_QUALITY_NOT_VALID;

			// Setze die browser-spezifische Whitelist bezüglich der MimeTypes
			mimeTypeWhiteList = this.getBrowserSpecificMimeTypeWhiteList();
			
			// Nur gültige Mimetypes verarbeiten
			if(this.isMimeTypeValid()) {
				
				canvasToExport = document.getElementById(getCanvasID);
				canvasDataURL = canvasToExport.toDataURL(mimeType, exportQuality);
				
				/*
					Da der "image/octet-stream" für die base64-erzeugte URL ( & das HTML5-Download-Attribut) beim IE keine Wirkung hat (sprich kein Download-Dialog erzeugt wird)
					musste eine Alternative her. Die bisher einzig bekannte Alternative für den IE war der Befehl "execCommand" welches
					aber nur ein HTML-Dokument speichern lässt. In diesem Dokument wird die base64-URL in einen img-Tag reingeladen um es beim
					Abspeichern des HTML-Dokumntes zu behalten. MimeTypes werden mit in das zu speichernde HTML-Dokument mitübernommen.
				*/
				if(isIE) {
					// IE-Alternative welches das Canvas in ein HTML-Dokument speichert
					var win = window.open();
					win.document.write("<img src='" + canvasDataURL + "'></img>");
					win.document.execCommand("saveAs", true, ieSaveAsDialogFileName);
					win.document.close();
					win.close();
				} else if(isSafari) {
					// Safari unterstützt kein HTML5-Download-Attribut 
					top.location.href = canvasDataURL.replace(mimeType, mimeTypeForImageDownload);
				} else {
					// Für alle anderen, modernen Browser sollte die Simulation des HTML5-Download-Attributes funktionieren (sprich der Klick darauf)
					var link = document.createElement("a");
					document.getElementsByTagName("body")[0].appendChild(link);
					link.download = EXPORT_FILENAME + "." + this.getExtensionOfMimeType(mimeType);
					link.href = canvasDataURL;
					link.click();
					link.parentNode.removeChild(link);
				}
				
				if (successCallback && typeof(successCallback) === "function") {
					successCallback();
				} else {
					console.log(SCRIPT_NAME + ": " + FIRST_PARAM_NO_FUNC);
				}
				
			} else {
				throw SCRIPT_NAME + ": " + NO_MIMETYPE_SUPPORT_FOR + ": " + this.getMimeType() + ". " + THESE_MIMETYPES_ARE_ALLOWED + ": " + this.getMimeTypeWhiteList().join(",");
			}
			
		} catch(Exception) {

			// Fange zuerst das was wir "geworfen" haben und danach können wir auf die eigentliche Exception aus dem try-Block abfangen "Exception.message"
			if(Exception != "undefined") {
				this.setReport(Exception);
			} else {
				this.setReport(Exception.message);
			}
			
			if (errorCallback && typeof(errorCallback) === "function") {
				errorCallback(lastReport);
			} else {
				console.log(SCRIPT_NAME + ": " + SECOND_PARAM_NO_FUNC);
			}
			
		}
		
	}
	
	// Report setzen
	this.setReport = function(getMessage) {
		lastReport = getMessage;
	}
	
	// Report abholen
	this.setMimeType = function(getMimeType) {
		mimeType = getMimeType;
	}
	
	// Aktuell ausgewählten MimeType holen
	this.getMimeType = function() {
		return mimeType;
	}
	
}
