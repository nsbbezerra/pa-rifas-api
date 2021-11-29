const token = process.env.MP_ACCESS_TOKEN_TEST;
const url = "http://localhost:4000";
module.exports = {
  secret: "parifasonline",
  urlImg: `${url}/img`,
  url: url,
  payment_url: "https://api.mercadopago.com",
  payment_token: token,
};
