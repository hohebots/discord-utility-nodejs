const log = require("../util/log")
const Module = require("./models/Module")
const Ticket = require("./models/Ticket")
const TicketBooth = require("./models/TicketBooth")

async function findModule(id) {
    const module = await Module.findOne({id: id})
    return module
}

async function findTicketBooth(moduleId) {
    const ticketBooth = await TicketBooth.findOne({moduleId: moduleId})
    return ticketBooth
}

async function findTicket(user, reason, moduleId) {
    const ticket = await Ticket.findOne({moduleId: moduleId, reason: reason, user: user})
    return ticket
}

async function deleteTicket(user, reason, moduleId) {
    await Ticket.findOneAndDelete({moduleId: moduleId, reason: reason, user: user})
    
}

async function createTicket(moduleId, user, reason, channel) {
    if (await findTicket(user, reason, moduleId) == null) {
        const ticket = new Ticket({reason: reason, user: user, channel: channel, moduleId: moduleId})
        ticket.save().then(() => log.info("MongoDB: Ticket von " + user + " erstellt"))
        return true
    } else {
        log.warn("MongoDB: Ticket " + user + " konnte nicht erstellt werden. Existiert bereits")
        return false
    }
}

async function createModule(id, type, name, mainChannel, category) {
    if (await findModule(id) == null) {
        const module = new Module({id: id, type: type, name: name, mainChannel: mainChannel, category: category})
        module.save().then(() => log.info("MongoDB: Modul " + id + " erstellt"))
        return true
    } else {
        log.warn("MongoDB: Modul " + moduleId + " konnte nicht erstellt werden. Existiert bereits")
        return false
    }
}

async function createTicketBooth(moduleId, channelId) {
    if (await findTicketBooth(moduleId) == null) {
        const ticketBooth = new TicketBooth({moduleId: moduleId, channelId: channelId, boothMessage: "0", viewPermissions: ["admin"], closePermissions: ["admin"], openPermissions: []})
        ticketBooth.save().then(() => log.info("MongoDB: Modul " + moduleId + " erstellt"))
        return true
    } else {
        log.warn("MongoDB: Modul " + moduleId + " konnte nicht erstellt werden. Existiert bereits")
        return false
    }
}

async function setBoothMessage(moduleId, messageId) {
    ticketBooth = await findTicketBooth(moduleId)
    if (ticketBooth == null) {
        return false
    } else {
        ticketBooth.boothMessage = messageId
        ticketBooth.save()
        return true
    }
}

module.exports = {
    createModule,
    createTicketBooth,
    createTicket,
    setBoothMessage,
    findModule,
    findTicketBooth,
    findTicket,
    deleteTicket
}