/**
 * Static
 */

Form.Fields.Static = function Static(scope, container, json ){
  this.scope = scope;
  this.container = container;
  this.json = json;

  this.$ = {};
  this.$.container = $(this.container);
  this.$.html = null;
  this.form = this._('^form').get(0);

  this.value = null;
  this.original = null;

  this.changeListeners = [];

  this.init();
}
Form.Fields.Static.prototype.init = function(){
  var html = Form.Template( this.json, {data: {
   input: true
  }});

  this.$.html = $(html);
  if( this.json.visibility === 'hidden' )
    this.$.container.parent().addClass('hidden');;

  this.$.container.append(this.$.html);
  this.i18n();
}
Form.Fields.Static.prototype.bind = function(){
 // nop
}
Form.Fields.Static.prototype.i18n = function(){
  this.$.html.i18n();
}
Form.Fields.Static.prototype.getData = function(){
  var d = {};
  d[this.json.id] = this.value;
  return d;
}
Form.Fields.Static.prototype.get = function(){
  return this.value;
}
Form.Fields.Static.prototype.setData = function( data, preventSave ){
  var val = data[ this.json.id ];

  if( !preventSave )
    this.original = val;

  this.set( val );
}
Form.Fields.Static.prototype.set = function( val ){
  this.value = val;
  this.$.container.find('.form-control-static')
    .text( val );
}
Form.Fields.Static.prototype.isChanged = function(){
  return this.get() !== this.original;
}
Form.Fields.Static.prototype.clear = function(){
  this.value = null;
  this.original = null;
  this.$.container.find('.form-control-static')
    .text( '' );
}
Form.Fields.Static.prototype.applyFieldBinds = function(){
}
Form.Fields.Static.prototype.validate = function(){
  // stub
}
Form.Fields.Static.prototype.saveData = function(){
}
Form.Fields.Static.prototype.refresh = function(){
 // nop
}
Form.Fields.Static.prototype.reset = function(){
 // nop
}
Form.Fields.Static.prototype.onChange = function( callback ){
  if( !this.changeListeners )
    this.changeListeners = [];

  this.changeListeners.push( callback );
}
Form.Fields.Static.prototype._ = scopeInterface;
Form.Fields.Static.prototype.is = function(t){
  if( t === '*' )
    return true;
  return (t.toLowerCase() === ('Static').toLowerCase()
    || t.toLowerCase() === this.json.id.toLowerCase() );
};