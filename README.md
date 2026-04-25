# 健身 RPG — PWA 部署教學

這份教學會帶你一步一步把這個 App 部署到網路上，然後安裝到手機桌面。

---

## 事前準備（只需要做一次）

### 1. 安裝 Node.js
- 到 https://nodejs.org 下載 **LTS 版本**（綠色按鈕）
- 安裝時一路按「下一步」就好
- 安裝完後，打開「終端機」（Mac）或「命令提示字元」（Windows）
- 輸入以下指令確認安裝成功：
  ```
  node --version
  ```
  如果出現版本號（例如 v20.x.x）就代表成功了

### 2. 註冊 GitHub 帳號
- 到 https://github.com 註冊一個免費帳號

### 3. 註冊 Vercel 帳號
- 到 https://vercel.com 點「Sign Up」
- 選擇「Continue with GitHub」用你的 GitHub 帳號登入
- 這樣 Vercel 就會跟你的 GitHub 連結了

---

## 部署步驟

### 第一步：解壓縮專案

把下載的 `fitness-rpg-pwa.zip` 解壓縮到你電腦上的任意位置，例如桌面。

### 第二步：安裝套件

打開終端機（Mac）或命令提示字元（Windows），輸入：

```bash
cd 你的解壓縮路徑/fitness-rpg-pwa
```

例如如果解壓縮到桌面：
- Mac: `cd ~/Desktop/fitness-rpg-pwa`
- Windows: `cd C:\Users\你的名字\Desktop\fitness-rpg-pwa`

然後執行：

```bash
npm install
```

等它跑完（大約 1-2 分鐘）。

### 第三步：本地測試（選做）

如果你想先在電腦上看看效果：

```bash
npm run dev
```

然後打開瀏覽器，輸入 http://localhost:5173 就能看到 App 了。
按 Ctrl+C 可以停止。

### 第四步：上傳到 GitHub

#### 方法 A：用 GitHub 網頁上傳（最簡單）

1. 打開 https://github.com/new
2. Repository name 填 `fitness-rpg`
3. 選 **Public**
4. 不要勾任何選項
5. 點 **Create repository**
6. 在新建的頁面上，點「uploading an existing file」
7. 把 `fitness-rpg-pwa` 資料夾裡的 **所有檔案** 拖進去
   （注意：是裡面的檔案，不是資料夾本身）
8. 點 **Commit changes**

#### 方法 B：用 Git 命令上傳（如果你有裝 Git）

```bash
git init
git add .
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/你的帳號/fitness-rpg.git
git push -u origin main
```

### 第五步：在 Vercel 上部署

1. 打開 https://vercel.com/dashboard
2. 點 **Add New → Project**
3. 在列表中找到你剛才建的 `fitness-rpg`，點 **Import**
4. Framework Preset 選 **Vite**
5. 其他都不用改，直接點 **Deploy**
6. 等大約 1 分鐘，部署完成！
7. Vercel 會給你一個網址，例如 `fitness-rpg-xxxxx.vercel.app`

### 第六步：安裝到手機桌面

用手機瀏覽器打開 Vercel 給你的網址。

**iPhone（Safari）：**
1. 點底部的「分享」按鈕（方框加箭頭的圖示）
2. 往下滑，找到「加入主畫面」
3. 點「新增」
4. 桌面上就會出現 App 圖示了！

**Android（Chrome）：**
1. 點右上角的三個點選單
2. 選「加到主畫面」或「安裝應用程式」
3. 確認後桌面就會出現圖示

---

## 完成！

現在你的手機桌面上會有一個「健身RPG」的 App，打開後：
- 沒有瀏覽器的網址列，看起來就像原生 App
- 資料會自動儲存在手機上（用 localStorage）
- 每天的訓練進度會自動重置，累計數據會保留
- 不需要網路也能使用（離線模式）

---

## 常見問題

**Q: 部署後修改了程式碼怎麼更新？**
A: 只要把改過的檔案推到 GitHub，Vercel 會自動重新部署。

**Q: 資料會不見嗎？**
A: 資料存在手機的 localStorage 裡，除非你清除瀏覽器資料或按了「重置數據」，否則不會消失。

**Q: 可以分享給朋友用嗎？**
A: 可以！把 Vercel 的網址分享給他們，每個人的資料是獨立的。
