/**
 * PageLimit
 */

Form.Fields.PageLimit = function PageLimit(scope, container, json ){
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
Form.Fields.PageLimit.prototype.init = function(){
  var html = Form.Template( this.json, {data: {
    input: true
  }});

  this.$.html = $(html);
  if( this.json.visibility === 'hidden' )
    this.$.container.parent().addClass('hidden');;

  this.$.container.append(this.$.html);

  this.$.pageLimit = this.$.html.find('.page-limit-toggle');

  // Type of limit
  this.$.type = {};
  this.$.type.basic = this.$.html.find('input[data-id="basic"]');
  this.$.type.bycolor = this.$.html.find('input[data-id="bycolor"]');
  this.$.type.bytype = this.$.html.find('input[data-id="bytype"]');
  this.$.type.advanced = this.$.html.find('input[data-id="adv"]');

  // Basic configuration
  this.$.basic = {};

  this.$.basic.limit =
    this.$.html.find('div[data-type="basic"] input[data-id="limit"]');
  this.$.basic.remaining =
    this.$.html.find('div[data-type="basic"] input[data-id="remaining"]');
  this.$.basic.lock =
    this.$.html.find('div[data-type="basic"] input[data-id="lock"]');


  // By Color configuration
  this.$.bycolor = {};
  this.$.bycolor.mono = {};
  this.$.bycolor.color = {};

  this.$.bycolor.mono.limit =
    this.$.html.find('div[data-subtype="mono"] input[data-id="limit"]');
  this.$.bycolor.mono.remaining =
    this.$.html.find('div[data-subtype="mono"] input[data-id="remaining"]');
  this.$.bycolor.mono.lock =
    this.$.html.find('div[data-subtype="mono"] input[data-id="lock"]');
  this.$.bycolor.color.limit =
    this.$.html.find('div[data-subtype="color"] input[data-id="limit"]');
  this.$.bycolor.color.remaining =
    this.$.html.find('div[data-subtype="color"] input[data-id="remaining"]');
  this.$.bycolor.color.lock =
    this.$.html.find('div[data-subtype="color"] input[data-id="lock"]');


  // By Type configuration
  this.$.bytype = {};
  this.$.bytype.print = {};
  this.$.bytype.copy = {};

  this.$.bytype.print.limit =
    this.$.html.find('div[data-subtype="print"] input[data-id="limit"]');
  this.$.bytype.print.remaining =
    this.$.html.find('div[data-subtype="print"] input[data-id="remaining"]');
  this.$.bytype.print.lock =
    this.$.html.find('div[data-subtype="print"] input[data-id="lock"]');
  this.$.bytype.copy.limit =
    this.$.html.find('div[data-subtype="copy"] input[data-id="limit"]');
  this.$.bytype.copy.remaining =
    this.$.html.find('div[data-subtype="copy"] input[data-id="remaining"]');
  this.$.bytype.copy.lock =
    this.$.html.find('div[data-subtype="copy"] input[data-id="lock"]');


  // Advanced configuration
  this.$.advanced = {};
  this.$.advanced.monoprint = {};
  this.$.advanced.monocopy = {};
  this.$.advanced.colorprint = {};
  this.$.advanced.colorcopy = {};

  this.$.advanced.monoprint.limit =
    this.$.html.find('div[data-subtype="monoprint"] input[data-id="limit"]');
  this.$.advanced.monoprint.remaining =
    this.$.html.find('div[data-subtype="monoprint"] input[data-id="remaining"]');
  this.$.advanced.monoprint.lock =
    this.$.html.find('div[data-subtype="monoprint"] input[data-id="lock"]');
  this.$.advanced.monocopy.limit =
    this.$.html.find('div[data-subtype="monocopy"] input[data-id="limit"]');
  this.$.advanced.monocopy.remaining =
    this.$.html.find('div[data-subtype="monocopy"] input[data-id="remaining"]');
  this.$.advanced.monocopy.lock =
    this.$.html.find('div[data-subtype="monocopy"] input[data-id="lock"]');

  this.$.advanced.colorprint.limit =
    this.$.html.find('div[data-subtype="colorprint"] input[data-id="limit"]');
  this.$.advanced.colorprint.remaining =
    this.$.html.find('div[data-subtype="colorprint"] input[data-id="remaining"]');
  this.$.advanced.colorprint.lock =
    this.$.html.find('div[data-subtype="colorprint"] input[data-id="lock"]');
  this.$.advanced.colorcopy.limit =
    this.$.html.find('div[data-subtype="colorcopy"] input[data-id="limit"]');
  this.$.advanced.colorcopy.remaining =
    this.$.html.find('div[data-subtype="colorcopy"] input[data-id="remaining"]');
  this.$.advanced.colorcopy.lock =
    this.$.html.find('div[data-subtype="colorcopy"] input[data-id="lock"]');


  this.i18n();
  this.bind();
}
Form.Fields.PageLimit.prototype.bind = function(){
  var self = this;
  this.$.pageLimit.on('input change', function(){
    if(this.checked){
      $(this).closest('.form-control.contain').addClass('active')
        .children('.row').fadeIn();
    }else{
      $(this).closest('.form-control.contain').removeClass('active')
        .children('.row').fadeOut();
    }
  });
  this.$.pageLimit.trigger('change');

  this.$.html.find('.limit-type input').on('change init', function(ev){
    if(this.checked){
      $(this).closest('.cont')
        .find('.page-limit-form[data-type="'+$(this).data('id')+'"]')
        .show().siblings().hide();

      if(ev.type === 'init'){
        $(this).parent().siblings('label').removeClass('active');
        $(this).parent().addClass('active');
      }
    }
  });
  this.$.html.find('.limit-type input').trigger('change');


  this.$.html.find('input').on('input change', function(){
    for( var i = 0 ; i < self.changeListeners.length ; i++ ){
      self.changeListeners[i]( self.json.id, self.get(), self.isChanged() );
    }
  });
}
Form.Fields.PageLimit.prototype.i18n = function(){
  this.$.html.i18n();
}
Form.Fields.PageLimit.prototype.getData = function(){
  return this.get();
}
Form.Fields.PageLimit.prototype.get = function(){
  return {
    "WorkWithPageLimit":
      this.$.pageLimit[0].checked,
    "WorkWithColorPageLimit":
      this.$.type.bycolor[0].checked || this.$.type.advanced[0].checked,
    "WorkWithSeparatePageLimit":
      this.$.type.bytype[0].checked || this.$.type.advanced[0].checked,

    "Lock": this.$.basic.lock[0].checked,
    "PagesMax": this.$.basic.limit.val(),
    "PagesMaxReamin": this.$.basic.remaining.val(),

    "LockMono": this.$.bycolor.mono.lock[0].checked,
    "PagesMaxMono": this.$.bycolor.mono.limit.val(),
    "PagesMaxMonoRemain": this.$.bycolor.mono.remaining.val(),

    "LockColor": this.$.bycolor.color.lock[0].checked,
    "PagesMaxColor": this.$.bycolor.color.limit.val(),
    "PagesMaxColorRemain": this.$.bycolor.color.remaining.val(),

    "LockPrint": this.$.bytype.print.lock[0].checked,
    "PagesMaxPrint": this.$.bytype.print.limit.val(),
    "PagesMaxPrintRemain": this.$.bytype.print.remaining.val(),

    "LockCopy": this.$.bytype.copy.lock[0].checked,
    "PagesMaxCopy": this.$.bytype.copy.limit.val(),
    "PagesMaxCopyRemain": this.$.bytype.copy.remaining.val(),

    "LockPrintMono": this.$.advanced.monoprint.lock[0].checked,
    "PagesMaxPrintMono": this.$.advanced.monoprint.limit.val(),
    "PagesMaxPrintMonoRemain": this.$.advanced.monoprint.remaining.val(),

    "LockCopyMono": this.$.advanced.monocopy.lock[0].checked,
    "PagesMaxCopyMono": this.$.advanced.monocopy.limit.val(),
    "PagesMaxCopyMonoRemain": this.$.advanced.monocopy.remaining.val(),


    "LockPrintColor": this.$.advanced.colorprint.lock[0].checked,
    "PagesMaxPrintColor": this.$.advanced.colorprint.limit.val(),
    "PagesMaxPrintColorRemain": this.$.advanced.colorprint.remaining.val(),

    "LockCopyColor": this.$.advanced.colorcopy.lock[0].checked,
    "PagesMaxCopyColor": this.$.advanced.colorcopy.limit.val(),
    "PagesMaxCopyColorRemain": this.$.advanced.colorcopy.remaining.val()
  }
}
Form.Fields.PageLimit.prototype.setData = function( data ){
  this.original = {
    "WorkWithPageLimit": data["WorkWithPageLimit"] || false,
    "WorkWithColorPageLimit": data["WorkWithColorPageLimit"] || false,
    "WorkWithSeparatePageLimit": data["WorkWithSeparatePageLimit"] || false,

    "Lock": data["Lock"] || false,
    "PagesMax": data["PagesMax"] || 0,
    "PagesMaxReamin": data["PagesMaxReamin"] || 0,

    "LockMono": data["LockMono"] || false,
    "PagesMaxMono": data["PagesMaxMono"] || 0,
    "PagesMaxMonoRemain": data["PagesMaxMonoRemain"] || 0,

    "LockColor": data["LockColor"] || false,
    "PagesMaxColor": data["PagesMaxColor"] || 0,
    "PagesMaxColorRemain": data["PagesMaxColorRemain"] || 0,

    "LockPrint": data["LockPrint"] || false,
    "PagesMaxPrint": data["PagesMaxPrint"] || 0,
    "PagesMaxPrintRemain": data["PagesMaxPrintRemain"] || 0,

    "LockCopy": data["LockCopy"] || false,
    "PagesMaxCopy": data["PagesMaxCopy"] || 0,
    "PagesMaxCopyRemain": data["PagesMaxCopyRemain"] || 0,

    "LockPrintMono": data["LockPrintMono"] || false,
    "PagesMaxPrintMono": data["PagesMaxPrintMono"] || 0,
    "PagesMaxPrintMonoRemain": data["PagesMaxPrintMonoRemain"] || 0,

    "LockCopyMono": data["LockCopyMono"] || false,
    "PagesMaxCopyMono": data["PagesMaxCopyMono"] || 0,
    "PagesMaxCopyMonoRemain": data["PagesMaxCopyMonoRemain"] || 0,

    "LockPrintColor": data["LockPrintColor"] || false,
    "PagesMaxPrintColor": data["PagesMaxPrintColor"] || 0,
    "PagesMaxPrintColorRemain": data["PagesMaxPrintColorRemain"] || 0,

    "LockCopyColor": data["LockCopyColor"] || false,
    "PagesMaxCopyColor": data["PagesMaxCopyColor"] || 0,
    "PagesMaxCopyColorRemain": data["PagesMaxCopyColorRemain"] || 0
  };
  this.set( this.original );
}
Form.Fields.PageLimit.prototype.set = function( val ){
  this.$.pageLimit.prop('checked', val["WorkWithPageLimit"] );

  if( val["WorkWithColorPageLimit"] && val["WorkWithSeparatePageLimit"] ){
    this.$.type.advanced.prop('checked', true);
  }else if( val["WorkWithColorPageLimit"] ){
    this.$.type.bycolor.prop('checked', true);
  }else if( val["WorkWithSeparatePageLimit"] ){
    this.$.type.bytype.prop('checked', true);
  }else{
    this.$.type.basic.prop('checked', true);
  }

  // Basic configuration
  this.$.basic.limit.val( val["PagesMax"] );
  this.$.basic.remaining.val( val["PagesMaxReamin"] );
  this.$.basic.lock.prop('checked', val["Lock"]);


  // By Color configuration
  this.$.bycolor.mono.limit.val( val["PagesMaxMono"] );
  this.$.bycolor.mono.remaining.val( val["PagesMaxMonoRemain"] );
  this.$.bycolor.mono.lock.prop('checked', val["LockMono"]);

  this.$.bycolor.color.limit.val( val["PagesMaxColor"] );
  this.$.bycolor.color.remaining.val( val["PagesMaxColorRemain"] );
  this.$.bycolor.color.lock.prop('checked', val["LockColor"]);


  // By Type configuration
  this.$.bytype.print.limit.val( val["PagesMaxPrint"] );
  this.$.bytype.print.remaining.val( val["PagesMaxPrintRemain"] );
  this.$.bytype.print.lock.prop('checked', val["LockPrint"]);

  this.$.bytype.copy.limit.val( val["PagesMaxCopy"] );
  this.$.bytype.copy.remaining.val( val["PagesMaxCopyRemain"] );
  this.$.bytype.copy.lock.prop('checked', val["LockCopy"]);


  // Advanced configuration
  this.$.advanced.monoprint.limit.val( val["PagesMaxPrintMono"] );
  this.$.advanced.monoprint.remaining.val( val["PagesMaxPrintMonoRemain"] );
  this.$.advanced.monoprint.lock.prop('checked', val["LockPrintMono"]);

  this.$.advanced.monocopy.limit.val( val["PagesMaxCopyMono"] );
  this.$.advanced.monocopy.remaining.val( val["PagesMaxCopyMonoRemain"] );
  this.$.advanced.monocopy.lock.prop('checked', val["LockCopyMono"]);

  this.$.advanced.colorprint.limit.val( val["PagesMaxPrintColor"] );
  this.$.advanced.colorprint.remaining.val( val["PagesMaxPrintColorRemain"] );
  this.$.advanced.colorprint.lock.prop('checked', val["LockPrintColor"]);

  this.$.advanced.colorcopy.limit.val( val["PagesMaxCopyColor"] );
  this.$.advanced.colorcopy.remaining.val( val["PagesMaxCopyColorRemain"] );
  this.$.advanced.colorcopy.lock.prop('checked', val["LockCopyColor"]);



  this.$.pageLimit.trigger('change');
  this.$.html.find('.limit-type input:checked').trigger('init');

}
Form.Fields.PageLimit.prototype.reset = function(){
}
Form.Fields.PageLimit.prototype.clear = function(){
}
Form.Fields.PageLimit.prototype.applyFieldBinds = function(){
}
Form.Fields.PageLimit.prototype.validate = function(){
  // stub
}
Form.Fields.PageLimit.prototype.saveData = function(){
  this.original = this.get();
  for( var i = 0 ; i < this.changeListeners.length ; i++ ){
    this.changeListeners[i]( this.json.id, this.get(), this.isChanged() );
  }
}
Form.Fields.PageLimit.prototype.refresh = function(){

}
Form.Fields.PageLimit.prototype.onChange = function( callback ){
  if( !this.changeListeners )
    this.changeListeners = [];

  this.changeListeners.push( callback );
}
Form.Fields.PageLimit.prototype.isChanged = function(){
  if(!this.original)
    return false;

  var self = this;
  var data = this.get();
  var K = Object.keys( data );

  var r = K.reduce(function( a, k ){
    if( data[k] != self.original[k] ){
      return true;
    }
    return a;
  }, false);

  return r;
}
Form.Fields.PageLimit.prototype._ = scopeInterface;
Form.Fields.PageLimit.prototype.is = function(t){
  if( t === '*' )
    return true;
  return (t.toLowerCase() === ('PageLimit').toLowerCase()
    || t.toLowerCase() === this.json.id.toLowerCase() );
};
