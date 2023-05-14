const mongoose = require("mongoose")
const log = require("../util/log")
const config = require("../config/load")
const groupsModel = require("./models/Group")
const permissionsModel = require("./models/Permission")
const usersModel = require("./models/User")

const { Schema } = mongoose;

async function connect() {
    const conf = await config.load()
    const database = conf.settings.mongodb.instance
    mongoose.connect(database)
}

async function startLogger() {
    mongoose.connection.on('connecting', () => { 
        log.info('MongoDB: Verbindung wird hergestellt')
    });
    mongoose.connection.on('connected', () => {
        log.info('MongoDB: Verbindung hergestellt');
    });
    mongoose.connection.on('disconnecting', () => {
        log.info('MongoDB: Verbindung wird abgebrochen');
    });
    mongoose.connection.on('disconnected', () => {
        log.info('MongoDB: Verbindung abgebrochen');
    });
}

module.exports = {
    connect,
    startLogger}