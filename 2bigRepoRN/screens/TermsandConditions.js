import { StyleSheet, Text, View, ScrollView, } from 'react-native';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TermsandConditions() {
  return (
    <SafeAreaView style={styles.container}>
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
    <View >
      <Text style={styles.title}>Terms and Conditions</Text>
      <Text style={styles.subtitle}>Last Edit: 10/10/2022</Text>

      <Text style={styles.body}>
        Greetings Users,

        Welcome to 2BiG: A Web and Mobile Water Refilling Station Management System.

        These terms and conditions outline the rules and regulations for the use of '2BIG WRS Management System'.

        By accessing this website we assume you accept these terms and conditions in full. Do not continue to use '2BIG WRS Management System' if you do not accept all of the terms and conditions stated on this page.

        <Text style={styles.bold}>Cookies</Text>

        We employ the use of cookies. By using '2BIG WRS Management System' you consent to the use of cookies in accordance with '2BIG WRS Management System' privacy policy. Most of the modern day interactive websites use cookies to enable us to retrieve user details for each visit.

        Cookies are used in some areas of our site to enable the functionality of this area and ease of use for those people visiting. Some of our affiliate / advertising partners may also use cookies.

        <Text style={styles.bold}>License</Text>

        Unless otherwise stated, '2BIG WRS Management System' and/or its licensors own the intellectual property rights for all material on '2BIG WRS Management System'. All intellectual property rights are reserved.

        You must not:

        - Republish material,
        - Sell, rent or sub-license material,
        - Reproduce, duplicate or copy material,
        - Redistribute content from '2BIG WRS Management System' (unless content is specifically made for redistribution).

        <Text style={styles.bold}>Disclaimer</Text>

        To the maximum extent permitted by applicable law, we exclude all representations, warranties and conditions relating to our website and the use of this website (including, without limitation, any warranties implied by law in respect of satisfactory quality, fitness for purpose and/or the use of reasonable care and skill).

        Nothing in this disclaimer will:

        - Limit or exclude our or your liability for death or personal injury resulting from negligence.
        - Limit or exclude our or your liability for fraud or fraudulent misrepresentation.
        - Limit any of our or your liabilities in any way that is not permitted under applicable law.
        - Or exclude any of our or your liabilities that may not be excluded under applicable law.

        The limitations and exclusions of liability set out in this Section and elsewhere in this disclaimer: are subject to the preceding paragraph; and govern all liabilities arising under the disclaimer or in relation to the subject matter of this disclaimer, including liabilities that arise in contract, tort (including negligence) and for breach of statutory duty.

        To the extent that the website and the information and services on the website are provided free of charge, we will not be liable for any loss or damage of any nature.
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
    backgroundColor: '#F8E2CF',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#999',
    marginBottom: 20,
  },
  body: {
    fontSize: 16,
    //lineHeight: 
  },
});