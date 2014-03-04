
module.exports = {
  __module: {
    provides: [
      "resources/use_scripts", "resources/use_stylesheets", 
      "resources/register_assets_dir", "resources/register_views_dir", 
      "resources/contribute_views"
    ]
  },

  register_assets_dir: function() {
    return __dirname + "/../assets";
  },

  register_views_dir: function() {
    return __dirname + "/../views";
  },
  
  use_scripts: function() {
    return {
      default: ["script2.js", "http://this_is_a_url/ok.js"]
    };
  },

  use_stylesheets: function() {
    return {
      default: ["testless.less"]
    };
  },

  contribute_views: function() {
    return [{name: "default", view: "layouts/general.jade"}];
  }
};
