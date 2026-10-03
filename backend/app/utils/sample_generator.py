import os
from pathlib import Path
import numpy as np
import cv2
from backend.app.core.config import settings

def generate_sample_datasets():
    """
    Generates realistic synthetic remote-sensing imagery datasets for quick demonstration:
    1. Urban Expansion: 2020 Before vs 2024 After [Temporal Pair for Change Detection]
    2. Agricultural Farmland & Crop Fields [Single Image & VQA]
    3. Coastal Port / Harbor Optical + SAR Radar Amplitude Pair [Multimodal Fusion]
    4. Deforestation & Forest Canopy Loss [Bi-temporal Environmental Monitoring]
    5. Disaster Assessment & Flood Inundation [Emergency Response Mapping]
    """
    samples_dir = settings.SAMPLES_DIR
    samples_dir.mkdir(parents=True, exist_ok=True)

    np.random.seed(42)
    w, h = 600, 600

    # -------------------------------------------------------------
    # 1. Urban Expansion: Before (2020) vs After (2024)
    # -------------------------------------------------------------
    path_before = samples_dir / "sample_urban_2020_before.png"
    path_after = samples_dir / "sample_urban_2024_after.png"

    if not path_before.exists() or not path_after.exists():
        # Base terrain: Greenish/brownish soil & light vegetation
        img_before = np.zeros((h, w, 3), dtype=np.uint8)
        img_before[:, :] = [34, 139, 34]  # Forest green (RGB)
        
        noise = np.random.randint(-15, 15, (h, w, 3), dtype=np.int16)
        img_before = np.clip(img_before.astype(np.int16) + noise, 0, 255).astype(np.uint8)

        # Winding River (Blue)
        pts_river = np.array([[0, 280], [150, 310], [300, 260], [450, 320], [600, 290]], np.int32)
        for i in range(len(pts_river)-1):
            cv2.line(img_before, tuple(pts_river[i]), tuple(pts_river[i+1]), (30, 144, 255), 26)

        # Old small village (Top-Left)
        for i in range(6):
            rx = np.random.randint(40, 180)
            ry = np.random.randint(40, 180)
            cv2.rectangle(img_before, (rx, ry), (rx + 25, ry + 25), (180, 180, 190), -1)
            cv2.rectangle(img_before, (rx, ry), (rx + 25, ry + 25), (120, 120, 120), 1)

        cv2.imwrite(str(path_before), cv2.cvtColor(img_before, cv2.COLOR_RGB2BGR))

        # After Image: Massive urban expansion in bottom-right + highway
        img_after = img_before.copy()
        
        # New Highway (Gray) across the scene
        cv2.line(img_after, (50, 0), (550, 600), (90, 95, 100), 14)
        
        # New Urban Complex / Industrial Zone (Bottom Right)
        cv2.rectangle(img_after, (320, 360), (570, 570), (160, 150, 140), -1)
        
        # 18 modern high-reflectance buildings
        for bx in range(340, 550, 45):
            for by in range(380, 550, 45):
                cv2.rectangle(img_after, (bx, by), (bx + 30, by + 30), (220, 220, 230), -1)
                cv2.rectangle(img_after, (bx, by), (bx + 30, by + 30), (70, 70, 80), 2)
                if (bx + by) % 2 == 0:
                    cv2.rectangle(img_after, (bx+4, by+4), (bx + 26, by + 26), (190, 60, 50), -1)

        cv2.imwrite(str(path_after), cv2.cvtColor(img_after, cv2.COLOR_RGB2BGR))

    # -------------------------------------------------------------
    # 2. Agricultural & Forest Canopy Scene
    # -------------------------------------------------------------
    path_agri = samples_dir / "sample_agriculture_canopy.png"
    if not path_agri.exists():
        img_agri = np.zeros((h, w, 3), dtype=np.uint8)
        img_agri[:, :] = [140, 120, 90]  # Soil base

        parcel_colors = [
            [20, 160, 40],   # Lush crop (Bright Green)
            [80, 190, 70],   # Early crop (Lime)
            [190, 170, 50],  # Ripening grain (Golden)
            [120, 90, 60],   # Tilled soil (Dark brown)
            [15, 120, 25],   # Dense orchard (Deep green)
        ]

        grid_w, grid_h = 100, 120
        idx = 0
        for gx in range(20, 550, grid_w + 10):
            for gy in range(20, 550, grid_h + 10):
                c = parcel_colors[idx % len(parcel_colors)]
                cv2.rectangle(img_agri, (gx, gy), (gx + grid_w, gy + grid_h), c, -1)
                cv2.rectangle(img_agri, (gx, gy), (gx + grid_w, gy + grid_h), (80, 70, 60), 2)
                idx += 1

        # Irrigation circular pivot field (Top Right)
        cv2.circle(img_agri, (480, 120), 80, [10, 175, 45], -1)
        cv2.circle(img_agri, (480, 120), 80, [60, 50, 40], 2)

        cv2.imwrite(str(path_agri), cv2.cvtColor(img_agri, cv2.COLOR_RGB2BGR))

    # -------------------------------------------------------------
    # 3. Coastal Port: Optical RGB + SAR Radar Amplitude Pair
    # -------------------------------------------------------------
    path_opt_harbor = samples_dir / "sample_harbor_optical.png"
    path_sar_harbor = samples_dir / "sample_harbor_sar.png"

    if not path_opt_harbor.exists() or not path_sar_harbor.exists():
        img_opt = np.zeros((h, w, 3), dtype=np.uint8)
        img_opt[:, :] = [20, 40, 100]  # Deep sea blue
        
        cv2.rectangle(img_opt, (320, 0), (600, 600), (140, 140, 140), -1)
        cv2.rectangle(img_opt, (160, 150), (320, 190), (110, 110, 110), -1)
        cv2.rectangle(img_opt, (120, 380), (320, 420), (110, 110, 110), -1)

        cv2.rectangle(img_opt, (170, 120), (280, 145), (180, 40, 30), -1)  # Red ship
        cv2.rectangle(img_opt, (130, 430), (260, 455), (30, 60, 180), -1)  # Blue ship

        for cy in range(60, 540, 60):
            cv2.rectangle(img_opt, (360, cy), (430, cy + 35), (200, 200, 210), -1)

        cv2.imwrite(str(path_opt_harbor), cv2.cvtColor(img_opt, cv2.COLOR_RGB2BGR))

        # SAR Radar Scene
        img_sar = np.zeros((h, w), dtype=np.uint8)
        img_sar[:, :] = 12
        speckle = np.random.exponential(scale=6, size=(h, w)).astype(np.uint8)
        img_sar = cv2.add(img_sar, speckle)

        cv2.rectangle(img_sar, (320, 0), (600, 600), 105, -1)
        land_noise = np.random.normal(0, 18, (h, 280)).astype(np.int16)
        img_sar[:, 320:] = np.clip(img_sar[:, 320:].astype(np.int16) + land_noise, 0, 255).astype(np.uint8)

        cv2.rectangle(img_sar, (160, 150), (320, 190), 180, -1)
        cv2.rectangle(img_sar, (120, 380), (320, 420), 180, -1)
        cv2.rectangle(img_sar, (170, 120), (280, 145), 255, -1)
        cv2.rectangle(img_sar, (130, 430), (260, 455), 255, -1)

        for cy in range(60, 540, 60):
            cv2.rectangle(img_sar, (360, cy), (430, cy + 35), 245, -1)

        cv2.imwrite(str(path_sar_harbor), img_sar)

    # -------------------------------------------------------------
    # 4. Deforestation: Pristine Rainforest (T1) vs Clearings (T2)
    # -------------------------------------------------------------
    path_forest_before = samples_dir / "sample_forest_2021_before.png"
    path_forest_after = samples_dir / "sample_forest_2024_after.png"

    if not path_forest_before.exists() or not path_forest_after.exists():
        # Dense tropical rainforest canopy
        img_fb = np.zeros((h, w, 3), dtype=np.uint8)
        img_fb[:, :] = [18, 110, 28]  # Deep canopy green
        f_noise = np.random.randint(-18, 18, (h, w, 3), dtype=np.int16)
        img_fb = np.clip(img_fb.astype(np.int16) + f_noise, 0, 255).astype(np.uint8)

        cv2.imwrite(str(path_forest_before), cv2.cvtColor(img_fb, cv2.COLOR_RGB2BGR))

        # After: Logging roads (fishbone pattern) and clearings (bare soil / dry grass)
        img_fa = img_fb.copy()
        
        # Primary logging road
        cv2.line(img_fa, (0, 300), (600, 300), (165, 130, 90), 12)

        # Secondary fishbone roads
        for rx in range(80, 560, 70):
            cv2.line(img_fa, (rx, 300), (rx + 40, 100), (150, 120, 80), 6)
            cv2.line(img_fa, (rx, 300), (rx - 40, 500), (150, 120, 80), 6)
            # Cleared plots (Yellowish brown)
            cv2.rectangle(img_fa, (rx - 25, 120), (rx + 25, 260), (195, 160, 100), -1)
            cv2.rectangle(img_fa, (rx - 30, 340), (rx + 20, 480), (185, 150, 95), -1)

        cv2.imwrite(str(path_forest_after), cv2.cvtColor(img_fa, cv2.COLOR_RGB2BGR))

    # -------------------------------------------------------------
    # 5. Disaster Assessment: Normal River Basin (T1) vs Flood (T2)
    # -------------------------------------------------------------
    path_flood_before = samples_dir / "sample_flood_normal_t1.png"
    path_flood_after = samples_dir / "sample_flood_inundated_t2.png"

    if not path_flood_before.exists() or not path_flood_after.exists():
        # Normal terrain with crop fields and narrow river
        img_fl_b = np.zeros((h, w, 3), dtype=np.uint8)
        img_fl_b[:, :] = [90, 150, 70]  # Light vegetation
        
        # Narrow meandering river
        pts_fl_river = np.array([[0, 250], [180, 270], [320, 230], [460, 280], [600, 260]], np.int32)
        for i in range(len(pts_fl_river)-1):
            cv2.line(img_fl_b, tuple(pts_fl_river[i]), tuple(pts_fl_river[i+1]), (30, 120, 230), 18)

        # Farm settlements along banks
        for sx in [120, 260, 420]:
            cv2.rectangle(img_fl_b, (sx, 160), (sx + 40, 190), (180, 175, 170), -1)
            cv2.rectangle(img_fl_b, (sx, 340), (sx + 40, 370), (180, 175, 170), -1)

        cv2.imwrite(str(path_flood_before), cv2.cvtColor(img_fl_b, cv2.COLOR_RGB2BGR))

        # After: Severe flood inundation across river basin
        img_fl_a = img_fl_b.copy()
        
        # Massive muddy flood water (dark blue/brownish blue)
        flood_color = (25, 80, 160)
        cv2.fillPoly(img_fl_a, [np.array([[0, 140], [180, 170], [350, 120], [600, 150], [600, 420], [450, 450], [200, 400], [0, 380]], np.int32)], flood_color)

        cv2.imwrite(str(path_flood_after), cv2.cvtColor(img_fl_a, cv2.COLOR_RGB2BGR))

    return {
        "urban_expansion": {
            "before": str(path_before),
            "after": str(path_after),
            "title": "Urban Expansion & Infrastructure Growth",
            "task": "CHANGE_DETECTION",
            "sample_query": "What changed between these before and after satellite images?"
        },
        "agriculture_canopy": {
            "primary": str(path_agri),
            "title": "Agricultural Farmland & Crop Parcels",
            "task": "SINGLE_IMAGE_ANALYSIS",
            "sample_query": "Calculate vegetation coverage and spectral indices for this region."
        },
        "coastal_harbor_sar": {
            "optical": str(path_opt_harbor),
            "sar": str(path_sar_harbor),
            "title": "Coastal Harbor Optical + SAR Radar",
            "task": "OPTICAL_SAR_ANALYSIS",
            "sample_query": "Analyze optical and SAR radar imagery together to identify ships and backscatter."
        },
        "deforestation": {
            "before": str(path_forest_before),
            "after": str(path_forest_after),
            "title": "Deforestation & Canopy Assessment",
            "task": "CHANGE_DETECTION",
            "sample_query": "Detect forest canopy loss and quantify deforestation area."
        },
        "disaster_flood": {
            "before": str(path_flood_before),
            "after": str(path_flood_after),
            "title": "Disaster Assessment & Flood Inundation",
            "task": "CHANGE_DETECTION",
            "sample_query": "Map the flood inundation zone and estimate submerged surface percentage."
        }
    }
