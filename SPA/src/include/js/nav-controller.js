function NavController(scope, container, menu, viewMap, viewIndex, home) {
	this.scope = scope;
	this.children = [];
	this.container = container;
	this.menu = menu;
	this.viewMap = viewMap;
	this.viewList = Object.keys(viewMap);

	this.viewIndex = viewIndex;
	this.home = home;

	this.unsaved = {};

	this.menuContainer = menu.getContainer();

	this.init();
}

NavController.prototype.init = function () {
	this.viewController = new ViewController(this, this.container);
	this.children.push(this.viewController);

	var nav = NavController.parseUrl(
		window.location.hash.substring(1),
		window.location.hash
	);

	if (nav.section === "") nav = this.home;
	this.goto(nav);

	this.bindMenu();

	this.menuContainer
		.find('[data-id="' + (nav.section || nav) + '"]')
		.parentsUntil(".sidebar-menu", "li")
		.addClass("active")
		.children("ul")
		.css("display", "block");

	this.setupHistory();
	this.updateUnsaved();

	this.i18n();
};
NavController.prototype.i18n = function () {
	document.title =
		"CS > " + i18n.t("views." + this.getCurrentSection() + ".title");

	this.updateUnsaved();
};
NavController.prototype.bindMenu = function () {
	var self = this;
	var $as = this.menuContainer.find("a");
	$as.on("click", function (ev) {
		ev.preventDefault();

		var $this = $(this);

		if ($this.parent().parent().hasClass("sidebar-menu")) {
			// do maths
			var height = $this.siblings(".treeview-menu").children().length * 30 + 44;
			var top = $this.offset().top;

			if (height + top > document.body.offsetHeight) {
				$this.parent().addClass("upside");
			} else {
				$this.parent().removeClass("upside");
			}

			if ($this.parent().hasClass("active")) return;
		}

		var c = $this.parent()[0].classList;
		if (c.contains("active") && c.contains("treeview")) {
			// console.log('Closing '+$this.parent().id);
			self.menu.close($this.parent()[0].id);
		} else {
			var cur = $this.parent();
			while (cur.is(".treeview")) {
				cur = cur.children(".treeview-menu").children(":first");
			}
			self.goto(cur.children("a").data("view"));
		}
	});
};
NavController.prototype.setUnsaved = function (unsaved, tabId, section, title) {
	if (!section || !tabId) return;

	var $html = $(".unsaved .items");
	this.unsavedCount = this.unsavedCount || 0;
	var url =
		"#" +
		Views[section].json.url +
		"/" +
		tabId.replace(/(^\/+|\/+$)/g, "") +
		"/";

	if (unsaved) {
		if (!this.unsaved[section]) {
			this.unsaved[section] = {
				tabs: {},
				$html: null,
			};
			this.unsaved[section].$html = $(
				'<li data-section="' +
					section +
					'" >' +
					' <span class="ital" ' +
					'style="display:block;font-size:12px;color: rgb(159, 159, 159);" ' +
					'data-i18n="' +
					this.viewMap[section]["i18n"] +
					'">' +
					"</span>" +
					"</li>"
			);
			this.unsaved[section].$html.i18n();
			$html.append(this.unsaved[section].$html);
		}

		if (!this.unsaved[section].tabs[tabId]) {
			this.unsavedCount++;

			this.unsaved[section].tabs[tabId] = {
				title: title,
				section: section,
				tabId: tabId,
				$html: null,
			};

			this.unsaved[section].tabs[tabId].$html = $(
				"<li>" +
					'<a href="' +
					url +
					'" data-url="' +
					url +
					'" ' +
					'title="' +
					i18n.t(this.viewMap[section]["i18n"]) +
					'">' +
					'<i class="fa fa-fw fa-angle-right"></i> <span></span>' +
					"</a>" +
					"</li>"
			);

			this.unsaved[section].$html.append(
				this.unsaved[section].tabs[tabId].$html
			);
		}

		this.unsaved[section].tabs[tabId].title = title;
		this.unsaved[section].tabs[tabId].$html.find("span").text(title);
	} else {
		if (!this.unsaved[section] || !this.unsaved[section].tabs[tabId]) return;

		this.unsavedCount--;
		this.unsaved[section].tabs[tabId].$html.remove();
		delete this.unsaved[section].tabs[tabId];
		if (Object.keys(this.unsaved[section].tabs).length === 0) {
			this.unsaved[section].$html.remove();
			delete this.unsaved[section];
		}
	}

	if (this.unsavedCount === 0) {
		$(".unsaved-toggle").addClass("hidden");
		$(".unsaved").removeClass("open");
	} else {
		$(".unsaved-toggle").removeClass("hidden");
	}
	$(".unsaved-count").text(this.unsavedCount > 0 ? this.unsavedCount : "");
	$(".unsaved .header").text(
		i18n.t("app.core.unsaved", { count: this.unsavedCount })
	);
};
NavController.prototype.updateUnsaved = function () {
	var K = Object.keys(this.unsaved);
	for (var i = 0; i < K.length; i++) {
		this.unsaved[K[i]].$html.i18n();
	}

	if (this.unsavedCount === 0) {
		$(".unsaved-toggle").addClass("hidden");
		$(".unsaved").removeClass("open");
	} else {
		$(".unsaved-toggle").removeClass("hidden");
	}

	$(".unsaved-count").text(this.unsavedCount > 0 ? this.unsavedCount : "");
	$(".unsaved .header").text(
		i18n.t("app.core.unsaved", { count: this.unsavedCount })
	);
};
NavController.prototype.setupHistory = function () {
	var self = this;
	window.addEventListener("hashchange", function (ev) {});

	window.addEventListener("beforeunload", function (ev) {
		if (window.isElectron) return;

		if (self.unsavedCount > 0) {
			// stahp, no, niet, não, rien, nein, non, nope

			// from i18n
			var message = i18n.t("app.errors.unsaved");

			// I dont even know. probably some IE
			ev.preventDefault();

			// Chrome, IE, Firefox
			ev.returnValue = message + " ";

			// Firefox fallback, old Webkit browsers
			return message;
		}
	});

	window.addEventListener("popstate", function (ev) {
		self.goto(NavController.parseUrl(window.location.hash.substring(1)), true);
		ev.preventDefault();
	});
};
NavController.prototype.getCurrentSection = function () {
	return this.currentSection;
};
NavController.prototype.getUrlBySection = function (section) {
	var k = Object.keys(window.urlMap).find(function (k) {
		return window.urlMap[k] === section;
	});
	return k;
};
NavController.prototype.tabChanged = function (tab) {
	var url = "#" + this.getUrlBySection(this.currentSection) + "/" + tab + "/";

	if (window.location.toString().indexOf(url) === -1) {
		history.pushState({ timestamp: Date.now() }, null, url);
	}
};
NavController.prototype.getSectionByUrl = function (url) {
	return urlMap[url];
};
NavController.prototype.goto = function (nav, preventPush) {
	// check if can
	// if yes

	// var section = nav.section || nav;
	var url = nav ? nav.section || nav : null;
	var section = this.getSectionByUrl(url);
	// TODO: get view from url
	if (!main.viewMap[section]) {
		console.error('Nonexistent view: "' + section + '".');
		section = this.home;
	}
	this.currentSection = section;
	this.viewController.changeView(this.viewIndex[section], section);

	var tab = nav.tab || this.viewController.getDefaultTab();
	if (!this.viewController.canNavigate(tab)) {
		console.error("Can't find tab " + tab);
		tab = this.viewController.getDefaultTab();
	}
	if (!preventPush && !!tab) {
		var url =
			"#" +
			this.getUrlBySection(section) +
			"/" +
			(!!tab ? tab + "/" : "") +
			(!!nav.tid ? nav.tid + "/" : "") +
			(!!nav.data ? "@" + encodeURIComponent(JSON.stringify(nav.data)) : "");

		if (window.location.toString().indexOf(url) === -1) {
			history.pushState({ timestamp: Date.now() }, null, url);
		}
	}

	this.menu.nav(section);
	this.viewController.navigateView(tab, nav.tid, nav.data);
	document.title = "CS > " + i18n.t("views." + section + ".title");
	/**
  $(".help-section")
    .empty()
    .attr("data-i18n", "[html]help-html." + section)
    .i18n();
  var $m = $(".help-section")
    .parent()
    .children(".manual");
  var l = i18n.lng();
  var ml = manualLangMap[l] ? manualLangMap[l] : "en";

  var href =
    "/manualViewer/web/viewer.html?file=/Help/sendysexplorer-administrator" +
    (ml === "en" ? "" : "_" + ml) +
    ".pdf#s=" +
    encodeURIComponent((manualMap[ml][section] || []).join("_"));

  if ($m.length === 0) {
    $(
      '<h3 class="manual">' +
        '<a style="color:white" href="' +
        href +
        '" target="_blank">' +
        '<i class="fa fa-book"></i> ' +
        '<span data-i18n="app.core.manual">Manual</span>' +
        "</a></h3><hr>"
    )
      .insertBefore($(".help-section"))
      .i18n();
  } else {
    $m.children("a").attr("href", href);
  }*/
	// update menu
};
NavController.prototype._ = scopeInterface;
NavController.prototype.is = scopeCompare;

NavController.parseUrl = function (pathname) {
	var fp = pathname.split("@");
	var path = NavController.pathnameTrim(fp[0]).split("/");
	var data = null;

	if (fp[1]) data = JSON.tryParse(decodeURIComponent(fp[1]));

	var section = path[0];
	var tab = path[1];
	var tid = path
		.slice(2)
		.filter(function (p) {
			return p != "";
		})
		.join("/");

	return {
		section: section,
		tab: tab,
		tid: tid,
		data: data,
	};
};
NavController.pathnameTrim = function (pathname) {
	return pathname.replace(/^\/?(.*)\/?$/g, function (a, v) {
		return v;
	});
};
NavController.hashTrim = function (hash) {
	if (hash[0] === "#") return hash.substring(1);
	return hash;
};
