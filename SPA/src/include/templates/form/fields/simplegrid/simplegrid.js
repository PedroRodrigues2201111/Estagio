/**
 * SimpleGrid
 */

Form.Fields.SimpleGrid = function SimpleGrid(scope, container, json ){
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
Form.Fields.SimpleGrid.prototype.init = function(){
  var html = Form.Template( this.json, {data: {
    input: true
  }});
  this.$.html = $(html);
  if( this.json.visibility === 'hidden' )
    this.$.container.parent().addClass('hidden');;

  this.$.container.append(this.$.html);

  this.$.table = this.$.container.find('table');
  this.$.thead = this.$.table.find('thead');
  this.$.tbody = this.$.table.find('tbody');

  this.bind();
  this.i18n();
}
Form.Fields.SimpleGrid.prototype.bind = function(){
  // nop
}
Form.Fields.SimpleGrid.prototype.i18n = function(){
  this.$.html.i18n();
}
Form.Fields.SimpleGrid.prototype.getData = function(){
  // nop
}
Form.Fields.SimpleGrid.prototype.get = function(){
  // nop
}
Form.Fields.SimpleGrid.prototype.setData = function( data ){
  if( !this.data )
    return;
  this.set( data[this.json.id] );
}
Form.Fields.SimpleGrid.prototype.set = function( val ){
  var data = val.data.map(function(v){
    return val.fields.map(function(k){
      return v[k];
    });
  });
  this.$.thead.empty().append('<tr>'+val.fields.map(function(v){return '<th>'+escapeHTML(v+'')+'</th>'})+'</tr>');
  this.$.tbody.empty().append(data.map(function(r){return '<tr>'+r.map(function(v){return '<td>'+escapeHTML(v+'')+'</td>'})+'</tr>'}));
}
Form.Fields.SimpleGrid.prototype.isChanged = function(){
  return false;
}
Form.Fields.SimpleGrid.prototype.reset = function(){
  // nop
}
Form.Fields.SimpleGrid.prototype.clear = function(){
  // clear all
}
Form.Fields.SimpleGrid.prototype.applyFieldBinds = function(){
  // nop
}
Form.Fields.SimpleGrid.prototype.validate = function(){
  // stub
}
Form.Fields.SimpleGrid.prototype.saveData = function(){
  // nop
}
Form.Fields.SimpleGrid.prototype.refresh = function(){
  // nop
}
Form.Fields.SimpleGrid.prototype.onChange = function( callback ){
  // nop
}
Form.Fields.SimpleGrid.prototype._ = scopeInterface;
Form.Fields.SimpleGrid.prototype.is = function(t){
  if( t === '*' )
    return true;
  return (t.toLowerCase() === ('SimpleGrid').toLowerCase()
    || t.toLowerCase() === this.json.id.toLowerCase() );
};
