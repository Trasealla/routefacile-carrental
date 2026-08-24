import React from 'react';
import './enquireNow.css';
import { Link } from 'react-router-dom';

const EnquireNowButton = ({buttonText, link}) => {
  return (
    <Link to={link} >
 <button className='enquire-now-button'>
 {buttonText}
 </button>
 </Link>
  )
}

export default EnquireNowButton