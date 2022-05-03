Form.Fields.Recurrence = function Recurrence(scope, container, json ){
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
Form.Fields.Recurrence.prototype.init = function(){
  var html = Form.Template( this.json, {data: {
    input: true
  }});

  this.$.html = $(html);
  if( this.json.visibility === 'hidden' )
    this.$.container.parent().addClass('hidden');;

  this.$.container.append(this.$.html);

  this.$.translates = this.$.html.find('[data-i18n]');

  // find all selects
  this.$.selects = this.$.html.find('select');
  this.$.selects.selectize();

  // find date input
  this.$.dateinput = this.$.html.find('[data-type="datepicker"]');

  // find all injectable elements
  this.$.injs = this.$.html.find('[data-i18ninj]');

  // init data
  this.default = {
    "Recorrente" : false,

    "TipoAgendamento" : null, // Hora/Dia/Semana/Mês/Ano

    "RecorrenteQtd" : null,        // int
    "DiaMes" : null,               // int
    "Mes" : null,                  // int. 1~12
    "Posicao" : null,     // Primeiro/Segundo/Terceiro/Quarto/Ultimo

    "Segunda" : null,           // bool
    "Terca" : null,            // bool
    "Quarta" : null,           // bool
    "Quinta" : null,           // bool
    "Sexta" : null,            // bool
    "Sabado" : null,           // bool
    "Domingo" : null,          // bool
    "Dia" : null,              // bool
    "Dia_Semana" : null,       // bool
    "Dia_Fim_Semana" : null,   // bool
    "EndQtd" : null,
    "EndDate" : null
  };

  var $hf = this.$.html;
  this.$.inputs = {
    recurrence: $hf.find('.recurrence-toggle > input'),
    type: $hf.find('.recurrence-type input'),
    hour: {
      radio: $hf.find('.recurrence-form[data-id="form-hour"] input.type-opt'),
      values: [
        { rec:$hf.find('.recurrence-form[data-id="form-hour"] input[name="hours"]')
        }
      ]
    },
    day: {
      radio: $hf.find('.recurrence-form[data-id="form-day"] input.type-opt'),
      values: [
        { rec: $hf.find('.recurrence-form[data-id="form-day"] input[name="days"]')
        },
        {}
      ]
    },
    week: {
      radio: $hf.find('.recurrence-form[data-id="form-week"] input.type-opt'),
      values: [
        { rec: $hf.find('.recurrence-form[data-id="form-week"] input[name="weeks"]'),
          weekdays: $hf.find('.recurrence-form[data-id="form-week"] .weekdays input')
        }
      ]},
    month: {
      radio: $hf.find('.recurrence-form[data-id="form-month"] input.type-opt'),
      values: [
        { rec: $hf.find('.recurrence-form[data-id="form-month"] .op1 input[name="months"]'),
          day: $hf.find('.recurrence-form[data-id="form-month"] .op1 input[name="day"]')
        },
        { rec: $hf.find('.recurrence-form[data-id="form-month"] .op2 input[name="months"]'),
          ord: $hf.find('.recurrence-form[data-id="form-month"] .op2 select'),
          weekdays: $hf.find('.recurrence-form[data-id="form-month"] .op2 .weekdays input')
        }
      ]
    },
    year: {
      radio: $hf.find('.recurrence-form[data-id="form-year"] input.type-opt'),
      values: [
        { day: $hf.find('.recurrence-form[data-id="form-year"] .op1 input[name="day"]'),
          month: $hf.find('.recurrence-form[data-id="form-year"] .op1 select')
        },
        { ord: $hf.find('.recurrence-form[data-id="form-year"] .op2 select.ord'),
          weekdays: $hf.find('.recurrence-form[data-id="form-year"] .op2 .weekdays input'),
          month: $hf.find('.recurrence-form[data-id="form-year"] .op2 select.month')
        }
      ]
    },
    until: {
      radio: $hf.find('.recurrence-repeat input[type="radio"]'),
      values: [
        {},
        { times: $hf.find('.recurrence-repeat input.times') },
        { until: $hf.find('.recurrence-repeat input.until') }
      ]
    }
  };

  this.bind();
  this.i18n();
  this.setData(this.default);
}
Form.Fields.Recurrence.prototype.bind = function(){
  var self = this;

  // handle multi-line radios
  this.$.html.find('.month-day-radio1 .btn').on('click', function(){
    self.$.html.find('.month-day-radio2 .active').removeClass('active');
  });
  this.$.html.find(".month-day-radio2 .btn").on('click', function(){
    self.$.html.find('.month-day-radio1 .active').removeClass('active');
  });

  // handle multi-line radios
  this.$.html.find('.year-day-radio1 .btn').on('click', function(){
    self.$.html.find('.year-day-radio2 .active').removeClass('active');
  });
  this.$.html.find(".year-day-radio2 .btn").on('click', function(){
    self.$.html.find('.year-day-radio1 .active').removeClass('active');
  });

  // handle subtype decoration
  this.$.html.find('input[type="radio"].type-opt').on('change',function(){
    if(this.checked){
      $(this).parent().filter('label').addClass('well').siblings().removeClass('well');
    }
  });

  // handle recurrence type
  this.$.html.find('.recurrence-type input').on('change', function(){
    self.$.html.find('[data-id="form-'+this.value+'"]').show().siblings().hide();
  });

  // handle input visibility
  this.$.html.find('.recurrence-toggle > input').on('change',function(){
    if(this.checked){
      $(this).closest('.form-control.contain').addClass('active')
      self.$.html.find('[data-id="recurrence-form"]').fadeIn();
      self.$.html.find('.recurrence-repeat').fadeIn();
    }else{
      $(this).closest('.form-control.contain').removeClass('active')
      self.$.html.find('[data-id="recurrence-form"]').fadeOut();
      self.$.html.find('.recurrence-repeat').fadeOut();
    }
  });


  this.$.html.find('input').on('input change', function(){
    for( var i = 0 ; i < self.changeListeners.length ; i++ ){
      self.changeListeners[i]( self.json.id, self.get(), self.isChanged() );
    }
  });

  this.bindSelects();
}
Form.Fields.Recurrence.prototype.bindSelects = function(){
  this.$.html.find('.selectize-input').on('click mousedown', function(ev){
    ev.preventDefault();
  });
}
Form.Fields.Recurrence.prototype.i18n = function(){
  // destroy selects
  this.$.selects.each(function(){
    if(this.selectize){
      var v = this.selectize.getValue();
      this.selectize.destroy();
      $(this).val(v);
    }
  });

  // direct translations
  this.$.translates.i18n();

  // Inject translations
  this.$.injs.each(function(){
    i18nInject( $(this) );
  });

  // i18n datepickers
  if(this.$.dateinput.data('daterangepicker'))
    var oldDate = moment(this.$.dateinput.data('daterangepicker').startDate);

  var format = JSON.simpleCopy(i18n.t('plugins.daterangepicker.locale',
    {returnObjectTrees: true}));
  format.format = i18n.t('app.formats.date');

  this.$.dateinput.daterangepicker({
    autoUpdateInput: true,
    showWeekNumbers: true,
    singleDatePicker: true,
    showDropdowns: true
//    locale: format
  });

  if(oldDate)
    this.$.dateinput.data('daterangepicker').setStartDate(oldDate);


  // remake selects
  this.$.selects.selectize();
  // and bind them again
  this.bindSelects();
}
Form.Fields.Recurrence.prototype.getData = function(  ){
  return this.get();
}
Form.Fields.Recurrence.prototype.get = function(){
  var O = JSON.simpleCopy( this.default );
  var $i = this.$.inputs;

  if( !$i.recurrence.is(':checked') )
    return O;

  var wdays = {
    "day": "Dia",
    "wday": "Dia_Semana",
    "weday": "Dia_Fim_Semana",
    "mon": "Segunda",
    "tue": "Terca",
    "wed": "Quarta",
    "thu": "Quinta",
    "fri": "Sexta",
    "sat": "Sabado",
    "sun": "Domingo"
  };

  var ord = {
    "1": "Primeiro",
    "2": "Segundo",
    "3": "Terceiro",
    "4": "Quarto",
    "5": "Ultimo"
  };

  O.Recorrente = true;


  switch( $i.type.filter(':checked').val() ){
    case 'hour':
      O.TipoAgendamento = "Hora";
      O.RecorrenteQtd = $i.hour.values[0].rec.val()|0;
      break;
    case 'day':
      O.TipoAgendamento = "Dia";
      if($i.day.radio.filter(':checked').val() === '1'){
        O.RecorrenteQtd = $i.day.values[0].rec.val()|0;
      }else{
        O.RecorrenteQtd = 1;
      }
      break;
    case 'week':
      O.TipoAgendamento = "Semana";
      O.RecorrenteQtd = $i.week.values[0].rec.val()|0;
      $i.week.values[0].weekdays.each(function(x){
        O[wdays[this.value]] = false;
      }).filter(':checked').each(function(){
        O[wdays[this.value]] = true;
      });

      break;
    case 'month':
      O.TipoAgendamento = "Mês";
      if($i.month.radio.filter(':checked').val() === '1'){
        O.DiaMes = $i.month.values[0].day.val()|0;
        O.RecorrenteQtd = $i.month.values[0].rec.val()|0;
      }else{
        O.RecorrenteQtd = $i.month.values[1].rec.val()|0;
        O.Posicao = ord[$i.month.values[1].ord.val()];
        $i.month.values[1].weekdays.each(function(x){
          O[wdays[this.value]] = false;
        }).filter(':checked').each(function(){
          O[wdays[this.value]] = true;
        });
      }
      break;
    case 'year':
      O.TipoAgendamento = "Ano";
      if($i.year.radio.filter(':checked').val() === '1'){
        O.DiaMes = $i.year.values[0].day.val()|0;
        O.Mes = $i.year.values[0].month.val()|0;
      }else{
        O.Mes = $i.year.values[1].month.val()|0;
        O.Posicao = ord[$i.year.values[1].ord.val()];
        $i.year.values[1].weekdays.each(function(x){
          O[wdays[this.value]] = false;
        }).filter(':checked').each(function(){
          O[wdays[this.value]] = true;
        });
      }
      break;
  }
  switch( $i.until.radio.filter(':checked').val() ){
    case '2':
      O.EndQtd = $i.until.values[1].times.val()|0;
      break;
    case '3':
      if($i.until.values[2].until.data('daterangepicker'))
        O.EndDate = moment( $i.until.values[2].until.data('daterangepicker').startDate).toISOString();
      break;
  }

  return O;
}
Form.Fields.Recurrence.prototype.setData = function( data ){
  var dK = Object.keys(this.default);
  var newData = {};
  for( var i = 0 ; i < dK.length ; i++ ){
    var dk = dK[i];
    if( data[dk] !== null ){
      newData[dk] = data[dk];
    }else{
      newData[dk] = this.default[dk];
    }
  }
  this.original = newData;
  this.set( this.original );
}
Form.Fields.Recurrence.prototype.set = function( val ){
  var $i = this.$.inputs;

  $i.recurrence.prop('checked', val.Recorrente);
  if(!val.Recorrente){
    this.$.html.find('input[type="checkbox"]').trigger('change');
  }

  var wdays = {
    "Dia":"day",
    "Dia_Semana":"wday",
    "Dia_Fim_Semana":"weday",
    "Segunda":"mon",
    "Terca":"tue",
    "Quarta":"wed",
    "Quinta":"thu",
    "Sexta":"fri",
    "Sabado":"sat",
    "Domingo":"sun"
  };

  var ord = {
    "Primeiro":"1",
    "Segundo":"2",
    "Terceiro":"3",
    "Quarto":"4",
    "Ultimo":"5"
  };



  this.$.html.find("select").each(function(){
    if(this.selectize){
      this.selectize.setValue('1');
    }else{
      $(this).val('1');
    }
  }).trigger('change');
  $i.type.prop('checked', false).closest('label').removeClass('active');

  if(val.TipoAgendamento === null || typeof val.TipoAgendamento === 'undefined' )
    $i.type.filter('[value="hour"]').prop('checked', true).closest('label').addClass('active');

  switch( val.TipoAgendamento ){
    case 'Hora':
      $i.type.filter('[value="hour"]').prop('checked', true).closest('label').addClass('active');
      $i.hour.values[0].rec.val(val.RecorrenteQtd);
      break;
    case 'Dia':
      $i.type.filter('[value="day"]').prop('checked', true).closest('label').addClass('active');

      $i.day.radio.prop('checked', false);
      if( val.RecorrenteQtd !== 1 ){
        $i.day.radio.filter('[value="1"]').prop('checked', true);
        $i.day.values[0].rec.val(val.RecorrenteQtd);
      }else{
        $i.day.radio.filter('[value="2"]').prop('checked', true);
      }

      break;
    case 'Semana':
      $i.type.filter('[value="week"]').prop('checked', true).closest('label').addClass('active');
      $i.week.values[0].rec.val(val.RecorrenteQtd);

      Object.keys(wdays).forEach(function(k){
        var c = $i.week.values[0].weekdays.filter('[value="'+wdays[k]+'"]')
        c.prop('checked', !!val[k]);
        if(!!val[k]){
          c.closest('label').addClass('active');
        }else{
          c.closest('label').removeClass('active');
        }
      });

      break;
    case 'Mês':
      $i.type.filter('[value="month"]').prop('checked', true).closest('label').addClass('active');

      $i.month.radio.prop('checked', false);
      if( val.DiaMes ){
        $i.month.radio.filter('[value="1"]').prop('checked', true);
        $i.month.values[0].rec.val(val.RecorrenteQtd);
        $i.month.values[0].day.val(val.DiaMes+'');
      }else{
        $i.month.radio.filter('[value="2"]').prop('checked', true);
        $i.month.values[1].rec.val(val.RecorrenteQtd);
        $i.month.values[1].ord[0].selectize.setValue(ord[val.Posicao]);

        Object.keys(wdays).forEach(function(k){
          var c = $i.month.values[1].weekdays.filter('[value="'+wdays[k]+'"]')
          c.prop('checked', !!val[k]);
          if(!!val[k]){
            c.closest('label').addClass('active');
          }else{
            c.closest('label').removeClass('active');
          }
        });
      }
      break;
    case 'Ano':
      $i.type.filter('[value="year"]').prop('checked', true).closest('label').addClass('active');

      $i.year.radio.prop('checked', false);
      if( val.DiaMes ){
        $i.year.radio.filter('[value="1"]').prop('checked', true);
        $i.year.values[0].month[0].selectize.setValue(val.Mes);
        $i.year.values[0].day.val(val.DiaMes);
      }else{
        $i.year.radio.filter('[value="2"]').prop('checked', true);
        $i.year.values[1].month[0].selectize.setValue(val.Mes);
        $i.year.values[1].ord[0].selectize.setValue(ord[val.Posicao]);

        Object.keys(wdays).forEach(function(k){
          var c = $i.year.values[1].weekdays.filter('[value="'+wdays[k]+'"]')
          c.prop('checked', !!val[k]);
          if(!!val[k]){
            c.closest('label').addClass('active');
          }else{
            c.closest('label').removeClass('active');
          }
        });
      }
      break;
  }

  $i.until.radio.prop('checked', false);
  if( val.EndQtd ){
    $i.until.radio.filter('[value="2"]').prop('checked', true);
    $i.until.values[1].times.val(val.EndQtd);
  }else if( val.EndDate ){
    $i.until.radio.filter('[value="3"]').prop('checked', true);
    $i.until.values[2].until.data('daterangepicker').setStartDate( moment( val.EndDate ) );
  }else{
    $i.until.radio.filter('[value="1"]').prop('checked', true);
  }

  this.$.html.find('input[type="checkbox"]').trigger('change');
  this.$.html.find('input[type="radio"]:checked').trigger('change');
}
Form.Fields.Recurrence.prototype.isChanged = function(){
  var n = this.get();
  var nK = Object.keys(n);

  for( var i = 0 ; i < nK.length ; i++ ){
    if(n[nK[i]] !== this.original[nK[i]])
      return true;
  }
  return false;
}
Form.Fields.Recurrence.prototype.reset = function(){
  this.set( this.original );
}
Form.Fields.Recurrence.prototype.clear = function(){
  // nop
}
Form.Fields.Recurrence.prototype.applyFieldBinds = function(){
  // nop
}
Form.Fields.Recurrence.prototype.validate = function(){
  // nop
}
Form.Fields.Recurrence.prototype.saveData = function(){
  this.original = this.get();
  for( var i = 0 ; i < this.changeListeners.length ; i++ ){
    this.changeListeners[i]( this.json.id, this.get(), this.isChanged() );
  }
}
Form.Fields.Recurrence.prototype.refresh = function(){
  // nop
}
Form.Fields.Recurrence.prototype.onChange = function( callback ){
  if( !this.changeListeners )
    this.changeListeners = [];

  this.changeListeners.push( callback );
}
Form.Fields.Recurrence.prototype._ = scopeInterface;
Form.Fields.Recurrence.prototype.is = function(t){
  if( t === '*' )
    return true;
  return (t.toLowerCase() === ('Recurrence').toLowerCase()
    || t.toLowerCase() === this.json.id.toLowerCase() );
};
