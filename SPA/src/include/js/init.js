var appColors = {
	yellow: "rgb(243, 156, 18)",
	orange: "rgb(255, 133, 27)",

	redder: "rgb(221, 75, 57)",
	reddest: "rgb(194, 51, 33)",

	red: "rgb(245, 105, 84)",
	maroon: "rgb(216, 27, 96)",

	fuchsia: "rgb(240, 18, 190)",
	purple: "rgb(142, 36, 170)",

	darknavy: "rgb(37, 41, 71)",
	navy: "rgb(0, 31, 63)",

	lightblue: "rgb(64, 150, 201)",
	blue: "rgb(0, 115, 183)",

	aqua: "rgb(0, 192, 239)",
	lightaqua: "rgb(60, 141, 188)",

	teal: "rgb(57, 204, 204)",
	green: "rgb(61, 153, 112)",

	lime: "rgb(1, 255, 112)",
	olive: "rgb(0, 166, 90)",

	gray: "rgb(210, 214, 222)",
	darkgray: "rgb(68, 68, 68)",

	darkergray: "rgb(43, 43, 43)",
	black: "rgb(34, 34, 34)",
};

var manualLangMap = {
	"en-US": "en",
};

var manualMap = {
	en: {
		// Dashboard
		dashboardView: ["Output Manager Connector", "Dashboard"],

		// Devices
		printerView: ["Output Manager Connector", "Devices", "Printers/MFPs"],
		unmanagedPrinterView: [
			"Output Manager Connector",
			"Devices",
			"Unmanaged Devices",
		],
		printerQueueView: ["Output Manager Connector", "Devices", "Queues"],
		sploolerQueueMappingView: [
			"Output Manager Connector",
			"Devices",
			"Queues",
			"Map Printers-Spooler Queues",
		],
		printerQueueDriverMapView: [
			"Output Manager Connector",
			"Devices",
			"Queues",
			"Printer Queue Driver Map",
		],
		profilePrinterCostView: [
			"Output Manager Connector",
			"Devices",
			"Configurations",
			"Cost",
		],
		profilePrinterView: [
			"Output Manager Connector",
			"Devices",
			"Configurations",
			"Profiles",
		],
		profileConfigurationView: [
			"Output Manager Connector",
			"Devices",
			"Configurations",
			"Profile Configuration",
		],
		auxLocationView: [
			"Output Manager Connector",
			"Devices",
			"Configurations",
			"Locations",
		],
		printerGroupView: [
			"Output Manager Connector",
			"Devices",
			"Configurations",
			"Printer Groups",
		],
		printerFirmwareView: [
			"Output Manager Connector",
			"Devices",
			"Configurations",
			"Printer Firmware",
		],
		printerConfigurationRuleView: [
			"Output Manager Connector",
			"Devices",
			"Configurations",
			"Configuration Rule",
		],
		printerConfigurationGroupMapView: [
			"Output Manager Connector",
			"Devices",
			"Configurations",
			"Printer Group Map",
		],
		printerNetworkFindView: [
			"Output Manager Connector",
			"Devices",
			"Configurations",
			"Printer Network Find",
		],
		RFIDView: ["Output Manager Connector", "Devices", "RFID"],
		touchView: ["Output Manager Connector", "Devices", "Touch"],

		// Users and Groups
		userView: ["Output Manager Connector", "Users & Groups", "Users"],
		contactView: ["Output Manager Connector", "Users & Groups", "Contacts"],
		groupView: ["Output Manager Connector", "Users & Groups", "Groups"],
		groupMappingView: [
			"Output Manager Connector",
			"Users & Groups",
			"Map Users-Groups",
		],
		apiRoleView: ["Output Manager Connector", "Users & Groups", "Roles"],
		roleMappingView: [
			"Output Manager Connector",
			"Users & Groups",
			"Map Users-Roles",
		],
		mapPermissionView: [
			"Output Manager Connector",
			"Users & Groups",
			"Permissions",
		],
		cardView: ["Output Manager Connector", "Users & Groups", "Cards"],
		costCenterView: [
			"Output Manager Connector",
			"Users & Groups",
			"Cost Center",
		],

		// Printing Policies
		userConfigView: [
			"Output Manager Connector",
			"Printing Policies",
			"Quota management",
		],
		policyView: ["Output Manager Connector", "Printing Policies", "Policies"],
		ruleView: ["Output Manager Connector", "Printing Policies", "Rules"],
		clearSpoolerJobConfigView: [
			"Output Manager Connector",
			"Printing Policies",
			"Clean Spooler Job",
		],
		printJobConvertView: [
			"Output Manager Connector",
			"Printing Policies",
			"Print Job Converts",
		],
		workScheduleConfigView: [
			"Output Manager Connector",
			"Printing Policies",
			"Other Policies",
		],
		dlpView: [
			"Output Manager Connector",
			"Printing Policies",
			"Data Leak Prevention",
		],

		// Server Configurations
		aplicationSettingsView: [
			"Output Manager Connector",
			"Server Configurations",
			"Application Settings",
		],
		adConfigView: [
			"Output Manager Connector",
			"Server Configurations",
			"Directory Service",
		],
		serverListView: [
			"Output Manager Connector",
			"Server Configurations",
			"Server List",
		],

		// Connectors
		connectorView: ["Output Manager Connector", "Connectors"],
		scanProfileCustomView: [
			"Output Manager Connector",
			"Connectors",
			"Flex Connectors",
		],
		scanProfileCustomOutputView: [
			"Output Manager Connector",
			"Connectors",
			"Flex Connectors",
			"Output Settings",
		],
		OCRTemplateView: [
			"Output Manager Connector",
			"Connectors",
			"Flex Connector Plus",
			"OCR Templates",
		],

		// OCR Configuration
		configOCRView: ["Output Manager Connector", "OCR Configurations"],

		// Documents
		spoolerJobView: ["Output Manager Connector", "Documents", "Spooler Job"],
		spoolerHistoryView: [
			"Output Manager Connector",
			"Documents",
			"Spooler History",
		],
		scannedFileView: ["Output Manager Connector", "Documents", "Scanned Files"],
		dlpDocumentView: ["Output Manager Connector", "Documents", "DLP Documents"],

		// Report
		costView: ["Output Manager Connector", "Reports", "Data Analysis"],
		reportBenefitsView: ["Output Manager Connector", "Reports", "Benefits"],
		reportCostsView: ["Output Manager Connector", "Reports", "Costs"],
		reportVolumeView: ["Output Manager Connector", "Reports", "Volume"],
		reportEnvironmentView: [
			"Output Manager Connector",
			"Reports",
			"Environment",
		],
		reportListView: ["Output Manager Connector", "Reports", "List"],
		reportOtherView: ["Output Manager Connector", "Reports", "Other"],
		reportConfigView: [
			"Output Manager Connector",
			"Reports",
			"Schedule Reports",
		],

		// Warnings & Logs
		printerWarningView: [
			"Output Manager Connector",
			"Warnings & Logs",
			"Printer Warnings",
		],
		allWarningView: [
			"Output Manager Connector",
			"Warnings & Logs",
			"All Warnings",
		],
		alertMessageQueueView: [
			"Output Manager Connector",
			"Warnings & Logs",
			"Alert Message Queue",
		],
		sendEmailsView: [
			"Output Manager Connector",
			"Warnings & Logs",
			"Send items",
		],
		aplicationLogsView: [
			"Output Manager Connector",
			"Warnings & Logs",
			"Application Logs",
		],
		emailMessageView: [
			"Output Manager Connector",
			"Warnings & Logs",
			"Email Message",
		],
		fileConfigureView: [
			"Output Manager Connector",
			"Warnings & Logs",
			"File Configuration",
		],
		globalWarningView: [
			"Output Manager Connector",
			"Warnings & Logs",
			"Warning Supply/Status",
			"Supply",
		],
		globalWarningStatusView: [
			"Output Manager Connector",
			"Warnings & Logs",
			"Warning Supply/Status",
			"Status",
		],
		logReportView: [
			"Output Manager Connector",
			"Warnings & Logs",
			"Log Report",
		],

		// License
		licenseView: ["Output Manager Connector", "License"],
	},
};

var defaultColors = appColors.map(function (v, k) {
	return v;
});

var defaultColorPairs = defaultColors.reduce(function (acc, v, i) {
	if (i % 2 === 0) {
		acc.push([v]);
	} else {
		acc[acc.length - 1].push(v);
	}
	return acc;
}, []);

function escapeHTML(unsafe) {
	return unsafe
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#039;");
}

function shuffle(array) {
	var m = array.length,
		t,
		i;
	while (m) {
		i = (Math.random() * m--) | 0;
		t = array[m];
		array[m] = array[i];
		array[i] = t;
	}
}

function shift(array) {
	var m = array.length,
		t,
		i;
	i = (Math.random() * m) | 0;
	array.splice(array.length, 0, ...array.splice(0, i));
	return array;
}

function shear(array, l) {
	var t;
	l = l || 2;
	var a = [];
	for (var i = 0; i < l; i++) {
		a[i] = [];
	}
	for (var i = 0; i < array.length; i++) {
		a[i % l].push(array[i]);
		//array.splice(array.length,0,array.splice(i, 1)[0]);
	}
	return a.reduce((aa, c) => aa.concat(c), []);
}

function i18nInject($target) {
	var key = $target.data("i18ninj");
	var parts = i18n.t(key).split("_");

	var obj = {};

	$target.children("[data-i18nkeep]").each(function () {
		var $this = $(this);
		var k = $this.data("i18nkeep");
		obj[k] = $this.detach()[0];
	});
	var target = $target.empty()[0];

	var p = null;
	for (var i = 0; i < parts.length; i++) {
		p = parts[i];
		if (obj[p]) {
			target.appendChild(obj[p]);
		} else {
			target.appendChild(document.createTextNode(p));
		}
	}
}

function comparePermission(a, b) {
	return (
		a.localeCompare(b, undefined, {
			sensitivity: "accent",
		}) === 0
	);
}

function assert(desc, condition) {
	console.log(
		"%c" + desc + ": " + (condition ? "Success" : "Fail"),
		"color: " + (condition ? "green" : "red")
	);
}

var _promiseStub = new (function () {
	var self = this;
	function returnSelf() {
		return self;
	}
	this.done = returnSelf;
	this.then = returnSelf;
	this.fail = returnSelf;
	this.catch = returnSelf;
	this.always = returnSelf;
})();
function promiseStub() {
	return _promiseStub;
}
function ajaxStub() {
	return _promiseStub;
}

var permissions = {
	read: {
		k: "read",
		v: 16,
		i18n: "app.permissions.read",
	},
	delete: {
		k: "delete",
		v: 2,
		i18n: "app.permissions.delete",
	},
	edit: {
		k: "edit",
		v: 4,
		i18n: "app.permissions.edit",
	},
	add: {
		k: "add",
		v: 8,
		i18n: "app.permissions.add",
	},
	export: {
		k: "export",
		v: 1,
		i18n: "app.permissions.export",
	},
	Pgroup: {
		k: "Pgroup",
		v: 32,
		i18n: "app.permissions.access_group",
	},
	Pall: {
		k: "Pall",
		v: 64,
		i18n: "app.permissions.access_all",
	},
};
var permissionList = permissions.map(function (v, k) {
	return v;
});
function parsePermissions(p) {
	return permissions.keyMap(function (v) {
		return !!(p & v.v);
	});
}
function makePermissions(p) {
	return permissions
		.map(function (v, k) {
			return p[k] ? v.v : 0;
		})
		.reduce(function (acc, v) {
			return acc + v;
		}, 0);
}

window.Templates = window.Templates || [];

$(function () {
	// Default ajax settings
	$.ajaxSetup({
		cache: false,
	});

	$.fn.dataTableExt.sErrMode = "nope";

	// Forces headers to resize after collapse/expand of sidebar
	$(".main-sidebar")[0].addEventListener("transitionend", function () {
		window.dispatchEvent(new Event("resize"));
	});

	// Handlebars helper functions
	Handlebars.partials = Handlebars.templates;

	const mathjsCache = {};
	Handlebars.registerHelper("mathjs", function (formula, scope) {
		if (!mathjsCache[formula]) {
			try {
				mathjsCache[formula] = math.compile(formula);
			} catch (e) {
				mathjsCache[formula] = "error";
			}
		}

		if (mathjsCache[formula] === "error") return null;

		return mathjsCache[formula].evaluate(scope);
	});

	Handlebars.registerHelper("math", function (l, operator, r) {
		return {
			"+": l + r,
			"-": l - r,
			"*": l * r,
			"/": l / r,
		}[operator];
	});

	// Handlebars helper functions
	Handlebars.registerHelper("map", function (arr, prop) {
		return (arr || []).map(function (v) {
			return v[prop];
		});
	});

	Handlebars.registerHelper("jsonFormat", function (str) {
		try {
			return JSON.stringify(JSON.parse(str), null, 4);
		} catch (e) {
			return str;
		}
	});

	Handlebars.registerHelper("earliestFromNow", function (arr) {
		var now = moment();
		var first = arr
			.map(function (v) {
				return {
					moment: moment(v),
					original: v,
				};
			})
			.sort(function (a, b) {
				return a.moment.isBefore(b.moment) ? -1 : 1;
			})
			.filter(function (v) {
				return now.isBefore(v.moment);
			})[0];

		if (first) {
			return first.original;
		} else {
			return false;
		}
	});

	// Handlebars helper functions
	Handlebars.registerHelper("earliestFromToday", function (arr) {
		var now = moment();
		now.hour(0);
		var first = arr
			.map(function (v) {
				return {
					moment: moment(v),
					original: v,
				};
			})
			.sort(function (a, b) {
				return a.moment.isBefore(b.moment) ? -1 : 1;
			})
			.filter(function (v) {
				return now.isBefore(v.moment);
			})[0];

		if (first) {
			return first.original;
		} else {
			return false;
		}
	});

	// Handlebars helper functions
	Handlebars.registerHelper("formatDateCustom", function (data, format) {
		var date = moment.utc(data);
		if (date.isValid()) {
			return date.format(format);
		} else {
			return "-";
		}
	});

	// Handlebars helper functions
	Handlebars.registerHelper("formatDate", function (data) {
		var date = moment.utc(data);
		if (date.isValid()) {
			return date.format(main.formats.date.toUpperCase());
		} else {
			return "-";
		}
	});

	// Handlebars helper functions
	Handlebars.registerHelper("log", function (data) {
		console.log(data);
		return "";
	});

	// Handlebars helper functions
	Handlebars.registerHelper("formatDateTime", function (data) {
		var date = moment.utc(data);
		if (date.isValid()) {
			return date.format("dddd, D/M, HH:mm");
		} else {
			return "-";
		}
	});

	// Handlebars helper functions
	Handlebars.registerHelper("fromNow", function (data) {
		var date = moment.utc(data);
		if (date.isValid()) {
			return date.fromNow();
		} else {
			return "-";
		}
	});

	// Handlebars helper functions
	Handlebars.registerHelper("for", function (s, u, opts) {
		if (arguments.length === 2) {
			opts = u;
			u = s;
			s = 0;
		}

		var o = "";
		for (; s < u; s++) {
			o += opts.fn(this, {
				data: {
					i: s,
				},
			});
		}
		return o;
	});

	Handlebars.registerHelper("humanSize", function (bytes) {
		var thresh = 1024;
		if (Math.abs(bytes) < 1024) {
			return bytes + " B";
		}
		var units = ["KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB"];
		var u = -1;
		do {
			bytes /= 1024;
			++u;
		} while (Math.abs(bytes) >= 1024 && u < units.length - 1);
		return bytes.toFixed(1) + " " + units[u];
	});

	Handlebars.registerHelper("randomColor", function () {
		return defaultColors[(Math.random() * defaultColors.length) | 0];
	});

	Handlebars.registerHelper("prop", function (obj, prop, def) {
		if (obj && obj[prop] !== undefined) return obj[prop];
		if (def !== null) return def;
		return "";
	});

	Handlebars.registerHelper("formatNumber", function (num, dec) {
		return (+num).toFixed(dec | 0 || 0);
	});
	Handlebars.registerHelper("logger", function () {
		console.log(arguments);
	});

	Handlebars.registerHelper("rowFixed", function (options) {
		var row = this;
		var l = row.length;

		if (l > 12) {
			console.error("Too many columns.");
			return; // y u do dis. stahp
		}

		while (12 % l !== 0) {
			console.error("Columns not divisor of 12. Padding.");
			row.push(null);
			l = row.length;
		}

		var colSize = 12 / l;
		var r = [];
		for (var i = 0; i < row.length; i++) {
			var c = row[i];
			var size = 1;
			while (row[i + 1] === null) {
				size++;
				i++;
			}
			r.push({
				sm: colSize * size,
				components: c,
			});
		}
		return options.fn(r);
	});

	Handlebars.registerHelper("cmp", function (l, operator, r, opts) {
		var res = false;

		switch (operator) {
			case "==":
				res = l == r;
				break;
			case "===":
				res = l === r;
				break;
			case "!=":
				res = l != r;
				break;
			case "!==":
				res = l !== r;
				break;
			case ">":
				res = l > r;
				break;
			case ">=":
				res = l >= r;
				break;
			case "<":
				res = l < r;
				break;
			case "<=":
				res = l <= r;
				break;
			default:
				throw new Error(
					"Handlerbars 'comparison': No such operator " + operator
				);
		}

		if (res) {
			return opts.fn(this);
		} else {
			return opts.inverse(this);
		}
	});

	Handlebars.registerHelper("fixPrinterImgUrl", function (url) {
		if (url.indexOf("/") > -1)
			url = url.substring(url.lastIndexOf("/") + 1, url.length);

		return "./include/css/images/printers/" + url;
	});

	Handlebars.registerHelper("fixPrinterImgUrl", function (url) {
		if (url.indexOf("/") > -1)
			url = url.substring(url.lastIndexOf("/") + 1, url.length);

		return "./include/css/images/printers/" + url;
	});

	Handlebars.registerHelper("escapeVCard", function (text) {
		return (text + "").replace(/([\:\;])/, "\\$1");
	});

	Handlebars.registerHelper("has", function (a) {
		return this.hasOwnProperty(a);
	});

	Handlebars.registerHelper("max", function (a, b) {
		return a >= b ? a : b;
	});

	Handlebars.registerHelper("min", function (a, b) {
		return a <= b ? a : b;
	});

	Handlebars.registerHelper("permissionClasses", function (elPerm, uPerm) {
		if (elPerm === undefined) return "";
		if (uPerm === undefined) return "";

		return Object.entries(elPerm)
			.filter(([prm]) => !uPerm.find((p) => comparePermission(prm, p)))
			.map(([_, state]) => state + "-by-permission")
			.filter((v, i, a) => a.indexOf(v) === i)
			.join(" ");
	});

	Handlebars.registerHelper(
		"permissionDatasets",
		function (elementPermissions, permissions) {
			return a <= b ? a : b;
		}
	);

	Handlebars.registerHelper("canAccess", function (a) {
		return a["require-license"] ? !!main.license[a["require-license"]] : true;
		// && ( a['require-permissions'] ? true : true )
	});

	Handlebars.registerHelper("i18n_t", function (a) {
		if (a) return i18n.t(a);
		else return "";
	});

	Handlebars.registerHelper("getUniqueId", function (opts) {
		return opts.fn(this, {
			data: {
				randomId: Date.now() + "-" + Math.random().toString().replace(".", ""),
			},
		});
	});

	Handlebars.registerHelper("regex", function (str, reg, opts) {
		var r = new RegExp(reg);
		var m = str.match(r);

		return opts.fn(this, {
			data: {
				captures: m,
			},
		});
	});

	Handlebars.registerHelper("contains", function (arr, v, exclude, opts) {
		if (typeof opts === "undefined") opts = exclude;

		if ((arr.indexOf(v) === -1) === (exclude === true)) {
			return opts.fn(this);
		} else {
			return opts.inverse(this);
		}
	});

	Handlebars.registerHelper("eq", function (a, b, opts) {
		if (a === b) {
			return opts.fn(this);
		} else {
			return opts.inverse(this);
		}
	});

	Handlebars.registerHelper("match", function (str, reg, opts) {
		if (typeof str !== "string" && !(str instanceof String))
			return opts.inverse(this);

		var results = (str + "").match(reg);
		if (results) {
			var caps = results.slice(1);
			return opts.fn(this, {
				data: {
					match: results[0],
					captures: caps,
				},
			});
		} else {
			return opts.inverse(this);
		}
	});

	Handlebars.registerHelper("neq", function (a, b, opts) {
		if (a !== b) {
			return opts.fn(this);
		} else {
			return opts.inverse(this);
		}
	});

	Handlebars.registerHelper("license", function (lic) {
		return !!main.license[lic];
	});

	var hbsCache = {};
	function renderCached(hbs, data, extra) {
		if (!hbsCache[hbs]) hbsCache[hbs] = Handlebars.compile(hbs);

		return hbsCache[hbs](data, extra);
	}
	window.renderCached = renderCached;
	Handlebars.registerHelper("hbs", function (hbs, data) {
		return renderCached(hbs, data);
	});

	Handlebars.registerHelper("escape", function (a) {
		return (a + "").replace(/[\(\)\/\s]/g, "_");
	});

	Handlebars.registerHelper("isarray", function (a, opts) {
		if (Array.isArray(a)) {
			return opts.fn(this);
		} else {
			return opts.inverse(this);
		}
	});

	//Boolean fontawesome
	Handlebars.registerHelper("booleanfa", function (value) {
		if (value == "0") {
			return '<i class="fa fa-times-circle-o text-danger" aria-hidden="true" style="font-size: large;"></i>';
		} else {
			return '<i class="fa fa-check-circle-o text-success" aria-hidden="true" style="font-size: large;"></i>';
		}
	});

	Handlebars.registerHelper("booleansnfa", function (value) {
		if (value === "N") {
			return '<i class="fa fa-times-circle-o text-danger" aria-hidden="true" style="font-size: large;"></i>';
		} else {
			return '<i class="fa fa-check-circle-o text-success" aria-hidden="true" style="font-size: large;"></i>';
		}
	});

	//localeNumberFormat
	Handlebars.registerHelper(
		"localeNumberFormat",
		function (value, formato, min_dec, max_dec) {
			if (value == undefined) {
				return "0,00";
			}
			if (min_dec == undefined || typeof min_dec === "object") {
				min_dec = 2;
			}

			if (max_dec == undefined || typeof max_dec === "object") {
				max_dec = 2;
			}

			value = value.toLocaleString(formato, {
				minimumFractionDigits: min_dec,
				maximumFractionDigits: max_dec,
			});

			return value;
		}
	);

	// Firefox workaround to prevent middleclicks on labels
	document.addEventListener("click", function (e) {
		if (
			e.which == 2 &&
			(e.target.classList.contains("tab-title") ||
				e.target.parentNode.classList.contains("tab-title") ||
				e.target.getAttribute("data-toggle") === "tab")
		) {
			e.preventDefault();
		}
	});

	$.fn.boxBusy = function (color, bgColor, fontSize, icon) {
		// check if boxBusy
		if (!$(this).data("isbusy")) {
			var overlay = $(
				'<div class="overlay busy"' +
					'style="' +
					(bgColor ? "background-color:" + bgColor + ";" : "") +
					'"' +
					'><div style="' +
					(fontSize ? "font-size:" + fontSize + ";" : "") +
					(color ? "color:" + color + ';"' : "") +
					'" class="fa ' +
					(icon ? icon : "fa-refresh") +
					' fa-spin"  ></div></div>'
			);
			var box = $(this);

			box.prepend(overlay);
		}
		$(this).data("isbusy", true);
		return this;
	};

	$.fn.boxUnBusy = function () {
		$(this).removeData("isbusy");
		return this.find(".overlay.busy").fadeOut(200, function () {
			$(this).remove();
		});
	};

	$.fn.closestChildren = function (sel) {
		if (!sel) return $();
		var results = $();

		this.each(function () {
			var q = [];
			var nq = [];
			nq.push(this);
			while (results.length == 0 && nq.length > 0) {
				q = nq;
				nq = [];
				while (q.length > 0) {
					var nodes = $(q.shift()).children(),
						match = nodes.filter(sel);
					if (match.length === 0) {
						nq = nq.concat(nodes.toArray());
					} else {
						results = results.add(match);
					}
				}
			}
		});
		return results;
	};

	$(".unsaved-toggle").on("click", function () {
		$(".unsaved").toggleClass("open");
	});

	$(".back-to-top").click(function () {
		$("html,body").animate({ scrollTop: 0 }, 200, "swing");
		return false;
	});
	var navBar = $(".navbar.navbar-static-top");
	var $wind = $(window);
	$wind.scroll(function () {
		var y = $wind.scrollTop();
		if (
			(y > 50 && window.matchMedia("(min-width: 768px)").matches) ||
			(y > 100 && window.matchMedia("(max-width: 767px)").matches)
		) {
			navBar.parent().addClass("unmouse");
		} else {
			navBar.parent().removeClass("unmouse");
		}
		if (y > 300) {
			$(".back-to-top").addClass("show");
		} else {
			$(".back-to-top").removeClass("show");
		}
	});

	var mh = $(".main-header");
	mh.on("hidden.bs.dropdown", function (e) {
		mh.removeClass("active");
	});
	mh.on("shown.bs.dropdown", function (e) {
		mh.addClass("active");
	});
	mh.on("click", '[data-toggle="dropdown"]', function (e) {
		if ($(this).attr("aria-expanded") === "true") {
			mh.removeClass("active");
		} else {
			mh.addClass("active");
		}
	});

	function notify(opts1, text, color, timeout) {
		var defaults = {
			title: "",
			text: "",
			timeout: 5000,
			colorClass: "bg-info",
		};
		var opts;
		if (typeof opts1 === "string") {
			opts = {
				title: opts1 || defaults.title,
				text: text || defaults.text,
				timeout: timeout || defaults.timeout,
				colorClass: "bg-" + color || defaults.colorClass,
			};
		} else {
			opts = {
				title: opts1.title || defaults.title,
				text: opts1.text || defaults.text,
				timeout: opts1.timeout || defaults.timeout,
				colorClass:
					opts1.colorClass ||
					(opts1.color ? "bg-" + opts1.color : null) ||
					defaults.colorClass,
			};
		}
		return Snarl.addNotification(opts);
	}
	window.notify = notify;

	Tools = {};
	Tools.Ajax = {
		defaultPost: function (url, data) {
			return new Promise(function (resolve, reject) {
				var opts = {
					contentType: "application/json",
					url: url,
					type: "POST",
				};
				if (data) {
					opts.data = JSON.stringify(data);
				}
				if (window._overrides && window._overrides.headers) {
					opts.headers = { ...window._overrides.headers };
				}

				var token = localStorage.getItem("mob_token");
				if (token && token != "") {
					if (!opts.headers) opts.headers = {};
					opts.headers.mob_token = token;
				}

				var empresa = localStorage.getItem("empresa");
				if (empresa && empresa != "") {
					if (!opts.headers) opts.headers = {};
					opts.headers.empresa = empresa;
				}

				function req() {
					$.ajax(opts)
						.done(function (data) {
							resolve(data);
						})
						.fail(function (data) {
							if (data.status == 401) {
								main.auth.relog().then(function () {
									req();
								});
							} else {
								reject(new Errors.PostError(data.status, data.responseText));
							}
						});
				}

				req();
			});
		},
		completePost: function (url, data) {
			return new Promise(function (resolve, reject) {
				var opts = {
					contentType: "application/json",
					url: url,
					type: "POST",
				};
				if (data) {
					opts.data = JSON.stringify(data);
				}
				if (window._overrides && window._overrides.headers) {
					opts.headers = { ...window._overrides.headers };
				}

				var token = localStorage.getItem("mob_token");
				if (token && token != "") {
					if (!opts.headers) opts.headers = {};
					opts.headers.mob_token = token;
				}

				var empresa = localStorage.getItem("empresa");
				if (empresa && empresa != "") {
					if (!opts.headers) opts.headers = {};
					opts.headers.empresa = empresa;
				}

				function req() {
					$.ajax(opts)
						.done(function (data, status, xhr) {
							resolve({
								data: data,
								status: status,
								xhr: xhr,
							});
						})
						.fail(function (data) {
							if (data.status == 401) {
								main.auth.relog().then(function () {
									req();
								});
							} else {
								reject(
									new Errors.PostError(data.status, data.responseText, data)
								);
							}
						});
				}

				req();
			});
		},
		defaultGet: function (url, data) {
			return new Promise(function (resolve, reject) {
				var opts = {
					contentType: "application/json",
					url: url,
					type: "GET",
				};
				if (data) {
					opts.data = JSON.stringify(data);
				}
				if (window._overrides && window._overrides.headers) {
					opts.headers = { ...window._overrides.headers };
				}

				var token = localStorage.getItem("mob_token");
				if (token && token != "") {
					if (!opts.headers) opts.headers = {};
					opts.headers.mob_token = token;
				}

				var empresa = localStorage.getItem("empresa");
				if (empresa && empresa != "") {
					if (!opts.headers) opts.headers = {};
					opts.headers.empresa = empresa;
				}

				function req() {
					$.ajax(opts)
						.done(function (data) {
							resolve(data);
						})
						.fail(function (data) {
							if (data.status == 401) {
								main.auth.relog().then(function () {
									req();
								});
							} else {
								reject(new Errors.PostError(data.status, data.responseText));
							}
						});
				}

				req();
			});
		},
		defaultUpload: function (url, file, headers) {
			var downProgressHandlers = [];
			var upProgressHandlers = [];
			var request = {};

			var formData = new FormData();
			formData.append("files", file);

			var p = new Promise(function (resolve, reject) {
				var opts = {
					xhr: function () {
						var xhr = new window.XMLHttpRequest();
						xhr.upload.addEventListener(
							"progress",
							function (evt) {
								if (evt.lengthComputable) {
									var prct = evt.loaded / evt.total;
									for (var i = 0; i < upProgressHandlers.length; i++) {
										upProgressHandlers[i](prct);
									}
								}
							},
							false
						);

						xhr.addEventListener(
							"progress",
							function (evt) {
								if (evt.lengthComputable) {
									var prct = evt.loaded / evt.total;
									for (var i = 0; i < downProgressHandlers.length; i++) {
										downProgressHandlers[i](prct);
									}
								}
							},
							false
						);

						return xhr;
					},
					url: url,
					type: "POST",
					data: formData,
					contentType: false,
					processData: false,
				};

				if (headers) {
					opts.headers = headers;
				}

				function req() {
					request.ajax = $.ajax(opts)
						.done(function (data) {
							resolve(data);
						})
						.fail(function (data) {
							if (data.status == 401) {
								main.auth.relog().then(function () {
									req();
								});
							} else {
								reject(new Errors.PostError(data.status, data.responseText));
							}
						});
				}

				req();
			});

			p.downProgress = function (cb) {
				downProgressHandlers.push(cb);
				return p;
			};
			p.upProgress = function (cb) {
				upProgressHandlers.push(cb);
				return p;
			};
			p.request = request;

			return p;
		},
		defaultBlob: function (url, data) {
			return new Promise(function (resolve, reject) {
				function req() {
					var x = new XMLHttpRequest();
					x.open("POST", url, true);
					x.responseType = "blob";
					x.setRequestHeader("Content-Type", "application/json");

					var token = localStorage.getItem("mob_token");
					if (token && token != "") {
						x.setRequestHeader("mob_token", token);
					}

					var empresa = localStorage.getItem("empresa");
					if (empresa && empresa != "") {
						x.setRequestHeader("empresa", empresa);
					}
					x.onload = function (e) {
						resolve(e.target.response);
					};
					x.onreadystatechange = function () {
						if (x.readyState === 4) {
							if (x.status < 200 || x.status >= 299) {
								reject(new Errors.PostError(x.status, x.statusText));
							}
						}
					};
					x.send(JSON.stringify(data));
				}

				req();
			});
		},
	};
	Tools.Modals = {
		custom: function (opts) {
			return new Promise(function (resolve, reject) {
				var buttons = {};
				var preventClose = opts.preventClose;
				if (opts.cancel) {
					buttons.cancel = {
						label: i18n.t(opts.cancel),
						className: "btn-default",
						callback: function () {
							reject(new Error("canceled"));
						},
					};
				}
				if (opts.buttons) {
					opts.buttons.forEach(function (v, k) {
						buttons[k] = {
							label: i18n.t(Array.isArray(v) ? v[0] : v),
							className: Array.isArray(v) ? v[1] : "btn-primary",
							callback: function () {
								resolve(k);
								if (preventClose) return false;
							},
						};
					});
				}
				if (opts.ok) {
					buttons.ok = {
						label: i18n.t(opts.ok),
						className: "btn-success",
						callback: function () {
							resolve("ok");
							if (preventClose) return false;
						},
					};
				}
				var box = {
					message: opts.html || i18n.t(opts.message),
					onEscape: function () {
						reject(new Error("canceled"));
					},
					buttons: buttons,
				};

				// "classes": "warning"
				if (opts.classes) {
					if (Array.isArray(opts.classes)) {
						box.className = opts.classes.join(" ");
					} else {
						box.className = opts.classes;
					}
				}

				if (opts.title) box.title = i18n.t(opts.title);

				bootbox.dialog(box);
			});
		},
		customMulti: function (opts) {
			function resolve(v) {
				for (var i = 0; i < ress.length; i++) {
					ress[i](v);
				}
			}
			function reject(v) {
				for (var i = 0; i < rejs.length; i++) {
					rejs[i](v);
				}
			}
			var rejs = [];
			var ress = [];
			var buttons = {};
			var preventClose = opts.preventClose;
			if (opts.cancel) {
				buttons.cancel = {
					label: i18n.t(opts.cancel),
					className: "btn-default",
					callback: function () {
						reject(new Error("canceled"));
					},
				};
			}
			if (opts.buttons) {
				opts.buttons.forEach(function (v, k) {
					buttons[k] = {
						label: i18n.t(Array.isArray(v) ? v[0] : v),
						className: Array.isArray(v) ? v[1] : "btn-primary",
						callback: function () {
							resolve(k);
							if (preventClose) return false;
						},
					};
				});
			}
			if (opts.ok) {
				buttons.ok = {
					label: i18n.t(opts.ok),
					className: "btn-success",
					callback: function () {
						resolve("ok");
						if (preventClose) return false;
					},
				};
			}
			var box = {
				message: opts.html || i18n.t(opts.message),
				onEscape: function () {
					reject(new Error("canceled"));
				},
				buttons: buttons,
			};

			if (opts.classes) {
				if (Array.isArray(opts.classes)) {
					box.className = opts.classes.join(" ");
				} else {
					box.className = opts.classes;
				}
			}

			if (opts.size) box.size = opts.size;
			if (opts.title) box.title = i18n.t(opts.title);

			if (opts.onShown) box.onShown = opts.onShown;

			var $box = bootbox.dialog(box);

			var d = {
				then: function (cb, ecb) {
					ress.push(cb);
					if (ecb) {
						rejs.push(ecb);
					}
					return d;
				},
				catch: function (cb) {
					rejs.push(cb);
					return d;
				},
				lockButtons: function (btn) {
					let $btns;
					if (btn) {
						$btns = $($box).find(`.modal-footer [data-bb-handler="${btn}"]`);
					} else {
						$btns = $($box).find(".modal-footer [data-bb-handler]");
					}
					$btns
						.css("position", "relative")
						.boxBusy("white", "rgba(150,150,150, 0.5)", "1em", "fa-spinner")
						.prop("disabled", true);
				},
				unlockButtons: function (btn) {
					let $btns;
					if (btn) {
						$btns = $($box).find(`.modal-footer [data-bb-handler="${btn}"]`);
					} else {
						$btns = $($box).find(".modal-footer [data-bb-handler]");
					}
					$btns.prop("disabled", false).boxUnBusy();
				},
			};
			return d;
		},
		confirmDelete: function () {
			return new Promise(function (resolve, reject) {
				bootbox.dialog({
					//need i18n
					size: "small",
					message: i18n.t("app.core.unsaved-warning-delete"),
					title:
						'<i class="fa fa-fw fa-warning"></i>' +
						i18n.t("common.configs.Alert"),
					className: "warning",
					onEscape: function () {
						reject(new Error("canceled"));
					},
					buttons: {
						cancel: {
							label: i18n.t("app.core.unsaved-cancel-delete"),
							className: "btn-default",
							callback: function () {
								reject(new Error("canceled"));
							},
						},
						ok: {
							label: i18n.t("app.core.unsaved-ok-delete"),
							className: "btn-primary",
							callback: function () {
								resolve();
							},
						},
					},
				});
			});
		},
		confirmAction: function (msg) {
			return new Promise(function (resolve, reject) {
				bootbox.dialog({
					//need i18n
					size: "small",
					message: i18n.t(msg || "app.core.confirm-execute"),
					title:
						'<i class="fa fa-fw fa-warning"></i>' +
						i18n.t("common.configs.Alert"),
					className: "warning",
					onEscape: function () {
						reject(new Error("canceled"));
					},
					buttons: {
						cancel: {
							label: i18n.t("app.core.confirm-execute-cancel"),
							className: "btn-default",
							callback: function () {
								reject(new Error("canceled"));
							},
						},
						ok: {
							label: i18n.t("app.core.confirm-execute-ok"),
							className: "btn-primary",
							callback: function () {
								resolve();
							},
						},
					},
				});
			});
		},
		confirmDiscardData: function () {
			return new Promise(function (resolve, reject) {
				bootbox.dialog({
					//need i18n
					size: "small",
					message: i18n.t("app.core.unsaved-warning"),
					title:
						'<i class="fa fa-fw fa-warning"></i>' +
						i18n.t("common.configs.Alert"),
					className: "warning",
					onEscape: function () {
						reject(new Error("canceled"));
					},
					buttons: {
						cancel: {
							label: i18n.t("app.core.unsaved-cancel"),
							className: "btn-default",
							callback: function () {
								reject(new Error("canceled"));
							},
						},
						ok: {
							label: i18n.t("app.core.unsaved-discard"),
							className: "btn-primary",
							callback: function () {
								resolve();
							},
						},
					},
				});
			});
		},
		noRowsSelected: function () {
			bootbox.dialog({
				//need i18n
				size: "small",
				title:
					'<i class="fa fa-fw fa-warning"></i>' +
					i18n.t("common.configs.Alert"),
				message: i18n.t("app.core.unsaved-warning-rowSelectEmpty"),
				className: "warning",
				onEscape: function () {},
				buttons: {
					cancel: {
						label: i18n.t("app.core.unsaved-cancel-rowSelectEmpty"),
						className: "btn-default",
						callback: function () {},
					},
				},
			});
		},
	};
	Tools.Notifications = {
		error: function (err) {
			window.notify({
				text: err.Message
					? i18n.exists(err.Message)
						? i18n.t(err.Message)
						: err.Message
					: i18n.exists(err)
					? i18n.t(err)
					: err,
				color: "red",
			});
		},
		invalidForm: function () {
			window.notify({
				title: i18n.t("app.core.unsaved-warning-validation-required-title"),
				text: i18n.t("app.core.unsaved-warning-validation-required"),
				color: "red",
			});
		},
		success: function (text) {
			window.notify({
				title: i18n.t("app.core.saved-success-title"),
				text: text ? i18n.t(text) || text : i18n.t("app.core.saved-success"),
				color: "green",
			});
		},
		info: function (text) {
			window.notify({
				//	title: i18n.t(text) || text,
				text: i18n.t(text) || text,
				color: "blue",
			});
		},
	};
	window.Tools = Tools;
});

// Test pls ignore
function ScrollyTab(container, opts) {
	var self = this;

	this.$c = $(container);

	if (this.$c.length === 0) return;

	if (this.$c.parent().hasClass("scrolly-container")) return;

	this.st = $('<div class="scrollytab"></div>');
	this.sc = $('<div class="scrolly-container"></div>');
	this.sw = $('<div class="scrolly-wrapper"></div>');
	this.$c.before(this.st);
	this.st.append(this.sw);
	this.sw.append(this.sc);

	this.$c.detach().appendTo(this.sc);

	this.$bb = $(
		'<div class="scrolly-back"><i class="fa fa-chevron-left"></i></div>'
	);
	this.$fb = $(
		'<div class="scrolly-forward"><i class="fa fa-chevron-right"></i></div>'
	);
	this.sw.prepend(this.$bb);
	this.sw.append(this.$fb);

	var check = function () {
		if (self.sc.scrollLeft() === 0) {
			self.$bb.addClass("nope");
		} else {
			self.$bb.removeClass("nope");
		}
		if (
			self.sc.scrollLeft() + self.sc.outerWidth() >=
			Math.floor(self.$c[0].getBoundingClientRect().width) - 10
		) {
			self.$fb.addClass("nope");
		} else {
			self.$fb.removeClass("nope");
		}
	};

	var element = [this.$c[0], this.sc[0]];
	erd.listenTo(this.sc[0], function () {
		check();
	});

	this.$bb.on("click", function () {
		self.sc.stop().animate({ scrollLeft: "-=200" }, 200, "swing", function () {
			check();
		});
	});
	this.$fb.on("click", function () {
		self.sc.stop().animate({ scrollLeft: "+=200" }, 200, "swing", function () {
			check();
		});
	});
	check();
}

var erd = elementResizeDetectorMaker({
	strategy: "scroll", //<- For ultra performance.
});
