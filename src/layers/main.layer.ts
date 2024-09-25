
import { flowSeller } from "../flows/seller.flow";
import { flowSchedule } from "../flows/schedule.flow";
import { flowConfirm } from "../flows/confirm.flow";
import { BotContext, BotMethods } from "@builderbot/bot/dist/types";
import { getHistoryParse } from "~/utils/handleHistory";
import { aiService } from "~/app";


/**
 * Determina que flujo va a iniciarse basado en el historial que previo entre el bot y el humano
 */
export default async (_: BotContext, { state, gotoFlow, extensions, flowDynamic }: BotMethods) => {

    const prompts = extensions.prompts || {}; // Asegúrate de que siempre sea un objeto
    const history = getHistoryParse(state);
    const prompt = prompts.descriminador || "Lo siento, no tengo la información necesaria para proceder.";

    if (!prompt) {
        console.error('Prompt "descriminador" no está definido');
        await flowDynamic("Lo siento, no puedo proceder en este momento.");
        return;
    }

    console.log(prompt.replace('{HISTORY}', history));
    console.log(history); // Verifica el historial

    try {
        const text = await aiService.createChat([
            {
                role: 'system',
                content: prompt.replace('{HISTORY}', history)
            }
        ]);

        console.log('Respuesta AI:', text);

        if (!text || text.trim().length === 0) {
            await flowDynamic("Lo siento, no tengo una respuesta para eso.");
            return;
        }

        await flowDynamic(text); // Envía el mensaje

        if (text.includes('HABLAR')) return gotoFlow(flowSeller);
        if (text.includes('AGENDAR')) return gotoFlow(flowSchedule);
        if (text.includes('CONFIRMAR')) return gotoFlow(flowConfirm);

        // Respuesta por defecto
        await flowDynamic("Lo siento, no puedo ayudar con eso en este momento.");
    } catch (error) {
        if (error.status === 429) {
            console.error('Error de cuota excedida:', error);
            await flowDynamic("Lo siento, hemos excedido la cuota de solicitudes. Intenta más tarde.");
            await gotoFlow(flowConfirm);
        } else {
            console.error('Error al crear el chat con AI:', error);
        }
    }
};
