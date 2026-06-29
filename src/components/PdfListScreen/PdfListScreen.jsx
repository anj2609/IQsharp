import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  TouchableHighlight,
  Image,
  Modal,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { WebView } from 'react-native-webview';

const makePdfViewerHtml = url => {
  const safeUrl = JSON.stringify(url);
  return `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=5,user-scalable=yes">
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{background:#525659;font-family:sans-serif}
    #wrap{padding:4px 0}
    canvas{display:block;margin:6px auto;box-shadow:0 2px 8px rgba(0,0,0,.4)}
    #status{color:#fff;text-align:center;padding:40px 16px;font-size:15px}
    #err{display:none;text-align:center;padding:24px 16px}
    #errmsg{color:#ffcdd2;font-size:13px;margin-bottom:16px}
    .btn{background:#007bff;color:#fff;border:none;padding:10px 18px;border-radius:6px;font-size:14px;margin:4px;cursor:pointer}
    .btn-alt{background:#555}
  </style>
</head>
<body>
  <div id="status">Loading PDF…</div>
  <div id="wrap"></div>
  <div id="err">
    <p id="errmsg"></p>
    <button class="btn" onclick="loadPdf()">Retry</button>
    <button class="btn btn-alt" onclick="openFallback()">Open in Google Viewer</button>
  </div>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
  <script>
    var pdfUrl=${safeUrl};
    pdfjsLib.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    function showErr(msg){
      document.getElementById('status').style.display='none';
      document.getElementById('errmsg').textContent=msg;
      document.getElementById('err').style.display='block';
    }
    function loadPdf(){
      document.getElementById('err').style.display='none';
      document.getElementById('wrap').innerHTML='';
      document.getElementById('status').style.display='block';
      document.getElementById('status').textContent='Loading PDF…';
      pdfjsLib.getDocument({url:pdfUrl,withCredentials:false}).promise.then(function(pdf){
        document.getElementById('status').style.display='none';
        var wrap=document.getElementById('wrap');
        var W=window.innerWidth-8;
        function renderPage(n){
          pdf.getPage(n).then(function(page){
            var scale=W/page.getViewport({scale:1}).width;
            var vp=page.getViewport({scale:scale});
            var canvas=document.createElement('canvas');
            canvas.width=vp.width;
            canvas.height=vp.height;
            wrap.appendChild(canvas);
            page.render({canvasContext:canvas.getContext('2d'),viewport:vp}).promise.then(function(){
              if(n<pdf.numPages)renderPage(n+1);
            });
          }).catch(function(e){showErr('Page error: '+e.message);});
        }
        renderPage(1);
      }).catch(function(e){
        showErr('Could not load PDF — '+e.message);
      });
    }
    function openFallback(){
      window.location.href='https://docs.google.com/viewer?url='+encodeURIComponent(pdfUrl)+'&embedded=true';
    }
    loadPdf();
  </script>
</body>
</html>`;
};

export default function PdfListScreen({ className, subjectName, language }) {
  const [pdfs, setPdfs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activePdf, setActivePdf] = useState(null);

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
    setActivePdf(item.url ? item : { ...item, noUrl: true });
  };

  const closePdf = () => setActivePdf(null);

  const renderItem = ({ item }) => (
    <TouchableHighlight
      onPress={() => openPdf(item)}
      style={styles.card}
      underlayColor="#eee">
      <View style={styles.cardInner}>
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
        <View style={styles.cardText}>
          <Text style={styles.pdfTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.pdfDesc} numberOfLines={3}>
            {item.desc}
          </Text>
        </View>
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

  const pdfHtml = activePdf?.url ? makePdfViewerHtml(activePdf.url) : null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Available PDFs</Text>
      <FlatList
        data={pdfs}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
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
          ) : pdfHtml ? (
            <WebView
              source={{ html: pdfHtml }}
              style={styles.pdf}
              javaScriptEnabled
              domStorageEnabled
              originWhitelist={['*']}
              mixedContentMode="always"
              allowUniversalAccessFromFileURLs
            />
          ) : null}
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
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 10,
    elevation: 4,
  },
  cardInner: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pdfPreviewBox: {
    width: 64,
    height: 52,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
    flexShrink: 0,
  },
  pdfPreviewImage: { width: '100%', height: '100%' },
  pdfBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: 'rgba(220,53,69,0.85)',
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  pdfBadgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  cardText: {
    flex: 1,
    paddingLeft: 12,
  },
  pdfTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
    color: '#111827',
  },
  pdfDesc: { fontSize: 12, color: '#555', marginBottom: 4 },
  emptyText: { textAlign: 'center', marginTop: 40, color: '#060505' },
  flatListContent: { paddingBottom: 40 },
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
