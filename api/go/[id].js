export default async function handler(req, res) {
  const { id } = req.query;

  // ---------------------------
  // 1. Get IP safely
  // ---------------------------
  const ipRaw =
    req.headers["x-forwarded-for"] ||
    req.headers["x-real-ip"] ||
    req.socket.remoteAddress ||
    "";

  const ip = ipRaw.split(",")[0].trim();

  // ignore local/dev IPs
  const isLocal =
    !ip ||
    ip === "::1" ||
    ip.startsWith("127.") ||
    ip.startsWith("::ffff:127.");

  const cleanIp = isLocal ? null : ip;

  // ---------------------------
  // 2. User metadata
  // ---------------------------
  const ua = req.headers["user-agent"] || null;
  const ref = req.headers["referer"] || "direct";

  // ---------------------------
  // 3. Geo lookup (only if valid IP)
  // ---------------------------
  let geo = {};

  if (cleanIp) {
    try {
      const geoRes = await fetch(
        `https://ipapi.co/${cleanIp}/json/`
      );

      if (geoRes.ok) {
        geo = await geoRes.json();
      }
    } catch (err) {
      console.log("Geo lookup failed:", err);
    }
  }

  // ---------------------------
  // 4. Normalize values
  // ---------------------------
  const country = geo.country_name || null;
  const region = geo.region || null;
  const city = geo.city || null;
  const timezone = geo.timezone || null;

  // ---------------------------
  // 5. Send to Supabase
  // ---------------------------
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
        referrer: ref
      })
    });
  } catch (err) {
    console.log("Supabase insert error:", err);
  }

  // ---------------------------
  // 6. Redirect targets
  // ---------------------------
  const links = {
    pro_001: "/projects/",
    gal_001: "/my-pics/",
    per_001: "/personal-projects/"
  };

  res.writeHead(302, {
    Location: links[id] || "/"
  });

  res.end();
}