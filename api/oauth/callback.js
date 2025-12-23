export default async function handler(req, res) {
  const { code, error, error_description } = req.query;

  if (error) {
    return res.status(400).json({ error, error_description });
  }

  if (!code) {
    return res.status(400).json({ message: "No authorization code" });
  }

  const {
    CAFE24_CLIENT_ID,
    CAFE24_CLIENT_SECRET,
    CAFE24_REDIRECT_URI,
  } = process.env;

  try {
    const body = new URLSearchParams({
      grant_type: "authorization_code",
      client_id: CAFE24_CLIENT_ID,
      client_secret: CAFE24_CLIENT_SECRET,
      redirect_uri: CAFE24_REDIRECT_URI,
      code,
    });

    const response = await fetch(
  "https://top21young.cafe24api.com/api/v2/oauth/token",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });


    const data = await response.json();

    if (!response.ok) {
      return res.status(400).json({
        ok: false,
        message: "Failed to get access token",
        raw: data,
      });
    }

    return res.status(200).json({
      ok: true,
      token: data,
    });
  } catch (e) {
    return res.status(500).json({
      message: "Server crashed",
      error: e.message,
    });
  }
}
