const ip =
  req.headers["x-forwarded-for"] ||
  req.socket.remoteAddress;

const ua = req.headers["user-agent"];
const ref = req.headers["referer"] || "direct";

const tz = req.headers["x-vercel-ip-timezone"] || null;

const geoRes = await fetch(`https://ipapi.co/${ip}/json/`);
const geo = await geoRes.json();

const payload = {
  link_id: id,
  ip,
  country: geo.country_name,
  region: geo.region,
  city: geo.city,
  timezone: tz || geo.timezone,
  user_agent: ua,
  referrer: ref
};