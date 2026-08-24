/**
 * OTA (OpenTravel Alliance) Interfaces for TSD XML Integration
 * These interfaces define the structure of OTA messages used in car rental APIs
 */

// Common OTA Elements
export interface OTAPosition {
  Latitude: string;
  Longitude: string;
}

export interface OTADateTime {
  DateTime: string; // ISO 8601 format: YYYY-MM-DDTHH:MM:SS
}

export interface OTALocationCode {
  LocationCode: string;
  CodeContext?: string;
}

// Vehicle Availability Request/Response
export interface OTA_VehAvailRateRQ {
  POS?: {
    Source: {
      RequestorID: {
        Type: string;
        ID: string;
        ID_Context?: string;
      };
    };
  };
  VehAvailRQCore: {
    Status: string;
    VehRentalCore: {
      PickUpDateTime: string;
      ReturnDateTime: string;
      PickUpLocation: OTALocationCode;
      ReturnLocation: OTALocationCode;
    };
    VehPrefs?: {
      VehPref?: {
        VehClass?: {
          Size?: string;
        };
        VehType?: {
          VehicleCategory?: string;
        };
      };
    };
  };
  VehAvailRQInfo?: {
    Customer?: {
      Primary?: {
        CitizenCountryName?: {
          Code: string;
        };
      };
    };
  };
}

export interface VehicleAvailability {
  VehAvailCore: {
    Status: string;
    Vehicle: {
      AirConditionInd: boolean;
      TransmissionType: string;
      FuelType: string;
      DriveType?: string;
      PassengerQuantity: string;
      BaggageQuantity: string;
      VehType: {
        VehicleCategory: string;
        DoorCount: string;
      };
      VehClass: {
        Size: string;
      };
      VehMakeModel: {
        Name: string;
        Code: string;
      };
      PictureURL: string;
    };
    RentalRate: {
      RateDistance?: {
        Unlimited: boolean;
        DistUnitName?: string;
        VehiclePeriodUnitName?: string;
        Quantity?: number;
      };
      VehicleCharges: {
        VehicleCharge: VehicleCharge[];
      };
      RateQualifier?: {
        RateCategory?: string;
        RateQualifier?: string;
        RatePeriod?: string;
      };
    };
    TotalCharge: {
      RateTotalAmount: string;
      EstimatedTotalAmount: string;
      CurrencyCode: string;
    };
    Fees?: {
      Fee: {
        Amount: string;
        CurrencyCode: string;
        Purpose: string;
        Description: string;
      }[];
    };
    Reference: {
      Type: string;
      ID: string;
    };
  };
}

export interface VehicleCharge {
  Amount: string;
  CurrencyCode: string;
  Description: string;
  IncludedInRate: boolean;
  Purpose: string;
  TaxInclusive?: boolean;
}

export interface OTA_VehAvailRateRS {
  Success?: boolean;
  Errors?: OTAError[];
  VehAvailRSCore: {
    VehRentalCore: {
      PickUpDateTime: string;
      ReturnDateTime: string;
      PickUpLocation: OTALocationCode & { LocationName: string };
      ReturnLocation: OTALocationCode & { LocationName: string };
    };
    VehVendorAvails: {
      VehVendorAvail: {
        Vendor: {
          CompanyShortName: string;
          TravelSector: string;
          Code: string;
        };
        VehAvails: {
          VehAvail: VehicleAvailability[];
        };
      };
    };
  };
}

// Vehicle Reservation Request/Response
export interface OTA_VehResRQ {
  POS: {
    Source: {
      RequestorID: {
        Type: string;
        ID: string;
      };
    };
  };
  VehResRQCore: {
    Status: string;
    VehRentalCore: {
      PickUpDateTime: string;
      ReturnDateTime: string;
      PickUpLocation: OTALocationCode;
      ReturnLocation: OTALocationCode;
    };
    Customer: {
      Primary: {
        PersonName: {
          GivenName: string;
          Surname: string;
        };
        Telephone: {
          PhoneNumber: string;
          PhoneTechType?: string;
        };
        Email: {
          EmailAddress: string;
        };
        Address?: {
          AddressLine?: string;
          CityName?: string;
          PostalCode?: string;
          CountryName?: {
            Code: string;
          };
        };
        Document?: {
          DocID: string;
          DocType: string;
          ExpireDate?: string;
        };
      };
    };
    VehPref: {
      VehMakeModel?: {
        Code: string;
      };
      Code?: string;
    };
    SpecialEquipPrefs?: {
      SpecialEquipPref: {
        EquipType: string;
        Quantity: number;
      }[];
    };
    RateQualifier?: {
      RateQualifier?: string;
      PromotionCode?: string;
    };
  };
  VehResRQInfo?: {
    ArrivalDetails?: {
      TransportationCode?: string;
      Number?: string;
    };
    RentalPaymentPref?: {
      PaymentType: string;
    };
    Comments?: {
      Comment: string;
    };
  };
}

export interface OTA_VehResRS {
  Success?: boolean;
  Errors?: OTAError[];
  VehResRSCore: {
    VehReservation: {
      VehSegmentCore: {
        ConfID: {
          Type: string;
          ID: string;
        };
        Vendor: {
          CompanyShortName: string;
          Code: string;
        };
        VehRentalCore: {
          PickUpDateTime: string;
          ReturnDateTime: string;
          PickUpLocation: OTALocationCode & { LocationName: string };
          ReturnLocation: OTALocationCode & { LocationName: string };
        };
        Vehicle: {
          AirConditionInd: boolean;
          TransmissionType: string;
          FuelType: string;
          PassengerQuantity: string;
          BaggageQuantity: string;
          VehType: {
            VehicleCategory: string;
            DoorCount: string;
          };
          VehMakeModel: {
            Name: string;
            Code: string;
          };
        };
        RentalRate: {
          VehicleCharges: {
            VehicleCharge: VehicleCharge[];
          };
        };
        TotalCharge: {
          RateTotalAmount: string;
          EstimatedTotalAmount: string;
          CurrencyCode: string;
        };
      };
      Customer: {
        Primary: {
          PersonName: {
            GivenName: string;
            Surname: string;
          };
          Telephone: {
            PhoneNumber: string;
          };
          Email: {
            EmailAddress: string;
          };
        };
      };
    };
  };
}

// Vehicle Cancel Request/Response
export interface OTA_VehCancelRQ {
  POS: {
    Source: {
      RequestorID: {
        Type: string;
        ID: string;
      };
    };
  };
  VehCancelRQCore: {
    CancelType: string;
    UniqueID: {
      Type: string;
      ID: string;
    };
    PersonName?: {
      GivenName: string;
      Surname: string;
    };
  };
  VehCancelRQInfo?: {
    CancelReason?: string;
  };
}

export interface OTA_VehCancelRS {
  Success?: boolean;
  Errors?: OTAError[];
  VehCancelRSCore: {
    CancelStatus: string;
    UniqueID: {
      Type: string;
      ID: string;
    };
    CancelRules?: {
      CancelRule: {
        Amount?: string;
        CurrencyCode?: string;
        Percent?: string;
        Description?: string;
      };
    };
  };
}

// Vehicle Modify Request/Response
export interface OTA_VehModifyRQ {
  POS: {
    Source: {
      RequestorID: {
        Type: string;
        ID: string;
      };
    };
  };
  VehModifyRQCore: {
    ModifyType: string;
    UniqueID: {
      Type: string;
      ID: string;
    };
    VehRentalCore?: {
      PickUpDateTime?: string;
      ReturnDateTime?: string;
      PickUpLocation?: OTALocationCode;
      ReturnLocation?: OTALocationCode;
    };
    VehPref?: {
      VehMakeModel?: {
        Code: string;
      };
    };
  };
}

export interface OTA_VehModifyRS {
  Success?: boolean;
  Errors?: OTAError[];
  VehModifyRSCore: {
    ModifyStatus: string;
    VehReservation: {
      VehSegmentCore: {
        ConfID: {
          Type: string;
          ID: string;
        };
        VehRentalCore: {
          PickUpDateTime: string;
          ReturnDateTime: string;
          PickUpLocation: OTALocationCode & { LocationName: string };
          ReturnLocation: OTALocationCode & { LocationName: string };
        };
        TotalCharge: {
          RateTotalAmount: string;
          EstimatedTotalAmount: string;
          CurrencyCode: string;
        };
      };
    };
  };
}

// Location Search Request/Response
export interface OTA_VehLocSearchRQ {
  POS?: {
    Source: {
      RequestorID: {
        Type: string;
        ID: string;
      };
    };
  };
  VehLocSearchCriterion: {
    Address?: {
      CityName?: string;
      CountryName?: {
        Code: string;
      };
    };
    RefPoint?: {
      Name?: string;
      RefPointType?: string;
    };
    Position?: OTAPosition;
    Radius?: {
      Distance: number;
      DistanceUnit: string;
    };
  };
}

export interface VehicleLocation {
  LocationCode: string;
  LocationName: string;
  Address: {
    AddressLine: string;
    CityName: string;
    CountryName: {
      Code: string;
    };
    Position?: OTAPosition;
  };
  Telephone: {
    PhoneNumber: string;
  };
  AdditionalInfo?: {
    OperationSchedule?: {
      OperationTime: {
        Day: string;
        Start: string;
        End: string;
      }[];
    };
    PickupInd: boolean;
    DropoffInd: boolean;
  };
}

export interface OTA_VehLocSearchRS {
  Success?: boolean;
  Errors?: OTAError[];
  VehMatchedLocs: {
    VehMatchedLoc: VehicleLocation[];
  };
}

// Error Interface
export interface OTAError {
  Type: string;
  Code: string;
  ShortText: string;
  Message?: string;
}

