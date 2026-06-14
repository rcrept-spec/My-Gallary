export default function handler(req, res) {
  const { id } = req.query;

  console.log("Tracking link opened:", id);

  res.writeHead(302, {
    Location: "/"
  });

  res.end();
}