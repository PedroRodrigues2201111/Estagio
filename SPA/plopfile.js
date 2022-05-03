function formatName(args) {
  return {
    plural: args.name,
    singular: args.name.slice(-1) === "s" ? args.name.slice(0, -1) : args.name
  };
}

function lower(s) {
  return `${s.slice(0, 1).toLowerCase()}${s.slice(1)}`;
}

function makeView(args) {
  return [makeViewJS(args), makeViewJson(args)];
}

function makeViewJS(args) {
  let { _, plural } = formatName(args);
  return `
    ${plural}View.prototype = new View();
    ${plural}View.prototype.constructor = ${plural}View;

    function ${plural}View(scope, container, section) {
      this.scope = scope;
      this.section = section;
      this.children = [];
      this.container = container;
      this.$.container = $(this.container);
      this.json = ${plural}View.json;

      this.init();
    }
    ${plural}View.prototype.initActions = function() {
      var self = this;
      this.Actions = {};
    };

    ${plural}View.json = window.Views.${plural}View.view;
    window.Views.${plural}View = ${plural}View;
  `;
}

function makeViewJson(args) {
  let { singular, plural } = formatName(args);
  return {
    id: `${plural}View`,
    menuIcon: `fa fa-fw fa-${args.icon}`,
    url: plural,
    default: "list",
    urls: {
      [`get${plural}Grid`]: `/api/get${plural}/get${plural}Grid`
    },
    headers: {
      list: {
        "title-i18n": `<%view%>.headers.list`,
        icon: `fa fa-fw fa-${args.icon}`,
        buttons: [
          {
            id: `${plural}DeleteGrid`,
            "title-i18n": `<%view%>.headers.remove${plural}`,
            icon: "fa fa-fw fa-trash-o",
            states: [
              {
                class: "disabled",
                field: `${plural}Grid.selected.length`,
                condition: "==",
                value: 0
              }
            ],
            action: {
              type: "api",
              url: `delete${plural}`,
              field: `${plural}Grid.selected.${singular}Id`,
              text: "delete",
              after: "refresh"
            }
          }
        ]
      }
    },
    tabs: [
      {
        "title-i18n": `<%view%>.tabs.labels.list`,
        id: "list",
        cantClose: true,
        "content-fixed": [[[`${plural}Grid`]]]
      }
    ],
    i18n: {
      title: plural,
      headers: {
        list: "List"
      },
      tabs: {
        labels: {
          list: "List"
        }
      },
      components: {
        [`${plural}Grid`]: {
          delete: `Delete ${singular === plural ? plural : singular + "(s)"}`
        }
      },
      common: {
        name: "Name"
      }
    }
  };
}

function makeGrid(args) {
  let { singular, plural } = formatName(args);

  return {
    type: "grid",
    opts: {
      id: `${plural}Grid`,
      getUrl: `get${plural}Grid`,
      buttons: [
        {
          name: `delete${singular}`,
          icon: `fa fa-fw fa-trash-o`,
          btnClass: `btn-danger`,
          tooltip: `<%view%>.components.${plural}Grid.delete`,
          permissions: {
            delete: `disabled`
          }
        }
      ],
      format: `DD/MM/YYYY h:mm A`,
      order: [[0, `asc`]],
      fields: [
        {
          field: `${lower(singular)}Id`,
          type: `number`
        },
        {
          field: `name`,
          type: `string`,
          i18n: `<%view%>.common.name`
        }
      ]
    }
  };
}

module.exports = function(plop) {
  plop.setGenerator("view", {
    description: "Create a new View",
    prompts: [
      {
        type: "input",
        name: "name",
        message:
          "View name ( preferably plural, capitalized. ex. Users, Roles, Groups, etc )"
      },
      {
        type: "input",
        name: "icon",
        message: "View icon ( font-awesome 4 icon, sans 'fa-' )"
      }
    ],
    actions: [
      args => {
        const fs = require("fs");
        let [js, json] = makeView(args);
        let grid = makeGrid(args);

        let path = `src/mvc/${args.name}/`;

        fs.mkdirSync(path + "components", { recursive: true });
        fs.writeFileSync(path + "view.json", JSON.stringify(json, null, 4));
        fs.writeFileSync(path + "view.js", js);
        fs.writeFileSync(
          path + `components/${grid.opts.id}.js`,
          JSON.stringify(grid, null, 4)
        );

        return `Created View ${args.name}. \nRemember to add the View permissions for it to the DB and run the bundler.`;
      }
    ]
  });
};
