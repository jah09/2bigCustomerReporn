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
  ActivityIndicator,
  ToastAndroid,
  Modal,
  TextInput,
} from "react-native";
import uploadImage from "./NewDeliveryAddressScreen";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useState, useEffect } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { Feather } from "@expo/vector-icons";
import { AntDesign } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRoute } from "@react-navigation/native";
import { globalStyles } from "../ForStyle/GlobalStyles";
import { db } from "../firebaseConfig";
import { storage } from "../firebaseConfig";
import { firebase } from "../firebaseStorage";
import { FontAwesome5 } from "@expo/vector-icons";
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
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import { GOOGLE_API_KEY, GOOGLE_API_KEY_PLACE } from "../APIKEY";

export default function ProductDetailsAndPlaceOrder({ navigation }) {
  const route = useRoute();
  const { item, extractedDatas, rewardsData, combinedData } = route.params
    ? route.params
    : {}; //access the data from "myDatas object" from previous screen, esp the refillingStation-- in this case, and save it to variable and display
  const secondItem = item;

  const passedStationName =
    extractedDatas?.refillingStoreProperties?.stationName;
  const passedAdminID = extractedDatas?.adminProperties?.adminID;
  // console.log("Admin ID", passedAdminID);
  const [totalAmount, settotalAmount] = useState("Total Amount");
  console.log("44", totalAmount);
  const [customerData, setCustomerData] = useState({}); //getting the customer's data from AsyncStorage

  //get the delivery Details new codes
  useEffect(() => {
    const otherProducts = ref(db, "DELIVERY_DETAILS2/");
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
      setnewDeliveryDetails(otherProductsInfo);
    });
  }, [passedAdminID]);
  const [newDeliveryDetails, setnewDeliveryDetails] = useState();
  const gcashNumber =
    newDeliveryDetails &&
    Array.isArray(newDeliveryDetails) &&
    newDeliveryDetails.length > 0
      ? newDeliveryDetails[0].gcashNumber
      : null;
  console.log("line 91", gcashNumber);
  useEffect(() => {
    if (Array.isArray(newDeliveryDetails) && newDeliveryDetails.length > 0) {
      const splitPaymentMethods =
        newDeliveryDetails[0]?.paymentMethods.split(", ");
      // console.log("reserve line 154",splitPaymentMethods);
      const splitValuesOrderTypeArray = splitPaymentMethods.map(
        (type, index) => ({
          label: type,
          value: type.toString(),
          key: index + 1,
        })
      );
      setPaymentMethods(splitValuesOrderTypeArray);
    }
  }, [newDeliveryDetails]);

  const [paymentMethods, setPaymentMethods] = useState([]);

  const newdeliveryTypes = [];
  Object.entries(newDeliveryDetails?.[0] ?? {}).forEach(([key, value]) => {
    if (key.endsWith("DeliveryType") || key.endsWith("Deliverytype")) {
      const deliveryType = {
        label: value,
        value: value.toString(),
        key: newdeliveryTypes.length + 1,
      };
      newdeliveryTypes.push(deliveryType);
    }
  });
  console.log("line 93", newdeliveryTypes);

  const [checkedItemKey_paymentMethod, setCheckedItemKey_paymentMethod] =
    useState(null);
  const handleItemchecked_paymentMethod = (item) => {
    setCheckedItemKey_paymentMethod(
      item.key === checkedItemKey_paymentMethod ? null : item.key
    );
    if (item.value === "CashOnDelivery") {
      console.log("COD");
    } else if (item.value === "Gcash") {
      setShowModal_ModeOfPayment(true);
    } else {
      navigation.navigate("RewardScreen", {
        passedStationName,
        secondItem,
        extractedDatas,
        rewardsData,
      });
      //console.log("inside else",rewardsData);
    }
  };
  //end here--------------------------------------------------------------------------------------------------------
  //get the delivery Details old codes

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

  const [selectedDeliveryType, setSelectedDeliveryType] = useState(null);
  const [checkedItemKey_deliveryType, setCheckedItemKey_deliveryType] =
    useState(null);

  //console.log("line 243-->", checkedItemKey_deliveryType);
  const handleItemChecked_deliveryType = (item) => {
    setCheckedItemKey_deliveryType(
      item.key === checkedItemKey_deliveryType ? null : item.key
    );
    setSelectedDeliveryType(item.value);

    if (item.value == "Reservation") {
      const splitValuesOrderType =
        newDeliveryDetails[0].resOrderType.split(", ");
      // console.log("reserve line 154",splitValuesOrderType);
      const splitValuesOrderTypeArray = splitValuesOrderType.map(
        (type, index) => ({
          label: type,
          value: type.toString(),
          key: index + 1,
        })
      );
      setOrder_Types(splitValuesOrderTypeArray);

      const splitValuesOrderMethod =
        newDeliveryDetails[0].resOrderMethod.split(", ");

      const splitValuesOrderMethodArray = splitValuesOrderMethod.map(
        (type, index) => ({
          label: type,
          value: type.toString(),
          key: index + 1,
        })
      );
      setOrder_Method(splitValuesOrderMethodArray);
      const splitValuesSwapReservation =
        newDeliveryDetails[0].reserveSwapOptions.split(", ");

      setRESERVATIONtempSwapOptionHolder(splitValuesSwapReservation);
    } else if (item.value == "Standard") {
      //access the standard delivery Type then its order type, split them para ma buwag
      const splitValuesOrderType =
        newDeliveryDetails[0].stanOrderType.split(", ");

      //the value from splitValuesOrderType are map then create an object with key,label, and value
      const splitValuesOrderTypeArray = splitValuesOrderType.map(
        (type, index) => ({
          label: type,
          value: type.toString(),
          key: index + 1,
        })
      );
      setOrder_Types(splitValuesOrderTypeArray);

      const splitValuesOrderMethod =
        newDeliveryDetails[0].stanOrderMethod.split(", ");

      const splitValuesOrderMethodArray = splitValuesOrderMethod.map(
        (type, index) => ({
          label: type,
          value: type.toString(),
          key: index + 1,
        })
      );
      setOrder_Method(splitValuesOrderMethodArray);

      const splitValuesSwapReservation =
        newDeliveryDetails[0].standardSwapOptions.split(", ");
      setSTANDARDTempSwapOption(splitValuesSwapReservation);

      Alert.alert(
        "To our beloved customer",
        `Schedule delivery time for standard is ${newDeliveryDetails[0].stanDeliveryTime}`
      );
    } else {
      //for order Type extraction

      const splitValuesOrderType =
        newDeliveryDetails[0].exOrderType.split(", ");

      const splitValuesOrderTypeArray = splitValuesOrderType.map(
        (type, index) => ({
          label: type,
          value: type.toString(),
          key: index + 1,
        })
      );

      setOrder_Types(splitValuesOrderTypeArray);

      const splitValuesOrderMethod =
        newDeliveryDetails[0].exOrderMethod.split(", ");

      const splitValuesOrderMethodArray = splitValuesOrderMethod.map(
        (type, index) => ({
          label: type,
          value: type.toString(),
          key: index + 1,
        })
      );
      setOrder_Method(splitValuesOrderMethodArray);
      const splitValuesSwapReservation =
        newDeliveryDetails[0].expressSwapOptions.split(", ");
      setEXPRESStempSwapOptionHolder(splitValuesSwapReservation);
      Alert.alert(
        "To our beloved customer",
        `Estimated delivery time for express is ${newDeliveryDetails[0].exEstimatedDelivery}`
      );
    }
  };

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
    //console.log("inside this useEffect--->line 162",deliveryDetails);
    const dynamicDistance = getDistance(
      { latitude: customerLatt, longitude: customerLong },
      { latitude: adminLatt, longitude: adminLong }
    );

    const customerDistanceToStation = dynamicDistance / 1000; //km
    console.log(
      "Distance between customer and store location",
      customerDistanceToStation
    );
    // const chosenDeliveryType = checkedItemKey_deliveryType
    //   ? deliveryDetails[0]?.deliveryTypes[checkedItemKey_deliveryType]
    //   : null;

    //extracted delivery distance and fee and value  for STANDARD
    const standardDeliveryValue =
      newDeliveryDetails &&
      Array.isArray(newDeliveryDetails) &&
      newDeliveryDetails.length > 0
        ? newDeliveryDetails[0].stanDeliverytype
        : null;
    const standardDistance =
      newDeliveryDetails &&
      Array.isArray(newDeliveryDetails) &&
      newDeliveryDetails.length > 0
        ? newDeliveryDetails[0].standistance
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

    //extracted delivery distance and fee and value  for RESERVATION
    const reservationDistance =
      newDeliveryDetails &&
      Array.isArray(newDeliveryDetails) &&
      newDeliveryDetails.length > 0
        ? newDeliveryDetails[0].resDistanceFree
        : null;
    const reservationDeliveryFee =
      newDeliveryDetails &&
      Array.isArray(newDeliveryDetails) &&
      newDeliveryDetails.length > 0
        ? newDeliveryDetails[0].resDeliveryFee
        : null;

    if (selectedDeliveryType == standardDeliveryValue) {
      // console.log("standard is choosen-->Distance",standardDistance);

      // If the value of customerDistanceToStation is greater than standardDistance, then the code inside the if block will execute.
      if (customerDistanceToStation > standardDistance) {
        const exceedingDistance = (
          customerDistanceToStation - standardDistance
        ).toFixed(2);

        const additionalCost =
          parseFloat(standardDeliveryFee) * exceedingDistance;
        const total = parseFloat(amount) + additionalCost;
        if (!isNaN(total)) {
          settotalAmount(total.toFixed(2));
        } else {
          settotalAmount("Total Amount");
        }
      } else {
        console.log("inside if !nan stanadard");
        if (!isNaN(parseFloat(amount).toFixed(2))) {
          settotalAmount(parseFloat(amount).toFixed(2));
        } else {
          settotalAmount("Total Amount");
        }
      }
    } else if (selectedDeliveryType == expressDeliveryValue) {
      const total = parseFloat(amount) + parseFloat(expressDeliveryFee);

      if (!isNaN(total)) {
        settotalAmount(total.toFixed(2));
      } else {
        settotalAmount("Total Amount");
      }
    } else {
      console.log(
        "reservation is choosen",
        reservationDeliveryFee,
        reservationDistance
      );
      if (customerDistanceToStation > reservationDistance) {
        const exceedingDistance = (
          customerDistanceToStation - parseFloat(reservationDistance)
        ).toFixed(2);
        console.log("line 415", exceedingDistance);
        const additionalCost =
          parseFloat(reservationDeliveryFee) * exceedingDistance;
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
    }
  }, [
    customerLatt,
    customerLong,
    adminLatt,
    adminLong,
    passedAdminID,
    amount,
    newDeliveryDetails,
    checkedItemKey_deliveryType,
  ]);

  const [order_Types, setOrder_Types] = useState();

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

  const [checkedItemKey_orderType, setCheckedItemKey_orderType] =
    useState(null);

  const handleItemChecked_orderType = (item) => {
    setCheckedItemKey_orderType(
      item.key === checkedItemKey_orderType ? null : item.key
    );

    setisDisabled(false);
  }; //for delivery type object with array--- and also checkbox on it-> codes end  here

  // const [showDatePicker, setShowDatePicker] = useState(false);
  const [checkedItemKey_orderMethod, setCheckedItemKey_orderMethod] =
    useState(null);

  const [STANDARDtempSwapOptionHolder, setSTANDARDTempSwapOption] = useState(); //hold the data of extracted delivery Details either Standard, Express or
  const [RESERVATIONtempSwapOptionHolder, setRESERVATIONtempSwapOptionHolder] =
    useState();
  const [EXPRESStempSwapOptionHolder, setEXPRESStempSwapOptionHolder] =
    useState();
  const [swapOptionValue, setswapOptionValue] = useState();

  //order Method check item
  const handleItemchecked_orderMethod = (item) => {
    setCheckedItemKey_orderMethod(
      item.key === checkedItemKey_orderMethod ? null : item.key
    );

    if (item.value === "Refill") {
      if (selectedDeliveryType === "Standard") {
        const swapOptionValue = STANDARDtempSwapOptionHolder;
        console.log("line 493", swapOptionValue);
        if (!swapOptionValue) {
          // Display your message here, e.g. using a toast or an alert
          // Example using React Native's Alert component:
          Alert.alert(
            "Notice",
            `Swap Option for ${passedStationName} is not available for this time.`
          );
        } else {
          // If swapOptionValue is not null, show the modal
          setshowModal_RefillCheckbox(true);
          setswapOptionValue(swapOptionValue);
        }
      } else if (selectedDeliveryType === "Reservation") {
        console.log("line 503");
        const swapOptionValue = RESERVATIONtempSwapOptionHolder;
        console.log("line 493", swapOptionValue);
        if (!swapOptionValue) {
          // Display your message here, e.g. using a toast or an alert
          // Example using React Native's Alert component:
          Alert.alert(
            "Notice",
            `Swap Option for ${passedStationName} is not available for this time.`
          );
        } else {
          setshowModal_RefillCheckbox(true);
          setswapOptionValue(swapOptionValue);
        }
      } else {
        console.log("line 506");
        const swapOptionValue = EXPRESStempSwapOptionHolder;
        console.log("line 493", swapOptionValue);
        if (!swapOptionValue) {
          // Display your message here, e.g. using a toast or an alert
          // Example using React Native's Alert component:
          Alert.alert(
            "Notice",
            `Swap Option for ${passedStationName} is not available for this time.`
          );
        } else {
          setshowModal_RefillCheckbox(true);
          setswapOptionValue(swapOptionValue);
        }
      }
      // setshowModal_RefillCheckbox(true);
    }
    // setisDisabled(false);
  }; //for delivery type object with array--- and also checkbox on it-> codes end here

  const handleSubmit = () => {
    if (customerData.cus_status === "Pending") {
      Alert.alert(
        "Warning",
        "You can't place order because your status is still pending. Please wait to approve your application."
      );
    } else if (customerData.cus_status === "Declined") {
      Alert.alert(
        "Warning",
        "Your application is Declined because your uploaded documents doesn't meet the requirements"
      );
    } else {
      if (checkedItemKey_deliveryType === null) {
        alert("Please choose a delivery type");
      } else if (
        (checkedItemKey_deliveryType === "Standard" ||
          checkedItemKey_deliveryType === "Reservation") &&
        checkedItemKey_orderType === null
      ) {
        //This checks if the delivery type is either "standard" or "reservation". It uses the logical OR operator || to check if either of these conditions is true.
        alert("Please choose a order Type");
      } else if (
        checkedItemKey_deliveryType === "Express" &&
        checkedItemKey_orderType !== null
      ) {
        // If both of these conditions are true, then the code inside of the block will execute and display an alert message
        alert("You don't need to select order type for  express delivery");
      } else {
        // handle button press here
        createOrder(customerData.cusId); //call this if all data is fill up
      }
    }
    //check if the delivryType is null then alert

    //
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
    console.log("line 612", count);
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
  //console.log("line 595",currentDate);
  //storing the fetch to a variable

  const [waterproduct, setWaterproduct] = useState(
    item.pro_refillWaterType || item.other_productName
  );
  const [waterprice, setWaterprice] = useState(
    route.params.item.other_productPrice || route.params.item.pro_refillPrice
  );
  const [quantity, setQuantity] = useState(count);
  const [initialAmount, setInitialAmount] = useState(amount);
  const [deliveryTypeValue, setdeliveryTypeValue] = useState();
  const [orderTypeValue, setOrderTypeValue] = useState(order_Types ?? null); //pass the order Type  value, "??" is used to check if null ba or di
  const [choosenSwapOption, setChoosenSwapOption] = useState();
  console.log("line 618", choosenSwapOption);
  const [input_SwapWithReservation, setinput_SwapWithReservation] = useState();
  const [orderMethod, setOrdeMethod] = useState(order_Method);
  const [orderStatus, setOrderStatus] = useState("Pending");
  const [reservationDate, setReservationDate] = useState("");
  const [gcashProoflink_Storage, setgcashProoflink_Storage] = useState();

  //console.log("line 597",gcashProoflink_Storage) setDeliveryAddressOption
  const order_Size = `${item.pro_refillSize || item.other_productSize}`;
  const order_Unit = `${item.pro_refillUnit || item.other_productUnit}`;

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
      order_WaterPrice: parseFloat(waterprice),
      order_Quantity: quantity,
      order_InitialAmount: parseFloat(initialAmount),
      order_TotalAmount: parseFloat(totalAmount),
      order_DeliveryTypeValue: deliveryTypeValue,
      order_OrderTypeValue: orderTypeValue,
      order_GcashProofOfPayment: gcashProoflink_Storage ?? null,
      //order_SwapGallonTypeValue: swapgallonTypeValue,

      order_choosenSwapOption: choosenSwapOption ?? null,
      order_input_SwapWithReservation: input_SwapWithReservation ?? null,
      order_OrderMethod: orderMethod ?? null,
      order_OrderStatus: orderStatus,
      order_ReservationDate: reservationDate,
      order_unit: order_Unit,
      order_size: parseFloat(order_Size),
      cusId: CUSTOMERID,
      order_newDeliveryAddressOption: combinedData.DeliveryAddress ?? null,
      order_newDeliveryAddress: combinedData.address ?? null,
      order_newDeliveryAddLattitude: combinedData.newAddressLattitude ?? null,
      order_newDeliveryAddLongitude: combinedData.newAddressLongitude ?? null,
      order_newDeliveryAddLandmark: combinedData.landmark ?? null,
      order_newDeliveryAddContactNumber:
        combinedData.receiverContactNum ?? null,
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

        //reset input fields
        setCheckedItemKey_deliveryType(null);
        setCheckedItemKey_orderType(null);
        setCheckedItemKey_orderMethod(null);
        setAmount("Amount");
        setChoosenSwapOption(null);
        setCheckedItemKey_paymentMethod(null);
        setQuantity(null);
        setCount(0);
      })
      .catch((error) => {
        console.log("Error Saving to Database", error);
        alert("Error", JSON.stringify(error), "OK");
      });

    //save to user log collection
    const action = "Order";
    const userLogRandomId = Math.floor(Math.random() * 50000) + 10000;
    const newUserlogKey = userLogRandomId;
    set(ref(db, `CUSTOMERSLOG/${newUserlogKey}`), {
      orderID: newOrderKey,
      cusId: CUSTOMERID,
      orderDate: currentDate,
      logsPerformed: action,
    })
      .then(async () => {
        // console.log('Test if Save to db-----'+reservationDate );
        console.log("NEW USER LOG OF --->", newUserlogKey);
      })
      .catch((error) => {
        console.log("Error Saving to Database", error);
        alert("Error", JSON.stringify(error), "OK");
      });

    //date today
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    const newformattedDate = `${year}-${month}-${day}`;
    console.log("line 804", newformattedDate);
    const status = "unread";
    const sender = "Customer";
    const receiver = "Admin";
    const notificationRandomId = Math.floor(Math.random() * 50000) + 10000;
    const newNotificationRandomKey = notificationRandomId;
    const notificationBody = "You have pending order/s.";
    set(ref(db, `NOTIFICATIONTEST/${newNotificationRandomKey}`), {
      notificationID: newNotificationRandomKey,
      orderID: parseFloat(newOrderKey),
      // notificationID:parseFloat(newOrderKey) ,
      admin_ID: passedAdminID,
      cusId: CUSTOMERID,
      body: notificationBody,
      notificationDate: newformattedDate,
      sender: sender,
      receiver: receiver,
      status: status,
    })
      .then(async () => {
        // console.log('Test if Save to db-----'+reservationDate );
        console.log(
          " customer sending notification --->",
          newNotificationRandomKey
        );

        // ToastAndroid.show(
        //   "Send notification",
        //   ToastAndroid.LONG
        // );
        // setRatings(null);
        // setTextInput_Feedback(null);
      })
      .catch((error) => {
        console.log("Error Saving to Database", error);
        alert("Error test", JSON.stringify(error), "OK");
      });
  };

  //disable reservation date view/icon if customer will select express or standard
  const [showModal_RefillCheckbox, setshowModal_RefillCheckbox] =
    useState(false);
  const [showModal_ModeOfPayment, setShowModal_ModeOfPayment] = useState(false);
  const onPressHandlerShowModal = (item) => {
    setshowModal_RefillCheckbox(true);
  };

  //codes in getting the image from local device, display it and lastly upload to firebase storage
  const [gcashProofImage, setGgcashProofImage] = useState(null);
  // console.log("line 612313131388", gcashProofImage);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [fileNameInput, setFilenameInput] = useState("");

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    }); //get the image from library in local image

    console.log(result);

    if (!result.canceled) {
      setGgcashProofImage(result.uri);
      setFilenameInput(result.uri.split("/").pop());
    }
  };

  const uploadImage = async () => {
    const blob = await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = function () {
        resolve(xhr.response);
      };
      xhr.onerror = function () {
        reject(new TypeError("Network request failed"));
      };
      xhr.responseType = "blob";
      xhr.open("GET", gcashProofImage, true);
      xhr.send(null);
    });
    const ref = firebase
      .storage()
      .ref()
      .child("Customer_GcashProof/" + fileNameInput);
    const snapshot = ref.put(blob, { contentType: "image/jpeg" });
    snapshot.on(
      firebase.storage.TaskEvent.STATE_CHANGED,
      () => {
        setUploadingImage(true);
        //Alert.alert("Thank you uploading your Gcash proof of payment.")
        // setShowModal_ModeOfPayment(false);
      },
      (error) => {
        setUploadingImage(false);
        console.log(error);
        blob.close();

        return;
      },
      () => {
        snapshot.snapshot.ref.getDownloadURL().then((url) => {
          setUploadingImage(false);
          console.log("Download URL: ", url);
          setgcashProoflink_Storage(url);
          setGgcashProofImage(url);
          blob.close();
          Alert.alert("Thank you for uploading the image.");
          // setShowModal_ModeOfPayment(false);
          return url;
        });
      }
    );
  };

  const handleUploadImage = async () => {
    //check if the gcashProofImage if naa ba sulod or wala
    if (gcashProofImage === null) {
      Alert.alert("Please upload a screenshot of your Gcash payment.");
    } else {
      uploadImage();
    }
  };

  //delivery Address
  //test
  if (selectedOrdertype === "PickUp" && reservationDate === null) {
    Alert.alert("Warning", "Please choose a reservation date");
  }
  if (selectedOrdertype === "PickUp" && checkedItemKey_deliveryType === null) {
    Alert.alert("Warning", "Please choose a delivery Type");
  }
  if (selectedOrdertype === "PickUp" && selectedpaymenthod === null) {
    Alert.alert("Warning", "Please select a payment method");
  }
  if (checkedItemKey_orderType === null) {
    Alert.alert("Warning", "Please choose a order type");
  } else if (selectedOrdertype === "PickUp" && reservationDate === null) {
    Alert.alert("Warning", "Please choose a reservation date");
  } else if (
    (checkedItemKey_deliveryType === "Standard" ||
      checkedItemKey_deliveryType === "Reservation") &&
    checkedItemKey_orderType === null
  ) {
    //This checks if the delivery type is either "standard" or "reservation". It uses the logical OR operator || to check if either of these conditions is true.
    Alert.alert("Warning", "Please choose a delivery Type");
  } else if (checkedItemKey_paymentMethod === null) {
    // If both of these conditions are true, then the code inside of the block will execute and display an alert message
    if (selectedOrdertype === "PickUp") {
      createOrder(customerData.cusId);
      //console.log("else block 959", passedRewardsData);
      //console.log("else block 959", customerID);
    } else {
      Alert.alert("Warning", "Please select a payment method");
    }
  } else if (deliveryAddressOption === null) {
    if (selectedOrdertype === "PickUp") {
      createOrder(customerData.cusId);
    } else {
      Alert.alert("Warning", "Please select an delivery address");
    }
  } else if (combinedData && combinedData.DeliveryAddress === null) {
    // alert("Please set your delivery address.");
    if (selectedOrdertype === "PickUp") {
      // createOrder(customerData.cusId);
      combinedData.DeliveryAddress = null;
    } else {
      Alert.alert("Warning", "Please select an delivery address");
      
    }
  } else {
    // handle button press here
    // console.log("else here");
    // createOrder(customerData.cusId); //call this if all data is fill up
    if (selectedpaymenthod === "Gcash") {
      if (gcashProofImage === null) {
        // console.log("line 1424, gcashproof is null");
        setShowModal_ModeOfPayment(true);
      }
    } else if (selectedpaymenthod === "Points") {
      //  console.log(" LINE 1419selectedpaymenthod=Points");
      if (
        rewardScreenNewModeOfPayment === "Gcash" &&
        gcashProofImage === null
      ) {
        // console.log(
        //   "LINE 1421 rewardScreenNewModeOfPayment=Gcash and gcashProofImage == null"
        // );
        setShowModal_ModeOfPayment(true);
      } else {
        createOrder(customerData.cusId, gcashProoflink_Storage); //call this if all data is fill up
        ToastAndroid.show(
          "Order successfully. Thank you for ordering" +
            " " +
            passedStationName +
            ".",
          ToastAndroid.LONG
        );
      }
    } else if (selectedOrdertype === "PickUp") {
      if (
        selectedpaymenthod === "Points" &&
        rewardScreenNewModeOfPayment === "Gcash " &&
        gcashProofImage === null
      ) {
        console.log("inside this if line 1476");
        setShowModal_ModeOfPayment(true);
      }
    } else {
      createOrder(customerData.cusId); //call this if all data is fill up
      ToastAndroid.show(
        "Order successfully. Thank you for ordering" +
          " " +
          passedStationName +
          ".",
        ToastAndroid.LONG
      );
    }
  }
  return (
    <SafeAreaView style={styles.safeviewStyle}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        {swapOptionValue && (
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
                    Swap Option
                  </Text>
                </View>
                <View style={styles.inputWrapper}>
                  <Text
                    style={{
                      marginTop: 3,
                      marginLeft: 5,
                      fontFamily: "nunito-light",
                      fontSize: 16,
                    }}
                  >
                    Please select a swap option.
                  </Text>
                  <View
                    style={{
                      backgroundColor: "transparent",
                      marginTop: 20,
                      flexDirection: "row",
                      marginLeft: 4,
                    }}
                  >
                    <TouchableOpacity
                      onPress={() => {
                        console.log(
                          "Console if what is clicked",
                          swapOptionValue[1]
                        );
                        setChoosenSwapOption(swapOptionValue[1]); //Swap with reservation
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: "nunito-semibold",
                          fontSize: 16,
                          marginRight: 8,
                          // color:'lightblue'
                        }}
                      >
                        {swapOptionValue[1]}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => {
                        console.log(
                          "Console if what is clicked SWOR",
                          swapOptionValue[0]
                        );
                        setChoosenSwapOption(swapOptionValue[0]); // Swap w/out reservation
                      }}
                    >
                      <Text
                        style={{ fontFamily: "nunito-semibold", fontSize: 16 }}
                      >
                        {swapOptionValue[0]}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.swapOptionWithReservation}>
                    <TextInput
                      placeholder={
                        choosenSwapOption === swapOptionValue[1]
                          ? "Enter your gallon's condition"
                          : "Input only for swap with reservation"
                      }
                      multiline={true}
                      placeholderTextColor="gray"
                      style={[
                        globalStyles.login_Email_textInput,
                        { fontSize: 15 },
                      ]}
                      keyboardType="text"
                      onChangeText={(text) =>
                        setinput_SwapWithReservation(text)
                      }
                      editable={choosenSwapOption === swapOptionValue[1]}
                    />
                  </View>
                  <View
                    style={{
                      marginTop: 25,
                      justifyContent: "flex-end",
                      flexDirection: "row",
                    }}
                  >
                    <TouchableOpacity
                      onPress={() => {
                        setshowModal_RefillCheckbox(false);
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: "nunito-semibold",
                          fontSize: 17,
                          marginRight: 15,
                        }}
                      >
                        OK
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          </Modal>
        )}
        <Modal
          transparent
          onRequestClose={() => {
            setShowModal_ModeOfPayment(false);
          }}
          visible={showModal_ModeOfPayment}
        >
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "#00000099",
            }}
          >
            <View style={styles.modeofPaymentModal}>
              <View style={styles.modeofPaymentModalTitle}>
                <Text
                  style={{
                    marginTop: 8,
                    marginLeft: 0,
                    fontFamily: "nunito-bold",
                    fontSize: 20,
                  }}
                >
                  Proof of payment
                </Text>
                <View style={{ flex: 1, marginTop: 2 }} />
                <TouchableOpacity
                  onPress={() => {
                    setShowModal_ModeOfPayment(false);
                    setGgcashProofImage(null);
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
              <View style={{ padding: 5, marginLeft: 3 }}>
                <Text style={{ fontFamily: "nunito-light" }}>
                  Please send your payment thru this {gcashNumber}.
                </Text>
              </View>

              <View style={styles.ModinputWrapper}>
                <View style={styles.imagePickerInput}>
                  <Text
                    style={{
                      marginTop: 3,
                      marginLeft: -2,
                      fontFamily: "nunito-light",
                      fontSize: 16,
                      marginRight: 0,
                    }}
                  >
                    Upload a screenshot of your Gcash Payment.
                  </Text>
                  <TouchableOpacity onPress={pickImage}>
                    <Feather
                      name="upload"
                      size={23}
                      color="black"
                      style={{ marginLeft: 2, marginBottom: 0 }}
                    />
                  </TouchableOpacity>
                </View>

                <View
                  style={{
                    //backgroundColor: "red",
                    marginTop: 5,
                    height: 180,
                    width: 285,
                    borderColor: "black",
                    borderWidth: 1,
                  }}
                >
                  {gcashProofImage && (
                    <Image
                      source={{ uri: gcashProofImage }}
                      onLoad={() => console.log("image loaded")}
                      style={{ width: 283, height: 178 }}
                    />
                  )}
                </View>
                <View
                  style={{
                    padding: 0,
                    width: 300,
                    marginTop: 15,
                    justifyContent: "center",
                    alignContent: "center",
                    alignItems: "center",
                  }}
                >
                  {!uploadingImage ? (
                    <TouchableOpacity onPress={handleUploadImage}>
                      <Text
                        style={{
                          fontFamily: "nunito-semibold",
                          textAlign: "center",
                          fontSize: 17,
                          textDecorationLine: "underline",
                        }}
                      >
                        Upload image
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <ActivityIndicator size={"small"} color="black" />
                  )}
                </View>
              </View>
            </View>
          </View>
        </Modal>

        {/* modal for delivery address */}

        <View style={styles.container}>
          <View style={styles.viewBackBtn}>
            <MaterialIcons
              name="arrow-back-ios"
              size={24}
              color="black"
              onPress={() => navigation.goBack()}
              style={{ right: 70 }}
            />
            <View style={styles.viewwatername}>
              <Text style={styles.textwatername}>{passedStationName}</Text>
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
                {newdeliveryTypes &&
                  newdeliveryTypes.map((item) => {
                    const isChecked = item.key === checkedItemKey_deliveryType;
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
                          marginLeft: -85,
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
                          marginLeft: -70,
                          marginRight: 63,
                          // elevation: 2,
                          alignItems: "center",
                        }}
                      >
                        <TouchableOpacity
                          onPress={() => {
                            handleItemChecked_orderType(item);
                            setOrderTypeValue(item.value);
                            console.log(
                              "Order Type clicked value-->",
                              item.value
                            );
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
                                  ? "gray"
                                  : "black",
                              // borderColor: "blue",
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
                                ? "gray"
                                : "black",
                            // color: "red",
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
                    const isChecked = item.key === checkedItemKey_orderMethod;
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
                          marginLeft: -90,
                          marginRight: 95,
                          // elevation: 2,
                          alignItems: "center",
                        }}
                      >
                        <TouchableOpacity
                          onPress={() => {
                            handleItemchecked_orderMethod(item);
                            setOrdeMethod(item.value);
                            setCheckedItemKey_orderMethod(item.key);
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

              {/* Mode of payment */}
              {/* <TouchableOpacity
                onPress={() => setShowModal_ModeOfPayment(true)}
              > */}
              <View style={styles.viewForModeofPayment}>
                <Text
                  style={{
                    fontSize: 17,
                    fontFamily: "nunito-semibold",
                    marginLeft: 8,
                  }}
                >
                  Mode of Payment
                </Text>
                {paymentMethods &&
                  paymentMethods.map((item) => {
                    const isChecked = item.key === checkedItemKey_paymentMethod;
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
                          marginLeft: -80,
                          marginRight: 85,
                          // elevation: 2,
                          alignItems: "center",
                        }}
                      >
                        <TouchableOpacity
                          onPress={() => {
                            handleItemchecked_paymentMethod(item);
                            //setOrdeMethod(item.value);
                            setCheckedItemKey_paymentMethod(item.key);
                            console.log(
                              "payment clicked Value -->",
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
              {/* </TouchableOpacity> */}

              {/* Delivery Address */}

              <View style={styles.viewDeliveryAddress}>
                <TouchableOpacity
                  onPress={() => {
                    navigation.navigate("NewDeliveryAdd", {
                      passedStationName,
                      item,
                      extractedDatas,
                    });
                    //console.log("test 1439",item)
                  }}
                >
                  <Text
                    style={{
                      fontSize: 17,
                      fontFamily: "nunito-semibold",
                      marginLeft: 8,
                    }}
                  >
                    Delivery Address
                  </Text>
                </TouchableOpacity>
              </View>

              {/*Total Order */}
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

              {/* button for place oder */}
              <View
                style={{
                  //backgroundColor: "red",
                  padding: 10,
                  marginTop: 30,
                  height: 50,
                }}
              >
                <View
                  style={{
                    backgroundColor: "transparent",
                    marginTop: 0,
                    height: 50,
                  }}
                >
                  <TouchableOpacity
                    // onPress={() => {
                    //  // navigation.navigate("OrderScreen");
                    //  create
                    // }}
                    onPress={handleSubmit}
                    // disabled={isDisabled}
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
    //backgroundColor:'blue'
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
    justifyContent: "center",
  },
  productDetailswrapper: {
    // backgroundColor: "green",
    padding: 10,
    //flex: 1,
    marginTop: 15,
    height: 1100,
  },
  viewwatername: {
    width: 180,
    justifyContent: "center",
    //alignItems:'center'
  },
  textwatername: {
    fontSize: 20,
    fontFamily: "nunito-bold",
    fontWeight: "bold",
    width: 180,
    //backgroundColor:'yellow',
    alignItems: "center",
    textAlign: "center",
    right: 20,
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
  swapOptionModal: {
    width: 335,
    height: 210,
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
    //  backgroundColor: "green",
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
    marginTop: 20,
    marginLeft: 5,
  },
  viewForModeofPayment: {
    backgroundColor: "white",
    width: 140,
    height: 30,
    padding: 6,
    borderRadius: 8,
    marginTop: 12,
    elevation: 3,
    flexDirection: "row",
  },
  modeofPaymentModal: {
    width: 310,
    height: 350,
    backgroundColor: "white",
    borderBottomColor: "gray",
    borderBottomWidth: 1,
    borderRadius: 3,
    elevation: 10,
    marginBottom: 50,
  },

  modeofPaymentModalTitle: {
    justifyContent: "flex-start",
    padding: 0,
    flexDirection: "row",
    marginLeft: 5,
    padding: 4,
  },
  ModinputWrapper: {
    //backgroundColor: "green",
    paddingVertical: 5,
    marginTop: 5,
    height: 120,
    padding: 6,
  },
  imagePickerInput: {
    flexDirection: "row",
    // borderBottomColor: "gray",
    //borderBottomWidth: 0.5,
    paddingBottom: 2,
    marginBottom: 5,
    width: 270,
    marginTop: 5,
    marginLeft: 5,
  },
  viewDeliveryAddress: {
    backgroundColor: "white",
    width: 140,
    height: 30,
    padding: 6,
    borderRadius: 8,
    marginTop: 60,
    elevation: 3,
    flexDirection: "row",
  },
  deliveryAddModal: {
    width: 310,
    height: 300,
    backgroundColor: "whitesmoke",
    borderBottomColor: "gray",
    borderBottomWidth: 1,
    borderRadius: 3,
    elevation: 10,
    marginBottom: 50,
  },
  deliveryAddTitle: {
    justifyContent: "flex-start",
    padding: 0,
    flexDirection: "row",
    marginLeft: 5,
    padding: 4,
    backgroundColor: "red",
  },
  deliveryAddWrapper: {},
  ViewAddress: {
    flexDirection: "row",
    borderBottomColor: "black",
    borderBottomWidth: 1,
    paddingBottom: 2,
    marginBottom: 25,
    width: 270,
    marginTop: 25,
    // backgroundColor:'red',
    marginLeft: 8,
    //position:"absolute"
  },
  viewLandmark: {
    flexDirection: "row",
    borderBottomColor: "black",
    borderBottomWidth: 1,
    paddingBottom: 2,
    marginBottom: 25,
    width: 270,
    marginTop: 10,
    //backgroundColor:'red',
    marginLeft: 8,
  },
});
