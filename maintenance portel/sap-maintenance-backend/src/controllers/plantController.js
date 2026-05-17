/**
 * Plant Controller
 * GET /api/plants
 * GET /api/plants/:id
 */
const sapService = require('../services/sapService');

/**
 * Get all plants with optional filters
 * Query params: id, search
 */
const getPlants = async (req, res, next) => {
  try {
    const { id, search } = req.query;
    console.log(`\n🏭 Fetching plants — filters: ${JSON.stringify(req.query)}`);

    const results = await sapService.getPlants({ id, search });

    const plants = results.map((p) => ({
      plantId: p.PlantId || '',
      plantName: p.PlantName || '',
      city: p.CityName || '',
      country: p.CountryCode || '',
      region: p.RegionName || '',
      postalCode: p.PostalCode || '',
      street: p.StreetName || '',
      phone: p.PhoneNumber || '',
      language: p.LanguageKey || '',
      companyCode: p.CompanyCode || '',
      timezone: '',
      factoryCalendar: '',
    }));

    res.json({
      success: true,
      count: plants.length,
      data: plants,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get single plant by ID
 */
const getPlantById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const results = await sapService.getPlants({ id });

    if (!results || results.length === 0) {
      return res.status(404).json({ success: false, error: `Plant ${id} not found` });
    }

    const p = results[0];
    res.json({
      success: true,
      data: {
        plantId: p.Werks || '',
        plantName: p.Name1 || '',
        city: p.Ort01 || '',
        country: p.Land1 || '',
        region: p.Regio || '',
        postalCode: p.Pstlz || '',
        street: p.Stras || '',
        phone: p.Telf1 || '',
        language: p.Spras || '',
        companyCode: p.Bukrs || '',
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getPlants, getPlantById };
