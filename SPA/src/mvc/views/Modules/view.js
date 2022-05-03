ModulesView.prototype = new View();
ModulesView.prototype.constructor = ModulesView;

function ModulesView(scope, container, section) {
  this.scope = scope;
  this.section = section;
  this.children = [];
  this.container = container;
  this.$.container = $(this.container);
  this.json = ModulesView.json;

  this.init();
}
ModulesView.prototype.initActions = function() {
  var self = this;
  this.Actions = {
    form: {       
    }
  };
};

ModulesView.json = window.Views.ModulesView.view;
window.Views.ModulesView = ModulesView;
