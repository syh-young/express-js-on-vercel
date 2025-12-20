export default function handler(req, res) {
  console.log("OAuth callback received:", req.query);
  res.status(200).send("oauth ok");
}
