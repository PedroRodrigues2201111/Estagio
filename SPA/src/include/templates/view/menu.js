function Menu(scope, container, json) {
  this.container = container;
  this.$ = {};
  this.$.container = $(this.container);
  this.scope = scope;
  this.json = json;
  this.init();
}
Menu.prototype.init = function() {
  this.html = Menu.Template(
    { items: this.json.menu },
    {
      helpers: {
        getUrl: function(viewName) {
          if (window.Views[viewName] && window.Views[viewName].json)
            return window.Views[viewName].json.url;

          return viewName;
        }
      }
    }
  );

  this.$.html = $(this.html);

  this.$.container.append(this.$.html);
  this.i18n();
};
Menu.prototype.i18n = function() {
  this.$.html.i18n();
};
Menu.prototype.getSectionByUrl = function(url) {
  return urlMap[url];
};
Menu.prototype.getUrlBySection = function(section) {
  var k = Object.keys(window.urlMap).find(function(k) {
    return window.urlMap[k] === section;
  });
  return k;
};
Menu.prototype.nav = function(view) {
  view = this.getUrlBySection(view) || view;
  var target = this.$.html.find('[data-view="' + view + '"]').parent();
  if (target.length === 0) {
    console.error("View " + view + " not found in menu.");
    return;
  }

  var target = target;
  var contains = this.$.html.find(".treeview-menu").has(target);
  var toClose = this.$.html.find("li.active  > .treeview-menu").not(contains);
  var toOpen = this.$.html.find("li:not(.active) > .treeview-menu").has(target);

  if (document.body.classList.contains("sidebar-collapse")) {
    toClose.css("display", "none");

    toOpen.css("display", "block");
  } else {
    toClose.stop().slideUp($.AdminLTE.options.animationSpeed, function() {
      $(this).css("height", "auto");
    });

    toOpen.stop().slideDown($.AdminLTE.options.animationSpeed, function() {
      $(this).css("height", "auto");
    });
  }
  toClose.parent("li").removeClass("active");
  toOpen.parent("li").addClass("active");

  setTimeout(function() {
    $.AdminLTE.layout.fix();
  }, $.AdminLTE.options.animationSpeed);

  this.$.html.find(".active:not(.treeview)").removeClass("active");
  target.addClass("active");
};
Menu.prototype.close = function(id) {
  this.$.html
    .find("#" + id)
    .children(".treeview-menu")
    .stop()
    .slideUp($.AdminLTE.options.animationSpeed)
    .parent("li")
    .removeClass("active");
};
Menu.prototype.getContainer = function() {
  return this.$.container;
};
Menu.prototype._ = scopeInterface;
Menu.prototype.is = scopeCompare;

Menu.Template = Handlebars.templates["view/menu"];

window.Templates.menu = Menu;
