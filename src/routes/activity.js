const { Router } = require("express");
const { Country, Activity, CountryActivity } = require("../db.js");
const router = Router();

router.post("/create", async (req, res, next) => {
  if (!req.body) res.send("The form is empty");

  try {
    const { language } = req.query;
    const { name, difficulty, duration, season, countriesList } = req.body;

    const activityCreated = await Activity.create({
      name,
      difficulty: parseInt(difficulty),
      duration: parseInt(duration),
      season: season.toLowerCase(),
    });

    const dbCountries =
      language === "true"
        ? await Country.findAll({
            where: {
              nameSpa: countriesList,
            },
          })
        : await Country.findAll({
            where: {
              name: countriesList,
            },
          });

    const result = await activityCreated.addCountry(dbCountries);

    return res.send({ result, message: "Activity Created" });
  } catch (e) {
    next(e);
  }
});

router.get("/see", async (req, res, next) => {
  try {
    const activities = await Activity.findAll({
      include: { model: Country },
    });
    res.json(activities);
  } catch (e) {
    next(e);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const activity = await Activity.findByPk(id);
    const result = await activity.destroy();
    res.json(result);
  } catch (e) {
    next(e);
  }
});

router.put("/update/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { language } = req.query;
    const {
      name,
      difficulty,
      duration,
      season,
      deleteCountries,
      countriesList,
    } = req.body;
    const activity = await Activity.findByPk(id);
    const result = await activity.update({
      name,
      difficulty: parseInt(difficulty),
      duration: parseInt(duration),
      season: season.toLowerCase(),
    });
    const dbCountries =
      language === "true"
        ? await Country.findAll({
            where: {
              nameSpa: countriesList,
            },
          })
        : await Country.findAll({
            where: {
              name: countriesList,
            },
          });
    if (deleteCountries === "yes") {
      const aux = await activity.getCountries();
      const countriesDelete = await activity.removeCountry(aux);
    } else {
      const countriesAdd = await activity.addCountry(dbCountries);
    }
    const countriesResult = await activity.addCountry(dbCountries);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

module.exports = router;
