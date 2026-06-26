// File: App.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  ImageBackground,
  Image,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DeviceInfo from 'react-native-device-info';
import LanguageSelection from './src/components/LanguageSelection/LanguageSelection';
import ClassSelection from './src/components/ClassSelection/ClassSelection';
import SubjectSelection from './src/components/SubjectSelection/SubjectSelection';
import StepIndicator from './src/components/StepIndicator/StepIndicator';
import SelectionsSummary from './src/components/SelectionsSummary/SelectionsSummary';
import ContentTypeSelection from './src/components/ContentTypeSelection/ContentTypeSelection';
import VideoListScreen from './src/components/VideoListScreen/VideoListScreen';
import PdfListScreen from './src/components/PdfListScreen/PdfListScreen';
import QuizListScreen from './src/components/QuizListScreen/QuizListScreen';
import backgroundImage from './assets/bg.jpeg';
import appIcon from './assets/banner.jpeg';
import Buttons from './src/components/button/Button';

export default function App() {
  const [step, setStep] = useState(1);
  const [selections, setSelections] = useState({
    language: '',
    class: '',
    subject: '',
    contentType: '',
  });
  const [classData, setClassData] = useState([]);
  const [subjectData, setSubjectData] = useState([]);
  const [subjectLoading, setSubjectLoading] = useState(false);

  // Modal states
  const [showModal, setShowModal] = useState(true);
  const [schoolId, setSchoolId] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  console.log(selections.class, selections.language);
  useEffect(() => {
    const loadData = async () => {
      const savedSelections = await AsyncStorage.getItem('selections');
      const savedStep = await AsyncStorage.getItem('step');
      const savedSchoolId = await AsyncStorage.getItem('schoolId');
      const savedApiKey = await AsyncStorage.getItem('apiKey');

      if (savedSelections) setSelections(JSON.parse(savedSelections));
      if (savedStep) setStep(parseInt(savedStep));
      if (savedSchoolId && savedApiKey) {
        setShowModal(false);
      }

      const fetchClasses = await fetch(
        'https://iqsharp.arvinfocom.com/eduapiapp/api/main/getClassList?page=1&limit=100',
      );
      setClassData(await fetchClasses.json());
    };
    loadData();
  }, []);

  useEffect(() => {
    // Fetch subjects only when step === 3 and language/class are selected
    const fetchSubjects = async () => {
      if (step === 3 && selections.language && selections.class) {
        setSubjectLoading(true);
        try {
          const response = await fetch(
            `https://iqsharp.arvinfocom.com/eduapiapp/api/main/getSubjects?lang=${selections.language}&classid=${selections.class}&page=1&limit=100`,
          );
          const data = await response.json();
          setSubjectData(data);
        } catch (error) {
          setSubjectData({ data: [] });
        } finally {
          setSubjectLoading(false);
        }
      }
    };
    fetchSubjects();
  }, [step, selections.language, selections.class]);

  const handleSubmit = async () => {
    if (!schoolId || !apiKey) {
      setError('Please fill both fields');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const deviceId = DeviceInfo.getDeviceId();
      const response = await fetch(
        'https://iqsharp.arvinfocom.com/eduapiapp/api/main/validateApiKey',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            school_id: schoolId,
            api_key: apiKey,
            device_id: deviceId,
          }),
        },
      );

      // Parse the JSON body
      const data = await response.json();
      console.log(data);
      // Now you can access data.status and data.message
      if (!data.status) {
        setError(data.message || 'Invalid credentials');
        setShowModal(true);
      } else {
        setShowModal(false);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateSelection = async (key, value) => {
    const updated = { ...selections, [key]: value };
    const newStep = step + 1;
    setSelections(updated);
    setStep(newStep);
    await AsyncStorage.setItem('selections', JSON.stringify(updated));
    await AsyncStorage.setItem('step', String(newStep));
  };

  const goBack = async () => {
    const newStep = Math.max(step - 1, 1);
    setStep(newStep);
    await AsyncStorage.setItem('step', newStep.toString());
  };

  const reset = async () => {
    setStep(1);
    setSelections({ language: '', class: '', subject: '', contentType: '' });
    setSubjectData([]);
    await AsyncStorage.multiRemove(['selections', 'step']);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Modal for School ID + API Key */}
      <Modal visible={showModal} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Enter School Credentials</Text>
            <TextInput
              placeholder="Enter School ID"
              placeholderTextColor={'#000'}
              value={schoolId}
              onChangeText={setSchoolId}
              style={styles.input}
            />
            <TextInput
              placeholder="Enter API Key"
              placeholderTextColor={'#000'}
              value={apiKey}
              onChangeText={setApiKey}
              style={styles.input}
            />

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            {loading ? (
              <ActivityIndicator size="large" color="#007bff" />
            ) : (
              <Buttons
                title="Submit"
                onPress={handleSubmit}
                variant="primary"
              />
            )}
          </View>
        </View>
      </Modal>

      <ImageBackground
        source={backgroundImage}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        {step === 5 ? (
          <View style={styles.fullContent}>
            <StepIndicator currentStep={step} onStepPress={setStep} />

            {selections.contentType === 'Video' && (
              <VideoListScreen
                className={selections.class}
                subjectName={selections.subject}
                language={selections.language}
              />
            )}
            {selections.contentType === 'PDF' && (
              <PdfListScreen
                className={selections.class}
                subjectName={selections.subject}
                language={selections.language}
              />
            )}
            {selections.contentType === 'Quiz' && (
              <QuizListScreen
                className={selections.class}
                subjectName={selections.subject}
                language={selections.language}
              />
            )}

            <SelectionsSummary
              selections={selections}
              step={step}
              classData={classData?.data}
              subjectData={subjectData?.data}
            />

            <View style={styles.buttons}>
              <Buttons title="Back" onPress={goBack} variant="primary" />
              <View style={{ marginLeft: 10 }}>
                <Buttons title="Reset" onPress={reset} variant="reset" />
              </View>
            </View>
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.scroll}>
            <StepIndicator currentStep={step} onStepPress={setStep} />

            {step === 1 && (
              <LanguageSelection
                onSelect={value => updateSelection('language', value)}
              />
            )}
            {step === 2 && (
              <ClassSelection
                onSelect={value => updateSelection('class', value)}
                data={classData?.data}
              />
            )}
            {step === 3 && (
              <SubjectSelection
                onSelect={value => updateSelection('subject', value)}
                data={subjectData?.data}
                loading={subjectLoading}
                noData={
                  !subjectLoading &&
                  (!subjectData?.data || subjectData?.data.length === 0)
                }
              />
            )}
            {step === 4 && (
              <ContentTypeSelection
                onSelect={value => updateSelection('contentType', value)}
                className={selections.class}
                subjectName={selections.subject}
                language={selections.language}
              />
            )}

            <SelectionsSummary
              selections={selections}
              step={step}
              classData={classData?.data}
              subjectData={subjectData?.data}
            />

            <View style={styles.buttons}>
              {step > 1 && (
                <Buttons title="Back" onPress={goBack} variant="primary" />
              )}
              <View style={{ marginLeft: 10 }}>
                <Buttons title="Reset" onPress={reset} variant="reset" />
              </View>
            </View>
          </ScrollView>
        )}
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  backgroundImage: { flex: 1 },
  scroll: { padding: 16, paddingBottom: 40 },
  fullContent: { flex: 1, padding: 16, paddingBottom: 40 },
  buttons: { flexDirection: 'row', marginTop: 20, marginBottom: 12 },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '55%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    elevation: 5,
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    color: '#000',
  },
  errorText: { color: 'red', marginBottom: 10 },
});
