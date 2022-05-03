/**
 * File
 */

Form.Fields.File = function File(scope, container, json ){
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
Form.Fields.File.prototype.init = function(){
  var html = Form.Template( this.json, {data: {
    input: true
  }});

  this.$.html = $(html);
  if( this.json.visibility === 'hidden' )
    this.$.container.parent().addClass('hidden');;

  this.$.container.append(this.$.html);
  this.$.input = this.$.container.find('input');

  var opts = {
    showPreview: !!this.json.preview,
    allowedFileExtensions: this.json.fileTypes,
    showAjaxErrorDetails: false,
    showUpload: false,
    showRemove: false,
    showCancel: false,
    theme: 'fa'
  };

  this.fi = this.$.input.fileinput(opts);

  this.bind();
  this.i18n();
}
Form.Fields.File.prototype.bind = function(){
  var self = this;

  this.$.input.on('input change', function( ev ){
    var files = ev.target.files;
    var file = files[0];

    if (files && file) {
      var reader = new FileReader();

      reader.onload = function(readerEvt) {
        var binaryString = readerEvt.target.result;
        var binary = "";
        var bytes = new Uint8Array(binaryString);
        var length = bytes.byteLength;
        for (var i = 0; i < length; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        self.value = self.json.base64 ? window.btoa( binary ) : binary;
        self.doChanges();
      };

      reader.readAsArrayBuffer(file);
    }
  });
}
Form.Fields.File.prototype.i18n = function(){
  this.$.html.i18n();
}
Form.Fields.File.prototype.getData = function(){
  var d = {};
  d[this.json.id] = this.get();
  return d;
}
Form.Fields.File.prototype.get = function(){
  return this.value;
}
Form.Fields.File.prototype.setData = function( data ){
}
Form.Fields.File.prototype.set = function(){
}
Form.Fields.File.prototype.isChanged = function(){
  var val = this.get();
  return val !== this.original &&
    !(this.original === null && val === '' );
}
Form.Fields.File.prototype.reset = function(){
  // clear
}
Form.Fields.File.prototype.clear = function(){
  this.value = null;
  this.original = null;

  this.$.input.val('');
}
Form.Fields.File.prototype.applyFieldBinds = function(){
  var self = this;
  var B = this.json.binds;
  if(!B) return;

  B.forEach(function(b){
    var t = self.form._('_'+b.to).get(0);
    // create bind
    t.onChange(function(){
      if( t.get() === b.value ){
        self.do(b.do, b.to);
      }else{
        self.do(b.do, b.to, true);
      }
    });
    // apply it
    if( t.get() === b.value ){
      self.do(b.do, b.to);
    }else{
      self.do(b.do, b.to, true);
    }
  });
}
Form.Fields.File.prototype.do = function( action, context, undo ){
  var self = this;
  if(!this.state)
    this.state = {};

  // Get previous differences
  var psK = Object.keys(this.state);
  var ps = {}; // previous state
  for( var i = 0 ; i < psK.length ; i++ ){
    ps[this.state[psK[i]]] = true;
  }

  if(undo){
    if(this.state[action+'_'+context]){
      delete this.state[action+'_'+context];
    }else{
      return;
    }
  }else{
    if(!this.state[action+'_'+context]){
      this.state[action+'_'+context] = action;
    }else{
      return;
    }
  }


  // Get current differences
  var csK = Object.keys(this.state);
  var cs = {}; // current state
  for( var i = 0 ; i < csK.length ; i++ ){
    cs[this.state[csK[i]]] = true;
  }

  // Just making bA as a shortcut for bindActions
  var bA = Form.Fields.File.bindActions;

  // reset states
  var aK = Object.keys(bA);
  for( var i = 0 ; i < aK.length ; i++ ){
    if( ps[aK[i]] ){      // if in previous
      if( cs[aK[i]] ){    // and in current
        continue;         // same state. do nothing
      }
      bA[aK[i]][1](this); // not in current. undo
    }

    if( cs[aK[i]] ){      // if only in current
      bA[aK[i]][0](this); // apply state
    }
  }
}
Form.Fields.File.prototype.validate = function(){
  var self = this;
  // check if has validation settings
  if( !this.json.validation )
    return true;

  var errors = []; // i18n keys

  // setup validation elements
  if( !this._tabli )
    this._tabli = $('[href="#'+this.$.html.closest('.tab-pane').attr('id')+'"]').parent();


  var val = this.json.validation;
  var value = this.get();

  // validate empty
  if( val.required && ( !value || (value+'').trim() === '' ) ){
    // apply error
    // i18n.t('common.errors.required');
    errors.push('app.errors.required-field');
  }else if( val.regex ){
    // make regexes
    if( !this.regexes ){
      this.regexes = {};

      val.regex.forEach(function( v, k ){
        self.regexes[k] = new RegExp(k);
      });
    }

    var vK = Object.keys(val.regex);
    for( var i = 0 ; i < vK.length ; i++ ){
      var k = vK[i];
      var r = self.regexes[k];

      if( !r.test(value) ){
        errors.push(val.regex[k]);
      }
    }
  }


  if( val.custom ){
    (Array.isArray(val.custom)?val.custom:[val.custom]).forEach(function(f){
      var err;
      if(self.form.actions[f]){
        err = self.form.actions[f]( value, self, val );
        if( err )
          errors.push(err);
      }
    })
  }
  if(errors.length > 0){
    self.$.container.closestChildren('.for-error').html(errors.map(function(v){return i18n.t(v); }).join('<br>'));

    this.$.html.closest('.form-group').addClass('has-error');

    var cerrors = (this._tabli.attr('data-validation-error') || '').split(';');
    if( cerrors.indexOf(this.json.id) < 0 ){
      if(cerrors[0] === '')
        cerrors = [];
      cerrors.push(this.json.id);
      this._tabli.attr('data-validation-error', cerrors.join(';'));
    }
    return false;
  }

  // unset errors. set success?
  var cerrors = (this._tabli.attr('data-validation-error') || '').split(';');
  if( cerrors.indexOf(this.json.id) > -1 ){
    cerrors.splice(cerrors.indexOf(this.json.id), 1);
    if(cerrors.length > 0){
      this._tabli.attr('data-validation-error', cerrors.join(';') );
    }else{
      this._tabli.removeAttr('data-validation-error');
    }
  }
  this.$.html.closest('.form-group').removeClass('has-error');
  return true;
}
Form.Fields.File.prototype.doChanges = function(){
  var changed = this.isChanged();
  var val = this.get();

  if( changed && !this.json.muted ){
    this.$.container.closest('.form-group').addClass('changed');
  }else{
    this.$.container.closest('.form-group').removeClass('changed');
  }

  for( var i = 0 ; i < this.changeListeners.length ; i++ ){
    this.changeListeners[i]( this.json.id, val, changed );
  }
}
Form.Fields.File.prototype.saveData = function(){
  this.original = this.get();
  this.doChanges();
}
Form.Fields.File.prototype.refresh = function(){

}
Form.Fields.File.prototype.onChange = function( callback ){
  if( !this.changeListeners )
    this.changeListeners = [];

  this.changeListeners.push( callback );
}
Form.Fields.File.bindActions = {
  disable: [
    function( self ){ // Do
      self.$.input.prop('disabled', true);
    },
    function( self ){ // Undo
      self.$.input.prop('disabled', false);
    }
  ],
  hide: [
    function( self ){ // Do
      self.$.container.parent().addClass('hidden');
    },
    function( self ){ // Undo
      self.$.container.parent().removeClass('hidden');
    }
  ]
}
Form.Fields.File.prototype._ = scopeInterface;
Form.Fields.File.prototype.is = function(t){
  if( t === '*' )
    return true;
  return (t.toLowerCase() === ('File').toLowerCase()
    || t.toLowerCase() === this.json.id.toLowerCase() );
};