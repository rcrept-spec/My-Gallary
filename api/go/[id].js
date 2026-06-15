function detectBot(req, ip, ua) {
  let score = 0;

  const userAgent = (ua || "").toLowerCase();

  const botPatterns = [
    "bot",
    "crawl",
    "spider",
    "slurp",
    "preview",
    "headless",
    "curl",
    "wget"
  ];

  // missing UA
  if (!ua) score += 3;

  // bot keywords
  if (botPatterns.some(p => userAgent.includes(p))) {
    score += 5;
  }

  // no referrer
  if (!req.headers["referer"]) score += 1;

  // invalid / local IP
  if (!ip || ip.startsWith("127.") || ip === "::1") {
    score += 3;
  }

  return {
    is_bot: score >= 5,
    bot_score: score
  };
}

export default async function handler(req, res) {
  const { id } = req.query;

  // ---------------- IP ----------------
  const ipRaw =
    req.headers["x-forwarded-for"] ||
    req.headers["x-real-ip"] ||
    req.socket.remoteAddress ||
    "";

  const ip = ipRaw.split(",")[0].trim();

  const cleanIp =
    !ip ||
    ip === "::1" ||
    ip.startsWith("127.") ||
    ip.startsWith("::ffff:127.")
      ? null
      : ip;

  // ---------------- metadata ----------------
  const ua = req.headers["user-agent"] || null;
  const ref = req.headers["referer"] || "direct";

  // ---------------- geo ----------------
  let geo = {};

  if (cleanIp) {
    try {
      const geoRes = await fetch(
        `https://ipapi.co/${cleanIp}/json/`
      );

      if (geoRes.ok) {
        geo = await geoRes.json();
      }
    } catch (e) {
      console.log("Geo lookup failed:", e);
    }
  }

  const country = geo.country_name || null;
  const region = geo.region || null;
  const city = geo.city || null;
  const timezone = geo.timezone || null;

  // ---------------- bot detection ----------------
  const bot = detectBot(req, cleanIp, ua);

  // ---------------- supabase insert ----------------
  try {
    await fetch(`${process.env.SUPABASE_URL}/rest/v1/clicks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": process.env.SUPABASE_KEY,
        "Authorization": `Bearer ${process.env.SUPABASE_KEY}`,
        "Prefer": "return=minimal"
      },
      body: JSON.stringify({
        link_id: id,
        ip: cleanIp,
        country,
        region,
        city,
        timezone,
        user_agent: ua,
        referrer: ref,
        is_bot: bot.is_bot,
        bot_score: bot.bot_score
      })
    });
  } catch (err) {
    console.log("Supabase insert error:", err);
  }

 // ---------------- redirect ----------------
  const routes = {
    home_001: "/",
    pro_001: "/projects/",
    per_001: "/personal-projects/",
    gal_001: "/my-pics/"
  };

  const target = routes[id];

  if (!target) {
    return res.status(404).send("Invalid link");
  }

  res.writeHead(302, {
    Location: target
  });

  res.end();
}