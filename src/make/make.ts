export const MAKE_GET_PROMPTS_TEMPLATE = (step: number): string => {
    switch (step) {
        case 1:
            return "¡Hola! Bienvenido a [Nombre de la Empresa]. ¿Cómo te llamas?";
        case 2:
            return "¡Encantado de conocerte, {nombre}! ¿En qué puedo ayudarte hoy? Aquí tienes algunas opciones:\n1. Más información sobre nuestros servicios.\n2. Agendar una cita.\n3. Otros";
        case 3:
            return "Genial, ¿quieres obtener información sobre la empresa o hay algo más específico en lo que pueda ayudarte?";
        default:
            return "Lo siento, no he entendido tu solicitud. Por favor selecciona una opción válida.";
    }
  };
  
  
  export const getInitSettings = async () => {
    try {
        // Simulación de la obtención de los prompts. Esto se podría cambiar si los obtienes de otro lado.
        const prompts = [MAKE_GET_PROMPTS_TEMPLATE(1), MAKE_GET_PROMPTS_TEMPLATE(2), MAKE_GET_PROMPTS_TEMPLATE(3)];
        return prompts;
    } catch (error) {
        console.log({ error: 'Asegúrate de iniciar el escenario' });
        return [];
    }
  };