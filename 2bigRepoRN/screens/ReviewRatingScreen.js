import { StyleSheet, Text, View, FlatList, Image } from "react-native";
import { useRoute } from "@react-navigation/native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";
import { FontAwesome } from "@expo/vector-icons";
import React, {
  useState,
  useEffect,
  useLayoutEffect,
  useCallback,
  useMemo,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  ref,
  onValue,
  query,
  orderByChild,
  equalTo,
  get,
  off,
} from "firebase/database";
import { db } from "../firebaseConfig";
export default function ReviewRatingScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { storeName, selectedStationID } = route.params;

  const onPresshandler_toStationPage = () => {
    navigation.goBack();
  };

  //get customer Data
  useEffect(() => {
    AsyncStorage.getItem("customerData") //e get ang Asycn sa login screen
      .then((data) => {
        if (data !== null) {
          //if data is not null
          const parsedData = JSON.parse(data); //then e store ang Data into parsedData
          setCustomerData(parsedData); //passed the parsedData to customerDta

          const CustomerUID = parsedData.cusId;
        }
      })
      .catch((error) => {
        console.log(error);
        alert("Error fetching data: ", error);
      });
  }, []);
  const [customerData, setCustomerData] = useState([]);

  //store rEview collection
  useEffect(() => {
    const storeReviewRef = ref(db, "STOREREVIEW/");
    //console.log("Test",storeReviewRef)
    const storeReviewQuery = query(
      storeReviewRef,
      orderByChild("adminID"),
      equalTo(selectedStationID)
    );

    // Create a debounced callback function that will update the storeRatings state
    //  const debouncedSetStoreRatings = debounce((data) => {
    //   setStoreRatings(data);
    // }, 500);
    //console.log("Test 256",storeReviewRef)
    const listener = onValue(storeReviewQuery, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        let storeReviewInfo = [];
        if (data && Object.keys(data).length > 0) {
          storeReviewInfo = Object.keys(data).map((key) => ({
            id: key,

            ...data[key],
            firstName: customerData.firstName,
            lastName: customerData.lastName,
          }));
        }
        // console.log("line 266",storeReviewInfo)
        //debouncedSetStoreRatings(storeReviewInfo);
        setStoreRatings(storeReviewInfo);
      } else {
        setStoreRatings([]);
        //console.log("No data at the moment- Product refill useEffect")
      }
    });
    // return () => unsubscribe(); // unsubscribe when component unmounts
    // Return a cleanup function that will remove the Firebase listener when the component unmounts
    return () => {
      off(storeReviewQuery, "value", listener);
    };
  }, [selectedStationID, customerData]);
  const [storeRatings, setStoreRatings] = useState({});

  return (
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
        <FlatList
          vertical={true}
          contentContainerStyle={{
            flexDirection: "column",
           // alignItems: "center",
          }}
          showsHorizontalScrollIndicator={false}
          data={storeRatings || null}
          keyExtractor={(item, index) => item.id}
          renderItem={({ item }) => (
            <View style={styles.viewReviewAndRatings} key={item.id}>
              <View style={styles.itemLeft} key={item.id}>
                <View style={styles.square} key={item.id}>
                  <Image
                    source={require("../assets/userIconReview.png")}
                    style={styles.viewImageReview}
                  />
                </View>
                <View style={{ marginTop: 8 }}>
                  <Text style={styles.reviewName}>
                    {item.customerFirstName} {item.customerLastName}
                  </Text>
                  <Text>{item.feedback}</Text>
                  <View
                    style={{
                      flexDirection: "row",
                      marginTop: 5,
                      marginLeft: -2,
                    }}
                  >
                    {Array(item.ratings)
                      .fill()
                      .map((_, i) => (
                        <FontAwesome
                          key={i}
                          name="star"
                          size={14}
                          color="black"
                          style={{ marginRight: 3 }}
                        />
                      ))}
                  </View>
                </View>
              </View>
            </View>
          )}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
    productWrapper: {
        padding: 10,
        flex: 1,
        //marginTop: 20,
        width:"100%",
       // backgroundColor:'yellow'
      },
  reviewName: {
    fontSize: 19,
    fontFamily: "nunito-semibold",
    //backgroundColor:'red'
  },
  viewImageReview: {
    width: 30,
    height: 30,

    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,

    marginLeft: 10,
    marginTop: 7,
    //backgroundColor: "red",
  },
  square: {
    width: 50,
    height: 50,
     //backgroundColor: "red",
    // opacity: 0.4, #55BCF6
    borderRadius: 25,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "darkgray",
    marginLeft: 5,
    marginTop: 5,

    //marginBottom:25
  },
  itemLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  viewReviewAndRatings: {
    backgroundColor: "white",
    padding: 3,
    marginTop: 10,
    marginBottom: 10,
    width: "95%",
    height: 80,
    marginLeft: 7,
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
  viewwatername: {
    //  backgroundColor: "yellow",
    width: 200,
    justifyContent: "center",
  },
  viewBackBtn: {
    marginTop: 20,
    marginLeft: 10,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    // backgroundColor: "green",
  },
  container: {
    flex: 1,
    backgroundColor: "lightcyan",
  },
});
