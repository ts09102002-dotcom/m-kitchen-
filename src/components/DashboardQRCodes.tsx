import React, { useState, useEffect } from "react";
import { useStore } from "../store";
import { Button, Card } from "./PremiumUI";
import { QrCode, Printer, Info, FileImage, Download, Sparkles } from "lucide-react";
import QRCode from "qrcode";

export const DashboardQRCodes: React.FC = () => {
  // Zustand State
  const tables = useStore(state => state.tables);

  // States
  const [selectedTableNum, setSelectedTableNum] = useState<number>(1);
  const [qrBase64, setQrBase64] = useState<string>("");

  // Chef Logo URL provided by user
  const logoUrl = "https://i.ibb.co/rKH953Pw/f9132bb7-ee8f-4f24-9da2-1b31129efa04-removalai-preview.png";

  useEffect(() => {
    // Re-generate QR link when table number pivots
    const destinationUrl = `${window.location.protocol}//${window.location.host}/menu?table=${selectedTableNum}`;
    QRCode.toDataURL(
      destinationUrl,
      { 
        width: 600, 
        margin: 1, 
        color: { dark: "#1C1917", light: "#FFFFFF" } 
      }, 
      (err, url) => {
        if (!err) {
          setQrBase64(url);
        }
      }
    );
  }, [selectedTableNum]);

  // Method to render premium canvas and trigger high-resolution JPG download
  const handleDownloadJPG = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 800;
    canvas.height = 1100;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Background gradient (Luxurious royal cream-warm to elegant sand)
    const bgGrad = ctx.createLinearGradient(0, 0, 0, 1100);
    bgGrad.addColorStop(0, "#FAF7F2");
    bgGrad.addColorStop(1, "#F3EBE0");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 800, 1100);

    // Double-bordered golden and maroon framing
    // Solid rich gold outer frame
    ctx.strokeStyle = "#D4AF37";
    ctx.lineWidth = 12;
    ctx.strokeRect(30, 30, 740, 1040);

    // Maroon inner royal frame
    ctx.strokeStyle = "#7B1E2B";
    ctx.lineWidth = 3;
    ctx.strokeRect(50, 50, 700, 1000);

    // White gap spacer
    ctx.strokeStyle = "#FAF7F2";
    ctx.lineWidth = 2;
    ctx.strokeRect(55, 55, 690, 990);

    // Golden hairline inside frame
    ctx.strokeStyle = "#D4AF37";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(60, 60, 680, 980);

    // Elegant Victorian vintage corner star dots
    const drawCornerOrnament = (x: number, y: number) => {
      ctx.fillStyle = "#D4AF37";
      ctx.beginPath();
      ctx.arc(x, y, 14, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = "#7B1E2B";
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#FAF7F2";
      ctx.beginPath();
      ctx.arc(x, y, 2.5, 0, Math.PI * 2);
      ctx.fill();
    };

    drawCornerOrnament(60, 60);
    drawCornerOrnament(740, 60);
    drawCornerOrnament(60, 1040);
    drawCornerOrnament(740, 1040);

    // Load user's gourmet head medallion logo
    const logoImg = new Image();
    logoImg.crossOrigin = "anonymous";
    logoImg.src = logoUrl;

    logoImg.onload = () => {
      // Draw 3D gold-bezel circular coin at top (Y ~ 100, radius 100)
      const centerX = 400;
      const logoY = 110;
      const coinRadius = 90;

      // Drop shadow for the main coin emblem
      ctx.shadowColor = "rgba(43, 8, 12, 0.28)";
      ctx.shadowBlur = 30;
      ctx.shadowOffsetY = 16;

      ctx.fillStyle = "#FFFFFF";
      ctx.beginPath();
      ctx.arc(centerX, logoY + coinRadius, coinRadius, 0, Math.PI * 2);
      ctx.fill();

      // Golden dual-bordered coin rim
      ctx.strokeStyle = "#D4AF37";
      ctx.lineWidth = 7;
      ctx.stroke();

      ctx.strokeStyle = "#7B1E2B";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(centerX, logoY + coinRadius, coinRadius - 6, 0, Math.PI * 2);
      ctx.stroke();

      // Reset drop shadow for logo draw
      ctx.shadowColor = "transparent";
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;

      // Draw standard chef image inside the top badge
      const imgSize = 150;
      ctx.drawImage(logoImg, centerX - imgSize / 2, logoY + (coinRadius * 2 - imgSize) / 2, imgSize, imgSize);

      // Title header text setup (MAHARAJI KITCHEN)
      ctx.font = "bold 58px 'Playfair Display', serif";
      ctx.fillStyle = "#7B1E2B";
      ctx.textAlign = "center";
      ctx.fillText("MAHARAJI KITCHEN", 400, 395);

      // Beautiful tagline text
      ctx.font = "italic 24px 'Cormorant Garamond', serif";
      ctx.fillStyle = "#5C4033";
      ctx.fillText("Royal Taste, Royal Experience", 400, 438);

      // Delicate vintage divider line beneath header
      ctx.strokeStyle = "#D4AF37";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(220, 470);
      ctx.quadraticCurveTo(400, 455, 580, 470);
      ctx.stroke();

      // Setup QR code sub-container
      const qrBoxSize = 390;
      const qrBoxX = 205;
      const qrBoxY = 510;

      // Shadow overlay for the QR block
      ctx.shadowColor = "rgba(92, 15, 26, 0.08)";
      ctx.shadowBlur = 24;
      ctx.shadowOffsetY = 12;

      ctx.fillStyle = "#FFFFFF";
      // Render clean rounded container panel with golden trim
      const qrRadius = 24;
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(qrBoxX, qrBoxY, qrBoxSize, qrBoxSize, qrRadius);
      } else {
        ctx.rect(qrBoxX, qrBoxY, qrBoxSize, qrBoxSize);
      }
      ctx.fill();

      ctx.strokeStyle = "#E8C766";
      ctx.lineWidth = 3;
      ctx.stroke();

      // Reset backdrop shadows
      ctx.shadowColor = "transparent";
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;

      // Load generated QR image
      const qrImg = new Image();
      qrImg.src = qrBase64;
      qrImg.onload = () => {
        // Draw primary QR matrix inside white box
        ctx.drawImage(qrImg, qrBoxX + 20, qrBoxY + 20, qrBoxSize - 40, qrBoxSize - 40);

        // Render the 3D-Style QR CENTER OVERLAY stamp (Logo overlapping elegantly)
        const stampSize = 90;
        const stampX = 400 - stampSize / 2;
        const stampY = qrBoxY + qrBoxSize / 2 - stampSize / 2;

        // Solid white shield backplate for maximum contrast
        ctx.fillStyle = "#FFFFFF";
        ctx.beginPath();
        ctx.arc(400, qrBoxY + qrBoxSize / 2, stampSize / 2 + 3, 0, Math.PI * 2);
        ctx.fill();

        // Thick golden outer bezel ring
        ctx.strokeStyle = "#D4AF37";
        ctx.lineWidth = 4;
        ctx.stroke();

        // Draw smaller chef logo stamp exactly over QR code center
        ctx.drawImage(logoImg, stampX, stampY, stampSize, stampSize);

        // Deluxe maroon-royal Table Tagholder plaque
        const plaqueW = 480;
        const plaqueH = 85;
        const plaqueX = 400 - plaqueW / 2;
        const plaqueY = 930;

        // Embossed shadow for Plaque
        ctx.shadowColor = "rgba(0, 0, 0, 0.22)";
        ctx.shadowBlur = 12;
        ctx.shadowOffsetY = 6;

        ctx.fillStyle = "#7B1E2B";
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(plaqueX, plaqueY, plaqueW, plaqueH, 16);
        } else {
          ctx.rect(plaqueX, plaqueY, plaqueW, plaqueH);
        }
        ctx.fill();

        // Solid gold plaque frame
        ctx.strokeStyle = "#D4AF37";
        ctx.lineWidth = 3.5;
        ctx.stroke();

        // Luxury interior golden dashed stitches
        ctx.strokeStyle = "#FAF7F2";
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(plaqueX + 5, plaqueY + 5, plaqueW - 10, plaqueH - 10, 11);
        } else {
          ctx.rect(plaqueX + 5, plaqueY + 5, plaqueW - 10, plaqueH - 10);
        }
        ctx.stroke();
        ctx.setLineDash([]); // clear dash state

        // Reset shadow
        ctx.shadowColor = "transparent";

        // Table Plaque Text
        ctx.font = "bold 44px 'JetBrains Mono', monospace";
        ctx.fillStyle = "#D4AF37";
        ctx.textAlign = "center";
        ctx.fillText(`TABLE ${selectedTableNum}`, 400, plaqueY + 56);

        // Footer instructional directive
        ctx.font = "bold 15px 'Inter', sans-serif";
        ctx.fillStyle = "#5C4033";
        ctx.fillText("SCAN QR CODE TO BROWSE ROYAL MENU & ORDER DISHES", 400, 1050);

        // Save as standard premium JPEG
        const link = document.createElement("a");
        link.download = `Maharaji_Kitchen_Table_${selectedTableNum}.jpg`;
        link.href = canvas.toDataURL("image/jpeg", 0.95);
        link.click();
      };
    };

    logoImg.onerror = () => {
      alert("Error caching premium chef asset. Please verify internet connection.");
    };
  };

  const handlePrintStandee = () => {
    const printWin = window.open("", "_blank");
    if (!printWin) return;

    const htmlStandee = `
      <html>
        <head>
          <title>Dine-In Standee Table ${selectedTableNum}</title>
          <style>
            @media print {
              body { margin: 0; padding: 0; background: #FAF7F2; }
            }
            body {
              font-family: 'Playfair Display', serif, Arial;
              background-color: #FAF7F2;
              color: #2D1810;
              margin: 0;
              padding: 20px;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 95vh;
            }
            .standee-card {
              border: 10px solid #D4AF37;
              outline: 3px solid #7B1E2B;
              outline-offset: -12px;
              padding: 40px;
              max-width: 440px;
              width: 100%;
              text-align: center;
              background: #FAF7F2;
              box-shadow: 0 15px 40px rgba(0,0,0,0.1);
              border-radius: 24px;
              position: relative;
            }
            .corner-dot {
              position: absolute;
              width: 12px;
              height: 12px;
              background: #7B1E2B;
              border: 3px solid #D4AF37;
              border-radius: 50%;
            }
            .top-left { top: 6px; left: 6px; }
            .top-right { top: 6px; right: 6px; }
            .bottom-left { bottom: 6px; left: 6px; }
            .bottom-right { bottom: 6px; right: 6px; }

            .logo-shield {
              width: 130px;
              height: 130px;
              background: #FFFFFF;
              border: 4px solid #D4AF37;
              border-radius: 50%;
              margin: 0 auto 12px auto;
              box-shadow: 0 8px 20px rgba(0,0,0,0.15);
              padding: 10px;
              display: flex;
              align-items: center;
              justify-content: center;
              box-sizing: border-box;
            }
            .logo-img {
              width: 100%;
              height: 100%;
              object-fit: contain;
            }
            .title {
              font-size: 30px;
              font-weight: 700;
              margin: 0;
              color: #7B1E2B;
              letter-spacing: -0.01em;
            }
            .tagline {
              font-family: 'Cormorant Garamond', italic, serif;
              font-size: 15px;
              color: #5C4033;
              margin-top: 4px;
              margin-bottom: 25px;
            }
            .qr-wrapper {
              background: #FFFFFF;
              border: 3px solid #E8C766;
              padding: 15px;
              border-radius: 20px;
              display: inline-block;
              box-shadow: 0 8px 25px rgba(92,15,26,0.06);
              position: relative;
            }
            .qr-image {
              width: 240px;
              height: 240px;
              display: block;
            }
            .qr-stamp {
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              width: 58px;
              height: 58px;
              background: #FFFFFF;
              border: 3px solid #D4AF37;
              border-radius: 50%;
              box-shadow: 0 4px 10px rgba(0,0,0,0.15);
              padding: 3px;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .qr-stamp-img {
              width: 100%;
              height: 100%;
              object-fit: contain;
            }
            .plaque-table {
              background: #7B1E2B;
              border: 3px solid #D4AF37;
              border-radius: 12px;
              padding: 12px 24px;
              display: inline-block;
              margin: 24px 0 12px 0;
              box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            }
            .label-table {
              font-size: 30px;
              font-weight: 950;
              color: #D4AF37;
              margin: 0;
              font-family: 'JetBrains Mono', monospace;
            }
            .instructions {
              font-family: 'Inter', sans-serif;
              font-size: 11px;
              color: #5C4033;
              letter-spacing: 0.05em;
              text-transform: uppercase;
              font-weight: 700;
              margin: 0;
            }
          </style>
          <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Cormorant+Garamond:ital,wght@1,500&family=Inter:wght@700&family=JetBrains+Mono:wght@700&display=swap" rel="stylesheet">
        </head>
        <body>
          <div class="standee-card">
            <div class="corner-dot top-left"></div>
            <div class="corner-dot top-right"></div>
            <div class="corner-dot bottom-left"></div>
            <div class="corner-dot bottom-right"></div>

            <div class="logo-shield">
              <img src="${logoUrl}" class="logo-img" />
            </div>

            <h1 class="title">MAHARAJI KITCHEN</h1>
            <p class="tagline">"Royal Taste, Royal Experience"</p>
            
            <div class="qr-wrapper">
              <img src="${qrBase64}" class="qr-image" />
              <!-- Center embedded 3D style badge -->
              <div class="qr-stamp">
                <img src="${logoUrl}" class="qr-stamp-img" />
              </div>
            </div>

            <div class="plaque-table">
              <div class="label-table">TABLE ${selectedTableNum}</div>
            </div>
            <p class="instructions">Scan QR to Browse Royal Menu & Order Dishes</p>
          </div>

          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `;

    printWin.document.write(htmlStandee);
    printWin.document.close();
  };

  return (
    <div className="space-y-6 font-sans select-none">
      
      {/* 1. HEADER SECTION */}
      <div className="border-b border-gold-rich/10 pb-4">
        <h3 className="font-serif text-xl font-bold text-maroon-royal flex items-center gap-1.5">
          <QrCode className="w-5 h-5 text-gold-rich" />
          Printable Dining Hall QR Sheets
        </h3>
        <p className="text-xs text-mocha mt-1">
          Export ultra-premium bespoke standee designs featuring full brass plaques, outer double gilding, and center-embedded logo stamps.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* Left selector sidebar (5 cols) */}
        <div className="md:col-span-5 space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-maroon-royal border-l-2 border-gold-rich pl-2">
            Target Standee Parameters
          </h4>

          <Card className="p-5 bg-white border border-gold-rich/10 space-y-5 shadow-sm">
            
            <div className="relative font-sans">
              <label className="block text-[10px] text-maroon-royal uppercase font-bold tracking-wider mb-1">Select Dining Table No</label>
              <select
                value={selectedTableNum}
                onChange={(e) => setSelectedTableNum(parseInt(e.target.value, 10))}
                className="w-full px-3.5 py-3 text-sm text-espresso bg-[#FAF7F2] border border-gold-rich/20 rounded-xl focus:outline-none focus:border-gold-rich"
              >
                {Array.from({ length: 20 }, (_, i) => i + 1).map(num => (
                  <option key={num} value={num}>Table {num} Banquet Desk</option>
                ))}
              </select>
            </div>

            <div className="p-3 bg-cream-warm/30 rounded-xl border border-gold-rich/15 font-mono text-[10px] text-mocha leading-relaxed space-y-1.5">
              <div className="font-bold uppercase text-maroon-royal mb-1 flex items-center gap-1">
                <Info className="w-3.5 h-3.5" /> LUXURY SINK GRAPHICS
              </div>
              <div>• Destination URL: <span className="text-espresso font-semibold underline">/menu?table={selectedTableNum}</span></div>
              <div>• Border: Double royal gold bezel with corner dots</div>
              <div>• Embedded QR Stamps: Medallion icon centered</div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <Button
                variant="gold"
                className="w-full py-3.5 text-xs uppercase tracking-wider font-extrabold flex items-center justify-center gap-1.5 shadow-md"
                onClick={handleDownloadJPG}
              >
                <Download className="w-4 h-4 text-charcoal-deep" />
                <span>Download Standee (JPG)</span>
              </Button>

              <Button
                variant="ghost"
                className="w-full py-3 text-xs uppercase tracking-wider font-bold border-maroon-royal/20 text-maroon-royal hover:bg-maroon-royal/5 flex items-center justify-center gap-1.5"
                onClick={handlePrintStandee}
              >
                <Printer className="w-4 h-4 text-maroon-royal" />
                <span>Print Table {selectedTableNum} Standee</span>
              </Button>
            </div>
          </Card>
        </div>

        {/* Right Preview (7 cols) */}
        <div className="md:col-span-7 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-mocha flex items-center gap-1">
            <FileImage className="w-4 h-4 text-gold-rich" />
            Standee Sheet Live Replica (Front Card)
          </h4>

          {/* Luxurious Front Card Standee Preview */}
          <div className="flex justify-center p-6 bg-cream-warm/20 rounded-3xl border border-dashed border-gold-rich/15 max-w-sm mx-auto">
            <div className="relative bg-[#FAF7F2] border-[10px] border-gold-rich p-6 rounded-2xl w-full text-center text-espresso shadow-xl overflow-hidden">
              
              {/* Internal Fine Maroon Hairline */}
              <div className="absolute inset-1.5 border border-maroon-royal pointer-events-none rounded-lg opacity-85"></div>
              
              {/* Ornate corner points */}
              <div className="absolute top-2 left-2 w-2 h-2 bg-maroon-royal border border-gold-rich rounded-full"></div>
              <div className="absolute top-2 right-2 w-2 h-2 bg-maroon-royal border border-gold-rich rounded-full"></div>
              <div className="absolute bottom-2 left-2 w-2 h-2 bg-maroon-royal border border-gold-rich rounded-full"></div>
              <div className="absolute bottom-2 right-2 w-2 h-2 bg-maroon-royal border border-gold-rich rounded-full"></div>

              {/* Top Embossed Medallion Avatar Badge */}
              <div className="w-20 h-20 bg-white border-2 border-gold-rich rounded-full mx-auto mb-2 shadow-lg p-1.5 flex items-center justify-center hover:scale-105 transition-transform duration-300">
                <img src={logoUrl} alt="Logo Emblem" className="w-full h-full object-contain" />
              </div>

              <h4 className="font-serif text-lg font-black text-maroon-royal tracking-tight leading-none uppercase">MAHARAJI KITCHEN</h4>
              <p className="font-serif italic text-[10px] text-mocha mt-0.5 mb-4">"Royal Taste, Royal Experience"</p>

              {/* QR wrapper with embedded absolute center stamp overlay */}
              {qrBase64 ? (
                <div className="p-2.5 bg-white rounded-xl inline-block border-2 border-gold-rich/40 mb-3 shadow-inner relative">
                  <img src={qrBase64} alt="QR Live" className="w-44 h-44 object-contain" />
                  
                  {/* Center overlapping 3D logo stamp */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-11 h-11 bg-white border border-gold-rich rounded-full p-0.5 shadow-md flex items-center justify-center">
                    <img src={logoUrl} alt="QR center brand" className="w-full h-full object-contain" />
                  </div>
                </div>
              ) : (
                <div className="w-44 h-44 bg-white/60 animate-shimmer rounded-xl inline-block mb-3" />
              )}

              {/* Velvet Crimson table plaque */}
              <div>
                <div className="bg-royal-gradient border border-gold-rich rounded-lg px-4 py-2 inline-block shadow-md">
                  <div className="font-mono text-xl font-bold text-gold-rich tracking-tight leading-none">
                    TABLE {selectedTableNum}
                  </div>
                </div>
              </div>

              <p className="text-[8px] uppercase tracking-wider font-extrabold text-mocha mt-3 font-sans">
                Scan QR code to Order & Dine
              </p>

            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

