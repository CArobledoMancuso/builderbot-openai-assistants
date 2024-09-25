
import { addKeyword, EVENTS } from "@builderbot/bot";
import { aiService } from "~/app";
import { getFullCurrentDate } from "~/utils/currentDate";
import { generateTimer } from "~/utils/generateTimer";
import { getHistoryParse, handleHistory } from "~/utils/handleHistory";

export const generatePromptSeller = (history: string, prompt: string) => {
    if (!prompt) {
        console.error('Prompt is undefined or null');
        return ''; // Retorna cadena vacía si prompt es undefined
    }
    const nowDate = getFullCurrentDate();
    return prompt.replace('{HISTORY}', history).replace('{CURRENT_DAY}', nowDate);
};

/**
 * Hablamos con el PROMPT que sabe sobre las cosas básicas del negocio, info, precio, etc.
 */
const flowSeller = addKeyword(EVENTS.ACTION).addAction(async (_, { state, flowDynamic, extensions }) => {
    try {
      
        const prompts = extensions.prompts;

        console.log('extensions.prompts:', extensions.prompts);

        if (!prompts || !prompts.hablar) {
            console.error('Prompt hablar no está definido');
            return;
        }

        const history = getHistoryParse(state);
        const prompt = generatePromptSeller(history, prompts.hablar);

        if (!prompt) {
            console.error('Prompt generado es undefined o vacío');
            return;
        }

        console.log(`---------------------prompt hablar --------------------------`);
        console.log(prompt);

        const text = await aiService.createChat([
            {
                role: 'system',
                content: prompt,
            },
        ]);

        await handleHistory({ content: text, role: 'assistant' }, state);

        const chunks = text.split(/(?<!\d)\.\s+/g);
        for (const chunk of chunks) {
            await flowDynamic([{ body: chunk.trim(), delay: generateTimer(150, 250) }]);
        }
    } catch (err) {
        console.log(`[ERROR]:`, err);
        return;
    }
});

export { flowSeller };
