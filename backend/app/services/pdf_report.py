import os
from pathlib import Path
import datetime
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Image as RLImage, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch

from backend.app.core.config import settings

def generate_pdf_report(analysis_data: dict, primary_img_path: str, secondary_img_path: str = None) -> str:
    """
    Generates a professional remote-sensing intelligence PDF report using ReportLab.
    """
    analysis_id = analysis_data.get("id", "report")
    pdf_filename = f"SatQuery_Report_{analysis_id}.pdf"
    pdf_path = settings.REPORTS_DIR / pdf_filename

    doc = SimpleDocTemplate(
        str(pdf_path),
        pagesize=letter,
        rightMargin=40,
        leftMargin=40,
        topMargin=40,
        bottomMargin=40
    )

    styles = getSampleStyleSheet()
    
    # Custom Space/Scientific Styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=colors.HexColor('#0F172A')
    )
    
    subtitle_style = ParagraphStyle(
        'DocSubTitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=colors.HexColor('#64748B')
    )

    section_heading = ParagraphStyle(
        'SectionHeading',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=17,
        textColor=colors.HexColor('#1E293B'),
        spaceBefore=12,
        spaceAfter=6
    )

    body_style = ParagraphStyle(
        'BodyTextCustom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=14,
        textColor=colors.HexColor('#334155')
    )

    bold_body_style = ParagraphStyle(
        'BoldBodyText',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9.5,
        leading=14,
        textColor=colors.HexColor('#0F172A')
    )

    badge_style = ParagraphStyle(
        'BadgeText',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.5,
        textColor=colors.HexColor('#0284C7')
    )

    story = []

    # 1. Header Banner
    story.append(Paragraph("<b>SatQuery AI</b> | Remote Sensing Analysis Report", title_style))
    story.append(Paragraph("SIH 2026 Problem Statement SIH26167 &bull; Automated Vision-Language Intelligence", subtitle_style))
    story.append(Spacer(1, 8))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#0284C7'), spaceBefore=4, spaceAfter=12))

    # 2. Metadata Grid Table
    task_type = analysis_data.get("task_type", "GENERAL_IMAGE_ANALYSIS")
    query_text = analysis_data.get("user_query") or "Standard automated spatial extraction"
    timestamp = analysis_data.get("created_at") or datetime.datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
    confidence = analysis_data.get("confidence")
    conf_str = f"{int(confidence * 100)}%" if confidence is not None else "N/A"
    is_baseline = analysis_data.get("is_baseline", True)
    mode_str = "BASELINE / DEMO MODE" if is_baseline else "NEURAL AI INFERENCE"

    meta_data = [
        [Paragraph("<b>Analysis ID:</b>", body_style), Paragraph(str(analysis_id), body_style),
         Paragraph("<b>Date/Time:</b>", body_style), Paragraph(str(timestamp)[:19], body_style)],
        [Paragraph("<b>Detected Task:</b>", body_style), Paragraph(f"<b>{task_type}</b>", bold_body_style),
         Paragraph("<b>Pipeline Mode:</b>", body_style), Paragraph(mode_str, badge_style)],
        [Paragraph("<b>User Query:</b>", body_style), Paragraph(f"<i>\"{query_text}\"</i>", body_style),
         Paragraph("<b>Confidence:</b>", body_style), Paragraph(f"<b>{conf_str}</b> ({analysis_data.get('confidence_label', '')[:25]})", body_style)]
    ]

    t_meta = Table(meta_data, colWidths=[1.1*inch, 2.3*inch, 1.1*inch, 2.5*inch])
    t_meta.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#F8FAFC')),
        ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor('#E2E8F0')),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#F1F5F9')),
        ('PADDING', (0, 0), (-1, -1), 5),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    story.append(t_meta)
    story.append(Spacer(1, 10))

    # 3. Natural Language Synthesis & Key Findings
    story.append(Paragraph("1. Executive Summary & Natural Language Answer", section_heading))
    nl_answer = analysis_data.get("natural_language_answer", "")
    story.append(Paragraph(nl_answer, body_style))
    story.append(Spacer(1, 8))

    findings = analysis_data.get("key_findings", [])
    if findings:
        story.append(Paragraph("<b>Key Analytical Findings:</b>", bold_body_style))
        for item in findings:
            story.append(Paragraph(f"&bull; {item}", body_style))
        story.append(Spacer(1, 10))

    # 4. Input Images & Visual Evidence
    story.append(Paragraph("2. Visual Evidence & Spatial Overlays", section_heading))
    
    # Collect available image paths
    evidence_images = []
    
    # Primary Image
    if primary_img_path and os.path.exists(primary_img_path):
        evidence_images.append(("Input Satellite Raster (Primary)", primary_img_path))
    
    # Secondary Image
    if secondary_img_path and os.path.exists(secondary_img_path):
        evidence_images.append(("Secondary / SAR Raster", secondary_img_path))

    # Visual evidences from output
    for ev in analysis_data.get("visual_evidences", []):
        url = ev.get("image_url", "")
        if "/outputs/" in url:
            fname = url.split("/outputs/")[-1]
            full_p = settings.OUTPUTS_DIR / fname
            if full_p.exists():
                evidence_images.append((ev.get("title", "Evidence"), str(full_p)))

    # Render images in 2-column grid
    img_cells = []
    for title, img_p in evidence_images[:4]:  # Top 4 visual evidences
        try:
            rl_img = RLImage(img_p, width=3.2*inch, height=2.2*inch)
            cell = [Paragraph(f"<b>{title}</b>", ParagraphStyle('ImgT', parent=styles['Normal'], fontSize=8.5, leading=10, textColor=colors.HexColor('#0F172A'))),
                    Spacer(1, 3),
                    rl_img]
            img_cells.append(cell)
        except Exception:
            continue

    # Pair into rows
    img_table_data = []
    for i in range(0, len(img_cells), 2):
        row = [img_cells[i]]
        if i + 1 < len(img_cells):
            row.append(img_cells[i+1])
        else:
            row.append("")
        img_table_data.append(row)

    if img_table_data:
        t_img = Table(img_table_data, colWidths=[3.5*inch, 3.5*inch])
        t_img.setStyle(TableStyle([
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('PADDING', (0, 0), (-1, -1), 4),
        ]))
        story.append(t_img)
        story.append(Spacer(1, 10))

    # 5. Execution Summary & Telemetry
    exec_summary = analysis_data.get("execution_summary", {})
    story.append(Paragraph("3. Agentic Execution Summary & Verification", section_heading))
    
    tools_str = ", ".join(exec_summary.get("tools_invoked", []))
    exec_time = exec_summary.get("execution_time_seconds", 0.0)
    
    exec_table_data = [
        [Paragraph("<b>Tools/Models Invoked:</b>", body_style), Paragraph(tools_str or "Standard Raster Engine", body_style)],
        [Paragraph("<b>Execution Time:</b>", body_style), Paragraph(f"{exec_time} seconds", body_style)],
        [Paragraph("<b>Hardware Engine:</b>", body_style), Paragraph(exec_summary.get("hardware_accelerator", "CPU"), body_style)],
        [Paragraph("<b>Scientific Rationale:</b>", body_style), Paragraph(analysis_data.get("confidence_rationale", "Mathematical signal verification"), body_style)],
    ]
    t_exec = Table(exec_table_data, colWidths=[1.8*inch, 5.2*inch])
    t_exec.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#F8FAFC')),
        ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor('#CBD5E1')),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E2E8F0')),
        ('PADDING', (0, 0), (-1, -1), 4),
    ]))
    story.append(t_exec)

    # 6. Disclaimer Footer
    story.append(Spacer(1, 14))
    disclaimer = (
        "<i>Notice: Generated automatically by SatQuery AI. In Baseline/Demo mode, metrics are derived from verified "
        "radiometric signals, Otsu thresholding, SSIM, and spectral formulas without synthetic hallucination.</i>"
    )
    story.append(Paragraph(disclaimer, ParagraphStyle('Disc', parent=styles['Normal'], fontSize=7.5, leading=10, textColor=colors.HexColor('#94A3B8'))))

    # Build PDF
    doc.build(story)
    return str(pdf_path)
