import {
  Text,
  View,
  Image,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
  SafeAreaView,
  Dimensions,
} from "react-native";
import customStatusBar from "../shared/customStatusBar";
import React, { useState, useEffect } from "react";
import Custombtn from "../shared/customButton";
import { MaterialIcons } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";
import { globalStyles } from "../ForStyle/GlobalStyles";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { SHA256 } from "crypto-js";

import { db } from "../firebaseConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  ref,
  orderByChild,
  query,
  equalTo,
  onValue,
  set,
  get,
} from "firebase/database";

//import { onValue, push, set } from "firebase/database";

export default function LoginModule({ navigation, route }) {
  const onPressHandler_forCreateAccount = () => {
    // navigation.navigate('CreateAccount');
    navigation.navigate("CreateAccount");
  };

  const onPressHandler_forForgotPassword = () => {
    navigation.navigate("ForgotPassword");
  };

  const onPressHandler_toMainPage = () => {
    navigation.navigate("TabNavigator");
  };

  const [showPassword, setShowPassword] = useState(false);
  const [visible, setVisible] = useState(true);
  const [custData, setCusData] = useState();

  const [email, setEmail] = useState(route.params?.email || "");
  const [password, setPassword] = useState(route.params?.password || "");

  // Clear text inputs when user logs out
  useEffect(() => {
    const unsubscribe = navigation.addListener("blur", () => {
      setEmail("");
      setPassword("");
    });
    return unsubscribe;
  }, [navigation]);

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

  const handleLogin = async () => {
    try {
      const auth = getAuth();
      const inputtedpassword = SHA256(password).toString();
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        inputtedpassword
      );
      const user = userCredential.user;
      console.log("Logged in with:", inputtedpassword);
      const customerData = await fetchCustomerData(email,inputtedpassword);
      console.log("Data:", customerData);
  
      if (customerData) {
        await storeCustomerData(customerData);
        await logCustomerLogin(email);
        navigation.navigate("TabNavigator");
      } else {
        alert("No customer found with this email");
      }
    } catch (error) {
      console.log("108",error);
      alert("Please check your email and password.");
    }
  };
  
  const handleLoginError = () => {
    console.log("Invalid password");
    alert("Incorrect password. Please try again.");
  };
  
  const fetchCustomerData = async (email, inputtedpassword) => {
    const customerRef = ref(db, "CUSTOMER");
    const customerQuery = query(
      customerRef,
      orderByChild("email"),
      equalTo(email)
    );
    const snapshot = await get(customerQuery);
  
    if (snapshot.exists()) {
      const customerData = snapshot.val()[Object.keys(snapshot.val())[0]];
      const storedPassword = customerData.password;
        console.log("line 126",storedPassword)
        console.log("line 127",inputtedpassword)
      // Compare the hashed passwords
      if (inputtedpassword === storedPassword) {
        return customerData;
      } else {
        return null;
      }
    } else {
      return null;
    }
  };
  
  
  
  const storeCustomerData = async (customerData) => {
    try {
      await AsyncStorage.setItem("customerData", JSON.stringify(customerData));
    } catch (error) {
      console.log(error);
      alert("Error saving data: ", error);
    }
  };
  

  const logCustomerLogin = async (email) => {
    const userLogId = Math.floor(Math.random() * 50000) + 100000;
    const newUserLog = userLogId;
    const logRef = ref(db, `CUSTOMERSLOG/${newUserLog}`);
    const currentDate = new Date().toISOString();
    const logData = {
      dateLogin: currentDate,
      email: email,
      action: "login",
    };
    try {
      await set(logRef, logData);
      console.log("New:", newUserLog);
    } catch (error) {
      console.log(error);
      alert("Error saving data: ", error);
    }
  };

  return (
    <SafeAreaView style={globalStyles.safeviewStyle}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        {/* <StatusBar backgroundColor="black" /> */}
        <TouchableWithoutFeedback
          onPress={() => {
            Keyboard.dismiss();
          }}
        >
          <View style={globalStyles.container}>
            {/* our own logo */}
            <Image
              source={require("../assets/logo_dic.png")}
              style={globalStyles.imageStyle}
            />
            <Text style={globalStyles.textStyles}>Meet the expectations. </Text>

            {/* wrapper/div for email and password input */}
            <View style={globalStyles.wrapper}>
              {/* wrapper for email input */}
              <View style={globalStyles.ViewemailTextInput}>
                <MaterialIcons
                  name="email"
                  size={23}
                  color="black"
                  style={globalStyles.login_Email_Icon}
                />
                <TextInput
                  placeholder="Email"
                  value={email}
                  placeholderTextColor="black"
                  onChangeText={(text) => setEmail(text)}
                  style={globalStyles.login_Email_textInput}
                />
              </View>

              {/* wrapper for password input */}
              <View style={globalStyles.ViewPasswordTextInput}>
                <Ionicons
                  name="md-lock-closed-sharp"
                  size={23}
                  color="black"
                  style={globalStyles.login_Password_Icon}
                />
                <TextInput
                  placeholder="Password"
                  value={password}
                  style={[
                    globalStyles.login_Password_textInput,
                    { width: 195 },
                  ]}
                  onChangeText={(text) => setPassword(text)}
                  secureTextEntry={visible}
                  placeholderTextColor="black"
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

              {/*for forgot password label*/}
              <TouchableOpacity onPress={onPressHandler_forForgotPassword}>
                <View style={globalStyles.viewForgotPass}>
                  <Text style={globalStyles.textForgotPass}>
                    Forgot password
                  </Text>
                </View>
              </TouchableOpacity>
              {/*login btn */}

              <Custombtn text="Login" onPress={handleLogin} />

              <View style={globalStyles.row}>
                <Text>Don't have an account?</Text>
                <TouchableOpacity onPress={onPressHandler_forCreateAccount}>
                  <Text style={globalStyles.clickHerestyle}> Click here.</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </ScrollView>
    </SafeAreaView>
  );
}


// Email: rheatrinidad@gmail.com
// Password: *Rhea123*
