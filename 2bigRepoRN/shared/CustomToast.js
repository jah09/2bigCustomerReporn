import React, { useRef, useEffect } from 'react';
import { View, Text, Animated } from 'react-native';
import Modal from 'react-native-modal';

const CustomToast = ({ message, duration }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }, duration);
  }, [fadeAnim, duration]);

  return (
    <Modal isVisible={true} backdropOpacity={0} style={{ margin: 0 }}>
      <Animated.View style={{ opacity: fadeAnim }}>
        <View
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            padding: 10,
            borderRadius: 8,
          }}
        >
          <Text style={{ color: '#fff', fontSize: 16 }}>{message}</Text>
        </View>
      </Animated.View>
    </Modal>
  );
};

export default CustomToast;
