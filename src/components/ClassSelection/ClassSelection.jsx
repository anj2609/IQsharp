import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import OptionCard from '../OptionCard/OptionCard';

export default function ClassSelection({ onSelect, data }) {
  console.log('ClassSelection data:', data);
  if (!Array.isArray(data)) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Class</Text>
      <View style={styles.optionsRow}>
        {data.map(({ class_id, class_name, class_img_url }) => (
          <OptionCard
            key={class_id}
            label={class_name}
            onPress={() => onSelect(class_id)}
            icon={{ uri: class_img_url }}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingVertical: 20 },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 10,
    textAlign: 'center',
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
    gap: 20,
    alignSelf: 'center',
    maxWidth: 800,
    paddingHorizontal: 10,
    paddingBottom: 10,
    marginBottom: 5,
  },
});
