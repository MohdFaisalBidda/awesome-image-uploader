import "semantic-ui-css/semantic.min.css";
import React, { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";
import {
  Icon,
  Image,
  Segment,
  Header,
} from "semantic-ui-react";
import { ImSpinner9 } from "react-icons/im";

function App() {
  const [images, setImages] = useState([]);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [labelText, setLabelText] = useState(
    "Click or drag & drop your file here"
  );

  const handleDragEnter = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleUpload(file);
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    // console.log(e.target.files[0]);
    setLabelText(`Selected file: ${e.target.files[0].name}`);
  };

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append("image", file);
    try {
      setUploadProgress(0);

      const interval = setInterval(() => {
        setUploadProgress((prevProgress) => Math.min(prevProgress + 10, 100));
      }, 500);

      const res = await axios.put(
        "http://localhost:3001/signed-url",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      clearInterval(interval);
      setUploadProgress(100);
      console.log("Image Uploaded successfully", res.data);
      setImages(prevImages => [...prevImages, { url: res.data.imageUrl }]);
      setFile(null);
    } catch (error) {
      console.log("Error uploading image:", error);
    }
  };

  useEffect(() => {
    const getImages = async () => {
      try {
        setLoading(true);
        const res = await axios.get("http://localhost:3001/images");
        setImages(res.data);
        setLoading(false);
        console.log(res.data);
      } catch (error) {
        console.log(error);
      }
    };
    getImages();
  }, [file]);

  return (
    <div className="">
      <div className="p-8 bg-yellow-50 rounded-b-lg">
        <Header as="h1">Awesome Image Uploader</Header>
      </div>
      <div className={`w-11/12 mx-auto bg-yellow-500 my-10 rounded-xl`}>
        <Segment
          basic
          textAlign="center"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          className="mx-auto "
        >
          <label htmlFor="file-upload">
            <Icon name="upload" size="huge" />
            <p className="text-lg my-4 font-bold">{labelText}</p>
          </label>
          <input
            type="file"
            id="file-upload"
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
        </Segment>
        <div className="text-center py-4">
          <button
            disabled={!file}
            className="p-5 px-10 text-lg font-bold bg-black text-white rounded-xl disabled:bg-gray-500 disabled:cursor-not-allowed"
            onClick={handleUpload}
          >
            Upload
          </button>
        </div>
        {uploadProgress > 0 && (
          <div className="mx-10 py-5">
            <div
              className={`py-2 bg-green-500 rounded-full text-2xl text-white text-center w-[${uploadProgress}%]`}
            >
              {uploadProgress}%
            </div>
          </div>
        )}
      </div>
      <div className="grid grid-cols-1 gap-y-20 lg:grid-cols-2 w-full px-20 mt-20">
        {images.map((item, index) => (
          <div key={index} className="w-full items-center justify-center flex">
            {!loading ? (
              <Image src={item.url} className="w-full" />
            ) : (
              <div className="flex justify-center">
                <ImSpinner9 className="w-10 h-10 animate-spin" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
