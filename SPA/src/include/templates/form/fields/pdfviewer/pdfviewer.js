/**
 * PDFViewer
 */

Form.Fields.PDFViewer = function PDFViewer(scope, container, json) {
	this.scope = scope;
	this.container = container;
	this.json = json;

	this.$ = {};
	this.$.container = $(this.container);
	this.$.html = null;

	this.src = "./include/pdfjs/web/viewer.html";

	this.form = this._("^form").get(0);
	this.view = this._("^view").get(0);
	this.tab = this._("^tab").get(0);

	if (this.form.json.name) {
		this.name = this.form.json.name;
	} else {
		this.name = this.json.name;
	}

	this.value = null;
	this.original = null;

	this.changeListeners = [];

	this.init();
};
Form.Fields.PDFViewer.prototype.init = function () {
	var self = this;
	var html = Form.Template(this.json, {
		data: {
			input: true,
		},
	});

	this.$.html = $(html);
	if (this.json.visibility === "hidden")
		this.$.container.parent().addClass("hidden");

	this.$.container.append(this.$.html);
	if (this.json.pdfUrl) {
		this.url = Handlebars.compile(
			this.view.getUrl(this.json.pdfUrl) || this.json.pdfUrl
		);
	} else {
		this.url = "";
	}

	this.window = null;
	this.$.iframe = this.$.container.find("iframe");
	// set onload for binds
	this.$.iframe[0].src = this.src;

	this.$.iframe.load(function () {
		self.window = this.contentWindow;
		self.window.mozL10n.setLanguage(i18n.lng());

		self.window.document.getElementById("reloadPDF").classList.remove("hidden");

		self.form.initPromise.then((x) => {
			self.formReady = true;
			if (self.waitingForForm) {
				self.waitingForForm = false;
				self.reload();
			}
		});

		if (self.json.autoLoad) {
			if (self.$.html.is(":visible")) {
				self.reload();
			} else {
				self.deferring = true;
			}
		}

		self.bind();
		self.i18n();
	});
};
Form.Fields.PDFViewer.prototype.bind = function () {
	var self = this;

	this.window.viewer.addEventListener("textlayerrendered", function () {
		self.$.container.parent().boxUnBusy();
	});

	this.window.document
		.getElementById("fauxPresentationMode")
		.addEventListener("click", toggleFullscreen);
	this.window.document
		.getElementById("secondaryFauxPresentationMode")
		.addEventListener("click", toggleFullscreen);
	function toggleFullscreen() {
		if (
			!(
				document.fullscreenElement ||
				document.mozFullScreen ||
				document.webkitIsFullScreen ||
				document.msFullscreenElement
			)
		) {
			var viewer = self.$.iframe[0];
			var rFS =
				viewer.mozRequestFullScreen ||
				viewer.webkitRequestFullscreen ||
				viewer.msRequestFullscreen ||
				viewer.requestFullscreen;
			rFS.call(viewer);
		} else {
			var ef =
				document.mozCancelFullScreen ||
				document.webkitExitFullscreen ||
				document.msExitFullscreen ||
				document.exitFullscreen;
			ef.call(document);
		}
	}

	this.window.document
		.getElementById("reloadPDF")
		.addEventListener("click", reloadPDF);
	this.window.document
		.getElementById("secondaryReloadPDF")
		.addEventListener("click", reloadPDF);
	function reloadPDF() {
		self.reload();
	}

	this.window.document
		.getElementById("fauxDownload")
		.addEventListener("click", downloadPDF);
	this.window.document
		.getElementById("secondaryFauxDownload")
		.addEventListener("click", downloadPDF);
	function downloadPDF() {
		self.download("pdf");
	}
	// PDFViewerApplication.download();
};
Form.Fields.PDFViewer.prototype.reload = function (data, urlOverride) {
	if (!this.formReady) {
		this.waitingForForm = true;
		return;
	}

	this.$.container.parent().boxBusy();
	if (urlOverride) {
		this.url = Handlebars.compile(urlOverride);
	}

	this.currentPDF = this.url({
		data: encodeURIComponent(JSON.stringify(data || this.form.getData())),
		format: "pdf",
		id: this.form.id,
	});
	this.window.PDFViewerApplication.open(this.currentPDF);
	this.loaded = true;
	this.lastLoad = Date.now();
};
Form.Fields.PDFViewer.prototype.i18n = function () {
	this.window.mozL10n.setLanguage(i18n.lng());
	if (this.loaded && Date.now > this.lastLoad + 3000) this.reload();
};
Form.Fields.PDFViewer.prototype.download = function (format, opts) {
	var self = this;

	if (!format || format.toLowerCase() === "pdf") {
		if (self.json.pdfNamePromise) {
			self.form.actions[self.json.pdfNamePromise](self).then((filename) => {
				self.window.PDFViewerApplication.pdfDocument
					.getData()
					.then(function (d) {
						download(d, filename, "application/pdf");
					});
			});
		} else {
			this.window.PDFViewerApplication.pdfDocument.getData().then(function (d) {
				download(
					d,
					self.tab.$.label.text().trim().replace("[^a-zA-Z0-9.-]", "_") +
						".pdf",
					"application/pdf"
				);
			});
		}
		//this.window.PDFViewerApplication.download();
	} else if (format.toLowerCase() === "excel") {
		var url = this.url({
			data: encodeURIComponent(JSON.stringify(this.form.getData())),
			format: "xlsx",
			id: this.form.id,
		});
		var x = new XMLHttpRequest();
		x.open("GET", url, true);
		x.responseType = "blob";
		x.onload = function (e) {
			download(
				e.target.response,
				self.tab.$.label.text().trim().replace("[^a-zA-Z0-9.-]", "_") + ".xlsx",
				"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
			);
		};
		x.send();
	} else if (format === "custom" && opts) {
		var url = this.url({
			data: encodeURIComponent(JSON.stringify(this.form.getData())),
			format: opts.format,
			id: this.form.id,
		});
		var x = new XMLHttpRequest();
		x.open("GET", url, true);
		x.responseType = "blob";
		x.onload = function (e) {
			download(
				e.target.response,
				self.tab.$.label.text().trim().replace("[^a-zA-Z0-9.-]", "_") +
					"." +
					opts.format,
				opts.mimetype
			);
		};
		x.send();
	}
};
Form.Fields.PDFViewer.prototype.getData = function () {};
Form.Fields.PDFViewer.prototype.get = function () {};
Form.Fields.PDFViewer.prototype.setData = function (data) {
	this.original = data[this.json.id] || "";
	data[this.json.id] = this.original;
	this.set(this.original);
};
Form.Fields.PDFViewer.prototype.set = function (val) {};
Form.Fields.PDFViewer.prototype.reset = function () {};
Form.Fields.PDFViewer.prototype.clear = function () {};
Form.Fields.PDFViewer.prototype.applyFieldBinds = function () {};
Form.Fields.PDFViewer.prototype.validate = function () {
	// stub
};
Form.Fields.PDFViewer.prototype.saveData = function () {};
Form.Fields.PDFViewer.prototype.refresh = function () {
	if (this.deferring) {
		this.deferring = false;
		this.reload();
	}
};
Form.Fields.PDFViewer.prototype.isChanged = function () {};
Form.Fields.PDFViewer.prototype.onChange = function () {};
Form.Fields.PDFViewer.prototype._ = scopeInterface;
Form.Fields.PDFViewer.prototype.is = function (t) {
	if (t === "*") return true;
	return (
		t.toLowerCase() === "PDFViewer".toLowerCase() ||
		t.toLowerCase() === this.json.id.toLowerCase()
	);
};
