import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  TouchableHighlight,
  Image,
  Dimensions,
  Modal,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { WebView } from 'react-native-webview';

const { height, width } = Dimensions.get('window');

export default function PdfListScreen({ className, subjectName, language }) {
  const [pdfs, setPdfs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activePdf, setActivePdf] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(false);

  useEffect(() => {
    const fetchPdfs = async () => {
      setLoading(true);
      try {
        const url = `https://iqsharp.arvinfocom.com/eduapiapp/api/main/getPdfs?class_id=${className}&subject_id=${subjectName}&lang=${language}`;
        const res = await fetch(url);
        const json = await res.json();
        if (json.data?.length > 0) {
          console.log('[PDF] sample pdf_url:', json.data[0].pdf_url);
        } else {
          console.log('[PDF] API returned empty data');
        }
        setPdfs(
          json.data?.map(item => ({
            id: item.pdf_id,
            title: item.pdf_title,
            desc: item.pdf_description,
            url: item.pdf_url,
          })) || [],
        );
      } catch (err) {
        console.log('PDF fetch error', err);
        setPdfs([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPdfs();
  }, [className, subjectName, language]);

  const openPdf = item => {
    if (!item.url) {
      setActivePdf({ ...item, noUrl: true });
      return;
    }
    setPdfLoading(true);
    setActivePdf(item);
  };

  const closePdf = () => {
    setActivePdf(null);
    setPdfLoading(false);
  };

  const renderItem = ({ item }) => (
    <TouchableHighlight
      onPress={() => openPdf(item)}
      style={styles.card}
      underlayColor="#eee">
      <View>
        <View style={styles.pdfPreviewBox}>
          <Image
            source={require('../../../assets/pdf.jpeg')}
            style={styles.pdfPreviewImage}
            resizeMode="cover"
          />
          <View style={styles.pdfBadge}>
            <Text style={styles.pdfBadgeText}>PDF</Text>
          </View>
        </View>
        <Text style={styles.pdfTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.pdfDesc} numberOfLines={2}>
          {item.desc}
        </Text>
      </View>
    </TouchableHighlight>
  );

  if (loading) {
    return (
      <ActivityIndicator
        size="large"
        color="#007bff"
        style={{ marginTop: 40 }}
      />
    );
  }

  // Android WebView cannot render PDFs natively — always use Google Docs Viewer
  const pdfSource = activePdf?.url
    ? {
        uri: `https://docs.google.com/viewer?url=${encodeURIComponent(activePdf.url)}&embedded=true`,
      }
    : null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Available PDFs</Text>
      <FlatList
        data={pdfs}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        numColumns={2}
        initialNumToRender={6}
        windowSize={3}
        contentContainerStyle={styles.flatListContent}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            No PDFs found for this selection.
          </Text>
        }
      />

      <Modal
        visible={!!activePdf}
        animationType="slide"
        onRequestClose={closePdf}>
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={closePdf} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕ Close</Text>
            </TouchableOpacity>
          </View>

          {activePdf && (
            <Text style={styles.modalTitle} numberOfLines={1}>
              {activePdf.title}
            </Text>
          )}

          {activePdf?.noUrl ? (
            <View style={styles.noUrlBox}>
              <Text style={styles.noUrlText}>
                PDF URL not available for this item.
              </Text>
            </View>
          ) : pdfSource ? (
            <WebView
              source={pdfSource}
              style={styles.pdf}
              javaScriptEnabled
              domStorageEnabled
              originWhitelist={['*']}
              onLoadStart={() => setPdfLoading(true)}
              onLoadEnd={() => setPdfLoading(false)}
              onError={() => setPdfLoading(false)}
            />
          ) : null}

          {pdfLoading && (
            <View style={styles.loaderOverlay}>
              <ActivityIndicator size="large" color="#007bff" />
              <Text style={styles.loadingText}>Loading PDF...</Text>
            </View>
          )}
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingVertical: 10, flex: 1 },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    padding: 10,
    margin: 8,
    borderRadius: 10,
    elevation: 4,
    alignItems: 'center',
    width: 220,
  },
  pdfPreviewBox: {
    width: 200,
    height: 120,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 8,
    backgroundColor: '#f0f0f0',
  },
  pdfPreviewImage: { width: '100%', height: '100%' },
  pdfBadge: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    backgroundColor: 'rgba(220,53,69,0.85)',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  pdfBadgeText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  pdfTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
  },
  pdfDesc: { fontSize: 11, color: '#555', marginBottom: 4, textAlign: 'center' },
  emptyText: { textAlign: 'center', marginTop: 40, color: '#060505' },
  flatListContent: { alignItems: 'center', paddingBottom: 40 },
  modalContainer: { flex: 1, backgroundColor: '#fff' },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  closeBtn: { padding: 6 },
  closeBtnText: { color: '#007bff', fontSize: 16, fontWeight: '600' },
  modalTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  pdf: { flex: 1 },
  loaderOverlay: {
    position: 'absolute',
    top: 80,
    left: 0,
    width: width,
    height: height,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  loadingText: { marginTop: 12, color: '#374151', fontWeight: '600' },
  noUrlBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  noUrlText: {
    color: '#374151',
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
  },
});
