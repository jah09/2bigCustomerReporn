import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  BackHandler,
} from "react-native";
import React from "react";
import { globalStyles } from "../ForStyle/GlobalStyles";
import { MaterialIcons } from "@expo/vector-icons";
export default function DeadEndScreen() {
  return (
    <View style={styles.container}>
      <Image
        source={require("../assets/logo_dic.png")}
        style={[globalStyles.imageStyle, { marginTop: -120 }]}
      />
      <View
        style={{
          //backgroundColor: "red",
          padding: 15,
          justifyContent: "center",

          marginTop: 30,
        }}
      >
        <Text style={{ fontSize: 20, fontFamily: "nunito-bold" }}>
          Note from developer!
        </Text>
        <Text
          style={{ fontSize: 18, fontFamily: "nunito-semibold", marginTop: 30 }}
        >
          {
            "Hello Greetings,\nOne of 2Big's policy, we require the user to turn their location, in order you can use the app. If don't want to turn on your location. Please click the button below."
          }
        </Text>
      </View>
      <View style={{ padding: 10, marginTop: 20, height: 50, width: "90%" }}>
        {/*react native library that if click the button,it will close the application.  */}
        <TouchableOpacity
          onPress={() => {
            BackHandler.exitApp();
          }}
        >
          <View style={styles.viewButtonStyle}>
            <Text style={styles.buttonText}>I understand</Text>
            <MaterialIcons
              name="login"
              size={24}
              color="black"
              style={styles.loginIcon}
            />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8E2CF",
    justifyContent: "center",
    alignItems: "center",
  },
  viewButtonStyle: {
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: "#87cefa",
    marginTop: 85,
    width: 220,
    left: 50,
    height: 50,
  },
  buttonText: {
    fontFamily: "nunito-bold",
    fontWeight: "bold",
    textTransform: "none",
    textAlign: "center",
    fontSize: 18,
    color: "black",
    marginTop: 5,
    marginLeft: -10,
  },
  loginIcon: {
    position: "absolute",
    right: 20,
    marginTop: 12,
    marginLeft: -10,
  },
});
