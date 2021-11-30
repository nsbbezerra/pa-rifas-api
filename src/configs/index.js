const token = process.env.MP_ACCESS_TOKEN_TEST;
const site_url = "http://localhost:3000";
const url = "http://localhost:4000";
module.exports = {
  secret: "parifasonline",
  urlImg: `${url}/img`,
  url: url,
  site_url: site_url,
  payment_url: "https://api.mercadopago.com",
  payment_token: token,
};
