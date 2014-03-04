var through = require('through2'),
  glob = require('glob'),
  objectPath = require('object-path'),
  _ = require('lodash');


var self = module.exports = {
  __module: {
    properties: {
      log: "./log"
    }
  },
  
  logStream: function(dataEventName, endEventName, fileSetName) {
    return through.obj(function(file, enc, cb) {
      if(dataEventName) {
        var meta = (file.path && file.cwd && file.base) ? file.path : file;
        self.log.trace("["+fileSetName+"] "+ dataEventName + " ("+meta+")");
      }
      cb(null, file);
    }, function(cb) {
      if(endEventName) {
        self.log.trace("["+fileSetName+"] "+endEventName);
      }
      cb();
    });
  },
  
  isUrl: function(url) {
    return (/^(http[s]?:)?\/\/./).test(url);
  },
  
  bufferStream: function(wait) {
    var buffer = [];
    return through.obj(
      function(file, enc, cb) {
        buffer.push(file);
        cb();
      },
      function(cb) {
        var self = this;
        
        function flush() {
          buffer.forEach(function(f) {
            self.push(f);
          });
          cb();
        }
        
        //wait any data to flush to disk
        setImmediate(flush);
      }
    )
  },
  
  /**
   * Group by namespace, type (file/url) and expand globs
   */
  groupResources: function(declarations) {
    var namespaces = {};
    var args = null;
    //build the namespaces
    _.each(declarations, function(resourceDeclaration) {
      _.each(resourceDeclaration, function(resources, namespace) {
        resources = _.isArray(resources) ? resources : [resources];
        resources = _.compact(_.flatten(resources));
        _.each(resources, function(resource) {
          //resource can be
          //"some/file.js"
          //{cwd: ,file: ""}

          var file, root;
          if(_.isString(resource)) {
            file = resource;
          } else {
            file = resource.file;
            root = resource.cwd;
          }

          var type = 'files';
          if(self.isUrl(file)) {
            type = 'urls';
            args = [file];
          } else if(root) {
            args = glob.sync(file, {cwd: root});
          } else {
            args = [file];
          }

          args.unshift(namespaces, [namespace, type]);
          objectPath.push.apply(null, args);
        });
      });
    });

    var namespacesNotDups = {};
    _.each(namespaces, function(res, namespace) {
      namespacesNotDups[namespace] = {
        files: _.unique(res.files),
        urls: _.unique(res.urls)
      };
    });
    return namespacesNotDups;
  }
}
