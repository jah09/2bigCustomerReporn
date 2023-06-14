import { StyleSheet, Text, View, ScrollView } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
export default function TermsandConditions() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View>
          <Text style={styles.title}>Terms and Conditions</Text>
          <Text style={styles.subtitle}>Last Edit: 06/08/2023</Text>

          <Text style={styles.body}>
            <Text style={styles.bold}>Greetings Users, {"\n"} </Text>
            This End-User License Agreement ("Agreement") is a legal agreement
            between you as a customer (referred to as "Customer" or "you") and
            [Admin/User Name] (referred to as "Admin/User" or "we" or "us"),
            governing your use of [2BiG Mobile] (referred to as the "Software")
            as a customer.
            <Text style={styles.bold}>
              {" "}
              {"\n"}
              {"\n"}Acceptance of Terms {"\n"}
            </Text>
            We employ the use of cookies. By using '2BIG WRS Management System'
            you consent to the use of cookies in accordance with '2BIG WRS
            Management System' privacy policy. Most of the modern day
            interactive websites use cookies to enable us to retrieve user
            details for each visit. Cookies are used in some areas of our site
            to enable the functionality of this area and ease of use for those
            people visiting. Some of our affiliate / advertising partners may
            also use cookies.
            <Text style={styles.bold}>
              {" "}
              {"\n"}
              {"\n"}License {"\n"}
            </Text>
            Subject to the terms and conditions of this Agreement, Developers
            grants you a non-exclusive, non-transferable, limited license to use
            the Software for the purpose of accessing and utilizing the services
            provided by the sellers as a customer.
            <Text style={styles.bold}>
              {" "}
              {"\n"}
              {"\n"}Use of Software {"\n"}
            </Text>
            a. You may use the Software in accordance with its intended purpose
            and functionality. b. You may not modify, reverse engineer,
            decompile, disassemble, or attempt to derive the source code of the
            Software.
            <Text style={styles.bold}>
              {" "}
              {"\n"}
              {"\n"}Intellectual Property Rights {"\n"}
            </Text>
            a. The Software and any associated intellectual property rights are
            owned by Admin/User and are protected by copyright and other
            applicable laws. b. This Agreement does not transfer any ownership
            rights to you.
            <Text style={styles.bold}>
              {" "}
              {"\n"}
              {"\n"}Privacy and Data Protection {"\n"}
            </Text>
            a. Admin/User may collect and process personal information in
            accordance with its Privacy Policy. b. By using the Software, you
            consent to the collection, storage, and processing of your personal
            information as described in the Privacy Policy.
            <Text style={styles.bold}>
              {" "}
              {"\n"} {"\n"}ID Verification {"\n"}
            </Text>
            a. In order to create an account and access certain features of the
            Software, you may be required to upload a valid ID and a selfie
            holding the valid ID. b. The uploaded ID will be evaluated by the
            developers for account to be approved or declined. c. Uploading fake
            IDs is strictly prohibited and may result in legal actions. d.
            Creating fake accounts is also prohibited and may lead to
            termination of your access to the Software.
            <Text style={styles.bold}>
              {" "}
              {"\n"} {"\n"}Product Pricing {"\n"}
            </Text>
            a. The prices of the products listed on the Software are set by the
            individual sellers. b. Sellers have the ability to change the prices
            of their products at their own discretion. c. The developers shall
            not be held responsible for any changes in product prices made by
            the sellers.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 40,
    backgroundColor: "#F8E2CF",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#999",
    marginBottom: 20,
  },
  body: {
    fontSize: 16,
    //lineHeight:
  },
  bold: {
    fontSize: 16,
    fontWeight: "bold",
    //lineHeight:
  },
});
