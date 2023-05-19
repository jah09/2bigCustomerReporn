import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, Dimensions } from "react-native";
import { useState, useEffect } from "react";


export const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8E2CF",
    alignItems: "center",
  },
  imageStyle: {
    height: 150,
    width: 150,
    marginTop: 50,
  },
  textStyles: {
    fontSize: 19,
    fontFamily: "nunito-medium",
  },
  wrapper: {
    //  backgroundColor:'green',
    padding: 30,
    height: 200,
    width: "100%",
    marginTop: 50,
  },
  ViewemailTextInput: {
    flexDirection: "row",
    borderBottomColor: "black",
    borderBottomWidth: 1,
    paddingBottom: 2,
    marginBottom: 25,
    width: 270,
    marginLeft: 20,
  },
  login_Email_Icon: {
    marginRight: 5,
  },
  login_Email_textInput: {
    fontSize: 18,
    fontFamily: "nunito-reg",
    width: "90%",
  },

  ViewPasswordTextInput: {
    flexDirection: "row",
    borderBottomColor: "black",
    borderBottomWidth: 1,
    paddingBottom: 2,
    marginBottom: 25,
    width: 270,
    marginLeft: 20,
    marginTop: 15,
  },
  login_Password_Icon: {
    marginRight: 5,
  },
  login_Password_textInput: {
    fontSize: 18,
    fontSize: 18,
    fontFamily: "nunito-reg",
  },
  btnClickEye: {
    position: "absolute",
    right: 10,
  },
  viewForgotPass: {
    // backgroundColor:'red',
    marginTop: -15,
    fontFamily: "nunito-light",
    left: 200,
    width: 160,
  },
  textForgotPass: {
    marginLeft: -10,
  },
  viewButtonStyle: {
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: "#87cefa",
    marginTop: 85,
    width: 250,
    left: 30,
  },
  buttonText: {
    fontFamily: "nunito-bold",
    fontWeight: "bold",
    textTransform: "none",
    textAlign: "center",
    fontSize: 18,
    color: "black",
  },
  loginIcon: {
    position: "absolute",
    right: 20,
    marginTop: 8,
  },
  createAccLabel: {
    marginTop: 20,
    justifyContent: "center",
    textAlign: "center",
    fontFamily: "nunito-reg",
  },
  row: {
    flexDirection: "row",
    marginTop: 15,
    justifyContent: "center",
  },
  clickHerestyle: {
    fontFamily: "nunito-bold",
    color: "#87cefa",
  },
  safeviewStyle: {
    flex: 1,
  },
});
