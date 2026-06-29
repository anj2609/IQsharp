// components/OptionCard.js
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View, Image, Dimensions } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

export default function OptionCard({ label, icon, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.previewBox}>
        <Image source={icon} style={styles.icon} resizeMode="contain" />
      </View>
      <Text style={styles.text}>{label}</Text>
      <Text style={styles.arrow}>&#8250;</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    padding: 12,
    marginVertical: 8,
    borderRadius: 16,
    elevation: 4,
    flexDirection: 'row',
    alignItems: 'center',
    width: screenWidth - 40,
  },
  previewBox: {
    width: 90,
    height: 70,
    borderRadius: 10,
    overflow: 'hidden',
    marginRight: 14,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    width: '100%',
    height: '100%',
  },
  text: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  arrow: {
    fontSize: 28,
    color: '#9ca3af',
  },
});
