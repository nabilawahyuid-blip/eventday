import React, { useState, useEffect, useRef } from "react";

// Komponen banner event bersama (dipakai TambahEvent & EditEvent).
// Kontrak backend: create/update dikirim multipart — part "event" (JSON)
// + part "file" (gambar opsional). Komponen ini TIDAK upload sendiri;
// file yang dipilih + URL alternatif dilaporkan ke parent via onChange,
// lalu parent menyertakannya saat submit.
//
// Props:
// - initialUrl: string — banner yang sudah tersimpan (mode edit)
// - onChange: ({file: File|null, url: string, urlValid: bool}) => void
function EventBannerUpload({ initialUrl = "", onChange }) {
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [url, setUrl] = useState(initialUrl || "");
  const [urlCheck, setUrlCheck] = useState("idle"); // idle|checking|ok|error
  const [error, setError] = useState(null);
  const fileRef = useRef(null);

  // Sinkron saat data edit selesai dimuat
  useEffect(() => {
    setUrl(initialUrl || "");
  }, [initialUrl]);

  // Lapor ke parent setiap banner berubah
  useEffect(() => {
    if (onChange) {
      onChange({ file, url: (url || "").trim(), urlValid: urlCheck !== "error" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file, url, urlCheck]);

  // Bebaskan object URL lama
  useEffect(() => {
    return () => {
      if (filePreview) URL.revokeObjectURL(filePreview);
    };
  }, [filePreview]);

  // Validasi URL tempel: harus benar-benar file gambar yang bisa dimuat
  useEffect(() => {
    const value = (url || "").trim();
    if (!value) {
      setUrlCheck("idle");
      return;
    }
    setUrlCheck("checking");
    let cancelled = false;
    const t = setTimeout(() => {
      const img = new Image();
      img.onload = () => { if (!cancelled) setUrlCheck("ok"); };
      img.onerror = () => { if (!cancelled) setUrlCheck("error"); };
      img.src = value;
    }, 500);
    return () => { cancelled = true; clearTimeout(t); };
  }, [url]);

  const handleFile = (e) => {
    const picked = e.target.files?.[0];
    if (!picked) return;
    setError(null);
    if (!picked.type || !picked.type.startsWith("image/")) {
      setError("File harus berupa gambar (PNG/JPG/JPEG).");
      return;
    }
    if (picked.size > 5 * 1024 * 1024) {
      setError("Ukuran file maksimal 5MB.");
      return;
    }
    if (filePreview) URL.revokeObjectURL(filePreview);
    setFile(picked);
    setFilePreview(URL.createObjectURL(picked));
  };

  const handleRemoveFile = () => {
    if (filePreview) URL.revokeObjectURL(filePreview);
    setFile(null);
    setFilePreview(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleRemoveUrl = () => {
    setUrl("");
  };

  // File yang dipilih menang atas URL (backend simpan file ke uploads/event-banners/)
  const previewSrc = filePreview || (urlCheck !== "error" ? url.trim() : null);

  return (
    <div>
      {/* Preview banner */}
      {previewSrc ? (
        <div className="preview-container" style={{ marginBottom: 12 }}>
          <img src={previewSrc} alt="Preview banner event" className="banner-preview-img" />
          {file ? (
            <button
              type="button"
              className="btn-change-file"
              onClick={handleRemoveFile}
            >
              Hapus File ({file.name})
            </button>
          ) : (
            <button
              type="button"
              className="btn-change-file"
              onClick={handleRemoveUrl}
            >
              Hapus Banner
            </button>
          )}
        </div>
      ) : null}

      {/* Pilih file dari perangkat — terkirim sebagai part "file" saat submit */}
      <div className="upload-dropzone" style={{ marginBottom: 12 }}>
        <div className="upload-icon">☁️</div>
        <p className="upload-title">Upload Banner Event (16:9)</p>
        <span className="upload-subtitle">
          PNG / JPG / JPEG, maksimal 5MB. File terkirim bersama form dan disimpan ke server.
        </span>
        <input
          ref={fileRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/webp"
          className="file-input-hidden"
          onChange={handleFile}
        />
      </div>

      {error && (
        <p style={{ color: "#dc6868", marginBottom: 12 }}>{error}</p>
      )}

      {/* Alternatif: tempel URL gambar langsung (dipakai bila tidak pilih file) */}
      <div className="form-group full">
        <label>ATAU TEMPEL URL GAMBAR</label>
        <input
          type="url"
          placeholder="https://... (opsional, diabaikan bila file dipilih)"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        {urlCheck === "checking" && (
          <span className="upload-subtitle">Mengecek URL gambar...</span>
        )}
        {urlCheck === "ok" && !file && (
          <span className="upload-subtitle" style={{ color: "#2e9e5b" }}>
            ✓ URL valid, gambar bisa dimuat.
          </span>
        )}
        {urlCheck === "error" && !file && (
          <span className="upload-subtitle" style={{ color: "#dc6868" }}>
            ✕ URL ini bukan file gambar langsung / diblokir. Pakai “Copy image address”, bukan link halaman.
          </span>
        )}
      </div>
    </div>
  );
}

export default EventBannerUpload;
