/**
 * Password
 */

Form.Fields.Password = function Password(scope, container, json ){
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
Form.Fields.Password.prototype.init = function(){
  var html = Form.Template( this.json, {data: {
    input: true
  }});

  this.$.html = $(html);
  if( this.json.visibility === 'hidden' )
    this.$.container.parent().addClass('hidden');;

  this.$.container.append(this.$.html);
  this.$.input = this.$.container.find('input');
  this.$.button = this.$.container.find('button');
  //this.$.container.find('.form-password').password();
  //this.$.container.find('.input-append').css('width','100%');
  this.bind();
  this.i18n();
}
Form.Fields.Password.prototype.bind = function(){
  var self = this;
  this.$.input.on('input change', function( ev ){
    self.value = this.value;
    self.validate();

    self.doChanges();
  });
  this.$.button.on('click', function( ev ){
    self.$.input.attr('type', self.$.input.attr('type') === 'text' ? 'password' : 'text')
  });
}
Form.Fields.Password.prototype.i18n = function(){
  this.$.html.i18n();
}
Form.Fields.Password.prototype.readonly = function(set){
  if( typeof set === 'undefined' )
    return this.isReadOnly;

  this.isReadOnly = !!set;
  this.$.input.attr('readonly', this.isReadOnly);
}
Form.Fields.Password.prototype.getData = function(){
  var d = {};
  d[this.json.id] = this.value;
  return d;
}
Form.Fields.Password.prototype.get = function(){
  return this.value;
}
Form.Fields.Password.prototype.setData = function( data ){
  this.original = data[ this.json.id ];
  this.set( this.original );
}
Form.Fields.Password.prototype.set = function( val ){
  this.value = val;
  this.$.input.val( val );

  this.doChanges();
}
Form.Fields.Password.prototype.isChanged = function(){
  var val = this.get();
  return val !== this.original &&
    !(this.original === null && val === '' );
}
Form.Fields.Password.prototype.reset = function(){
  this.set( this.original );
}
Form.Fields.Password.prototype.clear = function(){
  this.value = null;
  this.original = null;

  this.$.input.val('');
  this.clearErrors();
}
Form.Fields.Password.prototype.clearErrors = function(){
  if( !this._tabli )
    this._tabli = $('[href="#'+this.$.html.closest('.tab-pane').attr('id')+'"]').parent();

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
}
Form.Fields.Password.prototype.applyFieldBinds = function(){
  var self = this;
  var B = this.json.binds;
  if(!B) return;

  B.forEach(function(b){
    var t = self.form._('_'+b.to).get(0);
    // create bind
    t.onChange(function(){
      var get = t.get();
      if( ( b.field && get ? get[b.field] : get ) == b.value ){
        self.do(b.value,b.do, b.to);
      }else{
        self.do(b.value,b.do, b.to, true);
      }
    });
    // apply it
    var get = t.get();
    if( ( b.field && get ? get[b.field] : get ) == b.value ){
      self.do(b.value,b.do, b.to);
    }else{
      self.do(b.value,b.do, b.to, true);
    }
  });
}
Form.Fields.Password.prototype.do = function( value, action, context, undo ){
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
    if(this.state[action+'_'+value+'_'+context]){
      delete this.state[action+'_'+value+'_'+context];
    }else{
      return;
    }
  }else{
    if(!this.state[action+'_'+value+'_'+context]){
      this.state[action+'_'+value+'_'+context] = action;
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
  var bA = Form.Fields.Password.bindActions;

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
Form.Fields.Password.prototype.validate = function(){
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
Form.Fields.Password.prototype.saveData = function(){
  this.original = this.get();
  this.doChanges();
}
Form.Fields.Password.prototype.doChanges = function(){
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
Form.Fields.Password.prototype.refresh = function(){

}
Form.Fields.Password.prototype.onChange = function( callback ){
  if( !this.changeListeners )
    this.changeListeners = [];

  this.changeListeners.push( callback );
}
Form.Fields.Password.bindActions = {
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
  ],
  show: [
    function( self ){ // Do
      self.$.container.parent().removeClass('hidden');
    },
    function( self ){ // Undo
      self.$.container.parent().addClass('hidden');
    }
  ]
}
Form.Fields.Password.prototype._ = scopeInterface;
Form.Fields.Password.prototype.is = function(t){
  if( t === '*' )
    return true;
  return (t.toLowerCase() === ('Password').toLowerCase()
    || t.toLowerCase() === this.json.id.toLowerCase() );
};