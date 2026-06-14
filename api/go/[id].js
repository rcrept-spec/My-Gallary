export default async function handler(req, res) {
  const { id } = req.query;

  // ---------------------------
  // 1. Get + clean IP
  // ---------------------------
  const ipRaw =
    req.headers["x-forwarded-for"] ||
    req.socket.remoteAddress ||
    "";

  const ip = ipRaw.split(",")[0].trim();

  const cleanIp = ip.startsWith("::ffff:")
    ? ip.replace("::ffff:", "")
    : ip;

  // ---------------------------
  // 2. User metadata
  // ---------------------------
  const ua = req.headers["user-agent"] || null;
  const ref = req.headers["referer"] || "direct";

  // ---------------------------
  // 3. Geo lookup (safe fail)
  // ---------------------------
  let geo = {};

  try {
    const geoRes = await fetch(
      `https://ipapi.co/${cleanIp}/json/`
    );

    if (geoRes.ok) {
      geo = await geoRes.json();
    } else {
      console.log("Geo API error:", geoRes.status);
    }
  } catch (err) {
    console.log("Geo lookup failed:", err);
  }

  // ---------------------------
  // 4. Normalize fields (prevents blanks)
  // ---------------------------
  const country = geo.country_name || "unknown";
  const region = geo.region || "unknown";
  const city = geo.city || "unknown";
  const timezone = geo.timezone || "unknown";

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
  // 6. Redirect map
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