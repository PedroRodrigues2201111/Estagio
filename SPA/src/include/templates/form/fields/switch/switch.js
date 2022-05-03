/**
 * Switch
 */

Form.Fields.Switch = function Switch(scope, container, json ){
  this.scope = scope;
  this.container = container;
  this.json = json;

  this.$ = {};
  this.$.container = $(this.container);
  this.$.html = null;
  this.form = this._('^form').get(0);

  this.changeActions = this.form.actions;

  this.value = false;
  this.original = null;

  this.old = [];

  this.changeListeners = [];

  this.init();
}
Form.Fields.Switch.prototype.init = function(){
  var html = Form.Template( this.json, {data: {
    input: true
  }});

  this.$.html = $(html);
  if( this.json.visibility === 'hidden' )
    this.$.container.parent().addClass('hidden');;

  this.$.container.append(this.$.html);
  this.$.input = this.$.html.find('input');
  this.bind();
  this.i18n();
}
Form.Fields.Switch.prototype.bind = function(){
  var self = this;
  this.$.input.on('change', function( ev, state ){
    self.value = this.checked;

    self.old.push(self.get());

    if( self.json.onChange ){
      if( self.changeActions[self.json.onChange] ){
        self.changeActions[self.json.onChange](self.get(), self.form,
          function () {
            self.old.pop();
            self.set(self.old.pop());
          }
        );
      }
    }
    self.doChanges();
  });
}
Form.Fields.Switch.prototype.i18n = function(){
  this.$.html.i18n();
  this.refresh();
}
Form.Fields.Switch.prototype.readonly = function(set){
  if( typeof set === 'undefined' )
    return this.isReadOnly;

  this.isReadOnly = !!set;
  this.$.input.prop('disabled', this.isReadOnly);
}
Form.Fields.Switch.prototype.getData = function(){
  var d = {};

  d[this.json.id] = this.get();
  return d;
}
Form.Fields.Switch.prototype.get = function(){
  return ( this.value === undefined && this.json.defaultToFalse === true 
    ? false
    : this.value
  );
}
Form.Fields.Switch.prototype.setData = function( data ){
  var val = data[ this.json.id ];
  this.original = val;
  this.set( val );
}
Form.Fields.Switch.prototype.set = function( val ){
  if( val === "false" ) val = false;
  if( val === "true"  ) val = true;

  this.value = val;
  this.$.input.prop('checked', val);

  this.doChanges();
}
Form.Fields.Switch.prototype.isChanged = function(){
  return (this.get()||false) !== (this.original||false);
}
Form.Fields.Switch.prototype.reset = function(){
  this.set( this.original );
}
Form.Fields.Switch.prototype.clear = function(){
  // nop?
}
Form.Fields.Switch.prototype.applyFieldBinds = function(){
  var self = this;
  var B = this.json.binds;
  if(!B) return;

  B.forEach(function(b){
    if( b.to ){
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
    }else if( b.target ){
      var t = self;

      t.onChange(function(){
        var get = t.get();
        if( ( b.field && get ? get[b.field] : get ) == b.value ){
          self.doTo( {type: b.type || 'field', target: b.target}, b.do, b.to);
        }else{
          self.doTo( {type: b.type || 'field', target: b.target}, b.do, b.to, true);
        }
      });

      var get = t.get();
      if( ( b.field && get ? get[b.field] : get ) == b.value ){
        self.doTo( {type: b.type || 'field', target: b.target}, b.do, b.to);
      }else{
        self.doTo( {type: b.type || 'field', target: b.target}, b.do, b.to, true);
      }

    }
  });
}
Form.Fields.Switch.prototype.do = function( value, action, context, undo ){
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
  var bA = Form.Fields.Switch.bindActions;

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

Form.Fields.Switch.prototype.doTo = function( target, action, context, undo ){
  var self = this;
  if(!this.targetStates)
    this.targetStates = {};

  if(!this.targetStates[target.type + '_' + target.target])
    this.targetStates[target.type + '_' + target.target] = {};

  // Get previous differences
  var psK = Object.keys(this.targetStates[target.type + '_' + target.target]);
  var ps = {}; // previous state
  for( var i = 0 ; i < psK.length ; i++ ){
    ps[this.targetStates[target.type + '_' + target.target][psK[i]]] = true;
  }

  if(undo){
    if(this.targetStates[target.type + '_' + target.target][action+'_'+context]){
      delete this.targetStates[target.type + '_' + target.target][action+'_'+context];
    }else{
      return;
    }
  }else{
    if(!this.targetStates[target.type + '_' + target.target][action+'_'+context]){
      this.targetStates[target.type + '_' + target.target][action+'_'+context] = action;
    }else{
      return;
    }
  }


  // Get current differences
  var csK = Object.keys(this.targetStates[target.type + '_' + target.target]);
  var cs = {}; // current state
  for( var i = 0 ; i < csK.length ; i++ ){
    cs[this.targetStates[target.type + '_' + target.target][csK[i]]] = true;
  }

  // Just making bA as a shortcut for bindActions
  var bA = Form.Fields.Switch.bindActions;

  // reset states
  var aK = Object.keys(bA);
  for( var i = 0 ; i < aK.length ; i++ ){
    if( ps[aK[i]] ){      // if in previous
      if( cs[aK[i]] ){    // and in current
        continue;         // same state. do nothing
      }
      bA[aK[i]][1](this, target); // not in current. undo
    }

    if( cs[aK[i]] ){      // if only in current
      bA[aK[i]][0](this, target); // apply state
    }
  }
}
Form.Fields.Switch.prototype.validate = function(){
  // stub
}
Form.Fields.Switch.prototype.saveData = function(){
  this.original = this.get();
  this.doChanges();
}
Form.Fields.Switch.prototype.refresh = function(){
  // nop
}
Form.Fields.Switch.prototype.doChanges = function(){
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
Form.Fields.Switch.prototype.onChange = function( callback ){
  if( !this.changeListeners )
    this.changeListeners = [];

  this.changeListeners.push( callback );
}
Form.Fields.Switch.bindActions = {
  disable: [
    function( self ){ // Do
      self.$.input.prop('disabled', true);
    },
    function( self ){ // Undo
      self.$.input.prop('disabled', false);
    }
  ],
  enable: [
    function( self ){ // Do
      self.$.input.prop('disabled', false);
    },
    function( self ){ // Undo
      self.$.input.prop('disabled', true);
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
  uncheck: [
    function( self ){ // Do
      self.$.input.prop('checked', false);
    },
    function( self ){ // Undo
    }
  ],
  show: [
    function( self, target ){ // Do
      if( target && target.type === 'tab' ){
        self.form.$.container.find('[data-tab-id="'+target.target+'"]').each(function(){
          var $this = $(this);
          var states = JSON.parse( decodeURIComponent($this.attr('data-state-shown') || '') || '[]' );
          if( states.indexOf( self.json.id ) === -1 ){
            states.push( self.json.id );
            $this.attr('data-state-shown', encodeURIComponent(JSON.stringify(states)) );
          }
        });
      }else{
        self.$.container.parent().removeClass('hidden');
      }
    },
    function( self, target ){ // Undo
      if( target && target.type === 'tab' ){
        self.form.$.container.find('[data-tab-id="'+target.target+'"]').each(function(){
          var $this = $(this);
          var states = JSON.parse( decodeURIComponent($this.attr('data-state-shown') || '') || '[]' );
          if( states.indexOf( self.json.id ) > -1 ){
            states.splice( states.indexOf( self.json.id ), 1 );

            if( states.length === 0 ){
              $this.removeAttr('data-state-shown');
            }else{
              $this.attr('data-state-shown', encodeURIComponent(JSON.stringify(states)) );
            }
          }
        });
      }else{
        self.$.container.parent().addClass('hidden');
      }
    }
  ]
}
Form.Fields.Switch.prototype._ = scopeInterface;
Form.Fields.Switch.prototype.is = function(t){
  if( t === '*' )
    return true;
  return (t.toLowerCase() === ('Switch').toLowerCase()
    || t.toLowerCase() === this.json.id.toLowerCase() );
};
