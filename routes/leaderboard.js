var express = require("express");
var router = express.Router();
const mongoose = require("mongoose");
var CryptoJS = require("crypto-js");

require("dotenv").config();

mongoose.connect(process.env.MONGO_KEY, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

let leaderboardSchema = new mongoose.Schema({
    name: { type: String, required: true },
    score: { type: Number, require: true },
});

let Leaderboard = mongoose.model("Leaderboard", leaderboardSchema);

function isNormalInteger(str) {
    var n = Math.floor(Number(str));
    return n !== Infinity && String(n) === str && n >= 0;
}

router.post("/submit", async function (req, res, next) {
    // Decrypt
    try {
        console.log(req.body.score);
        let bytes = CryptoJS.AES.decrypt(
            req.body.score.toString(),
            process.env.PASSWORD_KEY
        );
        let originalText = bytes.toString(CryptoJS.enc.Utf8);
        console.log(originalText);
        if (!isNormalInteger(originalText)) return;
        let newUser = {
            name: req.body.name,
            score: JSON.parse(originalText),
        };
        console.log(newUser);
        let saveUser = new Leaderboard(newUser);
        await saveUser.save();
        res.status(200);
    } catch (e) {
        return res.status(400);
    }
});

router.post("/update", async function (req, res, next) {
    // Decrypt
    try {
        console.log(req.body.score);
        let bytes = CryptoJS.AES.decrypt(
            req.body.score.toString(),
            process.env.PASSWORD_KEY
        );
        let originalText = bytes.toString(CryptoJS.enc.Utf8);
        console.log(originalText);
        if (!isNormalInteger(originalText)) return;
        let newUser = {
            name: req.body.name,
            score: JSON.parse(originalText),
        };
        console.log(newUser);
        await Leaderboard.findOneAndUpdate(
            { name: "anonymous", score: newUser.score },
            newUser
        );
        res.status(200);
    } catch (e) {
        return res.status(400);
    }
});

router.get("/", async (req, res) => {
    const data = await Leaderboard.find({});
    // console.log(data);
    res.json(data);
});

router.get("/totalEntries", async (req, res) => {
    const data = await Leaderboard.countDocuments({});
    res.json(data);
});

router.get("/leastScore", async (req, res) => {
    const data = await Leaderboard.find({});
    let mn = [];
    for (let x = 0; x < data.length; x++) mn.push(data[x].score);
    const sorted = mn.sort((a, b) => {
        return b - a;
    });
    console.log(sorted);
    res.json(sorted[29]);
});

module.exports = router;
