export default async function handler(req, res) {
  const { SUPABASE_URL, SUPABASE_KEY } = process.env;

  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/clicks?select=*&order=created_at.desc`,
    {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`
      }
    }
  );

  const data = await response.json();

  res.status(200).json(data);
}