import express from "express";
import bodyParser from "body-parser";
import AWS from "aws-sdk";
import cors from "cors";

const app = express();
const PORT = 3000;

// Config AWS
AWS.config.update({
  region: "us-east-1"
});
const s3 = new AWS.S3();

// Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));

// Route du formulaire
app.post("/contact", async (req, res) => {
  console.log("POST reçu:", req.body);
  try {
    const { name, email, subject, message } = req.body;
    const timestamp = new Date().toISOString();

    const params = {
      Bucket: "samy19837",
      Key: `contacts/contact-${timestamp}.json`,
      Body: JSON.stringify({ name, email, subject, message, timestamp }),
      ContentType: "application/json"
    };

    await s3.putObject(params).promise();
    res.status(200).send("Message reçu et sauvegardé dans S3 ✅");
  } catch (err) {
    console.error("Erreur S3:", err);
    res.status(500).send("Erreur lors de l'envoi du message ❌");
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Serveur lancé sur http://localhost:${PORT}`);
});

