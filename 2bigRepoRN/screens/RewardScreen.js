import {
  Image,
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  Alert,
  ToastAndroid,
} from "react-native";

import React, { useEffect, useState, useLayoutEffect } from "react";
import { useRoute } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";
import { AntDesign } from "@expo/vector-icons";
import { db } from "../firebaseConfig";
import { Feather } from "@expo/vector-icons";
import {
  ref,
  onValue,
  query,
  orderByChild,
  equalTo,
  get,
  update,
  set,
  child,
} from "firebase/database";
import moment from "moment";
import {
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import { globalStyles } from "../ForStyle/GlobalStyles";
import * as ImagePicker from "expo-image-picker";
import _, { truncate } from "lodash";
export default function RewardScreen({ navigation }) {
  const route = useRoute();

  const {
    gcashNumber,
    passedStationName,
    extractedDatas,
    rewardsData,
    secondItem,
    customerData,
    FinalTotalAmount,
    selectedItem,
    paymentMethods,
    selectedOrdertype
  } = route.params ?? {
    passedStationName: null,
  };
  //  console.log("Mode of payment receiving",selectedOrdertype
  //  )

  // setreceiverModeOfPayment(updatedPaymentMethods);
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
  // console.log("50", typeof receiverModeOfPayment, receiverModeOfPayment);
  // console.log("51",typeof paymentMethods,paymentMethods);
  const selectedStationID = extractedDatas.adminProperties.adminID;
  const [customerRewardsPoints, setcustomerRewardsPoints] = useState(0); //object
  const [passedTotalAmount, setpassedTotalAmount] = useState(
    FinalTotalAmount || 0
  );
  const [actionHasBeenTaken, setActionHasBeenTaken] = useState(false); //flag to track if user click something in this codes
  //Extract the necessary information from the selectedItem prop

  // console.log("line 74",offerType, other_productSize,other_productUnit);

  // console.log("line 60",typeof passedTotalAmount, passedTotalAmount);
  // const customerPoints = customerData && customerData.length > 0 && customerData[0].walletPoints;
  // console.log("line 62", selectedItem);
  const [customerID, setcustomerID] = useState();
  useEffect(() => {
    if (customerData) {
      const customerId = customerData.cusId;
      setcustomerID(customerId);
    }
  }, [customerData, newcustomerData, customerRewardsPoints, customerID]);

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
  //Get the promo_offered collection in database
  // useLayoutEffect(() => {
  //   const promoOfferedRef = ref(db, "PROMO_OFFERED/");
  //   const promoOfferedQuery = query(
  //     promoOfferedRef,
  //     orderByChild("adminId"),
  //     equalTo(selectedStationID)
  //   );
  //   onValue(promoOfferedQuery, (snapshot) => {
  //     const data = snapshot.val();
  //     if (data) {
  //       const promoOfferedInfo = Object.keys(data).map((key) => ({
  //         id: key,
  //        // isExpired: moment(data[key].promoExpirationTo, "yyyy-MM-dd") < moment(),
  //         ...data[key],
  //       }));
  //       promoOfferedInfo.forEach((promo) => {
  //         promo.promoExpirationTo = moment(
  //           new Date(promo.promoExpirationTo),
  //           "yyyy-MM-dd"
  //         ).format("MM-DD-yyyy");
          
  //       });

    
  //       setpromoOffered(promoOfferedInfo);
  //      // console.log("Reward SCREEN---tst", promoOfferedInfo);
  //       const couponAdminID =
  //         promoOfferedInfo && Object.values(promoOfferedInfo)[0].adminId;
  //       //console.log("Admin ID",couponAdminID);
  //       setcouponAdminID(couponAdminID);
  //     }
  //   });
  // }, [selectedStationID]);
  useLayoutEffect(() => {
    const promoOfferedRef = ref(db, "DISCOUNTCOUPON/");
    const promoOfferedQuery = query(
      promoOfferedRef,
      orderByChild("adminId"),
      equalTo(selectedStationID)
    );
    onValue(promoOfferedQuery, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const promoOfferedInfo = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
  
        // check and set expired coupons
        const currentDate = moment();
        const promoOfferedWithExpiration = promoOfferedInfo.map((promo) => {
          const expirationDate = moment(promo.couponExpirationTo, "yyyy-MM-DDTHH:mm:ssZ");
          const isExpired = expirationDate < currentDate;
          const disabled = isExpired || expirationDate.isSame(currentDate, 'day');
          return {
            ...promo,
            isExpired,
            disabled,
            couponExpirationTo: expirationDate.format("MM-DD-yyyy"),
          };
        });
       // console.log("line 163", promoOfferedWithExpiration);
        setpromoOffered(promoOfferedWithExpiration);
        const couponAdminID =
          promoOfferedWithExpiration && promoOfferedWithExpiration[0]?.adminId;
        setcouponAdminID(couponAdminID);
      }
    });
  }, [selectedStationID]);
  
  
  const [promoOffered, setpromoOffered] = useState();
  const [couponAdminID, setcouponAdminID] = useState();
  const [currentDate, setCurrentDate] = useState("");

  //textinput of the manual option
  const [showManualTextInput, setshowManualTextInput] = useState(false);
  const [manualTextinputValue, setmanualTextinputValue] = useState("");

  // console.log("line 192",manualTextinputValue)
  // console.log("line 192", typeof manualTextinputValue)
  const [autoUsePoints, setAutoUsePoints] = useState(false);

  //auto use of the points
  const handleAutoUse = () => {
    // if (selectedStationID != couponAdminID) {
    //   Alert.alert(
    //     "Warning",
    //     "You can't use your point earned from another station."
    //   );
    // } else 
      if (parseFloat(passedTotalAmount) < parseFloat(customerRewardsPoints)) {
        //console.log("98",  parseFloat(FinalTotalAmount) );
        // console.log("99",parseFloat(customerRewardsPoints))
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
          logsPerformed: actionTaken,
          pointsDeductted: FinalTotalAmount,
          btnClick: btnClick,
        })
          .then(async () => {
            // console.log('Test if Save to db-----'+reservationDate );
            ToastAndroid.show("Points successfully used.", ToastAndroid.LONG);
            setActionHasBeenTaken(false);
            setpassedTotalAmount(0);
            console.log(
              "Reward screen --->New UserLog with the User ID of--->",
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
          parseFloat(passedTotalAmount) - customerRewardsPoints;
          console.log("Deducted Amount is ",deductedAmount);
        //const roundedPoints = (0).toFixed(2); // round to 2 decimal places
        //setcustomerRewardsPoints(roundedPoints);
        ToastAndroid.show("Points successfully used.", ToastAndroid.LONG);
        setpassedTotalAmount(deductedAmount.toFixed(2));

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
          logsPerformed: actionTaken,
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
  const [useAllIsDisable, setUseAllIsDisable] = useState(false);
  const [deductedPoints, setDeductedPoints] = useState(0);

  //function to deduct manually
  const manualPointsDeduct = () => {

      //if ang ge enter na value is greater than sa customer pts
    if (
        parseFloat(manualTextinputValue) > parseFloat(customerRewardsPoints)
      ) {
        Alert.alert("Warning", `Insufficient points balance.`);
        setActionHasBeenTaken(true);
      } else {
        console.log("Input value for manual is ", manualTextinputValue);
        console.log("Final total is", FinalTotalAmount);
        const deductedAmount =
          parseFloat(passedTotalAmount) - parseFloat(manualTextinputValue);
        //const deductedAmount =
        //parseFloat(FinalTotalAmount) + parseFloat(manualTextinputValue);

        console.log("manual. remaining balance is ", deductedAmount);
        ToastAndroid.show("Points successfully used.", ToastAndroid.LONG);
        setpassedTotalAmount(deductedAmount);

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
              console.log("--->Customer points updated successfully!");
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
          logsPerformed: actionTaken,
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

  //get the customer collection
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

          setnewcustomerData(newCustomerInfo);
        }
      });
    }
  }, [customerID]);

  const [newcustomerData, setnewcustomerData] = useState();

  const [couponUsedDisable, setcouponUsedDisable] = useState(false);
  //console.log(" 375", couponUsedDisable);
  //function to use the coupon then subtract to the final total

  const [CustomerLogsCounts, setCustomerLogsCounts] = useState();
  // setCouponId(couponID);
  const [passedCouponId, setCouponId] = useState();

  const couponUseFunction = (item) => {
    //extract the selectedItem properties

    const [{ offerType, other_productSize, other_productUnit }] = selectedItem;
    const {
      promoAppliedToProductOffers,
      promoAppliedTo_otherProductUnitSizes,
      promoAppliedTo_productRefillUnitSizes,
      promoName,
      promoDiscountValue,
    } = item;

    const productOffers = promoAppliedToProductOffers
      .split(",")
      .map((s) => s.trim());
    const otherProductUnitSizes = promoAppliedTo_otherProductUnitSizes
      .split(",")
      .map((s) => s.trim());
    const productRefillUnitSizes = promoAppliedTo_productRefillUnitSizes
      .split(",")
      .map((s) => s.trim());

    const couponID = item.promoId; //ID of the coupon
    setCouponId(couponID);
    const couponUsed = "alreadyUsed"; //track if the coupon is used or not
    const customerPointsRef = ref(db, `CUSTOMER/${customerID}`); //get the db reference
    const discountCouponValue = promoOffered[0].promoDiscountValue;
    const pointsToRequired = promoOffered[0].promoPointsRequiredToClaim;

    console.log("line 430", productOffers);
    //     if(productOffers[0] || productOffers[1]!==offerType || otherProductUnitSizes[0]||otherProductUnitSizes[0]!==other_productSize&& other_productUnit ){
    // Alert.alert()
    //     }

    // check if coupon is already used
    // Retrieve customer logs for the specific coupon ID
    // console.log("couponId", couponID);
    const customerLogRef = ref(db, "CUSTOMERSLOG/");
    //  console.log("inside this effect",customerID)
    const customerQuery = query(
      customerLogRef,
      orderByChild("couponId"),
      equalTo(couponID)
    );

    get(customerQuery).then((snapshot) => {
      const logs = snapshot.val() || {};
      const logsCount = Object.keys(logs).length;
      setCustomerLogsCounts(logs);
      // If no logs found, proceed to use the coupon
      console.log("Logs test", logs);

      if (
        logsCount > 0 &&
        Object.values(logs)[0].useCoupon === couponUsed &&
        Object.values(logs)[0].couponId === couponID
      ) {
        setcouponUsedDisable(true);
        console.log("You have already used this coupon");
        Alert.alert("Warning", "You have already used this coupon.");
      } else {
        const remainingCustomerPoints =
          parseFloat(customerRewardsPoints) - parseFloat(pointsToRequired);
        console.log("Remain points", remainingCustomerPoints);
        const deductionAmount = (passedTotalAmount * discountCouponValue) / 100; // subtracted amount
        const newTotalAmount = passedTotalAmount - deductionAmount; // new total amount
        console.log("Deducted amount:", deductionAmount);
        console.log("New total amount:", newTotalAmount);

        ToastAndroid.show(
          "You successfully used this coupon.",
          ToastAndroid.LONG
        );
        setpassedTotalAmount(newTotalAmount.toFixed(2));
        Alert.alert(
          "Warning",
          `You have balance of ₱${newTotalAmount.toFixed(
            2
          )}.  Please choose an alternative mode of payment on the cart screen.`,
          [
            {
              text: "Okay",
              onPress: () => {
                setcouponUsedDisable(true);
                setShowviewmodeofpayment(true);
                setActionHasBeenTaken(true);
              },
            },
          ]
        );
        //u
        get(customerPointsRef).then((snapshot) => {
          const walletPoints = snapshot.val().walletPoints || 0;
          const updatedPoints = parseFloat(remainingCustomerPoints); // convert deductedAmount to an integer
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
        const couponItem = "useCoupon";
        const actionTaken = "pointsDeducted";
        const userLogRandomId = Math.floor(Math.random() * 50000) + 10000;
        const newUserlogKey = userLogRandomId;
        set(ref(db, `CUSTOMERSLOG/${newUserlogKey}`), {
          //orderID: newOrderKey,
          cusId: customerID,
          couponusedDate: currentDate,
          logsPerformed: actionTaken,
          pointsDeducted: pointsToRequired,
          couponItemClick: couponItem,
          couponId: couponID,
          useCoupon: couponUsed,
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
    });
  };

  //track every mount that the coupon item is already use or not
  useEffect(() => {
    if (customerID) {
      const customerLogRef = ref(db, "CUSTOMERSLOG/");
      const customerQuery = query(
        customerLogRef,
        orderByChild("cusId"),
        equalTo(customerID)
      );
      onValue(customerQuery, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const newCustomerInfo = Object.keys(data).map((key) => ({
            id: key,

            ...data[key],
          }));
          //console.log("line 553",newCustomerInfo);
          // Loop through the newCustomerInfo array and check if any items have useCoupon: alreadyUsed and couponId: 3635

          const useCouponData = newCustomerInfo.find(
            (item) => item.useCoupon === "alreadyUsed"
          );
          if (useCouponData) {
            setcouponUsedDisable(true);
          }
          // console.log("line 563",useCouponData);
          // const customer = newCustomerInfo[0];
          // const walletPoints = customer.walletPoints;
          // Update the state with the new wallet points
          // setcustomerRewardsPoints(walletPoints);

          // setnewcustomerData(newCustomerInfo);
        }
      });
    }
  }, [customerID]);

  //code for the handle checkbox of new mode of payment

  const [selectedpaymenthod, setselectedPaymentMethod] = useState();
  // console.log("line 526",selectedpaymenthod);
  const [checkedItemKey_paymentMethod, setCheckedItemKey_paymentMethod] =
    useState(null);
  const handleItemchecked_paymentMethod = (item) => {
    setCheckedItemKey_paymentMethod(
      item.key === checkedItemKey_paymentMethod ? null : item.key
    );
    if (item.value === "CashOnDelivery") {
      console.log("COD");
      // if (selectedOrdertype === "PickUp") {
      //   Alert.alert("To our beloved customer", "COD is only for delivery.");
      // }
    } else {
      console.log("GCASH");
      // setShowModal_ModeOfPayment(true);
    }
  };

  //when press back to the previous screen
  const onPresshandler_toStationPage = () => {
    if (!actionHasBeenTaken) {
      navigation.navigate("CartScreen", {
        passedTotalAmount: passedTotalAmount,
        passedStationName,
        secondItem,
        extractedDatas,
        customerData,
        selectedItem,
        rewardScreenNewModeOfPayment: selectedpaymenthod || null,
      });
    } else if (checkedItemKey_paymentMethod === null) {
      Alert.alert(
        "Warning",
        `You have a balanced of ₱${passedTotalAmount}. Please choose an alternative mode of payment below.`,
        [
          {
            text: "Okay",
            onPress: () => {
              setShowviewmodeofpayment(true);
            },
          },
        ]
      );
    } else {
      navigation.navigate("CartScreen", {
        passedTotalAmount: passedTotalAmount.toFixed(2),
        passedStationName,
        secondItem,
        extractedDatas,
        customerData,
        selectedItem,
        rewardScreenNewModeOfPayment: selectedpaymenthod || null,
      });
    }
    // if (checkedItemKey_paymentMethod === null) {
    //   console.log("line 75 selectedpaymenthod is null");
    //   Alert.alert(
    //     "Warning",
    //     `You have a balanced of ₱${passedTotalAmount}. Please choose an alternative mode of payment below.`,[{
    //       text:"Okay",
    //       onPress:()=>{
    //         setShowviewmodeofpayment(true);
    //       }
    //     }]
    //   );
    // } else {
    //   navigation.navigate("CartScreen", {
    //     passedTotalAmount: passedTotalAmount,
    //     passedStationName,
    //     secondItem,
    //     extractedDatas,
    //     customerData,
    //     selectedItem,
    //     rewardScreenNewModeOfPayment: selectedpaymenthod || null,
    //   });
    // }
    //  console.log("send 36",secondItem, combinedData);
  };
  return (
    <ScrollView style={{ backgroundColor: "lightcyan" }}>
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
            <Text style={styles.textwatername}>
              {passedStationName}'s Reward
            </Text>
          </View>
        </View>

        <View style={styles.wrapperWaterProduct}>
          <Text style={styles.waterProdStyle}>Current rewards points</Text>
          <View style={styles.pointsItem}>
            <View style={styles.circular}>
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
                  passedTotalAmount === 0
                }
              >
                <View
                  style={{
                    padding: 6,
                    // backgroundColor: "#55BCF6",
                    backgroundColor:
                      customerRewardsPoints === 0 ||
                      useAllIsDisable ||
                      passedTotalAmount === 0
                        ? "gray"
                        : "#55BCF6",
                    borderRadius: 5,
                    top: 1,
                    opacity: 0.8,
                  }}
                >
                  <Text
                    style={{ textAlign: "center", fontFamily: "nunito-bold" }}
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
                    manualTextinputValue === "" || passedTotalAmount===0
                  }
                >
                  <View
                    style={{
                      padding: 6,
                      backgroundColor:
                        customerRewardsPoints === 0 || !manualTextinputValue || passedTotalAmount===0 || passedTotalAmount===0.00
                          ? "gray"
                          : "#55BCF6",

                      borderRadius: 5,
                      //top: 15,

                      opacity: 0.8,
                      width: 75,
                    }}
                  >
                    <Text
                      style={{ textAlign: "center", fontFamily: "nunito-bold" }}
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
                      setmanualTextinputValue(text.replace(/[^0-9]/g,''));
                      
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
                    editable={customerRewardsPoints != 0 || passedTotalAmount!=0.00  }
                  />
                </View>
              </View>
            </View>

            <View style={styles.viewPoints}>
              <Text style={{ fontSize: 33, textAlign: "center", top: 10 }}>
                {customerRewardsPoints|| 0}
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
              Total Amount - ₱{parseFloat(passedTotalAmount).toFixed(2) || 0}
            </Text>
          </View>

          {/* code for new mode of payment */}
          {showviewmodeofpayment && (
            <View style={styles.viewForModeofPayment}>
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
                
                  const isChecked = item.key === checkedItemKey_paymentMethod;
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

          {/* code for coupon/s */}
          <View
            style={{ backgroundColor: "transparent", top: 50, height: 250 }}
          >
            <Text style={styles.waterProdStyle}>Available coupons</Text>
            {/* <ScrollView style={{backgroundColor:'red'}} contentContainerStyle={}> */}

            {promoOffered &&
              promoOffered.map((item) => {
                return (
                  <TouchableOpacity
                    key={item.id}
                    onPress={() => {
                      console.log("Press");
                      couponUseFunction(item);
                    }}
                    // disabled={ couponUsedDisable ||
                    //   item.promoPointsRequiredToClaim <=
                    //     customerRewardsPoints
                    //     ? false
                    //     : true
                    // }
                    disabled={ item.disabled || 
                      passedTotalAmount == 0 ||
                      couponUsedDisable ||
                      item.promoPointsRequiredToClaim > customerRewardsPoints
                    }
                    
                  >
                    <View style={styles.productWrapper} key={item.id}>
                      {/* <View
                        style={[
                          styles.viewWaterItem,
                          {
                            backgroundColor: couponUsedDisable
                              ? "white"
                              : item.promoPointsRequiredToClaim <=
                                customerRewardsPoints
                              ? "#B0DAFF"
                              : "white",
                          },
                        ]}
                      > */}
                      <View
                        style={[
                          styles.viewWaterItem,
                          // {
                          //   backgroundColor:
                          //   passedTotalAmount===0 ||
                          //     item.promoPointsRequiredToClaim <=
                          //     customerRewardsPoints
                          //       ? "#B0DAFF"
                          //       : "white",
                          // },
                          {
                            backgroundColor:item.disabled ? "whitesmoke":
                              passedTotalAmount === 0
                                ? "whitesmoke"
                                : item.promoPointsRequiredToClaim <=
                                  customerRewardsPoints
                                ? "#B0DAFF"
                                : "whitesmoke",
                          },
                          couponUsedDisable && {
                            backgroundColor: "whitesmoke",
                          },
                        ]}
                      >
                        {/* 62CDFF   B0DAFF  BFDCE5*/}
                        <Text style={styles.productNameStyle}>
                          {item.couponName}
                        </Text>
                        <Text
                          style={{
                            fontFamily: "nunito-semibold",
                            fontSize: 15,
                          }}
                        >
                          {item.couponDescription}
                        </Text>

                        <Text
                          style={{
                            fontFamily: "nunito-semibold",
                            fontSize: 15,
                            top:"5%"
                          }}
                        >
                         {item.isExpired ? "This coupon is was expired" : `Valid until ${item.couponExpirationTo}`}
                        </Text>

                        <Text
                          style={{
                            fontFamily: "nunito-semibold",
                            fontSize: 15,
                            top:"5%"
                          }}
                        >
                          Points required {item.couponPointsRequiredToClaim}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
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
  ModinputWrapper: {
    // backgroundColor: "green",
    paddingVertical: 5,
    marginTop: 5,
    height: 120,
    padding: 6,
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
  viewForModeofPayment: {
    backgroundColor: "white",
    width: 140,
    height: 30,
    padding: 6,
    borderRadius: 8,
    marginTop: 30,
    elevation: 3,
    flexDirection: "row",
  },
  modalTitle: {
    justifyContent: "flex-start",
    padding: 0,
    flexDirection: "row",
    marginLeft: 5,
    padding: 4,
  },

 
  circular: {
    width: 75,
    height: 75,
    borderColor: "red",
    //borderWidth: 2,
    //  borderRadius: 5,
  },
  viewPoints: {
    width: 75,
    height: 65,
    // backgroundColor: "red",
    // opacity: 0.4, #55BCF6
    borderRadius: 7,

    borderWidth: 0.5,
    borderColor: "gray",
    //marginBottom:25
  },
  pointsItem: {
    backgroundColor: "white",
    padding: 10,
    borderRadius: 5,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 5,
    elevation: 6,
    top: 10,
    height: 80,
    //justifyContent:'center'
  },
  container: {
    flex: 1,
    backgroundColor: "lightcyan",
    // justifyContent:'center',
    //alignItems:'center'
  },
  viewBackBtn: {
    marginTop: 20,
    marginLeft: 5,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    //height:50
  },
  viewwatername: {
    //backgroundColor: "yellow",
    width: 180,
    justifyContent: "center",
  },
  textwatername: {
    fontSize: 20,
    fontFamily: "nunito-bold",
    fontWeight: "bold",
    // textAlign: "center",
    // backgroundColor:'red',
    width: 180,
    textAlign: "center",
    alignItems: "center",
    right: 10,
    // bottom:20
  },
  wrapperWaterProduct: {
    //backgroundColor: "green",
    height: 550,
    padding: 10,
    width: "95%",
    left: 5,
  },
  waterProdStyle: {
    fontFamily: "nunito-semibold",
    fontSize: 18,
    marginLeft: 0,
    top: 5,
  },
  productWrapper: {
    //backgroundColor: "yellowgreen",
    padding: 5,
    //flex: 1,
    top: 10,
    height: 100,
  },

  storeNameStyles: {
    fontSize: 20,
    fontFamily: "nunito-bold",
  },
  viewWaterItem: {
    padding: 3,
    //marginTop: 25,
    width: responsiveWidth(90),
    height: responsiveHeight(18),
    marginLeft: 0,
    borderRadius: 10,
    marginRight: 5,
    shadowColor: "black",
    shadowRadius: 5,
    shadowOffset: {
      height: 5,
      width: 5,
    },
    elevation: 5,

    //top: 10,
  },
  productNameStyle: {
    fontSize: 20,
    fontFamily: "nunito-semibold",
    marginLeft: 0,
    // textAlign: "center",
  },
});
