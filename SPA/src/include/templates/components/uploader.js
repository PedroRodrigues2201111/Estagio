function Uploader( scope, container, json ){
  this.scope = scope;
  this.container = container;
  this.json = json;

  this.$ = {};
  this.$.container = $(this.container);

  this.init();
  this.bind();
  this.i18n();
}
Uploader.prototype.init = function(){
  this.html = Uploader.Template(this.json);
  this.$.html = $(this.html);
  this.$.container.append(this.$.html);


  this.errorCallbacks = [];
  this.successCallbacks = [];

  this.evs = {
    error: this.errorCallbacks,
    success: this.successCallbacks
  };

  var opts = {
    showPreview: !!this.json.preview,
    allowedFileExtensions: this.json.fileTypes,
    uploadUrl: this.json.url,
    showAjaxErrorDetails: false
  };

  this.fi = this.$.html.fileinput(opts);

  this.$.container.find('.fileinput-remove-button > span')
    .attr('data-i18n', 'common.remove');

  this.$.container.find('.fileinput-cancel-button > span')
    .attr('data-i18n', 'common.cancel');

  this.$.container.find('.fileinput-upload-button > span')
    .attr('data-i18n', 'common.upload');

  this.$.container.find('.btn-file > span')
    .attr('data-i18n', 'common.browse');
}
Uploader.prototype.bind = function(){
  var self = this;
  this.fi.on('fileuploaded', function( ev ) {
    self.resolveSuccess(ev);
  }).on('fileuploaderror', function( ev ) {
    self.resolveError(ev);
  });
}
Uploader.prototype.on = function( ev, callback ){
  if( this.evs[ev] ){
    this.evs[ev].push(callback);
  } else {
    console.log('No such event.');
  }
  return this;
}
Uploader.prototype.resolveSuccess = function( ev ){
  for( var i = 0 ; i < this.successCallbacks.length ; i++ ){
    this.successCallbacks[i]( ev );
  }
}
Uploader.prototype.resolveError = function( ev ){
  for( var i = 0 ; i < this.errorCallbacks.length ; i++ ){
    this.errorCallbacks[i]( ev );
  }
}
Uploader.prototype.fail = function( callback ){
  this.on( 'error' , callback );
  return this;
}
Uploader.prototype.done = function( callback ){
  this.on( 'success' , callback );
  return this;
}
Uploader.prototype.i18n = function(){
  this.$.html.i18n();
}

Uploader.Template = Handlebars.templates['components/uploader'];

window.Templates.uploader = Uploader;