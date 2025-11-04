import { format, parseISO } from 'date-fns';

export const dateFormatting = (dateString: string): string => {
    let dateObject = parseISO(dateString);
    return format(dateObject, 'yyyy-MM-dd');
};