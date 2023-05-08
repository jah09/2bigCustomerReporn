import {
    StyleSheet,
    Text,
    View,
    Image,
    TouchableOpacity,
    ScrollView,
    SafeAreaView,
    Platform,
    Alert,
    ToastAndroid,
  } from "react-native";
  import CheckBox from "expo-checkbox";
  import React, { useState, useEffect } from "react";
  import { MaterialIcons } from "@expo/vector-icons";
  import { FontAwesome } from "@expo/vector-icons";
  import CustomButton from "../shared/customButton";
  import DateTimePicker from "@react-native-community/datetimepicker";
  import { useRoute } from "@react-navigation/native";
  import { globalStyles } from "../ForStyle/GlobalStyles";
  import { db } from "../firebaseConfig";
  import {
    set,
    ref,
    onValue,
    query,
    orderByChild,
    equalTo,
    off,
    get,
  } from "firebase/database";
  import AsyncStorage from "@react-native-async-storage/async-storage";
  import { getDistance } from "geolib";
  
  export default function ProductDetailsAndPlaceOrder({ navigation }) {
    const route = useRoute();
    const { item, extractedDatas } = route.params; //access the data from "myDatas object" from previous screen, esp the refillingStation-- in this case, and save it to variable and display
  
    //console.log("Product Details-->Admin clicked",extractedDatas);
    const passedStationName = extractedDatas.refillingStoreProperties.stationName;
    const passedAdminID = extractedDatas.adminProperties.adminID;
    const [totalAmount, settotalAmount] = useState("Total Amount");
    const [customerData, setCustomerData] = useState({}); //getting the customer's data from AsyncStorage
    //retrieve  Delivery Details Collection
    // useEffect(() => {
    //   const otherProducts = ref(db, "DELIVERYDETAILSTESTING/");
    //   const otherProductsQuery = query(
    //     otherProducts,
    //     orderByChild("adminId"),
    //     equalTo(passedAdminID)
    //   );
  
    //   const handleOthersProductsData = (snapshot) => {
    //     const productsData = [];
    //     snapshot.forEach((tanksuppSnapshot) => {
    //       const prodData = tanksuppSnapshot.val();
    //       productsData.push(prodData);
    //     });
    //     // console.log("naa ni",productsData);
    //     setDeliveryDetails(productsData);
    //   };
  
    //   onValue(otherProductsQuery, (snapshot) => {
    //     const data = snapshot.val();
  
    //     const otherProductsInfo = Object.keys(data).map((key) => ({
    //       id: key,
  
    //       ...data[key],
    //     }));
    //     //console.log("test if naa data",otherProductsInfo)
    //     setDeliveryDetails(otherProductsInfo);
    //   });
    // }, [passedAdminID]);
    useEffect(() => {
      const otherProducts = ref(db, "DELIVERY_DETAILS/");
      const otherProductsQuery = query(
        otherProducts,
        orderByChild("adminId"),
        equalTo(passedAdminID)
      );
  
      const handleOthersProductsData = (snapshot) => {
        const productsData = [];
        snapshot.forEach((tanksuppSnapshot) => {
          const prodData = tanksuppSnapshot.val();
          productsData.push(prodData);
        });
        // console.log("naa ni",productsData);
        setDeliveryDetails(productsData);
      };
  
      onValue(otherProductsQuery, (snapshot) => {
        const data = snapshot.val();
  
        const otherProductsInfo = Object.keys(data).map((key) => ({
          id: key,
  
          ...data[key],
        }));
        // console.log("test if naa data--> data from rhea",otherProductsInfo)
        setDeliveryDetails(otherProductsInfo);
      });
    }, [passedAdminID]);
    const [deliveryDetails, setDeliveryDetails] = useState([]);
    console.log("delivery Details", deliveryDetails);
    // const deliveryType =
    //   deliveryDetails.length > 0 ? deliveryDetails[0].deliveryType : null;
    const deliveryType =
    deliveryDetails.length > 0 ? deliveryDetails[0].type : null;
     
    console.log("delivery Details EXTRACTEDD", deliveryType);
    const [delivery_Types, setdelivery_Types] = useState();
    //console.log("test", delivery_Types);
    useEffect(() => {
      if (deliveryType) {
        const typesArray = Object.entries(deliveryType).map(([key, value]) => ({
          label: value.deliveryType,
          value: value.deliveryType,
          key: key,
        }));
  
        setdelivery_Types(typesArray);
      }
    }, [deliveryType]);
  
    //we check if deliveryDetails has any data before accessing the deliveryFee and deliveryDistance properties. If deliveryDetails is empty, we output an empty string ("") instead of undefined.
    //access the deliveryDetails property, the deliveryFee and deliveryDistance to compute the total amount for order
    const delivery_fee =
      deliveryDetails.length > 0 ? deliveryDetails[0].deliveryFee : "";
    const delivery_distance =
      deliveryDetails.length > 0 ? deliveryDetails[0].deliveryDistance : "";
    //console.log("delivery distance",delivery_distance)
    const customerLatt = parseFloat(customerData.lattitudeLocation); // console.log('Customer Latt-->', customerLatt);
    const customerLong = parseFloat(customerData.longitudeLocation); // console.log('Customer Latt-->', customerLong);
    const adminLatt = parseFloat(
      extractedDatas.refillingStoreProperties.lattitude
    );
    const adminLong = parseFloat(
      extractedDatas.refillingStoreProperties.longitude
    );
  
    const [count, setCount] = useState(0);
    //console.log("quantity->",count);
    const [amount, setAmount] = useState("Amount");
    const [imageUrl, setImageUrl] = useState("");
    useEffect(() => {
      if (item && item.length > 0 && item[0].pro_Image) {
        setImageUrl(item[0].pro_Image); // Set the image URL to the first product's pro_Image
      }
    }, [item]);
  
    //get the total amount base on initial amount, plus distance.
    useEffect(() => {
      const dynamicDistance = getDistance(
        { latitude: customerLatt, longitude: customerLong },
        { latitude: adminLatt, longitude: adminLong }
      );
      const customerDistanceToStation = dynamicDistance / 1000; //km
      // console.log("customer distance", customerDistanceToStation);
      // console.log('delivery distance',delivery_distance);
      if (customerDistanceToStation > delivery_distance) {
        const exceedingDistance = (
          customerDistanceToStation - delivery_distance
        ).toFixed(2);
  
        const additionalCost = parseFloat(delivery_fee) * exceedingDistance;
  
        const total = parseFloat(amount) + additionalCost;
  
        if (!isNaN(total)) {
          // console.log("inside if !nan", total);
          settotalAmount(total.toFixed(2));
        } else {
          settotalAmount("Total Amount");
        }
      } else {
        if (!isNaN(parseFloat(amount).toFixed(2))) {
          settotalAmount(parseFloat(amount).toFixed(2));
        } else {
          settotalAmount("Total Amount");
        }
      }
    }, [
      customerLatt,
      customerLong,
      adminLatt,
      adminLong,
      passedAdminID,
      amount,
      delivery_distance,
      delivery_fee,
    ]);
  
    //useEffecthooks for Delivery Type
    // useEffect(() => {
    //   const Delivery_types = deliveryDetails[0]?.deliveryType
    //     .split(", ")
    //     .map((type, index) => ({
    //       label: type,
    //       value: type.toLowerCase(),
    //       key: index + 1,
    //     }));
    //   setdelivery_Types(Delivery_types);
    // }, [deliveryDetails]);
  
    //useEffect for Order Type
    // useEffect(() => {
    //   const Order_types = deliveryDetails[0]?.orderType
    //     .split(", ")
    //     .map((type, index) => ({
    //       label: type,
    //       value: type.toLowerCase(),
    //       key: index + 1,
    //     }));
    //   setOrder_Types(Order_types);
    // }, [deliveryDetails]);
    const [order_Types, setOrder_Types] = useState();
  
    //useEffect for OrderMethod
    // useEffect(() => {
    //   const OrderMethod = deliveryDetails[0]?.orderMethod
    //     .split(", ")
    //     .map((type, index) => ({
    //       label: type,
    //       value: type.toLowerCase(),
    //       key: index + 1,
    //     }));
    //   setOrder_Method(OrderMethod);
    // }, [deliveryDetails]);
    const [order_Method, setOrder_Method] = useState();
  
    //retrieve the Data from customer DATA
    useEffect(() => {
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
  
    //for delivery type object with array--- and also checkbox on it-> codes start here
    const [isDisabled, setisDisabled] = useState(true);
  
    const [selectedDeliveryType, setSelectedDeliveryType] = useState(null);
    const [checkedItemKey_deliveryType, setCheckedItemKey_deliveryType] =
      useState(null);
    const handleItemChecked_deliveryType = (item) => {
      setCheckedItemKey_deliveryType(
        item.key === checkedItemKey_deliveryType ? null : item.key
      );
      setSelectedDeliveryType(item.value);
  
      if (item.value == "Reservation") {
        const selectedDelivery = deliveryType[item.key];
        const selectedDelivery2 = deliveryType[item.key];
        if (selectedDelivery && selectedDelivery.orderType) {
          const orderTypeValue = selectedDelivery.orderType;
          // console.log(`Standard---->ID: ${item.key}, orderTypeValue: ${orderTypeValue}`);
          const splitValues = orderTypeValue.split(", ");
          const orderTypesArr = splitValues.map((type, index) => ({
            label: type,
            value: type.toLowerCase(),
            key: index + 1,
            deliveryId: item.key, // add the deliveryId to each object
          }));
          // console.log("Reservation--->ORDER TYPES", orderTypesArr);
          setOrder_Types(orderTypesArr);
        }
        if (selectedDelivery2 && selectedDelivery2.orderMethod) {
          const orderMethodValue = selectedDelivery2.orderMethod;
          const splitValues = orderMethodValue.split(", ");
          const orderMethodArr = splitValues.map((type, index) => ({
            label: type,
            value: type.toLowerCase(),
            key: index + 1,
            deliveryId: item.key, // add the deliveryId to each object
          }));
          setOrder_Method(orderMethodArr);
          // setOrderMethods(orderMethodArr);
          // console.log("Reservation--->ORDER METHODS", orderMethodArr);
        }
      } else if (item.value == "Standard") {
        const selectedDelivery = deliveryType[item.key];
        const selectedDelivery2 = deliveryType[item.key];
        if (selectedDelivery && selectedDelivery.orderType) {
          const orderTypeValue = selectedDelivery.orderType;
          // console.log(`Standard---->ID: ${item.key}, orderTypeValue: ${orderTypeValue}`);
          const splitValues = orderTypeValue.split(", ");
          const orderTypesArr = splitValues.map((type, index) => ({
            label: type,
            value: type.toLowerCase(),
            key: index + 1,
            // deliveryId: item.key // add the deliveryId to each object
          }));
          setOrder_Types(orderTypesArr);
        }
        Alert.alert(
          "To our beloved customer",
          `Estimated delivery time for express is ${selectedDelivery.deliveryTime}`
        );
        if (selectedDelivery2 && selectedDelivery2.orderMethod) {
          const orderMethodValue = selectedDelivery2.orderMethod;
          const splitValues = orderMethodValue.split(", ");
          const orderMethodArr = splitValues.map((type, index) => ({
            label: type,
            value: type.toLowerCase(),
            key: index + 1,
            deliveryId: item.key, // add the deliveryId to each object
          }));
          setOrder_Method(orderMethodArr);
          //  console.log("Standard-->OrderMethod", orderMethodArr);
        }
      } else {
        //for order Type extraction
        const selectedDelivery = deliveryType[item.key];
        console.log("Delivery key of express", selectedDelivery);
        if (selectedDelivery && selectedDelivery.orderType) {
          const orderTypeVal = selectedDelivery.orderType;
          const splitValues = orderTypeVal.split(", ");
          const orderTypesArr = splitValues.map((type, index) => ({
            label: type,
            value: type.toLowerCase(),
            key: index + 1,
          }));
  
          setOrder_Types(orderTypesArr);
        }
        Alert.alert(
          "To our beloved customer",
          `Estimated delivery time for express is ${selectedDelivery.deliveryTime}`
        );
        //for order Method extraction
        const selectedDelivery2 = deliveryType[item.key];
        if (selectedDelivery2 && selectedDelivery2.orderMethod) {
          const orderMethodVal = selectedDelivery2.orderMethod;
          const splitValue = orderMethodVal.split(", ");
          const orderMethodArr = splitValue.map((type, index) => ({
            label: type,
            value: type.toLowerCase(),
            key: index + 1,
          }));
          setOrder_Method(orderMethodArr);
        }
      }
    };
  
    //for delivery type object with array--- and also checkbox on it-> codes end here
  
    //for order type object with array--- and also checkbox on it-> codes start here
  
    const [checkedItemKey_orderType, setCheckedItemKey_orderType] =
      useState(null);
  
    const handleItemChecked_orderType = (item) => {
      setCheckedItemKey_orderType(
        item.key === checkedItemKey_orderType ? null : item.key
      );
  
      setisDisabled(false);
    }; //for delivery type object with array--- and also checkbox on it-> codes end  here
  
    //for swapgallon type object with array--- and also checkbox on it-> codes start here
  
    // const [showDatePicker, setShowDatePicker] = useState(false);
    const [checkedItemKey_swapGallon, setCheckedItemKey_swapGallon] =
      useState(null);
    const handleItemchecked_swapgallon = (item) => {
      setCheckedItemKey_swapGallon(
        item.key === checkedItemKey_swapGallon ? null : item.key
      );
      setisDisabled(false);
    }; //for delivery type object with array--- and also checkbox on it-> codes end here
  
    const handleSubmit = () => {
      //check if the delivryType is null then alert
      if (checkedItemKey_deliveryType === null) {
        alert("Please choose a delivery type");
      }
      //
      else if (
        (checkedItemKey_deliveryType === "standard" ||
          checkedItemKey_deliveryType === "reservation") &&
        checkedItemKey_orderType === null
      ) {
        //This checks if the delivery type is either "standard" or "reservation". It uses the logical OR operator || to check if either of these conditions is true.
        alert("Please choose a order Type");
      } else if (
        checkedItemKey_deliveryType === "express" &&
        checkedItemKey_orderType !== null
      ) {
        // If both of these conditions are true, then the code inside of the block will execute and display an alert message
        alert("You don't need to select order type for  express delivery");
      } else {
        // handle button press here
        createOrder(customerData.cusId); //call this if all data is fill up
      }
    };
    //
    //for quantity counter codes
  
    const handleIncrement = () => {
      setCount((value) => value + 1); // every count, if mo click "+", it will increment by one
      setQuantity((value) => value + 1); //para mo reflect ang value sa count into "quantity variable"
    };
  
    const handleDecrement = () => {
      if (count > 0) {
        setCount((value) => value - 1);
        setQuantity((value) => value - 1);
      }
    };
  
    //function to compute the choosen quantity and the product price.
    const compute = () => {
      if (count > 0) {
        let waterprice; //declare a variable waterprice
        if (
          route.params.item &&
          route.params.item.other_productPrice &&
          route.params.item.pro_refillPrice
        ) {
          console.log(
            "Error: Both other_productPrice and pro_refillPrice are defined."
          );
        } else if (route.params.item && route.params.item.other_productPrice) {
          waterprice = route.params.item.other_productPrice;
        } else if (route.params.item && route.params.item.pro_refillPrice) {
          waterprice = route.params.item.pro_refillPrice;
        } else {
          console.log(
            "Error: Neither other_productPrice nor pro_refillPrice are defined."
          );
        }
  
        const total = waterprice * count;
        setAmount(total.toFixed(2));
        setInitialAmount(total.toFixed(2));
      } else {
        setAmount("Amount");
      }
    };
    useEffect(() => {
      compute();
    }, [count]);
  
    const [date, setDate] = useState(new Date());
    const [mode, setMode] = useState("date");
    const [show, setShow] = useState(false);
    const [text, setText] = useState("Reservation Date");
  
    const onChange = (event, selectedDate) => {
      const currentDate = selectedDate || date;
      setShow(Platform.OS === "ios");
      setDate(currentDate);
  
      let temporaryDate = new Date(currentDate);
      let fdate =
        temporaryDate.getDate() +
        "/" +
        (temporaryDate.getMonth() + 1) +
        "/" +
        temporaryDate.getFullYear();
      setText(fdate);
      setReservationDate(fdate);
      // alert("Order", "Order successfully.", "OK");
      //console.log("testdaw" + fdate);
    };
    const showMode = (currentMode) => {
      setShow(true);
      setMode(currentMode);
    };
  
    //storing the fetch to a variable
  
    const [waterproduct, setWaterproduct] = useState(
      item.pro_refillWaterType || item.other_productName
    );
    const [waterprice, setWaterprice] = useState(
      route.params.item.other_productPrice || route.params.item.pro_refillPrice
    );
    const [quantity, setQuantity] = useState(count);
    const [initialAmount, setInitialAmount] = useState(amount);
    const [deliveryTypeValue, setdeliveryTypeValue] = useState(delivery_Types);
    const [orderTypeValue, setOrderTypeValue] = useState(order_Types ?? null); //pass the order Type  value, "??" is used to check if null ba or di
  
    const [orderMethod, setOrdeMethod] = useState(order_Method);
    const [orderStatus, setOrderStatus] = useState("Pending");
    const [reservationDate, setReservationDate] = useState("");
  
    const order_Size = `${item.pro_refillSize || item.other_productSize}`;
    const order_Unit = `${item.pro_refillUnit || item.other_productUnit}`;
  
    //{item.pro_refillSize || item.other_productSize} {item.pro_refillUnit || item.other_productUnit}
    //function to insert the data to database
    const createOrder = (CUSTOMERID) => {
      const RandomId = Math.floor(Math.random() * 50000) + 10000;
      //const newOrderRef = push(ref(db, "Orders"));
  
      const newOrderKey = RandomId;
      set(ref(db, `ORDERS/${newOrderKey}`), {
        orderID: newOrderKey,
        admin_ID: passedAdminID,
        order_StoreName: passedStationName,
        order_ProductName: waterproduct,
        order_WaterPrice: waterprice,
        order_Quantity: quantity,
        order_InitialAmount: initialAmount,
        order_DeliveryTypeValue: deliveryTypeValue,
        order_OrderTypeValue: orderTypeValue,
        //order_SwapGallonTypeValue: swapgallonTypeValue,
        order_OrderMethod: orderMethod,
        order_OrderStatus: orderStatus,
        order_ReservationDate: reservationDate,
        order_unit: order_Unit,
        order_size: order_Size,
        cusId: CUSTOMERID,
      })
        .then(async () => {
          // console.log('Test if Save to db-----'+reservationDate );
          console.log("New Order with the Order ID of --->", newOrderKey);
  
          ToastAndroid.show(
            "Order successfully. Thank you for ordering" +
              " " +
              passedStationName +
              ".",
            ToastAndroid.LONG
          );
          // Alert.alert("Confirmation", "Order successfully.", [
          //   {
          //     text: "Yes",
          //     onPress: () => {
          //       console.log("Ok pressed");
          //     },
          //   },
          // ]);
          //reset input fields
          setCheckedItemKey_deliveryType(null);
          setCheckedItemKey_orderType(null);
          setCheckedItemKey_swapGallon(null);
          setAmount("Amount");
  
          setCount(0);
        })
        .catch((error) => {
          console.log("Error Saving to Database", error);
          alert("Error", JSON.stringify(error), "OK");
        });
    };
  
    //disable reservation date view/icon if customer will select express or standard
  
    return (
      <SafeAreaView style={styles.safeviewStyle}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View style={styles.container}>
            <View style={styles.viewBackBtn}>
              <MaterialIcons
                name="arrow-back-ios"
                size={24}
                color="black"
                onPress={() => navigation.goBack()}
              />
              <View style={styles.viewwatername}>
                <Text style={styles.textwatername}>{passedStationName}</Text>
                {/* 
                <View
                  style={{ justifyContent: "flex-end", right: -60, width: 30 }}
                >
                  <TouchableOpacity
                    onPress={() => {
                      navigation.navigate("OrderScreen");
                      //console.log('3rd screen test--'+ route.params.storeName)
                    }}
                  >
                    <FontAwesome name="shopping-cart" size={22} color="black" />
                  </TouchableOpacity>
                </View> */}
              </View>
            </View>
            <View style={styles.productDetailswrapper}>
              <View style={styles.wrapperWaterProduct}>
                <Text style={styles.waterProdStyle}>Product Details </Text>
                <View style={styles.viewWaterItem}>
                  <Image
                    style={styles.waterImageStyle}
                    source={{ uri: item.pro_Image || item.other_productImage }}
                  />
  
                  <Text
                    style={{
                      fontSize: 21,
                      fontFamily: "nunito-reg",
                      marginTop: 5,
                      marginLeft: 5,
                    }}
                  >
                    {item.pro_refillWaterType || item.other_productName}
                  </Text>
                  <Text
                    style={{
                      fontSize: 16,
                      fontFamily: "nunito-light",
                      marginLeft: 5,
                    }}
                  >
                    {item.pro_refillSize || item.other_productSize}{" "}
                    {item.pro_refillUnit || item.other_productUnit}
                  </Text>
                  <Text
                    style={{
                      fontSize: 16,
                      fontFamily: "nunito-light",
                      marginLeft: 5,
                    }}
                  >
                    ₱{item.pro_refillPrice || item.other_productPrice}
                  </Text>
                  {item.other_productDiscount ? (
                    <Text
                      style={{
                        fontSize: 15,
                        fontFamily: "nunito-light",
                        marginLeft: 5,
                        marginTop: 3,
                      }}
                    >
                      This product offers{" "}
                      <Text style={{ fontWeight: "bold" }}>
                        {item.other_productDiscount}{" "}
                      </Text>
                      . {""}
                      {/* Every order of {"\n"}5 bottles, get 1 free. Buy now! */}
                    </Text>
                  ) : null}
  
                  <View
                    style={{
                      width: 50,
                      justifyContent: "center",
                      alignItems: "center",
                      marginLeft: 140,
                      marginTop: 10,
                      padding: 1,
                    }}
                  >
                    <Text style={{ fontFamily: "nunito-semibold", fontSize: 20 }}>
                      x {count}
                    </Text>
                  </View>
  
                  <View
                    style={{
                      flexDirection: "row-reverse",
                      marginVertical: -70,
                      right: 5,
                    }}
                  >
                    <TouchableOpacity onPress={handleIncrement}>
                      <Image
                        source={require("../assets/plusIcon.png")}
                        style={{ width: 20, height: 20 }}
                      />
                    </TouchableOpacity>
                  </View>
  
                  <View
                    style={{
                      flexDirection: "row-reverse",
                      marginVertical: 80,
                      right: 5,
                    }}
                  >
                    <TouchableOpacity onPress={handleDecrement}>
                      <Image
                        source={require("../assets/minus-math.png")}
                        style={{ width: 20, height: 20 }}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
  
                <View style={styles.viewforOrder}>
                  <View>
                    <Text
                      style={{
                        fontFamily: "nunito-semibold",
                        fontSize: 20,
                        marginLeft: 75,
                      }}
                    >
                      Place your order below.
                    </Text>
                  </View>
                </View>
                <View style={styles.viewQuantity}>
                  <Text
                    style={{
                      fontSize: 17,
                      fontFamily: "nunito-semibold",
                      marginLeft: 10,
                    }}
                  >
                    {amount}
                  </Text>
                </View>
  
                {/*DELIVERYTYPE VIEW*/}
                <View style={styles.ViewforDelivery}>
                  <Text
                    style={{
                      fontSize: 17,
                      fontFamily: "nunito-semibold",
                      marginLeft: 5,
                    }}
                  >
                    Delivery Type
                  </Text>
                  {delivery_Types &&
                    delivery_Types.map((item) => {
                      const isChecked = item.key === checkedItemKey_deliveryType;
                      return (
                        <View
                          key={item.key}
                          style={{
                            //backgroundColor: "red",
                            marginTop: 35,
                            height: 25,
                            borderRadius: 5,
                            padding: 0,
                            flexDirection: "row",
                            width: 100,
  
                            justifyContent: "center",
                            marginLeft: -75,
                            marginRight: 80,
                            // elevation: 2,
                            alignItems: "center",
                          }}
                        >
                          <TouchableOpacity
                            onPress={() => {
                              handleItemChecked_deliveryType(item);
  
                              setdeliveryTypeValue(item.value);
                              setCheckedItemKey_deliveryType(item.key);
                              console.log(
                                "if unsa ang ge click nga value/key/label--->",
                                item.value,
                                item.key,
                                item.label
                              );
                              // console.log(
                              //   "if unsa ang geclick nga key--",
                              //   item.key
                              // );
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
  
                {/* order type */}
                <View style={styles.viewOrderType}>
                  <Text
                    style={{
                      fontSize: 17,
                      fontFamily: "nunito-semibold",
                      marginLeft: 5,
                    }}
                  >
                    Order Type
                  </Text>
                  {order_Types &&
                    order_Types.map((item) => {
                      const isChecked = item.key === checkedItemKey_orderType;
                      return (
                        <View
                          key={item.key}
                          style={{
                            // backgroundColor: "red",
                            marginTop: 35,
                            height: 25,
                            borderRadius: 5,
                            padding: 0,
                            flexDirection: "row",
                            width: 100,
  
                            justifyContent: "center",
                            marginLeft: -65,
                            marginRight: 68,
                            // elevation: 2,
                            alignItems: "center",
                          }}
                        >
                          <TouchableOpacity
                            onPress={() => {
                              handleItemChecked_orderType(item);
                              setOrderTypeValue(item.value);
                              // console.log('Order Type clicked value-->',item.value);
                            }}
                            disabled={selectedDeliveryType === "Express"}
                          >
                            <View
                              style={{
                                width: 18,
                                height: 18,
                                borderWidth: 1,
                                borderRadius: 4,
                                justifyContent: "center",
                                alignItems: "center",
                                marginLeft: 0,
                                marginRight: 5,
                                borderColor:
                                  selectedDeliveryType == "Express"
                                    ? "darkgray"
                                    : "black",
                              }}
                            >
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
                              color:
                                selectedDeliveryType === "Express"
                                  ? "darkgray"
                                  : "black",
                            }}
                          >
                            {item.label}
                          </Text>
                        </View>
                      );
                    })}
                </View>
  
                {/*order MEthod */}
                <View style={styles.viewforSwapGallong}>
                  <Text
                    style={{
                      fontSize: 17,
                      fontFamily: "nunito-semibold",
                      marginLeft: 5,
                    }}
                  >
                    Order Method
                  </Text>
                  {order_Method &&
                    order_Method.map((item) => {
                      const isChecked = item.key === checkedItemKey_swapGallon;
                      return (
                        <View
                          key={item.key}
                          style={{
                            //backgroundColor: "red",
                            marginTop: 35,
                            height: 25,
                            borderRadius: 5,
                            padding: 0,
                            flexDirection: "row",
                            width: 100,
  
                            justifyContent: "center",
                            marginLeft: -85,
                            marginRight: 95,
                            // elevation: 2,
                            alignItems: "center",
                          }}
                        >
                          <TouchableOpacity
                            onPress={() => {
                              handleItemchecked_swapgallon(item);
                              setOrdeMethod(item.value);
                              console.log(
                                "Order Method clicked Value -->",
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
  
                <View style={styles.viewReservationdate}>
                  <Text
                    style={{
                      fontSize: 17,
                      fontFamily: "nunito-semibold",
                      marginLeft: 2,
                    }}
                  >
                    {text}
                  </Text>
                  <TouchableOpacity
                    activeOpacity={0.5}
                    onPress={() => {
                      if (selectedDeliveryType === "Reservation") {
                        showMode("date");
                      }
                    }}
                  >
                    <MaterialIcons
                      name="date-range"
                      size={23}
                      color={
                        selectedDeliveryType === "Reservation" ? "black" : "gray"
                      }
                      style={{ marginTop: -4, marginLeft: 10 }}
                    />
                  </TouchableOpacity>
                </View>
  
                {show && (
                  <DateTimePicker
                    testID="dateTimePicker"
                    value={date}
                    mode={mode}
                    is24Hour={true}
                    display="default"
                    onChange={onChange}
                  />
                )}
                <View style={styles.viewTotalAmount}>
                  <Text
                    style={{
                      fontSize: 17,
                      fontFamily: "nunito-semibold",
                      marginLeft: 10,
                    }}
                  >
                    {totalAmount}
                  </Text>
                </View>
                <View
                  style={{
                    // backgroundColor: "red",
                    padding: 10,
                    marginTop: 40,
                    height: 50,
                  }}
                >
                  <View
                    style={{
                      backgroundColor: "transparent",
                      marginTop: 20,
                      height: 50,
                    }}
                  >
                    <TouchableOpacity
                      // onPress={() => {
                      //  // navigation.navigate("OrderScreen");
                      //  create
                      // }}
                      onPress={handleSubmit}
                      disabled={isDisabled}
                      // disabled={!ifChecked}
                    >
                      <View
                        style={{
                          borderRadius: 10,
                          paddingVertical: 10,
                          paddingHorizontal: 10,
                          backgroundColor: isDisabled ? "gray" : "#87cefa",
                          marginTop: 0,
                          //marginBottom: 20,
                          width: 200,
                          left: 70,
                          height: 40,
                        }}
                      >
                        <Text
                          style={[
                            globalStyles.buttonText,
                            { marginTop: 0, left: -8 },
                          ]}
                        >
                          Place Order
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
  
                {/* custom button */}
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "lightcyan",
      flexWrap: "wrap",
    },
    checkbox: {
      width: 18,
      height: 18,
      borderWidth: 1,
      borderRadius: 4,
      justifyContent: "center",
      alignItems: "center",
      marginLeft: 0,
      marginRight: 5,
      // backgroundColor:'blue'
    },
    checkboxMark: {
      width: 10,
      height: 10,
      borderRadius: 10,
      backgroundColor: "black",
    },
  
    viewBackBtn: {
      //backgroundColor: "coral",
      marginTop: 20,
      marginLeft: 10,
      width: "100%",
      flexDirection: "row",
      alignItems: "center",
    },
    productDetailswrapper: {
      // backgroundColor: "green",
      padding: 10,
      //flex: 1,
      marginTop: 15,
      height: 1000,
    },
    viewwatername: {
      //backgroundColor:'red',
      width: 150,
      marginHorizontal: 83,
      flexDirection: "row",
      justifyContent: "space-evenly",
    },
    textwatername: {
      fontSize: 20,
      fontFamily: "nunito-bold",
      fontWeight: "bold",
    },
    wrapperWaterProduct: {
      //backgroundColor: "red",
      flex: 1,
    },
    waterProdStyle: {
      fontFamily: "nunito-semibold",
      fontSize: 20,
      marginLeft: 6,
    },
    viewWaterItem: {
      backgroundColor: "white",
      padding: 3,
      marginTop: 10,
      width: 332,
      height: 370,
      marginLeft: 5,
      borderRadius: 10,
      marginRight: 5,
      shadowColor: "black",
      shadowRadius: 5,
      shadowOffset: {
        height: 5,
        width: 5,
      },
      elevation: 7,
    },
    waterImageStyle: {
      width: 323,
      height: 223,
      resizeMode: "contain",
      borderTopLeftRadius: 10,
      borderTopRightRadius: 10,
      borderBottomLeftRadius: 10,
      borderBottomRightRadius: 10,
      marginLeft: 1,
    },
    itemWrapper: {
      backgroundColor: "yellow",
      flexDirection: "row",
    },
  
    viewforOrder: {
      padding: 15,
      //backgroundColor:'coral',
      marginTop: 10,
    },
  
    viewQuantity: {
      backgroundColor: "white",
      width: 120,
      height: 30,
      padding: 6,
      borderRadius: 8,
      // borderColor: "black",
      // borderWidth: 1,
      marginTop: 10,
      elevation: 3,
      justifyContent: "center",
      // alignItems:'center'
    },
    ViewforDelivery: {
      backgroundColor: "white",
      width: 120,
      height: 30,
      padding: 6,
      borderRadius: 8,
      marginTop: 10,
      elevation: 3,
      flexDirection: "row",
      //marginRight:5,
      //justifyContent:'space-between',
    },
    viewOrderType: {
      backgroundColor: "white",
      width: 120,
      height: 30,
      padding: 6,
      borderRadius: 8,
      marginTop: 50,
      elevation: 3,
      flexDirection: "row",
    },
    viewforSwapGallong: {
      backgroundColor: "white",
      width: 120,
      height: 30,
      padding: 6,
      borderRadius: 8,
      marginTop: 50,
      elevation: 3,
      flexDirection: "row",
      //flex:1
    },
    safeviewStyle: {
      flex: 1,
    },
    viewReservationdate: {
      backgroundColor: "white",
      width: 170,
      height: 30,
      padding: 6,
      borderRadius: 8,
      marginTop: 55,
      elevation: 3,
      flexDirection: "row",
      justifyContent: "center",
    },
    viewforCustomButton: {
      backgroundColor: "blue",
      marginLeft: 15,
      top: 70,
      width: 100,
    },
    ViewCheckbox: {
      flexDirection: "row",
      alignItems: "center",
      //backgroundColor: "red",
    },
    checkboxContainer: {
      backgroundColor: "red",
      borderWidth: 0,
      padding: 0,
      marginRight: 50,
    },
    checkboxText: {
      marginRight: 50,
    },
    viewTotalAmount: {
      backgroundColor: "white",
      width: 120,
      height: 30,
      padding: 6,
      borderRadius: 8,
      // borderColor: "black",
      // borderWidth: 1,
      marginTop: 15,
      elevation: 3,
      justifyContent: "center",
      // marginBottom:10
    },
  });
  