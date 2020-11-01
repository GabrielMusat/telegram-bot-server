import express from 'express';
import http from 'http';
import {ArgumentParser} from "argparse";
import {getTelegram, initTelegram} from "./Telegram";
import {send} from "./routes";
import {callbacks} from "./callbacks_template";

const parser = new ArgumentParser({addHelp: true})

parser.addArgument('--port', {help: 'port where the telegram service will run', type: Number, defaultValue: 8000})
parser.addArgument('--bot-token', {help: 'bot token', required: true})

const args = parser.parseArgs()

initTelegram(args.bot_token)
const bot = getTelegram()
callbacks.forEach(callback => bot.addCallback(callback))
const app: express.Application = express()

app.use(express.json())
app.use('/send', send)
app.use('/ok', express.Router().get('/', ((req, res) => res.send({message: 'I am a bot!'}))))

const server = http.createServer(app)

async function main() {
    server.listen(args.port)
    server.on("listening", () => console.log("escuchando en puerto "+args.port.toString()+'...'));
    server.on("error", (err: Error) => console.error(err));
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
