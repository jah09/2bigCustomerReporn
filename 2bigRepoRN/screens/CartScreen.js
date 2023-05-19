import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  TextInput,
  ToastAndroid,
  ActivityIndicator,
} from "react-native";
import React, {
  useState,
  useCallback,
  useEffect,
  useLayoutEffect,
} from "react";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useRoute } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";
import {
  set,
  ref,
  onValue,
  query,
  orderByChild,
  equalTo,
  off,
  update,
  get,
  child,
} from "firebase/database";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getDistance } from "geolib";
import { globalStyles } from "../ForStyle/GlobalStyles";
import { db } from "../firebaseConfig";
import { Feather } from "@expo/vector-icons";
import { AntDesign } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { firebase } from "../firebaseStorage";
import { useSafeAreaFrame } from "react-native-safe-area-context";
import { responsiveWidth } from "react-native-responsive-dimensions";

export default function CartScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const {
    paramnewDeliveryDetails,
    selectedItem,
    storeName,
    extractedDatas,
    deliveryAddressOption,
    passedTotalAmount,
    item,
    combinedData,
    totalPickUpfee,
    input_PickupRequest,
    input_SwapWithReservation,
    selectedSwaption,
    rewardScreenNewModeOfPayment,
  } = route.params ? route.params : {};
  const passedStationName =
    extractedDatas?.refillingStoreProperties?.stationName;
  const passedAdminID = extractedDatas?.adminProperties?.adminID;
  const passedStationStatus =
    extractedDatas?.refillingStoreProperties?.stationStatus;
  //console.log("line 70",rewardScreenNewModeOfPayment)
  const secondItem = item;
  useEffect(() => {
    if (passedTotalAmount !== null) {
      setFinalTotalAmount(passedTotalAmount);
    }
  }, [passedTotalAmount]);

  //console.log("RECEIVING CART SCREEN --->Total Fee",passedTotalAmount);
  // console.log("RECEIVING CART SCREEN --->Selected Item",selectedItem);

  // console.log(
  //   "RECEIVING CART SCREEN --->Selected Swap Option and value ",
  //   selectedSwaption,input_SwapWithReservation
  // );
  const [passedSelectedSwapOption, setpassedSelectedSwapOption] =
    useState(selectedSwaption);
  const [passedSelectedSwapOption_Vaue, setpassedSelectedSwapOption_Value] =
    useState(input_SwapWithReservation);

  // console.log("RECEIVING CART SCREEN --->rEWARDS", passedRewardsData);
  //state variable that holds data from the previos screen "Product component"
  const [passedData_SelectedItem, setpassedData_SelectedItem] =
    useState(selectedItem);
  const [passedCombinedData, setpassedCombinedData] = useState(combinedData);
  const onPresshandler_toStationPage = () => {
    //  console.log("send 36",secondItem, combinedData);
    navigation.goBack();
  };

  //get customer Data
  useLayoutEffect(() => {
    AsyncStorage.getItem("customerData") //e get ang Asycn sa login screen
      .then((data) => {
        if (data !== null) {
          //if data is not null
          const parsedData = JSON.parse(data); //then e store ang Data into parsedData
          setCustomerData(parsedData); //passed the parsedData to customerDta
          //console.log("Customer Data",parsedData);
          const CustomerUID = parsedData.cusId;
          //console.log("line 103--->Rewards Data",passedRewardsData);
          setCustomerID(CustomerUID);
        }
      })
      .catch((error) => {
        console.log(error);
        alert("Error fetching data: ", error);
      });
  }, []);
  const [customerData, setCustomerData] = useState({}); //getting the customer's data from AsyncStorage
  const [customerID, setCustomerID] = useState();

  //codees for quantity and get the initial amount-----------------------------------------------------------------------

  const [count, setCount] = useState({});

  const [initialAmount, setInitialAmount] = useState({});
  const initialAmountArr = Object.values(initialAmount);
  const roundedAmountArr = initialAmountArr.map((val) =>
    parseFloat(val.toFixed(2))
  );
  const totalInitialAmount = roundedAmountArr.reduce(
    (acc, curr) => acc + curr,
    0
  );

  const [totalQuantity, setTotalQuantity] = useState(0);

  //new code
  const handleIncrement = (item) => {
    const currentItemId = item.id;

    // Calculate the product price
    let waterPrice = 0;
    if (item.thirdparty_productPrice && item.pro_refillPrice) {
      console.log(
        "Error: Both other_productPrice and pro_refillPrice are defined."
      );
    } else if (item.thirdparty_productPrice) {
      waterPrice = parseFloat(item.thirdparty_productPrice);
      // Apply other product discount
      waterPrice *= (100 - item.thirdparty_productDiscount) / 100;
    } else if (item.pro_refillPrice) {
      waterPrice = parseFloat(item.pro_refillPrice);
      // Apply refill product discount
      waterPrice *= (100 - item.pro_discount) / 100;
    } else {
      console.log(
        "Error: Neither other_productPrice nor pro_refillPrice are defined."
      );
    }

    // Update count and initial amount state for the current item
    const newCounts = { ...count };
    newCounts[currentItemId] = (newCounts[currentItemId] || 0) + 1;
    setCount(newCounts);
    setQuantity(Object.values(newCounts)[0]);

    const quantityValues = Object.values(newCounts);
    const totalQuantity = quantityValues.reduce((acc, curr) => acc + curr, 0); //reduce the object

    setTotalQuantity(totalQuantity); //pass the  totalQuantity to this state variable

    const newInitialAmount = { ...initialAmount };
    newInitialAmount[currentItemId] =
      (newInitialAmount[currentItemId] || 0) + waterPrice;

    setInitialAmount(newInitialAmount);
  };
  //decrement of the quantity
  const handleDecrement = (item) => {
    const currentItemId = item.id;
    if (!count[currentItemId]) {
      return;
    }

    // Calculate the product price
    let waterPrice = 0;
    if (item.thirdparty_productPrice && item.pro_refillPrice) {
      console.log(
        "Error: Both other_productPrice and pro_refillPrice are defined."
      );
    } else if (item.thirdparty_productPrice) {
      waterPrice = parseFloat(item.thirdparty_productPrice);
      // Apply other product discount
      waterPrice *= (100 - item.thirdparty_productDiscount) / 100;
    } else if (item.pro_refillPrice) {
      waterPrice = parseFloat(item.pro_refillPrice);
      // Apply refill product discount
      waterPrice *= (100 - item.pro_discount) / 100;
    } else {
      console.log(
        "Error: Neither other_productPrice nor pro_refillPrice are defined."
      );
    }

    // Update count and initial amount state for the current item
    const newCounts = { ...count };
    newCounts[currentItemId] = (newCounts[currentItemId] || 0) - 1;
    if (newCounts[currentItemId] < 0) {
      newCounts[currentItemId] = 0;
    }
    setCount(newCounts);
    setQuantity(Object.values(newCounts)[0]);
    console.log("Quantity --> is");
    const newInitialAmount = { ...initialAmount };
    const newAmount = (newInitialAmount[currentItemId] || 0) - waterPrice;
    const roundedAmount = parseFloat(newAmount.toFixed(2));
    newInitialAmount[currentItemId] = roundedAmount;
    setInitialAmount(newInitialAmount);
  };

  //get the delivey Details from previous screen
  const [newDeliveryDetails, setnewDeliveryDetails] = useState(
    paramnewDeliveryDetails
  );
  // console.log("passed delivery details",  newDeliveryDetails[0].orderTypes)
  const neworderTypes = newDeliveryDetails?.[0].orderTypes.split(", ");

  const [newOrder_Type, setnewOrder_Type] = useState();
  // console.log("line 93",newOrder_Type)
  const orderTypes = [];
  const newOrderTypes = useCallback(() => {
    if (neworderTypes && neworderTypes[0]) {
      neworderTypes.forEach((orderType, index) => {
        const deliveryType = {
          label: orderType,
          value: orderType.toString(),
          key: index + 1,
        };
        orderTypes.push(deliveryType);
      });
    }
    return orderTypes;
  }, [newDeliveryDetails]);

  useLayoutEffect(() => {
    const orderTypes = newOrderTypes();
    setnewOrder_Type(orderTypes);
    // console.log("new order types:", orderTypes);
  }, [newDeliveryDetails, newOrderTypes]);
  //console.log("line 116",newDeliveryDetails);

  //order Type codes Start here---------------------------------------------------------------------------------------------------
  const [selectedOrdertype, setselectedOrderType] = useState();

  const [checkedItemKey_orderType, setCheckedItemKey_orderType] =
    useState(null);
  useLayoutEffect(() => {
    if (newDeliveryDetails) {
      const vehicle1Fee =
        newDeliveryDetails &&
        Array.isArray(newDeliveryDetails) &&
        newDeliveryDetails.length > 0
          ? parseFloat(newDeliveryDetails[0].vehicle1Fee)
          : null;
      setvechicle1fee(vehicle1Fee);
      const vehicle2Name =
        newDeliveryDetails &&
        Array.isArray(newDeliveryDetails) &&
        newDeliveryDetails.length > 0
          ? newDeliveryDetails[0].vehicle2Name
          : null;

      const vehicle2Fee =
        newDeliveryDetails &&
        Array.isArray(newDeliveryDetails) &&
        newDeliveryDetails.length > 0
          ? parseFloat(newDeliveryDetails[0].vehicle2Fee)
          : null;
      setvechicle2fee(vehicle2Fee);
      const vehicle3Name =
        newDeliveryDetails &&
        Array.isArray(newDeliveryDetails) &&
        newDeliveryDetails.length > 0
          ? newDeliveryDetails[0].vehicle3Name
          : null;
      const vehicle3Fee =
        newDeliveryDetails &&
        Array.isArray(newDeliveryDetails) &&
        newDeliveryDetails.length > 0
          ? parseFloat(newDeliveryDetails[0].vehicle3Fee)
          : null;
      setvechicle3fee(vehicle3Fee);
    }
  }, [newDeliveryDetails]);
  const [vechicle1fee, setvechicle1fee] = useState();
  const [vechicle2fee, setvechicle2fee] = useState();
  const [vechicle3fee, setvechicle3fee] = useState();
  // const [vehicleFee, setvehicleFee] = useState(0);

  const handleItemChecked_orderType = (item) => {
    //vehicle value and its fee

    setCheckedItemKey_orderType(
      item.key === checkedItemKey_orderType ? null : item.key
    );
    if (item.value === "Delivery") {
      Alert.alert(
        "Note",
        `Standard Delivery: Your order will be delivered within the day.\n\nExpress Delivery: Your order will be delivered within a specific span of time.\n\nReservation Delivery: You will be the one to decide when to deliver the water.\n\nDelivery fee is base on your distance from store.\n\nVehicle fee is base on your overall quantities.\n\n₱${vechicle1fee.toFixed(
          2
        )} for 1 pc/s.\n₱${vechicle2fee.toFixed(
          2
        )} for 2-5 pc/s\n₱${vechicle3fee.toFixed(2)} for 6 and more.`
      );

      const deliveryTypeholder = [];
      const { stanDeliverytype, exDeliveryType, resDeliveryType } =
        newDeliveryDetails[0];
      //stanDeliverytype
      const ValuesDeliveryType = [
        stanDeliverytype,
        exDeliveryType,
        resDeliveryType,
      ];
      ValuesDeliveryType.forEach((value, index) => {
        const delivryType = {
          label: value,
          value: value ? value.toString() : "",
          key: index + 1,
        };

        deliveryTypeholder.push(delivryType);

        setDeliveryTypes(deliveryTypeholder);
        const filteredDeliveryTypes = deliveryTypeholder.filter((type) => {
          return type.value === "Standard" || type.value === "Express";
        });

        setreservationDeliveryTypes(filteredDeliveryTypes);
      });
      setText("Reservation Date");
    } else {
      setpassedCombinedData(null);
      setCheckedItemKey_deliveryType(null);
      setCheckedItemKey_paymentMethod(null);
      console.log("pick up is press");
      const deliveryTypeholder = [];
      const { stanDeliverytype, exDeliveryType, resDeliveryType } =
        newDeliveryDetails[0];
      const ValuesDeliveryType = [
        stanDeliverytype,
        exDeliveryType,
        resDeliveryType,
      ];

      ValuesDeliveryType.forEach((value, index) => {
        const delivryType = {
          label: value,
          value: value.toString(),
          key: index + 1,
        };

        deliveryTypeholder.push(delivryType);

        setDeliveryTypes(deliveryTypeholder);

        //filter the deliveryTypeholder, standard and express only
        const filteredDeliveryTypes = deliveryTypeholder.filter((type) => {
          return type.value === "Standard" || type.value === "Express";
        });

        setreservationDeliveryTypes(filteredDeliveryTypes);
      });
    }
  };
  //order Type codes end here---------------------------------------------------------------------------------------------------

  //delivery type codes here-------------------------------------------------------------------------------------------------
  const [deliveryTypes, setDeliveryTypes] = useState();

  const [checkedItemKey_deliveryType, setCheckedItemKey_deliveryType] =
    useState(null);
  const [selectedDeliveryType, setSelectedDeliveryType] = useState(null);
  //console.log("Selected delivery type is ",selectedDeliveryType);
  const handleItemChecked_deliveryType = (item) => {
    setCheckedItemKey_deliveryType(
      item.key === checkedItemKey_deliveryType ? null : item.key
    );
    setSelectedDeliveryType(item.value);
    if (item.value === "Standard") {
      if (selectedOrdertype == "PickUp") {
        Alert.alert("Note", "You can pick up your gallon/s within today");
        setCheckedItemKey_paymentMethod(null);
      } else {
        Alert.alert(
          "To our beloved customer",
          `Schedule delivery time for standard is ${newDeliveryDetails[0].stanDeliveryTime}`
        );

        // console.log("newdelivery data",newDeliveryDetails)
      }
    } else if (item.value === "Reservation") {
      if (selectedOrdertype === null) {
        alert("Please select an order type");
      } else if (selectedOrdertype === "PickUp") {
        // console.log("Reservation is press but order type is pick up");
      } else {
        setShowReservationModal(true);
        // console.log("Reservation is press but order type is delivery");
      }
    } else {
      Alert.alert(
        "To our beloved customer",
        `Estimated delivery time for express is ${newDeliveryDetails[0].exEstimatedDelivery} mins.`
      );
      if (selectedOrdertype === "PickUp") {
        //console.log("line 305 lang gud ")
        Alert.alert("To our beloved customer", "Express is only for delivery.");
      }
    }
  };

  //reservation Delivery types---------------------------------------------------------------------
  const [reservationDeliveryTypes, setreservationDeliveryTypes] = useState();
  const [selectedReserveDeliveryType, setselectedReserveDeliveryType] =
    useState();
  //console.log("434",selectedReserveDeliveryType)
  const [
    checkedItemKey_reservationDeliveryTypes,
    setcheckedItemKey_reservationDeliveryTypes,
  ] = useState(null);

  const handleItemChecked_ReservationdeliveryType = (item) => {
    setcheckedItemKey_reservationDeliveryTypes(
      item.key === checkedItemKey_reservationDeliveryTypes ? null : item.key
    );
  };

  //date for reservation date in reservation delivery Types
  const minDate = new Date(); // current date
  minDate.setHours(0, 0, 0, 0); // set hours, minutes, seconds, and milliseconds to zero
  const [reserveDeliverydate, setreserveDeliverydate] = useState(new Date());
  const [reserveDeliverymode, setreserveDeliverymode] = useState("date");
  const [reserveDeliveryshow, setreserveDeliveryshow] = useState(false);
  const [reserveDeliverytext, setreserveDeliverytext] =
    useState("Reservation Date");
  const [reserveDeliveryTime, setreserveDeliveryTime] =
    useState("Reservation Time");

  const reserveDeliveryonChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setreserveDeliveryshow(Platform.OS === "ios");
    setreserveDeliverydate(currentDate);

    let temporaryDate = new Date(currentDate);
    let fdate =
      temporaryDate.getDate() +
      "/" +
      (temporaryDate.getMonth() + 1) +
      "/" +
      temporaryDate.getFullYear();
    //  let ftime =
    //    "Hours:" +
    //   temporaryDate.getHours() + "|Mins:"+ temporaryDate.getMinutes();
    let hours = temporaryDate.getHours();
    let minutes = temporaryDate.getMinutes();
    let ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? "0" + minutes : minutes;
    let ftime = hours + ":" + minutes + " " + ampm;
    console.log("date selected", fdate);
    console.log("Time selected", ftime);
    if (selectedReserveDeliveryType === "Standard") {
      console.log("Reservation, Selected Delivery Type is  Standard");
      setreserveDeliverytext(fdate);
      setreservationDate_ReserveDeliveryTypes(fdate);
      setreserveDeliveryTime("");
    } else {
      console.log("Reservation, Selected Delivery Type is  Express");
      setreserveDeliveryTime(ftime);
      setreserveDeliverytext(fdate);
      setreservationDate_ReserveDeliveryTypes(fdate);
      setreservation_ReserveDeliveryTypes(ftime);
    }
  };
  const reserveDeliveryshowMode = (currentMode) => {
    setreserveDeliveryshow(true);
    setreserveDeliverymode(currentMode);
  };

  //Payment method codes here------------------------------------------------------------------------------------------------

  const [checkedItemKey_paymentMethod, setCheckedItemKey_paymentMethod] =
    useState(null);
  const handleItemchecked_paymentMethod = (item) => {
    setCheckedItemKey_paymentMethod(
      item.key === checkedItemKey_paymentMethod ? null : item.key
    );
    if (item.value === "CashOnDelivery") {
      // console.log("COD");
      // if (selectedOrdertype === "PickUp") {
      //   Alert.alert("To our beloved customer", "COD is only for delivery.");
      // }
    } else if (item.value === "Gcash") {
      // setShowModal_ModeOfPayment(true);
    } else {
      navigation.navigate("RewardScreen", {
        passedStationName,
        secondItem,
        extractedDatas,
        FinalTotalAmount: parseFloat(FinalTotalAmount),
        customerData,
        selectedItem,
        paymentMethods,
        gcashNumber,
      });
      //console.log("inside else",rewardsData);
    }
  };

  const [paymentMethods, setPaymentMethods] = useState([]);
  // console.log("line 245", paymentMethods);
  const gcashNumber = parseFloat(
    newDeliveryDetails &&
      Array.isArray(newDeliveryDetails) &&
      newDeliveryDetails.length > 0
      ? newDeliveryDetails[0].gcashNumber
      : null
  );

  // console.log("line 91", gcashNumber);

  useLayoutEffect(() => {
    if (Array.isArray(newDeliveryDetails) && newDeliveryDetails.length > 0) {
      const splitPaymentMethods =
        (newDeliveryDetails &&
          newDeliveryDetails[0]?.paymentMethods.split(", ")) ||
        [];
      // console.log("reserve line 154",splitPaymentMethods);
      const splitValuesOrderTypeArray = splitPaymentMethods.map(
        (type, index) => ({
          label: type,
          value: type.toString(),
          key: index + 1,
        })
      );
      // console.log("338",splitValuesOrderTypeArray)
      setPaymentMethods(splitValuesOrderTypeArray);
    } else {
      setPaymentMethods([]);
    }
  }, [newDeliveryDetails]);

  //getting the date and code for reservation Date--------------------------------------------------------------------
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

  //modal for swap option and payment method -------------------------------------------------------------------------------------

  const [showModal_ModeOfPayment, setShowModal_ModeOfPayment] = useState(false);
  const [reservationModal, setShowReservationModal] = useState(false);

  //get the total amount base on initial amount, plus distance.----------------------------------------------------------
  const customerLatt = parseFloat(customerData.lattitudeLocation); // console.log('Customer Latt-->', customerLatt);
  const customerLong = parseFloat(customerData.longitudeLocation); // console.log('Customer Latt-->', customerLong);
  const adminLatt = parseFloat(
    extractedDatas.refillingStoreProperties.lattitude
  );
  const adminLong = parseFloat(
    extractedDatas.refillingStoreProperties.longitude
  );
  const [deliveyfeeValue, setdeliveyfeeValue] = useState();
  //calculate distance of customer to store and add it to initial amount
  useLayoutEffect(() => {
    // setQuantity(Object.values(newCounts)[0]);

    //get the distance between customer and store location using the API
    const dynamicDistance = getDistance(
      { latitude: customerLatt, longitude: customerLong },
      { latitude: adminLatt, longitude: adminLong }
    );
    const customerDistanceToStation = dynamicDistance / 1000; //the result distance is by meter but I divide 1000 so it will result KM
    // console.log("Distance from customer to store", customerDistanceToStation)

    //standard delivery type
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
    //extracted delivery distance and fee and value  for RESERVATION
    const reservationDeliveryValue =
      newDeliveryDetails &&
      Array.isArray(newDeliveryDetails) &&
      newDeliveryDetails.length > 0
        ? newDeliveryDetails[0].resDeliveryType
        : null;

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

    //vehicle value and its fee
    const vehicle1Name =
      newDeliveryDetails &&
      Array.isArray(newDeliveryDetails) &&
      newDeliveryDetails.length > 0
        ? newDeliveryDetails[0].vehicle1Name
        : null;
    const vehicle1Fee =
      newDeliveryDetails &&
      Array.isArray(newDeliveryDetails) &&
      newDeliveryDetails.length > 0
        ? parseFloat(newDeliveryDetails[0].vehicle1Fee)
        : null;

    const vehicle2Name =
      newDeliveryDetails &&
      Array.isArray(newDeliveryDetails) &&
      newDeliveryDetails.length > 0
        ? newDeliveryDetails[0].vehicle2Name
        : null;
    const vehicle2Fee =
      newDeliveryDetails &&
      Array.isArray(newDeliveryDetails) &&
      newDeliveryDetails.length > 0
        ? parseFloat(newDeliveryDetails[0].vehicle2Fee)
        : null;

    const vehicle3Name =
      newDeliveryDetails &&
      Array.isArray(newDeliveryDetails) &&
      newDeliveryDetails.length > 0
        ? newDeliveryDetails[0].vehicle3Name
        : null;
    const vehicle3Fee =
      newDeliveryDetails &&
      Array.isArray(newDeliveryDetails) &&
      newDeliveryDetails.length > 0
        ? parseFloat(newDeliveryDetails[0].vehicle3Fee)
        : null;

    //console.log("line 695",vehicle1Name)
    if (selectedOrdertype === "Delivery") {
      //standard delivery type
      if (selectedDeliveryType === standardDeliveryValue) {
        console.log("Standard CUstomer distance", customerDistanceToStation);
        // If the value of customerDistanceToStation is greater than standardDistance, then the code inside the if block will execute.
        if (customerDistanceToStation > standardDistance) {
          if (totalInitialAmount) {
            //exceeding distance between store and the customer location
            const exceedingDistance = (
              customerDistanceToStation - parseFloat(standardDistance)
            ).toFixed(2);
            console.log("Standard Exceeding Distance", exceedingDistance);

            const additionalCost =
              parseFloat(standardDeliveryFee) * exceedingDistance;
            setdeliveyfeeValue(additionalCost.toFixed(2));
            console.log(" Standard additioal cost", additionalCost);

            const total = parseFloat(totalInitialAmount) + additionalCost;
            console.log("Standard total result standard", total);
            let subtotal = 0;
            if (totalQuantity >= 6) {
              subtotal = total + vehicle3Fee; //total amount is added by the fee of the vehicle

              setvehicleFeeSaveToDb(vehicle3Fee);
              if (!isNaN(subtotal)) {
                setTotalAmount(subtotal.toFixed(2));
              } else {
                setTotalAmount("Total Amount");
              }
            } else if (totalQuantity >= 2 && totalQuantity <= 5) {
              subtotal = total + vehicle2Fee; //total amount is added by the fee of the vehicle
              setvehicleFeeSaveToDb(vehicle2Fee);
              //alert(`Quantities-->${totalQuantity} and the fee is ${vehicle2Fee}`)
              console.log("line 770", subtotal);
              if (!isNaN(subtotal)) {
                setTotalAmount(subtotal.toFixed(2));
              } else {
                setTotalAmount("Total Amount");
              }
            } else {
              subtotal = total + vehicle1Fee;
              setvehicleFeeSaveToDb(vehicle1Fee);
              // alert(`Quantities-->${totalQuantity} and the fee is ${vehicle1Fee}`)
              if (!isNaN(subtotal)) {
                setTotalAmount(subtotal.toFixed(2));
              } else {
                setTotalAmount("Total Amount");
              }
            }
          }
        } else {
          //if customer location is less  than standard distance set by admin
          //console.log("DELIVERY --> STANDARD--> ELSE BLOCK--> CUSTOMER DISTANCE IS LESS THAN TO DISTANCE SET BY ADMIN IN STANDARD")
          if (totalInitialAmount) {
            if (totalQuantity >= 6) {
              console.log("total quantity is 6 ", totalQuantity);

              const subtotalAmount =
                totalInitialAmount + parseFloat(vehicle3Fee);
              setvehicleFeeSaveToDb(vehicle3Fee);
              if (!isNaN(parseFloat(subtotalAmount).toFixed(2))) {
                console.log(
                  "ORDER TYPE IS DELIVERY, DELIVERY TYPE IS STANDARD----> QUANTITY IS 6",
                  subtotalAmount
                );
                setTotalAmount(parseFloat(subtotalAmount).toFixed(2));
              } else {
                setTotalAmount("Total Amount");
              }
            } else if (totalQuantity >= 2 && totalQuantity <= 5) {
              console.log("total quantity is 2 ", totalQuantity);
              const subtotalAmount =
                totalInitialAmount + parseFloat(vehicle2Fee);
              setvehicleFeeSaveToDb(vehicle2Fee);
              if (!isNaN(parseFloat(subtotalAmount).toFixed(2))) {
                console.log(
                  "ORDER TYPE IS DELIVERY, DELIVERY TYPE IS STANDARD----> QUANTITY IS 2 or more but greater then 5",
                  subtotalAmount
                );
                setTotalAmount(parseFloat(subtotalAmount).toFixed(2));
              } else {
                setTotalAmount("Total Amount");
              }
            } else {
              //if the qty is 6 up
              console.log("total quantity is 1 ", totalQuantity);
              const subtotalAmount =
                totalInitialAmount + parseFloat(vehicle1Fee);
              setvehicleFeeSaveToDb(vehicle1Fee);
              if (!isNaN(parseFloat(subtotalAmount).toFixed(2))) {
                console.log(
                  "ORDER TYPE IS DELIVERY, DELIVERY TYPE IS STANDARD----> QUANTITY is 1",
                  subtotalAmount
                );
                setTotalAmount(parseFloat(subtotalAmount).toFixed(2));
              } else {
                setTotalAmount("Total Amount");
              }
            }
          }
        }
      } else if (selectedDeliveryType === expressDeliveryValue) {
        {
          /* if selected delivery type is express */
        }
        console.log("Express CUstomer distance", customerDistanceToStation);
        console.log("Express distance", expressDeliveryDistance);
        // console.log("Delivery but express is choosen");
        // If the value of customerDistanceToStation is greater than expressDeliveryDistance, then the code inside the if block will execute.
        if (customerDistanceToStation > expressDeliveryDistance) {
          if (totalInitialAmount) {
            const exceedingDistance = (
              customerDistanceToStation - parseFloat(expressDeliveryDistance)
            ).toFixed(2); //minus ang distance ni customer og ang store set for this delivery type
            console.log("Express Exceeding Distance", exceedingDistance);
            const additionalCost =
              parseFloat(expressDeliveryFee) * exceedingDistance; // time sa pay if pila ang ni exceed
            console.log("Express add cost", additionalCost);
            setdeliveyfeeValue(additionalCost.toFixed(2));
            const total = parseFloat(totalInitialAmount) + additionalCost; //add ang additional cost plust and totalInitialamount
            let subtotal = 0;
            if (totalQuantity >= 6) {
              subtotal = total + vehicle3Fee; //total amount is added by the fee of the vehicle
              setvehicleFeeSaveToDb(vehicle3Fee);
              //  alert(`Quantities-->${totalQuantity} and the fee is ${vehicle3Fee}`)

              if (!isNaN(subtotal)) {
                setTotalAmount(subtotal.toFixed(2));
              } else {
                setTotalAmount("Total Amount");
              }
            } else if (totalQuantity >= 2 && totalQuantity <= 5) {
              subtotal = total + vehicle2Fee; //total amount is added by the fee of the vehicle
              setvehicleFeeSaveToDb(vehicle2Fee);
              //alert(`Quantities-->${totalQuantity} and the fee is ${vehicle2Fee}`)
              console.log("line 770", subtotal);
              if (!isNaN(subtotal)) {
                setTotalAmount(subtotal.toFixed(2));
              } else {
                setTotalAmount("Total Amount");
              }
            } else {
              subtotal = total + vehicle1Fee;
              setvehicleFeeSaveToDb(vehicle1Fee);
              // alert(`Quantities-->${totalQuantity} and the fee is ${vehicle1Fee}`)
              if (!isNaN(subtotal)) {
                setTotalAmount(subtotal.toFixed(2));
              } else {
                setTotalAmount("Total Amount");
              }
            }

            // if (!isNaN(total)) {
            //   setTotalAmount(total.toFixed(2));
            // } else {
            //   setTotalAmount("Total Amount");
            // }
          }
        } else {
          if (totalInitialAmount) {
            if (totalQuantity >= 6) {
              console.log("total quantity is 6 ", totalQuantity);

              const subtotalAmount =
                totalInitialAmount + parseFloat(vehicle3Fee);
              setvehicleFeeSaveToDb(vehicle3Fee);
              if (!isNaN(parseFloat(subtotalAmount).toFixed(2))) {
                console.log(
                  "ORDER TYPE IS DELIVERY, DELIVERY TYPE IS EXPRESSS----> QUANTITY IS 6",
                  subtotalAmount
                );
                setTotalAmount(parseFloat(subtotalAmount).toFixed(2));
              } else {
                setTotalAmount("Total Amount");
              }
            } else if (totalQuantity >= 2 && totalQuantity <= 5) {
              console.log("total quantity is 2 ", totalQuantity);
              const subtotalAmount =
                totalInitialAmount + parseFloat(vehicle2Fee);
              setvehicleFeeSaveToDb(vehicle2Fee);
              if (!isNaN(parseFloat(subtotalAmount).toFixed(2))) {
                console.log(
                  "ORDER TYPE IS DELIVERY, DELIVERY TYPE IS EXPRESSS----> QUANTITY IS 2 or more but greater then 5",
                  subtotalAmount
                );
                setTotalAmount(parseFloat(subtotalAmount).toFixed(2));
              } else {
                setTotalAmount("Total Amount");
              }
            } else {
              //if the qty is 6 up
              console.log("total quantity is 1 ", totalQuantity);
              const subtotalAmount =
                totalInitialAmount + parseFloat(vehicle1Fee);
              setvehicleFeeSaveToDb(vehicle1Fee);
              if (!isNaN(parseFloat(subtotalAmount).toFixed(2))) {
                console.log(
                  "ORDER TYPE IS DELIVERY, DELIVERY TYPE IS EXPRESSS----> QUANTITY is 1",
                  subtotalAmount
                );
                setTotalAmount(parseFloat(subtotalAmount).toFixed(2));
              } else {
                setTotalAmount("Total Amount");
              }
            }
          }
        }
      } else if (selectedDeliveryType === reservationDeliveryValue) {
        {
          /* order type is delivery but reservation is choosen so after that if Reservation, another payment for the standard and express */
        }

        if (selectedReserveDeliveryType === standardDeliveryValue) {
          if (customerDistanceToStation > standardDistance) {
            if (totalInitialAmount) {
              //exceeding distance between store and the customer location
              const exceedingDistance = (
                customerDistanceToStation - parseFloat(standardDistance)
              ).toFixed(2);
              console.log(
                "reservation Standard Exceeding Distance",
                exceedingDistance
              );

              const additionalCost =
                parseFloat(standardDeliveryFee) * exceedingDistance;
              setdeliveyfeeValue(additionalCost.toFixed(2));
              console.log(
                " reservation Standard additioal cost",
                additionalCost
              );

              const total = parseFloat(totalInitialAmount) + additionalCost;
              console.log("reservation Standard total result standard", total);
              let subtotal = 0;
              if (totalQuantity >= 6) {
                subtotal = total + vehicle3Fee; //total amount is added by the fee of the vehicle
                setvehicleFeeSaveToDb(vehicle3Fee);
                if (!isNaN(subtotal)) {
                  setTotalAmount(subtotal.toFixed(2));
                } else {
                  setTotalAmount("Total Amount");
                }
              } else if (totalQuantity >= 2 && totalQuantity <= 5) {
                subtotal = total + vehicle2Fee; //total amount is added by the fee of the vehicle
                setvehicleFeeSaveToDb(vehicle2Fee);
                //alert(`Quantities-->${totalQuantity} and the fee is ${vehicle2Fee}`)
                console.log("reservation standard line 770", subtotal);
                if (!isNaN(subtotal)) {
                  setTotalAmount(subtotal.toFixed(2));
                } else {
                  setTotalAmount("Total Amount");
                }
              } else {
                subtotal = total + vehicle1Fee;
                // alert(`Quantities-->${totalQuantity} and the fee is ${vehicle1Fee}`)
                setvehicleFeeSaveToDb(vehicle1Fee);
                if (!isNaN(subtotal)) {
                  setTotalAmount(subtotal.toFixed(2));
                } else {
                  setTotalAmount("Total Amount");
                }
              }
            } else {
              if (totalInitialAmount) {
                if (!isNaN(parseFloat(totalInitialAmount).toFixed(2))) {
                  setTotalAmount(parseFloat(totalInitialAmount).toFixed(2));
                } else {
                  setTotalAmount("Total Amount");
                }
              }
            }
          } else {
            if (totalInitialAmount) {
              if (totalQuantity >= 6) {
                console.log("total quantity is 6 ", totalQuantity);

                const subtotalAmount =
                  totalInitialAmount + parseFloat(vehicle3Fee);
                setvehicleFeeSaveToDb(vehicle3Fee);

                if (!isNaN(parseFloat(subtotalAmount).toFixed(2))) {
                  console.log(
                    "ORDER TYPE IS DELIVERY, DELIVERY TYPE IS STANDARD----> QUANTITY IS 6",
                    subtotalAmount
                  );
                  setTotalAmount(parseFloat(subtotalAmount).toFixed(2));
                } else {
                  setTotalAmount("Total Amount");
                }
              } else if (totalQuantity >= 2 && totalQuantity <= 5) {
                console.log("total quantity is 2 ", totalQuantity);
                const subtotalAmount =
                  totalInitialAmount + parseFloat(vehicle2Fee);
                setvehicleFeeSaveToDb(vehicle2Fee);
                if (!isNaN(parseFloat(subtotalAmount).toFixed(2))) {
                  console.log(
                    "ORDER TYPE IS DELIVERY, DELIVERY TYPE IS STANDARD----> QUANTITY IS 2 or more but greater then 5",
                    subtotalAmount
                  );
                  setTotalAmount(parseFloat(subtotalAmount).toFixed(2));
                } else {
                  setTotalAmount("Total Amount");
                }
              } else {
                //if the qty is 6 up
                console.log("total quantity is 1 ", totalQuantity);
                const subtotalAmount =
                  totalInitialAmount + parseFloat(vehicle1Fee);
                setvehicleFeeSaveToDb(vehicle1Fee);
                if (!isNaN(parseFloat(subtotalAmount).toFixed(2))) {
                  console.log(
                    "ORDER TYPE IS DELIVERY, DELIVERY TYPE IS STANDARD----> QUANTITY is 1",
                    subtotalAmount
                  );
                  setTotalAmount(parseFloat(subtotalAmount).toFixed(2));
                } else {
                  setTotalAmount("Total Amount");
                }
              }
            }
          }
        } else {
          if (customerDistanceToStation > expressDeliveryDistance) {
            if (totalInitialAmount) {
              const exceedingDistance = (
                customerDistanceToStation - parseFloat(expressDeliveryDistance)
              ).toFixed(2); //minus ang distance ni customer og ang store set for this delivery type
              console.log("Express Exceeding Distance", exceedingDistance);
              const additionalCost =
                parseFloat(expressDeliveryFee) * exceedingDistance; // time sa pay if pila ang ni exceed
              console.log("Express add cost", additionalCost);
              setdeliveyfeeValue(additionalCost.toFixed(2));
              const total = parseFloat(totalInitialAmount) + additionalCost; //add ang additional cost plust and totalInitialamount
              let subtotal = 0;
              if (totalQuantity >= 6) {
                subtotal = total + vehicle3Fee; //total amount is added by the fee of the vehicle
                //  alert(`Quantities-->${totalQuantity} and the fee is ${vehicle3Fee}`)
                setvehicleFeeSaveToDb(vehicle3Fee);
                if (!isNaN(subtotal)) {
                  setTotalAmount(subtotal.toFixed(2));
                } else {
                  setTotalAmount("Total Amount");
                }
              } else if (totalQuantity >= 2 && totalQuantity <= 5) {
                subtotal = total + vehicle2Fee; //total amount is added by the fee of the vehicle
                setvehicleFeeSaveToDb(vehicle2Fee);
                //alert(`Quantities-->${totalQuantity} and the fee is ${vehicle2Fee}`)
                console.log("line 770", subtotal);
                if (!isNaN(subtotal)) {
                  setTotalAmount(subtotal.toFixed(2));
                } else {
                  setTotalAmount("Total Amount");
                }
              } else {
                subtotal = total + vehicle1Fee;
                setvehicleFeeSaveToDb(vehicle1Fee);
                // alert(`Quantities-->${totalQuantity} and the fee is ${vehicle1Fee}`)
                if (!isNaN(subtotal)) {
                  setTotalAmount(subtotal.toFixed(2));
                } else {
                  setTotalAmount("Total Amount");
                }
              }

              // if (!isNaN(total)) {
              //   setTotalAmount(total.toFixed(2));
              // } else {
              //   setTotalAmount("Total Amount");
              // }
            }
          } else {
            if (totalInitialAmount) {
              if (totalQuantity >= 6) {
                console.log("total quantity is 6 ", totalQuantity);

                const subtotalAmount =
                  totalInitialAmount + parseFloat(vehicle3Fee);
                setvehicleFeeSaveToDb(vehicle3Fee);
                if (!isNaN(parseFloat(subtotalAmount).toFixed(2))) {
                  console.log(
                    "ORDER TYPE IS DELIVERY, DELIVERY TYPE IS STANDARD----> QUANTITY IS 6",
                    subtotalAmount
                  );
                  setTotalAmount(parseFloat(subtotalAmount).toFixed(2));
                } else {
                  setTotalAmount("Total Amount");
                }
              } else if (totalQuantity >= 2 && totalQuantity <= 5) {
                console.log("total quantity is 2 ", totalQuantity);
                const subtotalAmount =
                  totalInitialAmount + parseFloat(vehicle2Fee);
                setvehicleFeeSaveToDb(vehicle2Fee);
                if (!isNaN(parseFloat(subtotalAmount).toFixed(2))) {
                  console.log(
                    "ORDER TYPE IS DELIVERY, DELIVERY TYPE IS STANDARD----> QUANTITY IS 2 or more but greater then 5",
                    subtotalAmount
                  );
                  setTotalAmount(parseFloat(subtotalAmount).toFixed(2));
                } else {
                  setTotalAmount("Total Amount");
                }
              } else {
                //if the qty is 6 up
                console.log("total quantity is 1 ", totalQuantity);
                const subtotalAmount =
                  totalInitialAmount + parseFloat(vehicle1Fee);
                setvehicleFeeSaveToDb(vehicle1Fee);
                if (!isNaN(parseFloat(subtotalAmount).toFixed(2))) {
                  console.log(
                    "ORDER TYPE IS DELIVERY, DELIVERY TYPE IS STANDARD----> QUANTITY is 1",
                    subtotalAmount
                  );
                  setTotalAmount(parseFloat(subtotalAmount).toFixed(2));
                } else {
                  setTotalAmount("Total Amount");
                }
              }
            }
          }
        }
      }
    } else {
      {
        /* pick up is choosen in order type */
      }
      //  console.log("Pick up ang ge pili na order type dire ");
      if (totalInitialAmount) {
        if (!isNaN(parseFloat(totalInitialAmount).toFixed(2))) {
          setTotalAmount(parseFloat(totalInitialAmount).toFixed(2));
        } else {
          setTotalAmount("Total Amount");
        }
      }
    }
  }, [
    selectedOrdertype,
    customerLatt,
    customerLong,
    adminLatt,
    adminLong,
    newDeliveryDetails,
    selectedDeliveryType,
    selectedOrdertype,
    initialAmount,
    totalInitialAmount,
    totalQuantity,
    selectedReserveDeliveryType,
  ]);
  //swap option value-----------------------------------------------------------------------------------------

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

  //pick image for gcash screenshot, upload to storage codes here----------------------------------------------------------
  const [gcashProofImage, setGgcashProofImage] = useState(null);
  // console.log("line 612313131388", gcashProofImage);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [fileNameInput, setFilenameInput] = useState("");
  const [gcashProoflink_Storage, setgcashProoflink_Storage] = useState();
  const handleUploadImage = async () => {
    //check if the gcashProofImage if naa ba sulod or wala
    if (gcashProofImage === null) {
      Alert.alert("Please upload a screenshot of your Gcash payment.");
    } else {
      uploadImage();
    }
  };
  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 5],
      quality: 1,
    }); //get the image from library in local image

    console.log("result after image is picked", result);

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

          setGgcashProofImage(url);
          blob.close();
          setgcashProoflink_Storage(url);
          //  console.log("before the createOrder", gcashProoflink_Storage);
          createOrder(customerData.cusId, url);
          setShowModal_ModeOfPayment(false);
          ToastAndroid.show(
            "INSIDE THE UPLOAD IMAGE FUNCTION-->Order successfully. Thank you for ordering" +
              " " +
              passedStationName +
              ".",
            ToastAndroid.LONG
          );

          // Alert.alert(
          //   "Order confirmed",
          //   `Order successfully. Thank you for ordering ${passedStationName}.`,
          //   [
          //     {
          //       text: "Okay",
          //       onPress: () => {
          //        // setgcashProoflink_Storage(url);
          //        console.log("before the createOrder",gcashProoflink_Storage)
          //         createOrder(customerData.cusId,gcashProoflink_Storage);
          //         // ToastAndroid.show(
          //         //   "Order successfully. Thank you for ordering" +
          //         //     " " +
          //         //     passedStationName +
          //         //     ".",
          //         //   ToastAndroid.LONG
          //         // );
          //         setShowModal_ModeOfPayment(false);
          //       },
          //     },
          //     // ,{
          //     //   text:"Cancel",
          //     // }
          //   ]
          // );

          return url;
        });
      }
    );
  };

  //compute the sub total amount and the pick up fee if ever have an value
  const [FinalTotalAmount, setFinalTotalAmount] = useState(0);
  const [totalAmount, setTotalAmount] = useState();
  useLayoutEffect(() => {
    //vehicle value and its fee

    if (totalPickUpfee === 0 && typeof totalAmount === "number") {
      setFinalTotalAmount(totalAmount);
    } else {
      const subtotal =
        parseFloat(totalAmount) +
        (isNaN(totalPickUpfee) ? 0 : parseFloat(totalPickUpfee));
      setFinalTotalAmount(subtotal.toFixed(2));
    }
  }, [totalAmount, totalPickUpfee]);

  //Save to ORDER/CUSTOMERSLOG/NOTIFICATION database-------------------------------------------------------------
  const [vehicleFeeSaveToDb, setvehicleFeeSaveToDb] = useState();
  const [waterproduct, setWaterproduct] = useState(
    (route.params.selectedItem[0].pro_refillWaterType ||
      route.params.selectedItem[0].pro_refillWaterType) ??
      null
  );

  const order_Size = `${
    (selectedItem && selectedItem[0].pro_refillSize) ||
    selectedItem[0].other_productSize
  }`;

  const order_Unit = `${
    (selectedItem && selectedItem[0].pro_refillUnitVolume) ||
    selectedItem[0].other_productUnit
  }`;

  const [quantity, setQuantity] = useState(count);

  const [orderTypeValue, setOrderTypeValue] = useState(); //pass the order Type  value, "??" is used to check if null ba or di
  const [deliveryTypeValue, setdeliveryTypeValue] = useState();

  const [reservationDate, setReservationDate] = useState("");
  const [
    reservationDate_ReserveDeliveryTypes,
    setreservationDate_ReserveDeliveryTypes,
  ] = useState("");
  const [reservationTime, setreservation_ReserveDeliveryTypes] = useState("");
  const [orderStatus, setOrderStatus] = useState("Pending");

  // console.log("Gcash link",gcashProoflink_Storage)
  //setselectedPaymentMethod
  const [selectedpaymenthod, setselectedPaymentMethod] = useState();
  console.log("selected payment method", selectedpaymenthod);
  const [selectedpaymentMethod_Gcash, setselectedpaymentMethod_Gcash] =
    useState();
  //get rewardspoints collection from REWARDSYSTEM COLLECTION passedAdminID

  useLayoutEffect(() => {
    if (passedAdminID) {
      const rewardsRef = ref(db, "REWARDSYSTEM/");
      const rewardsQuery = query(
        rewardsRef,
        orderByChild("adminId"),
        equalTo(passedAdminID)
      );
      onValue(rewardsQuery, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const rewardsInfo = Object.keys(data).map((key) => ({
            id: key,

            ...data[key],
          }));
          console.log("rewards data", rewardsInfo);
          setrewardsData(rewardsInfo);
        } else {
          console.log("Else here");
          setrewardsData([]);
        }
      });
    }
  }, [passedAdminID]);
  const [rewardsData, setrewardsData] = useState();
  //handle submit code here-------------------------------------------------------------------------------------
  const handleSubmit = () => {
    //console.log("460", customerData);
    if (passedStationStatus === "CLOSE") {
      alert("I'm sorry the store is close.");
    } else {
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
        if (checkedItemKey_orderType === null) {
          Alert.alert("Warning", "Please choose a order type");
        } else if (
          (checkedItemKey_deliveryType === "Standard" ||
            checkedItemKey_deliveryType === "Reservation") &&
          checkedItemKey_orderType === null
        ) {
          //This checks if the delivery type is either "standard" or "reservation". It uses the logical OR operator || to check if either of these conditions is true.
          Alert.alert("Warnin", "Please choose a delivery Type");
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
        } else if (combinedData.DeliveryAddress === null) {
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
      }
    }
  };
  //console.log("babaw sa createOrder", gcashProoflink_Storage);
  const createOrder = (CUSTOMERID, gcashProoflink_Storage) => {
    const RandomId = Math.floor(Math.random() * 50000) + 10000;
    //console.log("inside  sa createOrder", gcashProoflink_Storage);
    const newOrderKey = RandomId;
    const orderData = {
      orderID: newOrderKey,
      admin_ID: passedAdminID,
      order_StoreName: passedStationName,
      cusId: CUSTOMERID,

      SwapwithConditionMessage: passedSelectedSwapOption_Vaue ?? null,
      order_RefillSelectedOption: passedSelectedSwapOption ?? null,

      order_overAllQuantities: totalQuantity,
      orderDate: currentDate,
      order_InitialAmount: parseFloat(totalInitialAmount),
      order_GcashProofOfPayment: gcashProoflink_Storage || null,
      orderDeliveryfee: parseFloat(deliveyfeeValue) || 0,
      orderPickUpFee: totalPickUpfee ?? null,
      ordervehiclefee: vehicleFeeSaveToDb ?? null,
      order_SubTotal: parseFloat(totalAmount) ?? null,
      order_TotalAmount: parseFloat(FinalTotalAmount) ?? null,
      orderPaymentMethod: selectedpaymenthod ? selectedpaymenthod : null,
      orderPaymentMethod2: rewardScreenNewModeOfPayment ?? null,

      order_DeliveryTypeValue: deliveryTypeValue,
      order_OrderTypeValue: orderTypeValue,
      order_OrderStatus: orderStatus,
      order_ReservationDate: reservationDate ?? null,
      //map every item choosen by the customer
      order_Products: passedData_SelectedItem.map((item) => ({
        order_ProductId: item.pro_refillId || item.thirdparty_productId,
        offerType: item.offerType,
        order_ProductName:
          item.pro_refillWaterType || item.thirdparty_productName,
        pro_refillUnitVolume:
          item.pro_refillUnitVolume || item.thirdparty_productUnitVolume,
        pro_refillQty: +item.pro_refillQty || +item.thirdparty_productQty,
        order_ProductPrice:
          +item.pro_refillPrice || +item.thirdparty_productPrice,
        qtyPerItem: count[item.pro_refillId || item.thirdparty_productId] || 0,
      })),

      order_newDeliveryAddressOption: combinedData
        ? combinedData.DeliveryAddress
        : null,
      order_newDeliveryAddress:
        (combinedData && combinedData.newAddressaddress) ?? null,
      order_newDeliveryAddLattitude: combinedData
        ? combinedData.newAddressLattitude
        : null,
      order_newDeliveryAddLongitude: combinedData
        ? combinedData.newAddressLongitude
        : null,
      order_newDeliveryAddLandmark:
        (combinedData && combinedData.newAddresslandmark) ?? null,
      order_newDeliveryAddContactNumber:
        (combinedData && combinedData.newAddressreceiverContactNum) || null,
      order_deliveryReservationDeliveryTypeSelected:
        selectedReserveDeliveryType ?? null,
      order_deliveryReservationDeliveryReserveDate:
        reservationDate_ReserveDeliveryTypes || null,
      order_deliveryReservationDeliveryReserveTime: reservationTime || null,
    };

    //flatten codes
    // passedData_SelectedItem.forEach((item, index) => {
    //   const productNamekey = `productName${index + 1}`;
    //   const productUnitKey = `productUnit${index + 1}`;
    //   const productSizeKey = `productSize${index + 1}`;
    //   const productItemOneIDKey = `productItem_ID${index + 1}`;
    //   //  const productItemTwoIDKey = `productItemTwoID${index + 1}`;

    //   orderData[productNamekey] =
    //     item.pro_refillWaterType || item.other_productName;
    //   orderData[productUnitKey] = item.pro_refillUnit || item.other_productUnit;
    //   orderData[productSizeKey] =
    //     +item.pro_refillSize || +item.other_productSize;
    //   orderData[productItemOneIDKey] =
    //     item.pro_refillId || item.other_productId;
    //   // orderData[productItemTwoIDKey] = item.pro_itemTwoID || null;
    // });

    set(ref(db, `ORDERS/${newOrderKey}`), orderData)
      .then(async () => {
        // console.log('Test if Save to db-----'+reservationDate );
        console.log("New Order with the Order ID of --->", newOrderKey);

        //  Delay for 2 seconds (2000 milliseconds)

        //reset input fields
        setCheckedItemKey_deliveryType(null);
        setCheckedItemKey_orderType(null);
        setselectedOrderType(null);
        setReservationDate(null);
        setDeliveryTypes(null);
        //setAmount("Amount");
        setTotalAmount(null);
        setInitialAmount({});
        setTotalQuantity(0);
        setCheckedItemKey_paymentMethod(null);
        //setQuantity(null);
        setreservationDate_ReserveDeliveryTypes("");
        setreservation_ReserveDeliveryTypes("");
        setCount(0);
        setText("Reservation Date");
        setFinalTotalAmount();
        setdeliveyfeeValue(0);
        setgcashProoflink_Storage(null);
        // setTimeout(() => {
        //   navigation.navigate("Order");
        // }, 2000);
      })
      .catch((error) => {
        console.log("Error Saving to Database", error);
        alert("Error", JSON.stringify(error), "OK");
      });

    // update the customer points based on the admin choices
    console.log("pass rewards data inside the create order", rewardsData);
    // console.log(
    //   "pass rewards data inside the create order",
    //   typeof rewardsData
    // );
    // console.log(
    //   "rewardsData[0].rewardWaysToEarn:",
    //   Object.values(rewardsData)[0].rewardWaysToEarn
    // );

    let pointsTobeAddedd = 0;
    //per amount new codes
    if (rewardsData && rewardsData.length > 0) {
      if (
        rewardsData &&
        Object.values(rewardsData)[0] &&
        Object.values(rewardsData)[0].rewardWaysToEarn === "per amount" &&
        Object.values(rewardsData)[0].rewardWaysToEarn
      ) {
        const customer =
          customerData &&
          typeof customerData === "object" &&
          Object.keys(customerData).find(
            (key) => customerData[key].cusId === CUSTOMERID
          );
        //console.log("what is customer:", customer);
        //console.log("what is customer 1119", typeof CUSTOMERID, CUSTOMERID);
        if (
          typeof customerData === "object" &&
          customerData.cusId === CUSTOMERID
        ) {
          if (
            parseFloat(FinalTotalAmount) >=
              parseFloat(rewardsData[0].reward_minRange_perAmount) &&
            parseFloat(FinalTotalAmount) <=
              parseFloat(rewardsData[0].reward_maxRange_perAmount)
          ) {
            pointsTobeAddedd = rewardsData[0].rewardPointsToEarn;
            const customerPointsRef = ref(db, `CUSTOMER/${CUSTOMERID}`); //get the db reference
            get(customerPointsRef).then((snapshot) => {
              const walletPoints = snapshot.val().walletPoints || 0;
              const updatedPoints =
                parseFloat(walletPoints) +
                parseFloat(rewardsData[0].rewardPointsToEarn); //update the walletPoints;

              //console.log("line 1535", rewardsData[0].rewardPointsToEarn);
              update(customerPointsRef, { walletPoints: updatedPoints })
                .then(() => {
                  console.log(
                    "Range between set of admin-->Per Amount--->Customer points updated successfully!"
                  );
                })
                .catch((error) => {
                  console.error("Error updating customer points: ", error);
                });
            });
          } else if (
            parseFloat(FinalTotalAmount) >
            parseFloat(rewardsData[0].reward_maxRange_perAmount)
          ) {
            // Customer spent more than 300, so earn 1 point per amount spent plus an additional 1 point
            console.log(
              "Customer spent more than 300, so earn 1 point per amount spent plus an additional 1 point"
            );
            // pointsTobeAddedd =
            //   rewardsData && rewardsData[0] && rewardsData[0].rewardPointsToEarn
            //     ? rewardsData[0].rewardPointsToEarn + 1
            //     : null;
            pointsTobeAddedd =
              parseFloat(rewardsData[0].rewardPointsToEarn) + 1;
            console.log(
              "Customer spent more than 300, so earn 1 point per amount spent plus an additional 1 point",
              parseFloat(rewardsData[0].rewardPointsToEarn) + 1
            );
            const customerPointsRef = ref(db, `CUSTOMER/${CUSTOMERID}`); //get the db reference
            get(customerPointsRef).then((snapshot) => {
              const walletPoints = snapshot.val().walletPoints || 0;
              const updatedPoints =
                parseFloat(walletPoints) +
                parseFloat(rewardsData[0].rewardPointsToEarn) +
                1;
              //update the walletPoints;
              console.log("updated", updatedPoints);
              update(customerPointsRef, { walletPoints: updatedPoints })
                .then(() => {
                  console.log(
                    "More than set of maximum-->Per Amount--->Customer points updated successfully!"
                  );
                })
                .catch((error) => {
                  console.error("Error updating customer points: ", error);
                });
            });
          } else if (
            parseFloat(FinalTotalAmount) >=
            parseFloat(rewardsData[0].reward_minRange_perAmount)
          ) {
            pointsTobeAddedd = rewardsData && rewardsData[0].rewardPointsToEarn;
            const customerPointsRef = ref(db, `CUSTOMER/${CUSTOMERID}`); //get the db reference
            get(customerPointsRef).then((snapshot) => {
              const walletPoints = snapshot.val().walletPoints || 0;
              const updatedPoints =
                parseFloat(walletPoints) +
                parseFloat(rewardsData && rewardsData[0].rewardPointsToEarn); //update the walletPoints;

              update(customerPointsRef, { walletPoints: updatedPoints })
                .then(() => {
                  console.log(
                    "Range between set of admin-->Per Amount--->Customer points updated successfully!"
                  );
                })
                .catch((error) => {
                  console.error("Error updating customer points: ", error);
                });
            });
          } else {
            console.log("Total amount is less than all");
          }
        }
      } else {
        //per transaction
        const customer =
          customerData &&
          typeof customerData === "object" &&
          Object.keys(customerData).find(
            (key) => customerData[key].cusId === CUSTOMERID
          );
       // console.log("what is customer:", customer);
        //console.log("what is customer 1119", typeof CUSTOMERID, CUSTOMERID);
        if (
          typeof customerData === "object" &&
          customerData.cusId === CUSTOMERID
        ) {
          pointsTobeAddedd = rewardsData && parseFloat( rewardsData[0].rewardPointsToEarn);
          const customerPointsRef = ref(db, `CUSTOMER/${CUSTOMERID}`); //get the db reference
          // Use the `get` method to retrieve the current walletPoints value
          get(customerPointsRef).then((snapshot) => {
            const walletPoints = snapshot.val().walletPoints || 0;
            const updatedPoints =
              parseFloat(walletPoints) +
              parseFloat(rewardsData[0].rewardPointsToEarn); //update the walletPoints
            //pointsToAdd= parseFloat(rewardsData[0].rewardPointsToEarn);
            // console.log("line 1734",pointsToAdd);
            // pointsTobeAddedd=pointsToAdd;
            // console.log("line 1736",pointsTobeAddedd);
            console.log("line 1737", updatedPoints);
            update(customerPointsRef, { walletPoints: updatedPoints })
              .then(() => {
               
                console.log(
                  "Per transaction--->Customer points updated successfully!"
                );
              })
              .catch((error) => {
                console.error("Error updating customer points: ", error);
              });
          });


        }
      }
    } else {
      console.log("No data available for reward data");
    }

    //save to user log collection
    const action = "Order";
    //console.log("Points added 1754 above the customersLog", pointsTobeAddedd);
    const pointsUpdate = "pointsAdded";
    const userLogRandomId = Math.floor(Math.random() * 50000) + 10000;
    const newUserlogKey = userLogRandomId;
    set(ref(db, `CUSTOMERSLOG/${newUserlogKey}`), {
      orderID: newOrderKey,
      cusId: CUSTOMERID,
      orderDate: currentDate,
      logsPerformed: action,
      pointsUpdate: pointsUpdate,
      pointsAddedValue: pointsTobeAddedd,
    })
      .then(async () => {
        // console.log('Test if Save to db-----'+reservationDate );
        console.log("New UserLog with the User ID of--->", newUserlogKey);
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
    const title = "New Order";
    const notificationRandomId = Math.floor(Math.random() * 50000) + 10000;
    const newNotificationRandomKey = notificationRandomId;
    const notificationBody = "You have pending order/s.";
    set(ref(db, `NOTIFICATION/${newNotificationRandomKey}`), {
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
      title: title,
    })
      .then(async () => {
        // console.log('Test if Save to db-----'+reservationDate );
        console.log(
          "New Notification with the Notification ID of  --->",
          newNotificationRandomKey
        );
      })
      .catch((error) => {
        console.log("Error Saving to Database", error);
        alert("Error test", JSON.stringify(error), "OK");
      });
  };

  {
    /*RETURN JSX */
  }
  return (
    <View style={styles.container}>
      {/* modal for gcash payment */}
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
                Please send your payment thru this 0{gcashNumber}.
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
      {reservationDeliveryTypes && (
        <Modal
          transparent
          onRequestClose={() => {
            setShowReservationModal(false);
          }}
          visible={reservationModal}
        >
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "#00000099",
            }}
          >
            <View style={styles.reservationModal}>
              <View style={styles.reservationModalTitle}>
                <Text
                  style={{
                    marginTop: 8,
                    marginLeft: 0,
                    fontFamily: "nunito-bold",
                    fontSize: 20,
                  }}
                >
                  Reservation Delivery Type
                </Text>
                <View style={{ flex: 1, marginTop: 2 }} />
                <TouchableOpacity
                  onPress={() => {
                    setShowReservationModal(false);
                    setcheckedItemKey_reservationDeliveryTypes(null);
                    setreserveDeliverytext("Reservation Date");
                    setreserveDeliveryTime("Reservation Time");
                    setselectedReserveDeliveryType(null);
                  }}
                >
                  <AntDesign
                    name="close"
                    size={20}
                    color="black"
                    style={{ marginTop: 10 }}
                  />
                </TouchableOpacity>
              </View>
              {/* reservation delivery types */}
              <View style={styles.viewReservationDeliveryType}>
                <Text
                  style={{
                    fontSize: 17,
                    fontFamily: "nunito-semibold",
                    marginLeft: 5,
                  }}
                >
                  Delivery Type
                </Text>
                {reservationDeliveryTypes &&
                  reservationDeliveryTypes.map((item) => {
                    const isChecked =
                      item.key === checkedItemKey_reservationDeliveryTypes;
                    return (
                      <View
                        key={item.key}
                        style={{
                          //  backgroundColor: "lightgray",
                          marginTop: 35,
                          height: 25,
                          borderRadius: 5,
                          padding: 0,
                          flexDirection: "row",
                          width: 100,

                          justifyContent: "center",
                          marginLeft: -80,
                          marginRight: 90,
                          // elevation: 2,
                          alignItems: "center",
                        }}
                      >
                        <TouchableOpacity
                          onPress={() => {
                            setcheckedItemKey_reservationDeliveryTypes(
                              item.key
                            );
                            handleItemChecked_ReservationdeliveryType(item);

                            setselectedReserveDeliveryType(item.value);
                            console.log(
                              "Reservation Delivery Types-->if unsa ang ge click nga value/key/label--->",
                              item.value,
                              item.key,
                              item.label
                            );
                          }}
                        >
                          <View style={styles.checkboxReservationDeliveryTypes}>
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

              {/* Reservation Date for Reservation Delivery Types */}

              <View style={styles.viewReservationDateDeliveryTypes}>
                <Text
                  style={{
                    fontSize: 17,
                    fontFamily: "nunito-semibold",
                    marginLeft: 2,
                  }}
                >
                  {reserveDeliverytext}
                </Text>
                <TouchableOpacity
                  activeOpacity={0.5}
                  onPress={() => {
                    if (selectedReserveDeliveryType === "Standard") {
                      reserveDeliveryshowMode("date");
                    } else {
                      reserveDeliveryshowMode("date");
                    }
                  }}
                  disabled={!selectedReserveDeliveryType}
                >
                  <MaterialIcons
                    name="date-range"
                    size={23}
                    color={
                      selectedReserveDeliveryType === null
                        ? "gray"
                        : selectedReserveDeliveryType === "Standard"
                        ? "black"
                        : selectedReserveDeliveryType === "Express"
                        ? "black"
                        : "gray"
                    }
                    style={{ marginTop: -4, marginLeft: 10 }}
                  />
                </TouchableOpacity>
              </View>

              {reserveDeliveryshow && (
                <DateTimePicker
                  testID="dateTimePicker"
                  value={reserveDeliverydate}
                  mode={reserveDeliverymode}
                  is24Hour={false}
                  display="default"
                  onChange={reserveDeliveryonChange}
                  minimumDate={minDate}
                />
              )}

              {/* Reservation time for Reservation Delivery Types */}
              <View style={styles.viewReservationTimeDeliveryTypes}>
                <Text
                  style={{
                    fontSize: 17,
                    fontFamily: "nunito-semibold",
                    marginLeft: 2,
                  }}
                >
                  {selectedReserveDeliveryType === "Standard"
                    ? "Reservation Time"
                    : reserveDeliveryTime}
                </Text>

                {selectedDeliveryType === "Standard" ? null : (
                  <TouchableOpacity
                    onPress={() => {
                      if (selectedReserveDeliveryType === "Standard") {
                        reserveDeliveryshowMode("time");
                      } else {
                        reserveDeliveryshowMode("time");
                      }
                    }}
                    disabled={
                      !selectedReserveDeliveryType ||
                      selectedReserveDeliveryType === "Standard"
                    }
                  >
                    <MaterialIcons
                      name="access-time"
                      size={23}
                      color={
                        selectedReserveDeliveryType === "Standard"
                          ? selectedReserveDeliveryType === "Express"
                            ? "black"
                            : "gray"
                          : selectedReserveDeliveryType === "Express"
                          ? "black"
                          : "gray"
                      }
                      style={{ marginTop: -4, marginLeft: 10 }}
                    />
                  </TouchableOpacity>
                )}
              </View>

              {/* Submit button */}
              <View
                style={{
                  //backgroundColor: "red",
                  marginTop: 10,
                  height: 50,
                }}
              >
                <TouchableOpacity
                  onPress={() => {
                    setShowReservationModal(false);
                    setcheckedItemKey_reservationDeliveryTypes(null);
                    // setreserveDeliverytext("Reservation Date");
                    // setreserveDeliveryTime("Reservation Time");
                    // setselectedReserveDeliveryType(null);
                  }}
                  disabled={!selectedReserveDeliveryType}
                >
                  <View
                    style={{
                      borderRadius: 10,
                      paddingVertical: 10,
                      paddingHorizontal: 10,
                      backgroundColor: !selectedReserveDeliveryType
                        ? "gray"
                        : "#87cefa",
                      // backgroundColor: "#87cefa",
                      marginTop: 15,
                      //marginBottom: 20,
                      width: 200,
                      left: 50,
                      height: 40,
                    }}
                  >
                    <Text
                      style={[
                        globalStyles.buttonText,
                        { marginTop: 0, left: -8 },
                      ]}
                    >
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
      )}

      <FlatList
        data={
          passedData_SelectedItem ? Object.values(passedData_SelectedItem) : []
        }
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          return (
            <View style={styles.container} key={item.id}>
              <View style={styles.storeWrapper} key={item.id}>
                <View style={styles.item} key={item.id}>
                  <View style={styles.itemLeft}>
                    <View style={styles.square}>
                      <Image
                        source={{
                          uri: item.pro_Image || item.thirdparty_productImage,
                        }}
                        style={styles.storePhotoStyle}
                      />
                    </View>

                    <View style={{ backgroundColor: "transparent" }}>
                      {/* <Text style={styles.storeNameStyles}>
                        {item.pro_refillWaterType.substring(0, 20) + "..."
            ||
                          item.thirdparty_productName
                          .substring(0, 20) + "..."}
                      </Text> */}
                      <Text style={styles.storeNameStyles}>
                        {item.pro_refillWaterType
                          ? item.pro_refillWaterType.substring(0, 20) + "..."
                          : item.thirdparty_productName
                          ? item.thirdparty_productName.substring(0, 20) + "..."
                          : ""}
                      </Text>

                      <Text style={styles.storeStatusStyles}>
                        {item.thirdparty_productQty || item.pro_refillQty}{" "}
                        {item.thirdparty_productUnitVolume ||
                          item.pro_refillUnitVolume}
                      </Text>

                      {/* <Text style={styles.storeStatusStyles}>
                        Product's Promo{" "}
                        {item.pro_discount || item.thirdparty_productDiscount}%
                      </Text> */}
                      {(item.pro_discount &&
                        item.pro_discount !== "0" &&
                        item.pro_discount.trim() !== "") ||
                      (item.thirdparty_productDiscount &&
                        item.thirdparty_productDiscount !== "0" &&
                        item.thirdparty_productDiscount.trim() !== "") ? (
                        <Text
                          style={{ fontSize: 15, fontFamily: "nunito-light" }}
                        >
                          Product's discount{" "}
                          {item.pro_discount || item.thirdparty_productDiscount}
                          %
                        </Text>
                      ) : (
                        <Text
                          style={{ fontSize: 15, fontFamily: "nunito-light" }}
                        >
                          No available discount
                        </Text>
                      )}

                      <Text style={styles.storeStatusStyles}>
                        ₱{item.pro_refillPrice || item.thirdparty_productPrice}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.circular}>
                    <View style={{ marginLeft: 10 }}>
                      <TouchableOpacity onPress={() => handleIncrement(item)}>
                        <Image
                          source={require("../assets/plusIcon.png")}
                          style={{
                            width: 25,
                            height: 25,
                            backgroundColor: "transparent",
                          }}
                        />
                      </TouchableOpacity>

                      <TouchableOpacity onPress={() => handleDecrement(item)}>
                        <Image
                          source={require("../assets/minus-math.png")}
                          style={{
                            width: 25,
                            height: 25,
                            marginTop: 20,
                            backgroundColor: "transparent",
                          }}
                        />
                      </TouchableOpacity>
                    </View>
                    <View
                      style={{
                        marginTop: 5,
                        right: 45,
                        width: 75,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 16,
                          fontFamily: "nunito-light",
                          textAlign: "right",
                        }}
                      >
                        ₱{item.pro_refillPrice || item.thirdparty_productPrice}{" "}
                        x {count[item.id] || 0}
                      </Text>
                    </View>

                    <View
                      style={{
                        marginTop: 0,
                        right: 45,
                        width: 75,
                      }}
                    >
                      {/* {item.idno && locationsDistance[item.idno]
                              ? `${locationsDistance[item.idno]} km away`
                              : "Retrieving location,please wait..."}  */}

                      <Text
                        style={{
                          fontSize: 16,
                          fontFamily: "nunito-light",
                          textAlign: "right",
                        }}
                      >
                        {initialAmount[item.id]
                          ? `${initialAmount[item.id].toFixed(2)}`
                          : "0"}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          );
        }}
        ListHeaderComponent={
          <View style={styles.viewBackBtn}>
            <MaterialIcons
              name="arrow-back-ios"
              size={24}
              color="black"
              onPress={onPresshandler_toStationPage}
              style={{ right: 70 }}
            />
            <View style={styles.viewwatername}>
              <Text style={styles.textwatername}>My Cart</Text>
            </View>
          </View>
        }
        ListFooterComponent={
          <View
            style={{
              backgroundColor: "transparent",
              height: 50,
              flexDirection: "row-reverse",
            }}
          >
            <View
              style={{
                paddingHorizontal: 30,
                backgroundColor: "transparent",
                top: 10,
              }}
            >
              <Text style={{ fontSize: 16, fontFamily: "nunito-semibold" }}>
                Initial Amount- ₱ {totalInitialAmount.toFixed(2) || 0}
              </Text>
            </View>
          </View>
        }
        //   <View style={styles.container} key={item.id} >
        //   <View style={styles.storeWrapper} key={item.id}>

        //     </View>
        //     </View>
      />
      <ScrollView>
        <View style={{ backgroundColor: "transparent", height: 540, top: 0 }}>
          <View style={{ justifyContent: "center", alignItems: "center" }}>
            <Text
              style={{
                fontFamily: "nunito-semibold",
                fontSize: 20,
                marginLeft: 0,
              }}
            >
              Place your order below
            </Text>
          </View>
          <View
            style={{
              backgroundColor: "gray",
              width: "95%",
              marginLeft: 10,
              marginTop: 15,
              height: 540,
            }}
          >
            {/* view for order type */}
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
              {newOrder_Type &&
                newOrder_Type.map((item) => {
                  const isChecked = item.key === checkedItemKey_orderType;
                  return (
                    <View
                      key={item.key}
                      style={{
                        backgroundColor: "red",
                        marginTop: 35,
                        height: 25,
                        borderRadius: 5,
                        padding: 0,
                        flexDirection: "row",
                        width: responsiveWidth(30),

                        justifyContent: "center",
                        marginLeft: responsiveWidth(-19),
                        marginRight:responsiveWidth(20),
                        //marginRight: 63,
                        // elevation: 2,
                        alignItems: "center",
                      }}
                    >
                      <TouchableOpacity
                        onPress={() => {
                          handleItemChecked_orderType(item);
                          setOrderTypeValue(item.value);
                          setselectedOrderType(item.value);
                          console.log(
                            "Order Type clicked value-->",
                            item.value
                          );
                        }}
                        //disabled={selectedDeliveryType === "Express"}
                      >
                        <View
                          style={{
                            width: 20,
                            height: 20,
                            borderWidth: 1,
                            borderRadius: 4,
                            justifyContent: "center",
                            alignItems: "center",
                            marginLeft: 0,
                            marginRight: 5,
                            // borderColor:
                            //   selectedDeliveryType == "Express"
                            //     ? "gray"
                            //     : "black",
                            borderColor: "black",
                          }}
                        >
                          {isChecked && (
                            <MaterialIcons
                              name="done"
                              size={16}
                              color="black"
                              styles={{ alignItems: "center" }}
                            />
                          )}
                        </View>
                      </TouchableOpacity>
                      <Text
                        style={{
                          fontFamily: "nunito-light",
                          fontSize: 17,
                          flexDirection: "row",
                          // color:
                          //   selectedDeliveryType === "Express"
                          //     ? "gray"
                          //     : "black",
                          color: "black",
                        }}
                      >
                        {item.label}
                      </Text>
                    </View>
                  );
                })}
            </View>

            {/* view for Delivery type */}
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
              {deliveryTypes &&
                deliveryTypes.map((item) => {
                  const isChecked = item.key === checkedItemKey_deliveryType;
                  const isExpressDisabled =
                    selectedOrdertype === "PickUp" && item.label === "Express";
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
                        }}
                        disabled={isExpressDisabled}
                      >
                        <View
                          style={{
                            width: 20,
                            height: 20,
                            borderWidth: 1,
                            borderRadius: 4,
                            justifyContent: "center",
                            alignItems: "center",
                            marginLeft: 10,
                            marginRight: 5,
                            borderColor: isExpressDisabled ? "gray" : "black",
                          }}
                        >
                          {isChecked && (
                            <MaterialIcons
                              name="done"
                              size={16}
                              color={
                                isExpressDisabled && item.label === "Express"
                                  ? "gray"
                                  : "black"
                              }
                              styles={{ alignItems: "center" }}
                            />
                          )}
                        </View>
                      </TouchableOpacity>
                      <Text
                        style={{
                          fontFamily: "nunito-light",
                          fontSize: 17,
                          flexDirection: "row",
                          color: isExpressDisabled ? "gray" : "black",
                        }}
                      >
                        {item.label}
                      </Text>
                    </View>
                  );
                })}
            </View>

            {/* View for payment */}
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
                  const isCODDisabled =
                    selectedOrdertype === "PickUp" &&
                    item.label === "CashOnDelivery";
                  return (
                    <View
                      key={item.key}
                      style={{
                       backgroundColor: "red",
                        marginTop: 35,
                        height: 25,
                        borderRadius: 5,
                        padding: 0,
                        flexDirection: "row",
                        width: responsiveWidth(40),

                        justifyContent: "center",
                        marginLeft: -90,
                        marginRight: 95,
                        // elevation: 2,
                        // marginLeft: responsiveWidth(-19),
                        // marginRight:responsiveWidth(20),
                        alignItems: "center",

                        
                      }}
                    >
                      <TouchableOpacity
                        onPress={() => {
                          handleItemchecked_paymentMethod(item);
                          setselectedPaymentMethod(item.value);
                          setCheckedItemKey_paymentMethod(item.key);
                          console.log("payment clicked Value -->", item.value);
                        }}
                        disabled={isCODDisabled}
                      >
                        <View
                          style={{
                            width: 20,
                            height: 20,
                            borderWidth: 1,
                            borderRadius: 4,
                            justifyContent: "center",
                            alignItems: "center",
                            marginLeft: 10,
                            marginRight: 5,
                            //backgroundColor:'blue'
                            borderColor: isCODDisabled ? "gray" : "black",
                          }}
                        >
                          {isChecked && (
                            <MaterialIcons
                              name="done"
                              size={16}
                              color="black"
                              styles={{ alignItems: "center" }}
                            />
                          )}
                        </View>
                      </TouchableOpacity>
                      <Text
                        style={{
                          fontFamily: "nunito-light",
                          fontSize: 17,
                          flexDirection: "row",
                          color: isCODDisabled ? "gray" : "black",
                        }}
                      >
                        {item.label}
                      </Text>
                    </View>
                  );
                })}
            </View>

            {/* view for reservation Date */}
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
                  // if (selectedDeliveryType === "Reservation") {
                  //   showMode("date");
                  // }
                  if (
                    selectedOrdertype === "PickUp" &&
                    selectedDeliveryType === "Reservation"
                  ) {
                    showMode("date");
                  }
                }}
                disabled={
                  selectedOrdertype === "Delivery" &&
                  selectedDeliveryType === "Reservation"
                }
              >
                <MaterialIcons
                  name="date-range"
                  size={23}
                  color={
                    selectedDeliveryType === "Reservation"
                      ? selectedOrdertype === "Delivery" &&
                        selectedDeliveryType === "Reservation"
                        ? "gray"
                        : "black"
                      : "gray"
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
                minimumDate={minDate}
              />
            )}

            {/* Delivery Address */}
            <View style={styles.viewDeliveryAddress}>
              <TouchableOpacity
                onPress={() => {
                  console.log(
                    "line 2638 cart screen",
                    parseFloat(passedTotalAmount)
                  );
                  console.log("cart screen", selectedpaymenthod);
                  navigation.navigate("NewDeliveryAdd", {
                    passedStationName,
                    selectedItem,
                    extractedDatas,
                    passedTotalAmount:
                      parseFloat(passedTotalAmount) || FinalTotalAmount,
                    rewardScreenNewModeOfPayment,
                    selectedpaymenthod,
                  });
                  // console.log("test 1009", selectedItem);
                }}
                disabled={selectedOrdertype === "PickUp"}
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

            {/* pickup fee */}
            <View
              style={{
                paddingHorizontal: 30,
                // backgroundColor: "red",
                top: 20,
                flexDirection: "row-reverse",
                width: 350,
                justifyContent: "flex-start",
                left: 10,
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontFamily: "nunito-semibold",
                  textAlign: "right",
                }}
              >
                Pick Up Fee - ₱{(totalPickUpfee && totalPickUpfee) || 0}
              </Text>
            </View>
            {/* Delivery fee */}
            <View
              style={{
                paddingHorizontal: 30,
                // backgroundColor: "red",
                top: 20,
                flexDirection: "row-reverse",
                width: 350,
                justifyContent: "flex-start",
                left: 10,
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontFamily: "nunito-semibold",
                  textAlign: "right",
                }}
              >
                Delivery Fee- ₱ {(deliveyfeeValue && deliveyfeeValue) || 0}
              </Text>
            </View>

            {/* Sub  Total amount */}

            <View
              style={{
                paddingHorizontal: 30,
                // backgroundColor: "red",
                top: 22,
                flexDirection: "row-reverse",
                width: 350,
                justifyContent: "flex-start",
                left: 10,
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontFamily: "nunito-semibold",
                  textAlign: "right",
                }}
              >
                Sub Total- ₱ {(totalAmount && totalAmount) || 0}
              </Text>
            </View>

            {/* horizontal Line */}
            <View
              style={{
                paddingHorizontal: 30,
                // backgroundColor: "red",
                top: 35,
                flexDirection: "row",
                width: 140,
                justifyContent: "flex-end",
                right: 10,
                borderBottomColor: "black",
                borderWidth: 0.5,
                alignSelf: "flex-end",
              }}
            ></View>

            {/*   Total amount  FinalTotalAmount*/}
            <View
              style={{
                paddingHorizontal: 30,
                // backgroundColor: "red",
                top: 45,
                flexDirection: "row-reverse",
                width: 350,
                justifyContent: "flex-start",
                left: 10,
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontFamily: "nunito-semibold",
                  textAlign: "right",
                }}
              >
                Total Amount - ₱{" "}
                {isNaN(FinalTotalAmount)
                  ? "0"
                  : (parseFloat(FinalTotalAmount) || 0).toFixed(2)}
                {/* Total Amount - ₱{isNaN(FinalTotalAmount) ? "0" : (typeof FinalTotalAmount === 'number' ? FinalTotalAmount.toFixed(2) : "0")} */}
              </Text>
            </View>
            {/* button for place oder */}
            <View
              style={{
                //backgroundColor: "red",
                padding: 10,
                marginTop: 25,
                height: 60,
              }}
            >
              <View
                style={{
                  //backgroundColor: "red",
                  marginTop: 10,
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
                      // backgroundColor: isDisabled ? "gray" : "#87cefa",
                      backgroundColor: "#87cefa",
                      marginTop: 20,
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
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  viewReservationTimeDeliveryTypes: {
    backgroundColor: "whitesmoke",
    width: 170,
    height: 30,
    padding: 6,
    borderRadius: 8,
    marginTop: 30,
    elevation: 3,
    flexDirection: "row",
    justifyContent: "center",
    marginLeft: 5,
  },
  viewReservationDateDeliveryTypes: {
    backgroundColor: "whitesmoke",
    width: 170,
    height: 30,
    padding: 6,
    borderRadius: 8,
    marginTop: 60,
    elevation: 3,
    flexDirection: "row",
    justifyContent: "center",
    marginLeft: 5,
  },
  viewReservationDeliveryType: {
    backgroundColor: "whitesmoke",
    width: 120,
    height: 30,
    padding: 6,
    borderRadius: 8,
    marginTop: 10,
    elevation: 3,
    flexDirection: "row",
    marginLeft: 5,
    //justifyContent:'space-between',
  },
  reservationModal: {
    width: 310,
    height: 320,
    backgroundColor: "white",
    borderBottomColor: "gray",
    borderBottomWidth: 1,
    borderRadius: 3,
    elevation: 10,
    marginBottom: 50,
  },
  reservationModalTitle: {
    justifyContent: "flex-start",
    padding: 0,
    flexDirection: "row",
    marginLeft: 5,
    padding: 4,
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
  swapOptionWithReservation: {
    flexDirection: "row",
    borderBottomColor: "black",
    borderBottomWidth: 1,
    paddingBottom: 2,

    width: 300,
    marginTop: 20,
    marginLeft: 5,
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
  viewDeliveryAddress: {
    backgroundColor: "white",
    width: 140,
    height: 30,
    padding: 6,
    borderRadius: 8,
    marginTop: 15,
    elevation: 3,
    flexDirection: "row",
  },
  viewReservationdate: {
    backgroundColor: "white",
    width: 170,
    height: 30,
    padding: 6,
    borderRadius: 8,
    marginTop: 45,
    elevation: 3,
    flexDirection: "row",
    justifyContent: "center",
  },
  viewForModeofPayment: {
    backgroundColor: "white",
    width: 140,
    height: 30,
    padding: 6,
    borderRadius: 8,
    marginTop: 50,
    elevation: 3,
    flexDirection: "row",
  },
  viewforOrderMethod: {
    backgroundColor: "white",
    width: 120,
    height: 30,
    padding: 6,
    borderRadius: 8,
    marginTop: 40,
    elevation: 3,
    flexDirection: "row",
    //flex:1
  },
  ViewforDelivery: {
    backgroundColor: "white",
    width: 120,
    height: 30,
    padding: 6,
    borderRadius: 8,
    marginTop: 50,
    elevation: 3,
    flexDirection: "row",
    //marginRight:5,
    //justifyContent:'space-between',
  },
  viewOrderType: {
    backgroundColor: "white",
    width: 100,
    height: 30,
    padding: 6,
    borderRadius: 8,
    //marginTop: 30,
    elevation: 3,
    flexDirection: "row",
  },
  circular: {
    width: 35,
    height: 65,
    // borderColor: "#55BCF6",
    // borderWidth: 2,
    // borderRadius: 5,
    // backgroundColor:'red',
    bottom: 10,
    left: 10,
  },

  storeWrapper: {
    //paddingTop: 80,
    paddingHorizontal: 15,
    // backgroundColor: 'green',
    marginTop: 10,
    // bottom:10
  },
  storeStatusStyles: {
    fontSize: 16,
    fontFamily: "nunito-light",
  },

  storeNameStyles: {
    fontSize: 20,
    fontFamily: "nunito-bold",
    // marginLeft: -5,
    //marginTop: 15,
  },
  storePhotoStyle: {
    width: 78,
    height: 88,
    // borderTopLeftRadius: 15,
    // borderTopRightRadius: 15,
    // borderBottomLeftRadius: 15,
    // borderBottomRightRadius: 15,
    // backgroundColor:'red'
  },
  item: {
    backgroundColor: "white",

    padding: 9,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 5,
    elevation: 5,
    height: 150,
  },
  itemLeft: {
    flexDirection: "row",
    alignItems: "center",
    //backgroundColor:'yellow',
    bottom: 30,
  },
  viewforStoreInfos: {
    flexDirection: "column",
    alignItems: "center",
  },
  square: {
    width: 80,
    height: 90,
    backgroundColor: "transparent",
    // opacity: 0.4, #55BCF6
    // borderRadius: 15,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#55BCF6",
    //  marginBottom: 5,
    top: 5,
  },
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
  checkboxReservationDeliveryTypes: {
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
});
