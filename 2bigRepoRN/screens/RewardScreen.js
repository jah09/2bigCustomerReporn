import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  Alert,
} from "react-native";

import React, { useEffect, useState, useLayoutEffect } from "react";
import { useRoute } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";
import { AntDesign } from "@expo/vector-icons";
import { db } from "../firebaseConfig";
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
import { globalStyles } from "../ForStyle/GlobalStyles";
export default function RewardScreen({ navigation }) {
  const route = useRoute();

  const {
    passedStationName,
    extractedDatas,
    rewardsData,
    secondItem,
    customerData,
    FinalTotalAmount,
    selectedItem,
  } = route.params ?? {
    passedStationName: null,
  };

  const selectedStationID = extractedDatas.adminProperties.adminID;
  const [customerRewardsPoints, setcustomerRewardsPoints] = useState(0); //object
  const [passedTotalAmount, setpassedTotalAmount] = useState(
    FinalTotalAmount || 0
  );
  //fetch the rewards collection
  const onPresshandler_toStationPage = () => {
    //  console.log("send 36",secondItem, combinedData);
    navigation.navigate("CartScreen", {
      passedTotalAmount: passedTotalAmount.toFixed(2),
      passedStationName,
      secondItem,
      extractedDatas,
      customerData,
      selectedItem,
    });
  };
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
  useLayoutEffect(() => {
    const promoOfferedRef = ref(db, "PROMO_OFFERED/");
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
        promoOfferedInfo.forEach((promo) => {
          promo.promoExpirationTo = moment(
            new Date(promo.promoExpirationTo),
            "yyyy-MM-dd"
          ).format("MM-DD-yyyy");
        });

        {
          /*
       rewardsInfo.forEach((reward) => {
        reward.promoExpirationTo = moment(
          new Date(reward.promoExpirationTo),
          "yyyy-MM-dd"
        ).format("MM-DD-yyyy");
      });
     */
        }
        // console.log("line 43", rewardsInfo);
        setpromoOffered(promoOfferedInfo);
        // console.log("PRODUCT SCREEN---tst", promoOfferedInfo);
        const couponAdminID =
          promoOfferedInfo && Object.values(promoOfferedInfo)[0].adminId;
        //console.log("Admin ID",couponAdminID);
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

  const [autoUsePoints, setAutoUsePoints] = useState(false);
  const handleAutoUse = () => {
    if (selectedStationID != couponAdminID) {
      Alert.alert(
        "Warning",
        "You can't use your point earned from another station."
      );
    } else {
      if (parseFloat(passedTotalAmount) < parseFloat(customerRewardsPoints)) {
        //console.log("98",  parseFloat(FinalTotalAmount) );
        // console.log("99",parseFloat(customerRewardsPoints))
        const deductedAmount =
          parseFloat(customerRewardsPoints) - parseFloat(FinalTotalAmount);

        //update the database
        const customerPointsRef = ref(db, `CUSTOMER/${customerID}`); //get the db reference
        // Use the `get` method to retrieve the current walletPoints value
        get(customerPointsRef).then((snapshot) => {
          const walletPoints = snapshot.val().walletPoints || 0;
          const updatedPoints = deductedAmount; // convert deductedAmount to an integer
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
          pointsDeductted: FinalTotalAmount,
          btnClick: btnClick,
        })
          .then(async () => {
            // console.log('Test if Save to db-----'+reservationDate );
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
        setAutoUsePoints(true);
        const deductedAmount =
          parseFloat(passedTotalAmount) - customerRewardsPoints;
        //const roundedPoints = (0).toFixed(2); // round to 2 decimal places
        //setcustomerRewardsPoints(roundedPoints);
        setpassedTotalAmount(deductedAmount);

        Alert.alert(
          "Warning",
          `You have balance of ₱${deductedAmount.toFixed(
            2
          )}.  Please choose an alternative mode of payment on the cart screen.`
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
    }
  };
  const [useAllIsDisable, setUseAllIsDisable] = useState(false);
  const [deductedPoints, setDeductedPoints] = useState(0);
  //function to deduct manually
  const manualPointsDeduct = () => {
    if (selectedStationID != couponAdminID) {
      Alert.alert(
        "Warning",
        "You can't use your point earned from another station."
      );
    } else {
      //if ang ge enter na value is greater than sa customer pts
      if (
        parseFloat(manualTextinputValue) > parseFloat(customerRewardsPoints)
      ) {
        Alert.alert("Warning", `Insufficient points balance.`);
      } else {
        console.log("Input value for manual is ", manualTextinputValue);
        console.log("Final total is", FinalTotalAmount);
        const deductedAmount =
          parseFloat(passedTotalAmount) - parseFloat(manualTextinputValue);
        //const deductedAmount =
        //parseFloat(FinalTotalAmount) + parseFloat(manualTextinputValue);

        console.log("manual. remaining balance is ", deductedAmount);

        setpassedTotalAmount(deductedAmount);

        Alert.alert(
          "Warning",
          `You have balance of ₱${deductedAmount.toFixed(
            2
          )}.  Please choose an alternative mode of payment on the cart screen.`,
          [
            {
              text: "Okay",
              onPress: () => {
                setUseAllIsDisable(false);
                setmanualTextinputValue("");
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
          orderDate: currentDate,
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

  const [couponUsedDisable, setcouponUsedDisable] = useState(true);
  //function to use the coupon then subtract to the final total amount
  const couponUseFunction = (item) => {
    const couponID = item.promoId; //ID of the coupon
    const couponUsed = "alreadyUsed"; //track if the coupon is used or not
    const customerPointsRef = ref(db, `CUSTOMER/${customerID}`); //get the db reference
    const discountCouponValue = promoOffered[0].promoDiscountValue;
    const pointsToRequired = promoOffered[0].promoPointsRequiredToClaim;
    console.log("selected ID", selectedStationID);
    console.log("couponAdminID ID", couponAdminID);
    if (selectedStationID != couponAdminID) {
      Alert.alert("Warning", "This station is not offering a reward system.");
    } else {
      //check if the coupon is used or not
      //retrieve customer logs

      // check if coupon is already used
      // Retrieve customer logs for the specific coupon ID
      console.log("couponId", couponID);
      const customerLogRef = ref(db, "CUSTOMERSLOGTEST/");
      //  console.log("inside this effect",customerID)
      const customerQuery = query(
        customerLogRef,
        orderByChild("couponId"),
        equalTo(couponID)
      );

      get(customerQuery).then((snapshot) => {
        const logs = snapshot.val() || {};
        const logsCount = Object.keys(logs).length;
        // If no logs found, proceed to use the coupon
        console.log("Logs test", logs);

        if (
          logsCount > 0 &&
          Object.values(logs)[0].useCoupon === couponUsed &&
          Object.values(logs)[0].couponId === couponID
        ) {
          Alert.alert("Warning", "You have already used this coupon.");
         // setcouponUsedDisable(true);
        } else {
          const remainingCustomerPoints =
            parseFloat(customerRewardsPoints) - parseFloat(pointsToRequired);
          console.log("Remain points", remainingCustomerPoints);
          const deductionAmount =
            (passedTotalAmount * discountCouponValue) / 100; // subtracted amount
          const newTotalAmount = passedTotalAmount - deductionAmount; // new total amount
          console.log("Deducted amount:", deductionAmount);
          console.log("New total amount:", newTotalAmount);
          setpassedTotalAmount(newTotalAmount);
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
          set(ref(db, `CUSTOMERSLOGTEST/${newUserlogKey}`), {
            //orderID: newOrderKey,
            cusId: customerID,
            orderDate: currentDate,
            logsPerformed: actionTaken,
            pointsDeductted: pointsToRequired,
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
    }
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
                    manualTextinputValue === ""
                  }
                >
                  <View
                    style={{
                      padding: 6,
                      backgroundColor:
                        customerRewardsPoints === 0 || !manualTextinputValue
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
                      setmanualTextinputValue(parseFloat(text));
                      setUseAllIsDisable(true);
                      if (text === "") {
                        setUseAllIsDisable(false);
                      } else {
                        setUseAllIsDisable(true);
                      }
                    }}
                    keyboardType="numeric"
                    value={manualTextinputValue}
                    editable={customerRewardsPoints != 0}
                  />
                </View>
              </View>
            </View>

            <View style={styles.viewPoints}>
              <Text style={{ fontSize: 33, textAlign: "center", top: 10 }}>
                {customerRewardsPoints}
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
          <View
            style={{ backgroundColor: "transparent", top: 30, height: 250 }}
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
                    disabled={
                      item.promoPointsRequiredToClaim <=
                        customerRewardsPoints 
                        ? false
                        : true
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
                          {
                            backgroundColor:
                              item.promoPointsRequiredToClaim <=
                              customerRewardsPoints ||couponUsedDisable
                                ? "#B0DAFF"
                                : "white",
                          },
                        ]}
                      >
                        {/* 62CDFF   B0DAFF  BFDCE5*/}
                        <Text style={styles.productNameStyle}>
                          {item.promoName}
                        </Text>
                        <Text
                          style={{
                            fontFamily: "nunito-semibold",
                            fontSize: 15,
                          }}
                        >
                          {item.promoDescription}
                        </Text>

                        <Text
                          style={{
                            fontFamily: "nunito-semibold",
                            fontSize: 15,
                          }}
                        >
                          Valid until {item.promoExpirationTo}
                        </Text>

                        <Text
                          style={{
                            fontFamily: "nunito-semibold",
                            fontSize: 15,
                          }}
                        >
                          Points required {item.promoPointsRequiredToClaim}
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
  modalTitle: {
    justifyContent: "flex-start",
    padding: 0,
    flexDirection: "row",
    marginLeft: 5,
    padding: 4,
  },

  manualModal: {
    width: 300,
    height: 250,
    backgroundColor: "white",
    borderBottomColor: "gray",
    borderBottomWidth: 1,
    borderRadius: 3,
    elevation: 10,
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
    elevation: 4,
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
    width: "100%",
    height: 80,
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

    //top: 10,
  },
  productNameStyle: {
    fontSize: 20,
    fontFamily: "nunito-semibold",
    marginLeft: 0,
    // textAlign: "center",
  },
});
