// File: src/components/StepIndicator/StepIndicator.js
import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';

export default function StepIndicator({ currentStep, onStepPress }) {
  const steps = [
    'Select Language',
    'Select Class',
    'Select Subject',
    'Select Content',
  ];

  return (
    <View style={styles.container}>
      {steps.map((label, index) => (
        <React.Fragment key={index}>
          <Pressable
            style={styles.stepContainer}
            onPress={() => onStepPress(index + 1)}
          >
            <Text
              style={[
                styles.circle,
                currentStep > index ? styles.active : styles.inactive,
              ]}
            >
              {index + 1}
            </Text>
            <Text style={styles.label}>{label}</Text>
          </Pressable>

          {index < steps.length - 1 && <View style={styles.line} />}
        </React.Fragment>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  stepContainer: {
    alignItems: 'center',
  },
  circle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    textAlign: 'center',
    lineHeight: 32,
  },
  active: {
    backgroundColor: '#007bff',
    color: '#fff',
  },
  inactive: {
    backgroundColor: '#ccc',
    color: '#000',
  },
  label: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#000', // black line
    marginHorizontal: 5,
    marginTop: -20,
  },
});
