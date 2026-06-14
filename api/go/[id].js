export default async function handler(req, res) {
  const { id } = req.query;

  const ip =
    req.headers["x-forwarded-for"] ||
    req.socket.remoteAddress;

  const ua = req.headers["user-agent"];
  const ref = req.headers["referer"] || "direct";

  let geo = {};
  try {
    const geoRes = await fetch(`https://ipapi.co/${ip}/json/`);
    geo = await geoRes.json();
  } catch (e) {
    console.log("Geo lookup failed:", e);
  }

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
        ip,
        country: geo.country_name || null,
        region: geo.region || null,
        city: geo.city || null,
        timezone: geo.timezone || null,
        user_agent: ua,
        referrer: ref
      })
    });
  } catch (err) {
    console.log("Supabase insert failed:", err);
  }

  res.writeHead(302, {
    Location: "/?link=" + encodeURIComponent(id)
  });

  res.end();
}