import React, { useState } from "react";
import "./ImageGallary.css";

const ImageGallery = ({ images }) => {
  const [selectedImage, setSelectedImage] = useState(images[0]);

  const handleThumbnailClick = (image) => {
    setSelectedImage(image);
  };

  return (
    <div className="image-gallery">
      <div className="main-image rf-car-stage">
        <img src={selectedImage} alt="Selected" />
      </div>
      <div className="thumbnail-images">
        {images.map((image, index) => (
          <img
            key={index}
            src={image}
            alt={`Thumbnail ${index}`}
            onClick={() => handleThumbnailClick(image)}
            className={image === selectedImage ? "active" : ""}
          />
        ))}
      </div>
    </div>
  );
};

export default ImageGallery;
