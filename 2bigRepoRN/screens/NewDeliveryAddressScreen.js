import { useRoute } from "@react-navigation/native";

import {
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import {
  StyleSheet,
  Text,
  View,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  Alert,
  TouchableOpacity,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { getDistance } from "geolib";
import { globalStyles } from "../ForStyle/GlobalStyles";
import { GOOGLE_API_KEY_PLACE } from "../APIKEY";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import { MaterialIcons } from "@expo/vector-icons";
import React, {
  useState,
  useCallback,
  useEffect,
  useLayoutEffect,
} from "react";

export default function NewDeliveryAddressScreen({ navigation }) {
  //receive the passedStation from other screen
  const route = useRoute();
  const {
    adminLatt,
    adminLong,
    passedStationName,
    extractedDatas,
    item,
    selectedReserveDeliveryType,
    selectedItem,
    passedTotalAmount,
   
    selectedpaymenthod,
    rewardScreenNewModeOfPayment,
    deliveyfeeValue,
    selectedDeliveryType,
    paramnewDeliveryDetails,
    totalQuantity,
  } = route.params ?? {
    passedStationName: null,
    passedTotalAmount,
  };

  // console.log("Receiver new delivery address->selected delivery type",selectedDeliveryType,
  // );
  // console.log("Receiver new delivery address->selected delivery type",adminLatt, adminLong
  // );
  //button disable

  // const onPresshandler_toStationPage = () => {
  //   //  console.log("send 36",secondItem, combinedData);
  //   navigation.goBack();
  // };
  //get the delivey Details from previous screen
  const [newDeliveryDetails, setnewDeliveryDetails] = useState(
    paramnewDeliveryDetails
  );
 // const [passedTotalAmount,setpassedTotalAmount]=useState(passedTotalAmount);
   //const [totalAmount,setTotalAmount]=useState(passedTotalAmount);
  const [tempDeliveryFee, settempDeliveryFee] = useState(deliveyfeeValue||0);
  const [newDeliveryFee, setNewDeliveryFee] = useState();
  console.log("passed total amount",passedTotalAmount);
 
  console.log("New delivery fee", newDeliveryFee);
  console.log("Receiver new delivery address", tempDeliveryFee);
  console.log("Receiver new delivery address---->Passed total amount from cart screen",passedTotalAmount,typeof passedTotalAmount)
  const DeliveryAddressOption = [
    {
      label: "Same as Home Address",
      value: "Same as Home Address",
      key: 12,
    },
    {
      label: "New Delivery Address",
      value: "New Delivery Address",
      key: 13,
    },
  ];
  const [deliveryAddressOption, setDeliveryAddressOption] = useState();

  const [
    checkedItemKey_deliveryAddressOption,
    setCheckedItemKey_deliveryAddressOption,
  ] = useState(null);

  const handleItemchecked_DeliveryAddressOption = (item) => {
    setCheckedItemKey_deliveryAddressOption(
      item.key === checkedItemKey_deliveryAddressOption ? null : item.key
    );
    if (item.value === "Same as Home Address") {
      setShowLandmark(false);
      console.log("line 99");
      //  calculateDistance_StoreToNewDeliveryadd();
      // setShowdeliveryAddressModal(true);
      //  navigation.navigate("NewDeliveryAdd",{passedStationName,extractedDatas,secondItem });
    }
  };
  const handleSubmit = () => {
    if (!deliveryAddressOption) {
      alert("Please choose a delivery address option.");
      return;
    }

    if (deliveryAddressOption === "Same as Home Address") {
      setreceiverContactNumber(null);
      setLandmarkData(null);
      setnewDeliveryAddress(null);
      setnewDeliveryAddressaLatitude(null);
      setnewDeliveryAddressaLongitude(null);
      Alert.alert("Delivery address confirmed", "Thank you", [
        {
          text: "OK",
          onPress: () => {
            // console.log("same as home",passedTotalAmount,FinalTotalAmount)
            //console.log("same as home send to cart screen",selectedpaymenthod)
            navigation.navigate("CartScreen", {
              combinedData,
              extractedDatas,
              selectedItem,
              passedTotalAmount:
                parseFloat(passedTotalAmount),
              rewardScreenNewModeOfPayment,
              selectedpaymenthod,
              selectedReserveDeliveryType,
            });
          },
        },
      ]);
    } else {
      if (!landmarkData || !newDeliveryAddress) {
        alert(
          "Please enter a  landmark or address for the new delivery address."
        );
        return;
      } else if (
        typeof landmarkData !== "string" ||
        !/^[a-zA-Z\s]+$/.test(landmarkData)
      ) {
        alert(
          "Please enter a valid landmark. Only letters and spaces are allowed."
        );
        return;
      } else if (
        !receiverContactNumber ||
        receiverContactNumber.length !== 11
      ) {
        alert("Please enter less than 11 digits number.");
        return;
      } else if (
        !receiverContactNumber ||
        typeof receiverContactNumber !== "string" ||
        /[^0-9]/.test(receiverContactNumber)
      ) {
        alert("Only numbers");
        return;
      } else {
        //  const [tempDeliveryFee,settempDeliveryFee]=useState(deliveyfeeValue);
        if (tempDeliveryFee || tempDeliveryFee === 0) {
          let deliveryFee = 0;
          const standardDistance =
            newDeliveryDetails &&
            Array.isArray(newDeliveryDetails) &&
            newDeliveryDetails.length > 0
              ? parseFloat(newDeliveryDetails[0].standistance)
              : null;
          const standardDeliveryFee =
            newDeliveryDetails &&
            Array.isArray(newDeliveryDetails) &&
            newDeliveryDetails.length > 0
              ? newDeliveryDetails[0].stanDeliveryFee
              : null;

          //  //extracted delivery distance and fee and value  for EXPRESS
          const expressDeliveryValue =
            newDeliveryDetails &&
            Array.isArray(newDeliveryDetails) &&
            newDeliveryDetails.length > 0
              ? newDeliveryDetails[0].exDeliveryType
              : null;
          const expressDeliveryFee =
            newDeliveryDetails &&
            Array.isArray(newDeliveryDetails) &&
            newDeliveryDetails.length > 0
              ? newDeliveryDetails[0].exDeliveryFee
              : null;

          const expressDeliveryDistance =
            newDeliveryDetails &&
            Array.isArray(newDeliveryDetails) &&
            newDeliveryDetails.length > 0
              ? newDeliveryDetails[0].expressDistance
              : null;

          //vehicle value and its fee

          const vehicle1Fee =
            newDeliveryDetails &&
            Array.isArray(newDeliveryDetails) &&
            newDeliveryDetails.length > 0
              ? parseFloat(newDeliveryDetails[0].vehicle1Fee)
              : null;

          const vehicle2Fee =
            newDeliveryDetails &&
            Array.isArray(newDeliveryDetails) &&
            newDeliveryDetails.length > 0
              ? parseFloat(newDeliveryDetails[0].vehicle2Fee)
              : null;
          const vehicle3Fee =
            newDeliveryDetails &&
            Array.isArray(newDeliveryDetails) &&
            newDeliveryDetails.length > 0
              ? parseFloat(newDeliveryDetails[0].vehicle3Fee)
              : null;
          if (selectedDeliveryType === "Standard") {
            const dynamicDistance = getDistance(
              {
                latitude: newDeliveryAddressLatitude,
                longitude: newDeliveryAddressLongitude,
              },
              { latitude: adminLatt, longitude: adminLong }
            );
            const newdeliveryAddtoStoreLocation = dynamicDistance / 1000; //the result distance is by meter but I divide 1000 so it will result KM
            console.log(
              "Distance from new delivery address to store",
              newdeliveryAddtoStoreLocation
            );
            if (newdeliveryAddtoStoreLocation > standardDistance) {
              const exceedingDistance = (
                newdeliveryAddtoStoreLocation - parseFloat(standardDistance)
              ).toFixed(2);
              console.log("Standard Exceeding Distance", exceedingDistance);

              const additionalCost =
                parseFloat(standardDeliveryFee) * exceedingDistance;
              // setdeliveyfeeValue(additionalCost.toFixed(2));
              console.log(" Standard additioal cost", additionalCost);
              // settempDeliveryFee(additionalCost);
              let subtotal = 0;
              if (passedTotalAmount) {
                if (totalQuantity >= 6) {
                  deliveryFee = additionalCost + vehicle3Fee;
                  subtotal =
                    parseFloat(passedTotalAmount) +
                    parseFloat(deliveryFee); 
                 
                  console.log("newdeliveryAddtoStoreLocation is > to store loaction-->Passed total amount-->Qty is > 6 up", passedTotalAmount);
                  console.log("newdeliveryAddtoStoreLocation is > to store loaction-->Delivery fee-->Qty is > 6 up", deliveryFee);
                  console.log("newdeliveryAddtoStoreLocation is > to store loaction-->Subtotal-->Qty is > 6 up", subtotal);
                  //  setvehicleFeeSaveToDb(vehicle3Fee);
                  if (!isNaN(subtotal)) {
                    setNewDeliveryFee(subtotal.toFixed(2));
                  } else {
                    //setTotalAmount("Total Amount");
                  }
                } else if (totalQuantity >= 2 && totalQuantity <= 5) {
                  deliveryFee = additionalCost + vehicle2Fee;
                  subtotal =
                    parseFloat(passedTotalAmount) +
                    parseFloat(deliveryFee); 
                 
                  console.log("newdeliveryAddtoStoreLocation is > to store loaction-->Passed total amount-->Qty is >=2", passedTotalAmount);
                  console.log("newdeliveryAddtoStoreLocation is > to store loaction-->Delivery fee-->Qty is >=2", deliveryFee);
                  console.log("newdeliveryAddtoStoreLocation is > to store loaction-->Subtotal-->Qty is >=2", subtotal);
                  //  setvehicleFeeSaveToDb(vehicle2Fee);
                  //alert(`Quantities-->${totalQuantity} and the fee is ${vehicle2Fee}`)
                  console.log("qty >= 2", subtotal);
                  if (!isNaN(subtotal)) {
                    setNewDeliveryFee(subtotal.toFixed(2));
                  } else {
                    //setTotalAmount("Total Amount");
                  }
                } else {
                  deliveryFee = additionalCost + vehicle1Fee;
                  subtotal =
                    parseFloat(passedTotalAmount) +
                    parseFloat(deliveryFee); 
                 
                  console.log("newdeliveryAddtoStoreLocation is > to store loaction-->Passed total amount-->Qty is 1", passedTotalAmount);
                  console.log("newdeliveryAddtoStoreLocation is > to store loaction-->Delivery fee-->Qty is 1", deliveryFee);
                  console.log("newdeliveryAddtoStoreLocation is > to store loaction-->Subtotal-->Qty is 1", subtotal);
                
                  if (!isNaN(subtotal)) {
                    setNewDeliveryFee(subtotal.toFixed(2));
                  } else {
                    //setTotalAmount("Total Amount");
                  }
                }

                Alert.alert("Delivery address confirmed", "Thank you", [
                  {

                    text: "OK",
                    onPress: () => {
                      console.log(
                        "Delivery Address Screen--->>send to cart screen-->subtotal",
                        subtotal
                      );
                    
                      // console.log("new delivery add",passedTotalAmount,FinalTotalAmount)
                      navigation.navigate("CartScreen", {
                        combinedData,
                        extractedDatas,
                        selectedItem,
                        deliveryAddressOption,
                        passedTotalAmount:
                          parseFloat(passedTotalAmount) ||
                         
                          parseFloat(subtotal),
                        rewardScreenNewModeOfPayment,
                        selectedpaymenthod,
                        selectedReserveDeliveryType,
                        newDeliveryFee: deliveryFee || null,
                        updateTotalAmount_NewDeliveryScreen:parseFloat(subtotal).toFixed(2)
                      });
                    },
                  },
                ]);
              }
            } else {
              //if the new delivery address is less than to the set of admin
              let subtotal = 0;
              if (passedTotalAmount) {
                if (totalQuantity >= 6) {
                  //deliveryFee = additionalCost + vehicle3Fee;
                  subtotal =
                    parseFloat(passedTotalAmount) +
                    parseFloat(vehicle3Fee); 
                 
                    console.log("newdeliveryAddtoStoreLocation is  < to store loaction-->Passed total amount-->Qty is 6 up", passedTotalAmount);
                   
                    console.log("newdeliveryAddtoStoreLocation is <   to store loaction-->Subtotal-->Qty is 6 up", subtotal);
                  //  setvehicleFeeSaveToDb(vehicle3Fee);
                  if (!isNaN(subtotal)) {
                    setNewDeliveryFee(subtotal.toFixed(2));
                  } else {
                    //setTotalAmount("Total Amount");
                  }
                } else if (totalQuantity >= 2 && totalQuantity <= 5) {
                 // deliveryFee = additionalCost + vehicle2Fee;
                  //subtotal = additionalCost + vehicle2Fee; //total amount is added by the fee of the vehicle
                  subtotal =
                  parseFloat(passedTotalAmount) +
                  parseFloat(vehicle2Fee); 
               
                  console.log("newdeliveryAddtoStoreLocation is  < to store loaction-->Passed total amount-->Qty is >= 2 ", passedTotalAmount);
                 
                  console.log("newdeliveryAddtoStoreLocation is <   to store loaction-->Subtotal-->Qty is >= 2 ", subtotal)
                  console.log("qty >= 2", subtotal);
                  if (!isNaN(subtotal)) {
                    setNewDeliveryFee(subtotal.toFixed(2));
                  } else {
                    //setTotalAmount("Total Amount");
                  }
                } else {
                  // deliveryFee = additionalCost + vehicle1Fee;
                  subtotal =
                    parseFloat(passedTotalAmount) +
                    parseFloat(vehicle1Fee); 
                 
                    console.log("newdeliveryAddtoStoreLocation is  < to store loaction-->Passed total amount-->Qty is 1", passedTotalAmount);
                    
                    console.log("newdeliveryAddtoStoreLocation is <   to store loaction-->Subtotal-->Qty is 1", subtotal);
                
                  if (!isNaN(subtotal)) {
                    setNewDeliveryFee(subtotal.toFixed(2));
                  } else {
                    //setTotalAmount("Total Amount");
                  }
                }

                Alert.alert("Delivery address confirmed", "Thank you", [
                  {

                    text: "OK",
                    onPress: () => {
                      console.log(
                        "Delivery Address Screen--->>send to cart screen",
                        subtotal
                      );
                      // console.log("new delivery add",passedTotalAmount,FinalTotalAmount)
                      navigation.navigate("CartScreen", {
                        combinedData,
                        extractedDatas,
                        selectedItem,
                        deliveryAddressOption,
                        passedTotalAmount:
                          parseFloat(passedTotalAmount) ||
                         
                          parseFloat(subtotal),
                        rewardScreenNewModeOfPayment,
                        selectedpaymenthod,
                        selectedReserveDeliveryType,
                        newDeliveryFee: deliveryFee || null,
                      });
                    },
                  },
                ]);
              }
            }
          }
          //get the distance between customer and store location using the API
        } else {
         // console.log("The delivery fee from Cart screen is 0");
        }
      }
    }
  };

  const [landmarkData, setLandmarkData] = useState();
  const [newDeliveryAddress, setnewDeliveryAddress] = useState();
  const [newDeliveryAddressLatitude, setnewDeliveryAddressaLatitude] =
    useState();
  const [newDeliveryAddressLongitude, setnewDeliveryAddressaLongitude] =
    useState();
  const [receiverContactNumber, setreceiverContactNumber] = useState();
  const combinedData = {
    DeliveryAddress: deliveryAddressOption || null,
    newAddresslandmark: landmarkData ?? null,
    newAddressaddress: newDeliveryAddress ?? null,
    newAddressLattitude: newDeliveryAddressLatitude ?? null,
    newAddressLongitude: newDeliveryAddressLongitude ?? null,
    newAddressreceiverContactNum: receiverContactNumber ?? null,
  };
  console.log("line 101", combinedData);
  const [showLandmark, setShowLandmark] = useState(false);

  //console.log("line 206",tempDeliveryFee);

  useLayoutEffect(() => {
    //get the distance between customer and store location using the API
    //  const dynamicDistance = getDistance(
    //   { latitude: newDeliveryAddressLatitude, longitude: newDeliveryAddressLongitude },
    //   { latitude: adminLatt, longitude: adminLong }
    // );
    // const newdeliveryAddtoStoreLocation = dynamicDistance / 1000; //the result distance is by meter but I divide 1000 so it will result KM
    // console.log("Distance from customer to store", newdeliveryAddtoStoreLocation)
  }, [
    adminLatt,
    adminLong,
    newDeliveryAddressLatitude,
    newDeliveryAddressLongitude,
    tempDeliveryFee,
  ]);
  const calculateDistance_StoreToNewDeliveryadd = (
    newDeliveryAddressLatitude,
    newDeliveryAddressLongitude
  ) => {
    console.log("The admin lat is ", adminLatt);
    //get the distance between store and receiver new delivery address for customer
    const dynamicDistance = getDistance(
      {
        latitude: newDeliveryAddressLatitude,
        longitude: newDeliveryAddressLongitude,
      },
      { latitude: adminLatt, longitude: adminLong }
    );
    const newdeliveryAddtoStoreLocation = dynamicDistance / 1000; //the result distance is by meter but I divide 1000 so it will result KM
    console.log(
      "Distance from customer to store",
      newdeliveryAddtoStoreLocation
    );
  };

  return (
    <TouchableWithoutFeedback
      onPress={() => {
        Keyboard.dismiss();
      }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : null}
        keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0} // adjust the value as needed
        style={{ flex: 1 }}
      >
        <View style={styles.container}>
          <View style={styles.viewBackBtn}>
            {/* <MaterialIcons
              name="arrow-back-ios"
              size={24}
              color="black"
              onPress={onPresshandler_toStationPage}
              style={{ right: 70 }}
            /> */}
            <View style={styles.viewwatername}>
              <Text style={styles.textwatername}>{passedStationName}</Text>
            </View>
          </View>
          <View style={styles.productWrapper}>
            <View style={styles.wrapperWaterProduct}>
              <Text style={styles.waterProdStyle}>
                Delivery Address Information
              </Text>

              {DeliveryAddressOption &&
                DeliveryAddressOption.map((item) => {
                  const isChecked =
                    item.key === checkedItemKey_deliveryAddressOption;
                  return (
                    <View
                      key={item.key}
                      style={{
                        //backgroundColor: "red",
                        marginTop: 20,
                        height: 25,
                        borderRadius: 5,
                        padding: 0,
                        flexDirection: "row",
                        width: responsiveWidth(50),
                      }}
                    >
                      <TouchableOpacity
                        onPress={() => {
                          handleItemchecked_DeliveryAddressOption(item);
                          setCheckedItemKey_deliveryAddressOption(item.key);
                          setDeliveryAddressOption(item.value);
                          console.log("test if unsa nga log", item.value);
                        }}
                      >
                        <View style={styles.checkbox}>
                          {isChecked && (
                            <MaterialIcons
                              name="done"
                              size={15}
                              color="black"
                              styles={{ alignItems: "center" }}
                            />
                          )}
                        </View>
                      </TouchableOpacity>

                      <Text
                        style={{
                          fontFamily: "nunito-light",
                          fontSize: 18,
                          flexDirection: "row",
                        }}
                      >
                        {item.label}
                      </Text>
                    </View>
                  );
                })}

              {deliveryAddressOption === "New Delivery Address" && (
                <View
                  style={{
                    width: "95%",
                    backgroundColor: "white",
                    shadowColor: "black",
                    shadowOffset: { width: 2, height: 2 },
                    shadowOpacity: 0.5,
                    shadowRadius: 4,
                    elevation: 0,
                    padding: 8,
                    borderRadius: 8,
                    marginLeft: 5,
                    height: 45,
                    marginTop: 5,
                    flexDirection: "row",
                  }}
                >
                  <TextInput
                    placeholder="Contact number of the receiver(Optional)"
                    style={[
                      globalStyles.login_Email_textInput,
                      { marginLeft: 0 },
                    ]}
                    placeholderTextColor={
                      deliveryAddressOption === "New Delivery Address"
                        ? "black"
                        : "gray"
                    }
                    keyboardType="numeric"
                    editable={
                      deliveryAddressOption === "New Delivery Address"
                        ? true
                        : false
                    }
                    onChangeText={(text) => setreceiverContactNumber(text)}
                  />
                </View>
              )}

              {deliveryAddressOption === "New Delivery Address" && (
                <View style={{ flex: 1, marginTop: 25 }}>
                  <View style={{ height: 200 }}>
                    <GooglePlacesAutocomplete
                      //editable={checkedItemKey_deliveryAddressOption!==13 }
                      placeholder="Address of Delivery Address"
                      onFail={(error) => console.log("Error ba?", error)}
                      onNotFound={() => console.log("no results")}
                      fetchDetails={true}
                      placeholderTextColor="black"
                      query={{
                        language: "en",
                        key: GOOGLE_API_KEY_PLACE,
                        components: "country:ph",
                      }}
                      minLength={2}
                      styles={{
                        pointerEvents:
                          deliveryAddressOption === "Same as Home Address"
                            ? "none"
                            : "auto",
                        container: {
                          width: "95%",
                          marginLeft: 5,
                          elevation: 2,
                          shadowColor: "#000",
                          shadowOpacity: 0.2,
                          shadowRadius: 5,
                          shadowOffset: { width: 0, height: 5 },
                          flex: 1,
                          height: 50,
                        },
                        textInput: {
                          // height: 38,
                          color: "black",
                          fontSize: 18,
                          fontFamily: "nunito-reg",
                        },
                        listView: {
                          backgroundColor: "#fff",
                          elevation: 2,
                          shadowColor: "#000",
                          shadowOpacity: 0.2,
                          shadowRadius: 5,
                          shadowOffset: { width: 0, height: 5 },
                        },
                      }}
                      //   textInputProps={{placeholderTextColor:'black',
                      // //{deliveryAddressOption==="New Delivery Address" ? "black" : "gray"}

                      // }}
                      textInputProps={{
                        placeholderTextColor:
                          deliveryAddressOption === "New Delivery Address"
                            ? "black"
                            : "gray",
                        returnKeyType: "done",
                      }}
                      onPress={(data, details = null) => {
                        const { formatted_address, geometry } = details;
                        const { description } = data;
                        const { lat, lng } = geometry.location;
                        //console.log("line 357", description);
                        //console.log("line 329", details);
                        setShowLandmark(true);
                        //  setnewDeliveryAddress(formatted_address);
                        setnewDeliveryAddress(description);
                        setnewDeliveryAddressaLatitude(lat);
                        setnewDeliveryAddressaLongitude(lng);
                      }}
                      listEmptyComponent={() => (
                        <View style={{ flex: 1 }}>
                          <Text>No results were found</Text>
                        </View>
                      )}
                      nearbyPlacesAPI="GooglePlacesSearch"
                    />
                  </View>
                </View>
              )}

              {showLandmark && (
                <View
                  style={{
                    width: "95%",
                    backgroundColor: "white",
                    shadowColor: "black",
                    shadowOffset: { width: 2, height: 2 },
                    shadowOpacity: 0.5,
                    shadowRadius: 4,
                    elevation: 0,
                    padding: 8,
                    borderRadius: 8,
                    marginLeft: 5,
                    height: 45,
                    marginTop: -10,
                    //flexDirection: "row",
                  }}
                >
                  <TextInput
                    placeholder="Landmark of Delivery Address"
                    style={[
                      globalStyles.login_Email_textInput,
                      { marginLeft: 0 },
                    ]}
                    placeholderTextColor={
                      deliveryAddressOption === "New Delivery Address"
                        ? "black"
                        : "gray"
                    }
                    keyboardType="default"
                    editable={
                      deliveryAddressOption === "New Delivery Address"
                        ? true
                        : false
                    }
                    onChangeText={(text) => setLandmarkData(text)}
                  />
                </View>
              )}
            </View>
            <TouchableOpacity onPress={handleSubmit}>
              <View
                style={{
                  borderRadius: 10,
                  paddingVertical: 10,
                  paddingHorizontal: 20,
                  //backgroundColor: "#87cefa",
                  // backgroundColor:
                  //   !textinput_Feedback || !ratings ? "#ccc" : "#87cefa",
                  // backgroundColor: "#87cefa",
                  backgroundColor: "#87cefa",
                  marginTop: 110,
                  width: 200,
                  left: 70,

                  height: 40,
                }}
              >
                <Text
                  style={[globalStyles.buttonText, { marginTop: 0, left: 0 }]}
                >
                  Submit
                </Text>

                <MaterialIcons
                  name="login"
                  size={24}
                  color="black"
                  style={[
                    globalStyles.loginIcon,
                    { backgroundColor: "transparent", marginLeft: -70 },
                  ]}
                />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "lightcyan",
    // justifyContent:'center',
    //alignItems:'center'
  },
  viewBackBtn: {
    //  backgroundColor: "coral",
    marginTop: 20,
    marginLeft: 10,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  viewwatername: {
    // backgroundColor: "yellow",
    width: 180,
    justifyContent: "center",
  },
  textwatername: {
    fontSize: 20,
    fontFamily: "nunito-bold",
    fontWeight: "bold",
    textAlign: "center",
    // backgroundColor:'red',
    width: 180,
    textAlign: "center",
    alignItems: "center",
    right: 10,
  },
  wrapperWaterProduct: {
    height: 300,
    // backgroundColor:'red'
  },
  waterProdStyle: {
    fontFamily: "nunito-semibold",
    fontSize: 20,
    marginLeft: 6,
  },
  productWrapper: {
    //backgroundColor: "yellowgreen",
    padding: 10,
    // flex: 1,
    marginTop: 20,
    height: 600,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
    marginRight: 5,
    // backgroundColor:'blue'
  },
});
