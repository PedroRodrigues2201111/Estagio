function StorageController(scope) {
	this.scope = scope;
	this.prefix = "SE:";

	this.globalData = null;

	this.userData = null;
	this.user = null;

	this.init();
}

StorageController.prototype.init = function () {
	// check if support exists
	this.globalData = localStorage.getItem(this.prefix + "global");
	if (this.globalData === null || this.globalData === undefined) {
		this.globalData = {};
	} else {
		this.globalData = JSON.parse(this.globalData);
	}
};
StorageController.prototype.bind = function () {};
StorageController.prototype.i18n = function () {};
StorageController.prototype.getGlobal = function (key) {
	return this.globalData.pathGet(key);
};
StorageController.prototype.setGlobal = function (key, val) {
	this.globalData.pathSet(key, val);
	localStorage.setItem(this.prefix + "global", JSON.stringify(this.globalData));
};
StorageController.prototype.setUser = function (username, data) {
	this.user = username;
	if (
		data === undefined ||
		data === null ||
		data === "" ||
		typeof JSON.parse(data) !== "object"
	) {
		this.userData = localStorage.getItem(this.prefix + "user:" + this.user);
		if (this.userData === null || this.userData === undefined) {
			this.userData = {};
		} else {
			this.userData = JSON.parse(this.userData);
		}
	} else {
		this.userData = JSON.parse(data);
		localStorage.setItem(
			this.prefix + "user:" + this.user,
			JSON.stringify(this.userData)
		);
	}
};
StorageController.prototype.get = function (key) {
	if (this.userData === null || this.userData === undefined) return;

	return this.userData.pathGet(key);
};
StorageController.prototype.set = function (key, val) {
	if (this.userData === null || this.userData === undefined) return null;

	this.userData.pathSet(key, val);

	localStorage.setItem(
		this.prefix + "user:" + this.user,
		JSON.stringify(this.userData)
	);
	Tools.Ajax.defaultPost(
    window.app.settings["api-url"] + "/users/setUserPortalSettings",
		{ settings: JSON.stringify(this.userData) }
	)
		.then(function() {})
		.catch(function(err) {
		console.error(err);
		});

	return null;
};
StorageController.prototype.clear = function () {
	if (this.userData === null || this.userData === undefined) return null;

	this.userData = {};

	localStorage.setItem(
		this.prefix + "user:" + this.user,
		JSON.stringify(this.userData)
	);
	Tools.Ajax.defaultPost(
	window.app.settings["api-url"] + "/users/setUserPortalSettings",
		{ settings: JSON.stringify(this.userData) }
	)
		.then(function () {})
		.catch(function (err) {
			console.error(err);
		});

	return null;
};

StorageController.prototype._ = scopeInterface;
StorageController.prototype.is = scopeCompare;
