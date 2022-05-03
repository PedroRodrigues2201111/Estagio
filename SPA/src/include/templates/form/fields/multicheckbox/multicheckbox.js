/**
 * MultiCheckbox
 */

Form.Fields.MultiCheckbox = function MultiCheckbox(scope, container, json ){
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

  // this.init();
  // Only inits on .setData
  //   or options 

  // if options
  //   setData
  //   init 
  //   data == [obj]
  if( this.json.options ){
    /*var d = {};
    d[this.json.id] = this.json.options;
    this.setData( d );*/
    this.original = this.json.options;
    this.init();
  }
}
Form.Fields.MultiCheckbox.prototype.init = function(){
  this.data = JSON.simpleCopy( this.original );
  this.dataIndex = {};
  this.originalIndex = {};

  this.tri = this.json.triState || false;

  var obj = [];
  var d;

  if( this.original ){
    for( var i = 0 ; i < this.original.length ; i++ ){
      d = {};

      d["id"] = this.original[i][this.json.idField];
      this.original[i][this.json.valueField] = this.original[i][this.json.valueField] || false;
      this.data[i][this.json.valueField] = this.data[i][this.json.valueField] || false;
      d["value"] = this.original[i][this.json.valueField];
      if( this.json.labelField ){
        d["label"] = this.original[i][this.json.labelField];
      }else if( this.json.i18nField ){
        d["label-i18n"] = this.json['base-i18n']
          + this.original[i][this.json.i18nField].replace(/\s/g,'_');
      }

      obj.push(d);
      this.dataIndex[d["id"]] = this.data[i];
      this.originalIndex[d["id"]] = this.original[i];
    }
  }
  var html = Form.Template( this.json, {data: {
    input: true,
    data: obj
  }});

  this.$.html = $(html);
  if( this.json.visibility === 'hidden' )
    this.$.container.parent().addClass('hidden');;

  this.$.container.append(this.$.html);

  this.bind();
  this.applyFieldBinds();
  this.i18n();
}
Form.Fields.MultiCheckbox.prototype.bind = function(){
  var self = this;

  this.$.container.find('.checkbox-filter > input').on('input change',function(ev){
    var f = this.value.toLowerCase();

    if( f === '' ){
      self.$.html.find('.multicheckbox').show()
    }else{
      self.$.html.find('.checkboxb > label > span').each(function(){
        var $this = $(this);
        if( $this.text().toLowerCase().indexOf( f ) > -1 ){
          $this.closest('.multicheckbox').show();
        }else{
          $this.closest('.multicheckbox').hide();
        }
      });
    }
  });

  this.$.html.find('.checkboxb > input').on('change', function( ev, state ){
    var id = $(this).closest('div.checkboxb').data('id');

    if( !self.json.radio ){
      if( self.dataIndex[id][self.json.valueField] === "indeterminate" ){
        this.indeterminate = false;
        self.dataIndex[id][self.json.valueField] = false;
        this.checked = false;
      }else if( self.dataIndex[id][self.json.valueField] === false ){
        self.dataIndex[id][self.json.valueField] = true;
      }else if( self.dataIndex[id][self.json.valueField] === true ){
        if( self.tri && self.originalIndex[id][self.json.valueField] === "indeterminate" ){
          self.dataIndex[id][self.json.valueField] = "indeterminate";
          this.indeterminate = true;
        }else{
          self.dataIndex[id][self.json.valueField] = false;
        }
      }
    }else{
      if( self.dataIndex[id][self.json.valueField] === true ){
        //set original
    /*    self.$.container.find('input[type="checkbox"]').each(function(){
          var id = $(this).closest('div.checkboxb').data('id');
          self.dataIndex[id][self.json.valueField] = self.originalIndex[id][self.json.valueField];
          if(self.dataIndex[id][self.json.valueField] === 'indeterminate'){
            this.checked = false;
            this.indeterminate = true;
          }else{
            this.checked = self.dataIndex[id][self.json.valueField];
          }
        });*/
      }else{
        self.dataIndex[id][self.json.valueField] = true;
        self.$.container.find('input[type="checkbox"]').not(this).each(function(){
          var id = $(this).closest('[data-id]').data('id');
          this.checked = false;
          this.indeterminate = false;
          self.dataIndex[id][self.json.valueField] = false;
        });
      }
    }
    self.doChanges();
  });
}
Form.Fields.MultiCheckbox.prototype.unbind = function(){
  var self = this;
  if( this.$.html )
    this.$.html.find('input').off();
}
Form.Fields.MultiCheckbox.prototype.i18n = function(){
  this.$.html.i18n();
}
Form.Fields.MultiCheckbox.prototype.getData = function(){
  var d = {};

  if( this.json.options ){
    d[this.json.id] = this.get();
  }else{
    d[this.json.id] = JSON.simpleCopy(this.data);
  }
  return d;
}
Form.Fields.MultiCheckbox.prototype.get = function(){
  var self = this;

  if( !self.data )
    return;

  if( this.json.options ){
    if( this.json.radio ){
      return self.data.reduce(function(p, c){
        return p || ( c[self.json.valueField] && c[self.json.idField] ) || false;
      }, false);
    }else{
      return self.data.reduce(function(p, c){
        if( c[self.json.idField] ){
          p[c[self.json.idField]] = c[self.json.valueField];
        }
        return p;
      }, {});
    }
  }else{
    return JSON.simpleCopy(this.dataIndex);
  }
}
Form.Fields.MultiCheckbox.prototype.setData = function( data ){
  var val = JSON.simpleCopy(data[ this.json.id ]);

  if( this.json.options ){
    this.originalVal = val;
    this.set(val);
    this.saveData();
  }else{
    this.unbind();
    if( this.$.html )
      this.$.html.remove();

    this.original = val;
    this.init();
  }

}
Form.Fields.MultiCheckbox.prototype.set = function( val ){
  var self = this;
  this.$.container.find('[data-id]').each(function(){
    var id = this.getAttribute('data-id');
    var check = $(this).find('input')[0];

    if( self.json.options ){
      if( self.json.radio ){
        if( val === id ){
          check.checked = true;
          self.dataIndex[id][self.json.valueField] = true;
          check.indeterminate = false;
        }else{
          check.checked = false;
          self.dataIndex[id][self.json.valueField] = false;
          check.indeterminate = false;
        }
      }else{
        if( val[id] ){      
          if( val[id] === "indeterminate"){
            check.checked = false;
            check.indeterminate = true;
            self.dataIndex[id][self.json.valueField] = "indeterminate";
          }else{
            check.checked = !!val[id];
            self.dataIndex[id][self.json.valueField] = !!val[id];
            check.indeterminate = false;
          }
        }else{
          check.checked = false;
          self.dataIndex[id][self.json.valueField] = false;
          check.indeterminate = false;
        }
      }
    }else{
      if( val[id] === "indeterminate"){
        check.checked = false;
        check.indeterminate = true;
        self.dataIndex[id][self.json.valueField] = "indeterminate";
      }else{
        check.checked = !!val[id];
        self.dataIndex[id][self.json.valueField] = !!val[id];
        check.indeterminate = false;
      }
    }
  });
}
Form.Fields.MultiCheckbox.bindActions = {
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
Form.Fields.MultiCheckbox.prototype.isChanged = function(){
  if(!this.data)
    return false;

  for( var i = 0 ; i < this.data.length ; i++ )
    if( this.data[i][this.json.valueField] != this.original[i][this.json.valueField] )
      return true;

  return false;
}
Form.Fields.MultiCheckbox.prototype.reset = function(){
  // nop
}
Form.Fields.MultiCheckbox.prototype.clear = function(){
  // nop?
}

Form.Fields.MultiCheckbox.prototype.applyFieldBinds = function(){
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
Form.Fields.MultiCheckbox.prototype.disable = function(){
  if(this.$.html){
    this.$.html.find('.checkboxb > input').prop('disabled', true);
  }else{
    this.json.disabled = true;
  }
}
Form.Fields.MultiCheckbox.prototype.enable = function(){
  if(this.$.html){
    this.$.html.find('.checkboxb > input').prop('disabled', false);
  }else{
    this.json.disabled = false;
  }
}
Form.Fields.MultiCheckbox.prototype.validate = function(){
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
  if( val.required && this.json.radio && ( value === false ) ){
    // apply error
    // i18n.t('common.errors.required');
    errors.push('app.errors.required-field');
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
Form.Fields.MultiCheckbox.prototype.saveData = function(){
  var self = this;

  this.originalIndex = JSON.simpleCopy(this.dataIndex);
  this.original = JSON.simpleCopy(this.data);

  this.doChanges();
}
Form.Fields.MultiCheckbox.prototype.refresh = function(){
}

Form.Fields.MultiCheckbox.prototype.do = function( value, action, context, undo ){
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
  var bA = Form.Fields.MultiCheckbox.bindActions;

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
Form.Fields.MultiCheckbox.prototype.doChanges = function(){
  var self = this;
  var changed = this.isChanged();
  var val = this.get();

  if( changed && !this.json.muted ){
    this.$.container.closest('.form-group').addClass('changed');
  }else{
    this.$.container.closest('.form-group').removeClass('changed');
  }

  this.$.container.find('[data-id]').each(function(){
    var id = this.getAttribute('data-id');

    var changed = self.originalIndex[id][self.json.valueField]
      !== self.dataIndex[id][self.json.valueField];

    if( changed && !self.json.muted ){
      $(this).closest('.multicheckbox').addClass('changed');
    }else{
      $(this).closest('.multicheckbox').removeClass('changed');
    }
  });

  for( var i = 0 ; i < this.changeListeners.length ; i++ ){
    this.changeListeners[i]( this.json.id, val, changed );
  }
}
Form.Fields.MultiCheckbox.prototype.onChange = function( callback ){
  if( !this.changeListeners )
    this.changeListeners = [];

  this.changeListeners.push( callback );
}
Form.Fields.MultiCheckbox.prototype._ = scopeInterface;
Form.Fields.MultiCheckbox.prototype.is = function(t){
  if( t === '*' )
    return true;
  return (t.toLowerCase() === ('MultiCheckbox').toLowerCase()
    || t.toLowerCase() === this.json.id.toLowerCase() );
};
