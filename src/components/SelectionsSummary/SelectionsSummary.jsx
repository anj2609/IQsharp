// File: SelectionsSummary.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function SelectionsSummary({
  selections,
  step,
  classData,
  subjectData,
}) {
  const tags = Object.entries(selections).filter(([k, v]) => v);

  const getReadableValue = (key, value) => {
    console.log(`getReadableValue called with key: ${key}, value: ${value}`);
    if (key === 'class' && Array.isArray(classData)) {
      const classItem = classData.find(item => item.class_id === value);
      return classItem ? classItem.class_name : value;
    }
    if (key === 'subject' && Array.isArray(subjectData)) {
      const subjectItem = subjectData.find(item => item.subject_id === value);
      return subjectItem ? subjectItem.subject_name : value;
    }

    return value;
  };
  const getSubjectReadableValue = (key, value) => {
    console.log(`getReadableValue called with key: ${key}, value: ${value}`);

    if (key === 'subject' && Array.isArray(subjectData)) {
      const subjectItem = subjectData.find(item => item.subject_id === value);
      return subjectItem ? subjectItem.subject_name : value;
    }

    return value;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Selections</Text>
      <View style={styles.tags}>
        {tags.map(([k, v]) => (
          <Text key={k} style={styles.tag}>
            {`${k.charAt(0).toUpperCase() + k.slice(1)}: ${getReadableValue(
              k,
              v,
            )}`}
            {k === 'subject' ? `: ${getSubjectReadableValue(k, v)}` : ''}
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 30,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 3,
  },
  title: {
    fontWeight: '700',
    fontSize: 18,
    marginBottom: 10,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    padding: 6,
    backgroundColor: '#e3e3e3',
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
  },
});
