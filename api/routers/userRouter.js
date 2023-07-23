const express = require("express")
const router = express.Router()
const tests = require("../../modules/util/tests")


// get by kit
router.get("/:kit", async function (req, res) {
    kitTests = await tests.findClosedByKit(req.params.kit)
    response = []
    for (test of kitTests) {
        test = test.toObject()
        delete test["_id"]
        delete test["estimatedTier"]
        delete test["testChannel"]
        delete test["createdAt"]
        delete test["moduleId"]
        delete test["id"]
        delete test["positionDM"]
        delete test["__v"]
        delete test["tester"]
        delete test["state"]
        response.push(test)
    }
    res.send(response)
})

// get by uuid
router.get("/:uuid", (req, res) => {
    
})

// get by discordid
router.get("/:discordid", (req, res) => {
    
})

module.exports = router

