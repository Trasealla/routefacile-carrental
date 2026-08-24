// import React from "react";
// import { Col } from "reactstrap";
// import "../../styles/services-list.css";
// import servicesData from "../../assets/data/serviceData";
// import { Figure, Row } from "react-bootstrap";
// import img from "../../assets/all-images/service-images/Group-img.png";
// import slideImg1 from "../../assets/all-images/service-images/Link1.png";
// import slideImg2 from "../../assets/all-images/service-images/Link2.png";
// import slideImg3 from "../../assets/all-images/service-images/Link3.png";
// import Slider from "react-slick";

// const ServicesList = () => {
//   const settings = {
//     dots: false,
//     infinite: true,
//     slidesToShow: 4,
//     slidesToScroll: 1,
//     autoplay: true,
//     speed: 2000,
//     autoplaySpeed: 1000,
//     cssEase: "linear",
//   };
//   return (
//     <div className="service__section">
//       <div className="mx-4">
//         <Row>
//           <Col lg={6} sm={12}>
//             <Figure>
//               <Figure.Image width={650} height={180} alt="171x180" src={img} />
//             </Figure>
//           </Col>

//           <Col lg={6} sm={12}>
//             <h1 className="text-center service_heading">Our Services</h1>
//             {servicesData.map((_, index) => {
//               return (
//                 <>
//                   <div className="py-1 d-flex gap-4 justify-content-center">
//                     <div className="servicelist_icon">
//                       <img src={_.icon} alt="" />
//                     </div>
//                     <div className="servicelist_typo">
//                       <h3>{_.title}</h3>
//                       <p>{_.desc}</p>
//                     </div>
//                   </div>
//                 </>
//               );
//             })}
//           </Col>
//         </Row>
//       </div>
//       <Slider className="service_slider" {...settings}>
//         <div>
//           <Figure>
//             <Figure.Image
//               width={100}
//               height={180}
//               alt="171x180"
//               src={slideImg1}
//             />
//           </Figure>
//         </div>
//         <div>
//           <Figure>
//             <Figure.Image
//               width={100}
//               height={180}
//               alt="171x180"
//               src={slideImg2}
//             />
//           </Figure>
//         </div>
//         <div>
//           <Figure>
//             <Figure.Image
//               width={100}
//               height={180}
//               alt="171x180"
//               src={slideImg3}
//             />
//           </Figure>
//         </div>
//         <div>
//           <Figure>
//             <Figure.Image
//               width={100}
//               height={180}
//               alt="171x180"
//               src={slideImg1}
//             />
//           </Figure>
//         </div>
//         <div>
//           <Figure>
//             <Figure.Image
//               width={100}
//               height={180}
//               alt="171x180"
//               src={slideImg2}
//             />
//           </Figure>
//         </div>
//         <div>
//           <Figure>
//             <Figure.Image
//               width={100}
//               height={180}
//               alt="171x180"
//               src={slideImg3}
//             />
//           </Figure>
//         </div>
//       </Slider>
//     </div>
//   );
// };
// export default ServicesList;

import React from "react";
import { Col } from "reactstrap";
import "../../styles/services-list.css";
import servicesData from "../../assets/data/serviceData";
import { Figure, Row } from "react-bootstrap";
import img from "../../assets/all-images/service-images/Group-img.png";
import slideImg1 from "../../assets/all-images/service-images/Link1.png";
import slideImg2 from "../../assets/all-images/service-images/Link2.png";
import slideImg3 from "../../assets/all-images/service-images/Link3.png";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const ServicesList = (props) => {
  const {carBrandArray} = props;
  const path = carBrandArray?.path;
  const carBrands = carBrandArray?.response?.data;


  const settings = {
    dots: false,
    infinite: true,
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: true,
    speed: 2000,
    autoplaySpeed: 1000,
    cssEase: "linear",
  };

 
  return (
    <div className="service__section------">
     
        
      <Slider className="service_slider" {...settings}>
       {
carBrandArray?.map((brand)=>(
<div key={brand.id}>
<Figure>
  <Figure.Image 
  width={100}
  height={180}
alt={brand.name}
src={brand.image}
  />
</Figure>
</div>
))

       }
       
       
        {/* <div>
          <Figure>
            <Figure.Image
              width={100}
              height={180}
              alt="171x180"
              src={slideImg1}
            />
          </Figure>
        </div>
        <div>
          <Figure>
            <Figure.Image
              width={100}
              height={180}
              alt="171x180"
              src={slideImg2}
            />
          </Figure>
        </div>
        <div>
          <Figure>
            <Figure.Image
              width={100}
              height={180}
              alt="171x180"
              src={slideImg3}
            />
          </Figure>
        </div>
        <div>
          <Figure>
            <Figure.Image
              width={100}
              height={180}
              alt="171x180"
              src={slideImg1}
            />
          </Figure>
        </div>
        <div>
          <Figure>
            <Figure.Image
              width={100}
              height={180}
              alt="171x180"
              src={slideImg2}
            />
          </Figure>
        </div>
        <div>
          <Figure>
            <Figure.Image
              width={100}
              height={180}
              alt="171x180"
              src={slideImg3}
            />
          </Figure>
        </div> */}
      </Slider>
    
   
    </div>
  );
};
export default ServicesList;



