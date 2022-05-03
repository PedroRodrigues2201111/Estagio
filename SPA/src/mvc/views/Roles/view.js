RolesView.prototype = new View();
RolesView.prototype.constructor = RolesView;

function RolesView(scope, container, section) {
	this.scope = scope;
	this.section = section;
	this.children = [];
	this.container = container;
	this.$.container = $(this.container);
	this.json = RolesView.json;

	this.init();
}
RolesView.prototype.initActions = function () {
	var self = this;
	this.Actions = {
		form: {
			addPermission: function (_, form) {
				var select = form._("_permissionSelect")[0];
				var val = select.getObject();

				var list = form._("_permissions")[0];

				if (val && !list.get().find((r) => r.ID === val.ID)) {
					list.addItem(val);
				}
			},
		},
	};
};

RolesView.json = window.Views.RolesView.view;
window.Views.RolesView = RolesView;
