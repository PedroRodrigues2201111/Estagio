/**
 * FileExplorer
 */

Form.Fields.FileExplorer = function FileExplorer(scope, container, json ){
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
Form.Fields.FileExplorer.prototype.init = function(){
  var html = Form.Template( this.json, {data: {
    input: true
  }});

  this.$.html = $(html);
  if( this.json.visibility === 'hidden' )
    this.$.container.parent().addClass('hidden');;

  this.$.container.append(this.$.html);
  this.$.vue = this.$.container.find('.fe-file-explorer');
  this.$.vue.append(Form.Fields.FileExplorer.html);

  this.setup();
  this.bind();
  this.i18n();
}
Form.Fields.FileExplorer.prototype.setup = function(){

  function fileGet( opts, cb ){
    $.ajax({
      data: JSON.stringify( opts ),
      contentType: "application/json",
      url: '/OM/api/config/GetPathInfo',
      type: 'POST'
    }).done(function(data) {
      cb(data);
    }).fail(function(err) {
      DEBUG.error(err);
    });
  }
  var DEBUG = {
    log: function(){
      if( this.debug )
        console.log.apply(console, arguments);
    },
    warn: function(){
      if( this.debug )
        console.warn.apply(console, arguments);
    },
    error: function(){
      if( this.debug )
        console.error.apply(console, arguments);
    },
    debug: true
  }

  function pointy(e){
    var p = {
      pos_threshold: 30,
      press_time: 300,

      touchStart: function(e){
        this.st = Date.now();
        var touch = e.targetTouches[0];
        this.start_pos = {
          x: touch.clientX,
          y: touch.clientY
        };
        this.last_pos = this.start_pos;
        this.total_delta = {
          x: 0,
          y: 0
        };

        var self = this;
        this.press_timeout = setTimeout(function(){
          clearTimeout( self.press_timeout );
          document.removeEventListener('touchmove', self.touchmoveHandler);
          document.removeEventListener('touchend', self.touchendHandler);
          self.press(e);
          // press
        },this.press_time);

        this.touchmoveHandler = function(e){
          self.touchMove(e);
        }
        document.addEventListener('touchmove', this.touchmoveHandler);
        
        this.touchendHandler = function(e){
          clearTimeout( self.press_timeout );
          document.removeEventListener('touchmove', self.touchmoveHandler);
          document.removeEventListener('touchend', self.touchendHandler);
          self.tap(e);
          // tap
        }
        document.addEventListener('touchend', this.touchendHandler);
      },
      touchMove: function(e){
        var touch = e.targetTouches[0];
        this.total_delta = {
          x: touch.clientX - this.start_pos.x,
          y: touch.clientY - this.start_pos.y
        };

        var tdelta = 
            this.total_delta.x * this.total_delta.x 
          + this.total_delta.y * this.total_delta.y;

        if( tdelta > this.pos_threshold*this.pos_threshold ){
          clearTimeout( this.press_timeout );
          document.removeEventListener('touchmove', this.touchmoveHandler);
          document.removeEventListener('touchend', this.touchendHandler);
          // nothing
        }
      },
      listeners: {},
      emit: function(ev, e){
        if(this.listeners[ev]){
          for( var i = 0 ; i < this.listeners[ev].length ; i++ ){
            this.listeners[ev][i](e);
          }
        }
      },
      on: function(ev, cb){
        this.listeners[ev] = this.listeners[ev] || [];
        this.listeners[ev].push(cb);
      },
      onPress: function(cb){
        this.on('press', cb);
      },
      onTap: function(cb){
        this.on('tap', cb);
      },
      press: function(e){
        this.emit('press', e);
      },
      tap: function(e){
        this.emit('tap', e);
      }
    }
    if(e)
      p.touchStart(e);

    return p;
  }
  
  var el = this.$.vue[0];
  var nv = new Vue({
    el: el,
    data: {
      draw: 0,
      loading: false,
      selecting: false,
      fields: [{
        title: 'Name',
        name: 'name',
        visible: true,
        render: function(v){
          return v;
        }
      },{
        title: 'Type',
        name: 'type',
        visible: true,
        sortable: false,
        render: function(u, v){
          if( v.type === 'folder' )
            return 'Folder';

          return (formatMap[v.name.split('.').slice(-1)[0]]||{desc:'Other'}).desc;
        }
      },{
        title: 'Size',
        name: 'length',
        visible: true,
        render: function(v){
          v = v|0;

          if( v === undefined )
            return;
          if( v === 0 )
            return '0 B';
          var i = Math.floor( Math.log(v) / Math.log(1000) );
          return ( v / Math.pow(1000, i) ).toFixed(2) * 1 + ' ' + ['B', 'KB', 'MB', 'GB', 'TB'][i];
        }
      },{
        title: 'Created',
        name: 'creationData',
        visible: true,
        render: function(d){
          return (new Date(d)).toLocaleString()
        }
      }],
      path: [],
      currentPage: [],
      total: 0,
      filtered: 0,
      view: 'list',
      history: [[]],
      history_pos: 0,
      perPage: 5,
      sort: 'name',
      filter: '',
      sortdir: 'asc',
      page: 1
    },
    computed: {
      pagesTotal: function(){
        return Math.ceil(this.filtered/this.perPage);
      },
      pageList: function(){
        var pages = [];
        var etc_previous = false
        for( var i = 1 ; i <= this.pagesTotal ; i++ ){
          if( i <= 2 || ( i <= this.page +2 && i >= this.page -2 ) || i >= this.pagesTotal  -1){
            pages.push(i);
            etc_previous = false;
          }else{
            if( !etc_previous ){
              pages.push('...');
              etc_previous = true;
            }
          }
        }
        return pages;
      },
      currentFolder: function(){
        var self = this;
        var current = this.structure;
        for( var i = 0 ; i < this.path.length ; i++ ){
          current = current.children.find(function(c){
            return c.name === self.path[i];
          });
        }
        return current;
      }
    },
    created: function () {
      // `this` points to the vm instance
      DEBUG.log('a is: ' + this.a)
      this.load();
    },
    watch: {
      'path': function(val){
        this.page = 1;
        this.load();
      }
    },
    methods: {
      changePage: function( ev, p ){
        ev.preventDefault();
        if( !ev.target.classList.contains('disabled') ){
          this.page= p;
          this.load();
        }
      },
      refresh: function(){
        this.load();
      },
      changePath: function(){
        
      },
      changeview: function(v){
        this.view = v;
      },
      getFolder: function(opts, cb){
        var self = this;

        this.loading = true;

        fileGet(opts, function(d){
          var data = {
            total: d.recordsTotal,
            filtered: d.recordsFiltered,
            files: d.data.map(function(f){
              return {
                length: f.length,
                name: f.name,
                creationData: f.creationData,
                lastWriteTime: f.lastWriteTime,
                type: f.type
              }
            })
          }
          self.loading = false;
          self.total = data.total;
          self.filtered = data.filtered;
          self.currentPage = data.files;
        });
      },
      selected: function(n){
        this.selecting = n > 0;
      },
      unselect: function(n){
        this.$refs.folder.unselect();
      },
      goto: function(p){
        this.path = p;
        if( this.history_pos > 0 ){
          this.history = this.history.slice(0, this.history_pos*-1);
          this.history_pos = 0;
        }
        this.history.push(this.path.slice());
      },
      down: function(p){
        this.path.push(p);
        if( this.history_pos > 0 ){
          this.history = this.history.slice(0, this.history_pos*-1);
          this.history_pos = 0;
        }
        this.history.push(this.path.slice());
      },
      up: function(){
        if( this.path.length === 0 )
          return;

        this.path.pop();
        if( this.history_pos > 0 ){
          this.history = this.history.slice(0, this.history_pos*-1);
          this.history_pos = 0;
        }
        this.history.push(this.path.slice());
      },
      back: function(){
        if( this.history_pos < this.history.length ){
          this.history_pos++;
          this.path = this.history[(this.history.length-1)-this.history_pos].slice();
        }
      },
      forward: function(){
        if( this.history_pos > 0 ){
          this.history_pos--;
          this.path = this.history[(this.history.length-1)-this.history_pos].slice();
        }
      },
      load: function(){
        this.getFolder({
          path: this.path.join('/'),
          sort: this.sort,
          sortDir: this.sortdir,
          start: (this.page-1)*this.perPage,
          draw: this.draw++,
          filter: this.filter,
          length: this.perPage,
          subFolders: true
        }, function(){})
      },
      search: function(v){
        this.filter = v;
        this.load();
      },
      togglevis: function(field){
        var f = this.fields.find(function(f){
          return f.name === field.name;
        });
        if( !f )
          return;

        if( f.visible === false ){
          f.visible = true;
        }else{
          f.visible = false;
        }
      },
      sortby: function( s ){
        if( this.sort === s ){
          this.sortdir = this.sortdir === 'desc' ? 'asc' : 'desc';
        }else{
          this.sort = s;
          this.sortdir = 'desc';
        }
        this.load();
      }
    },
    components: {
      'action-bar': {
        props: ['view','path','history','history_pos', 'fields','sort','sortdir'],
        name: 'action-bar',
        template: 
          '<div class="fe-action-bar">'
        + '  <div @click="up" v-bind:class="{disabled:path.length===0}" class="btn btn-sm btn-default btn-flat">'
        + '    <i class="fa fa-fw fa-level-up fa-flip-horizontal"></i>'
        + '  </div>'
        + '  <sp></sp>'
        + '  <div @click="back" v-bind:class="{disabled:history_pos>=(history.length-1)}" class="btn btn-sm btn-default btn-flat">'
        + '    <i class="fa fa-fw fa-chevron-left"></i>'
        + '  </div>'
        + '  <div @click="forward" v-bind:class="{disabled:history_pos===0}" class="btn btn-sm btn-default btn-flat">'
        + '    <i class="fa fa-fw fa-chevron-right"></i>'
        + '  </div>'
        + '  <div style="float:right;">'
        + '    <div class="dropdown" style="display:inline-block;" v-if="view === \'list\'">'
        + '      <div href="#" class="btn btn-sm btn-default btn-flat dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">'
        + '        <i class="fa fa-fw fa-eye"></i>'
        + '      </div>'
        + '      <ul class="dropdown-menu dropdown-menu-right">'
        + '        <li @click="togglevis(f, $event)" v-for="f in fields">'
        + '          <a href="#">'
        + '            <i v-bind:class="f.visible!==false?\'fa-check-square-o\':\'fa-square-o\'" class="fa fa-fw"></i>'
        + '            <span>{{f.title}}</span>'
        + '          </a>'
        + '        </li>'
        + '      </ul>'
        + '    </div>'
        + '    <div class="dropdown" style="display:inline-block;">'
        + '      <div href="#" class="btn btn-sm btn-default btn-flat dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">'
        + '        <i class="fa fa-fw fa-sort-amount-asc"></i>'
        + '      </div>'
        + '      <ul class="dropdown-menu dropdown-menu-right">'
        + '        <li v-if="f.sortable !== false" @click="sortby(f, $event)" v-for="f in fields">'
        + '          <a href="#" v-bind:class="sortClass(f)" >'
        + '            <span class="fe-order fa-stack">'
        + '              <i class="fa fa-sort-up fa-stack-1x"></i>'
        + '              <i class="fa fa-sort-down fa-stack-1x"></i>'
        + '            </span>'
        + '            <span>{{f.title}}</span>'
        + '          </a>'
        + '        </li>'
        + '      </ul>'
        + '    </div>'
        + '    <sp></sp>'
        + '    <div class="btn btn-sm btn-default btn-flat" @click="changeview(\'tiles\')" v-bind:class="{active: view === \'tiles\'}">'
        + '      <i class="fa fa-fw fa-th-large"></i>'
        + '    </div>'
        + '    <div class="btn btn-sm btn-default btn-flat" @click="changeview(\'list\')" v-bind:class="{active: view === \'list\'}">'
        + '      <i class="fa fa-fw fa-th-list"></i>'
        + '    </div>'
        + '    <sp></sp>'
        + '    <div class="btn btn-sm btn-default btn-flat" @click="refresh">'
        + '      <i class="fa fa-fw fa-refresh"></i>'
        + '    </div>'
        + '  </div>'
        + '</div>',
        components: {
          'sp': {
            name: 'sp',
            template: '<span style="width:5px;display: inline-block;"></span>'
          }
        },
        methods: {
          refresh: function(){
            this.$emit('refresh');
          },
          back: function(){
            this.$emit('back');
          },
          forward: function(){
            this.$emit('forward');
          },
          up: function(){
            this.$emit('up');
          },
          changeview: function(v){
            this.$emit('changeview', v);
          },
          sortClass: function(f){
            var c = [];

            if( f.sortable !== false )
              c.push('sortable')

            if( this.sort === f.name ){
              c.push(this.sortdir);
            }

            return c;
          },
          togglevis: function(f, ev){
            this.$emit('togglevis', f);
            ev.preventDefault();
            ev.stopPropagation();
            return false;
          },
          sortby: function( f, ev ){
            this.$emit('sortby', f.name);
            ev.preventDefault();
            ev.stopPropagation();
          }
        }
      },
      'nav-bar': {
        name: 'nav-bar',
        props: ['path'],
        data: function(){
          return {
            editing: false,
            searchval: ''
          }
        },
        methods: {
          search:function(){
            this.$emit('search', this.searchval);
          },
          searchinput: function(ev){
            var self = this;

            if( this.timeout ){
              clearTimeout(this.timeout);
            }

            this.timeout = setTimeout(function(){
              self.timeout = null;

              self.search();
            }, 500);
          },
          togglesearch: function(ev){
            ev.currentTarget.classList.toggle('open');

            if( ev.currentTarget.classList.contains('open') ){
              $(ev.currentTarget).parent().find('input').focus();
            }
          },
          nav: function(p){
            this.$emit('nav', p);
          },
          editPath: function(p){
            this.editing = !this.editing;
          }
        },
        template: 
          '<div class="fe-nav-bar">'
        /* TODO
        + '  <div @click="editPath" class="btn btn-xs btn-default btn-flat">'
        + '    <i class="fa fa-fw fa-pencil"></i>'
        + '  </div>'
        + '  <input class="fe-path-edit" v-show="editing" type="text" v-bind:value="\'/\'+path.join(\'/\')" />'
        */
        + '  <breadcrumb v-show="!editing" @nav="nav" :path="path"></breadcrumb>'
        + '  <div class="pull-right fe-dropdown">'
        + '    <div class="btn btn-xs btn-default btn-flat fe-dropper" @click="togglesearch">'
        + '      <i class="fa fa-fw fa-search"></i>'
        + '    </div>'
        + '    <div class="fe-dropped">'
        + '      <div class="input-group input-group-sm">'
        + '        <input style="width: 150px;" type="text" class="form-control" v-model="searchval" @input="searchinput" @keydown.enter="search" />'
        /* TODO
        + '        <span class="input-group-btn">'
        + '          <div class="btn btn-default btn-flat">'
        + '            <i class="fa fa-fw fa-bullseye"></i>'
        + '          </div>'
        + '        </span>'
        */
        + '      </div>'
        + '    </div>'
        + '  </div>'
        + '</div>',
        components: {
          'breadcrumb': {
            name: 'breadcrumb',
            props: ['path'],
            methods: {
              nav: function(p){
                this.$emit('nav', this.path.slice(0, p));
              }
            },
            template: 
              '<div class="fe-breadcrumb">'
            + '  <div v-bind:class="{active : path.length === 0}" class="fe-crumb btn btn-flat btn-default btn-xs" @click="nav(0)">'
            + '    <i class="fa fa-fw fa-home"></i>'
            + '  </div>'

            + '<template v-for="(p, index) in path">'
            + '  <div v-bind:class="{active : index === (path.length-1)}" class="fe-crumb btn btn-flat btn-default btn-xs" @click="nav(index+1)">'
            + '    {{ p }}'
            + '  </div>'
            + '</template>'

            + '</div>'
          }
        }
      },
      'folder': {
        name: 'folder',
        props: ['files', 'loading','view','fields', 'sort', 'sortdir'],
        data: function(){
          return {
            selecting: false
          }
        },
        methods: {
          nav: function(p){
            this.$emit('nav', p);
            this.selecting = false;
            this.$emit('selecting', 0);
          },
          open: function(p){
            this.$emit('open', p);
            this.selecting = false;
            this.$emit('selecting', 0);
          },
          selected: function(p){
            var selected = this.$children.reduce(function(a,f){
              return a+(f.selected?1:0)
            },0);
            this.selecting = ( selected > 0 );
            this.$emit('selecting', selected);
          },
          unselect: function(){
            this.$children.forEach(function(f){
              f.selected = false;
            });
            this.selecting = false;
            this.$emit('selecting', 0);
          },
          sortClass: function(f){
            var c = [];

            if( f.sortable !== false )
              c.push('sortable')

            if( this.sort === f.name ){
              c.push(this.sortdir);
            }

            return c;
          },
          sortby: function( f, ev ){
            if( !ev.currentTarget.classList.contains('sortable') )
              return;

            this.$emit('sortby', f.name);
          }
        },
        template: 
          '<div class="fe-folder">'
        + '  <div v-show="loading" class="fe-loader">'
        + '    <div class="fe-sig"></div>'
        + '  </div>'
        + '  <div v-if="view === \'tiles\'" class="fe-files">'
        + '    <item :fields="fields" :view="view" v-for="file in files" :selecting="selecting" :key="file.name" @nav="nav" @selected="selected" :file="file">'
        + '    </item>'
        + '  </div>'
        + '  <table v-if="view === \'list\'" class="fe-list-files">'
        + '    <tr>'
        + '      <th class="fe-list-icon min-width">'
        + '      </th>'
        + '      <th v-bind:class="sortClass(f)" @click="sortby(f, $event)" v-for="f in fields"  v-if="f.visible !== false">'
        + '        <span>{{f.title}}</span>'
        + '        <span class="fe-order fa-stack">'
        + '          <template v-if="f.sortable !== false" >'
        + '            <i class="fa fa-sort-up fa-stack-1x"></i>'
        + '            <i class="fa fa-sort-down fa-stack-1x"></i>'
        + '          </template>'
        + '        </span>'
        + '      </th>'
        + '    </tr>'
        + '    <tbody>'
        + '      <item :fields="fields" :view="view" v-for="file in files" :selecting="selecting" :key="file.name" @nav="nav" @selected="selected" :file="file">'
        + '      </item>'
        + '    </tbody>'
        + '  </table>'
        + '</div>',
        components: {
          'item': {
            name: 'item',
            props: ['file', 'selecting', 'view', 'fields'],
            data: function(){
              return {
                selected: false,
                touchTimer: null
              }
            },
            template: 
              '<div v-if="view === \'tiles\'" v-bind:class="cssClass" class="fe-tiles-item" '
            + '  @click="select" @dblclick="nav"'
            + '  @touchstart="touchStart"'
            + '  >'
            + '  <div class="fe-tiles-icon">'
            + '    <i v-bind:class="icon" class="fa fa-fw"></i>'
            + '  </div>'
            + '  <div class="fe-desc">'
            + '    <div class="fe-desc-name">{{file.name}}</div>'
            + '    <div class="fe-desc-detail">{{render(fields[1], file)}}</div>'
            + '  </div>'
            + '</div>'
            + '<tr v-else-if="view === \'list\'" v-bind:class="cssClass" class="fe-list-item" '
            + '  @click="select" @dblclick="nav"'
            + '  @touchstart="touchStart"'
            + '  >'
            + '  <td class="fe-list-icon min-width">'
            + '    <i v-bind:class="icon" class="fa fa-fw"></i>'
            + '  </td>'
            + '  <td v-for="f in fields" v-if="f.visible !== false">'
            + '    <span>{{render(f, file)}}</span>'
            + '  </td>'
            + '</tr>',
            computed: {
              cssClass: function(){
                return ['item-'+this.file.type, this.selected?'selected':'']
              },
              icon: function(){
                if( this.file.type === 'folder' )
                  return 'fa-folder-o';

                if( this.file.type === 'file' ){
                  if( this.file.format === 'pdf' )
                    return 'fa-file-pdf-o';
                  if( this.file.format === 'excel' )
                    return 'fa-file-excel-o';
                  if( this.file.format === 'word' )
                    return 'fa-file-word-o';
                  if( this.file.format === 'text' )
                    return 'fa-file-text-o';
                  if( this.file.format === 'image' )
                    return 'fa-file-image-o';
                  if( this.file.format === 'code' )
                    return 'fa-file-code-o';

                  return 'fa-file-o';
                }
                return 'fa-file-o';
              }
            },
            methods: {
              render: function( f, v ){
                if( f.render )
                  return f.render(v[f.name], v)
                return v[f.name]
              },
              touchStart: function(e){
                var self = this;
                var p = pointy(e);
                p.on('tap', function(){
                  DEBUG.log('tap');
                  if( self.selecting ){
                    self.select();
                  }else{
                    self.nav();
                  }
                  self.preventTimer = Date.now() + 100;
                });
                p.on('press', function(){
                  DEBUG.log('press');
                  self.select();
                  self.preventTimer = Date.now() + 100;
                });
              },
              nav: function(e){
                DEBUG.log('nav')
                if( this.file.type === 'folder' ){
                  this.$emit('nav', this.file.name);
                }else{
                  this.$emit('open', this.file.name);
                }
                e && e.preventDefault && e.preventDefault();
              },
              select: function(e){
                DEBUG.log(e && e.type);
                DEBUG.log('select')
                if( e && ( e.type === 'click' && Date.now() < ( this.preventTimer || 0 ) ) )
                  return;
                this.selected = !this.selected;
                this.$emit('selected');
                e && e.preventDefault && e.preventDefault();
              }
            }
          }
        }
      }
    }
  });

  var formatMap = {
    // PDF
    'pdf': {
      format: 'pdf',
      desc: 'PDF'
    },

    // Excel
    'xls': {
      format: 'excel',
      desc: 'Spreadsheet'
    },
    'xlsx': {
      format: 'excel',
      desc: 'Spreadsheet'
    },

    // Word
    'doc': {
      format: 'word',
      desc: 'Word'
    },
    'docx': {
      format: 'word',
      desc: 'Word'
    },

    // Image
    'png': {
      format: 'image',
      desc: 'Image'
    },
    'jpg': {
      format: 'image',
      desc: 'Image'
    },
    'jpeg': {
      format: 'image',
      desc: 'Image'
    },
    'bmp': {
      format: 'image',
      desc: 'Image'
    },
    'gif': {
      format: 'image',
      desc: 'Image'
    },

    // Text
    'txt' : {
      format: 'text',
      desc: 'Text'
    },
    'log' : {
      format: 'text',
      desc: 'Text'
    },

    // Zip
    'zip' : {
      format: 'zip',
      desc: 'Archive file'
    },
    'gz' : {
      format: 'zip',
      desc: 'Archive file'
    },
    'tar' : {
      format: 'zip',
      desc: 'Archive file'
    },
    'bz2' : {
      format: 'zip',
      desc: 'Archive file'
    },
    'rar' : {
      format: 'zip',
      desc: 'Archive file'
    },
    '7z' : {
      format: 'zip',
      desc: 'Archive file'
    },
    'tgz' : {
      format: 'zip',
      desc: 'Archive file'
    },

    // Code
    'js' : {
      format: 'code',
      desc: 'JS file'
    },
    'css' : {
      format: 'code',
      desc: 'CSS file'
    },
    'html' : {
      format: 'code',
      desc: 'HTML'
    },
    'xml' : {
      format: 'code',
      desc: 'XML'
    },
    'json' : {
      format: 'code',
      desc: 'JSON'
    }
  }
}
Form.Fields.FileExplorer.prototype.bind = function(){
  var self = this;
}
Form.Fields.FileExplorer.prototype.i18n = function(){
  this.$.html.i18n();
}
Form.Fields.FileExplorer.prototype.getData = function(){
  var d = {};
  d[this.json.id] = this.get();
  return d;
}
Form.Fields.FileExplorer.prototype.get = function(){
  return this.value;
}
Form.Fields.FileExplorer.prototype.setData = function( data, preventSave ){
  var val = data[ this.json.id ];
  if( val === null || val === undefined )
    return;

  if( !preventSave )
    this.original = val;

  this.set( val );
}
Form.Fields.FileExplorer.prototype.set = function( val, silent ){
  this.value = val;
  this.$.input.val( val );

  if( !silent )
    this.doChanges();
}
Form.Fields.FileExplorer.prototype.isChanged = function(){
  var val = this.get();
  return val !== this.original &&
    !(this.original === null && val === '' );
}
Form.Fields.FileExplorer.prototype.reset = function(){
  this.set( this.original );
}
Form.Fields.FileExplorer.prototype.clear = function(){
  this.value = null;
  this.original = null;

  this.$.input.val('');
}
Form.Fields.FileExplorer.prototype.applyFieldBinds = function(){
  var self = this;
  var B = this.json.binds;
  if(!B) return;

  B.forEach(function(b){
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
  });
}
Form.Fields.FileExplorer.prototype.validate = function(){
  var self = this;
  // check if has validation settings
  if( !this.json.validation )
    return true;

  var errors = []; // i18n keys

  // setup validation elements
  if( !this._tabli )
    this._tabli = $('[href="#'+this.$.html.closest('.tab-pane').attr('id')+'"]').parent();


  var val = this.json.validation;
  var value = this.get();

  // validate empty
  if( val.required && ( !value || (value+'').trim() === '' ) ){
    // apply error
    // i18n.t('common.errors.required');
    errors.push('app.errors.required-field');
  }

  if( val.custom ){
    (Array.isArray(val.custom)?val.custom:[val.custom]).forEach(function(f){
      var err;
      if(self.form.actions[f]){
        err = self.form.actions[f]( value, self, val );
        if( err )
          errors.push(err);
      }
    })
  }

  if(errors.length > 0){
    self.$.container.closestChildren('.for-error').html(errors.map(function(v){return i18n.t(v); }).join('<br>'));

    this.$.html.closest('.form-group').addClass('has-error');

    var cerrors = (this._tabli.attr('data-validation-error') || '').split(';');
    if( cerrors.indexOf(this.json.id) < 0 ){
      if(cerrors[0] === '')
        cerrors = [];
      cerrors.push(this.json.id);
      this._tabli.attr('data-validation-error', cerrors.join(';'));
    }
    return false;
  }

  // unset errors. set success?
  var cerrors = (this._tabli.attr('data-validation-error') || '').split(';');
  if( cerrors.indexOf(this.json.id) > -1 ){
    cerrors.splice(cerrors.indexOf(this.json.id), 1);
    if(cerrors.length > 0){
      this._tabli.attr('data-validation-error', cerrors.join(';') );
    }else{
      this._tabli.removeAttr('data-validation-error');
    }
  }
  this.$.html.closest('.form-group').removeClass('has-error');
  return true;
}
Form.Fields.FileExplorer.prototype.do = function( value, action, context, undo ){
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
  var bA = Form.Fields.FileExplorer.bindActions;

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
Form.Fields.FileExplorer.bindActions = {
  disable: [
    function( self ){ // Do
      self.$.input.prop('disabled', true);
    },
    function( self ){ // Undo
      self.$.input.prop('disabled', false);
    }
  ],
  hide: [
    function( self ){ // Do
      self.$.container.parent().addClass('hidden');
    },
    function( self ){ // Undo
      self.$.container.parent().removeClass('hidden');
    }
  ],
  show: [
    function( self ){ // Do
      self.$.container.parent().removeClass('hidden');
    },
    function( self ){ // Undo
      self.$.container.parent().addClass('hidden');
    }
  ]
}
Form.Fields.FileExplorer.prototype.doChanges = function(){
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
Form.Fields.FileExplorer.prototype.saveData = function(){
  this.original = this.get();
  this.doChanges();
}
Form.Fields.FileExplorer.prototype.refresh = function(){

}
Form.Fields.FileExplorer.html = 
    '<div class="fe-main-window">'
  + '  <action-bar '
  + '    @up="up"  '
  + '    @back="back" '
  + '    @forward="forward" '
  + '    @changeview="changeview" '
  + '    @togglevis="togglevis" '
  + '    @sortby="sortby" '
  + '    @refresh="refresh" '
  + '    :view="view"'
  + '    :sort="sort"'
  + '    :sortdir="sortdir"'
  + '    :history="history" '
  + '    :history_pos="history_pos" '
  + '    :fields="fields"'
  + '    :path="path"'
  + '  >'
  + '  </action-bar>'

  + '  <nav-bar v-show="!selecting" '
  + '    @nav="goto" '
  + '    @search="search" '
  + '    :path="path"'
  + '  ></nav-bar>'

  + '  <div v-show="selecting" class="fe-select-controls">'
  + '    <div @click="unselect" class="btn btn-flat btn-default btn-xs">'
  + '      Cancel selection <i class="fa fa-fw fa-times"></i>'
  + '    </div>'
  + '  </div>'
  + '      '
  + '  <folder ref="folder" '
  + '    @selecting="selected" '
  + '    @nav="down" '
  + '    @sortby="sortby" '
  + '    :loading="loading" '
  + '    :files="currentPage"'
  + '    :view="view"'
  + '    :sort="sort"'
  + '    :sortdir="sortdir"'
  + '    :fields="fields"'
  + '    >'
  + '  </folder>'
  + '  <ul class="fe-pages pagination pagination-sm">'
  + '    <li '
  + '      v-bind:class="{\'active\':n===page,\'disabled\':n===\'...\'}" '
  + '      v-for="n in pageList"'
  + '      @click="n!=\'...\'&&changePage($event, n)"'
  + '      >'
  + '      <a href="#">'
  + '        {{n}}'
  + '      </a>'
  + '    </li>'
  + '  </ul>'
  + '</div>'
   ;
Form.Fields.FileExplorer.prototype.onChange = function( callback ){
  if( !this.changeListeners )
    this.changeListeners = [];

  this.changeListeners.push( callback );
}
Form.Fields.FileExplorer.prototype._ = scopeInterface;
Form.Fields.FileExplorer.prototype.is = function(t){
  if( t === '*' )
    return true;
  return (t.toLowerCase() === ('FileExplorer').toLowerCase()
    || t.toLowerCase() === this.json.id.toLowerCase() );
};