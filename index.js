var Particles = require('particles'),
  _ = require('lodash'),
  path = require('path'),
  notify = require('growl'),
  util = require('util'),
  gutil  = require('gulp-util');

function ParticlesTaskRunner(options) {
  options = _.defaults({}, options, {
    config: {
      configDir: gutil.env.configDir,
      appRoot: gutil.env.appRoot
    }
  });
  Particles.call(this, options);
}

util.inherits(ParticlesTaskRunner, Particles);

ParticlesTaskRunner.prototype._envCheckup = function() {
  return this.load(['assetmanager/log', 'config!resources.assetsDir', 'config!resources.viewsDir'])
    .spread(function(log, assetsDir, viewsDir) {
      //prevent to clean or mess around with the wrong directory
      if(_.isEmpty(assetsDir) || _.isEmpty(path.relative(assetsDir, "/")) || _.isEmpty(path.relative(assetsDir, "./"))) {
        throw new Error("Config 'resources.assetsDir' not set or wrong: " + assetsDir);
      }
      
      if(_.isEmpty(viewsDir) || _.isEmpty(path.relative(viewsDir, "/")) || _.isEmpty(path.relative(viewsDir, "./"))) {
        throw new Error("Config 'resources.viewsDir' not set or wrong: " + viewsDir);
      }
  
      log.info("resources.assetsDir -> " + assetsDir);
      log.info("resources.viewsDir -> " + viewsDir);
    });
};

ParticlesTaskRunner.prototype.run = function() {
  var self = this;
  var args = arguments;
  return self._envCheckup().then(function() {
    return Particles.prototype.run.apply(self, args);
  });
};

ParticlesTaskRunner.prototype.runTask = function(task) {
  return this.run('svc!assetmanager/'+task+'/run');
};

ParticlesTaskRunner.prototype.addDefaultTasks = function(taskrunner) {
  var self = this;
  taskrunner.add('build', function() {
    return self.runTask('build').then(function() {
      notify('Build completed');
    }).otherwise(function(err) {
        notify('Error ' + err);
      });
  });
  
  taskrunner.add('watch', function() {
    return self.runTask('watch');
  });
  
  taskrunner.add('server', function() {
    return self.runTask('server').then(function() {
      notify('Server started');
    });
  });
  
  taskrunner.add('clean', function() {
    return self.runTask('clean');
  });
  
  taskrunner.add('rebuild', ['clean', 'build']);
  
  taskrunner.add('develop', ['build', 'watch', 'server'], function() {
    return self.runTask('develop');
  });
};

module.exports = ParticlesTaskRunner;

