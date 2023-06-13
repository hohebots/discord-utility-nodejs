const util = require('util');
const exec = util.promisify(require('child_process').exec);
const log = require("./log")
const version = require("./version");
const config = require('./config');

async function updateLocalRepository() {
    conf = await config.load()
    const sourceRepoURL = conf.settings.git.repo;

    try {
        const { stdout, stderr } = await exec(`git pull ${sourceRepoURL}`);
        if (stderr) {
            throw new Error(stderr);
        }
        version = version.load()
        log.info("Bot Update wurde durchgeführt und der Bot läuft nun mit Version", adminRelevant = true)
        return true
    } catch (error) {
        log.error('Fehler beim Durchführen des Updates: ' + error.message, adminRelevant = true);
        return false
    }
}

module.exports = {
    updateLocalRepository
}