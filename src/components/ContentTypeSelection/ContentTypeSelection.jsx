import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import OptionCard from '../OptionCard/OptionCard';
import videoLogo from '../../../assets/video.jpeg';
import pdfLogo from '../../../assets/pdf.jpeg';
import quizLogo from '../../../assets/quiz.jpeg';
import { getCachedList, saveCachedList } from '../../utils/offlineCache';

const BASE = 'https://iqsharp.arvinfocom.com/eduapiapp/api/main';

const ALL_OPTIONS = [
  {
    label: 'Video',
    icon: videoLogo,
    endpoint: (cls, sub, lang) =>
      `${BASE}/getVideos?class_id=${cls}&subject_id=${sub}&lang=${lang}`,
  },
  {
    label: 'PDF',
    icon: pdfLogo,
    endpoint: (cls, sub, lang) =>
      `${BASE}/getPdfs?class_id=${cls}&subject_id=${sub}&lang=${lang}`,
  },
  {
    label: 'Quiz',
    icon: quizLogo,
    endpoint: (cls, sub, lang) =>
      `${BASE}/getQuiz?class_id=${cls}&subject_id=${sub}&lang=${lang}`,
  },
];

export default function ContentTypeSelection({
  onSelect,
  className,
  subjectName,
  language,
}) {
  const [available, setAvailable] = useState({
    Video: false,
    PDF: false,
    Quiz: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!className || !subjectName || !language) return;

    const checkAvailability = async () => {
      setLoading(true);
      const cacheKey = `@edu_content_avail_${className}_${subjectName}_${language}`;

      // Show cached availability immediately so the user isn't stuck on a spinner
      const cached = await getCachedList(cacheKey);
      if (cached) {
        setAvailable(cached);
        setLoading(false);
      }

      // Fetch fresh data; only update if at least one request succeeds
      try {
        const results = await Promise.allSettled(
          ALL_OPTIONS.map(opt =>
            fetch(opt.endpoint(className, subjectName, language)).then(r =>
              r.json(),
            ),
          ),
        );

        const allFailed = results.every(r => r.status === 'rejected');
        if (!allFailed) {
          const next = {};
          results.forEach((result, i) => {
            next[ALL_OPTIONS[i].label] =
              result.status === 'fulfilled' &&
              Array.isArray(result.value.data) &&
              result.value.data.length > 0;
          });
          setAvailable(next);
          await saveCachedList(cacheKey, next);
        }
      } finally {
        setLoading(false);
      }
    };

    checkAvailability();
  }, [className, subjectName, language]);

  const visibleOptions = ALL_OPTIONS.filter(opt => available[opt.label]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Content Type</Text>

      {loading ? (
        <View style={styles.loaderBox}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text style={styles.loaderText}>Checking available content…</Text>
        </View>
      ) : visibleOptions.length === 0 ? (
        <Text style={styles.noContent}>
          No content available for this selection.
        </Text>
      ) : (
        <View style={styles.optionsColumn}>
          {visibleOptions.map(option => (
            <OptionCard
              key={option.label}
              label={`Select ${option.label}`}
              onPress={() => onSelect(option.label)}
              icon={option.icon}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingVertical: 20 },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },
  optionsColumn: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  loaderBox: {
    alignItems: 'center',
    marginTop: 24,
  },
  loaderText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6b7280',
  },
  noContent: {
    textAlign: 'center',
    marginTop: 24,
    fontSize: 15,
    color: '#6b7280',
  },
});
