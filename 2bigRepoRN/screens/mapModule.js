import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import React, { useRef, useLayoutEffect } from "react";
import { useState, useEffect } from "react";
import * as Location from "expo-location";
import { useNavigation } from "@react-navigation/native";
import { FontAwesome } from "@expo/vector-icons";
import { GOOGLE_API_KEY } from "../APIKEY";
import Geocoder from "react-native-geocoding";
import MapView, {
  Marker,
  PROVIDER_GOOGLE,
  Callout,
  Polyline,
  Polygon,
} from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";
import { db } from "../firebaseConfig";
import { ref, onValue, child, update } from "firebase/database";
import { useRoute } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { GOOGLE_API_KEY_GEOLOCATION } from "../APIKEY";
//export const mapRef=React.createRef();
export default function MapModule({}) {
  useEffect(() => {
    Geocoder.init(GOOGLE_API_KEY_GEOLOCATION);
  }, []);
  const [storeInformation, setstoreInformation] = useState([]);
  const navigation = useNavigation();
  const route = useRoute();
  const driverLatLong = route.params?.driverLatLong;
  const displayPolyline = route.params?.displayPolyline;
  //console.log("line 26",displayPolyline);

  const [selectedPlace, setSelectedPlace] = useState(null);
  const { width, height } = Dimensions.get("window");
  const aspect_ratio = width / height;
  const LATTITUDE_DELTA = 0.005;
  const LONGITUDE_DELTA = LATTITUDE_DELTA * aspect_ratio;

  //hook to get the  admin information from database
  function isStoreWithinCebuCityBounds(lat, long) {
    const cebuCityBounds = {
      south: 10.259524,
      north: 10.372442,
      west: 123.775514,
      east: 123.977813,
    };

    if (
      lat >= cebuCityBounds.south &&
      lat <= cebuCityBounds.north &&
      long >= cebuCityBounds.west &&
      long <= cebuCityBounds.east
    ) {
      return true;
    } else {
      return false;
    }
  }

  //original codes
  // useLayoutEffect(() => {
  //   const starCountRef = ref(db, "ADMIN/");
  //   onValue(starCountRef, (snapshot) => {
  //     // const storePic=snapshot.val();
  //     const data = snapshot.val();
  //     //  console.log("to pass data test",data);
  //     AsyncStorage.setItem("AdminData", JSON.stringify(data)); //pass data of ADMIN to "AdminData" so that other screen can access it globally
  //     const newStoreInfo = Object.keys(data).map((key) => ({
  //       id: key,
  //       StoreImage: data[key].StoreImage,
  //       ...data[key],
  //     }));

  //     // console.log('MAP SCREEN- DATA FROM ADMIN COLLECTION RECEIVED',newStoreInfo); //test if successfully fetch the datas in STOREINFORMATION

  //     setstoreInformation(newStoreInfo);
  //   });
  // }, []);

  //new codes that filtered those station nga wala sa cebu city
  useLayoutEffect(() => {
    const starCountRef = ref(db, "ADMIN/"); //ref of the database
    console.log("Test", starCountRef);
    if (starCountRef === null) {
      console.log("No admin data available yet");
    } else {
      onValue(starCountRef, (snapshot) => {
        const data = snapshot.val();
        if (data && Object.keys(data).length > 0) {
          const newStoreInfo = Object.keys(data)
            .map((key) => ({
              id: key,
              StoreImage: data[key].StoreImage,
              ...data[key],
            }))
            .filter((store) =>
              isStoreWithinCebuCityBounds(
                store && store?.RefillingStation?.addLattitude,
                store && store?.RefillingStation?.addLongitude
              )
            );
          // console.log("line 102",newStoreInfo)

          AsyncStorage.setItem("AdminData", JSON.stringify(newStoreInfo)); //pass data of ADMIN to "AdminData" so that other screen can access it globally
          setstoreInformation(newStoreInfo);
        }
      });
    }
  }, []);

  const [title, setTitle] = useState();

  const [location, setLocation] = useState();
  const [markerPosition, setMarkerPosition] = useState(null);
  //console.log("marker position",markerPosition);
  const mapRef = useRef(null);

  const [prevLocation, setPrevLocation] = useState(null);
  //console.log("line 52",location.coords.latitude);
  const [errorMsg, setErrorMsg] = useState(null);
  const [selectedStore, setSelectedStore] = useState(null);
  //console.log("line 67",selectedStore);
  const [polylineCoords, setPolylineCoords] = useState([]);
  const [polylineCoordsStoreToCustomer, setpolylineCoordsStoreToCustomer] =
    useState([]);
  const [origin, setOrigin] = useState();
  const [destination, setDestination] = useState();

  //get the location of customer and driver
  useEffect(() => {
    if (displayPolyline && driverLatLong) {
      const polyLineCoords = [
        {
          latitude: location?.coords.latitude || 0,
          longitude: location?.coords.longitude || 0,
        },
        {
          latitude: driverLatLong?.driverLatt || null,
          longitude: driverLatLong?.driverLong || null,
        },
      ];
      //console.log("inside this 67",polyLineCoords);
      setPolylineCoords(polyLineCoords);
    }
  }, [location, driverLatLong, displayPolyline]);

  // useLayoutEffect(() => {
  //   if (displayPolyline) {
  //     const polyLineCoords = [
  //       {
  //         latitude: location?.coords?.latitude || 0,
  //         longitude: location?.coords?.longitude || 0,
  //       },
  //       {
  //         latitude: driverLatLong?.driverLatt || 0,
  //         longitude: driverLatLong?.driverLong || 0,
  //       },
  //     ];
  //     setPolylineCoords(polyLineCoords);
  //   }
  // }, [location, driverLatLong, displayPolyline]);

  //get user's location
  // useEffect(() => {
  //   let subscription;
  //   let interval;
  //   let isMounted = true;
  //   const getLocation = async () => {
  //     let { status } = await Location.requestForegroundPermissionsAsync();
  //     if (status !== "granted") {
  //       setErrorMsg("Permission to access location was denied");
  //       return;
  //     }
  //     subscription = await Location.watchPositionAsync(
  //       { accuracy: Location.Accuracy.Balanced, timeInterval: 5000 },
  //       (location) => {
  //         if (isMounted) {

  //           setLocation(location);
  //           // setMarkerPosition({
  //           //   latitude: location.coords.latitude,
  //           //   longitude: location.coords.longitude,
  //           // });
  //         }
  //         //console.log("My current location",location);
  //       }
  //     );
  //   };

  //   // interval  = setInterval(()=>{
  //   //   if(isMounted && location){
  //   //     setMarkerPosition({
  //   //       latitude: location.coords.latitude,
  //   //       longitude: location.coords.longitude,
  //   //     });
  //   //   }
  //   // },2000);
  //   getLocation();
  //   return () => {
  //     isMounted = false;
  //     if (subscription) {
  //       subscription.remove();
  //     }
  //    // clearInterval(interval);
  //   };

  // }, [location]);

  //old codes
  useEffect(() => {
    let interval;
    let isMounted = true;
    const getLocation = async () => {
      let { status } = await Location.requestBackgroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        return;
      }
      let location = await Location.getCurrentPositionAsync({});
      if (isMounted) {
        console.log("User current location", location);

        setLocation(location);
        setMarkerPosition({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });

        //reverse the latlong
        Geocoder.from(location.coords.latitude, location.coords.longitude)
          .then((json) => {
            let address = json.results[5].formatted_address;
            let types = json.results[3].address_components;
           // console.log("address", json);
          //  console.log("types", types);
            let streetNameComponent = types.find((component) =>
              component.types.includes("route")
            );

            let streetName = streetNameComponent
              ? streetNameComponent.short_name
              : "";


            // Modify the address string to include the street name
            address = address.replace("Cebu City", streetName + " Cebu City");
            console.log("Modified address:", address);
            setTitle(address);
          })
          .catch((error) => console.warn(error));
      }

      // let loc=await Location.watchPositionAsync(location);
      //  console.log("line 125",location)
    };
    getLocation();
    // interval = setInterval(async () => {
    //   let location = await Location.getCurrentPositionAsync({});
    //   if (
    //     isMounted &&
    //     JSON.stringify(location.coords) !== JSON.stringify(prevLocation?.coords)
    //   ) {
    //     console.log(
    //       "Line 135----->Latitude:",
    //       location.coords.latitude,
    //       "Longitude:",
    //       location.coords.longitude
    //     );
    //   }
    //   setPrevLocation(location);
    // }, 3000);
    // return () => {
    //   isMounted = false;
    //   clearInterval(interval);
    // };
  }, [prevLocation]);

  const handleMarkerPress = (place) => {
    setSelectedPlace(place);
  };

  const handleStoreMarkerPress = (item, location) => {
    // console.log("line 147", location);
    //addLongitude
    const polylineCoordinates = [
      {
        latitude: location?.coords.latitude || 0,
        longitude: location?.coords.longitude || 0,
      },
      {
        latitude: item?.RefillingStation.addLattitude || 0,
        longitude: item?.RefillingStation.addLongitude || 0,
      },
    ];
    if (location && location.coords) {
      polylineCoordinates.push({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    }
    setpolylineCoordsStoreToCustomer(polylineCoordinates);
    setSelectedStore(item);
  };
  //get customer data
  const [customerData, setCustomerData] = useState();
  const customerID = customerData?.cusId;

  //get the data of the customer from asyncStorage  from login screen
  const fetchCustomerData = async () => {
    try {
      const data = await AsyncStorage.getItem("customerData");
      if (data !== null) {
        const customerData = JSON.parse(data);
        setCustomerData(customerData); //call the state function
      }
    } catch (error) {
      console.log(error);
      alert("Error fetching data: ", error);
    }
  };

  useEffect(() => {
    fetchCustomerData();
  }, []);

  //update customer COllection with latlong
  useEffect(() => {
    if (!customerID || !location || !location.coords || !title) {
      return;
    }
    const customerRef = ref(db, "CUSTOMER/");
    const cusRef = child(customerRef, customerID.toString());
    update(cusRef, {
      lattitudeLocation: location.coords.latitude,
      longitudeLocation: location.coords.longitude,
      address: title,
    })
      .then(() => {
        //console.log("Customer Collection--> Latlong-->Update Success");
      })
      .catch((error) => {
        console.log("Error updating", error);
      });
  }, [customerID, location, title]);

  const CustomCallout = ({ title }) => {
    return (
      <View style={styles.calloutContainer}>
        <Text style={styles.calloutTitle}>{title}</Text>
      </View>
    );
  };
  return (
    <View style={styles.container}>
      {location && (
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          mapType="hybrid"
          style={styles.map}
          initialRegion={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            //latitudeDelta: LATTITUDE_DELTA,

            //longitudeDelta: LONGITUDE_DELTA,
            latitudeDelta: 0.00922,
            longitudeDelta: 0.00421,
          }}
          minZoomLevel={10}
          showsUserLocation={true}
          
          showsMyLocationButton={true}
          showsBuildings={true}

          zoomEnabled={true}
          showsTraffic={false}
          

          showsCompass={true}
          showsIndoors={true}
          loadingEnabled={true}
          loadingIndicatorColor={"gray"}
          userInterfaceStyle={"dark"}
          userLocationPriority={"balanced"}
          showsIndoorLevelPicker={true}
          toolbarEnabled={true}
          tracksViewChanges={true}
        >
          <Marker
            calloutVisible={true}
            callout={{
              tooltip: true,
              stopPropagation: true,
            }}
            // coordinate={{
            //   latitude: location.coords.latitude,
            //   longitude: location.coords.longitude,
            // }}
            coordinate={markerPosition}
            showCallout={true}
            title={title}
          >
            {/* <CustomCallout title={title} /> */}
          </Marker>

          {/* {storeInformation.map((item) => (
          
            <Marker
              key={item.id}
              coordinate={{
                latitude: item.RefillingStation.addLattitude ?? null,
                longitude: item.RefillingStation.addLongitude ?? null,
              }}
              description="Test1"
              pinColor={"#87cefa"}
              onPress={() => handleStoreMarkerPress(item, location)}
              title={item.RefillingStation.stationName}
              calloutVisible={true}
              callout={{
                tooltip: true,
                stopPropagation: true,
              }}
              zIndex={999}
              showCallout={true}
            >
              <Callout
                tooltip={true}
                onPress={() => {
                  console.log("passing from mapscreen", item);
                  navigation.navigate("toMapsProductScreen", { item });
                }}
              >
                <View style={styles.callout}>
                  <Text style={styles.calloutText}>
                    {item.RefillingStation.stationName}
                  </Text>
                  <Text style={{ fontSize: 14, fontWeight: "none" }}>
                    {item.RefillingStation.status}
                  </Text>
                </View>
              </Callout>

             
            </Marker>
          ))} */}

          {/* map the store information every admin */}
          {storeInformation.map((item) => {
            const idnum = item.idno;
            const lat = item.RefillingStation.addLattitude ?? null;
            const long = item.RefillingStation.addLongitude ?? null;

            //console.log("Marker within bounds:",idnum, lat, long); // add this
            return (
              <Marker
                key={item.id}
                coordinate={{
                  latitude: lat,
                  longitude: long,
                }}
                description="Test1"
                pinColor={"#87cefa"}
                onPress={() => handleStoreMarkerPress(item, location)}
                title={item.RefillingStation.stationName}
                calloutVisible={true}
                callout={{
                  tooltip: true,
                  stopPropagation: true,
                }}
                zIndex={999}
                showCallout={true}
              >
                <Callout
                  tooltip={true}
                  onPress={() => {
                    console.log("passing from mapscreen", item);
                    navigation.navigate("toMapsProductScreen", { item });
                  }}
                >
                  <View style={styles.callout}>
                    <Text style={styles.calloutText}>
                      {item.RefillingStation.stationName}
                    </Text>
                    <Text style={{ fontSize: 14, fontWeight: "none" }}>
                      {item.RefillingStation.status}
                    </Text>
                  </View>
                </Callout>

                {/* <MaterialCommunityIcons name="storefront" size={24} color="black" /> */}
              </Marker>
            );
          })}

          {polylineCoords.length > 0 && (
            <MapViewDirections
              origin={polylineCoords[0]}
              destination={polylineCoords[1]}
              strokeWidth={3}
              strokeColor="#87cefa"
              apikey={GOOGLE_API_KEY}
            />
          )}
          {/* {polylineCoordsStoreToCustomer && (
            <MapViewDirections
              // origin={{
              //   latitude: location?.coords.latitude || 0,
              //   longitude: location?.coords.longitude || 0,
              // }}
              // destination={{
              //   latitude: polylineCoordsStoreToCustomer?.RefillingStation.addLattitude || 0,
              //   longitude: polylineCoordsStoreToCustomer?.RefillingStation.addLongitude || 0,
              // }}
              origin={polylineCoordsStoreToCustomer[0]}
              destination={polylineCoordsStoreToCustomer[polylineCoordsStoreToCustomer.length - 1]}
              strokeWidth={3}
              waypoints={polylineCoordsStoreToCustomer.slice(2, -1)}
              strokeColor="red"
              apikey={GOOGLE_API_KEY}
            />
          )} */}
          {/* {polylineCoordsStoreToCustomer &&
            polylineCoordsStoreToCustomer.length >= 2 && (
              <MapViewDirections
                origin={polylineCoordsStoreToCustomer[0]}
                destination={polylineCoordsStoreToCustomer[1]}
                waypoints={polylineCoordsStoreToCustomer.slice(
                  1,
                  polylineCoordsStoreToCustomer.length - 1
                )}
                strokeWidth={3}
                strokeColor="red"
                apikey={GOOGLE_API_KEY}
              />
            )} */}

          {/* view the polyline/ route of the driver on going to customer location */}
          {driverLatLong && (
            <Marker
              coordinate={{
                latitude: driverLatLong.driverLatt,
                longitude: driverLatLong.driverLong,
              }}
              title="Driver Location"
              description="Driver is here"

              // image={}
            >
              <FontAwesome name="motorcycle" size={21} color="yellow" />
            </Marker>
          )}

          {/* {driverLatLong?.driverLatt && driverLatLong?.driverLong && (
  <Marker
    coordinate={{
      latitude: driverLatLong.driverLatt,
      longitude: driverLatLong.driverLong,
    }}
    title="Driver Location"
    description="Driver is here"
  >
    <FontAwesome name="motorcycle" size={21} color="yellow" />
  </Marker>
)} */}
        </MapView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  calloutContainer: {
    backgroundColor: "white",
    padding: 10,
    borderRadius: 5,
  },
  calloutTitle: {
    fontWeight: "bold",
  },
  markerTitleContainer: {
    position: "absolute",
    top: -30,
    left: -100,
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderColor: "#ccc",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,

    elevation: 5,
  },
  markerTitle: {
    fontWeight: "bold",
    fontSize: 14,
  },

  markerContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "blue",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  markerImage: {
    width: 20,
    height: 20,
    marginRight: 5,
    backgroundColor: "red",
  },
  markerText: {
    fontWeight: "bold",
    color: "#000",
  },

  Text: {
    borderStartColor: "red",
    justifyContent: "center",
    alignItems: "center",
  },
  map: {
    width: "100%",
    height: "100%",
    //flex:1
    //...StyleSheet.absoluteFillObject,
  },
  callout: {
    backgroundColor: "lightblue",
    borderRadius: 6,
    padding: 5,
    marginBottom: 5,
    borderColor: "transparent",
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  calloutText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "black",
  },

  container: {
    flex: 1,
  },
});
