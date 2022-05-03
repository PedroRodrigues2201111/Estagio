/*     ViewController
 * Handles loading of view data, view instantiation and switching
 */
function ViewController( scope, container ){
  var self = this;
  this.scope = scope;
  this.children = [];
  this.container = container;
  this.$ = {};
  this.$.container = $(this.container);

  this.currentView = null;

  this.views = {}; //.view, .container, .json
  window.Views.forEach(function( v, k ){
    self.views[k] = {};
  });
  this.$.views = {};

  this.init();

}
ViewController.prototype.init = function(){
  // nop yet
}
ViewController.prototype.getCurrentView = function(){
  return this.currentView;
}
ViewController.prototype.changeView = function( view, section ){
  if( !view || view === this.currentView || !window.Views[view] )
    return;

  var self = this;
  // needs to check if exists

  if( !this.$.views[view] ){
    var container = document.createElement('div');
    container.className = 'content-wrapper';
    this.container.appendChild( container );

    var newView = new window.Views[ view ]( this, container, section );
    this.children.push(newView);

    this.views[view].view = newView;
    this.$.views[view] = $(container);
  }
  this.$.views.forEach(function(v){
    if( !v.is(self.$.views[view]) )
      v.hide();
  });
  this.$.views[view].show();
  this._('_'+view).find('_tab').get(0).children.forEach(function(v){v.refresh()});
  this._('_'+view).refresh();
  this.currentView = view;
}
ViewController.prototype.navigateView = function( tab, id, data ){
  if( tab ){
    this.views[this.currentView].view.changeOrMakeTab( tab, id, data );
  }
}
ViewController.prototype.canNavigate = function( tab ){
  if( tab ){
    var t = tab.split('_');
    var tb = t[0];
    var id = t[1];

    return this.views[this.currentView].view.tabExists( tb );
  }
}
ViewController.prototype.getDefaultTab = function(){
  if(!this.currentView)
    return;
  return this.views[this.currentView].view.getDefaultTab();
}
ViewController.prototype._ = scopeInterface;
ViewController.prototype.is = scopeCompare;
ViewController.prototype.isVisible = function(){
  return true;
};
