  import { StyleSheet, Text, View, SafeAreaView, ScrollView, TouchableOpacity, Modal } from 'react-native'
  import React, { useEffect, useState } from 'react'
  import { MaterialIcons } from "@expo/vector-icons";
  import AsyncStorage from '@react-native-async-storage/async-storage';
  import { ref, onValue,query, orderByChild, equalTo} from "firebase/database";
  import { db } from "../firebaseConfig";

  export default function History({ navigation }) {
    const [customerLogs, setCustomerLogs] = useState([]);
    const [logSelected, setLogSelected]= useState(null);
    const [showModal, setShowModal]= useState(false);
    console.log("CUSTOMERSLOG:", customerLogs);
    const onPresshandler_toStationPage = () => {
      navigation.goBack();
    };

    useEffect(() => {
      const fetchLog = async () => {
        const customerData = await AsyncStorage.getItem("customerData");
        const cusId = JSON.parse(customerData).cusId;
        console.log("Cus#:", cusId);
        const customerLogRef = ref(db, `CUSTOMERSLOG/`);
        console.log("customerLogRef:", customerLogRef);
        const logsQuery = query(
          customerLogRef,
          orderByChild("cusId"),
          equalTo(cusId)
        );
        onValue(
          logsQuery,
          (snapshot) => {
            if (snapshot.exists()) {
              const data = snapshot.val();
              console.log("Data:", data);
              const logsQuery = Object.keys(data)
                .map((key) => ({
                  id: key,
                  ...data[key],
                }))
                .filter((data) => data.action === "Order" || data.action === "pointsDeducted"  || data.action === "Placed Order")
                .sort((a, b) => {
                  if (a.date && b.date) {
                    return b.date.localeCompare(a.date);
                  } else if (!a.date && b.date) {
                    return -1;
                  } else if (a.date && !b.date) {
                    return 1;
                  } else {
                    return 0;
                  }
                });
              setCustomerLogs(logsQuery);
            }
          },
          (error) => {
            console.error(error);
          }
        );
      };

      fetchLog();
    }, [orderInfo]);

    useEffect(() => {
      const orderRef = ref(db, "ORDERS/");
      const Orderquery = query(orderRef, orderByChild("cusId"));
      onValue(
        Orderquery,
        (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.val();
            const OrderInformation = Object.keys(data)
              .map((key) => ({
                id: key,
                ...data[key],
                order_Products: Object.values(data[key].order_Products || {}),
              }))
            setOrderInfo(OrderInformation);
            //console.log("OrderInformation", OrderInformation);
          } else {
            console.log("No orders found");
          }
        },
        (error) => {
          console.log("Error fetching orders", error);
        }
      );
    }, []);
  
    const [orderInfo, setOrderInfo] = useState([]);
    console.log("Order:", orderInfo);
  
    const onPressHandlerShowModal = (log) => {
      console.log("line 52", log);
      const { orderID } = log.log;
      console.log("test 49", orderID);
      
      const selectedItem = orderInfo.find(item => item.orderID === orderID);
      if (selectedItem) {
        // Do something with the selectedItem
        console.log("Selected item:", selectedItem);   
        const combinedItem = { ...log.log, ...selectedItem };
        console.log("Combined item:", combinedItem);
        setLogSelected(combinedItem); // Assuming setLogSelected is a state update function
         setShowModal(true);
      } else {
        console.log("No item found with the specified orderID");
      }
    };


  

    const currentDate = new Date();
    return (
      <SafeAreaView>
        <ScrollView>
          <View style={styles.viewBackBtn}>
            <MaterialIcons
              name="arrow-back-ios"
              size={24}
              color="black"
              onPress={onPresshandler_toStationPage}
            />
          </View>
          <View style={styles.text1}>
            <Text style={{ fontWeight: "bold", fontSize: 18 }}>
              My Transaction's History as of {currentDate.toLocaleDateString()}
            </Text>
          </View>
       
            <View style={styles.tableRow}>
              <View style={styles.tableHeader}>
                <Text>Date Order</Text>
              </View>
              
              <View style={styles.tableHeader}>
                <Text>Transaction ID Number</Text>
              </View>
            </View>

          <View style={styles.tableContainer}>
            {customerLogs.map((log, index, ) => (
              <TouchableOpacity  onPress={() => onPressHandlerShowModal({ log })}>
    <View key={index} style={styles.tableRow}>
      <View style={styles.tableCell}>
        <Text>{log.date}</Text>
      </View>
      <View style={styles.tableCell}>
        <Text style={{ marginLeft: 45 }}>{log.logId}</Text>
      </View>
    </View>
    </TouchableOpacity>
  ))}
      {logSelected && logSelected.orderID && (
  <Modal visible={showModal} transparent onRequestClose={() => setShowModal(false)}>
    <View style={styles.Container2}>
      <View style={styles.modalContainer}>
        <View style={styles.modalTitle}>
        <Text style={styles.modalTitle}>Transaction Details</Text>
        </View>
        <Text style={styles.modalText}>{logSelected.order_TotalAmount}</Text>
        <View style={{ flexDirection: "row", justifyContent: 'space-between', top: 15 }}>
          <TouchableOpacity onPress={() => setShowModal(false)}>
            <Text style={styles.closeButton}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
)}
          </View>
   

        </ScrollView>
      </SafeAreaView>
    );
  }

  const styles = StyleSheet.create({
    viewBackBtn: {
      marginTop: 40,
      marginLeft: 20,
      width: "100%",
    },
    text1: {
      marginTop: 30,
      alignItems: 'center',
    },
    tableContainer: {
      marginTop: 30,
      marginLeft: 20,
      marginRight: 20,
    },
    tableRow: {
      flexDirection: 'row',
     
    },
    tableHeader: {
      flex: 1,
      padding: 20,
      backgroundColor: 'skyblue',
      fontWeight:'bold',
      //justifyContent:'flex-end',
      marginLeft:10,
    },
    tableHeaderText: {
      fontWeight: 'bold',
    },
    tableCell: {
      flex: 1,
      padding: 10,
      borderBottomWidth: 1,
      borderBottomColor: 'black',
    },
    tableCellText: {
      textAlign: 'center',
    },
    modalContainer: {
      backgroundColor: 'white',
      padding: 20,
      borderRadius: 10,
      margin: 20,
      height: 200,
      width:300,
     
    },
    Container2:{
     flex:1,
     justifyContent:"center",
     alignItems:"center",
     backgroundColor:'#00000099'
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 10,
      alignItems:"center",
    },
    modalText: {
      fontSize: 16,
      marginBottom: 10,
    },
  });