import express from "express";
import dotenv from "dotenv";
import AWS from "aws-sdk";
import bodyParser from "body-parser";
import multer from "multer";
import cors from "cors";
dotenv.config();

const app = express();
app.use(bodyParser.json());
app.use(cors());
const PORT = process.env.PORT || 3001;
const upload = multer();

AWS.config.update({
  credentials: {
    accessKeyId: process.env.ACCESSKEYID,
    secretAccessKey: process.env.SECRETACCESSKEY,
  },
  region: process.env.REGION,
});

const s3 = new AWS.S3({
  apiVersion: "2006-03-01",
  signatureVersion: "v4",
});

// app.get("/images", (req, res) => {
//   const params = {
//     Bucket: process.env.BUCKET,
//   };

//   s3.listObjects(params, (err, data) => {
//     if (err) {
//       console.log("Error listing objects from S3:", err);
//       res.status(500).send("Error fetching images!");
//     } else {
//       const images = data.Contents.map((object) => ({
//         key: object.Key,
//         imageUrl: `https://${params.Bucket}.s3.amazonaws.com/${object.Key}`,
//       }));
//       res.status(200).send(images);
//     }
//   });
// });

app.get("/images", (req, res) => {
  const params = {
    Bucket: process.env.BUCKET,
    // expires: 300,
  };
  s3.listObjects({ Bucket: params.Bucket }, (err, data) => {
    if (err) {
      console.log(err);
      res.status(500).send("Error listing objects from s3 bucket");
    } else {
      const signedUrls = data.Contents.map((obj) => {
        const key = obj.Key;
        const url = s3.getSignedUrl("getObject", { ...params, Key: key });
        return { key, url };
      });
      res.json(signedUrls);
    }
  });
});

app.put("/signed-url", upload.single("image"), async (req, res) => {
  const { originalname, buffer, mimetype } = req.file;

  const params = {
    Bucket: process.env.BUCKET,
    Key: originalname,
    Body: buffer,
    ContentType: mimetype,
    ACL: "private",
  };

  try {
    await s3.upload(params).promise();
    const signedUrl = s3.getSignedUrl("putObject", {
      Bucket: process.env.BUCKET,
      Key: params.Key,
      ContentType: params.ContentType,
      Expires: 300,
    });
    console.log("Signed URL", signedUrl);
    res.status(200).json(signedUrl);
  } catch (error) {
    console.error("Error uploading image to S3:", error);
    res.status(500).send("Error uploading image to S3");
  }
});

app.listen(PORT, () => {
  console.log(`server running at port ${PORT}`);
});

