

export const transformCityArray = (data)=>{
  if(!Array.isArray(data)) return [];
  return data?.map(({id , name })=> ({value : id , label : name}));
}

export const filteredPickUpLocationArray =   (data, id) => {
  if(!Array.isArray(data) || typeof id !== "number") return [];
  return   data.filter((item)=>item.city_id === id)
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}
export const transformedPickupLocationArray = (data) => {
  if (!Array.isArray(data)) return [];

  const options = [];
  const virtual_locations = {
    'label': 'Free Delivery & Collection Points',
    options: []
  };

  data?.forEach(({ id, name, ...rest }) => {
    const location = {
      value: id,
      label: name,
      ...rest
    }

    if (!location.is_virtual) {
      options.push(location);
    } else {
      virtual_locations.options.push(location);
    }
  })

  if (virtual_locations.options.length > 0) {
    options.push(virtual_locations);
  }
  
  return options;
}

// export const syncCitiesDropdowns = (changedDropdown, value) => {
//   if (changedDropdown === "dropdown1") {
//     setDropdown2(value); // Sync dropdown 2 with dropdown 1
//   } else {
//     setDropdown1(value); // Sync dropdown 1 with dropdown 2
//   }
// };