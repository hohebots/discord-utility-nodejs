const util = require('util');
const exec = util.promisify(require('child_process').exec);
const log = require("./log")
const version = require("./version");
const config = require('./config');

async function updateLocalRepository() {
    conf = await config.load()
    const sourceRepoURL = conf.settings.git.repo;


    await exec(`git pull ${sourceRepoURL}`);
    version = version.load()
    log.info("Bot Update wurde durchgeführt und der Bot läuft nun mit Version", adminRelevant = true)
    await exec(`pm2 restart index`);
    return true
    
}

module.exports = {
    updateLocalRepository
}