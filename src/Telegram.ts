import TelegramBot, {Message, Metadata} from "node-telegram-bot-api"
import {IMessage} from "./types";
import fs from "fs"

export interface ICallback {
    response?: string
    image?: string
    audio?: string
    when: (text: Message) => boolean
}

class Telegram {
    private bot: TelegramBot;
    private callbacks: ICallback[] = []
    constructor(token: string) {
        this.bot = new TelegramBot(token, {polling: true})
        this.bot.addListener("message", this.onMessage)
    }

    addCallback = (callback: ICallback): void => {
        this.callbacks.push(callback)
    }

    onMessage = (msg: Message, meta: Metadata): void => {
        console.log("received new message from", msg.from.id)
        console.log(msg.text)
        let i = 1;
        for (const callback of this.callbacks) {
            if (callback.when(msg)) {
                if (callback.response) setTimeout(() => this.send({chatId: msg.from.id.toString(), text: callback.response}), 300)
                if (callback.image) {
                    if (!fs.existsSync("images/"+callback.image)) {
                        console.error("image images/"+callback.image+" does not exists")
                        return
                    }
                    fs.readFile("images/"+callback.image, async (err, data) => {
                        if (err) {
                            console.error(err)
                            return
                        }
                        setTimeout(() => this.bot.sendPhoto(msg.from.id.toString(), data), 500)
                    })
                }
                if (callback.audio) {
                    if (!fs.existsSync("audios/"+callback.audio)) {
                        console.error("audio audios/"+callback.audio+" does not exists")
                        return
                    }
                    fs.readFile("audios/"+callback.audio, async (err, data) => {
                        if (err) {
                            console.error(err)
                            return
                        }
                        setTimeout(() => this.bot.sendAudio(msg.from.id.toString(), data), 500)
                    })
                }
                console.log("callback", i, "triggered")
                return
            }
            i++
        }
        console.log("no callback")
    }

    send = (message: IMessage): Promise<void> => {
        return new Promise<void>(((resolve, reject) => {
            this.bot.sendMessage(message.chatId, message.text)
                .then(() => resolve())
                .catch(reject)
        }))
    }
}


let telegram: Telegram | null = null;

export function initTelegram(token: string): Telegram {
    telegram = new Telegram(token);
    return telegram
}

export function getTelegram(): Telegram {
    return telegram
}
