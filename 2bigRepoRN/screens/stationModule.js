import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Image,
  StatusBar,
} from "react-native";
import { db } from "../firebaseConfig";
import React, { useEffect, useState, useContext, useLayoutEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as geolib from "geolib";
import { FontAwesome } from "@expo/vector-icons";
import { query, ref, onValue } from "firebase/database";
export default function StationModule() {
  //create a variable for
  const [adminInfo, setadminInfo] = useState({});
  //  console.log("STATION SCREEN--ADMIN INFORMATION--",adminInfo);

  const locations = Object.values(adminInfo).map((admin) => ({
    idno: admin.idno,
    latitude: admin.RefillingStation?.addLattitude,
    longitude: admin.RefillingStation?.addLongitude,
  }));

  // console.log("Locations:", locations);

  //get the get data of customerData from account profile
  const [customerData, setCustomerData] = useState({});

  const [locationsDistance, setLocationDistances] = useState({});

  const customerLatt = customerData.lattitudeLocation;
  const customerLong = customerData.longitudeLocation;

  //call fetchAdminData function
  //this asyncStorage is came from MAP Screen
  const fetchAdminData = async () => {
    try {
      const data = await AsyncStorage.getItem("AdminData");
      if (data !== null) {
        setadminInfo(JSON.parse(data));
        // console.log("set admin info data-->",  data);
      }
    } catch (error) {
      console.log(error);
      alert("Error fetching data: ", error);
    }
  };

  //function to calculate the distance between user and store locations
  const calculateDistance = () => {
    const updatedDynamicLocation = []; //create an empty array
    locations.forEach((location) => {
      let dynamicDistance = geolib.getDistance(
        //get the API to calculate the distance
        { latitude: customerLatt, longitude: customerLong },
        { latitude: location.latitude, longitude: location.longitude }
      );

      const updatedLocation = {
        idno: location.idno,
        distance: dynamicDistance / 1000,
      };
      updatedDynamicLocation.push(updatedLocation);
      // console.log(
      //   `Idno Numbers: ${location.idno} ${dynamicDistance / 1000} km`
      // );
    });
    return updatedDynamicLocation;
  };

  // call fetchCustomerData function when the StationScreen is mounted
  //data is came from login screen
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

  useLayoutEffect(() => {
    fetchAdminData();
  }, []);

  useLayoutEffect(() => {
    fetchCustomerData();
  }, []);

  useEffect(() => {
    const estimatedDistances = calculateDistance();
    const updatedLocationsDistance = {}; //This line initializes an empty object called updatedLocationsDistance that will be used to store the distances between the customer's location and other locations.

    {
      /*This line loops through the estimatedDistances array and assigns the distance between each location and the customer's location to the corresponding key-value pair in the updatedLocationsDistance object.  */
    }
    estimatedDistances.forEach((location) => {
      updatedLocationsDistance[location.idno] = location.distance;
    });
    setLocationDistances(updatedLocationsDistance); //This line calls the setLocationDistances function to update the state of locationDistances with the updatedLocationsDistance object. This will cause React to re-render the component and display the updated locationDistances state.
  }, [customerData]);

  const styleTypes = ["default", "dark-content", "light-content"];
  const [visibleStatusBar, setvisibleStatusbar] = useState(false);
  const [styleStatusBar, setstyleStatusBar] = useState(styleTypes[0]);

  const navigation = useNavigation();
  //fetch the STORE REVIEW

  return (
    <View style={styles.container}>
      <FlatList
        data={adminInfo ? Object.values(adminInfo) : []}
        keyExtractor={(item) => item.idno}
        renderItem={({ item }) => {
          return (
            <View style={styles.container} key={item.idno}>
              <View style={styles.storeWrapper} key={item.idno}>
                <TouchableOpacity
                  key={item.idno}
                  activeOpacity={0.5}
                  onPress={() => {
                    // console.log(
                    //   "Station Screen--Sending Data ----" + JSON.stringify(item)
                    // );

                    navigation.navigate("toProductScreen", { item });
                  }}
                  disabled={
                    item.Subscribed_Package &&
                    item.Subscribed_Package.length > 0 &&
                    item.Subscribed_Package[0].packageName === "Package A" &&
                    ((item.Subscribed_Package[0].orderLimit = 0), true)
                  }
                >
                  <View style={styles.item} key={item.idno}>
                    <View style={styles.itemLeft}>
                      <View style={styles.square}>
                        <Image
                          source={require("../assets/storeNoBG.png")}
                          style={styles.storePhotoStyle}
                        />
                      </View>
                      <View>
                        <Text style={styles.storeNameStyles}>
                          {item.RefillingStation.stationName}
                        </Text>

                        <Text style={styles.storeStatusStyles}>
                          {item.RefillingStation.businessDaysFrom}-
                          {item.RefillingStation.businessDaysTo}
                        </Text>
                        <Text style={styles.storeStatusStyles}>
                          {item.RefillingStation.operatingHrsFrom}-
                          {item.RefillingStation.operatingHrsTo}
                        </Text>

                        <Text style={styles.storeStatusStyles}>
                          {/* {item.idno ? `Distance: ${locationsDistance[item.idno]} km` : null} */}
                          {/* {item.idno
                            ? `${locationsDistance[item.idno]} km away`
                            : null} */}
                          {item.idno && locationsDistance[item.idno]
                            ? `${locationsDistance[item.idno]} km away`
                            : "Retrieving location,please wait..."}
                        </Text>

                        <Text style={styles.storeStatusStyles}>
                          {item.RefillingStation.status}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.circular}></View>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          );
          //var calculateDistance='test';
        }}
        ListHeaderComponent={
          <View style={styles.storeWrapper}>
            <Text style={styles.sectionTitle}>Nearby me</Text>
            <StatusBar
              backgroundColor="black"
              styleStatusBar={styleStatusBar}
            />
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "lightcyan",
  },
  storeWrapper: {
    //paddingTop: 80,
    paddingHorizontal: 15,
    //backgroundColor: 'green',
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 20,
  },
  items: {
    marginTop: 15,
    // backgroundColor: 'red',
  },

  writeTaskWrapper: {
    position: "absolute",
    bottom: 60,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },

  //from storeinfo.js
  item: {
    backgroundColor: "white",
    padding: 10,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 5,
    elevation: 4,
  },
  itemLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  viewforStoreInfos: {
    flexDirection: "column",
    alignItems: "center",
  },
  square: {
    width: 75,
    height: 75,
    // backgroundColor: "red",
    // opacity: 0.4, #55BCF6
    borderRadius: 15,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#55BCF6",
    //marginBottom:25
  },
  itemText: {
    maxWidth: "80%",
  },
  circular: {
    width: 12,
    height: 12,
    borderColor: "#55BCF6",
    borderWidth: 2,
    borderRadius: 5,
  },

  itemShaun: {
    padding: 15,
    marginTop: 16,
    borderColor: "#bbb",
    borderWidth: 1,
    borderStyle: "dashed",
    borderRadius: 10,
  },
  contentShaun: {
    padding: 40,
  },
  listShaun: {
    marginTop: 20,
  },
  storePhotoStyle: {
    width: 70,
    height: 70,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },
  storeNameStyles: {
    fontSize: 20,
    fontFamily: "nunito-bold",
  },
  storeStatusStyles: {
    fontSize: 16,
    fontFamily: "nunito-light",
  },

  safeviewStyle: {
    flex: 1,
  },
  buttonPressed: {
    backgroundColor: "green",
  },
  buttonText: {
    color: "white",
    textAlign: "center",
  },
});
