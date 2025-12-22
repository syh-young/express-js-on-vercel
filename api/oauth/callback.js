export default async function handler(req, res) {
  const { code, error, error_description } = req.query;

  if (error) {
    return res.status(400).json({
      ok: false,
      error,
      error_description,
    });
  }

  if (!code) {
    return res.status(400).json({
      ok: false,
      message: "No authorization code",
    });
  }

  const {
    CAFE24_CLIENT_ID,
    CAFE24_CLIENT_SECRET,
    CAFE24_REDIRECT_URI,
  } = process.env;

  if (!CAFE24_CLIENT_ID || !CAFE24_CLIENT_SECRET || !CAFE24_REDIRECT_URI) {
    return res.status(500).json({
      ok: false,
      message: "Missing environment variables",
    });
  }

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: CAFE24_CLIENT_ID,
    client_secret: CAFE24_CLIENT_SECRET,
    redirect_uri: CAFE24_REDIRECT_URI,
    code,
  });

  try {
    const response = await fetch("https://api.cafe24.com/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    });

    const text = await response.text();

    if (!response.ok) {
      return res.status(response.status).json({
        ok: false,
        cafe24_error: text,
      });
    }

    return res.status(200).json({
      ok: true,
      token: JSON.parse(text),
    });

  } catch (err) {
    return res.status(500).json({
      ok: false,
      message: "fetch failed",
      error: err.message,
    });
  }
}
