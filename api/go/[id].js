export default async function handler(req, res) {
  const { id } = req.query;

  try {
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
        body: JSON.stringify({
          link_id: id
        })
      }
    );

    console.log("Supabase status:", response.status);
    console.log("Supabase text:", await response.text());

  } catch (err) {
    console.error("Supabase error:", err);
  }

  res.writeHead(302, {
    Location: "/?link=" + id
  });

  res.end();
}