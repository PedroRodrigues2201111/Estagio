function AlertController(scope) {
	this.scope = scope;

	this.$ = {};
	this.$.container = $(".main-header .navbar-custom-menu > .nav");
	this.init();
}

AlertController.prototype.init = function () {
	this.alerts = [];
	this.children = [];
	this.nsEvents = {};
	this.$.html = $(AlertController.templates.menu());
	this.$.list = this.$.html.find(".menu");
	this.$.count = this.$.html.find(".alert-count");
	this.$.container.children(".notifications-menu").before(this.$.html);
	this.initSignalR();
	this.bind();
};
AlertController.prototype.initSignalR = function () {
	var self = this;
	var connection = new signalR.HubConnectionBuilder()
		.withUrl("/ControlServerHub")
		.build();
	this.connection = connection;

	var typeMap = {
		warning: "yellow",
		error: "red",
		success: "green",
		info: "blue",
		log: "lightaqua",
		default: "gray",
	};

	connection.on("Hi", function (t) {
		//  console.log("Heyoooooooooooooooo:" + t);
	});

	connection.on("addNewAlertToPage", function (type, message, detail) {
		var severityVar = typeMap[type] || typeMap.default;

		window.notify({
			title: type,
			text: message,
			color: severityVar,
		});
	});

	connection.on("navigate", function (info) {
		var url = info.url;
		window.location = url;
	});

	connection.on("popup", function (info) {
		var severityVar = typeMap[info.type] || typeMap.default;
		var callback = (res) =>
			Tools.Ajax.defaultPost(info.callback, { id: info.id, response: res });

		Tools.Modals.custom({
			buttons: info.buttons,
			title: info.title,
			message: info.message,
			classes: severityVar,
		})
			.then((res) => callback(res))
			.catch((e) => callback());
	});

	connection.on("addNewProgressMessageToPage", function (info) {
		var severityVar = typeMap[info.type] || typeMap.default;

		if (info.alert) {
			self.add({
				id: info.id,
				progress: info.progress,
				title: info.title,
				link: info.link,
				unsafe: info.unsafe,
				message: info.message,
				progress_status: info.status,
				details: info.detail,
				severity: severityVar,
				icon: info.icon,
			});
		}

		if (info.popup) {
			window.notify({
				title: info.title,
				text: info.message,
				color: severityVar,
			});
		}
	});

	connection.on("emitEvent", function (dados, namespace, events) {
		self.emit(namespace, events, dados);
	});

	connection.on("close", function () {
		console.log("Server called close");
		self.stopSignalR();

		if (!window.loggingOut) main.auth.lock();
	});

	// Start the connection.
	if (!main.storage.get("nosignalr")) {
		this.connectSignalR(function () {
			// ready
		});
		main.auth.$userArea
			.find('[data-id="toggle-signalR"] input')
			.prop("checked", true);
	} else {
		console.log("No SignalR");
		main.auth.$userArea
			.find('[data-id="toggle-signalR"] input')
			.prop("checked", false);
	}
};
AlertController.prototype.stopSignalR = function (callback) {
	// TODO: Redo

	return;
	$.connection.hub.stop();
};
AlertController.prototype.connectSignalR = function (callback) {
	var self = this;
	console.log("SignalR connecting");
	this.connection
		.start()
		.then(function () {
			self.connection.invoke("Hello").catch(function (err) {
				console.error(err.toString());
			});
			console.log("SignalR connected");
			callback && callback();
		})
		.catch(function (err) {
			console.error(err.toString());
		});

	// TODO: Test
	return;
	if ($.connection && $.connection.hub && this.signalRinited) {
		console.log("SignalR connecting");
		$.connection.hub.start().done(function () {
			console.log("SignalR connected");
			callback && callback();
		});
	}
};
AlertController.prototype.bind = function (ev) {
	var self = this;
	this.$.html.find(".clear-all").on("click", function (ev) {
		self.$.html.find(".dismiss").trigger("click");
	});
};
AlertController.prototype.removeAlert = function (alert) {
	var i = this.alerts.indexOf(alert);

	this.alerts.splice(i, 1);

	var j = this.children.indexOf(alert);

	this.children.splice(j, 1);

	var newCount = this.alerts.length;
	this.$.count.text(newCount > 0 ? newCount : "");
};
AlertController.prototype.i18n = function () {
	this.$.html.i18n();
};
AlertController.prototype.add = function (alert) {
	if (alert.id) {
		var i = this.alerts.findIndex(function (a) {
			return a.alert.id === alert.id;
		});
		if (i > -1) {
			this.alerts[i].update(alert);
			this.alerts.unshift(this.alerts.splice(i, 1)[0]);
			return;
		}
	}

	this.alerts.unshift(new Alert(this, this.$.list, alert));
	this.$.count.text(((this.$.count.text() || 0) | 0) + 1);
};
AlertController.prototype.on = function (ns, events, handler) {
	if (typeof ns !== "string" || ns.length === 0) {
		console.error(
			"Alerts: A non-string / empty value isn't a valid namespace."
		);
		return;
	}
	if (typeof events !== "string" || events.length === 0) {
		console.error("Alerts: A non-string / empty value isn't a valid event.");
		return;
	}
	if (typeof handler !== "function") {
		console.error("Alerts: A non-function value isn't a valid handler.");
		return;
	}

	var self = this;
	var evts = events.split(/\s+/);
	this.nsEvents[ns] = this.nsEvents[ns] || {};

	evts.forEach(function (e) {
		if (e.length === 0) return;

		self.nsEvents[ns][e] = self.nsEvents[ns][e] || [];
		self.nsEvents[ns][e].push(handler);
	});

	console.log("Events: ", self.nsEvents);
};
AlertController.prototype.off = function (ns, events, handler) {
	if (typeof ns !== "string" || ns.length === 0) {
		console.error(
			"Alerts: A non-string / empty value isn't a valid namespace."
		);
		return;
	}
	if (typeof events !== "string" || events.length === 0) {
		console.error("Alerts: A non-string / empty value isn't a valid event.");
		return;
	}
	if (
		typeof handler !== "function" &&
		!(typeof handler === "undefined" || handler === null)
	) {
		console.error(
			"Alerts: A non-function / non-null value isn't a valid handler value."
		);
		return;
	}

	if (!this.nsEvents[ns]) return;

	var self = this;
	var evts = events.split(/\s+/);

	evts.forEach(function (e) {
		if (e.length === 0) return;

		if (!self.nsEvents[ns][e]) return;

		if (typeof handler === "function") {
			var i = self.nsEvents[ns][e].indexOf(handler);
			if (i > -1) {
				self.nsEvents[ns][e].splice(i, 1);
			}
		} else {
			self.nsEvents[ns][e] = [];
		}
	});
};
AlertController.prototype.emit = function (ns, events, data) {
	if (!this.nsEvents[ns]) return;

	var self = this;
	var evts = events.split(/\s+/);

	evts.forEach(function (e) {
		console.log("Event: " + e);
		if (e.length === 0) return;

		if (!self.nsEvents[ns][e]) return;

		var ev = {
			ns: ns,
			data: data,
			event: e,
		};

		for (var i = 0; i < self.nsEvents[ns][e].length; i++)
			self.nsEvents[ns][e][i].call(ev, ev, data);
	});
};

AlertController.prototype._ = scopeInterface;
AlertController.prototype.is = scopeCompare;
AlertController.templates = {
	menu:
		'<li class="dropdown messages-menu alert-menu">' +
		'  <a aria-expanded="false" href="#" class="alert-toggle" data-toggle="dropdown">' +
		'    <i class="fa fa-bell"></i>' +
		'    <span class="label alert-count" style="background-color:rgb(37, 41, 71)"></span>' +
		"  </a>" +
		'  <ul class="dropdown-menu dropdown-menu-right alerts">' +
		'    <li class="header">' +
		'      <div class="clear-all btn-xs btn btn-flat btn-default">' +
		'        <span data.i18n="ap.core.clear-all">Limpar todos</span><i class="fa fa-fw fa-times"></i>' +
		"      </div>" +
		"    </li>" +
		"    <li>" +
		'      <div style="position: relative; width: auto;" class="slimScrollDiv">' +
		'        <ul style="width: 100%;" class="menu">' +
		'          <li class="no-alerts">' +
		'            <div class="text">' +
		'              <span class="title">Sem alertas.</span>' +
		"            </div>" +
		"          </li>" +
		"        </ul>" +
		"      </div>" +
		"    </li>" +
		'    <li class="footer hidden"><a href="#">Ver todos</a></li>' +
		"  </ul>" +
		"</li>",
	item:
		'<li class="alert-container">' +
		'  <div class="alert-item" {{#if severity}} style="border: 0px solid {{severity}};border-left-width:8px" {{/if}}>' +
		"    <h4>" +
		'      <span class="icon">' +
		'        {{#if icon}}<i class="{{icon}}"></i>{{/if}}' +
		"      </span>" +
		'      <span class="title">{{title}}</span>' +
		"      <small>" +
		'        <i class="fa fa-clock-o"></i>' +
		'        <span class="time" data-time="{{dateISO}}">{{time}}</span>' +
		'        <i class="dismiss fa fa-times"></i>' +
		'        <div class="actions">' +
		"          {{#if link}}" +
		'            <a href="{{link}}"><i class="navigate fa fa-list"></i></a>' +
		"          {{/if}}" +
		"        </div>" +
		"      </small>" +
		"    </h4>" +
		"    {{#if message}}" +
		"      {{#if unsafe}}" +
		'        <div class="message">{{{message}}}</div>' +
		"      {{else}}" +
		'        <p class="message">{{message}}</p>' +
		"      {{/if}}" +
		"    {{/if}}" +
		"    {{#if progress}}" +
		'      <div class="progress sm{{#eq progress "undefined"}} active{{/eq}}">' +
		'        <div class="progress-bar {{#eq progress "undefined"}} progress-bar-striped{{/eq}} progress-bar-' +
		"          {{~#if progress_status ~}}" +
		'            {{~#eq progress_status "success" ~}}' +
		"              green" +
		'            {{~else eq progress_status "warning" ~}}' +
		"              yellow" +
		'            {{~else eq progress_status "error" ~}}' +
		"              red" +
		"            {{~/eq ~}}" +
		"          {{~else ~}}" +
		"            blue" +
		"          {{~/if ~}}" +
		'          " style="width: {{#eq progress "undefined"}}100{{else}}{{progress}}{{/eq}}%">' +
		"        </div>" +
		"      </div>" +
		"    {{/if}}" +
		"    {{#if details}}" +
		'      <div class="well well-sm collapsed">' +
		'        <p class="details">{{details}}</p>' +
		"      </div>" +
		"    {{/if}}" +
		"  </div>" +
		"</li>",
	popup:
		"<div>" +
		"  <div>" +
		"    {{#if message}}" +
		"      {{#unless unsafe}}" +
		'        <span class="message">' +
		'          <p class="message">{{message}}</p>' +
		"        </span>" +
		"      {{else}}" +
		'        <div class="message">{{{message}}}</div>' +
		"      {{/unless}}" +
		"    {{/if}}" +
		'    <span class="pull-right">' +
		"          {{#if link}}" +
		'            <a href="{{link}}"><i class="navigate fa fa-list"></i></a>' +
		"          {{/if}}" +
		'      <i class="fa fa-clock-o"></i>' +
		'      <span class="time" data-time="{{dateISO}}">{{time}}</span>' +
		"    </span>" +
		"  </div>" +
		"  {{#if progress}}" +
		'    <div class="progress{{#eq progress "undefined"}} active{{/eq}}" style="margin-bottom: 5px;">' +
		'      <div class="progress-bar {{#eq progress "undefined"}} progress-bar-striped{{/eq}} progress-bar-' +
		"        {{~#if progress_status ~}}" +
		'          {{~#eq progress_status "success" ~}}' +
		"            green" +
		'          {{~else eq progress_status "warning" ~}}' +
		"            yellow" +
		'          {{~else eq progress_status "error" ~}}' +
		"            red" +
		"          {{~else ~}}" +
		"            blue" +
		"          {{~/eq ~}}" +
		"        {{~else ~}}" +
		"          blue" +
		"        {{~/if ~}}" +
		'        " style="width: {{#eq progress "undefined"}}100{{else}}{{progress}}{{/eq}}%">' +
		"        <span>" +
		"          {{#if progress_text}}" +
		"            {{progress_text}}" +
		"          {{else}}" +
		'            {{#eq progress "undefined"}}{{else}}{{progress}}%{{/eq}}' +
		"          {{/if}}" +
		"        </span>" +
		"      </div>" +
		"    </div>" +
		"  {{/if}}" +
		"  {{#if details}}" +
		'    <div class="dtls" {{#if severity}} style="border-left-color: {{severity}};border-left-width:8px;border-left-style:solid;border-radius:1px;" {{/if}}>' +
		'      <pre class="details" style="border-left-width:0">' +
		"        {{~ details ~}}" +
		"      </pre>" +
		"    </div>" +
		"  {{/if}}" +
		"</div>",
}.keyMap(function (v) {
	return Handlebars.compile(v);
});

function Alert(scope, container, opts) {
	this.scope = scope;
	this.alert = this.applyDefaults(opts);

	this.$ = {};
	this.$.container = $(container);
	this.$.html = $(AlertController.templates.item(this.alert));
	this.$.modal = {};
	this.$.modal.title = $(
		'<span><span class="icon"></span><span class="title"></span></span>'
	);
	this.$.modal.body = $(AlertController.templates.popup(this.alert));

	this.$.html.prependTo(this.$.container);

	this.bind();

	this.i18n();
}
Alert.prototype.bind = function () {
	var self = this;
	this.$.html.find(".dismiss").on("click", function (ev) {
		var $this = $(this);
		var alert = self.alert;

		$this
			.closest(".alert-item")
			.parent()
			.addClass("gone")
			.animate(
				{
					height: "0px",
				},
				300,
				"swing",
				function () {
					$this.closest(".alert-container").remove();
					self.scope.removeAlert(self);
				}
			)
			.css("overflow", "visible");

		ev.preventDefault();
		ev.stopPropagation();
	});

	this.$.html.find("div.well-sm").on("click", function (ev) {
		var $this = $(this);
		var alert = self.alert;

		var box = bootbox.dialog({
			title: self.$.modal.title,
			message: self.$.modal.body,
		});
		self.$.modal.body.find(".pull-right > a").on("click", function () {
			box.modal("hide");
		});
		ev.preventDefault();
		ev.stopPropagation();
	});

	this.$.html.find(".alert-item").on("click", function (ev) {
		ev.preventDefault();
		ev.stopPropagation();
	});
	this.$.html.find(".alert-item a").on("click", function (ev) {
		ev.stopPropagation();
	});
};
Alert.prototype.applyDefaults = function (alert) {
	if (
		alert.progress &&
		typeof alert.progress !== "string" &&
		(alert.progress < 0 || alert.progress > 100)
	) {
		delete alert.progress;
	}

	return {
		id: alert.id || null,
		title: alert.title || null,
		message: alert.message || null,
		details: alert.details || null,
		unsafe: alert.unsafe || null,
		link: alert.link || null,
		icon: alert.icon || "fa fa-exclamation",
		progress: alert.progress || false,
		progress_status: alert.progress_status || null,
		progress_text: alert.progress_text || null,
		dateISO: moment(alert.date || undefined).toISOString(),
		severity: alert.severity
			? appColors[alert.severity] || alert.severity
			: appColors["blue"],
		time: moment(alert.date || undefined).format("LT"),
	};
};
Alert.prototype.update = function (data) {
	this.alert.deepMerge(this.applyDefaults(data));

	this.pullUp();

	if (this.alert.progress) {
		var hp = this.$.html.find(".progress > div");
		var mp = this.$.modal.body.find(".progress > div");

		if (this.alert.progress === "undefined") {
			hp.css("width", "100%")
				.addClass("progress-bar-striped")
				.parent()
				.addClass("active");
			mp.css("width", "100%")
				.addClass("progress-bar-striped")
				.parent()
				.addClass("active");
			mp.text("");
		} else {
			hp.css("width", (this.alert.progress | 0) + "%")
				.removeClass("progress-bar-striped")
				.parent()
				.removeClass("active");
			mp.css("width", (this.alert.progress | 0) + "%")
				.removeClass("progress-bar-striped")
				.parent()
				.removeClass("active");

			if (this.alert.progress_text) {
				mp.text(this.alert.progress_text);
			} else {
				mp.text((this.alert.progress | 0) + "%");
			}
		}

		if (this.alert.progress_status) {
			for (var i = 0; i < hp[0].classList.length; i++) {
				if (hp[0].classList[i].indexOf("progress-bar-") > -1) {
					hp[0].classList.remove(hp[0].classList[i]);
				}
			}
			hp[0].classList.add(
				{
					success: "progress-bar-green",
					warning: "progress-bar-yellow",
					error: "progress-bar-red",
				}[this.alert.progress_status] || "progress-bar-blue"
			);

			for (var i = 0; i < mp[0].classList.length; i++) {
				if (mp[0].classList[i].indexOf("progress-bar-") > -1) {
					mp[0].classList.remove(mp[0].classList[i]);
				}
			}
			mp[0].classList.add(
				{
					success: "progress-bar-green",
					warning: "progress-bar-yellow",
					error: "progress-bar-red",
				}[this.alert.progress_status] || "progress-bar-blue"
			);
		}
	}
	this.$.html.find("[data-time]").attr("data-time", this.alert.dateISO);
	this.$.modal.body.find("[data-time]").attr("data-time", this.alert.dateISO);

	this.i18n();
};
Alert.prototype.pullUp = function () {
	var prevs = this.$.html.prevAll();

	var self = this;
	if (prevs.length > 0) {
		var top = $(prevs[prevs.length - 1]);
		var previous = $(prevs[0]);
		var moveUp = this.$.html.offset().top - top.offset().top;
		var moveDown =
			this.$.html.offset().top +
			this.$.html.outerHeight() -
			(previous.offset().top + previous.outerHeight());

		this.$.html.css("position", "relative");
		prevs.css("position", "relative");
		this.$.html.animate({
			top: -moveUp,
		});
		prevs.animate(
			{
				top: moveDown,
			},
			{
				complete: function () {
					// rearrange the DOM and restore positioning when we're done moving
					self.$.html.parent().prepend(self.$.html);
					self.$.html.css({
						position: "static",
						top: 0,
					});
					prevs.css({
						position: "static",
						top: 0,
					});
				},
			}
		);
	}
};
Alert.prototype.i18n = function () {
	if (typeof this.alert.title === "object" && this.alert.title !== null) {
		if (this.alert.title["text-i18n"]) {
			this.alert.title.hbs = Handlebars.compile(
				i18n.t(this.alert.title["text-i18n"])
			);
		} else {
			this.alert.title.hbs = Handlebars.compile(this.alert.title["text"]);
		}
	}
	if (typeof this.alert.message === "object" && this.alert.message !== null) {
		if (this.alert.message["text-i18n"]) {
			this.alert.message.hbs = Handlebars.compile(
				i18n.t(this.alert.message["text-i18n"])
			);
		} else {
			this.alert.message.hbs = Handlebars.compile(this.alert.message["text"]);
		}
	}
	if (typeof this.alert.details === "object" && this.alert.details !== null) {
		if (this.alert.details["text-i18n"]) {
			this.alert.details.hbs = Handlebars.compile(
				i18n.t(this.alert.details["text-i18n"])
			);
		} else {
			this.alert.details.hbs = Handlebars.compile(this.alert.details["text"]);
		}
	}

	var title =
			typeof this.alert.title === "object" && this.alert.title !== null
				? this.alert.title.hbs(this.alert.title.data)
				: this.alert.title || "",
		message =
			typeof this.alert.message === "object" && this.alert.message !== null
				? this.alert.message.hbs(this.alert.message.data)
				: this.alert.message || "",
		details =
			typeof this.alert.details === "object" && this.alert.details !== null
				? this.alert.details.hbs(this.alert.details.data)
				: this.alert.details || "";

	this.$.html.find(".alert-item").css("border-left-color", this.alert.severity);
	this.$.modal.body.find(".dtls").css("border-left-color", this.alert.severity);

	this.$.html.find(".title").text(title);
	this.$.modal.title.find(".title").text(title);

	this.$.html
		.find(".icon")
		.html(this.alert.icon ? '<i class="' + this.alert.icon + '"></i> ' : "");
	this.$.modal.title
		.find(".icon")
		.html(this.alert.icon ? '<i class="' + this.alert.icon + '"></i> ' : "");

	if (!this.alert.unsafe) {
		this.$.html.find(".message").text(message);
		this.$.modal.body.find(".message").text(message);
	} else {
		this.$.html.find(".message").html(message);
		this.$.modal.body.find(".message").html(message);
	}
	this.$.html.find(".details").text(details);
	this.$.modal.body.find(".details").text(details);

	this.$.html.find("[data-time]").each(function () {
		var $this = $(this);
		$this.text(moment($this.attr("data-time")).format("LT"));
	});
	this.$.modal.body.find("[data-time]").each(function () {
		var $this = $(this);
		$this.text(moment($this.attr("data-time")).format("LT"));
	});
};
Alert.prototype._ = scopeInterface;
Alert.prototype.is = scopeCompare;
