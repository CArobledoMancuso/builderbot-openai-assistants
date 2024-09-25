
import { addKeyword, EVENTS } from "@builderbot/bot";
import { aiService } from "~/app";
import { appToCalendar } from "~/services/calendar";
import { getFullCurrentDate } from "~/utils/currentDate";
import { clearHistory, getHistoryParse, handleHistory } from "~/utils/handleHistory";


// export const aiService = new AiService();

const generatePromptToFormatDate = (history: string) => {
    const prompt = `Fecha de Hoy:${getFullCurrentDate()}, Basado en el Historial de conversacion: 
    ${history}
    ----------------
    Fecha ideal:...dd / mm hh:mm`;

    return prompt;
};

const generateJsonParse = (info: string) => {
    const prompt = `Tu tarea principal es analizar la información proporcionada en el contexto y generar un objeto JSON que se adhiera a la estructura especificada a continuación. 

    Contexto: "${info}"
    
    {
        "name": "Leifer",
        "interest": "n/a",
        "value": "0",
        "email": "fef@fef.com",
        "startDate": "2024/02/15 00:00:00"
    }
    
    Objeto JSON a generar:`;

    return prompt;
};

/**
 * Encargado de pedir los datos necesarios para registrar el evento en el calendario
 */
const flowConfirm = addKeyword(EVENTS.ACTION)
    .addAction(async (_, { flowDynamic }) => {
        await flowDynamic('Ok, voy a pedirte unos datos para agendar');
        await flowDynamic('¿Cuál es tu nombre?');
    })
    .addAction({ capture: true }, async (ctx, { state, flowDynamic, extensions }) => {
        await state.update({ name: ctx.body });
       

        const history = getHistoryParse(state);
        const text = await aiService.createChat(
            [
                {
                    role: 'system',
                    content: generatePromptToFormatDate(history),
                },
            ],
            'gpt-4'
        );

        await handleHistory({ content: text, role: 'assistant' }, state);
        await flowDynamic(`¿Me confirmas fecha y hora?: ${text}`);
        await state.update({ startDate: text });
    })
    .addAction({ capture: true }, async (ctx, { state, flowDynamic }) => {
        await flowDynamic(`Última pregunta, ¿cuál es tu email?`);
    })
    .addAction({ capture: true }, async (ctx, { state, extensions, flowDynamic }) => {
        const infoCustomer = `Name: ${state.get('name')}, StartDate: ${state.get('startDate')}, email: ${ctx.body}`;
       

        const text = await aiService.createChat([
            {
                role: 'system',
                content: generateJsonParse(infoCustomer),
            },
        ]);

        await appToCalendar(text);
        clearHistory(state);
        await flowDynamic('¡Listo! Agendado. Buen día.');
    });

export { flowConfirm };
