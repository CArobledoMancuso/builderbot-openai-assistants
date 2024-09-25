
import { addKeyword, EVENTS } from "@builderbot/bot";
import { getCurrentCalendar } from "~/services/calendar";
import { AiService } from "~/services/chatgpt";
import { getFullCurrentDate } from "~/utils/currentDate";
import { generateTimer } from "~/utils/generateTimer";
import { getHistoryParse, handleHistory } from "~/utils/handleHistory";

const PROMPT_SCHEDULE = `
Como ingeniero de inteligencia artificial especializado en la programación de reuniones, tu objetivo es analizar la conversación y determinar la intención del cliente de programar una reunión, así como su preferencia de fecha y hora. La reunión durará aproximadamente 45 minutos y solo puede ser programada entre las 9am y las 4pm, de lunes a viernes, y solo para la semana en curso.

Fecha de hoy: {CURRENT_DAY}

Reuniones ya agendadas:
-----------------------------------
{AGENDA_ACTUAL}

Historial de Conversacion:
-----------------------------------
{HISTORIAL_CONVERSACION}

Ejemplos de respuestas adecuadas para sugerir horarios y verificar disponibilidad:
----------------------------------
"Por supuesto, tengo un espacio disponible mañana, ¿a qué hora te resulta más conveniente?"
"Sí, tengo un espacio disponible hoy, ¿a qué hora te resulta más conveniente?"
"Ciertamente, tengo varios huecos libres esta semana. Por favor, indícame el día y la hora que prefieres."

INSTRUCCIONES:
- NO saludes
- Si existe disponibilidad debes decirle al usuario que confirme
- Revisar detalladamente el historial de conversación y calcular el día fecha y hora que no tenga conflicto con otra hora ya agendada
- Respuestas cortas ideales para enviar por whatsapp con emojis
-----------------------------
Respuesta útil en primera persona:`;

const generateSchedulePrompt = (summary: string, history: string): string => {
    const nowDate = getFullCurrentDate();
    return PROMPT_SCHEDULE
        .replace('{AGENDA_ACTUAL}', summary)
        .replace('{HISTORIAL_CONVERSACION}', history)
        .replace('{CURRENT_DAY}', nowDate);
};

const flowSchedule = addKeyword(EVENTS.ACTION).addAction(async (ctx, { extensions, state, flowDynamic }) => {
    await flowDynamic('Dame un momento para consultar la agenda...');

    const ai = extensions.ai as AiService;
    const history = getHistoryParse(state);
    const list = await getCurrentCalendar();
    const promptSchedule = generateSchedulePrompt(
        Array.isArray(list) && list.length ? list.join('\n') : 'Ninguna reunión agendada',
        history
    );

    const text = await ai.createChat(
        [
            { role: 'system', content: promptSchedule },
            { role: 'user', content: `Cliente pregunta: ${ctx.body}` },
        ],
        'gpt-4'
    );

    await handleHistory({ content: text, role: 'assistant' }, state);

    const chunks = text.split(/(?<!\d)\.\s+/g);
    for (const chunk of chunks) {
        await flowDynamic([{ body: chunk.trim(), delay: generateTimer(150, 250) }]);
    }
});

export { flowSchedule };
