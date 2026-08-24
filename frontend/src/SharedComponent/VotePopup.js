import React, { useState, useEffect, useRef } from "react";
import "./votePopup.css"

const VotePopup = ({ imageUrl, link }) => {
  const [isVisible, setIsVisible] = useState(false);
  const popupVoteRef = useRef(null);
  useEffect(() => {
    const hasSeenPopup = sessionStorage.getItem("votePopupSeen");
    if (!hasSeenPopup) {
      setIsVisible(true);
    }
    const handleClickOutside = (event) => {
      if (popupVoteRef.current && !popupVoteRef.current.contains(event.target)) {
        handleClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleClose = () => {
    sessionStorage.setItem("votePopupSeen", "true"); 
    setIsVisible(false);
  };

  if (!isVisible) return null; // Don't render if not visible


 
  
  return (
    <div className="popup-container">
      <div className="popup" ref={popupVoteRef}>
        <span className="close-btn-popup" onClick={handleClose}>
          &times;
        </span>
        <a href={link} target="_blank" rel="noopener noreferrer" >
        <img src={imageUrl} alt="Vote for Us" className="popup-image" />
        </a>
        {/* <div className="popup-actions">
        <button className="not-now-btn" onClick={handleClose}>
            Not Now
          </button>
          <a href={link} target="_blank" rel="noopener noreferrer" className="vote-btn" onClick={handleClose}>
            Vote Us
          </a>
        
        </div> */}
      </div>
    </div>
  );
};

export default VotePopup;
