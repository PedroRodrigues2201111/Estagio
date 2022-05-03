/**
 * MultiSwitch
 */

Form.Fields.MultiSwitch = function MultiSwitch(scope, container, json ){
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
}
Form.Fields.MultiSwitch.prototype.init = function(){
  this.data = JSON.simpleCopy( this.original );
  this.dataIndex = {};
  var obj = [];
  var d;

  if( this.original ){
    for( var i = 0 ; i < this.original.length ; i++ ){
      d = {};

      d["id"] = this.original[i][this.json.idField];
      d["value"] = this.original[i][this.json.valueField];
      if( this.json.labelField ){
        d["label"] = this.original[i][this.json.labelField];
      }else if( this.json.i18nField ){
        d["label-i18n"] = this.json['base-i18n']
          + this.original[i][this.json.i18nField].toLowerCase().replace(/\s/g,'_');
      }

      if(this.json.onColor)
        d["onColor"] = this.json.onColor;
      if(this.json["label-before"])
        d["label-before"] = this.json["label-before"];

      obj.push(d);
      this.dataIndex[d["id"]] = this.data[i];
    }
    this.originalIndex = JSON.simpleCopy(this.dataIndex);
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
  this.i18n();
}
Form.Fields.MultiSwitch.prototype.bind = function(){
  var self = this;
  this.$.html.find('input').on('change', function( ev, state ){
    var id = $(this).closest('div.checkbox').data('id');
    self.dataIndex[id][self.json.valueField] = this.checked;

    self.doChanges();
  });
}
Form.Fields.MultiSwitch.prototype.unbind = function(){
  var self = this;
  if( this.$.html )
    this.$.html.find('input').off();
}
Form.Fields.MultiSwitch.prototype.i18n = function(){
  this.$.html.i18n();
}
Form.Fields.MultiSwitch.prototype.getData = function(){
  var d = {};

  d[this.json.id] = this.data;
  return d;
}
Form.Fields.MultiSwitch.prototype.get = function(){
  // nop
}
Form.Fields.MultiSwitch.prototype.setData = function( data ){
  var val = JSON.simpleCopy(data[ this.json.id ]);

  this.unbind();
  if( this.$.html )
    this.$.html.remove();

  this.original = val;

  this.init();
}
Form.Fields.MultiSwitch.prototype.set = function( val ){
  // nop
}
Form.Fields.MultiSwitch.prototype.isChanged = function(){
  if(!this.data)
    return false;

  for( var i = 0 ; i < this.data.length ; i++ )
    if( this.data[i][this.json.valueField] != this.original[i][this.json.valueField] )
      return true;

  return false;
}
Form.Fields.MultiSwitch.prototype.reset = function(){
  // nop
}
Form.Fields.MultiSwitch.prototype.clear = function(){
  // nop?
}
Form.Fields.MultiSwitch.prototype.validate = function(){
  // stub
}
Form.Fields.MultiSwitch.prototype.saveData = function(){
  this.original = this.getData()[this.json.id];
  this.doChanges();
}
Form.Fields.MultiSwitch.prototype.refresh = function(){
}
Form.Fields.MultiSwitch.prototype.do = function( value, action, context, undo ){
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
  var bA = Form.Fields.MultiSwitch.bindActions;

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

Form.Fields.MultiSwitch.prototype.applyFieldBinds = function(){
  var self = this;
  var B = this.json.binds;
  if(!B) return;

  B.forEach(function(b){
    if( b.to ){
      var t = self.form._('_'+b.to).get(0);
      // create bind
      t.onChange(function(){
        if( t.get() === b.value ){
          self.do(b.value,b.do, b.to);
        }else{
          self.do(b.value,b.do, b.to, true);
        }
      });
      // apply it
      if( t.get() === b.value ){
        self.do(b.value,b.do, b.to);
      }else{
        self.do(b.value,b.do, b.to, true);
      }
    }else if( b.target ){
      var t = self;

      t.onChange(function(){
        if( t.get() == b.value ){
          self.doTo( {type: b.type || 'field', target: b.target}, b.do, b.to);
        }else{
          self.doTo( {type: b.type || 'field', target: b.target}, b.do, b.to, true);
        }
      });

      if( t.get() == b.value ){
        self.doTo( {type: b.type || 'field', target: b.target}, b.do, b.to);
      }else{
        self.doTo( {type: b.type || 'field', target: b.target}, b.do, b.to, true);
      }

    }
  });
}
Form.Fields.MultiSwitch.prototype.doChanges = function(){
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
    var changed = self.originalIndex[id][self.json.valueField] !== self.dataIndex[id][self.json.valueField];
    if( changed && !self.json.muted ){
      $(this).closest('.multiswitch').addClass('changed');
    }else{
      $(this).closest('.multiswitch').removeClass('changed');
    }
  });

  for( var i = 0 ; i < this.changeListeners.length ; i++ ){
    this.changeListeners[i]( this.json.id, val, changed );
  }
}
Form.Fields.MultiSwitch.prototype.onChange = function( callback ){
  if( !this.changeListeners )
    this.changeListeners = [];

  this.changeListeners.push( callback );
}
Form.Fields.MultiSwitch.prototype._ = scopeInterface;
Form.Fields.MultiSwitch.prototype.is = function(t){
  if( t === '*' )
    return true;
  return (t.toLowerCase() === ('MultiSwitch').toLowerCase()
    || t.toLowerCase() === this.json.id.toLowerCase() );
};
