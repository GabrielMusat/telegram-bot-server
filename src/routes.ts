import express from 'express'
import {getTelegram} from "./Telegram";

export const send = express.Router().post('/', ((req, res) => {
    console.log("requested send message endpoint")
    const telegram = getTelegram()
    if (!req.body['chatId'] || !req.body['text']) {
        res.status(400).send()
    } else {
        telegram.send({chatId: req.body['chatId'], text: req.body['text']})
            .then(() => res.send())
            .catch(() => res.status(500).send())
    }
}))

