export default async function handler(req, res) {
  const { code, error, error_description } = req.query;

  // 1️⃣ OAuth 에러로 돌아온 경우
  if (error) {
    return res.status(400).json({
      message: "OAuth authorization failed",
      error,
      error_description,
    });
  }

  if (!code) {
    return res.status(400).json({
      message: "No authorization code received",
    });
  }

  // 2️⃣ 환경변수
  const {
    CAFE24_CLIENT_ID,
    CAFE24_CLIENT_SECRET,
    CAFE24_REDIRECT_URI,
  } = process.env;

  if (!CAFE24_CLIENT_ID || !CAFE24_CLIENT_SECRET || !CAFE24_REDIRECT_URI) {
    return res.status(500).json({
      message: "Missing environment variables",
    });
  }

  // ✅ 3️⃣ 토큰 URL (이게 핵심)
  const tokenUrl = "https://api.cafe24.com/oauth/token";

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

    const data = await response.json();

    if (!response.ok) {
      return res.status(400).json({
        message: "Failed to get access token",
        cafe24_error: data,
      });
    }

    // ✅ 성공
    return res.status(200).json({
      message: "OAuth success",
      token: data,
    });

  } catch (err) {
    return res.status(500).json({
      message: "Server crashed",
      error: err.message,
    });
  }
}
