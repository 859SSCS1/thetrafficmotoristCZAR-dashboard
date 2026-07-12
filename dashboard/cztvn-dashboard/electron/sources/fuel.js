// Fuel price — one of the "few pertinent stats" on the card.
// TODO: wire the EIA free API for state/regional gasoline prices:
//   https://www.eia.gov/opendata/  (free key). Return { price, unit, asOf }.
// Until wired, returns null; the card renders gracefully without it.
async function priceFor(state) {
  return null;
}
module.exports = { priceFor };
