export default async function handler(req, res) {
  const { id } = req.query;

  console.log("HIT:", id);

  res.writeHead(302, {
    Location: "/?link=" + id
  });

  res.end();
}