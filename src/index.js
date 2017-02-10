/* eslint no-process-exit: 0*/
import keypress from 'keypress';

import eslintCli from './eslint/cli';
import helpOptions from './options';
import watcher from './watcher';
import argParser from './arg-parser';
import Logger from './log';
import pkg from '../package';

const logger = Logger('esw-cli');

logger.debug('Loaded');
logger.debug('Eslint-Watch: ' + pkg.version);

let parsedOptions;
let eslArgs;
let exitCode;

function runLint(args, options){
  logger.debug(args);
  const result = eslintCli(args, options);
  logger.debug('lint completed. Exit Code: %o', result.exitCode);
  exitCode = result.exitCode;
  logger.log(result.message);
}

function keyListener(args, options){
  let stdin = process.stdin;
  if(!stdin.setRawMode){
    logger.debug('Process might be wrapped exiting keybinding');
    return;
  }
  keypress(stdin);
  stdin.on('keypress', function(ch, key){
    logger.debug('%s was pressed', key.name);
    if(key.name === 'return'){
      logger.debug('relinting...');
      logger.debug(options);
      runLint(args, options);
    }
    if(key.ctrl && key.name === 'c') {
      process.exit();
    }
  });
  stdin.setRawMode(true);
  stdin.resume();
}

let args = process.argv;
logger.debug('Arguments passed: %o', args);
parsedOptions = helpOptions.parse(args);
logger.debug('Parsing args');
eslArgs = argParser.parse(args, parsedOptions);
if (!parsedOptions.help) {
  logger.debug('Running initial lint');
  runLint(eslArgs, parsedOptions);
  if (parsedOptions.watch) {
    logger.debug('-w seen');
    keyListener(eslArgs, parsedOptions);
    watcher(parsedOptions);
  }
} else {
  logger.log(helpOptions.generateHelp());
}

process.on('exit', function () {
  process.exit(exitCode);
});