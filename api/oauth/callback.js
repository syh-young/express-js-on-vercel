// src/api/oauth/callback.js

export default async function handler(req, res) {
  try {
    // 1️⃣ Cafe24가 redirect 하면서 주는 code
    const { code, error, error_description } = req.query;

    // 에러가 넘어온 경우
    if (error) {
      return res.status(400).json({
        error,
        error_description,
      });
    }

    // code 없으면 잘못된 접근
    if (!code) {
      return res.status(400).json({ error: "No authorization code" });
    }

    // 2️⃣ 환경변수 체크 (이거 없으면 바로 크래시)
    const {
      CAFE24_CLIENT_ID,
      CAFE24_CLIENT_SECRET,
      CAFE24_REDIRECT_URI,
      CAFE24_MALL_ID,
    } = process.env;

    if (
      !CAFE24_CLIENT_ID ||
      !CAFE24_CLIENT_SECRET ||
      !CAFE24_REDIRECT_URI ||
      !CAFE24_MALL_ID
    ) {
      return res.status(500).json({
        error: "Missing environment variables",
        env: {
          CAFE24_CLIENT_ID: !!CAFE24_CLIENT_ID,
          CAFE24_CLIENT_SECRET: !!CAFE24_CLIENT_SECRET,
          CAFE24_REDIRECT_URI: !!CAFE24_REDIRECT_URI,
          CAFE24_MALL_ID: !!CAFE24_MALL_ID,
        },
      });
    }

    // 3️⃣ 토큰 발급 요청
    const tokenUrl = `https://${CAFE24_MALL_ID}.cafe24api.com/api/v2/oauth/token`;

    const body = new URLSearchParams({
      grant_type: "authorization_code",
      client_id: CAFE24_CLIENT_ID,
      client_secret: CAFE24_CLIENT_SECRET,
      redirect_uri: CAFE24_REDIRECT_URI,
      code,
    });

    const response = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    });

    const data = await response.json();

    // 4️⃣ Cafe24에서 에러 내려준 경우
    if (!response.ok) {
      return res.status(response.status).json({
        message: "Failed to get access token",
        cafe24_error: data,
      });
    }

    // 🔥 여기서 access_token 정상 발급됨
    return res.status(200).json({
      success: true,
      token: data,
    });

  } catch (err) {
    // ❗ Vercel에서 안 죽게 반드시 catch
    console.error("🔥 OAuth callback error:", err);
    return res.status(500).json({
      error: "Internal Server Error",
      message: err.message,
    });
  }
}
