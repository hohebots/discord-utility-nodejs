const express = require("express")
const router = express.Router()
const kits = require("../../modules/util/kits")

// get by kit
router.get("/", async function (req, res) {
    allKits = await kits.getAll()
    response = []
    for (kit of allKits) {
        kit = kit.toObject()
        delete kit["_id"]
        delete kit["iconEmoji"]
        delete kit["roles"]
        response.push(kit)
    }
    res.send(response)
})

module.exports = router

