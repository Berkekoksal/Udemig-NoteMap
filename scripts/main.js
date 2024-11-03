import { personIcon } from "./constants.js";
import { ui } from "./ui.js";
import getStatus, { getIcon } from "./helpers.js";

//* Global Değişkenler
//* Haritadaki tıklanan son konum
let clickedCoords;
//* String'i diziye çevirdik.`JSON.parse`
let notes = JSON.parse(localStorage.getItem("notes")) || [];
// console.log(notes);
let layer;
let map;
/*
 * Kullanıcının konumunu öğrenmek için `getCurrentPosition` methodunu kullanacağız.
 * Kullanıcıya konumu soracagız.
 * 1. Kullanıcı kabul ederse haritayı kullanıcının konumuna göre ayarlayacağız.
 * 2. Kullanıcı kabul etmez ise haritayı başka ülkeye ayarlayacağız.
 */
// console.log(window.navigator.geolocation.getCurrentPosition);
//* Güncel konumu öğrendik.
window.navigator.geolocation.getCurrentPosition(
  (e) => {
    loadMap([e.coords.latitude, e.coords.longitude], "Current Location");
  },
  () => {
    // console.log("Kabul edilmedi !!! ");
    //* Başlangıç Konumu London yapıldı.
    loadMap([51.51091, -0.129064], "Default Location");
  }
);
//* Haritayı yükler.
function loadMap(currentPosition, msg) {
  // console.log("Mevcut Konum", currentPosition);
  //* 1) id'si map olan elemaının içine haritayı bas. dizi içindekiler koordinatlar , sonrası ise zoom oranı.

  map = L.map("map", { zoomControl: false }).setView(currentPosition, 10);
  //* Sağ aşağıya zoom buttonları ekledik.
  L.control
    .zoom({
      position: "bottomright",
    })
    .addTo(map);
  //* 2) Haritayı ekrana bastık.

  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 15,
    attribution:
      '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(map);

  //* Haritanın üzerine imkeçleri ekleyeceğimiz bir katman oluşturacağız.

  layer = L.layerGroup().addTo(map);

  //* 3)İmleç Ekle
  // let marker = L.marker([51.5, 0]).addTo(map);

  L.marker(currentPosition, { icon: personIcon }).addTo(map).bindPopup(msg);

  //* 4) Haritada tıklama olaylarını izleme.

  map.on(
    "click",
    onMapClick

    //* Tıklanıldığında Enlem boylam bilgisi alınıyor.
    // console.log("Tıklandı", e.latlng);
  );
  //* Ekrana daha önce eklenen notları bas

  renderNotes();
  renderMarkers();
}
//* Tıklanma olayında çalışacak fonksiyon
function onMapClick(e) {
  //* Tıklanma konumun koordinatlarını global değişkene aktar.
  clickedCoords = [e.latlng.lat, e.latlng.lng];
  //* aside elementine add class'ını ekleyeceğiz.
  ui.aside.className = "add";
}
//* İptal butonuna tıklanınca menüyü kapat.
ui.cancelBtn.addEventListener("click", () => {
  //* aside elementinden add class'ını kaldırmak.
  ui.aside.className = "";
});
//* Form Gönderilince.
ui.form.addEventListener("submit", (e) => {
  //* Sayfa yenilenmesini engelledik.
  e.preventDefault();
  //* Inputlardaki verilere eriş.
  // console.dir(e.target[0].value);
  const title = e.target[0].value;
  const date = e.target[1].value;
  const status = e.target[2].value;
  //* Yeni bir nesne oluştur.
  // console.log(title, date, status);
  const newNote = {
    id: new Date().getTime(),
    title,
    date,
    status,
    coords: clickedCoords,
  };
  //* Nesneyi global değişkene kaydet.
  notes.unshift(newNote);
  //* LocalStorage'i güncelle.
  localStorage.setItem("notes", JSON.stringify(notes));
  //* aside alanından add class'ını kaldıracağız.
  ui.aside.className = "";
  //* Formu temizleyeceğiz.
  e.target.reset();
  //* Form gönderildiği zaman ekrana yeni eklenen notu gösterdik.
  renderNotes();
  renderMarkers();
});
//* Elimizdeki diziyi dönüp yeni card'lar ekrana basacağız.
function renderNotes() {
  ui.list.innerHTML = notes
    .map((item) => {
      //* Tarihi kullanıcı dostu hale getirdik.
      const date = new Date(item.date).toLocaleString("en", {
        day: "2-digit",
        month: "long",
        year: "2-digit",
      });
      //* Status değerini çevirdik.
      const status = getStatus(item.status);
      //* Oluşturulacak note'un HTML içeriğini belirledik.
      return `

         <li data-id="${item.id}">
            <div class="info">
              <p>${item.title}</p>
              <p>${date}</p>
              <p>${status}</p>
            </div>
            <div class="icons">
              <i data-id="${item.id}" class="bi bi-airplane-fill" id="fly"></i>
              <i data-id="${item.id}" class="bi bi-trash-fill" id="trash"></i>
            </div>
          </li>
  `;
    })
    .join("");
  // console.log(notesCards);
  // ui.list.innerHTML = notes;
  //* Ekrandaki trash id'li elemanların hepsini aldık ve tıklanma olaylarında deleteNote function çağırdık.
  const deleteBtn = document.querySelectorAll("li #trash");
  // console.log(deleteBtn);
  deleteBtn.forEach((btn) => {
    btn.addEventListener("click", () => deleteNote(btn.dataset.id));
  });
  //* Ekrandaki fly id'li elemanların hepsini aldık ve tıklanma olaylarında flyNote function çağırdık.
  const flyBtn = document.querySelectorAll("li #fly");
  flyBtn.forEach((btn) => {
    btn.addEventListener("click", () => flyNote(btn.dataset.id));
  });
}
//* Ekrana imleçleri basacağız.
function renderMarkers() {
  //* Eski imleçleri kaldıracağız (layerdeki imleçleri sileceğiz).
  layer.clearLayers();
  notes.forEach((note) => {
    //* Marker oluşturacağız.
    // console.log(note);
    // console.log(note.status);
    //* Note status'e bağlı icon'u belirledik.
    const icon = getIcon(note.status);
    //* Oluşturduğumuz markerleri layer katamnına ekledik ve ekranda gösterdik son olarak popup ekledik.
    L.marker(note.coords, { icon }).addTo(layer).bindPopup(note.title);
  });
}
//* Silme butonuna tıklanınca.
function deleteNote(id) {
  //* Kullaniciya sor/
  const res = confirm(`Delete for your note ?`);
  //* Onaylarsa sil.
  if (res) {
    // console.log("siliniyor...");
    // console.log(notes);
    // console.log(id);
    //* id'sini bildiğimiz elemanı diziden sileceğiz.
    notes = notes.filter((item) => item.id !== +id);
    // console.log(notes);
    //* LocalStorage güncelle.
    localStorage.setItem("notes", JSON.stringify(notes));
    //* Güncel notları ekrana bas.
    renderNotes();
    //* Güncel imleçleri ekrana bas.
    renderMarkers();
  }
}

//* Fly butonuna tıklanınca.
function flyNote(id) {
  //* id'si bilinen elemanı dizide bulmamız lazım.
  const note = notes.find((note) => note.id === +id);
  //* Bulduğumuz note konumuna uçacağız.
  console.log(note.coords);
  map.flyTo(note.coords, 11);
}
//* Aside alanındaki form veya liste içeriğini gizlemek için hide class'ı ekle.

ui.arrowBtn.addEventListener("click", () => {
  ui.aside.classList.toggle("hide");
});
