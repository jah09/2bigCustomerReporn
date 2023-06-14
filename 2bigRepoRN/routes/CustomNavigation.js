import React from "react";
import OrderScreen from "../screens/orderModule";
import StationScreen from "../screens/stationModule";
import MapScreen from "../screens/mapModule";
import NotificationScreen from "../screens/notificationModule";
import ProfileScreen from "../screens/accountProfileModule";
import ProductScreen from "../screens/productComponent";
import ProductScreenAndOrder from '../screens/productDetailsAndPlaceOrder';
import TestingScreen from '../screens/NewDeliveryAddressScreen';
import CartScreen from '../screens/CartScreen'; 
import RewardScreen from '../screens/RewardScreen';
import RatingScreen from '../screens/ReviewRatingScreen';
import MapScreenforDelivery from '../screens/MapForDelivery';
import DeliveredOrdersScreen from "../screens/DeliveredOrdersScreen";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import History from "../screens/History";

const Stack = createNativeStackNavigator(); // creates object for Stack Navigator
const FirstScreenNavigator = () => {
    return (
        <Stack.Navigator   screenOptions={{
            headerShown: false,
          }}>
        <Stack.Screen name="Orders" component={OrderScreen} />
        {/* <Stack.Screen name="MapsNested" component={MapScreen} />  */}
        <Stack.Screen name="MapScreenforDelivery" component={MapScreenforDelivery} />
        <Stack.Screen name="DeliveredOrdersScreen" component={DeliveredOrdersScreen} />
      </Stack.Navigator>
    );
  };
  export { FirstScreenNavigator };
  
  const SecondScreenNavigator = () => {
    return (
        <Stack.Navigator   screenOptions={{
            headerShown: false,
          }}>
        <Stack.Screen name="Stations" component={StationScreen} />
        <Stack.Screen name="toProductScreen" component={ProductScreen} />
        <Stack.Screen name="toProductDetailsAndOrderScreen" component={ProductScreenAndOrder} />
        <Stack.Screen name="CartScreen" component={CartScreen} />
        <Stack.Screen name="NewDeliveryAdd" component={TestingScreen}/>
        <Stack.Screen name="RewardScreen" component={RewardScreen}/>
        <Stack.Screen name="RatingScreen" component={RatingScreen}/>
      </Stack.Navigator>
    );
  };
  
  
  export {SecondScreenNavigator};
  
const ThirdScreenNavigator=()=>{
  return(
  <Stack.Navigator   screenOptions={{
    headerShown: false,
  }}>
        <Stack.Screen name="Maps" component={MapScreen} />
        {/* <Stack.Screen name="UploadingImageTest" component={TestingScreen}/> */}
        <Stack.Screen  name="toMapsProductScreen" component={ProductScreen}/>
        <Stack.Screen name="toProductDetailsAndOrderScreen" component={ProductScreenAndOrder} />
        <Stack.Screen name="CartScreen" component={CartScreen} />
        <Stack.Screen name="NewDeliveryAdd" component={TestingScreen}/>
        <Stack.Screen name="RewardScreen" component={RewardScreen}/>
        <Stack.Screen name="RatingScreen" component={RatingScreen}/>
      </Stack.Navigator>
  )
  }
  export {ThirdScreenNavigator};

  
  const FourthScreenNavigator =()=>{
      return(
        <Stack.Navigator   screenOptions={{
            headerShown: false,
          }}>
              <Stack.Screen
              name="Notifications"
              component={NotificationScreen}
              />
          </Stack.Navigator>
      )
  }
  export {FourthScreenNavigator};
  
  const FifthScreenNavigator=()=>{
      return(
        <Stack.Navigator   screenOptions={{
            headerShown: false,
          }}>
              <Stack.Screen
              name="Profiles"
              component={ProfileScreen}/>
              <Stack.Screen
              name="History"
              component={History}/>
          </Stack.Navigator>
      )
  }
  
  export {FifthScreenNavigator};
  