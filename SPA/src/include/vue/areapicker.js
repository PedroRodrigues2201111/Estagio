;(function(){
  var rselHuePicker = {
    props: ['field', 'appState'],
    name: 'rsel-hue-picker',
    computed: {
    },
    template: `
      <div class="rsel-hue-picker">
        <input v-bind:disabled="appState.readonly" type="text" />
      </div>
      `,
    watch: {
      'appState.readonly': function(v){
        $(this.$el).children('input').spectrum(!v?"enable":"disable");
      }
    },
    mounted: function(){
      var self = this;
      var i = $(this.$el).children('input');
      i.spectrum({
        showButtons: false,
        color: this.field.color,
        move: function(color) {
          self.field.color = color.toRgbString();
          triggerChange();
        }
      });
    }
  }
  var rselFieldRect = {
    props: ['rect', 'appState'],
    name: 'rsel-field-rect',
    computed: {
      selected: function(){
        return this.appState.selectedRect === this.rect;
      },
      area_name: function(){
        if( !i18n || !i18n.t 
        || !this.appState.lang 
        || !this.appState.i18n_keys.area_name 
        )
          return 'Area name';
        return i18n.t( this.appState.i18n_keys.area_name );
      },
      value_name: function(){
        if( !i18n || !i18n.t 
        || !this.appState.lang 
        || !this.appState.i18n_keys.area_name 
        )
          return 'Value';
        return i18n.t( this.appState.i18n_keys.area_name );
      },
      option_names: function(){
        if( !i18n || !i18n.t 
        || !this.appState.lang 
        || !this.appState.i18n_keys.area_name 
        )
          return 'Value';
        return i18n.t( this.appState.i18n_keys.area_name );
      }
    },
    watch: {
      'rect.name': function(){
        triggerChange();
      }
    },
    template: `
      <div class="rsel-field-rect" v-bind:class="{selected: selected}" @mouseenter="mouseenter" @mouseleave="mouseleave">
        <i v-show="!appState.readonly && !selected" class="rsel-edit fa fa-fw fa-pencil" @click="editRect"></i>
        <i v-show="!appState.readonly && selected" class="rsel-edit fa fa-fw fa-check" @click="editRect"></i>
        <i v-show="!appState.readonly" class="rsel-remove fa fa-fw fa-times" @click="removeRect"></i>
        <div v-if="appState.editingValues" class="row">
          <div class="col-sm-6 col-xs-12">
            <input class="rsel-field-rect-input" v-bind:readonly="appState.readonly" type="text" v-bind:placeholder="area_name" v-model="rect.name" />
          </div>
          <div v-if="!selected" class="col-sm-6 col-xs-12">
            <span v-bind:readonly="appState.readonly" type="text" v-bind:placeholder="value_name">{{rect.name}}</span>
          </div>
          <div v-else class="col-sm-12">
            <textarea class="rsel-field-rect-input" v-bind:readonly="appState.readonly" type="text" v-bind:placeholder="value_name" v-model="rect.name"></textarea>
          </div>
        </div>
        <input v-else class="rsel-field-rect-input" v-bind:readonly="appState.readonly" type="text" v-bind:placeholder="area_name" v-model="rect.name" />
      </div>
      `,
    methods: {
      mouseenter: function(){
        this.$emit('highlightRect', this.rect);
      },
      mouseleave: function(){
        this.$emit('unhighlightRect', this.rect);
      },
      editRect: function(ev){
        if(ev.currentTarget.classList.contains('disabled'))
          return
          
        if( this.selected ){
          this.appState.selectedRect = null;
        }else{
          this.appState.selectedRect = this.rect;
        }
      },
      removeRect: function(ev){
        if(ev.currentTarget.classList.contains('disabled'))
          return

        this.$emit('removeRect', this.rect);
      }
    }
  }

  var rselField = {
    props: ['field', 'appState'],
    name: 'rsel-field',
    computed: {
      field_name: function(){
        if( !i18n || !i18n.t 
        || !this.appState.lang 
        || !this.appState.i18n_keys.field_name 
        )
          return 'Field name';
        return i18n.t( this.appState.i18n_keys.field_name );
      }
    },
    watch: {
      'field.name': function(){
        triggerChange();
      }
    },
    template: `
      <div class="rsel-field" style="" @mouseenter="mouseenter" @mouseleave="mouseleave">
        <div class="rsel-field-inputs" style="" >
          <input style="flex-grow:100" v-bind:readonly="appState.readonly" type="text" v-bind:placeholder="field_name" v-model="field.name" />
          <select v-model="field.type" v-bind:disabled="appState.readonly">
            <option value="Text">Text</option>
            <option value="TextLine">Text (Line)</option>
            <option value="TextWord">Text (Word)</option>
            <option value="Numeric">Numeric</option>
            <option value="NumericLine">Numeric (Line)</option>
            <option value="NumericWord">Numeric (Word)</option>
            <option value="Barcode">Barcode</option>
            <option value="Trigger">Trigger</option>
          </select>
          <rsel-hue-picker :field="field" :appState="appState"></rsel-hue-picker>
          <i v-show="!appState.readonly" class="fa fa-fw fa-trash pull-right rsel-bin"@click="removeField"></i>
        </div>
        <div class="" style="padding: 10px;">
          <rsel-field-rect v-for="rect in field.rects" @removeRect="removeRect" :key="rect.id" :rect="rect" :app-state="appState" 
            @highlightRect="highlightRect" @unhighlightRect="unhighlightRect">
          </rsel-field-rect>
          <div v-show="!appState.readonly" class="btn btn-sm btn-soft" @click="addTo">
            <i class="fa fa-fw fa-plus"></i>
          </div>
        </div>
      </div>
      `,
    components: {
      'rsel-hue-picker': rselHuePicker,
      'rsel-field-rect': rselFieldRect
    },
    methods: {
      highlightRect: function(rect){
        this.$emit('highlightRect', rect);
      },
      unhighlightRect: function(rect){
        this.$emit('unhighlightRect', rect);
      },
      mouseenter: function(){
        this.$emit('highlightField', this.field);
      },
      mouseleave: function(){
        this.$emit('unhighlightField', this.field);
      },
      addTo: function(){
        this.$emit('addTo', this.field);
      },
      removeRect: function(rect){
        if( this.appState.selectedRect === rect )
          this.appState.selectedRect = null;

        var i = this.field.rects.indexOf(rect);
        if( i > -1 )
          this.field.rects.splice(i, 1);

        triggerChange();
      },
      removeField: function(ev){
        if(ev.currentTarget.classList.contains('disabled'))
          return;
          
        this.$emit('removeField', this.field);
      }
    }
  }
  var rselFieldsList = {
    props: ['fields', 'appState'],
    name: 'rsel-fields-list',
    computed: {
    },
    template: `
      <div class="rsel-fields-list">
        <rsel-field v-for="field in fields" @removeField="removeField" :key="field.id" :field="field" :app-state="appState" @addTo="addTo"
          @highlightRect="highlightRect" @unhighlightRect="unhighlightRect"
          @highlightField="highlightField" @unhighlightField="unhighlightField">
        </rsel-field>
        <div v-show="!appState.readonly" class="btn btn-soft" @click="add">
          <i class="fa fa-fw fa-plus"></i>
        </div>
      </div>
      `,
    components: {
      'rsel-field': rselField
    },
    methods: {
      highlightRect: function(rect){
        this.$emit('highlightRect', rect);
      },
      unhighlightRect: function(rect){
        this.$emit('unhighlightRect', rect);
      },
      highlightField: function(field){
        this.$emit('highlightField', field);
      },
      unhighlightField: function(field){
        this.$emit('unhighlightField', field);
      },
      removeField: function(field){
        if( this.appState.selectedRect && field.rects.indexOf(this.appState.selectedRect) > -1 )
          this.appState.selectedRect = null;

        var i = this.fields.indexOf(field);
        if( i > -1 )
          this.fields.splice(i, 1);

        triggerChange();
      },
      addTo: function(field){
        this.$emit('addTo', field);
      },
      add: function(ev){
        if(ev.currentTarget.classList.contains('disabled'))
          return
          
        this.fields.push({
          name: '',
          id: -1,
          color: 'hsl('+((Math.random()*360)|0)+',100%,50%)',
          type: "Text",
          rects: []
        });

        triggerChange();  
      }
    }
  }

  var rselRectDisplay = {
    props: ['rect', 'field', 'appState'],
    name: 'rsel-rect-display',
    computed: {
      selected: function(){
        return this.rect === this.appState.selectedRect;
      },
      active : function(){
        if( this.appState.selectedRect ){
          if( this.appState.selectedRect === this.rect )
            return true;
          return false;
        }
        if( this.appState.addingTo !== null ){
          return this.appState.addingTo === this.field;
        }

        if( this.appState.activeRect === null && this.appState.activeField === null ){
          return true;
        } 

        if( this.appState.activeRect !== null ){
          return this.appState.activeRect === this.rect;
        }

        return this.appState.activeField === this.field;
      },
      pos: function(){
        var c = tinycolor(this.field.color+'');
        var a = { 
          'border': "2px solid "+ ( c.setAlpha( this.active ? .6 : .2 ).toRgbString() ),
          'background-color': ( c.setAlpha( this.active ? .3 : .1 ).toRgbString() ),
          'top': this.rect.coords.top+'%',
          'left': this.rect.coords.left+'%',
          'bottom': (100-this.rect.coords.bottom)+'%',
          'right': (100-this.rect.coords.right)+'%',
          'position': 'absolute',
          'margin': '-1px -1px -1px -1px',
          'box-sizing': 'border-box'
        }
        return a;
      }
    },
    template: `
      <div class="rsel-rect" v-bind:class="{selected: selected, active:active, disabled:appState.readonly}" v-bind:style="pos" @click="click">
        <div @touchstart="resize( \'s\', $event )"  @mousedown="resize( \'s\', $event )" class="rsel-rect-handle rsel-rect-resize-handle s"></div>
        <div @touchstart="resize( \'se\', $event )" @mousedown="resize( \'se\', $event )" class="rsel-rect-handle rsel-rect-resize-handle se"></div>
        <div @touchstart="resize( \'e\', $event )"  @mousedown="resize( \'e\', $event )" class="rsel-rect-handle rsel-rect-resize-handle e"></div>
        <div @touchstart="resize( \'ne\', $event )" @mousedown="resize( \'ne\', $event )" class="rsel-rect-handle rsel-rect-resize-handle ne"></div>
        <div @touchstart="resize( \'n\', $event )"  @mousedown="resize( \'n\', $event )" class="rsel-rect-handle rsel-rect-resize-handle n"></div>
        <div @touchstart="resize( \'nw\', $event )" @mousedown="resize( \'nw\', $event )" class="rsel-rect-handle rsel-rect-resize-handle nw"></div>
        <div @touchstart="resize( \'w\', $event )"  @mousedown="resize( \'w\', $event )" class="rsel-rect-handle rsel-rect-resize-handle w"></div>
        <div @touchstart="resize( \'sw\', $event )" @mousedown="resize( \'sw\', $event )" class="rsel-rect-handle rsel-rect-resize-handle sw"></div>
        <div @touchstart="move" @mousedown="move" class="rsel-rect-handle move"></div>
      </div>
      `,
    methods: {
      click: function(ev){
        if(ev.currentTarget.classList.contains('disabled'))
          return
          
        ev.preventDefault();
        ev.stopPropagation();
        this.appState.selectedRect = this.rect;
      },
      opposite: function( dir ){
        return {
          n: 's',
          s: 'n',
          e: 'w',
          w: 'e',
          ne: 'sw',
          nw: 'se',
          se: 'nw',
          sw: 'ne',
        }[dir];
      },
      move: function(ev){
        ev.preventDefault();
        ev.stopPropagation();
        var sX = null;
        var sY = null;
        var r = this.rect;

        sX = (r.coords.left*pW)/100;
        sY = (r.coords.top*pH)/100;

        var oW = r.coords.right - r.coords.left;
        var oH = r.coords.bottom - r.coords.top;


        var $html = $(this.$el).parent();
        var pW = $html.width();
        var pH = $html.height();
        var pX = $html.offset().left;
        var pY = $html.offset().top;

        var offsetX = ((( ev.touches ? ev.touches[0].pageX : ev.pageX ) - pX )/pW)*100 - r.coords.left;
        var offsetY = ((( ev.touches ? ev.touches[0].pageY : ev.pageY ) - pY )/pH)*100 - r.coords.top;

        var moveHandler = function( evv ){
          var eX = (( evv.touches ? evv.touches[0].pageX : evv.pageX ) - pX );
          var eY = (( evv.touches ? evv.touches[0].pageY : evv.pageY ) - pY );

          eX = eX < 0 ? 0 : eX;
          eX = eX > pW ? pW : eX;
          eY = eY < 0 ? 0 : eY;
          eY = eY > pH ? pH : eY;

          r.coords.top = ((sY < eY ? sY : eY)/pH)*100 - offsetY;
          r.coords.top = r.coords.top < 0 ? 0 : r.coords.top;

          r.coords.left = ((sX < eX ? sX : eX)/pW)*100 - offsetX;
          r.coords.left = r.coords.left < 0 ? 0 : r.coords.left;

          if( r.coords.top + oH > 100 ){
            r.coords.bottom = 100;
            r.coords.top = 100 - oH;
          }else{
            r.coords.bottom = r.coords.top + oH;
          }

          if( r.coords.left + oW > 100 ){
            r.coords.right = 100;
            r.coords.left = 100 - oW;
          }else{
            r.coords.right = r.coords.left + oW;
          }
        }

        var mmHandler = function(evv){
          moveHandler(evv);
        }
        var muHandler = function(evv){
          $(document).off('mousemove touchmove', mmHandler);
          $(document).off('mouseup touchend', muHandler);
          moveHandler(evv);
          triggerChange();
        }
        $(document).on('mousemove touchmove', mmHandler);
        $(document).on('mouseup touchend', muHandler);
      },
      resize: function( dir, ev ){
        ev.preventDefault();
        ev.stopPropagation();
        var oeX = null;
        var oeY = null;
        var sX = null;
        var sY = null;
        var r = this.rect;


        var $html = $(this.$el).parent();
        var pW = $html.width();
        var pH = $html.height();
        var pX = $html.offset().left;
        var pY = $html.offset().top;

        switch(this.opposite(dir)){
          case 'n':
            sX = (r.coords.left*pW)/100;
            sY = (r.coords.top*pH)/100;
            oeX = (r.coords.right*pW)/100;
            break;

          case 's':
            sX = (r.coords.left*pW)/100;
            sY = (r.coords.bottom*pH)/100;
            oeX = (r.coords.right*pW)/100;
            break;

          case 'e':
            sX = (r.coords.right*pW)/100;
            sY = (r.coords.top*pH)/100;
            oeY = (r.coords.bottom*pH)/100;
            break;

          case 'w':
            sX = (r.coords.left*pW)/100;
            sY = (r.coords.top*pH)/100;
            oeY = (r.coords.bottom*pH)/100;
            break;

          case 'ne':
            sX = (r.coords.right*pW)/100;
            sY = (r.coords.top*pH)/100;
            break;
          case 'nw':
            sX = (r.coords.left*pW)/100;
            sY = (r.coords.top*pH)/100;
            break;
          case 'se':
            sX = (r.coords.right*pW)/100;
            sY = (r.coords.bottom*pH)/100;
            break;
          case 'sw':
            sX = (r.coords.left*pW)/100;
            sY = (r.coords.bottom*pH)/100;
            break;
        }

        var moveHandler = function(evv){
          var eX = oeX !== null ? oeX : (( evv.touches ? evv.touches[0].pageX : evv.pageX ) - pX );
          var eY = oeY !== null ? oeY : (( evv.touches ? evv.touches[0].pageY : evv.pageY ) - pY );

          eX = eX < 0 ? 0 : eX;
          eX = eX > pW ? pW : eX;
          eY = eY < 0 ? 0 : eY;
          eY = eY > pH ? pH : eY;

          r.coords.top = ((sY < eY ? sY : eY)/pH)*100;
          r.coords.top = r.coords.top < 0 ? 0 : r.coords.top;

          r.coords.left = ((sX < eX ? sX : eX)/pW)*100;
          r.coords.left = r.coords.left < 0 ? 0 : r.coords.left;

          r.coords.bottom = ((sY > eY ? sY : eY)/pH)*100;
          r.coords.bottom = r.coords.bottom > 100 ? 100 : r.coords.bottom;

          r.coords.right = ((sX > eX ? sX : eX)/pW)*100;
          r.coords.right = r.coords.right > 100 ? 100 : r.coords.right;
        }
        var mmHandler = function(evv){
          moveHandler(evv);
        }
        var muHandler = function(evv){
          $(document).off('mousemove touchmove', mmHandler);
          $(document).off('mouseup touchend', muHandler);
          moveHandler(evv);
          triggerChange();
        }
        $(document).on('mouseup touchend', muHandler);
        $(document).on('mousemove touchmove', mmHandler);
      }
    }
  }

  var rselDisplay = {
    props: ['fields', 'appState'],
    name: 'rsel-display',
    template: `
      <div class="rsel-area" @mousedown="startNewRect" @touchstart="startNewRect" @click="click">
        <template v-for="field in fields">
          <rsel-rect-display v-for="rect in field.rects" :key="rect.id" :rect="rect" :field="field" :app-state="appState" >
          </rsel-rect-display>
        </template>
      </div>
      `,
    methods: {
      click: function(ev){
        if(ev.currentTarget.classList.contains('disabled'))
          return
          
        this.appState.selectedRect = null;
      },
      startNewRect: function(ev){
        if( this.appState.addingTo === null ){
          return;
        }
        var self = this;

        ev.preventDefault();
        ev.stopPropagation();
        var $html = $(this.$el);
        var pW = $html.width();
        var pH = $html.height();

        var ts = Date.now();

        var $this = $(ev.currentTarget);

        var pX = $this.offset().left;
        var pY = $this.offset().top;
        
        var sX = ( ev.touches ? ev.touches[0].pageX : ev.pageX ) - pX;
        var sY = ( ev.touches ? ev.touches[0].pageY : ev.pageY ) - pY;

        var r = {
          id: ts,
          name: '',
          coords: {
            top: 0,
            right: 0,
            bottom: 0,
            left: 0
          }
        };

        var moveHandler = function(evv){
          var eX = ( evv.touches ? evv.touches[0].pageX : evv.pageX ) - pX;
          var eY = ( evv.touches ? evv.touches[0].pageY : evv.pageY ) - pY;

          eX = eX < 0 ? 0 : eX;
          eX = eX > pW ? pW : eX;
          eY = eY < 0 ? 0 : eY;
          eY = eY > pH ? pH : eY;

          r.coords.top = ((sY < eY ? sY : eY)/pH)*100;
          r.coords.top = r.coords.top < 0 ? 0 : r.coords.top;

          r.coords.left = ((sX < eX ? sX : eX)/pW)*100;
          r.coords.left = r.coords.left < 0 ? 0 : r.coords.left;

          r.coords.bottom = ((sY > eY ? sY : eY)/pH)*100;
          r.coords.bottom = r.coords.bottom > 100 ? 100 : r.coords.bottom;

          r.coords.right = ((sX > eX ? sX : eX)/pW)*100;
          r.coords.right = r.coords.right > 100 ? 100 : r.coords.right;
        }

        var mmHandler = function(evv){
          moveHandler(evv);
        }
        var muHandler = function(evv){
          $(document).off('mousemove touchmove', mmHandler);
          $(document).off('mouseup touchend', muHandler);
          moveHandler(evv);
          self.appState.addingTo = null;
          triggerChange();
        }
        $(document).on('mousemove touchmove', mmHandler);
        $(document).on('mouseup touchend', muHandler);
        this.appState.addingTo.rects.push(r);
      }
    },
    components: {
      'rsel-rect-display': rselRectDisplay
    }
  }
  var triggerChange = null;
  window.vues = window.vues || {};
  window.vues.areapicker = function( el ){
    var nv = new Vue({
      el: el,
      computed: {
        zoomShadow: function(){
          return {
            'box-shadow': this.appState.zoom > 1 ?'inset -6px 8px 4px 4px black':''
          }
        },
        zoom: function(){},
        css: function(){
          return {
            border: '2px dashed ' + ( this.appState.addingTo === null ? 'transparent' : '#084ac1' )
          }
        }
      },
      template: `
        <div class="row" style="display: flex;flex-wrap: wrap;overflow: auto;width: 100%;background:white">
          <div class="rsel-display-col col-xs-6" v.bind:style="zoomShadow">
            <div class="rsel-display-container" v-bind:style="css">
              <div class="rsel-loader" v-if="loading">
                <div class="rsel-sig"></div>
              </div>
              <div class="rsel-loader" v-if="imgloaderror">
                <div style="height:100%;font-size: 70px; text-align:center;position:relative"><i style="  top: 50%;position: absolute;margin: -35px 0px 0px -42px;" class="fa fa-fw fa-close text-danger"></i></div>
              </div>
              <img v-on:error="imgerror" v-on:load="imgload" class="fg" v-bind:src="img" />
              <img v-bind:src="default_img" />
              <rsel-display :fields="fields" :app-state="appState" ></rsel-display>
            </div>
          </div>
          <div class="col-xs-6" style="position:relative">
            <div style="margin: 0px -15px 0 -30px;text-align:right;box-shadow: 0 5px 6px -4px rgba(0,0,0,0.2);padding: 5px;">
              <div class="btn btn-sm btn-soft" @click="togglefull"><i class="fa fa-fw fa-arrows-alt"></i></div>
            </div>
            <div class="rsel-adding-overlay" v-if="appState.addingTo!==null">
              <div class="rsel-adding-overlay-cancel">
                <i class="fa fa-times" @click="cancelAdd"></i>
              </div>
            </div>
            <rsel-fields-list :fields="fields" @addTo="addTo"  :app-state="appState"
              @highlightRect="highlightRect" @unhighlightRect="unhighlightRect"
              @highlightField="highlightField" @unhighlightField="unhighlightField">
            </rsel-fields-list>
          </div>
        </div>
        `,
      data: function(){
        return {
          fields: [],
          loading: false,
          imgloaderror: false,
          img: '/ControlServer/include/vue/areapicker_base.png',
          default_img: '/ControlServer/include/vue/areapicker_base.png',
          appState: {
            activeField: null,
            activeRect: null,
            addingTo: null,
            selectedRect: null,
            editingValues: false,
            readonly: false,
            lang: 'en',
            i18n_keys: {
              area_name: '',
              field_name: ''
            },
            zoom: 1
          }
        }
      },
      components: {
        'rsel-display': rselDisplay,
        'rsel-fields-list': rselFieldsList
      },
      watch:{
        img: function(){
          this.imgloaderror = false;
          this.loading = true;
        }
      },
      methods: {
        imgerror: function(){
        //  this.loading = false;
          console.log("err");
          this.imgloaderror = true;
          this.loading = false;
        },
        imgload: function(){
          this.loading = false;
          console.log("load");
        },
        togglefull: function(ev){
          if (screenfull.enabled) {
            screenfull.toggle(this.$el);
          }
        },
        highlightRect: function(rect){
          this.appState.activeRect = rect;
        },
        unhighlightRect: function(rect){
          if( this.appState.activeRect === rect )
            this.appState.activeRect = null;
        },
        highlightField: function(field){
          this.appState.activeField = field;
        },
        unhighlightField: function(field){
          if( this.appState.activeField === field )
            this.appState.activeField = null;
        },
        addTo: function(field){
          this.appState.addingTo = field;
          this.appState.selectedRect = null;
        },
        cancelAdd: function(){
          this.appState.addingTo = null;
        }
      }
    });

    var changeHandlers = [];
    triggerChange = function(){
      for( var i = 0 ; i < changeHandlers.length ; i++ ){
        changeHandlers[i]();
      }
    }

    var obj = {
      isValidData: function(d){
        if( d.fields ){
          if( !Array.isArray(d.fields) )
            return false;

          for( var i = 0 ; i < d.fields.length ; i++ ){
            /*if( d.fields[i].id === undefined ||  d.fields[i].id === null )
              return false;*/

            if( d.fields[i].color === undefined || d.fields[i].color === null || !tinycolor(d.fields[i].color).isValid() )
              return false;

            if( d.fields[i].name === undefined ||  d.fields[i].name === null )
              return false;

            if( !Array.isArray(d.fields[i].rects) )
              return false;

            
            for( var j = 0 ; j < d.fields[i].rects.length ; j++ ){
              /*if( d.fields[i].rects[j].id === undefined ||  d.fields[i].rects[j].id === null )
                return false;*/
                
              if( d.fields[i].rects[j].name === undefined ||  d.fields[i].rects[j].name === null )
                return false;
                
              if( d.fields[i].rects[j].coords === undefined ||  d.fields[i].rects[j].coords === null )
                return false;
                
              if( d.fields[i].rects[j].coords.bottom === undefined ||  d.fields[i].rects[j].coords.bottom === null )
                return false;
                
              if( d.fields[i].rects[j].coords.top === undefined ||  d.fields[i].rects[j].coords.top === null )
                return false;
                
              if( d.fields[i].rects[j].coords.left === undefined ||  d.fields[i].rects[j].coords.left === null )
                return false;

              if( d.fields[i].rects[j].coords.right === undefined ||  d.fields[i].rects[j].coords.right === null )
                return false;
              
            }
          }
          return true;
        }
      },
      get: function(){
        return nv.fields;
      },
      set: function(d){
        console.log(d);
        if( Array.isArray(d) ){
          nv.fields = d;
        }else{
          nv.fields = d.fields;
          if( d.image )
            this.setImg(d.image);
        }
      },
      onChange: function(cb){
        changeHandlers.push(cb);
      },
      setImg: function(d){
        if(d){
          nv.img = d;
        }else{
          nv.img = nv.default_img;
        }
      },
      setLang: function(d){
        nv.appState.lang = d;
      },
      getNV: function(){
        return nv;
      },
      readonly: function(set){
        nv.appState.readonly = set;
      }
    };
    changeHandlers.push(function(){
      console.log(obj.isValidData({data:obj.get()}))
    });
    return obj;
  }
})()
