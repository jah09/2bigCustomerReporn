// import { useEffect, useState, useContext } from "react";
// import {
//   StyleSheet,
//   Text,
//   View,
//   TouchableOpacity,
//   Image,
//   SafeAreaView,
//   ScrollView,
// } from "react-native";
// import { db } from "../firebaseConfig";
// import {
//   ref,
//   query,
//   orderByChild,
//   equalTo,
//   onValue,
//   update,
// } from "firebase/database";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { useNavigation } from "@react-navigation/native";
// import { Fontisto } from "@expo/vector-icons";
// import moment from "moment";
// import { NotificationContext } from "../shared/NotificationContext";

// export default function NotificationScreen() {
//   const [notifications, setNotifications] = useState([]);
//   console.log("NOTIFICATIONS:", notifications);
//   const [readNotifications, setReadNotifications] = useState([]);
//   const [currentTime, setCurrentTime] = useState(new Date());
//   const { unreadCount, updateUnreadCount } = useContext(NotificationContext);
//   const [scheduledNotification, setScheduledNotification] = useState(null);
//   console.log("SCHEDDDDDDD:", scheduledNotification);
//   const navigation = useNavigation();

//   useEffect(() => {
//     async function fetchNotifications() {
//       const customerData = JSON.parse(
//         await AsyncStorage.getItem("customerData")
//       );
//       if (customerData) {
//         const customerId = customerData.cusId;
//         const notificationsRef = ref(db, "NOTIFICATION/");
//         const notificationsQuery = query(
//           notificationsRef,
//           orderByChild("cusId"),
//           equalTo(customerId)
//         );
//         onValue(
//           notificationsQuery,
//           (snapshot) => {
//             if (snapshot.exists()) {
//               const data = snapshot.val();

//               // Format the notifications data
//               const formattedNotifications = Object.keys(data)
//                 .map((key) => {
//                   const notification = {
//                     id: key,
//                     ...data[key],
//                   };

//                   // Conditionally format scheduledSent if it has a non-default value
//                   if (notification.scheduledSent !== "0001-01-01T00:00:00") {
//                     const scheduledSentDate = new Date(
//                       notification.scheduledSent
//                     );
//                     notification.scheduledSent = scheduledSentDate;
//                   }
//                   return notification;
//                 })
//                 .filter((notification) => notification.receiver === "Customer");

//               setNotifications(formattedNotifications);

//               setReadNotifications(
//                 formattedNotifications.filter(
//                   (notification) => notification.status === "read"
//                 )
//               );
//               const unreadNotifications = formattedNotifications.filter(
//                 (notification) => notification.status === "unread"
//               );
//               updateUnreadCount(unreadNotifications.length);

//              // Initialize a variable to store the matched scheduled notification
// let matchedScheduledNotification = null;

// // Check for notifications that match the current date and time
// formattedNotifications.forEach((notification) => {
//   if (notification.scheduledSent instanceof Date) {
//     const scheduledSentDate = notification.scheduledSent;
//     const currentTime = new Date();

//     if (
//       scheduledSentDate.getFullYear() === currentTime.getFullYear() &&
//       scheduledSentDate.getMonth() === currentTime.getMonth() &&
//       scheduledSentDate.getDate() === currentTime.getDate()
//     ) {
//       matchedScheduledNotification = notification;
//     }
//   }
// });

// // Set the scheduled notification
// setScheduledNotification(matchedScheduledNotification);

              
//               console.log("SCHED NOTIFICATION:", matchedScheduledNotification);
//             }
//           },
//           (error) => {
//             console.error(error);
//           }
//         );
//       }
//     }

//     fetchNotifications();

//     // Update the current time every minute
//     const intervalId = setInterval(() => {
//       setCurrentTime(new Date());
//     }, 60000);

//     return () => clearInterval(intervalId);
//   }, []);

//   function showScheduledNotification(notification) {
//     if (notification) {
//       setScheduledNotification(notification);
//     }
//   }

//   const handleNotificationPress = async (notification) => {
//     if (notification.status === "unread") {
//       const notificationRef = ref(db, `NOTIFICATION/${notification.id}`);
//       await update(notificationRef, { status: "read" });
//       setReadNotifications([...readNotifications, notification]);
//     }
//     if (notification.orderID) {
//       const orderID = notification.orderID;
//       navigation.navigate("Order", { orderID });
//     } else {
//       console.log("Notification does not have an orderID property.");
//     }
//   };

//   const handleDeleteNotification = (notificationID) => {
//     setNotifications(
//       notifications.filter(
//         (notification) => notification.notificationID !== notificationID
//       )
//     );

//     const deletedNotification = readNotifications.find(
//       (notification) => notification.notificationID === notificationID
//     );
//     if (deletedNotification) {
//       setReadNotifications(
//         readNotifications.filter(
//           (notification) => notification.notificationID !== notificationID
//         )
//       );
//     }
//   };

//   return (
//     <SafeAreaView style={styles.container}>
//       {notifications.length > 0 ? (
//         <ScrollView>
//         <Text style={styles.text1}>Notifications</Text>
// {/* Display scheduled notification */}
// {scheduledNotification && (
//   <View style={[styles.notification, styles.readNotification]}>
//     <TouchableOpacity>
//       <Text style={[styles.text, styles.readText]}>
//         {scheduledNotification.scheduledSent !== "0001-01-01T00:00:00" ? (
//           moment(scheduledNotification.scheduledSent).format("MMMM Do YYYY, h:mm:ss a")
//         ) : (
//           moment(scheduledNotification.notificationDate).format("MMMM Do YYYY, h:mm:ss a")
//         )}
//       </Text>
//     </TouchableOpacity>
//     <View style={{ flexDirection: "row" }}>
//       <View style={styles.imageContainer}>
//         <Image
//           source={require("../assets/storeNoBG.png")}
//           style={styles.image}
//         />
//       </View>
//       <View style={{ top: 5, right: 10, width: 260, alignItems: "center" }}>
//         <Text style={styles.text2}>{scheduledNotification.body}</Text>
//       </View>
//     </View>
//     <TouchableOpacity
//       style={styles.deleteButton}
//       onPress={() => handleDeleteNotification(scheduledNotification.notificationID)}
//     >
//       <Fontisto name="trash" size={13} color="#DFD8C8" />
//     </TouchableOpacity>
//   </View>
// )}
                                                                                       
//           {/* Display other notifications */}
//           {[...notifications]
//             .filter(notification => notification !== scheduledNotification) // Filter out scheduled notification
//             .sort((a, b) => {
//               const dateA = a.scheduledSent !== "0001-01-01T00:00:00" ? new Date(a.scheduledSent) : new Date(a.notificationDate);
//               const dateB = b.scheduledSent !== "0001-01-01T00:00:00" ? new Date(b.scheduledSent) : new Date(b.notificationDate);
//               return dateB - dateA;
//             })
//             .map((notification) => (
//               <View
//                 key={notification.notificationID}
//                 style={[
//                   styles.notification,
//                   readNotifications.includes(notification) && styles.readNotification,
//                 ]}
//               >
//                 <TouchableOpacity
//                   onPress={
//                     notification.status === "read"
//                       ? () => {}
//                       : () => handleNotificationPress(notification)
//                   }
//                 >
//                   <Text
//                     style={[
//                       styles.text,
//                       notification.status === "unread" && styles.unreadText,
//                       notification.status === "read" && styles.readText,
//                     ]}
//                   >
//                     {notification.scheduledSent !== "0001-01-01T00:00:00" ? (
//                       moment(notification.scheduledSent).format("MMMM Do YYYY, h:mm:ss a")
//                     ) : (
//                       moment(notification.notificationDate).format("MMMM Do YYYY, h:mm:ss a")
//                     )}
//                   </Text>
//                 </TouchableOpacity>
//                 <View style={{ flexDirection: "row" }}>
//                   <View style={styles.imageContainer}>
//                     <Image
//                       source={require("../assets/storeNoBG.png")}
//                       style={styles.image}
//                     />
//                   </View>
//                   <View
//                     style={{
//                       top: 5,
//                       right: 10,
//                       width: 260,
//                       alignItems: "center",
//                     }}
//                   >
//                     <Text style={styles.text2}>{notification.body}</Text>
//                   </View>
//                 </View>
//                 <TouchableOpacity
//                   style={styles.deleteButton}
//                   onPress={() => handleDeleteNotification(notification.notificationID)}
//                 >
//                   <Fontisto name="trash" size={13} color="#DFD8C8" />
//                 </TouchableOpacity>
//               </View>
//             ))}
//         </ScrollView>
//       ) : (
//         <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
//           <Text style={styles.noNotificationText}>No Notification</Text>
//         </View>
//       )}
//     </SafeAreaView>
//   );
  
  
//       }  
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "lightcyan",
//     alignItems: "center",
//   },
//   notification: {
//     marginVertical: 10,
//     padding: 20,
//     backgroundColor: "#F8E2CF",
//     borderRadius: 10,
//     elevation: 5,
//     height: 148,
//   },
//   readNotification: {
//     backgroundColor: "white",
//   },
//   unreadText: {
//     fontWeight: "bold",
//   },
//   text: {
//     fontSize: 15,
//     fontWeight: "bold",
//     marginLeft: 90,
//   },
//   text1: {
//     fontSize: 20,
//     fontWeight: "bold",
//     marginRight: 220,
//     marginTop: 50,
//   },
//   text2: {
//     marginLeft: 20,
//     marginBottom: 20,
//   },
//   deleteButton: {
//     backgroundColor: "black",
//     marginTop: 5,
//     //marginRight:-10,
//     padding: 5,
//     borderRadius: 5,
//     alignSelf: "flex-end",
//     justifyContent: "space-between",
//     position: "absolute",
//   },
//   imageContainer: {
//     width: 60,
//     height: 60,
//     borderRadius: 30,
//     backgroundColor: "#ccc",
//     justifyContent: "center",
//     alignItems: "center",
//     marginRight: 10,
//     marginTop: -20,
//   },
//   image: {
//     width: 50,
//     height: 50,
//     borderRadius: 20,
//   },
//   noNotificationText: {
//     flex: 1,
//     alignItems: "center",
//     justifyContent: "center",
//     //backgroundColor:"red",
//     marginTop: 140,
//     fontWeight: "bold",
//     textAlign: "center",
//   },
// });




import { useEffect, useState, useContext } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { db } from "../firebaseConfig";
import {
  ref,
  query,
  orderByChild,
  equalTo,
  onValue,
  update,
} from "firebase/database";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { Fontisto } from "@expo/vector-icons";
import moment from "moment";
import { NotificationContext } from "../shared/NotificationContext";

export default function NotificationScreen() {
  const [notifications, setNotifications] = useState([]);
  console.log("NOTIFICATIONS:", notifications);
  const [readNotifications, setReadNotifications] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const { unreadCount, updateUnreadCount } = useContext(NotificationContext);
  const navigation = useNavigation();

  useEffect(() => {
    async function fetchNotifications() {
      const customerData = JSON.parse(
        await AsyncStorage.getItem("customerData")
      );
      if (customerData) {
        const customerId = customerData.cusId;
        const notificationsRef = ref(db, "NOTIFICATION/");
        const notificationsQuery = query(
          notificationsRef,
          orderByChild("cusId"),
          equalTo(customerId)
        );
        onValue(
          notificationsQuery,
          (snapshot) => {
            if (snapshot.exists()) {
              const data = snapshot.val();

              // Format the notifications data
              const formattedNotifications = Object.keys(data)
                .map((key) => {
                  const notification = {
                    id: key,
                    ...data[key],
                  };

                  // Conditionally format scheduledSent if it has a non-default value
                  if (notification.scheduledSent !== "0001-01-01T00:00:00") {
                    const scheduledSentDate = new Date(
                      notification.scheduledSent
                    );
                    notification.scheduledSent = scheduledSentDate;
                  }
                  return notification;
                })
                .filter((notification) => notification.receiver === "Customer");

              setNotifications(formattedNotifications);

              setReadNotifications(
                formattedNotifications.filter(
                  (notification) => notification.status === "read"
                )
              );
              const unreadNotifications = formattedNotifications.filter(
                (notification) => notification.status === "unread"
              );
              updateUnreadCount(unreadNotifications.length);

              // Initialize a variable to store the matched scheduled notification
              let matchedScheduledNotification = null;

              // Check for notifications that match the current date and time
              formattedNotifications.forEach((notification) => {
                if (notification.scheduledSent instanceof Date) {
                  const scheduledSentDate = notification.scheduledSent;
                  const currentTime = new Date();

                  if (
                    scheduledSentDate.getFullYear() ===
                      currentTime.getFullYear() &&
                    scheduledSentDate.getMonth() === currentTime.getMonth() &&
                    scheduledSentDate.getDate() === currentTime.getDate()
                  ) {
                    matchedScheduledNotification = notification;
                  }
                }
              });

              showScheduledNotification(matchedScheduledNotification);
              console.log("SCHED NOTIFICATION:", matchedScheduledNotification);
            }
          },
          (error) => {
            console.error(error);
          }
        );
      }
    }

    fetchNotifications();

    // Update the current time every minute
    const intervalId = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(intervalId);
  }, []);

  function showScheduledNotification(notification) {
    if (notification) {
      // Display the notification on the device
      // You can use any method or component to show the notification, such as a toast or a modal
      console.log("Scheduled Notification:", notification);
    }
  }

  const handleNotificationPress = async (notification) => {
    if (notification.status === "unread") {
      const notificationRef = ref(db, `NOTIFICATION/${notification.id}`);
      await update(notificationRef, { status: "read" });
      setReadNotifications([...readNotifications, notification]);
    }
    if (notification.orderID) {
      const orderID = notification.orderID;
      navigation.navigate("Order", { orderID });
    } else {
      console.log("Notification does not have an orderID property.");
    }
  };

  
const handleClickMarkAll = async () => {
  // Update the status of all unread notifications to "read"
  const customerData = JSON.parse(await AsyncStorage.getItem("customerData"));
  if (customerData) {
    const customerId = customerData.cusId;
    const notificationsRef = ref(db, "NOTIFICATION/");
    const notificationsQuery = query(
      notificationsRef,
      orderByChild("cusId"),
      equalTo(customerId)
    );
    onValue(
      notificationsQuery,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          const NotifInformation = Object.keys(data)
            .map((key) => ({
              id: key,
              ...data[key],
            }))
            .filter((notification) => notification.receiver === "Customer");
          setNotifications(NotifInformation);
          setReadNotifications(
            NotifInformation.filter((notification) => notification.status === "read")
          );
          const unreadNotifications = NotifInformation.filter(
            (notification) => notification.status === "unread"
          );

          // Update the status of all unread notifications to "read"
          unreadNotifications.forEach(async (notification) => {
            const notificationRef = ref(db, `NOTIFICATION/${notification.id}`);
            await update(notificationRef, { status: "read" });
          });

          // Update the unread count in the state to 0
          updateUnreadCount(0);
        }
      },
      (error) => {
        console.error(error);
      }
    );
  }
};

  const handleDeleteNotification = (notificationID) => {
    setNotifications(
      notifications.filter(
        (notification) => notification.notificationID !== notificationID
      )
    );

    const deletedNotification = readNotifications.find(
      (notification) => notification.notificationID === notificationID
    );
    if (deletedNotification) {
      setReadNotifications(
        readNotifications.filter(
          (notification) => notification.notificationID !== notificationID
        )
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {notifications.length > 0 ? (
        <ScrollView>
          <Text style={styles.text1}>Notifications</Text>
          <View style={{marginLeft:220}}> 
          <TouchableOpacity onPress={handleClickMarkAll}>
                  <Text style={styles.text3}> Mark all as read</Text>
                </TouchableOpacity>
          </View>
          {[...notifications]
          .sort((a, b) => {
            const dateA = a.scheduledSent !== "0001-01-01T00:00:00" ? new Date(a.scheduledSent) : new Date(a.notificationDate);
            const dateB = b.scheduledSent !== "0001-01-01T00:00:00" ? new Date(b.scheduledSent) : new Date(b.notificationDate);
            return dateB - dateA;
          })
          .map((notification) => {
            console.log("line 583",notification); // Console log each sorted notification
            return (
                <View
                  key={notification.notificationID}
                  style={[
                    styles.notification,
                    readNotifications.includes(notification) && styles.readNotification,
                  ]}
                >
                  <TouchableOpacity
                    onPress={
                      notification.status === "read"
                        ? () => {}
                        : () => handleNotificationPress(notification)
                    }
                  >
                    <Text
                      style={[
                        styles.text,
                        notification.status === "unread" && styles.unreadText,
                        notification.status === "read" && styles.readText,
                      ]}
                    >
                      {notification.scheduledSent !== "0001-01-01T00:00:00" ? (
                        moment(notification.scheduledSent).format("MMMM Do YYYY, h:mm:ss a")
                      ) : (
                        moment(notification.notificationDate).format("MMMM Do YYYY, h:mm:ss a")
                      )}
                    </Text>
                  </TouchableOpacity>
                  <View style={{ flexDirection: "row" }}>
                    <View style={styles.imageContainer}>
                      <Image
                        source={require("../assets/storeNoBG.png")}
                        style={styles.image}

                      />
                    </View>
                    <View
                      style={{
                        top: 5,
                        right: 10,
                        width: 260,
                        alignItems: "center",
                      }}
                    >
                      <Text style={styles.text2}>{notification.body}</Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteNotification(notification.notificationID)}
                  >
                    <Fontisto name="trash" size={13} color="#DFD8C8" />
                  </TouchableOpacity>
                </View>
              );
            })}
        </ScrollView>
      ) : (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Text style={styles.noNotificationText}>No Notification</Text>
        </View>
      )}
    </SafeAreaView>
  );
      }  
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "lightcyan",
    alignItems: "center",
  },
  notification: {
    marginVertical: 10,
    padding: 20,
    backgroundColor: "#F8E2CF",
    borderRadius: 10,
    elevation: 5,
    height: 120,
  },
  readNotification: {
    backgroundColor: "white",
  },
  unreadText: {
    fontWeight: "bold",
  },
  text: {
    fontSize: 15,
    fontWeight: "bold",
    marginLeft: 90,
  },
  text1: {
    fontSize: 20,
    fontWeight: "bold",
    marginRight: 220,
    marginTop: 50,
  },
  text2: {
    marginLeft: 20,
    marginBottom: 20,
  },
  text3:{
    color:"black",
    textDecorationLine:"underline",
    fontWeight:"bold",
   },
  deleteButton: {
    backgroundColor: "black",
    marginTop: 5,
    //marginRight:-10,
    padding: 5,
    borderRadius: 5,
    alignSelf: "flex-end",
    justifyContent: "space-between",
    position: "absolute",
  },
  imageContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#ccc",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
    marginTop: -20,
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 20,
  },
  noNotificationText: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    //backgroundColor:"red",
    marginTop: 140,
    fontWeight: "bold",
    textAlign: "center",
  },
});
