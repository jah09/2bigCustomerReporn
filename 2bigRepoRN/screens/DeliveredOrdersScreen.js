import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  ToastAndroid,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import React, { useState, useEffect, useLayoutEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { db } from "../firebaseConfig";
import { AntDesign } from "@expo/vector-icons";
import { globalStyles } from "../ForStyle/GlobalStyles";
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
import {
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import moment from "moment/moment";
export default function DeliveredOrdersScreen() {
  const styleTypes = ["default", "dark-content", "light-content"];
  const [visibleStatusBar, setvisibleStatusbar] = useState(false);
  const [styleStatusBar, setstyleStatusBar] = useState(styleTypes[0]);
  const navigation = useNavigation();
  const onPresshandler_toStationPage = () => {
    navigation.goBack();
  };
  const [customerData, setCustomerData] = useState();
  const [customerId, setCustomerId] = useState(null);
  const [orderInfo, setOrderInfo] = useState([]);
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
                  order.order_OrderStatus === "Delivered" ||
                  order.order_OrderStatus === "Payment Received"
              );
              filteredOrderData.sort((a, b) => {
                const dateA = moment(a.orderDate, "YYYY-MM-DDTHH:mm:ss.SSSSSSSZ");
                //console.log("line 196",dateA);
                const dateB = moment(b.orderDate, "YYYY-MM-DDTHH:mm:ss.SSSSSSSZ");
               // console.log("line 198",dateB);
                return dateB.diff(dateA);
            });
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

                //if the order status is Delivered or payment received then move to another screen
              });

              //  console.log("line 146", JSON.stringify(filteredOrderData));
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
  }, [customerId]);
  const [showModal, setShowModal] = useState(false);
  const [selectedItemID, setSelectedItemID] = useState(null);

  const onPressHandlerShowModal = (item) => {
    //console.log("line 52", item);
    const { admin_ID, order_StoreName, orderID } = item.item;
    // console.log("test 49", orderID);
    setSelectedItemID({ admin_ID, order_StoreName, orderID });
    setShowModal(true);
  };

  //write ratings and review to the store
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
      reviewedDate:currentDate
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
  //insert review and ratings for the store
  const [textinput_Feedback, setTextInput_Feedback] = useState();
  // console.log("text",textinput_Feedback);
  const [ratings, setRatings] = useState("");
  // console.log("arte",ratings);
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
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
      alert("Please enter a valid rating. Only 1-5.");
      setIsButtonDisabled(true);
    } else {
      console.log("this line", customerData.cusId);
      createReview(customerData.cusId);
      setShowModal(false);
      setIsButtonDisabled(false);
    }
    //  console.log("this line",customerData.cusId)
  };
  return (
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
                    keyboardType="default"
                    onChangeText={(text) => setRatings(text.replace(/[^0-9]/g,''))}
                    value={ratings}
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
            <MaterialIcons
              name="arrow-back-ios"
              size={24}
              color="black"
              onPress={onPresshandler_toStationPage}
            />
            <Text style={[styles.textwatername, { marginRight: "auto" }]}>
              Delivered orders
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
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
  productNameStyle: {
    fontSize: 20,
    fontFamily: "nunito-semibold",
    marginLeft: 0,
    textAlign: "center",
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
  wrapperWaterProduct: {
    // backgroundColor: "blue",

    // marginBottom: 5,
    flex: 1,
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
  textwatername: {
    fontSize: 20,
    flex: 1,
    fontFamily: "nunito-bold",
    fontWeight: "bold",
    textAlign: "center",
    //marginLeft: 10,
    right: 10,
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
  container: {
    flex: 1,
    backgroundColor: "lightcyan",
    // justifyContent:'center',
    //alignItems:'center'
  },
});
