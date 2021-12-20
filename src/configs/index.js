const tokens = require("./tokens.json");
module.exports = {
  secret: "parifasonline",
  urlImg: `${tokens.AMBIENT === "dev" ? tokens.API_DEV : tokens.API}/img`,
  url: tokens.AMBIENT === "dev" ? tokens.API_DEV : tokens.API,
  site_url: tokens.AMBIENT === "dev" ? tokens.SITE_DEV : tokens.SITE,
  payment_url: tokens.MP,
  payment_token: tokens.MP_AMBIENT === "dev" ? tokens.TEST : tokens.PRODUCTION,
  pixTax: 0.99,
  cardTax: 4.99,
  boleto: 3.49,
  debitTax: 3.99,
  minimum_payment: 25,
};
