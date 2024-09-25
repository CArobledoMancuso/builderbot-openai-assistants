import 'dotenv/config'
import { createBot, createProvider, createFlow,} from '@builderbot/bot'
import welcomeFlow from './flows/welcome.flow'
import { MemoryDB as Database } from '@builderbot/bot'
import { BaileysProvider as Provider } from '@builderbot/provider-baileys'
import { flowSeller } from './flows/seller.flow'
import { flowSchedule } from './flows/schedule.flow'
import { flowConfirm } from './flows/confirm.flow'
import { AiService } from './services/chatgpt'

const PORT = process.env.PORT ?? 3001
export const aiService = new AiService();

const main = async () => {
  try {
    const adapterFlow = createFlow([welcomeFlow, flowSeller, flowSchedule, flowConfirm])
    const adapterProvider = createProvider(Provider)
    const adapterDB = new Database()

    const { httpServer } = await createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    })

    httpServer(+PORT)
    console.log(`Bot is running on port ${PORT}`)
  } catch (error) {
    console.error('Error initializing bot:', error)
  }
}

main()
