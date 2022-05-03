/**
 * Link
 *        A
 *       A A
 *
 *     A     A
 *    A A   A A
 */

Form.Fields.Link = function Link(scope, container, json ){
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
Form.Fields.Link.prototype.init = function(){
  var html = Form.Template( this.json, {data: {
   input: true
  }});

  this.$.html = $(html);
  if( this.json.visibility === 'hidden' )
    this.$.container.parent().addClass('hidden');;

  this.$.container.append(this.$.html);
  this.i18n();
}
Form.Fields.Link.prototype.bind = function(){
 // nop
}
Form.Fields.Link.prototype.i18n = function(){
  this.$.html.i18n();
}
Form.Fields.Link.prototype.getData = function(){
  var d = {};
  d[this.json.id] = this.value;
  return d;
}
Form.Fields.Link.prototype.get = function(){
  return this.value;
}
Form.Fields.Link.prototype.setData = function( data, preventSave ){
  var val = data[ this.json.id ];

  if( !preventSave )
    this.original = val;

  this.set( val );
}
Form.Fields.Link.prototype.set = function( val ){
  this.value = val;
  this.$.container.find('.form-control-link')
    .attr( 'href', val );
  if(this.value == '' || this.value == null){
    this.$.container.find('.form-control-link').addClass('disabled');
  }else{
    this.$.container.find('.form-control-link').removeClass('disabled');
  }
}
Form.Fields.Link.prototype.isChanged = function(){
  return this.get() !== this.original;
}
Form.Fields.Link.prototype.clear = function(){
  this.value = null;
  this.original = null;
  this.set('');
}
Form.Fields.Link.prototype.applyFieldBinds = function(){
}
Form.Fields.Link.prototype.validate = function(){
  // stub
}
Form.Fields.Link.prototype.saveData = function(){
}
Form.Fields.Link.prototype.refresh = function(){
 // nop
}
Form.Fields.Link.prototype.reset = function(){
 // nop
}
Form.Fields.Link.prototype.onChange = function( callback ){
  if( !this.changeListeners )
    this.changeListeners = [];

  this.changeListeners.push( callback );
}
Form.Fields.Link.prototype._ = scopeInterface;
Form.Fields.Link.prototype.is = function(t){
  if( t === '*' )
    return true;
  return (t.toLowerCase() === ('Link').toLowerCase()
    || t.toLowerCase() === this.json.id.toLowerCase() );
};