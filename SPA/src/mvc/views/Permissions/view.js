PermissionsView.prototype = new View();
PermissionsView.prototype.constructor = PermissionsView;

function PermissionsView(scope, container, section) {
	this.scope = scope;
	this.section = section;
	this.children = [];
	this.container = container;
	this.$.container = $(this.container);
	this.json = PermissionsView.json;

	this.init();
}
PermissionsView.prototype.initActions = function () {
	var self = this;
	this.Actions = {
		form: {},
	};
};

PermissionsView.json = window.Views.PermissionsView.view;
window.Views.PermissionsView = PermissionsView;
