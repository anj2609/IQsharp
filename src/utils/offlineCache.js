import AsyncStorage from '@react-native-async-storage/async-storage';
import RNFS from 'react-native-fs';

const FILE_CACHE_KEY = '@edu_file_cache';

function safeFilename(url) {
  const base = url.split('?')[0].split('/').pop() || 'file';
  const sanitized = base.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 60);
  let hash = 0;
  for (let i = 0; i < url.length; i++) {
    hash = ((hash << 5) - hash + url.charCodeAt(i)) | 0;
  }
  const needsExt = !sanitized.includes('.');
  return `${Math.abs(hash)}_${sanitized}${needsExt ? '.bin' : ''}`;
}

export async function getCachedList(key) {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function saveCachedList(key, data) {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(data));
  } catch {}
}

async function loadFileMap() {
  try {
    const raw = await AsyncStorage.getItem(FILE_CACHE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

async function saveFileMap(map) {
  try {
    await AsyncStorage.setItem(FILE_CACHE_KEY, JSON.stringify(map));
  } catch {}
}

export async function getLocalPath(url) {
  if (!url) return null;
  try {
    const map = await loadFileMap();
    const p = map[url];
    if (p && (await RNFS.exists(p))) return p;
    if (p) {
      const updated = { ...map };
      delete updated[url];
      await saveFileMap(updated);
    }
  } catch {}
  return null;
}

export async function downloadFile(url, onProgress) {
  const existing = await getLocalPath(url);
  if (existing) return existing;

  const dest = `${RNFS.DocumentDirectoryPath}/${safeFilename(url)}`;
  const { promise } = RNFS.downloadFile({
    fromUrl: url,
    toFile: dest,
    progressDivider: 5,
    progress: ({ bytesWritten, contentLength }) => {
      if (onProgress && contentLength > 0) {
        onProgress(bytesWritten / contentLength);
      }
    },
  });

  const result = await promise;
  if (result.statusCode >= 200 && result.statusCode < 300) {
    const map = await loadFileMap();
    map[url] = dest;
    await saveFileMap(map);
    return dest;
  }
  throw new Error(`HTTP ${result.statusCode}`);
}

export async function deleteLocalFile(url) {
  try {
    const map = await loadFileMap();
    const p = map[url];
    if (p) {
      try { await RNFS.unlink(p); } catch {}
      const updated = { ...map };
      delete updated[url];
      await saveFileMap(updated);
    }
  } catch {}
}
