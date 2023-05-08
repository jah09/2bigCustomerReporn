import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  Image,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
  ScrollView,
  Platform,
  SafeAreaView,
  Modal,
} from "react-native";
import React, { useState, useEffect } from "react";
import { globalStyles } from "../ForStyle/GlobalStyles";
import { FontAwesome5 } from "@expo/vector-icons";
//import { useFonts } from 'expo-font';
import { FontAwesome } from "@expo/vector-icons";
import { MaterialIcons } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import CustomBtn from "../shared/customButton";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Fontisto } from "@expo/vector-icons";
import * as Location from "expo-location";
import { geocodeAsync, reverseGeocodeAsync } from "expo-location";
import { getDatabase, ref, set, push, child, get } from "firebase/database";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import Feather from "react-native-vector-icons/Feather";
import { Entypo } from "@expo/vector-icons";
import { AntDesign } from "@expo/vector-icons";
//import ImagePicker from 'react-native-image-picker';
import * as ImagePicker from "expo-image-picker";
import * as Permissions from "expo-permissions";
import { firebase } from "../firebaseStorage";
import { db } from "../firebaseConfig";

export default function CreateAccountPage({ navigation }) {
  const [checkValidEmail, setCheckValidEmail] = useState(false);

  const handleCheckEmail = (text) => {
    let re = /\S+@\S+\.\S+/;
    let regex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im;

    setEmail(text);
    if (re.test(text) || regex.test(text)) {
      setCheckValidEmail(false);
    } else {
      setCheckValidEmail(true);
    }
  };
  const checkPasswordValidity = (value) => {
    const isNonWhiteSpace = /^\S*$/;
    if (!isNonWhiteSpace.test(value)) {
      return "Password must not contain Whitespaces.";
    }

    const isContainsUppercase = /^(?=.*[A-Z]).*$/;
    if (!isContainsUppercase.test(value)) {
      return "Password must have at least one Uppercase Character.";
    }

    const isContainsLowercase = /^(?=.*[a-z]).*$/;
    if (!isContainsLowercase.test(value)) {
      return "Password must have at least one Lowercase Character.";
    }

    const isContainsNumber = /^(?=.*[0-9]).*$/;
    if (!isContainsNumber.test(value)) {
      return "Password must contain at least one Digit.";
    }

    const isValidLength = /^.{8,16}$/;
    if (!isValidLength.test(value)) {
      return "Password must be 8-16 Characters Long.";
    }

    return null;
  };

  const onPressHandler_forLogin = () => {
    navigation.navigate("Login");
  };
  const onPressHandler_forTerms = () => {
    navigation.navigate("TermsandConditions");
  };

  {
    /*code for eye button in password input */
  }
  const [showPassword, setShowPassword] = useState(false);
  const [visible, setVisible] = useState(true);
  const [showConfirmPass, setshowConfirmPass] = useState(false);
  const [visibleConfirmPass, setvisibleConfirmPass] = useState(true);
  const [showModal_ModeOfPayment, setShowModal_ModeOfPayment] = useState(false);
  const [showModal_Selfie, setShowModal_Selfie] = useState(false);
  {
    /*style para dili mo overlapp ang logo sa status bar */
  }
  const styleTypes = ["default", "dark-content", "light-content"];
  const [visibleStatusBar, setvisibleStatusbar] = useState(false);
  const [styleStatusBar, setstyleStatusBar] = useState(styleTypes[0]);

  {
    /* for detecting geolocation and reverse code start here*/
  }
  const [location, setLocation] = useState(null);
  // const [address, setAddress] = useState(null);
  const [addresstext, setAddresstext] = useState("");
  const [isPressed, setIsPressed] = useState(false);

  useEffect(() => {
    if (isPressed) {
      (async () => {
        let { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== "granted") {
          console.log("Permission to access location was denied");

          return;
        }

        let location = await Location.getCurrentPositionAsync({});
        // console.log("Create account tst",location.coords.latitude);
        setLatittudeLoc(location.coords.latitude);
        setLongitudeLoc(location.coords.longitude);
        setLocation(location);
        //console.log(location);
        let address = await reverseGeocodeAsync({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });

        setAddress(address[0].name + ", " + address[0].city);
        console.log(
          address[0].name + ", " + address[0].subregion + "," + address[0].city
        );
        // setShowModal(false);
      })();
    }
  }, [isPressed]);

  {
    /* for detecting geolocation and reverse code end here*/
  }

  const [showModal, setShowModal] = useState(false);
  const onPressHandlerShowModal = () => {
    setShowModal(true);
  };

  //birthdate function
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
    setBOD(fdate);
  };
  const showMode = (currentMode) => {
    setShow(true);
    setMode(currentMode);
  };

  const [currentDate, setCurrentDate] = useState("");
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
  // const formatDate = (date) => {
  //   const year = date.getFullYear();
  //   const month = String(date.getMonth() + 1).padStart(2, "0");
  //   const day = String(date.getDate()).padStart(2, "0");
  //   return `${year}-${month}-${day}`;
  // };
  //   const onCharge = (event, selectedDate) => {
  //     const currentDate = selectedDate || date;
  //   setShow(Platform.OS === "ios");
  //   setDate(currentDate);

  //   // Check if selected date is less than 17 years ago
  //   const minDate = new Date(Date.now() - 17 * 365 * 24 * 60 * 60 * 1000);
  //   const maxDate = new Date(Date.now() - 100 * 365 * 24 * 60 * 60 * 1000);
  //   if (currentDate < minDate) {
  //     alert("You must be at least 17 years old to use this app.");
  //     return;
  //   } else if (currentDate > maxDate) {
  //     alert("You must be at most 100 years old to use this app.");
  //     return;
  //   }

  //   // Format the selected date as a string
  //   const formattedDate = formatDate(currentDate);
  //   setBOD(formattedDate);
  // };
  //firebase data for creating account

  const [firstName, setFName] = useState("");
  const [middleName, setMName] = useState("");
  const [lastName, setLName] = useState("");
  const [phone, setPhone] = useState("");
  const [BOD, setBOD] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [conPass, setConPass] = useState("");
  const [lattitude_Location, setLatittudeLoc] = useState();
  const [longitude_Location, setLongitudeLoc] = useState();

  const handleCreate = () => {
    try {
      //tocheck if na fillout ba tnan fields except sa middle name
      if (
        firstName.trim() === "" ||
        lastName.trim() === "" ||
        email.trim() === "" ||
        phone.trim() === "" ||
        BOD.trim() === "" ||
        password.trim() === "" ||
        address.trim() === "" ||
        conPass.trim() === "" ||
        gcashProoflink_Storage.trim() === "" ||
        selfieImagelink.trim() === ""
      ) {
        alert("Please fill out all fields.");
        return;
      }

      // Check if password matches confirm password
      if (password !== conPass) {
        alert("Passwords do not match");
        return;
      }

      // Check password strength
      const checkPassword = checkPasswordValidity(password);
      if (!checkPassword) {
        createUserAccount();
        // calls the create function to proceed with the creation of account
        alert("Account created successfully");
      } else {
        alert("Weak password. Please enter a stronger password for security.");
      }
    } catch (error) {
      console.log(error);
      alert("There was a problem creating your account");
    }
  };

  async function createUserAccount() {
    const auth = getAuth();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const db = getDatabase();
  
      // Generate new unique customer ID
      const cusId = Math.floor(Math.random() * 900000) + 100000;
      const status = "Pending";
  
      // Add customer details to database
      await set(ref(db, "CUSTOMER/" + cusId), {
        cusId: cusId,
        firstname: firstName,
        middleName: middleName,
        lastName: lastName,
        phoneNumber: phone,
        birthdate: BOD,
        address: address,
        email: email,
        password: password,
        confirmPassword: conPass,
        imageProof: gcashProoflink_Storage,
        imageSelfie: selfieImagelink,
        cus_status: status,
        lattitudeLocation: lattitude_Location,
        longitudeLocation: longitude_Location,
      });
  
      // Add new notification to database
      const notificationRef = ref(db, "NOTIFICATION");
      const notificationSnapshot = await get(notificationRef);
      const notificationKeys = notificationSnapshot.exists() ? Object.keys(notificationSnapshot.val()) : [];
      const maxKey = notificationKeys.length > 0 ? Math.max(...notificationKeys) : 0;
      const newKey = maxKey + 1;
  
      const newNotification = {
        body: "New user registered. Check the details for approval.",
        notificationDate: currentDate,
        cusId: cusId,
        notificationID: newKey,
        receiver: "Super Admin",
        sender: "Customer",
        status: "unread",
        title: "New Registered User",
      };
      console.log("NEW NOTIF==>", newKey);
      await set(ref(db, `NOTIFICATION/${newKey}`), newNotification);
  
      alert("Registration successful");
      navigation.navigate("Login");
    } catch (error) {
      console.log(error);
      alert("Error writing document: ", error);
    }
  }
  
  //start here //UPLOAD IMAGE
  //codes in getting the image from local device, display it and lastly upload to firebase storage
  const [gcashProoflink_Storage, setgcashProoflink_Storage] = useState();
  const [gcashProofImage, setGgcashProofImage] = useState(null);
  console.log("IDImage:", gcashProofImage);
  const [uploadingImage, setUploadingImage] = useState(false);

  // console.log("line 612313131388", gcashProofImage);

  console.log("UPLoadingImage:", uploadingImage);
  const [fileNameInput, setFilenameInput] = useState("");
  console.log("picture:", fileNameInput);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.cancelled) {
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
          Alert.alert("Thank you for uploading your valid ID.");
          setShowModal_ModeOfPayment(false);
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

  const [selfieImagelink, setSelfieImagelink] = useState();
  const [selfieImage, setselfieImage] = useState(null);
  const [uploadingSelfie, setuploadingSelfie] = useState(false);
  console.log("Upload:", uploadingSelfie);
  const [fileNameSelfie, setFilenameSelfie] = useState("");
  console.log("Selfie:", fileNameSelfie);

  const selfiepickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setselfieImage(result.uri);
      setFilenameSelfie(result.uri.split("/").pop());
    }
  };
  const selfieUploadImage = async () => {
    const blob = await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = function () {
        resolve(xhr.response);
      };
      xhr.onerror = function () {
        reject(new TypeError("Network request failed"));
      };
      xhr.responseType = "blob";
      xhr.open("GET", selfieImage, true);
      xhr.send(null);
    });
    const ref = firebase
      .storage()
      .ref()
      .child("Customer_SelfieProof/" + fileNameInput);
    const snapshot = ref.put(blob, { contentType: "image/jpeg" });
    snapshot.on(
      firebase.storage.TaskEvent.STATE_CHANGED,
      () => {
        setuploadingSelfie(true);
      },
      (error) => {
        setuploadingSelfie(false);
        console.log(error);
        blob.close();

        return;
      },
      () => {
        snapshot.snapshot.ref.getDownloadURL().then((url) => {
          setuploadingSelfie(false);
          console.log("Selfie Download URL: ", url);
          setSelfieImagelink(url);
          setselfieImage(url);

          blob.close();
          Alert.alert("Thank you for uploading your selfie.");
          setShowModal_ModeOfPayment(false);
          return url;
        });
      }
    );
  };

  const handleSelfieImage = async () => {
    //check if the gcashProofImage if naa ba sulod or wala
    if (selfieImage === null) {
      Alert.alert("Please upload a screenshot of your Gcash payment.");
    } else {
      selfieUploadImage();
    }
  };

  return (
    <SafeAreaView style={styles.safeviewStyle}>
      <TouchableWithoutFeedback
        onPress={() => {
          Keyboard.dismiss();
        }}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View style={styles.container}>
            <Modal
              transparent
              onRequestClose={() => {
                setShowModal(false);
              }}
              visible={showModal}
            >
              <View
                style={{
                  flex: 1,
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor: "#00000099",
                }}
              >
                <View style={styles.permissionModal}>
                  <View style={styles.modalTitle}>
                    <Text
                      style={{
                        marginTop: 8,
                        justifyContent: "flex-start",
                        marginLeft: -160,
                        fontFamily: "nunito-bold",
                        fontSize: 18,
                      }}
                    >
                      Use location?
                    </Text>

                    <View
                      style={{
                        backgroundColor: "transparent",
                        textAlign: "right",
                        right: -177,
                        marginTop: -10,
                      }}
                    >
                      <TouchableOpacity
                        onPress={() => {
                          setShowModal(false);
                        }}
                      >
                        <MaterialCommunityIcons
                          name="close-circle"
                          size={28}
                          color="black"
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                  <View
                    style={{
                      // backgroundColor: "green",
                      padding: 10,
                      marginTop: 10,
                      height: 60,
                      alignItems: "center",
                    }}
                  >
                    <Text style={{ fontFamily: "nunito-light", fontSize: 17 }}>
                      2Big application wants to turn on your current location.
                    </Text>
                  </View>
                  <View
                    style={{
                      // backgroundColor: "red",
                      padding: 5,
                      marginTop: 20,
                      height: 30,
                      flexDirection: "row",
                      justifyContent: "flex-end",
                    }}
                  >
                    <TouchableOpacity
                      onPress={() => {
                        //setShowModal(false);
                        navigation.navigate("DeadEndPage");
                      }}
                    >
                      <Text
                        style={{
                          marginRight: 30,
                          fontFamily: "nunito-bold",
                          fontSize: 18,
                        }}
                      >
                        Deny
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => {
                        setIsPressed(true);
                        setShowModal(false);
                      }}
                    >
                      <Text
                        style={{
                          marginRight: 15,
                          fontFamily: "nunito-bold",
                          fontSize: 18,
                        }}
                      >
                        Allow
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Modal>

            <View style={styles.form}>
              {/* our own logo */}
              <Image
                source={require("../assets/logo_dic.png")}
                style={styles.imageStyle}
              />

              <Text
                style={[
                  globalStyles.textStyles,
                  {
                    marginTop: 20,
                    fontFamily: "nunito-bold",
                    fontSize: 25,
                  },
                ]}
              >
                Create Account{" "}
              </Text>

              <StatusBar
                backgroundColor="black"
                styleStatusBar={styleStatusBar}
              />
              {/*first name input */}
              <View style={styles.ViewFirstname}>
                <FontAwesome
                  name="user"
                  size={23}
                  color="black"
                  style={globalStyles.login_Email_Icon}
                />

                <TextInput
                  value={firstName}
                  onChangeText={(firstName) => {
                    setFName(firstName);
                  }}
                  placeholder="First Name"
                  placeholderTextColor="black"
                  style={globalStyles.login_Email_textInput}
                  keyboardType="default"
                />
              </View>

              {/*Middle name input */}
              <View style={styles.ViewMiddlename}>
                <FontAwesome
                  name="user"
                  size={23}
                  color="black"
                  style={globalStyles.login_Email_Icon}
                />

                <TextInput
                  value={middleName}
                  onChangeText={(middleName) => {
                    setMName(middleName);
                  }}
                  placeholder="Middle Name"
                  placeholderTextColor="black"
                  style={globalStyles.login_Email_textInput}
                  keyboardType="default"
                />
              </View>

              {/*Last name input */}
              <View style={styles.ViewMiddlename}>
                <FontAwesome
                  name="user"
                  size={23}
                  color="black"
                  style={globalStyles.login_Email_Icon}
                />

                <TextInput
                  value={lastName}
                  onChangeText={(lastName) => {
                    setLName(lastName);
                  }}
                  placeholder="Last Name"
                  placeholderTextColor="black"
                  style={globalStyles.login_Email_textInput}
                  keyboardType="default"
                />
              </View>

              {/*Phone number  input */}
              <View style={styles.ViewPhoneNumber}>
                <MaterialIcons
                  name="contacts"
                  size={22}
                  color="black"
                  style={styles.phoneNumberIcon}
                />

                <TextInput
                  value={phone}
                  onChangeText={(phone) => {
                    setPhone(phone);
                  }}
                  placeholder="Phone Number"
                  style={[
                    globalStyles.login_Email_textInput,
                    { marginLeft: 3 },
                  ]}
                  placeholderTextColor="black"
                  keyboardType="number-pad"
                />
              </View>

              <View style={styles.ViewBirthdate}>
                <MaterialIcons
                  name="date-range"
                  size={23}
                  color="black"
                  style={styles.phoneNumberIcon}
                />

                <TextInput
                  value={BOD}
                  onChangeText={(BOD) => {
                    setBOD(BOD);
                  }}
                  placeholder="Birth Date"
                  style={[
                    globalStyles.login_Email_textInput,
                    { marginLeft: 3 },
                  ]}
                  placeholderTextColor="black"
                  keyboardType="default"
                  editable={true}
                />

                <TouchableOpacity
                  style={globalStyles.btnClickEye}
                  onPress={() => showMode("date")}
                >
                  <Fontisto
                    name="date"
                    size={23}
                    color="black"
                    style={{ marginRight: -5 }}
                  />
                </TouchableOpacity>
              </View>

              {show && (
                <DateTimePicker
                  testID="datePicker"
                  value={date}
                  mode={mode}
                  is24Hour={true}
                  display="default"
                  // minimumDate={new Date(Date.now() - 100 * 365 * 24 * 60 * 60 * 1000)} // 100 years ago from current date
                  // maximumDate={new Date(Date.now() - 17 * 365 * 24 * 60 * 60 * 1000)} // 17 years ago from current date
                  onChange={onChange}
                />
              )}

              <View style={styles.ViewAddress}>
                <MaterialCommunityIcons
                  name="map-marker-radius"
                  size={23}
                  color="black"
                  style={styles.phoneNumberIcon}
                />

                <TextInput
                  value={address}
                  onChangeText={(address) => {
                    setAddress(address);
                  }}
                  placeholder="Address"
                  style={[
                    globalStyles.login_Email_textInput,
                    { marginLeft: 3 },
                  ]}
                  placeholderTextColor="black"
                  keyboardType="default"
                  editable={false}
                />

                <TouchableOpacity
                  style={globalStyles.btnClickEye}
                  //  onPress={() => setIsPressed(true)}
                  onPress={onPressHandlerShowModal}
                >
                  <FontAwesome name="map-pin" size={22} color="black" />
                </TouchableOpacity>
              </View>

              {/*Email input */}
              <View style={styles.ViewEmail}>
                <MaterialIcons
                  name="email"
                  size={23}
                  color="black"
                  style={styles.phoneNumberIcon}
                />

                <TextInput
                  placeholder="Email"
                  value={email}
                  onChangeText={(text) => handleCheckEmail(text)}
                  placeholderTextColor="black"
                  style={[
                    globalStyles.login_Email_textInput,
                    { marginLeft: 3 },
                  ]}
                />
                {checkValidEmail ? (
                  <Text style={styles.textFailed}>Invalid email</Text>
                ) : (
                  <Text style={styles.textFailed}></Text>
                )}
              </View>

              {/*password input */}
              <View style={styles.ViewEmail}>
                <Ionicons
                  name="md-lock-closed-sharp"
                  size={23}
                  color="black"
                  style={styles.phoneNumberIcon}
                />

                <TextInput
                  value={password}
                  onChangeText={(password) => {
                    setPassword(password);
                  }}
                  placeholder="Password"
                  style={[
                    globalStyles.login_Email_textInput,
                    { marginLeft: 3 },
                  ]}
                  placeholderTextColor="black"
                  secureTextEntry={visible}
                />

                <TouchableOpacity
                  style={globalStyles.btnClickEye}
                  onPress={() => {
                    setVisible(!visible);
                    setShowPassword(!showPassword);
                  }}
                >
                  <Ionicons
                    name={showPassword === false ? "eye" : "eye-off"}
                    size={23}
                    color="black"
                  />
                </TouchableOpacity>
              </View>

              {/*Confirm password input */}
              <View style={styles.ViewEmail}>
                <Ionicons
                  name="md-lock-closed-sharp"
                  size={23}
                  color="black"
                  style={styles.phoneNumberIcon}
                />

                <TextInput
                  value={conPass}
                  onChangeText={(conPass) => {
                    setConPass(conPass);
                  }}
                  placeholder="Confirm Password"
                  style={[
                    globalStyles.login_Email_textInput,
                    { marginLeft: 3 },
                  ]}
                  placeholderTextColor="black"
                  secureTextEntry={visibleConfirmPass}
                />

                <TouchableOpacity
                  style={globalStyles.btnClickEye}
                  onPress={() => {
                    setvisibleConfirmPass(!visibleConfirmPass);
                    setshowConfirmPass(!showConfirmPass);
                  }}
                >
                  <Ionicons
                    name={showConfirmPass === false ? "eye" : "eye-off"}
                    size={23}
                    color="black"
                  />
                </TouchableOpacity>
              </View>

              {/*for upload VALID Id*/}
              <View style={styles.viewValidId}>
                <FontAwesome5 name="id-card" size={20} color="black" />

                {fileNameInput ? (
                  <TextInput
                    style={[
                      globalStyles.login_Email_textInput,
                      { marginLeft: 3, color: "black", fontSize: 10 },
                    ]}
                    placeholderTextColor="black"
                    keyboardType="default"
                    editable={false}
                    value={fileNameInput}
                  />
                ) : (
                  <Text
                    style={{ fontSize: 16, color: "black", marginLeft: 3 }}
                    numberOfLines={1}
                  >
                    Upload Valid ID
                  </Text>
                )}

                <TouchableOpacity
                  style={globalStyles.btnClickEye}
                  onPress={() => {
                    setShowModal_ModeOfPayment(true);
                  }}
                >
                  <Feather name="upload" size={24} color="black" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={globalStyles.btnClickEye}
                  onPress={() => {
                    setShowModal_ModeOfPayment(true);
                  }} // call the function to open image picker
                >
                  <Feather name="upload" size={24} color="black" />
                </TouchableOpacity>
              </View>
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
                          marginLeft: 80,
                          fontFamily: "nunito-bold",
                          fontSize: 20,
                        }}
                      >
                        Valid ID
                      </Text>
                      <View style={{ flex: 1, marginTop: 4 }} />
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

                    <View style={styles.ModinputWrapper}>
                      <View style={styles.imagePickerInput}>
                        <Text
                          style={{
                            marginTop: 3,
                            marginLeft: 12,
                            fontFamily: "bold",
                            fontSize: 12,
                            marginRight: 3,
                          }}
                        >
                          Please upload a government valid ID. {"\n"} (e-Card /
                          UMID, Employee's ID / Office Id, Driver's License,
                          Professional Regulation Commission (PRC) ID,Passport,
                          Senior Citizen ID, SSS ID, COMELEC / Voter's ID /
                          COMELEC Registration Form, others.. )
                        </Text>
                        <TouchableOpacity onPress={pickImage}>
                          <Entypo
                            name="upload-to-cloud"
                            size={30}
                            color="black"
                            style={{ marginLeft: 290, marginBottom: 0 }}
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
                          marginLeft: 30,
                          borderRadius: 80,
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
                                marginLeft: 44,
                              }}
                            >
                              Upload Image
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

              {/*for upload selfie image*/}
              <View style={styles.viewValidId}>
                <FontAwesome name="picture-o" size={21} color="black" />
                {fileNameSelfie ? (
                  <TextInput
                    style={[
                      globalStyles.login_Email_textInput,
                      { marginLeft: 3, color: "black", fontSize: 10 },
                    ]}
                    placeholderTextColor="black"
                    keyboardType="default"
                    editable={false}
                    value={fileNameSelfie}
                  />
                ) : (
                  <Text
                    style={{ fontSize: 16, color: "black", marginLeft: 3 }}
                    numberOfLines={1}
                  >
                    Upload your Selfie
                  </Text>
                )}

                <TouchableOpacity
                  style={globalStyles.btnClickEye}
                  onPress={() => {
                    setShowModal_Selfie(true);
                  }} // call the function to open image picker
                >
                  <Feather name="upload" size={24} color="black" />
                </TouchableOpacity>
              </View>

              <Modal
                transparent
                onRequestClose={() => {
                  setShowModal_Selfie(false);
                }}
                visible={showModal_Selfie}
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
                          marginLeft: 90,
                          fontFamily: "nunito-bold",
                          fontSize: 20,
                        }}
                      >
                        Selfie
                      </Text>
                      <View style={{ flex: 1, marginTop: 2 }} />
                      <TouchableOpacity
                        onPress={() => {
                          setShowModal_Selfie(false);
                          setselfieImage(null);
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

                    <View style={styles.ModinputWrapper}>
                      <View style={styles.imagePickerInput}>
                        <Text
                          style={{
                            marginTop: 3,
                            marginLeft: 10,
                            fontFamily: "bold",
                            fontSize: 16,
                          }}
                        >
                          Upload your selfie together with your ID.
                        </Text>
                        <TouchableOpacity onPress={selfiepickImage}>
                          <Entypo
                            name="upload-to-cloud"
                            size={30}
                            color="black"
                            style={{ marginLeft: 290, marginBottom: 0 }}
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
                          marginLeft: 30,
                        }}
                      >
                        {selfieImage && (
                          <Image
                            source={{ uri: selfieImage }}
                            onLoad={() => console.log(" selfie image loaded")}
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
                        {!uploadingSelfie ? (
                          <TouchableOpacity onPress={handleSelfieImage}>
                            <Text
                              style={{
                                fontFamily: "nunito-semibold",
                                textAlign: "center",
                                fontSize: 17,
                                textDecorationLine: "underline",
                                marginLeft: 25,
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
              {/* <Text style={{fontFamily:"nunito-semibold"}}>By Signing Up, you agree to our</Text>
              <TouchableOpacity onPress={onPressHandler_forTerms}>
                  <Text style={{fontWeight:"bold"}}> Terms and Conditions</Text>
                </TouchableOpacity> */}
              {/*for for signUP button */}

              {email == "" || checkValidEmail == true ? (
                <TouchableOpacity disabled onPress={handleCreate}>
                  <View
                    style={[
                      globalStyles.viewButtonStyle,
                      {
                        backgroundColor: "gray",
                        marginRight: 50,
                        marginTop: 10,
                      },
                    ]}
                  >
                    <Text style={globalStyles.buttonText}> Register</Text>
                    <MaterialIcons
                      name="login"
                      size={24}
                      color="black"
                      style={globalStyles.loginIcon}
                    />
                  </View>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity onPress={handleCreate}>
                  <View
                    style={[
                      globalStyles.viewButtonStyle,
                      { marginRight: 50, marginTop: 10 },
                    ]}
                  >
                    <Text style={globalStyles.buttonText}> Register</Text>
                    <MaterialIcons
                      name="login"
                      size={24}
                      color="black"
                      style={globalStyles.loginIcon}
                    />
                  </View>
                </TouchableOpacity>
              )}

              <View
                style={[
                  globalStyles.row,
                  { marginTop: 25 },
                  { marginLeft: 10 },
                ]}
              >
                <Text>Already have an account?</Text>
                <TouchableOpacity onPress={onPressHandler_forLogin}>
                  <Text style={globalStyles.clickHerestyle}> Click here.</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  phoneNumberIcon: {
    marginLeft: -2,
  },
  container: {
    flex: 1,
    backgroundColor: "#F8E2CF",
    alignItems: "center",
    justifyContent: "center",
    // paddingTop: Constants.statusBarHeight,
    padding: 8,
    paddingTop: 70,
    //paddingTop:Platform.OS==='android'? StatusBar.height:0
  },
  imageStyle: {
    height: 150,
    width: 150,
    marginTop: -25,
  },
  scrollViewStyle: {
    backgroundColor: "red",
    width: "100%",
  },
  form: {
    alignItems: "center",
    width: "100%",
  },
  ViewFirstname: {
    flexDirection: "row",
    borderBottomColor: "black",
    borderBottomWidth: 1,
    paddingBottom: 2,
    marginBottom: 25,
    width: 270,
    marginTop: 50,
  },
  ViewMiddlename: {
    flexDirection: "row",
    borderBottomColor: "black",
    borderBottomWidth: 1,
    paddingBottom: 2,
    marginBottom: 25,
    width: 270,
    marginTop: 5,
  },
  ViewMiddlename: {
    flexDirection: "row",
    borderBottomColor: "black",
    borderBottomWidth: 1,
    paddingBottom: 2,
    marginBottom: 25,
    width: 270,
    marginTop: 5,
  },
  ViewPhoneNumber: {
    flexDirection: "row",
    borderBottomColor: "black",
    borderBottomWidth: 1,
    paddingBottom: 2,
    marginBottom: 25,
    width: 270,
    marginTop: 5,
  },
  ViewEmail: {
    flexDirection: "row",
    borderBottomColor: "black",
    borderBottomWidth: 1,
    paddingBottom: 2,
    marginBottom: 25,
    width: 270,
    marginTop: 5,
  },
  ViewBirthdate: {
    flexDirection: "row",
    borderBottomColor: "black",
    borderBottomWidth: 1,
    paddingBottom: 2,
    marginBottom: 25,
    width: 270,
    marginTop: 5,
  },
  ViewAddress: {
    flexDirection: "row",
    borderBottomColor: "black",
    borderBottomWidth: 1,
    paddingBottom: 2,
    marginBottom: 25,
    width: 270,
    marginTop: 5,
  },
  customBtnStyle: {
    right: 30,
    marginTop: -20,
  },
  safeviewStyle: {
    flex: 1,
  },
  textFailed: {
    alignSelf: "flex-end",
    color: "red",
    top: 30,
    left: -70,
    fontWeight: "bold",
  },
  permissionModal: {
    width: 300,
    height: 150,
    backgroundColor: "darkgray",
    borderBottomColor: "gray",
    borderBottomWidth: 1,
    borderRadius: 10,
    elevation: 10,
  },
  modalTitle: {
    justifyContent: "center",
    padding: 0,
    flexDirection: "row",
  },
  modeofPaymentModal: {
    width: 350,
    height: 400,
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
  viewValidId: {
    flexDirection: "row",
    borderBottomColor: "black",
    borderBottomWidth: 1,
    paddingBottom: 2,
    marginBottom: 25,
    width: 300,
    marginTop: 5,
    marginLeft: 18,
  },
  viewSelfie: {},
});
