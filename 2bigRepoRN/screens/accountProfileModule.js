import {
  StyleSheet,
  Text,
  SafeAreaView,
  ScrollView,
  Image,
  View,
  TouchableOpacity,
  Modal,
  Alert,
} from "react-native";
import React, { useEffect, useState } from "react";
import { MaterialIcons, AntDesign } from "@expo/vector-icons";
import CustomInput from "../shared/customInput";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ref, update, get, onValue, set } from "firebase/database";
import { db, auth } from "../firebaseConfig";
import { firebase } from "../firebaseStorage";
import * as ImagePicker from "expo-image-picker";
import { SHA256 } from 'crypto-js';
import { TextInput } from "react-native-paper";
export default function AccountProfileModule({ navigation }) {
  const onPressHandler_toMainPage = () => {
    navigation.navigate("TabNavigator");
  };
  //Modal codes
  const [showModal, setShowModal] = useState(false);
  const onPressHandlerShowModal = () => {
    setShowModal(true);
  };

  const [customerData, setCustomerData] = useState(null);
 // console.log("CUSTOMER ", customerData);
  const [profileImage, setProfileImage] = useState("");
  // console.log("profile screen", customerData);

  useEffect(() => {
    AsyncStorage.getItem("customerData")
      .then((data) => {
        if (data !== null) {
          setCustomerData(JSON.parse(data));
          setProfileImage(JSON.parse(data).imageProof);
        }
      })
      .catch((error) => {
        console.log(error);
        alert("Error fetching data: ", error);
      });
  }, []);

  //update
  const handleSaveChanges = () => {
    // Sanitize firstName input
    const sanitizedFirstName = customerData.firstName
      .replace(/<[^>]+>/g, "")
      .replace(/[^A-Za-z]/g, "");

    // Validate phoneNumber input
    const isValidPhoneNumber = /^\d{11}$/.test(customerData.phoneNumber);

    if (!isValidPhoneNumber) {
      alert("Phone Number must be 11 digits.");
      return;
    }

    // Update the customer data in Firebase Realtime Database
    const customerRef = ref(db, `CUSTOMER/${customerData.cusId}`);
    update(customerRef, {
      firstName: sanitizedFirstName,
      middleName: customerData.middleName,
      lastName: customerData.lastName,
      phoneNumber: customerData.phoneNumber,
      imageProof: customerData.imageProof,
      // address: customerData.address,
    })
      .then(() => {
        alert("Profile Updated Successfully");
      })
      .catch((error) => {
        console.log(error);
        alert("Error updating customer data: ", error);
      });
  };

  //logout
  const handleLogout = async () => {
    try {
      await AsyncStorage.multiRemove(["customerData", "email", "inputtedpassword"]);
      // navigate to login screen or any other screen
      // Get the current date and time
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, "0");
      const day = String(today.getDate()).padStart(2, "0");
      const hours = String(today.getHours()).padStart(2, "0");
      const minutes = String(today.getMinutes()).padStart(2, "0");
      const seconds = String(today.getSeconds()).padStart(2, "0");
      const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

      // Save the user log data
      const newUserLogId = Math.floor(Math.random() * 50000) + 100000;
      const newUserLog = newUserLogId;

      set(ref(db, `CUSTOMERSLOG/${newUserLog}`), {
        dateLogout: formattedDate, // Set the logout date and time
        email: customerData.email, // Set the current logged-in employee ID
        action: "logout",
      }).then(async () => {
        console.log("New:", newUserLog);
        Alert.alert("", "Do you want to logout?", [
          {
            text: "Yes",
            onPress: () => {
              navigation.navigate("Login", { email: "", inputtedpassword: "" });
            },
          },
          {
            text: "cancel",
          },
        ]);
      });
    } catch (error) {
      console.log(error);
    }
  };

  //const encryptedPassword = SHA256(password).toString();


  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [imageURL, setImageURL] = useState(null);
  const getRef = (db, path) => {
    return ref(db, path);
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.cancelled) {
      setImage(result.uri);
    }
  };

  const uploadImage = async () => {
    if (image == null) {
      //Alert.alert("Please select an image to upload");
      return;
    }

    const response = await fetch(image);
    const blob = await response.blob();

    const timestamp = new Date().getTime();
    const CustomerProfilePicture = `Cxprofile-picture-${timestamp}`;

    // Set the path to the image, including the folder
    const path = `CustomerImages/${CustomerProfilePicture}`;

    const ref = firebase.storage().ref().child(path);
    const snapshot = ref.put(blob);

    setUploading(true);

    snapshot.on(
      firebase.storage.TaskEvent.STATE_CHANGED,
      () => {},
      (error) => {
        console.log(error);
        setUploading(false);
        Alert.alert("An error occurred while uploading the image");
      },
      async () => {
        const downloadURL = await snapshot.snapshot.ref.getDownloadURL();
        console.log("File available at", downloadURL);
        setUploading(false);

        // Store the download URL in AsyncStorage
        await AsyncStorage.setItem("imageURL", downloadURL);

        // Update the customer data with the new image URL in Firebase Realtime Database
        const { cusId } = customerData;
        const customerRef = getRef(db, `CUSTOMER/${cusId}`);
        await update(customerRef, {
          imageProof: downloadURL,
        })
          .then(() => {
            Alert.alert("Image uploaded successfully!");
            setImageURL(downloadURL); // Store the download URL in state
            setImage(null); // Reset the image variable
            // Call getImageURL again to retrieve the updated image URL
            getImageURL();
          })
          .catch((error) => {
            console.log(error);
            Alert.alert("An error occurred while updating the image URL");
          });
      }
    );
  };

  // Retrieve the image URL from your Realtime Database
  const getImageURL = async () => {
    const customerData = await AsyncStorage.getItem("customerData");
    const cusId = JSON.parse(customerData).cusId;

    const customerRef = getRef(db, `CUSTOMER/${cusId}`);
    onValue(customerRef, (snapshot) => {
      const data = snapshot.val();
      if (data.imageProof) {
        setImageURL(data.imageProof);
      }
    });
  };

  useEffect(() => {
    getImageURL();
  }, []);
  // Call getImageURL function when the user logs in or the app is resumed from the background
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        getImageURL();
      }
    });

    return unsubscribe;
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.profile}>
          {imageURL ? (
            <>
              <Image source={{ uri: imageURL }} style={styles.profileImage} />
              <TouchableOpacity onPress={pickImage}>
                <AntDesign
                  name="edit"
                  size={18}
                  color="#DFD8C8"
                  style={styles.editIcon}
                />
              </TouchableOpacity>
            </>
          ) : (
            <AntDesign
              name="pluscircle"
              size={40}
              color="#DFD8C8"
              onPress={pickImage}
            />
          )}
          <TouchableOpacity onPress={uploadImage}>
            <AntDesign name="cloudupload" size={18} color="#DFD8C8" />
          </TouchableOpacity>
          {uploading && <Text>Uploading image...</Text>}
        </View>
        <View style={styles.out}>
          <TouchableOpacity onPress={handleLogout}>
            <MaterialIcons
              name="logout"
              size={18}
              color="#DFD8C8"
            ></MaterialIcons>
            <View></View>
          </TouchableOpacity>
        </View>
        <View style={styles.text}>
          <Text style={{ fontWeight: "bold", left: 20, marginTop: 25 }}>
            Basic Information
          </Text>
        </View>

        {customerData !== null ? (
          <View>
            <CustomInput
              value={customerData.firstName}
              onChangeText={(text) => {
                const sanitizedText = text
                  .replace(/<[^>]+>/g, "")
                  .replace(/[^A-Za-z]/g, "");
                setCustomerData({ ...customerData, firstName: sanitizedText });
              }}
            />
            <CustomInput
              value={customerData.middleName}
              onChangeText={(text) =>
                setCustomerData({ ...customerData, middleName: text })
              }
            />
            <CustomInput
              value={customerData.lastName}
              onChangeText={(text) => {
                const sanitizedText = text
                  .replace(/<[^>]+>/g, "")
                  .replace(/[^A-Za-z]/g, "");
                setCustomerData({ ...customerData, lastName: sanitizedText });
              }}
            />
            <CustomInput
              placeholder="Contact Number"
              value={customerData.phoneNumber}
              onChangeText={(text) => {
                const sanitizedText = text.replace(/[^0-9]/g, "");
                setCustomerData({
                  ...customerData,
                  phoneNumber: sanitizedText,
                });
              }}
            />
            <View style={styles.styleAdd}>
              <Text
                style={{
                  textAlign: "center",
                  fontSize: 14,
                  fontWeight: "bold",
                  marginTop: 40,
                }}
              >
                {customerData.address &&
                  customerData.address.split("\n").map((line, index) => (
                    <Text key={index}>
                      {line}
                      {"\n"}
                    </Text>
                  ))}
              </Text>
            </View>
          </View>
        ) : (
          <Text>No customer data found</Text>
        )}
       

        <TouchableOpacity onPress={handleSaveChanges}>
          <View style={styles.btn}>
            <Text style={styles.txt}> UPDATE</Text>
          </View>
        </TouchableOpacity>
        <View style={{ backgroundColor: "transparent", height: 100 }}>
          <Text style={{ fontWeight: "bold", left: 20, marginTop: 25 }}>
            Reward Points
          </Text>
        </View>

        <View
          style={{
            backgroundColor: "transparent",
            marginTop: -50,
            marginBottom: 30,
            marginLeft: 25,
          }}
        >
          <CustomInput
            value={
              customerData && customerData.walletPoints
                ? customerData.walletPoints.toString()
                : "0"
            }
            editable={false}
            onChangeText={(text) =>
              setCustomerData({ ...customerData, walletPoints: text })
            }
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "lightcyan",
  },

  image: {
    flex: 1,
    height: undefined,
    width: undefined,
  },
  imagePlaceholder: {
    width: 200,
    height: 200,
    backgroundColor: "#DFD8C8",
    alignItems: "center",
    justifyContent: "center",
  },
  profile: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 40,
  },
  profileImage: {
    width: 200,
    height: 200,
    borderRadius: 100,
    marginBottom: 10,
  },

  out: {
    backgroundColor: "#41444B",
    position: "absolute",
    top: 40,
    width: 40,
    height: 40,
    marginLeft: 300,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  btn: {
    borderRadius: 5,
    paddingVertical: 5,
    paddingHorizontal: 5,
    backgroundColor: "#009900",
    marginTop: 20,
    alignItems: "center",
    width: 200,
    height: 60,
    left: 90,
    justifyContent: "center",
  },
  txt: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
  styleAdd: {
    backgroundColor: "white",
    left: 40,
    width: "80%",
    height: 100,
    alignItems: "center",
    borderRadius: 5,
    paddingHorizontal: 10,
    borderColor: "gray",
    marginVertical: 10,
  },
  rewardButton: {
    borderRadius: 5,
    paddingVertical: 5,
    paddingHorizontal: 5,
    backgroundColor: "dodgerblue",
    marginTop: 30,
    alignItems: "center",
    width: 100,
    height: 50,
    left: 150,
    marginBottom: 20,
    justifyContent: "center",
  },
  rewardText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    alignItem: "center",
    textAlign: "center",
    justifyContent: "center",
    //  paddingVertical:10
  },
  RewardModal: {
    width: 300,
    height: 220,
    backgroundColor: "#F8E2CF",
    borderBottomColor: "gray",
    borderBottomWidth: 1,
    borderRadius: 10,
    elevation: 10,
  },
  modalTitle: {
    // backgroundColor:'red',
    justifyContent: "center",
    padding: 0,
    flexDirection: "row",
    textAlign: "center",
  },
  Descriptionwrapper: {
    // backgroundColor: "green",
    paddingVertical: 5,
    marginTop: 10,
    height: 120,
  },
  programDesc: {
    //backgroundColor:'red',
    //flexDirection:'row'
  },
  rewardPts: {
    //backgroundColor: "gray",
    marginTop: 10,
  },
  viewButtonStyle: {
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: "#87cefa",
    marginTop: 5,
    width: 150,
    left: 80,
    height: 40,
  },
});
