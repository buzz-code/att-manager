import { defaultYear as currentYear, yearsList as serverYearsList } from "../../server/utils/listHelper";

export const yearsList = serverYearsList;
export let defaultYear = localStorage.getItem('defaultYear') || currentYear;

export const updateDefaultYear = (value) => {
    defaultYear = value;
    localStorage.setItem('defaultYear', value);
}
