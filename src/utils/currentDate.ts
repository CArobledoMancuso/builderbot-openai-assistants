import { format } from 'date-fns';

const getFullCurrentDate = (): string => {
    const currentD = new Date();
    const formatDate = format(currentD, 'yyyy/MM/dd HH:mm'); // Formato "yyyy/MM/dd HH:mm"
    const day = format(currentD, 'EEEE'); // Obtener el día de la semana

    return [formatDate, day].join(' '); // Retorna la fecha completa y el día de la semana
};

export { getFullCurrentDate };
