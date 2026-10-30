// ===== แท็บ SHOP / TRAVEL / EAT (Smart Animate แบบ Figma) =====
const tabsContainer = document.querySelector('.tabs');
const tabs = document.querySelectorAll('.tab');
const panels = document.querySelectorAll('.panel');

if (tabsContainer && tabs.length > 0) {
    let indicator = tabsContainer.querySelector('.tab-indicator');
    if (!indicator) {
        indicator = document.createElement('span');
        indicator.className = 'tab-indicator';
        tabsContainer.prepend(indicator);
    }

    function updateTabIndicator(activeTab, animated = true) {
        if (!indicator || !activeTab) return;
        if (!animated) {
            indicator.style.transition = 'none';
        } else {
            indicator.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), width 0.3s cubic-bezier(0.4, 0, 0.2, 1), height 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        }
        indicator.style.width = activeTab.offsetWidth + 'px';
        indicator.style.height = activeTab.offsetHeight + 'px';
        indicator.style.transform = `translate(${activeTab.offsetLeft}px, ${activeTab.offsetTop}px)`;
    }

    // กำหนดตำแหน่งเริ่มต้น
    const initialActive = tabsContainer.querySelector('.tab.active') || tabs[0];
    if (initialActive) {
        updateTabIndicator(initialActive, false);
        requestAnimationFrame(function () {
            updateTabIndicator(initialActive, false);
            requestAnimationFrame(function () {
                if (indicator) {
                    indicator.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), width 0.3s cubic-bezier(0.4, 0, 0.2, 1), height 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
                }
            });
        });
    }

    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(function () {
            const cur = tabsContainer.querySelector('.tab.active');
            if (cur) updateTabIndicator(cur, false);
        });
    }

    tabs.forEach(function (tab) {
        tab.addEventListener('click', function () {
            tabs.forEach(function (item) {
                item.classList.remove('active');
            });
            tab.classList.add('active');

            // Smart Animate: เลื่อน indicator ไปยังแท็บที่เลือก
            updateTabIndicator(tab, true);

            // สลับเนื้อหา panel
            panels.forEach(function (panel) {
                panel.classList.remove('active');
            });
            const target = document.getElementById(tab.dataset.tab);
            if (target) {
                target.classList.add('active');
            }
        });
    });

    window.addEventListener('resize', function () {
        const cur = tabsContainer.querySelector('.tab.active');
        if (cur) updateTabIndicator(cur, false);
    });
}

// ===== Instant Page Prefetcher (แก้ปัญหากระตุก / โหลดช้าเวลาเปลี่ยนหน้า) =====
(function () {
    const preloadedUrls = new Set();
    function prefetchUrl(url) {
        if (!url || url.startsWith('#') || preloadedUrls.has(url)) return;
        preloadedUrls.add(url);
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = url;
        document.head.appendChild(link);
    }

    document.querySelectorAll('a[href]').forEach(function (a) {
        const href = a.getAttribute('href');
        if (href && !href.startsWith('#') && !href.startsWith('http') && !href.startsWith('javascript:')) {
            a.addEventListener('pointerenter', function () { prefetchUrl(href); }, { once: true, passive: true });
            a.addEventListener('touchstart', function () { prefetchUrl(href); }, { once: true, passive: true });
        }
    });
})();

// ===== แกลเลอรีรูปหน้า Detail (Double click ซูมขยายรูป) =====
const bigPhoto = document.querySelector('.big-photo');
const thumbs = Array.from(document.querySelectorAll('.thumbs img'));
const lightbox = document.getElementById('photoLightbox') || document.querySelector('.lightbox');
const lightboxImg = document.querySelector('.lightbox-img') || document.querySelector('.lightbox img');
const lightboxClose = document.querySelector('.lightbox .close');
const lbZoomIn = document.querySelector('.lb-zoom-in');
const lbZoomOut = document.querySelector('.lb-zoom-out');
const lbReset = document.querySelector('.lb-reset');
const lbViewport = document.querySelector('.lightbox-viewport');

// รายการรูปทั้งหมด
const photos = thumbs.map(function (img) {
    return img.src;
});

let photoIndex = 0;
const dots = document.querySelectorAll('.dot');

function markActiveThumb() {
    thumbs.forEach(function (img, i) {
        img.classList.toggle('active', i === photoIndex);
    });
    dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === photoIndex);
    });
}

function showPhoto(index) {
    if (!bigPhoto || photos.length === 0) return;
    photoIndex = (index + photos.length) % photos.length;
    bigPhoto.src = photos[photoIndex];
    markActiveThumb();
}

// คลิกรูปเล็กเพื่อเลือกดูรูปใหญ่
thumbs.forEach(function (img, i) {
    img.addEventListener('click', function () {
        showPhoto(i);
    });
});

// คลิกจุดเพื่อเปลี่ยนรูป
dots.forEach(function (dot, i) {
    dot.addEventListener('click', function () {
        showPhoto(i);
    });
});

// ===== Lightbox Zoom & Pan State =====
let lbScale = 1;
let lbPanX = 0;
let lbPanY = 0;
let lbDragging = false;
let lbStartX = 0;
let lbStartY = 0;
let lbStartPanX = 0;
let lbStartPanY = 0;

function applyLightboxTransform(smooth) {
    if (!lightboxImg) return;
    lightboxImg.style.transition = smooth ? 'transform 0.28s cubic-bezier(0.2, 0, 0.2, 1)' : 'none';
    lightboxImg.style.transform = `translate(${lbPanX}px, ${lbPanY}px) scale(${lbScale})`;
    lightboxImg.classList.toggle('zoomed', lbScale > 1);
}

function setLightboxZoom(scale, smooth = true) {
    lbScale = Math.min(3.5, Math.max(1, scale));
    if (lbScale === 1) {
        lbPanX = 0;
        lbPanY = 0;
    }
    applyLightboxTransform(smooth);
}

const lbPrev = document.querySelector('.lb-prev');
const lbNext = document.querySelector('.lb-next');
const lbCurrentIndex = document.getElementById('lbCurrentIndex');
const lbTotalCount = document.getElementById('lbTotalCount');

function updateLightboxCounter() {
    if (lbCurrentIndex) lbCurrentIndex.textContent = (photoIndex + 1);
    if (lbTotalCount) lbTotalCount.textContent = photos.length;
}

// เลื่อนเปลี่ยนรูปซ้าย-ขวา ใน Lightbox (พร้อมแอนิเมชันสไลด์นุ่มนวล)
let isChangingPhoto = false;

function changeLightboxPhoto(direction) {
    if (photos.length <= 1 || isChangingPhoto) return;
    isChangingPhoto = true;

    let targetIndex = photoIndex;
    if (direction === 'next') {
        targetIndex = (photoIndex + 1) % photos.length;
    } else if (direction === 'prev') {
        targetIndex = (photoIndex - 1 + photos.length) % photos.length;
    } else if (typeof direction === 'number') {
        targetIndex = (direction + photos.length) % photos.length;
    }

    photoIndex = targetIndex;
    setLightboxZoom(1, false);

    if (lightboxImg) {
        const outOffset = direction === 'next' ? -60 : 60;
        const inOffset = direction === 'next' ? 60 : -60;

        // เฟดและเลื่อนรูปเดิมออก
        lightboxImg.style.transition = 'transform 0.18s cubic-bezier(0.4, 0, 1, 1), opacity 0.18s ease-in';
        lightboxImg.style.transform = `translate(${outOffset}px, 0) scale(0.96)`;
        lightboxImg.style.opacity = '0.3';

        setTimeout(function () {
            lightboxImg.src = photos[photoIndex];
            if (bigPhoto) bigPhoto.src = photos[photoIndex];
            markActiveThumb();
            updateLightboxCounter();

            // จัดตำแหน่งรูปใหม่จากอีกฝั่ง
            lightboxImg.style.transition = 'none';
            lightboxImg.style.transform = `translate(${inOffset}px, 0) scale(0.96)`;

            requestAnimationFrame(function () {
                // เลื่อนรูปใหม่เข้ามาตรงกลาง
                lightboxImg.style.transition = 'transform 0.28s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.28s ease-out';
                lightboxImg.style.transform = 'translate(0, 0) scale(1)';
                lightboxImg.style.opacity = '1';

                setTimeout(function () {
                    isChangingPhoto = false;
                }, 280);
            });
        }, 180);
    } else {
        isChangingPhoto = false;
    }
}

// ปุ่มเลื่อนรูปซ้าย / ขวา
if (lbPrev) {
    lbPrev.addEventListener('click', function (e) {
        e.stopPropagation();
        changeLightboxPhoto('prev');
    });
}

if (lbNext) {
    lbNext.addEventListener('click', function (e) {
        e.stopPropagation();
        changeLightboxPhoto('next');
    });
}

function openLightbox(src, zoomImmediately = false) {
    if (!lightbox || !lightboxImg) return;
    
    // ตั้งค่ารูปปัจจุบันตาม src ที่เปิด
    if (src) {
        const found = photos.indexOf(src);
        if (found !== -1) photoIndex = found;
    }
    
    lightboxImg.src = photos[photoIndex] || src || (bigPhoto ? bigPhoto.src : '');
    lightboxImg.style.opacity = '1';
    setLightboxZoom(1, false);
    updateLightboxCounter();
    markActiveThumb();

    lightbox.classList.add('open');
    if (zoomImmediately) {
        setTimeout(function () {
            setLightboxZoom(2.2, true);
        }, 150);
    }
}

function closeLightbox() {
    if (lightbox) {
        lightbox.classList.remove('open');
        setLightboxZoom(1, false);
    }
}

// Double click ที่รูปใหญ่ = เปิด Lightbox พร้อมซูมขยายรูปทันที
if (bigPhoto) {
    let clickTimeout = null;

    bigPhoto.addEventListener('click', function () {
        if (clickTimeout) {
            clearTimeout(clickTimeout);
            clickTimeout = null;
            // Double click: ซูมขยายรูป
            openLightbox(bigPhoto.src, true);
        } else {
            clickTimeout = setTimeout(function () {
                clickTimeout = null;
                // Single click: เปิดดูภาพขยาย
                openLightbox(bigPhoto.src, false);
            }, 280);
        }
    });

    bigPhoto.addEventListener('dblclick', function (e) {
        e.preventDefault();
        openLightbox(bigPhoto.src, true);
    });

    // ปัดซ้าย-ขวาบนรูปหลักที่หน้า detail เพื่อเปลี่ยนรูปได้ด้วย
    let bpStartX = 0;
    bigPhoto.addEventListener('touchstart', function (e) {
        bpStartX = e.touches[0].clientX;
    }, { passive: true });

    bigPhoto.addEventListener('touchend', function (e) {
        const diffX = e.changedTouches[0].clientX - bpStartX;
        if (diffX < -50) {
            showPhoto(photoIndex + 1);
        } else if (diffX > 50) {
            showPhoto(photoIndex - 1);
        }
    }, { passive: true });
}

// Double click ใน Lightbox = สลับซูมเข้า / ซูมออก
if (lightboxImg) {
    lightboxImg.addEventListener('dblclick', function (e) {
        e.stopPropagation();
        if (lbScale > 1.2) {
            setLightboxZoom(1, true);
        } else {
            setLightboxZoom(2.2, true);
        }
    });
}

// Zoom Controls ใน Lightbox
if (lbZoomIn) {
    lbZoomIn.addEventListener('click', function (e) {
        e.stopPropagation();
        setLightboxZoom(lbScale + 0.4, true);
    });
}

if (lbZoomOut) {
    lbZoomOut.addEventListener('click', function (e) {
        e.stopPropagation();
        setLightboxZoom(lbScale - 0.4, true);
    });
}

if (lbReset) {
    lbReset.addEventListener('click', function (e) {
        e.stopPropagation();
        setLightboxZoom(1, true);
    });
}

// Scroll Wheel ซูมใน Lightbox
if (lbViewport) {
    lbViewport.addEventListener('wheel', function (e) {
        e.preventDefault();
        setLightboxZoom(lbScale + (e.deltaY < 0 ? 0.2 : -0.2), true);
    }, { passive: false });

    // Drag to Pan เมื่อซูมภาพ หรือ ปัดซ้าย-ขวาเพื่อเปลี่ยนรูปเมื่อไม่ได้ซูม
    let isSwiping = false;
    let swipeStartX = 0;
    let swipeStartTime = 0;

    lbViewport.addEventListener('pointerdown', function (e) {
        if (e.target.closest('.lb-nav') || e.target.closest('.lb-btn') || e.target.closest('.close')) return;

        swipeStartX = e.clientX;
        swipeStartTime = Date.now();

        if (lbScale > 1) {
            // โหมดซูม: เลื่อน Pan ภาพ
            lbDragging = true;
            lbStartX = e.clientX;
            lbStartY = e.clientY;
            lbStartPanX = lbPanX;
            lbStartPanY = lbPanY;
            if (lightboxImg) lightboxImg.classList.add('dragging');
        } else {
            // โหมดปกติ: เตรียมสไลด์ซ้าย-ขวาเปลี่ยนรูป
            isSwiping = true;
        }

        lbViewport.setPointerCapture(e.pointerId);
    });

    lbViewport.addEventListener('pointermove', function (e) {
        if (lbDragging && lbScale > 1) {
            lbPanX = lbStartPanX + (e.clientX - lbStartX);
            lbPanY = lbStartPanY + (e.clientY - lbStartY);
            applyLightboxTransform(false);
        } else if (isSwiping && lbScale === 1 && lightboxImg && !isChangingPhoto) {
            const diffX = e.clientX - swipeStartX;
            // ดึงภาพตามมือเล็กน้อยให้ความรู้สึก Interactive
            lightboxImg.style.transition = 'none';
            lightboxImg.style.transform = `translate(${diffX * 0.4}px, 0) scale(0.98)`;
        }
    });

    function endLbInteraction(e) {
        if (lbDragging) {
            lbDragging = false;
            if (lightboxImg) lightboxImg.classList.remove('dragging');
        }

        if (isSwiping) {
            isSwiping = false;
            const diffX = e ? (e.clientX - swipeStartX) : 0;
            const elapsed = Date.now() - swipeStartTime;

            if (diffX < -50 || (diffX < -25 && elapsed < 260)) {
                // ปัดไปทางซ้าย -> รูปถัดไป
                changeLightboxPhoto('next');
            } else if (diffX > 50 || (diffX > 25 && elapsed < 260)) {
                // ปัดไปทางขวา -> รูปก่อนหน้า
                changeLightboxPhoto('prev');
            } else {
                // คืนตำแหน่งเดิม
                applyLightboxTransform(true);
            }
        }
    }

    lbViewport.addEventListener('pointerup', endLbInteraction);
    lbViewport.addEventListener('pointercancel', endLbInteraction);
}

if (lightbox) {
    lightbox.addEventListener('click', function (e) {
        if (e.target === lightbox || (lightboxClose && e.target === lightboxClose)) {
            closeLightbox();
        }
    });
}

// ควบคุมด้วยคีย์บอร์ด (ลูกศรซ้าย/ขวา = เลื่อนรูป, Escape = ปิด)
document.addEventListener('keydown', function (e) {
    if (lightbox && lightbox.classList.contains('open')) {
        if (e.key === 'ArrowLeft') {
            e.preventDefault();
            changeLightboxPhoto('prev');
        } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            changeLightboxPhoto('next');
        }
    }
});

// ===== Map overlay หน้า Detail (การ์ดขาวคมชัดระดับเวกเตอร์จาก PDF ไม่แตก) =====
const mapOverlay = document.querySelector('.map-overlay');
const mapPanel = document.querySelector('.map-panel');
const mapViewport = document.getElementById('mapViewport') || document.querySelector('.map-viewport');
const mapCanvas = document.getElementById('mapCanvas') || document.querySelector('.map-canvas');
const mapImage = document.getElementById('mapImage') || document.querySelector('.map-image');
const mapClose = document.querySelector('.map-close');
const mapZoomIn = document.querySelector('.zoom-in');
const mapZoomOut = document.querySelector('.zoom-out');
const mapSubtabs = document.querySelectorAll('.map-subtab');
const transportBtns = document.querySelectorAll('.transport span');

const mapData = {
    ALL: 'images/map-vector-sharp.png',
    BTS: 'images/map-bts-sharp.png',
    MRT: 'images/map-mrt-sharp.png',
    BUS: 'images/map-vector-sharp.png'
};

let mapScale = 1;
let mapPanX = 0;
let mapPanY = 0;
let mapDragging = false;
let mapStartX = 0;
let mapStartY = 0;
let mapStartPanX = 0;
let mapStartPanY = 0;

function applyMapTransform(smooth = true) {
    if (!mapCanvas) return;
    mapCanvas.style.transition = smooth ? 'transform 0.25s cubic-bezier(0.2, 0, 0.2, 1)' : 'none';
    mapCanvas.style.transform = `translate(${mapPanX}px, ${mapPanY}px) scale(${mapScale})`;
}

function setMapZoom(scale, smooth = true) {
    mapScale = Math.min(4, Math.max(1, scale));
    if (mapScale === 1) {
        mapPanX = 0;
        mapPanY = 0;
    }
    applyMapTransform(smooth);
}

function openMap(key = 'ALL') {
    if (!mapOverlay) return;

    const normalizedKey = key.toUpperCase().includes('MRT') ? 'MRT'
                        : key.toUpperCase().includes('BTS') ? 'BTS'
                        : key.toUpperCase().includes('BUS') ? 'BUS'
                        : 'ALL';

    const imgSrc = mapData[normalizedKey] || mapData.ALL;
    if (mapImage) {
        mapImage.src = imgSrc;
    }

    setMapZoom(1, false);

    mapSubtabs.forEach(function (tab) {
        const tabKey = tab.dataset.map || 'ALL';
        tab.classList.toggle('active', tabKey === normalizedKey || (normalizedKey === 'BUS' && tabKey === 'ALL'));
    });

    transportBtns.forEach(function (btn) {
        const btnKey = btn.textContent.trim().toUpperCase();
        btn.classList.toggle('active', btnKey === normalizedKey);
    });

    mapOverlay.classList.add('open');
}

function closeMap() {
    if (mapOverlay) {
        mapOverlay.classList.remove('open');
        setMapZoom(1, false);
    }
}

// คลิกปุ่ม BTS / MRT / BUS เพื่อเปิดแผนที่
transportBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
        openMap(btn.textContent.trim());
    });
});

// คลิกแท็บสลับสาย (แผนที่รวม / BTS / MRT)
mapSubtabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
        const key = tab.dataset.map || 'ALL';
        openMap(key);
    });
});

// ซูมเข้า / ซูมออก
if (mapZoomIn) {
    mapZoomIn.addEventListener('click', function (e) {
        e.stopPropagation();
        setMapZoom(mapScale + 0.35, true);
    });
}

if (mapZoomOut) {
    mapZoomOut.addEventListener('click', function (e) {
        e.stopPropagation();
        setMapZoom(mapScale - 0.35, true);
    });
}

// ลากเลื่อนแผนที่ (Pan & Drag)
if (mapViewport) {
    mapViewport.addEventListener('pointerdown', function (e) {
        if (e.target.closest('.zoom-btn') || e.target.closest('.map-subtabs') || e.target.closest('.map-close')) return;
        mapDragging = true;
        mapStartX = e.clientX;
        mapStartY = e.clientY;
        mapStartPanX = mapPanX;
        mapStartPanY = mapPanY;
        mapViewport.classList.add('dragging');
        mapViewport.setPointerCapture(e.pointerId);
    });

    mapViewport.addEventListener('pointermove', function (e) {
        if (!mapDragging) return;
        mapPanX = mapStartPanX + (e.clientX - mapStartX);
        mapPanY = mapStartPanY + (e.clientY - mapStartY);
        applyMapTransform(false);
    });

    function endMapDrag() {
        if (!mapDragging) return;
        mapDragging = false;
        mapViewport.classList.remove('dragging');
    }

    mapViewport.addEventListener('pointerup', endMapDrag);
    mapViewport.addEventListener('pointercancel', endMapDrag);

    // เลื่อนลูกกลิ้งเมาส์เพื่อซูม
    mapViewport.addEventListener('wheel', function (e) {
        e.preventDefault();
        const delta = e.deltaY < 0 ? 0.3 : -0.3;
        setMapZoom(mapScale + delta, true);
    }, { passive: false });

    // ดับเบิลคลิกเพื่อสลับซูม
    mapViewport.addEventListener('dblclick', function (e) {
        if (e.target.closest('.zoom-btn') || e.target.closest('.map-subtabs')) return;
        setMapZoom(mapScale > 1.2 ? 1 : 2, true);
    });
}

if (mapOverlay) {
    mapOverlay.addEventListener('click', function (e) {
        if (e.target === mapOverlay || (mapClose && e.target === mapClose)) {
            closeMap();
        }
    });
}

document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
        closeLightbox();
        closeMap();
    }
});
