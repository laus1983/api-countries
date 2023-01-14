const axios = require("axios");
const { Country } = require("../db");

const url = "https://restcountries.com/v3/all";

function removeAccents(str) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

const getInfo = async () => {
  try {
    const { data } = await axios.get(url);
    const countriesFromApi = data.map((element) => {
      const country = {
        id: element.cca3,
        name: element.name.common,
        nameSearch: removeAccents(element.translations.spa.common),
        nameSpa: element.translations.spa.common,
        nameEn: element.name.common.toLowerCase(),
        flag: element.flags[0],
        continent: element.continents[0],
        capital: element.capital ? element.capital[0] : "Capital not found",
        subregion: element.subregion,
        area: element.area,
        population: element.population,
      };

      Country.findOrCreate({
        where: { id: element.cca3 },
        defaults: country,
      });
    });
  } catch (e) {
    (e) => console.error(e);
  }
};

const getCountries = async () => {
  const countries = await Country.findAll();
  if (countries.length > 0) return countries;
  else {
    await getInfo();
    const countries = await Country.findAll();
    return countries;
  }
};

module.exports = {
  getCountries,
  getInfo,
};
