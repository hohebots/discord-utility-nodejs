const groups = require("../permissions/groups.js")
const users = require("../permissions/users.js")



async function run(client, interaction) {
    await groups.create("admin", "-Admin-", "0", ["testperm"])

    await users.addGroup(interaction.user.id, "admin")
}

module.exports = {
    run: run
}