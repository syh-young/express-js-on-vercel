// /api/oauth/callback.js
export default async function handler(req, res) {
  const { code, error, error_description } = req.query;

  if (error) {
    return res.status(400).json({ ok: false, error, error_description });
  }
  if (!code) {
    return res.status(400).json({ ok: false, message: "No authorization code" });
  }

  const {
    CAFE24_CLIENT_ID,
    CAFE24_CLIENT_SECRET,
    CAFE24_REDIRECT_URI,
    CAFE24_MALL_ID,
  } = process.env;

  // 필수 환경변수 체크
  if (!CAFE24_CLIENT_ID || !CAFE24_CLIENT_SECRET || !CAFE24_MALL_ID || !CAFE24_REDIRECT_URI) {
    return res.status(500).json({
      ok: false,
      message: "Missing environment variables",
      missing: {
        CAFE24_CLIENT_ID: !CAFE24_CLIENT_ID,
        CAFE24_CLIENT_SECRET: !CAFE24_CLIENT_SECRET,
        CAFE24_MALL_ID: !CAFE24_MALL_ID,
        CAFE24_REDIRECT_URI: !CAFE24_REDIRECT_URI,
      },
    });
  }

  const tokenUrl = `https://${CAFE24_MALL_ID}.cafe24.com/api/v2/oauth/token`;

  // 공식 가이드: Authorization Basic base64(client_id:client_secret)
  const basic = Buffer.from(`${CAFE24_CLIENT_ID}:${CAFE24_CLIENT_SECRET}`).toString("base64");

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    // 문서 샘플에는 redirect_uri가 없어도 되지만,
    // 일부 구현에서 redirect_uri 일치 체크를 하는 경우가 있어 같이 넣어둠(안전).
    redirect_uri: CAFE24_REDIRECT_URI,
  });

  try {
    const response = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        "Authorization": `Basic ${basic}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    });

    const text = await response.text(); // 에러가 json 아닐 수도 있어서 안전하게 text로 받음
    let data;
    try { data = JSON.parse(text); } catch { data = { raw_text: text }; }

    if (!response.ok) {
      return res.status(response.status).json({
        ok: false,
        message: "Failed to get access token",
        tokenUrl,
        response_status: response.status,
        response_body: data,
      });
    }

    return res.status(200).json({ ok: true, token: data });
  } catch (e) {
    return res.status(500).json({ ok: false, message: "Server crashed", error: e.message });
  }
}
