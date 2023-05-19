import { useRoute } from "@react-navigation/native";
import { useState, useRef } from "react";
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
import React from "react";
import { globalStyles } from "../ForStyle/GlobalStyles";
import { GOOGLE_API_KEY_PLACE } from "../APIKEY";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import { MaterialIcons } from "@expo/vector-icons";

export default function NewDeliveryAddressScreen({ navigation }) {
  //receive the passedStation from other screen
  const route = useRoute();
  const { passedStationName, extractedDatas, item, selectedItem ,passedTotalAmount,FinalTotalAmount,
    selectedpaymenthod,rewardScreenNewModeOfPayment} =
    route.params ?? {
      passedStationName: null,
      passedTotalAmount
    };
    console.log("line 29 new delivery add screen",typeof passedTotalAmount, passedTotalAmount,typeof FinalTotalAmount,FinalTotalAmount)
  console.log("Receive new delivery address",selectedpaymenthod)
  //button disable

  const onPresshandler_toStationPage = () => {
    //  console.log("send 36",secondItem, combinedData);
    navigation.goBack();
  };

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
      setnewDeliveryAddress(null)
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
              passedTotalAmount:parseFloat(passedTotalAmount)  || FinalTotalAmount,
              rewardScreenNewModeOfPayment,
              selectedpaymenthod
            });
          },
        },
      ]);
    } else {
      if (!landmarkData || !newDeliveryAddress) {
        alert(
          "Please enter a landmark or address for the new delivery address."
        );
        return;
      } else if (
        !receiverContactNumber ||
        receiverContactNumber.length !== 11
      ) {
        alert("Please enter a valid number.");
        return;
      } else {
        Alert.alert("Delivery address confirmed", "Thank you", [
          {
            text: "OK",
            onPress: () => {
              //console.log("newdelivery add send to cart screen",selectedpaymenthod)
             // console.log("new delivery add",passedTotalAmount,FinalTotalAmount)
              navigation.navigate("CartScreen", {
                combinedData,
                extractedDatas,
                selectedItem,
                deliveryAddressOption,
                passedTotalAmount:parseFloat(passedTotalAmount) || FinalTotalAmount,
                rewardScreenNewModeOfPayment,
                selectedpaymenthod

              });
            },
          },
        ]);
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
            <MaterialIcons
              name="arrow-back-ios"
              size={24}
              color="black"
              onPress={onPresshandler_toStationPage}
              style={{ right: 70 }}
            />
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
                       //  backgroundColor: "red",
                        marginTop: 20,
                        height: 25,
                        borderRadius: 5,
                        padding: 0,
                        flexDirection: "row",
                        width: 160,
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
                        const { lat, lng } = geometry.location;
                        console.log("line 329", data);
                        setShowLandmark(true);
                        setnewDeliveryAddress(formatted_address);
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
            <TouchableOpacity
              // onPress={()=>{
              //   navigation.navigate("toProductDetailsAndOrderScreen", {
              //                 combinedData,
              //                 extractedDatas,
              //                 item,
              //               });
              // }}
              onPress={handleSubmit}
              //disabled={!textinput_Feedback || !ratings}
              //disabled={buttonDisable}
            >
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
    right: 20,
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
