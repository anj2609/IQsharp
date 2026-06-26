// File: components/QuizListScreen.js
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableHighlight,
} from 'react-native';
import Buttons from '../button/Button';

export default function QuizListScreen({
  className,
  onSubmit,

  subjectName,
  language,
}) {
  const [quizData, setQuizData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const fetchQuiz = async () => {
      setLoading(true);
      try {
        const url = `https://iqsharp.arvinfocom.com/eduapiapp/api/main/getQuiz?class_id=${className}&subject_id=${subjectName}&lang=${language}`;
        const res = await fetch(url);
        const json = await res.json();
        setQuizData(json.data || []);
      } catch (e) {
        console.log('Quiz fetch error', e);
        setQuizData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [className, subjectName, language]);

  const handleAnswer = (qid, option) => {
    setAnswers(prev => ({ ...prev, [qid]: option }));
  };

  const next = () => setCurrent(c => Math.min(c + 1, quizData.length - 1));
  const prev = () => setCurrent(c => Math.max(c - 1, 0));

  const submit = () => {
    let correct = 0;
    quizData.forEach(q => {
      if (answers[q.quiz_id] === q.right_answer) correct++;
    });
    const score = (correct / quizData.length) * 100;
    setSubmitted(true);
    onSubmit && onSubmit(score);
  };

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} />;

  if (!quizData.length) {
    return (
      <View style={styles.centered}>
        <Text style={styles.noQuiz}>No quiz found for this class.</Text>
      </View>
    );
  }

  if (submitted) {
    return (
      <>
        <View style={styles.results}>
          <Text style={styles.title}>Your Score</Text>
          <Text style={styles.score}>{` ${(
            (Object.values(answers).filter(
              (val, i) => val === quizData[i].right_answer,
            ).length /
              quizData.length) *
            100
          ).toFixed(2)}%`}</Text>
        </View>
        <View style={{ marginTop: 24, width: '100%', paddingBottom: 40 }}>
          {quizData
            .filter(q => answers[q.quiz_id])
            .map((q, idx) => (
              <View key={q.quiz_id} style={{ marginBottom: 16 }}>
                <Text style={{ fontWeight: 'bold' }}>{`${idx + 1}. ${
                  q.question
                }`}</Text>
                <Text>
                  Your Answer:{' '}
                  <Text
                    style={{
                      color:
                        answers[q.quiz_id] === q.right_answer ? 'green' : 'red',
                    }}
                  >
                    {q[`option_${answers[q.quiz_id]}`] || 'Not answered'}
                  </Text>
                </Text>
                <Text>
                  Correct Answer:{' '}
                  <Text style={{ color: 'green' }}>
                    {q[`option_${q.right_answer}`]}
                  </Text>
                </Text>
              </View>
            ))}
        </View>
      </>
    );
  }

  const q = quizData[current];
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{q?.question || ''}</Text>
      <View style={styles.optionsRow}>
        {['a', 'b', 'c', 'd'].map(key => (
          <View key={key} style={styles.optionWrapper}>
            <TouchableHighlight
              onPress={() => handleAnswer(q.quiz_id, key)}
              style={[
                styles.option,
                answers[q.quiz_id] === key && styles.selected,
              ]}
              // underlayColor="#ccc"
              focusable={true}
            >
              <View style={styles.card}>
                <Text
                  style={[
                    styles.optionText,
                    answers[q.quiz_id] === key && styles.selectedText,
                  ]}
                >
                  {q[`option_${key}`]}
                </Text>
              </View>
            </TouchableHighlight>
          </View>
        ))}
      </View>
      <View style={styles.navButtons}>
        {current > 0 && <Buttons title="Previous" onPress={prev} />}
        {current < quizData.length - 1 && (
          <Buttons title="Next" onPress={next} />
        )}
        <Buttons title="Submit" onPress={submit} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 40 },
  card: {
    backgroundColor: '#fff',
    padding: 20,
    margin: 8,
    borderRadius: 16,
    elevation: 4,
    alignItems: 'center',
    width: 150,
    height: 80,
    justifyContent: 'space-between',
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
  results: {
    backgroundColor: '#fff',
    padding: 20,
    margin: 8,
    borderRadius: 140,
    elevation: 4,
    alignItems: 'center',
    justifyContent: 'center',
    width: 280,
    height: 280,
    alignSelf: 'center',
  },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 23, fontWeight: 'bold', marginBottom: 12 },
  score: { fontSize: 50, fontWeight: '900', color: 'green' },
  noQuiz: { fontSize: 18, color: '#888' },
  optionWrapper: {
    // alignItems: 'center',
  },
  // option: {
  //   padding: 14,
  //   marginVertical: 6,
  //   // backgroundColor: '#f0f0f0',
  //   // borderRadius: 8,
  // },
  selected: {
    backgroundColor: '#007bff',
    borderRadius: 16,
  },
  selectedText: {
    color: '#000',
    fontWeight: 'bold',
  },
  optionText: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '600',
    textAlign: 'center',
  },
  navButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 16,
  },
});
