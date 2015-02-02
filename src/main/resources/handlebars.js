/* global process, require */

(function () {
    
    "use strict";

    var args = process.argv,
        fs = require("fs"),
        mkdirp = require("mkdirp"),
        path = require("path"),
        precompiler = require("handlebars");

    var SOURCE_FILE_MAPPINGS_ARG = 2;
    var TARGET_ARG = 3;
    var OPTIONS_ARG = 4;

    var sourceFileMappings = JSON.parse(args[SOURCE_FILE_MAPPINGS_ARG]);
    var target = args[TARGET_ARG];
    var options = JSON.parse(args[OPTIONS_ARG]);

    var sourcesToProcess = sourceFileMappings.length;
    var results = [];
    var problems = [];

    function parseDone() {
        if (--sourcesToProcess === 0) {
            console.log("\u0010" + JSON.stringify({results: results, problems: problems}));
        }
    }

    function throwIfErr(e) {
        if (e) throw e;
    }    

    var endsep = new RegExp(path.sep + '+$');

    sourceFileMappings.forEach(function (sourceFileMapping) {

      var input = sourceFileMapping[0];
      var name  = sourceFileMapping[1];
      var base  = input.replace(name, '');
      var extension = path.extname(input);
      var extend = new RegExp(extension.replace('.', '\\.') + '$');
      var output = path.join(target, name.replace(extend, '.js'));

      mkdirp(path.dirname(output), function (e) {
        throwIfErr(e);

        var opts = {
          output: output,
          amd: options.amd,
          commonjs: options.commonjs,
          handlebarPath: options.handlebarPath,
          known: options.known,
          o: options.knownOnly,
          min: options.min,
          namespace: options.namespace,
          simple: options.simple,
          root: path.join(base, options.root).replace(endsep, ''),
          partial: path.basename(input).match(/^_/),
          data: options.data,
          extension: extension.substr(1),
          bom: options.bom,
          templates: [input]
        };

        try {

          precompiler.cli(opts);

          results.push({
              source: input,
              result: {
                filesRead: [input],
                filesWritten: [output]
              }
          });

          parseDone();

        } catch (err) {

          problems.push({
              message: err.message,
              severity: 'error',
              source: input
          });

          results.push({
              source: input,
              result: null
          });

          parseDone();
        }
      });
    });

})();

