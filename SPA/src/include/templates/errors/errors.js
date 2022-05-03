function Errors( opts ){
  return Errors.make(opts);
}
Errors.make = function( opts ){
  opts.deepMerge( Errors.parseStatus( opts.status ) );
  
  html = Errors.Template( opts );

  $html = $( html );

  $html.i18n();
  
  if( opts.status === 401 ){
    main._('>authcontroller')[0].lock(function(){
      $html.find('.retrybtn').trigger('click');
    });
  }
  
  return {
    html: $html,
    opts: opts
  };
}
Errors.parseStatus = function( status ){
  switch( status ){
    case 400:
      return {
        'error': 'bad-request', 
        'severity': 'danger',
        'title-i18n': 'app.errors.error',
        'msg-i18n': 'app.errors.400'
      };
    case 401:
      return {
   //     'cantRetry': true,
        'error': 'unauthorized', 
        'severity': 'danger',
        'title-i18n': 'app.errors.error',
        'msg-i18n': 'app.errors.401'
      };
    case 403:
      return {
        'cantRetry': true,
        'error': 'forbidden', 
        'severity': 'danger',
        'title-i18n': 'app.errors.error',
        'msg-i18n': 'app.errors.403'
      };
    case 404:
      return {
        'error': 'not-found', 
        'severity': 'danger',
        'title-i18n': 'app.errors.error',
        'msg-i18n': 'app.errors.404'
      };
    case 500:
      return {
        'error': 'server-error', 
        'severity': 'danger',
        'title-i18n': 'app.errors.error',
        'msg-i18n': 'app.errors.500'
      };
    case 1501:
      return {
        'error': 'no-data', 
        'severity': 'danger',
        'title-i18n': 'app.errors.error',
        'msg-i18n': 'app.errors.no-data'
      }
    case 1502:
      return {
        'error': 'no-data', 
        'severity': 'danger',
        'title-i18n': 'app.errors.error',
        'msg-i18n': 'app.errors.no-data'
      }
    case 1523:
      return {
        'error': 'no-data', 
        'severity': 'danger',
        'title-i18n': 'app.errors.error',
        'msg-i18n': 'app.errors.no-data'
      }
    case 'no-data':
      return {
        'error': 'no-data', 
        'severity': 'discrete',
        'title-i18n': 'app.errors.info',
        'msg-i18n': 'app.errors.no-data'
      }
    default:
      return {
        'error': 'unknown', 
        'severity': 'danger',
        'title-i18n': 'app.errors.error',
        'msg-i18n': 'app.errors.unknown'
      };
  }
}



Errors.PostError = function( status, message, xhr ) {
  this.message = message;
  if( xhr ){
    this.statusText = xhr.statusText;
  }
  this.code = status;
  this.status = status;
  this.name = "PostError";
  this.stack = (new Error()).stack;
}
Errors.PostError.prototype = Object.create(Error.prototype);
Errors.PostError.prototype.constructor = Errors.PostError;

Errors.LoginError = function( status, message ) {
  this.message = message;
  this.code = status;
  this.status = status;
  this.name = "LoginError";
  this.stack = (new Error()).stack;
}
Errors.LoginError.prototype = Object.create(Error.prototype);
Errors.LoginError.prototype.constructor = Errors.LoginError;

Errors.Template = Handlebars.templates['errors/errors'];

window.Templates.errors = Errors;
