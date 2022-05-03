UsersView.prototype = new View();
UsersView.prototype.constructor = UsersView;

function UsersView(scope, container, section) {
	this.scope = scope;
	this.section = section;
	this.children = [];
	this.container = container;
	this.$.container = $(this.container);
	this.json = UsersView.json;

	this.init();
}
UsersView.prototype.initActions = function () {
	var self = this;
	this.Actions = {
		form: {
			addRole: function (_, form) {
				var select = form._("_roleSelect")[0];
				var val = select.getObject();

				var list = form._("_roles")[0];

				if (val && !list.get().find((r) => r.ID === val.ID)) {
					list.addItem(val);
				}
			},
		},
	};
};

UsersView.json = window.Views.UsersView.view;
window.Views.UsersView = UsersView;
