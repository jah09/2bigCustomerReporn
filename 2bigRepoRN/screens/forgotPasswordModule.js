import {
  StyleSheet,
  Text,
  View,
  Image,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import React, { useState } from "react";
import { useFonts } from "expo-font";
import { MaterialIcons } from "@expo/vector-icons";
import { globalStyles } from "../ForStyle/GlobalStyles";
import CustomBtn from "../shared/customButton";
import { db, auth } from "../firebaseConfig";
import { sendPasswordResetEmail } from "firebase/auth";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { ref, orderByChild, query } from "firebase/database";

export default function ForgotPasswordModule({ navigation }) {
  const onPressHandler_forLogin = () => {
    navigation.navigate("Login");
  };

  const [email, setEmail] = useState("");
  console.log("email");
  // const handleResetPassword = () => {

  //   db.auth().sendPasswordResetEmail(email)

  //     .then(() => {
  //       console.log('email');
  //       console.log('Password reset email sent successfully!');
  //     })
  //     .catch((error) => {
  //       console.log('Error sending password reset email:', error);
  //     });
  // };

  const handleResetPassword = () => {
    sendPasswordResetEmail(auth, email)
      .then(() => {
        alert(
          "Password reset email sent successfully! \nPlease check your gmail."
        );
      })
      .catch((error) => {
        console.log("Error sending password reset email:", error);
      });
  };

  return (
    <TouchableWithoutFeedback
      onPress={() => {
        Keyboard.dismiss();
      }}
    >
      <View style={styles.container}>
        <View style={styles.form}>
          {/* our own logo */}
          <Image
            source={require("../assets/forgotpass_new.png")}
            style={styles.imageStyle}
          />
          <View style={styles.ViewParagraph}>
            <Text
              style={[
                globalStyles.textStyles,
                { marginTop: 20, fontFamily: "nunito-light", fontSize: 15 },
              ]}
            >
              Forgot password? Don't worry, we got you. Just enter your email
              associated with your account below.{" "}
            </Text>
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
              onChangeText={setEmail}
              style={[globalStyles.login_Email_textInput, { marginLeft: 3 }]}
              placeholderTextColor="black"
              keyboardType="default"
            />
          </View>

          {/*for for signUP button */}
          <View style={styles.customBtnStyle}>
            <CustomBtn onPress={handleResetPassword} text="Submit" />
          </View>

          <View style={[globalStyles.row, { marginTop: 25 }]}>
            <TouchableOpacity onPress={onPressHandler_forLogin}>
              <Text style={globalStyles.clickHerestyle}> Back to login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableWithoutFeedback>
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

    padding: 8,
    paddingTop: 0,
  },
  imageStyle: {
    height: 150,
    width: 150,
  },
  form: {
    alignItems: "center",
    width: "100%",
    // backgroundColor:'red',
    marginTop: 10,
  },

  ViewEmail: {
    flexDirection: "row",
    borderBottomColor: "black",
    borderBottomWidth: 1,
    paddingBottom: 2,
    marginBottom: 25,
    width: 270,
    marginTop: 46,
  },
  customBtnStyle: {
    right: 30,
    marginTop: 0,
    marginBottom: 20,
  },
  ViewParagraph: {
    width: 290,
    height: 100,
    marginTop: -10,
    marginLeft: 20,
  },
});
