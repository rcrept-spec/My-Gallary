export default async function handler(req, res) {
  const { id } = req.query;

  const payload = {
    link_id: id
  };

  const response = await fetch(
    `${process.env.SUPABASE_URL}/rest/v1/clicks`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": process.env.SUPABASE_KEY,
        "Authorization": `Bearer ${process.env.SUPABASE_KEY}`,
        "Prefer": "return=minimal"
      },
      body: JSON.stringify(payload)
    }
  );

  const text = await response.text();

  console.log("Supabase status:", response.status);
  console.log("Supabase response:", text);

  res.writeHead(302, {
    Location: "/"
  });

  res.end();
}