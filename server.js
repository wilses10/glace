import express from "express";
import bodyParser from "body-parser";
import AWS from "aws-sdk";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = process.env.PORT || 3000;

// Pour supporter __dirname dans ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ======== CONFIG AWS ========
AWS.config.update({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: new AWS.Credentials({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  }),
});

const s3 = new AWS.S3();

// ======== MIDDLEWARES ========
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public"))); // sert ton site

// ======== ROUTE DU FORMULAIRE ========
app.post("/contact", async (req, res) => {
  console.log("📩 Requête reçue:", req.body);

  try {
    const { name, email, subject, message } = req.body;
    const timestamp = new Date().toISOString();

    const params = {
      Bucket: process.env.S3_BUCKET || "samy19837",
      Key: `contacts/contact-${timestamp}.json`,
      Body: JSON.stringify({ name, email, subject, message, timestamp }),
      ContentType: "application/json",
    };

    await s3.putObject(params).promise();
    console.log("✅ Sauvegardé dans S3");
    res.status(200).send("Message reçu et sauvegardé dans S3 ✅");
  } catch (err) {
    console.error("❌ Erreur S3:", err);
    res.status(500).send("Erreur lors de l'envoi du message ❌");
  }
});

// ======== SERVE TON FRONTEND ========
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "contact.html"));
});

// ======== DÉMARRAGE ========
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Serveur en ligne sur le port ${PORT}`);
});
