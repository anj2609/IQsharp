import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import OptionCard from '../OptionCard/OptionCard';

export default function SubjectSelection({ onSelect, data, loading, noData }) {
  if (loading) {
    return (
      <View style={{ alignItems: 'center', marginVertical: 20 }}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }
  if (noData) {
    return (
      <View style={{ alignItems: 'center', marginVertical: 20 }}>
        <Text>No Subject Available</Text>
      </View>
    );
  }
  console.log('SubjectSelection data:', data);
  if (!Array.isArray(data)) return null;
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Subject</Text>
      <ScrollView>
        <View style={styles.optionsRow}>
          {data.map(({ subject_id, subject_name, subject_img_url }) => (
            <OptionCard
              key={subject_id}
              label={subject_name}
              onPress={() => onSelect(subject_id)}
              icon={{ uri: subject_img_url }} // Assuming a URL pattern for subject icons
            />
          ))}
        </View>
      </ScrollView>
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
