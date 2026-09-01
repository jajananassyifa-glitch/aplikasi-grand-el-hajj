// Import library Firebase secara langsung dari CDN (tidak perlu install npm) 
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getDatabase, ref, push, set } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";
import { getVertexAI, getGenerativeModel } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-vertexai.js";

// 1. Konfigurasi proyek Firebase kamu
const firebaseConfig = {
  apiKey: "AIzaSyD9c5qPl9HGruxNfRvlOoqaxyxe2ZwDoaA",
  authDomain: "aplikasi-grand-el-hajj.firebaseapp.com",
  databaseURL: "https://aplikasi-grand-el-hajj-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "aplikasi-grand-el-hajj",
  storageBucket: "aplikasi-grand-el-hajj.firebasestorage.app",
  messagingSenderId: "205554063779",
  appId: "1:205554063779:web:c8e5de2802ad9824d16216",
  measurementId: "G-NX1GJ7958X"
};

// 2. Inisialisasi Firebase & Layanan
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const vertexAI = getVertexAI(app);

// Inisialisasi model Gemini (Gemini 1.5 Flash)
const geminiModel = getGenerativeModel(vertexAI, { model: "gemini-1.5-flash" });

// 3. Hubungkan ke Elemen HTML
const promptInput = document.getElementById("promptInput");
const btnKirim = document.getElementById("btnKirim");
const output = document.getElementById("output");
const outputContainer = document.getElementById("outputContainer");

// 4. Perintah saat tombol "Kirim Pertanyaan" diklik
btnKirim.addEventListener("click", async () => {
  const teksPertanyaan = promptInput.value.trim();

  if (!teksPertanyaan) {
    alert("Silakan ketik pertanyaan terlebih dahulu!");
    return;
  }

  // Tampilkan status loading
  outputContainer.style.display = "block";
  output.innerHTML = "<span class='loading'>Gemini sedang berpikir...</span>";
  btnKirim.disabled = true;

  try {
    // LANGKAH A: Kirim pertanyaan ke Gemini AI
    const result = await geminiModel.generateContent(teksPertanyaan);
    const jawabanGemini = result.response.text();

    // Tampilkan jawaban ke layar web
    output.innerText = jawabanGemini;

    // LANGKAH B: Simpan riwayat pertanyaan & jawaban ke Firebase Realtime Database
    const riwayatRef = ref(db, "riwayat_chat");
    const pesanBaruRef = push(riwayatRef);
    
    await set(pesanBaruRef, {
      pertanyaan: teksPertanyaan,
      jawaban: jawabanGemini,
      waktu: new Date().toISOString()
    });

    console.log("Berhasil disimpan ke Realtime Database!");

  } catch (error) {
    console.error("Terjadi Kesalahan:", error);
    output.innerHTML = `<span style="color: red;">Gagal mendapatkan jawaban: ${error.message}</span>`;
  } finally {
    btnKirim.disabled = false;
  }
});
