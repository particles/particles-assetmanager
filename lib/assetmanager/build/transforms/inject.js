var clone = require('gulp-clone'),
  gutil = require('gulp-util'),
  inject = require('gulp-multinject'),
  _ = require('lodash'),
  filter = require('gulp-filter');

var self = module.exports = {
  __module: {
    properties: {
      log: '../log',
      util: "../../util"
    },
    provides: {"assetmanager/build/transforms/define_transforms": {before: "./dest"}}
  },

  define_transforms: function(definitions) {
    var streams = [];
    _.each(definitions.resources, function(resourcesDescriptor, type) {
      if(resourcesDescriptor.options.doNotInject) {
        return;
      }
      
      _.each(resourcesDescriptor.namespaces, function(resourceLists, namespace) {
        var filterStream = filter(resourcesDescriptor.options.injectFilter);
        var toInject = [];
        
        if(resourceLists.urls) {
          Array.prototype.push.apply(toInject, resourceLists.urls);
        }
        
        if(resourceLists.files) {
          Array.prototype.push.apply(toInject, resourceLists.files);
        }
        
        if(_.isEmpty(toInject)) {
          return;
        }
        
        var ns = type+":"+namespace;
        
        self.log.debug({
          files: toInject,
          namespace: ns,
          options: resourcesDescriptor.options.injectOptions
        }, "gulp-multinject configuration");
        
        streams.push(
          filterStream,
          self.util.logStream("Processing file", null, "gulp-multinject " + ns),
          inject(toInject, ns, resourcesDescriptor.options.injectOptions),
          filterStream.restore()
        );
      });
    });
    
    Array.prototype.push.apply(definitions.streams.views, streams);
    return definitions;
  }
};
