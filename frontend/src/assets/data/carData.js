// import all images from assets/images directory
import img01 from "../all-images/cars-img/nissan-offer.png";
import img02 from "../all-images/cars-img/offer-toyota.png";
import img03 from "../all-images/cars-img/bmw-offer.png";
import img04 from "../all-images/cars-img/nissan-offer.png";
import icon01 from "../all-images/car-parts/car-parts-01.svg.svg";
import icon02 from "../all-images/car-parts/car-parts-06.svg.svg";
import icon03 from "../all-images/car-parts/car-parts-03.svg.svg";
import icon04 from "../all-images/car-parts/snow-outline.svg";
import icon05 from "../all-images/car-parts/car-door.svg";
import icon06 from "../all-images/car-parts/Group.svg";
import dailyRentals from '../../assets/all-images/offerImages/dailyRentals.webp';
import monthlyRentals from '../../assets/all-images/offerImages/monthlyRentals.webp';
import longtermRentals from '../../assets/all-images/offerImages/longtermRentals (1).webp';
import specialOffers from '../../assets/all-images/offerImages/specialOffers.webp';



export const offerData = [
  {
    id : 1,
    image : longtermRentals,
    description : 'LONG TERM RENTALS AND LEASING'
  },
  {
    id : 2,
    image : dailyRentals,
    description : 'DAILY RENTALS' 
  },
  {
    id : 3,
    image : monthlyRentals,
    description : 'MONTHLY RENTALS' 
  },
  {
    id : 4,
    image : specialOffers,
    description : 'SPECIAL OFFERS' 
  },
]

  const carData = [
  {
    id: 1,
    brand: "Tesla",
    rating: 112,
    carName: "Tesla Malibu",
    imgUrl: img01,
    icon1: icon01,
    icon2: icon02,
    icon3: icon03,
    icon4: icon04,
    icon05: icon05,
    icon06: icon06,
    model: "Model 3",
    price: 50,
    speed: "20kmpl",
    gps: "GPS Navigation",
    seatType: "Heated seats",
    automatic: "A",
    seater: "5",
    pertol: "p",
    AC: "A",
    description:
      " Dolor labore lorem no accusam sit justo sadipscing labore invidunt voluptua, amet duo et gubergren vero gubergren dolor. At diam. Dolor labore lorem no accusam sit justo sadipscing labore invidunt voluptua, amet duo et gubergren vero gubergren dolor. At diam.",
  },

  {
    id: 2,
    brand: "Toyota",
    rating: 102,
    carName: "Toyota Aventador",
    imgUrl: img02,
    model: "Model-2022",
    price: 50,
    speed: "20kmpl",
    gps: "GPS Navigation",
    seatType: "Heated seats",
    icon1: icon01,
    icon2: icon02,
    icon3: icon03,
    icon4: icon04,
    icon05: icon05,
    automatic: "A",
    seater: "5",
    pertol: "p",
    AC: "A",

    description:
      " Dolor labore lorem no accusam sit justo sadipscing labore invidunt voluptua, amet duo et gubergren vero gubergren dolor. At diam. Dolor labore lorem no accusam sit justo sadipscing labore invidunt voluptua, amet duo et gubergren vero gubergren dolor. At diam.",
  },

  {
    id: 3,
    brand: "BMW",
    rating: 132,
    carName: "BMW X3",
    imgUrl: img03,
    model: "Model-2022",
    price: 65,
    speed: "20kmpl",
    gps: "GPS Navigation",
    seatType: "Heated seats",
    icon1: icon01,
    icon2: icon02,
    icon3: icon03,
    icon4: icon04,
    icon05: icon05,
    automatic: "A",
    seater: "5",
    pertol: "p",
    AC: "A",
    description:
      " Dolor labore lorem no accusam sit justo sadipscing labore invidunt voluptua, amet duo et gubergren vero gubergren dolor. At diam. Dolor labore lorem no accusam sit justo sadipscing labore invidunt voluptua, amet duo et gubergren vero gubergren dolor. At diam.",
  },

  {
    id: 4,
    brand: "Nissan",
    rating: 102,
    carName: "Nissan Mercielago",
    imgUrl: img04,
    model: "Model-2022",
    price: 70,
    speed: "20kmpl",
    gps: "GPS Navigation",
    seatType: "Heated seats",
    icon1: icon01,
    icon2: icon02,
    icon3: icon03,
    icon4: icon04,
    icon05: icon05,
    automatic: "A",
    seater: "5",
    pertol: "p",
    AC: "A",
    description:
      " Dolor labore lorem no accusam sit justo sadipscing labore invidunt voluptua, amet duo et gubergren vero gubergren dolor. At diam. Dolor labore lorem no accusam sit justo sadipscing labore invidunt voluptua, amet duo et gubergren vero gubergren dolor. At diam.",
  },
];

export default offerData;
export {carData};
