import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { FontAwesome } from "@expo/vector-icons";
import { FirstScreenNavigator,SecondScreenNavigator,ThirdScreenNavigator,FourthScreenNavigator,FifthScreenNavigator } from "./CustomNavigation";
import { StyleSheet,Keyboard } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NotificationContext } from '../shared/NotificationContext'
import React, {useContext,useState,useEffect} from "react";

const Tab = createBottomTabNavigator();
function MyTabsNavigator() {

  const Stack = createNativeStackNavigator();
  const { unreadCount, updateUnreadCount } = useContext(NotificationContext);
  const [keyboardShown, setKeyboardShown] = useState(false);
  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardShown(true);
    });
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardShown(false);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);
  const bottomValue = keyboardShown ? 0 : 15;
  return (
 
        <Tab.Navigator
          initialRouteName="Map"
          independent={true}
          tabBarVisible={true}
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, size, color }) => {
              let iconName;
              if (route.name === "Order") {
                //  iconName ='first-order';
                iconName = "reorder";
                // <Image source={require('../assets/purchase-order.png')}/>
                size = focused ? 30 : 19;
                color = focused ? "white" : "black";
              } else if (route.name === "Station") {
                iconName = "home";
                size = focused ? 30 : 19;
                color = focused ? "white" : "black";
              } else if (route.name === "Map") {
                //iconName ='map-marked-alt';
                iconName = "map";
                size = focused ? 30 : 19;
                color = focused ? "white" : "black";
              } else if (route.name === "Notification") {
                iconName = "bell";

                size = focused ? 30 : 19;
                color = focused ? "white" : "black";
              } else if (route.name === "Profile") {
                iconName = "user-circle";
                size = focused ? 30 : 19;
                color = focused ? "white" : "black";
              }
              return <FontAwesome name={iconName} size={size} color={color} />;
            },
            tabBarHideOnKeyboard: true,
            keyboardHidesTabBar: true, // Add this line to hide the tab bar when the keyboard is displayed
            headerShown: false,
            tabBarStyle: {
             // position:"absolute",
             bottom: bottomValue,
              left: 10,
              right: 10,
              elevation: 0,
              backgroundColor: "#73a9c2",
              borderRadius: 15,
              height: 65,
              width: "95%",
              ...style.shadow,
            },
            tabBarLabelStyle: {
              color: "white",
              fontSize: 12,
              paddingBottom: 8,
            },
          })}
        >
          <Tab.Screen
            name="Order"
            component={FirstScreenNavigator}
         
          />

          <Tab.Screen
            name="Station"
            component={SecondScreenNavigator}
            options={{
              tabBarVisible: true,
            }}
          />

          <Tab.Screen
            name="Map"
            component={ThirdScreenNavigator}
            options={{
              tabBarVisible: true,
            }}
          />

          <Tab.Screen
            name="Notification"
            component={FourthScreenNavigator}
            options={{
              tabBarBadge: unreadCount === 0 ? null : unreadCount,
            }}
          />

          <Tab.Screen
            name="Profile"
            component={FifthScreenNavigator}
            options={{
              tabBarVisible: true,
            }}
          />
        </Tab.Navigator>
    
  
  );
}
const style = StyleSheet.create({
  shadow: {
    shadowColor: "#7F5DF0",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.5,
    elevation: 5,
  },
});

export default MyTabsNavigator;
