Form.Fields.Permissions = function Permissions(scope, container, json ){
  this.scope = scope;
  this.container = container;
  this.json = json;

  this.$ = {};
  this.$.container = $(this.container);
  this.$.html = null;

  this.form = this._('^form').get(0);
  this.view = this._('^view').get(0);

  this.value = null;
  this.original = null;

  this.changeListeners = [];

  this.init();
}
Form.Fields.Permissions.prototype.init = function(){
  var self = this;
  this.json.ap = permissions;

  var html = Form.Template( this.json, {data: {
    input: true
  }});

  this.$.html = $(html);
  if( this.json.visibility === 'hidden' )
    this.$.container.parent().addClass('hidden');;

  this.$.container.append(this.$.html);

  this.getUsersUrl = (this.view.getUrl(this.json.getUsersUrl)?this.view.getUrl(this.json.getUsersUrl).fillWith( this ):this.json.getUsersUrl);
  this.getRolesUrl = (this.view.getUrl(this.json.getRolesUrl)?this.view.getUrl(this.json.getRolesUrl).fillWith( this ):this.json.getRolesUrl);
  this.getViewsUrl = (this.view.getUrl(this.json.getViewsUrl)?this.view.getUrl(this.json.getViewsUrl).fillWith( this ):this.json.getViewsUrl);
  this.postUrl = (this.view.getUrl(this.json.postUrl)?this.view.getUrl(this.json.postUrl).fillWith( this ):this.json.postUrl);

  this.templates = ({
    user: ''
      +'<tr class="user-tr hidden">'
      +'  {{#if first}}'
      +'  <td rowspan="1" class="user">'
      +'    <span data-i18n="app.permissions.users"> Users </span>'
      +'  </td>'
      +'  {{/if}}'
      +'  <td class="view-user" data-id="{{data.UserId}}">'
      +'    {{data.FirstName}} {{data.LastName}} <i class="fa fa-trash remove">'
      +'  </td>'
      +'  '
      +'  {{#each ap}}'
      +'  <td class="text-center">'
      +'    <div class="checkboxb">'
      +'      <input type="checkbox" id="u_{{../perm.view}}_{{../data.UserId}}_{{k}}" data-id="{{k}}" {{#eq (prop ../perm.p k) true}}checked{{/eq}}>'
      +'      <label for="u_{{../perm.view}}_{{../data.UserId}}_{{k}}"></label>'
      +'    </div>'
      +'  </td>'
      +'  {{/each}}'
      +'  '
      +'</tr>'
      ,
    role: ''
      +'<tr class="role-tr">'
      +'  {{#if first}}'
      +'  <td rowspan="1" class="role">'
      +'    <span data-i18n="app.permissions.roles"> Roles </span>'
      +'  </td>'
      +'  {{/if}}'
      +'  <td class="view-role" data-id="{{data.RoleId}}">'
      +'    {{data.Name}} <i class="fa fa-trash remove">'
      +'  </td>'
      +'  '
      +'  {{#each ap}}'
      +'  <td class="text-center">'
      +'    <div class="checkboxb">'
      +'      <input type="checkbox" id="r_{{../perm.view}}_{{../data.RoleId}}_{{k}}" data-id="{{k}}" {{#eq (prop ../perm.p k) true}}checked{{/eq}}>'
      +'      <label for="r_{{../perm.view}}_{{../data.RoleId}}_{{k}}"></label>'
      +'    </div>'
      +'  </td>'
      +'  {{/each}}'
      +'  '
      +'</tr>'
      ,
    view: ''
      +'<tbody class="view closed" data-view-id="{{data.ApiObjectId}}" data-order="{{i}}">'
      +'  <tr class="view-tr">'
      +'    <td colspan="2" class="view-name"> <span class="view-collapse"><i class="fa fa-fw"></i> {{{FullViewPath}}} </span>  <i class="fa fa-trash remove"></i> </td>'
      +'    '
      +'    {{#each ap}}'
      +'    <td class="text-center">'
      +'      <div class="checkboxb">'
      +'        <input type="checkbox" id="v_{{../data.ApiObjectId}}_{{k}}" data-id="{{k}}" {{#eq (prop ../p k) true}}checked{{/eq}}>'
      +'        <label for="v_{{../data.ApiObjectId}}_{{k}}"></label>'
      +'      </div>'
      +'    </td>'
      +'    {{/each}}'
      +'    '
      +'  </tr>'
      +'</tbody>'
  }).keyMap(function(v){return Handlebars.compile(v)});


  this.viewIndex = {};
  this.$.tree = this.$.html.find('.view-tree');
  // get views
  Tools.Ajax.defaultPost( this.getViewsUrl )
  .then(function(data){
    var views = data.data;
    var a = views.sort(function(a, b){
      return a.OrderId - b.OrderId
    });

    var index = {};
    self.viewIndex = index;

    var tree = [];

    // index it and format it
    for( var i = 0 ; i < a.length ; i++ ){
      index[a[i].ApiObjectId] = a[i];
      a[i]['data-i18n'] = a[i].I18n;
      a[i].text = i18n.t(a[i]['data-i18n']);
      a[i].icon = a[i].Icon;
    }

    // build tree and add roots to tree
    for( var i = 0, p ; i < a.length ; i++ ){
      p = a[i].ApiObjectPaiId
      if( p && index[p] ){
        index[p].nodes = index[p].nodes || [];
        index[p].nodes.push( a[i] );
      //  index[p].selectable = false;
      }else{
        tree.push( a[i] );
      }
    }

    self.treeData = tree;
    var f = [];
    var Q = tree.map(function(v){return v});
    var q;
    while( Q.length > 0 ){
      q = Q.shift();
      f.push(q);
      if( q.nodes ){
        for( var i = q.nodes.length-1 ; i >= 0 ; i-- ){
          Q.unshift(q.nodes[i]);
        }
      }
    }

    for( var i = 0 ; i < f.length ; i++ ){
      f[i].i=i;
    }
    self.flatTree = f;

    self.$.tree.treeview({
      data: tree,
      levels: 1,
      collapseIcon: 'fa fa-fw fa-minus',
      expandIcon: 'fa fa-fw fa-plus',
      selectedIcon: 'fa fa-check-square-o',
      searchResultColor: 'rgb(22, 115, 221)',
      selectedBackColor: 'rgba(218, 218, 218, 0.1)',
      selectedColor: 'black',
      multiSelect: true
    });

    self.initTable();
  })
  .catch(function(err){
    console.error(err);
  });

  this.$.p = permissions.keyMap(function(v, k){
    return self.$.html.find('#perm-'+k)[0]
  });

  this.$.table = this.$.html.find('table');
  //this.$.table.floatThead({position:'absolute'});

  // add and remove as needed
  this.data = {};
  this.initSelects();
  this.bind();
  this.i18n();
}
Form.Fields.Permissions.prototype.initTable = function(){
  var self = this;
  var tree = self.treeData;
  var f = self.flatTree;
  Tools.Ajax.defaultPost( window.app.settings['api-url']+'/users/getallpermission')
  .then(function( data ){

    data.Users.forEach(function(v){
      self.users[v.UserId] = v;
      var pIndex = {};
      if( v.Permission ){
        v.Permission.forEach(function(p){
          pIndex[p.ApiObjectId] = p;
          self.userP[p.ApiObjectId] = self.userP[p.ApiObjectId] || {};
          self.userP[p.ApiObjectId][v.UserId] = p;
        });
      }

      self.addRows(
        [],
        [v.UserId],
        f.filter(function(f){
          if( pIndex[f.ApiObjectId] )
            return true;
          return false;
        })
      );
    });

    data.Roles.forEach(function(v){
      self.roles[v.RoleId] = v;
      var pIndex = {};
      if( v.Permission ){
        v.Permission.forEach(function(p){
          pIndex[p.ApiObjectId] = p;
          self.roleP[p.ApiObjectId] = self.roleP[p.ApiObjectId] || {};
          self.roleP[p.ApiObjectId][v.RoleId] = p;
        });
      }

      self.addRows(
        [v.RoleId],
        [],
        f.filter(function(f){
          if( pIndex[f.ApiObjectId] )
            return true;
          return false;
        })
      );
    });
  });
}
Form.Fields.Permissions.prototype.addRows = function( roles, users, views ){
  var self = this;

  // get defaults from checkboxes
  var p = self.$.p.keyMap(function(v){return v.checked});

  // add to structure
  var d = self.data;
  views.reverse();
  views.forEach(function(v){
    var id = v.ApiObjectId;
    var $view;
    if( d[id] ){
      $view = self.$.table.find('[data-view-id="'+id+'"]');
      $view.detach().prependTo(self.$.table);
      // pull up
    }else{
      // add view to both data and DOM
      d[id] = {
        id: id,
        roles: {},
        users: {}
      };
      $view = $(self.templates.view({
        ap: permissions,
        p: p,
        i: v.i,
        data: self.viewIndex[id],
        FullViewPath: (function gp(i){
          return (i.ApiObjectPaiId?gp(self.viewIndex[i.ApiObjectPaiId])+' > ':'')
            +'<span data-i18n="'+i.I18n+'">'+i18n.t(i.I18n)+'</span>';
          })( self.viewIndex[id] )
        })
      );

      if( !self.$.table.has('tbody').length ){
        $view.appendTo( self.$.table );
      }else{
        $view.insertBefore( self.$.table.find('tbody')[0] );
      }
    }

    roles.forEach(function(rid){
      var r = self.roles[rid];
      if( d[id].roles[rid] ){
        // pull up
        // or maybe not

        // check permissions
      }else{
        d[id].roles[rid] = r;
        if( !$view.has('.role').length ){
          $view.append( self.templates.role({
            ap:permissionList,
            perm:{
              view:id,
              p:( self.roleP[id]&&self.roleP[id][rid]
                ? ({}).deepMerge(p).deepMerge(parsePermissions(self.roleP[id][rid].ApiPermissionValue))
                :p)
            },
            data:r,
            first:true
          }));
        }else{
          var $vr = $view.find('.role')
          $vr.attr('rowspan', ($vr.attr('rowspan')|0) + 1 );
          $view.find('.view-role').parent().last().after(
            self.templates.role({
              ap:permissionList,
              perm:{
                view:id,
                p:( self.roleP[id]&&self.roleP[id][rid]
                  ? ({}).deepMerge(p).deepMerge(parsePermissions(self.roleP[id][rid].ApiPermissionValue))
                  :p)
              },
              data:r
            })
          );
        }
        // check permissions
      }
    });

    users.forEach(function(rid){
      var r = self.users[rid];
      if( d[id].users[rid] ){
        // pull up
        // or maybe not

        // check permissions
      }else{
        d[id].users[rid] = r;
        if( !$view.has('.user').length ){
          $view.append( self.templates.user({
            ap:permissionList,
            perm:{
              view:id,
              p:( self.userP[id]&&self.userP[id][rid]
                ? ({}).deepMerge(p).deepMerge(parsePermissions(self.userP[id][rid].ApiPermissionValue))
                :p)
            },
            data:r,
            first:true
          }));
        }else{
          var $vr = $view.find('.user')
          $vr.attr('rowspan', ($vr.attr('rowspan')|0) + 1 );
          $view.find('.view-user').parent().last().after(
            self.templates.user({
              ap:permissionList,
              perm:{
                view:id,
                p:( self.userP[id]&&self.userP[id][rid]
                  ? ({}).deepMerge(p).deepMerge(parsePermissions(self.userP[id][rid].ApiPermissionValue))
                  :p)
              },
              data:r
            })
          );
        }
        // check permissions
      }
    });
    // check headers
  });
  self.$.table.find('.view-tr').each(function(){
    var $tr = $(this);
    var $tbody = $tr.closest('tbody');
    $tr.find('input[type="checkbox"]').each(function(){
      var p = $(this).data('id');
      if( $tbody.children(':not(.view-tr)').find('[data-id="'+p+'"]:not(:checked)').length === 0 ){
        $tbody.children('.view-tr').find('[data-id="'+p+'"]')[0].checked = true;
      }else{
        $tbody.children('.view-tr').find('[data-id="'+p+'"]')[0].checked = false;
      }
    });
  });

  $( self.$.table.children('tbody').detach().toArray().sort(function(a, b){
    return a.getAttribute('data-order') - b.getAttribute('data-order')
  })).appendTo(self.$.table);

  $(window).trigger('resize');
  self.$.table.floatThead('reflow');

  if( Object.keys(self.data).length > 0 ){
    self.$.table.closest('.form-group').removeClass('hidden')
  }

  // trigger changes logic
  self.$.table.find('tr:not(.view-tr)').find('[data-id="read"]').trigger('change');

  self.$.table.i18n();
}
Form.Fields.Permissions.prototype.bind = function(){
  var self = this;
  // Bind search
  this.$.html.find('.tree-search-input').on('input change', function(ev){
    self.$.tree.treeview('search', [ $(this).val(), {
      ignoreCase: true,     // case insensitive
      exactMatch: false,    // like or equals
      revealResults: true,  // reveal matching nodes
    }]);
  });

  this.$.html.find('[data-id="btn-select-all"]').on('click', function(){
    self.$.tree.treeview('selectAll');
  });

  this.$.html.find('[data-id="btn-select-none"]').on('click', function(){
    self.$.tree.treeview('unselectAll');
    self.$.tree.treeview('collapseAll');
    self.$.html.find('.tree-search-input').trigger('change');
  });


  this.$.html.find('[data-id="add-button"]').on('click', function(){
    // get roles from select
    var roles = self.$.roles.val() || [];

    // get users from select
    var users = self.$.users.val() || [];

    if( users.length + roles.length === 0 )
      return;

    // get views from treeview
    var views = self.$.tree.treeview('getSelected');
    if( !views.length )
      return;

    self.addRows( roles, users, views );
  });

  this.$.html.find('.default-permissions').on('change', 'input[type="checkbox"]', function(){
    var $this = $(this);
    if( this.checked && $this.data('id') !== 'read' ){
      $this.closest('.form-group').find('[data-id="read"]:not(:checked)').prop('checked', true);
    } else if( !this.checked &&  $this.data('id') === 'read' ){
      $this.closest('.form-group').find('[data-id!="read"]:checked').prop('checked', false);
    }
  });

  this.$.html.find('.searchclear').on('click', function(ev){
    $(this).siblings('input').val('').trigger('change');
  });

  this.$.html.find('table').on('click', '.view-collapse', function(ev){
    $(this).closest('tbody').toggleClass('closed');
    self.$.table.floatThead('reflow');
  });

  this.$.html.find('table').on('change', 'input[type="checkbox"]', function(ev){
    var $this = $(this);
    var p = $this.data('id');
    var checked = this.checked;
    var $tbody = $this.closest('tbody');
    var vid = $tbody.data('view-id');
    var $tr = $this.closest('tr');
    // check if is header
    //   check all underneath
    //   foreach changed
    //     if in changes
    //       remove
    //     else
    //       add to changes
    // else
    //   if all checked, check header
    //   else uncheck
    //   if in changes
    //     remove
    //   else
    //     add to changes
    if( $tr.hasClass('view-tr') ){
      if( checked ){
        $tbody.find('[data-id="'+p+'"]:not(:checked)').not(this).each(function(){
          this.checked = true;
          $(this).trigger('change');
        });

      }else{
        $tbody.find('[data-id="'+p+'"]:checked').not(this).each(function(){
          this.checked = false;
          $(this).trigger('change');
        });
      }
    }else{
      if( $tr.hasClass('role-tr') ){
        if( $tbody.children(':not(.view-tr)').find('[data-id="'+p+'"]:not(:checked)').length === 0 ){
          $tbody.children('.view-tr').find('[data-id="'+p+'"]')[0].checked = true;
        }else{
          $tbody.children('.view-tr').find('[data-id="'+p+'"]')[0].checked = false;
        }


        var id = $tr.children('.view-role').data('id');
        var nP = makePermissions(permissions.keyMap(function(v,k){return $tr.find('[data-id="'+k+'"]')[0].checked}));
        var oP;
        if( !self.roleP[vid] || !self.roleP[vid][id] ){
          oP = 0;
        }else{
          oP = self.roleP[vid][id].ApiPermissionValue;
        }

        if( nP === oP ){
          if( self.rolePChanges[vid] && self.rolePChanges[vid][id] ){
            delete self.rolePChanges[vid][id];
            if( Object.keys(self.rolePChanges[vid]).length === 0 )
              delete self.rolePChanges[vid];
          }
        }else{
          if( !self.roleP[vid] || !self.roleP[vid][id] ){
            self.rolePChanges[vid] = self.rolePChanges[vid] || {};
            self.rolePChanges[vid][id] = {
              ApiPermissionValue: nP,
              ApiObjectId: vid
            }
          }else{
            self.rolePChanges[vid] = self.rolePChanges[vid] || {};
            self.rolePChanges[vid][id] = {
              ApiPermissionId: self.roleP[vid][id].ApiPermissionId,
              ApiPermissionValue: nP,
              ApiObjectId: vid
            }
          }
        }

        // if(self.data[vid].roles[id])

      }else if( $tr.hasClass('user-tr') ){
        if( $tbody.children(':not(.view-tr)').find('[data-id="'+p+'"]:not(:checked)').length === 0 ){
          $tbody.children('.view-tr').find('[data-id="'+p+'"]')[0].checked = true;
        }else{
          $tbody.children('.view-tr').find('[data-id="'+p+'"]')[0].checked = false;
        }
        var id = $tr.children('.view-user').data('id');
        var nP = makePermissions(permissions.keyMap(function(v,k){return $tr.find('[data-id="'+k+'"]')[0].checked}));
        var oP;
        if( !self.userP[vid] || !self.userP[vid][id] ){
          oP = 0;
        }else{
          oP = self.userP[vid][id].ApiPermissionValue;
        }

        if( nP === oP ){
          if( self.userPChanges[vid] && self.userPChanges[vid][id] ){
            delete self.userPChanges[vid][id];
            if( Object.keys(self.userPChanges[vid]).length === 0 )
              delete self.userPChanges[vid];
          }
        }else{
          if( !self.userP[vid] || !self.userP[vid][id] ){
          self.userPChanges[vid] = self.userPChanges[vid] || {};
          self.userPChanges[vid][id] = {
            ApiPermissionValue: nP,
            ApiObjectId: vid
          }
          }else{
            self.userPChanges[vid] = self.userPChanges[vid] || {};
            self.userPChanges[vid][id] = {
              ApiPermissionId: self.userP[vid][id].ApiPermissionId,
              ApiPermissionValue: nP,
              ApiObjectId: vid
            }
          }
        }

      }else{
        // wat
      }
      if( checked &&  $this.data('id') !== 'read' ){
        $tr.find('[data-id="read"]:not(:checked)').prop('checked', true).trigger('change');
      } else if( !checked &&  $this.data('id') === 'read' ){
        $tr.find('[data-id!="read"]:checked').prop('checked', false).trigger('change');
      }
    }

    for( var i = 0 ; i < self.changeListeners.length ; i++ ){
      self.changeListeners[i]( self.json.id, self.get(), self.isChanged() );
    }
  });

  this.$.html.find('table').on('click', '.remove', function(ev){
    var $this = $(this);
    $this.closest('tr').find('[data-id!="read"]:checked').prop('checked', false).trigger('change');
    return;
    // Should I hide it
    var $tbody = $this.closest('tbody');
    var vid = $this.closest('tbody').data('view-id');
    var id, num;
    if( $this.parent().is('.view-name') ){
    // if parent is .view-name
    //   is view. remove all changes and from data
      if( self.rolePChanges[vid] ){
        delete self.rolePChanges[vid];
      }
      if( self.userPChanges[vid] ){
        delete self.userPChanges[vid];
      }
      if( self.data[vid] ){
        delete self.data[vid];
      }
      $tbody.remove();
      // if empty hide table
    }else{
    // else
    //   is either role or user
    //   get id from tbody, remove self fromdata and changes
      if( $this.parent().is('.view-role') ){
        id = $this.parent().data('id');

        // update changes
        if( self.rolePChanges[vid] ){
          if( self.rolePChanges[vid][id] ){
            delete self.rolePChanges[vid][id];
            if(Object.keys(self.rolePChanges[vid]).length === 0)
              delete self.rolePChanges[vid];
          }
        }

        // update table data
        if( self.data[vid] ){
          if( self.data[vid].roles[id] ){
            delete self.data[vid].roles[id];
            if( Object.keys( self.data[vid].roles).length === 0
              && Object.keys( self.data[vid].users).length === 0 )
              delete self.data[vid];
          }
        }

        // decrement, create or ignore rowspan
        // get role count
        num = $tbody.find('.view-role').length;
        if( num > 1 ){ //at least one, self
          // check if is first
          if( $tbody.find('.view-role').first().has($this).length > 0 ){
            // add rowspan to next
            $tbody.find('.view-role').eq(1).parent().prepend(''
              +'<td rowspan="'+(num-1)+'" class="role">'
              +'  <span data-i18n="app.permissions.roles"> Roles </span>'
              +'</td>'
            );
          }else{
            // decrement stuff
            $tbody.find('.view-role').first().siblings('[rowspan]').attr('rowspan', num-1);
          }
        }
        // remove from dom
        $this.closest('tr').remove();

        // if empty
        //   remove tbody
        if( $tbody.children('tr').length < 2 )
          $tbody.remove();

      }else if( $this.parent().is('.view-user') ){
        id = $this.parent().data('id');

        // update changes
        if( self.userPChanges[vid] ){
          if( self.userPChanges[vid][id] ){
            delete self.userPChanges[vid][id];
            if(Object.keys(self.userPChanges[vid]).length === 0)
              delete self.userPChanges[vid];
          }
        }

        // update table data
        if( self.data[vid] ){
          if( self.data[vid].users[id] ){
            delete self.data[vid].users[id];
            if( Object.keys( self.data[vid].roles).length === 0
              && Object.keys( self.data[vid].users).length === 0 )
              delete self.data[vid];
          }
        }

        // decrement, create or ignore rowspan
        // get user count
        num = $tbody.find('.view-user').length;
        if( num > 1 ){ //at least one, self
          // check if is first
          if( $tbody.find('.view-user').first().has($this).length > 0 ){
            // add rowspan to next
            $tbody.find('.view-user').eq(1).parent().prepend(''
              +'<td rowspan="'+(num-1)+'" class="user">'
              +'  <span data-i18n="app.permissions.users"> Users </span>'
              +'</td>'
            );
          }else{
            // decrement stuff
            $tbody.find('.view-user').first().siblings('[rowspan]').attr('rowspan', num-1);
          }
        }
        // remove from dom
        $this.closest('tr').remove();

        // if empty
        //   remove tbody
        if( $tbody.children('tr').length < 2 )
          $tbody.remove();



      }else{
        // wat
      }
    }

    if( Object.keys(self.data).length === 0 ){
      self.$.table.closest('.form-group').addClass('hidden')
    }

    for( var i = 0 ; i < self.changeListeners.length ; i++ ){
      self.changeListeners[i]( self.json.id, self.get(), self.isChanged() );
    }
  });


}; 
Form.Fields.Permissions.prototype.initSelects = function(){
  var self = this;

  // generated while getting data for user select
  this.users = {};
  this.userP = {};
  this.userPChanges = {};
  this.$.users = this.$.html.find('[data-id="user-select"]')
  this.$.users.selectize({
    plugins: ['remove_button','restore_on_backspace'],
    maxItems: 20,
    valueField: 'UserId',
    searchField: ['FirstName', 'LastName'],
    render: {
      option:function(o){
        return '<div>'+o.FirstName + ' ' + o.LastName+'</div>';
      },
      item:function(o){
        return '<div>'+o.FirstName + ' ' + o.LastName+'</div>';
      }
    },
    preload: true,
    load: function(query, callback){
      Tools.Ajax.defaultPost( self.getUsersUrl, {
        length: 20,
        start: 0,
        fields: ['UserId', 'FirstName', 'LastName', 'Permission','ServerId'],
        query: query
      })
      .then(function( data ){
        data.data.forEach(function(v){
          self.users[v.UserId] = v;
          if( v.Permission ){
            v.Permission.forEach(function(p){
              self.userP[p.ApiObjectId] = self.userP[p.ApiObjectId] || {};
              self.userP[p.ApiObjectId][v.UserId] = p;
            });
          }

        });
        callback(data.data);
      })
      .catch(function( err ){
        console.error(err);
      })
    }
  });


  // generated while getting data for role select
  this.roles = {};
  this.roleP = {};
  this.rolePChanges = {};
  this.$.roles = this.$.html.find('[data-id="role-select"]');
  this.$.roles.selectize({
    plugins: ['remove_button','restore_on_backspace'],
    maxItems: 20,
    valueField: 'RoleId',
    searchField: ['Name'],
    labelField: 'Name',
    render: {
      option:function(o){
        return '<div>'+o.Name+'</div>';
      },
      item:function(o){
        return '<div>'+o.Name+'</div>';
      }
    },
    preload: true,
    load: function(query, callback){
      Tools.Ajax.defaultPost( self.getRolesUrl, {
        length: 20,
        start: 0,
        fields: ['RoleId', 'Name', 'Permission','ServerId'],
        query: query
      })
      .then(function( data ){
        data.data.forEach(function(v){
          self.roles[v.RoleId] = v;
          if( v.Permission ){
            v.Permission.forEach(function(p){
              self.roleP[p.ApiObjectId] = self.roleP[p.ApiObjectId] || {};
              self.roleP[p.ApiObjectId][v.RoleId] = p;
            });
          }
        });
        callback(data.data);
      })
      .catch(function( err ){
        console.error( err );
      })
    }
  });
}
Form.Fields.Permissions.prototype.i18n = function(){
  this.$.html.i18n();
  this.$.html.find('[data-toggle="tooltip"]').tooltip();
}
Form.Fields.Permissions.prototype.getData = function(){
  var d = {};
  d[this.json.id] = this.value;
  return d;
}
Form.Fields.Permissions.prototype.get = function(){
  var self = this;
  var list = [];

  self.rolePChanges.forEach(function(v, vid){
    v.forEach(function(r, rid){
      var nR = ({}).deepMerge(r);
      if( !nR.ApiPermissionId ){
        nR.ApiObjectId = vid|0;
        nR.ApiRoleId = rid|0;
      }
      list.push(nR);
    });
  });

  self.userPChanges.forEach(function(v, vid){
    v.forEach(function(u, uid){
      var nU = ({}).deepMerge(u);
      if( !nU.ApiPermissionId ){
        nU.ApiObjectId = vid|0;
        nU.ApiUserId = uid|0;
      }
      list.push(nU);
    });
  });

  return list;
}
Form.Fields.Permissions.prototype.setData = function( data ){
  var val = data[ this.json.id ];
  this.original = val;
  this.set( val );
}
Form.Fields.Permissions.prototype.save = function(){
  var self = this;
  if( this.isPosting )
    return ajaxStub();

  this.isPosting = true;

  return Tools.Ajax.defaultPost(this.postUrl, this.get())
  .then(function(){
    self.isPosting = false;
  })
  .catch(function(){
    self.isPosting = false;
  });
}
Form.Fields.Permissions.prototype.set = function( val ){

}
Form.Fields.Permissions.prototype.isChanged = function(){
  return !(Object.keys(this.rolePChanges).length === 0 && Object.keys(this.userPChanges).length === 0);
}
Form.Fields.Permissions.prototype.toggleAddPermissions = function(){
  if(this.showingAdd){
    this.closeAddPermissions();
  }else{
    this.openAddPermissions();
  }
}
Form.Fields.Permissions.prototype.openAddPermissions = function(){
  this.$.container.children('div.hidden').removeClass('hidden').addClass('showing');
  this.showingAdd = true;
}
Form.Fields.Permissions.prototype.closeAddPermissions = function(){
  this.$.container.children('div.showing').removeClass('showing').addClass('hidden');
  this.showingAdd = false;
}
Form.Fields.Permissions.prototype.reset = function(){
  var self = this;
  this.$.table.find('.view-tr .remove').each(function(){
    var $this = $(this);
    var $tbody = $this.closest('tbody');
    var vid = $this.closest('tbody').data('view-id');
    var id, num;
    if( $this.parent().is('.view-name') ){
    // if parent is .view-name
    //   is view. remove all changes and from data
      if( self.rolePChanges[vid] ){
        delete self.rolePChanges[vid];
      }
      if( self.userPChanges[vid] ){
        delete self.userPChanges[vid];
      }
      if( self.data[vid] ){
        delete self.data[vid];
      }
      $tbody.remove();
      // if empty hide table
    }else{
    // else
    //   is either role or user
    //   get id from tbody, remove self fromdata and changes
      if( $this.parent().is('.view-role') ){
        id = $this.parent().data('id');

        // update changes
        if( self.rolePChanges[vid] ){
          if( self.rolePChanges[vid][id] ){
            delete self.rolePChanges[vid][id];
            if(Object.keys(self.rolePChanges[vid]).length === 0)
              delete self.rolePChanges[vid];
          }
        }

        // update table data
        if( self.data[vid] ){
          if( self.data[vid].roles[id] ){
            delete self.data[vid].roles[id];
            if( Object.keys( self.data[vid].roles).length === 0
              && Object.keys( self.data[vid].users).length === 0 )
              delete self.data[vid];
          }
        }

        // decrement, create or ignore rowspan
        // get role count
        num = $tbody.find('.view-role').length;
        if( num > 1 ){ //at least one, self
          // check if is first
          if( $tbody.find('.view-role').first().has($this).length > 0 ){
            // add rowspan to next
            $tbody.find('.view-role').eq(1).parent().prepend(''
              +'<td rowspan="'+(num-1)+'" class="role">'
              +'  <span data-i18n="app.permissions.roles"> Roles </span>'
              +'</td>'
            );
          }else{
            // decrement stuff
            $tbody.find('.view-role').first().siblings('[rowspan]').attr('rowspan', num-1);
          }
        }
        // remove from dom
        $this.closest('tr').remove();

        // if empty
        //   remove tbody
        if( $tbody.children('tr').length < 2 )
          $tbody.remove();

      }else if( $this.parent().is('.view-user') ){
        id = $this.parent().data('id');

        // update changes
        if( self.userPChanges[vid] ){
          if( self.userPChanges[vid][id] ){
            delete self.userPChanges[vid][id];
            if(Object.keys(self.userPChanges[vid]).length === 0)
              delete self.userPChanges[vid];
          }
        }

        // update table data
        if( self.data[vid] ){
          if( self.data[vid].users[id] ){
            delete self.data[vid].users[id];
            if( Object.keys( self.data[vid].roles).length === 0
              && Object.keys( self.data[vid].users).length === 0 )
              delete self.data[vid];
          }
        }

        // decrement, create or ignore rowspan
        // get user count
        num = $tbody.find('.view-user').length;
        if( num > 1 ){ //at least one, self
          // check if is first
          if( $tbody.find('.view-user').first().has($this).length > 0 ){
            // add rowspan to next
            $tbody.find('.view-user').eq(1).parent().prepend(''
              +'<td rowspan="'+(num-1)+'" class="user">'
              +'  <span data-i18n="app.permissions.users"> Users </span>'
              +'</td>'
            );
          }else{
            // decrement stuff
            $tbody.find('.view-user').first().siblings('[rowspan]').attr('rowspan', num-1);
          }
        }
        // remove from dom
        $this.closest('tr').remove();

        // if empty
        //   remove tbody
        if( $tbody.children('tr').length < 2 )
          $tbody.remove();



      }else{
        // wat
      }

      if( Object.keys(self.data).length === 0 ){
        self.$.table.closest('.form-group').addClass('hidden')
      }

      for( var i = 0 ; i < self.changeListeners.length ; i++ ){
        self.changeListeners[i]( self.json.id, self.get(), self.isChanged() );
      }
    }
  });//.trigger('click');

  this.$.roles[0].selectize.destroy();
  this.$.users[0].selectize.destroy();

  this.initSelects();
  this.initTable();
}
Form.Fields.Permissions.prototype.clear = function(){
  this.value = null;
  this.original = null;

  this.$input.val('');
}
Form.Fields.Permissions.prototype.applyFieldBinds = function(){
}
Form.Fields.Permissions.prototype.validate = function(){
  // stub
}
Form.Fields.Permissions.prototype.saveData = function(){
  this.original = this.get();
  for( var i = 0 ; i < this.changeListeners.length ; i++ ){
    this.changeListeners[i]( this.json.id, this.get(), this.isChanged() );
  }
}
Form.Fields.Permissions.prototype.refresh = function(){
   
}
Form.Fields.Permissions.prototype.onChange = function( callback ){
  if( !this.changeListeners )
    this.changeListeners = []; 
 
  this.changeListeners.push( callback );
}
Form.Fields.Permissions.prototype._ = scopeInterface;
Form.Fields.Permissions.prototype.is = function(t){
  if( t === '*' )
    return true;
  return (t.toLowerCase() === ('Permissions').toLowerCase()
    || t.toLowerCase() === this.json.id.toLowerCase() );
};
