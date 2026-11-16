# 董勳遠｜主任的教育行動誌 NEW2

這是從 `1.116年履歷表.pdf` 重新建立的全新教育個人網站。網站不直接貼出 PDF，而是把 68 頁資料拆解為「人物成長、教育飛輪、完整歷程、行動現場、教育成果、治校願景」六個閱讀入口。

## 內容與素材

- `analysis/`：本機逐頁文字、頁面縮圖、照片索引與完整分析資料；為避免敏感個資，預設不推送到 GitHub。
- `assets/photos/original/`：從 PDF 逐張擷取的原始內嵌圖片。
- `assets/photos/classified/`：依 `profile-awards`、`sport-international`、`character-care`、`reading-vision`、`innovation-community`、`leadership` 分類的可展示照片。
- `data/photo-index.json`：照片來源頁碼、尺寸與分類索引。
- `data/content.json`：網站內容資料，後續可以只改資料不改版型。

## 本機預覽

```bash
python -m http.server 8010
```

開啟 <http://localhost:8010>。

## 重新分析 PDF

指定 PDF 位於 `C:\Users\Administrator\Downloads\1.116年履歷表.pdf`。若 PDF 更新，執行：

```bash
python scripts/analyze_pdf.py
python scripts/classify_photos.py
Copy-Item analysis/photo-index.json data/photo-index.json -Force
```

分析結果包含 68 張逐頁縮圖與 442 個內嵌影像索引；網站會使用瀏覽器可呈現且尺寸合適的照片，完整原始擷取仍保留在本機素材資料夾。

## 網站功能

- 所有主要頁面都有「中／大／特大」文字大小切換。
- 所有主要頁面都有淺／深／綠／藍背景切換，設定會保存在瀏覽器。
- 照片庫依六大教育主題篩選，並保留 PDF 來源頁碼。
- QR 分享頁包含主要短網址、主要 QR、GitHub Pages 備用連結與備用 QR。
- `scripts/test_site.py` 以 Playwright 驗證四頁載入、圖片、切換控制、篩選與手機版橫向溢出。

## 隱私提醒

公開版不放身分證號、住址、電話、電子郵件、家屬資料與原始 PDF。部署前仍請確認所有人物照片的公開授權與使用範圍。
