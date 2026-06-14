export default function handler(req, res) {
  const { id } = req.query;

  res.writeHead(302, {
    Location: "/?link=" + encodeURIComponent(id)
  });

  res.end();
}