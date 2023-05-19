import { useState, useEffect, useRef } from "react";
import { Text, View, Platform, StyleSheet } from "react-native";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { db, auth } from "../firebaseConfig";
import { ref, update } from "firebase/database";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Notifications.setNotificationHandler({
//   handleNotification: async () => ({
//     shouldShowAlert: true,
//     shouldPlaySound: false,
//     shouldSetBadge: false,
//   }),
// });

Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    const { data, origin } = notification;
    const Notification = data.screen; // get the screen name from the notification data

    if (origin === "selected") {
      // If the user taps the notification while the app is in foreground
      // navigate to the desired screen
      navigation.navigate(Notification);
    } else {
      // If the app receives a notification while it is in the background or closed,
      // handle the notification as usual
      return {
        shouldShowAlert: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
      };
    }
  },
});
export default function pushNotification() {
  const [expoPushToken, setExpoPushToken] = useState("");
  const [notification, setNotification] = useState(false);
  const notificationListener = useRef();
  const responseListener = useRef();
  const [customerData, setCustomerData] = useState();

  registerForPushNotificationsAsync(customerData, expoPushToken);

  useEffect(() => {
    AsyncStorage.getItem("customerData")
      .then((data) => {
        if (data !== null) {
          setCustomerData(JSON.parse(data));
        }
      })
      .catch((error) => {
        console.log(error);
        alert("Error fetching data: ", error);
      });
  }, []);

  useEffect(() => {
    registerForPushNotificationsAsync().then((token) =>
      setExpoPushToken(token)
    );

    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        setNotification(notification);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log(response);
      });

    return () => {
      Notifications.removeNotificationSubscription(
        notificationListener.current
      );
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  return <View />;
}

async function registerForPushNotificationsAsync(customerData, expoPushToken) {
  let token;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      alert("Failed to get push token for push notification!");
      return;
    }
    token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log(token);
    // Update the user's token in the database
    const user = auth.currentUser;

    if (user && customerData && customerData.cusId) {
      console.log("Hey expoPushToken:", expoPushToken);
      const customerRef = ref(db, `CUSTOMER/${customerData.cusId}`);
      console.log("line 92", customerData.cusId);
      update(customerRef, {
        deviceToken: expoPushToken,
      })
        .then(() => {
          // alert("Profile Updated Succesfully");
        })
        .catch((error) => {
          console.log(error);
          alert("Error updating customer data: ", error);
        });
    }
  } else {
    alert("Must use physical device for Push Notifications");
  }

  return token;
}
