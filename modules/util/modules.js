const log = require("../../util/log")
const Module = require("../models/Module")

async function activeModuleExists(moduleType) {
    const module = await Module.findOne({type: moduleType})
    
    if (module != null) {
        return true
    } else {
        return false
    }
}

async function find(id) {
    const module = await Module.findOne({id: id})
    return module
}

async function getAll() {
    const modules = await Module.find()
    return modules
}

async function create(id, type, name, mainChannel, category) {
    if (await find(id) == null) {
        const module = new Module({id: id, type: type, name: name, mainChannel: mainChannel, category: category})
        module.save().then(() => log.info("MongoDB: Modul " + id + " erstellt"))
        return true
    } else {
        log.warn("MongoDB: Modul " + moduleId + " konnte nicht erstellt werden. Existiert bereits")
        return false
    }
}

async function setMainChannel(moduleId, channelId) {
    module = await find(moduleId)
    module.mainChannel = channelId
    module.save()
    return true
}


module.exports = {
    activeModuleExists,
    find,
    create,
    setMainChannel,
    getAll
}