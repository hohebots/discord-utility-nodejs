const giveawayUsers = require("../../modules/util/giveawayUsers")
const { writeFile } = require("fs/promises");
const clientStorage = require("../../util/client");


async function run(interaction) {
    client = clientStorage.getClientInstance()
    allUsers = await giveawayUsers.getAll()
    addAll = ""
    for (user of allUsers) {
        thisUser = await client.users.fetch(user.id)
        addAll = addAll + thisUser.username + "#" + thisUser.discriminator + "\n"
        console.log(user)
    }
    await writeFile('users.txt', addAll);
}

module.exports = {
    run: run
}