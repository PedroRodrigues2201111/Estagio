/*     MainController
 * Handles creation of side menu, language, and settings
 */

window.app = window.app || {};

window.app.debug = true;
window.app.tabs = true;

function MainController(menuContainer, viewContainer) {
	var self = this;
	this.children = [];
	this.menuContainer = menuContainer;
	this.viewContainer = viewContainer;

	this.viewMap = {};

	this.storage = new StorageController();

	this.lang = new LangController(this, function () {
		// instances check
		/*
    var noWarn = false;
    window.addEventListener("storage", function(e){
      if(e.key === 'hello_there'){
        if(!noWarn){
          noWarn = true;
          alert(i18n.t('app.core.multiple_instances_warning'));
        }
      }
      if(e.key === 'hello'){
        noWarn = true;
        localStorage.setItem("hello_there", JSON.stringify(Date.now()));
      }
    });
    localStorage.setItem("hello", JSON.stringify(Date.now()));
    */
		self.children.push(self.lang);

		self.auth = new AuthController(self);
		self.children.push(self.auth);

		self.auth.done(function (json) {
			self.json = json;
			self.formats = {
				// TODO
				/* currency: self.auth.userData.OutputManagerWebCurrency,
        date: self.auth.userData.OutputManagerWebDateFormat,
        time: self.auth.userData.OutputManagerWebTimeFormat*/
				currency: "0.00 €",
				time: "HH:mm:ss",
				date: "dd/MM/yyyy",
			};
			self.alerts = new AlertController(self);
			self.storage.setUser(
				self.auth.userData.username,
				self.auth.userData.settings
			);
			self.children.push(self.alerts);
			window.Alerts = self.alerts;

			self.lang.postInit();

			self.preload(function () {
				a = typeof loginCallback;
				if (typeof loginCallback === "function") {
					loginCallback(self.auth, function (d) {
						start.call(self, d);
					});
				} else {
					start.call(this, json);
				}

				function start(data) {
					self.init();
				}
			});
		});
	});
}
MainController.prototype.init = function () {
	this.initPermissions();

	var viewList = {};

	var viewIndex = {};

	var pl = function (node) {
		Object.keys(node.item).forEach(function (k) {
			node[k] = node.item[k];
		});
		delete node.item;
		node.view = node.value;
		node.id = node.value;
		var view = window.Views[node.value];
		//		if (view === undefined) return;

		if (view === undefined) return;

		var viewInfo = typeof view === "function" ? view.json : view.view;
		node.i18n = "views." + node.value + ".title";
		node.icon = viewInfo.menuIcon;

		if (node.children.length > 0) {
			node.children.forEach(pl);
		} else {
			delete node.children;
		}
	};

	this.json.menu.forEach(pl);

	this.menu = new Menu(this, this.menuContainer, this.json);
	this.children.push(this.menu);

	q = JSON.simpleCopy(this.json.menu);

	while (q.length > 0 && (!this.json.home || !window.Views[this.json.home])) {
		_q = q.shift();
		if (_q.view && typeof window.Views[_q.view] === "function") {
			this.json.home = _q.view;
		} else if (_q.children) {
			for (i = _q.children.length - 1; i >= 0; i--) {
				q.unshift(_q.children[i]);
			}
		}
	}

	q = this.json.menu.slice();
	while (q.length > 0) {
		k = q.shift();
		this.viewMap[k.id] = k;

		if (k.view) {
			viewList[k.view] = null;
			if (k.id) {
				viewIndex[k.id] = k.view;
			}
		}

		if (k.children) {
			for (i = 0; i < k.children.length; i++) {
				q.push(k.children[i]);
			}
		}
	}
	viewList = Object.keys(viewList);

	window.urlMap = window.urlMap || {};
	window.Views.forEach(function (v) {
		var j = typeof v === "function" ? v.json : v.view;
		if (j.url) {
			window.urlMap[j.url] = j.id;
		}
	});

	// setup navigation events and delegate to current view as needed
	this.navController = new NavController(
		this,
		this.viewContainer,
		this.menu,
		this.viewMap,
		viewIndex,
		this.json.home
	);
	this.children.push(this.navController);

	window.nav = this.navController;
	var $login = $(".login");
	$login.slideUp(null, function () {
		$login.remove();
	});
};
MainController.prototype.i18n = function () {};
MainController.prototype.initPermissions = function () {
	let permissionHandlers = [];
	let _permissions = this.json.userData.permissions;
	this.permissions = {
		bind: (f) => {
			permissionHandlers = [...permissionHandlers, f];
			f(_permissions);
		},
		onChange: (f) => (permissionHandlers = [...permissionHandlers, f]),
		offChange: (f) =>
			(permissionHandlers = permissionHandlers.filter(
				(handler) => handler !== f
			)),
		update: (np) => {
			_permissions = np;
			permissionHandlers.forEach((handler) => handler(_permissions));
		},
		get: (_) => _permissions,
	};
};
MainController.prototype.preload = function (callback) {
	var preload = this.json.menu;

	if (!window.Templates) window.Templates = {};
	if (!window.Views) window.Views = {};
	if (!window.Instances) window.Instances = {};

	MainController.PromiseAll(1, function (callback) {
		$.getJSON(window.app.settings["api-url"] + "/bundles/components")
			.done(function (data) {
				window.Instances = data;
				callback();
			})
			.fail(function () {
				alert("Error loading component bundle.");
				callback();
			});
	}).done(function () {
		MainController.PromiseAll(1, function (callback) {
			$.getJSON(window.app.settings["api-url"] + "/bundles/views")
				.done(function (data) {
					// foreach view get permissions

					window.Views = data.keyMap(function (v) {
						return { view: v };
					});

					// TODO: handle new permissions
					/*
          preload.views.forEach(function(v) {
            var k = v.viewName;
            if (window.Views[k])
              window.Views[k].view.permissions = parsePermissions(
                v.permissionValue
              );
          });*/

					$.getScript(window.app.settings["api-url"] + "/bundles/views_js")
						.done(function () {
							callback();
						})
						.fail(function () {
							console.log(arguments);
							alert("Error loading views.js bundle file");
							callback();
						});
				})
				.fail(function () {
					alert("Error loading views.json bundle file");
					callback();
				});
		}).done(callback);
	});
};
MainController.prototype._ = scopeInterface;
MainController.prototype.is = scopeCompare;

MainController.PromiseAll = function (total, func, callback, progback) {
	if (!(this instanceof MainController.PromiseAll)) {
		// javascript self instantiators yay!
		return new MainController.PromiseAll(total, func, callback, progback);
	}
	var self = this;
	this.finished = 0;
	this.total = total;
	this.callback = callback;
	this.progback = progback;

	function count() {
		self.finished++;
		self.progback && self.progback(self.finished / self.total);
		if (self.finished === self.total) {
			self.callback && setTimeout(self.callback, 0);
		}
	}

	func(count);
};
MainController.PromiseAll.prototype.done = function (callback) {
	if (this.finished === this.total) {
		callback && setTimeout(callback, 0);
	} else {
		this.callback = callback;
	}

	return this;
};
MainController.PromiseAll.prototype.progress = function (callback) {
	this.progback = callback;

	return this;
};
