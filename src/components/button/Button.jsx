// components/Button.jsx
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

export default function Button({ title, onPress, disabled, variant }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.button,
        variant === 'reset'
          ? styles.buttonReset
          : disabled
          ? styles.buttonDisabled
          : styles.buttonEnabled,
      ]}
    >
      <Text
        style={[
          styles.buttonText,
          variant === 'reset' && styles.textReset,
          disabled && styles.textDisabled,
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginHorizontal: 8,
  },
  buttonEnabled: {
    backgroundColor: 'green',
  },
  buttonDisabled: {
    backgroundColor: '#b0b0b0',
  },
  buttonReset: {
    backgroundColor: '#000',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  textDisabled: {
    color: '#eee',
  },
  textReset: {
    color: '#fff',
  },
});
