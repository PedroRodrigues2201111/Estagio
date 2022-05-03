function Template( scope, container, json, opts ){
  this.scope = scope;
  this.opts = opts;
  this.container = container;
  this.json = JSON.simpleCopy(json);
  
  this.view = this._('^view').get(0);
  this.actions = this.view.Actions.template || {};
  
  this.tab = this._('^tab')[0];
  this.host = this.tab;
  
  this.url = (this.view.getUrl(this.json.url) || this.json.url).fillWith(opts);

  this.$ = {};
  this.$.container = $(this.container);
  this.$.container.data('componentRef', this);
  this.$.html = null;

  this.init();
}
Template.prototype.init = function(){
  var self = this;
  
  this.$.html = $('<div></div>');
  this.$.container.append(this.$.html);
  window.staticTemplates = window.staticTemplates || {};
  
  if( this.json.css )
    this.css = $('<style>'+this.json.css.join('\n')+'</style>').appendTo($('head'));
  
  this.st = window.staticTemplates;
  this.template = this.template || Handlebars.compile( 
    ( this.json.template.join ? this.json.template.join('') : this.json.template ) 
  );

  if( this.json.on && this.json.on.ready && this.actions && this.actions[this.json.on.ready] )
    this.onReady = this.actions[this.json.on.ready];

}
Template.prototype.refresh = function(){
  if( this.$.container.is(':visible') ){
    this.update();
  }
}
Template.prototype.update = function(){
  var self = this;
  
  this.$.html = $('<div></div>');
  this.$.container.boxBusy();
  
  this.render(function( $html ){
    self.$.container.empty();
    self.$.container.append( $html );
    self.bind();
    self.i18n();
    self.$.container.boxUnBusy();
    self.onReady && self.onReady(self);
  });
}
Template.prototype.getTemplate = function( id, callback ){
  var self = this;
  
  if( !this.st[id] ){
    this.st[id] = {};
    this.st[id].id = id;
    this.st[id].isLoading = true;
    this.st[id].callbacks = this.st[id].callbacks || [];
    this.st[id].callbacks.push( callback );
    
    Tools.Ajax.defaultGet( './include/static_templates/'+id+'.hbs' )
    .then(function( data ){
      self.st[id].template = Handlebars.compile( data );
      self.st[id].callbacks.forEach(function(cb){
        setTimeout(function(){
          cb( self.st[id] );
        },0);
      });
      self.st[id].isLoading = false;
    }).catch(function(err){
      //console.log('Failed to load '+id+'.hbs template.');
      
      self.st[id].template = function(e){return e};
      self.st[id].callbacks.forEach(function(cb){
        setTimeout(function(){
          cb( self.st[id] );
        },0);
      });
      self.st[id].isLoading = false;
    });
  }else if( this.st[id].isLoading ){
    this.st[id].callbacks = this.st[id].callbacks || [];
    this.st[id].callbacks.push( callback );
  }else{
    callback( this.st[id] );
  }
}
Template.prototype.render = function( callback ){
  var self = this;
  var method = Tools.Ajax.defaultGet;
  
  if( this.json.method ){
    if( this.json.method.toLowerCase() === 'post' ){
      method = Tools.Ajax.defaultPost;
    }else if( this.json.method.toLowerCase() === 'get' ){
      method = Tools.Ajax.defaultGet;
    }
  }
  
  method( this.url )
  .then(function(data){
    self.data = data.data || data;
    self.renderTemplate( self.$.html, {
      template: self.template,
      id: 'main'
    }, self.data, function($html){
      callback($html);
    });
    
  }).catch(function(err){
    self.error( err.status );
  });
}   
Template.prototype.error = function( err ){
  var error = Errors({type:"Template", status: err});
  
  this.$.container.prepend(error.html);
  error.html.html.find('.closebtn').remove();
}
Template.prototype.renderTemplate = function( $container, template, data, callback ){
  var self = this;
  var $contents = $container.contents().detach();
  
  var $html = $(template.template( data , {helpers: this.actions.helpers || {}}));
  
  $container.replaceWith( $html );
  
  $html.parent().find('div.content').replaceWith( $contents );
  
  var promises = [];
  
  $html.find('[data-template]:not([data-template] [data-template])').each(function(){
    var $this = $(this);
    promises.push(function( callback ){
      self.getTemplate( $this.data('template'), function(template){
        self.renderTemplate( $this, template, ({}).deepMerge(data).deepMerge($this.data('data')||{}), callback );
      });
    });
  });
  
  if( promises.length === 0 ){
    callback($html);
  }else{
    for( var i = 0, j = 0 ; i < promises.length ; i++ ){
      var p = promises[i];
      p(function(){
        j++;
        if( j === promises.length ){
          callback($html);
        }
      });
    }
  }
}         
Template.prototype.i18n = function(){
  this.$.container.i18n();
  
  if( this.json.setsTitle )
    if( this.host.updateTitle )
      this.host.updateTitle( this.data );
}    
Template.prototype.remove = function(){
  if( this.css )
    this.css.remove();
}

Template.prototype.bind = function(){
  var self = this;
  
  this.$.container.find('[data-action]').each(function(){
    var $this = $(this);
    if( $this.data('bound') )
      return;
    var a = $this.data('action');
    var events = ['click'];
    if( self.actions[a] ){
      if( $this.data('events') ){
        events = $this.data('events').split(',');
      }
      
      $this.on(events.join(' '), function(ev){
        self.actions[a](ev, $this, self.data, self);
      });      
    }else{
      //console.log('Action ' + a + ' for ' + self.json.id + ' doesn\'t exist;');
      // warn
    }
    $this.data('bound', true);
  });
}
Template.prototype._ = scopeInterface;
Template.prototype.is = function(t){
  if( t === '*' )
    return true;
  return (t.toLowerCase() === ('Template').toLowerCase()
    || t.toLowerCase() === this.json.id.toLowerCase() );
};

window.Templates.template = Template;