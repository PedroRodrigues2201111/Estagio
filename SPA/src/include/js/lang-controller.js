var languages = {
	"en-US": "English",
	"ar-SA": "Arabic (العربية)",
	"ca-ES": "Catalan (Català)",
	"cs-CZ": "Czech (Čeština)",
	"da-DK": "Danish (Dansk)",
	"nl-NL": "Dutch (Nederlands)",
	"fi-FI": "Finnish (Suomi)",
	"fr-FR": "French (Français)",
	"de-DE": "German (Deutsch)",
	"el-GR": "Greek (Eλληνικά)",
	"es-ES": "Spanish (Español)",
	"sv-SE": "Swedish (Svenska)",
	"hu-HU": "Hungarian (Magyar)",
	"it-IT": "Italian (Italiano)",
	"ja-JP": "Japanese (日本語)",
	"ko-KR": "Korean (한국의)",
	no: "Norwegian (Norsk)",
	"pl-PL": "Polish (Polski)",
	"pt-BR": "Portuguese (Brasileiro)",
	"pt-PT": "Portuguese (Português)",
	"ru-RU": "Russian (Русский)",
	"sk-SK": "Slovak (Slovenčina)",
	"tr-TR": "Turkish (Türkçe)",
	"uk-UA": "Ukrainian (Українська)",
};

function LangController(scope, cb) {
	var self = this;
	this.scope = scope;
	window.i18n = window.i18next;
	i18n.use(i18nextXHRBackend).init(
		{
			lng:
				this.scope.storage.getGlobal("lang") ||
				window.browserLanguage ||
				window.language ||
				"en-US",
			load: "all",
			compatibilityAPI: "v1",
			compatibilityJSON: "v1",
			fallbackLng: "en",
			resGetPath: "include/resources/lang/__lng__.json?_v=" + Date.now(), // + window.BUILD_VERSION
		},
		function () {
			i18n.options.appendNamespaceToMissingKey = false;
			i18n.addPostProcessor("fill", function (val, key, opts) {
				console.warn("Deprecating. Stahp.");
				return Handlebars.compile(val)(opts.data);
			});
			jqueryI18next.init(i18n, $, {
				handleName: "i18n",
			});
			$(".control-sidebar").i18n();
			self.init(cb);
		}
	);
}

LangController.prototype.init = function (cb) {
	var self = this;
	this._langsDisabled = true;

	if (!this._langsDisabled) {
		this.initLanguageMini();
		this.initLanguageMenu();

		this.$langForm.find("select").on("change", function () {
			self.scope.storage.set("lang", this.value);
			self.loadLanguage(this.value);
		});
		this.$miniSelect.on("change", function () {
			// save lang
			self.preInitLang = true;
			self.scope.storage.setGlobal("lang", this.value);
			self.loadLanguage(this.value);
		});

		this.i18n();
	}
	moment.locale(i18n.lng());
	cb();
};
LangController.prototype.postInit = function () {
	if (!this._langsDisabled) {
		if (this.preInitLang) {
			this.$langForm.find("select").val(i18n.lng());
			this.scope.storage.set("lang", i18n.lng());
		} else {
			var userLang = this.scope.storage.get("lang");
			if (userLang) {
				this.$langForm.find("select").val(userLang);
				this.loadLanguage(userLang);
			} else {
				this.scope.storage.set("lang", i18n.lng());
			}
		}
	}
};
LangController.prototype.i18n = function () {
	this.$langForm.i18n();
	this.changeLangLang();
};
LangController.prototype.loadLanguage = function (lang) {
	var self = this;

	moment.locale(lang);
	i18n.setLng(lang, function (err, t) {
		self._("^").find("_*").i18n();
	});
};
LangController.prototype.makeSelect = function () {
	var html = '<select id="lang-select" style="color:black" >';

	languages.forEach(function (v, k) {
		html +=
			'<option value="' +
			k +
			'" ' +
			(i18n.lng() === k ? "selected" : "") +
			" >" +
			k +
			" (" +
			v +
			")</option>";
	});
	html += "</select>";

	return $(html);
};
LangController.prototype.initLanguageMini = function () {
	var $html = $(
		'<div class="box mini-lang"><i class="fa fa-fw fa-globe"></i></div>'
	);
	$(".login").append($html);
	this.$miniSelect = this.makeSelect();

	$html.append(this.$miniSelect);
};
LangController.prototype.initLanguageMenu = function () {
	var form =
		"" +
		"<div>" +
		' <h4 data-i18n="app.settings.lang-head"></h4>' +
		' <div class="form-group">' +
		'   <label class="control-sidebar-subheading">' +
		"   </label>" +
		'   <p data-i18n="app.settings.lang-desc">' +
		"   </p>" +
		" </div>" +
		"</div>";

	this.$langForm = $(form);
	this.$langForm.find(".control-sidebar-subheading").append(this.makeSelect());
	$("#control-sidebar-theme-demo-options-tab hr").after(this.$langForm);
};
LangController.prototype.changeLangLang = function () {
	if (!this._langsDisabled) {
		this.$miniSelect.find("option").each(function (i, el) {
			var k = el.value;
			$(el).text(languages[k]);
		});
		this.$langForm.find("option").each(function (i, el) {
			var k = el.value;
			$(el).text(languages[k]);
		});
	}
};

LangController.prototype._ = scopeInterface;
LangController.prototype.is = scopeCompare;
