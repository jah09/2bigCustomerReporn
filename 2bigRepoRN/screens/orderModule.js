import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  FlatList,
  ToastAndroid,
  Image,
  Dimensions,
} from "react-native";
import {
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import { AntDesign } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import React, { useState, useEffect, useLayoutEffect } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useRoute } from "@react-navigation/native";
import { globalStyles } from "../ForStyle/GlobalStyles";
import { db } from "../firebaseConfig";
import {
  ref,
  onValue,
  orderByChild,
  query,
  equalTo,
  child,
  update,
  set,
} from "firebase/database";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ScrollView } from "react-native-web";

export default function OrderModule({}) {
  // const deviceHeight = Dimensions.get("window").height;
  // const deviceWidth = Dimensions.get("window").width;
  const [deviceHeight, setdeviceHeight] = useState();
  const [deviceWidth, setdeviceWidth] = useState();

  useEffect(() => {
    const deviceHeight = Dimensions.get("window").height;
    const deviceWidth = Dimensions.get("window").width;
    setdeviceWidth(deviceWidth);
    setdeviceHeight(deviceHeight);
    console.log("device height line 40---->", deviceHeight);
    console.log("devide width line 41---->", deviceWidth);
  }, []);

  const styleTypes = ["default", "dark-content", "light-content"];
  const [visibleStatusBar, setvisibleStatusbar] = useState(false);
  const [styleStatusBar, setstyleStatusBar] = useState(styleTypes[0]);
  const navigation = useNavigation();
  const route = useRoute();
  const [customerData, setCustomerData] = useState();
  const [customerId, setCustomerId] = useState(null);
  // console.log('orderDetails-customerData--',customerData);
  const [orderInfo, setOrderInfo] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [selectedItemID, setSelectedItemID] = useState(null);
  //  console.log("line 54", selectedItemID);
  const onPressHandlerShowModal = (item) => {
    //console.log("line 52", item);
    const { admin_ID, order_StoreName, orderID } = item.item;
    // console.log("test 49", orderID);
    setSelectedItemID({ admin_ID, order_StoreName, orderID });
    setShowModal(true);
  };

  const [driverData, setDriverData] = useState();
  const [driverLocation, setDriverLocation] = useState();
  //console.log("line 52",driverLocation);
 
  
 
  useEffect(()=>{
    if(orderIDfrom_handleViewDriverLocation && orderInfo){
      const order = orderInfo.find((order) => order.orderID === orderIDfrom_handleViewDriverLocation);
      //const order = orderInfo.find((order) => order.orderID === orderIDfrom_handleViewDriverLocation);
      if(order){
        const orderStatus = order.order_OrderStatus;
        console.log("Order Status:", orderStatus);  
        if (orderStatus === "Delivered" || orderStatus === "Payment Received") {
          // Order status is "Delivered" or "Payment Received", hide the polyline
          setdisplayPolyline(false);
          navigation.navigate("Maps", {displayPolyline: displayPolyline });
        } else if (orderStatus === "Accepted") {
          // Order status is "Accepted", show the polyline
          setdisplayPolyline(true);
          navigation.navigate("Maps", {displayPolyline: displayPolyline });
        }
      }
    }
   },[orderIDfrom_handleViewDriverLocation,orderInfo])
   const [displayPolyline,setdisplayPolyline]=useState(true);
  //function nga mo filter if unsa ang GE CLICK NGA DRIVER'S LOCATION, E PASA DIRE ANG ORDER ID NGA GE PRESSED OG ANG DRIVER LOCATION
  const handleViewDriverLocation = (driverId, orderId) => {
    const order = orderInfo.find((order) => order.orderID === orderId);
    setorderIDfrom_handleViewDriverLocation(orderId);
    
    if (order) {  
      console.log("inside line 85", orderId);
      const driverLatLong = driverLocation.find((driver) => driver.driverId === driverId) || null;
      
      if (driverLatLong) {
        console.log("Driver LatLong", driverLatLong);
        // do something with the driverLatLong, such as navigate to the Maps screen and pass it as a parameter
        navigation.navigate("Maps", { driverLatLong, displayPolyline: displayPolyline });
      } else {
        console.log("Driver not found with ID", driverId);
      }
    } else {
      console.log("Order not found with ID", orderId);
    }
  };
  const [orderIDfrom_handleViewDriverLocation,setorderIDfrom_handleViewDriverLocation]=useState();

  //get the employee data
  useLayoutEffect(() => {
    const empRef = ref(db, "EMPLOYEES/");

    onValue(empRef, (snapshot) => {
      // const storePic=snapshot.val();
      const data = snapshot.val();
      //  console.log("to pass data test",data);
      if (data && Object.keys(data).length > 0) {
        const newEmpInfo = Object.keys(data).map((key) => ({
          id: key,

          ...data[key],
        }));

        setDriverData(newEmpInfo);
      }

      //console.log('ORDER SCREEN- DATA FROM EMPLOYEE COLLECTION RECEIVED',newEmpInfo); //test if successfully fetch the datas in STOREINFORMATION
    });
  }, []);

  //get the customer ID from Async in login screen and extract it and Save to customerID
  useLayoutEffect(() => {
    AsyncStorage.getItem("customerData") //e get ang Asycn sa login screen
      .then((data) => {
        if (data !== null) {
          //if data is not null
          const parsedData = JSON.parse(data); //then e store ang Data into parsedData
          setCustomerData(parsedData); //passed the parsedData to customerDta
          const CustomerUID = parsedData.cusId;
          setCustomerId(CustomerUID);
        }
      })
      .catch((error) => {
        console.log(error);
        alert("Error fetching data: ", error);
      });
  }, []);

  //get the ORDER COLLECTION and filtered it, as requirement needed
  useLayoutEffect(() => {
    const orderRef = ref(db, "ORDERS/");
    if (customerId) {
      //console.log("orderDetailsScreen", customerId);
      const Orderquery = query(
        orderRef,
        orderByChild("cusId"),
        equalTo(customerId)
      );

      onValue(
        Orderquery,
        (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.val();
            if (data && Object.keys(data).length > 0) {
              const OrderInformation = Object.keys(data).map((key) => ({
                id: key,

                ...data[key],
              }));
              // console.log("line 95", data);
              const filteredOrderData = OrderInformation.filter(
                (order) =>
                  order.order_OrderStatus === "Accepted" ||
                  order.order_OrderStatus === "Out for Delivery" ||
                  order.order_OrderStatus === "Pending" ||
                  order.order_OrderStatus === "Delivered" ||
                  order.order_OrderStatus === "Payment Received"
              );

              filteredOrderData.forEach((order) => {
                const products = order.order_Products.map((product) => ({
                  productId: product.order_ProductId,
                  productName: product.order_ProductName,
                  productPrice: product.order_ProductPrice,
                  productsize: product.order_size,
                  productUnit: product.order_unit,
                }));

                // console.log("161",{
                //   ...order,
                //   order_Products: products,
                // });
              });
              //console.log("Extracted data", JSON.stringify(filteredOrderData));

              const empLatlong = filteredOrderData.map((order) => {
                const emp =
                  (driverData || []).find(
                    (emp) => emp.emp_id === order.driverId
                  ) || null;
                if (emp) {
                  return {
                    ...order,
                    driverLatt: emp.latitude,
                    driverLong: emp.longitude,
                  };
                } else {
                  return order;
                }
              });
              // console.log("line 164",empLatlong);
              setDriverLocation(empLatlong);
              // console.log("line 146", JSON.stringify(filteredOrderData));
              setOrderInfo(filteredOrderData);
            }
          } else {
            // console.log("No orders found for customer---", customerId);
            // alert("No order found, please make an order first.");
            console.log("No orders found for customer---", customerId);
          }
        },
        (error) => {
          console.log("Error fetching orders", error);
        }
      );
    }
  }, [customerId, driverData]);

  //it goes here
  const updateOrderStatus = (orderID, status) => {  
    const ordersRef = ref(db, "ORDERS/");
    const orderRef = child(ordersRef, orderID.toString());
    update(orderRef, {
      order_OrderStatus: status,
    })
      .then(() => {
        console.log(`Order ${orderID} status updated to ${status}`);
      })
      .catch((error) => {
        console.log(`Error updating order ${orderID} status: ${error}`);
      });
  };

  //insert review and ratings for the store
  const [textinput_Feedback, setTextInput_Feedback] = useState();
  // console.log("text",textinput_Feedback);
  const [ratings, setRatings] = useState();
  // console.log("arte",ratings);
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);

  //function to check if the feedback input and rating is having a data.
  const handleSubmit = () => {
    if (textinput_Feedback === null || textinput_Feedback.length > 25) {
      // ToastAndroid.show(
      //   "Please enter a feedback or review with at least 20 characters",
      //   ToastAndroid.LONG
      // );
      alert("Please enter a feedback or review with at least 20 characters");
      setIsButtonDisabled(true);
    } else if (
      typeof textinput_Feedback !== "string" ||
      !/^[a-zA-Z\s]+$/.test(textinput_Feedback)
    ) {
      alert(
        "Please enter a valid feedback. Only letters and spaces are allowed."
      );
    } else if (ratings === null || ratings < 1 || ratings > 5) {
      //alert("Please enter a ratings");
      alert("Please enter a valid rating.");
      setIsButtonDisabled(true);
    } else {
      console.log("this line", customerData.cusId);
      createReview(customerData.cusId);
      setShowModal(false);
      setIsButtonDisabled(false);
    }
    //  console.log("this line",customerData.cusId)
  };

  //get the current date
  useEffect(() => {
    const functionsetCurrentDate = () => {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, "0");
      const day = String(today.getDate()).padStart(2, "0");
      const hours = String(today.getHours()).padStart(2, "0");
      const minutes = String(today.getMinutes()).padStart(2, "0");
      const seconds = String(today.getSeconds()).padStart(2, "0");
      const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
      setCurrentDate(formattedDate);

      return formattedDate;
    };

    functionsetCurrentDate();
  }, []);

  const [currentDate, setCurrentDate] = useState("");
  //create review for the station
  const createReview = (customerId) => {
    const RandomId = Math.floor(Math.random() * 50000) + 10000;
    //const newOrderRef = push(ref(db, "Orders"));
    // console.log("selected adminID",selectedItemID.admin_ID);
    console.log("cusID", customerId);
    console.log("feedback and ratings", textinput_Feedback, ratings);
    const newRandomKey = RandomId;
    console.log("Random ID", newRandomKey);
    set(ref(db, `STOREREVIEW/${newRandomKey}`), {
      adminID: selectedItemID.admin_ID,
      orderId: selectedItemID.orderID,
      cusId: customerId,
      feedback: textinput_Feedback,
      ratings: parseFloat(ratings),
      customerFirstName: customerData.firstName,
      customerLastName: customerData.lastName,
    })
      .then(async () => {
        // console.log('Test if Save to db-----'+reservationDate );
        console.log(
          "New Store Review with the Review ID of --->",
          newRandomKey
        );

        ToastAndroid.show(
          "Thank you for giving your feedback",
          ToastAndroid.LONG
        );
        setRatings(null);
        setTextInput_Feedback(null);
      })
      .catch((error) => {
        console.log("Error Saving to Database", error);
        alert("Error", JSON.stringify(error), "OK");
      });

    //save to customer'sLog
    const customerLogRandomId = Math.floor(Math.random() * 50000) + 10000;
    const action = "createReview";
    set(ref(db, `CUSTOMERSLOG/${customerLogRandomId}`), {
      // orderID: newOrderKey,
      cusId: customerId,
      reviewDate: currentDate,
      logsPerformed: action,
      reviewId: newRandomKey,
      // pointsUpdate: pointsUpdate,
      // pointsAddedValue: pointsTobeAddedd,
    })
      .then(async () => {
        // console.log('Test if Save to db-----'+reservationDate );
        console.log(
          "Order module-->New UserLog with the User ID of--->",
          customerLogRandomId
        );
      })
      .catch((error) => {
        console.log("Error Saving to Database", error);
        alert("Error", JSON.stringify(error), "OK");
      });

    //save to notification
    const notificationRandomId = Math.floor(Math.random() * 50000) + 10000;
    set(ref(db, `NOTIFICATION/${notificationRandomId}`), {
      // orderID: newOrderKey,
      cusId: customerId,
      dateReview: currentDate,
      reviewId: newRandomKey,
      title: "Customer Review",
      body: `Customer ${customerData.firstName} ${customerData.lastName} gave you a ${ratings} ratings and review`,
      // pointsUpdate: pointsUpdate,
      // pointsAddedValue: pointsTobeAddedd,
    })
      .then(async () => {
        // console.log('Test if Save to db-----'+reservationDate );
        console.log(
          "Order module-->New user send a notification--->",
          notificationRandomId
        );
      })
      .catch((error) => {
        console.log("Error Saving to Database", error);
        alert("Error", JSON.stringify(error), "OK");
      });
  };

  return (
    // <ScrollView contentContainerStyle={{flexGrow:1}}
    <View style={styles.container}>
      {selectedItemID && (
        <Modal
          transparent
          onRequestClose={() => {
            setShowModal(false);
          }}
          visible={showModal}
        >
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "#00000099",
            }}
          >
            <View style={styles.FeedbackModal}>
              <View style={styles.modalTitle}>
                <Text
                  style={{
                    marginTop: 8,
                    marginLeft: 20,
                    fontFamily: "nunito-bold",
                    fontSize: 18,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  {selectedItemID.order_StoreName}
                </Text>

                <View style={{ flex: 1, marginTop: 2 }} />
                <TouchableOpacity
                  onPress={() => {
                    setShowModal(false);
                  }}
                >
                  <AntDesign
                    name="close"
                    size={20}
                    color="black"
                    style={{ marginTop: 5 }}
                  />
                </TouchableOpacity>

                <View
                  style={{
                    backgroundColor: "red",
                    textAlign: "right",
                    //  right: -80,
                    // marginTop: -10,
                  }}
                >
                  {/* <TouchableOpacity
                    onPress={() => {
                      setShowModal(false);
                    }}
                  >
                    <MaterialCommunityIcons
                      name="close-circle"
                      size={28}
                      color="black"
                    />
                  </TouchableOpacity> */}
                </View>
              </View>

              <View style={styles.inputwrapper}>
                <View style={styles.reviewInputStyle}>
                  <MaterialIcons
                    name="rate-review"
                    size={23}
                    color="black"
                    style={[globalStyles.login_Email_Icon, { marginTop: 5 }]}
                  />

                  <TextInput
                    placeholder="Enter your feedback or review"
                    multiline={true}
                    placeholderTextColor="black"
                    style={globalStyles.login_Email_textInput}
                    keyboardType="default"
                    onChangeText={(text) => setTextInput_Feedback(text)}
                  />
                </View>
                <StatusBar
                  backgroundColor="black"
                  styleStatusBar={styleStatusBar}
                />

                <View style={styles.ratingsInputStyle}>
                  <MaterialIcons
                    name="star"
                    size={23}
                    color="black"
                    style={[globalStyles.login_Email_Icon, { marginTop: 2 }]}
                  />

                  <TextInput
                    placeholder="Ratings(1-5)"
                    multiline={true}
                    placeholderTextColor="black"
                    style={globalStyles.login_Email_textInput}
                    keyboardType="numeric"
                    onChangeText={(text) => setRatings(text)}
                  />
                </View>
              </View>

              <View
                style={{
                  backgroundColor: "transparent",
                  marginTop: 20,
                  height: 50,
                }}
              >
                <TouchableOpacity
                  onPress={handleSubmit}
                  disabled={!textinput_Feedback || !ratings}
                >
                  <View
                    style={{
                      borderRadius: 10,
                      paddingVertical: 10,
                      paddingHorizontal: 10,
                      //backgroundColor: "#87cefa",
                      backgroundColor:
                        !textinput_Feedback || !ratings ? "#ccc" : "#87cefa",
                      marginTop: 5,
                      width: 200,
                      left: 50,
                      height: 40,
                    }}
                  >
                    <Text
                      style={[
                        globalStyles.buttonText,
                        { marginTop: 0, left: 0 },
                      ]}
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
          </View>
        </Modal>
      )}

      <FlatList
        keyExtractor={(item) => item.id}
        data={orderInfo}
        renderItem={({ item }) => (
          <View style={styles.productWrapper} key={item.id}>
            <View style={styles.wrapperWaterProduct}>
              <View style={styles.viewWaterItem}>
                <Text style={styles.productNameStyle}>
                  {item.order_StoreName || "No Store name to display"}
                </Text>
                <View
                  style={{
                    //backgroundColor: "green",
                    flexDirection: "row",
                    alignItems: "flex-end",
                    marginBottom: 4,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: "nunito-semibold",
                      fontSize: 15,
                    }}
                  >
                    Order ID
                  </Text>
                  <Text
                    style={{
                      fontFamily: "nunito-semibold",
                      fontSize: 15,
                      textAlign: "right",
                      flex: 1,
                    }}
                  >
                    {item.orderID}
                  </Text>
                </View>
                <View
                  style={{
                    //  backgroundColor: "green",
                    flexDirection: "row",
                    alignItems: "flex-end",
                    marginBottom: 4,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: "nunito-semibold",
                      fontSize: 15,
                    }}
                  >
                    Customer ID
                  </Text>
                  <Text
                    style={{
                      fontFamily: "nunito-semibold",
                      fontSize: 15,
                      textAlign: "right",
                      flex: 1,
                    }}
                  >
                    {item.cusId}
                  </Text>
                </View>
                <View
                  style={{
                    //  backgroundColor: "green",
                    flexDirection: "row",
                    alignItems: "flex-end",
                    marginBottom: 4,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: "nunito-semibold",
                      fontSize: 15,
                    }}
                  >
                    Driver ID
                  </Text>
                  <Text
                    style={{
                      fontFamily: "nunito-semibold",
                      fontSize: 15,
                      textAlign: "right",
                      flex: 1,
                    }}
                  >
                    {item.driverId ?? ""}
                  </Text>
                </View>

                {/* order payment method */}
                <View
                  style={{
                    // backgroundColor: "green",
                    flexDirection: "row",
                    alignItems: "flex-end",
                  }}
                >
                  <Text
                    style={{
                      fontFamily: "nunito-semibold",
                      fontSize: 15,
                    }}
                  >
                    Payment Method
                  </Text>
                  <Text
                    style={{
                      fontFamily: "nunito-semibold",
                      fontSize: 15,
                      textAlign: "right",
                      flex: 1,
                    }}
                  >
                    {item.orderPaymentMethod}
                  </Text>
                </View>
                {/*delivery type  template and its value */}
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "flex-end",
                  }}
                >
                  <Text
                    style={{
                      fontFamily: "nunito-semibold",
                      fontSize: 15,
                      marginTop: 5,
                    }}
                  >
                    Delivery Type
                  </Text>
                  <Text
                    style={{
                      fontFamily: "nunito-semibold",
                      fontSize: 15,
                      textAlign: "right",
                      flex: 1,
                    }}
                  >
                    {item.order_DeliveryTypeValue}
                  </Text>
                </View>

                {/* RESERVATION DELIVERY TYPE EITHER STANDARD OR EXPRESS and its value  */}
                <View
                  style={{
                    //backgroundColor: "green",
                    flexDirection: "row",
                    alignItems: "flex-end",
                    top: 5,
                    //bottom:5
                  }}
                >
                  <Text
                    style={{
                      fontFamily: "nunito-semibold",
                      fontSize: 15,
                    }}
                  >
                    Reservation Delivery Type
                  </Text>
                  <Text
                    style={{
                      fontFamily: "nunito-semibold",
                      fontSize: 15,
                      textAlign: "right",
                      flex: 1,
                    }}
                  >
                    {item.order_deliveryReservationDeliveryTypeSelected}
                  </Text>
                </View>

                {/*order  type and its value */}
                <View
                  style={{
                    //  backgroundColor: "coral",
                    flexDirection: "row",
                    alignItems: "flex-end",
                  }}
                >
                  <Text
                    style={{
                      fontFamily: "nunito-semibold",
                      fontSize: 15,
                      marginTop: 7,
                    }}
                  >
                    Order Type
                  </Text>
                  <Text
                    style={{
                      fontFamily: "nunito-semibold",
                      fontSize: 15,
                      textAlign: "right",
                      flex: 1,
                    }}
                  >
                    {item.order_OrderTypeValue}
                  </Text>
                </View>

                {/* order method*/}
                {/* <View
                  style={{
                    
                    flexDirection: "row",
                    alignItems: "flex-end",
                  }}
                >
                
                  <Text
                    style={{
                      fontFamily: "nunito-semibold",
                      fontSize: 15,
                      marginTop: 5,
                    }}
                  >
                    Order Method
                  </Text>
                  <Text
                    style={{
                      fontFamily: "nunito-semibold",
                      fontSize: 15,
                      textAlign: "right",
                      flex: 1,
                    }}
                  >
                    {item.order_OrderMethod}
                  </Text>
                </View> */}

                {/*reservation date  template and its value */}
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "flex-end",
                  }}
                >
                  <Text
                    style={{
                      fontFamily: "nunito-semibold",
                      fontSize: 15,
                      marginTop: 5,
                    }}
                  >
                    Reservation Date
                  </Text>
                  <Text
                    style={{
                      fontFamily: "nunito-semibold",
                      fontSize: 15,
                      textAlign: "right",
                      flex: 1,
                    }}
                  >
                    {item.order_ReservationDate ||
                      item.order_deliveryReservationDeliveryReserveDate ||
                      "-"}
                  </Text>
                </View>

                {/*reservation date  template and its value */}
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "flex-end",
                  }}
                >
                  <Text
                    style={{
                      fontFamily: "nunito-semibold",
                      fontSize: 15,
                      marginTop: 5,
                    }}
                  >
                    Reservation Time
                  </Text>
                  <Text
                    style={{
                      fontFamily: "nunito-semibold",
                      fontSize: 15,
                      textAlign: "right",
                      flex: 1,
                    }}
                  >
                    {item.order_deliveryReservationDeliveryReserveTime ||
                      item.order_ReservationDate ||
                      "-"}
                  </Text>
                </View>

                {/*status  template and its value */}
                <View
                  style={{
                    // backgroundColor: "brown",
                    flexDirection: "row",
                    alignItems: "flex-end",
                  }}
                >
                  <Text
                    style={{
                      fontFamily: "nunito-semibold",
                      fontSize: 15,
                      marginTop: 5,
                    }}
                  >
                    Status
                  </Text>
                  <Text
                    style={{
                      fontFamily: "nunito-semibold",
                      fontSize: 15,
                      textAlign: "right",
                      flex: 1,
                    }}
                  >
                    {item.order_OrderStatus}
                  </Text>
                </View>
                {/* over all quantities */}
                <View
                  style={{
                    // backgroundColor: "brown",
                    flexDirection: "row",
                    alignItems: "flex-end",
                  }}
                >
                  <Text
                    style={{
                      fontFamily: "nunito-semibold",
                      fontSize: 15,
                      marginTop: 5,
                    }}
                  >
                    Quantity/s
                  </Text>
                  <Text
                    style={{
                      fontFamily: "nunito-semibold",
                      fontSize: 15,
                      textAlign: "right",
                      flex: 1,
                    }}
                  >
                    {item.order_overAllQuantities}
                  </Text>
                </View>
                {/* Refill option choosen by customeer either REFILL WITH CONDITION, REFILL WIT/OUT CONDITION, REQUEST PICK UP, GALLON DROP BY*/}
                <View
                  style={{
                    // backgroundColor: "brown",
                    flexDirection: "row",
                    alignItems: "flex-end",
                  }}
                >
                  <Text
                    style={{
                      fontFamily: "nunito-semibold",
                      fontSize: 15,
                      marginTop: 5,
                    }}
                  >
                    Refill Option
                  </Text>
                  <Text
                    style={{
                      fontFamily: "nunito-semibold",
                      fontSize: 15,
                      textAlign: "right",
                      flex: 1,
                    }}
                  >
                    {item.order_RefillSelectedOption || "-"}
                  </Text>
                </View>
                {/* Refill option VALUE like if REFILL WITH CONDITION THE VALUE OF THE GALLONS CONDITIO AND MORE*/}
                <View
                  style={{
                    // backgroundColor: "brown",
                    flexDirection: "row",
                    alignItems: "flex-end",
                  }}
                >
                  <Text
                    style={{
                      fontFamily: "nunito-semibold",
                      fontSize: 15,
                      marginTop: 5,
                    }}
                  >
                    Refill Option Value
                  </Text>
                  <Text
                    style={{
                      fontFamily: "nunito-semibold",
                      fontSize: 15,
                      textAlign: "right",
                      flex: 1,
                    }}
                  >
                    {item.SwapwithConditionMessage || "-"}
                  </Text>
                </View>

                {/* Products order by the customer */}
                <View
                  style={{
                    marginTop: 2,
                    height: responsiveHeight(15),
                    // backgroundColor: "red",
                  }}
                >
                  <Text
                    style={{
                      fontFamily: "nunito-semibold",
                      fontSize: 15,
                      //  textAlign: "right",
                      //flex: 1,
                    }}
                  >
                    Order Products
                  </Text>

                  <FlatList
                    showsHorizontalScrollIndicator={false}
                    horizontal={true}
                    contentContainerStyle={{
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                    data={item.order_Products}
                    nestedScrollEnabled={true}
                    keyExtractor={(product) =>
                      product.order_ProductId.toString()
                    }
                    renderItem={({ item: product }) => (
                      <View
                        style={styles.viewProducts}
                        key={product.order_ProductId}
                      >
                        <View
                          style={{
                            //   backgroundColor: "brown",
                            flexDirection: "row",
                            //alignItems: "flex-end",
                          }}
                        >
                          <Text
                            style={{
                              fontFamily: "nunito-light",
                              fontSize: 15,
                              marginTop: 0,
                            }}
                          >
                            Name-
                          </Text>
                          <Text
                            style={{
                              fontFamily: "nunito-light",
                              fontSize: 15,
                              textAlign: "right",
                              left: 0,

                              flex: 1,
                              //flex: 1,
                            }}
                          >
                            {product.order_ProductName.length <= 8
                              ? product.order_ProductName
                              : product.order_ProductName.substring(0, 10) +
                                "..."}
                          </Text>
                        </View>
                        {/* size and unit */}
                        <View
                          style={{
                            //   backgroundColor: "brown",
                            flexDirection: "row",
                            //alignItems: "flex-end",
                          }}
                        >
                          <Text
                            style={{
                              fontFamily: "nunito-light",
                              fontSize: 15,
                              marginTop: 0,
                              textAlign: "right",
                            }}
                          >
                            Size/Unit-
                          </Text>
                          <Text
                            style={{
                              fontFamily: "nunito-light",
                              fontSize: 15,
                              textAlign: "right",
                              flex: 1,
                              //flex: 1,
                            }}
                          >
                            {product.order_size} {product.order_unit}
                          </Text>
                        </View>

                        {/* product price */}
                        <View
                          style={{
                            // backgroundColor: "brown",
                            flexDirection: "row",
                            //alignItems: "flex-end",
                          }}
                        >
                          <Text
                            style={{
                              fontFamily: "nunito-light",
                              fontSize: 15,
                              marginTop: 0,
                            }}
                          >
                            Price-
                          </Text>
                          <Text
                            style={{
                              fontFamily: "nunito-light",
                              fontSize: 15,
                              textAlign: "right",
                              flex: 1,
                              //flex: 1,
                            }}
                          >
                            {product.order_ProductPrice}
                          </Text>
                        </View>

                        {/*quantity for each item */}
                        <View
                          style={{
                            // backgroundColor: "brown",
                            flexDirection: "row",
                            //alignItems: "flex-end",
                          }}
                        >
                          <Text
                            style={{
                              fontFamily: "nunito-light",
                              fontSize: 15,
                              marginTop: 0,
                            }}
                          >
                            Qty-
                          </Text>
                          <Text
                            style={{
                              fontFamily: "nunito-light",
                              fontSize: 15,
                              textAlign: "right",
                              flex: 1,
                              //flex: 1,
                            }}
                          >
                            {product.qtyPerItem}
                          </Text>
                        </View>
                      </View>
                    )}
                  />
                </View>

                {/* Total Initial amount*/}
                <View
                  style={{
                    //top:5,
                    flexDirection: "row",
                    alignItems: "flex-end",
                    bottom: 2,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: "nunito-semibold",
                      fontSize: 15,
                      marginTop: 6,
                    }}
                  >
                    Total Initial Amount
                  </Text>
                  <Text
                    style={{
                      fontFamily: "nunito-semibold",
                      fontSize: 15,
                      textAlign: "right",
                      flex: 1,
                    }}
                  >
                    ₱ {item.order_InitialAmount || 0}
                  </Text>
                </View>

                {/* Pick Up fee*/}
                <View
                  style={{
                    //top:5,
                    flexDirection: "row",
                    alignItems: "flex-end",
                    bottom: 4,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: "nunito-semibold",
                      fontSize: 15,
                      marginTop: 6,
                    }}
                  >
                    Pick up fee
                  </Text>
                  <Text
                    style={{
                      fontFamily: "nunito-semibold",
                      fontSize: 15,
                      textAlign: "right",
                      flex: 1,
                    }}
                  >
                    ₱ {item.orderPickUpFee || 0}
                  </Text>
                </View>

                {/*Delivery fee*/}
                <View
                  style={{
                    //top:5,
                    flexDirection: "row",
                    alignItems: "flex-end",
                    bottom: 4,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: "nunito-semibold",
                      fontSize: 15,
                      marginTop: 6,
                    }}
                  >
                    Delivery fee
                  </Text>
                  <Text
                    style={{
                      fontFamily: "nunito-semibold",
                      fontSize: 15,
                      textAlign: "right",
                      flex: 1,
                    }}
                  >
                    ₱ {item.orderDeliveryfee || 0}
                  </Text>
                </View>

                {/* Subtotal*/}
                <View
                  style={{
                    //top:5,
                    flexDirection: "row",
                    alignItems: "flex-end",
                    bottom: 4,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: "nunito-semibold",
                      fontSize: 15,
                      marginTop: 6,
                    }}
                  >
                    Sub total
                  </Text>
                  <Text
                    style={{
                      fontFamily: "nunito-semibold",
                      fontSize: 15,
                      textAlign: "right",
                      flex: 1,
                    }}
                  >
                    ₱ {item.order_SubTotal || 0}
                  </Text>
                </View>
                <View
                  style={{
                    borderBottomWidth: 0.5,
                    borderColor: "gray",
                    marginTop: 5,
                  }}
                ></View>
                {/* Total aamount */}
                <View
                  style={{
                    //top:5,
                    flexDirection: "row",
                    alignItems: "flex-end",
                  }}
                >
                  <Text
                    style={{
                      fontFamily: "nunito-semibold",
                      fontSize: 17,
                      marginTop: 6,
                    }}
                  >
                    Total Amount
                  </Text>
                  <Text
                    style={{
                      fontFamily: "nunito-semibold",
                      fontSize: 15,
                      textAlign: "right",
                      flex: 1,
                    }}
                  >
                    ₱ {item.order_TotalAmount}
                  </Text>
                </View>

                {/* view for the driver's location button */}

                <View
                  style={{
                    // backgroundColor: "yellow",
                    height: 50,
                    flexDirection: "row",
                    justifyContent: "flex-end",
                    top: 3,
                  }}
                >
                  <View
                    style={{
                      flex: 1,
                      justifyContent: "center",
                      //backgroundColor: "red",
                    }}
                  >
                    <TouchableOpacity
                      onPress={() => {
                        handleViewDriverLocation(
                          item.driverId,
                          item.orderID,
                          item.order_OrderStatus
                        );
                      }}
                      disabled={
                        !item.driverId ||
                        item.order_OrderStatus === "Delivered" ||
                        item.order_OrderStatus === "Payment Received"
                      }
                    >
                      <View
                        style={{
                          backgroundColor:
                            item.order_OrderStatus === "Delivered" ||
                            item.order_OrderStatus === "Payment Received" ||
                            item.order_OrderStatus === "Pending"
                              ? "gray"
                              : item.order_OrderStatus === "Accepted"
                              ? "#73a9c2"
                              : "#73a9c2",
                          padding: 6,
                          width: responsiveWidth(33),

                          marginLeft: 0,
                          borderRadius: 5,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 15,
                            fontFamily: "nunito-semibold",

                            color: "black",
                            marginLeft: 5,
                          }}
                        >
                          Driver's Location
                        </Text>
                      </View>
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity
                    onPress={() => onPressHandlerShowModal({ item: item })}
                    disabled={
                      item.order_OrderStatus === "Pending" ||
                      item.order_OrderStatus === "Out for Delivery" ||
                      item.order_OrderStatus === "Accepted"
                    }
                  >
                    <View
                      style={{
                        //backgroundColor: "green",

                        marginTop: 15,
                        height: 25,
                        borderRadius: 5,
                        padding: 4,
                        flexDirection: "row",
                        width: 30,
                        height: 30,
                        justifyContent: "center",
                        marginLeft: 5,
                        marginRight: 5,
                        // elevation: 4,
                        alignItems: "center",
                      }}
                    >
                      <MaterialIcons name="feedback" size={24} color="black" />
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        )}
        ListHeaderComponent={
          <View style={styles.viewBackBtn}>
            {/* <MaterialIcons
              name="arrow-back-ios"
              size={24}
              color="black"
              onPress={onPresshandler_toStationPage}
            /> */}

            <Text style={[styles.textwatername, { marginRight: "auto" }]}>
              Order Details
            </Text>
            {/* <StatusBar
              backgroundColor="black"
              styleStatusBar={styleStatusBar}
            /> */}
            {/* <TouchableOpacity onPress={()=>{
                navigation.navigate("CompletedOrders",{passedorderData:orderInformationDelivered});
                //console.log("sending order Details",orderInfo)
              }}>
            
              <Image
              style={{right:10,width:25,height:25}}
              source={require('../assets/checklist.png')}
              />
              </TouchableOpacity> */}
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  viewProducts: {
    backgroundColor: "white",
    padding: 3,
    marginBottom: 0,
    width: responsiveWidth(40),
    height: responsiveHeight(12),
    //marginLeft: 5,
    borderRadius: 5,
    marginRight: 5,
    shadowColor: "black",
    shadowRadius: 5,
    shadowOffset: {
      height: 5,
      width: 5,
    },
    elevation: 4,
    // top:10
  },
  container: {
    flex: 1,
    backgroundColor: "lightcyan",
    // justifyContent:'center',
    //alignItems:'center'
  },
  viewBackBtn: {
    // backgroundColor: "orange",
    marginTop: 10,
    // top:Constants.statusBarHeight ,
    marginLeft: 15,
    // width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  productWrapper: {
    //backgroundColor: "yellowgreen",
    padding: 10,
    // flex: 1,
    //height: 550,
    // height: 600,
    height: responsiveHeight(89),
    marginTop: 10,
  },
  viewwatername: {
    // backgroundColor: "yellow",

    width: 150,
    marginHorizontal: 120,
  },
  textwatername: {
    fontSize: 20,
    flex: 1,
    fontFamily: "nunito-bold",
    fontWeight: "bold",
    textAlign: "center",
    marginLeft: 0,
  },
  wrapperWaterProduct: {
    // backgroundColor: "blue",

    // marginBottom: 5,
    flex: 1,
  },

  viewWaterItem: {
    backgroundColor: "white",
    padding: 3,

    marginTop: 30,
    bottom: 30,
    //  width: "100%",
    width: responsiveWidth(95),
    //width: Dimensions.get("window").width - 20,
    //height: 560,
    //height: Dimensions.get("window").height/2 + 250,
    height: responsiveHeight(88),
    marginLeft: 0,
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
  productNameStyle: {
    fontSize: 20,
    fontFamily: "nunito-semibold",
    marginLeft: 0,
    textAlign: "center",
  },
  FeedbackModal: {
    width: 300,
    height: 250,
    backgroundColor: "#F8E2CF",
    borderBottomColor: "gray",
    borderBottomWidth: 1,
    borderRadius: 10,
    elevation: 10,
  },
  modalTitle: {
    // backgroundColor:'red',
    justifyContent: "center",
    //justifyContent: "flex-start",
    padding: 0,
    flexDirection: "row",
    // left:10
  },
  inputwrapper: {
    // backgroundColor: "green",
    paddingVertical: 5,
    marginTop: 10,
    height: 120,
  },
  reviewInputStyle: {
    flexDirection: "row",
    borderBottomColor: "black",
    borderBottomWidth: 1,
    paddingBottom: 2,
    marginBottom: 5,
    width: 270,
    marginTop: 10,
    marginLeft: 20,
  },
  ratingsInputStyle: {
    flexDirection: "row",
    borderBottomColor: "black",
    borderBottomWidth: 1,
    paddingBottom: 2,
    marginBottom: 5,
    width: 270,
    marginTop: 10,
    marginLeft: 20,
  },

  //station screen styles

  storeWrapper: {
    //paddingTop: 80,
    paddingHorizontal: 15,
    backgroundColor: "yellow",
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: "nunito-bold",
    fontWeight: "bold",
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
    marginBottom: 10,
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
    width: 65,
    height: 65,
    //  backgroundColor: "red",
    // opacity: 0.4, #55BCF6
    borderRadius: 15,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#55BCF6",
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
    width: 53,
    height: 53,
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
