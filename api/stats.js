export default async function handler(req, res) {
  const password = req.headers["x-admin-password"];

  if (password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { SUPABASE_URL, SUPABASE_KEY } = process.env;

  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/clicks?select=link_id`,
    {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`
      }
    }
  );

  const data = await response.json();

  const counts = {};

  data.forEach(row => {
    counts[row.link_id] = (counts[row.link_id] || 0) + 1;
  });

  res.status(200).json(counts);
}