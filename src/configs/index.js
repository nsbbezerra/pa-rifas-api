const tokens = require("./tokens.json");
module.exports = {
  secret: "parifasonline",
  urlImg: `${tokens.API}/img`,
  url: tokens.API,
  site_url: tokens.SITE,
  payment_url: tokens.MP,
  payment_token: tokens.TEST,
  pixTax: 0.99,
  cardTax: 4.99,
  boleto: 3.49,
  debitTax: 3.99,
  minimum_payment: 25,
};
