#!/usr/bin/env node
var exec = require('child_process').exec;

/**
 * Checks which sockit-to-me binary we need. This will be null unless
 *
 * 1. Platform is linux
 * 2. gcc not installed
 * 3. Linux version is ubuntu 12.04
 *
 * @param {Function} callback will be invoked with null, 'i386', or 'amd64'.
 */
function getRequiredVersion(callback) {
  if (process.platform !== 'linux') {
    return callback(null);
  }

  exec('type gcc', function(err, stdout) {
    if (stdout.indexOf('gcc is') !== -1) {
      return callback(null);
    }

    exec('lsb_release -a', function(err, stdout) {
      if (stdout.indexOf('precise') === -1) {
        return callback(null);
      }

      // Choose between 32 and 64 bit versions.
      exec('uname -a', function(err, stdout) {
        var result;
        if (stdout.indexOf('i386') !== -1) {
          result = 'i386';
        } else if (stdout.indexOf('x86_64') !== -1) {
          result = 'amd64';
        } else {
          result = null;
        }

        return callback(result);
      });
    });
  });
}

function main() {
  getRequiredVersion(function(version) {
    if (version === null) {
      // We can build on the fly.
      process.exit(1);
    }

    // Copy an existing binary into build/Release.
    console.log('Will use existing binary for ' + version + '...');
    exec('mkdir -p build', function() {
      var source = 'bin/ubuntu-12.04.3-' + version;
      var dest = 'build/Release';
      var cp = ['cp', '-r', source, dest].join(' ');
      exec(cp, function() {});
    });
  });
}

if (require.main === module) {
  main();
}
