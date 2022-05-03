/**
 * Calendar
 */

Form.Fields.Calendar = function Calendar(scope, container, json ){
  this.scope = scope;
  this.children = [];
  this.container = container;
  this.json = json;

  this.$ = {};
  this.$.container = $(this.container);
  this.$.html = null;
  this.form = this._('^form').get(0);

  this.value = null;
  this.original = null;

  this.createdEvents = [];
  this.changedEvents = [];
  this.deletedEvents = [];

  this.visibilityCallbacks = [];

  this.changeListeners = [];

  this.init();
}
Form.Fields.Calendar.prototype.init = function(){
  this.editJSON = {
    "id": "editActivity",
    "fields": {
      "UserId": {
        "id": "UserId",
        "type": "Hidden"
      },
      "Name": {
        "id": "Name",
        "type": "Text",
        "validation": {
          "required": true
        },
        "label-i18n": "components.calendar.name"
      },
      "Description": {
        "id": "Description",
        "type": "WYSIWYG",
        "btns": ['btnGrp-semantic','link','horizontalRule','btnGrp-lists'],
        "height": "150px",
        "label-i18n": "components.calendar.description"
      },
      "StartDate": {
        "id": "StartDate",
        "type": "DateTimePicker",
        "validation": {
          "required": true,
          "custom": "valiDates"
        },
        "label-i18n": "components.calendar.startdate"
      },
      "EndDate": {
        "id": "EndDate",
        "type": "DateTimePicker",
        "validation": {
          "required": true,
          "custom": "valiDates"
        },
        "label-i18n": "components.calendar.enddate"
      },
      "Location": {
        "id": "Location",
        "type": "Select",
        "allowNull": true,
        "allowNewOption": true,
        "label-i18n": "components.calendar.location",
        "icon": "fa fa-fw fa-location-arrow",
        "searchUrl": "/Event/api/event/getlocationName",
        "resultsTemplate": "<div><span style=\"font-style: italic\">{{Location}}</span></div>",
        "selectedTemplate": "<div>{{Location}}</div>",
        "searchFields": [
          "Location"
        ],
        "resultFields": [
          "Location"
        ],
        "valueField": "Location",
        "labelField": "Location",
        "fields": [
          "Location"
        ],
      },
      "Speaker": {
        "id": "Speaker",
        "type": "Select",
        "allowNull": true,
        "allowNewOption": true,
        "label-i18n": "components.calendar.speaker",
        "icon": "fa fa-fw fa-user",
        "searchUrl": "/Event/api/event/getSpeakerName",
        "resultsTemplate": "<div><span style=\"font-style: italic\">{{Speaker}}</span></div>",
        "selectedTemplate": "<div>{{Speaker}}</div>",
        "searchFields": [
          "Speaker"
        ],
        "resultFields": [
          "Speaker"
        ],
        "valueField": "Speaker",
        "labelField": "Speaker",
        "fields": [
          "Speaker"
        ],
      },
      "Subject": {
        "id": "Subject",
        "type": "Select",
        "allowNull": true,
        "allowNewOption": true,
        "label-i18n": "components.calendar.subject",
        "icon": "fa fa-fw fa-credit-card",
        "searchUrl": "/Event/api/event/getSubjectName",
        "resultsTemplate": "<div><span style=\"font-style: italic\">{{Subject}}</span></div>",
        "selectedTemplate": "<div>{{Subject}}</div>",
        "searchFields": [
          "Subject"
        ],
        "resultFields": [
          "Subject"
        ],
        "valueField": "Subject",
        "labelField": "Subject",
        "fields": [
          "Subject"
        ],
      },
      "Cover":{
        "id": "Cover",
        "type": "FileInput",
        "url": "/Event/API/Media/UploadFile",
        "label-i18n": "components.calendar.cover",
        "maxFiles": 1
      },
      "Media":{
        "id": "Media",
        "type": "FileInput",
        "url": "/Event/API/Media/UploadFile",
        "label-i18n": "components.calendar.media",
      },
      "Color": {
        "id": "Color",
        "type": "Select",
        "allowNull": false,
        "label-i18n": "components.calendar.color",
        "icon": "fa fa-fw fa-adjust",
        "validation": {
          "required": true
        },
        "resultsTemplate": "<div class='col-sm-6'>  <div class='fc-event {{value}}'>    <span>{{i18n_t text-i18n}}</span>  </div></div>",
        "selectedTemplate": "<div>  <div class='fc-event {{value}}'>    <span>{{i18n_t text-i18n}}</span>  </div></div>",
        "options": [
          {
            "text-i18n": "components.calendar.red",
            "value": "red"
          },
          {
            "text-i18n": "components.calendar.red-white",
            "value": "red-invert"
          },
          {
            "text-i18n": "components.calendar.green",
            "value": "green"
          },
          {
            "text-i18n": "components.calendar.green-white",
            "value": "green-invert"
          },
          {
            "text-i18n": "components.calendar.blue",
            "value": "blue"
          },
          {
            "text-i18n": "components.calendar.blue-white",
            "value": "blue-invert"
          },
          {
            "text-i18n": "components.calendar.orange",
            "value": "orange"
          },
          {
            "text-i18n": "components.calendar.orange-white",
            "value": "orange-invert"
          },
          {
            "text-i18n": "components.calendar.purple",
            "value": "purple"
          },
          {
            "text-i18n": "components.calendar.purple-white",
            "value": "purple-invert"
          },
          {
            "text-i18n": "components.calendar.black",
            "value": "black"
          },
          {
            "text-i18n": "components.calendar.black-white",
            "value": "black-invert"
          }
        ]
      }
    },
    "tabs": [
      {
        "title-i18n": "components.calendar.details",
        "layout": [
          "Color",
          ["Name","Location"],
          ["Speaker","Subject"],
          ["StartDate","EndDate"],
          "Description"
        ]
      },
      {
        "title-i18n": "components.calendar.media",
        "layout": [
          "Cover",
          "Media"
        ]
      }
    ]
  }

  this.evts = {};

  if( this.json.eventClick && this.form.actions[this.json.eventClick] )
    this.evts['eventClick'] = this.form.actions[this.json.eventClick];

  var html = Form.Template( this.json, {data: {
    input: true
  }});
  this.$.html = $(html);
  if( this.json.visibility === 'hidden' )
    this.$.container.parent().addClass('hidden');

  this.$.container.append(this.$.html);
  this.$.input = this.$.container.find('.cal');

  this.$.input.fullCalendar({
    defaultDate: moment(),
    schedulerLicenseKey: 'CC-Attribution-NonCommercial-NoDerivatives',
    axisFormat: 'HH:mm',
    timeFormat: 'HH:mm',
    slotLabelFormat:"HH:mm",
    eventLimit: 4,
    contentHeight: window.innerHeight - 120,
    weekNumbers: true,
    editable: this.json.readonly !== undefined ? !this.json.readonly: true,
    defaultView: this.json.views ? this.json.views.split(',')[0].trim() : 'month',
    header:{
      left:   'prev,next title',
      center: '',
      right:  this.json.views || 'month,agendaWeek,agendaDay,listMonth'
    }
  });
  this.fc = this.$.input.fullCalendar.bind(this.$.input);

  this.bind();
  this.i18n();
}
Form.Fields.Calendar.prototype.bind = function(){
  var self = this;
  
  this.onVisible(function(){
    this.fc('option', 'eventResizeStart', function(ev, oEv, m, view){
      if(self.json.readonly)
        return;

      if(view.name === 'month'){
        ev.psHour = ev.start.hours();
        ev.psMinute = ev.start.minutes();
        ev.peHour = ev.end.hours();
        ev.peMinute = ev.end.minutes();
      }
    });    
    this.fc('option', 'eventResize', function(ev, oEv, m, view){
      if(self.json.readonly)
        return;

      if(view.name === 'month'){
        ev.start.hours(ev.psHour);
        delete ev.psHour;
        ev.start.minutes(ev.psMinute);
        delete ev.psMinute;
        ev.end.hours(ev.peHour);
        delete ev.peHour;
        ev.end.minutes(ev.peMinute);
        delete ev.peMinute;
      }else{
        ev.occurrence.startDate = ev.start.toISOString();
        ev.occurrence.endDate = ev.end.toISOString();
      }
    });    
    this.fc('option', 'eventDrop', function(ev){
      if(self.json.readonly)
        return;
      var changedOcc = false;
      
      ev.occurrence.startDate = ev.start.toISOString();
      ev.occurrence.endDate = ev.end.toISOString();
      if( ev.occurrence.original ){
        changedOcc = ( changedOcc 
          || !moment.utc(ev.occurrence.startDate).isSame(moment.utc(ev.occurrence.original.startDate))
          || !moment.utc(ev.occurrence.endDate).isSame(moment.utc(ev.occurrence.original.endDate))
        );

        var occIndex = self.changedEvents.indexOf(ev.occurrence);
        if( changedOcc && occIndex === -1 ){
          self.changedEvents.push(ev.occurrence);
        }
        
        if( !changedOcc && occIndex !== -1 ){
          self.changedEvents.splice(occIndex, 1);
        }
      }
      self.doChanges(); 
    });    
    this.fc('option', 'dayClick', function(date){
      if(self.json.readonly)
        return;
      var html = $('<div><div></div></div>');

      Tools.Modals.customMulti({
        title: 'components.calendar.new-activity',
        ok: 'components.calendar.ok',
        preventClose: true,
        cancel: 'components.calendar.cancel',
        html: html
      }).then(function(btn){
        return ({
          ok:function(){
            if( !form.validate() )
              return false;

            form.setSaved();
            var evt = form.getData();

            var oc = {
              "startDate": evt.StartDate,
              "endDate": evt.EndDate
            };

            var newEv = {
              "occurrences": [oc],
              "color": evt.Color,
              "location": evt.Location,
              "title": evt.Name,
              "description": evt.Description,
              "speaker": evt.Speaker,
              "subject": evt.Subject,
              "cover": evt.Cover,
              "media": evt.MEdia
            };

            self.createdEvents.push(newEv);
            self.createdEvents.push(oc);

            self.activities.push(newEv);

            while( self.children.length > 0 ){
              self.children[0].remove && self.children[0].remove();
              self.children.shift();
            }
            self.doChanges();
            self.fc('refetchEvents');
            bootbox.hideAll()
          }
        })[btn]();
      }).catch(function(err){
        
        while( self.children.length > 0 ){
          self.children[0].remove && self.children[0].remove();
          self.children.shift();
        }
        
      });
      
      var form = new window.Templates.form( self, html.children(), self.editJSON, {});
      form.initPromise.then(function(){
        form.applyData({
          StartDate: moment.utc(date).toISOString(),
          EndDate: moment.utc(date).add(1,'hour').toISOString()
        });
        form.setSaved();
      }).catch(function(err){
        console.error(err);
      })
      self.children.push(form)
    })



    this.fc('option', 'eventClick', function(ev){
      // if no action
      if(self.evts.eventClick){
        self.evts.eventClick.call(this, ev, self);
      }

      if(self.json.readonly)
        return;


      var html = $('<div><div></div></div>');

      Tools.Modals.customMulti({
        title: 'components.calendar.edit-activity',
        ok: 'components.calendar.ok',
        cancel: 'components.calendar.cancel',
        preventClose: true,
        buttons:{
          delete: ['components.calendar.delete', 'pull-left btn-danger'],
          newOcc: ['components.calendar.newOccurrence', 'btn-warning'],
          clone: ['components.calendar.clone', 'btn-info']
        },
        html: html
      }).then(function(btn, close){
        return ({
          newOcc: function(){
            form.setSaved();
            var evt = form.getData();

            var oc = {
              startDate: evt.StartDate,
              endDate: evt.EndDate
            }

            ev.activity.occurrences.push(oc);
            self.doChanges();

            while( self.children.length > 0 ){
              self.children[0].remove && self.children[0].remove();
              self.children.shift();
            }
            self.fc('refetchEvents');
            bootbox.hideAll()
          },
          clone: function(){
            form.setSaved();
            var evt = form.getData();

            var oc = {
              startDate: evt.StartDate,
              endDate: evt.EndDate
            }

            var newEv = {
              "occurrences": [oc],
              "color": evt.Color,
              "location": evt.Location,
              "title": evt.Name,
              "description": evt.Description,
              "speaker": evt.Speaker,
              "subject": evt.Subject,
              "cover": evt.Cover,
              "media": evt.MEdia
            };

            self.createdEvents.push(newEv);
            self.createdEvents.push(oc);

            self.activities.push(newEv);

            while( self.children.length > 0 ){
              self.children[0].remove && self.children[0].remove();
              self.children.shift();
            }
            self.doChanges();
            self.fc('refetchEvents');
            bootbox.hideAll()
          },
          ok:function(){
            if( !form.validate() ){
              return false;
            }
            form.setSaved();
            var evt = form.getData();


            // Check for activity changes
            var changedAct = false;
            
            ev.activity.title = evt.Name;
            ev.activity.description = evt.Description;
            ev.activity.color = evt.Color;
            ev.activity.location = evt.Location;
            ev.activity.speaker = evt.Speaker;
            ev.activity.subject = evt.Subject;
            ev.activity.cover = evt.Cover;
            ev.activity.media = evt.Media;
              
            if( ev.activity.original ){
              changedAct = ( changedAct 
                || ev.activity.title !== ev.activity.original.title
                || ev.activity.description !== ev.activity.original.description
                || ev.activity.color !== ev.activity.original.color
                || ev.activity.location !== ev.activity.original.location
                || ev.activity.speaker !== ev.activity.original.speaker
                || ev.activity.subject !== ev.activity.original.subject
                || JSON.stringify(ev.activity.cover) !== JSON.stringify(ev.activity.original.cover)
                || JSON.stringify(ev.activity.media) !== JSON.stringify(ev.activity.original.media)
              );

              var actIndex = self.changedEvents.indexOf(ev.activity);
              if( changedAct && actIndex === -1 ){
                self.changedEvents.push(ev.activity);
              }
              
              if( !changedAct && actIndex !== -1 ){
                self.changedEvents.splice(actIndex, 1);
              }
            }


            // Check for occurrence changes
            var changedOcc = false;

            ev.occurrence.startDate = evt.StartDate;
            ev.occurrence.endDate = evt.EndDate;
            if( ev.occurrence.original ){
              changedOcc = ( changedOcc 
                || !moment.utc(ev.occurrence.startDate).isSame(moment.utc(ev.occurrence.original.startDate))
                || !moment.utc(ev.occurrence.endDate).isSame(moment.utc(ev.occurrence.original.endDate))
              );

              var occIndex = self.changedEvents.indexOf(ev.occurrence);
              if( changedOcc && occIndex === -1 ){
                self.changedEvents.push(ev.occurrence);
              }
              
              if( !changedOcc && occIndex !== -1 ){
                self.changedEvents.splice(occIndex, 1);
              }
            }

            while( self.children.length > 0 ){
              self.children[0].remove && self.children[0].remove();
              self.children.shift();
            }
            self.doChanges();
            self.fc('refetchEvents')
            bootbox.hideAll()
          },
          delete: function(){
            if( ev.occurrence.original ){
              ev.occurrence.deleted = true;
            }else{
              ev.activity.occurrences.splice(ev.activity.occurrences.indexOf(ev.occurrence), 1);
            }
            
            var isEmpty = ev.activity.occurrences.reduce(function( p, c ){
              return p && !!c.deleted;
            }, true);

            if( isEmpty ){
              if( ev.activity.original ){
                ev.activity.deleted = true;
              }else{
                self.createdEvents.splice(self.createdEvents.indexOf(ev.activity), 1);
              }
            }
            while( self.children.length > 0 ){
              self.children[0].remove && self.children[0].remove();
              self.children.shift();
            }
            self.doChanges();
            self.fc('refetchEvents');
            bootbox.hideAll()
          }
        })[btn]();
      }).catch(function(err){
        while( self.children.length > 0 ){
          self.children[0].remove && self.children[0].remove();
          self.children.shift();
        }
      });
      var form = new window.Templates.form( self, html.children(), self.editJSON, {});
      form.initPromise.then(function(){
        form.applyData({
          Name: ev.title,
          Description: ev.description,
          Speaker: ev.speaker,
          Subject: ev.subject,
          Cover: ev.cover,
          Media: ev.media,
          StartDate: ev.start.toISOString(),
          EndDate: ev.end.toISOString(),
          Color: ev.className[0],
          Location: ev.location
        });
        var ppp = form.getData();
      }).catch(function(err){
        console.error(err);
      });
      self.children.push(form);
    });

  });
}
Form.Fields.Calendar.prototype.i18n = function(){
  this.$.html.i18n();	

  this.onVisible(function(){
    this.fc('option', 'locale', i18n.language);
  });
}
Form.Fields.Calendar.prototype.onVisible = function( cb ){
  if( !this.$.input.is(':visible') )
    this.visibilityCallbacks.push(cb);
  else
    cb.apply(this);
}
Form.Fields.Calendar.prototype.getData = function(){
  var d = {};
  d[this.json.id] = this.get();
  return d;
}
Form.Fields.Calendar.prototype.get = function(){
  var obj = {};

  if( this.json.eventField ){
    obj[this.json.eventField] = this.bgEvent;
  }

  var acts = this.activities.map(function(a){
    return {
      id: a.id,
      color: a.color,
      location: a.location,
      title: a.title,
      description: a.description,
      speaker: a.speaker,
      subject: a.subject,
      cover: a.cover,
      media: a.media,
      deleted: a.deleted,
      occurrences: a.occurrences.map(function(o){
        return {
          id: o.id,
          deleted: o.deleted,
          startDate: o.startDate,
          endDate: o.endDate
        }
      })
    }
  });

  obj[this.json.activitiesField] = acts;

  return obj;
}
Form.Fields.Calendar.prototype.setData = function( d ){
  var data = d[this.json.id];
  if( this.json.eventField ){
    this.bgEvent = data[this.json.eventField];
  }

  var acts = [];
  if( this.json.activitiesField ){
    acts = data[this.json.activitiesField];
    acts.forEach(function(a){
      a.original = {
        title: a.title,
        description: a.description,
        speaker: a.speaker,
        subject: a.subject,
        cover: a.cover,
        media: a.media,
        location: a.location,
        color: a.color
      };

      a.occurrences.forEach(function(o){
        o.original = {
          startDate: o.startDate, 
          endDate: o.endDate 
        }
      });
    });
  }

  this.setBG( this.bgEvent );
  this.set( acts );
}
Form.Fields.Calendar.prototype.setBG = function( val ){
  this.onVisible(function(){
    this.fc( 'removeEvents', function(e){ 
      return e.rendering === "background";
    });
  });

  var newEv = {
    title: val.title,
    description: val.description,
    speaker: val.speaker,
    subject: val.subject,
    cover: val.cover,
    media: val.media,
    start: val.startDate,
    end: val.endDate,
    className: val.color,
    rendering: "background",
    allDay: true,
    location: val.location
  };
  this.onVisible(function(){
    this.fc( 'renderEvent', newEv, true );
    // set initial month
    this.fc( 'gotoDate', newEv.start );
  });
}
Form.Fields.Calendar.prototype.set = function( val ){
  var self = this;
  this.onVisible(function(){
    this.fc( 'removeEvents', function(e){ 
      return e.rendering !== "background";
    });
  });

  this.activities = val;

  this.onVisible(function(){
    
    this.fc('addEventSource', {
      events: function( start, end, timezone, callback ){
        var acts = [];

        self.activities.forEach(function(a){
          if( a.deleted )
            return;

          a.occurrences.forEach(function(o){
            if( o.deleted )
              return;

            var newEv = {
              activity: a,
              occurrence: o,

              title: a.title,
              description: a.description,
              speaker: a.speaker,
              subject: a.subject,
              cover: a.cover,
              media: a.media,
              start: o.startDate,
              end: o.endDate,
              className: a.color,
              location: a.location
            };
            
            acts.push(newEv);
          });
        });

        callback( acts );
      }
    });

    return;
  });

  this.doChanges();
}
Form.Fields.Calendar.prototype.isChanged = function(){
  return ( this.changedEvents.length + this.createdEvents.length + this.deletedEvents.length > 0 )
}
Form.Fields.Calendar.prototype.reset = function(){
  this.set( this.original );
}
Form.Fields.Calendar.prototype.clear = function(){
  this.value = null;
  this.original = null;
  this.$.input.val('');
}
Form.Fields.Calendar.prototype.applyFieldBinds = function(){
}
Form.Fields.Calendar.prototype.validate = function(){
  // stub
}
Form.Fields.Calendar.prototype.saveData = function(){
  // stub
}
Form.Fields.Calendar.prototype.refresh = function(){
  if( !this.$.input.is(':visible') )
    return;
  this.fc('render');
  var cb = null;
  while( cb = this.visibilityCallbacks.shift() ){
    cb.apply(this);
  }
}
Form.Fields.Calendar.prototype.doChanges = function(){
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
Form.Fields.Calendar.prototype.onChange = function( callback ){
  if( !this.changeListeners )
    this.changeListeners = [];
  this.changeListeners.push( callback );
}
Form.Fields.Calendar.prototype._ = scopeInterface;
Form.Fields.Calendar.prototype.is = function(t){
  if( t === '*' )
    return true;
  return (t.toLowerCase() === ('Calendar').toLowerCase()
    || t.toLowerCase() === this.json.id.toLowerCase() );
};
