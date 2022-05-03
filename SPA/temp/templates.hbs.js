(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['components/uploader'] = template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper;

  return "<input type=\"file\" name=\""
    + container.escapeExpression(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"name","hash":{},"data":data}) : helper)))
    + "\" />";
},"useData":true});
templates['errors/errors'] = template({"1":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : {};

  return "  <div class=\"mini-err overlay\">\r\n    <div class=\"modal-"
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.severity : depth0),{"name":"if","hash":{},"fn":container.program(2, data, 0),"inverse":container.program(4, data, 0),"data":data})) != null ? stack1 : "")
    + "\">\r\n      <div class=\"modal-dialog\">\r\n        <div class=\"modal-content\">\r\n          <div class=\"modal-header\">\r\n            <h4 class=\"modal-title\" data-i18n=\""
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0["title-i18n"] : depth0),{"name":"if","hash":{},"fn":container.program(6, data, 0),"inverse":container.program(8, data, 0),"data":data})) != null ? stack1 : "")
    + "\">\r\n            </h4>\r\n          </div>\r\n          <div class=\"modal-body\">\r\n"
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0["msg-i18n"] : depth0),{"name":"if","hash":{},"fn":container.program(10, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "          </div>\r\n          <div class=\"modal-footer\">\r\n"
    + ((stack1 = helpers.unless.call(alias1,(depth0 != null ? depth0.cantRetry : depth0),{"name":"unless","hash":{},"fn":container.program(12, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "            <button type=\"button\" data-i18n=\"app.core.close\"\r\n              class=\"btn btn-outline closebtn\">\r\n            </button>\r\n          </div>\r\n        </div>\r\n      </div>\r\n    </div>\r\n  </div>\r\n";
},"2":function(container,depth0,helpers,partials,data) {
    var helper;

  return container.escapeExpression(((helper = (helper = helpers.severity || (depth0 != null ? depth0.severity : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"severity","hash":{},"data":data}) : helper)));
},"4":function(container,depth0,helpers,partials,data) {
    return "danger";
},"6":function(container,depth0,helpers,partials,data) {
    var helper;

  return container.escapeExpression(((helper = (helper = helpers["title-i18n"] || (depth0 != null ? depth0["title-i18n"] : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"title-i18n","hash":{},"data":data}) : helper)));
},"8":function(container,depth0,helpers,partials,data) {
    return "errors.error";
},"10":function(container,depth0,helpers,partials,data) {
    var helper;

  return "              <p data-i18n=\""
    + container.escapeExpression(((helper = (helper = helpers["msg-i18n"] || (depth0 != null ? depth0["msg-i18n"] : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"msg-i18n","hash":{},"data":data}) : helper)))
    + "\" ></p>\r\n";
},"12":function(container,depth0,helpers,partials,data) {
    return "            <button type=\"button\" data-i18n=\"app.core.retry\"\r\n              class=\"btn btn-outline retrybtn\">\r\n            </button>\r\n";
},"14":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : {};

  return "  <div class=\"overlay\">\r\n    <div class=\"modal-"
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.severity : depth0),{"name":"if","hash":{},"fn":container.program(2, data, 0),"inverse":container.program(4, data, 0),"data":data})) != null ? stack1 : "")
    + "\">\r\n      <div class=\"modal-dialog\">\r\n        <div class=\"modal-content\">\r\n          <div class=\"modal-header\">\r\n            <h4 class=\"modal-title\" data-i18n=\""
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0["title-i18n"] : depth0),{"name":"if","hash":{},"fn":container.program(6, data, 0),"inverse":container.program(8, data, 0),"data":data})) != null ? stack1 : "")
    + "\">\r\n            </h4>\r\n          </div>\r\n          <div class=\"modal-body\">\r\n"
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0["msg-i18n"] : depth0),{"name":"if","hash":{},"fn":container.program(10, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "          </div>\r\n          <div class=\"modal-footer\">\r\n"
    + ((stack1 = helpers.unless.call(alias1,(depth0 != null ? depth0.cantRetry : depth0),{"name":"unless","hash":{},"fn":container.program(12, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "            <button type=\"button\" data-i18n=\"app.core.close\"\r\n              class=\"btn btn-outline closebtn\">\r\n            </button>\r\n          </div>\r\n        </div>\r\n      </div>\r\n    </div>\r\n  </div>\r\n";
},"16":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = container.invokePartial(partials.normal,depth0,{"name":"normal","data":data,"indent":"  ","helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "");
},"18":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = (helpers.eq || (depth0 && depth0.eq) || helpers.helperMissing).call(depth0 != null ? depth0 : {},(depth0 != null ? depth0.type : depth0),"Grid",{"name":"eq","hash":{},"fn":container.program(16, data, 0),"inverse":container.program(19, data, 0),"data":data})) != null ? stack1 : "");
},"19":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = (helpers.eq || (depth0 && depth0.eq) || helpers.helperMissing).call(depth0 != null ? depth0 : {},(depth0 != null ? depth0.type : depth0),"Widget",{"name":"eq","hash":{},"fn":container.program(20, data, 0),"inverse":container.program(22, data, 0),"data":data})) != null ? stack1 : "");
},"20":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = container.invokePartial(partials.mini,depth0,{"name":"mini","data":data,"indent":"  ","helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "");
},"22":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = (helpers.eq || (depth0 && depth0.eq) || helpers.helperMissing).call(depth0 != null ? depth0 : {},(depth0 != null ? depth0.type : depth0),"Template",{"name":"eq","hash":{},"fn":container.program(16, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "");
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1;

  return "\r\n\r\n\r\n"
    + ((stack1 = (helpers.eq || (depth0 && depth0.eq) || helpers.helperMissing).call(depth0 != null ? depth0 : {},(depth0 != null ? depth0.type : depth0),"Form",{"name":"eq","hash":{},"fn":container.program(16, data, 0, blockParams, depths),"inverse":container.program(18, data, 0, blockParams, depths),"data":data})) != null ? stack1 : "");
},"main_d":  function(fn, props, container, depth0, data, blockParams, depths) {

  var decorators = container.decorators;

  fn = decorators.inline(fn,props,container,{"name":"inline","hash":{},"fn":container.program(1, data, 0, blockParams, depths),"inverse":container.noop,"args":["mini"],"data":data}) || fn;
  fn = decorators.inline(fn,props,container,{"name":"inline","hash":{},"fn":container.program(14, data, 0, blockParams, depths),"inverse":container.noop,"args":["normal"],"data":data}) || fn;
  return fn;
  }

,"useDecorators":true,"usePartial":true,"useData":true,"useDepths":true});
templates['form/form'] = template({"1":function(container,depth0,helpers,partials,data) {
    var stack1, helper, options, alias1=depth0 != null ? depth0 : {}, buffer = 
  ((stack1 = helpers.unless.call(alias1,(depth0 != null ? depth0.noBox : depth0),{"name":"unless","hash":{},"fn":container.program(2, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\r\n";
  stack1 = ((helper = (helper = helpers.getUniqueId || (depth0 != null ? depth0.getUniqueId : depth0)) != null ? helper : helpers.helperMissing),(options={"name":"getUniqueId","hash":{},"fn":container.program(4, data, 0),"inverse":container.noop,"data":data}),(typeof helper === "function" ? helper.call(alias1,options) : helper));
  if (!helpers.getUniqueId) { stack1 = helpers.blockHelperMissing.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer + "\r\n"
    + ((stack1 = helpers.unless.call(alias1,(depth0 != null ? depth0.noBox : depth0),{"name":"unless","hash":{},"fn":container.program(21, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "");
},"2":function(container,depth0,helpers,partials,data) {
    return "    <div class=\"box\" style=\"padding:5px;\">\r\n";
},"4":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "    <form id=\"Form_"
    + alias4(((helper = (helper = helpers.randomId || (data && data.randomId)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"randomId","hash":{},"data":data}) : helper)))
    + "\" data-id=\""
    + alias4(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"id","hash":{},"data":data}) : helper)))
    + "\" class=\"Form\">\r\n      <div class=\"nav-tabs-custom\">\r\n        <ul id=\"tablist_"
    + alias4(((helper = (helper = helpers.randomId || (data && data.randomId)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"randomId","hash":{},"data":data}) : helper)))
    + "\" class=\"nav nav-tabs\">\r\n"
    + ((stack1 = helpers.each.call(alias1,(depth0 != null ? depth0.tabs : depth0),{"name":"each","hash":{},"fn":container.program(5, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "        </ul>\r\n        <div class=\"tab-content\">\r\n"
    + ((stack1 = helpers.each.call(alias1,(depth0 != null ? depth0.tabs : depth0),{"name":"each","hash":{},"fn":container.program(11, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "        </div>\r\n      </div>\r\n    </form>\r\n";
},"5":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : {};

  return ((stack1 = helpers["if"].call(alias1,(helpers.canAccess || (depth0 && depth0.canAccess) || helpers.helperMissing).call(alias1,depth0,{"name":"canAccess","hash":{},"data":data}),{"name":"if","hash":{},"fn":container.program(6, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "");
},"6":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "              <li class=\"\">\r\n                <a aria-expanded=\"false\" data-i18n=\""
    + alias4(((helper = (helper = helpers["title-i18n"] || (depth0 != null ? depth0["title-i18n"] : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"title-i18n","hash":{},"data":data}) : helper)))
    + "\" href=\"#"
    + alias4(((helper = (helper = helpers.randomId || (data && data.randomId)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"randomId","hash":{},"data":data}) : helper)))
    + "_"
    + alias4(((helper = (helper = helpers.index || (data && data.index)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"index","hash":{},"data":data}) : helper)))
    + "\" "
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.id : depth0),{"name":"if","hash":{},"fn":container.program(7, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + " "
    + ((stack1 = (helpers.eq || (depth0 && depth0.eq) || alias2).call(alias1,(depth0 != null ? depth0.visibility : depth0),"hidden",{"name":"eq","hash":{},"fn":container.program(9, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + " data-toggle=\"tab\"></a>\r\n              </li>\r\n";
},"7":function(container,depth0,helpers,partials,data) {
    var helper;

  return "\r\n                  data-tab-id=\""
    + container.escapeExpression(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"id","hash":{},"data":data}) : helper)))
    + "\" ";
},"9":function(container,depth0,helpers,partials,data) {
    return " class=\"hidden\" ";
},"11":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : {};

  return ((stack1 = helpers["if"].call(alias1,(helpers.canAccess || (depth0 && depth0.canAccess) || helpers.helperMissing).call(alias1,depth0,{"name":"canAccess","hash":{},"data":data}),{"name":"if","hash":{},"fn":container.program(12, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "");
},"12":function(container,depth0,helpers,partials,data) {
    var stack1, helper, options, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression, alias5=helpers.blockHelperMissing, buffer = 
  "              <div class=\"tab-pane "
    + ((stack1 = (helpers.eq || (depth0 && depth0.eq) || alias2).call(alias1,(data && data.index),0,{"name":"eq","hash":{},"fn":container.program(13, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\" id=\""
    + alias4(((helper = (helper = helpers.randomId || (data && data.randomId)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"randomId","hash":{},"data":data}) : helper)))
    + "_"
    + alias4(((helper = (helper = helpers.index || (data && data.index)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"index","hash":{},"data":data}) : helper)))
    + "\" "
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.id : depth0),{"name":"if","hash":{},"fn":container.program(15, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + ">\r\n                <div class=\"box-body\" ";
  stack1 = ((helper = (helper = helpers.maxWidth || (depth0 != null ? depth0.maxWidth : depth0)) != null ? helper : alias2),(options={"name":"maxWidth","hash":{},"fn":container.program(17, data, 0),"inverse":container.noop,"data":data}),(typeof helper === alias3 ? helper.call(alias1,options) : helper));
  if (!helpers.maxWidth) { stack1 = alias5.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  buffer += ">\r\n";
  stack1 = ((helper = (helper = helpers.layout || (depth0 != null ? depth0.layout : depth0)) != null ? helper : alias2),(options={"name":"layout","hash":{},"fn":container.program(19, data, 0),"inverse":container.noop,"data":data}),(typeof helper === alias3 ? helper.call(alias1,options) : helper));
  if (!helpers.layout) { stack1 = alias5.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer + "                </div>\r\n              </div>\r\n";
},"13":function(container,depth0,helpers,partials,data) {
    return "active";
},"15":function(container,depth0,helpers,partials,data) {
    var helper;

  return "\r\n                data-tab-id=\""
    + container.escapeExpression(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"id","hash":{},"data":data}) : helper)))
    + "\" ";
},"17":function(container,depth0,helpers,partials,data) {
    var helper;

  return " style=\"max-width:"
    + container.escapeExpression(((helper = (helper = helpers.maxWidth || (depth0 != null ? depth0.maxWidth : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"maxWidth","hash":{},"data":data}) : helper)))
    + "\" ";
},"19":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = container.invokePartial(partials.field,depth0,{"name":"field","data":data,"indent":"                    ","helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "");
},"21":function(container,depth0,helpers,partials,data) {
    return "    </div>\r\n";
},"23":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = (helpers.eq || (depth0 && depth0.eq) || helpers.helperMissing).call(depth0 != null ? depth0 : {},depth0,"--hr",{"name":"eq","hash":{},"fn":container.program(24, data, 0),"inverse":container.program(26, data, 0),"data":data})) != null ? stack1 : "");
},"24":function(container,depth0,helpers,partials,data) {
    return "      <hr />\r\n";
},"26":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = (helpers.match || (depth0 && depth0.match) || helpers.helperMissing).call(depth0 != null ? depth0 : {},depth0,"\\-\\-hr\\:(.+)",{"name":"match","hash":{},"fn":container.program(27, data, 0),"inverse":container.program(29, data, 0),"data":data})) != null ? stack1 : "");
},"27":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=container.escapeExpression;

  return "        <div style=\"width:100%;overflow:hidden;white-space: nowrap;padding:0 0 10px 0\">\r\n          <span style=\"display: inline-block;color:#888;font-size:1.3em;font-style: italic;padding-right: 5px;\"\r\n            data-i18n=\""
    + alias1(container.lambda(((stack1 = (data && data.captures)) && stack1["0"]), depth0))
    + "\">"
    + alias1((helpers.i18n_t || (depth0 && depth0.i18n_t) || helpers.helperMissing).call(depth0 != null ? depth0 : {},((stack1 = (data && data.captures)) && stack1["0"]),{"name":"i18n_t","hash":{},"data":data}))
    + "</span>\r\n          <span style=\"width:100%;background-color:#eee;display: inline-block;line-height: .1em;\">&nbsp;</span>\r\n        </div>\r\n";
},"29":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = (helpers.isarray || (depth0 && depth0.isarray) || helpers.helperMissing).call(depth0 != null ? depth0 : {},depth0,{"name":"isarray","hash":{},"fn":container.program(30, data, 0),"inverse":container.program(52, data, 0),"data":data})) != null ? stack1 : "");
},"30":function(container,depth0,helpers,partials,data) {
    var stack1, helper, options, buffer = 
  "          <div class=\"row\">\r\n";
  stack1 = ((helper = (helper = helpers.rowFixed || (depth0 != null ? depth0.rowFixed : depth0)) != null ? helper : helpers.helperMissing),(options={"name":"rowFixed","hash":{},"fn":container.program(31, data, 0),"inverse":container.noop,"data":data}),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},options) : helper));
  if (!helpers.rowFixed) { stack1 = helpers.blockHelperMissing.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer + "          </div>\r\n";
},"31":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = helpers.each.call(depth0 != null ? depth0 : {},depth0,{"name":"each","hash":{},"fn":container.program(32, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "");
},"32":function(container,depth0,helpers,partials,data) {
    var stack1, helper, options, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=helpers.blockHelperMissing, buffer = 
  "                <div class=\"";
  stack1 = ((helper = (helper = helpers.xs || (depth0 != null ? depth0.xs : depth0)) != null ? helper : alias2),(options={"name":"xs","hash":{},"fn":container.program(33, data, 0),"inverse":container.noop,"data":data}),(typeof helper === alias3 ? helper.call(alias1,options) : helper));
  if (!helpers.xs) { stack1 = alias4.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  stack1 = ((helper = (helper = helpers.sm || (depth0 != null ? depth0.sm : depth0)) != null ? helper : alias2),(options={"name":"sm","hash":{},"fn":container.program(35, data, 0),"inverse":container.noop,"data":data}),(typeof helper === alias3 ? helper.call(alias1,options) : helper));
  if (!helpers.sm) { stack1 = alias4.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  stack1 = ((helper = (helper = helpers.md || (depth0 != null ? depth0.md : depth0)) != null ? helper : alias2),(options={"name":"md","hash":{},"fn":container.program(37, data, 0),"inverse":container.noop,"data":data}),(typeof helper === alias3 ? helper.call(alias1,options) : helper));
  if (!helpers.md) { stack1 = alias4.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  stack1 = ((helper = (helper = helpers.lg || (depth0 != null ? depth0.lg : depth0)) != null ? helper : alias2),(options={"name":"lg","hash":{},"fn":container.program(39, data, 0),"inverse":container.noop,"data":data}),(typeof helper === alias3 ? helper.call(alias1,options) : helper));
  if (!helpers.lg) { stack1 = alias4.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  buffer += "\">\r\n";
  stack1 = ((helper = (helper = helpers.components || (depth0 != null ? depth0.components : depth0)) != null ? helper : alias2),(options={"name":"components","hash":{},"fn":container.program(41, data, 0),"inverse":container.noop,"data":data}),(typeof helper === alias3 ? helper.call(alias1,options) : helper));
  if (!helpers.components) { stack1 = alias4.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer + "                </div>\r\n";
},"33":function(container,depth0,helpers,partials,data) {
    return "col-xs-"
    + container.escapeExpression(container.lambda(depth0, depth0))
    + " ";
},"35":function(container,depth0,helpers,partials,data) {
    return "col-sm-"
    + container.escapeExpression(container.lambda(depth0, depth0))
    + " ";
},"37":function(container,depth0,helpers,partials,data) {
    return "col-md-"
    + container.escapeExpression(container.lambda(depth0, depth0))
    + " ";
},"39":function(container,depth0,helpers,partials,data) {
    return "col-lg-"
    + container.escapeExpression(container.lambda(depth0, depth0))
    + " ";
},"41":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "\r\n"
    + ((stack1 = (helpers.eq || (depth0 && depth0.eq) || helpers.helperMissing).call(depth0 != null ? depth0 : {},depth0,"--hr",{"name":"eq","hash":{},"fn":container.program(42, data, 0),"inverse":container.program(44, data, 0),"data":data})) != null ? stack1 : "");
},"42":function(container,depth0,helpers,partials,data) {
    return "                      <hr />\r\n";
},"44":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = (helpers.match || (depth0 && depth0.match) || helpers.helperMissing).call(depth0 != null ? depth0 : {},depth0,"\\-\\-hr\\:(.+)",{"name":"match","hash":{},"fn":container.program(45, data, 0),"inverse":container.program(47, data, 0),"data":data})) != null ? stack1 : "");
},"45":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=container.escapeExpression;

  return "                <div style=\"width:100%;overflow:hidden;white-space: nowrap;padding:0 0 10px 0\">\r\n                  <span style=\"display: inline-block;color:#888;font-size:1.3em;font-style: italic;padding-right: 5px;\"\r\n                    data-i18n=\""
    + alias1(container.lambda(((stack1 = (data && data.captures)) && stack1["0"]), depth0))
    + "\">"
    + alias1((helpers.i18n_t || (depth0 && depth0.i18n_t) || helpers.helperMissing).call(depth0 != null ? depth0 : {},((stack1 = (data && data.captures)) && stack1["0"]),{"name":"i18n_t","hash":{},"data":data}))
    + "</span>\r\n                  <span style=\"width:100%;background-color:#eee;display: inline-block;line-height: .1em;\">&nbsp;</span>\r\n                </div>\r\n";
},"47":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = (helpers.isarray || (depth0 && depth0.isarray) || helpers.helperMissing).call(depth0 != null ? depth0 : {},depth0,{"name":"isarray","hash":{},"fn":container.program(48, data, 0),"inverse":container.program(50, data, 0),"data":data})) != null ? stack1 : "");
},"48":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = container.invokePartial(partials.field,depth0,{"name":"field","data":data,"indent":"                ","helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "");
},"50":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "                <div class=\"form-group\">\r\n"
    + ((stack1 = container.invokePartial(partials.placeholder,depth0,{"name":"placeholder","data":data,"indent":"                  ","helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "\r\n                  <p class=\"help-block for-error\"></p>\r\n                </div>\r\n                    ";
},"52":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "            <div class=\"form-group\">\r\n"
    + ((stack1 = container.invokePartial(partials.placeholder,depth0,{"name":"placeholder","data":data,"indent":"              ","helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "\r\n              <p class=\"help-block for-error\"></p>\r\n            </div>\r\n    ";
},"54":function(container,depth0,helpers,partials,data) {
    return "      <div data-placeholder=\""
    + container.escapeExpression(container.lambda(depth0, depth0))
    + "\"></div>\r\n";
},"56":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : {};

  return ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0["label-i18n"] : depth0),{"name":"if","hash":{},"fn":container.program(57, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.label : depth0),{"name":"if","hash":{},"fn":container.program(63, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\r\n\r\n"
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.icon : depth0),{"name":"if","hash":{},"fn":container.program(67, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\r\n"
    + ((stack1 = container.invokePartial(partials.inputTypes,depth0,{"name":"inputTypes","data":data,"indent":"        ","helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "\r\n"
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.icon : depth0),{"name":"if","hash":{},"fn":container.program(69, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "        <p class=\"help-block for-error\"></p>\r\n";
},"57":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = helpers.unless.call(depth0 != null ? depth0 : {},(depth0 != null ? depth0["inline-label"] : depth0),{"name":"unless","hash":{},"fn":container.program(58, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "");
},"58":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = (helpers.neq || (depth0 && depth0.neq) || helpers.helperMissing).call(depth0 != null ? depth0 : {},(depth0 != null ? depth0.type : depth0),"Link",{"name":"neq","hash":{},"fn":container.program(59, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "");
},"59":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : {};

  return "              <label class=\"form-label\" data-i18n=\""
    + container.escapeExpression(((helper = (helper = helpers["label-i18n"] || (depth0 != null ? depth0["label-i18n"] : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(alias1,{"name":"label-i18n","hash":{},"data":data}) : helper)))
    + "\">\r\n              </label>\r\n"
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.validation : depth0),{"name":"if","hash":{},"fn":container.program(60, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "");
},"60":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = helpers["if"].call(depth0 != null ? depth0 : {},((stack1 = (depth0 != null ? depth0.validation : depth0)) != null ? stack1.required : stack1),{"name":"if","hash":{},"fn":container.program(61, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "");
},"61":function(container,depth0,helpers,partials,data) {
    return "                  <b>(*)</b>\r\n";
},"63":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = helpers.unless.call(depth0 != null ? depth0 : {},(depth0 != null ? depth0["inline-label"] : depth0),{"name":"unless","hash":{},"fn":container.program(64, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "");
},"64":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = (helpers.neq || (depth0 && depth0.neq) || helpers.helperMissing).call(depth0 != null ? depth0 : {},(depth0 != null ? depth0.type : depth0),"Link",{"name":"neq","hash":{},"fn":container.program(65, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "");
},"65":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : {};

  return "              <label>\r\n                "
    + container.escapeExpression(((helper = (helper = helpers.label || (depth0 != null ? depth0.label : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(alias1,{"name":"label","hash":{},"data":data}) : helper)))
    + "\r\n              </label>\r\n"
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.validation : depth0),{"name":"if","hash":{},"fn":container.program(60, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "");
},"67":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "          <div class=\"input-group\">\r\n            <span class=\"input-group-addon\">\r\n"
    + ((stack1 = container.invokePartial(partials.icon,depth0,{"name":"icon","data":data,"indent":"              ","helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "            </span>\r\n";
},"69":function(container,depth0,helpers,partials,data) {
    return "          </div>\r\n";
},"71":function(container,depth0,helpers,partials,data) {
    var helper;

  return "          <i class=\""
    + container.escapeExpression(((helper = (helper = helpers.icon || (depth0 != null ? depth0.icon : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"icon","hash":{},"data":data}) : helper)))
    + "\"></i>\r\n";
},"73":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = (helpers.eq || (depth0 && depth0.eq) || helpers.helperMissing).call(depth0 != null ? depth0 : {},(depth0 != null ? depth0.type : depth0),"Text",{"name":"eq","hash":{},"fn":container.program(74, data, 0),"inverse":container.program(76, data, 0),"data":data})) != null ? stack1 : "");
},"74":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = container.invokePartial(partials["form/fields/text/text"],depth0,{"name":"form/fields/text/text","data":data,"indent":"              ","helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "");
},"76":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = (helpers.eq || (depth0 && depth0.eq) || helpers.helperMissing).call(depth0 != null ? depth0 : {},(depth0 != null ? depth0.type : depth0),"Number",{"name":"eq","hash":{},"fn":container.program(77, data, 0),"inverse":container.program(79, data, 0),"data":data})) != null ? stack1 : "");
},"77":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = container.invokePartial(partials["form/fields/number/number"],depth0,{"name":"form/fields/number/number","data":data,"indent":"                ","helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "");
},"79":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = (helpers.eq || (depth0 && depth0.eq) || helpers.helperMissing).call(depth0 != null ? depth0 : {},(depth0 != null ? depth0.type : depth0),"Slider",{"name":"eq","hash":{},"fn":container.program(80, data, 0),"inverse":container.program(82, data, 0),"data":data})) != null ? stack1 : "");
},"80":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = container.invokePartial(partials["form/fields/slider/slider"],depth0,{"name":"form/fields/slider/slider","data":data,"indent":"                  ","helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "");
},"82":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = (helpers.eq || (depth0 && depth0.eq) || helpers.helperMissing).call(depth0 != null ? depth0 : {},(depth0 != null ? depth0.type : depth0),"File",{"name":"eq","hash":{},"fn":container.program(83, data, 0),"inverse":container.program(85, data, 0),"data":data})) != null ? stack1 : "");
},"83":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = container.invokePartial(partials["form/fields/file/file"],depth0,{"name":"form/fields/file/file","data":data,"indent":"                    ","helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "");
},"85":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = (helpers.eq || (depth0 && depth0.eq) || helpers.helperMissing).call(depth0 != null ? depth0 : {},(depth0 != null ? depth0.type : depth0),"StaticHTML",{"name":"eq","hash":{},"fn":container.program(86, data, 0),"inverse":container.program(88, data, 0),"data":data})) != null ? stack1 : "");
},"86":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = container.invokePartial(partials["form/fields/statichtml/statichtml"],depth0,{"name":"form/fields/statichtml/statichtml","data":data,"indent":"                      ","helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "");
},"88":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = (helpers.eq || (depth0 && depth0.eq) || helpers.helperMissing).call(depth0 != null ? depth0 : {},(depth0 != null ? depth0.type : depth0),"Sortable",{"name":"eq","hash":{},"fn":container.program(89, data, 0),"inverse":container.program(91, data, 0),"data":data})) != null ? stack1 : "");
},"89":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = container.invokePartial(partials["form/fields/sortable/sortable"],depth0,{"name":"form/fields/sortable/sortable","data":data,"indent":"                        ","helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "");
},"91":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = (helpers.eq || (depth0 && depth0.eq) || helpers.helperMissing).call(depth0 != null ? depth0 : {},(depth0 != null ? depth0.type : depth0),"SortaForm",{"name":"eq","hash":{},"fn":container.program(92, data, 0),"inverse":container.program(94, data, 0),"data":data})) != null ? stack1 : "");
},"92":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = container.invokePartial(partials["form/fields/sortaform/sortaform"],depth0,{"name":"form/fields/sortaform/sortaform","data":data,"indent":"                          ","helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "");
},"94":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = (helpers.eq || (depth0 && depth0.eq) || helpers.helperMissing).call(depth0 != null ? depth0 : {},(depth0 != null ? depth0.type : depth0),"ListForm",{"name":"eq","hash":{},"fn":container.program(95, data, 0),"inverse":container.program(97, data, 0),"data":data})) != null ? stack1 : "");
},"95":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = container.invokePartial(partials["form/fields/listform/listform"],depth0,{"name":"form/fields/listform/listform","data":data,"indent":"                          ","helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "");
},"97":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = (helpers.eq || (depth0 && depth0.eq) || helpers.helperMissing).call(depth0 != null ? depth0 : {},(depth0 != null ? depth0.type : depth0),"Component",{"name":"eq","hash":{},"fn":container.program(98, data, 0),"inverse":container.program(100, data, 0),"data":data})) != null ? stack1 : "");
},"98":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = container.invokePartial(partials["form/fields/component/component"],depth0,{"name":"form/fields/component/component","data":data,"indent":"                            ","helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "");
},"100":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = (helpers.eq || (depth0 && depth0.eq) || helpers.helperMissing).call(depth0 != null ? depth0 : {},(depth0 != null ? depth0.type : depth0),"Password",{"name":"eq","hash":{},"fn":container.program(101, data, 0),"inverse":container.program(103, data, 0),"data":data})) != null ? stack1 : "");
},"101":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = container.invokePartial(partials["form/fields/password/password"],depth0,{"name":"form/fields/password/password","data":data,"indent":"                              ","helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "");
},"103":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = (helpers.eq || (depth0 && depth0.eq) || helpers.helperMissing).call(depth0 != null ? depth0 : {},(depth0 != null ? depth0.type : depth0),"Select",{"name":"eq","hash":{},"fn":container.program(104, data, 0),"inverse":container.program(106, data, 0),"data":data})) != null ? stack1 : "");
},"104":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = container.invokePartial(partials["form/fields/select/select"],depth0,{"name":"form/fields/select/select","data":data,"indent":"                                ","helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "");
},"106":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = (helpers.eq || (depth0 && depth0.eq) || helpers.helperMissing).call(depth0 != null ? depth0 : {},(depth0 != null ? depth0.type : depth0),"Static",{"name":"eq","hash":{},"fn":container.program(107, data, 0),"inverse":container.program(109, data, 0),"data":data})) != null ? stack1 : "");
},"107":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = container.invokePartial(partials["form/fields/static/static"],depth0,{"name":"form/fields/static/static","data":data,"indent":"                                  ","helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "");
},"109":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = (helpers.eq || (depth0 && depth0.eq) || helpers.helperMissing).call(depth0 != null ? depth0 : {},(depth0 != null ? depth0.type : depth0),"Link",{"name":"eq","hash":{},"fn":container.program(110, data, 0),"inverse":container.program(112, data, 0),"data":data})) != null ? stack1 : "");
},"110":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = container.invokePartial(partials["form/fields/link/link"],depth0,{"name":"form/fields/link/link","data":data,"indent":"                                    ","helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "");
},"112":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = (helpers.eq || (depth0 && depth0.eq) || helpers.helperMissing).call(depth0 != null ? depth0 : {},(depth0 != null ? depth0.type : depth0),"Image",{"name":"eq","hash":{},"fn":container.program(113, data, 0),"inverse":container.program(115, data, 0),"data":data})) != null ? stack1 : "");
},"113":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = container.invokePartial(partials["form/fields/image/image"],depth0,{"name":"form/fields/image/image","data":data,"indent":"                                      ","helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "");
},"115":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = (helpers.eq || (depth0 && depth0.eq) || helpers.helperMissing).call(depth0 != null ? depth0 : {},(depth0 != null ? depth0.type : depth0),"TextAction",{"name":"eq","hash":{},"fn":container.program(116, data, 0),"inverse":container.program(118, data, 0),"data":data})) != null ? stack1 : "");
},"116":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = container.invokePartial(partials["form/fields/textaction/textaction"],depth0,{"name":"form/fields/textaction/textaction","data":data,"indent":"                                        ","helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "");
},"118":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = (helpers.eq || (depth0 && depth0.eq) || helpers.helperMissing).call(depth0 != null ? depth0 : {},(depth0 != null ? depth0.type : depth0),"CodeInput",{"name":"eq","hash":{},"fn":container.program(119, data, 0),"inverse":container.program(121, data, 0),"data":data})) != null ? stack1 : "");
},"119":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = container.invokePartial(partials["form/fields/codeinput/codeinput"],depth0,{"name":"form/fields/codeinput/codeinput","data":data,"indent":"                                          ","helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "");
},"121":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = (helpers.eq || (depth0 && depth0.eq) || helpers.helperMissing).call(depth0 != null ? depth0 : {},(depth0 != null ? depth0.type : depth0),"FileExplorer",{"name":"eq","hash":{},"fn":container.program(122, data, 0),"inverse":container.program(124, data, 0),"data":data})) != null ? stack1 : "");
},"122":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = container.invokePartial(partials["form/fields/fileexplorer/fileexplorer"],depth0,{"name":"form/fields/fileexplorer/fileexplorer","data":data,"indent":"                                            ","helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "");
},"124":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = (helpers.eq || (depth0 && depth0.eq) || helpers.helperMissing).call(depth0 != null ? depth0 : {},(depth0 != null ? depth0.type : depth0),"SimpleGrid",{"name":"eq","hash":{},"fn":container.program(125, data, 0),"inverse":container.program(127, data, 0),"data":data})) != null ? stack1 : "");
},"125":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = container.invokePartial(partials["form/fields/simplegrid/simplegrid"],depth0,{"name":"form/fields/simplegrid/simplegrid","data":data,"indent":"                                              ","helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "");
},"127":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = (helpers.eq || (depth0 && depth0.eq) || helpers.helperMissing).call(depth0 != null ? depth0 : {},(depth0 != null ? depth0.type : depth0),"EditGrid",{"name":"eq","hash":{},"fn":container.program(128, data, 0),"inverse":container.program(130, data, 0),"data":data})) != null ? stack1 : "");
},"128":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = container.invokePartial(partials["form/fields/editgrid/editgrid"],depth0,{"name":"form/fields/editgrid/editgrid","data":data,"indent":"                                                ","helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "");
},"130":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = (helpers.eq || (depth0 && depth0.eq) || helpers.helperMissing).call(depth0 != null ? depth0 : {},(depth0 != null ? depth0.type : depth0),"TextArea",{"name":"eq","hash":{},"fn":container.program(131, data, 0),"inverse":container.program(133, data, 0),"data":data})) != null ? stack1 : "");
},"131":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = container.invokePartial(partials["form/fields/textarea/textarea"],depth0,{"name":"form/fields/textarea/textarea","data":data,"indent":"                                                  ","helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "");
},"133":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = (helpers.eq || (depth0 && depth0.eq) || helpers.helperMissing).call(depth0 != null ? depth0 : {},(depth0 != null ? depth0.type : depth0),"FileInput",{"name":"eq","hash":{},"fn":container.program(134, data, 0),"inverse":container.program(136, data, 0),"data":data})) != null ? stack1 : "");
},"134":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = container.invokePartial(partials["form/fields/fileinput/fileinput"],depth0,{"name":"form/fields/fileinput/fileinput","data":data,"indent":"                                                    ","helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "");
},"136":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = (helpers.eq || (depth0 && depth0.eq) || helpers.helperMissing).call(depth0 != null ? depth0 : {},(depth0 != null ? depth0.type : depth0),"Calendar",{"name":"eq","hash":{},"fn":container.program(137, data, 0),"inverse":container.program(139, data, 0),"data":data})) != null ? stack1 : "");
},"137":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = container.invokePartial(partials["form/fields/component/content"],depth0,{"name":"form/fields/component/content","data":data,"indent":"                                                      ","helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "");
},"139":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = (helpers.eq || (depth0 && depth0.eq) || helpers.helperMissing).call(depth0 != null ? depth0 : {},(depth0 != null ? depth0.type : depth0),"Permissions",{"name":"eq","hash":{},"fn":container.program(140, data, 0),"inverse":container.program(142, data, 0),"data":data})) != null ? stack1 : "");
},"140":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = container.invokePartial(partials["form/fields/permissions/permissions"],depth0,{"name":"form/fields/permissions/permissions","data":data,"indent":"                                                        ","helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "");
},"142":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = (helpers.eq || (depth0 && depth0.eq) || helpers.helperMissing).call(depth0 != null ? depth0 : {},(depth0 != null ? depth0.type : depth0),"PDFViewer",{"name":"eq","hash":{},"fn":container.program(143, data, 0),"inverse":container.program(145, data, 0),"data":data})) != null ? stack1 : "");
},"143":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = container.invokePartial(partials["form/fields/pdfviewer/pdfviewer"],depth0,{"name":"form/fields/pdfviewer/pdfviewer","data":data,"indent":"                                                          ","helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "");
},"145":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = (helpers.eq || (depth0 && depth0.eq) || helpers.helperMissing).call(depth0 != null ? depth0 : {},(depth0 != null ? depth0.type : depth0),"WYSIWYG",{"name":"eq","hash":{},"fn":container.program(146, data, 0),"inverse":container.program(148, data, 0),"data":data})) != null ? stack1 : "");
},"146":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = container.invokePartial(partials["form/fields/wysiwyg/wysiwyg"],depth0,{"name":"form/fields/wysiwyg/wysiwyg","data":data,"indent":"                                                            ","helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "");
},"148":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = (helpers.eq || (depth0 && depth0.eq) || helpers.helperMissing).call(depth0 != null ? depth0 : {},(depth0 != null ? depth0.type : depth0),"Button",{"name":"eq","hash":{},"fn":container.program(149, data, 0),"inverse":container.program(151, data, 0),"data":data})) != null ? stack1 : "");
},"149":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = container.invokePartial(partials["form/fields/button/button"],depth0,{"name":"form/fields/button/button","data":data,"indent":"                                                              ","helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "");
},"151":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = (helpers.eq || (depth0 && depth0.eq) || helpers.helperMissing).call(depth0 != null ? depth0 : {},(depth0 != null ? depth0.type : depth0),"DatePicker",{"name":"eq","hash":{},"fn":container.program(152, data, 0),"inverse":container.program(154, data, 0),"data":data})) != null ? stack1 : "");
},"152":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = container.invokePartial(partials["form/fields/datepicker/datepicker"],depth0,{"name":"form/fields/datepicker/datepicker","data":data,"indent":"                                                                ","helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "");
},"154":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = (helpers.eq || (depth0 && depth0.eq) || helpers.helperMissing).call(depth0 != null ? depth0 : {},(depth0 != null ? depth0.type : depth0),"DatePicker2",{"name":"eq","hash":{},"fn":container.program(155, data, 0),"inverse":container.program(157, data, 0),"data":data})) != null ? stack1 : "");
},"155":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = container.invokePartial(partials["form/fields/datepicker2/datepicker2"],depth0,{"name":"form/fields/datepicker2/datepicker2","data":data,"indent":"                                                                ","helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "");
},"157":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = (helpers.eq || (depth0 && depth0.eq) || helpers.helperMissing).call(depth0 != null ? depth0 : {},(depth0 != null ? depth0.type : depth0),"DateTimePicker",{"name":"eq","hash":{},"fn":container.program(158, data, 0),"inverse":container.program(160, data, 0),"data":data})) != null ? stack1 : "");
},"158":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = container.invokePartial(partials["form/fields/datetimepicker/datetimepicker"],depth0,{"name":"form/fields/datetimepicker/datetimepicker","data":data,"indent":"                                                                  ","helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "");
},"160":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = (helpers.eq || (depth0 && depth0.eq) || helpers.helperMissing).call(depth0 != null ? depth0 : {},(depth0 != null ? depth0.type : depth0),"TimePicker",{"name":"eq","hash":{},"fn":container.program(161, data, 0),"inverse":container.program(163, data, 0),"data":data})) != null ? stack1 : "");
},"161":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = container.invokePartial(partials["form/fields/timepicker/timepicker"],depth0,{"name":"form/fields/timepicker/timepicker","data":data,"indent":"                                                                    ","helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "");
},"163":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = (helpers.eq || (depth0 && depth0.eq) || helpers.helperMissing).call(depth0 != null ? depth0 : {},(depth0 != null ? depth0.type : depth0),"TimeInterval",{"name":"eq","hash":{},"fn":container.program(164, data, 0),"inverse":container.program(166, data, 0),"data":data})) != null ? stack1 : "");
},"164":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = container.invokePartial(partials["form/fields/timeinterval/timeinterval"],depth0,{"name":"form/fields/timeinterval/timeinterval","data":data,"indent":"                                                                      ","helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "");
},"166":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = (helpers.eq || (depth0 && depth0.eq) || helpers.helperMissing).call(depth0 != null ? depth0 : {},(depth0 != null ? depth0.type : depth0),"PageLimit",{"name":"eq","hash":{},"fn":container.program(167, data, 0),"inverse":container.program(169, data, 0),"data":data})) != null ? stack1 : "");
},"167":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = container.invokePartial(partials["form/fields/pagelimit/pagelimit"],depth0,{"name":"form/fields/pagelimit/pagelimit","data":data,"indent":"                                                                        ","helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "");
},"169":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = (helpers.eq || (depth0 && depth0.eq) || helpers.helperMissing).call(depth0 != null ? depth0 : {},(depth0 != null ? depth0.type : depth0),"AreaPicker",{"name":"eq","hash":{},"fn":container.program(170, data, 0),"inverse":container.program(172, data, 0),"data":data})) != null ? stack1 : "");
},"170":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = container.invokePartial(partials["form/fields/areapicker/areapicker"],depth0,{"name":"form/fields/areapicker/areapicker","data":data,"indent":"                                                                          ","helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "");
},"172":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = (helpers.eq || (depth0 && depth0.eq) || helpers.helperMissing).call(depth0 != null ? depth0 : {},(depth0 != null ? depth0.type : depth0),"Switch",{"name":"eq","hash":{},"fn":container.program(173, data, 0),"inverse":container.program(175, data, 0),"data":data})) != null ? stack1 : "");
},"173":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = container.invokePartial(partials["form/fields/switch/switch"],depth0,{"name":"form/fields/switch/switch","data":data,"indent":"                                                                            ","helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "");
},"175":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = (helpers.eq || (depth0 && depth0.eq) || helpers.helperMissing).call(depth0 != null ? depth0 : {},(depth0 != null ? depth0.type : depth0),"MultiSwitch",{"name":"eq","hash":{},"fn":container.program(176, data, 0),"inverse":container.program(178, data, 0),"data":data})) != null ? stack1 : "");
},"176":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = container.invokePartial(partials["form/fields/multiswitch/multiswitch"],depth0,{"name":"form/fields/multiswitch/multiswitch","data":data,"indent":"                                                                              ","helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "");
},"178":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = (helpers.eq || (depth0 && depth0.eq) || helpers.helperMissing).call(depth0 != null ? depth0 : {},(depth0 != null ? depth0.type : depth0),"MultiCheckbox",{"name":"eq","hash":{},"fn":container.program(179, data, 0),"inverse":container.program(181, data, 0),"data":data})) != null ? stack1 : "");
},"179":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = container.invokePartial(partials["form/fields/multicheckbox/multicheckbox"],depth0,{"name":"form/fields/multicheckbox/multicheckbox","data":data,"indent":"                                                                                ","helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "");
},"181":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = (helpers.eq || (depth0 && depth0.eq) || helpers.helperMissing).call(depth0 != null ? depth0 : {},(depth0 != null ? depth0.type : depth0),"Recurrence",{"name":"eq","hash":{},"fn":container.program(182, data, 0),"inverse":container.program(184, data, 0),"data":data})) != null ? stack1 : "");
},"182":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = container.invokePartial(partials["form/fields/recurrence/recurrence"],depth0,{"name":"form/fields/recurrence/recurrence","data":data,"indent":"                                                                                  ","helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "");
},"184":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = (helpers.eq || (depth0 && depth0.eq) || helpers.helperMissing).call(depth0 != null ? depth0 : {},(depth0 != null ? depth0.type : depth0),"CheckboxTree",{"name":"eq","hash":{},"fn":container.program(185, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "");
},"185":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = container.invokePartial(partials["form/fields/checkboxtree/checkboxtree"],depth0,{"name":"form/fields/checkboxtree/checkboxtree","data":data,"indent":"                                                                                    ","helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "            ";
},"187":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = container.invokePartial(partials.input,depth0,{"name":"input","data":data,"indent":"              ","helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "");
},"189":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = (helpers.eq || (depth0 && depth0.eq) || helpers.helperMissing).call(depth0 != null ? depth0 : {},(depth0 != null ? depth0.type : depth0),"Sortable-item",{"name":"eq","hash":{},"fn":container.program(190, data, 0),"inverse":container.program(192, data, 0),"data":data})) != null ? stack1 : "");
},"190":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = container.invokePartial(partials["form/fields/sortable/sortable-item"],depth0,{"name":"form/fields/sortable/sortable-item","data":data,"indent":"              ","helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "");
},"192":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = (helpers.eq || (depth0 && depth0.eq) || helpers.helperMissing).call(depth0 != null ? depth0 : {},(depth0 != null ? depth0.type : depth0),"Sortaform-item",{"name":"eq","hash":{},"fn":container.program(193, data, 0),"inverse":container.program(195, data, 0),"data":data})) != null ? stack1 : "");
},"193":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = container.invokePartial(partials["form/fields/sortaform/sortaform-item"],depth0,{"name":"form/fields/sortaform/sortaform-item","data":data,"indent":"              ","helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "");
},"195":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = (helpers.eq || (depth0 && depth0.eq) || helpers.helperMissing).call(depth0 != null ? depth0 : {},(depth0 != null ? depth0.type : depth0),"Listform-item",{"name":"eq","hash":{},"fn":container.program(196, data, 0),"inverse":container.program(198, data, 0),"data":data})) != null ? stack1 : "");
},"196":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = container.invokePartial(partials["form/fields/listform/listform-item"],depth0,{"name":"form/fields/listform/listform-item","data":data,"indent":"              ","helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "");
},"198":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = container.invokePartial(partials.base,depth0,{"name":"base","data":data,"indent":"              ","helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "            ";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1;

  return "\r\n\r\n\r\n\r\n\r\n\r\n"
    + ((stack1 = helpers["if"].call(depth0 != null ? depth0 : {},(data && data.input),{"name":"if","hash":{},"fn":container.program(187, data, 0, blockParams, depths),"inverse":container.program(189, data, 0, blockParams, depths),"data":data})) != null ? stack1 : "");
},"main_d":  function(fn, props, container, depth0, data, blockParams, depths) {

  var decorators = container.decorators;

  fn = decorators.inline(fn,props,container,{"name":"inline","hash":{},"fn":container.program(1, data, 0, blockParams, depths),"inverse":container.noop,"args":["base"],"data":data}) || fn;
  fn = decorators.inline(fn,props,container,{"name":"inline","hash":{},"fn":container.program(23, data, 0, blockParams, depths),"inverse":container.noop,"args":["field"],"data":data}) || fn;
  fn = decorators.inline(fn,props,container,{"name":"inline","hash":{},"fn":container.program(54, data, 0, blockParams, depths),"inverse":container.noop,"args":["placeholder"],"data":data}) || fn;
  fn = decorators.inline(fn,props,container,{"name":"inline","hash":{},"fn":container.program(56, data, 0, blockParams, depths),"inverse":container.noop,"args":["input"],"data":data}) || fn;
  fn = decorators.inline(fn,props,container,{"name":"inline","hash":{},"fn":container.program(71, data, 0, blockParams, depths),"inverse":container.noop,"args":["icon"],"data":data}) || fn;
  fn = decorators.inline(fn,props,container,{"name":"inline","hash":{},"fn":container.program(73, data, 0, blockParams, depths),"inverse":container.noop,"args":["inputTypes"],"data":data}) || fn;
  return fn;
  }

,"useDecorators":true,"usePartial":true,"useData":true,"useDepths":true});
templates['grid/filters'] = template({"1":function(container,depth0,helpers,partials,data) {
    return "  <div class=\"filter-container collapsed panel panel-default\">\r\n    <div class=\"panel-heading\">\r\n      <h3 class=\"panel-title\">\r\n        <span data-i18n=\"app.grid.advanced-search\"></span>\r\n        <i class=\"fa pull-right panel-collapse-icon\"></i>\r\n        <span style=\"margin-right: 5px;\" class=\"badge label-success pull-right\"><i class=\"fa fa-filter\"></i>: <span\r\n            data-id=\"filter-count\"></span></span>\r\n      </h3>\r\n    </div>\r\n    <div class=\"panel-body\" style=\"display:none;\">\r\n      <div class=\"container\">\r\n      </div>\r\n      <button type=\"button\" class=\"clear-filters btn btn-warning btn-flat fa-btn\">\r\n        &#xf014;\r\n      </button>\r\n      <button type=\"button\" class=\"new-filter btn btn-success btn-flat fa-btn\">\r\n        &#xf00e;\r\n      </button>\r\n      <!--\r\n        <span style=\"padding-left:15px\">AND</span>\r\n        <div style=\"display: inline-block\" class=\"checkbox checkbox-slider--c checkbox-slider-success\">\r\n          <label>\r\n            <input type=\"checkbox\" data-id=\"operation\">\r\n            <span style=\"padding-left:22px;\"></span>\r\n          </label>\r\n        </div>\r\n        <span>OR</span>\r\n      -->\r\n      <button type=\"button\" class=\"apply-filter pull-right btn btn-primary btn-flat fa-btn\">\r\n        &#xf021;\r\n      </button>\r\n    </div>\r\n  </div>\r\n";
},"3":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "  <div class=\"filter filter-text clearfix\">\r\n    <div class=\"form-group pull-left\" style=\"width:auto;\">\r\n      <button type=\"button\" class=\"btn btn-default btn-flat rm-fltr fa-btn\">\r\n        &#xf010;\r\n      </button>\r\n    </div>\r\n    <div class=\"row\">\r\n      <div class=\"col-sm-3 col-xs-6\">\r\n        <div class=\"form-group\">\r\n          <select class=\"field-select form-control filter-val\">\r\n"
    + ((stack1 = helpers.blockHelperMissing.call(depth0,container.lambda(depth0, depth0),{"name":".","hash":{},"fn":container.program(4, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "          </select>\r\n        </div>\r\n      </div>\r\n      <div class=\"constraint-container\"></div>\r\n    </div>\r\n  </div>\r\n";
},"4":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = helpers["if"].call(depth0 != null ? depth0 : {},(depth0 != null ? depth0.field : depth0),{"name":"if","hash":{},"fn":container.program(5, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "");
},"5":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = (helpers.neq || (depth0 && depth0.neq) || helpers.helperMissing).call(depth0 != null ? depth0 : {},(depth0 != null ? depth0.type : depth0),"hidden",{"name":"neq","hash":{},"fn":container.program(6, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "");
},"6":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = helpers.unless.call(depth0 != null ? depth0 : {},(depth0 != null ? depth0["no-filter"] : depth0),{"name":"unless","hash":{},"fn":container.program(7, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "");
},"7":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "                    <option value=\""
    + alias4(((helper = (helper = helpers.field || (depth0 != null ? depth0.field : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"field","hash":{},"data":data}) : helper)))
    + "\" data-type=\""
    + alias4(((helper = (helper = helpers.type || (depth0 != null ? depth0.type : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"type","hash":{},"data":data}) : helper)))
    + "\" data-i18n=\""
    + alias4(((helper = (helper = helpers.i18n || (depth0 != null ? depth0.i18n : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"i18n","hash":{},"data":data}) : helper)))
    + "\" "
    + ((stack1 = (helpers.eq || (depth0 && depth0.eq) || alias2).call(alias1,(depth0 != null ? depth0.field : depth0),(data && data.selected),{"name":"eq","hash":{},"fn":container.program(8, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + ">.\r\n                    </option>\r\n";
},"8":function(container,depth0,helpers,partials,data) {
    return "\r\n                      selected=\"\" ";
},"10":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = (helpers.eq || (depth0 && depth0.eq) || helpers.helperMissing).call(depth0 != null ? depth0 : {},(data && data.fieldType),"string",{"name":"eq","hash":{},"fn":container.program(11, data, 0),"inverse":container.program(13, data, 0),"data":data})) != null ? stack1 : "");
},"11":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = container.invokePartial(partials["string-constraint"],depth0,{"name":"string-constraint","data":data,"indent":"    ","helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "");
},"13":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = (helpers.eq || (depth0 && depth0.eq) || helpers.helperMissing).call(depth0 != null ? depth0 : {},(data && data.fieldType),"date",{"name":"eq","hash":{},"fn":container.program(14, data, 0),"inverse":container.program(16, data, 0),"data":data})) != null ? stack1 : "");
},"14":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = container.invokePartial(partials["date-constraint"],depth0,{"name":"date-constraint","data":data,"indent":"    ","helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "");
},"16":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = (helpers.eq || (depth0 && depth0.eq) || helpers.helperMissing).call(depth0 != null ? depth0 : {},(data && data.fieldType),"number",{"name":"eq","hash":{},"fn":container.program(17, data, 0),"inverse":container.program(19, data, 0),"data":data})) != null ? stack1 : "");
},"17":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = container.invokePartial(partials["number-constraint"],depth0,{"name":"number-constraint","data":data,"indent":"    ","helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "");
},"19":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = (helpers.eq || (depth0 && depth0.eq) || helpers.helperMissing).call(depth0 != null ? depth0 : {},(data && data.fieldType),"boolean",{"name":"eq","hash":{},"fn":container.program(20, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "");
},"20":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = container.invokePartial(partials["boolean-constraint"],depth0,{"name":"boolean-constraint","data":data,"indent":"    ","helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "  ";
},"22":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "  <div class=\"constraint string-constraint\">\r\n    <div class=\"col-sm-3 col-xs-6\">\r\n      <div class=\"form-group\">\r\n        <select class=\"constraint-select form-control filter-val\">\r\n          <option value=\"contains\" data-i18n=\"app.grid.filters.contains\"></option>\r\n          <option value=\"excludes\" data-i18n=\"app.grid.filters.excludes\"></option>\r\n          <option value=\"equals\" data-i18n=\"app.grid.filters.equals\"></option>\r\n        </select>\r\n      </div>\r\n    </div>\r\n    <div class=\"filter-value col-sm-6 col-xs-12\">\r\n"
    + ((stack1 = container.invokePartial(partials.string,depth0,{"name":"string","data":data,"indent":"      ","helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "    </div>\r\n  </div>\r\n";
},"24":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "  <div class=\"constraint date-constraint\">\r\n    <div class=\"col-sm-3 col-xs-6\">\r\n      <div class=\"form-group\">\r\n        <select class=\"constraint-select form-control filter-val\">\r\n          <option value=\"greaterThan\" data-i18n=\"app.grid.filters.after\"></option>\r\n          <option value=\"lessThan\" data-i18n=\"app.grid.filters.before\"></option>\r\n          <option value=\"between\" data-i18n=\"app.grid.filters.between\"></option>\r\n          <option value=\"during\" data-i18n=\"app.grid.filters.during\"></option>\r\n        </select>\r\n      </div>\r\n    </div>\r\n    <div class=\"filter-value col-sm-6 col-xs-12\">\r\n"
    + ((stack1 = container.invokePartial(partials.date,depth0,{"name":"date","data":data,"indent":"      ","helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + ((stack1 = container.invokePartial(partials["date-day"],depth0,{"name":"date-day","data":data,"indent":"      ","helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + ((stack1 = container.invokePartial(partials["date-dual"],depth0,{"name":"date-dual","data":data,"indent":"      ","helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "    </div>\r\n  </div>\r\n";
},"26":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "  <div class=\"constraint number-constraint\">\r\n    <div class=\"col-sm-3 col-xs-6\">\r\n      <div class=\"form-group\">\r\n        <select class=\"constraint-select form-control filter-val\">\r\n          <option value=\"greaterThan\" data-i18n=\"app.grid.filters.greater\"></option>\r\n          <option value=\"lessThan\" data-i18n=\"app.grid.filters.lower\"></option>\r\n          <option value=\"equals\" data-i18n=\"app.grid.filters.equals\" selected></option>\r\n          <option value=\"between\" data-i18n=\"app.grid.filters.between\"></option>\r\n          <option value=\"notEqual\" data-i18n=\"app.grid.filters.different\"></option>\r\n        </select>\r\n      </div>\r\n    </div>\r\n    <div class=\"filter-value col-sm-6 col-xs-12\">\r\n"
    + ((stack1 = container.invokePartial(partials.number,depth0,{"name":"number","data":data,"indent":"      ","helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + ((stack1 = container.invokePartial(partials["number-dual"],depth0,{"name":"number-dual","data":data,"indent":"      ","helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "    </div>\r\n  </div>\r\n";
},"28":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "  <div class=\"constraint boolean-constraint\">\r\n    <div class=\"col-sm-3 col-xs-6\">\r\n      <div class=\"form-group\">\r\n        <select class=\"constraint-select form-control filter-val\">\r\n          <option value=\"equals\" data-i18n=\"app.grid.filters.equals\"></option>\r\n          <option value=\"notEqual\" data-i18n=\"app.grid.filters.different\"></option>\r\n        </select>\r\n      </div>\r\n    </div>\r\n    <div class=\"filter-value col-sm-6 col-xs-12\">\r\n"
    + ((stack1 = container.invokePartial(partials["boolean"],depth0,{"name":"boolean","data":data,"indent":"      ","helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "    </div>\r\n  </div>\r\n";
},"30":function(container,depth0,helpers,partials,data) {
    return "  <div class=\"hidden form-group filter-string\">\r\n    <div class=\"input-group\">\r\n      <div class=\"input-group-addon\">\r\n        <i class=\"fa fa-fw fa-font\"></i>\r\n      </div>\r\n      <input type=\"text\" class=\"form-control filter-val\"></input>\r\n    </div>\r\n  </div>\r\n";
},"32":function(container,depth0,helpers,partials,data) {
    return "  <div class=\"hidden form-group filter-date\">\r\n    <div class=\"input-group date\">\r\n      <div class=\"input-group-addon\">\r\n        <i class=\"fa fa-fw fa-calendar\"></i>\r\n      </div>\r\n      <input type=\"text\" name=\"daterange\" class=\"form-control filter-val datetimesinglepicker\">\r\n      </input>\r\n    </div>\r\n  </div>\r\n";
},"34":function(container,depth0,helpers,partials,data) {
    return "  <div class=\"hidden form-group filter-date-day\">\r\n    <div class=\"input-group date\">\r\n      <div class=\"input-group-addon\">\r\n        <i class=\"fa fa-fw fa-calendar\"></i>\r\n      </div>\r\n      <input type=\"text\" name=\"daterange\" class=\"form-control filter-val datesinglepicker\">\r\n      </input>\r\n    </div>\r\n  </div>\r\n";
},"36":function(container,depth0,helpers,partials,data) {
    return "  <div class=\"hidden form-group filter-date-dual\">\r\n    <div class=\"input-group date\">\r\n      <div class=\"input-group-addon\">\r\n        <i class=\"fa fa-fw fa-calendar\"></i>\r\n      </div>\r\n      <input type=\"text\" name=\"daterange\" class=\"form-control filter-val datetimerangepicker\">\r\n      </input>\r\n    </div>\r\n  </div>\r\n";
},"38":function(container,depth0,helpers,partials,data) {
    return "  <div class=\"hidden form-group filter-number\">\r\n    <div class=\"input-group\">\r\n      <div class=\"input-group-addon\">\r\n        <i class=\"fa fa-fw ion-pound\"></i>\r\n      </div>\r\n      <input type=\"number\" step=\"any\" class=\"form-control filter-val number-filter\"></input>\r\n    </div>\r\n  </div>\r\n";
},"40":function(container,depth0,helpers,partials,data) {
    return "  <div class=\"hidden row filter-number-dual\">\r\n    <div class=\"col-sm-6 col-xs-6\">\r\n      <div class=\"form-group\">\r\n        <div class=\"input-group\">\r\n          <div class=\"input-group-addon\">\r\n            <i class=\"fa fa-fw ion-pound\"></i>\r\n          </div>\r\n          <input type=\"number\" step=\"any\" class=\"form-control filter-val number-filter\"></input>\r\n        </div>\r\n      </div>\r\n    </div>\r\n    <div class=\"col-sm-6 col-xs-6\">\r\n      <div class=\"form-group\">\r\n        <div class=\"input-group\">\r\n          <div class=\"input-group-addon\">\r\n            <i class=\"fa fa-fw ion-pound\"></i>\r\n          </div>\r\n          <input type=\"number\" step=\"any\" class=\"form-control filter-val number-filter\"></input>\r\n        </div>\r\n      </div>\r\n    </div>\r\n  </div>\r\n";
},"42":function(container,depth0,helpers,partials,data) {
    var stack1, helper, options, buffer = 
  "  <div class=\"hidden form-group filter-boolean\">\r\n    <div class=\"input-group\">\r\n      <div class=\"checkboxb\">\r\n";
  stack1 = ((helper = (helper = helpers.getUniqueId || (depth0 != null ? depth0.getUniqueId : depth0)) != null ? helper : helpers.helperMissing),(options={"name":"getUniqueId","hash":{},"fn":container.program(43, data, 0),"inverse":container.noop,"data":data}),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},options) : helper));
  if (!helpers.getUniqueId) { stack1 = helpers.blockHelperMissing.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer + "      </div>\r\n    </div>\r\n  </div>\r\n";
},"43":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "          <input type=\"checkbox\" class=\"filter-val\" id=\"checkbox-"
    + alias4(((helper = (helper = helpers.randomId || (data && data.randomId)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"randomId","hash":{},"data":data}) : helper)))
    + "\">\r\n          <label for=\"checkbox-"
    + alias4(((helper = (helper = helpers.randomId || (data && data.randomId)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"randomId","hash":{},"data":data}) : helper)))
    + "\">\r\n          </label>\r\n";
},"45":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = container.invokePartial(partials.filter,depth0,{"name":"filter","data":data,"indent":"  ","helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "");
},"47":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = helpers["if"].call(depth0 != null ? depth0 : {},(data && data.constraint),{"name":"if","hash":{},"fn":container.program(48, data, 0),"inverse":container.program(50, data, 0),"data":data})) != null ? stack1 : "");
},"48":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = container.invokePartial(partials.constraint,depth0,{"name":"constraint","data":data,"indent":"  ","helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "");
},"50":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = helpers["if"].call(depth0 != null ? depth0 : {},(data && data.string),{"name":"if","hash":{},"fn":container.program(51, data, 0),"inverse":container.program(53, data, 0),"data":data})) != null ? stack1 : "");
},"51":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = container.invokePartial(partials.string,depth0,{"name":"string","data":data,"indent":"  ","helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "");
},"53":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = helpers["if"].call(depth0 != null ? depth0 : {},(data && data.date),{"name":"if","hash":{},"fn":container.program(54, data, 0),"inverse":container.program(56, data, 0),"data":data})) != null ? stack1 : "");
},"54":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = container.invokePartial(partials.date,depth0,{"name":"date","data":data,"indent":"  ","helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "");
},"56":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = helpers["if"].call(depth0 != null ? depth0 : {},(data && data["date-day"]),{"name":"if","hash":{},"fn":container.program(57, data, 0),"inverse":container.program(59, data, 0),"data":data})) != null ? stack1 : "");
},"57":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = container.invokePartial(partials["date-day"],depth0,{"name":"date-day","data":data,"indent":"  ","helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "");
},"59":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = helpers["if"].call(depth0 != null ? depth0 : {},(data && data["date-dual"]),{"name":"if","hash":{},"fn":container.program(60, data, 0),"inverse":container.program(62, data, 0),"data":data})) != null ? stack1 : "");
},"60":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = container.invokePartial(partials["date-dual"],depth0,{"name":"date-dual","data":data,"indent":"  ","helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "");
},"62":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = helpers["if"].call(depth0 != null ? depth0 : {},(data && data.number),{"name":"if","hash":{},"fn":container.program(63, data, 0),"inverse":container.program(65, data, 0),"data":data})) != null ? stack1 : "");
},"63":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = container.invokePartial(partials.number,depth0,{"name":"number","data":data,"indent":"  ","helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "");
},"65":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = helpers["if"].call(depth0 != null ? depth0 : {},(data && data["number-dual"]),{"name":"if","hash":{},"fn":container.program(66, data, 0),"inverse":container.program(68, data, 0),"data":data})) != null ? stack1 : "");
},"66":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = container.invokePartial(partials["number-dual"],depth0,{"name":"number-dual","data":data,"indent":"  ","helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "");
},"68":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = container.invokePartial(partials.base,depth0,{"name":"base","data":data,"indent":"  ","helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "");
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1;

  return "\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n"
    + ((stack1 = helpers["if"].call(depth0 != null ? depth0 : {},(data && data.filter),{"name":"if","hash":{},"fn":container.program(45, data, 0, blockParams, depths),"inverse":container.program(47, data, 0, blockParams, depths),"data":data})) != null ? stack1 : "");
},"main_d":  function(fn, props, container, depth0, data, blockParams, depths) {

  var decorators = container.decorators;

  fn = decorators.inline(fn,props,container,{"name":"inline","hash":{},"fn":container.program(1, data, 0, blockParams, depths),"inverse":container.noop,"args":["base"],"data":data}) || fn;
  fn = decorators.inline(fn,props,container,{"name":"inline","hash":{},"fn":container.program(3, data, 0, blockParams, depths),"inverse":container.noop,"args":["filter"],"data":data}) || fn;
  fn = decorators.inline(fn,props,container,{"name":"inline","hash":{},"fn":container.program(10, data, 0, blockParams, depths),"inverse":container.noop,"args":["constraint"],"data":data}) || fn;
  fn = decorators.inline(fn,props,container,{"name":"inline","hash":{},"fn":container.program(22, data, 0, blockParams, depths),"inverse":container.noop,"args":["string-constraint"],"data":data}) || fn;
  fn = decorators.inline(fn,props,container,{"name":"inline","hash":{},"fn":container.program(24, data, 0, blockParams, depths),"inverse":container.noop,"args":["date-constraint"],"data":data}) || fn;
  fn = decorators.inline(fn,props,container,{"name":"inline","hash":{},"fn":container.program(26, data, 0, blockParams, depths),"inverse":container.noop,"args":["number-constraint"],"data":data}) || fn;
  fn = decorators.inline(fn,props,container,{"name":"inline","hash":{},"fn":container.program(28, data, 0, blockParams, depths),"inverse":container.noop,"args":["boolean-constraint"],"data":data}) || fn;
  fn = decorators.inline(fn,props,container,{"name":"inline","hash":{},"fn":container.program(30, data, 0, blockParams, depths),"inverse":container.noop,"args":["string"],"data":data}) || fn;
  fn = decorators.inline(fn,props,container,{"name":"inline","hash":{},"fn":container.program(32, data, 0, blockParams, depths),"inverse":container.noop,"args":["date"],"data":data}) || fn;
  fn = decorators.inline(fn,props,container,{"name":"inline","hash":{},"fn":container.program(34, data, 0, blockParams, depths),"inverse":container.noop,"args":["date-day"],"data":data}) || fn;
  fn = decorators.inline(fn,props,container,{"name":"inline","hash":{},"fn":container.program(36, data, 0, blockParams, depths),"inverse":container.noop,"args":["date-dual"],"data":data}) || fn;
  fn = decorators.inline(fn,props,container,{"name":"inline","hash":{},"fn":container.program(38, data, 0, blockParams, depths),"inverse":container.noop,"args":["number"],"data":data}) || fn;
  fn = decorators.inline(fn,props,container,{"name":"inline","hash":{},"fn":container.program(40, data, 0, blockParams, depths),"inverse":container.noop,"args":["number-dual"],"data":data}) || fn;
  fn = decorators.inline(fn,props,container,{"name":"inline","hash":{},"fn":container.program(42, data, 0, blockParams, depths),"inverse":container.noop,"args":["boolean"],"data":data}) || fn;
  return fn;
  }

,"useDecorators":true,"usePartial":true,"useData":true,"useDepths":true});
templates['grid/grid'] = template({"1":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : {};

  return ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.controls : depth0),{"name":"if","hash":{},"fn":container.program(2, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "  <!-- <div class=\"select-everything hidden\" style=\";\"></div>-->\r\n  <table\r\n    class=\"Grid "
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0["no-wrap"] : depth0),{"name":"if","hash":{},"fn":container.program(29, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + " "
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0["no-checks"] : depth0),{"name":"if","hash":{},"fn":container.program(31, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "table table-bordered row-border table-hover table-striped table-condensed\">\r\n  </table>\r\n";
},"2":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : {};

  return "    <div class=\"grid-status-bar\">\r\n"
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.search : depth0),{"name":"if","hash":{},"fn":container.program(3, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + ((stack1 = helpers["if"].call(alias1,((stack1 = (depth0 != null ? depth0.controls : depth0)) != null ? stack1.copyPrompt : stack1),{"name":"if","hash":{},"fn":container.program(5, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\r\n      <div class=\"grid-status-buttons\">\r\n\r\n"
    + ((stack1 = helpers["if"].call(alias1,((stack1 = (depth0 != null ? depth0.controls : depth0)) != null ? stack1.select : stack1),{"name":"if","hash":{},"fn":container.program(7, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "        <div class=\"grid-control-buttons\">\r\n          <div class=\"dropdown grid-misc-settings messages-menu\" style=\"display: inline-block\">\r\n            <a aria-expanded=\"false\" href=\"#\" data-toggle=\"dropdown\">\r\n              <i class=\"grid-status-button fa fa-gears\"></i>\r\n            </a>\r\n            <ul class=\"dropdown-menu dropdown-menu-right\" style=\"width: auto;\">\r\n              <li>\r\n                <div style=\"position: relative; overflow: hidden; width: auto;\" class=\"slimScrollDiv\">\r\n                  <ul class=\"menu\">\r\n\r\n"
    + ((stack1 = helpers["if"].call(alias1,((stack1 = (depth0 != null ? depth0.controls : depth0)) != null ? stack1.textOptions : stack1),{"name":"if","hash":{},"fn":container.program(9, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\r\n\r\n"
    + ((stack1 = helpers["if"].call(alias1,((stack1 = (depth0 != null ? depth0.controls : depth0)) != null ? stack1.selectionModes : stack1),{"name":"if","hash":{},"fn":container.program(11, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\r\n"
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.rowGroups : depth0),{"name":"if","hash":{},"fn":container.program(18, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "                  </ul>\r\n                </div>\r\n              </li>\r\n            </ul>\r\n          </div>\r\n"
    + ((stack1 = helpers["if"].call(alias1,((stack1 = (depth0 != null ? depth0.controls : depth0)) != null ? stack1["export"] : stack1),{"name":"if","hash":{},"fn":container.program(21, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\r\n"
    + ((stack1 = helpers["if"].call(alias1,((stack1 = (depth0 != null ? depth0.controls : depth0)) != null ? stack1.visibility : stack1),{"name":"if","hash":{},"fn":container.program(23, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + ((stack1 = helpers["if"].call(alias1,((stack1 = (depth0 != null ? depth0.controls : depth0)) != null ? stack1.save : stack1),{"name":"if","hash":{},"fn":container.program(25, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + ((stack1 = helpers["if"].call(alias1,((stack1 = (depth0 != null ? depth0.controls : depth0)) != null ? stack1.refresh : stack1),{"name":"if","hash":{},"fn":container.program(27, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "        </div>\r\n      </div>\r\n    </div>\r\n";
},"3":function(container,depth0,helpers,partials,data) {
    return "        <div class=\"grid-search pull-left\">\r\n          <input class=\"form-text form-control\" type=\"text\" data-i18n=\"[placeholder]app.grid.search\"\r\n            placeholder=\"search\" style=\"height:22px\" />\r\n        </div>\r\n";
},"5":function(container,depth0,helpers,partials,data) {
    return "        <div class=\"grid-copy-prompt pull-left hidden-xs\">\r\n          <i class=\"fa fa-copy\"></i>\r\n          <small data-i18n=\"app.grid.copy-prompt\"></small>\r\n        </div>\r\n";
},"7":function(container,depth0,helpers,partials,data) {
    return "          <small class=\"grid-selects\">\r\n            <span data-i18n=\"app.grid.select\" data-i18n=\"\"></span>\r\n            <span class=\"grid-select-options\">\r\n              <span data-i18n=\"app.grid.select-all\" class=\"grid-select grid-select-all\"></span> /\r\n              <span data-i18n=\"app.grid.select-none\" class=\"grid-select grid-select-none\"></span> /\r\n              <span data-i18n=\"app.grid.select-inverse\" class=\"grid-select grid-select-inverse\"></span>\r\n            </span>\r\n          </small>\r\n";
},"9":function(container,depth0,helpers,partials,data) {
    return "                      <li data-id=\"font-size\">\r\n                        <small class=\"grid-text-options hidden-xs\" style=\"margin-right: 1em;\">\r\n                          <span data-i18n=\"app.grid.text-options\"></span>\r\n                          <span class=\"grid-text-options-options\">\r\n                            <i class=\"fa fa-minus grid-text-mode\" data-mode=\"minus\"></i>\r\n                            /\r\n                            <i class=\"fa fa-plus grid-text-mode\" data-mode=\"plus\"></i>\r\n                          </span>\r\n                        </small>\r\n                      </li>\r\n";
},"11":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : {};

  return "                      <li data-id=\"selection-mode\">\r\n                        <small class=\"grid-select-modes hidden-xs\">\r\n                          <span data-i18n=\"app.grid.selection-mode\"></span>\r\n                          <span class=\"grid-select-mode-options\">\r\n"
    + ((stack1 = helpers["if"].call(alias1,((stack1 = ((stack1 = (depth0 != null ? depth0.controls : depth0)) != null ? stack1.selectionModes : stack1)) != null ? stack1.rows : stack1),{"name":"if","hash":{},"fn":container.program(12, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + ((stack1 = helpers["if"].call(alias1,((stack1 = ((stack1 = (depth0 != null ? depth0.controls : depth0)) != null ? stack1.selectionModes : stack1)) != null ? stack1.cells : stack1),{"name":"if","hash":{},"fn":container.program(14, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + ((stack1 = helpers["if"].call(alias1,((stack1 = ((stack1 = (depth0 != null ? depth0.controls : depth0)) != null ? stack1.selectionModes : stack1)) != null ? stack1.text : stack1),{"name":"if","hash":{},"fn":container.program(16, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "                          </span>\r\n                        </small>\r\n                      </li>\r\n";
},"12":function(container,depth0,helpers,partials,data) {
    return "                              <i class=\"fa fa-th-list grid-select-mode\" data-mode=\"rows\"></i> /\r\n";
},"14":function(container,depth0,helpers,partials,data) {
    return "                              <i class=\"fa fa-th grid-select-mode\" data-mode=\"cells\"></i> /\r\n";
},"16":function(container,depth0,helpers,partials,data) {
    return "                              <i class=\"fa fa-font grid-select-mode\" data-mode=\"text\"></i>\r\n";
},"18":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "                      <li data-id=\"row-group\">\r\n                        <small class=\"grid-row-grouping hidden-xs\">\r\n                          <span data-i18n=\"app.grid.group-by\">T:GroupBy</span>\r\n                          <select>\r\n                            <option value=\"none\" data-i18n=\"app.grid.group-none\">T:None</option>\r\n"
    + ((stack1 = helpers.each.call(depth0 != null ? depth0 : {},(depth0 != null ? depth0.rowGroups : depth0),{"name":"each","hash":{},"fn":container.program(19, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "                          </select>\r\n                        </small>\r\n                      </li>\r\n";
},"19":function(container,depth0,helpers,partials,data) {
    var alias1=container.lambda, alias2=container.escapeExpression;

  return "                              <option value=\""
    + alias2(alias1(depth0, depth0))
    + "\" data-i18n=\""
    + alias2((helpers.getFieldTitle || (depth0 && depth0.getFieldTitle) || helpers.helperMissing).call(depth0 != null ? depth0 : {},depth0,{"name":"getFieldTitle","hash":{},"data":data}))
    + "\">T:"
    + alias2(alias1(depth0, depth0))
    + "</option>\r\n";
},"21":function(container,depth0,helpers,partials,data) {
    return "            <div class=\"dropdown grid-export messages-menu\" style=\"display: inline-block\">\r\n              <a aria-expanded=\"false\" href=\"#\" data-toggle=\"dropdown\">\r\n                <i class=\"grid-status-button fa fa-download\"></i>\r\n              </a>\r\n              <ul class=\"dropdown-menu dropdown-menu-right\" style=\"width: auto;\">\r\n                <li>\r\n                  <div style=\"position: relative; overflow: hidden; width: auto;\" class=\"slimScrollDiv\">\r\n                    <ul class=\"menu\">\r\n                      <li data-id=\"xlsx\">\r\n                        <i class=\"fa fa-fw fa-file-excel-o\"></i>\r\n                        <small data-i18n=\"app.grid.export-xlsx\"></small>\r\n                      </li>\r\n                      <li data-id=\"csv\">\r\n                        <i class=\"fa fa-fw fa-file-text-o\"></i>\r\n                        <small data-i18n=\"app.grid.export-csv\"></small>\r\n                      </li>\r\n                    </ul>\r\n                  </div>\r\n                </li>\r\n              </ul>\r\n            </div>\r\n";
},"23":function(container,depth0,helpers,partials,data) {
    return "            <div class=\"dropdown grid-vis messages-menu\" style=\"display: inline-block\">\r\n              <a aria-expanded=\"false\" href=\"#\" data-toggle=\"dropdown\">\r\n                <i class=\"grid-status-button fa fa-eye\"></i>\r\n              </a>\r\n              <ul class=\"dropdown-menu dropdown-menu-right\" style=\"width: auto;\">\r\n                <li>\r\n                  <div style=\"position: relative; overflow: hidden; width: auto;\" class=\"slimScrollDiv\">\r\n                    <ul class=\"menu\">\r\n\r\n                    </ul>\r\n                  </div>\r\n                </li>\r\n              </ul>\r\n            </div>\r\n";
},"25":function(container,depth0,helpers,partials,data) {
    return "            <i class=\"grid-status-button fa fa-save\"></i>\r\n";
},"27":function(container,depth0,helpers,partials,data) {
    return "            <i class=\"grid-status-button fa fa-refresh\"></i>\r\n";
},"29":function(container,depth0,helpers,partials,data) {
    return "grid-no-wrap ";
},"31":function(container,depth0,helpers,partials,data) {
    return "no-checks ";
},"33":function(container,depth0,helpers,partials,data) {
    var stack1, helper, options, buffer = 
  "    <tr>\r\n";
  stack1 = ((helper = (helper = helpers.fields || (depth0 != null ? depth0.fields : depth0)) != null ? helper : helpers.helperMissing),(options={"name":"fields","hash":{},"fn":container.program(34, data, 0),"inverse":container.noop,"data":data}),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},options) : helper));
  if (!helpers.fields) { stack1 = helpers.blockHelperMissing.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer + "    </tr>\r\n";
},"34":function(container,depth0,helpers,partials,data) {
    var helper;

  return "        <td>\r\n          "
    + container.escapeExpression(((helper = (helper = helpers.value || (depth0 != null ? depth0.value : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"value","hash":{},"data":data}) : helper)))
    + "\r\n        </td>\r\n";
},"36":function(container,depth0,helpers,partials,data) {
    var stack1, helper, options, buffer = 
  "      <div class=\"btn-group\" role=\"group\" style=\"color:white;\" aria-label=\"...\">";
  stack1 = ((helper = (helper = helpers.buttons || (depth0 != null ? depth0.buttons : depth0)) != null ? helper : helpers.helperMissing),(options={"name":"buttons","hash":{},"fn":container.program(37, data, 0),"inverse":container.noop,"data":data}),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},options) : helper));
  if (!helpers.buttons) { stack1 = helpers.blockHelperMissing.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer + "</div>\r\n";
},"37":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = (helpers.eq || (depth0 && depth0.eq) || helpers.helperMissing).call(depth0 != null ? depth0 : {},(depth0 != null ? depth0.type : depth0),"link",{"name":"eq","hash":{},"fn":container.program(38, data, 0),"inverse":container.program(59, data, 0),"data":data})) != null ? stack1 : "");
},"38":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "          <a "
    + ((stack1 = helpers.unless.call(alias1,(depth0 != null ? depth0.internal : depth0),{"name":"unless","hash":{},"fn":container.program(39, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + " data-btn-name=\""
    + alias4(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"name","hash":{},"data":data}) : helper)))
    + "\" "
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.tooltip : depth0),{"name":"if","hash":{},"fn":container.program(41, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + " href=\""
    + alias4((helpers.hbs || (depth0 && depth0.hbs) || alias2).call(alias1,(depth0 != null ? depth0.url : depth0),(data && data.row),{"name":"hbs","hash":{},"data":data}))
    + "\"\r\n            "
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.filename : depth0),{"name":"if","hash":{},"fn":container.program(43, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\r\n            class=\"grid-btn btn-flat btn btn-xs"
    + ((stack1 = helpers.each.call(alias1,(depth0 != null ? depth0.states : depth0),{"name":"each","hash":{},"fn":container.program(45, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + ((stack1 = helpers.each.call(alias1,(depth0 != null ? depth0.permissions : depth0),{"name":"each","hash":{},"fn":container.program(48, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.btnClass : depth0),{"name":"if","hash":{},"fn":container.program(51, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\" style=\""
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.color : depth0),{"name":"if","hash":{},"fn":container.program(53, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.border : depth0),{"name":"if","hash":{},"fn":container.program(55, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.bgcolor : depth0),{"name":"if","hash":{},"fn":container.program(57, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\">\r\n            <i class=\""
    + alias4(((helper = (helper = helpers.icon || (depth0 != null ? depth0.icon : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"icon","hash":{},"data":data}) : helper)))
    + "\"></i>\r\n          </a>\r\n";
},"39":function(container,depth0,helpers,partials,data) {
    return "target=\"_blank\" ";
},"41":function(container,depth0,helpers,partials,data) {
    var helper;

  return "\r\n            data-i18n=\"[data-balloon]"
    + container.escapeExpression(((helper = (helper = helpers.tooltip || (depth0 != null ? depth0.tooltip : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"tooltip","hash":{},"data":data}) : helper)))
    + "\" data-balloon-pos=\"right\" ";
},"43":function(container,depth0,helpers,partials,data) {
    return "download=\""
    + container.escapeExpression((helpers.hbs || (depth0 && depth0.hbs) || helpers.helperMissing).call(depth0 != null ? depth0 : {},(depth0 != null ? depth0.filename : depth0),(data && data.row),{"name":"hbs","hash":{},"data":data}))
    + "\" ";
},"45":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing;

  return ((stack1 = (helpers.contains || (depth0 && depth0.contains) || alias2).call(alias1,(depth0 != null ? depth0.values : depth0),(helpers.prop || (depth0 && depth0.prop) || alias2).call(alias1,(data && data.row),(depth0 != null ? depth0.field : depth0),{"name":"prop","hash":{},"data":data}),(depth0 != null ? depth0.exclude : depth0),{"name":"contains","hash":{},"fn":container.program(46, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "");
},"46":function(container,depth0,helpers,partials,data) {
    var helper;

  return " "
    + container.escapeExpression(((helper = (helper = helpers["class"] || (depth0 != null ? depth0["class"] : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"class","hash":{},"data":data}) : helper)));
},"48":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing;

  return ((stack1 = (helpers.eq || (depth0 && depth0.eq) || alias2).call(alias1,(helpers.prop || (depth0 && depth0.prop) || alias2).call(alias1,(data && data.permissions),(data && data.key),{"name":"prop","hash":{},"data":data}),false,{"name":"eq","hash":{},"fn":container.program(49, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "");
},"49":function(container,depth0,helpers,partials,data) {
    return " "
    + container.escapeExpression(container.lambda(depth0, depth0));
},"51":function(container,depth0,helpers,partials,data) {
    var helper;

  return " "
    + container.escapeExpression(((helper = (helper = helpers.btnClass || (depth0 != null ? depth0.btnClass : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"btnClass","hash":{},"data":data}) : helper)));
},"53":function(container,depth0,helpers,partials,data) {
    var helper;

  return "color:"
    + container.escapeExpression(((helper = (helper = helpers.color || (depth0 != null ? depth0.color : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"color","hash":{},"data":data}) : helper)))
    + ";";
},"55":function(container,depth0,helpers,partials,data) {
    var helper;

  return "border-color:"
    + container.escapeExpression(((helper = (helper = helpers.border || (depth0 != null ? depth0.border : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"border","hash":{},"data":data}) : helper)))
    + ";";
},"57":function(container,depth0,helpers,partials,data) {
    var helper;

  return "background-color:"
    + container.escapeExpression(((helper = (helper = helpers.bgcolor || (depth0 != null ? depth0.bgcolor : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"bgcolor","hash":{},"data":data}) : helper)))
    + ";";
},"59":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "            <button type=\"button\" data-btn-name=\""
    + alias4(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"name","hash":{},"data":data}) : helper)))
    + "\" "
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.tooltip : depth0),{"name":"if","hash":{},"fn":container.program(60, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + " class=\"grid-btn btn-flat btn btn-xs\r\n"
    + ((stack1 = helpers.each.call(alias1,(depth0 != null ? depth0.states : depth0),{"name":"each","hash":{},"fn":container.program(62, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + alias4(((helper = (helper = helpers[" "] || (depth0 != null ? depth0[" "] : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":" ","hash":{},"data":data}) : helper)))
    + alias4((helpers.permissionClasses || (depth0 && depth0.permissionClasses) || alias2).call(alias1,(depth0 != null ? depth0.permissions : depth0),(data && data.permissions),(data && data.key),{"name":"permissionClasses","hash":{},"data":data}))
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.btnClass : depth0),{"name":"if","hash":{},"fn":container.program(51, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\" style=\""
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.color : depth0),{"name":"if","hash":{},"fn":container.program(53, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.border : depth0),{"name":"if","hash":{},"fn":container.program(55, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.bgcolor : depth0),{"name":"if","hash":{},"fn":container.program(57, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\">\r\n              <i class=\""
    + alias4(((helper = (helper = helpers.icon || (depth0 != null ? depth0.icon : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"icon","hash":{},"data":data}) : helper)))
    + "\"></i>\r\n            </button>\r\n";
},"60":function(container,depth0,helpers,partials,data) {
    var helper;

  return " data-i18n=\"[data-balloon]"
    + container.escapeExpression(((helper = (helper = helpers.tooltip || (depth0 != null ? depth0.tooltip : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"tooltip","hash":{},"data":data}) : helper)))
    + "\"\r\n              data-balloon-pos=\"right\" ";
},"62":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing;

  return ((stack1 = (helpers.contains || (depth0 && depth0.contains) || alias2).call(alias1,(depth0 != null ? depth0.values : depth0),(helpers.prop || (depth0 && depth0.prop) || alias2).call(alias1,(data && data.row),(depth0 != null ? depth0.field : depth0),{"name":"prop","hash":{},"data":data}),(depth0 != null ? depth0.exclude : depth0),{"name":"contains","hash":{},"fn":container.program(63, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "");
},"63":function(container,depth0,helpers,partials,data) {
    var helper;

  return "                  "
    + container.escapeExpression(((helper = (helper = helpers["class"] || (depth0 != null ? depth0["class"] : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"class","hash":{},"data":data}) : helper)))
    + "\r\n";
},"65":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "            <button type=\"button\" data-btn-name=\""
    + alias4(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"name","hash":{},"data":data}) : helper)))
    + "\" "
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.tooltip : depth0),{"name":"if","hash":{},"fn":container.program(60, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + " class=\"grid-btn grid-col-btn btn-flat btn btn-xs\r\n"
    + ((stack1 = helpers.each.call(alias1,(depth0 != null ? depth0.states : depth0),{"name":"each","hash":{},"fn":container.program(62, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + alias4(((helper = (helper = helpers[" "] || (depth0 != null ? depth0[" "] : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":" ","hash":{},"data":data}) : helper)))
    + alias4((helpers.permissionClasses || (depth0 && depth0.permissionClasses) || alias2).call(alias1,(depth0 != null ? depth0.permissions : depth0),(data && data.permissions),(data && data.key),{"name":"permissionClasses","hash":{},"data":data}))
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.btnClass : depth0),{"name":"if","hash":{},"fn":container.program(51, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\" style=\""
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.color : depth0),{"name":"if","hash":{},"fn":container.program(53, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.border : depth0),{"name":"if","hash":{},"fn":container.program(55, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.bgcolor : depth0),{"name":"if","hash":{},"fn":container.program(57, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\">\r\n             "
    + alias4(((helper = (helper = helpers.content || (depth0 != null ? depth0.content : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"content","hash":{},"data":data}) : helper)))
    + "\r\n            </button>\r\n";
},"67":function(container,depth0,helpers,partials,data) {
    return "        <?xml version=\"1.0\" encoding=\"UTF-8\"?>\r\n        <Relationships xmlns=\"http://schemas.openxmlformats.org/package/2006/relationships\">\r\n          <Relationship Id=\"rId1\"\r\n            Type=\"http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument\"\r\n            Target=\"xl/workbook.xml\" />\r\n        </Relationships>\r\n";
},"69":function(container,depth0,helpers,partials,data) {
    return "          <?xml version=\"1.0\" encoding=\"UTF-8\"?>\r\n          <Relationships xmlns=\"http://schemas.openxmlformats.org/package/2006/relationships\">\r\n            <Relationship Id=\"rId4\" Type=\"http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles\"\r\n              Target=\"styles.xml\" />\r\n            <Relationship Id=\"rId1\" Type=\"http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet\"\r\n              Target=\"worksheets/sheet.xml\" />\r\n          </Relationships>\r\n";
},"71":function(container,depth0,helpers,partials,data) {
    return "            <?xml version=\"1.0\" encoding=\"UTF-8\"?>\r\n            <Types xmlns=\"http://schemas.openxmlformats.org/package/2006/content-types\">\r\n              <Default Extension=\"rels\" ContentType=\"application/vnd.openxmlformats-package.relationships+xml\" />\r\n              <Default Extension=\"xml\" ContentType=\"application/xml\" />\r\n              <Override PartName=\"/xl/styles.xml\"\r\n                ContentType=\"application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml\" />\r\n              <Override PartName=\"/xl/workbook.xml\"\r\n                ContentType=\"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml\" />\r\n              <Override PartName=\"/xl/worksheets/sheet.xml\"\r\n                ContentType=\"application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml\" />\r\n            </Types>\r\n";
},"73":function(container,depth0,helpers,partials,data) {
    return "              <?xml version=\"1.0\" encoding=\"UTF-8\"?>\r\n              <workbook xmlns=\"http://schemas.openxmlformats.org/spreadsheetml/2006/main\"\r\n                xmlns:r=\"http://schemas.openxmlformats.org/officeDocument/2006/relationships\">\r\n                <bookViews>\r\n                  <workbookView activeTab=\"0\" windowWidth=\"10240\" windowHeight=\"3920\" />\r\n                </bookViews>\r\n                <sheets>\r\n                  <sheet name=\"Sheet\" sheetId=\"1\" r:id=\"rId1\" />\r\n                </sheets>\r\n              </workbook>\r\n";
},"75":function(container,depth0,helpers,partials,data) {
    return "                <?xml version=\"1.0\" encoding=\"UTF-8\"?>\r\n                <styleSheet xmlns=\"http://schemas.openxmlformats.org/spreadsheetml/2006/main\">\r\n                  <numFmts count=\"1\">\r\n                    <numFmt formatCode=\"yyyy-mmm-dd h:mm\" numFmtId=\"100\" />\r\n                  </numFmts>\r\n                  <fonts count=\"2\">\r\n                    <font>\r\n                      <b val=\"0\" />\r\n                      <i val=\"0\" />\r\n                      <u val=\"none\" />\r\n                      <color rgb=\"FF000000\" />\r\n                      <name val=\"Sans\" />\r\n                      <vertAlign val=\"baseline\" />\r\n                      <sz val=\"10\" />\r\n                      <strike val=\"0\" />\r\n                    </font>\r\n                    <font>\r\n                      <b val=\"1\" />\r\n                      <i val=\"0\" />\r\n                      <u val=\"none\" />\r\n                      <color rgb=\"FF000000\" />\r\n                      <name val=\"Sans\" />\r\n                      <vertAlign val=\"baseline\" />\r\n                      <sz val=\"10\" />\r\n                      <strike val=\"0\" />\r\n                    </font>\r\n                  </fonts>\r\n                  <fills count=\"2\">\r\n                    <fill>\r\n                      <patternFill patternType=\"none\" />\r\n                    </fill>\r\n                    <fill>\r\n                      <patternFill patternType=\"gray125\" />\r\n                    </fill>\r\n                  </fills>\r\n                  <borders count=\"1\">\r\n                    <border diagonalUp=\"0\" diagonalDown=\"0\">\r\n                      <left style=\"none\">\r\n                        <color rgb=\"FFC7C7C7\" />\r\n                      </left>\r\n                      <right style=\"none\">\r\n                        <color rgb=\"FFC7C7C7\" />\r\n                      </right>\r\n                      <top style=\"none\">\r\n                        <color rgb=\"FFC7C7C7\" />\r\n                      </top>\r\n                      <bottom style=\"none\">\r\n                        <color rgb=\"FFC7C7C7\" />\r\n                      </bottom>\r\n                    </border>\r\n                  </borders>\r\n                  <cellStyleXfs count=\"1\">\r\n                    <xf fontId=\"0\" fillId=\"0\" borderId=\"0\" numFmtId=\"0\">\r\n                      <alignment horizontal=\"general\" vertical=\"bottom\" wrapText=\"0\" shrinkToFit=\"0\" textRotation=\"0\"\r\n                        indent=\"0\" />\r\n                    </xf>\r\n                  </cellStyleXfs>\r\n                  <cellXfs count=\"3\">\r\n                    <xf applyAlignment=\"1\" applyBorder=\"1\" applyFont=\"1\" applyFill=\"1\" applyNumberFormat=\"1\" fontId=\"0\"\r\n                      fillId=\"0\" borderId=\"0\" numFmtId=\"0\" xfId=\"0\">\r\n                      <alignment horizontal=\"general\" vertical=\"bottom\" wrapText=\"0\" shrinkToFit=\"0\" textRotation=\"0\"\r\n                        indent=\"0\" />\r\n                    </xf>\r\n                    <xf applyAlignment=\"1\" applyBorder=\"1\" applyFont=\"1\" applyFill=\"1\" applyNumberFormat=\"1\" fontId=\"0\"\r\n                      fillId=\"0\" borderId=\"0\" numFmtId=\"100\" xfId=\"0\">\r\n                      <alignment horizontal=\"general\" vertical=\"bottom\" wrapText=\"0\" shrinkToFit=\"0\" textRotation=\"0\"\r\n                        indent=\"0\" />\r\n                    </xf>\r\n                    <xf applyAlignment=\"1\" applyBorder=\"1\" applyFont=\"1\" applyFill=\"1\" applyNumberFormat=\"1\" fontId=\"1\"\r\n                      fillId=\"0\" borderId=\"0\" numFmtId=\"0\" xfId=\"0\">\r\n                      <alignment horizontal=\"general\" vertical=\"bottom\" wrapText=\"0\" shrinkToFit=\"0\" textRotation=\"0\"\r\n                        indent=\"0\" />\r\n                    </xf>\r\n                  </cellXfs>\r\n                </styleSheet>\r\n";
},"77":function(container,depth0,helpers,partials,data,blockParams) {
    var stack1;

  return "                  <?xml version=\"1.0\" encoding=\"UTF-8\"?>\r\n                  <worksheet xmlns=\"http://schemas.openxmlformats.org/spreadsheetml/2006/main\"\r\n                    xmlns:r=\"http://schemas.openxmlformats.org/officeDocument/2006/relationships\">\r\n                    <sheetViews>\r\n                      <sheetView workbookViewId=\"0\" tabSelected=\"1\">\r\n                        <pane ySplit=\"1\" topLeftCell=\"A2\" activePane=\"bottomLeft\" state=\"frozen\" />\r\n                        <selection pane=\"bottomLeft\" activeCell=\"A2\" sqref=\"A2\" />\r\n                      </sheetView>\r\n                    </sheetViews>\r\n                    <sheetData>\r\n"
    + ((stack1 = helpers.each.call(depth0 != null ? depth0 : {},(depth0 != null ? depth0.list : depth0),{"name":"each","hash":{},"fn":container.program(78, data, 2, blockParams),"inverse":container.noop,"data":data,"blockParams":blockParams})) != null ? stack1 : "")
    + "                    </sheetData>\r\n                  </worksheet>\r\n";
},"78":function(container,depth0,helpers,partials,data,blockParams) {
    var stack1;

  return "                        <row r=\""
    + container.escapeExpression(container.lambda(blockParams[0][1], depth0))
    + "\">\r\n"
    + ((stack1 = helpers.each.call(depth0 != null ? depth0 : {},blockParams[0][0],{"name":"each","hash":{},"fn":container.program(79, data, 2, blockParams),"inverse":container.noop,"data":data,"blockParams":blockParams})) != null ? stack1 : "")
    + "                        </row>\r\n";
},"79":function(container,depth0,helpers,partials,data,blockParams) {
    var stack1;

  return ((stack1 = (helpers.eq || (depth0 && depth0.eq) || helpers.helperMissing).call(depth0 != null ? depth0 : {},((stack1 = blockParams[0][0]) != null ? stack1.type : stack1),"inlineStr",{"name":"eq","hash":{},"fn":container.program(80, data, 0, blockParams),"inverse":container.program(82, data, 0, blockParams),"data":data,"blockParams":blockParams})) != null ? stack1 : "");
},"80":function(container,depth0,helpers,partials,data,blockParams) {
    var stack1, alias1=container.lambda, alias2=container.escapeExpression;

  return "                              <c r=\""
    + alias2(alias1(blockParams[1][1], depth0))
    + alias2(alias1(blockParams[2][1], depth0))
    + "\" t=\""
    + alias2(alias1(((stack1 = blockParams[1][0]) != null ? stack1.type : stack1), depth0))
    + "\">\r\n                                <is>\r\n                                  <t>"
    + alias2(alias1(((stack1 = blockParams[1][0]) != null ? stack1.value : stack1), depth0))
    + "</t>\r\n                                </is>\r\n                              </c>\r\n";
},"82":function(container,depth0,helpers,partials,data,blockParams) {
    var stack1;

  return ((stack1 = (helpers.eq || (depth0 && depth0.eq) || helpers.helperMissing).call(depth0 != null ? depth0 : {},((stack1 = blockParams[1][0]) != null ? stack1.type : stack1),"d",{"name":"eq","hash":{},"fn":container.program(83, data, 0, blockParams),"inverse":container.program(85, data, 0, blockParams),"data":data,"blockParams":blockParams})) != null ? stack1 : "");
},"83":function(container,depth0,helpers,partials,data,blockParams) {
    var stack1, alias1=container.lambda, alias2=container.escapeExpression;

  return "                            <c r=\""
    + alias2(alias1(blockParams[2][1], depth0))
    + alias2(alias1(blockParams[3][1], depth0))
    + "\" s=\"1\">\r\n                              <v>"
    + alias2(alias1(((stack1 = blockParams[2][0]) != null ? stack1.value : stack1), depth0))
    + "</v>\r\n                            </c>\r\n";
},"85":function(container,depth0,helpers,partials,data,blockParams) {
    var stack1, alias1=container.lambda, alias2=container.escapeExpression;

  return "                            <c r=\""
    + alias2(alias1(blockParams[2][1], depth0))
    + alias2(alias1(blockParams[3][1], depth0))
    + "\" t=\""
    + alias2(alias1(((stack1 = blockParams[2][0]) != null ? stack1.type : stack1), depth0))
    + "\" "
    + ((stack1 = helpers["if"].call(depth0 != null ? depth0 : {},((stack1 = blockParams[2][0]) != null ? stack1.s : stack1),{"name":"if","hash":{},"fn":container.program(86, data, 0, blockParams),"inverse":container.noop,"data":data,"blockParams":blockParams})) != null ? stack1 : "")
    + ">\r\n                              <v>"
    + alias2(alias1(((stack1 = blockParams[2][0]) != null ? stack1.value : stack1), depth0))
    + "</v>\r\n                            </c>\r\n                            ";
},"86":function(container,depth0,helpers,partials,data,blockParams) {
    var stack1;

  return "s=\""
    + container.escapeExpression(container.lambda(((stack1 = blockParams[3][0]) != null ? stack1.s : stack1), depth0))
    + "\" ";
},"88":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = container.invokePartial(partials.buttons,depth0,{"name":"buttons","data":data,"indent":"                    ","helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "");
},"90":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = helpers["if"].call(depth0 != null ? depth0 : {},(data && data.single_button),{"name":"if","hash":{},"fn":container.program(91, data, 0),"inverse":container.program(93, data, 0),"data":data})) != null ? stack1 : "");
},"91":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = container.invokePartial(partials.single_button,depth0,{"name":"single_button","data":data,"indent":"                    ","helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "");
},"93":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = helpers["if"].call(depth0 != null ? depth0 : {},(data && data.xlsx_rels),{"name":"if","hash":{},"fn":container.program(94, data, 0),"inverse":container.program(96, data, 0),"data":data})) != null ? stack1 : "");
},"94":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = container.invokePartial(partials.xlsx_rels,depth0,{"name":"xlsx_rels","data":data,"indent":"                    ","helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "");
},"96":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = helpers["if"].call(depth0 != null ? depth0 : {},(data && data.xlsx_workbook_rels),{"name":"if","hash":{},"fn":container.program(97, data, 0),"inverse":container.program(99, data, 0),"data":data})) != null ? stack1 : "");
},"97":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = container.invokePartial(partials.xlsx_workbook_rels,depth0,{"name":"xlsx_workbook_rels","data":data,"indent":"                    ","helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "");
},"99":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = helpers["if"].call(depth0 != null ? depth0 : {},(data && data.xlsx_content_types),{"name":"if","hash":{},"fn":container.program(100, data, 0),"inverse":container.program(102, data, 0),"data":data})) != null ? stack1 : "");
},"100":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = container.invokePartial(partials.xlsx_content_types,depth0,{"name":"xlsx_content_types","data":data,"indent":"                    ","helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "");
},"102":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = helpers["if"].call(depth0 != null ? depth0 : {},(data && data.xlsx_styles),{"name":"if","hash":{},"fn":container.program(103, data, 0),"inverse":container.program(105, data, 0),"data":data})) != null ? stack1 : "");
},"103":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = container.invokePartial(partials.xlsx_styles,depth0,{"name":"xlsx_styles","data":data,"indent":"                    ","helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "");
},"105":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = helpers["if"].call(depth0 != null ? depth0 : {},(data && data.xlsx_workbook),{"name":"if","hash":{},"fn":container.program(106, data, 0),"inverse":container.program(108, data, 0),"data":data})) != null ? stack1 : "");
},"106":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = container.invokePartial(partials.xlsx_workbook,depth0,{"name":"xlsx_workbook","data":data,"indent":"                    ","helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "");
},"108":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = helpers["if"].call(depth0 != null ? depth0 : {},(data && data.xlsx_sheet),{"name":"if","hash":{},"fn":container.program(109, data, 0),"inverse":container.program(111, data, 0),"data":data})) != null ? stack1 : "");
},"109":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = container.invokePartial(partials.xlsx_sheet,depth0,{"name":"xlsx_sheet","data":data,"indent":"                    ","helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "\r\n";
},"111":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = container.invokePartial(partials.base,depth0,{"name":"base","data":data,"indent":"                    ","helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "                  ";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1;

  return "\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n"
    + ((stack1 = helpers["if"].call(depth0 != null ? depth0 : {},(data && data.buttons),{"name":"if","hash":{},"fn":container.program(88, data, 0, blockParams, depths),"inverse":container.program(90, data, 0, blockParams, depths),"data":data,"blockParams":blockParams})) != null ? stack1 : "");
},"main_d":  function(fn, props, container, depth0, data, blockParams, depths) {

  var decorators = container.decorators;

  fn = decorators.inline(fn,props,container,{"name":"inline","hash":{},"fn":container.program(1, data, 0, blockParams, depths),"inverse":container.noop,"args":["base"],"data":data,"blockParams":blockParams}) || fn;
  fn = decorators.inline(fn,props,container,{"name":"inline","hash":{},"fn":container.program(33, data, 0, blockParams, depths),"inverse":container.noop,"args":["row"],"data":data,"blockParams":blockParams}) || fn;
  fn = decorators.inline(fn,props,container,{"name":"inline","hash":{},"fn":container.program(36, data, 0, blockParams, depths),"inverse":container.noop,"args":["buttons"],"data":data,"blockParams":blockParams}) || fn;
  fn = decorators.inline(fn,props,container,{"name":"inline","hash":{},"fn":container.program(65, data, 0, blockParams, depths),"inverse":container.noop,"args":["single_button"],"data":data,"blockParams":blockParams}) || fn;
  fn = decorators.inline(fn,props,container,{"name":"inline","hash":{},"fn":container.program(67, data, 0, blockParams, depths),"inverse":container.noop,"args":["xlsx_rels"],"data":data,"blockParams":blockParams}) || fn;
  fn = decorators.inline(fn,props,container,{"name":"inline","hash":{},"fn":container.program(69, data, 0, blockParams, depths),"inverse":container.noop,"args":["xlsx_workbook_rels"],"data":data,"blockParams":blockParams}) || fn;
  fn = decorators.inline(fn,props,container,{"name":"inline","hash":{},"fn":container.program(71, data, 0, blockParams, depths),"inverse":container.noop,"args":["xlsx_content_types"],"data":data,"blockParams":blockParams}) || fn;
  fn = decorators.inline(fn,props,container,{"name":"inline","hash":{},"fn":container.program(73, data, 0, blockParams, depths),"inverse":container.noop,"args":["xlsx_workbook"],"data":data,"blockParams":blockParams}) || fn;
  fn = decorators.inline(fn,props,container,{"name":"inline","hash":{},"fn":container.program(75, data, 0, blockParams, depths),"inverse":container.noop,"args":["xlsx_styles"],"data":data,"blockParams":blockParams}) || fn;
  fn = decorators.inline(fn,props,container,{"name":"inline","hash":{},"fn":container.program(77, data, 0, blockParams, depths),"inverse":container.noop,"args":["xlsx_sheet"],"data":data,"blockParams":blockParams}) || fn;
  return fn;
  }

,"useDecorators":true,"usePartial":true,"useData":true,"useDepths":true,"useBlockParams":true});
templates['view/header'] = template({"1":function(container,depth0,helpers,partials,data) {
    var stack1, helper, options, alias1=depth0 != null ? depth0 : {}, buffer = 
  "  <section class=\"content-header float-header clearfix\">\r\n    <a href=\"#\" class=\"sidebar-toggle\" data-toggle=\"offcanvas\" role=\"button\">\r\n      <span class=\"sr-only\">Toggle navigation</span>\r\n    </a>\r\n"
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.icon : depth0),{"name":"if","hash":{},"fn":container.program(2, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "    <b ";
  stack1 = ((helper = (helper = helpers["title-i18n"] || (depth0 != null ? depth0["title-i18n"] : depth0)) != null ? helper : helpers.helperMissing),(options={"name":"title-i18n","hash":{},"fn":container.program(4, data, 0),"inverse":container.noop,"data":data}),(typeof helper === "function" ? helper.call(alias1,options) : helper));
  if (!helpers["title-i18n"]) { stack1 = helpers.blockHelperMissing.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer + ">\r\n    </b>\r\n    <div class=\"navbar-custom-menu\">\r\n"
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.buttons : depth0),{"name":"if","hash":{},"fn":container.program(6, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "    </div>\r\n  </section>\r\n";
},"2":function(container,depth0,helpers,partials,data) {
    var helper;

  return "      <i class=\""
    + container.escapeExpression(((helper = (helper = helpers.icon || (depth0 != null ? depth0.icon : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"icon","hash":{},"data":data}) : helper)))
    + "\"></i>\r\n";
},"4":function(container,depth0,helpers,partials,data) {
    return "data-i18n=\""
    + container.escapeExpression(container.lambda(depth0, depth0))
    + "\" ";
},"6":function(container,depth0,helpers,partials,data) {
    var stack1, helper, options, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=helpers.blockHelperMissing, buffer = 
  "        <div class=\"dropdown header-button visible-xs\">\r\n          <a class=\"text-center\" aria-expanded=\"true\" href=\"#\" data-toggle=\"dropdown\">\r\n            <i class=\"fa fa-chevron-down\"></i>\r\n          </a>\r\n          <ul class=\"dropdown-menu dropdown-menu-right\" style=\"width: auto;\">\r\n            <li class=\"header hidden\"></li>\r\n            <li>\r\n              <div style=\"position: relative; overflow: hidden; width: auto;\" class=\"slimScrollDiv\">\r\n                <ul style=\"overflow: hidden; width: 100%;\" class=\"header-small-menu\">\r\n";
  stack1 = ((helper = (helper = helpers.buttons || (depth0 != null ? depth0.buttons : depth0)) != null ? helper : alias2),(options={"name":"buttons","hash":{},"fn":container.program(7, data, 0),"inverse":container.noop,"data":data}),(typeof helper === alias3 ? helper.call(alias1,options) : helper));
  if (!helpers.buttons) { stack1 = alias4.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  buffer += "                </ul>\r\n              </div>\r\n            </li>\r\n            <li class=\"footer hidden\"></li>\r\n          </ul>\r\n        </div>\r\n        <ul class=\"nav navbar-nav buttons hidden-xs\">\r\n";
  stack1 = ((helper = (helper = helpers.buttons || (depth0 != null ? depth0.buttons : depth0)) != null ? helper : alias2),(options={"name":"buttons","hash":{},"fn":container.program(9, data, 0),"inverse":container.noop,"data":data}),(typeof helper === alias3 ? helper.call(alias1,options) : helper));
  if (!helpers.buttons) { stack1 = alias4.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer + "        </ul>\r\n";
},"7":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = container.invokePartial(partials["list-button"],depth0,{"name":"list-button","data":data,"indent":"                    ","helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "");
},"9":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = container.invokePartial(partials["big-button"],depth0,{"name":"big-button","data":data,"indent":"            ","helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "");
},"11":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = helpers["if"].call(depth0 != null ? depth0 : {},(depth0 != null ? depth0.buttons : depth0),{"name":"if","hash":{},"fn":container.program(12, data, 0),"inverse":container.program(26, data, 0),"data":data})) != null ? stack1 : "");
},"12":function(container,depth0,helpers,partials,data) {
    var stack1, helper, options, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", buffer = 
  "      <li data-id=\""
    + container.escapeExpression(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"id","hash":{},"data":data}) : helper)))
    + "\" class=\"dropdown messages-menu header-button ";
  stack1 = ((helper = (helper = helpers.permissions || (depth0 != null ? depth0.permissions : depth0)) != null ? helper : alias2),(options={"name":"permissions","hash":{},"fn":container.program(13, data, 0),"inverse":container.noop,"data":data}),(typeof helper === alias3 ? helper.call(alias1,options) : helper));
  if (!helpers.permissions) { stack1 = helpers.blockHelperMissing.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer + "\"\r\n        "
    + ((stack1 = helpers.each.call(alias1,(depth0 != null ? depth0.permissions : depth0),{"name":"each","hash":{},"fn":container.program(15, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\r\n        "
    + ((stack1 = helpers.each.call(alias1,(depth0 != null ? depth0.errors : depth0),{"name":"each","hash":{},"fn":container.program(17, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + ">\r\n        <a class=\"text-center\" aria-expanded=\"true\" href=\"#\" data-toggle=\"dropdown\">\r\n"
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.icon : depth0),{"name":"if","hash":{},"fn":container.program(19, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "          <span class=\"\">\r\n              <span "
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0["title-i18n"] : depth0),{"name":"if","hash":{},"fn":container.program(21, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "></span><i class=\"fa\"></i>\r\n          </span>\r\n        </a>\r\n        <ul class=\"dropdown-menu dropdown-menu-inline\" style=\"width: auto;\">\r\n          <li class=\"header hidden\"></li>\r\n          <li>\r\n            <div style=\"position: relative; overflow: hidden; width: auto;\" class=\"slimScrollDiv\">\r\n              <ul style=\"overflow: hidden; width: 100%;\" class=\"menu header-small-menu\">\r\n"
    + ((stack1 = helpers.each.call(alias1,(depth0 != null ? depth0.buttons : depth0),{"name":"each","hash":{},"fn":container.program(23, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "              </ul>\r\n            </div>\r\n          </li>\r\n          <li class=\"footer hidden\">\r\n            <a href=\"#\"></a>\r\n          </li>\r\n        </ul>\r\n      </li>\r\n";
},"13":function(container,depth0,helpers,partials,data) {
    return "has-permissions";
},"15":function(container,depth0,helpers,partials,data) {
    var helper, alias1=container.escapeExpression;

  return "data-permission-"
    + alias1(((helper = (helper = helpers.key || (data && data.key)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"key","hash":{},"data":data}) : helper)))
    + "=\""
    + alias1(container.lambda(depth0, depth0))
    + "\" ";
},"17":function(container,depth0,helpers,partials,data) {
    var helper, alias1=container.escapeExpression;

  return "data-error-"
    + alias1(((helper = (helper = helpers.key || (data && data.key)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"key","hash":{},"data":data}) : helper)))
    + "=\""
    + alias1(container.lambda(depth0, depth0))
    + "\" ";
},"19":function(container,depth0,helpers,partials,data) {
    var helper;

  return "            <i class=\""
    + container.escapeExpression(((helper = (helper = helpers.icon || (depth0 != null ? depth0.icon : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"icon","hash":{},"data":data}) : helper)))
    + "\"></i>\r\n";
},"21":function(container,depth0,helpers,partials,data) {
    var helper;

  return " data-i18n=\""
    + container.escapeExpression(((helper = (helper = helpers["title-i18n"] || (depth0 != null ? depth0["title-i18n"] : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"title-i18n","hash":{},"data":data}) : helper)))
    + "\" ";
},"23":function(container,depth0,helpers,partials,data) {
    var stack1, helper, options, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression, alias5=helpers.blockHelperMissing, buffer = 
  "                  <li data-id=\""
    + alias4(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"id","hash":{},"data":data}) : helper)))
    + "\" class=\"header-button ";
  stack1 = ((helper = (helper = helpers.permissions || (depth0 != null ? depth0.permissions : depth0)) != null ? helper : alias2),(options={"name":"permissions","hash":{},"fn":container.program(13, data, 0),"inverse":container.noop,"data":data}),(typeof helper === alias3 ? helper.call(alias1,options) : helper));
  if (!helpers.permissions) { stack1 = alias5.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  buffer += "\"\r\n                    "
    + ((stack1 = helpers.each.call(alias1,(depth0 != null ? depth0.permissions : depth0),{"name":"each","hash":{},"fn":container.program(15, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\r\n                    "
    + ((stack1 = helpers.each.call(alias1,(depth0 != null ? depth0.errors : depth0),{"name":"each","hash":{},"fn":container.program(17, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "data-btn-action=\""
    + alias4(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"id","hash":{},"data":data}) : helper)))
    + "\">\r\n                    <a class=\"text-center\" href=\"#\">\r\n"
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.icon : depth0),{"name":"if","hash":{},"fn":container.program(24, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "                      <span>\r\n                        <span ";
  stack1 = ((helper = (helper = helpers["title-i18n"] || (depth0 != null ? depth0["title-i18n"] : depth0)) != null ? helper : alias2),(options={"name":"title-i18n","hash":{},"fn":container.program(4, data, 0),"inverse":container.noop,"data":data}),(typeof helper === alias3 ? helper.call(alias1,options) : helper));
  if (!helpers["title-i18n"]) { stack1 = alias5.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer + "></span>\r\n                      </span>\r\n                    </a>\r\n                  </li>\r\n";
},"24":function(container,depth0,helpers,partials,data) {
    var helper;

  return "                        <i class=\""
    + container.escapeExpression(((helper = (helper = helpers.icon || (depth0 != null ? depth0.icon : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"icon","hash":{},"data":data}) : helper)))
    + "\"></i>\r\n";
},"26":function(container,depth0,helpers,partials,data) {
    var stack1, helper, options, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression, alias5=helpers.blockHelperMissing, buffer = 
  "      <li data-id=\""
    + alias4(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"id","hash":{},"data":data}) : helper)))
    + "\" class=\"header-button ";
  stack1 = ((helper = (helper = helpers.permissions || (depth0 != null ? depth0.permissions : depth0)) != null ? helper : alias2),(options={"name":"permissions","hash":{},"fn":container.program(13, data, 0),"inverse":container.noop,"data":data}),(typeof helper === alias3 ? helper.call(alias1,options) : helper));
  if (!helpers.permissions) { stack1 = alias5.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  buffer += "\"\r\n        "
    + ((stack1 = helpers.each.call(alias1,(depth0 != null ? depth0.permissions : depth0),{"name":"each","hash":{},"fn":container.program(15, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\r\n        "
    + ((stack1 = helpers.each.call(alias1,(depth0 != null ? depth0.errors : depth0),{"name":"each","hash":{},"fn":container.program(17, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "data-btn-action=\""
    + alias4(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"id","hash":{},"data":data}) : helper)))
    + "\">\r\n        <a class=\"text-center\" href=\"#\">\r\n"
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.icon : depth0),{"name":"if","hash":{},"fn":container.program(19, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "          <span>\r\n              <span ";
  stack1 = ((helper = (helper = helpers["title-i18n"] || (depth0 != null ? depth0["title-i18n"] : depth0)) != null ? helper : alias2),(options={"name":"title-i18n","hash":{},"fn":container.program(27, data, 0),"inverse":container.noop,"data":data}),(typeof helper === alias3 ? helper.call(alias1,options) : helper));
  if (!helpers["title-i18n"]) { stack1 = alias5.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer + "></span>\r\n          </span>\r\n        </a>\r\n      </li>\r\n";
},"27":function(container,depth0,helpers,partials,data) {
    return " data-i18n=\""
    + container.escapeExpression(container.lambda(depth0, depth0))
    + "\" ";
},"29":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = helpers["if"].call(depth0 != null ? depth0 : {},(depth0 != null ? depth0.buttons : depth0),{"name":"if","hash":{},"fn":container.program(30, data, 0),"inverse":container.program(36, data, 0),"data":data})) != null ? stack1 : "");
},"30":function(container,depth0,helpers,partials,data) {
    var stack1, helper, options, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", buffer = 
  "        <li data-id=\""
    + container.escapeExpression(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"id","hash":{},"data":data}) : helper)))
    + "\" class=\"dropdown header-button ";
  stack1 = ((helper = (helper = helpers.permissions || (depth0 != null ? depth0.permissions : depth0)) != null ? helper : alias2),(options={"name":"permissions","hash":{},"fn":container.program(13, data, 0),"inverse":container.noop,"data":data}),(typeof helper === alias3 ? helper.call(alias1,options) : helper));
  if (!helpers.permissions) { stack1 = helpers.blockHelperMissing.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer + "\"\r\n          "
    + ((stack1 = helpers.each.call(alias1,(depth0 != null ? depth0.permissions : depth0),{"name":"each","hash":{},"fn":container.program(15, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\r\n          "
    + ((stack1 = helpers.each.call(alias1,(depth0 != null ? depth0.errors : depth0),{"name":"each","hash":{},"fn":container.program(17, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + ">\r\n          <a class=\"text-center\" aria-expanded=\"true\" href=\"#\" data-toggle=\"dropdown\">\r\n"
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.icon : depth0),{"name":"if","hash":{},"fn":container.program(31, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "            <p class=\"\">\r\n                <span "
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0["title-i18n"] : depth0),{"name":"if","hash":{},"fn":container.program(21, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "></span><i class=\"fa\"></i>\r\n            </p>\r\n          </a>\r\n          <ul class=\"dropdown-menu dropdown-menu-right\" style=\"width: auto;\">\r\n            <li class=\"header hidden\"></li>\r\n            <li>\r\n              <div style=\"position: relative; overflow: hidden; width: auto;\" class=\"slimScrollDiv\">\r\n                <ul style=\"overflow: hidden; width: 100%;\" class=\"menu header-small-menu\">\r\n"
    + ((stack1 = helpers.each.call(alias1,(depth0 != null ? depth0.buttons : depth0),{"name":"each","hash":{},"fn":container.program(33, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "                </ul>\r\n              </div>\r\n            </li>\r\n            <li class=\"footer hidden\">\r\n              <a href=\"#\"></a>\r\n            </li>\r\n          </ul>\r\n        </li>\r\n";
},"31":function(container,depth0,helpers,partials,data) {
    var helper;

  return "              <i class=\""
    + container.escapeExpression(((helper = (helper = helpers.icon || (depth0 != null ? depth0.icon : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"icon","hash":{},"data":data}) : helper)))
    + "\"></i>\r\n";
},"33":function(container,depth0,helpers,partials,data) {
    var stack1, helper, options, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression, alias5=helpers.blockHelperMissing, buffer = 
  "                    <li data-id=\""
    + alias4(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"id","hash":{},"data":data}) : helper)))
    + "\" class=\"header-button ";
  stack1 = ((helper = (helper = helpers.permissions || (depth0 != null ? depth0.permissions : depth0)) != null ? helper : alias2),(options={"name":"permissions","hash":{},"fn":container.program(13, data, 0),"inverse":container.noop,"data":data}),(typeof helper === alias3 ? helper.call(alias1,options) : helper));
  if (!helpers.permissions) { stack1 = alias5.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  buffer += "\"\r\n                      "
    + ((stack1 = helpers.each.call(alias1,(depth0 != null ? depth0.permissions : depth0),{"name":"each","hash":{},"fn":container.program(15, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\r\n                      "
    + ((stack1 = helpers.each.call(alias1,(depth0 != null ? depth0.errors : depth0),{"name":"each","hash":{},"fn":container.program(17, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "data-btn-action=\""
    + alias4(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"id","hash":{},"data":data}) : helper)))
    + "\">\r\n                      <a class=\"text-center\" href=\"#\">\r\n"
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.icon : depth0),{"name":"if","hash":{},"fn":container.program(34, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "                        <span>\r\n                            <span ";
  stack1 = ((helper = (helper = helpers["title-i18n"] || (depth0 != null ? depth0["title-i18n"] : depth0)) != null ? helper : alias2),(options={"name":"title-i18n","hash":{},"fn":container.program(27, data, 0),"inverse":container.noop,"data":data}),(typeof helper === alias3 ? helper.call(alias1,options) : helper));
  if (!helpers["title-i18n"]) { stack1 = alias5.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer + "></span>\r\n                        </span>\r\n                      </a>\r\n                    </li>\r\n";
},"34":function(container,depth0,helpers,partials,data) {
    var helper;

  return "                          <i class=\""
    + container.escapeExpression(((helper = (helper = helpers.icon || (depth0 != null ? depth0.icon : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"icon","hash":{},"data":data}) : helper)))
    + "\"></i>\r\n";
},"36":function(container,depth0,helpers,partials,data) {
    var stack1, helper, options, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression, alias5=helpers.blockHelperMissing, buffer = 
  "        <li data-id=\""
    + alias4(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"id","hash":{},"data":data}) : helper)))
    + "\" class=\"header-button ";
  stack1 = ((helper = (helper = helpers.permissions || (depth0 != null ? depth0.permissions : depth0)) != null ? helper : alias2),(options={"name":"permissions","hash":{},"fn":container.program(13, data, 0),"inverse":container.noop,"data":data}),(typeof helper === alias3 ? helper.call(alias1,options) : helper));
  if (!helpers.permissions) { stack1 = alias5.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  buffer += "\"\r\n          "
    + ((stack1 = helpers.each.call(alias1,(depth0 != null ? depth0.permissions : depth0),{"name":"each","hash":{},"fn":container.program(15, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\r\n          "
    + ((stack1 = helpers.each.call(alias1,(depth0 != null ? depth0.errors : depth0),{"name":"each","hash":{},"fn":container.program(17, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "data-btn-action=\""
    + alias4(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"id","hash":{},"data":data}) : helper)))
    + "\">\r\n          <a class=\"text-center\" href=\"#\">\r\n"
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.icon : depth0),{"name":"if","hash":{},"fn":container.program(31, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "            <p class=\"hidden-xs\">\r\n                <span ";
  stack1 = ((helper = (helper = helpers["title-i18n"] || (depth0 != null ? depth0["title-i18n"] : depth0)) != null ? helper : alias2),(options={"name":"title-i18n","hash":{},"fn":container.program(27, data, 0),"inverse":container.noop,"data":data}),(typeof helper === alias3 ? helper.call(alias1,options) : helper));
  if (!helpers["title-i18n"]) { stack1 = alias5.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer + "></span>\r\n            </p>\r\n          </a>\r\n        </li>\r\n";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1;

  return "\r\n\r\n\r\n\r\n\r\n"
    + ((stack1 = container.invokePartial(partials.base,depth0,{"name":"base","data":data,"indent":"      ","helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "");
},"main_d":  function(fn, props, container, depth0, data, blockParams, depths) {

  var decorators = container.decorators;

  fn = decorators.inline(fn,props,container,{"name":"inline","hash":{},"fn":container.program(1, data, 0, blockParams, depths),"inverse":container.noop,"args":["base"],"data":data}) || fn;
  fn = decorators.inline(fn,props,container,{"name":"inline","hash":{},"fn":container.program(11, data, 0, blockParams, depths),"inverse":container.noop,"args":["list-button"],"data":data}) || fn;
  fn = decorators.inline(fn,props,container,{"name":"inline","hash":{},"fn":container.program(29, data, 0, blockParams, depths),"inverse":container.noop,"args":["big-button"],"data":data}) || fn;
  return fn;
  }

,"useDecorators":true,"usePartial":true,"useData":true,"useDepths":true});
templates['view/menu'] = template({"1":function(container,depth0,helpers,partials,data) {
    var stack1, helper, options, buffer = 
  "  <ul class=\"sidebar-menu\">\r\n";
  stack1 = ((helper = (helper = helpers.items || (depth0 != null ? depth0.items : depth0)) != null ? helper : helpers.helperMissing),(options={"name":"items","hash":{},"fn":container.program(2, data, 0),"inverse":container.noop,"data":data}),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},options) : helper));
  if (!helpers.items) { stack1 = helpers.blockHelperMissing.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer + "  </ul>\r\n";
},"2":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = container.invokePartial(partials.item,depth0,{"name":"item","data":data,"indent":"      ","helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "");
},"4":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "    <li id=\"menuItem_"
    + alias4(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"id","hash":{},"data":data}) : helper)))
    + "\" "
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.children : depth0),{"name":"if","hash":{},"fn":container.program(5, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + ">\r\n      <a href=\"#"
    + alias4((helpers.getUrl || (depth0 && depth0.getUrl) || alias2).call(alias1,(depth0 != null ? depth0.id : depth0),{"name":"getUrl","hash":{},"data":data}))
    + "/\" data-id=\""
    + alias4(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"id","hash":{},"data":data}) : helper)))
    + "\" data-view=\""
    + alias4((helpers.getUrl || (depth0 && depth0.getUrl) || alias2).call(alias1,(depth0 != null ? depth0.id : depth0),{"name":"getUrl","hash":{},"data":data}))
    + "\">\r\n\r\n"
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.icon : depth0),{"name":"if","hash":{},"fn":container.program(7, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\r\n        <span data-i18n=\""
    + alias4(((helper = (helper = helpers.i18n || (depth0 != null ? depth0.i18n : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"i18n","hash":{},"data":data}) : helper)))
    + "\"></span>\r\n\r\n"
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.children : depth0),{"name":"if","hash":{},"fn":container.program(9, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "      </a>\r\n"
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.children : depth0),{"name":"if","hash":{},"fn":container.program(11, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "    </li>\r\n";
},"5":function(container,depth0,helpers,partials,data) {
    return "class=\"treeview\" ";
},"7":function(container,depth0,helpers,partials,data) {
    var helper;

  return "          <i class=\""
    + container.escapeExpression(((helper = (helper = helpers.icon || (depth0 != null ? depth0.icon : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"icon","hash":{},"data":data}) : helper)))
    + "\"></i>\r\n";
},"9":function(container,depth0,helpers,partials,data) {
    return "          <i class=\"fa fa-angle-left pull-right\"></i>\r\n";
},"11":function(container,depth0,helpers,partials,data) {
    var stack1, helper, options, buffer = 
  "        <ul class=\"treeview-menu\">\r\n";
  stack1 = ((helper = (helper = helpers.children || (depth0 != null ? depth0.children : depth0)) != null ? helper : helpers.helperMissing),(options={"name":"children","hash":{},"fn":container.program(12, data, 0),"inverse":container.noop,"data":data}),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},options) : helper));
  if (!helpers.children) { stack1 = helpers.blockHelperMissing.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer + "        </ul>\r\n";
},"12":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = container.invokePartial(partials.item,depth0,{"name":"item","data":data,"indent":"            ","helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "");
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1;

  return "\r\n\r\n"
    + ((stack1 = container.invokePartial(partials.base,depth0,{"name":"base","data":data,"indent":"    ","helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "");
},"main_d":  function(fn, props, container, depth0, data, blockParams, depths) {

  var decorators = container.decorators;

  fn = decorators.inline(fn,props,container,{"name":"inline","hash":{},"fn":container.program(1, data, 0, blockParams, depths),"inverse":container.noop,"args":["base"],"data":data}) || fn;
  fn = decorators.inline(fn,props,container,{"name":"inline","hash":{},"fn":container.program(4, data, 0, blockParams, depths),"inverse":container.noop,"args":["item"],"data":data}) || fn;
  return fn;
  }

,"useDecorators":true,"usePartial":true,"useData":true,"useDepths":true});
templates['view/tabs'] = template({"1":function(container,depth0,helpers,partials,data) {
    var helper;

  return "  <div class=\"nav-tabs-custom\">\r\n    <ul id=\""
    + container.escapeExpression(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"id","hash":{},"data":data}) : helper)))
    + "\" class=\"nav nav-tabs\">\r\n    </ul>\r\n    <div class=\"tab-content\">\r\n    </div>\r\n  </div>\r\n";
},"3":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "  <li class=\"\">\r\n    <a aria-expanded=\"false\" class=\"tab-title\" id=\"tab-"
    + alias4(((helper = (helper = helpers.timestamp || (depth0 != null ? depth0.timestamp : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"timestamp","hash":{},"data":data}) : helper)))
    + "-label-"
    + alias4(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"name","hash":{},"data":data}) : helper)))
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.tid : depth0),{"name":"if","hash":{},"fn":container.program(4, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\" href=\"#tab-"
    + alias4(((helper = (helper = helpers.timestamp || (depth0 != null ? depth0.timestamp : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"timestamp","hash":{},"data":data}) : helper)))
    + "-"
    + alias4(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"name","hash":{},"data":data}) : helper)))
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.tid : depth0),{"name":"if","hash":{},"fn":container.program(4, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\" data-toggle=\"tab\">\r\n      <i class=\"fa fa-fw fa-exclamation-triangle error\"></i>\r\n      <i class=\"fa fa-fw fa-spin fa-circle-o-notch\"></i>\r\n      <span class=\"title\" "
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0["title-i18n"] : depth0),{"name":"if","hash":{},"fn":container.program(6, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + ">\r\n        &nbsp;\r\n        "
    + alias4(((helper = (helper = helpers.title || (depth0 != null ? depth0.title : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"title","hash":{},"data":data}) : helper)))
    + "\r\n        &nbsp;\r\n      </span>\r\n"
    + ((stack1 = helpers.unless.call(alias1,(depth0 != null ? depth0.cantClose : depth0),{"name":"unless","hash":{},"fn":container.program(8, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "    </a>\r\n  </li>\r\n";
},"4":function(container,depth0,helpers,partials,data) {
    return "-"
    + container.escapeExpression((helpers.escape || (depth0 && depth0.escape) || helpers.helperMissing).call(depth0 != null ? depth0 : {},(depth0 != null ? depth0.tid : depth0),{"name":"escape","hash":{},"data":data}));
},"6":function(container,depth0,helpers,partials,data) {
    var helper;

  return "data-i18n=\""
    + container.escapeExpression(((helper = (helper = helpers["title-i18n"] || (depth0 != null ? depth0["title-i18n"] : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"title-i18n","hash":{},"data":data}) : helper)))
    + "\"";
},"8":function(container,depth0,helpers,partials,data) {
    return "        <i class=\"fa fa-fw  close-icon\">\r\n        </i>\r\n";
},"10":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "  <div class=\"tab-pane\" id=\"tab-"
    + alias4(((helper = (helper = helpers.timestamp || (depth0 != null ? depth0.timestamp : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"timestamp","hash":{},"data":data}) : helper)))
    + "-"
    + alias4(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"name","hash":{},"data":data}) : helper)))
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.tid : depth0),{"name":"if","hash":{},"fn":container.program(4, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\">\r\n  </div>\r\n";
},"12":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = container.invokePartial(partials.label,depth0,{"name":"label","data":data,"indent":"  ","helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "");
},"14":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = helpers["if"].call(depth0 != null ? depth0 : {},(data && data.tab),{"name":"if","hash":{},"fn":container.program(15, data, 0),"inverse":container.program(17, data, 0),"data":data})) != null ? stack1 : "");
},"15":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = container.invokePartial(partials.tab,depth0,{"name":"tab","data":data,"indent":"  ","helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "");
},"17":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = container.invokePartial(partials.base,depth0,{"name":"base","data":data,"indent":"  ","helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "");
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1;

  return "\r\n\r\n\r\n"
    + ((stack1 = helpers["if"].call(depth0 != null ? depth0 : {},(data && data.label),{"name":"if","hash":{},"fn":container.program(12, data, 0, blockParams, depths),"inverse":container.program(14, data, 0, blockParams, depths),"data":data})) != null ? stack1 : "");
},"main_d":  function(fn, props, container, depth0, data, blockParams, depths) {

  var decorators = container.decorators;

  fn = decorators.inline(fn,props,container,{"name":"inline","hash":{},"fn":container.program(1, data, 0, blockParams, depths),"inverse":container.noop,"args":["base"],"data":data}) || fn;
  fn = decorators.inline(fn,props,container,{"name":"inline","hash":{},"fn":container.program(3, data, 0, blockParams, depths),"inverse":container.noop,"args":["label"],"data":data}) || fn;
  fn = decorators.inline(fn,props,container,{"name":"inline","hash":{},"fn":container.program(10, data, 0, blockParams, depths),"inverse":container.noop,"args":["tab"],"data":data}) || fn;
  return fn;
  }

,"useDecorators":true,"usePartial":true,"useData":true,"useDepths":true});
templates['view/view'] = template({"1":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "  <div class=\"header-wrapper\">\r\n  </div>\r\n  <div class=\"view-content"
    + ((stack1 = helpers["if"].call(depth0 != null ? depth0 : {},(depth0 != null ? depth0.noTabs : depth0),{"name":"if","hash":{},"fn":container.program(2, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\">\r\n  </div>\r\n";
},"2":function(container,depth0,helpers,partials,data) {
    return " no-tabs";
},"4":function(container,depth0,helpers,partials,data) {
    var stack1, helper, options, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=helpers.blockHelperMissing, buffer = 
  "  <div class=\"box-body\" ";
  stack1 = ((helper = (helper = helpers.maxWidth || (depth0 != null ? depth0.maxWidth : depth0)) != null ? helper : alias2),(options={"name":"maxWidth","hash":{},"fn":container.program(5, data, 0),"inverse":container.noop,"data":data}),(typeof helper === alias3 ? helper.call(alias1,options) : helper));
  if (!helpers.maxWidth) { stack1 = alias4.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  buffer += ">\r\n";
  stack1 = ((helper = (helper = helpers["content-responsive"] || (depth0 != null ? depth0["content-responsive"] : depth0)) != null ? helper : alias2),(options={"name":"content-responsive","hash":{},"fn":container.program(7, data, 0),"inverse":container.noop,"data":data}),(typeof helper === alias3 ? helper.call(alias1,options) : helper));
  if (!helpers["content-responsive"]) { stack1 = alias4.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer + "  </div>\r\n";
},"5":function(container,depth0,helpers,partials,data) {
    var helper;

  return "style=\"max-width:"
    + container.escapeExpression(((helper = (helper = helpers.maxWidth || (depth0 != null ? depth0.maxWidth : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"maxWidth","hash":{},"data":data}) : helper)))
    + "\"";
},"7":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "      <div class=\"row\">\r\n"
    + ((stack1 = container.invokePartial(partials["content-inner"],depth0,{"name":"content-inner","data":data,"indent":"        ","helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "      </div>\r\n";
},"9":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = helpers.blockHelperMissing.call(depth0,container.lambda(depth0, depth0),{"name":".","hash":{},"fn":container.program(10, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "");
},"10":function(container,depth0,helpers,partials,data) {
    var stack1, helper, options, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=helpers.blockHelperMissing, buffer = 
  "    <div class=\"";
  stack1 = ((helper = (helper = helpers.xs || (depth0 != null ? depth0.xs : depth0)) != null ? helper : alias2),(options={"name":"xs","hash":{},"fn":container.program(11, data, 0),"inverse":container.noop,"data":data}),(typeof helper === alias3 ? helper.call(alias1,options) : helper));
  if (!helpers.xs) { stack1 = alias4.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  stack1 = ((helper = (helper = helpers.sm || (depth0 != null ? depth0.sm : depth0)) != null ? helper : alias2),(options={"name":"sm","hash":{},"fn":container.program(13, data, 0),"inverse":container.noop,"data":data}),(typeof helper === alias3 ? helper.call(alias1,options) : helper));
  if (!helpers.sm) { stack1 = alias4.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  stack1 = ((helper = (helper = helpers.md || (depth0 != null ? depth0.md : depth0)) != null ? helper : alias2),(options={"name":"md","hash":{},"fn":container.program(15, data, 0),"inverse":container.noop,"data":data}),(typeof helper === alias3 ? helper.call(alias1,options) : helper));
  if (!helpers.md) { stack1 = alias4.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  stack1 = ((helper = (helper = helpers.lg || (depth0 != null ? depth0.lg : depth0)) != null ? helper : alias2),(options={"name":"lg","hash":{},"fn":container.program(17, data, 0),"inverse":container.noop,"data":data}),(typeof helper === alias3 ? helper.call(alias1,options) : helper));
  if (!helpers.lg) { stack1 = alias4.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  buffer += "\">\r\n\r\n";
  stack1 = ((helper = (helper = helpers.components || (depth0 != null ? depth0.components : depth0)) != null ? helper : alias2),(options={"name":"components","hash":{},"fn":container.program(19, data, 0),"inverse":container.noop,"data":data}),(typeof helper === alias3 ? helper.call(alias1,options) : helper));
  if (!helpers.components) { stack1 = alias4.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer + "    </div>\r\n";
},"11":function(container,depth0,helpers,partials,data) {
    return "col-xs-"
    + container.escapeExpression(container.lambda(depth0, depth0))
    + " ";
},"13":function(container,depth0,helpers,partials,data) {
    return "col-sm-"
    + container.escapeExpression(container.lambda(depth0, depth0))
    + " ";
},"15":function(container,depth0,helpers,partials,data) {
    return "col-md-"
    + container.escapeExpression(container.lambda(depth0, depth0))
    + " ";
},"17":function(container,depth0,helpers,partials,data) {
    return "col-lg-"
    + container.escapeExpression(container.lambda(depth0, depth0))
    + " ";
},"19":function(container,depth0,helpers,partials,data) {
    return "        <div data-component=\""
    + container.escapeExpression(container.lambda(depth0, depth0))
    + "\" class=\" component\"></div>\r\n";
},"21":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1;

  return ((stack1 = helpers["if"].call(depth0 != null ? depth0 : {},(depth0 != null ? depth0["content-tabs"] : depth0),{"name":"if","hash":{},"fn":container.program(22, data, 0, blockParams, depths),"inverse":container.program(31, data, 0, blockParams, depths),"data":data})) != null ? stack1 : "")
    + "  \r\n";
},"22":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1, helper, options, buffer = "";

  stack1 = ((helper = (helper = helpers.getUniqueId || (depth0 != null ? depth0.getUniqueId : depth0)) != null ? helper : helpers.helperMissing),(options={"name":"getUniqueId","hash":{},"fn":container.program(23, data, 0, blockParams, depths),"inverse":container.noop,"data":data}),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},options) : helper));
  if (!helpers.getUniqueId) { stack1 = helpers.blockHelperMissing.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer;
},"23":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1, helper, alias1=depth0 != null ? depth0 : {};

  return "      <div class=\"nav-tabs-custom content-tabs\">\r\n        <ul id=\"tablist_"
    + container.escapeExpression(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(alias1,{"name":"id","hash":{},"data":data}) : helper)))
    + "\" class=\"nav nav-tabs\">\r\n"
    + ((stack1 = helpers.each.call(alias1,(depth0 != null ? depth0["content-tabs"] : depth0),{"name":"each","hash":{},"fn":container.program(24, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "        </ul>\r\n        <div class=\"tab-content\">\r\n"
    + ((stack1 = helpers.each.call(alias1,(depth0 != null ? depth0["content-tabs"] : depth0),{"name":"each","hash":{},"fn":container.program(29, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "        </div>\r\n      </div>\r\n";
},"24":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1, helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "            <li class=\"innerTab"
    + ((stack1 = (helpers.eq || (depth0 && depth0.eq) || alias2).call(alias1,(data && data.index),0,{"name":"eq","hash":{},"fn":container.program(25, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\">\r\n              <a aria-expanded=\"false\"\r\n                "
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0["title-i18n"] : depth0),{"name":"if","hash":{},"fn":container.program(27, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\r\n                href=\"#"
    + alias4(((helper = (helper = helpers.randomId || (data && data.randomId)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"randomId","hash":{},"data":data}) : helper)))
    + "_"
    + alias4((helpers.escape || (depth0 && depth0.escape) || alias2).call(alias1,(depths[1] != null ? depths[1].id : depths[1]),{"name":"escape","hash":{},"data":data}))
    + "_"
    + alias4(((helper = (helper = helpers.index || (data && data.index)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"index","hash":{},"data":data}) : helper)))
    + "\"\r\n                data-toggle=\"tab\">"
    + alias4(((helper = (helper = helpers.title || (depth0 != null ? depth0.title : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"title","hash":{},"data":data}) : helper)))
    + "\r\n              </a>\r\n            </li>\r\n";
},"25":function(container,depth0,helpers,partials,data) {
    return " active";
},"27":function(container,depth0,helpers,partials,data) {
    var helper;

  return "data-i18n=\""
    + container.escapeExpression(((helper = (helper = helpers["title-i18n"] || (depth0 != null ? depth0["title-i18n"] : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"title-i18n","hash":{},"data":data}) : helper)))
    + "\"";
},"29":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1, helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "            <div class=\"tab-pane"
    + ((stack1 = (helpers.eq || (depth0 && depth0.eq) || alias2).call(alias1,(data && data.index),0,{"name":"eq","hash":{},"fn":container.program(25, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\" id=\""
    + alias4(((helper = (helper = helpers.randomId || (data && data.randomId)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"randomId","hash":{},"data":data}) : helper)))
    + "_"
    + alias4((helpers.escape || (depth0 && depth0.escape) || alias2).call(alias1,(depths[1] != null ? depths[1].id : depths[1]),{"name":"escape","hash":{},"data":data}))
    + "_"
    + alias4(((helper = (helper = helpers.index || (data && data.index)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"index","hash":{},"data":data}) : helper)))
    + "\">\r\n              <div class=\"box-body\">\r\n"
    + ((stack1 = container.invokePartial(partials.content,depth0,{"name":"content","data":data,"indent":"                ","helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "              </div>\r\n            </div>\r\n";
},"31":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = helpers["if"].call(depth0 != null ? depth0 : {},(depth0 != null ? depth0["content-responsive"] : depth0),{"name":"if","hash":{},"fn":container.program(32, data, 0),"inverse":container.program(34, data, 0),"data":data})) != null ? stack1 : "");
},"32":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = container.invokePartial(partials["content-responsive"],depth0,{"name":"content-responsive","data":data,"indent":"    ","helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "");
},"34":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = helpers["if"].call(depth0 != null ? depth0 : {},(depth0 != null ? depth0["content-fixed"] : depth0),{"name":"if","hash":{},"fn":container.program(35, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "");
},"35":function(container,depth0,helpers,partials,data) {
    var stack1, helper, options, buffer = "";

  stack1 = ((helper = (helper = helpers["content-fixed"] || (depth0 != null ? depth0["content-fixed"] : depth0)) != null ? helper : helpers.helperMissing),(options={"name":"content-fixed","hash":{},"fn":container.program(36, data, 0),"inverse":container.noop,"data":data}),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},options) : helper));
  if (!helpers["content-fixed"]) { stack1 = helpers.blockHelperMissing.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer + "  ";
},"36":function(container,depth0,helpers,partials,data) {
    var stack1, helper, options, buffer = 
  "      <div class=\"row\">\r\n";
  stack1 = ((helper = (helper = helpers.rowFixed || (depth0 != null ? depth0.rowFixed : depth0)) != null ? helper : helpers.helperMissing),(options={"name":"rowFixed","hash":{},"fn":container.program(37, data, 0),"inverse":container.noop,"data":data}),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},options) : helper));
  if (!helpers.rowFixed) { stack1 = helpers.blockHelperMissing.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer + "      </div>\r\n";
},"37":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = container.invokePartial(partials["content-inner"],depth0,{"name":"content-inner","data":data,"indent":"          ","helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "");
},"39":function(container,depth0,helpers,partials,data) {
    var stack1, helper, options, buffer = 
  "  <div class=\"row\">\r\n";
  stack1 = ((helper = (helper = helpers.cols || (depth0 != null ? depth0.cols : depth0)) != null ? helper : helpers.helperMissing),(options={"name":"cols","hash":{},"fn":container.program(40, data, 0),"inverse":container.noop,"data":data}),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},options) : helper));
  if (!helpers.cols) { stack1 = helpers.blockHelperMissing.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer + "  </div>\r\n";
},"40":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = container.invokePartial(partials.col,depth0,{"name":"col","data":data,"indent":"      ","helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "");
},"42":function(container,depth0,helpers,partials,data) {
    var stack1, helper, options, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=helpers.blockHelperMissing, buffer = 
  "  <div class=\"";
  stack1 = ((helper = (helper = helpers.xs || (depth0 != null ? depth0.xs : depth0)) != null ? helper : alias2),(options={"name":"xs","hash":{},"fn":container.program(43, data, 0),"inverse":container.noop,"data":data}),(typeof helper === alias3 ? helper.call(alias1,options) : helper));
  if (!helpers.xs) { stack1 = alias4.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  stack1 = ((helper = (helper = helpers.md || (depth0 != null ? depth0.md : depth0)) != null ? helper : alias2),(options={"name":"md","hash":{},"fn":container.program(45, data, 0),"inverse":container.noop,"data":data}),(typeof helper === alias3 ? helper.call(alias1,options) : helper));
  if (!helpers.md) { stack1 = alias4.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  buffer += "\">\r\n";
  stack1 = ((helper = (helper = helpers.component || (depth0 != null ? depth0.component : depth0)) != null ? helper : alias2),(options={"name":"component","hash":{},"fn":container.program(47, data, 0),"inverse":container.noop,"data":data}),(typeof helper === alias3 ? helper.call(alias1,options) : helper));
  if (!helpers.component) { stack1 = alias4.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  stack1 = ((helper = (helper = helpers.row || (depth0 != null ? depth0.row : depth0)) != null ? helper : alias2),(options={"name":"row","hash":{},"fn":container.program(49, data, 0),"inverse":container.noop,"data":data}),(typeof helper === alias3 ? helper.call(alias1,options) : helper));
  if (!helpers.row) { stack1 = alias4.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer + "  </div>\r\n";
},"43":function(container,depth0,helpers,partials,data) {
    var helper;

  return "col-xs-"
    + container.escapeExpression(((helper = (helper = helpers.xs || (depth0 != null ? depth0.xs : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"xs","hash":{},"data":data}) : helper)))
    + " ";
},"45":function(container,depth0,helpers,partials,data) {
    var helper;

  return "col-md-"
    + container.escapeExpression(((helper = (helper = helpers.md || (depth0 != null ? depth0.md : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"md","hash":{},"data":data}) : helper)))
    + " ";
},"47":function(container,depth0,helpers,partials,data) {
    return "      <div data-component=\""
    + container.escapeExpression(container.lambda(depth0, depth0))
    + "\" class=\" component\"></div>\r\n";
},"49":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = container.invokePartial(partials.contentRow,depth0,{"name":"contentRow","data":data,"indent":"      ","helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "");
},"51":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = container.invokePartial(partials.label,depth0,{"name":"label","data":data,"indent":"  ","helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "");
},"53":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = helpers["if"].call(depth0 != null ? depth0 : {},(data && data.tab),{"name":"if","hash":{},"fn":container.program(54, data, 0),"inverse":container.program(56, data, 0),"data":data})) != null ? stack1 : "");
},"54":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = container.invokePartial(partials.tab,depth0,{"name":"tab","data":data,"indent":"  ","helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "");
},"56":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = helpers["if"].call(depth0 != null ? depth0 : {},(data && data.content),{"name":"if","hash":{},"fn":container.program(57, data, 0),"inverse":container.program(59, data, 0),"data":data})) != null ? stack1 : "");
},"57":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = container.invokePartial(partials.content,depth0,{"name":"content","data":data,"indent":"  ","helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "");
},"59":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = container.invokePartial(partials.base,depth0,{"name":"base","data":data,"indent":"  ","helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "");
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1;

  return "\r\n\r\n\r\n\r\n\r\n\r\n"
    + ((stack1 = helpers["if"].call(depth0 != null ? depth0 : {},(data && data.label),{"name":"if","hash":{},"fn":container.program(51, data, 0, blockParams, depths),"inverse":container.program(53, data, 0, blockParams, depths),"data":data})) != null ? stack1 : "");
},"main_d":  function(fn, props, container, depth0, data, blockParams, depths) {

  var decorators = container.decorators;

  fn = decorators.inline(fn,props,container,{"name":"inline","hash":{},"fn":container.program(1, data, 0, blockParams, depths),"inverse":container.noop,"args":["base"],"data":data}) || fn;
  fn = decorators.inline(fn,props,container,{"name":"inline","hash":{},"fn":container.program(4, data, 0, blockParams, depths),"inverse":container.noop,"args":["content-responsive"],"data":data}) || fn;
  fn = decorators.inline(fn,props,container,{"name":"inline","hash":{},"fn":container.program(9, data, 0, blockParams, depths),"inverse":container.noop,"args":["content-inner"],"data":data}) || fn;
  fn = decorators.inline(fn,props,container,{"name":"inline","hash":{},"fn":container.program(21, data, 0, blockParams, depths),"inverse":container.noop,"args":["content"],"data":data}) || fn;
  fn = decorators.inline(fn,props,container,{"name":"inline","hash":{},"fn":container.program(39, data, 0, blockParams, depths),"inverse":container.noop,"args":["row"],"data":data}) || fn;
  fn = decorators.inline(fn,props,container,{"name":"inline","hash":{},"fn":container.program(42, data, 0, blockParams, depths),"inverse":container.noop,"args":["col"],"data":data}) || fn;
  return fn;
  }

,"useDecorators":true,"usePartial":true,"useData":true,"useDepths":true});
templates['widgets/widgets'] = template({"1":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "<div class=\"box box-primary\" style=\"border-color: "
    + alias4(((helper = (helper = helpers.boxColor || (depth0 != null ? depth0.boxColor : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"boxColor","hash":{},"data":data}) : helper)))
    + "\"> <!-- Change top border accordingly -->\r\n  <div class=\"box-header with-border\">\r\n    <h3 class=\"box-title\">\r\n      "
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.icon : depth0),{"name":"if","hash":{},"fn":container.program(2, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\r\n      <span class=\"chart-title\""
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0["title-i18n"] : depth0),{"name":"if","hash":{},"fn":container.program(4, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + ">"
    + alias4(((helper = (helper = helpers.title || (depth0 != null ? depth0.title : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"title","hash":{},"data":data}) : helper)))
    + "</span>\r\n    </h3>\r\n\r\n    <div class=\"box-tools pull-right\">\r\n      <button type=\"button\" class=\"btn btn-box-tool chart-refresh\"><i class=\"fa fa-retweet\"></i></button>\r\n      <button type=\"button\" class=\"btn btn-box-tool legend-toggle hidden\"><i class=\"fa fa-list-ul\"></i></button>\r\n      <button type=\"button\" class=\"btn btn-box-tool body-toggle\"><i class=\"fa fa-fw fa-minus\"></i></button>\r\n      <!-- Not yet. maybe later after there are enough to justify having a draggable inventory of them\r\n        <button type=\"button\" class=\"btn btn-box-tool\" data-widget=\"remove\"><i class=\"fa fa-times\"></i></button>\r\n      -->\r\n    </div>\r\n  </div>\r\n";
},"2":function(container,depth0,helpers,partials,data) {
    var helper;

  return "<i class=\""
    + container.escapeExpression(((helper = (helper = helpers.icon || (depth0 != null ? depth0.icon : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"icon","hash":{},"data":data}) : helper)))
    + "\"></i>";
},"4":function(container,depth0,helpers,partials,data) {
    var helper;

  return " data-i18n=\""
    + container.escapeExpression(((helper = (helper = helpers["title-i18n"] || (depth0 != null ? depth0["title-i18n"] : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"title-i18n","hash":{},"data":data}) : helper)))
    + "\"";
},"6":function(container,depth0,helpers,partials,data) {
    return "</div>\r\n";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : {};

  return ((stack1 = helpers.unless.call(alias1,(depth0 != null ? depth0.noBox : depth0),{"name":"unless","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "  <div class=\"box-body chart-box\">\r\n    <div class=\"legend hidden\">\r\n    </div>  \r\n    <div class=\"chart\">\r\n    </div>\r\n  </div>\r\n"
    + ((stack1 = helpers.unless.call(alias1,(depth0 != null ? depth0.noBox : depth0),{"name":"unless","hash":{},"fn":container.program(6, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "");
},"useData":true});
templates['form/fields/areapicker/areapicker'] = template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper;

  return "<rsel data-id=\""
    + container.escapeExpression(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"id","hash":{},"data":data}) : helper)))
    + "\">\r\n</rsel>";
},"useData":true});
templates['form/fields/button/button'] = template({"1":function(container,depth0,helpers,partials,data) {
    return "style=\"margin-top: 25px;\" ";
},"3":function(container,depth0,helpers,partials,data) {
    return "default";
},"5":function(container,depth0,helpers,partials,data) {
    var helper;

  return container.escapeExpression(((helper = (helper = helpers["btn-class"] || (depth0 != null ? depth0["btn-class"] : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"btn-class","hash":{},"data":data}) : helper)));
},"7":function(container,depth0,helpers,partials,data) {
    var helper;

  return "    <span class=\""
    + container.escapeExpression(((helper = (helper = helpers["btn-icon"] || (depth0 != null ? depth0["btn-icon"] : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"btn-icon","hash":{},"data":data}) : helper)))
    + "\"></span>\r\n";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "<button type=\"button\" "
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.lower : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + " data-id=\""
    + alias4(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"id","hash":{},"data":data}) : helper)))
    + "\"\r\n  class=\"btn btn-"
    + ((stack1 = helpers.unless.call(alias1,(depth0 != null ? depth0["btn-class"] : depth0),{"name":"unless","hash":{},"fn":container.program(3, data, 0),"inverse":container.program(5, data, 0),"data":data})) != null ? stack1 : "")
    + " btn-flat\">\r\n"
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0["btn-icon"] : depth0),{"name":"if","hash":{},"fn":container.program(7, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "  <span data-i18n=\""
    + alias4(((helper = (helper = helpers["text-i18n"] || (depth0 != null ? depth0["text-i18n"] : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"text-i18n","hash":{},"data":data}) : helper)))
    + "\"></span>\r\n</button>";
},"useData":true});
templates['form/fields/calendar/calendar'] = template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "<div data-id=\""
    + alias4(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"id","hash":{},"data":data}) : helper)))
    + "\" name=\""
    + alias4(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"id","hash":{},"data":data}) : helper)))
    + "\">\r\n  <div class=\"cal\"></div>\r\n</div>\r\n";
},"useData":true});
templates['form/fields/checkboxtree/checkboxtree'] = template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    return "<div class=\"tree-container\"> </div>";
},"useData":true});
templates['form/fields/codeinput/codeinput'] = template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "<div class=\"code-container\">\r\n  <textarea data-i18n=\"[placeholder]"
    + alias4(((helper = (helper = helpers["placeholder-i18n"] || (depth0 != null ? depth0["placeholder-i18n"] : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"placeholder-i18n","hash":{},"data":data}) : helper)))
    + "\"\r\n    data-id=\""
    + alias4(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"id","hash":{},"data":data}) : helper)))
    + "\" name=\""
    + alias4(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"id","hash":{},"data":data}) : helper)))
    + "\"\r\n    class=\"form-control\" rows=\"3\"></textarea>\r\n</div>\r\n";
},"useData":true});
templates['form/fields/component/component'] = template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "<div class=\"component-container\">\r\n"
    + ((stack1 = container.invokePartial(partials["form/fields/component/content"],depth0,{"name":"form/fields/component/content","data":data,"indent":"  ","helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "</div>";
},"usePartial":true,"useData":true});
templates['form/fields/component/content-inner'] = template({"1":function(container,depth0,helpers,partials,data) {
    var stack1, helper, options, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=helpers.blockHelperMissing, buffer = 
  "  <div class=\"";
  stack1 = ((helper = (helper = helpers.xs || (depth0 != null ? depth0.xs : depth0)) != null ? helper : alias2),(options={"name":"xs","hash":{},"fn":container.program(2, data, 0),"inverse":container.noop,"data":data}),(typeof helper === alias3 ? helper.call(alias1,options) : helper));
  if (!helpers.xs) { stack1 = alias4.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  stack1 = ((helper = (helper = helpers.sm || (depth0 != null ? depth0.sm : depth0)) != null ? helper : alias2),(options={"name":"sm","hash":{},"fn":container.program(4, data, 0),"inverse":container.noop,"data":data}),(typeof helper === alias3 ? helper.call(alias1,options) : helper));
  if (!helpers.sm) { stack1 = alias4.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  stack1 = ((helper = (helper = helpers.md || (depth0 != null ? depth0.md : depth0)) != null ? helper : alias2),(options={"name":"md","hash":{},"fn":container.program(6, data, 0),"inverse":container.noop,"data":data}),(typeof helper === alias3 ? helper.call(alias1,options) : helper));
  if (!helpers.md) { stack1 = alias4.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  stack1 = ((helper = (helper = helpers.lg || (depth0 != null ? depth0.lg : depth0)) != null ? helper : alias2),(options={"name":"lg","hash":{},"fn":container.program(8, data, 0),"inverse":container.noop,"data":data}),(typeof helper === alias3 ? helper.call(alias1,options) : helper));
  if (!helpers.lg) { stack1 = alias4.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  buffer += "\">\r\n";
  stack1 = ((helper = (helper = helpers.components || (depth0 != null ? depth0.components : depth0)) != null ? helper : alias2),(options={"name":"components","hash":{},"fn":container.program(10, data, 0),"inverse":container.noop,"data":data}),(typeof helper === alias3 ? helper.call(alias1,options) : helper));
  if (!helpers.components) { stack1 = alias4.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer + "  </div>\r\n";
},"2":function(container,depth0,helpers,partials,data) {
    return "col-xs-"
    + container.escapeExpression(container.lambda(depth0, depth0))
    + " ";
},"4":function(container,depth0,helpers,partials,data) {
    return "col-sm-"
    + container.escapeExpression(container.lambda(depth0, depth0))
    + " ";
},"6":function(container,depth0,helpers,partials,data) {
    return "col-md-"
    + container.escapeExpression(container.lambda(depth0, depth0))
    + " ";
},"8":function(container,depth0,helpers,partials,data) {
    return "col-lg-"
    + container.escapeExpression(container.lambda(depth0, depth0))
    + " ";
},"10":function(container,depth0,helpers,partials,data) {
    return "      <div data-component=\""
    + container.escapeExpression(container.lambda(depth0, depth0))
    + "\" class=\" component\"></div>\r\n";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = helpers.blockHelperMissing.call(depth0,container.lambda(depth0, depth0),{"name":".","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "");
},"useData":true});
templates['form/fields/component/content'] = template({"1":function(container,depth0,helpers,partials,data) {
    var stack1, helper, options, buffer = "";

  stack1 = ((helper = (helper = helpers.getUniqueId || (depth0 != null ? depth0.getUniqueId : depth0)) != null ? helper : helpers.helperMissing),(options={"name":"getUniqueId","hash":{},"fn":container.program(2, data, 0),"inverse":container.noop,"data":data}),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},options) : helper));
  if (!helpers.getUniqueId) { stack1 = helpers.blockHelperMissing.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer;
},"2":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : {};

  return "    <div class=\"nav-tabs-custom\"> \r\n      <ul id=\"tablist_"
    + container.escapeExpression(((helper = (helper = helpers.randomId || (data && data.randomId)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(alias1,{"name":"randomId","hash":{},"data":data}) : helper)))
    + "\" class=\"nav nav-tabs\">\r\n"
    + ((stack1 = helpers.each.call(alias1,(depth0 != null ? depth0["content-tabs"] : depth0),{"name":"each","hash":{},"fn":container.program(3, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "      </ul>\r\n      <div class=\"tab-content\">\r\n"
    + ((stack1 = helpers.each.call(alias1,(depth0 != null ? depth0["content-tabs"] : depth0),{"name":"each","hash":{},"fn":container.program(8, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "      </div>\r\n    </div>\r\n";
},"3":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "          <li class=\"innerTab"
    + ((stack1 = (helpers.eq || (depth0 && depth0.eq) || alias2).call(alias1,(data && data.index),0,{"name":"eq","hash":{},"fn":container.program(4, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\">\r\n            <a aria-expanded=\"false\"\r\n              "
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0["title-i18n"] : depth0),{"name":"if","hash":{},"fn":container.program(6, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\r\n              href=\"#"
    + alias4(((helper = (helper = helpers.randomId || (data && data.randomId)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"randomId","hash":{},"data":data}) : helper)))
    + "_"
    + alias4(((helper = (helper = helpers.index || (data && data.index)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"index","hash":{},"data":data}) : helper)))
    + "\"\r\n              data-toggle=\"tab\">"
    + alias4(((helper = (helper = helpers.title || (depth0 != null ? depth0.title : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"title","hash":{},"data":data}) : helper)))
    + "\r\n            </a>\r\n          </li>\r\n";
},"4":function(container,depth0,helpers,partials,data) {
    return " active";
},"6":function(container,depth0,helpers,partials,data) {
    var helper;

  return "data-i18n=\""
    + container.escapeExpression(((helper = (helper = helpers["title-i18n"] || (depth0 != null ? depth0["title-i18n"] : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"title-i18n","hash":{},"data":data}) : helper)))
    + "\"";
},"8":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "          <div class=\"tab-pane"
    + ((stack1 = (helpers.eq || (depth0 && depth0.eq) || alias2).call(alias1,(data && data.index),0,{"name":"eq","hash":{},"fn":container.program(4, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\" id=\""
    + alias4(((helper = (helper = helpers.randomId || (data && data.randomId)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"randomId","hash":{},"data":data}) : helper)))
    + "_"
    + alias4(((helper = (helper = helpers.index || (data && data.index)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"index","hash":{},"data":data}) : helper)))
    + "\">\r\n            <div class=\"box-body\">\r\n"
    + ((stack1 = container.invokePartial(partials["form/fields/component/content"],depth0,{"name":"form/fields/component/content","data":data,"indent":"              ","helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "            </div>\r\n          </div>\r\n";
},"10":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = helpers["if"].call(depth0 != null ? depth0 : {},(depth0 != null ? depth0["content-responsive"] : depth0),{"name":"if","hash":{},"fn":container.program(11, data, 0),"inverse":container.program(13, data, 0),"data":data})) != null ? stack1 : "");
},"11":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = container.invokePartial(partials["content-responsive"],depth0,{"name":"content-responsive","data":data,"indent":"  ","helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "");
},"13":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = helpers["if"].call(depth0 != null ? depth0 : {},(depth0 != null ? depth0["content-fixed"] : depth0),{"name":"if","hash":{},"fn":container.program(14, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "");
},"14":function(container,depth0,helpers,partials,data) {
    var stack1, helper, options, buffer = "";

  stack1 = ((helper = (helper = helpers["content-fixed"] || (depth0 != null ? depth0["content-fixed"] : depth0)) != null ? helper : helpers.helperMissing),(options={"name":"content-fixed","hash":{},"fn":container.program(15, data, 0),"inverse":container.noop,"data":data}),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},options) : helper));
  if (!helpers["content-fixed"]) { stack1 = helpers.blockHelperMissing.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer;
},"15":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "  \r\n"
    + ((stack1 = (helpers.eq || (depth0 && depth0.eq) || helpers.helperMissing).call(depth0 != null ? depth0 : {},depth0,"--hr",{"name":"eq","hash":{},"fn":container.program(16, data, 0),"inverse":container.program(18, data, 0),"data":data})) != null ? stack1 : "");
},"16":function(container,depth0,helpers,partials,data) {
    return "      <hr />\r\n";
},"18":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = (helpers.match || (depth0 && depth0.match) || helpers.helperMissing).call(depth0 != null ? depth0 : {},depth0,"\\-\\-hr\\:(.+)",{"name":"match","hash":{},"fn":container.program(19, data, 0),"inverse":container.program(21, data, 0),"data":data})) != null ? stack1 : "");
},"19":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=container.escapeExpression;

  return "        <div style=\"width:100%;overflow:hidden;white-space: nowrap;padding:0 0 10px 0\">\r\n          <span style=\"display: inline-block;color:#888;font-size:1.3em;font-style: italic;padding-right: 5px;\"\r\n            data-i18n=\""
    + alias1(container.lambda(((stack1 = (data && data.captures)) && stack1["0"]), depth0))
    + "\">"
    + alias1((helpers.i18n_t || (depth0 && depth0.i18n_t) || helpers.helperMissing).call(depth0 != null ? depth0 : {},((stack1 = (data && data.captures)) && stack1["0"]),{"name":"i18n_t","hash":{},"data":data}))
    + "</span>\r\n          <span style=\"width:100%;background-color:#eee;display: inline-block;line-height: .1em;\">&nbsp;</span>\r\n        </div>\r\n";
},"21":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = (helpers.isarray || (depth0 && depth0.isarray) || helpers.helperMissing).call(depth0 != null ? depth0 : {},depth0,{"name":"isarray","hash":{},"fn":container.program(22, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "");
},"22":function(container,depth0,helpers,partials,data) {
    var stack1, helper, options, buffer = 
  "    <div class=\"row\">\r\n";
  stack1 = ((helper = (helper = helpers.rowFixed || (depth0 != null ? depth0.rowFixed : depth0)) != null ? helper : helpers.helperMissing),(options={"name":"rowFixed","hash":{},"fn":container.program(23, data, 0),"inverse":container.noop,"data":data}),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},options) : helper));
  if (!helpers.rowFixed) { stack1 = helpers.blockHelperMissing.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer + "    </div>\r\n    ";
},"23":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = container.invokePartial(partials["form/fields/component/content-inner"],depth0,{"name":"form/fields/component/content-inner","data":data,"indent":"        ","helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "");
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = helpers["if"].call(depth0 != null ? depth0 : {},(depth0 != null ? depth0["content-tabs"] : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.program(10, data, 0),"data":data})) != null ? stack1 : "");
},"usePartial":true,"useData":true});
templates['form/fields/computed/computed'] = template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "<input type=\"text\" class=\"form-text form-control\"\r\n  data-id=\""
    + alias4(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"id","hash":{},"data":data}) : helper)))
    + "\" name=\""
    + alias4(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"id","hash":{},"data":data}) : helper)))
    + "\"\r\n  readonly\r\n  data-i18n=\"[placeholder]"
    + alias4(((helper = (helper = helpers["placeholder-i18n"] || (depth0 != null ? depth0["placeholder-i18n"] : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"placeholder-i18n","hash":{},"data":data}) : helper)))
    + "\">";
},"useData":true});
templates['form/fields/datepicker/datepicker'] = template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "<input type=\"text\" class=\"form-control form-datepicker\" name=\""
    + alias4(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"id","hash":{},"data":data}) : helper)))
    + "\" data-i18n=\"[placeholder]"
    + alias4(((helper = (helper = helpers["placeholder-i18n"] || (depth0 != null ? depth0["placeholder-i18n"] : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"placeholder-i18n","hash":{},"data":data}) : helper)))
    + "\">\r\n</input>";
},"useData":true});
templates['form/fields/datepicker2/datepicker2'] = template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "<div>\r\n  <div class=\"input-group\">\r\n    <input\r\n      type=\"text\"\r\n      name=\""
    + alias4(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"id","hash":{},"data":data}) : helper)))
    + "\"\r\n      class=\"form-text form-control form-datepicker2\"\r\n      data-i18n=\"[placeholder]"
    + alias4(((helper = (helper = helpers["placeholder-i18n"] || (depth0 != null ? depth0["placeholder-i18n"] : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"placeholder-i18n","hash":{},"data":data}) : helper)))
    + "\"\r\n    />\r\n    <span class=\"input-group-btn\">\r\n      <button class=\"btn btn-flat btn-default datepicker2-button\" type=\"button\">\r\n        <i class=\"fa fa-fw fa-calendar\"></i>\r\n      </button>\r\n    </span>\r\n  </div>\r\n  <div\r\n    class=\"datepicker2-inputs\"\r\n    style=\"width: 100%;display: flex; justify-content: center\"\r\n  >\r\n    <div\r\n      style=\"display: flex;border-style: solid; border-width: 0 1px 1px 1px; border-color: #ccc; border-radius: 2px;\"\r\n    >\r\n      <div>\r\n        <input type=\"text\" class=\"hidden datepicker2-date\" />\r\n      </div>\r\n      <div style=\"position: relative;\">\r\n        <input type=\"text\" class=\"hidden datepicker2-time\" />\r\n      </div>\r\n    </div>\r\n  </div>\r\n</div>";
},"useData":true});
templates['form/fields/datetimepicker/datetimepicker'] = template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    return "<div class=\"datetimepicker\" style='display:flex;flex-direction:row;'>\r\n  <div style=\"flex-grow:1\">\r\n    <div class=\"datepicker-date\"></div>\r\n  </div>\r\n  <div>\r\n    <div class=\"datepicker-time\" style=\"flex-grow:1\"></div>\r\n  </div>\r\n  <button data-id=\"close-button\" class=\"btn btn-default btn-flat\" type=\"button\" style=\"border-left-width: 0 !important\">\r\n    <i class=\"fa fa-fw fa-times\"></i>\r\n  </button>\r\n</div>";
},"useData":true});
templates['form/fields/editgrid/editgrid'] = template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    return "<div class=\"table-responsive editgrid\">\r\n  <table class=\"table table-condensed\">\r\n    <thead>\r\n    </thead>\r\n    <tbody>\r\n    </tbody>\r\n  </table>\r\n</div>";
},"useData":true});
templates['form/fields/file/file'] = template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "<input type=\"file\" class=\"form-file form-control\"\r\n  data-id=\""
    + alias4(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"id","hash":{},"data":data}) : helper)))
    + "\" name=\""
    + alias4(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"id","hash":{},"data":data}) : helper)))
    + "\"\r\n  data-i18n=\"[placeholder]"
    + alias4(((helper = (helper = helpers["placeholder-i18n"] || (depth0 != null ? depth0["placeholder-i18n"] : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"placeholder-i18n","hash":{},"data":data}) : helper)))
    + "\">";
},"useData":true});
templates['form/fields/fileexplorer/fileexplorer'] = template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    return "\r\n<div class=\"fe-file-explorer\">\r\n</div>";
},"useData":true});
templates['form/fields/fileinput/fileinput'] = template({"1":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "        <input class=\"fi-file\" type=\"file\" name=\"files[]\" id=\""
    + alias4(((helper = (helper = helpers.randomId || (data && data.randomId)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"randomId","hash":{},"data":data}) : helper)))
    + "\" data-multiple-caption=\"{count} files selected\" multiple />\r\n        <label for=\""
    + alias4(((helper = (helper = helpers.randomId || (data && data.randomId)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"randomId","hash":{},"data":data}) : helper)))
    + "\">\r\n          <i class=\"fa fa-download\"></i>\r\n          <strong>Choose files</strong>\r\n          <span class=\"fi-dragndrop\"> or drag them here</span>.\r\n        </label>\r\n";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper, options, buffer = 
  "<div class=\"fileinput\">\r\n  <div class=\"fileinput-area\">\r\n    <div class=\"fi-input\">\r\n";
  stack1 = ((helper = (helper = helpers.getUniqueId || (depth0 != null ? depth0.getUniqueId : depth0)) != null ? helper : helpers.helperMissing),(options={"name":"getUniqueId","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data}),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},options) : helper));
  if (!helpers.getUniqueId) { stack1 = helpers.blockHelperMissing.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer + "    </div>\r\n    <div class=\"files\">\r\n    </div>\r\n  </div>\r\n</div>";
},"useData":true});
templates['form/fields/image/image'] = template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "<img data-id=\""
    + alias4(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"id","hash":{},"data":data}) : helper)))
    + "\" name=\""
    + alias4(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"id","hash":{},"data":data}) : helper)))
    + "\" alt=\""
    + alias4(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"id","hash":{},"data":data}) : helper)))
    + "\" class=\"form-control-image\" />";
},"useData":true});
templates['form/fields/link/link'] = template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "<a href=\"\" style=\"margin-top:9px;margin-bottom:9px;\" data-id=\""
    + alias4(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"id","hash":{},"data":data}) : helper)))
    + "\" name=\""
    + alias4(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"id","hash":{},"data":data}) : helper)))
    + "\"  \r\n  target=\"_blank\" class=\"form-control-link btn btn-flat btn-primary btn-xs\">\r\n  <i class=\"fa fa-fw fa-link\"></i>\r\n  <span data-i18n=\""
    + alias4(((helper = (helper = helpers["label-i18n"] || (depth0 != null ? depth0["label-i18n"] : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"label-i18n","hash":{},"data":data}) : helper)))
    + "\"></span>\r\n</a>";
},"useData":true});
templates['form/fields/listform/component'] = template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "<div class=\"component-container\">\r\n"
    + ((stack1 = container.invokePartial(partials["form/fields/listform/content"],depth0,{"name":"form/fields/listform/content","data":data,"indent":"  ","helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "</div>";
},"usePartial":true,"useData":true});
templates['form/fields/listform/content-inner'] = template({"1":function(container,depth0,helpers,partials,data) {
    var stack1, helper, options, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=helpers.blockHelperMissing, buffer = 
  "  <div class=\"";
  stack1 = ((helper = (helper = helpers.xs || (depth0 != null ? depth0.xs : depth0)) != null ? helper : alias2),(options={"name":"xs","hash":{},"fn":container.program(2, data, 0),"inverse":container.noop,"data":data}),(typeof helper === alias3 ? helper.call(alias1,options) : helper));
  if (!helpers.xs) { stack1 = alias4.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  stack1 = ((helper = (helper = helpers.sm || (depth0 != null ? depth0.sm : depth0)) != null ? helper : alias2),(options={"name":"sm","hash":{},"fn":container.program(4, data, 0),"inverse":container.noop,"data":data}),(typeof helper === alias3 ? helper.call(alias1,options) : helper));
  if (!helpers.sm) { stack1 = alias4.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  stack1 = ((helper = (helper = helpers.md || (depth0 != null ? depth0.md : depth0)) != null ? helper : alias2),(options={"name":"md","hash":{},"fn":container.program(6, data, 0),"inverse":container.noop,"data":data}),(typeof helper === alias3 ? helper.call(alias1,options) : helper));
  if (!helpers.md) { stack1 = alias4.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  stack1 = ((helper = (helper = helpers.lg || (depth0 != null ? depth0.lg : depth0)) != null ? helper : alias2),(options={"name":"lg","hash":{},"fn":container.program(8, data, 0),"inverse":container.noop,"data":data}),(typeof helper === alias3 ? helper.call(alias1,options) : helper));
  if (!helpers.lg) { stack1 = alias4.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  buffer += "\">\r\n";
  stack1 = ((helper = (helper = helpers.components || (depth0 != null ? depth0.components : depth0)) != null ? helper : alias2),(options={"name":"components","hash":{},"fn":container.program(10, data, 0),"inverse":container.noop,"data":data}),(typeof helper === alias3 ? helper.call(alias1,options) : helper));
  if (!helpers.components) { stack1 = alias4.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer + "  </div>\r\n";
},"2":function(container,depth0,helpers,partials,data) {
    return "col-xs-"
    + container.escapeExpression(container.lambda(depth0, depth0))
    + " ";
},"4":function(container,depth0,helpers,partials,data) {
    return "col-sm-"
    + container.escapeExpression(container.lambda(depth0, depth0))
    + " ";
},"6":function(container,depth0,helpers,partials,data) {
    return "col-md-"
    + container.escapeExpression(container.lambda(depth0, depth0))
    + " ";
},"8":function(container,depth0,helpers,partials,data) {
    return "col-lg-"
    + container.escapeExpression(container.lambda(depth0, depth0))
    + " ";
},"10":function(container,depth0,helpers,partials,data) {
    return "      <div data-component=\""
    + container.escapeExpression(container.lambda(depth0, depth0))
    + "\" class=\" component\"></div>\r\n";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = helpers.blockHelperMissing.call(depth0,container.lambda(depth0, depth0),{"name":".","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "");
},"useData":true});
templates['form/fields/listform/content'] = template({"1":function(container,depth0,helpers,partials,data) {
    var stack1, helper, options, buffer = "";

  stack1 = ((helper = (helper = helpers.getUniqueId || (depth0 != null ? depth0.getUniqueId : depth0)) != null ? helper : helpers.helperMissing),(options={"name":"getUniqueId","hash":{},"fn":container.program(2, data, 0),"inverse":container.noop,"data":data}),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},options) : helper));
  if (!helpers.getUniqueId) { stack1 = helpers.blockHelperMissing.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer;
},"2":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : {};

  return "    <div class=\"nav-tabs-custom\"> \r\n      <ul id=\"tablist_"
    + container.escapeExpression(((helper = (helper = helpers.randomId || (data && data.randomId)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(alias1,{"name":"randomId","hash":{},"data":data}) : helper)))
    + "\" class=\"nav nav-tabs\">\r\n"
    + ((stack1 = helpers.each.call(alias1,(depth0 != null ? depth0["content-tabs"] : depth0),{"name":"each","hash":{},"fn":container.program(3, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "      </ul>\r\n      <div class=\"tab-content\">\r\n"
    + ((stack1 = helpers.each.call(alias1,(depth0 != null ? depth0["content-tabs"] : depth0),{"name":"each","hash":{},"fn":container.program(8, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "      </div>\r\n    </div>\r\n";
},"3":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "          <li class=\"innerTab"
    + ((stack1 = (helpers.eq || (depth0 && depth0.eq) || alias2).call(alias1,(data && data.index),0,{"name":"eq","hash":{},"fn":container.program(4, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\">\r\n            <a aria-expanded=\"false\"\r\n              "
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0["title-i18n"] : depth0),{"name":"if","hash":{},"fn":container.program(6, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\r\n              href=\"#"
    + alias4(((helper = (helper = helpers.randomId || (data && data.randomId)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"randomId","hash":{},"data":data}) : helper)))
    + "_"
    + alias4(((helper = (helper = helpers.index || (data && data.index)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"index","hash":{},"data":data}) : helper)))
    + "\"\r\n              data-toggle=\"tab\">"
    + alias4(((helper = (helper = helpers.title || (depth0 != null ? depth0.title : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"title","hash":{},"data":data}) : helper)))
    + "\r\n            </a>\r\n          </li>\r\n";
},"4":function(container,depth0,helpers,partials,data) {
    return " active";
},"6":function(container,depth0,helpers,partials,data) {
    var helper;

  return "data-i18n=\""
    + container.escapeExpression(((helper = (helper = helpers["title-i18n"] || (depth0 != null ? depth0["title-i18n"] : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"title-i18n","hash":{},"data":data}) : helper)))
    + "\"";
},"8":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "          <div class=\"tab-pane"
    + ((stack1 = (helpers.eq || (depth0 && depth0.eq) || alias2).call(alias1,(data && data.index),0,{"name":"eq","hash":{},"fn":container.program(4, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\" id=\""
    + alias4(((helper = (helper = helpers.randomId || (data && data.randomId)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"randomId","hash":{},"data":data}) : helper)))
    + "_"
    + alias4(((helper = (helper = helpers.index || (data && data.index)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"index","hash":{},"data":data}) : helper)))
    + "\">\r\n            <div class=\"box-body\">\r\n"
    + ((stack1 = container.invokePartial(partials["form/fields/listform/content"],depth0,{"name":"form/fields/listform/content","data":data,"indent":"              ","helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "            </div>\r\n          </div>\r\n";
},"10":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = helpers["if"].call(depth0 != null ? depth0 : {},(depth0 != null ? depth0["content-responsive"] : depth0),{"name":"if","hash":{},"fn":container.program(11, data, 0),"inverse":container.program(13, data, 0),"data":data})) != null ? stack1 : "");
},"11":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = container.invokePartial(partials["content-responsive"],depth0,{"name":"content-responsive","data":data,"indent":"  ","helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "");
},"13":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = helpers["if"].call(depth0 != null ? depth0 : {},(depth0 != null ? depth0["content-fixed"] : depth0),{"name":"if","hash":{},"fn":container.program(14, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "");
},"14":function(container,depth0,helpers,partials,data) {
    var stack1, helper, options, buffer = "";

  stack1 = ((helper = (helper = helpers["content-fixed"] || (depth0 != null ? depth0["content-fixed"] : depth0)) != null ? helper : helpers.helperMissing),(options={"name":"content-fixed","hash":{},"fn":container.program(15, data, 0),"inverse":container.noop,"data":data}),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},options) : helper));
  if (!helpers["content-fixed"]) { stack1 = helpers.blockHelperMissing.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer;
},"15":function(container,depth0,helpers,partials,data) {
    var stack1, helper, options, buffer = 
  "    <div class=\"row\">\r\n";
  stack1 = ((helper = (helper = helpers.rowFixed || (depth0 != null ? depth0.rowFixed : depth0)) != null ? helper : helpers.helperMissing),(options={"name":"rowFixed","hash":{},"fn":container.program(16, data, 0),"inverse":container.noop,"data":data}),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},options) : helper));
  if (!helpers.rowFixed) { stack1 = helpers.blockHelperMissing.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer + "    </div>\r\n";
},"16":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = container.invokePartial(partials["form/fields/listform/content-inner"],depth0,{"name":"form/fields/listform/content-inner","data":data,"indent":"        ","helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "");
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = helpers["if"].call(depth0 != null ? depth0 : {},(depth0 != null ? depth0["content-tabs"] : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.program(10, data, 0),"data":data})) != null ? stack1 : "");
},"usePartial":true,"useData":true});
templates['form/fields/listform/listform-item'] = template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    return "<li class=\"list-group-item\" style=\"display:flex;align-items:center\">\r\n  <div\r\n    class=\"sort-content\"\r\n    style=\"display:inline-block;flex-grow:1;padding: 0 20px;\"\r\n  >\r\n  </div>\r\n</li>";
},"useData":true});
templates['form/fields/listform/listform'] = template({"1":function(container,depth0,helpers,partials,data) {
    return "<div class=\"row\" style=\"display:flex;margin-left: 10px;\">\r\n  <div>\r\n";
},"3":function(container,depth0,helpers,partials,data) {
    return "<div class=\"row\">\r\n  <div class=\"col-md-4\">\r\n";
},"5":function(container,depth0,helpers,partials,data) {
    return "<input type=\"text\" class=\"list-search\" placeholder=\"Pesquisar\" />";
},"7":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "  <div style=\"position:relative\" class=\"inactive listform sortaform-sub "
    + ((stack1 = helpers["if"].call(depth0 != null ? depth0 : {},(depth0 != null ? depth0.noBox : depth0),{"name":"if","hash":{},"fn":container.program(8, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\" style=\"flex-grow:1\">\r\n    <div style=\"height:34px;\" class=\"listform-buttons\">\r\n      <div class=\"hidden sort-btns-save btn btn-primary btn-flat\"><i class=\"fa fa-save\"></i> Guardar</div>\r\n    </div>\r\n    <div class=\"listform-overlay\" ></div>\r\n"
    + ((stack1 = container.invokePartial(partials["form/fields/listform/content"],depth0,{"name":"form/fields/listform/content","data":data,"indent":"    ","helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "    <div style=\"height:34px;\" class=\"listform-buttons\">\r\n      <div class=\"hidden sort-btns-save btn btn-primary btn-flat\"><i class=\"fa fa-save\"></i> Guardar</div>\r\n    </div>\r\n  </div>\r\n";
},"8":function(container,depth0,helpers,partials,data) {
    return "nobox";
},"10":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "  <div style=\"position:relative\" class=\"inactive listform col-md-8 sortaform-sub "
    + ((stack1 = helpers["if"].call(depth0 != null ? depth0 : {},(depth0 != null ? depth0.noBox : depth0),{"name":"if","hash":{},"fn":container.program(8, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\">\r\n    <div style=\"height:34px;\" class=\"listform-buttons\">\r\n      <div class=\"hidden sort-btns-save btn btn-primary btn-flat\"><i class=\"fa fa-save\"></i> Guardar</div>\r\n    </div>\r\n    <div class=\"listform-overlay\"></div>\r\n"
    + ((stack1 = container.invokePartial(partials["form/fields/listform/content"],depth0,{"name":"form/fields/listform/content","data":data,"indent":"    ","helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "    <div style=\"height:34px;\" class=\"listform-buttons\">\r\n      <div class=\"hidden sort-btns-save btn btn-primary btn-flat\"><i class=\"fa fa-save\"></i> Guardar</div>\r\n    </div>\r\n  </div>\r\n";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : {};

  return ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.flex : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.program(3, data, 0),"data":data})) != null ? stack1 : "")
    + "    <div style=\"display:flex;flex-direction:column;height: 100%;\">\r\n      <div style=\"margin-bottom: 10px;height:34px;\">\r\n        <div class=\"hidden sort-btns-cancel btn btn-default btn-flat\"><i class=\"fa fa-times\"></i> Cancelar</div>\r\n      </div>\r\n      <div style=\"overflow-x:hidden;overflow-y:auto;height: 100%;margin-right:15px;\">\r\n        "
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.search : depth0),{"name":"if","hash":{},"fn":container.program(5, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\r\n        <ul style=\"height:0\" class=\"list-group listform-list\" name=\""
    + container.escapeExpression(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(alias1,{"name":"id","hash":{},"data":data}) : helper)))
    + "\">\r\n        </ul>\r\n      </div>\r\n    </div>\r\n  </div>\r\n"
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.flex : depth0),{"name":"if","hash":{},"fn":container.program(7, data, 0),"inverse":container.program(10, data, 0),"data":data})) != null ? stack1 : "")
    + "</div>\r\n";
},"usePartial":true,"useData":true});
templates['form/fields/multicheckbox/multicheckbox'] = template({"1":function(container,depth0,helpers,partials,data) {
    return "  <div class=\"input-group checkbox-filter\" style=\"padding-bottom: 10px;\">\r\n    <span class=\"input-group-addon\"><i class=\"fa fa-search\"></i></span>\r\n    <input type=\"text\" class=\"form-control\">\r\n  </div>\r\n";
},"3":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1, helper, options, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", buffer = 
  "  <div class=\"multicheckbox\">\r\n"
    + ((stack1 = (helpers.eq || (depth0 && depth0.eq) || alias2).call(alias1,(depth0 != null ? depth0["label-position"] : depth0),"before",{"name":"eq","hash":{},"fn":container.program(4, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "    <div style=\"display: inline-block\" data-id=\""
    + container.escapeExpression(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"id","hash":{},"data":data}) : helper)))
    + "\" class=\"checkboxb"
    + ((stack1 = helpers["if"].call(alias1,(depths[1] != null ? depths[1].radio : depths[1]),{"name":"if","hash":{},"fn":container.program(7, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\">\r\n";
  stack1 = ((helper = (helper = helpers.getUniqueId || (depth0 != null ? depth0.getUniqueId : depth0)) != null ? helper : alias2),(options={"name":"getUniqueId","hash":{},"fn":container.program(9, data, 0, blockParams, depths),"inverse":container.noop,"data":data}),(typeof helper === alias3 ? helper.call(alias1,options) : helper));
  if (!helpers.getUniqueId) { stack1 = helpers.blockHelperMissing.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer + "    </div>\r\n  </div>\r\n";
},"4":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : {};

  return "      <span"
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0["label-i18n"] : depth0),{"name":"if","hash":{},"fn":container.program(5, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + ">"
    + container.escapeExpression(((helper = (helper = helpers.label || (depth0 != null ? depth0.label : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(alias1,{"name":"label","hash":{},"data":data}) : helper)))
    + "</span>\r\n";
},"5":function(container,depth0,helpers,partials,data) {
    var helper;

  return " data-i18n=\""
    + container.escapeExpression(((helper = (helper = helpers["label-i18n"] || (depth0 != null ? depth0["label-i18n"] : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"label-i18n","hash":{},"data":data}) : helper)))
    + "\"";
},"7":function(container,depth0,helpers,partials,data) {
    return " rad";
},"9":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1, helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "        <input id=\""
    + alias4(((helper = (helper = helpers.randomId || (data && data.randomId)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"randomId","hash":{},"data":data}) : helper)))
    + "\" type=\"checkbox\"  "
    + ((stack1 = helpers["if"].call(alias1,(depths[1] != null ? depths[1].disabled : depths[1]),{"name":"if","hash":{},"fn":container.program(10, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + " "
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.value : depth0),{"name":"if","hash":{},"fn":container.program(12, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "></input>\r\n        <label for=\""
    + alias4(((helper = (helper = helpers.randomId || (data && data.randomId)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"randomId","hash":{},"data":data}) : helper)))
    + "\">\r\n"
    + ((stack1 = (helpers.neq || (depth0 && depth0.neq) || alias2).call(alias1,(depth0 != null ? depth0["label-position"] : depth0),"before",{"name":"neq","hash":{},"fn":container.program(14, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "        </label>\r\n";
},"10":function(container,depth0,helpers,partials,data) {
    return " disabled";
},"12":function(container,depth0,helpers,partials,data) {
    return "checked";
},"14":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : {};

  return "            <span"
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0["label-i18n"] : depth0),{"name":"if","hash":{},"fn":container.program(5, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + ">"
    + container.escapeExpression(((helper = (helper = helpers.label || (depth0 != null ? depth0.label : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(alias1,{"name":"label","hash":{},"data":data}) : helper)))
    + "</span>\r\n";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1, alias1=depth0 != null ? depth0 : {};

  return ((stack1 = (helpers.cmp || (depth0 && depth0.cmp) || helpers.helperMissing).call(alias1,((stack1 = (data && data.data)) && stack1.length),">",20,{"name":"cmp","hash":{},"fn":container.program(1, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "<div class=\"checkbox-container\">\r\n"
    + ((stack1 = helpers.each.call(alias1,(data && data.data),{"name":"each","hash":{},"fn":container.program(3, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "</div>";
},"useData":true,"useDepths":true});
templates['form/fields/multiswitch/multiswitch'] = template({"1":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing;

  return "<div class=\"multiswitch\">\r\n"
    + ((stack1 = (helpers.eq || (depth0 && depth0.eq) || alias2).call(alias1,(depth0 != null ? depth0["label-position"] : depth0),"before",{"name":"eq","hash":{},"fn":container.program(2, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "  <div style=\"display: inline-block\" data-id="
    + container.escapeExpression(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias2),(typeof helper === "function" ? helper.call(alias1,{"name":"id","hash":{},"data":data}) : helper)))
    + "\r\n    class=\"checkbox checkbox-slider--b"
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.onColor : depth0),{"name":"if","hash":{},"fn":container.program(5, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\">\r\n    <label>\r\n      <input type=\"checkbox\" "
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.value : depth0),{"name":"if","hash":{},"fn":container.program(7, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + ">\r\n"
    + ((stack1 = (helpers.neq || (depth0 && depth0.neq) || alias2).call(alias1,(depth0 != null ? depth0["label-position"] : depth0),"before",{"name":"neq","hash":{},"fn":container.program(9, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "    </label>\r\n  </div>\r\n</div>\r\n";
},"2":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : {};

  return "    <span"
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0["label-i18n"] : depth0),{"name":"if","hash":{},"fn":container.program(3, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + ">"
    + container.escapeExpression(((helper = (helper = helpers.label || (depth0 != null ? depth0.label : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(alias1,{"name":"label","hash":{},"data":data}) : helper)))
    + "</span>\r\n";
},"3":function(container,depth0,helpers,partials,data) {
    var helper;

  return " data-i18n=\""
    + container.escapeExpression(((helper = (helper = helpers["label-i18n"] || (depth0 != null ? depth0["label-i18n"] : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"label-i18n","hash":{},"data":data}) : helper)))
    + "\"";
},"5":function(container,depth0,helpers,partials,data) {
    var helper;

  return " checkbox-slider-"
    + container.escapeExpression(((helper = (helper = helpers.onColor || (depth0 != null ? depth0.onColor : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"onColor","hash":{},"data":data}) : helper)));
},"7":function(container,depth0,helpers,partials,data) {
    return "checked";
},"9":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : {};

  return "        <span"
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0["label-i18n"] : depth0),{"name":"if","hash":{},"fn":container.program(3, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + ">"
    + container.escapeExpression(((helper = (helper = helpers.label || (depth0 != null ? depth0.label : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(alias1,{"name":"label","hash":{},"data":data}) : helper)))
    + "</span>\r\n";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = helpers.each.call(depth0 != null ? depth0 : {},(data && data.data),{"name":"each","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "");
},"useData":true});
templates['form/fields/number/number'] = template({"1":function(container,depth0,helpers,partials,data) {
    return " readonly ";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "<input type=\"text\" class=\"form-text form-control\"\r\n  data-id=\""
    + alias4(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"id","hash":{},"data":data}) : helper)))
    + "\" name=\""
    + alias4(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"id","hash":{},"data":data}) : helper)))
    + "\"\r\n  "
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.readOnly : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\r\n  data-i18n=\"[placeholder]"
    + alias4(((helper = (helper = helpers["placeholder-i18n"] || (depth0 != null ? depth0["placeholder-i18n"] : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"placeholder-i18n","hash":{},"data":data}) : helper)))
    + "\" inputmode=\"numeric\">";
},"useData":true});
templates['form/fields/pagelimit/pagelimit'] = template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper;

  return "<div data-id=\""
    + container.escapeExpression(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"id","hash":{},"data":data}) : helper)))
    + "\" class=\"cont page-limit-picker\">\r\n  <div class=\"form-control contain\">\r\n    <label>\r\n      <input type=\"checkbox\" class=\"page-limit-toggle\">\r\n      <span data-i18n=\"components.page-limit.limit-printing\"></span>\r\n    </label>\r\n    <div class=\"row no-gutters panel\">\r\n      <div class=\"col-md-3\">\r\n        <div class=\"btn-group-vertical btn-group-lg limit-type\"\r\n          style=\"width:100%\" data-toggle=\"buttons\">\r\n          <label class=\"btn btn-flat btn-default active\">\r\n            <input type=\"radio\" name=\"limit-type\" value=\"basic\"\r\n              data-id=\"basic\" autocomplete=\"off\" checked>\r\n            <span data-i18n=\"components.page-limit.basic\"></span>\r\n          </label>\r\n          <label class=\"btn btn-flat btn-default\">\r\n            <input type=\"radio\" name=\"limit-type\" value=\"bycolor\"\r\n              data-id=\"bycolor\" autocomplete=\"off\">\r\n            <span data-i18n=\"components.page-limit.by-color\"></span>\r\n          </label>\r\n          <label class=\"btn btn-flat btn-default\">\r\n            <input type=\"radio\" name=\"limit-type\" value=\"bytype\"\r\n              data-id=\"bytype\" autocomplete=\"off\">\r\n            <span data-i18n=\"components.page-limit.by-type\"></span>\r\n          </label>\r\n          <label class=\"btn btn-flat btn-default\">\r\n            <input type=\"radio\" name=\"limit-type\" value=\"adv\"\r\n              data-id=\"adv\" autocomplete=\"off\">\r\n            <span data-i18n=\"components.page-limit.advanced\"></span>\r\n          </label>\r\n        </div>\r\n      </div>\r\n      <div class=\"col-md-9\">\r\n        <div class=\"page-limit-form well\" style=\"display:none;\"\r\n          data-type=\"basic\">\r\n          <span data-i18n=\"components.page-limit.limit\"></span>:\r\n          <input data-id=\"limit\" type=\"number\" class=\"form-control\">\r\n          &nbsp;&nbsp;\r\n          <span data-i18n=\"components.page-limit.remaining\"></span>:\r\n          <input data-id=\"remaining\" type=\"number\" class=\"form-control\">\r\n          &nbsp;&nbsp;\r\n          <span data-i18n=\"components.page-limit.lock\"></span>:\r\n          <div style=\"display: inline-block\"\r\n            class=\"checkbox checkbox-slider--b checkbox-slider-warning\">\r\n            <label>\r\n              <input type=\"checkbox\" data-id=\"lock\">\r\n              <span></span>\r\n            </label>\r\n          </div>\r\n        </div>\r\n        <div class=\"page-limit-form well\" style=\"display:none;\"\r\n          data-type=\"bycolor\">\r\n          <div class=\"form-group\" data-subtype=\"mono\">\r\n            <label>\r\n              <span data-i18n=\"components.page-limit.mono\"></span>\r\n            </label>\r\n            <span data-i18n=\"components.page-limit.limit\"></span>:\r\n            <input data-id=\"limit\" type=\"number\" class=\"form-control\">\r\n            &nbsp;&nbsp;\r\n            <span data-i18n=\"components.page-limit.remaining\"></span>:\r\n            <input data-id=\"remaining\" type=\"number\" class=\"form-control\">\r\n            &nbsp;&nbsp;\r\n            <span data-i18n=\"components.page-limit.lock\"></span>:\r\n            <div style=\"display: inline-block\"\r\n              class=\"checkbox checkbox-slider--b checkbox-slider-warning\">\r\n              <label>\r\n                <input type=\"checkbox\" data-id=\"lock\">\r\n                <span></span>\r\n              </label>\r\n            </div>\r\n          </div>\r\n          <div class=\"form-group\" data-subtype=\"color\">\r\n            <label>\r\n              <span data-i18n=\"components.page-limit.color\"></span>\r\n            </label>\r\n            <span data-i18n=\"components.page-limit.limit\"></span>:\r\n            <input data-id=\"limit\" type=\"number\" class=\"form-control\">\r\n            &nbsp;&nbsp;\r\n            <span data-i18n=\"components.page-limit.remaining\"></span>:\r\n            <input data-id=\"remaining\" type=\"number\" class=\"form-control\">\r\n            &nbsp;&nbsp;\r\n            <span data-i18n=\"components.page-limit.lock\"></span>:\r\n            <div style=\"display: inline-block\"\r\n              class=\"checkbox checkbox-slider--b checkbox-slider-warning\">\r\n              <label>\r\n                <input type=\"checkbox\" data-id=\"lock\">\r\n                <span></span>\r\n              </label>\r\n            </div>\r\n          </div>\r\n        </div>\r\n        <div class=\"page-limit-form well\" style=\"display:none;\"\r\n          data-type=\"bytype\">\r\n          <div class=\"form-group\" data-subtype=\"print\">\r\n            <label>\r\n              <span data-i18n=\"components.page-limit.print\"></span>\r\n            </label>\r\n            <span data-i18n=\"components.page-limit.limit\"></span>:\r\n            <input data-id=\"limit\" type=\"number\" class=\"form-control\">\r\n            &nbsp;&nbsp;\r\n            <span data-i18n=\"components.page-limit.remaining\"></span>:\r\n            <input data-id=\"remaining\" type=\"number\" class=\"form-control\">\r\n            &nbsp;&nbsp;\r\n            <span data-i18n=\"components.page-limit.lock\"></span>:\r\n            <div style=\"display: inline-block\"\r\n              class=\"checkbox checkbox-slider--b checkbox-slider-warning\">\r\n              <label>\r\n                <input type=\"checkbox\" data-id=\"lock\">\r\n                <span></span>\r\n              </label>\r\n            </div>\r\n          </div>\r\n          <div class=\"form-group\" data-subtype=\"copy\">\r\n            <label>\r\n              <span data-i18n=\"components.page-limit.copy\"></span>\r\n            </label>\r\n            <span data-i18n=\"components.page-limit.limit\"></span>:\r\n            <input data-id=\"limit\" type=\"number\" class=\"form-control\">\r\n            &nbsp;&nbsp;\r\n            <span data-i18n=\"components.page-limit.remaining\"></span>:\r\n            <input data-id=\"remaining\" type=\"number\" class=\"form-control\">\r\n            &nbsp;&nbsp;\r\n            <span data-i18n=\"components.page-limit.lock\"></span>:\r\n            <div style=\"display: inline-block\"\r\n              class=\"checkbox checkbox-slider--b checkbox-slider-warning\">\r\n              <label>\r\n                <input type=\"checkbox\" data-id=\"lock\">\r\n                <span></span>\r\n              </label>\r\n            </div>\r\n          </div>\r\n        </div>\r\n        <div class=\"page-limit-form well\" style=\"display:none;\"\r\n          data-type=\"adv\">\r\n          <div class=\"form-group\" data-subtype=\"monoprint\">\r\n            <label>\r\n              <span data-i18n=\"components.page-limit.mono\"></span>\r\n              <span data-i18n=\"components.page-limit.print\"></span>\r\n            </label>\r\n            <span data-i18n=\"components.page-limit.limit\"></span>:\r\n            <input data-id=\"limit\" type=\"number\" class=\"form-control\">\r\n            &nbsp;&nbsp;\r\n            <span data-i18n=\"components.page-limit.remaining\"></span>:\r\n            <input data-id=\"remaining\" type=\"number\" class=\"form-control\">\r\n            &nbsp;&nbsp;\r\n            <span data-i18n=\"components.page-limit.lock\"></span>:\r\n            <div style=\"display: inline-block\"\r\n              class=\"checkbox checkbox-slider--b checkbox-slider-warning\">\r\n              <label>\r\n                <input type=\"checkbox\" data-id=\"lock\">\r\n                <span></span>\r\n              </label>\r\n            </div>\r\n          </div>\r\n          <div class=\"form-group\" data-subtype=\"monocopy\">\r\n            <label>\r\n              <span data-i18n=\"components.page-limit.mono\"></span>\r\n              <span data-i18n=\"components.page-limit.copy\"></span>\r\n            </label>\r\n            <span data-i18n=\"components.page-limit.limit\"></span>:\r\n            <input data-id=\"limit\" type=\"number\" class=\"form-control\">\r\n            &nbsp;&nbsp;\r\n            <span data-i18n=\"components.page-limit.remaining\"></span>:\r\n            <input data-id=\"remaining\" type=\"number\" class=\"form-control\">\r\n            &nbsp;&nbsp;\r\n            <span data-i18n=\"components.page-limit.lock\"></span>:\r\n            <div style=\"display: inline-block\"\r\n              class=\"checkbox checkbox-slider--b checkbox-slider-warning\">\r\n              <label>\r\n                <input type=\"checkbox\" data-id=\"lock\">\r\n                <span></span>\r\n              </label>\r\n            </div>\r\n          </div>\r\n          <div class=\"form-group\" data-subtype=\"colorprint\">\r\n            <label>\r\n              <span data-i18n=\"components.page-limit.color\"></span>\r\n              <span data-i18n=\"components.page-limit.print\"></span>\r\n            </label>\r\n            <span data-i18n=\"components.page-limit.limit\"></span>:\r\n            <input data-id=\"limit\" type=\"number\" class=\"form-control\">\r\n            &nbsp;&nbsp;\r\n            <span data-i18n=\"components.page-limit.remaining\"></span>:\r\n            <input data-id=\"remaining\" type=\"number\" class=\"form-control\">\r\n            &nbsp;&nbsp;\r\n            <span data-i18n=\"components.page-limit.lock\"></span>:\r\n            <div style=\"display: inline-block\"\r\n              class=\"checkbox checkbox-slider--b checkbox-slider-warning\">\r\n              <label>\r\n                <input type=\"checkbox\" data-id=\"lock\">\r\n                <span></span>\r\n              </label>\r\n            </div>\r\n          </div>\r\n          <div class=\"form-group\" data-subtype=\"colorcopy\">\r\n            <label>\r\n              <span data-i18n=\"components.page-limit.color\"></span>\r\n              <span data-i18n=\"components.page-limit.copy\"></span>\r\n            </label>\r\n            <span data-i18n=\"components.page-limit.limit\"></span>:\r\n            <input data-id=\"limit\" type=\"number\" class=\"form-control\">\r\n            &nbsp;&nbsp;\r\n            <span data-i18n=\"components.page-limit.remaining\"></span>:\r\n            <input data-id=\"remaining\" type=\"number\" class=\"form-control\">\r\n            &nbsp;&nbsp;\r\n            <span data-i18n=\"components.page-limit.lock\"></span>:\r\n            <div style=\"display: inline-block\"\r\n              class=\"checkbox checkbox-slider--b checkbox-slider-warning\">\r\n              <label>\r\n                <input type=\"checkbox\" data-id=\"lock\">\r\n                <span></span>\r\n              </label>\r\n            </div>\r\n          </div>\r\n        </div>\r\n      </div>\r\n    </div>\r\n  </div>\r\n</div>";
},"useData":true});
templates['form/fields/password/password'] = template({"1":function(container,depth0,helpers,partials,data) {
    return "  <div class=\"input-group\">\r\n";
},"3":function(container,depth0,helpers,partials,data) {
    return "  </div>\r\n";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return ((stack1 = helpers.unless.call(alias1,(depth0 != null ? depth0.icon : depth0),{"name":"unless","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\r\n  <input type=\"password\" class=\"form-text form-control\"\r\n    data-id=\""
    + alias4(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"id","hash":{},"data":data}) : helper)))
    + "\" name=\""
    + alias4(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"id","hash":{},"data":data}) : helper)))
    + "\"\r\n    autocomplete=\"new-password\"\r\n    placeholder=\""
    + alias4(((helper = (helper = helpers.placeholder || (depth0 != null ? depth0.placeholder : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"placeholder","hash":{},"data":data}) : helper)))
    + "\">\r\n  <span class=\"input-group-btn\">\r\n    <button class=\"btn btn-default btn-flat\" type=\"button\">\r\n      <i class=\"fa fa-fw fa-eye-slash\"></i>\r\n    </button>\r\n  </span>\r\n\r\n"
    + ((stack1 = helpers.unless.call(alias1,(depth0 != null ? depth0.icon : depth0),{"name":"unless","hash":{},"fn":container.program(3, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "");
},"useData":true});
templates['form/fields/pdfviewer/pdfviewer'] = template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper;

  return "<iframe\r\n  data-id=\""
    + container.escapeExpression(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"id","hash":{},"data":data}) : helper)))
    + "\"\r\n  style=\"resize:vertical;width: 100%; height: 600px;border: 1px solid rgb(200, 200, 200);\"\r\n  allowfullscreen\r\n>\r\n</iframe>";
},"useData":true});
templates['form/fields/permissions/permissions'] = template({"1":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "            <div class=\"checkboxb\">\r\n              <input type=\"checkbox\" id=\"perm-"
    + alias4(((helper = (helper = helpers.k || (depth0 != null ? depth0.k : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"k","hash":{},"data":data}) : helper)))
    + "\" data-id=\""
    + alias4(((helper = (helper = helpers.k || (depth0 != null ? depth0.k : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"k","hash":{},"data":data}) : helper)))
    + "\" "
    + ((stack1 = (helpers.eq || (depth0 && depth0.eq) || alias2).call(alias1,(depth0 != null ? depth0.k : depth0),"read",{"name":"eq","hash":{},"fn":container.program(2, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + ">\r\n              <label for=\"perm-"
    + alias4(((helper = (helper = helpers.k || (depth0 != null ? depth0.k : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"k","hash":{},"data":data}) : helper)))
    + "\" data-i18n=\""
    + alias4(((helper = (helper = helpers.i18n || (depth0 != null ? depth0.i18n : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"i18n","hash":{},"data":data}) : helper)))
    + "\">\r\n              </label>\r\n            </div>                    \r\n";
},"2":function(container,depth0,helpers,partials,data) {
    return "checked";
},"4":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "            <th class=\"text-center\">\r\n              <span style=\"cursor: default\" data-i18n=\""
    + alias4(((helper = (helper = helpers.i18n || (depth0 != null ? depth0.i18n : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"i18n","hash":{},"data":data}) : helper)))
    + "_short;[title]"
    + alias4(((helper = (helper = helpers.i18n || (depth0 != null ? depth0.i18n : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"i18n","hash":{},"data":data}) : helper)))
    + "\"></span>\r\n            </th>\r\n";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : {};

  return "<div class=\"col-xs-12 hidden\">\r\n  <div class=\"form-group\">\r\n    <label>Roles:</label>\r\n    <select data-id=\"role-select\">\r\n    </select>\r\n  </div>\r\n</div>\r\n<div class=\"col-xs-12 hidden\">\r\n  <div class=\"form-group hidden\">\r\n    <label>Users:</label>\r\n    <select data-id=\"user-select\">\r\n    </select>\r\n  </div>\r\n</div>\r\n<div class=\"hidden\">\r\n  <div class=\"col-sm-8\">\r\n    <div class=\"form-group\">\r\n      <label>Views:</label>\r\n      <div class=\"well well-sm\">\r\n        <div class=\"tree-search form-group\">\r\n          <div class=\"input-group\">\r\n            <span class=\"input-group-addon\">\r\n              <i class=\"fa fa-fw fa-search\"></i>\r\n            </span>\r\n            <input type=\"text\" class=\"form-control tree-search-input\" />\r\n            <i class=\"searchclear fa fa-times\"></i>\r\n          </div>\r\n        </div>\r\n        <div class=\"view-tree compact\">\r\n        </div>\r\n        <div class=\"form-group\">\r\n          <button type=\"button\" data-id=\"btn-select-all\" class=\"btn btn-flat btn-success\">Select All</button>\r\n          <button type=\"button\" data-id=\"btn-select-none\" class=\"btn btn-flat btn-danger pull-right\">Clear Selection</button>\r\n        </div>\r\n      </div>\r\n    </div>\r\n  </div>\r\n  <div class=\"col-sm-4\">\r\n    <div>\r\n      <div class=\"col-sm-12 col-xs-6\">\r\n      \r\n        <div class=\"form-group\">\r\n          <label data-i18n=\"app.permissions.default-permissions\">Default Permissions:</label>\r\n          <div class=\"default-permissions well well-sm\" style=\"padding-right:25px;display:table;margin: 10px auto;\">\r\n"
    + ((stack1 = helpers.each.call(alias1,(depth0 != null ? depth0.ap : depth0),{"name":"each","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "          </div>\r\n        </div>\r\n      </div>\r\n        \r\n      <div class=\"col-sm-12 col-xs-6\">\r\n        \r\n        <div style=\"text-align: center;margin: 10px auto;\">\r\n          <button type=\"button\" data-id=\"add-button\" class=\"btn btn-flat btn-primary btn-lg\">\r\n            Add\r\n            <i class=\"fa fa-long-arrow-down\"></i> \r\n          </button>\r\n        </div>\r\n        \r\n      </div>\r\n    </div>\r\n  </div>\r\n</div>\r\n<div class=\"col-xs-12\">\r\n  <div class=\"form-group hidden\">\r\n    <label>Details:</label>\r\n    <div class=\"table-responsive\">\r\n      <table class=\"table table-striped table-condensed\" style=\"background-color: white\">\r\n        <thead>\r\n          <tr>\r\n            <th colspan=\"2\">\r\n            \r\n"
    + ((stack1 = helpers.each.call(alias1,(depth0 != null ? depth0.ap : depth0),{"name":"each","hash":{},"fn":container.program(4, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "      \r\n          </tr>\r\n        </thead>\r\n        <tbody></tbody>\r\n      </table>\r\n    </div>\r\n  </div>\r\n</div>";
},"useData":true});
templates['form/fields/recurrence/recurrence'] = template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    return "<div class=\"recurrence-picker\">\r\n  <div class=\"form-control contain\">\r\n    <label class=\"recurrence-toggle\">\r\n      <input type=\"checkbox\" checked>\r\n      <span data-i18n=\"components.recurrence.recurrence\"></span>\r\n    </label>\r\n    <div data-id=\"recurrence-form\" class=\"no-gutters panel\" style=\"display:none;\">\r\n      <div class=\"row\">\r\n        <div class=\"btn-group btn-group-justified recurrence-type\" style=\"width:100%\" data-toggle=\"buttons\">\r\n          <label class=\"btn btn-flat btn-default active\">\r\n            <input type=\"radio\" name=\"recurrence-type\" value=\"hour\" autocomplete=\"off\" checked>\r\n            <span data-i18n=\"components.recurrence.hour\">\r\n            </span>\r\n          </label>\r\n          <label class=\"btn btn-flat btn-default\">\r\n            <input type=\"radio\" name=\"recurrence-type\" value=\"day\" autocomplete=\"off\">\r\n            <span data-i18n=\"components.recurrence.day\">\r\n            </span>\r\n          </label>\r\n          <label class=\"btn btn-flat btn-default\">\r\n            <input type=\"radio\" name=\"recurrence-type\" value=\"week\" autocomplete=\"off\">\r\n            <span data-i18n=\"components.recurrence.week\">\r\n            </span>\r\n          </label>\r\n          <label class=\"btn btn-flat btn-default\">\r\n            <input type=\"radio\" name=\"recurrence-type\" value=\"month\" autocomplete=\"off\">\r\n            <span data-i18n=\"components.recurrence.month\">\r\n            </span>\r\n          </label>\r\n          <label class=\"btn btn-flat btn-default\">\r\n            <input type=\"radio\" name=\"recurrence-type\" value=\"year\" autocomplete=\"off\">\r\n            <span data-i18n=\"components.recurrence.year\">\r\n            </span>\r\n          </label>\r\n        </div>\r\n      </div>\r\n      <div class=\"row well well-sm\">\r\n        <div class=\"recurrence-form\" data-id=\"form-hour\">\r\n          <label class=\"well\" data-i18ninj=\"components.recurrence.every_x_hours\">\r\n            <input type=\"radio\" class=\"type-opt\" name=\"hour-radio\" value=\"1\" data-i18nkeep=\"RADIO\" checked>\r\n            Every <input type=\"number\" class=\"form-control\" data-i18nkeep=\"HOURS\" value=\"1\" name=\"hours\" min=\"1\" max=\"24\"> hour(s).\r\n          </label>\r\n        </div>\r\n        <div class=\"recurrence-form\" data-id=\"form-day\" width=\"100%\">\r\n          <label class=\"well\" data-i18ninj=\"components.recurrence.every_x_days\">\r\n            <input type=\"radio\" class=\"type-opt\" name=\"day-radio\" value=\"1\" data-i18nkeep=\"RADIO\" checked>\r\n            <input type=\"number\" class=\"form-control\" value=\"1\" name=\"days\" min=\"1\" max=\"31\" data-i18nkeep=\"DAYS\">\r\n          </label>\r\n          <label>\r\n            <input type=\"radio\" class=\"type-opt\" name=\"day-radio\" value=\"2\"data-i18nkeep=\"RADIO\">\r\n            <span data-i18n=\"components.recurrence.every_day\"></span>\r\n          </label>\r\n        </div>\r\n        <div class=\"recurrence-form\" data-id=\"form-week\">\r\n          <label class=\"well\" data-i18ninj=\"components.recurrence.every_x_weeks\">\r\n            <input type=\"radio\" class=\"type-opt\" name=\"week-radio\" value=\"1\" data-i18nkeep=\"RADIO\" checked>\r\n            <input type=\"number\" class=\"form-control\" value=\"1\" name=\"weeks\" min=\"1\" max=\"52\" data-i18nkeep=\"WEEKS\">\r\n\r\n            <div class=\"well well-sm\" data-i18nkeep=\"WEEKDAYS\">\r\n              <div class=\"weekdays btn-group btn-group-sm btn-group-justified\" style=\"width:100%\" data-toggle=\"buttons\">\r\n                <label class=\"btn btn-flat btn-default active\">\r\n                  <input type=\"checkbox\" value=\"mon\" autocomplete=\"off\" checked>\r\n                  <span data-i18n=\"components.recurrence.weekdays_abrv.monday\"></span>\r\n                </label>\r\n                <label class=\"btn btn-flat btn-default\">\r\n                  <input type=\"checkbox\" value=\"tue\" autocomplete=\"off\">\r\n                  <span data-i18n=\"components.recurrence.weekdays_abrv.tuesday\"></span>\r\n                </label>\r\n                <label class=\"btn btn-flat btn-default\">\r\n                  <input type=\"checkbox\" value=\"wed\" autocomplete=\"off\">\r\n                  <span data-i18n=\"components.recurrence.weekdays_abrv.wednesday\"></span>\r\n                </label>\r\n                <label class=\"btn btn-flat btn-default\">\r\n                  <input type=\"checkbox\" value=\"thu\" autocomplete=\"off\">\r\n                  <span data-i18n=\"components.recurrence.weekdays_abrv.thursday\"></span>\r\n                </label>\r\n                <label class=\"btn btn-flat btn-default\">\r\n                  <input type=\"checkbox\" value=\"fri\" autocomplete=\"off\">\r\n                  <span data-i18n=\"components.recurrence.weekdays_abrv.friday\"></span>\r\n                </label>\r\n                <label class=\"btn btn-flat btn-default\">\r\n                  <input type=\"checkbox\" value=\"sat\" autocomplete=\"off\">\r\n                  <span data-i18n=\"components.recurrence.weekdays_abrv.saturday\"></span>\r\n                </label>\r\n                <label class=\"btn btn-flat btn-default\">\r\n                  <input type=\"checkbox\" value=\"sun\" autocomplete=\"off\">\r\n                  <span data-i18n=\"components.recurrence.weekdays_abrv.sunday\"></span>\r\n                </label>\r\n              </div>\r\n            </div>\r\n          </label>\r\n        </div>\r\n        <div class=\"recurrence-form\" data-id=\"form-month\">\r\n          <label class=\"op1 well\" data-i18ninj=\"components.recurrence.on_the_x_day_of_month\">\r\n            <input type=\"radio\" class=\"type-opt\" name=\"month-radio\" value=\"1\" data-i18nkeep=\"RADIO\" checked>\r\n            <input type=\"number\" class=\"form-control\" value=\"1\" name=\"day\" min=\"1\" max=\"31\" data-i18nkeep=\"DAY\">\r\n            <input type=\"number\" class=\"form-control\" value=\"1\" name=\"months\" min=\"1\" max=\"12\" data-i18nkeep=\"MONTHS\">\r\n          </label>\r\n          <label class=\"op2\" data-i18ninj=\"components.recurrence.on_the_xth_day_of_month\">\r\n            <input type=\"radio\" class=\"type-opt\" name=\"month-radio\" value=\"2\" data-i18nkeep=\"RADIO\" />\r\n            <select class=\"form-control ord\" data-i18nkeep=\"ORDINAL\">\r\n              <option value=\"1\" data-i18n=\"components.recurrence.ordinals.first\"></option>\r\n              <option value=\"2\" data-i18n=\"components.recurrence.ordinals.second\"></option>\r\n              <option value=\"3\" data-i18n=\"components.recurrence.ordinals.third\"></option>\r\n              <option value=\"4\" data-i18n=\"components.recurrence.ordinals.fourth\"></option>\r\n              <option value=\"5\" data-i18n=\"components.recurrence.ordinals.last\"></option>\r\n            </select>\r\n            <div class=\"well well-sm weekdays\" data-i18nkeep=\"WEEKDAY\">\r\n              <div class=\"btn-group btn-group-sm btn-group-justified month-day-radio1\" style=\"width:100%\" data-toggle=\"buttons\">\r\n                <label class=\"btn btn-flat btn-default active\">\r\n                  <input type=\"radio\" name=\"month-day-radio\" value=\"day\" autocomplete=\"off\" checked>\r\n                  <span data-i18n=\"components.recurrence.day\"></span>\r\n                </label>\r\n                <label class=\"btn btn-flat btn-default\">\r\n                  <input type=\"radio\" name=\"month-day-radio\" value=\"wday\" autocomplete=\"off\">\r\n                  <span data-i18n=\"components.recurrence.weekday\"></span>\r\n                </label>\r\n                <label class=\"btn btn-flat btn-default\">\r\n                  <input type=\"radio\" name=\"month-day-radio\" value=\"weday\" autocomplete=\"off\">\r\n                  <span data-i18n=\"components.recurrence.weekend_day\"></span>\r\n                </label>\r\n              </div>\r\n              <div class=\"btn-group btn-group-sm btn-group-justified month-day-radio2\" style=\"width:100%\" data-toggle=\"buttons\">\r\n                <label class=\"btn btn-flat btn-default\">\r\n                  <input type=\"radio\" name=\"month-day-radio\" value=\"mon\" autocomplete=\"off\">\r\n                  <span data-i18n=\"components.recurrence.weekdays_abrv.monday\"></span>\r\n                </label>\r\n                <label class=\"btn btn-flat btn-default\">\r\n                  <input type=\"radio\" name=\"month-day-radio\" value=\"tue\" autocomplete=\"off\">\r\n                  <span data-i18n=\"components.recurrence.weekdays_abrv.tuesday\"></span>\r\n                </label>\r\n                <label class=\"btn btn-flat btn-default\">\r\n                  <input type=\"radio\" name=\"month-day-radio\" value=\"wed\" autocomplete=\"off\">\r\n                  <span data-i18n=\"components.recurrence.weekdays_abrv.wednesday\"></span>\r\n                </label>\r\n                <label class=\"btn btn-flat btn-default\">\r\n                  <input type=\"radio\" name=\"month-day-radio\" value=\"thu\" autocomplete=\"off\">\r\n                  <span data-i18n=\"components.recurrence.weekdays_abrv.thursday\"></span>\r\n                </label>\r\n                <label class=\"btn btn-flat btn-default\">\r\n                  <input type=\"radio\" name=\"month-day-radio\" value=\"fri\" autocomplete=\"off\">\r\n                  <span data-i18n=\"components.recurrence.weekdays_abrv.friday\"></span>\r\n                </label>\r\n                <label class=\"btn btn-flat btn-default\">\r\n                  <input type=\"radio\" name=\"month-day-radio\" value=\"sat\" autocomplete=\"off\">\r\n                  <span data-i18n=\"components.recurrence.weekdays_abrv.saturday\"></span>\r\n                </label>\r\n                <label class=\"btn btn-flat btn-default\">\r\n                  <input type=\"radio\" name=\"month-day-radio\" value=\"sun\" autocomplete=\"off\">\r\n                  <span data-i18n=\"components.recurrence.weekdays_abrv.sunday\"></span>\r\n                </label>\r\n              </div>\r\n            </div>\r\n            <input type=\"number\" class=\"form-control\" value=\"1\" name=\"months\" min=\"1\" max=\"12\" data-i18nkeep=\"MONTHS\">\r\n          </label>\r\n        </div>\r\n        <div class=\"recurrence-form\" data-id=\"form-year\">\r\n          <label class=\"op1 well\" data-i18ninj=\"components.recurrence.on_the_x_day_of_year\">\r\n            <input type=\"radio\" class=\"type-opt\" value=\"1\" name=\"year-radio\" data-i18nkeep=\"RADIO\" checked>\r\n            <input type=\"number\" class=\"form-control\" value=\"1\" name=\"day\" min=\"1\" max=\"31\" data-i18nkeep=\"DAY\">\r\n            <select class=\"form-control\" data-i18nkeep=\"MONTH\">\r\n              <option data-i18n=\"components.recurrence.months.january\" value=\"1\"></option>\r\n              <option data-i18n=\"components.recurrence.months.february\" value=\"2\"></option>\r\n              <option data-i18n=\"components.recurrence.months.march\" value=\"3\"></option>\r\n              <option data-i18n=\"components.recurrence.months.april\" value=\"4\"></option>\r\n              <option data-i18n=\"components.recurrence.months.may\" value=\"5\"></option>\r\n              <option data-i18n=\"components.recurrence.months.june\" value=\"6\"></option>\r\n              <option data-i18n=\"components.recurrence.months.july\" value=\"7\"></option>\r\n              <option data-i18n=\"components.recurrence.months.august\" value=\"8\"></option>\r\n              <option data-i18n=\"components.recurrence.months.september\" value=\"9\"></option>\r\n              <option data-i18n=\"components.recurrence.months.october\" value=\"10\"></option>\r\n              <option data-i18n=\"components.recurrence.months.november\" value=\"11\"></option>\r\n              <option data-i18n=\"components.recurrence.months.december\" value=\"12\"></option>\r\n            </select>\r\n          </label>\r\n          <label class=\"op2\" data-i18ninj=\"components.recurrence.on_the_xth_day_of_year\">\r\n            <input type=\"radio\" class=\"type-opt\" value=\"2\" name=\"year-radio\" data-i18nkeep=\"RADIO\">\r\n            <select class=\"form-control ord\" data-i18nkeep=\"ORDINAL\">\r\n              <option value=\"1\" data-i18n=\"components.recurrence.ordinals.first\"></option>\r\n              <option value=\"2\" data-i18n=\"components.recurrence.ordinals.second\"></option>\r\n              <option value=\"3\" data-i18n=\"components.recurrence.ordinals.third\"></option>\r\n              <option value=\"4\" data-i18n=\"components.recurrence.ordinals.fourth\"></option>\r\n              <option value=\"5\" data-i18n=\"components.recurrence.ordinals.last\"></option>\r\n            </select>\r\n            <div class=\"well well-sm weekdays\" data-i18nkeep=\"WEEKDAY\">\r\n              <div class=\"btn-group btn-group-sm btn-group-justified year-day-radio1\" style=\"width:100%\" data-toggle=\"buttons\">\r\n                <label class=\"btn btn-flat btn-default active\">\r\n                  <input type=\"radio\" name=\"year-day-radio\" value=\"day\" autocomplete=\"off\" checked>\r\n                    <span data-i18n=\"components.recurrence.day\"></span>\r\n                </label>\r\n                <label class=\"btn btn-flat btn-default\">\r\n                  <input type=\"radio\" name=\"year-day-radio\" value=\"wday\" autocomplete=\"off\">\r\n                    <span data-i18n=\"components.recurrence.weekday\"></span>\r\n                </label>\r\n                <label class=\"btn btn-flat btn-default\">\r\n                  <input type=\"radio\" name=\"year-day-radio\" value=\"weday\" autocomplete=\"off\">\r\n                    <span data-i18n=\"components.recurrence.weekend_day\"></span>\r\n                </label>\r\n              </div>\r\n              <div class=\"btn-group btn-group-sm btn-group-justified year-day-radio2\" style=\"width:100%\" data-toggle=\"buttons\">\r\n                <label class=\"btn btn-flat btn-default\">\r\n                  <input type=\"radio\" name=\"year-day-radio\" value=\"mon\" autocomplete=\"off\">\r\n                  <span data-i18n=\"components.recurrence.weekdays_abrv.monday\"></span>\r\n                </label>\r\n                <label class=\"btn btn-flat btn-default\">\r\n                  <input type=\"radio\" name=\"year-day-radio\" value=\"tue\" autocomplete=\"off\">\r\n                  <span data-i18n=\"components.recurrence.weekdays_abrv.tuesday\"></span>\r\n                </label>\r\n                <label class=\"btn btn-flat btn-default\">\r\n                  <input type=\"radio\" name=\"year-day-radio\" value=\"wed\" autocomplete=\"off\">\r\n                  <span data-i18n=\"components.recurrence.weekdays_abrv.wednesday\"></span>\r\n                </label>\r\n                <label class=\"btn btn-flat btn-default\">\r\n                  <input type=\"radio\" name=\"year-day-radio\" value=\"thu\" autocomplete=\"off\">\r\n                  <span data-i18n=\"components.recurrence.weekdays_abrv.thursday\"></span>\r\n                </label>\r\n                <label class=\"btn btn-flat btn-default\">\r\n                  <input type=\"radio\" name=\"year-day-radio\" value=\"fri\" autocomplete=\"off\">\r\n                  <span data-i18n=\"components.recurrence.weekdays_abrv.friday\"></span>\r\n                </label>\r\n                <label class=\"btn btn-flat btn-default\">\r\n                  <input type=\"radio\" name=\"year-day-radio\" value=\"sat\" autocomplete=\"off\">\r\n                  <span data-i18n=\"components.recurrence.weekdays_abrv.saturday\"></span>\r\n                </label>\r\n                <label class=\"btn btn-flat btn-default\">\r\n                  <input type=\"radio\" name=\"year-day-radio\" value=\"sun\" autocomplete=\"off\">\r\n                  <span data-i18n=\"components.recurrence.weekdays_abrv.sunday\"></span>\r\n                </label>\r\n              </div>\r\n            </div>\r\n            <select class=\"form-control month\" data-i18nkeep=\"MONTH\">\r\n              <option data-i18n=\"components.recurrence.months.january\" value=\"1\"></option>\r\n              <option data-i18n=\"components.recurrence.months.february\" value=\"2\"></option>\r\n              <option data-i18n=\"components.recurrence.months.march\" value=\"3\"></option>\r\n              <option data-i18n=\"components.recurrence.months.april\" value=\"4\"></option>\r\n              <option data-i18n=\"components.recurrence.months.may\" value=\"5\"></option>\r\n              <option data-i18n=\"components.recurrence.months.june\" value=\"6\"></option>\r\n              <option data-i18n=\"components.recurrence.months.july\" value=\"7\"></option>\r\n              <option data-i18n=\"components.recurrence.months.august\" value=\"8\"></option>\r\n              <option data-i18n=\"components.recurrence.months.september\" value=\"9\"></option>\r\n              <option data-i18n=\"components.recurrence.months.october\" value=\"10\"></option>\r\n              <option data-i18n=\"components.recurrence.months.november\" value=\"11\"></option>\r\n              <option data-i18n=\"components.recurrence.months.december\" value=\"12\"></option>\r\n            </select>\r\n          </label>\r\n        </div>\r\n      </div>\r\n    </div>\r\n    <div class=\"form-group recurrence-repeat\" style=\"display:none;\">\r\n      <label><span data-i18n=\"components.recurrence.repeats\"></span></label>\r\n      <div class=\"well\">\r\n        <label>\r\n          <input type=\"radio\" value=\"1\" name=\"until\" checked>\r\n          <span data-i18n=\"components.recurrence.forever\"></span>\r\n        </label><br>\r\n        <label>\r\n          <input type=\"radio\" value=\"2\" name=\"until\">\r\n          <span data-i18ninj=\"components.recurrence.x_times\">\r\n            <input class=\"form-control times\" data-i18nkeep=\"TIMES\" type=\"number\" value=\"1\">\r\n          </span>\r\n        </label><br>\r\n        <label>\r\n          <input type=\"radio\" value=\"3\" name=\"until\">\r\n          <span data-i18ninj=\"components.recurrence.until_date\">\r\n            <input class=\"form-control until\" data-i18nkeep=\"DATE\" type=\"text\" data-type=\"datepicker\">\r\n          </span>\r\n        </label>\r\n      </div>\r\n    </div>\r\n  </div>\r\n</div>";
},"useData":true});
templates['form/fields/select/optgroup'] = template({"1":function(container,depth0,helpers,partials,data) {
    var stack1, helper, options, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=helpers.blockHelperMissing, buffer = "";

  stack1 = ((helper = (helper = helpers.value || (depth0 != null ? depth0.value : depth0)) != null ? helper : alias2),(options={"name":"value","hash":{},"fn":container.program(2, data, 0),"inverse":container.noop,"data":data}),(typeof helper === alias3 ? helper.call(alias1,options) : helper));
  if (!helpers.value) { stack1 = alias4.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  stack1 = ((helper = (helper = helpers.value || (depth0 != null ? depth0.value : depth0)) != null ? helper : alias2),(options={"name":"value","hash":{},"fn":container.noop,"inverse":container.program(4, data, 0),"data":data}),(typeof helper === alias3 ? helper.call(alias1,options) : helper));
  if (!helpers.value) { stack1 = alias4.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer;
},"2":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = container.invokePartial(partials["form/fields/select/option"],depth0,{"name":"form/fields/select/option","data":data,"indent":"    ","helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "");
},"4":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = container.invokePartial(partials["form/fields/select/optgroup"],depth0,{"name":"form/fields/select/optgroup","data":data,"indent":"    ","helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "");
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper, options, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", buffer = 
  "<optgroup data-i18n=\"[label]"
    + container.escapeExpression(((helper = (helper = helpers["label-i18n"] || (depth0 != null ? depth0["label-i18n"] : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"label-i18n","hash":{},"data":data}) : helper)))
    + "\">\r\n";
  stack1 = ((helper = (helper = helpers.group || (depth0 != null ? depth0.group : depth0)) != null ? helper : alias2),(options={"name":"group","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data}),(typeof helper === alias3 ? helper.call(alias1,options) : helper));
  if (!helpers.group) { stack1 = helpers.blockHelperMissing.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer + "</optgroup>";
},"usePartial":true,"useData":true});
templates['form/fields/select/option'] = template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "<option data-i18n=\""
    + alias4(((helper = (helper = helpers["text-i18n"] || (depth0 != null ? depth0["text-i18n"] : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"text-i18n","hash":{},"data":data}) : helper)))
    + "\" value=\""
    + alias4(((helper = (helper = helpers.value || (depth0 != null ? depth0.value : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"value","hash":{},"data":data}) : helper)))
    + "\">"
    + alias4(((helper = (helper = helpers.text || (depth0 != null ? depth0.text : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"text","hash":{},"data":data}) : helper)))
    + "</option>";
},"useData":true});
templates['form/fields/select/select'] = template({"1":function(container,depth0,helpers,partials,data) {
    return " readonly ";
},"3":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : {};

  return ((stack1 = helpers["if"].call(alias1,(helpers.has || (depth0 && depth0.has) || helpers.helperMissing).call(alias1,"value",{"name":"has","hash":{},"data":data}),{"name":"if","hash":{},"fn":container.program(4, data, 0),"inverse":container.program(6, data, 0),"data":data})) != null ? stack1 : "");
},"4":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = container.invokePartial(partials["form/fields/select/option"],depth0,{"name":"form/fields/select/option","data":data,"indent":"    ","helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "");
},"6":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = container.invokePartial(partials["form/fields/select/optgroup"],depth0,{"name":"form/fields/select/optgroup","data":data,"indent":"    ","helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "");
},"8":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = helpers.unless.call(depth0 != null ? depth0 : {},(depth0 != null ? depth0.cantReload : depth0),{"name":"unless","hash":{},"fn":container.program(9, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "");
},"9":function(container,depth0,helpers,partials,data) {
    return "    <span class=\"input-group-btn\">\r\n      <button type=\"button\" class=\"reload-btn btn btn-flat btn-primary\">\r\n        <i class=\"fa fa-fw fa-refresh\"></i>\r\n      </button>\r\n    </span>\r\n";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "<select class=\"form-select form-control\" data-id=\""
    + alias4(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"id","hash":{},"data":data}) : helper)))
    + "\"\r\n  "
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.readOnly : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\r\n  name=\""
    + alias4(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"id","hash":{},"data":data}) : helper)))
    + "\" data-i18n=\"[placeholder]"
    + alias4(((helper = (helper = helpers["placeholder-i18n"] || (depth0 != null ? depth0["placeholder-i18n"] : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"placeholder-i18n","hash":{},"data":data}) : helper)))
    + "\">\r\n"
    + ((stack1 = helpers.each.call(alias1,(depth0 != null ? depth0.optionhs : depth0),{"name":"each","hash":{},"fn":container.program(3, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "</select>\r\n"
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.preload : depth0),{"name":"if","hash":{},"fn":container.program(8, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "");
},"usePartial":true,"useData":true});
templates['form/fields/simplegrid/simplegrid'] = template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    return "<div class=\"table-responsive\">\r\n  <table class=\"table table-condensed\">\r\n    <thead>\r\n    </thead>\r\n    <tbody>\r\n    </tbody>\r\n  </table>\r\n</div>";
},"useData":true});
templates['form/fields/slider/slider'] = template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "<input type=\"text\" class=\"form-text form-control\"\r\n  data-id=\""
    + alias4(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"id","hash":{},"data":data}) : helper)))
    + "\" name=\""
    + alias4(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"id","hash":{},"data":data}) : helper)))
    + "\"\r\n  data-i18n=\"[placeholder]"
    + alias4(((helper = (helper = helpers["placeholder-i18n"] || (depth0 != null ? depth0["placeholder-i18n"] : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"placeholder-i18n","hash":{},"data":data}) : helper)))
    + "\">";
},"useData":true});
templates['form/fields/sortable/sortable-item'] = template({"1":function(container,depth0,helpers,partials,data) {
    return "    <i class=\"fa fa-fw fa-times sort-remove\"></i>\r\n";
},"3":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "    <i class=\"fa fa-fw "
    + alias4(((helper = (helper = helpers.icon || (depth0 != null ? depth0.icon : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"icon","hash":{},"data":data}) : helper)))
    + " sort-tool sort-custom-tool\" data-action=\""
    + alias4(((helper = (helper = helpers.action || (depth0 != null ? depth0.action : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"action","hash":{},"data":data}) : helper)))
    + "\"></i>\r\n";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : {};

  return "<li class=\"list-group-item\">\r\n"
    + ((stack1 = helpers.unless.call(alias1,(data && data.cantRemove),{"name":"unless","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "  <div class=\"sort-content\" style=\"display:inline-block\">\r\n  </div>\r\n  <i class=\"fa fa-fw fa-align-justify sort-tool sort-handle\"></i>\r\n"
    + ((stack1 = helpers.each.call(alias1,(data && data.tools),{"name":"each","hash":{},"fn":container.program(3, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "</li>";
},"useData":true});
templates['form/fields/sortable/sortable'] = template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper;

  return "<ul class=\"list-group sortable\" name=\""
    + container.escapeExpression(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"id","hash":{},"data":data}) : helper)))
    + "\">\r\n</ul>\r\n";
},"useData":true});
templates['form/fields/sortaform/component'] = template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "<div class=\"component-container\">\r\n"
    + ((stack1 = container.invokePartial(partials["form/fields/sortaform/content"],depth0,{"name":"form/fields/sortaform/content","data":data,"indent":"  ","helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "</div>";
},"usePartial":true,"useData":true});
templates['form/fields/sortaform/content-inner'] = template({"1":function(container,depth0,helpers,partials,data) {
    var stack1, helper, options, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=helpers.blockHelperMissing, buffer = 
  "  <div class=\"";
  stack1 = ((helper = (helper = helpers.xs || (depth0 != null ? depth0.xs : depth0)) != null ? helper : alias2),(options={"name":"xs","hash":{},"fn":container.program(2, data, 0),"inverse":container.noop,"data":data}),(typeof helper === alias3 ? helper.call(alias1,options) : helper));
  if (!helpers.xs) { stack1 = alias4.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  stack1 = ((helper = (helper = helpers.sm || (depth0 != null ? depth0.sm : depth0)) != null ? helper : alias2),(options={"name":"sm","hash":{},"fn":container.program(4, data, 0),"inverse":container.noop,"data":data}),(typeof helper === alias3 ? helper.call(alias1,options) : helper));
  if (!helpers.sm) { stack1 = alias4.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  stack1 = ((helper = (helper = helpers.md || (depth0 != null ? depth0.md : depth0)) != null ? helper : alias2),(options={"name":"md","hash":{},"fn":container.program(6, data, 0),"inverse":container.noop,"data":data}),(typeof helper === alias3 ? helper.call(alias1,options) : helper));
  if (!helpers.md) { stack1 = alias4.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  stack1 = ((helper = (helper = helpers.lg || (depth0 != null ? depth0.lg : depth0)) != null ? helper : alias2),(options={"name":"lg","hash":{},"fn":container.program(8, data, 0),"inverse":container.noop,"data":data}),(typeof helper === alias3 ? helper.call(alias1,options) : helper));
  if (!helpers.lg) { stack1 = alias4.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  buffer += "\">\r\n";
  stack1 = ((helper = (helper = helpers.components || (depth0 != null ? depth0.components : depth0)) != null ? helper : alias2),(options={"name":"components","hash":{},"fn":container.program(10, data, 0),"inverse":container.noop,"data":data}),(typeof helper === alias3 ? helper.call(alias1,options) : helper));
  if (!helpers.components) { stack1 = alias4.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer + "  </div>\r\n";
},"2":function(container,depth0,helpers,partials,data) {
    return "col-xs-"
    + container.escapeExpression(container.lambda(depth0, depth0))
    + " ";
},"4":function(container,depth0,helpers,partials,data) {
    return "col-sm-"
    + container.escapeExpression(container.lambda(depth0, depth0))
    + " ";
},"6":function(container,depth0,helpers,partials,data) {
    return "col-md-"
    + container.escapeExpression(container.lambda(depth0, depth0))
    + " ";
},"8":function(container,depth0,helpers,partials,data) {
    return "col-lg-"
    + container.escapeExpression(container.lambda(depth0, depth0))
    + " ";
},"10":function(container,depth0,helpers,partials,data) {
    return "      <div data-component=\""
    + container.escapeExpression(container.lambda(depth0, depth0))
    + "\" class=\" component\"></div>\r\n";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = helpers.blockHelperMissing.call(depth0,container.lambda(depth0, depth0),{"name":".","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "");
},"useData":true});
templates['form/fields/sortaform/content'] = template({"1":function(container,depth0,helpers,partials,data) {
    var stack1, helper, options, buffer = "";

  stack1 = ((helper = (helper = helpers.getUniqueId || (depth0 != null ? depth0.getUniqueId : depth0)) != null ? helper : helpers.helperMissing),(options={"name":"getUniqueId","hash":{},"fn":container.program(2, data, 0),"inverse":container.noop,"data":data}),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},options) : helper));
  if (!helpers.getUniqueId) { stack1 = helpers.blockHelperMissing.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer;
},"2":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : {};

  return "    <div class=\"nav-tabs-custom\"> \r\n      <ul id=\"tablist_"
    + container.escapeExpression(((helper = (helper = helpers.randomId || (data && data.randomId)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(alias1,{"name":"randomId","hash":{},"data":data}) : helper)))
    + "\" class=\"nav nav-tabs\">\r\n"
    + ((stack1 = helpers.each.call(alias1,(depth0 != null ? depth0["content-tabs"] : depth0),{"name":"each","hash":{},"fn":container.program(3, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "      </ul>\r\n      <div class=\"tab-content\">\r\n"
    + ((stack1 = helpers.each.call(alias1,(depth0 != null ? depth0["content-tabs"] : depth0),{"name":"each","hash":{},"fn":container.program(8, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "      </div>\r\n    </div>\r\n";
},"3":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "          <li class=\"innerTab"
    + ((stack1 = (helpers.eq || (depth0 && depth0.eq) || alias2).call(alias1,(data && data.index),0,{"name":"eq","hash":{},"fn":container.program(4, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\">\r\n            <a aria-expanded=\"false\"\r\n              "
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0["title-i18n"] : depth0),{"name":"if","hash":{},"fn":container.program(6, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\r\n              href=\"#"
    + alias4(((helper = (helper = helpers.randomId || (data && data.randomId)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"randomId","hash":{},"data":data}) : helper)))
    + "_"
    + alias4(((helper = (helper = helpers.index || (data && data.index)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"index","hash":{},"data":data}) : helper)))
    + "\"\r\n              data-toggle=\"tab\">"
    + alias4(((helper = (helper = helpers.title || (depth0 != null ? depth0.title : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"title","hash":{},"data":data}) : helper)))
    + "\r\n            </a>\r\n          </li>\r\n";
},"4":function(container,depth0,helpers,partials,data) {
    return " active";
},"6":function(container,depth0,helpers,partials,data) {
    var helper;

  return "data-i18n=\""
    + container.escapeExpression(((helper = (helper = helpers["title-i18n"] || (depth0 != null ? depth0["title-i18n"] : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"title-i18n","hash":{},"data":data}) : helper)))
    + "\"";
},"8":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "          <div class=\"tab-pane"
    + ((stack1 = (helpers.eq || (depth0 && depth0.eq) || alias2).call(alias1,(data && data.index),0,{"name":"eq","hash":{},"fn":container.program(4, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\" id=\""
    + alias4(((helper = (helper = helpers.randomId || (data && data.randomId)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"randomId","hash":{},"data":data}) : helper)))
    + "_"
    + alias4(((helper = (helper = helpers.index || (data && data.index)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"index","hash":{},"data":data}) : helper)))
    + "\">\r\n            <div class=\"box-body\">\r\n"
    + ((stack1 = container.invokePartial(partials["form/fields/sortaform/content"],depth0,{"name":"form/fields/sortaform/content","data":data,"indent":"              ","helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "            </div>\r\n          </div>\r\n";
},"10":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = helpers["if"].call(depth0 != null ? depth0 : {},(depth0 != null ? depth0["content-responsive"] : depth0),{"name":"if","hash":{},"fn":container.program(11, data, 0),"inverse":container.program(13, data, 0),"data":data})) != null ? stack1 : "");
},"11":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = container.invokePartial(partials["content-responsive"],depth0,{"name":"content-responsive","data":data,"indent":"  ","helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "");
},"13":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = helpers["if"].call(depth0 != null ? depth0 : {},(depth0 != null ? depth0["content-fixed"] : depth0),{"name":"if","hash":{},"fn":container.program(14, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "");
},"14":function(container,depth0,helpers,partials,data) {
    var stack1, helper, options, buffer = "";

  stack1 = ((helper = (helper = helpers["content-fixed"] || (depth0 != null ? depth0["content-fixed"] : depth0)) != null ? helper : helpers.helperMissing),(options={"name":"content-fixed","hash":{},"fn":container.program(15, data, 0),"inverse":container.noop,"data":data}),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},options) : helper));
  if (!helpers["content-fixed"]) { stack1 = helpers.blockHelperMissing.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer;
},"15":function(container,depth0,helpers,partials,data) {
    var stack1, helper, options, buffer = 
  "    <div class=\"row\">\r\n";
  stack1 = ((helper = (helper = helpers.rowFixed || (depth0 != null ? depth0.rowFixed : depth0)) != null ? helper : helpers.helperMissing),(options={"name":"rowFixed","hash":{},"fn":container.program(16, data, 0),"inverse":container.noop,"data":data}),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},options) : helper));
  if (!helpers.rowFixed) { stack1 = helpers.blockHelperMissing.call(depth0,stack1,options)}
  if (stack1 != null) { buffer += stack1; }
  return buffer + "    </div>\r\n";
},"16":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = container.invokePartial(partials["form/fields/sortaform/content-inner"],depth0,{"name":"form/fields/sortaform/content-inner","data":data,"indent":"        ","helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "");
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = helpers["if"].call(depth0 != null ? depth0 : {},(depth0 != null ? depth0["content-tabs"] : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.program(10, data, 0),"data":data})) != null ? stack1 : "");
},"usePartial":true,"useData":true});
templates['form/fields/sortaform/sortaform-item'] = template({"1":function(container,depth0,helpers,partials,data) {
    return "    <i class=\"fa fa-fw fa-eye sort-action sort-view\"></i>\r\n";
},"3":function(container,depth0,helpers,partials,data) {
    return "      <i class=\"fa fa-fw fa-pencil sort-action sort-edit\"></i>\r\n";
},"5":function(container,depth0,helpers,partials,data) {
    return "      <i class=\"fa fa-fw fa-times sort-action sort-remove\"></i>\r\n";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : {};

  return "<li class=\"list-group-item\" style=\"display:flex;align-items:center\">\r\n"
    + ((stack1 = helpers.unless.call(alias1,(data && data.noView),{"name":"unless","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "  <div\r\n    class=\"sort-content\"\r\n    style=\"display:inline-block;flex-grow:1;padding: 0 20px;\"\r\n  >\r\n  </div>\r\n\r\n  <div class=\"sortaform-edit-controls\" style=\"display: flex;\">\r\n"
    + ((stack1 = helpers.unless.call(alias1,(data && data.noEdit),{"name":"unless","hash":{},"fn":container.program(3, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + ((stack1 = helpers.unless.call(alias1,(data && data.noRemove),{"name":"unless","hash":{},"fn":container.program(5, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "  </div>\r\n</li>";
},"useData":true});
templates['form/fields/sortaform/sortaform'] = template({"1":function(container,depth0,helpers,partials,data) {
    return "<div class=\"row\" style=\"display:flex;margin-left: 10px;\">\r\n  <div>\r\n";
},"3":function(container,depth0,helpers,partials,data) {
    return "<div class=\"row\">\r\n  <div class=\"col-md-4\">\r\n";
},"5":function(container,depth0,helpers,partials,data) {
    return "        <div class=\"sort-btns-add btn btn-default btn-flat\"><i class=\"fa fa-plus\"></i> Add</div>\r\n";
},"7":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "  <div class=\"sortaform-sub "
    + ((stack1 = helpers["if"].call(depth0 != null ? depth0 : {},(depth0 != null ? depth0.noBox : depth0),{"name":"if","hash":{},"fn":container.program(8, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\" style=\"flex-grow:1\">\r\n"
    + ((stack1 = container.invokePartial(partials["form/fields/sortaform/content"],depth0,{"name":"form/fields/sortaform/content","data":data,"indent":"    ","helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "  </div>\r\n";
},"8":function(container,depth0,helpers,partials,data) {
    return "nobox";
},"10":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "  <div class=\"col-md-8 sortaform-sub "
    + ((stack1 = helpers["if"].call(depth0 != null ? depth0 : {},(depth0 != null ? depth0.noBox : depth0),{"name":"if","hash":{},"fn":container.program(8, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\">\r\n"
    + ((stack1 = container.invokePartial(partials["form/fields/sortaform/content"],depth0,{"name":"form/fields/sortaform/content","data":data,"indent":"    ","helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "  </div>\r\n";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : {};

  return ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.flex : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.program(3, data, 0),"data":data})) != null ? stack1 : "")
    + "    <div style=\"margin-bottom: 10px;\">\r\n"
    + ((stack1 = helpers.unless.call(alias1,(depth0 != null ? depth0.noAdd : depth0),{"name":"unless","hash":{},"fn":container.program(5, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "      <div class=\"hidden sort-btns-save btn btn-default btn-flat\"><i class=\"fa fa-save\"></i> Save</div>\r\n      <div class=\"hidden sort-btns-cancel btn btn-default btn-flat\"><i class=\"fa fa-times\"></i> Cancel</div>\r\n    </div>\r\n    <ul class=\"list-group sortable\" name=\""
    + container.escapeExpression(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(alias1,{"name":"id","hash":{},"data":data}) : helper)))
    + "\">\r\n    </ul>\r\n  </div>\r\n"
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.flex : depth0),{"name":"if","hash":{},"fn":container.program(7, data, 0),"inverse":container.program(10, data, 0),"data":data})) != null ? stack1 : "")
    + "</div>\r\n";
},"usePartial":true,"useData":true});
templates['form/fields/static/static'] = template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "<p data-id=\""
    + alias4(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"id","hash":{},"data":data}) : helper)))
    + "\" name=\""
    + alias4(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"id","hash":{},"data":data}) : helper)))
    + "\" class=\"form-control-static\"></p>";
},"useData":true});
templates['form/fields/statichtml/statichtml'] = template({"1":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "  <div data-id=\""
    + alias4(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"id","hash":{},"data":data}) : helper)))
    + "\" name=\""
    + alias4(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"id","hash":{},"data":data}) : helper)))
    + "\" "
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0["text-i18n"] : depth0),{"name":"if","hash":{},"fn":container.program(2, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\r\n    class=\"form-control-static\">\r\n    "
    + ((stack1 = ((helper = (helper = helpers.text || (depth0 != null ? depth0.text : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"text","hash":{},"data":data}) : helper))) != null ? stack1 : "")
    + "\r\n  </div>\r\n";
},"2":function(container,depth0,helpers,partials,data) {
    var helper;

  return " data-i18n=\"[html]"
    + container.escapeExpression(((helper = (helper = helpers["text-i18n"] || (depth0 != null ? depth0["text-i18n"] : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"text-i18n","hash":{},"data":data}) : helper)))
    + "\" ";
},"4":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "    <div data-id=\""
    + alias4(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"id","hash":{},"data":data}) : helper)))
    + "\" name=\""
    + alias4(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"id","hash":{},"data":data}) : helper)))
    + "\" class=\"form-control-static\"\r\n      "
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0["no-padding"] : depth0),{"name":"if","hash":{},"fn":container.program(5, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + ">\r\n      "
    + ((stack1 = ((helper = (helper = helpers.content || (data && data.content)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"content","hash":{},"data":data}) : helper))) != null ? stack1 : "")
    + "\r\n    </div>\r\n";
},"5":function(container,depth0,helpers,partials,data) {
    return "style=\"padding-top:0;padding-bottom:0\" ";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = (helpers.neq || (depth0 && depth0.neq) || helpers.helperMissing).call(depth0 != null ? depth0 : {},(data && data.type),"handlebars",{"name":"neq","hash":{},"fn":container.program(1, data, 0),"inverse":container.program(4, data, 0),"data":data})) != null ? stack1 : "");
},"useData":true});
templates['form/fields/switch/switch'] = template({"1":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = helpers["if"].call(depth0 != null ? depth0 : {},(depth0 != null ? depth0["inline-label"] : depth0),{"name":"if","hash":{},"fn":container.program(2, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "");
},"2":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = (helpers.eq || (depth0 && depth0.eq) || helpers.helperMissing).call(depth0 != null ? depth0 : {},(depth0 != null ? depth0["label-position"] : depth0),"before",{"name":"eq","hash":{},"fn":container.program(3, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "");
},"3":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = helpers["if"].call(depth0 != null ? depth0 : {},(depth0 != null ? depth0["label-i18n"] : depth0),{"name":"if","hash":{},"fn":container.program(4, data, 0),"inverse":container.program(6, data, 0),"data":data})) != null ? stack1 : "");
},"4":function(container,depth0,helpers,partials,data) {
    var helper;

  return "        <span data-i18n=\""
    + container.escapeExpression(((helper = (helper = helpers["label-i18n"] || (depth0 != null ? depth0["label-i18n"] : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"label-i18n","hash":{},"data":data}) : helper)))
    + "\"></span>\r\n";
},"6":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = helpers["if"].call(depth0 != null ? depth0 : {},(depth0 != null ? depth0.label : depth0),{"name":"if","hash":{},"fn":container.program(7, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "");
},"7":function(container,depth0,helpers,partials,data) {
    var helper;

  return "        <span>"
    + container.escapeExpression(((helper = (helper = helpers.label || (depth0 != null ? depth0.label : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"label","hash":{},"data":data}) : helper)))
    + "</span>\r\n      ";
},"9":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : {};

  return "  <div>\r\n    <span style=\"padding-right:15px;\" "
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0["label-left-i18n"] : depth0),{"name":"if","hash":{},"fn":container.program(10, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + " >\r\n        "
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0["label-left"] : depth0),{"name":"if","hash":{},"fn":container.program(12, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\r\n    </span>\r\n";
},"10":function(container,depth0,helpers,partials,data) {
    var helper;

  return " data-i18n=\""
    + container.escapeExpression(((helper = (helper = helpers["label-left-i18n"] || (depth0 != null ? depth0["label-left-i18n"] : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"label-left-i18n","hash":{},"data":data}) : helper)))
    + "\" ";
},"12":function(container,depth0,helpers,partials,data) {
    var helper;

  return container.escapeExpression(((helper = (helper = helpers["label-left"] || (depth0 != null ? depth0["label-left"] : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"label-left","hash":{},"data":data}) : helper)));
},"14":function(container,depth0,helpers,partials,data) {
    return " style=\"display: inline-block\" ";
},"16":function(container,depth0,helpers,partials,data) {
    var helper;

  return " "
    + container.escapeExpression(((helper = (helper = helpers.style || (depth0 != null ? depth0.style : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"style","hash":{},"data":data}) : helper)))
    + " ";
},"18":function(container,depth0,helpers,partials,data) {
    return " checkbox-slider--b ";
},"20":function(container,depth0,helpers,partials,data) {
    var helper;

  return " checkbox-slider-"
    + container.escapeExpression(((helper = (helper = helpers.onColor || (depth0 != null ? depth0.onColor : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"onColor","hash":{},"data":data}) : helper)));
},"22":function(container,depth0,helpers,partials,data) {
    return " disabled ";
},"24":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : {};

  return "      <span "
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0["label-right-i18n"] : depth0),{"name":"if","hash":{},"fn":container.program(25, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + " >\r\n          "
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0["label-right"] : depth0),{"name":"if","hash":{},"fn":container.program(27, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\r\n      </span>\r\n";
},"25":function(container,depth0,helpers,partials,data) {
    var helper;

  return " data-i18n=\""
    + container.escapeExpression(((helper = (helper = helpers["label-right-i18n"] || (depth0 != null ? depth0["label-right-i18n"] : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"label-right-i18n","hash":{},"data":data}) : helper)))
    + "\"";
},"27":function(container,depth0,helpers,partials,data) {
    var helper;

  return container.escapeExpression(((helper = (helper = helpers["label-right"] || (depth0 != null ? depth0["label-right"] : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"label-right","hash":{},"data":data}) : helper)));
},"29":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : {};

  return "      <span\r\n"
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0["inline-label"] : depth0),{"name":"if","hash":{},"fn":container.program(30, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + ">\r\n"
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0["inline-label"] : depth0),{"name":"if","hash":{},"fn":container.program(34, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "</span>\r\n";
},"30":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = helpers["if"].call(depth0 != null ? depth0 : {},(depth0 != null ? depth0["label-i18n"] : depth0),{"name":"if","hash":{},"fn":container.program(31, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "");
},"31":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "            "
    + ((stack1 = (helpers.neq || (depth0 && depth0.neq) || helpers.helperMissing).call(depth0 != null ? depth0 : {},(depth0 != null ? depth0["label-position"] : depth0),"before",{"name":"neq","hash":{},"fn":container.program(32, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\r\n";
},"32":function(container,depth0,helpers,partials,data) {
    var helper;

  return " data-i18n=\""
    + container.escapeExpression(((helper = (helper = helpers["label-i18n"] || (depth0 != null ? depth0["label-i18n"] : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"label-i18n","hash":{},"data":data}) : helper)))
    + "\"";
},"34":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = helpers["if"].call(depth0 != null ? depth0 : {},(depth0 != null ? depth0.label : depth0),{"name":"if","hash":{},"fn":container.program(35, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "");
},"35":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "            "
    + ((stack1 = (helpers.neq || (depth0 && depth0.neq) || helpers.helperMissing).call(depth0 != null ? depth0 : {},(depth0 != null ? depth0["label-position"] : depth0),"before",{"name":"neq","hash":{},"fn":container.program(36, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\r\n";
},"36":function(container,depth0,helpers,partials,data) {
    var helper;

  return container.escapeExpression(((helper = (helper = helpers.label || (depth0 != null ? depth0.label : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"label","hash":{},"data":data}) : helper)));
},"38":function(container,depth0,helpers,partials,data) {
    return "  </div>\r\n";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : {};

  return "\r\n"
    + ((stack1 = helpers.unless.call(alias1,(depth0 != null ? depth0["both-labels"] : depth0),{"name":"unless","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0["both-labels"] : depth0),{"name":"if","hash":{},"fn":container.program(9, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "<div "
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0["inline-label"] : depth0),{"name":"if","hash":{},"fn":container.program(14, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + " "
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0["both-labels"] : depth0),{"name":"if","hash":{},"fn":container.program(14, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\r\n  class=\"checkbox"
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.style : depth0),{"name":"if","hash":{},"fn":container.program(16, data, 0),"inverse":container.program(18, data, 0),"data":data})) != null ? stack1 : "")
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.onColor : depth0),{"name":"if","hash":{},"fn":container.program(20, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\">\r\n  <label>\r\n    <input type=\"checkbox\" "
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.readOnly : depth0),{"name":"if","hash":{},"fn":container.program(22, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + " "
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.disabled : depth0),{"name":"if","hash":{},"fn":container.program(22, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + ">\r\n"
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0["both-labels"] : depth0),{"name":"if","hash":{},"fn":container.program(24, data, 0),"inverse":container.program(29, data, 0),"data":data})) != null ? stack1 : "")
    + "  </label>\r\n</div>\r\n"
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0["both-labels"] : depth0),{"name":"if","hash":{},"fn":container.program(38, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "");
},"useData":true});
templates['form/fields/text/text'] = template({"1":function(container,depth0,helpers,partials,data) {
    return " readonly ";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "<input type=\"text\" class=\"form-text form-control\"\r\n  data-id=\""
    + alias4(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"id","hash":{},"data":data}) : helper)))
    + "\" name=\""
    + alias4(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"id","hash":{},"data":data}) : helper)))
    + "\"\r\n  autocomplete=\""
    + alias4(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"id","hash":{},"data":data}) : helper)))
    + "\"\r\n  "
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.readOnly : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\r\n  data-i18n=\"[placeholder]"
    + alias4(((helper = (helper = helpers["placeholder-i18n"] || (depth0 != null ? depth0["placeholder-i18n"] : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"placeholder-i18n","hash":{},"data":data}) : helper)))
    + "\">";
},"useData":true});
templates['form/fields/textaction/textaction'] = template({"1":function(container,depth0,helpers,partials,data) {
    return "  <div class=\"input-group\">\r\n";
},"3":function(container,depth0,helpers,partials,data) {
    return "password";
},"5":function(container,depth0,helpers,partials,data) {
    return "text";
},"7":function(container,depth0,helpers,partials,data) {
    return " readonly ";
},"9":function(container,depth0,helpers,partials,data) {
    var helper;

  return container.escapeExpression(((helper = (helper = helpers["btn-class"] || (depth0 != null ? depth0["btn-class"] : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"btn-class","hash":{},"data":data}) : helper)));
},"11":function(container,depth0,helpers,partials,data) {
    return "btn-info";
},"13":function(container,depth0,helpers,partials,data) {
    return " disabled ";
},"15":function(container,depth0,helpers,partials,data) {
    var helper;

  return "        <i class=\"fa fa-fw "
    + container.escapeExpression(((helper = (helper = helpers["btn-icon"] || (depth0 != null ? depth0["btn-icon"] : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"btn-icon","hash":{},"data":data}) : helper)))
    + "\">\r\n        </i>\r\n";
},"17":function(container,depth0,helpers,partials,data) {
    var helper;

  return "<span data-i18n=\""
    + container.escapeExpression(((helper = (helper = helpers["action-i18n"] || (depth0 != null ? depth0["action-i18n"] : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"action-i18n","hash":{},"data":data}) : helper)))
    + "\"></span>";
},"19":function(container,depth0,helpers,partials,data) {
    return "  </div>\r\n";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return ((stack1 = helpers.unless.call(alias1,(depth0 != null ? depth0.icon : depth0),{"name":"unless","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\r\n  <input type=\""
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.isPassword : depth0),{"name":"if","hash":{},"fn":container.program(3, data, 0),"inverse":container.program(5, data, 0),"data":data})) != null ? stack1 : "")
    + "\" class=\"form-text form-control\"\r\n    data-id=\""
    + alias4(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"id","hash":{},"data":data}) : helper)))
    + "\" name=\""
    + alias4(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"id","hash":{},"data":data}) : helper)))
    + "\" data-inputmask=\""
    + alias4(((helper = (helper = helpers.mask || (depth0 != null ? depth0.mask : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"mask","hash":{},"data":data}) : helper)))
    + "\"\r\n    placeholder=\""
    + alias4(((helper = (helper = helpers.placeholder || (depth0 != null ? depth0.placeholder : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"placeholder","hash":{},"data":data}) : helper)))
    + "\"\r\n    "
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.readOnly : depth0),{"name":"if","hash":{},"fn":container.program(7, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\r\n  />\r\n  <span class=\"input-group-btn\">\r\n    <button \r\n      class=\"btn "
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0["btn-class"] : depth0),{"name":"if","hash":{},"fn":container.program(9, data, 0),"inverse":container.program(11, data, 0),"data":data})) != null ? stack1 : "")
    + " btn-flat\" \r\n      type=\"button\"\r\n      "
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.disabled : depth0),{"name":"if","hash":{},"fn":container.program(13, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\r\n      >\r\n"
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0["btn-icon"] : depth0),{"name":"if","hash":{},"fn":container.program(15, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "      "
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0["action-i18n"] : depth0),{"name":"if","hash":{},"fn":container.program(17, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\r\n    </button>\r\n  </span>\r\n\r\n"
    + ((stack1 = helpers.unless.call(alias1,(depth0 != null ? depth0.icon : depth0),{"name":"unless","hash":{},"fn":container.program(19, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "");
},"useData":true});
templates['form/fields/textarea/textarea'] = template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "<textarea data-i18n=\"[placeholder]"
    + alias4(((helper = (helper = helpers["placeholder-i18n"] || (depth0 != null ? depth0["placeholder-i18n"] : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"placeholder-i18n","hash":{},"data":data}) : helper)))
    + "\"\r\n  data-id=\""
    + alias4(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"id","hash":{},"data":data}) : helper)))
    + "\" name=\""
    + alias4(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"id","hash":{},"data":data}) : helper)))
    + "\"\r\n  class=\"form-control\" rows=\"3\"></textarea>\r\n";
},"useData":true});
templates['form/fields/timeinterval/timeinterval'] = template({"1":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing;

  return "          <th class=\"text-center\" colspan=\"2\">\r\n            "
    + ((stack1 = (helpers.cmp || (depth0 && depth0.cmp) || alias2).call(alias1,(data && data.i),"<",10,{"name":"cmp","hash":{},"fn":container.program(2, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + container.escapeExpression(((helper = (helper = helpers.i || (data && data.i)) != null ? helper : alias2),(typeof helper === "function" ? helper.call(alias1,{"name":"i","hash":{},"data":data}) : helper)))
    + "h\r\n          </th>  \r\n";
},"2":function(container,depth0,helpers,partials,data) {
    return "0";
},"4":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "        <tr>\r\n          <td><span data-weekday=\""
    + alias4(((helper = (helper = helpers.i || (data && data.i)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"i","hash":{},"data":data}) : helper)))
    + "\">"
    + alias4(((helper = (helper = helpers.i || (data && data.i)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"i","hash":{},"data":data}) : helper)))
    + "</span></td>\r\n"
    + ((stack1 = (helpers["for"] || (depth0 && depth0["for"]) || alias2).call(alias1,48,{"name":"for","hash":{},"fn":container.program(5, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "        </tr>\r\n";
},"5":function(container,depth0,helpers,partials,data) {
    return "            <td class=\"time-block\"><div></div></td>\r\n";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing;

  return "<div class=\"tools pull-right\">\r\n  <span class=\"hidden unlocked-only tools-toggle\">\r\n    <i data-id=\"clear\" class=\"fa fa-fw fa-ban\"></i>\r\n  </span> \r\n  <span class=\"vsep hidden unlocked-only\"></span> \r\n  <span class=\"fill-toggle\">\r\n    <i data-id=\"fill\" class=\"fa fa-fw fa-pencil\"></i>\r\n    <i data-id=\"erase\" class=\"fa fa-fw fa-eraser\"></i>\r\n  </span> \r\n  <span class=\"vsep\"></span> \r\n  <span class=\"control-toggle\">\r\n    <i data-id=\"square\" class=\"fa fa-fw fa-square active\"></i>\r\n    <i data-id=\"seq\" class=\"fa fa-fw fa-bars\"></i>\r\n    <i data-id=\"line\" class=\"fa fa-fw fa-minus\"></i>\r\n  </span>\r\n  <span class=\"vsep\"></span> \r\n  <span class=\"lock-toggle\">\r\n    <i data-id=\"lock\" class=\"locked-only fa fa-fw fa-lock\"></i>\r\n    <i data-id=\"unlock\" class=\"hidden unlocked-only fa fa-fw fa-unlock\"></i>\r\n  </span> \r\n</div>\r\n<div class=\"interval-container\">\r\n  <table class=\"timeinterval disabled\">\r\n    <thead>\r\n      <tr>\r\n        <th colspan=\"2\"></th>\r\n"
    + ((stack1 = (helpers["for"] || (depth0 && depth0["for"]) || alias2).call(alias1,1,24,{"name":"for","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "      </tr>\r\n    </thead>\r\n    <tbody>\r\n"
    + ((stack1 = (helpers["for"] || (depth0 && depth0["for"]) || alias2).call(alias1,7,{"name":"for","hash":{},"fn":container.program(4, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "    </tbody>\r\n  </table>\r\n</div>";
},"useData":true});
templates['form/fields/timepicker/timepicker'] = template({"1":function(container,depth0,helpers,partials,data) {
    var helper;

  return "  <div class=\"datetimepicker\" style=\"display:flex;flex-direction:row;\">\r\n    <div style=\"flex-grow:1\">\r\n      <input\r\n        readonly\r\n        style=\"border-right-width: 0;\"\r\n        type=\"text\"\r\n        class=\"form-control form-time-picker\"\r\n        name=\""
    + container.escapeExpression(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"id","hash":{},"data":data}) : helper)))
    + "\"\r\n        value=\"00:00\"\r\n      />\r\n    </div>\r\n    <button\r\n      data-id=\"close-button\"\r\n      class=\"btn btn-default btn-flat\"\r\n      type=\"button\"\r\n      style=\"border-left-width: 0 !important;background:white\"\r\n    >\r\n      <i class=\"fa fa-fw fa-times\"></i>\r\n    </button>\r\n  </div>\r\n";
},"3":function(container,depth0,helpers,partials,data) {
    var helper;

  return "  <input\r\n    readonly\r\n    type=\"text\"\r\n    class=\"form-control form-time-picker\"\r\n    name=\""
    + container.escapeExpression(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"id","hash":{},"data":data}) : helper)))
    + "\"\r\n    value=\"00:00\"\r\n  />\r\n";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = helpers.unless.call(depth0 != null ? depth0 : {},((stack1 = (depth0 != null ? depth0.opts : depth0)) != null ? stack1.isSub : stack1),{"name":"unless","hash":{},"fn":container.program(1, data, 0),"inverse":container.program(3, data, 0),"data":data})) != null ? stack1 : "");
},"useData":true});
templates['form/fields/wysiwyg/wysiwyg'] = template({"1":function(container,depth0,helpers,partials,data) {
    var helper;

  return container.escapeExpression(((helper = (helper = helpers.height || (depth0 != null ? depth0.height : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"height","hash":{},"data":data}) : helper)));
},"3":function(container,depth0,helpers,partials,data) {
    return "200px";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "<div data-id=\""
    + alias4(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"id","hash":{},"data":data}) : helper)))
    + "\" name=\""
    + alias4(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"id","hash":{},"data":data}) : helper)))
    + "\" style=\"min-height: auto;height:"
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.height : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.program(3, data, 0),"data":data})) != null ? stack1 : "")
    + "\">\r\n</div>";
},"useData":true});
})();