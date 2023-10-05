import { countries as COUNTRIES } from 'countries-list';

export const countryCodes = Object.keys(COUNTRIES);

export const countries = countryCodes
  .map((c) => ({
    name: COUNTRIES[c].name,
    code: c,
    isAfrica: COUNTRIES[c].continent === 'AF',
  }))
  .sort((a, b) => a.name.localeCompare(b.name));

export const isAfrica = (country) =>
  countries
    .filter((c) => c.isAfrica)
    .map((c) => c.code)
    .includes(country);
