/**
 * TimeInterval
 */

Form.Fields.TimeInterval = function TimeInterval(scope, container, json ){
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
Form.Fields.TimeInterval.prototype.init = function(){
  var html = Form.Template( this.json, {data: {
    input: true
  }});

  this.$.html = $(html);
  if( this.json.visibility === 'hidden' )
    this.$.container.parent().addClass('hidden');;

  this.$.container.append(this.$.html);
  this.$.label = this.$.container.find('label');

  this.table = this.$.container.find('.interval-container > table');
  this.trs = this.table.find('tbody tr');

  this.table.find('[data-weekday]').each(function(){
    var $this = $(this);
    $this.attr('data-i18n', 'components.recurrence.weekdays.'+([
      'sunday','monday','tuesday','wednesday','thursday','friday','saturday'
    ])[$this.data('weekday')]);
  });

  this.tr = this.trs.map(function(){
    return [$(this).find('td.time-block').map(function(){
      return this;
    }).get()];
  }).get();

  this.bind();
  this.i18n();
}
Form.Fields.TimeInterval.prototype.bind = function(){
  var self = this;
  var table = this.table;
  var trs = this.trs;
  var tr = this.tr;


  var mode = 'square';
  var fill = '';

  this.$.html.find('.lock-toggle > i').on('click', function(){
    var $this = $(this);
    var p = $this.parent().parent();
    if( $this.data('id') === 'lock' ){
      p.find('.unlocked-only').removeClass('hidden');
      p.find('.locked-only').addClass('hidden');
      table.removeClass('disabled');
      fill = 'fill';
      self.$.html.find('.fill-toggle > i[data-id="fill"]').addClass('active');
    }else{
      p.find('.unlocked-only').addClass('hidden');
      p.find('.locked-only').removeClass('hidden');
      table.addClass('disabled');
      fill = '';
      self.$.html.find('.fill-toggle > i.active').removeClass('active');
    }
  });

  this.$.html.find('.tools-toggle > i').on('click', function(){
    table.find('td.time-block.selected').removeClass('selected');
  });

  this.$.html.find('.control-toggle > i').on('click', function(){
    var $this = $(this);
    $this.addClass('active').siblings().removeClass('active');
    mode = $this.data('id');
  });

  this.$.html.find('.fill-toggle > i').on('click', function(){
    var $this = $(this);
    var p = $this.parent().parent();
    if( $this.hasClass('active') ){
      fill = '';
      p.find('.unlocked-only').addClass('hidden');
      p.find('.locked-only').removeClass('hidden');
      table.addClass('disabled');
    }else{
      fill = $this.data('id');
      p.find('.unlocked-only').removeClass('hidden');
      p.find('.locked-only').addClass('hidden');
      table.removeClass('disabled');
    }
    $this.toggleClass('active').siblings().removeClass('active');
  });


  var markSeq = function( from_, to_ ){
    var tmp = null;
    if( from_.y > to_.y ){
      tmp = from_;
      from_ = to_;
      to_ = tmp;
    }else if( from_.y === to_.y ){
      if( from_.x > to_.x ){
        tmp = from_;
        from_ = to_;
        to_ = tmp;
      }
    }

    table.find('td').removeClass('selected').removeClass('active');
    state.addClass('selected')

    for( var j = from_.y ; j <= to_.y ; j++ ){
      for( var i = (j===from_.y?from_.x:0) ; i <= (j===to_.y?to_.x:47) ; i++ ){

        if( fill === 'fill' ){
          tr[j][i].classList.add('selected');
        }else if( fill === 'erase' ){
          tr[j][i].classList.remove('selected');
        }else{
          tr[j][i].classList.toggle('selected');
        }
        tr[j][i].classList.add('active');
      }
    }
  }
  var markSquare = function( from_, to_ ){
    var tmp = null;;
    if( from_.y > to_.y ){
      tmp = from_.y;
      from_.y = to_.y;
      to_.y = tmp;
    }
    if( from_.x > to_.x ){
      tmp = from_.x;
      from_.x = to_.x;
      to_.x = tmp;
    }

    table.find('td').removeClass('selected').removeClass('active');
    state.addClass('selected')

    for( var j = from_.y ; j <= to_.y ; j++ ){
      for( var i = from_.x ; i <= to_.x ; i++ ){
        if( fill === 'fill' ){
          tr[j][i].classList.add('selected');
        }else if( fill === 'erase' ){
          tr[j][i].classList.remove('selected');
        }else{
          tr[j][i].classList.toggle('selected');
        }
        tr[j][i].classList.add('active');
      }
    }
  }
  var markLine = function( from_, to_ ){
    var tmp = null;
    to_.y = from_.y;

    if( from_.x > to_.x ){
      tmp = from_.x;
      from_.x = to_.x;
      to_.x = tmp;
    }

    table.find('td').removeClass('selected').removeClass('active');
    state.addClass('selected')

    for( var j = from_.y ; j <= to_.y ; j++ ){
      for( var i = from_.x ; i <= to_.x ; i++ ){
        if( fill === 'fill' ){
          tr[j][i].classList.add('selected');
        }else if( fill === 'erase' ){
          tr[j][i].classList.remove('selected');
        }else{
          tr[j][i].classList.toggle('selected');
        }
        tr[j][i].classList.add('active');
      }
    }
  }

  var onHover = function(e){
    e.preventDefault();
    var self = this;
    var $this = $(this);

    var y = trs.index( this.parentNode );
    var x = tr[y].indexOf(this);

    ({
      square: markSquare,
      seq: markSeq,
      line: markLine
    })[mode]({x:target_x,y:target_y}, {x:x,y:y});

  };
  var target = null;
  var state = null;

  table.find('td.time-block').on('mousedown', function(e){
    e.preventDefault();

    if( table.hasClass('disabled') )
      return;

    target = this;

    target_y = trs.index( this.parentNode );
    target_x = tr[target_y].indexOf(this);

    state = table.find('td.selected');
    table.find('td.time-block').on('mouseover', onHover);
    $(this).trigger('mouseover');

    $(window).one('mouseup', function(e){
      e.preventDefault();
      self.doChanges();
      table.find('td').off('mouseover', onHover);
      table.find('td.active').removeClass('active');
      target = null;
      state = null;
    });
  });

}
Form.Fields.TimeInterval.prototype.i18n = function(){
  this.$.container.find('[data-i18n]').i18n();;
}
Form.Fields.TimeInterval.prototype.getData = function(){
  var d = {};

  var d_ = {};
  this.get().forEach(function( v, i ){
    d_['DayWeek'+i] = v;
  });

  d[this.json.id] = d_;
  return d;
}
Form.Fields.TimeInterval.prototype.get = function(){
  var data = this.tr.reduce(function(p, c){
    var d = [];
    var state = false;
    for( var i = 0 ; i < c.length ; i++ ){
      if( c[i].classList.contains('selected') !== state ){
        d.push( ''+((i/2)|0)+':'+(i%2>0?'30':'00') );
        state = !state;
      }
    }
    if( state ){
      d.push('24:00');
    }

    p.push(d.join(';'));
    return p;
  }, []);

  return data;
}
Form.Fields.TimeInterval.prototype.setData = function( data ){
  var d = [];
  for( var i = 0 ; i < 7 ; i++ ){
    d.push(data[this.json.id]['DayWeek'+i]);
  }

  this.original = d;
  this.set( this.original );
}
Form.Fields.TimeInterval.prototype.set = function( val ){
  // parse stuff
  if(val.length !== 7)
    return;

  var spl = null;
  var splpl = null;
  var tmp = [];
  var d = [];

  for( var i = 0 ; i < val.length ; i++ ){
    spl = val[i].split(';');
    tmp = [];
    if( spl.length > 1 ){
      for( var j = 0 ; j < spl.length ; j++ ){
        splpl = spl[j].split(':');
        tmp.push( ((splpl[0]|0)*2) + (splpl[1]==='30'?1:0) );
      }
    }
    d.push(tmp);
  }

  this.table.find('td.time-block').removeClass('selected');
  for( j = 0 ; j < d.length ; j++ ){
    for( i = 0 ; i < d[j].length ; i+=2 ){
      for( z = d[j][i] ; z < d[j][i+1] ; z++ )
        this.tr[j][z].classList.add('selected');
    }
  }

  this.doChanges();
}
Form.Fields.TimeInterval.prototype.isChanged = function(){
  var val = this.get();
  for( var i = 0 ; i < this.original.length ; i++ ){
    if(this.original[i] !== val[i]){
      return true;
    }
  }
  return false;
}
Form.Fields.TimeInterval.prototype.reset = function(){
  this.set( this.original );
}
Form.Fields.TimeInterval.prototype.clear = function(){
  this.table.find('td.time-block.selected').removeClass('selected');
}
Form.Fields.TimeInterval.prototype.applyFieldBinds = function(){}
Form.Fields.TimeInterval.prototype.validate = function(){
  return true;
}
Form.Fields.TimeInterval.prototype.saveData = function(){
  this.original = this.get();
  this.doChanges();
}
Form.Fields.TimeInterval.prototype.refresh = function(){}
Form.Fields.TimeInterval.prototype.doChanges = function(){
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
Form.Fields.TimeInterval.prototype.onChange = function( callback ){
  if( !this.changeListeners )
    this.changeListeners = [];
  this.changeListeners.push( callback );
}
Form.Fields.TimeInterval.prototype._ = scopeInterface;
Form.Fields.TimeInterval.prototype.is = function(t){
  if( t === '*' )
    return true;
  return (t.toLowerCase() === ('TimeInterval').toLowerCase()
    || t.toLowerCase() === this.json.id.toLowerCase() );
};
