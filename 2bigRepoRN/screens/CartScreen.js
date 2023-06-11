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
import moment from "moment/moment";
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
import {
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import { createErrorHandler } from "expo/build/errors/ExpoErrorManager";
import { StylesRewardsPoints } from "../ForStyle/StylesforRewardsPoint";
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
    newDeliveryFee,
    passedTotalAmount_NewDeliveryScreen,
  } = route.params ? route.params : {};
  const passedStationName =
    extractedDatas?.refillingStoreProperties?.stationName;
  const passedAdminID = extractedDatas?.adminProperties?.adminID;
  const passedStationStatus =
    extractedDatas?.refillingStoreProperties?.stationStatus;

  const secondItem = item;
  //setFinalTotalAmount(passedTotalAmount);

  console.log(
    "RECEIVING CART SCREEN from new  delivery screen--->Total Fee",
    passedTotalAmount_NewDeliveryScreen
  );
  useLayoutEffect(() => {
    if (
      passedTotalAmount_NewDeliveryScreen !== null &&
      passedTotalAmount_NewDeliveryScreen !== undefined
    ) {
      setFinalTotalAmount(passedTotalAmount_NewDeliveryScreen);
      setTotalAmount(passedTotalAmount_NewDeliveryScreen);
    }
  }, [passedTotalAmount_NewDeliveryScreen]);

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

  // //get customer Data
  useEffect(() => {
    AsyncStorage.getItem("customerData") //e get ang Asycn sa login screen
      .then((data) => {
        if (data !== null) {
          //if data is not null
          const parsedData = JSON.parse(data); //then e store ang Data into parsedData
          const CustomerUID = parsedData.cusId;
       
          setCustomerID(CustomerUID);
        }
      })
      .catch((error) => {
        console.log(error);
        alert("Error fetching data: aSYNC", error);
      });
  }, []);
  useEffect(() => {
    // console.log("Line 58", customerID);
    if (customerID) {
      const customerRef = ref(db, "CUSTOMER/");
      //  console.log("inside this effect",customerID)
      const customerQuery = query(
        customerRef,
        orderByChild("cusId"),
        equalTo(customerID)
      );
      onValue(customerQuery, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const newCustomerInfo = Object.keys(data).map((key) => ({
            id: key,
            StoreImage: data[key].StoreImage,
            ...data[key],
          }));
          const customer = newCustomerInfo[0];
          const walletPoints = customer.walletPoints;
          // Update the state with the new wallet points
          setcustomerRewardsPoints(walletPoints);
          console.log("Current rewards points of cstomer",walletPoints)
          setCustomerData(newCustomerInfo);
        }
      });
    }
  }, [customerID]);

  const [customerData, setCustomerData] = useState({}); //getting the customer's data from AsyncStorage
  const [customerID, setCustomerID] = useState();
  const [customerRewardsPoints, setcustomerRewardsPoints] = useState(0); //object
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
  // console.log("RECEIVING CART SCREEN --->Selected Item",newDeliveryDetails);
  // const neworderTypes = newDeliveryDetails?.[0].orderTypes.split(", ");
  //const neworderTypes = newDeliveryDetails?.[0].orderTypes.split(/,\s*/); // Split by comma followed by optional space
  const neworderTypes = newDeliveryDetails?.[0].orderTypes
    .split(",")
    .map((orderType) => orderType.trim());

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

  const [newOrder_Type, setnewOrder_Type] = useState();
  // console.log("line 93",newOrder_Type)
  // const orderTypes = [];
  // const newOrderTypes = useCallback(() => {
  //   if (splittedOrderTypes && splittedOrderTypes[0]) {
  //     splittedOrderTypes.forEach((orderType, index) => {
  //       const deliveryType = {
  //         label: orderType,
  //         value: orderType.toString(),
  //         key: index + 1,
  //       };
  //       orderTypes.push(deliveryType);
  //     });
  //   }
  //   return orderTypes;
  // }, [newDeliveryDetails]);

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
      const vechicle1Name =
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
      const vehicle1MinQty =
        newDeliveryDetails &&
        Array.isArray(newDeliveryDetails) &&
        newDeliveryDetails.length > 0
          ? parseFloat(newDeliveryDetails[0].vehicle1MinQty)
          : null;
      const vehicle1MaxQty =
        newDeliveryDetails &&
        Array.isArray(newDeliveryDetails) &&
        newDeliveryDetails.length > 0
          ? parseFloat(newDeliveryDetails[0].vehicle1MaxQty)
          : null;
      setvehicle1MinQty(vehicle1MinQty);
      setvehicle1MaxQty(vehicle1MaxQty);
      setvechicle1fee(vehicle1Fee);
      setVehicle1Name(vechicle1Name);
      console.log("line 335", vechicle1Name);
      const vechicle2Name =
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
      const vehicle2MinQty =
        newDeliveryDetails &&
        Array.isArray(newDeliveryDetails) &&
        newDeliveryDetails.length > 0
          ? parseFloat(newDeliveryDetails[0].vehicle2MinQty)
          : null;
      const vehicle2MaxQty =
        newDeliveryDetails &&
        Array.isArray(newDeliveryDetails) &&
        newDeliveryDetails.length > 0
          ? parseFloat(newDeliveryDetails[0].vehicle2MaxQty)
          : null;
      setVehicle2Name(vechicle2Name);
      setvechicle2fee(vehicle2Fee);
      setvehicle2MinQty(vehicle2MinQty);
      setvehicle2MaxQty(vehicle2MaxQty);

      const vechicle3Name =
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
      const vehicle3MinQty =
        newDeliveryDetails &&
        Array.isArray(newDeliveryDetails) &&
        newDeliveryDetails.length > 0
          ? parseFloat(newDeliveryDetails[0].vehicle3MinQty)
          : null;
      const vehicle3MaxQty =
        newDeliveryDetails &&
        Array.isArray(newDeliveryDetails) &&
        newDeliveryDetails.length > 0
          ? parseFloat(newDeliveryDetails[0].vehicle3MaxQty)
          : null;
      setVehicle3Name(vechicle3Name);
      setvechicle3fee(vehicle3Fee);
      setvehicle3MinQty(vehicle3MinQty);
      setvehicle3MaxQty(vehicle3MaxQty);

      const vechicle4Name =
        newDeliveryDetails &&
        Array.isArray(newDeliveryDetails) &&
        newDeliveryDetails.length > 0
          ? newDeliveryDetails[0].vehicle4Name
          : null;
      const vehicle4Fee =
        newDeliveryDetails &&
        Array.isArray(newDeliveryDetails) &&
        newDeliveryDetails.length > 0
          ? parseFloat(newDeliveryDetails[0].vehicle3Fee)
          : null;

      const vehicle4MinQty =
        newDeliveryDetails &&
        Array.isArray(newDeliveryDetails) &&
        newDeliveryDetails.length > 0
          ? parseFloat(newDeliveryDetails[0].vehicle4MinQty)
          : null;
      const vehicle4MaxQty =
        newDeliveryDetails &&
        Array.isArray(newDeliveryDetails) &&
        newDeliveryDetails.length > 0
          ? parseFloat(newDeliveryDetails[0].vehicle4MaxQty)
          : null;
      setVehicle4Name(vechicle4Name);
      setvechicle4fee(vehicle4Fee);
      setvehicle4MinQty(vehicle4MinQty);
      setvehicle4MaxQty(vehicle4MaxQty);
    }
  }, [newDeliveryDetails]);
  const [vehicle1Name, setVehicle1Name] = useState();
  const [vechicle1fee, setvechicle1fee] = useState();
  const [vehicle1MinQty, setvehicle1MinQty] = useState();
  const [vehicle1MaxQty, setvehicle1MaxQty] = useState();

  const [vehicle2Name, setVehicle2Name] = useState();
  const [vechicle2fee, setvechicle2fee] = useState();
  const [vehicle2MinQty, setvehicle2MinQty] = useState();
  const [vehicle2MaxQty, setvehicle2MaxQty] = useState();

  const [vehicle3Name, setVehicle3Name] = useState();
  const [vechicle3fee, setvechicle3fee] = useState();
  const [vehicle3MinQty, setvehicle3MinQty] = useState();
  const [vehicle3MaxQty, setvehicle3MaxQty] = useState();

  const [vehicle4Name, setVehicle4Name] = useState();
  const [vechicle4fee, setvechicle4fee] = useState();
  const [vehicle4MinQty, setvehicle4MinQty] = useState();
  const [vehicle4MaxQty, setvehicle4MaxQty] = useState();
  // const [vehicleFee, setvehicleFee] = useState(0);

  const handleItemChecked_orderType = (item) => {
    //vehicle value and its fee

    setCheckedItemKey_orderType(
      item.key === checkedItemKey_orderType ? null : item.key
    );
    if (item.value === "Delivery") {
      let alertMessage = `Standard Delivery: Your order will be delivered within the day.\n\nExpress Delivery: Your order will be delivered within a specific span of time.\n\nReservation Delivery: You will be the one to decide when to deliver the water.\n\nDelivery fee is based on your distance from the store.\n\nVehicle fee is based on your overall quantities.\n\n`;

      if (vechicle1fee || (!isNaN(vechicle1fee) && vehicle1Name !== "")) {
        // alertMessage += `\n<Text style={{ fontWeight: 'bold' }}>{vehicle1Name}</Text>- ₱${vechicle1fee.toFixed(
        //   2
        // )} for ${vehicle1MinQty}-${vehicle1MaxQty} pc/s.`;
        alertMessage += `\n${vehicle1Name}- ₱${vechicle1fee.toFixed(
          2
        )} for ${vehicle1MinQty}-${vehicle1MaxQty} pc/s.`;
      }
      if (vechicle2fee || (!isNaN(vechicle2fee) && vehicle2Name !== "")) {
        alertMessage += `\n${vehicle2Name}- ₱${vechicle2fee.toFixed(
          2
        )} for ${vehicle2MinQty}-${vehicle2MaxQty} pc/s.`;
      }
      if (vechicle3fee || (!isNaN(vechicle3fee) && vehicle3Name !== "")) {
        alertMessage += `\n${vehicle3Name}- ₱${vechicle3fee.toFixed(
          2
        )} for ${vehicle3MinQty}-${vehicle3MaxQty} pc/s.`;
      }
      // if (vechicle4fee || !isNaN(vechicle4fee) ||vechicle4fee) {
      //   alertMessage += `\n${vehicle4Name}- ₱${vechicle4fee.toFixed(
      //     2
      //   )} for ${vehicle4MinQty}-${vehicle4MaxQty} pc/s.`;
      // }
      if ((vechicle4fee || !isNaN(vechicle4fee)) && vehicle4Name !== "") {
        alertMessage += `\n${vehicle4Name}- ₱${vechicle4fee.toFixed(
          2
        )} for ${vehicle4MinQty}-${vehicle4MaxQty} pc/s.`;
      }

      Alert.alert("Note", alertMessage);
      const deliveryTypeholder = [];
      const {
        stanDeliverytype,
        exDeliveryType,
        resDeliveryType,
        expressID,
        standardID,
        reservationID,
      } = newDeliveryDetails[0];
      //stanDeliverytype
      const ValuesDeliveryType = [
        // stanDeliverytype,
        // exDeliveryType,
        // resDeliveryType,
        { id: expressID, value: exDeliveryType },
        { id: standardID, value: stanDeliverytype },
        { id: reservationID, value: resDeliveryType },
      ];
      //  console.log("line 385", ValuesDeliveryType);
      ValuesDeliveryType.forEach((deliveryType, index) => {
        if (deliveryType.value !== 0 && deliveryType.id !== 0) {
          const delivryType = {
            // label: deliveryType.value,
            // value: deliveryType ? value.toString() : "",
            // key: index + 1,
            label: deliveryType.value, // Access the value property within deliveryType.value
            value: deliveryType.value ? deliveryType.value.toString() : "",
            key: index + 1,
          };
          //  console.log("line 389", delivryType);
          deliveryTypeholder.push(delivryType);

          setDeliveryTypes(deliveryTypeholder);
          const filteredDeliveryTypes = deliveryTypeholder.filter((type) => {
            return type.value === "Standard" || type.value === "Express";
          });

          setreservationDeliveryTypes(filteredDeliveryTypes);
        }
      });
      setText("Reservation Date");
    } else {
      setpassedCombinedData(null);

      setCheckedItemKey_deliveryType(null);
      setCheckedItemKey_paymentMethod(null);
      console.log("pick up is press");
      const deliveryTypeholder = [];
      const {
        stanDeliverytype,
        exDeliveryType,
        resDeliveryType,
        expressID,
        standardID,
        reservationID,
      } = newDeliveryDetails[0];
      const ValuesDeliveryType = [
        { id: expressID, value: exDeliveryType },
        { id: standardID, value: stanDeliverytype },
        { id: reservationID, value: resDeliveryType },
      ];

      ValuesDeliveryType.forEach((deliveryType, index) => {
        if (deliveryType.value !== 0 && deliveryType.id !== 0) {
          const delivryType = {
            label: deliveryType.value,
            value: deliveryType.value ? deliveryType.value.toString() : "",
            key: index + 1,
          };

          deliveryTypeholder.push(delivryType);

          setDeliveryTypes(deliveryTypeholder);

          //filter the deliveryTypeholder, standard and express only
          const filteredDeliveryTypes = deliveryTypeholder.filter((type) => {
            return type.value === "Standard" || type.value === "Express";
          });

          setreservationDeliveryTypes(filteredDeliveryTypes);
        } //end here
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
  // console.log("434", selectedReserveDeliveryType);
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
  // const minDate = new Date(); // current date
  // minDate.setHours(0, 0, 0, 0); // set hours, minutes, seconds, and milliseconds to zero
  const minDate = new Date(); // current date
  minDate.setDate(minDate.getDate() + 1); // add one day

  // Set hours, minutes, seconds, and milliseconds to zero
  minDate.setHours(0, 0, 0, 0);

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
      setreserveDeliveryTime("Reservation Time");
    } else {
      console.log("Reservation, Selected Delivery Type is  Express");

      setreserveDeliverytext(fdate);

      //setreserveDeliveryTime("Reservation Time");
      setreserveDeliveryTime(ftime);
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
    } else if (item.value === "Gcash") {
      // setShowModal_ModeOfPayment(true);
    } else if (item.value === "Points") {
      //const  rewardpointsBalance= customerData&& customerData.walletPoints;
      Alert.alert(
        "Points Balance",
        `You have ${customerRewardsPoints} rewards points in your wallet.`
      );
      // if(totalInitialAmount===0 || totalInitialAmount===0.00){
      //   Alert.alert("Warning","Initial amount must not be a 0.");
      // }else{
      // console.log("Cart Screen---> send to Reward screen", FinalTotalAmount);
      // navigation.navigate("RewardScreen", {
      //   passedStationName,
      //   selectedOrdertype,
      //   secondItem,
      //   extractedDatas,
      //   FinalTotalAmount: parseFloat(
      //     FinalTotalAmount || updateTotalAmount_NewDeliveryScreen
      //   ),
      //   customerData,
      //   selectedItem,
      //   paymentMethods,
      //   gcashNumber,
      // });

      //console.log("inside else",rewardsData);
    }
  };

  const [paymentMethods, setPaymentMethods] = useState([]);
  //console.log("line 245", paymentMethods);
  const gcashNumber = parseFloat(
    newDeliveryDetails &&
      Array.isArray(newDeliveryDetails) &&
      newDeliveryDetails.length > 0
      ? newDeliveryDetails[0].gcashNumber
      : null
  );

  // console.log("line 91", gcashNumber);
  //codes for payment method
  useLayoutEffect(() => {
    if (Array.isArray(newDeliveryDetails) && newDeliveryDetails.length > 0) {
      // const splitPaymentMethods =
      //   (newDeliveryDetails &&
      //     newDeliveryDetails[0]?.paymentMethods.split(",")) ||
      //   [];
      const paymentMethodsString = newDeliveryDetails[0]?.paymentMethods || "";
      // const splitPaymentMethods = paymentMethodsString.split(',');
      const splitPaymentMethods = paymentMethodsString.split(/,\s*|\s*,\s*/);
      // const splitPaymentMethods = (newDeliveryDetails[0]?.paymentMethods || "").split(",").map((method) => method.trim());

      // console.log("reserve line 154",splitPaymentMethods);
      const splitValuesOrderTypeArray = splitPaymentMethods.map(
        (type, index) => ({
          label: type,
          value: type.toString(),
          key: index + 1,
        })
      );
      //  console.log("reserve line 154",splitValuesOrderTypeArray);
      // Reorder the payment methods
      const reorderedPaymentMethods = [
        // Change the order here as desired
        splitValuesOrderTypeArray.find((method) => method.label === "Gcash"),
        splitValuesOrderTypeArray.find((method) => method.label === "Points"),
        splitValuesOrderTypeArray.find(
          (method) => method.label === "CashOnDelivery"
        ),
      ].filter(Boolean);
      // console.log("here line 684")
      //console.log("338",reorderedPaymentMethods)
      // setPaymentMethods(reorderedPaymentMethods);
      if (reorderedPaymentMethods.length > 0) {
        setPaymentMethods(reorderedPaymentMethods);
      } else {
        // Handle the case when paymentMethods is null or empty
        // You can set a default value or perform other actions
        // For example:
        setPaymentMethods([]);
      }
    } else {
      // console.log("here line 688")
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
  // setdeliveyfeeValue(newDeliveryFee ?? null);

  useLayoutEffect(() => {
    if (newDeliveryFee !== null) {
      // console.log("line 649", newDeliveryFee);
      setdeliveyfeeValue(newDeliveryFee);
    } else {
      setdeliveyfeeValue(0);
    }
  }, [newDeliveryFee]);
  const [deliveyfeeValue, setdeliveyfeeValue] = useState(0);
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
    const vehicle1MinQty =
      newDeliveryDetails &&
      Array.isArray(newDeliveryDetails) &&
      newDeliveryDetails.length > 0
        ? newDeliveryDetails[0].vehicle1MinQty
        : null;
    const vehicle1MaxQty =
      newDeliveryDetails &&
      Array.isArray(newDeliveryDetails) &&
      newDeliveryDetails.length > 0
        ? newDeliveryDetails[0].vehicle1MaxQty
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
    const vehicle2MinQty =
      newDeliveryDetails &&
      Array.isArray(newDeliveryDetails) &&
      newDeliveryDetails.length > 0
        ? newDeliveryDetails[0].vehicle2MinQty
        : null;
    const vehicle2MaxQty =
      newDeliveryDetails &&
      Array.isArray(newDeliveryDetails) &&
      newDeliveryDetails.length > 0
        ? newDeliveryDetails[0].vehicle2MaxQty
        : null;
    //console.log("line 962",vehicle2MaxQty, typeof vehicle2MaxQty)
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
    const vehicle3MinQty =
      newDeliveryDetails &&
      Array.isArray(newDeliveryDetails) &&
      newDeliveryDetails.length > 0
        ? newDeliveryDetails[0].vehicle3MinQty
        : null;
    const vehicle3MaxQty =
      newDeliveryDetails &&
      Array.isArray(newDeliveryDetails) &&
      newDeliveryDetails.length > 0
        ? newDeliveryDetails[0].vehicle3MaxQty
        : null;

    const vehicle4Fee =
      newDeliveryDetails &&
      Array.isArray(newDeliveryDetails) &&
      newDeliveryDetails.length > 0
        ? parseFloat(newDeliveryDetails[0].vehicle4Fee)
        : null;

    const vehicle4MinQty =
      newDeliveryDetails &&
      Array.isArray(newDeliveryDetails) &&
      newDeliveryDetails.length > 0
        ? newDeliveryDetails[0].vehicle4MinQty
        : null;
    const vehicle4MaxQty =
      newDeliveryDetails &&
      Array.isArray(newDeliveryDetails) &&
      newDeliveryDetails.length > 0
        ? newDeliveryDetails[0].vehicle4MaxQty
        : null;

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
            console.log("Standard additional cost", additionalCost);

            // const total = parseFloat(totalInitialAmount) + additionalCost;
            // console.log("Standard total result standard", total);
            let subtotal = 0;
            if (
              totalQuantity >= Number(vehicle1MinQty) &&
              totalQuantity <= Number(vehicle1MaxQty)
            ) {
              if (
                vehicle1Fee !== "" ||
                vehicle1MinQty !== "" ||
                vehicle1MaxQty !== ""
              ) {
                subtotal =
                  totalInitialAmount +
                  parseFloat(vehicle1Fee) +
                  parseFloat(additionalCost);
                console.log(
                  "Standard>--->vehicle1MinQty && vehicle1MaxQty&& totalQuantity > parseFloat(vehicle1MinQty)"
                );
                //line 1158
                setvehicleFeeSaveToDb(vehicle1Fee);
                setdeliveyfeeValue(additionalCost.toFixed(2));
                if (!isNaN(subtotal)) {
                  setTotalAmount(subtotal.toFixed(2));
                } else {
                  setTotalAmount("Total Amount");
                }
                // Perform any additional operations or set states based on the subtotal
              } else {
                //const result=
                console.log("Vehicle1Fee is not available or has no value");
                // Handle the case when vehicle1Fee is not present or has no value
              }
            } else if (
              totalQuantity >= Number(vehicle2MinQty) &&
              totalQuantity <= Number(vehicle2MaxQty)
            ) {
              if (vehicle2Fee !== "") {
                subtotal =
                  totalInitialAmount +
                  parseFloat(vehicle2Fee) +
                  parseFloat(additionalCost);
                console.log(
                  "Standard--->vehicle2MinQty && vehicle1MaxQty&& totalQuantity > parseFloat(vehicle2MinQty)"
                );
                //line 1158
                setvehicleFeeSaveToDb(vehicle2Fee);
                setdeliveyfeeValue(additionalCost.toFixed(2));
                if (!isNaN(subtotal)) {
                  setTotalAmount(subtotal.toFixed(2));
                } else {
                  setTotalAmount("Total Amount");
                }
                // Perform any additional operations or set states based on the subtotal
              } else {
                console.log("Vehicle1Fee is not available or has no value");
                // Handle the case when vehicle1Fee is not present or has no value
              }
            } else if (
              totalQuantity >= Number(vehicle3MinQty) &&
              totalQuantity <= Number(vehicle3MaxQty)
            ) {
              if (vehicle3Fee !== "") {
                subtotal =
                  totalInitialAmount +
                  parseFloat(vehicle3Fee) +
                  parseFloat(additionalCost);
                console.log(
                  "Standard--->vehicle1MinQty && vehicle1MaxQty&& totalQuantity > parseFloat(vehicle1MinQty)"
                );

                setvehicleFeeSaveToDb(vehicle3Fee);
                setdeliveyfeeValue(additionalCost.toFixed(2));
                if (!isNaN(subtotal)) {
                  setTotalAmount(subtotal.toFixed(2));
                } else {
                  setTotalAmount("Total Amount");
                }
                // Perform any additional operations or set states based on the subtotal
              } else {
                console.log("Vehicle3Fee is not available or has no value");
                // Handle the case when vehicle1Fee is not present or has no value
              }
            } else if (
              totalQuantity >= Number(vehicle4MinQty) &&
              totalQuantity <= Number(vehicle4MaxQty)
            ) {
              if (vehicle4Fee !== "") {
                subtotal =
                  totalInitialAmount +
                  parseFloat(vehicle4Fee) +
                  parseFloat(additionalCost);
                console.log(
                  "Standard--->vehicle4MinQty && vehicle1MaxQty&& totalQuantity > parseFloat(vehicle4MinQty)"
                );

                setvehicleFeeSaveToDb(vehicle4Fee);
                setdeliveyfeeValue(additionalCost.toFixed(2));
                if (!isNaN(subtotal)) {
                  setTotalAmount(subtotal.toFixed(2));
                } else {
                  setTotalAmount("Total Amount");
                }
                // Perform any additional operations or set states based on the subtotal
              } else {
                console.log("Vehicle3Fee is not available or has no value");
                // Handle the case when vehicle1Fee is not present or has no value
              }
            }
          }
        } else {
          //if customer location is less  than standard distance set by admin
          console.log(
            "DELIVERY --> STANDARD--> ELSE BLOCK--> CUSTOMER DISTANCE IS LESS THAN TO DISTANCE SET BY ADMIN IN STANDARD"
          );

          if (totalInitialAmount) {
            let subtotal = 0;
            // subtotal = totalInitialAmount + parseFloat(vehicle1Fee);
            if (
              totalQuantity >= Number(vehicle1MinQty) &&
              totalQuantity <= Number(vehicle1MaxQty)
            ) {
              if (vehicle1Fee !== "") {
                subtotal = totalInitialAmount + parseFloat(vehicle1Fee);
                console.log(
                  "Standard but less than distance--->vehicle1MinQty && vehicle1MaxQty&& totalQuantity > parseFloat(vehicle1MinQty)"
                );
                //line 1158
                setvehicleFeeSaveToDb(vehicle1Fee);
                setdeliveyfeeValue(0);
                if (!isNaN(subtotal)) {
                  setTotalAmount(subtotal.toFixed(2));
                } else {
                  setTotalAmount("Total Amount");
                }
                // Perform any additional operations or set states based on the subtotal
              } else {
                console.log("Vehicle1Fee is not available or has no value");
                // Handle the case when vehicle1Fee is not present or has no value
              }
            } else if (
              totalQuantity >= Number(vehicle2MinQty) &&
              totalQuantity <= Number(vehicle2MaxQty)
            ) {
              if (vehicle2Fee !== "") {
                subtotal = totalInitialAmount + parseFloat(vehicle2Fee);
                console.log(
                  "Standard but less than distance--->vehicle2MinQty && vehicle1MaxQty&& totalQuantity > parseFloat(vehicle2MinQty)"
                );
                //line 1158
                setvehicleFeeSaveToDb(vehicle2Fee);
                setdeliveyfeeValue(0);
                if (!isNaN(subtotal)) {
                  setTotalAmount(subtotal.toFixed(2));
                } else {
                  setTotalAmount("Total Amount");
                }
                // Perform any additional operations or set states based on the subtotal
              } else {
                console.log("Vehicle1Fee is not available or has no value");
                // Handle the case when vehicle1Fee is not present or has no value
              }
            } else if (
              totalQuantity >= Number(vehicle3MinQty) &&
              totalQuantity <= Number(vehicle3MaxQty)
            ) {
              if (vehicle3Fee !== "") {
                subtotal = totalInitialAmount + parseFloat(vehicle3Fee);
                console.log(
                  "Standard but less than distance--->vehicle1MinQty && vehicle1MaxQty&& totalQuantity > parseFloat(vehicle1MinQty)"
                );

                setvehicleFeeSaveToDb(vehicle3Fee);
                setdeliveyfeeValue(0);
                if (!isNaN(subtotal)) {
                  setTotalAmount(subtotal.toFixed(2));
                } else {
                  setTotalAmount("Total Amount");
                }
                // Perform any additional operations or set states based on the subtotal
              } else {
                console.log("Vehicle3Fee is not available or has no value");
                // Handle the case when vehicle1Fee is not present or has no value
              }
            } else if (
              totalQuantity >= Number(vehicle4MinQty) &&
              totalQuantity <= Number(vehicle4MaxQty)
            ) {
              if (vehicle4Fee !== "") {
                subtotal = totalInitialAmount + parseFloat(vehicle4Fee);
                console.log(
                  "Standard but less than distance--->vehicle4MinQty && vehicle1MaxQty&& totalQuantity > parseFloat(vehicle4MinQty)"
                );

                setvehicleFeeSaveToDb(vehicle4Fee);
                setdeliveyfeeValue(0);
                if (!isNaN(subtotal)) {
                  setTotalAmount(subtotal.toFixed(2));
                } else {
                  setTotalAmount("Total Amount");
                }
                // Perform any additional operations or set states based on the subtotal
              } else {
                console.log("Vehicle3Fee is not available or has no value");
                // Handle the case when vehicle1Fee is not present or has no value
              }
            }
          }
        }
      } else if (selectedDeliveryType === expressDeliveryValue) {
        {
          /* if selected delivery type is express */
        }
        console.log("Express CUstomer distance", customerDistanceToStation);
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
            //  setdeliveyfeeValue(additionalCost.toFixed(2));

            let subtotal = 0;

            //  console.log("line 1131",totalQuantity,typeof totalQuantity);
            if (
              totalQuantity >= Number(vehicle1MinQty) &&
              totalQuantity <= Number(vehicle1MaxQty)
            ) {
              if (vehicle1Fee !== "") {
                const delivery =
                  parseFloat(expressDeliveryFee) + additionalCost;
                subtotal =
                  totalInitialAmount +
                  parseFloat(vehicle1Fee) +
                  parseFloat(expressDeliveryFee) +
                  additionalCost;

                console.log(
                  "Express--->vehicle1MinQty && vehicle1MaxQty&& totalQuantity > parseFloat(vehicle1MinQty)",
                  subtotal
                );

                setvehicleFeeSaveToDb(vehicle1Fee.toFixed(2));
                setdeliveyfeeValue(delivery.toFixed(2));

                if (!isNaN(subtotal)) {
                  setTotalAmount(subtotal.toFixed(2));
                } else {
                  setTotalAmount("Total Amount");
                }
                // Perform any additional operations or set states based on the subtotal
              } else {
                console.log("Vehicle1Fee is not available or has no value");
                // Handle the case when vehicle1Fee is not present or has no value
              }
            } else if (
              totalQuantity >= Number(vehicle2MinQty) &&
              totalQuantity <= Number(vehicle2MaxQty)
            ) {
              if (vehicle2Fee !== "") {
                const delivery =
                  parseFloat(expressDeliveryFee) + additionalCost;
                subtotal =
                  totalInitialAmount +
                  parseFloat(vehicle2Fee) +
                  parseFloat(expressDeliveryFee) +
                  additionalCost;

                console.log(
                  "Express-->vehicle2MinQty && vehicle2MaxQty&& totalQuantity > parseFloat(vehicle2MinQty))",
                  subtotal
                );
                //line 1158
                setvehicleFeeSaveToDb(vehicle2Fee.toFixed(2));
                setdeliveyfeeValue(delivery.toFixed(2));

                if (!isNaN(subtotal)) {
                  setTotalAmount(subtotal.toFixed(2));
                } else {
                  setTotalAmount("Total Amount");
                }
                // Perform any additional operations or set states based on the subtotal
              } else {
                console.log("Vehicle1Fee is not available or has no value");
                // Handle the case when vehicle1Fee is not present or has no value
              }
            } else if (
              totalQuantity >= Number(vehicle3MinQty) &&
              totalQuantity <= Number(vehicle3MaxQty)
            ) {
              if (vehicle3Fee !== "") {
                const delivery =
                  parseFloat(expressDeliveryFee) + additionalCost;
                subtotal =
                  totalInitialAmount +
                  parseFloat(vehicle3Fee) +
                  parseFloat(expressDeliveryFee) +
                  additionalCost;

                console.log(
                  "Express-->vehicle2MinQty && vehicle2MaxQty&& totalQuantity > parseFloat(vehicle2MinQty))",
                  subtotal
                );
                //line 1158
                setvehicleFeeSaveToDb(vehicle3Fee.toFixed(2));
                setdeliveyfeeValue(delivery.toFixed(2));

                if (!isNaN(subtotal)) {
                  setTotalAmount(subtotal.toFixed(2));
                } else {
                  setTotalAmount("Total Amount");
                }
                // Perform any additional operations or set states based on the subtotal
              } else {
                console.log("Vehicle1Fee is not available or has no value");
                // Handle the case when vehicle1Fee is not present or has no value
              }
            } else if (
              totalQuantity >= Number(vehicle4MinQty) &&
              totalQuantity <= Number(vehicle4MaxQty)
            ) {
              if (vehicle4Fee !== "") {
                const delivery =
                  parseFloat(expressDeliveryFee) + additionalCost;
                subtotal =
                  totalInitialAmount +
                  parseFloat(vehicle4Fee) +
                  parseFloat(expressDeliveryFee) +
                  additionalCost;

                console.log(
                  "Express-->vehicle2MinQty && vehicle2MaxQty&& totalQuantity > parseFloat(vehicle2MinQty))",
                  subtotal
                );
                //line 1158
                setvehicleFeeSaveToDb(vehicle4Fee.toFixed(2));
                setdeliveyfeeValue(delivery.toFixed(2));

                if (!isNaN(subtotal)) {
                  setTotalAmount(subtotal.toFixed(2));
                } else {
                  setTotalAmount("Total Amount");
                }
                // Perform any additional operations or set states based on the subtotal
              } else {
                console.log("Vehicle1Fee is not available or has no value");
                // Handle the case when vehicle1Fee is not present or has no value
              }
            }
          }
        } else {
          //express delivery type if less than sa ge set ni admin for expressDistance
          if (totalInitialAmount) {
            let subtotal = 0;
            if (
              totalQuantity >= parseFloat(vehicle1MinQty) &&
              totalQuantity <= parseFloat(vehicle1MaxQty)
            ) {
              if (vehicle1Fee !== "") {
                subtotal =
                  totalInitialAmount +
                  parseFloat(vehicle1Fee) +
                  parseFloat(expressDeliveryFee);

                console.log(
                  "Express but less than distance--->vehicle1MinQty && vehicle1MaxQty&& totalQuantity > parseFloat(vehicle1MinQty)"
                );
                //line 1158
                setvehicleFeeSaveToDb(vehicle1Fee);
                setdeliveyfeeValue(expressDeliveryFee);
                if (!isNaN(subtotal)) {
                  setTotalAmount(subtotal.toFixed(2));
                } else {
                  setTotalAmount("Total Amount");
                }
                // Perform any additional operations or set states based on the subtotal
              } else {
                console.log("Vehicle1Fee is not available or has no value");
                // Handle the case when vehicle1Fee is not present or has no value
              }
            } else if (
              totalQuantity >= parseFloat(vehicle2MinQty) &&
              totalQuantity <= parseFloat(vehicle2MaxQty)
            ) {
              if (vehicle2Fee !== "") {
                subtotal =
                  totalInitialAmount +
                  parseFloat(vehicle2Fee) +
                  parseFloat(expressDeliveryFee);
                console.log(
                  "Express but less than distance-->vehicle2MinQty && vehicle2MaxQty&& totalQuantity > parseFloat(vehicle2MinQty)"
                );
                //line 1158
                setvehicleFeeSaveToDb(vehicle2Fee);
                setdeliveyfeeValue(expressDeliveryFee);
                if (!isNaN(subtotal)) {
                  setTotalAmount(subtotal.toFixed(2));
                } else {
                  setTotalAmount("Total Amount");
                }
              } else {
                console.log("Vehicle2Fee is not available or has no value");
                // Handle the case when vehicle1Fee is not present or has no value
              }
            } else if (
              totalQuantity >= parseFloat(vehicle3MinQty) &&
              totalQuantity <= parseFloat(vehicle3MaxQty)
            ) {
              if (vehicle3Fee !== "") {
                subtotal =
                  totalInitialAmount +
                  parseFloat(vehicle3Fee) +
                  parseFloat(expressDeliveryFee);
                console.log(
                  "Express but less than distance---> && vehicle3MaxQty&& totalQuantity > parseFloat(vehicle3MinQty)"
                );
                //line 1158
                setvehicleFeeSaveToDb(vehicle3Fee);
                setdeliveyfeeValue(expressDeliveryFee);
                if (!isNaN(subtotal)) {
                  setTotalAmount(subtotal.toFixed(2));
                } else {
                  setTotalAmount("Total Amount");
                }
              } else {
                console.log("Vehicle2Fee is not available or has no value");
                // Handle the case when vehicle1Fee is not present or has no value
              }
            } else if (
              totalQuantity > parseFloat(vehicle4MinQty) &&
              totalQuantity <= parseFloat(vehicle4MaxQty)
            ) {
              if (vehicle4Fee !== "") {
                subtotal =
                  totalInitialAmount +
                  parseFloat(vehicle4Fee) +
                  parseFloat(expressDeliveryFee);
                console.log(
                  "Express but less than distance-->vehicle4MinQty && vehicle4MaxQty&& totalQuantity > parseFloat(vehicle4MinQty)"
                );
                //line 1158
                setvehicleFeeSaveToDb(vehicle4Fee);
                setdeliveyfeeValue(expressDeliveryFee);
                if (!isNaN(subtotal)) {
                  setTotalAmount(subtotal.toFixed(2));
                } else {
                  setTotalAmount("Total Amount");
                }
              } else {
                console.log("Vehicle2Fee is not available or has no value");
                // Handle the case when vehicle1Fee is not present or has no value
              }
            }
          }
        }
      } else if (selectedDeliveryType === reservationDeliveryValue) {
        {
          /* order type is delivery but reservation is choosen so after that if Reservation, another payment for the standard and express */
        }
        console.log("Line 1463", selectedReserveDeliveryType);
        if (selectedReserveDeliveryType === standardDeliveryValue) {
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
              console.log(" Standard additional cost", additionalCost);

              // const total = parseFloat(totalInitialAmount) + additionalCost;
              // console.log("Standard total result standard", total);
              let subtotal = 0;
              if (
                totalQuantity >= Number(vehicle1MinQty) &&
                totalQuantity <= Number(vehicle1MaxQty)
              ) {
                if (vehicle1Fee !== "") {
                  subtotal =
                    totalInitialAmount +
                    parseFloat(vehicle1Fee) +
                    parseFloat(additionalCost);
                  console.log(
                    "Reservation Standard---->vehicle1MinQty && vehicle1MaxQty&& totalQuantity > parseFloat(vehicle1MinQty)"
                  );
                  //line 1158
                  setvehicleFeeSaveToDb(vehicle1Fee);
                  setdeliveyfeeValue(additionalCost.toFixed(2));
                  if (!isNaN(subtotal)) {
                    setTotalAmount(subtotal.toFixed(2));
                  } else {
                    setTotalAmount("Total Amount");
                  }
                  // Perform any additional operations or set states based on the subtotal
                } else {
                  console.log("Vehicle1Fee is not available or has no value");
                  // Handle the case when vehicle1Fee is not present or has no value
                }
              } else if (
                totalQuantity >= Number(vehicle2MinQty) &&
                totalQuantity <= Number(vehicle2MaxQty)
              ) {
                if (vehicle2Fee !== "") {
                  subtotal =
                    totalInitialAmount +
                    parseFloat(vehicle2Fee) +
                    parseFloat(additionalCost);
                  console.log(
                    "Reservation Standard---->vehicle2MinQty && vehicle1MaxQty&& totalQuantity > parseFloat(vehicle2MinQty)"
                  );
                  //line 1158
                  setvehicleFeeSaveToDb(vehicle2Fee);
                  setdeliveyfeeValue(additionalCost.toFixed(2));
                  if (!isNaN(subtotal)) {
                    setTotalAmount(subtotal.toFixed(2));
                  } else {
                    setTotalAmount("Total Amount");
                  }
                  // Perform any additional operations or set states based on the subtotal
                } else {
                  console.log("Vehicle1Fee is not available or has no value");
                  // Handle the case when vehicle1Fee is not present or has no value
                }
              } else if (
                totalQuantity >= Number(vehicle3MinQty) &&
                totalQuantity <= Number(vehicle3MaxQty)
              ) {
                if (vehicle3Fee !== "") {
                  subtotal =
                    totalInitialAmount +
                    parseFloat(vehicle3Fee) +
                    parseFloat(additionalCost);
                  console.log(
                    "Reservation Standard---->vehicle1MinQty && vehicle1MaxQty&& totalQuantity > parseFloat(vehicle1MinQty)"
                  );

                  setvehicleFeeSaveToDb(vehicle3Fee);
                  setdeliveyfeeValue(additionalCost.toFixed(2));
                  if (!isNaN(subtotal)) {
                    setTotalAmount(subtotal.toFixed(2));
                  } else {
                    setTotalAmount("Total Amount");
                  }
                  // Perform any additional operations or set states based on the subtotal
                } else {
                  console.log("Vehicle3Fee is not available or has no value");
                  // Handle the case when vehicle1Fee is not present or has no value
                }
              } else if (
                totalQuantity >= Number(vehicle4MinQty) &&
                totalQuantity <= Number(vehicle4MaxQty)
              ) {
                if (vehicle4Fee !== "") {
                  subtotal =
                    totalInitialAmount +
                    parseFloat(vehicle4Fee) +
                    parseFloat(additionalCost);
                  console.log(
                    "Reservation Standard--->vehicle4MinQty && vehicle1MaxQty&& totalQuantity > parseFloat(vehicle4MinQty)"
                  );

                  setvehicleFeeSaveToDb(vehicle4Fee);
                  setdeliveyfeeValue(additionalCost.toFixed(2));
                  if (!isNaN(subtotal)) {
                    setTotalAmount(subtotal.toFixed(2));
                  } else {
                    setTotalAmount("Total Amount");
                  }
                  // Perform any additional operations or set states based on the subtotal
                } else {
                  console.log("Vehicle3Fee is not available or has no value");
                  // Handle the case when vehicle1Fee is not present or has no value
                }
              }
            }
          } else {
            if (totalInitialAmount) {
              let subtotal = 0;
              // subtotal = totalInitialAmount + parseFloat(vehicle1Fee);
              if (
                totalQuantity >= Number(vehicle1MinQty) &&
                totalQuantity <= Number(vehicle1MaxQty)
              ) {
                if (vehicle1Fee !== "") {
                  subtotal = totalInitialAmount + parseFloat(vehicle1Fee);
                  console.log(
                    "Reserve Standard but less than distance--->vehicle1MinQty && vehicle1MaxQty&& totalQuantity > parseFloat(vehicle1MinQty)"
                  );
                  //line 1158
                  setvehicleFeeSaveToDb(vehicle1Fee);
                  setdeliveyfeeValue(0);
                  if (!isNaN(subtotal)) {
                    setTotalAmount(subtotal.toFixed(2));
                  } else {
                    setTotalAmount("Total Amount");
                  }
                  // Perform any additional operations or set states based on the subtotal
                } else {
                  console.log("Vehicle1Fee is not available or has no value");
                  // Handle the case when vehicle1Fee is not present or has no value
                }
              } else if (
                totalQuantity >= Number(vehicle2MinQty) &&
                totalQuantity <= Number(vehicle2MaxQty)
              ) {
                if (vehicle2Fee !== "") {
                  subtotal = totalInitialAmount + parseFloat(vehicle2Fee);
                  console.log(
                    "Reserve Standard  but less than distance--->vehicle2MinQty && vehicle1MaxQty&& totalQuantity > parseFloat(vehicle2MinQty)"
                  );
                  //line 1158
                  setvehicleFeeSaveToDb(vehicle2Fee);
                  setdeliveyfeeValue(0);
                  if (!isNaN(subtotal)) {
                    setTotalAmount(subtotal.toFixed(2));
                  } else {
                    setTotalAmount("Total Amount");
                  }
                  // Perform any additional operations or set states based on the subtotal
                } else {
                  console.log("Vehicle1Fee is not available or has no value");
                  // Handle the case when vehicle1Fee is not present or has no value
                }
              } else if (
                totalQuantity >= Number(vehicle3MinQty) &&
                totalQuantity <= Number(vehicle3MaxQty)
              ) {
                if (vehicle3Fee !== "") {
                  subtotal = totalInitialAmount + parseFloat(vehicle3Fee);
                  console.log(
                    "Reserve Standard  but less than distance--->vehicle1MinQty && vehicle1MaxQty&& totalQuantity > parseFloat(vehicle1MinQty)"
                  );

                  setvehicleFeeSaveToDb(vehicle3Fee);
                  setdeliveyfeeValue(0);
                  if (!isNaN(subtotal)) {
                    setTotalAmount(subtotal.toFixed(2));
                  } else {
                    setTotalAmount("Total Amount");
                  }
                  // Perform any additional operations or set states based on the subtotal
                } else {
                  console.log("Vehicle3Fee is not available or has no value");
                  // Handle the case when vehicle1Fee is not present or has no value
                }
              } else if (
                totalQuantity >= Number(vehicle4MinQty) &&
                totalQuantity <= Number(vehicle4MaxQty)
              ) {
                if (vehicle4Fee !== "") {
                  subtotal = totalInitialAmount + parseFloat(vehicle4Fee);
                  console.log(
                    "Reserve Standard  but less than distance--->vehicle4MinQty && vehicle1MaxQty&& totalQuantity > parseFloat(vehicle4MinQty)"
                  );

                  setvehicleFeeSaveToDb(vehicle4Fee);
                  setdeliveyfeeValue(0);
                  if (!isNaN(subtotal)) {
                    setTotalAmount(subtotal.toFixed(2));
                  } else {
                    setTotalAmount("Total Amount");
                  }
                  // Perform any additional operations or set states based on the subtotal
                } else {
                  console.log("Vehicle3Fee is not available or has no value");
                  // Handle the case when vehicle1Fee is not present or has no value
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
              //  setdeliveyfeeValue(additionalCost.toFixed(2));

              let subtotal = 0;

              //  console.log("line 1131",totalQuantity,typeof totalQuantity);
              if (
                totalQuantity >= Number(vehicle1MinQty) &&
                totalQuantity <= Number(vehicle1MaxQty)
              ) {
                if (vehicle1Fee !== "") {
                  const delivery =
                    parseFloat(expressDeliveryFee) + additionalCost;
                  subtotal =
                    totalInitialAmount +
                    parseFloat(vehicle1Fee) +
                    parseFloat(expressDeliveryFee) +
                    additionalCost;

                  console.log(
                    "Express--->vehicle1MinQty && vehicle1MaxQty&& totalQuantity > parseFloat(vehicle1MinQty)",
                    subtotal
                  );

                  setvehicleFeeSaveToDb(vehicle1Fee.toFixed(2));
                  setdeliveyfeeValue(delivery.toFixed(2));

                  if (!isNaN(subtotal)) {
                    setTotalAmount(subtotal.toFixed(2));
                  } else {
                    setTotalAmount("Total Amount");
                  }
                  // Perform any additional operations or set states based on the subtotal
                } else {
                  console.log("Vehicle1Fee is not available or has no value");
                  // Handle the case when vehicle1Fee is not present or has no value
                }
              } else if (
                totalQuantity >= Number(vehicle2MinQty) &&
                totalQuantity <= Number(vehicle2MaxQty)
              ) {
                if (vehicle2Fee !== "") {
                  const delivery =
                    parseFloat(expressDeliveryFee) + additionalCost;
                  subtotal =
                    totalInitialAmount +
                    parseFloat(vehicle2Fee) +
                    parseFloat(expressDeliveryFee) +
                    additionalCost;

                  console.log(
                    "Express-->vehicle2MinQty && vehicle2MaxQty&& totalQuantity > parseFloat(vehicle2MinQty))",
                    subtotal
                  );
                  //line 1158
                  setvehicleFeeSaveToDb(vehicle2Fee.toFixed(2));
                  setdeliveyfeeValue(delivery.toFixed(2));

                  if (!isNaN(subtotal)) {
                    setTotalAmount(subtotal.toFixed(2));
                  } else {
                    setTotalAmount("Total Amount");
                  }
                  // Perform any additional operations or set states based on the subtotal
                } else {
                  console.log("Vehicle1Fee is not available or has no value");
                  // Handle the case when vehicle1Fee is not present or has no value
                }
              } else if (
                totalQuantity >= Number(vehicle3MinQty) &&
                totalQuantity <= Number(vehicle3MaxQty)
              ) {
                if (vehicle3Fee !== "") {
                  const delivery =
                    parseFloat(expressDeliveryFee) + additionalCost;
                  subtotal =
                    totalInitialAmount +
                    parseFloat(vehicle3Fee) +
                    parseFloat(expressDeliveryFee) +
                    additionalCost;

                  console.log(
                    "Express-->vehicle2MinQty && vehicle2MaxQty&& totalQuantity > parseFloat(vehicle2MinQty))",
                    subtotal
                  );
                  //line 1158
                  setvehicleFeeSaveToDb(vehicle3Fee.toFixed(2));
                  setdeliveyfeeValue(delivery.toFixed(2));

                  if (!isNaN(subtotal)) {
                    setTotalAmount(subtotal.toFixed(2));
                  } else {
                    setTotalAmount("Total Amount");
                  }
                  // Perform any additional operations or set states based on the subtotal
                } else {
                  console.log("Vehicle1Fee is not available or has no value");
                  // Handle the case when vehicle1Fee is not present or has no value
                }
              } else if (
                totalQuantity >= Number(vehicle4MinQty) &&
                totalQuantity <= Number(vehicle4MaxQty)
              ) {
                if (vehicle4Fee !== "") {
                  const delivery =
                    parseFloat(expressDeliveryFee) + additionalCost;
                  subtotal =
                    totalInitialAmount +
                    parseFloat(vehicle4Fee) +
                    parseFloat(expressDeliveryFee) +
                    additionalCost;

                  console.log(
                    "Express-->vehicle2MinQty && vehicle2MaxQty&& totalQuantity > parseFloat(vehicle2MinQty))",
                    subtotal
                  );
                  //line 1158
                  setvehicleFeeSaveToDb(vehicle4Fee.toFixed(2));
                  setdeliveyfeeValue(delivery.toFixed(2));

                  if (!isNaN(subtotal)) {
                    setTotalAmount(subtotal.toFixed(2));
                  } else {
                    setTotalAmount("Total Amount");
                  }
                  // Perform any additional operations or set states based on the subtotal
                } else {
                  console.log("Vehicle1Fee is not available or has no value");
                  // Handle the case when vehicle1Fee is not present or has no value
                }
              }
            }
          } else {
            if (totalInitialAmount) {
              let subtotal = 0;
              if (
                totalQuantity > parseFloat(vehicle1MinQty) ||
                totalQuantity <= parseFloat(vehicle1MaxQty)
              ) {
                if (vehicle1Fee !== "") {
                  subtotal =
                    totalInitialAmount +
                    parseFloat(vehicle1Fee) +
                    parseFloat(expressDeliveryFee);

                  console.log(
                    "Express but less than distance--->vehicle1MinQty && vehicle1MaxQty&& totalQuantity > parseFloat(vehicle1MinQty)"
                  );
                  //line 1158
                  setvehicleFeeSaveToDb(vehicle1Fee);
                  setdeliveyfeeValue(expressDeliveryFee);
                  if (!isNaN(subtotal)) {
                    setTotalAmount(subtotal.toFixed(2));
                  } else {
                    setTotalAmount("Total Amount");
                  }
                  // Perform any additional operations or set states based on the subtotal
                } else {
                  console.log("Vehicle1Fee is not available or has no value");
                  // Handle the case when vehicle1Fee is not present or has no value
                }
              }

              if (
                totalQuantity > parseFloat(vehicle2MinQty) ||
                totalQuantity <= parseFloat(vehicle2MaxQty)
              ) {
                if (vehicle2Fee !== "") {
                  subtotal =
                    totalInitialAmount +
                    parseFloat(vehicle2Fee) +
                    parseFloat(expressDeliveryFee);
                  console.log(
                    "Express but less than distance-->vehicle2MinQty && vehicle2MaxQty&& totalQuantity > parseFloat(vehicle2MinQty)"
                  );
                  //line 1158
                  setvehicleFeeSaveToDb(vehicle2Fee);
                  setdeliveyfeeValue(expressDeliveryFee);
                  if (!isNaN(subtotal)) {
                    setTotalAmount(subtotal.toFixed(2));
                  } else {
                    setTotalAmount("Total Amount");
                  }
                } else {
                  console.log("Vehicle2Fee is not available or has no value");
                  // Handle the case when vehicle1Fee is not present or has no value
                }
              }

              if (
                totalQuantity > parseFloat(vehicle3MinQty) ||
                totalQuantity <= parseFloat(vehicle3MaxQty)
              ) {
                if (vehicle3Fee !== "") {
                  subtotal =
                    totalInitialAmount +
                    parseFloat(vehicle3Fee) +
                    parseFloat(expressDeliveryFee);
                  console.log(
                    "Express but less than distance-->Expressvehicle3MinQty && vehicle3MaxQty&& totalQuantity > parseFloat(vehicle3MinQty)"
                  );
                  //line 1158
                  setvehicleFeeSaveToDb(vehicle3Fee);
                  setdeliveyfeeValue(expressDeliveryFee);
                  if (!isNaN(subtotal)) {
                    setTotalAmount(subtotal.toFixed(2));
                  } else {
                    setTotalAmount("Total Amount");
                  }
                } else {
                  console.log("Vehicle2Fee is not available or has no value");
                  // Handle the case when vehicle1Fee is not present or has no value
                }
              }
              if (
                totalQuantity > parseFloat(vehicle4MinQty) ||
                totalQuantity <= parseFloat(vehicle4MaxQty)
              ) {
                if (vehicle4Fee !== "") {
                  subtotal =
                    totalInitialAmount +
                    parseFloat(vehicle4Fee) +
                    parseFloat(expressDeliveryFee);
                  console.log(
                    "Express but less than distance-->vehicle4MinQty && vehicle4MaxQty&& totalQuantity > parseFloat(vehicle4MinQty)"
                  );
                  //line 1158
                  setvehicleFeeSaveToDb(vehicle4Fee);
                  setdeliveyfeeValue(expressDeliveryFee);
                  if (!isNaN(subtotal)) {
                    setTotalAmount(subtotal.toFixed(2));
                  } else {
                    setTotalAmount("Total Amount");
                  }
                } else {
                  console.log("Vehicle2Fee is not available or has no value");
                  // Handle the case when vehicle1Fee is not present or has no value
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
            "Order successfully. Thank you for ordering" +
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

  //handlesubmit for Reservation Delivery Type Modal
  const ReservationDeliveryType_HandleSubmit = () => {
    if (selectedReserveDeliveryType === "Standard") {
      console.log("line 1335-->standard ");
      if (!reservationDate_ReserveDeliveryTypes) {
        Alert.alert("Warning", "Please choose an reservation date.");
      } else {
        setShowReservationModal(false);
        setcheckedItemKey_reservationDeliveryTypes(null);
        setreserveDeliverytext("Reservation Date");
        setreserveDeliverydate(moment().toDate()); // Update reserveDeliverydate with the current date
        //setselectedReserveDeliveryType(null);
      }
    } else {
      if (!reservationDate_ReserveDeliveryTypes) {
        Alert.alert("Warning", "Please choose an reservation date.");
      } else if (!reservationTime) {
        Alert.alert("Warning", "Please choose an reservation time.");
      } else {
        setShowReservationModal(false);
        setreserveDeliverytext("Reservation Date");
        setcheckedItemKey_reservationDeliveryTypes(null);
        setreserveDeliveryTime("Reservation Time");
        setselectedReserveDeliveryType(null);
      }
    }
  };
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
  // console.log("line 1355", deliveryTypeValue);
  const [reservationDate, setReservationDate] = useState("");
  // console.log("Pickup reservation date-->line 1354", reservationDate);
  const [
    reservationDate_ReserveDeliveryTypes,
    setreservationDate_ReserveDeliveryTypes,
  ] = useState("");
  const [reservationTime, setreservation_ReserveDeliveryTypes] = useState("");
  const [orderStatus, setOrderStatus] = useState("Pending");

  // console.log("Gcash link",gcashProoflink_Storage)
  //setselectedPaymentMethod
  const [selectedpaymenthod, setselectedPaymentMethod] = useState();
  // console.log("selected payment method", selectedpaymenthod);
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
          //  console.log("rewards data", rewardsInfo);
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
        if (selectedOrdertype === "PickUp") {
          console.log("Selected Order type is pIckup");
          if (selectedOrdertype === null) {
            Alert.alert("Warning", "Please choose an order type.");
          } else if (
            checkedItemKey_deliveryType === "Reservation" &&
            (!text || text === null || !reservationDate)
          ) {
            Alert.alert("Warning", "Please choose an reservation date.");
          } else if (checkedItemKey_deliveryType === null) {
            Alert.alert("Warning", "Please choose an delivery type.");
          } else if (
            combinedData &&
            combinedData.deliveryAddressOption === null
          ) {
            console.log("No Pickup address");
          } else if (checkedItemKey_paymentMethod === null) {
            Alert.alert("Warning", "Please choose an payment method .");
          } else if (!totalInitialAmount) {
            Alert.alert("Warning", "Please make an order.");
          } else {
            if (selectedpaymenthod === "Gcash") {
              if (gcashProofImage === null) {
                setShowModal_ModeOfPayment(true);
              }
            } else if (selectedpaymenthod === "Points") {
              if (
                rewardScreenNewModeOfPayment === "Gcash" &&
                gcashProofImage === null
              ) {
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
            }
          }
        } else {
          // selectedOrdertype is Delivery
          console.log(
            "Selected Order type is delivery line 1475----------------------->"
          );
          if (selectedOrdertype === null) {
            Alert.alert("Warning", "Please choose an order type.");
          } else if (checkedItemKey_deliveryType === null) {
            Alert.alert("Warning", "Please choose a delivery type.");
          } else if (checkedItemKey_paymentMethod === null) {
            Alert.alert("Warning", "Please choose a payment method.");
          } else if (!combinedData) {
            Alert.alert("Warning", "Please choose a delivery address.");
          } else if (!totalInitialAmount) {
            Alert.alert("Warning", "Please make an order.");
          } else {
            if (selectedpaymenthod === "Gcash") {
              if (gcashProofImage === null) {
                setShowModal_ModeOfPayment(true);
              }
            } else if (selectedpaymenthod === "Points") {
              Alert.alert(
                "Warning",
                "Since you already placed your order, you cannot cancel anymore.",
                [
                  {
                    text: "Proceed",
                    onPress: () => {
                      // console.log("proceed press");
                      // navigation.navigate("RewardScreen", {
                      //   // navigation.navigate("RewardScreen", {
                      //   passedStationName,
                      //   selectedOrdertype,
                      //   secondItem,
                      //   extractedDatas,
                      //   FinalTotalAmount: parseFloat(FinalTotalAmount),
                      //   customerData,
                      //   selectedItem,
                      //   paymentMethods,
                      //   gcashNumber,
                      //   createOrder: createOrderFunction,
                      // });
                      setShowRewardsPointsModal(true);
                    },
                  },
                  {
                    text: "Cancel",
                    onPress: () => {
                      console.log("Cancel press");
                    },
                  },
                ]
              );
            } else {
              createOrder(customerData.cusId, gcashProoflink_Storage);
              ToastAndroid.show(
                "Order successfully. Thank you for ordering " +
                  passedStationName +
                  ".",
                ToastAndroid.LONG
              );
            }
          }
        }
      }
    }
  };
  const [createOrderFunction, setcreateOrderFunction] = useState();
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
        order_ProductDiscount:
          item.pro_discount || item.thirdparty_productDiscount,
      })),

      order_newDeliveryAddressOption:
        combinedData && combinedData.DeliveryAddress
          ? combinedData.DeliveryAddress
          : null, // or '' for an empty string

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
    setcreateOrderFunction(orderData);
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
        setTimeout(() => {
          navigation.navigate("Order");
        }, 2000);
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
          pointsTobeAddedd =
            rewardsData && parseFloat(rewardsData[0].rewardPointsToEarn);
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
    //save to customercollection
    const customerRef = ref(db, `CUSTOMER/${CUSTOMERID}`); //get the db reference
    get(customerRef).then((snapshot) => {
      const orderedStore = snapshot.val().orderedStore || {}; // Retrieve existing orderedStore or initialize as an empty object

      const key = Object.keys(orderedStore).length; // Calculate the next sequential key
      orderedStore[key] = {
        adminId: passedAdminID,
      };
      const customerData = {
        ...snapshot.val(),
        orderedStore: orderedStore,
      };
      update(customerRef, customerData)
        .then(() => {
          console.log("line 1864--->admin ID store to customer collection");
        })
        .catch((error) => {
          console.error("Error updating customer points: ", error);
        });
    });
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
      action: action,
      pointsUpdate: pointsUpdate,
      pointsAddedValue: pointsTobeAddedd,
      adminId: passedAdminID,
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

  //Modal--> a codes from rewards screen and all back end codces
  const [showRewardsPointsModal, setShowRewardsPointsModal] = useState(false);
  const [useAllIsDisable, setUseAllIsDisable] = useState(false);
  const [manualTextinputValue, setmanualTextinputValue] = useState("");
  const [passedTotalAmount_RewardModal, setpassedTotalAmount_RewardModal] =
    useState(FinalTotalAmount || 0);
  //code for manual deduct of points
  const manualPointsDeduct = () => {
    //if ang ge enter na value is greater than sa customer pts
    if (parseFloat(manualTextinputValue) > parseFloat(customerRewardsPoints)) {
      Alert.alert("Warning", `Insufficient points balance.`);
      setActionHasBeenTaken(true);
    } else {
      console.log("Input value for manual is ", manualTextinputValue);
      console.log("Final total is", FinalTotalAmount);
      const deductedAmount =
        parseFloat(FinalTotalAmount) -
        parseFloat(manualTextinputValue);
      //const deductedAmount =
      //parseFloat(FinalTotalAmount) + parseFloat(manualTextinputValue);

      console.log("manual. remaining balance is ", deductedAmount);
      ToastAndroid.show("Points successfully used.", ToastAndroid.LONG);
      setFinalTotalAmount(deductedAmount);

      Alert.alert(
        "Warning",
        `You have balance of ₱${deductedAmount.toFixed(
          2
        )}.  Please choose an alternative mode of payment below.`,
        [
          {
            text: "Okay",
            onPress: () => {
              setUseAllIsDisable(false);
              setmanualTextinputValue("");
              setShowviewmodeofpayment(true);
              setActionHasBeenTaken(true);
            },
          },
        ]
      );
      //update the database
      const customerPointsRef = ref(db, `CUSTOMER/${customerID}`); //get the db reference
      // Use the `get` method to retrieve the current walletPoints value
      get(customerPointsRef).then((snapshot) => {
        const walletPoints = snapshot.val().walletPoints || 0;
        const updatedPoints = walletPoints - parseFloat(manualTextinputValue); // convert deductedAmount to an integer
        //setorderPoints(updatedPoints);
        update(customerPointsRef, { walletPoints: updatedPoints })
          .then(() => {
            console.log(
              "Manual Points Deduct--->Customer points updated successfully!"
            );
          })
          .catch((error) => {
            console.error("Error updating customer points: ", error);
          });
      });
      //save to customer user logs
      const btnClick = "manual";
      const actionTaken = "pointsDeducted";
      const userLogRandomId = Math.floor(Math.random() * 50000) + 10000;
      const newUserlogKey = userLogRandomId;
      set(ref(db, `CUSTOMERSLOG/${newUserlogKey}`), {
        //orderID: newOrderKey,
        cusId: customerID,
        datepointsDeducted: currentDate,
        action: actionTaken,
        pointsDeductted: manualTextinputValue,
        btnClick: btnClick,
      })
        .then(async () => {
          // console.log('Test if Save to db-----'+reservationDate );
          console.log(
            "Reward screen --->New UserLog with the User ID of--->",
            newUserlogKey
          );
        })
        .catch((error) => {
          console.log("Error Saving to Database", error);
          alert("Error", JSON.stringify(error), "OK");
        });

      setUseAllIsDisable(false);
      setmanualTextinputValue("");
    }
  };

  //auto use of the points
  const handleAutoUse = () => {
    if (parseFloat(FinalTotalAmount) < parseFloat(customerRewardsPoints)) {
      const deductedAmount =
        parseFloat(customerRewardsPoints) - parseFloat(FinalTotalAmount);
      console.log("168", parseFloat(deductedAmount));
      //update the database
      const customerPointsRef = ref(db, `CUSTOMER/${customerID}`); //get the db reference
      // Use the `get` method to retrieve the current walletPoints value
      get(customerPointsRef).then((snapshot) => {
        const walletPoints = snapshot.val().walletPoints || 0;
        const updatedPoints = deductedAmount.toFixed(2); // convert deductedAmount to an integer
        //setorderPoints(updatedPoints);
        update(customerPointsRef, { walletPoints: parseFloat(updatedPoints) })
          .then(() => {
            console.log("--->Customer points updated successfully!");
          })
          .catch((error) => {
            console.error("Error updating customer points: ", error);
          });
      });

      //save to customer user logs
      const actionTaken = "pointsDeducted";
      const btnClick = "use all";
      const userLogRandomId = Math.floor(Math.random() * 50000) + 10000;
      const newUserlogKey = userLogRandomId;
      set(ref(db, `CUSTOMERSLOG/${newUserlogKey}`), {
        //orderID: newOrderKey,
        cusId: customerID,
        datepointsDeducted: currentDate,
        action: actionTaken,
        pointsDeductted: FinalTotalAmount,
        btnClick: btnClick,
      })
        .then(async () => {
          // console.log('Test if Save to db-----'+reservationDate );
          ToastAndroid.show("Points successfully used.", ToastAndroid.LONG);
          setActionHasBeenTaken(false);
          setFinalTotalAmount(0);
          console.log(
            "Reward screen --->New UserLog with the UserLog ID of-------------------------->",
            newUserlogKey
          );
        })
        .catch((error) => {
          console.log("Error Saving to Database", error);
          alert("Error", JSON.stringify(error), "OK");
        });
    } else {
      //if passed total amount is greater than customer points
      setAutoUsePoints(true);
      const deductedAmount =
        parseFloat(passedTotalAmount_RewardModal) - customerRewardsPoints;
      console.log("Deducted Amount is ", deductedAmount);
      //const roundedPoints = (0).toFixed(2); // round to 2 decimal places
      //setcustomerRewardsPoints(roundedPoints);
      ToastAndroid.show("Points successfully used.", ToastAndroid.LONG);
      setFinalTotalAmount(deductedAmount.toFixed(2));

      Alert.alert(
        "Warning",
        `You have balance of ₱${deductedAmount.toFixed(
          2
        )}.  Please choose an alternative mode of payment below.`,
        [
          {
            text: "Okay",
            onPress: () => {
              setShowviewmodeofpayment(true);
              setActionHasBeenTaken(true);
            },
          },
        ]
      );
      //update the database
      const customerPointsRef = ref(db, `CUSTOMER/${customerID}`); //get the db reference
      // Use the `get` method to retrieve the current walletPoints value
      get(customerPointsRef).then((snapshot) => {
        const walletPoints = snapshot.val().walletPoints || 0;
        const updatedPoints = 0; // convert deductedAmount to an integer
        //setorderPoints(updatedPoints);
        update(customerPointsRef, { walletPoints: updatedPoints })
          .then(() => {
            console.log("--->Customer points updated successfully!");
          })
          .catch((error) => {
            console.error("Error updating customer points: ", error);
          });
      });

      //save to customer user logs
      const actionTaken = "pointsDeducted";
      const btnClick = "use all";
      const userLogRandomId = Math.floor(Math.random() * 50000) + 10000;
      const newUserlogKey = userLogRandomId;
      set(ref(db, `CUSTOMERSLOG/${newUserlogKey}`), {
        //orderID: newOrderKey,
        cusId: customerID,
        orderDate: currentDate,
        action: actionTaken,
        pointsDeductted: customerRewardsPoints,
        btnClick: btnClick,
      })
        .then(async () => {
          // console.log('Test if Save to db-----'+reservationDate );
          console.log(
            "Reward screen --->New UserLog with the User ID of--->",
            newUserlogKey
          );
        })
        .catch((error) => {
          console.log("Error Saving to Database", error);
          alert("Error", JSON.stringify(error), "OK");
        });
    }
  };
  const [selectedNewpaymenthod, setselectedNewPaymentMethod] = useState();
  const [receiverModeOfPayment, setreceiverModeOfPayment] = useState();
  const [showviewmodeofpayment, setShowviewmodeofpayment] = useState(false);
  useLayoutEffect(() => {
    if (paymentMethods) {
      const updatedPaymentMethods = paymentMethods.filter(
        (method) => method.label !== "Points"
      );
      setreceiverModeOfPayment(updatedPaymentMethods);
      //console.log("udpated mode of payment",updatedPaymentMethods)
    }
  }, [paymentMethods]);

  const [actionHasBeenTaken, setActionHasBeenTaken] = useState(false); //flag to track if user click something in this codes

const [checkedItemKey_newpaymentMethod, setCheckedItemKey_newpaymentMethod] =
    useState(null);
    const handleItemchecked_newpaymentMethod = (item) => {
      setCheckedItemKey_paymentMethod(
        item.key === checkedItemKey_paymentMethod ? null : item.key
      );
      if (item.value === "CashOnDelivery") {
        // console.log("COD");
        // if (selectedOrdertype === "PickUp") {
        //   Alert.alert("To our beloved customer", "COD is only for delivery.");
        // }
      } else {
        // console.log("GCASH");
        // setShowModal_ModeOfPayment(true);
      }
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
                    setreserveDeliverydate(moment().toDate()); // Update reserveDeliverydate with the current date
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
                    } else if (selectedReserveDeliveryType === "Express") {
                      reserveDeliveryshowMode("date");
                      setreserveDeliveryTime("Reservation Time"); // Reset the reservation time to the initial value
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
                  // onPress={() => {
                  //   setShowReservationModal(false);
                  //   setcheckedItemKey_reservationDeliveryTypes(null);
                  //   // setreserveDeliverytext("Reservation Date");
                  //   // setreserveDeliveryTime("Reservation Time");
                  //   // setselectedReserveDeliveryType(null);
                  // }}
                  onPress={ReservationDeliveryType_HandleSubmit}
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

      {/*Modal for rewards screen */}
      <Modal
        transparent
        onRequestClose={() => {
          setShowRewardsPointsModal(false);
        }}
        visible={showRewardsPointsModal}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#00000099",
          }}
        >
          <View style={styles.rewardsModal}>
            <View style={styles.rewardsModalTitle}>
              
              <Text
                style={{
                  marginTop: 8,
                  marginLeft: 0,
                  fontFamily: "nunito-bold",
                  fontSize: 20,
                }}
              >
                Reward Points
              </Text>
              <View style={{ flex: 1, marginTop: 2 }} />
              {/* <TouchableOpacity
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
              </TouchableOpacity> */}
            </View>
            <View style={StylesRewardsPoints.wrapperWaterProduct}>
              <Text style={StylesRewardsPoints.waterProdStyle}>
                Current rewards points
              </Text>

              <View style={StylesRewardsPoints.pointsItem}>
                 <View style={StylesRewardsPoints.circular}>
                  <TouchableOpacity
                    onPress={() => {
                      console.log("use all is press");
                      handleAutoUse();
                    }}
                    // disabled={
                    //   (customerRewardsPoints === 0 && useAllIsDisable) ||
                    //   manualTextinputValue !== null
                    // }

                    disabled={
                      customerRewardsPoints === 0 ||
                      useAllIsDisable ||
                      FinalTotalAmount === 0
                    }
                    // disabled={
                    //   customerRewardsPoints === 0 ||
                    //   useAllIsDisable
                    // }
                  >
                    <View
                      style={{
                        padding: 6,
                        // backgroundColor: "#55BCF6",
                        backgroundColor:
                          customerRewardsPoints === 0 ||
                          useAllIsDisable ||
                          FinalTotalAmount === 0
                            ? "gray"
                            : "#55BCF6",
                        // backgroundColor:
                        // customerRewardsPoints === 0 ||
                        // useAllIsDisable
                        //   ? "gray"
                        //   : "#55BCF6",
                        borderRadius: 5,
                        top: 1,
                        opacity: 0.8,
                      }}
                    >
                      <Text
                        style={{
                          textAlign: "center",
                          fontFamily: "nunito-bold",
                        }}
                      >
                        Use all
                      </Text>
                    </View>
                  </TouchableOpacity>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      top: 15,
                      backgroundColor: "transparent",
                      width: 250,
                    }}
                  >
                    <TouchableOpacity
                      onPress={() => {
                        console.log("Manual is press");
                        manualPointsDeduct();
                      }}
                      disabled={
                        customerRewardsPoints === 0 ||
                        !manualTextinputValue ||
                        manualTextinputValue === null ||
                        manualTextinputValue === "" ||
                        FinalTotalAmount === 0
                      }
                      // disabled={
                      //   customerRewardsPoints === 0 ||
                      //   !manualTextinputValue ||
                      //   manualTextinputValue === null ||
                      //   manualTextinputValue === ""

                      // }
                    >
                      <View
                        style={{
                          padding: 6,
                          backgroundColor:
                            customerRewardsPoints === 0 ||
                            !manualTextinputValue ||
                            FinalTotalAmount === 0 ||
                            FinalTotalAmount === 0.0
                              ? "gray"
                              : "#55BCF6",
                          // backgroundColor:
                          //   customerRewardsPoints === 0 ||
                          //   !manualTextinputValue

                          //     ? "gray"
                          //     : "#55BCF6",

                          borderRadius: 5,
                          //top: 15,

                          opacity: 0.8,
                          width: 75,
                        }}
                      >
                        <Text
                          style={{
                            textAlign: "center",
                            fontFamily: "nunito-bold",
                          }}
                        >
                          Manual
                        </Text>
                      </View>
                    </TouchableOpacity>

                    <View
                      style={{
                        flexDirection: "row",
                        borderBottomColor: "black",
                        borderBottomWidth: 1,
                        paddingBottom: 0,

                        width: 80,
                        //marginTop: 10,  onChangeText={(text) => setinput_SwapWithReservation(text)}
                        marginLeft: 20,
                        alignContent: "center",
                      }}
                    >
                      <TextInput
                        placeholder="Enter amount"
                        style={[
                          globalStyles.login_Email_textInput,
                          {
                            fontSize: 15,
                            textAlignVertical: "center",
                            textAlign: "center",
                            width: 80,
                          },
                        ]}
                        onChangeText={(text) => {
                          setmanualTextinputValue(text.replace(/[^0-9]/g, ""));

                          setUseAllIsDisable(true);
                          if (text === "") {
                            setUseAllIsDisable(false);
                          } else {
                            setUseAllIsDisable(true);
                          }
                        }}
                        // onChangeText={onChangeText}
                        keyboardType="numeric"
                        value={manualTextinputValue}
                        editable={
                          customerRewardsPoints != 0 ||
                          passedTotalAmount_RewardModal != 0.0
                        }
                        // editable={
                        //   customerRewardsPoints != 0

                        // }
                      />
                    </View>
                  </View>
                </View>

               <View style={StylesRewardsPoints.viewPoints}>
                  <Text style={{ fontSize: 33, textAlign: "center", top: 10 }}>
                    {customerRewardsPoints || 0}
                  </Text>
                </View>
             
             
              </View>
              <View
                  style={{
                    backgroundColor: "transparent",
                    top: 20,
                    padding: 8,
                    flexDirection: "row-reverse",
                  }}
                >
                  <Text style={{ fontSize: 18, fontFamily: "nunito-semibold" }}>
                    Total Amount - ₱
                    {parseFloat(FinalTotalAmount).toFixed(2) || 0}

                  </Text>
                </View>
                  {/* code for new mode of payment */}
          {showviewmodeofpayment && (
            <View style={StylesRewardsPoints.viewForModeofPayment}>
              <Text
                style={{
                  fontSize: 17,
                  fontFamily: "nunito-semibold",
                  marginLeft: 5,
                }}
              >
                Mode of payment
              </Text>
              {receiverModeOfPayment &&
                receiverModeOfPayment.map((item) => {
                  const isChecked = item.key === checkedItemKey_newpaymentMethod;
                  const isCODDisabled =
                    selectedOrdertype === "PickUp" &&
                    item.label === "CashOnDelivery";
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
                        width: 110,

                        justifyContent: "center",
                        marginLeft: -95,
                        marginRight: 110,
                        // elevation: 2,
                        alignItems: "center",
                      }}
                    >
                      <TouchableOpacity
                        onPress={() => {
                          handleItemchecked_newpaymentMethod(item);
                          setselectedNewPaymentMethod(item.value);
                          setCheckedItemKey_newpaymentMethod(item.key);
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
                            //borderColor:selectedOrdertype==="PickUp"? "gray" : "black",
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
                          // color: "black",
                        }}
                      >
                        {item.label}
                      </Text>
                    </View>
                  );
                })}
            </View>
          )}
            </View>
          </View>
        </View>
      </Modal>
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
        <View
          style={{
            backgroundColor: "transparent",
            height: responsiveHeight(85),
            top: 0,
          }}
        >
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
              backgroundColor: "transparent",
              width: "95%",
              marginLeft: 10,
              marginTop: 15,
              height: responsiveHeight(72),
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
              <View
                style={{
                  flexDirection: "row",
                  marginTop: responsiveHeight(5),
                  width: responsiveWidth(85),
                  height: responsiveHeight(5),
                  marginLeft: responsiveWidth(-20),
                }}
              >
                {newOrder_Type &&
                  newOrder_Type.map((item) => {
                    const isChecked = item.key === checkedItemKey_orderType;

                    return (
                      <View
                        key={item.key}
                        style={{
                          // backgroundColor: "green",
                          // marginTop: 2,
                          height: 25,
                          borderRadius: 5,
                          padding: 0,
                          flexDirection: "row",
                          width: responsiveWidth(30),

                          justifyContent: "center",
                          //marginLeft: responsiveWidth(-19),
                          marginRight: responsiveWidth(1),
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
            </View>

            {/* view for Delivery type */}
            <View style={styles.ViewforDelivery}>
              <Text
                style={{
                  fontSize: 17,
                  fontFamily: "nunito-semibold",
                  marginLeft: 5,
                  // bottom:responsiveHeight(0.5)
                }}
              >
                Delivery Type
              </Text>
              <View
                style={{
                  //backgroundColor: "red",
                  flexDirection: "row",
                  marginTop: responsiveHeight(5),
                  width: responsiveWidth(85),
                  height: responsiveHeight(5),
                  marginLeft: responsiveWidth(-20),
                }}
              >
                {deliveryTypes &&
                  deliveryTypes.map((item) => {
                    const isChecked = item.key === checkedItemKey_deliveryType;
                    const isExpressDisabled =
                      selectedOrdertype === "PickUp" &&
                      item.label === "Express";
                    return (
                      <View
                        key={item.key}
                        style={{
                          // backgroundColor: "red",
                          //marginTop: 35,
                          height: 25,
                          borderRadius: 5,
                          padding: 0,
                          flexDirection: "row",
                          // width: 100,

                          justifyContent: "center",
                          // marginLeft: -85,
                          //marginRight: 80,
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
            </View>

            {/* View for payment */}
            <View style={styles.viewForModeofPayment}>
              <Text
                style={{
                  fontSize: 17,
                  fontFamily: "nunito-semibold",
                  marginLeft: 8,
                  top: "2%",
                }}
              >
                Mode of Payment
              </Text>

              <View
                style={{
                  // backgroundColor: "green",
                  flexDirection: "row",
                  marginTop: responsiveHeight(5),
                  width: responsiveWidth(100),
                  height: responsiveHeight(5),
                  marginLeft: responsiveWidth(-28),
                }}
              >
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
                          //  backgroundColor: "red",
                          //marginTop: 35,
                          height: 25,
                          borderRadius: 5,
                          padding: 0,
                          flexDirection: "row",
                          width: responsiveWidth(40),

                          //justifyContent: "center",
                          // marginLeft: -90,
                          // marginRight: 95,
                          // elevation: 2,
                          marginLeft: responsiveWidth(0),
                          marginRight: responsiveWidth(-16),
                          alignItems: "center",
                        }}
                      >
                        <TouchableOpacity
                          onPress={() => {
                            handleItemchecked_paymentMethod(item);
                            setselectedPaymentMethod(item.value);
                            setCheckedItemKey_paymentMethod(item.key);
                            console.log(
                              "payment clicked Value -->",
                              item.value
                            );
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
                              // borderColor:"black"
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
                            //color:"black"
                          }}
                        >
                          {item.label}
                        </Text>
                      </View>
                    );
                  })}
              </View>
            </View>

            {/* view for reservation Date */}
            <View style={styles.viewReservationdate}>
              <Text
                style={{
                  fontSize: 17,
                  fontFamily: "nunito-semibold",
                  marginLeft: 0,
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
                  // console.log(
                  //   "line 2638 cart screen",
                  //   parseFloat(passedTotalAmount)
                  // );
                  console.log(
                    "Cart screen-->Total Final Amount send to New delivery address",
                    FinalTotalAmount
                  );
                  navigation.navigate("NewDeliveryAdd", {
                    adminLatt,
                    adminLong,
                    deliveyfeeValue,
                    passedStationName,
                    selectedItem,
                    extractedDatas,
                    // passedTotalAmount:
                    //   parseFloat(passedTotalAmount) || FinalTotalAmount,
                    FinalTotalAmount,
                    rewardScreenNewModeOfPayment,
                    selectedpaymenthod,
                    selectedReserveDeliveryType,
                    selectedDeliveryType,
                    paramnewDeliveryDetails,
                    totalQuantity,
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
                    top: "2%",
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

            {/* vehicle fee */}
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
                Vehicle Fee- ₱ {(vehicleFeeSaveToDb && vehicleFeeSaveToDb) || 0}
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
                Sub Total - ₱ {(totalAmount && totalAmount) || 0}
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
                  backgroundColor: "transparent",
                  marginTop: 30,
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
                        { left: -8, bottom: "5%" },
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
  rewardsModalTitle: {
    justifyContent: "flex-start",
    padding: 0,
    flexDirection: "row",
    marginLeft: 5,
    padding: 4,
  },
  rewardsModal: {
    width: responsiveWidth(95),
    height: responsiveHeight(80),
    backgroundColor: "white",
    borderBottomColor: "gray",
    borderBottomWidth: 1,
    borderRadius: 3,
    elevation: 10,
    marginBottom: 50,
  },
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
    width: responsiveWidth(85),
    height: responsiveHeight(55),
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
    width: responsiveWidth(40),
    height: responsiveHeight(4),
    padding: 2,
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
    width: responsiveWidth(40),
    height: responsiveHeight(4),
    padding: 2,
    borderRadius: 8,
    marginTop: "12%",
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
    width: responsiveWidth(33),
    height: 30,
    padding: 2,
    borderRadius: 8,
    marginTop: "12%",
    elevation: 3,
    flexDirection: "row",
    //marginRight:5,
    //justifyContent:'space-between',
    // width: responsiveWidth(28),
    height: responsiveHeight(4),
  },
  viewOrderType: {
    backgroundColor: "white",
    width: responsiveWidth(28),
    height: responsiveHeight(5),
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
