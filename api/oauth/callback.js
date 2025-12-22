export default async function handler(req, res) {
  try {
    // 1️⃣ authorization code
    const { code } = req.query;

    if (!code) {
      return res.status(400).json({
        error: "missing_code",
        message: "No authorization code provided",
      });
    }

    // 2️⃣ 환경변수 로드
    const {
      CAFE24_CLIENT_ID,
      CAFE24_CLIENT_SECRET,
      CAFE24_REDIRECT_URI,
      CAFE24_MALL_ID,
    } = process.env;

    // 3️⃣ 환경변수 검증
    if (
      !CAFE24_CLIENT_ID ||
      !CAFE24_CLIENT_SECRET ||
      !CAFE24_REDIRECT_URI ||
      !CAFE24_MALL_ID
    ) {
      return res.status(500).json({
        error: "env_missing",
        message: "One or more CAFE24 env variables are missing",
      });
    }

    // 4️⃣ Cafe24 토큰 발급 URL
    const tokenUrl = `https://${CAFE24_MALL_ID}.cafe24api.com/api/v2/oauth/token`;

    // 5️⃣ 요청 바디
    const body = new URLSearchParams({
      grant_type: "authorization_code",
      client_id: CAFE24_CLIENT_ID,
      client_secret: CAFE24_CLIENT_SECRET,
      redirect_uri: CAFE24_REDIRECT_URI,
      code,
    });

    // 6️⃣ 토큰 요청
    const response = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    });

    const data = await response.json();

    // 7️⃣ Cafe24 에러 그대로 반환
    if (!response.ok) {
      return res.status(400).json({
        message: "Failed to get access token",
        cafe24_error: data,
      });
    }

    // ✅ 성공 (access_token 여기서 나옴)
    return res.status(200).json({
      success: true,
      token: data,
    });
  } catch (err) {
    return res.status(500).json({
      error: "server_error",
      message: err.message,
    });
  }
}
