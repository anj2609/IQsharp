import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  Image,
  Modal,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { WebView } from 'react-native-webview';

const { width, height } = Dimensions.get('window');

const makeThumbnailHtml = uri => {
  const safeUri = JSON.stringify(uri);
  return `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1"><style>*{margin:0;padding:0;box-sizing:border-box}html,body{width:100%;height:100%;overflow:hidden;background:#1a1a2e}video{width:100%;height:100%;object-fit:cover;display:block}</style></head><body><video id="v" muted playsinline webkit-playsinline preload="auto"></video><script>var v=document.getElementById('v');v.src=${safeUri};v.addEventListener('loadeddata',function(){v.currentTime=0;v.pause();});v.play().catch(function(){});<\/script></body></html>`;
};

const VideoThumbnail = ({ uri, videoUri, onPress }) => {
  const [imgError, setImgError] = useState(!uri);
  return (
    <TouchableOpacity onPress={onPress} style={styles.thumbnailWrapper}>
      {!imgError ? (
        <Image
          source={{ uri }}
          style={styles.thumbnail}
          resizeMode="cover"
          onError={() => setImgError(true)}
        />
      ) : videoUri ? (
        <View pointerEvents="none" style={styles.thumbnail}>
          <WebView
            source={{ html: makeThumbnailHtml(videoUri) }}
            style={{ flex: 1 }}
            scrollEnabled={false}
            javaScriptEnabled
            mediaPlaybackRequiresUserAction={false}
          />
        </View>
      ) : (
        <View style={styles.thumbPlaceholder}>
          <Text style={styles.thumbPlaceholderText}>▶</Text>
        </View>
      )}
      <View style={styles.playOverlay}>
        <Text style={styles.playLabel}>▶ Play</Text>
      </View>
    </TouchableOpacity>
  );
};

export default function VideoListScreen({ className, subjectName, language }) {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeVideo, setActiveVideo] = useState(null);

  useEffect(() => {
    const fetchVideos = async () => {
      setLoading(true);
      try {
        if (!className || !subjectName || !language)
          throw new Error('Missing input');
        const url = `https://iqsharp.arvinfocom.com/eduapiapp/api/main/getVideos?class_id=${className}&subject_id=${subjectName}&lang=${language}`;
        const res = await fetch(url);
        const json = await res.json();
        const data = json.data || [];
        if (data.length > 0) {
          console.log('[Video] sample video_url:', data[0].video_url);
          console.log('[Video] sample thumbnail_url:', data[0].thumbnail_url);
        } else {
          console.log('[Video] API returned empty data');
        }
        setVideos(data);
      } catch {
        setVideos([]);
      } finally {
        setLoading(false);
      }
    };
    fetchVideos();
  }, [className, subjectName, language]);

  const renderItem = useCallback(
    ({ item }) => (
      <View style={styles.card}>
        <VideoThumbnail
          uri={item.thumbnail_url}
          videoUri={item.video_url}
          onPress={() => setActiveVideo(item)}
        />
        <View style={styles.cardText}>
          <Text style={styles.videoTitle} numberOfLines={2}>
            {item.video_title}
          </Text>
          <Text style={styles.videoDesc} numberOfLines={3}>
            {item.video_description}
          </Text>
        </View>
      </View>
    ),
    [],
  );

  if (loading)
    return <ActivityIndicator size="large" style={{ marginTop: 40 }} />;

  const hasVideoUrl = !!activeVideo?.video_url;
  const videoHtml = hasVideoUrl
    ? `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1"><style>*{margin:0;padding:0;box-sizing:border-box}html,body{width:100%;height:100%;background:#000}video{width:100%;height:100%;display:block;object-fit:contain}</style></head><body><video src="${activeVideo.video_url}" controls autoplay muted playsinline webkit-playsinline></video></body></html>`
    : '';

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Available Videos</Text>
      <FlatList
        data={videos}
        renderItem={renderItem}
        keyExtractor={v => String(v.video_id)}
        contentContainerStyle={styles.list}
        windowSize={5}
        initialNumToRender={4}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            No videos found for this selection.
          </Text>
        }
      />

      <Modal
        visible={!!activeVideo}
        animationType="slide"
        onRequestClose={() => setActiveVideo(null)}>
        <SafeAreaView style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={() => setActiveVideo(null)}>
            <Text style={styles.closeBtnText}>✕ Close</Text>
          </TouchableOpacity>
          {activeVideo && (
            <>
              <Text style={styles.modalTitle} numberOfLines={2}>
                {activeVideo.video_title}
              </Text>
              {!hasVideoUrl ? (
                <View style={styles.noUrlBox}>
                  <Text style={styles.noUrlText}>
                    Video URL not available for this item.
                  </Text>
                </View>
              ) : (
              <WebView
                source={{ html: videoHtml }}
                style={styles.videoPlayer}
                mediaPlaybackRequiresUserAction={false}
                allowsInlineMediaPlayback
                javaScriptEnabled
                domStorageEnabled
                allowsFullscreenVideo
                originWhitelist={['*']}
                startInLoadingState
                renderLoading={() => (
                  <View style={styles.webviewLoader}>
                    <ActivityIndicator size="large" color="#007bff" />
                  </View>
                )}
              />
              )}
            </>
          )}
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingVertical: 10 },
  title: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },
  list: { paddingHorizontal: 16, paddingBottom: 40 },
  card: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 12,
    marginVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 3,
  },
  thumbnailWrapper: {
    width: 140,
    height: 90,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#1a1a2e',
    flexShrink: 0,
  },
  thumbnail: { width: '100%', height: '100%' },
  thumbPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#1a1a2e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbPlaceholderText: { color: '#fff', fontSize: 32 },
  playOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.45)',
    paddingVertical: 4,
    alignItems: 'center',
  },
  playLabel: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  cardText: {
    flex: 1,
    paddingLeft: 12,
  },
  videoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  videoDesc: { fontSize: 12, color: '#555' },
  emptyText: { textAlign: 'center', marginTop: 40, color: '#060505' },
  modalContainer: { flex: 1, backgroundColor: '#000' },
  closeBtn: {
    padding: 14,
    alignSelf: 'flex-start',
  },
  closeBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  modalTitle: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    paddingHorizontal: 14,
    marginBottom: 8,
  },
  videoPlayer: { flex: 1, backgroundColor: '#000' },
  webviewLoader: {
    position: 'absolute',
    top: 0,
    left: 0,
    width,
    height,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noUrlBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  noUrlText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
  },
});
