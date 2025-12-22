export default async function handler(req, res) {
  const { code, error, error_description } = req.query;

  if (error) {
    return res.status(400).json({ error, error_description });
  }

  if (!code) {
    return res.status(400).send("No code");
  }

  const tokenUrl = "https://api.cafe24.com/oauth/token";

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: process.env.CAFE24_CLIENT_ID,
    client_secret: process.env.CAFE24_CLIENT_SECRET,
    redirect_uri: process.env.CAFE24_REDIRECT_URI,
    code,
  });

  const response = await fetch(tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  const text = await response.text(); // 🔥 중요

  return res.status(response.status).send(text);
}
