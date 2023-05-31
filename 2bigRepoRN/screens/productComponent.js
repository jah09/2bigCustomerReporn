import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Image,
  TouchableOpacity,
  ScrollView,
  ToastAndroid,
  Modal,
  TextInput,
  Alert,
  Pressable,
} from "react-native";
import React, {
  useState,
  useEffect,
  useLayoutEffect,
  useCallback,
  useMemo,
} from "react";

import { MaterialIcons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { AntDesign } from "@expo/vector-icons";
import { useRoute } from "@react-navigation/native";
import { globalStyles } from "../ForStyle/GlobalStyles";
import { db } from "../firebaseConfig";
import { debounce } from "lodash";
import { FontAwesome } from "@expo/vector-icons";
import {
  ref,
  onValue,
  query,
  orderByChild,
  equalTo,
  get,
  off,
} from "firebase/database";
import moment from "moment/moment";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { select } from "@react-native-material/core";
import {
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";
export default function ProductComponent() {
  const route = useRoute();
  const { item } = route.params ?? null; //receive the variable passed by parameter "item", from other screen.
  // console.log("Product Screen--RECEIVED ANG DATA FROM ADMIN--FROM STATION SCREEN", JSON.stringify(item)); //LOG it if na receive ba
  const StationStatus = item.RefillingStation.status;
  //const storeNamefromMap=store.
  // const storeNamefromMap = store.RefillingStation.stationName ?? null;
  const storeName = item.RefillingStation.stationName ?? null; //accessing the data passed from other screen
  //console.log("Product Screen--StoreName",storeName);
  //access the ID of refilling station

  const selectedStationID = item.idno ?? null;
  //console.log("productScreen-->", selectedStationID);
  const navigation = useNavigation();
  const extractedDatas = {
    adminProperties: {
      firstname: item.fname,
      adminID: item.idno,
      lastname: item.lname,
    },
    refillingStoreProperties: {
      stationName: item.RefillingStation.stationName,
      lattitude: item.RefillingStation.addLattitude,
      longitude: item.RefillingStation.addLongitude,
      stationStatus: item.RefillingStation.status,
    },
  };

  const onPresshandler_toStationPage = () => {
    navigation.goBack();
  };
  //retrieve the Data from customer DATA
  useLayoutEffect(() => {
    AsyncStorage.getItem("customerData") //e get ang Asycn sa login screen
      .then((data) => {
        if (data !== null) {
          //if data is not null
          const parsedData = JSON.parse(data); //then e store ang Data into parsedData
          setCustomerData(parsedData); //passed the parsedData to customerDta
          //console.log("Customer Data",parsedData);
          const CustomerUID = parsedData.cusId;
        }
      })
      .catch((error) => {
        console.log(error);
        alert("Error fetching data: ", error);
      });
  }, []);
  const [customerData, setCustomerData] = useState([]);

  const [productData, setproductData] = useState();
  // console.log("Products Data",productData);
  const [updateTankSupply, setUpdateTankSupply] = useState();
  //get current date
  useEffect(() => {
    const functionsetCurrentDate = () => {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, "0");
      const day = String(today.getDate()).padStart(2, "0");
      const formattedDate = `${year}-${month}-${day}`;
      setCurrentDate(formattedDate);

      return formattedDate;
    };

    functionsetCurrentDate();
  }, []);

  const [currentDate, setCurrentDate] = useState("");

  //get the tank Supply
  useLayoutEffect(() => {
    const tanksuppRef = ref(db, "TANKSUPPLY/");
    const otherTanksupplyQuery = query(
      tanksuppRef,
      orderByChild("adminId"),
      equalTo(selectedStationID)
    );

    const unsubscribe = onValue(otherTanksupplyQuery, (snapshot) => {
      // console.log("PRODUCT SCREEN---tst", otherProductsQuery);
      const data = snapshot.val();
      //console.log("line 180",data);
      if (data && Object.keys(data).length > 0) {
        const otherProductsInfo = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        // console.log("line 201", otherProductsInfo);
        const filteredTankSupp = otherProductsInfo.filter((tanksupp) => {
          // convert dateUpdated to a Moment object with the specified format
          const updatedMoment = moment(
            tanksupp.dateUpdated,
            "YYYY-MM-DDTHH:mm:ss.SSSSSSSZ"
          );
          const currentDateMoment = moment(currentDate, "YYYY-MM-DD").startOf(
            "day"
          );

          return updatedMoment.isSameOrAfter(currentDateMoment, "day");
        });
        // console.log("tank supply", filteredTankSupp);
        setTankSupply(filteredTankSupp);
      }
    });
    return () => unsubscribe();
  }, [selectedStationID, currentDate]);
  const [tankSupply, setTankSupply] = useState();

  const [thirdPartyProducts, setthirdPartyProducts] = useState();
  //console.log("thirdPartyProducts",thirdPartyProducts);

  //retreive productRefill
  useEffect(() => {
    const productRef = ref(db, "PRODUCTREFILL/");
    const productsQuery = query(
      productRef,
      orderByChild("adminId"),
      equalTo(selectedStationID)
    );

    const unsubscribe = onValue(productsQuery, (snapshot) => {
      //  console.log("PRODUCT SCREEN---tst", productsQuery);

      const data = snapshot.val();
      if (data) {
        const productRefillInfo = Object.keys(data).map((key) => ({
          id: key,
          pro_Image: data[key].pro_Image,
          ...data[key],
        }));
        // console.log("Product data is ",productRefillInfo);

        setproductData(productRefillInfo);
      } else {
        //  console.log("No data at the moment- Product refill useEffect")
      }
    });
    return () => unsubscribe(); // unsubscribe when component unmounts
  }, [selectedStationID]);

  const [imageUrl, setImageUrl] = useState(null);
  useEffect(() => {
    if (productData && productData.length > 0 && productData[0].pro_Image) {
      setImageUrl(productData[0].pro_Image); // Set the image URL to the first product's pro_Image
      //console.log("line 201", productData[0].pro_Image);
    }
  }, [productData]);

  //retreive thirdparty_PRODUCTS
  useLayoutEffect(() => {
    const thirdPartyProductsRef = ref(db, "thirdparty_PRODUCTS/");
    const thirdPartyProductsQuery = query(
      thirdPartyProductsRef,
      orderByChild("adminId"),
      equalTo(selectedStationID)
    );

    const unsubscribe = onValue(thirdPartyProductsQuery, (snapshot) => {
      // console.log("PRODUCT SCREEN---tst", otherProductsQuery);
      const data = snapshot.val();
      if (data && Object.keys(data).length > 0) {
        const thirdPartyProductsInformation = Object.keys(data).map((key) => ({
          id: key,
          other_productImage: data[key].other_productImage,
          ...data[key],
        }));
        setthirdPartyProducts(thirdPartyProductsInformation);
        //  console.log("line 233", thirdPartyProductsInformation);
      } else {
        setthirdPartyProducts([]);
        // console.log("No data at the moment- Product refill useEffect")
      }
    });
    return () => unsubscribe();
  }, [selectedStationID]);
  const [thirdPartyProdsImage, setotherProductImageURL] = useState(null);
  useEffect(() => {
    if (
      thirdPartyProducts &&
      thirdPartyProducts.length > 0 &&
      thirdPartyProducts[0].thirdparty_productImage
    ) {
      setotherProductImageURL(thirdPartyProducts[0].thirdparty_productImage); // Set the image URL to the first product's pro_Image
    }
  }, [thirdPartyProducts]);

  const [storeRatings, setStoreRatings] = useState({});

  //console.log("line 294",storeRatings);
  const [cartCount, setCartCount] = useState(0);
  const [cartquantity, setcartQuantity] = useState(cartCount);
  const [selectedItem, setSelectedItem] = useState([]);

  //function to show the modal of Refill option-----------------------------------------------------------------
  const showmodalRefillOption = useCallback(
    (item) => {
      setsubmitbuttonDataholder(item);
      // Show the modal for refill options

      // if item.offerType === "Product Refill" then show the modal
      if (item.offerType === "Product Refill") {
        setshowModal_RefillCheckbox(true);
      } else {
        setCartCount((value) => value + 1); // every count, if mo click "+", it will increment by one
        setcartQuantity((value) => value + 1); //para mo reflect ang value sa count into "quantity variable"
        console.log("test item", item.offerType);
        console.log("modal here, other product ");
        ToastAndroid.show("Added to your cart", ToastAndroid.LONG);
        setSelectedItem((prevSelectedItems) => [...prevSelectedItems, item]);
      }
    },

    [selectedItem]
  );

  useLayoutEffect(() => {
    // console.log("Selected items: ", selectedItem); extractedDatas: extractedDatas,
    //const storeName = item.RefillingStation.stationName ?? null; //accessing the data passed from other screen
    //       rewardsData: rewardsData,
  }, [selectedItem, submitbuttonDataholder]);

  //get the NEW DELIVERY DETAILS collection

  const [newDeliveryDetails, setnewDeliveryDetails] = useState();
  useEffect(() => {
    const otherProducts = ref(db, "DELIVERY_DETAILS2/");
    const otherProductsQuery = query(
      otherProducts,
      orderByChild("adminId"),
      equalTo(selectedStationID)
    );

    const unsubscribe = onValue(otherProductsQuery, (snapshot) => {
      const data = snapshot.val();
      if (data && Object.keys(data).length > 0) {
        const otherProductsInfo = Object.keys(data).map((key) => ({
          id: key,

          ...data[key],
        }));
        setnewDeliveryDetails(otherProductsInfo);
      }

      //console.log("test if naa data--> data from rhea",otherProductsInfo)
    });
    return () => unsubscribe();
  }, [selectedStationID]);
  // console.log("DELIVERY DETAILS",newDeliveryDetails);

  //extract the swap options const neworderTypes = newDeliveryDetails?.[0].orderTypes.split(", ");
  const [swapOptions, setSwapOptions] = useState([]);

  useEffect(() => {
    const SwapOptions = newDeliveryDetails?.[0].swapOptions.split(", ");

    if (SwapOptions && SwapOptions[0]) {
      const splitValuesSwapOptionArray = SwapOptions.map((type, index) => ({
        label: type,
        value: type.toString(),
        key: index + 1,
      }));

      setSwapOptions(splitValuesSwapOptionArray);
    //  console.log("swap options",splitValuesSwapOptionArray);
    }
  }, [newDeliveryDetails]);
  useEffect(() => {
    if (swapOptions && swapOptions.length > 0) {
      // console.log("swap options",swapOptions[0]);
    }
  }, [swapOptions]);

  //swap option modal and handle keys
  const [showGallonsInputfield, setshowGallonsInputfield] = useState(false);
  const [showPickUpInputfield, setshowPickUpInputfield] = useState(false);
  const [showModal_RefillCheckbox, setshowModal_RefillCheckbox] =
    useState(false);
  const [checkedItemKey_SwapOption, setCheckedItemKey_SwapOption] =
    useState(null);
  const [selectedSwaption, setselectedSwaption] = useState(null);

  const handleItemchecked_swapOption = (item) => {
    setCheckedItemKey_SwapOption(
      item.key === checkedItemKey_SwapOption ? null : item.key
    );
    if (item.value === "Swap With Conditions") {
      setshowGallonsInputfield(true);
      setshowPickUpInputfield(false);
    } else if (item.value === "Swap Without Conditions") {
      setshowGallonsInputfield(false);
      setshowPickUpInputfield(false);
    } else if (item.value === "Request Pick-up") {
      // setshowPickUpInputfield(true);
      // setshowGallonsInputfield(false);
      //
      setshowPickUpInputfield(true);
      setshowGallonsInputfield(false);
    } else {
      setshowPickUpInputfield(false);
      setshowGallonsInputfield(false);
    }
  };
  const [input_SwapWithReservation, setinput_SwapWithReservation] = useState();
  const [input_PickupRequest, setinput_PickupRequest] = useState();

  //compute the total pick up fee
  useLayoutEffect(() => {
    if (
      newDeliveryDetails &&
      newDeliveryDetails.length > 0 &&
      newDeliveryDetails[0]
    ) {
      const perGallonFee = parseFloat(newDeliveryDetails[0].perGallonFee);
      const subtotal = (input_PickupRequest * perGallonFee).toFixed(2);

      if (!isNaN(subtotal)) {
        console.log("total fee", subtotal);
        settotalPickUpfee(subtotal);
      }
    }
  }, [newDeliveryDetails, input_PickupRequest]);
  const [totalPickUpfee, settotalPickUpfee] = useState(0);
  //submit button function
  const [submitbuttonDataholder, setsubmitbuttonDataholder] = useState();

  const submitbuttonfunction = () => {
    if (selectedSwaption === null) {
      alert("Please select an swap option");
    } else if (selectedSwaption === "Swap With Conditions") {
      if (!input_SwapWithReservation) {
        Alert.alert("Warning", "Please enter you gallon's condition.");
      } else {
        console.log("else if Swap With Conditions", submitbuttonDataholder);
        console.log("else if Swap With Conditions", selectedItem);
        ToastAndroid.show("Added to your cart", ToastAndroid.LONG);
        setCartCount((value) => value + 1); // every count, if mo click "+", it will increment by one
        setcartQuantity((value) => value + 1); //para mo reflect ang value sa count into "quantity variable"
        setSelectedItem((prevSelectedItems) => [
          ...prevSelectedItems,
          submitbuttonDataholder,
          // input_PickupRequest??null,
          // input_SwapWithReservation??null,
        ]);
        setshowModal_RefillCheckbox(false);
      }
    } else if (selectedSwaption === "Request Pick-up") {
      if (!input_PickupRequest) {
        Alert.alert("Warning", "Please enter how many gallons.");
      } else {
        console.log("else if Request Pick-up", submitbuttonDataholder);
        console.log("else if Request Pick-up", selectedItem);
        ToastAndroid.show("Added to your cart", ToastAndroid.LONG);
        setCartCount((value) => value + 1); // every count, if mo click "+", it will increment by one
        setcartQuantity((value) => value + 1); //para mo reflect ang value sa count into "quantity variable"
        setSelectedItem((prevSelectedItems) => [
          ...prevSelectedItems,
          submitbuttonDataholder,
          // input_PickupRequest??null,
          // input_SwapWithReservation??null,
        ]);
        setshowModal_RefillCheckbox(false);
      }
    } else if (selectedSwaption === "Swap Without Conditions") {
      ToastAndroid.show("Added to your cart", ToastAndroid.LONG);
      setCartCount((value) => value + 1); // every count, if mo click "+", it will increment by one
      setcartQuantity((value) => value + 1); //para mo reflect ang value sa count into "quantity variable"
      setSelectedItem((prevSelectedItems) => [
        ...prevSelectedItems,
        submitbuttonDataholder,
        // input_PickupRequest??null,
        // input_SwapWithReservation??null,
      ]);
      setshowModal_RefillCheckbox(false);
    } else {
      console.log("else", submitbuttonDataholder);
      console.log("else", selectedItem);
      ToastAndroid.show("Added to your cart", ToastAndroid.LONG);
      setCartCount((value) => value + 1); // every count, if mo click "+", it will increment by one
      setcartQuantity((value) => value + 1); //para mo reflect ang value sa count into "quantity variable"
      setSelectedItem((prevSelectedItems) => [
        ...prevSelectedItems,
        submitbuttonDataholder,
        // input_PickupRequest??null,
        //   input_SwapWithReservation??null,
      ]);
      setshowModal_RefillCheckbox(false);
      settotalPickUpfee(0);
    }
  };

  //my cart button

  const myCartFunction = () => {
    console.log("my cart function selected item", selectedItem);
    console.log(
      "my cart function value of unsa ang ge input ",
      input_SwapWithReservation
    );
    console.log("my cart function fee", totalPickUpfee);
    console.log("my cart function refill option", selectedSwaption);
    navigation.navigate("CartScreen", {
      paramnewDeliveryDetails: newDeliveryDetails,
      selectedItem,
      storeName,
      extractedDatas,

      totalPickUpfee,
      input_PickupRequest: input_PickupRequest ?? null,
      input_SwapWithReservation: input_SwapWithReservation ?? null,
      selectedSwaption,
    });
  };

  return (
    <ScrollView style={{ backgroundColor: "lightcyan" }}>
      <Modal
        transparent
        onRequestClose={() => {
          setshowModal_RefillCheckbox(false);
        }}
        visible={showModal_RefillCheckbox}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#00000099",
          }}
        >
          <View style={styles.swapOptionModal}>
            <View style={styles.modalTitle}>
              <Text
                style={{
                  marginTop: 8,
                  marginLeft: 0,
                  fontFamily: "nunito-bold",
                  fontSize: 20,
                }}
              >
                Refill Swap Option
              </Text>
              <View style={{ flex: 1, marginTop: 2 }} />
              <TouchableOpacity
                onPress={() => {
                  setshowModal_RefillCheckbox(false);
                  setCheckedItemKey_SwapOption(null);
                  setshowGallonsInputfield(false);
                  setinput_PickupRequest(false);
                  settotalPickUpfee(0);
                  setselectedSwaption(null);
                }}
              >
                <AntDesign
                  name="close"
                  size={20}
                  color="black"
                  style={{ marginTop: 5 }}
                />
              </TouchableOpacity>
            </View>
            <View
              style={{
                //  backgroundColor: "yellow",
                width: 300,
                marginTop: 0,
                left: 5,
                height: 230,
              }}
            >
              {/* checkbox codes */}
              <View
                style={{
                  // backgroundColor: "gray",
                  height: 120,
                }}
              >
                {swapOptions &&
                  swapOptions.map((item) => {
                    const isChecked = item.key === checkedItemKey_SwapOption;
                    return (
                      <View
                        key={item.key}
                        style={{
                          //backgroundColor: "red",
                          marginTop: 5,
                          height: 25,
                          borderRadius: 5,
                          padding: 0,
                          flexDirection: "row",
                          width: responsiveWidth(70),
                        }}
                      >
                        <TouchableOpacity
                          onPress={() => {
                            handleItemchecked_swapOption(item);
                            setCheckedItemKey_SwapOption(item.key);
                            setselectedSwaption(item.value);
                            console.log(
                              "If unsa ang ge click nga options",
                              item.key,
                              item.value
                            );
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
                            fontSize: 16,
                            flexDirection: "row",
                          }}
                        >
                          {item.label}
                        </Text>
                      </View>
                    );
                  })}
              </View>

              {/* pick fee codes */}
              {selectedSwaption === "Request Pick-up" && (
                <View style={{ left: 8 }}>
                  <Text
                    style={{
                      fontFamily: "nunito-light",
                      fontSize: 16,
                    }}
                  >
                    {`Pick up fee- ₱${newDeliveryDetails[0].perGallonFee}/ gallons \nTotal- ${totalPickUpfee}`}
                  </Text>
                </View>
              )}

              {/* gallons codes */}
              {showGallonsInputfield && (
                <View style={styles.swapOptionWithReservation}>
                  <TextInput
                    // placeholder={
                    //   selectedSwaption === "Swap With Conditions"
                    //     ? "Enter your gallon's condition"
                    //     : "Input only for swap with condition"
                    // }
                    placeholder="Enter your gallon's condition"
                    multiline={true}
                    placeholderTextColor="gray"
                    style={[
                      globalStyles.login_Email_textInput,
                      { fontSize: 15 },
                    ]}
                    keyboardType="text"
                    onChangeText={(text) => setinput_SwapWithReservation(text)}
                    editable={selectedSwaption === "Swap With Conditions"}
                  />
                </View>
              )}

              {/* many of gallons to be pick up */}
              {showPickUpInputfield && (
                <View style={styles.viewPickUpRequestInputfield}>
                  <TextInput
                    placeholder="How many gallons?"
                    multiline={false}
                    placeholderTextColor="gray"
                    style={[
                      globalStyles.login_Email_textInput,
                      { fontSize: 15 },
                    ]}
                    keyboardType="numeric"
                    onChangeText={(text) => setinput_PickupRequest(text)}
                  />
                </View>
              )}
            </View>
            {/* Submit button */}
            <View
              style={{
               // backgroundColor: "red",
                marginTop: 10,
                height: 50,
              }}
            >
              <TouchableOpacity
                onPress={
                  () => {
                    submitbuttonfunction();
                  }
                  // setShowReservationModal(false);
                }
              >
                <View
                  style={{
                    borderRadius: 10,
                    paddingVertical: 10,
                    paddingHorizontal: 10,
                    // backgroundColor: isDisabled ? "gray" : "#87cefa",
                    backgroundColor: "#87cefa",
                    marginTop: 10,
                    //marginBottom: 20,
                    width: 200,
                    left: 75,
                    height: 40,
                  }}
                >
                  <Text style={[globalStyles.buttonText, { left: -8,bottom:2 }]}>
                    Submit
                  </Text>
                  <MaterialIcons
                    name="login"
                    size={24}
                    color="black"
                    style={[globalStyles.loginIcon, { marginLeft: -80 }]}
                  />
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
            <Text style={styles.textwatername}>{storeName}</Text>
          </View>
        </View>
        <View style={styles.productWrapper}>
          {!tankSupply ||
          (tankSupply.length > 0 &&
            tankSupply[0].tankBalance === "0 gallons") ? (
            <View
              style={{
                padding: 5,
                backgroundColor: "whitesmoke",
                borderRadius: 10,
                elevation: 4,
                paddingHorizontal: 10,
                marginBottom: 25,
              }}
              key={item.id}
            >
              <Text style={{ fontSize: 16, fontFamily: "nunito-semibold" }}>
                {
                  "To our beloved customer!\nWater refill is not available for now, try our other products."
                }
              </Text>
            </View>
          ) : (
            <></>
          )}

          <View style={styles.wrapperWaterProduct}>
            <Text style={styles.waterProdStyle}>Water Refill</Text>

            <FlatList
              horizontal={true}
              contentContainerStyle={{
                flexDirection: "row",
                alignItems: "center",
              }}
              showsHorizontalScrollIndicator={false}
              data={productData}
              keyExtractor={(item, index) => item.prod_refillId}
              renderItem={({ item }) => (
                <View
                  style={styles.viewWaterItem_otherProduct}
                  key={item.prod_refillId}
                >
                  <Image
                    style={styles.waterImageStyle}
                    source={{ uri: imageUrl }}
                  />
                  <View
                    style={{ flexDirection: "row" }}
                  
                  >
                    <Text
                      style={{
                        fontSize: 21,
                        fontFamily: "nunito-reg",
                        flex: 1,
                      }}
                    >
                      {item.pro_refillWaterType}
                    </Text>
                    <Text
                      style={{
                        fontSize: 15,
                        fontFamily: "nunito-light",
                        textAlign: "right",
                        paddingVertical: 5,
                      }}
                    >
                      {item.pro_refillQty} {item.pro_refillUnitVolume}
                    </Text>
                  </View>
                  {item.pro_discount !== "0" &&
                  item.pro_discount.trim() !== "" ? (
                    <Text style={{ fontSize: 15, fontFamily: "nunito-light" }}>
                      Product's discount {item.pro_discount || 0}%
                    </Text>
                  ) : (
                    <Text style={{ fontSize: 15, fontFamily: "nunito-light" }}>
                      No available discount
                    </Text>
                  )}

                  <Text style={{ fontSize: 15, fontFamily: "nunito-light" }}>
                    ₱{item.pro_refillPrice}
                  </Text>

                  {/* <Text style={{ fontSize: 15, fontFamily: "nunito-light" }}>
                    Stocks: {item.pro_stockQty} {item.pro_stockUnit}
                  </Text> */}
                  {/* {item.pro_stockBalance&&item.pro_stockBalance !== "0" &&
                    item.pro_stockUnit.trim() !== "" && (
                      <Text
                        style={{ fontSize: 15, fontFamily: "nunito-light" }}
                      >
                      
                        Stocks: {item.pro_stockBalance} {item.pro_stockUnit}
                      </Text>
                    )} */}
                  {item.pro_stockBalance && item.pro_stockBalance !== "0" ? (
                    <Text style={{ fontSize: 15, fontFamily: "nunito-light" }}>
                      Stocks: {item.pro_stockBalance} {item.pro_stockUnit}
                    </Text>
                  ) : item.pro_stockBalance === "0" ||
                    ((item.pro_stockQty === "" || item.pro_stockQty === null) &&
                      item.pro_stockUnit) ? (
                    <Text style={{ fontSize: 15, fontFamily: "nunito-light" }}>
                      Out of stock
                    </Text>
                  ) : null}

                  {/* {item.pro_stockBalance !== "0" ? (
                    <Text style={{ fontSize: 15, fontFamily: "nunito-light" }}>
                      Stocks: {item.pro_stockBalance} {item.pro_stockUnit}
                    </Text>
                  ) : (
                    <Text style={{ fontSize: 15, fontFamily: "nunito-light" }}>
                      Out of stock
                    </Text>
                  )} */}
                  <View
                    style={{
                      flex: 1,
                      flexDirection: "column",
                      justifyContent: "flex-end",
                    }}
                  >
                    <TouchableOpacity
                      onPress={() => {
                        if (
                          selectedItem.some(
                            (selectedItem) => selectedItem.id === item.id
                          )
                        ) {
                          Alert.alert(
                            "Warning",
                            "You already selected this item"
                          );
                        } else {
                          showmodalRefillOption(item);
                        }
                      }}
                      //disabled={selectedItem.some((selectedItem) => selectedItem.id === item.id)}
                      disabled={item.pro_stockBalance === "0"}
                    >
                      <View
                        style={[
                          styles.viewAdttoCartOtherProduct,
                          { alignItems: "center" },
                        ]}
                      >
                        <MaterialCommunityIcons
                          name="cart-outline"
                          size={20}
                          color="black"
                          style={{ marginRight: 5 }}
                        />
                        <Text
                          style={{
                            fontFamily: "nunito-bold",
                            fontWeight: "bold",
                            textTransform: "none",
                            textAlign: "center",
                            fontSize: 18,
                            color: "black",
                            marginLeft: 0,

                            //flex: 1,
                          }}
                        >
                          Add to Cart
                        </Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            />
          </View>

          {/* label here to notify customer if the other product's stock is 0 */}

          {/*Third Party Products codes*/}

          <Text style={styles.otherProductLabelStyle}>
            Third Party Products
          </Text>
          <View style={{ height: responsiveHeight(55) }}>
            <FlatList
              horizontal={true}
              contentContainerStyle={{
                flexDirection: "row",
                alignItems: "center",
              }}
              showsHorizontalScrollIndicator={false}
              data={thirdPartyProducts}
              keyExtractor={(item, index) => item.thirdparty_productId}
              renderItem={({ item }) => (
                <View
                  style={styles.viewWaterItem_otherProduct}
                  key={item.thirdparty_productId}
                >
                  <Image
                    style={styles.waterImageStyle}
                    source={{ uri: thirdPartyProdsImage }}
                  />
                  <View
                    style={{ flexDirection: "row" }}
                    key={item.thirdparty_productId}
                  >
                    <Text
                      style={{
                        fontSize: 21,
                        fontFamily: "nunito-reg",
                        flex: 1,
                      }}
                    >
                      {item.thirdparty_productName}
                    </Text>
                    <Text
                      style={{
                        fontSize: 15,
                        fontFamily: "nunito-light",
                        textAlign: "right",
                        paddingVertical: 5,
                      }}
                    >
                      {item.thirdparty_productQty}{" "}
                      {item.thirdparty_productUnitVolume}
                    </Text>
                  </View>
                  {item.thirdparty_productDiscount.trim() !== "" ? (
                    <Text style={{ fontSize: 15, fontFamily: "nunito-light" }}>
                      Product's discount {item.thirdparty_productDiscount}%
                    </Text>
                  ) : (
                    <Text style={{ fontSize: 15, fontFamily: "nunito-light" }}>
                      No available discount
                    </Text>
                  )}

                  <Text style={{ fontSize: 15, fontFamily: "nunito-light" }}>
                    ₱{item.thirdparty_productPrice}
                  </Text>
                  {item.thirdparty_qtyStock !== "0" ? (
                    <Text style={{ fontSize: 15, fontFamily: "nunito-light" }}>
                      Stocks: {item.thirdparty_qtyStock}{" "}
                      {item.thirdparty_unitStock}
                    </Text>
                  ) : (
                    <Text style={{ fontSize: 15, fontFamily: "nunito-light" }}>
                      Out of stock
                    </Text>
                  )}

                  <View
                    style={{
                      flex: 1,
                      flexDirection: "column",
                      justifyContent: "flex-end",
                    }}
                  >
                    <TouchableOpacity
                      onPress={() => {
                        if (
                          selectedItem.some(
                            (selectedItem) => selectedItem.id === item.id
                          )
                        ) {
                          Alert.alert(
                            "Warning",
                            "You already selected this item"
                          );
                        } else {
                          showmodalRefillOption(item);
                        }
                      }}
                      //disabled={selectedItem.some((selectedItem) => selectedItem.id === item.id)}
                      disabled={item.thirdparty_qtyStock == "0"}
                    >
                      <View
                        style={[
                          styles.viewAdttoCartOtherProduct,
                          { alignItems: "center" },
                        ]}
                      >
                        <MaterialCommunityIcons
                          name="cart-outline"
                          size={20}
                          color="black"
                          style={{ marginRight: 5 }}
                        />
                        <Text
                          style={{
                            fontFamily: "nunito-bold",
                            fontWeight: "bold",
                            textTransform: "none",
                            textAlign: "center",
                            fontSize: 18,
                            color: "black",
                            marginLeft: 0,
                            //flex: 1,
                          }}
                        >
                          Add to Cart
                        </Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
              ListEmptyComponent={()=>{
              
                <Text style={{ fontSize: 24, fontFamily: "nunito-bold", color: "black" }}>
                  No third party products available
                </Text>
              
              }}
            />
          </View>

          {/* Store Review */}
          {/* {storeRatings && storeRatings.length > 0 ? (
            <Text style={styles.otherProductLabelStyle}>
              Review and Ratings
            </Text>
          ) : null} */}
          <TouchableOpacity
            onPress={() => {
              navigation.navigate("RatingScreen", {
                storeName,
                selectedStationID,
              });
              console.log("Test-");
            }}
          >
            <Text style={styles.otherProductLabelStyle}>
              View review and ratings here!
            </Text>
          </TouchableOpacity>
        </View>

        {/* touchable for the submit button */}
        <Pressable onPress={myCartFunction} disabled={cartCount === 0}>
          <View
            style={[
              styles.viewButtonStyle,
              {
                alignItems: "center",
                backgroundColor: cartCount > 0 ? "#87cefa" : "gray",
              },
            ]}
          >
            <MaterialCommunityIcons
              name="cart"
              size={20}
              color="black"
              style={{ marginRight: 5 }}
            />
            <Text
              style={{
                fontFamily: "nunito-bold",
                fontWeight: "bold",
                textTransform: "none",
                textAlign: "center",
                fontSize: 18,
                color: "black",
                marginLeft: 0,
              }}
            >
              My Cart
            </Text>
            <View style={{}}>
              <Text
                style={{
                  fontFamily: "nunito-bold",
                  fontWeight: "bold",
                  textTransform: "none",
                  textAlign: "center",
                  fontSize: 18,
                  color: "black",
                  marginLeft: 0,
                  //flex: 1,
                  textAlign: "right",
                  marginRight: -50,
                }}
              >
                {cartquantity}
              </Text>
            </View>
          </View>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  viewPickUpRequestInputfield: {
    flexDirection: "row",
    borderBottomColor: "black",
    borderBottomWidth: 1,
    paddingBottom: 2,

    width: 300,
    marginTop: 10,
    marginLeft: 7,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 1,
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
    marginRight: 5,
    // backgroundColor:'blue'
  },
  swapOptionModal: {
    width: responsiveWidth(90),
    height: 340,
    backgroundColor: "white",
    borderBottomColor: "gray",
    borderBottomWidth: 1,
    borderRadius: 3,
    elevation: 10,
  },
  modalTitle: {
    // backgroundColor:'red',
    justifyContent: "flex-start",
    padding: 0,
    flexDirection: "row",
    marginLeft: 5,
    padding: 4,
  },
  inputWrapper: {
    ///  backgroundColor: "green",
    paddingVertical: 5,
    marginTop: 5,
    height: 50,
    padding: 6,
  },
  swapOptionWithReservation: {
    flexDirection: "row",
    borderBottomColor: "black",
    borderBottomWidth: 1,
    paddingBottom: 2,

    width: 300,
    marginTop: 10,
    marginLeft: 7,
  },
  viewAdttoCartOtherProduct: {
    borderRadius: 7,
    backgroundColor: "#87cefa",
    width: "60%",
    justifyContent: "center",
    height: responsiveHeight(5),
    opacity: 0.7,
    alignContent: "center",
    alignItems: "center",
    //marginTop: 15,
    marginLeft: 45,
    flexDirection: "row",
    // height: 30,
  },
  viewAddtocart: {
    borderRadius: 7,
    backgroundColor: "#87cefa",
    width: "60%",
    justifyContent: "center",
    height: 40,
    opacity: 0.7,
    alignContent: "center",
    alignItems: "center",
    marginTop: 15,
    marginLeft: 45,
    flexDirection: "row",
    height: 30,
  },
  viewButtonStyle: {
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 10,
    // backgroundColor: "#87cefa",
    width: "60%",
    justifyContent: "center",
    height: 40,
    opacity: 0.9,
    alignContent: "center",
    //position: "absolute",
    alignItems: "center",
    marginTop: 30,
    bottom: 20,
    marginLeft: 75,
    flexDirection: "row",
    //justifyContent: "space-around"
  },
  container: {
    flex: 1,
    backgroundColor: "lightcyan",
  },
  viewBackBtn: {
    marginTop: 20,
    marginLeft: 10,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  productWrapper: {
    padding: 10,
    flex: 1,
    marginTop: 20,
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
    //  backgroundColor: "yellow",
    height: responsiveHeight(60),
  },
  waterProdStyle: {
    fontFamily: "nunito-semibold",
    fontSize: 20,
    marginLeft: 6,
  },
  viewWaterItem: {
    backgroundColor: "white",
    padding: 3,
    // marginBottom:40,
    width: 220,
    height: 320,
    marginLeft: 5,
    borderRadius: 10,
    marginRight: 5,
    shadowColor: "black",
    shadowRadius: 5,
    shadowOffset: {
      height: 5,
      width: 5,
    },
    elevation: 4,
  },
  waterImageStyle: {
    width: 212,

    height: 180,
    resizeMode: "contain",
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    marginLeft: 1,
    // backgroundColor: "yellow",
  },
  itemWrapper: {
    backgroundColor: "yellow",
    flexDirection: "row",
  },

  otherProductStyle: {
    backgroundColor: "coral",
    marginTop: 10,
    padding: 10,
  },
  otherProductLabelStyle: {
    fontFamily: "nunito-semibold",
    fontSize: 20,
    marginLeft: 5,
    // marginTop: 15,
  },
  otherProductView: {
    backgroundColor: "red",
    height: 300,
  },

  viewWaterItem_otherProduct: {
    backgroundColor: "white",
    padding: 3,
    marginTop: "20%",
    marginBottom: responsiveHeight(10),
    width: 220,
    height: responsiveHeight(50),
    marginLeft: 3,
    borderRadius: 10,
    marginRight: 5,
    shadowColor: "black",
    shadowRadius: 5,
    shadowOffset: {
      height: 5,
      width: 5,
    },
    elevation: 4,
  },

  viewReviewAndRatings: {
    backgroundColor: "white",
    padding: 3,
    marginTop: 10,
    marginBottom: 10,
    width: 220,
    height: 70,
    marginLeft: 3,
    borderRadius: 10,
    marginRight: 5,
    shadowColor: "black",
    shadowRadius: 5,
    shadowOffset: {
      height: 5,
      width: 5,
    },
    elevation: 4,
  },
  viewImageReview: {
    width: 30,
    height: 30,

    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,

    marginLeft: 4,
    marginTop: 2,
    //backgroundColor: "red",
  },
  square: {
    width: 40,
    height: 40,
    // backgroundColor: "red",
    // opacity: 0.4, #55BCF6
    borderRadius: 25,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "black",
    marginLeft: 5,
    marginTop: 5,

    //marginBottom:25
  },
  itemLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  reviewName: {
    fontSize: 17,
    fontFamily: "nunito-semibold",
    //backgroundColor:'red'
  },
});
