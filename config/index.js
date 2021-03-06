/**
 * Module dependencies.
 */
const _ = require('lodash');

const chalk = require('chalk');
const glob = require('glob');
const fs = require('fs');
const path = require('path');
const objectPath = require('object-path');

/**
 * Get files by glob patterns
 */
const getGlobbedPaths = (globPatterns, excludes) => {
  // URL paths regex
  /* eslint no-useless-escape:0 */
  const urlRegex = new RegExp('^(?:[a-z]+:)?\/\/', 'i');
  let output = [];
  // If glob pattern is array then we use each pattern in a recursive way, otherwise we use glob
  if (_.isArray(globPatterns)) {
    globPatterns.forEach((globPattern) => {
      output = _.union(output, getGlobbedPaths(globPattern, excludes));
    });
  } else if (_.isString(globPatterns)) {
    if (urlRegex.test(globPatterns)) {
      output.push(globPatterns);
    } else {
      let files = glob.sync(globPatterns);
      if (excludes) {
        files = files.map((file) => {
          if (_.isArray(excludes)) {
            excludes((exlude) => {
              file = file.replace(exlude, '');
            });
          } else {
            file = file.replace(excludes, '');
          }
          return file;
        });
      }
      output = _.union(output, files);
    }
  }
  return output;
};

/** Validate config.domain is set
 */
const validateDomainIsSet = (config) => {
  if (!config.domain) {
    console.log(chalk.red('+ Important warning: config.domain is empty. It should be set to the fully qualified domain of the app.'));
  }
};

/**
 * validate secure parameters and create credentials in consequence value for ssl
 * @param config
 */
const initSecureMode = (config) => {
  if (!config.secure || config.secure.ssl !== true) return true;

  const key = fs.existsSync(path.resolve(config.secure.key));
  const cert = fs.existsSync(path.resolve(config.secure.cert));

  if (!key || !cert) {
    console.log(chalk.red('+ Error: Certificate file or key file is missing, falling back to non-SSL mode'));
    console.log(chalk.red('  To create them, simply run the following from your shell: sh ./scripts/generate-ssl-certs.sh'));
    console.log();
    config.secure.ssl = false;
  } else {
    config.secure.credentials = {
      key: fs.readFileSync(path.resolve(config.secure.key)),
      cert: fs.readFileSync(path.resolve(config.secure.cert)),
    };
  }
};

/**
 * Initialize global configuration files
 */
const initGlobalConfigFiles = (config, assets) => {
  config.files = {}; // Appending files
  config.files.mongooseModels = getGlobbedPaths(assets.mongooseModels); // Setting Globbed mongoose model files
  config.files.sequelizeModels = getGlobbedPaths(assets.sequelizeModels); // Setting Globbed sequelize model files
  config.files.routes = getGlobbedPaths(assets.routes); // Setting Globbed route files
  config.files.configs = getGlobbedPaths(assets.config); // Setting Globbed config files
  // config.files.sockets = getGlobbedPaths(assets.sockets); // Setting Globbed socket files
  config.files.policies = getGlobbedPaths(assets.policies); // Setting Globbed policies files
};

/**
 * Initialize global configuration
 */

const initGlobalConfig = () => {
  // Get the default assets
  const assets = require(path.join(process.cwd(), './config/assets'));

  // Get the current config
  const _path = path.join(process.cwd(), './config', 'defaults', process.env.NODE_ENV || 'development');
  let defaultConfig;
  if (fs.existsSync(`${_path}.js`)) defaultConfig = require(_path);
  else {
    console.error(chalk.red(`+ Error: No configuration file found for "${process.env.NODE_ENV}" environment using development instead`));
    defaultConfig = require(path.join(process.cwd(), './config', 'defaults', 'development'));
  }

  // Get the config from  process.env.WAOS_NODE_*
  const environmentVars = _.mapKeys(
    _.pickBy(process.env, (_value, key) => key.startsWith('WAOS_NODE_')),
    (_v, k) => k.split('_').slice(2).join('.'),
  );
  const environmentConfigVars = {};
  _.forEach(environmentVars, (v, k) => objectPath.set(environmentConfigVars, k, v));
  // Merge config files
  const config = _.merge(defaultConfig, environmentConfigVars);
  // read package.json for MEAN.JS project information
  const pkg = require(path.resolve('./package.json'));
  config.meanjs = pkg;

  // Extend the config object with the local-NODE_ENV.js custom/local environment. This will override any settings present in the local configuration.
  // config = _.merge(config, (fs.existsSync(path.join(process.cwd(), 'config/env/local-' + process.env.NODE_ENV + '.js')) && require(path.join(process.cwd(), 'config/env/local-' + process.env.NODE_ENV + '.js'))) || {});

  // Initialize global globbed files
  initGlobalConfigFiles(config, assets);
  // Init Secure SSL if can be used
  initSecureMode(config);
  // Print a warning if config.domain is not set
  validateDomainIsSet(config);
  // Expose configuration utilities
  config.utils = {
    getGlobbedPaths,
  };

  return config;
};

/**
 * Set configuration object
 */
module.exports = initGlobalConfig();
