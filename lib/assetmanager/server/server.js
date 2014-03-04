var spawn = require('child_process').spawn,
  path = require('path'),
  fs = require('fs');


var self = module.exports = {
  __module: {
    properties: {
      develop: "config!develop",
      log: "../log"
    },
    initialize: 'initialize',
    provides: {"assetmanager/server/run": {}}
  },

  child: null,
  main: null,
  restart: false,
  
  initialize: function() {
    
    self.main = self.develop && self.develop.main;
    if(!self.main) {
      self.main = JSON.parse(fs.readFileSync("package.json")).main;
    }
    if(!self.main) {
      self.main = "server.js";
    }
    
    self.main = path.resolve(self.main);
    
    process.on('exit', function() {
      if(self.child) {
        self.child.kill('SIGINT');
      }
    });
  },
  
  run: function() {
    self.restart = false;
    if(self.child) {
      self.log.info("Restarting application '"+ self.main + "'");
      self.restart = true;
      self.child.kill('SIGKILL');
      return;
    }
    
    self.log.info("Starting application '"+ self.main + "'");
    
    self.child = spawn('node', [self.main]);
    self.child.stdout.pipe(process.stdout);
    self.child.stderr.pipe(process.stderr);
    self.child.on('close', function(code) {
      self.child = null;
      self.log.info("Application '"+ self.main + "' exited with return code "+ code);
      if(self.restart) {
        self.run();
      }
    });
  }
};


