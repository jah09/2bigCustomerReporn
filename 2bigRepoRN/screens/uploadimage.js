import { StatusBar } from "expo-status-bar";
import { useState,useRef,useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  Button,
  Image,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  TextInput
} from "react-native";

import * as ImagePicker from "expo-image-picker";
import { firebase } from "../firebaseStorage";
import { GOOGLE_API_KEY_PLACE } from "../APIKEY";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
export default function App() {
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    console.log(result);

    if (!result.cancelled) {
      setImage(result.uri);
    }
  };
  console.log("line 28", GOOGLE_API_KEY_PLACE);
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
      xhr.open("GET", image, true);
      xhr.send(null);
    });
    const ref = firebase.storage().ref().child(`Pictures/Image1`);
    const snapshot = ref.put(blob);
    snapshot.on(
      firebase.storage.TaskEvent.STATE_CHANGED,
      () => {
        setUploading(true);
      },
      (error) => {
        setUploading(false);
        console.log(error);
        blob.close();
        return;
      },
      () => {
        snapshot.snapshot.ref.getDownloadURL().then((url) => {
          setUploading(false);
          console.log("Download URL: ", url);
          setImage(url);
          blob.close();
          return url;
        });
      }
    );
  };
  const ref = useRef();

  useEffect(() => {
    ref.current?.setAddressText('Some Text');
  }, []);
  return (
    // <View style={styles.container}>
    //   {image && <Image source={{uri: image}} style={{width: 170 , height: 200}}/>}
    //   <Button title='Select Image' onPress={pickImage} />
    //   {!uploading ? <Button title='Upload Image' onPress={uploadImage} />: <ActivityIndicator size={'small'} color='black' />}
    // </View>
   
    <View style={{flex: 1}}>
      
  <GooglePlacesAutocomplete
  ref={ref}
    placeholder='Search destination'
    minLength={2}
    onPress={(data, details = null) => {
      // 'details' is provided when fetchDetails = true
      console.log(data, details);
    }}
    query={{
      key: GOOGLE_API_KEY_PLACE,
      language: 'en',
      components: 'country:ph',
    }}
    nearbyPlacesAPI="GooglePlacesSearch"
   
  />
</View>

     
     
   
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
