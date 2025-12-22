export default async function handler(req, res) {
  const { code, error, error_description } = req.query;

  // 1️⃣ Cafe24에서 에러로 돌아온 경우
  if (error) {
    return res.status(400).json({
      ok: false,
      message: "OAuth authorization failed",
      error,
      error_description,
    });
  }

  if (!code) {
    return res.status(400).json({
      ok: false,
      message: "No authorization code received",
    });
  }

  // 2️⃣ 환경변수
  const {
    CAFE24_CLIENT_ID,
    CAFE24_CLIENT_SECRET,
    CAFE24_MALL_ID,
    CAFE24_REDIRECT_URI,
  } = process.env;

  if (
    !CAFE24_CLIENT_ID ||
    !CAFE24_CLIENT_SECRET ||
    !CAFE24_MALL_ID ||
    !CAFE24_REDIRECT_URI
  ) {
    return res.status(500).json({
      ok: false,
      message: "Missing environment variables",
    });
  }

  // 3️⃣ 토큰 요청
  const tokenUrl = `https://${CAFE24_MALL_ID}.cafe24api.com/api/v2/oauth/token`;

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: CAFE24_CLIENT_ID,
    client_secret: CAFE24_CLIENT_SECRET,
    redirect_uri: CAFE24_REDIRECT_URI,
    code,
  });

  try {
    const response = await fetch(tokenUrl, {
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
        message: "Failed to get access token",
        raw: text,
      });
    }

    return res.status(200).json({
      ok: true,
      token: JSON.parse(text),
    });

  } catch (err) {
    return res.status(500).json({
      ok: false,
      message: "Server crashed",
      error: err.message,
    });
  }
}
