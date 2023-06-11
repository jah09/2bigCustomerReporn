import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, Dimensions } from "react-native";
import { useState, useEffect } from "react";
import {
    responsiveHeight,
    responsiveWidth,
  } from "react-native-responsive-dimensions";
export const StylesRewardsPoints = StyleSheet.create({
 
        imagePickerInput: {
          flexDirection: "row",
          // borderBottomColor: "gray",
          //borderBottomWidth: 0.5,
          paddingBottom: 2,
          marginBottom: 5,
          width: 270,
          marginTop: 5,
          marginLeft: 5,
        },
        ModinputWrapper: {
          // backgroundColor: "green",
          paddingVertical: 5,
          marginTop: 5,
          height: 120,
          padding: 6,
        },
        modeofPaymentModal: {
          width: 310,
          height: 350,
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
        viewForModeofPayment: {
          backgroundColor: "white",
          width: 140,
          height: 30,
          padding: 6,
          borderRadius: 8,
          marginTop: 25,
          elevation: 3,
          flexDirection: "row",
        },
        modalTitle: {
          justifyContent: "flex-start",
          padding: 0,
          flexDirection: "row",
          marginLeft: 5,
          padding: 4,
        },
      
        circular: {
          width: 75,
          height: 75,
          borderColor: "red",
          //borderWidth: 2,
          //  borderRadius: 5,
        },
        viewPoints: {
          width: 75,
          height: 65,
          // backgroundColor: "red",
          // opacity: 0.4, #55BCF6
          borderRadius: 7,
      
          borderWidth: 0.5,
          borderColor: "gray",
          //marginBottom:25
        },
        pointsItem: {
          backgroundColor: "white",
          padding: 10,
          borderRadius: 5,
          flexDirection: "row", 
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 5,
          elevation: 6,
          top: 10,
          height: 80,
          //justifyContent:'center'
        },
        container: {
          flex: 1,
          backgroundColor: "lightcyan",
          // justifyContent:'center',
          //alignItems:'center'
        },
        viewBackBtn: {
          marginTop: 20,
          marginLeft: 5,
          width: "100%",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          //height:50
        },
        viewwatername: {
          //backgroundColor: "yellow",
          width: 180,
          justifyContent: "center",
        },
        textwatername: {
          fontSize: 20,
          fontFamily: "nunito-bold",
          fontWeight: "bold",
          // textAlign: "center",
          // backgroundColor:'red',
          width: 180,
          textAlign: "center",
          alignItems: "center",
          right: 5,
          // bottom:20
        },
        wrapperWaterProduct: {
          backgroundColor: "red",
          height: responsiveHeight(70),
          padding: 10,
          width: "100%",
          left: responsiveHeight(5),
        },
        waterProdStyle: {
          fontFamily: "nunito-semibold",
          fontSize: 18,
          marginLeft: 0,
          top: 0,
        },
        productWrapper: {
          backgroundColor: "transparent",
          padding: 5,
          //flex: 1,
          top: 15,
          height: 150,
        },
      
        storeNameStyles: {
          fontSize: 20,
          fontFamily: "nunito-bold",
        },
        viewWaterItem: {
          padding: 3,
          //marginTop: 25,
          width: responsiveWidth(90),
          height: responsiveHeight(18),
          marginLeft: 0,
          borderRadius: 10,
          marginRight: 5,
          shadowColor: "black",
          shadowRadius: 5,
          shadowOffset: {
            height: 5,
            width: 5,
          },
          elevation: 5,
      
          //top: 10,
        },
        productNameStyle: {
          fontSize: 20,
          fontFamily: "nunito-semibold",
          marginLeft: 0,
          // textAlign: "center",
        },
     
    
})