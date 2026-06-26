// LanguageSelection.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import OptionCard from '../OptionCard/OptionCard';
import { ScrollView } from 'react-native';
export default function LanguageSelection({ onSelect }) {
  return (
    <ScrollView showsVerticalScrollIndicator={false}>
    <View style={styles.container}>
      <Text style={styles.title}>Select Language</Text>
      <Text style={styles.subtitle}>
        Choose your preferred option to continue
      </Text>
      <View style={styles.optionsColumn}>
        <OptionCard
          label="English"
          icon={require('../../../assets/2.jpeg')}
          onPress={() => onSelect('English')}
        />
        <OptionCard
          label="हिंदी"
          icon={require('../../../assets/1.jpeg')}
          onPress={() => onSelect('Hindi')}
        />
        <OptionCard
          label="मराठी"
          icon={require('../../../assets/Marathi.png')}
          onPress={() => onSelect('Marathi')}
        />
        <OptionCard
          label="बंगाली"
          icon={require('../../../assets/Bangla.png')}
          onPress={() => onSelect('Bangali')}
        />
        <OptionCard
          label="कन्नड़"
          icon={require('../../../assets/Kannada.png')}
          onPress={() => onSelect('Kannad')}
        />
        <OptionCard
          label="गुजराती"
          icon={require('../../../assets/Gujrati.png')}
          onPress={() => onSelect('Gujrati')}
        />
        <OptionCard
          label="पंजाबी"
          icon={require('../../../assets/Punjabi.png')}
          onPress={() => onSelect('Punjabi')}
        />
      </View>
    </View>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },

  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#eaf6ff',
  },

  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 10,
    color: '#111827',
  },

  subtitle: {
    fontSize: 16,
    color: '#000',
    marginBottom: 30,
  },

  optionsColumn: {
    flexDirection: 'column',
    alignItems: 'center',
  },
});
// const styles = StyleSheet.create({
//   container: {
//     // paddingVertical: 40,
//     // paddingHorizontal: 20,
//     backgroundColor: '#eaf6ff',
//     flex: 1,
//     // minHeight: '100vh',
//     // minWidth: '100vw',
//   },
//   title: {
//     fontSize: 28,
//     fontWeight: '700',
//     marginBottom: 10,
//     color: '#111827',
//   },
//   subtitle: {
//     fontSize: 16,
//     color: '#000',
//     marginBottom: 30,
//   },
//   optionsRow: {
//     flexDirection: 'row',
//     justifyContent: 'flex-start',
//   },


// });
